type TailLogConfig = {
    path: string;
    encoding?: string;
    suppress?: string[];
    separator?: string;
};
export declare const tailLogConnector: (config: TailLogConfig) => any;
export {};
