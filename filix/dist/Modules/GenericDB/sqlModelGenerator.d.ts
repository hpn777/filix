import type { QueryResult } from 'pg';
import type { ConnectionConfig as OrmConnectionConfig, ConnectionOptions as OrmConnectionOptions, DriverResult, FindOptions as OrmFindOptions, Model as OrmModel, Property as OrmProperty, QueryConditions } from 'orm3/dist/types/Core';
declare const pgListen: any;
type SupportedProtocol = 'mysql' | 'pg' | 'sqlite3';
type ConnectionConfig = Omit<OrmConnectionConfig, 'protocol'> & {
    protocol: SupportedProtocol;
    schema: string;
    notify_retry_timeout?: number;
    query?: OrmConnectionOptions['query'];
};
type SortDirection = NonNullable<OrmFindOptions['order']>[number][1];
type QueryConditionValue = QueryConditions[string];
interface FilterItem {
    field: string;
    comparison: 'in' | 'neq' | 'like' | 'notlike' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    value: QueryConditionValue;
}
interface SortItem {
    field: string;
    direction: SortDirection;
}
interface MergeOptions {
    id: string;
    ref_id: string;
    table_name: string;
    where?: QueryConditions;
}
interface SessionQueryParams {
    tableName: string;
    select?: string[];
    where?: FilterItem[] | QueryConditions;
    filter?: FilterItem[] | QueryConditions;
    sort?: SortItem[];
    merge?: MergeOptions;
    limit?: OrmFindOptions['limit'];
    start?: OrmFindOptions['offset'];
}
interface SessionQueryResult {
    data: DriverResult[];
    totalCount: number;
}
type AttributeType = {
    type: 'number';
    key?: boolean;
} | {
    type: 'date';
    time: boolean;
    key?: boolean;
} | {
    type: 'boolean';
    key?: boolean;
} | {
    type: 'text';
    key?: boolean;
};
type SessionQueryFunction = (parameters: SessionQueryParams) => Promise<SessionQueryResult>;
export type Orm3Model = OrmModel & {
    count(filter: Record<string, unknown>): Promise<number>;
    sessionQuery?: SessionQueryFunction;
    getAllAsync?: (tableName: string) => Promise<QueryResult<Record<string, unknown>>>;
};
export declare class DBModels {
    private readyPromise;
    private resolveReady;
    private _isReady;
    private connectionConfig;
    private db;
    private driver;
    private reconnectTimer?;
    private models;
    pgSubscriber?: ReturnType<typeof pgListen>;
    constructor(options?: {
        config?: ConnectionConfig;
    });
    whenReady(): Promise<void>;
    isReady(): boolean;
    private markAsReady;
    private registerOrmModel;
    private getQualifiedTableName;
    getTableNames(): string[];
    getColumns(tableName: string): OrmProperty[];
    getPrimaryKeyColumn(tableName: string): string;
    getReferencingColumns(targetTableName: string): Array<{
        tableName: string;
        column: OrmProperty & {
            referencedTableName?: string;
            referencedColumnName?: string;
        };
    }>;
    private getModel;
    initialize(): Promise<void>;
    private connectWithRetry;
    private scheduleReconnect;
    cleanup(): Promise<void>;
    createModels(connectionConfig: ConnectionConfig): Promise<void>;
    sessionQuery(parameters: SessionQueryParams): Promise<SessionQueryResult>;
    execQuery<T = unknown>(query: string): Promise<T>;
    getAll(tableName: string): Promise<QueryResult<Record<string, unknown>>>;
    getAllAsync(tableName: string): Promise<QueryResult<Record<string, unknown>>>;
    getAttributeType(dbType: string): AttributeType;
}
export {};
