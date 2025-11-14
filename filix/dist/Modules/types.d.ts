import { Subscription } from '../Model/subscriptions';
import type { ColumnDef as TessioColumnDef } from 'tessio/dist/types';
export interface BaseModuleRequest<T = any> {
    requestId: string;
    subscription?: Subscription;
    parameters: T;
}
export type ColumnDef = TessioColumnDef;
export interface DataResponse {
    data?: any[];
    header?: ColumnDef[];
    type?: 'reset' | 'update' | 'remove';
    total?: number;
    page?: number;
    reload?: boolean;
    success?: boolean;
    error?: any;
}
export interface DataRequestParameters {
    command?: string;
    rpc?: boolean;
    page?: number;
    reload?: boolean;
    requestId?: string;
    filter?: any[];
    sort?: any[];
}
