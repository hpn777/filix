"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = void 0;
const util_1 = require("./util");
class Column {
    constructor(props) {
        this.meta = (0, util_1.lowercaseKeys)(props);
    }
    getConstraintName() {
        return null;
    }
    getReferencedTableName() {
        return null;
    }
    getReferencedColumnName() {
        return null;
    }
    getUpdateRule() {
        return null;
    }
    getDeleteRule() {
        return null;
    }
}
exports.Column = Column;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL2RiTWV0YS9jb2x1bW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXFEO0FBSXJELE1BQXNCLE1BQU07SUFHMUIsWUFBc0IsS0FBb0I7UUFDeEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFBLG9CQUFhLEVBQUMsS0FBSyxDQUFVLENBQUE7SUFDM0MsQ0FBQztJQWtCRCxpQkFBaUI7UUFDZixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxzQkFBc0I7UUFDcEIsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsdUJBQXVCO1FBQ3JCLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0NBQ0Y7QUExQ0Qsd0JBMENDIn0=