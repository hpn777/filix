import { Subscription } from 'Model/subscriptions';
import { BaseModule } from '../base';
export declare class Module extends BaseModule {
    init(): Promise<BaseModule>;
    GetStatus(request: any, subscription: Subscription): void;
    getStatus(): {
        hostName: string;
        processUptime: string;
        memoryUsage: NodeJS.MemoryUsage;
        modules: any[];
    };
    private formatUptime;
    private getHostname;
    private getModulesList;
    reset(): void;
    resendStatus(): void;
}
