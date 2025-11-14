import { Subscription } from '../../Model/subscriptions';
import { Cluster, Tesseract } from 'tessio';
import { Session } from 'tessio/dist/lib/session';
import { CreateSessionParameters } from 'tessio/dist/types';
interface HostConfig {
    hostName?: string;
    interface?: string;
    host?: string;
}
interface SubscriptionManager {
    resolveModule<T = any>(moduleName: string): Promise<T>;
}
export declare class ModuleHelpers {
    static getTesseract(evH: Cluster, tableName: string, subscription: Subscription, errorMessage?: string): Tesseract | null;
    static publishSuccess(subscription: Subscription, requestId: string, data?: unknown): void;
    static setupSession(tesseract: Tesseract, config: CreateSessionParameters, subscription: Subscription, request: {
        requestId: string;
    }): Session;
    static getHostAddress(config: HostConfig): string;
    static splitMessage(message: string): string[];
    static getModule<T = any>(subscriptionManager: SubscriptionManager, moduleName: string): Promise<T>;
}
export {};
