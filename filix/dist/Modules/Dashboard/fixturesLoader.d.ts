export interface DashboardFixtures {
    path: string;
    controlPresets: any[];
    tabPresets: any[];
    uiModules: Record<string, any>;
}
export declare const loadDashboardFixtures: (moduleName: string, configuredPath?: string) => DashboardFixtures;
