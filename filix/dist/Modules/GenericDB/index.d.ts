import { BaseModule, ModuleEndpoint } from '../base';
import { SqlEV } from './sqlEV';
import { DBModels } from './sqlModelGenerator';
import { GenericDBRequest } from './types';
import { CreateModule } from './mixins/createModule';
import { GetData } from './mixins/GetData';
import { GetColumnsDefinition } from './mixins/getColumnsDefinition';
import { SetData } from './mixins/setData';
import { RemoveData } from './mixins/removeData';
import { CallFunction } from './mixins/callFunction';
export declare const getAPIKey: (request: any) => string;
export declare enum DataActions {
    GetData = "GetData",
    SetData = "SetData",
    RemoveData = "RemoveData"
}
declare class Module extends BaseModule {
    evH: SqlEV;
    DBModels: DBModels;
    publicMethods: Map<string, ModuleEndpoint>;
    init(): Promise<BaseModule>;
    getApiAccess(request: GenericDBRequest): Array<{
        api_access_id: string;
        app_role_id: number;
    }>;
    validateRequest(request: GenericDBRequest, subscription: any): boolean;
    runDBQuery(sessionQuery: any): Promise<any[]>;
}
interface Module extends CreateModule, GetData, GetColumnsDefinition, SetData, CallFunction, RemoveData {
}
export { Module };
