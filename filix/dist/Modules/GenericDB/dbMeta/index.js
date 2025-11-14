"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDbMeta = createDbMeta;
exports.createDbMetaAsync = createDbMetaAsync;
const driver_1 = require("./mysql/driver");
const driver_2 = require("./pg/driver");
const driver_3 = require("./sqlite3/driver");
const schemaLessAdapter = (driver) => ({
    getVersion: callback => driver.getVersion(callback),
    getTables: (_schema, callback) => driver.getTables(callback),
    getColumns: (_schema, tableName, callback) => driver.getColumns(tableName, callback),
    getIndexes: (_schema, tableName, callback) => {
        if (driver.getIndexes) {
            driver.getIndexes(tableName, callback);
            return;
        }
        callback(null, []);
    },
    close: callback => driver.close(callback),
});
const schemaAwareAdapter = (driver) => ({
    getVersion: callback => driver.getVersion(callback),
    getTables: (schema, callback) => driver.getTables(schema, callback),
    getColumns: (schema, tableName, callback) => driver.getColumns(schema, tableName, callback),
    getIndexes: (schema, tableName, callback) => {
        if (driver.getIndexes) {
            driver.getIndexes(schema, tableName, callback);
            return;
        }
        callback(null, []);
    },
    close: callback => driver.close(callback),
});
const connectors = {
    mysql: (config, onConnected) => {
        const finish = (err, driver) => {
            if (err || !driver) {
                onConnected(err ?? new Error('Failed to initialize MySQL driver'));
                return;
            }
            onConnected(null, schemaLessAdapter(driver));
        };
        if (hasExistingConnection(config)) {
            (0, driver_1.connectToExistingConnection)(config.connection, finish);
        }
        else {
            const { user, password, host, port, database, schema } = config;
            (0, driver_1.connect)({ user, password, host, port, database, schema }, finish);
        }
    },
    pg: (config, onConnected) => {
        const finish = (err, driver) => {
            if (err || !driver) {
                onConnected(err ?? new Error('Failed to initialize PostgreSQL driver'));
                return;
            }
            onConnected(null, schemaAwareAdapter(driver));
        };
        if (hasExistingConnection(config)) {
            (0, driver_2.connectToExistingConnection)(config.connection, finish);
        }
        else {
            const { user, password, host, port, database } = config;
            (0, driver_2.connect)({ user, password, host, port, database }, finish);
        }
    },
    sqlite3: (config, onConnected) => {
        const finish = (err, driver) => {
            if (err || !driver) {
                onConnected(err ?? new Error('Failed to initialize SQLite driver'));
                return;
            }
            onConnected(null, schemaLessAdapter(driver));
        };
        if (hasExistingConnection(config)) {
            (0, driver_3.connectToExistingConnection)(config.connection, finish);
        }
        else {
            (0, driver_3.connect)(config.database ?? config, finish);
        }
    },
};
function createDbMeta(config, callback) {
    const connector = connectors[config.protocol];
    if (!connector) {
        callback(new Error(`Unsupported driver: ${config.protocol}`));
        return;
    }
    connector(config, callback);
}
function createDbMetaAsync(config) {
    return new Promise((resolve, reject) => {
        createDbMeta(config, (err, instance) => {
            if (err || !instance) {
                reject(err ?? new Error('Failed to create dbMeta instance'));
                return;
            }
            resolve(instance);
        });
    });
}
function hasExistingConnection(config) {
    return Object.prototype.hasOwnProperty.call(config, 'connection') && Boolean(config.connection);
}
exports.default = createDbMeta;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvZGJNZXRhL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUpBLG9DQVNDO0FBRUQsOENBV0M7QUFqS0QsMkNBQTZHO0FBRTdHLHdDQUFvRztBQUVwRyw2Q0FBaUg7QUFvRGpILE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxNQUF3QixFQUFrQixFQUFFLENBQUMsQ0FBQztJQUN2RSxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztJQUNuRCxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUM1RCxVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDO0lBQ3BGLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDM0MsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDdEMsT0FBTTtRQUNSLENBQUM7UUFFRCxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3BCLENBQUM7SUFDRCxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztDQUMxQyxDQUFDLENBQUE7QUFFRixNQUFNLGtCQUFrQixHQUFHLENBQUMsTUFBeUIsRUFBa0IsRUFBRSxDQUFDLENBQUM7SUFDekUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVB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