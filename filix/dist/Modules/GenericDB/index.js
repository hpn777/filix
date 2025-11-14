"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.DataActions = exports.getAPIKey = void 0;
const utils_1 = require("../../utils");
const base_1 = require("../base");
const mixins_1 = require("../../utils/mixins");
const sqlEV_1 = require("./sqlEV");
const sqlModelGenerator_1 = require("./sqlModelGenerator");
const createModule_1 = require("./mixins/createModule");
const GetData_1 = require("./mixins/GetData");
const getColumnsDefinition_1 = require("./mixins/getColumnsDefinition");
const setData_1 = require("./mixins/setData");
const removeData_1 = require("./mixins/removeData");
const callFunction_1 = require("./mixins/callFunction");
const getAPIKey = request => {
    const queryEnding = '-query';
    if (request.parameters.tableName?.endsWith(queryEnding)) {
        request.parameters.tableName = request.parameters.tableName.slice(0, -queryEnding.length);
    }
    return `${request.dataProviderId}.${request.parameters.command}.${request.parameters.tableName}`;
};
exports.getAPIKey = getAPIKey;
var DataActions;
(function (DataActions) {
    DataActions["GetData"] = "GetData";
    DataActions["SetData"] = "SetData";
    DataActions["RemoveData"] = "RemoveData";
})(DataActions || (exports.DataActions = DataActions = {}));
class Module extends base_1.BaseModule {
    evH;
    DBModels;
    publicMethods = new Map([
        [DataActions.GetData, this.GetData],
        [DataActions.SetData, this.SetData],
        [DataActions.RemoveData, this.RemoveData],
        ['RemoveProxy', this.RemoveProxy],
        ['GetColumnsDefinition', this.GetColumnsDefinition],
        ['CreateModule', this.CreateModule],
        ['CallFunction', this.CallFunction],
    ]);
    async init() {
        utils_1.logger.info('Module initialized', {
            module: this.config.id,
        });
        const config = this.config;
        if (config.db_config) {
            this.DBModels = new sqlModelGenerator_1.DBModels({
                config: config.db_config,
            });
            await this.DBModels.whenReady();
            this.evH = new sqlEV_1.SqlEV({
                DBModels: this.DBModels,
                namespace: this.config.moduleId,
                tessio: config.tessio,
                autofetch: config.autofetch,
            });
            if (config.autofetch) {
                await this.evH.whenReady();
            }
        }
        return this;
    }
    getApiAccess(request) {
        const membershipDP = this.subscriptionManager.getDefaultMembershipModule();
        if (!membershipDP) {
            return [];
        }
        const apiAccessTesseract = membershipDP.evH.get('api_access_app_role');
        if (!apiAccessTesseract) {
            utils_1.logger.warn('api_access_app_role tesseract not found', {
                module: this.config.id,
            });
            return [];
        }
        return apiAccessTesseract
            .getLinq()
            .where(x => x.api_access_id === (0, exports.getAPIKey)(request))
            .toArray();
    }
    validateRequest(request, subscription) {
        const membershipDP = this.subscriptionManager.getDefaultMembershipModule();
        if (!membershipDP) {
            utils_1.logger.warn('Membership module not found for request validation', {
                module: this.config.id,
            });
            return false;
        }
        const apiAccessTesseract = membershipDP.evH.get('api_access');
        if (!apiAccessTesseract) {
            utils_1.logger.warn('api_access tesseract not found', {
                module: this.config.id,
            });
            return false;
        }
        const apiKey = (0, exports.getAPIKey)(request);
        const apiAccessEntry = apiAccessTesseract.getById(apiKey);
        if (!apiAccessEntry) {
            return false;
        }
        if (!apiAccessEntry.enforce_role) {
            return true;
        }
        const apiAccessInstance = this.getApiAccess(request);
        if (!apiAccessInstance.length) {
            return false;
        }
        const userRolesTesseract = membershipDP.evH.get('user_roles');
        if (!userRolesTesseract) {
            utils_1.logger.warn('user_roles tesseract not found', {
                module: this.config.id,
            });
            return false;
        }
        return userRolesTesseract
            .getLinq()
            .any(x => x.user_id === subscription.userId &&
            !!apiAccessInstance.some(ar => ar.app_role_id === x.roles_id));
    }
    async runDBQuery(sessionQuery) {
        const result = await this.DBModels.sessionQuery(sessionQuery);
        return result?.data || [];
    }
}
exports.Module = Module;
(0, mixins_1.applyMixins)(Module, [
    createModule_1.CreateModule,
    GetData_1.GetData,
    getColumnsDefinition_1.GetColumnsDefinition,
    setData_1.SetData,
    removeData_1.RemoveData,
    callFunction_1.CallFunction,
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9HZW5lcmljREIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW9DO0FBRXBDLGtDQUFvRDtBQUNwRCwrQ0FBZ0Q7QUFDaEQsbUNBQStCO0FBQy9CLDJEQUE4QztBQUU5Qyx3REFBb0Q7QUFDcEQsOENBQTBDO0FBQzFDLHdFQUFvRTtBQUNwRSw4Q0FBMEM7QUFDMUMsb0RBQWdEO0FBQ2hELHdEQUFvRDtBQUU3QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsRUFBRTtJQUNqQyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUE7SUFDNUIsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQy9ELENBQUMsRUFDRCxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQ3BCLENBQUE7SUFDSCxDQUFDO0lBRUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUNsRyxDQUFDLENBQUE7QUFWWSxRQUFBLFNBQVMsYUFVckI7QUFFRCxJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDckIsa0NBQW1CLENBQUE7SUFDbkIsa0NBQW1CLENBQUE7SUFDbkIsd0NBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUpXLFdBQVcsMkJBQVgsV0FBVyxRQUl0QjtBQUVELE1BQU0sTUFBTyxTQUFRLGlCQUFVO0lBR3RCLEdBQUcsQ0FBUTtJQUNYLFFBQVEsQ0FBVztJQUUxQixhQUFhLEdBQWdDLElBQUksR0FBRyxDQUFDO1FBQ25ELENBQUMsV0FBVyxD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