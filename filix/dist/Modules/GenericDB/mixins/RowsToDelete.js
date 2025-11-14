"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowsToDelete = void 0;
const utils_1 = require("../../../utils");
const dataBaseError_1 = require("../dataBaseError");
class RowsToDelete {
    dataBase;
    dataCache;
    idProperty = '';
    constructor(dataBase, dataCache) {
        this.dataBase = dataBase;
        this.dataCache = dataCache;
        this.idProperty = this.dataCache.idProperty;
    }
    async getFromDataBase(tableName, columName, rowIds) {
        if (!tableName || !columName) {
            utils_1.logger.error('TableName and columName are required', {
                module: 'RowsToDelete',
            });
            return null;
        }
        try {
            const dataBaseQueryResult = await this.dataBase.runDBQuery({
                tableName,
                filter: [
                    {
                        field: columName,
                        value: rowIds,
                        comparison: 'in',
                    },
                ],
            });
            return dataBaseQueryResult?.map((item) => this.getIdPropertyValue(item));
        }
        catch (error) {
            if (error instanceof dataBaseError_1.DataBaseError) {
                utils_1.logger.error(error.message, { module: 'RowsToDelete' });
            }
            else {
                utils_1.logger.error('Unexpected error', {
                    module: 'RowsToDelete',
                    objectOrArray: error,
                });
            }
        }
        return null;
    }
    getFromDataCache(columName, rowIds) {
        try {
            return this.dataCache
                .getLinq()
                .where((item) => rowIds.includes(item[columName]))
                .select(this.getIdPropertyValue.bind(this))
                .toArray();
        }
        catch (error) {
            utils_1.logger.error(`Error retrieving data from cache: ${error}`, {
                module: 'RowsToDelete',
                objectOrArray: error,
                stack: error.stack,
            });
        }
        return null;
    }
    getIdPropertyValue(item) {
        return item[this.idProperty];
    }
}
exports.RowsToDelete = RowsToDelete;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm93c1RvRGVsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL21peGlucy9Sb3dzVG9EZWxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMENBQXVDO0FBQ3ZDLG9EQUFnRDtBQU9oRCxNQUFhLFlBQVk7SUFHSDtJQUE2QjtJQUZoQyxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBRWhDLFlBQW9CLFFBQW1CLEVBQVUsU0FBYztRQUEzQyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUM3RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFBO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUNuQixTQUFpQixFQUNqQixTQUFpQixFQUNqQixNQUFpRDtRQUVqRCxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsY0FBTSxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsRUFBRTtnQkFDbkQsTUFBTSxFQUFFLGNBQWM7YUFDdkIsQ0FBQyxDQUFBO1lBRUYsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0gsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUN6RCxTQUFTO2dCQUNULE1BQU0sRUFBRTtvQkFDTjt3QkFDRSxLQUFLLEVBQUUsU0FBUzt3QkFDaEIsS0FBSyxFQUFFLE1BQU07d0JBQ2IsVUFBVSxFQUFFLElBQUk7cUJBQ2pCO2lCQUNGO2FBQ0YsQ0FBQyxDQUFBO1lBRUYsT0FBTyxtQkFBbUIsRUFBRSxHQUFHLENBQzdCLENBQUMsSUFBK0IsRUFBa0IsRUFBRSxDQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQWlCLElBQUksQ0FBQyxDQUNoRCxDQUFBO1FBQ0gsQ0FBQztRQUFDLE9BQU8sS0FBYyxFQUFFLENBQUM7WUFDeEIsSUFBSSxLQUFLLFlBQVksNkJBQWEsRUFBRSxDQUFDO2dCQUNuQyxjQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQTtZQUN6RCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sY0FBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRTtvQkFDL0IsTUFBTSxFQUFFLGNBQWM7b0JBQ3RCLGFBQWEsRUFBRSxLQUFLO2lCQUNyQixDQUFDLENBQUE7WUFDSixDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELGdCQUFnQixDQUNkLFNBQWlCLEVBQ2pCLE1BQThDO1FBRTlDLElBQUksQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLFNBQVM7aUJBQ2xCLE9BQU8sRUFBRTtpQkFDVCxLQUFLLENBQUMsQ0FBQyxJQUErQixFQUFXLEVBQUUsQ0FDakQsTUFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQzVDO2lCQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQyxPQUFPLEVBQUUsQ0FBQTtRQUNkLENBQUM7UUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1lBQ3BCLGNBQU0sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEtBQUssRUFBRSxFQUFFO2dCQUN6RCxNQUFNLEVBQUUsY0FBYztnQkFDdEIsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSzthQUNuQixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU8sa0JBQWtCLENBQ3hCLElBQStCO1FBRS9CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM5QixDQUFDO0NBQ0Y7QUE5RUQsb0NBOEVDIn0=