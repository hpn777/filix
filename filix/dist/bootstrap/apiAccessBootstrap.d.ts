import { SubscriptionManager } from '../subscriptionManager';
export declare class ApiAccessBootstrap {
    private config;
    private subscriptionManager;
    private initialized;
    constructor(config: any, subscriptionManager: SubscriptionManager);
    initialize(): Promise<void>;
    private loadConfiguredModules;
    private saveAllRolesAccesses;
}
