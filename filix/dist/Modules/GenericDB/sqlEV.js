"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlEV = void 0;
const rx_1 = require("rx");
const tessio_1 = require("tessio");
const logger_1 = require("../../utils/logger");
class SqlEV extends tessio_1.Cluster {
    DBModels;
    readyPromise;
    resolveReady;
    _isReady = false;
    constructor(options = {}) {
        super(options);
        this.readyPromise = new Promise(resolve => {
            this.resolveReady = resolve;
        });
        if (options.DBModels) {
            this.DBModels = options.DBModels;
            this.DBModels.whenReady().then(() => {
                logger_1.logger.debug('db models ready, about to initialize ev', {
                    module: 'GenericDB::SqlEV',
                });
                this.initializeEV(options);
            });
        }
    }
    whenReady() {
        return this.readyPromise;
    }
    isReady() {
        return this._isReady;
    }
    markAsReady() {
        this._isReady = true;
        this.resolveReady();
    }
    async initializeEV(options) {
        const loadedData$ = new rx_1.Subject();
        const isClusterTessio = options.tessio?.redis;
        if (isClusterTessio) {
            await this.connect(options.tessio);
        }
        const tableNames = this.DBModels.getTableNames();
        logger_1.logger.debug('about to take len', tableNames.length, {
            module: 'GenericDB::SqlEV',
        });
        loadedData$.take(tableNames.length).subscribe(() => { }, null, () => {
            logger_1.logger.debug('subscribe should be ready', {
                module: 'GenericDB::SqlEV',
            });
            this.markAsReady();
        });
        logger_1.logger.debug('about to iterate', { module: 'GenericDB::SqlEV' });
        for (const tableName of tableNames) {
            const columnsForTable = this.DBModels.getColumns(tableName);
            const columns = [];
            let businessDelete = false;
            columnsForTable.forEach(column => {
                const columnDefinition = {
                    name: column.name,
                    type: this.DBModels.getAttributeType(column.type).type,
                    title: column.name,
                };
                if (column.key || column.primary) {
                    columnDefinition.primaryKey = true;
                }
                if (column.name === 'is_deleted' || column.name === 'deleted_on') {
                    columnDefinition.hidden = true;
                    businessDelete = true;
                }
                if (!columns.some(existing => existing.name === columnDefinition.name)) {
                    columns.push(columnDefinition);
                }
            });
            const tesseractTemp = await this.createTesseract(tableName, {
                clusterSync: isClusterTessio,
                disableDefinitionSync: true,
                persistent: false,
                syncSchema: false,
                columns,
            });
            tesseractTemp.isRemote = true;
            tesseractTemp.businessDelete = businessDelete;
            if (options.autofetch) {
                this.DBModels.getAll(tableName)
                    .then((result) => {
                    tesseractTemp.isRemote = false;
                    tesseractTemp.update(result.rows, true);
                    loadedData$.onNext({});
                })
                    .catch((error) => {
                    logger_1.logger.error(error, { module: 'GenericDB::SqlEV' });
                });
            }
            else {
                loadedData$.onNext({});
            }
        }
        this.DBModels.pgSubscriber?.notifications.on('changed_data_notify', async (payload) => {
            const notifications = Array.isArray(payload) ? payload : [payload];
            for (const notification of notifications) {
                try {
                    const result = await this.DBModels.execQuery(`SELECT * FROM ${notification.entityName} WHERE ${notification.recordSelector[0].field} = ${notification.recordSelector[0].value}`);
                    const cache = this.get(notification.entityName);
                    const data = result[0];
                    if (data && data.is_deleted) {
                        data.is_deleted = false;
                        cache.update([data]);
                        cache.remove([data[cache.idProperty]]);
                    }
                    else if (data) {
                        cache.update(data);
                    }
                }
                catch (error) {
                    logger_1.logger.error(`error while selecting FROM ${notification.entityName} WHERE ${notification.recordSelector[0].field} = ${notification.recordSelector[0].value}`, { module: 'GenericDB::SqlEV', objectOrArray: error });
                }
            }
        });
    }
}
exports.SqlEV = SqlEV;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsRVYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvc3FsRVYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkJBQTRCO0FBQzVCLG1DQUF3RDtBQUN4RCwrQ0FBMkM7QUFrQjNDLE1BQWEsS0FBTSxTQUFRLGdCQUFPO0lBQ2hDLFFBQVEsQ0FBVztJQUNYLFlBQVksQ0FBZTtJQUMzQixZQUFZLENBQWE7SUFDekIsUUFBUSxHQUFHLEtBQUssQ0FBQTtJQUV4QixZQUFZLFVBQXdCLEVBQUU7UUFDcEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBRWQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtZQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQTtRQUM3QixDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQTtZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xDLGVBQU0sQ0FBQyxLQUFLLENBQUMseUNBQXlDLEVBQUU7b0JBQ3RELE1BQU0sRUFBRSxrQkFBa0I7aUJBQzNCLENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzVCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFCLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFTyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxZ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