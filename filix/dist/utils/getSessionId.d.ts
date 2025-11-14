import { getConfiguration } from './index';
export type GetSessionIdArgs = {
    moduleName?: string;
    getConfiguration?: typeof getConfiguration;
};
export declare const getSessionId: ({ moduleName, getConfiguration, }?: Partial<GetSessionIdArgs>) => number | null;
