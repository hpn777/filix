"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallFunction = void 0;
const tslib_1 = require("tslib");
const sanitizeString_1 = tslib_1.__importDefault(require("./utils/sanitizeString"));
const commonHelpers_1 = require("./utils/commonHelpers");
class CallFunction {
    CallFunction(request, subscription) {
        const { functionName, functionParameter } = request.parameters;
        const query = this.buildFunctionQuery(functionName, functionParameter);
        this.executeFunctionQuery(query, functionName, subscription, request.requestId);
    }
    buildFunctionQuery(functionName, functionParameter) {
        return `SELECT * FROM ${(0, sanitizeString_1.default)(functionName)}('${(0, sanitizeString_1.default)(functionParameter)}')`;
    }
    async executeFunctionQuery(query, functionName, subscription, requestId) {
        try {
            const data = await this.DBModels.execQuery(query);
            commonHelpers_1.CommonHelpers.publishSuccess(subscription, requestId, {
                data: data,
                type: 'reset',
            });
        }
        catch (err) {
            commonHelpers_1.CommonHelpers.publishError(subscription, `Error while calling function: ${functionName}`);
        }
    }
}
exports.CallFunction = CallFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbEZ1bmN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvR2VuZXJpY0RCL21peGlucy9jYWxsRnVuY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLG9GQUFtRDtBQUNuRCx5REFBcUQ7QUFJckQsTUFBYSxZQUFZO0lBQ3ZCLFlBQVksQ0FBa0IsT0FBTyxFQUFFLFlBQTBCO1FBQy9ELE1BQU0sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO1FBRTlELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtRQUV0RSxJQUFJLENBQUMsb0JBQW9CLENBQ3ZCLEtBQUssRUFDTCxZQUFZLEVBQ1osWUFBWSxFQUNaLE9BQU8sQ0FBQyxTQUFTLENBQ2xCLENBQUE7SUFDSCxDQUFDO0lBS0Qsa0JBQWtCLENBRWhCLFlBQW9CLEVBQ3BCLGlCQUF5QjtRQUV6QixPQUFPLGlCQUFpQixJQUFBLHdCQUFjLEVBQUMsWUFBWSxDQUFDLEtBQUssSUFBQSx3QkFBYyxFQUNyRSxpQkFBaUIsQ0FDbEIsSUFBSSxDQUFBO0lBQ1AsQ0FBQztJQUtELEtBQUssQ0FBQyxvQkFBb0IsQ0FFeEIsS0FBYSxFQUNiLFlBQW9CLEVBQ3BCLFlBQTBCLEVBQzFCLFNBQWlCO1FBRWpCLElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQWEsS0FBSyxDQUFDLENBQUE7WUFFekUsNkJBQWEsQ0FBQyxjQUFjLENBQzFCLFlBQVksRUFDWixTQUFTLEVBQ1Q7Z0JBQ0UsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLE9BQU87YUFDZCxDQUNGLENBQUE7UUFDSCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNiLDZCQUFhLENBQUMsWUFBWSxDQUN4QixZQUFZLEVBQ1osaUNBQWlDLFlBQVksRUFBRSxDQUNoRCxDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRjtBQXZERCxvQ0F1REMifQ==