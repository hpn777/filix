"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseIndex = void 0;
const util_1 = require("./util");
class DatabaseIndex {
    constructor(props) {
        this.meta = (0, util_1.lowercaseKeys)(props);
    }
    isNullable() {
        return this.meta.null === 'YES';
    }
}
exports.DatabaseIndex = DatabaseIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2VJbmRleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9kYk1ldGEvZGF0YWJhc2VJbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBcUQ7QUFTckQsTUFBc0IsYUFBYTtJQUdqQyxZQUFzQixLQUFvQjtRQUN4QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUEsb0JBQWEsRUFBQyxLQUFLLENBQVUsQ0FBQTtJQUMzQyxDQUFDO0lBUUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFBO0lBQ2pDLENBQUM7Q0FDRjtBQWhCRCxzQ0FnQkMifQ==