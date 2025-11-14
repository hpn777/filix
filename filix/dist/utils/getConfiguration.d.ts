import { AppServiceConfig } from '../../typings/config';
export type GetConfigurationArgs = {
    configurationFilePath?: string;
    moduleName?: string;
};
export declare const getConfiguration: ({ configurationFilePath, moduleName, }?: Partial<GetConfigurationArgs>) => AppServiceConfig | null | void;
