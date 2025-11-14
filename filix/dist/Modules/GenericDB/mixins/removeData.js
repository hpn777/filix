"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveData = void 0;
const tessio_1 = require("tessio");
const utils_1 = require("../../../utils");
const user_1 = require("../../utils/user");
const RowsToDelete_1 = require("./RowsToDelete");
const commonHelpers_1 = require("./utils/commonHelpers");
class RemoveData {
    async cascadeRemove(tableName, rowIds) {
        const normalizedRowIds = Array.isArray(rowIds) ? rowIds : [rowIds];
        const toRemove = (await this.whatToDel(tableName, normalizedRowIds)) || [];
        const result = {
            success: true,
            partialResults: [],
        };
        for (const dbTable of toRemove) {
            const res = await this.remove(dbTable.tableName, dbTable.rowIds);
            if (res?.err) {
                result.success = false;
            }
            result.partialResults.push(res);
        }
        return {
            err: result.success ? null : result.partialResults,
            result: result
        };
    }
    async RemoveData(request, subscription) {
        const { tableName, data: rowIds } = request.parameters;
        if (!commonHelpers_1.CommonHelpers.validateTableName(tableName, subscription)) {
            return;
        }
        if (!(await commonHelpers_1.CommonHelpers.validateRequestAccess(this, request, subscription))) {
            return;
        }
        const tesseract = commonHelpers_1.CommonHelpers.getTesseract(this.evH, tableName, subscription);
        if (!tesseract) {
            return;
        }
        if (!this.checkRemovePermissions(tesseract, request.userId, subscription)) {
            return;
        }
        const isView = false;
        const result = await this.cascadeRemove(tableName, rowIds);
        this.publishRemovalResult(result, subscription, request.requestId);
    }
    checkRemovePermissions(tesseract, userId, subscription) {
        if (!(0, user_1.isSuperAdmin)(this.subscriptionManager, userId)) {
        }
        return true;
    }
    async handleViewRemoval(tableName, rowIds, request, subscription) {
        const result = {
            success: true,
            partialResults: [],
        };
        for (const id of rowIds) {
            await this.executeViewDelete(tableName, id, result);
        }
        return { err: result.success ? null : result.partialResults, result };
    }
    async executeViewDelete(tableName, id, result) {
        try {
            const data = await this.DBModels.execQuery(`CALL crud_delete_record('${tableName}', ${id}, '{}'::json);`);
            if (data[0]._result.status === 'ERROR') {
                result.success = false;
                result.partialResults.push({
                    ...data[0]._result,
                    tableName,
                    id,
                });
            }
        }
        catch (error) {
            result.success = false;
            result.partialResults.push({
                error: error?.message || String(error),
                tableName,
                id,
            });
        }
    }
    publishRemovalResult(result, subscription, requestId) {
        if (result.err) {
            commonHelpers_1.CommonHelpers.publishError(subscription, 'Removal failed', JSON.stringify(result.err));
            utils_1.logger.error(`${result.err}`, {
                module: 'GenericDB::RemoveData',
            });
        }
        else {
            commonHelpers_1.CommonHelpers.publishSuccess(subscription, requestId);
        }
    }
    async RemoveProxy(request, subscribtion) {
        const { tableName, rowIds } = request.parameters;
        const toRemove = await this.whatToDel(tableName, rowIds);
        subscribtion.publish(toRemove, request.requestId);
    }
    async remove(tableName, rowIds) {
        const tesseract = this.evH.get(tableName);
        if (!tesseract) {
            utils_1.logger.error(`Table "${tableName}" not found in tesseracts`, {
                module: 'GenericDB::RemoveData',
            });
            return;
        }
        const ormModel = this.DBModels[tableName];
        if (!ormModel) {
            utils_1.logger.error(`${tableName} is not a valid table name.`, {
                module: 'GenericDB::RemoveData',
            });
            return;
        }
        const rowIdsArray = Array.isArray(rowIds) ? rowIds : [rowIds];
        let lastError = null;
        const preRemoveItems = [];
        const result = await Promise.all(rowIdsArray.map(rowId => this.removeRecord(rowId, ormModel, tesseract, preRemoveItems)
            .catch(error => {
            lastError = error;
            return [];
        })));
        this.updateTesseractAfterRemoval(tesseract, preRemoveItems, result);
        return {
            err: lastError,
            result,
        };
    }
    async removeRecord(rowId, ormModel, tesseract, preRemoveItems) {
        try {
            const record = await ormModel.get(rowId);
            if (!record) {
                throw new Error(`Record with ID ${rowId} not found`);
            }
            preRemoveItems.push(tessio_1.lodash.clone(record));
            if (tesseract.businessDelete) {
                return await this.softDeleteRecord(record);
            }
            else {
                return await this.hardDeleteRecord(record, rowId);
            }
        }
        catch (error) {
            utils_1.logger.error(`${error}`, { module: 'GenericDB::RemoveData' });
            throw error;
        }
    }
    async softDeleteRecord(record) {
        try {
            record.set('is_deleted', true);
            record.set('deleted_on', new Date());
            await record.save();
            return record;
        }
        catch (error) {
            utils_1.logger.error(`${error}`, { module: 'GenericDB::RemoveData' });
            throw error;
        }
    }
    async hardDeleteRecord(record, rowId) {
        try {
            await record.remove();
            return rowId;
        }
        catch (error) {
            utils_1.logger.error(`${error}`, { module: 'GenericDB::RemoveData' });
            throw error;
        }
    }
    updateTesseractAfterRemoval(tesseract, preRemoveItems, result) {
        tesseract.update(preRemoveItems);
        if (tesseract.businessDelete) {
            tesseract.remove(result.map(i => i[tesseract.idProperty]));
        }
        else {
            tesseract.remove(result);
        }
    }
    async whatToDel(tableName, rowIds) {
        let toDel = [];
        const referencingColumns = await this.DBModels.getReferencingColumns(tableName);
        for (const { tableName: referencingTable, column } of referencingColumns) {
            const dataCache = this.evH.get(referencingTable);
            if (!dataCache) {
                continue;
            }
            let rowsToDel = [];
            const rowsToDelete = new RowsToDelete_1.RowsToDelete(this, dataCache);
            if (dataCache.isRemote) {
                rowsToDel = await rowsToDelete.getFromDataBase(referencingTable, column.name, rowIds);
            }
            else {
                rowsToDel = rowsToDelete.getFromDataCache(column.name, rowIds);
            }
            if (rowsToDel?.length) {
                toDel = toDel.concat(await this.whatToDel(referencingTable, rowsToDel));
            }
        }
        toDel.push({
            tableName,
            rowIds,
        });
        return toDel;
    }
}
exports.RemoveData = RemoveData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9taXhpbnMvcmVtb3ZlRGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBb0M7QUFFcEMsMENBQXVDO0FBQ3ZDLDJDQUErQztBQUUvQyxpREFBNkM7QUFDN0MseURBQXFEO0FBRXJELE1BQWEsVUFBVTtJQUtyQixLQUFLLENBQUMsYUFBYSxDQUVqQixTQUFpQixFQUNqQixNQUE2QztRQUc3QyxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQXdCLENBQUE7UUFDekYsTUFBTSxRQUFRLEdBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDakYsTUFBTSxNQUFNLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSTtZQUNiLGNBQWMsRUFBRSxFQUFXO1NBQzVCLENBQUE7UUFFRCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUVoRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDYixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtZQUN4QixDQUFDO1lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakMsQ0FBQztRQUVELE9BQU87WUFDTCxHQUFHLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYztZQUNsRCxNQUFNLEVBQUUsTUFBTTtTQUNmLENBQUE7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FFZCxPQUFZLEVBQ1osWUFBMEI7UUFFMUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQy9CLE9BQU8sQ0FBQyxVQUFVLENBQUE7UUFHcEIsSUFBSSxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDOUQsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLDZCQUFhLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDOUUsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyw2QkFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUMvRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixPQUFNO1FBQ1IsQ0FBQztRQUdELElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUMxRSxPQUFNO1FBQ1IsQ0FBQztRQUdELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQTtRQUVwQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRzFELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0lBT0Qsc0JBQXNCLENBRXBCLFNBQWMsRUFDZCxNQUFjLEVBQ2QsWUFBMEI7UUFHMUIsSUFBSSxDQUFDLElBQUEsbUJBQVksRUFBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUV0RCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBS0QsS0FBSyxDQUFDLGlCQUFpQixDQUVyQixTQUFpQixFQUNqQixNQUEyQixFQUMzQixPQUFZLEVBQ1osWUFBMEI7UUFFMUIsTUFBTSxNQUFNLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSTtZQUNiLGNBQWMsRUFBRSxFQUFXO1NBQzVCLENBQUE7UUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDckQsQ0FBQztRQUVELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxDQUFBO0lBQ3ZFLENBQUM7SUFLRCxLQUFLLENBQUMsaUJBQWlCLENBRXJCLFNBQWlCLEVBQ2pCLEVBQW1CLEVBQ25CLE1BQW1EO1FBRW5ELElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQ3hDLDRCQUE0QixTQUFTLE1BQU0sRUFBRSxnQkFBZ0IsQ0FDOUQsQ0FBQTtZQUVELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO2dCQUN0QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztvQkFDekIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztvQkFDbEIsU0FBUztvQkFDVCxFQUFFO2lCQUNILENBQUMsQ0FBQTtZQUNKLENBQUM7UUFDSCxDQUFDO1FBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztZQUNwQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtZQUN0QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztnQkFDekIsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDdEMsU0FBUztnQkFDVCxFQUFFO2FBQ0gsQ0FBQyxDQUFBO1FBQ0osQ0FBQztJQUNILENBQUM7SUFLRCxvQkFBb0IsQ0FFbEIsTUFBa0MsRUFDbEMsWUFBMEIsRUFDMUIsU0FBaUI7UUFFakIsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDZiw2QkFBYSxDQUFDLFlBQVksQ0FDeEIsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDM0IsQ0FBQTtZQUNELGNBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQzVCLE1BQU0sRUFBRSx1QkFBdUI7YUFDaEMsQ0FBQyxDQUFBO1FBQ0osQ0FBQzthQUFNLENBQUM7WUFDTiw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDdkQsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUVmLE9BQVksRUFDWixZQUEwQjtRQUUxQixNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUN6QixPQUFPLENBQUMsVUFBVSxDQUFBO1FBQ3BCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFeEQsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUVWLFNBQWlCLEVBQ2pCLE1BQTJCO1FBRTNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRXpDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNmLGNBQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxTQUFTLDJCQUEyQixFQUFFO2dCQUMzRCxNQUFNLEVBQUUsdUJBQXVCO2FBQ2hDLENBQUMsQ0FBQTtZQUNGLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUV6QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxjQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyw2QkFBNkIsRUFBRTtnQkFDdEQsTUFBTSxFQUFFLHVCQUF1QjthQUNoQyxDQUFDLENBQUE7WUFDRixPQUFNO1FBQ1IsQ0FBQztRQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3RCxJQUFJLFNBQVMsR0FBa0IsSUFBSSxDQUFBO1FBRW5DLE1BQU0sY0FBYyxHQUFVLEVBQUUsQ0FBQTtRQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQzlCLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FDdEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUM7YUFDMUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2IsU0FBUyxHQUFHLEtBQUssQ0FBQTtZQUNqQixPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUMsQ0FBQyxDQUNMLENBQ0YsQ0FBQTtRQUdELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRW5FLE9BQU87WUFDTCxHQUFHLEVBQUUsU0FBUztZQUNkLE1BQU07U0FDUCxDQUFBO0lBQ0gsQ0FBQztJQUtELEtBQUssQ0FBQyxZQUFZLENBRWhCLEtBQXNCLEVBQ3RCLFFBQWEsRUFDYixTQUFjLEVBQ2QsY0FBcUI7UUFFckIsSUFBSSxDQUFDO1lBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBRXhDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixLQUFLLFlBQVksQ0FBQyxDQUFBO1lBQ3RELENBQUM7WUFFRCxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUVwQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM1QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDbkQsQ0FBQztRQUNILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsY0FBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQTtZQUM3RCxNQUFNLEtBQUssQ0FBQTtRQUNiLENBQUM7SUFDSCxDQUFDO0lBS0QsS0FBSyxDQUFDLGdCQUFnQixDQUVwQixNQUFXO1FBRVgsSUFBSSxDQUFDO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBRXBDLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQ25CLE9BQU8sTUFBTSxDQUFBO1FBQ2YsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixjQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO1lBQzdELE1BQU0sS0FBSyxDQUFBO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFLRCxLQUFLLENBQUMsZ0JBQWdCLENBRXBCLE1BQVcsRUFDWCxLQUFzQjtRQUV0QixJQUFJLENBQUM7WUFFSCxNQUFNLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUNyQixPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsY0FBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQTtZQUM3RCxNQUFNLEtBQUssQ0FBQTtRQUNiLENBQUM7SUFDSCxDQUFDO0lBS0QsMkJBQTJCLENBRXpCLFNBQWMsRUFDZCxjQUFxQixFQUNyQixNQUFhO1FBRWIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUVoQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM3QixTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM1RCxDQUFDO2FBQU0sQ0FBQztZQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUViLFNBQWlCLEVBQ2pCLE1BQWlEO1FBRWpELElBQUksS0FBSyxHQUFlLEVBQUUsQ0FBQTtRQUUxQixNQUFNLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUUvRSxLQUFLLE1BQU0sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksa0JBQWtCLEVBQUUsQ0FBQztZQUN6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBRWhELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDZixTQUFRO1lBQ1YsQ0FBQztZQUVELElBQUksU0FBUyxHQUErQixFQUFFLENBQUE7WUFDOUMsTUFBTSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtZQUV0RCxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdkIsU0FBUyxHQUFHLE1BQU0sWUFBWSxDQUFDLGVBQWUsQ0FDNUMsZ0JBQWdCLEVBQ2hCLE1BQU0sQ0FBQyxJQUFJLEVBQ1gsTUFBTSxDQUNQLENBQUE7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sU0FBUyxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBa0IsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUNqRixDQUFDO1lBRUQsSUFBSSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ3RCLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFnQyxDQUFDLENBQUMsQ0FBQTtZQUNoRyxDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDVCxTQUFTO1lBQ1QsTUFBTTtTQUNQLENBQUMsQ0FBQTtRQUVGLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztDQUNGO0FBL1ZELGdDQStWQyJ9