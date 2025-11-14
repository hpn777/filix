"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiAccessBootstrap = void 0;
const tslib_1 = require("tslib");
const tessio_1 = require("tessio");
const roles_json_1 = tslib_1.__importDefault(require("../fixtures/roles.json"));
const systemTablesAccesses_json_1 = tslib_1.__importDefault(require("../fixtures/systemTablesAccesses.json"));
const GenericDB_1 = require("../Modules/GenericDB");
const logger_1 = require("../utils/logger");
class ApiAccessBootstrap {
    config;
    subscriptionManager;
    initialized = false;
    constructor(config, subscriptionManager) {
        this.config = config;
        this.subscriptionManager = subscriptionManager;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        if (!this.config?.membership_module || !Array.isArray(this.config.modules)) {
            this.initialized = true;
            return;
        }
        try {
            const modules = await this.loadConfiguredModules();
            const membershipDP = await this.subscriptionManager.resolveModule(this.config.membership_module);
            if (!membershipDP?.evH || !membershipDP.dbModule) {
                logger_1.logger.warn('Membership data provider not ready for API access bootstrap', {
                    module: 'ApiAccessBootstrap',
                });
                this.initialized = true;
                return;
            }
            const apiAccess = membershipDP.evH.get('api_access');
            if (!apiAccess) {
                this.initialized = true;
                return;
            }
            const data = [];
            modules.forEach(module => {
                const moduleAny = module;
                const publicMethods = moduleAny.publicMethods;
                publicMethods.forEach((_item, attr) => {
                    if (!moduleAny.config?.id) {
                        return;
                    }
                    const accessId = `${moduleAny.config.id}.${attr}`;
                    if (!apiAccess.getById(accessId)) {
                        data.push({
                            id: accessId,
                            audit: false,
                        });
                    }
                    const dataActions = Object.values(GenericDB_1.DataActions);
                    if (dataActions.includes(attr)) {
                        if (!moduleAny.DBModels) {
                            return;
                        }
                        moduleAny.DBModels.getTableNames().forEach((tableName) => {
                            const tableAccessId = `${moduleAny.config.id}.${attr}.${tableName}`;
                            if (!apiAccess.getById(tableAccessId)) {
                                data.push({
                                    id: tableAccessId,
                                    audit: [GenericDB_1.DataActions.SetData, GenericDB_1.DataActions.RemoveData].includes(attr),
                                });
                            }
                        });
                    }
                });
            });
            membershipDP.dbModule.save('api_access', data, (err, apiAccesses) => {
                if (err) {
                    logger_1.logger.error('Failed to save api_access data', {
                        module: 'ApiAccessBootstrap',
                        error: err,
                    });
                    throw new Error(err);
                }
                const apiRoleAccesses = membershipDP.dbModule.evH
                    .get('api_access_app_role')
                    .getData();
                if (tessio_1.lodash.isEmpty(apiRoleAccesses)) {
                    this.saveAllRolesAccesses(apiAccesses, membershipDP);
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`API access bootstrap failed: ${error}`, {
                module: 'ApiAccessBootstrap',
            });
        }
        finally {
            this.initialized = true;
        }
    }
    async loadConfiguredModules() {
        const result = [];
        for (const moduleConfig of this.config.modules) {
            if (!moduleConfig?.id) {
                continue;
            }
            try {
                const moduleInstance = await this.subscriptionManager.resolveModule(moduleConfig.id);
                if (moduleInstance) {
                    result.push(moduleInstance);
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to load module '${moduleConfig.id}' during bootstrap: ${error}`, {
                    module: 'ApiAccessBootstrap',
                });
            }
        }
        return result;
    }
    saveAllRolesAccesses(apiAccesses, membershipDP) {
        let accesses = [];
        const rolesDataCopy = JSON.parse(JSON.stringify(systemTablesAccesses_json_1.default));
        roles_json_1.default.forEach((role) => {
            if (role.roleName === 'superadmin' && role.id === 1) {
                const items = apiAccesses.map(i => ({
                    api_access_id: i.id,
                    app_role_id: role.id,
                }));
                accesses = [...accesses, ...items];
            }
            else {
                if (!role.api_accesses) {
                    return;
                }
                role.api_accesses = [...rolesDataCopy, ...role.api_accesses];
                const roleAccesses = role.api_accesses.reduce((acc, apiAccess) => {
                    const items = apiAccess.methods.map(method => ({
                        api_access_id: `${apiAccess.module}.${method}.${apiAccess.name}`,
                        app_role_id: role.id,
                    }));
                    acc = [...acc, ...items];
                    return acc;
                }, []);
                accesses = [...accesses, ...roleAccesses];
            }
        });
        membershipDP.dbModule.save('api_access_app_role', accesses, (err) => {
            if (err) {
                throw new Error(err);
            }
        });
    }
}
exports.ApiAccessBootstrap = ApiAccessBootstrap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpQWNjZXNzQm9vdHN0cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jvb3RzdHJhcC9hcGlBY2Nlc3NCb290c3RyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLG1DQUFvQztBQUVwQyxnRkFBMEM7QUFDMUMsOEdBQXdFO0FBRXhFLG9EQUFrRDtBQUVsRCw0Q0FBd0M7QUFFeEMsTUFBYSxrQkFBa0I7SUFJbkI7SUFDQTtJQUpGLFdBQVcsR0FBRyxLQUFLLENBQUE7SUFFM0IsWUFDVSxNQUFXLEVBQ1gsbUJBQXdDO1FBRHhDLFdBQU0sR0FBTixNQUFNLENBQUs7UUFDWCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO0lBQy9DLENBQUM7SUFFRyxLQUFLLENBQUMsVUFBVTtRQUNyQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyQixPQUFNO1FBQ1IsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlCQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDM0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7WUFDdkIsT0FBTTtRQUNSLENBQUM7UUFFRCxJQUFJLENBQUM7WUFDSCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFRLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FDcEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FDOUIsQ0FBQTtZQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNqRCxlQUFNLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxFQUFFO29CQUN6RSxNQUFNLEVBQUUsb0JBQW9CO2lCQUM3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