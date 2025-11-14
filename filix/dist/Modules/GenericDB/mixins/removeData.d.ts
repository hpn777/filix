import { Subscription } from 'Model/subscriptions';
import { Module as GenericDB } from '../index';
export declare class RemoveData {
    cascadeRemove(this: GenericDB, tableName: string, rowIds: number[] | number | string | string[]): Promise<{
        err: any;
        result: any;
    }>;
    RemoveData(this: GenericDB, request: any, subscription: Subscription): Promise<void>;
    checkRemovePermissions(this: GenericDB, tesseract: any, userId: number, subscription: Subscription): boolean;
    handleViewRemoval(this: GenericDB, tableName: string, rowIds: number[] | string[], request: any, subscription: Subscription): Promise<{
        err: any;
        result: any;
    }>;
    executeViewDelete(this: GenericDB, tableName: string, id: number | string, result: {
        success: boolean;
        partialResults: any[];
    }): Promise<void>;
    publishRemovalResult(this: GenericDB, result: {
        err: null;
        result: any;
    }, subscription: Subscription, requestId: string): void;
    RemoveProxy(this: GenericDB, request: any, subscribtion: Subscription): Promise<void>;
    remove(this: GenericDB, tableName: string, rowIds: number[] | string[]): Promise<{
        err: null;
        result: any;
    } | undefined>;
    removeRecord(this: GenericDB, rowId: number | string, ormModel: any, tesseract: any, preRemoveItems: any[]): Promise<any>;
    softDeleteRecord(this: GenericDB, record: any): Promise<any>;
    hardDeleteRecord(this: GenericDB, record: any, rowId: number | string): Promise<number | string>;
    updateTesseractAfterRemoval(this: GenericDB, tesseract: any, preRemoveItems: any[], result: any[]): void;
    whatToDel(this: GenericDB, tableName: string, rowIds: number[] | string[] | (number | string)[]): Promise<any[]>;
}
