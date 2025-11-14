import { Subscription } from 'Model/subscriptions';
import { Module as GenericDB } from '../index';
export declare class SetData {
    SetData(this: GenericDB, request: any, subscription: Subscription): Promise<void>;
    validateSetDataRequest(this: GenericDB, query: any, tableName: string, subscription: Subscription): boolean;
    validateRecordOwnership(this: GenericDB, record: any, tesseract: any, userId: number, subscription: Subscription): boolean;
    validateExistingRecordOwnership(this: GenericDB, existingRecord: any, isSystemAdmin: boolean, subscription: Subscription): boolean;
    handleNewRecordOwnership(this: GenericDB, record: any): boolean;
    save(this: GenericDB, modelName: string, data: any): Promise<any[]>;
    getPrimaryKey(this: GenericDB, modelName: string): string;
    saveRecords(this: GenericDB, dataArray: any[], ormModel: any, tesseract: any, primaryKey: string): Promise<any[]>;
    saveRecord(this: GenericDB, item: any, ormModel: any, tesseract: any, primaryKey: string): Promise<any>;
    updateExistingRecord(this: GenericDB, item: any, ormModel: any, primaryKey: string): Promise<any>;
    createNewRecord(this: GenericDB, item: any, ormModel: any): Promise<any>;
}
