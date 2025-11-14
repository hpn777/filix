import { EventHorizon } from 'tessio';
import { SubscriptionManager } from '../subscriptionManager';
import { Subscription } from '../Model/subscriptions';
export interface ModuleConfig {
    id: string;
    moduleId?: string;
    module_path?: string;
    module_class?: new (config: ModuleConfig, subscriptionManager: SubscriptionManager) => GenericBaseModule;
    name?: string;
    [key: string]: unknown;
}
export type ModuleEndpoint = (request: any, subscription: Subscription) => void | Promise<void>;
export interface IBaseModule {
    publicMethods: Map<string, ModuleEndpoint>;
    init(): Promise<BaseModule>;
    GetPublicMethods(request: any, subscription: Subscription): void;
}
export declare abstract class BaseModule implements IBaseModule {
    config: ModuleConfig;
    subscriptionManager: SubscriptionManager;
    publicMethods: Map<string, ModuleEndpoint>;
    abstract init(): Promise<BaseModule>;
    constructor(config: ModuleConfig, subscriptionManager: SubscriptionManager);
    GetPublicMethods(request: any, subscription: Subscription): void;
}
export declare class GenericBaseModule extends BaseModule {
    config: ModuleConfig;
    subscriptionManager: SubscriptionManager;
    evH: EventHorizon;
    constructor(config: ModuleConfig, subscriptionManager: SubscriptionManager);
    init(): Promise<GenericBaseModule>;
}
export type ModuleConstructor<T extends GenericBaseModule = GenericBaseModule> = new (config: ModuleConfig, subscriptionManager: SubscriptionManager) => T;
