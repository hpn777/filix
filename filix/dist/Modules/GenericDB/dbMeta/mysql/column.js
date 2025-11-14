"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlColumn = void 0;
const column_1 = require("../column");
class MysqlColumn extends column_1.Column {
    constructor(props) {
        super(props);
    }
    getName() {
        return this.meta.column_name;
    }
    isNullable() {
        return this.meta.is_nullable === 'YES';
    }
    getMaxLength() {
        return this.meta.character_maximum_length ?? null;
    }
    getDataType() {
        return this.meta.data_type;
    }
    isPrimaryKey() {
        return this.meta.column_key === 'PRI';
    }
    getDefaultValue() {
        return this.meta.column_default;
    }
    isUnique() {
        return this.meta.column_key === 'UNI' || this.meta.column_key === 'PRI';
    }
    isAutoIncrementing() {
        return this.meta.extra === 'auto_increment';
    }
    getConstraintName() {
        return this.meta.constraint_name ?? null;
    }
    getReferencedTableName() {
        return this.meta.referenced_table_name ?? null;
    }
    getReferencedColumnName() {
        return this.meta.referenced_column_name ?? null;
    }
    getUpdateRule() {
        return this.meta.update_rule ?? null;
    }
    getDeleteRule() {
        return this.meta.delete_rule ?? null;
    }
}
exports.MysqlColumn = MysqlColumn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9teXNxbC9jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQWtEO0FBb0JsRCxNQUFhLFdBQVksU0FBUSxlQUEyQjtJQUMxRCxZQUFZLEtBQW9CO1FBQzlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNkLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUM5QixDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFBO0lBQ3hDLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksQ0FBQTtJQUNuRCxDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDNUIsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQTtJQUN2QyxDQUFDO0lBRUQsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUE7SUFDakMsQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUE7SUFDekUsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLGdCQUFnQixDQUFBO0lBQzdDLENBQUM7SUFFUSxpQkFBaUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUE7SUFDMUMsQ0FBQztJQUVRLHNCQUFzQjtRQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFBO0lBQ2hELENBQUM7SUFFUSx1QkFBdUI7UUFDOUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixJQUFJLElBQUksQ0FBQTtJQUNqRCxDQUFDO0lBRVEsYUFBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQTtJQUN0QyxDQUFDO0lBRVEsYUFBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQTtJQUN0QyxDQUFDO0NBQ0Y7QUF4REQsa0NBd0RDIn0=