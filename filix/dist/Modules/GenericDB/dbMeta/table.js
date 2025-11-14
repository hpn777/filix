"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const util_1 = require("./util");
class Table {
    constructor(props) {
        this.meta = (0, util_1.lowercaseKeys)(props);
    }
    getName() {
        const name = this.meta.table_name;
        if (!name) {
            throw new Error('Table name metadata is missing');
        }
        return name;
    }
    getType() {
        return this.meta.table_type === 'VIEW' ? 'VIEW' : 'TABLE';
    }
}
exports.Table = Table;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvZGJNZXRhL3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFxRDtBQVNyRCxNQUFhLEtBQUs7SUFHaEIsWUFBWSxLQUFvQjtRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUEsb0JBQWEsRUFBQyxLQUFLLENBQWtCLENBQUE7SUFDbkQsQ0FBQztJQUVELE9BQU87UUFDTCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQTtRQUVqQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7UUFDbkQsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUE7SUFDM0QsQ0FBQztDQUNGO0FBcEJELHNCQW9CQyJ9