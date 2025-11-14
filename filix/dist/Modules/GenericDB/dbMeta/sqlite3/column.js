"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteColumn = void 0;
const column_1 = require("../column");
class SqliteColumn extends column_1.Column {
    constructor(props) {
        super(props);
    }
    getName() {
        return this.meta.name;
    }
    isNullable() {
        return this.meta.notnull === 0;
    }
    getMaxLength() {
        const match = this.getDataType().match(/\((\d+)\)$/);
        if (!match) {
            return null;
        }
        return Number(match[1]);
    }
    getDataType() {
        return this.meta.type.toUpperCase();
    }
    isPrimaryKey() {
        return this.meta.pk === 1;
    }
    getDefaultValue() {
        return this.meta.dflt_value;
    }
    isUnique() {
        return Boolean(this.meta.unique) || this.meta.pk === 1;
    }
    isAutoIncrementing() {
        return Boolean(this.meta.auto_increment);
    }
    markUnique() {
        this.meta.unique = true;
    }
    markAutoIncrement() {
        this.meta.auto_increment = true;
    }
}
exports.SqliteColumn = SqliteColumn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9zcWxpdGUzL2NvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBa0Q7QUFhbEQsTUFBYSxZQUFhLFNBQVEsZUFBNEI7SUFDNUQsWUFBWSxLQUFvQjtRQUM5QixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDZCxDQUFDO0lBRUQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDdkIsQ0FBQztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0lBRUQsWUFBWTtRQUNWLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1gsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDekIsQ0FBQztJQUVELFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ3JDLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDM0IsQ0FBQztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQzdCLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDeEQsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0lBQ3pCLENBQUM7SUFFRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUE7SUFDakMsQ0FBQztDQUNGO0FBakRELG9DQWlEQyJ9