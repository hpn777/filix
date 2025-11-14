"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const Enumerable = require('linq');
const tessio_1 = require("tessio");
const model_1 = require("./model");
const generateGuid_1 = require("../utils/generateGuid");
class Collection extends tessio_1.backbone.Collection {
    model = model_1.Model;
    cloneAll() {
        const items = [];
        this.each((x) => {
            items.push(x.clone());
        });
        return items;
    }
    toEnumerable() {
        return Enumerable.from(this.models);
    }
    guid() {
        return (0, generateGuid_1.generateGuid)();
    }
}
exports.Collection = Collection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbC9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQyxtQ0FBaUM7QUFDakMsbUNBQStCO0FBQy9CLHdEQUFvRDtBQUVwRCxNQUFNLFVBQVcsU0FBUSxpQkFBUSxDQUFDLFVBQVU7SUFLMUMsS0FBSyxHQUFHLGFBQUssQ0FBQTtJQUViLFFBQVE7UUFDTixNQUFNLEtBQUssR0FBVSxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO1lBRW5CLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDdkIsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7SUFFRCxZQUFZO1FBQ1YsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsSUFBSTtRQUNGLE9BQU8sSUFBQSwyQkFBWSxHQUFFLENBQUE7SUFDdkIsQ0FBQztDQUNGO0FBRVEsZ0NBQVUifQ==