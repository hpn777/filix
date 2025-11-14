"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteIndex = void 0;
const databaseIndex_1 = require("../databaseIndex");
class SqliteIndex extends databaseIndex_1.DatabaseIndex {
    constructor(props) {
        super(props);
    }
    getName() {
        return this.meta.index_name;
    }
    getTableName() {
        return this.meta.table_name;
    }
    getColumnName() {
        return this.meta.name;
    }
}
exports.SqliteIndex = SqliteIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvZGJNZXRhL3NxbGl0ZTMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQStEO0FBUy9ELE1BQWEsV0FBWSxTQUFRLDZCQUFrQztJQUNqRSxZQUFZLEtBQW9CO1FBQzlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNkLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQTtJQUM3QixDQUFDO0lBRUQsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDN0IsQ0FBQztJQUVELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ3ZCLENBQUM7Q0FDRjtBQWhCRCxrQ0FnQkMifQ==