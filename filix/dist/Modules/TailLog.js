"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const tslib_1 = require("tslib");
const os = tslib_1.__importStar(require("os"));
const linq_1 = tslib_1.__importDefault(require("linq"));
const tessio_1 = require("tessio");
const base_1 = require("./base");
const Connectors_1 = require("../Connectors");
const logger_1 = require("../utils/logger");
class Module extends base_1.BaseModule {
    tesseract;
    moduleName = 'TailLog';
    publicMethods = new Map([
        ['GetColumnsDefinition', this.GetColumnsDefinition],
        ['GetData', this.GetData],
    ]);
    async init() {
        logger_1.logger.info('Module initialized', {
            module: this.moduleName,
        });
        const config = this.config;
        config.separator = os.EOL;
        const header = this.createColumnHeaders(config);
        this.tesseract = new tessio_1.Tesseract({
            idProperty: 'id',
            columns: header,
        });
        this.setupLogTail(config);
        return Promise.resolve(this);
    }
    createColumnHeaders(config) {
        return [
            {
                name: 'id',
                title: 'Id',
                columnType: 'string',
                primaryKey: true,
            },
            {
                name: 'timestamp',
                title: 'Timestamp',
                columnType: 'number',
            },
            {
                name: 'host',
                title: 'Host',
                columnType: 'string',
            },
            {
                name: 'appName',
                title: 'App Name',
                columnType: 'string',
            },
            {
                name: 'slice',
                title: 'Slice',
                columnType: 'number',
            },
            {
                name: 'pId',
                title: 'pId',
                columnType: 'number',
            },
            {
                name: 'type',
                title: 'Type',
                columnType: 'string',
                enum: config.messageTypes || ['I', 'W', 'E'],
            },
            {
                name: 'msg',
                title: 'Message',
                columnType: 'text',
            },
            {
                name: 'count',
                title: 'Count',
                columnType: 'number',
            },
        ];
    }
    setupLogTail(config) {
        if (!config.path) {
            return;
        }
        const tail$ = (0, Connectors_1.tailLogConnector)(config);
        if (config.messageTypes) {
            tail$.subscribe((data) => {
                if (data.type && config.messageTypes.indexOf(data.type) !== -1) {
                    this.tesseract.add([data]);
                }
            });
        }
        else {
            tail$.subscribe((data) => {
                this.tesseract.add([data]);
            });
        }
    }
    GetColumnsDefinition(request, subscription) {
        subscription.publish({
            header: this.tesseract.getHeader(),
            type: 'reset',
        }, request.requestId);
    }
    GetData(request, subscription) {
        const header = this.tesseract.getHeader();
        let session = this.getOrCreateSession(request, subscription);
        if (!session) {
            return;
        }
        const responseData = this.prepareResponseData(request, session, header);
        subscription.publish(responseData, request.requestId);
    }
    getOrCreateSession(request, subscription) {
        let session = subscription.get('tesseractSession');
        if (!request.parameters.rpc) {
            subscription.set('requestId', request.requestId);
        }
        if (!session) {
            session = this.tesseract.createSession({ immediateUpdate: false });
            this.attachSessionListeners(session, request, subscription);
            subscription.set('tesseractSession', session);
        }
        return session;
    }
    attachSessionListeners(session, request, subscription) {
        session.on('dataUpdate', (data) => {
            this.handleDataUpdate(data, session, request, subscription);
        }, subscription);
        session.on('dataRemoved', (data) => {
            this.handleDataRemoved(data, session, request, subscription);
        }, subscription);
        subscription.once('remove', () => {
            this.cleanupSession(session, subscription);
        });
    }
    handleDataUpdate(data, session, request, subscription) {
        const sessionConfig = session.get('config');
        const isPaged = sessionConfig.page !== undefined;
        if (isPaged) {
            this.publishPagedUpdate(data, session, subscription, 'update');
            if (data.removedData?.length) {
                this.publishPagedUpdate(data, session, subscription, 'remove', true);
            }
        }
        else {
            subscription.publish({ data: data.updatedData, type: 'update' }, request.requestId);
            if (data.removedData?.length) {
                subscription.publish({ data: data.removedData, type: 'remove' }, request.requestId);
            }
        }
    }
    handleDataRemoved(data, session, request, subscription) {
        const sessionConfig = session.get('config');
        const isPaged = sessionConfig.page !== undefined;
        if (isPaged) {
            subscription.publish({
                data,
                total: sessionConfig.totalLength || session.dataCache.length,
                type: 'remove',
                page: sessionConfig.page,
                reload: false,
            }, subscription.get('requestId'));
        }
        else {
            subscription.publish({ data, type: 'remove' }, request.requestId);
        }
    }
    publishPagedUpdate(data, session, subscription, type, useRemovedData = false) {
        const sessionConfig = session.get('config');
        const dataToPublish = useRemovedData ? data.removedData : data.updatedData;
        subscription.publish({
            data: dataToPublish,
            total: sessionConfig.totalLength || session.dataCache.length,
            type,
            page: sessionConfig.page,
            reload: false,
        }, subscription.get('requestId'));
    }
    cleanupSession(session, subscription) {
        session.off('dataUpdate', null, subscription);
        session.off('dataRemoved', null, subscription);
        session.remove();
    }
    prepareResponseData(request, session, header) {
        request.parameters.requestId = request.requestId;
        const responseData = session.getData(request.parameters);
        const transformedData = linq_1.default.from(responseData)
            .select((item) => {
            const row = [];
            for (let i = 0; i < header.length; i++) {
                row.push(item[header[i].name]);
            }
            return row;
        })
            .toArray();
        const response = { data: transformedData };
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
}
exports.Module = Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFpbExvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2R1bGVzL1RhaWxMb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLCtDQUF3QjtBQUN4Qix3REFBNkI7QUFDN0IsbUNBQWtDO0FBR2xDLGlDQUFtRDtBQUNuRCw4Q0FBZ0Q7QUFDaEQsNENBQXdDO0FBa0J4QyxNQUFhLE1BQU8sU0FBUSxpQkFBVTtJQUNwQyxTQUFTLENBQVk7SUFDckIsVUFBVSxHQUFXLFNBQVMsQ0FBQTtJQUU5QixhQUFhLEdBQWdDLElBQUksR0FBRyxDQUFDO1FBQ25ELENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQ25ELENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDMUIsQ0FBQyxDQUFBO0lBRUssS0FBSyxDQUFDLElBQUk7UUFDZixlQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQ2hDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVTtTQUN4QixDQUFDLENBQUE7UUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzFCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQTtRQUV6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUM7WUFDN0IsVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLE1BQU07U0FDVCxDQUFDLENBQUE7UUFFVCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRXpCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBRU8sbUJBQW1CLENBQUMsTUFBVztRQUNyQyxPQUFPO1lBQ0w7Z0JBQ0UsSUFBSSxFQUFFLElB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