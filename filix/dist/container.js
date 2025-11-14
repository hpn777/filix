"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppContainer = void 0;
const awilix_1 = require("awilix");
const subscriptionManager_1 = require("./subscriptionManager");
const apiAccessBootstrap_1 = require("./bootstrap/apiAccessBootstrap");
const createAppContainer = (config) => {
    const container = (0, awilix_1.createContainer)({
        injectionMode: awilix_1.InjectionMode.CLASSIC,
    });
    container.register({
        container: (0, awilix_1.asValue)(container),
        config: (0, awilix_1.asValue)(config),
        subscriptionManager: (0, awilix_1.asClass)(subscriptionManager_1.SubscriptionManager).singleton(),
        apiAccessBootstrap: (0, awilix_1.asClass)(apiAccessBootstrap_1.ApiAccessBootstrap).singleton(),
    });
    return container;
};
exports.createAppContainer = createAppContainer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBMEY7QUFDMUYsK0RBQTJEO0FBQzNELHVFQUFtRTtBQUk1RCxNQUFNLGtCQUFrQixHQUFHLENBQUMsTUFBVyxFQUFtQixFQUFFO0lBQ2pFLE1BQU0sU0FBUyxHQUFHLElBQUEsd0JBQWUsRUFBQztRQUNoQyxhQUFhLEVBQUUsc0JBQWEsQ0FBQyxPQUFPO0tBQ3JDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDakIsU0FBUyxFQUFFLElBQUEsZ0JBQU8sRUFBQyxTQUFTLENBQUM7UUFDN0IsTUFBTSxFQUFFLElBQUEsZ0JBQU8sRUFBQyxNQUFNLENBQUM7UUFDdkIsbUJBQW1CLEVBQUUsSUFBQSxnQkFBTyxFQUFDLHlDQUFtQixDQUFDLENBQUMsU0FBUyxFQUFFO1FBQzdELGtCQUFrQixFQUFFLElBQUEsZ0JBQU8sRUFBQyx1Q0FBa0IsQ0FBQyxDQUFDLFNBQVMsRUFBRTtLQUM1RCxDQUFDLENBQUE7SUFFRixPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFiWSxRQUFBLGtCQUFrQixzQkFhOUIifQ==