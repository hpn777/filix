"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetData = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const filterOutDeletedAndOwned_1 = tslib_1.__importDefault(require("./utils/filterOutDeletedAndOwned"));
const logger_1 = require("../../../utils/logger");
const commonHelpers_1 = require("./utils/commonHelpers");
class GetData {
    async GetData(request, subscription) {
        const { query, tableName, permanentFilter, } = request.parameters;
        let session = subscription.get('tesseractSession');
        if (!request.parameters.rpc) {
            subscription.requestId = request.requestId;
        }
        if (!(await commonHelpers_1.CommonHelpers.validateRequestAccess(this, request, subscription))) {
            return;
        }
        if (query) {
            await this.handleMultiTableQuery(request, subscription, query);
        }
        else if (tableName) {
            await this.handleSingleTableQuery(request, subscription, tableName, permanentFilter);
        }
        else {
            commonHelpers_1.CommonHelpers.publishError(subscription, 'No query or dataset: provided.');
            return;
        }
        const finalSession = subscription.get('tesseractSession') || session;
        if (finalSession) {
            this.setupSessionEventHandlers(finalSession, subscription, request);
        }
    }
    async handleMultiTableQuery(request, subscription, query) {
        const tableNames = this.getTableNames(query);
        query.id = subscription.id;
        request.parameters.filter = request.parameters.query.permanentFilter;
        await this.loadRemoteTables(tableNames);
        const session = subscription.get('tesseractSession') || this.createSession(query);
        subscription.set('tesseractSession', session);
        const response = this.getResponseData(request, session);
        subscription.publish(response, request.requestId);
    }
    async loadRemoteTables(tableNames) {
        for (const table of tableNames) {
            try {
                const tesseract = this.evH.get(table);
                if (tesseract && tesseract.isRemote) {
                    const res = await this.DBModels.getAllAsync(table);
                    tesseract.reset(res.rows, true, true);
                    tesseract.isRemote = false;
                }
            }
            catch (error) {
                logger_1.logger.error(error.message, {
                    module: 'GenericDB::GetData',
                    table,
                });
            }
        }
    }
    async handleSingleTableQuery(request, subscription, tableName, permanentFilter) {
        const tesseract = this.evH.get(tableName);
        if (!tesseract) {
            subscription.publishError({
                message: `Dataset: "${tableName}" doesn't exist.`,
            });
            return;
        }
        const columns = tesseract.columns.filter(filterOutDeletedAndOwned_1.default);
        const session = subscription.get('tesseractSession') ||
            this.createSession({
                id: subscription.id,
                table: tableName,
                columns,
                permanentFilter,
            });
        const header = session.getHeader(true);
        subscription.set('tesseractSession', session);
        if (tesseract.isRemote) {
            await this.handleRemoteTableQuery(request, subscription, session, header);
        }
        else {
            const response = this.getResponseData(request, session);
            subscription.publish(response, request.requestId);
        }
    }
    async handleRemoteTableQuery(request, subscription, session, header) {
        if (session.permanentFilter) {
            request.parameters.filter = session.permanentFilter.concat(request.parameters.filter || []);
        }
        try {
            const result = await this.DBModels.sessionQuery(request.parameters);
            request.parameters.requestId = request.requestId;
            request.parameters.totalLength = result.totalCount;
            session.set('config', request.parameters);
            const response = this.buildRemoteQueryResponse(result.data, header, request.parameters, result.totalCount);
            subscription.publish(response, request.requestId);
        }
        catch (err) {
            subscription.publishError(err);
        }
    }
    buildRemoteQueryResponse(data, header, parameters, totalLength) {
        const response = {
            data: data.map(x => {
                const tempData = [];
                header?.forEach(column => {
                    tempData.push(x[column.name]);
                });
                return tempData;
            }),
        };
        if (parameters.page) {
            response.total = totalLength;
            response.page = parameters.page;
            response.reload = parameters.reload;
        }
        else {
            response.header = header;
            response.type = 'reset';
        }
        return response;
    }
    setupSessionEventHandlers(session, subscription, request) {
        session.off('dataUpdate', null, subscription);
        session.on('dataUpdate', (data) => {
            const sessionConfig = session.get('config');
            const updateData = this.buildDataUpdatePayload(data);
            if (sessionConfig.page !== undefined) {
                subscription.publish({
                    data: updateData,
                    total: sessionConfig.totalLength || session.dataCache.length,
                    type: 'update',
                    page: sessionConfig.page,
                    reload: false,
                });
            }
            else {
                subscription.publish({
                    data: updateData,
                    type: 'update',
                }, request.requestId);
            }
        }, subscription);
        subscription.on('remove', () => {
            session.off('dataUpdate', null, subscription);
            session.destroy();
        });
    }
    buildDataUpdatePayload(data) {
        return {
            addedIds: data.addedIds,
            addedData: data.addedData.select((x) => x.array).toArray(),
            updatedIds: data.updatedIds,
            updatedData: data.updatedData.select((x) => x.array).toArray(),
            updateReason: data.updateReason,
            removedIds: data.removedIds,
        };
    }
    getResponseData(request, session) {
        const header = session.getHeader(true);
        const responseData = session
            .getLinq(request.parameters)
            .select(x => x.array)
            .toArray();
        const response = {
            data: responseData,
        };
        request.parameters.requestId = request.requestId;
        if (request.parameters.page) {
            response.total = session.dataCache.length;
            response.page = request.parameters.page;
            response.reload = request.parameters.reload;
        }
        else {
            response.header = header;
            response.type = 'reset';
        }
        return response;
    }
    createSession(config) {
        const tesseract = this.evH.get(config.table);
        if (tesseract?.businessDelete) {
            config.permanentFilter = (config.permanentFilter || []).concat([
                {
                    field: 'is_deleted',
                    comparison: '!=',
                    value: true,
                },
            ]);
        }
        return this.evH.createSession(config, true);
    }
    getTableNames(query) {
        return lodash_1.default.uniq([
            ...(typeof query.table === 'string'
                ? [query.table]
                : this.getTableNames(query.table)),
            ...(query.columns ? query.columns : [])
                .filter(x => x.resolve && x.resolve.childrenTable)
                .map(x => x.resolve.childrenTable),
            ...Object.values(query.subSessions || {}).map(x => this.getTableNames(x)),
        ].flat());
    }
}
exports.GetData = GetData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9taXhpbnMvR2V0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsNERBQXNCO0FBQ3RCLHdHQUF1RTtBQVF2RSxrREFBOEM7QUFDOUMseURBQXFEO0FBRXJELE1BQWEsT0FBTztJQUNsQixLQUFLLENBQUMsT0FBTyxDQUVYLE9BQXFCLEVBQ3JCLFlBQTBCO1FBRTFCLE1BQU0sRUFDSixLQUFLLEVBQ0wsU0FBUyxFQUNULGVBQWUsR0FDaEIsR0FDQyxPQUFPLENBQUMsVUFBVSxDQUFBO1FBRXBCLElBQUksT0FBTyxHQUFRLFlBQVksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtRQUV2RCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1QixZQUFZLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7UUFDNUMsQ0FBQztRQUdELElBQUksQ0FBQyxDQUFDLE1BQU0sNkJBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNyRixPQUFNO1FBQ1IsQ0FBQztRQUVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FDOUIsT0FBTyxFQUNQLFlBQVksRUFDWixLQUFLLENBQ04sQ0FBQTtRQUNILENBQUM7YUFBTSxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUMvQixPQUFPLEVBQ1AsWUFBWSxFQUNaLFNBQVMsRUFDVCxlQUFlLENBQ2hCLENBQUE7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLDZCQUFhLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFBO1lBQzFFLE9BQU07UUFD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