import { AwilixContainer } from 'awilix';
import { GenericBaseModule, ModuleConfig, ModuleConstructor } from './Modules/base';
import { SubscriptionManager } from './subscriptionManager';
export interface ModuleRegistration<T extends GenericBaseModule = GenericBaseModule> {
    id: string;
    module: ModuleConstructor<T>;
    config?: Partial<ModuleConfig>;
}
export interface StartServiceOptions {
    configPath: string;
    configSection?: string;
    moduleName?: string;
    modules?: ModuleRegistration[];
}
export interface ServiceHandle {
    container: AwilixContainer;
    subscriptionManager: SubscriptionManager;
    stop(): Promise<void>;
}
export declare function startService(options: StartServiceOptions): Promise<ServiceHandle>;
export default startService;
export type { ModuleConfig } from './Modules/base';
export { GenericBaseModule } from './Modules/base';
