import { Subscription } from '../../../Model/subscriptions';
import { Module as GenericDB } from '../index';
export declare class CallFunction {
    CallFunction(this: GenericDB, request: any, subscription: Subscription): void;
    buildFunctionQuery(this: GenericDB, functionName: string, functionParameter: string): string;
    executeFunctionQuery(this: GenericDB, query: string, functionName: string, subscription: Subscription, requestId: string): Promise<void>;
}
