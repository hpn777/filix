"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonHelpers = void 0;
const index_1 = require("../../index");
class CommonHelpers {
    static async validateRequestAccess(module, request, subscription) {
        const requestValid = await module.validateRequest(request, subscription);
        if (!requestValid) {
            subscription.publishError({
                message: `Insufficient access rights to call: ${(0, index_1.getAPIKey)(request)}`,
            });
            return false;
        }
        return true;
    }
    static getTesseract(evH, tableName, subscription) {
        const tesseract = evH.get(tableName);
        if (!tesseract) {
            subscription.publishError({
                message: `Table "${tableName}" not found`
            });
            return null;
        }
        return tesseract;
    }
    static validateTableName(tableName, subscription, errorMessage = 'table name missing') {
        if (!tableName) {
            subscription.publishError({ message: errorMessage });
            return false;
        }
        return true;
    }
    static publishSuccess(subscription, requestId, data = { success: true }) {
        subscription.publish(data, requestId);
    }
    static publishError(subscription, message, code) {
        const error = { message };
        if (code) {
            error.code = code;
        }
        subscription.publishError(error);
    }
}
exports.CommonHelpers = CommonHelpers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uSGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9taXhpbnMvdXRpbHMvY29tbW9uSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBNEQ7QUFNNUQsTUFBYSxhQUFhO0lBSXhCLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQ2hDLE1BQWlCLEVBQ2pCLE9BQVksRUFDWixZQUEwQjtRQUUxQixNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBRXhFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQixZQUFZLENBQUMsWUFBWSxDQUFDO2dCQUN4QixPQUFPLEVBQUUsdUNBQXVDLElBQUEsaUJBQVMsRUFBQyxPQUFPLENBQUMsRUFBRTthQUNyRSxDQUFDLENBQUE7WUFDRixPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFLRCxNQUFNLENBQUMsWUFBWSxDQUNqQixHQUFRLEVBQ1IsU0FBaUIsRUFDakIsWUFBMEI7UUFFMUIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUVwQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDZixZQUFZLENBQUMsWUFBWSxDQUFDO2dCQUN4QixPQUFPLEVBQUUsVUFBVSxTQUFTLGFBQWE7YUFDMUMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztJQUtELE1BQU0sQ0FBQyxpQkFBaUIsQ0FDdEIsU0FBNkIsRUFDN0IsWUFBMEIsRUFDMUIsZUFBdUIsb0JBQW9CO1FBRTNDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNmLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUNwRCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFLRCxNQUFNLENBQUMsY0FBYyxDQUNuQixZQUEwQixFQUMxQixTQUFpQixFQUNqQixPQUFZLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtRQUU3QixZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0lBS0QsTUFBTSxDQUFDLFlBQVksQ0FDakIsWUFBMEIsRUFDMUIsT0FBZSxFQUNmLElBQWE7UUFFYixNQUFNLEtBQUssR0FBUSxFQUFFLE9BQU8sRUFBRSxDQUFBO1FBQzlCLElBQUksSUFBSSxFQUFFLENBQUM7WUFDVCxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNuQixDQUFDO1FBQ0QsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0NBQ0Y7QUFqRkQsc0NBaUZDIn0=