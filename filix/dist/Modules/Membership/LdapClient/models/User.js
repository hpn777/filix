"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    dn;
    sn;
    cn;
    gidNumber;
    uid;
    displayName;
    mail;
    groups;
    constructor(properties) {
        if (properties) {
            for (const property in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, property)) {
                    this[property] = properties[property];
                }
            }
        }
    }
    isMemberOf(group) {
        if (!group)
            return false;
        return (this.groups || []).some(item => ((item || {}).cn || '').toLowerCase() === (group || '').toLowerCase());
    }
}
exports.User = User;
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL01lbWJlcnNoaXAvTGRhcENsaWVudC9tb2RlbHMvVXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFlQSxNQUFhLElBQUk7SUFDZixFQUFFLENBQVM7SUFDWCxFQUFFLENBQVM7SUFDWCxFQUFFLENBQVM7SUFDWCxTQUFTLENBQVM7SUFDbEIsR0FBRyxDQUFTO0lBQ1osV0FBVyxDQUFTO0lBQ3BCLElBQUksQ0FBUztJQUNiLE1BQU0sQ0FBNkM7SUFHbkQsWUFBWSxVQUEyQjtRQUNyQyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2YsS0FBSyxNQUFNLFFBQVEsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7Z0JBQ3ZDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFPRCxVQUFVLENBQUMsS0FBYTtRQUN0QixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sS0FBSyxDQUFBO1FBRXhCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FDOUUsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQWpDRCxvQkFpQ0M7QUFFRCxrQkFBZSxJQUFJLENBQUEifQ==