import { Tesseract } from 'tessio';
import { Subscription } from '../Model/subscriptions';
import { BaseModule, ModuleEndpoint } from './base';
import { BaseModuleRequest, DataRequestParameters } from './types';
type Request = BaseModuleRequest<DataRequestParameters & {
    command: string;
}>;
export declare class Module extends BaseModule {
    tesseract: Tesseract;
    moduleName: string;
    publicMethods: Map<string, ModuleEndpoint>;
    init(): Promise<BaseModule>;
    private createColumnHeaders;
    private setupLogTail;
    GetColumnsDefinition(request: Request, subscription: Subscription): void;
    GetData(request: Request, subscription: Subscription): void;
    private getOrCreateSession;
    private attachSessionListeners;
    private handleDataUpdate;
    private handleDataRemoved;
    private publishPagedUpdate;
    private cleanupSession;
    private prepareResponseData;
}
export {};
