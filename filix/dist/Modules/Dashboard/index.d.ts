import { Cluster } from 'tessio';
import { Subscription } from 'Model/subscriptions';
import { BaseModule, ModuleEndpoint } from '../base';
import { BaseModuleRequest } from '../types';
import { Module as GenericDBModule } from '../GenericDB';
import { Module as MembershipModule } from '../Membership';
interface DashboardRequestParameters {
    tabId?: string;
    tab?: {
        id: string;
        name: string;
        description: string;
        tabId: string;
    };
    control?: {
        id: string;
    };
    controls?: Array<{
        id: string;
        name: string;
        description: string;
        type: string;
        options: Array<{
            value: string;
            label: string;
        }>;
    }>;
    tabs?: Array<any>;
    userConfig?: any;
    oldPassword?: string;
    newPassword?: string;
    tabPreset?: {
        id: string;
    };
}
type Request = BaseModuleRequest<DashboardRequestParameters> & {
    control?: {
        id: string;
    };
};
export declare class Module extends BaseModule {
    evH: Cluster;
    dbModule: GenericDBModule;
    membershipProvider: MembershipModule;
    moduleName: string;
    private fixtures;
    publicMethods: Map<string, ModuleEndpoint>;
    init(): Promise<BaseModule>;
    Ready(_request: Request, subscription: Subscription): void;
    GetDashboardTabs(request: Request, subscription: Subscription): void;
    GetDashboardControls(request: Request, subscription: Subscription): void;
    GetDashboardModulesVersions(request: Request, subscription: Subscription): void;
    GetDashboardModules(request: Request, subscription: Subscription): void;
    SaveTabOrderAndSelection(request: Request, subscription: Subscription): Promise<void>;
    SaveDashboardTab(request: Request, subscription: Subscription): Promise<void>;
    RemoveDashboardTab(request: Request, subscription: Subscription): Promise<void>;
    RemoveTabPreset(request: Request, subscription: Subscription): Promise<void>;
    SaveControl(request: Request, subscription: Subscription): Promise<void>;
    RemoveControl(request: Request, subscription: Subscription): Promise<void>;
    GetTabPresets(request: Request, subscription: Subscription): void;
    SaveTabPreset(request: Request, subscription: Subscription): Promise<void>;
    GetAllUsers(request: Request, subscription: Subscription): void;
    GetUserConfig(request: Request, subscription: Subscription): void;
    SaveUserConfig(request: Request, subscription: Subscription): Promise<void>;
    UpdatePassword(request: Request, subscription: Subscription): Promise<void>;
    reloadVersionsFromCodebase(codebaseUiModules: any): Promise<void>;
    appendMissingVersions(codebaseUiModules: any): Promise<void>;
    appendMissingPresets(): Promise<void>;
    createModuleVersion(module: any, version: any): {
        id: any;
        version: any;
        config: any;
        moduleId: any;
        public: any;
    };
}
export {};
