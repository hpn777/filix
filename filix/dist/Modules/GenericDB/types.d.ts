export interface FilterCondition {
    field: string;
    value?: any;
    comparison?: '==' | '!=' | 'in' | 'notin' | '>' | '<' | '>=' | '<=' | 'like' | 'notlike' | '~' | '!~' | 'custom';
}
export interface SortCondition {
    property: string;
    direction: 'ASC' | 'DESC';
}
export interface ColumnDefinition {
    name: string;
    primaryKey?: boolean;
    type?: string;
    title?: string;
    referencedTableName?: string;
    tableName?: string;
    resolve?: {
        underlyingField?: string;
        childrenTable?: string;
        session?: string;
        displayField?: string;
    };
}
export interface SubSessionConfig {
    table: string;
    columns?: ColumnDefinition[];
    filter?: FilterCondition[];
    sort?: SortCondition[];
    subSessions?: Record<string, SubSessionConfig>;
}
export interface SessionConfig {
    table: string;
    columns?: ColumnDefinition[];
    filter?: FilterCondition[];
    permanentFilter?: FilterCondition[];
    sort?: SortCondition[];
    subSessions?: Record<string, SubSessionConfig>;
}
export interface QueryConfig extends SessionConfig {
    id?: string;
}
export interface SessionHeader {
    name: string;
    type?: string;
    title?: string;
    primaryKey?: boolean;
}
export interface TesseractSession {
    getData(): any[];
    getHeader(): SessionHeader[];
    getSimpleHeader(includeAll?: boolean): SessionHeader[];
    destroy(): void;
    on(event: string, callback: Function, context?: any): void;
    off(event?: string, callback?: Function, context?: any): void;
}
export interface RequestParameters {
    command?: string;
    tableName?: string;
    query?: QueryConfig;
    permanentFilter?: FilterCondition[];
    data?: any;
    rowIds?: number[] | string[];
    filter?: FilterCondition[];
    tabId?: string;
    rpc?: boolean;
}
export interface GenericDBRequest {
    requestId: string;
    userId: number;
    dataProviderId: string;
    parameters: RequestParameters;
}
export interface ResponseData {
    addedData?: any[];
    updatedData?: any[];
    removedData?: any[];
    data?: any[];
    header?: SessionHeader[];
    type?: 'reset' | 'update';
    success?: boolean;
    err?: any;
    result?: any;
    total?: number;
    page?: number;
    reload?: boolean;
}
