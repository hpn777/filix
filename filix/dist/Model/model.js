"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const tessio_1 = require("tessio");
const generateGuid_1 = require("../utils/generateGuid");
class Model extends tessio_1.backbone.Model {
    constructor(item, options) {
        super(item, options);
    }
    remove() {
        this.trigger('remove', this);
        this.off('remove');
        this.collection?.remove(this);
        this.off();
    }
    cloneAttributes(selectedAttributes) {
        const clonedObj = {};
        if (selectedAttributes) {
            for (let i = 0; i < selectedAttributes.length; i++) {
                clonedObj[selectedAttributes[i]] = this.get(selectedAttributes[i]);
            }
        }
        else {
            for (const attr in this.attributes) {
                switch (attr) {
                    case 'collection':
                        break;
                    default:
                        clonedObj[attr] = this.get(attr);
                        break;
                }
            }
        }
        return clonedObj;
    }
    guid() {
        return (0, generateGuid_1.generateGuid)();
    }
}
exports.Model = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvTW9kZWwvbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQWlDO0FBQ2pDLHdEQUFvRDtBQVlwRCxNQUFNLEtBQU0sU0FBUSxpQkFBUSxDQUFDLEtBQUs7SUFDaEMsWUFBWSxJQUErQixFQUFFLE9BQXNCO1FBQ2pFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDdEIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQVcsQ0FBQyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNaLENBQUM7SUFFRCxlQUFlLENBQUMsa0JBQTZCO1FBQzNDLE1BQU0sU0FBUyxHQUF3QixFQUFFLENBQUE7UUFDekMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3BFLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQyxRQUFRLElBQUksRUFBRSxDQUFDO29CQUNiLEtBQUssWUFBWTt3QkFDZixNQUFLO29CQUNQO3dCQUNFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNoQyxNQUFLO2dCQUNULENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUM7SUFFRCxJQUFJO1FBQ0YsT0FBTyxJQUFBLDJCQUFZLEdBQUUsQ0FBQTtJQUN2QixDQUFDO0NBQ0Y7QUFFUSxzQkFBSyJ9