"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgIndex = void 0;
const databaseIndex_1 = require("../databaseIndex");
class PgIndex extends databaseIndex_1.DatabaseIndex {
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
        return this.meta.column_name;
    }
}
exports.PgIndex = PgIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvZGJNZXRhL3BnL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9EQUErRDtBQVMvRCxNQUFhLE9BQVEsU0FBUSw2QkFBOEI7SUFDekQsWUFBWSxLQUFvQjtRQUM5QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDZCxDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDN0IsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQzdCLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUM5QixDQUFDO0NBQ0Y7QUFoQkQsMEJBZ0JDIn0=