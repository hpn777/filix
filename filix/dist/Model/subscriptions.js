"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriptions = exports.Subscription = void 0;
const tessio_1 = require("tessio");
class Subscription extends tessio_1.backbone.Model {
    id = '';
    requestId = '';
    clientId = '';
    containerId = '';
    moduleId = '';
    connectionType = '';
    userId = 0;
    authToken = '';
    publish = function (_responseData, _requestId) { };
    publishError = function (_responseData, _requestId) { };
    constructor(item, options) {
        super(item, options);
        if (item) {
            const processedItem = { ...item };
            if (processedItem.userId !== undefined) {
                processedItem.userId = typeof processedItem.userId === 'string'
                    ? Number(processedItem.userId)
                    : processedItem.userId;
            }
            Object.assign(this, processedItem);
        }
    }
    remove() {
        this.trigger('remove', this);
        this.off('remove');
        this.collection?.remove(this);
        this.off();
    }
}
exports.Subscription = Subscription;
class Subscriptions extends tessio_1.backbone.Collection {
    model = Subscription;
}
exports.Subscriptions = Subscriptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NyaXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbC9zdWJzY3JpcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUE4QztBQStCOUMsTUFBYSxZQUFhLFNBQVEsaUJBQVEsQ0FBQyxLQUFLO0lBSXZDLEVBQUUsR0FBVyxFQUFFLENBQUE7SUFDZixTQUFTLEdBQVcsRUFBRSxDQUFBO0lBQ3RCLFFBQVEsR0FBVyxFQUFFLENBQUE7SUFDckIsV0FBVyxHQUFXLEVBQUUsQ0FBQTtJQUN4QixRQUFRLEdBQVcsRUFBRSxDQUFBO0lBQ3JCLGNBQWMsR0FBVyxFQUFFLENBQUE7SUFDM0IsTUFBTSxHQUFXLENBQUMsQ0FBQTtJQUNsQixTQUFTLEdBQVcsRUFBRSxDQUFBO0lBQ3RCLE9BQU8sR0FBb0IsVUFBVSxhQUFhLEVBQUUsVUFBVSxJQUFHLENBQUMsQ0FBQTtJQUNsRSxZQUFZLEdBQW9CLFVBQVUsYUFBYSxFQUFFLFVBQVUsSUFBRyxDQUFDLENBQUE7SUFFOUUsWUFBWSxJQUFnQyxFQUFFLE9BQXlCO1FBQ3JFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDcEIsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUVULE1BQU0sYUFBYSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQTtZQUNqQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3ZDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxhQUFhLENBQUMsTUFBTSxLQUFLLFFBQVE7b0JBQzdELENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztvQkFDOUIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUE7WUFDMUIsQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ3BDLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ1osQ0FBQztDQUNGO0FBbkNELG9DQW1DQztBQUVELE1BQWEsYUFBYyxTQUFRLGlCQUFRLENBQUMsVUFBVTtJQUNwRCxLQUFLLEdBQUcsWUFBWSxDQUFBO0NBS3JCO0FBTkQsc0NBTUMifQ==