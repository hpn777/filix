"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBModels = void 0;
const tslib_1 = require("tslib");
const orm = tslib_1.__importStar(require("orm3"));
const logger_1 = require("../../utils/logger");
const dataBaseError_1 = require("./dataBaseError");
const pgListen = require('pg-listen');
class DBModels {
    readyPromise;
    resolveReady;
    _isReady = false;
    connectionConfig;
    db;
    driver;
    reconnectTimer;
    models = {};
    pgSubscriber;
    constructor(options) {
        this.readyPromise = new Promise(resolve => {
            this.resolveReady = resolve;
        });
        if (options?.config) {
            this.connectionConfig = options.config;
            this.initialize();
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
    registerOrmModel(tableName, model) {
        this.models[tableName] = model;
        Object.defineProperty(this, tableName, {
            value: model,
            writable: false,
            enumerable: true,
            configurable: true,
        });
    }
    getQualifiedTableName(tableName) {
        if (this.connectionConfig?.schema) {
            return `${this.connectionConfig.schema}.${tableName}`;
        }
        return tableName;
    }
    getTableNames() {
        return Object.keys(this.models);
    }
    getColumns(tableName) {
        const model = this.getModel(tableName);
        if (!model) {
            return [];
        }
        return Object.values(model.properties);
    }
    getPrimaryKeyColumn(tableName) {
        const model = this.getModel(tableName);
        if (model) {
            const id = model.id;
            if (typeof id === 'string') {
                return id;
            }
            if (Array.isArray(id) && id.length > 0) {
                return id[0];
            }
        }
        const column = this.getColumns(tableName).find(item => item.key || item.primary);
        if (column) {
            return column.name;
        }
        return 'id';
    }
    getReferencingColumns(targetTableName) {
        const references = [];
        const normalizedTarget = targetTableName.toLowerCase();
        this.getTableNames().forEach(tableName => {
            const model = this.getModel(tableName);
            if (!model)
                return;
            const associations = model.associations || [];
            associations.forEach((assoc) => {
                if (assoc.model && typeof assoc.model === 'string') {
                    if (assoc.model.toLowerCase() === normalizedTarget && tableName.toLowerCase() !== normalizedTarget) {
                        const prop = model.properties[assoc.name];
                        if (prop) {
                            references.push({
                                tableName,
                                column: {
                                    ...prop,
                                    referencedTableName: assoc.model,
                                    referencedColumnName: assoc.field || 'id'
                                }
                            });
                        }
                    }
                }
            });
        });
        return references;
    }
    getModel(tableName) {
        return this.models[tableName];
    }
    async initialize() {
        if (!this.connectionConfig) {
            return;
        }
        this.models = {};
        await this.connectWithRetry();
    }
    async connectWithRetry() {
        if (this.pgSubscriber) {
            try {
                await this.pgSubscriber.close();
            }
            catch (error) {
                logger_1.logger.warn('Failed to close existing PG listener', {
                    module: 'GenericDB::DBModels',
                    objectOrArray: error,
                });
            }
            finally {
                this.pgSubscriber = undefined;
            }
        }
        try {
            this.db = (await orm.connect(this.connectionConfig));
            this.db.settings.set('instance.cache', false);
            await this.db.sync();
            this.driver = this.db.driver.db;
            if (!this._isReady) {
                await this.createModels(this.connectionConfig);
            }
            if (this.connectionConfig.protocol === 'pg') {
                const pgListenConfig = {
                    user: this.connectionConfig.user,
                    password: this.connectionConfig.password,
                    host: this.connectionConfig.host,
                    port: this.connectionConfig.port,
                    database: this.connectionConfig.database,
                };
                if (typeof this.connectionConfig.notify_retry_timeout === 'number') {
                    pgListenConfig.retryTimeout = this.connectionConfig.notify_retry_timeout;
                }
                if ('ssl' in this.connectionConfig) {
                    pgListenConfig.ssl = this.connectionConfig.ssl;
                }
                if ('connectionString' in this.connectionConfig) {
                    pgListenConfig.connectionString = this.connectionConfig.connectionString;
                }
                const subscriber = pgListen(pgListenConfig);
                await subscriber.connect();
                await subscriber.listenTo('changed_data_notify');
                this.pgSubscriber = subscriber;
            }
            this.db.on('error', (error) => {
                const dbName = this.connectionConfig?.database || 'unknown';
                logger_1.logger.error(`ORM ${dbName} db error: ${JSON.stringify(error)}`, { module: 'GenericDB::DBModels' });
                if (error.code === 'PROTOCOL_CONNECTION_LOST' ||
                    error.code === 'ECONNRESET') {
                    this.scheduleReconnect();
                }
            });
        }
        catch (error) {
            const dbName = this.connectionConfig?.database || 'unknown';
            logger_1.logger.error(`Error when ORM connecting ${dbName} db: ${JSON.stringify(error)}`, { module: 'GenericDB::DBModels' });
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.reconnectTimer = setTimeout(() => {
            this.connectWithRetry();
        }, 2000);
    }
    async cleanup() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.pgSubscriber) {
            try {
                await this.pgSubscriber.close();
            }
            catch (error) {
                logger_1.logger.warn('Failed to close PG listener during cleanup', {
                    module: 'GenericDB::DBModels',
                    objectOrArray: error,
                });
            }
            finally {
                this.pgSubscriber = undefined;
            }
        }
        if (this.db) {
            await this.db.close();
        }
    }
    async createModels(connectionConfig) {
        try {
            const ormModels = await this.db.defineAllFromSchema({
                schema: connectionConfig.schema,
                includeViews: true,
                modelNamingStrategy: 'preserve',
                defineOptions: {
                    namingStrategy: 'preserve',
                    modelOptions: {
                        cache: false,
                    },
                },
            });
            const entries = Object.entries(ormModels);
            if (entries.length === 0) {
                this.markAsReady();
                return;
            }
            for (const [tableName, model] of entries) {
                this.registerOrmModel(tableName, model);
            }
            this.markAsReady();
        }
        catch (error) {
            logger_1.logger.error(`Failed to define models from schema: ${error}`, {
                module: 'GenericDB::DBModels',
            });
        }
    }
    async sessionQuery(parameters) {
        const { tableName, select: requestedSelect, sort, merge, limit, start = 0, } = parameters;
        const ormModel = this.getModel(tableName);
        if (!ormModel) {
            throw new Error(`Model not found for table: ${tableName}`);
        }
        const select = requestedSelect || this.getColumns(tableName).map(prop => prop.mapsTo || prop.name) || [];
        const filters = parameters.where ?? parameters.filter;
        const dbFilter = {};
        const dbOptions = {
            offset: start,
        };
        if (typeof limit === 'number') {
            dbOptions.limit = limit;
        }
        if (sort) {
            dbOptions.order = sort.map(item => [
                item.field,
                item.direction === 'ASC' ? 'A' : 'Z',
            ]);
        }
        if (merge) {
            dbOptions.merge = {
                from: {
                    field: merge.id,
                },
                to: {
                    field: merge.ref_id,
                },
                select: [merge.table_name],
                where: merge.where,
            };
        }
        if (filters) {
            if (Array.isArray(filters)) {
                filters.forEach(item => {
                    switch (item.comparison) {
                        case 'neq':
                            dbFilter[item.field] = { $ne: item.value };
                            break;
                        case 'like':
                            dbFilter[item.field] = { $like: `%${item.value}%` };
                            break;
                        case 'notlike':
                            dbFilter[item.field] = { $not_like: `%${item.value}%` };
                            break;
                        case 'gt':
                            dbFilter[item.field] = { $gt: item.value };
                            break;
                        case 'gte':
                            dbFilter[item.field] = { $gte: item.value };
                            break;
                        case 'lt':
                            dbFilter[item.field] = { $lt: item.value };
                            break;
                        case 'lte':
                            dbFilter[item.field] = { $lte: item.value };
                            break;
                        default:
                            dbFilter[item.field] = item.value;
                    }
                });
            }
            else {
                Object.assign(dbFilter, filters);
            }
        }
        try {
            const queryResult = await this.db.driver.find(select, `${this.connectionConfig.schema}.${tableName}`, dbFilter, dbOptions);
            const totalCount = await ormModel.count(dbFilter);
            return {
                data: Array.isArray(queryResult)
                    ? queryResult
                    : queryResult.rows ?? [],
                totalCount,
            };
        }
        catch (error) {
            const dataBaseError = new dataBaseError_1.DataBaseError(error);
            logger_1.logger.error(`DB select query ${dataBaseError} in table "${tableName}"`, {
                module: 'GenericDB::DBModels',
                objectOrArray: dataBaseError,
                stack: dataBaseError.stack,
            });
            throw dataBaseError;
        }
    }
    async execQuery(query) {
        return this.db.driver.execQuery(query);
    }
    async getAll(tableName) {
        if (!this.getModel(tableName)) {
            throw new Error(`Table: ${tableName} not found`);
        }
        return this.driver.query(`SELECT * FROM ${this.getQualifiedTableName(tableName)}`);
    }
    getAllAsync(tableName) {
        return this.getAll(tableName);
    }
    getAttributeType(dbType) {
        const numberRegex = /^(?:int|integer|tinyint|smallint|float|bigint|decimal|double|double precision|real|numeric)/;
        const dateRegex = /^(?:date)/;
        const dateTimeRegex = /^(?:date|datetime|timestamp|time)/;
        const boolRegex = /^(?:bit|boolean|binary)/;
        if (numberRegex.test(dbType)) {
            return { type: 'number' };
        }
        if (dateRegex.test(dbType)) {
            return { type: 'date', time: false };
        }
        if (dateTimeRegex.test(dbType)) {
            return { type: 'date', time: true };
        }
        if (boolRegex.test(dbType)) {
            return { type: 'boolean' };
        }
        return {
            type: 'text',
        };
    }
}
exports.DBModels = DBModels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsTW9kZWxHZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvc3FsTW9kZWxHZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUEyQjtBQWEzQiwrQ0FBMkM7QUFDM0MsbURBQStDO0FBRS9DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQThHckMsTUFBYSxRQUFRO0lBQ1gsWUFBWSxDQUFlO0lBQzNCLFlBQVksQ0FBYTtJQUN6QixRQUFRLEdBQUcsS0FBSyxDQUFBO0lBQ2hCLGdCQUFnQixDQUFtQjtJQUNuQyxFQUFFLENBQWU7SUFDakIsTUFBTSxDQUFPO0lBQ2IsY0FBYyxDQUFpQjtJQUMvQixNQUFNLEdBQW9CLEVBQUUsQ0FBQTtJQUNwQyxZQUFZLENBQThCO0lBRTFDLFlBQVksT0FBdUM7UUFFakQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtZQUM5QyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQTtRQUM3QixDQUFDLENBQUMsQ0FBQTtRQUVGLElBQUksT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBO1lBQ3RDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUNuQixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVM7UUFDUCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUE7SUFDMUIsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7SUFDdEIsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFDcEIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0lBQ3JCLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxTQUFpQixF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