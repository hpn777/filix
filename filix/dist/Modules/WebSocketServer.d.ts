import { BaseModule } from './base';
import { SubscriptionManager } from '../subscriptionManager';
export declare class Module extends BaseModule {
    moduleName: string;
    constructor(config: any, subscriptionManager: SubscriptionManager);
    init(): Promise<BaseModule>;
    private createServer;
    private setupWebSocketServer;
    private handleMessage;
    private handleSocketError;
}
