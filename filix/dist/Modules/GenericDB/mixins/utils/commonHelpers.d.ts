import { Subscription } from '../../../../Model/subscriptions';
import { Module as GenericDB } from '../../index';
import { Tesseract } from '../../../../types/tessio';
export declare class CommonHelpers {
    static validateRequestAccess(module: GenericDB, request: any, subscription: Subscription): Promise<boolean>;
    static getTesseract(evH: any, tableName: string, subscription: Subscription): Tesseract | null;
    static validateTableName(tableName: string | undefined, subscription: Subscription, errorMessage?: string): boolean;
    static publishSuccess(subscription: Subscription, requestId: string, data?: any): void;
    static publishError(subscription: Subscription, message: string, code?: string): void;
}
