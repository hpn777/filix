"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgDriver = void 0;
exports.connect = connect;
exports.connectToExistingConnection = connectToExistingConnection;
const pg_1 = require("pg");
const table_1 = require("../table");
const column_1 = require("./column");
const index_1 = require("./index");
function connect(options, callback) {
    const client = new pg_1.Client(options);
    client
        .connect()
        .then(() => callback(null, new PgDriver(client)))
        .catch(error => callback(error));
}
function connectToExistingConnection(client, callback) {
    callback(null, new PgDriver(client));
}
class PgDriver {
    constructor(client) {
        this.client = client;
    }
    getVersion(callback) {
        this.client
            .query('select version()')
            .then(result => callback(null, result.rows[0]?.version))
            .catch(error => callback(error));
    }
    getTables(schema, callback) {
        const sql = `select * from information_schema.tables where table_schema = $1;`;
        this.client
            .query(sql, [schema])
            .then(result => callback(null, mapRows(result, table_1.Table)))
            .catch(error => callback(error));
    }
    getColumns(schema, tableName, callback) {
        const sql = `WITH column_privileges AS (
        SELECT table_schema, TABLE_NAME, column_name,STRING_AGG(privilege_type, ', ' ORDER BY privilege_type ) AS privileges
     FROM information_schema.column_privileges
     WHERE table_schema = 'public'
     GROUP BY table_schema, TABLE_NAME, COLUMN_NAME
         ), table_column_constraints AS (
     SELECT
         kcu.table_schema, kcu.constraint_schema, kcu.table_name, kcu.column_name,  tc.constraint_type ,tc.constraint_name
     FROM information_schema.key_column_usage kcu
         JOIN information_schema.table_constraints tc ON kcu.constraint_catalog = tc.constraint_catalog AND kcu.constraint_schema = tc.constraint_schema AND kcu.constraint_name = tc.constraint_name
     WHERE kcu.table_schema = 'public' AND tc.constraint_type != 'PRIMARY KEY'
         ), primary_key_colums AS(
     SELECT
         kcu.table_schema, kcu.table_name, kcu.column_name,  tc.constraint_type
     FROM information_schema.key_column_usage kcu
         JOIN information_schema.table_constraints tc ON kcu.constraint_catalog = tc.constraint_catalog AND kcu.constraint_schema = tc.constraint_schema AND kcu.constraint_name = tc.constraint_name
     WHERE kcu.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
         )
    SELECT  c.*,
            case when (pkc.constraint_type is null and c.ordinal_position = 1 and c.table_name like 'v_crud_%') then 'PRIMARY KEY' else pkc.constraint_type end as is_primary_key,
            tcc.constraint_type AS column_key,
            cp.privileges,
            tcc.constraint_name,
            ccu.table_name AS referenced_table_name,
            ccu.column_name AS referenced_column_name,
            rc.update_rule,
            rc.delete_rule
    FROM information_schema.columns c -- WIDOKI SĄ
             LEFT JOIN table_column_constraints tcc ON c.table_schema = tcc.table_schema AND  c.table_name = tcc.table_name AND c.column_name = tcc.column_name
             LEFT JOIN primary_key_colums pkc ON c.table_schema = pkc.table_schema AND  c.table_name = pkc.table_name AND c.column_name = pkc.column_name
             LEFT JOIN information_schema.referential_constraints rc ON  tcc.constraint_schema = rc.constraint_schema AND tcc.constraint_name = rc.constraint_name
             LEFT JOIN information_schema.constraint_column_usage ccu ON tcc.constraint_schema = ccu.constraint_schema AND tcc.constraint_name = ccu.constraint_name AND tcc.constraint_type = 'FOREIGN KEY'
             LEFT JOIN column_privileges cp ON c.table_schema = cp.table_schema AND c.table_name = cp.table_name AND c.column_name = cp.column_name
    WHERE c.table_schema = $1
      AND c.table_name = $2
    ;`;
        this.client
            .query(sql, [schema, tableName])
            .then(result => callback(null, mapRows(result, column_1.PgColumn)))
            .catch(error => callback(error));
    }
    getIndexes(schema, tableName, callback) {
        const sql = `SELECT b.*, d.table_schema AS REFERENCED_TABLE_SCHEMA, d.table_name AS REFERENCED_TABLE_NAME, d.column_name AS  REFERENCED_COLUMN_NAME FROM information_schema.key_column_usage b
    LEFT JOIN information_schema.referential_constraints c ON b.table_schema = c.constraint_schema AND c.constraint_name = b.constraint_name
    LEFT JOIN information_schema.constraint_column_usage d ON b.table_schema = d.table_schema AND c.constraint_name = d.constraint_name
    WHERE b.table_schema = $1
    AND b.table_name = $2;`;
        this.client
            .query(sql, [schema, tableName])
            .then(result => callback(null, mapRows(result, index_1.PgIndex)))
            .catch(error => callback(error));
    }
    close(callback) {
        this.client.end(err => callback(err ?? null));
    }
}
exports.PgDriver = PgDriver;
function mapRows(result, Ctor) {
    return result.rows.map(row => new Ctor(row));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9wZy9kcml2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBVUEsMEJBT0M7QUFFRCxrRUFFQztBQXBCRCwyQkFBMkI7QUFFM0Isb0NBQWdDO0FBRWhDLHFDQUFtQztBQUNuQyxtQ0FBaUM7QUFJakMsU0FBZ0IsT0FBTyxDQUFDLE9BQXFCLEVBQUUsUUFBd0I7SUFDckUsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7SUFFbEMsTUFBTTtTQUNILE9BQU8sRUFBRTtTQUNULElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDaEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUVELFNBQWdCLDJCQUEyQixDQUFDLE1BQWMsRUFBRSxRQUF3QjtJQUNsRixRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDdEMsQ0FBQztBQUVELE1BQWEsUUFBUTtJQUduQixZQUFZLE1BQWM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDdEIsQ0FBQztJQUVELFVBQVUsQ0FBQyxRQUF1RDtRQUNoRSxJQUFJLENBQUMsTUFBTTthQUNSLEtBQUssQ0FBc0Isa0JBQWtCLENBQUM7YUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRCxTQUFTLENBQUMsTUFBYyxFQUFFLFFBQXVEO1FBQy9FLE1BQU0sR0FBRyxHQUFHLGtFQUFrRSxDQUFBO1FBQzlFLElBQUksQ0FBQyxNQUFNO2FBQ1IsS0FBSyxDQUFnQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQzthQUN0RCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsVUFBVSxDQUNSLE1BQWMsRUFDZCxTQUFpQixFQUNqQixRQUEyRDtRQUUzRCxNQUFNLEdBQUcsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFtQ1YsQ0FBQTtRQUVGLElBQUksQ0FBQyxNQUFNO2FBQ1IsS0FBSyxDQUFnQixHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLGlCQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3pELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRCxVQUFVLENBQ1IsTUFBYyxFQUNkLFNBQWlCLEVBQ2pCLFFBQTBEO1FBRTFELE1BQU0sR0FBRyxHQUFHOzs7OzJCQUlXLENBQUE7UUFFdkIsSUFBSSxDQUFDLE1BQU07YUFDUixLQUFLLENBQWdCLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzthQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsZUFBTyxDQUFDLENBQUMsQ0FBQzthQUN4RCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQXNDO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQy9DLENBQUM7Q0FDRjtBQTFGRCw0QkEwRkM7QUFFRCxTQUFTLE9BQU8sQ0FBSSxNQUFrQyxFQUFFLElBQXFDO0lBQzNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQzlDLENBQUMifQ==