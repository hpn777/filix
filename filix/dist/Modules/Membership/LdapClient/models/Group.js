"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
class Group {
    dn;
    cn;
    gidNumber;
    member;
    memberOf;
    constructor(properties) {
        if (properties) {
            for (const property in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, property)) {
                    this[property] = properties[property];
                }
            }
        }
    }
}
exports.Group = Group;
exports.default = Group;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9NZW1iZXJzaGlwL0xkYXBDbGllbnQvbW9kZWxzL0dyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVlBLE1BQWEsS0FBSztJQUNoQixFQUFFLENBQVM7SUFDWCxFQUFFLENBQVM7SUFDWCxTQUFTLENBQVM7SUFDbEIsTUFBTSxDQUFXO0lBQ2pCLFFBQVEsQ0FBVztJQUduQixZQUFZLFVBQTRCO1FBQ3RDLElBQUksVUFBVSxFQUFFLENBQUM7WUFDZixLQUFLLE1BQU0sUUFBUSxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztvQkFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDdkMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBakJELHNCQWlCQztBQUVELGtCQUFlLEtBQUssQ0FBQSJ9