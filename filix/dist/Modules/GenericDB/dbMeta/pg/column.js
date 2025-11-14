"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgColumn = void 0;
const column_1 = require("../column");
class PgColumn extends column_1.Column {
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
        return this.meta.is_primary_key === 'PRIMARY KEY';
    }
    getDefaultValue() {
        if (this.isAutoIncrementing()) {
            return null;
        }
        const defaultValue = this.meta.column_default;
        if (!defaultValue) {
            return null;
        }
        return defaultValue.replace(`::${this.meta.data_type}`, '');
    }
    isUnique() {
        return (this.meta.column_key === 'UNIQUE' ||
            this.meta.column_key === 'PRIMARY KEY');
    }
    isAutoIncrementing() {
        return (this.meta.column_default ?? '').startsWith('nextval');
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
exports.PgColumn = PgColumn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9wZy9jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQWtEO0FBa0JsRCxNQUFhLFFBQVMsU0FBUSxlQUF3QjtJQUNwRCxZQUFZLEtBQW9CO1FBQzlCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNkLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUM5QixDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFBO0lBQ3hDLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksQ0FBQTtJQUNuRCxDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDNUIsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxLQUFLLGFBQWEsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztZQUM5QixPQUFPLElBQUksQ0FBQTtRQUNiLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU8sQ0FDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLGFBQWEsQ0FDdkMsQ0FBQTtJQUNILENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBRVEsaUJBQWlCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFBO0lBQzFDLENBQUM7SUFFUSxzQkFBc0I7UUFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLElBQUksQ0FBQTtJQUNoRCxDQUFDO0lBRVEsdUJBQXVCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxJQUFJLENBQUE7SUFDakQsQ0FBQztJQUVRLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUE7SUFDdEMsQ0FBQztJQUVRLGFBQWE7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUE7SUFDdEMsQ0FBQztDQUNGO0FBbkVELDRCQW1FQyJ9