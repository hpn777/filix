"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlIndex = void 0;
const databaseIndex_1 = require("../databaseIndex");
class MysqlIndex extends databaseIndex_1.DatabaseIndex {
    constructor(props) {
        super(props);
    }
    getName() {
        return this.meta.key_name;
    }
    getTableName() {
        return this.meta.table;
    }
    getColumnName() {
        return this.meta.column_name;
    }
}
exports.MysqlIndex = MysqlIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvZGJNZXRhL215c3FsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9EQUErRDtBQVMvRCxNQUFhLFVBQVcsU0FBUSw2QkFBaUM7SUFDL0QsWUFBWSxLQUFvQjtRQUM5QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDZCxDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7SUFDM0IsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ3hCLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUM5QixDQUFDO0NBQ0Y7QUFoQkQsZ0NBZ0JDIn0=