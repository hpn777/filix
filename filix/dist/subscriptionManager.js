"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
const awilix_1 = require("awilix");
const tessio_1 = require("tessio");
const subscriptions_1 = require("./Model/subscriptions");
const logger_1 = require("./utils/logger");
class SubscriptionManager {
    config;
    container;
    subscriptions = new subscriptions_1.Subscriptions();
    connections = [];
    modules = [];
    moduleName = 'SubscriptionManager';
    moduleConfigs = new Map();
    modulePromises = new Map();
    constructor(config, container) {
        this.config = config;
        this.container = container;
        logger_1.logger.info('Module initialized', {
            module: this.moduleName,
        });
        if (!config) {
            logger_1.logger.error('App Service config is missing or invalid.', {
                module: this.moduleName,
            });
            return;
        }
        if (Array.isArray(config.modules)) {
            config.modules.forEach(moduleConfig => {
                if (!moduleConfig?.id) {
                    return;
                }
                this.moduleConfigs.set(moduleConfig.id, moduleConfig);
                this.registerModuleFactory(moduleConfig.id);
            });
        }
    }
    async Subscribe(request) {
        if (this.config.membership_module) {
            const membershipModule = this.getDefaultMembershipModule();
            try {
                const response = membershipModule.authenticate(request.userId, request.authToken);
                if (response) {
                    let subscription = this.subscriptions.set({
                        id: request.subscriptionId,
                        requestId: request.requestId,
                        clientId: request.clientId,
                        containerId: request.containerId,
                        moduleId: request.moduleId || request.dataProviderId,
                        connectionType: request.connectionType,
                        userId: request.userId,
                        authToken: request.authToken,
                    }, { remove: false });
                    subscription.publish = this.createPublish(request.clientId, subscription);
                    subscription.publishError = this.createPublishError(request.clientId, subscription);
                    this.Execute(request);
                }
                else {
                    this.PublishError(request, {
                        message: 'Unauthorized access',
                        code: -32401,
                    });
                }
            }
            catch (err) {
                this.PublishError(request, {
                    message: 'Unauthorized access',
                    code: -32401,
                });
            }
        }
    }
    Unsubscribe(request) {
        this.clearSubscription(request.subscriptionId);
    }
    clearSubscription(subscriptionId) {
        this.subscriptions.get(subscriptionId)?.remove();
    }
    UnsubscribeContainer(request) {
        const { containerId } = request;
        const subscriptions = this.subscriptions.filter((model) => model.get('containerId') === containerId);
        tessio_1.lodash.each(subscriptions, subscription => {
            this.clearSubscription(subscription.id);
        });
    }
    UnsubscribeClient(clientId) {
        this.subscriptions
            .filter((model) => model.get('clientId') === clientId)
            .forEach(subscription => {
            subscription.remove();
        });
        delete this.connections[clientId];
    }
    Login(request) {
        const req = request;
        const membership = this.getDefaultMembershipModule();
        membership
            .login(request.parameters.userName, request.parameters.password)
            .then(response => {
            this.Publish(req.clientId, {
                requestId: req.requestId,
                containerId: req.containerId,
                subscriptionId: req.subscriptionId,
                authToken: response.authToken,
                data: {
                    user: response,
                },
                request: 'Login',
                success: true,
            });
        })
            .catch(err => {
            this.PublishError(req, {
                message: err.message,
                code: -32401,
            });
        });
    }
    Execute(request) {
        const subscription = this.subscriptions.get(request.subscriptionId);
        if (!subscription) {
            return;
        }
        if (request.authToken !== subscription.authToken) {
            subscription.publishError({
                message: 'Unauthorized access',
                code: -32401,
            });
            return;
        }
        if (this.config.membership_module) {
            const moduleId = request.moduleId || request.dataProviderId;
            const membershipDP = this.getDefaultMembershipModule();
            if (!membershipDP) {
                const errorMesage = `Error to execute ${request.parameters.command} in ${moduleId}: Membership module not loaded.`;
                logger_1.logger.error(errorMesage, { module: this.moduleName });
                subscription.publishError({ message: errorMesage });
                return;
            }
            try {
                if (!request.parameters || !request.parameters.command) {
                    return;
                }
                const apiKey = `${moduleId}.${request.parameters.command}.${request.parameters.tableName}`;
                const apiAccessInstance = membershipDP.evH
                    .get('api_access')
                    .getById(apiKey);
                if (membershipDP.resolveACL(subscription.userId, apiKey)) {
                    if (apiAccessInstance && apiAccessInstance.audit) {
                        membershipDP.logApiAccess({
                            request: JSON.stringify(request.parameters),
                            api_access_id: apiKey,
                            user_id: subscription.userId,
                            timestamp: new Date(),
                        });
                    }
                    const module = this.modules[subscription.moduleId];
                    if (!module) {
                        subscription.publishError({
                            message: `Module not supported: ${subscription.moduleId}`,
                        });
                    }
                    const method = module?.publicMethods.get(request.parameters.command);
                    if (method) {
                        method.bind(module, request, subscription)();
                    }
                    else {
                        subscription.publishError({
                            message: `Command not supported: ${request.parameters.command}`,
                        });
                    }
                }
                else {
                    subscription.publishError({
                        message: `Insufficient access rights to call: ${apiKey}`,
                    });
                }
            }
            catch (error) {
                logger_1.logger.error(`Error to execute ${request.parameters.command} in ${moduleId}: ${error}`, { module: this.moduleName });
                subscription.publishError({
                    message: `Command: ${request.parameters.command} error: ${error}`,
                });
            }
        }
        else {
            try {
                if (request.parameters && request.parameters.command) {
                    const module = this.modules[subscription.moduleId];
                    module[request.parameters.command](request, subscription);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error to execute ${request.parameters.command} in ${request.moduleId}: ${error}`, { module: this.moduleName });
                subscription.publishError({
                    message: `Command: ${request.parameters.command} error: ${error}`,
                });
            }
        }
    }
    createPublish(clientId, subscription) {
        const connection = this.connections[clientId];
        return function (responseData, requestId = subscription.requestId) {
            const response = {
                requestId: requestId,
                containerId: subscription.containerId,
                subscriptionId: subscription.id,
                authToken: subscription.authToken,
                data: responseData,
                success: true,
            };
            const message = JSON.stringify(response, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
            try {
                connection?.send(message);
            }
            catch { }
        };
    }
    createPublishError(clientId, subscription) {
        const connection = this.connections[clientId];
        return function (err, requestId = subscription.requestId) {
            const response = {
                error: err,
                requestId: requestId,
                containerId: subscription.containerId,
                subscriptionId: subscription.id,
                success: false,
            };
            const message = JSON.stringify(response);
            try {
                connection?.send(message);
            }
            catch { }
        };
    }
    Publish(clientId, response) {
        const message = JSON.stringify(response, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
        const connection = this.connections[clientId];
        try {
            connection?.send(message);
        }
        catch { }
    }
    PublishError(request, response) {
        const connection = this.connections[request.clientId];
        const errorResponse = {
            error: response,
            requestId: request.requestId,
            containerId: request.containerId,
            subscriptionId: request.subscriptionId,
            success: false,
        };
        const errorMessage = JSON.stringify(errorResponse);
        try {
            connection?.send(errorMessage);
        }
        catch { }
    }
    getModuleToken(moduleId) {
        return `module:${moduleId}`;
    }
    registerModuleFactory(moduleId) {
        const token = this.getModuleToken(moduleId);
        if (!this.container.hasRegistration(token)) {
            this.container.register({
                [token]: (0, awilix_1.asFunction)(() => this.getModule(moduleId)).singleton(),
            });
        }
    }
    registerModuleInstance(moduleId, instance) {
        const token = this.getModuleToken(moduleId);
        this.container.register({
            [token]: (0, awilix_1.asValue)(instance),
        });
    }
    async getModule(moduleId) {
        if (!this.modulePromises.has(moduleId)) {
            const loader = this.loadModule(moduleId);
            this.modulePromises.set(moduleId, loader);
        }
        try {
            const moduleInstance = await this.modulePromises.get(moduleId);
            return moduleInstance;
        }
        catch (error) {
            this.modulePromises.delete(moduleId);
            throw error;
        }
    }
    async loadModule(moduleId) {
        const existing = this.modules[moduleId];
        if (existing) {
            return existing;
        }
        const moduleConfig = this.moduleConfigs.get(moduleId);
        if (!moduleConfig) {
            logger_1.logger.error(`Data Provider Exception: Config for Data Provider ${moduleId} has not been found.`, { module: this.moduleName });
            throw new Error(`Module config missing for ${moduleId}`);
        }
        try {
            let ModuleCtor = moduleConfig.module_class;
            if (!ModuleCtor && moduleConfig.module_path) {
                const importedModule = await Promise.resolve(`${moduleConfig.module_path}`).then(s => __importStar(require(s)));
                ModuleCtor =
                    importedModule.Module ??
                        importedModule.default ??
                        undefined;
            }
            if (!ModuleCtor) {
                throw new Error(`Module '${moduleId}' does not provide module_class or module_path`);
            }
            const moduleInstance = new ModuleCtor(moduleConfig, this);
            moduleConfig.module_class = ModuleCtor;
            this.modules[moduleConfig.id] = moduleInstance;
            await moduleInstance.init();
            this.registerModuleInstance(moduleConfig.id, moduleInstance);
            return moduleInstance;
        }
        catch (error) {
            logger_1.logger.error(`Data Provider ${moduleId} Exception: ${error}`, {
                module: this.moduleName,
            });
            throw error;
        }
    }
    async resolveModule(moduleId) {
        const token = this.getModuleToken(moduleId);
        if (this.container.hasRegistration(token)) {
            const resolved = this.container.resolve(token);
            return resolved instanceof Promise ? await resolved : resolved;
        }
        return (await this.getModule(moduleId));
    }
    getDefaultMembershipModule() {
        return this.modules[this.config.membership_module];
    }
}
exports.SubscriptionManager = SubscriptionManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NyaXB0aW9uTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zdWJzY3JpcHRpb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUE2RDtBQUU3RCxtQ0FBb0M7QUFFcEMseURBQW1FO0FBQ25FLDJDQUF1QztBQUV2QyxNQUFNLG1CQUFtQjtJQVFJO0lBQXFCO0lBUGhELGFBQWEsR0FBRyxJQUFJLDZCQUFhLEVBQUUsQ0FBQTtJQUNuQyxXQUFXLEdBQVUsRUFBRSxDQUFBO0lBQ3ZCLE9BQU8sR0FBd0IsRUFBRSxDQUFBO0lBQ2pDLFVBQVUsR0FBVyxxQkFBcUIsQ0FBQTtJQUNsQyxhQUFhLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUE7SUFDM0MsY0FBYyxHQUE0QyxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBRTNFLFlBQTJCLE1BQVcsRUFBVSxTQUEwQjtRQUEvQyxXQUFNLEdBQU4sTUFBTSxDQUFLO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBaUI7UUFDeEUsZUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUNoQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ1osZUFBTSxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsRUFBRTtnQkFDeEQsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQ3hCLENBQUMsQ0FBQTtZQUVGLE9BQU07UUFDUixDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN0QixPQUFN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