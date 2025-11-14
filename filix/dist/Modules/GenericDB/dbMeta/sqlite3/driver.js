"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDriver = void 0;
exports.connect = connect;
exports.connectToExistingConnection = connectToExistingConnection;
const table_1 = require("../table");
const column_1 = require("./column");
const index_1 = require("./index");
function connect(options, callback) {
    try {
        const sqlite = require('sqlite3');
        const client = new sqlite.Database(options);
        callback(null, new SqliteDriver(client));
    }
    catch (error) {
        callback(error);
    }
}
function connectToExistingConnection(client, callback) {
    callback(null, new SqliteDriver(client));
}
class SqliteDriver {
    constructor(client) {
        this.client = client;
    }
    getVersion(callback) {
        this.client.all('select sqlite_version() as version', (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            const [row] = result;
            callback(null, row?.version);
        });
    }
    getTables(callback) {
        const handler = createResultHandler(table_1.Table, callback);
        this.client.all("SELECT tbl_name as table_name, * from sqlite_master where type = 'table';", handler);
    }
    getColumns(tableName, callback) {
        const handler = createResultHandler(column_1.SqliteColumn, (err, columns) => {
            if (err || !columns) {
                callback(err ?? new Error('Failed to load SQLite columns'));
                return;
            }
            this.client.all(`SELECT sql from sqlite_master where name = '${tableName}';`, (sqlError, schemaRows) => {
                if (sqlError) {
                    callback(sqlError);
                    return;
                }
                this.enrichColumnMetadata(columns, schemaRows);
                callback(null, columns);
            });
        });
        this.client.all(`PRAGMA table_info(${tableName})`, handler);
    }
    getIndexes(tableName, callback) {
        this.client.all(`pragma index_list(${tableName})`, (err, indexList) => {
            if (err) {
                callback(err);
                return;
            }
            if (!indexList.length) {
                callback(null, []);
                return;
            }
            const promises = indexList.map(indexMeta => this.loadIndexDetails(tableName, indexMeta.name));
            Promise.all(promises)
                .then(result => callback(null, result.flat()))
                .catch(error => callback(error));
        });
    }
    close(callback) {
        this.client.close(callback);
    }
    enrichColumnMetadata(columns, schemaRows) {
        const sqlDefinition = schemaRows[0]?.sql;
        if (typeof sqlDefinition !== 'string') {
            return;
        }
        const start = sqlDefinition.indexOf('(');
        const end = sqlDefinition.lastIndexOf(')');
        if (start < 0 || end < 0) {
            return;
        }
        const segment = sqlDefinition.substring(start + 1, end);
        const columnDefinitions = segment.split(',');
        columnDefinitions.forEach((definition, index) => {
            const column = columns[index];
            if (!column) {
                return;
            }
            const normalized = definition.trim().toUpperCase();
            if (normalized.includes('UNIQUE')) {
                column.markUnique();
            }
            if (normalized.includes('AUTOINCREMENT')) {
                column.markAutoIncrement();
            }
        });
    }
    loadIndexDetails(tableName, indexName) {
        return new Promise((resolve, reject) => {
            this.client.all(`pragma index_info(${indexName})`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const indexes = rows.map(row => new index_1.SqliteIndex({ ...row, index_name: indexName, table_name: tableName }));
                resolve(indexes);
            });
        });
    }
}
exports.SqliteDriver = SqliteDriver;
function createResultHandler(Ctor, callback) {
    return (err, rows) => {
        if (err) {
            callback(err);
            return;
        }
        const result = rows.map(row => new Ctor(row));
        callback(null, result);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9zcWxpdGUzL2RyaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFtQkEsMEJBUUM7QUFFRCxrRUFFQztBQS9CRCxvQ0FBZ0M7QUFFaEMscUNBQXVDO0FBQ3ZDLG1DQUFxQztBQWdCckMsU0FBZ0IsT0FBTyxDQUFDLE9BQWdCLEVBQUUsUUFBd0I7SUFDaEUsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQWlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDM0MsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsUUFBUSxDQUFDLEtBQWMsQ0FBQyxDQUFBO0lBQzFCLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBZ0IsMkJBQTJCLENBQUMsTUFBc0IsRUFBRSxRQUF3QjtJQUMxRixRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDMUMsQ0FBQztBQUVELE1BQWEsWUFBWTtJQUd2QixZQUFZLE1BQXNCO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxVQUFVLENBQUMsUUFBdUQ7UUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDcEUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDUixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2IsT0FBTTtZQUNSLENBQUM7WUFFRCxNQUFN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