import { Subscription } from '../../../Model/subscriptions';
import { SessionConfig, SessionHeader, ResponseData } from '../types';
import { Module as GenericDB } from '../index';
export declare class GetData {
    GetData(this: GenericDB, request: Subscription, subscription: Subscription): Promise<void>;
    handleMultiTableQuery(this: GenericDB, request: Subscription, subscription: Subscription, query: SessionConfig): Promise<void>;
    loadRemoteTables(this: GenericDB, tableNames: string[]): Promise<void>;
    handleSingleTableQuery(this: GenericDB, request: Subscription, subscription: Subscription, tableName: string, permanentFilter: any): Promise<void>;
    handleRemoteTableQuery(this: GenericDB, request: Subscription, subscription: Subscription, session: any, header: SessionHeader[]): Promise<void>;
    buildRemoteQueryResponse(this: GenericDB, data: any[], header: SessionHeader[], parameters: any, totalLength: number): any;
    setupSessionEventHandlers(this: GenericDB, session: any, subscription: Subscription, request: Subscription): void;
    buildDataUpdatePayload(this: GenericDB, data: any): any;
    getResponseData(request: any, session: any): ResponseData;
    createSession(this: GenericDB, config: SessionConfig): any;
    getTableNames(query: SessionConfig): string[];
}
