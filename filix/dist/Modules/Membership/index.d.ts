import { Subscription } from 'Model/subscriptions';
import { Cluster } from 'tessio';
import { BaseModule, ModuleEndpoint } from '../base';
import { Module as GenericDBModule } from '../GenericDB';
import type { IdentityProvider } from './types';
export declare class Module extends BaseModule {
    defaults(): {
        ready: boolean;
        users: null;
        roles: null;
        apiAccess: null;
        usernameKey: null;
    };
    dbModule: GenericDBModule;
    evH: Cluster;
    identityProvider?: IdentityProvider;
    users: any;
    roles: any;
    apiAccess: any;
    usernameKey: any;
    publicMethods: Map<string, ModuleEndpoint>;
    init(): Promise<BaseModule>;
    GetAllUsers(request: any, subscription: Subscription): void;
    GetUsers(request: any, subscription: Subscription): void;
    GetColumnsDefinition(request: any, subscription: Subscription): void;
    GetAllRoles(request: any, subscription: Subscription): void;
    UpdateUser(request: any, subscription: Subscription): Promise<void>;
    DeactiveUser(request: any, subscription: Subscription): void;
    RemoveUser(request: any, subscription: Subscription): Promise<void>;
    updateUsers(users: any): Promise<any[]>;
    updatePassword(data: any): Promise<boolean>;
    deactiveUser(userId: any): void;
    login(userName: any, password: any): Promise<any>;
    authenticate(userId: any, authToken: any): any;
    resolveACL(userId: any, apiKey: any): boolean;
    populateUsers(config: any, callback: any): void;
    logApiAccess(options: any): void;
}
