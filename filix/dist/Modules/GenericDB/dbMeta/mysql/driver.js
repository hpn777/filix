"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDriver = void 0;
exports.connect = connect;
exports.connectToExistingConnection = connectToExistingConnection;
const table_1 = require("../table");
const column_1 = require("./column");
const index_1 = require("./index");
function connect(options, callback) {
    try {
        const mysql = require('mysql2');
        const client = mysql.createConnection(options);
        callback(null, new MysqlDriver(client));
    }
    catch (error) {
        callback(error);
    }
}
function connectToExistingConnection(client, callback) {
    callback(null, new MysqlDriver(client));
}
class MysqlDriver {
    constructor(client) {
        this.client = client;
    }
    getVersion(callback) {
        this.client.query('select version() as version', (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            const [row] = result;
            const version = typeof row?.version === 'string' ? row.version : undefined;
            callback(null, version);
        });
    }
    getTables(callback) {
        const handler = createResultHandler(table_1.Table, callback);
        const db = getClientDatabase(this.client);
        this.client.query('select * from information_schema.tables where table_schema = ?', [db], handler);
    }
    getColumns(tableName, callback) {
        const handler = createResultHandler(column_1.MysqlColumn, callback);
        const db = getClientDatabase(this.client);
        this.client.query('SELECT a.*, b.CONSTRAINT_NAME, b.REFERENCED_TABLE_NAME, b.REFERENCED_COLUMN_NAME, c.UPDATE_RULE, c.DELETE_RULE FROM INFORMATION_SCHEMA.COLUMNS a LEFT OUTER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE b on a.table_schema = b.table_schema AND a.table_name = b.table_name AND a.column_name = b.column_name LEFT OUTER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS c on c.CONSTRAINT_NAME = b.CONSTRAINT_NAME where a.table_schema = ? and a.table_name = ?', [db, tableName], handler);
    }
    getIndexes(tableName, callback) {
        const handler = createResultHandler(index_1.MysqlIndex, callback);
        this.client.query(`SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME =  '${tableName}'`, handler);
    }
    close(callback) {
        this.client.end(callback);
    }
}
exports.MysqlDriver = MysqlDriver;
function createResultHandler(Ctor, callback) {
    return (err, result) => {
        if (err) {
            callback(err);
            return;
        }
        const rows = Array.isArray(result) ? result : [];
        const objects = rows.map(row => new Ctor(row));
        callback(null, objects);
    };
}
function getClientDatabase(client) {
    return client.database || client.config.database || '';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9teXNxbC9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBeUJBLDBCQVFDO0FBRUQsa0VBRUM7QUFyQ0Qsb0NBQWdDO0FBRWhDLHFDQUFzQztBQUN0QyxtQ0FBb0M7QUFzQnBDLFNBQWdCLE9BQU8sQ0FBQyxPQUEyQixFQUFFLFFBQXdCO0lBQzNFLElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFnQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzlDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLFFBQVEsQ0FBQyxLQUFjLENBQUMsQ0FBQTtJQUMxQixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQWdCLDJCQUEyQixDQUFDLE1BQW1CLEVBQUUsUUFBd0I7SUFDdkYsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ3pDLENBQUM7QUFFRCxNQUFhLFdBQVc7SUFHdEIsWUFBWSxNQUFtQjtRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtJQUN0QixDQUFDO0lBRUQsVUFBVSxDQUFDLFFBQXVEO1FBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQy9ELElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNiLE9BQU07WUFDUixDQUFDO1lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTtZQUNwQixNQUFNLE9BQU8sR0FBRyxPQUFPLEdBQUcsRUFBRSxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUE7WUFDMUUsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN6QixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBdUQ7UUFDL0QsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsYUFBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ3BELE1BQU0sRUFBRSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZixnRUFBZ0UsRUFDaEUsQ0FBQyxFQUFFLENBQUMsRUFDSixPQUFPLENBQ1IsQ0FBQTtJQUNILENBQUM7SUFFRCxVQUFVLENBQUMsU0FBaUIsRUFBRSxRQUE4RDtRQUMxRixNQUFNLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyxvQkFBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzFELE1BQU0sRUFBRSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZixpY0FBaWMsRUFDamMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQ2YsT0FBTyxDQUNSLENBQUE7SUFDSCxDQUFDO0lBRUQsVUFBVSxDQUFDLFNBQWlCLEVBQUUsUUFBNkQ7UUFDekYsTUFBTSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsa0JBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZiwwRUFBMEUsU0FBUyxHQUFHLEVBQ3RGLE9BQU8sQ0FDUixDQUFBO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFzQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMzQixDQUFDO0NBQ0Y7QUFuREQsa0NBbURDO0FBRUQsU0FBUyxtQkFBbUIsQ0FDMUIsSUFBcUMsRUFDckMsUUFBbUQ7SUFFbkQsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2IsT0FBTTtRQUNSLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBRSxNQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDckUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDOUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUN6QixDQUFDLENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxNQUFtQjtJQUM1QyxPQUFPLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBO0FBQ3hELENBQUMifQ==