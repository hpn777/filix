import { Cluster } from 'tessio';
import type { DBModels } from './sqlModelGenerator';
interface SqlEVOptions {
    DBModels?: DBModels;
    tessio?: {
        redis?: any;
    };
    autofetch?: boolean;
    namespace?: string;
}
export declare class SqlEV extends Cluster {
    DBModels: DBModels;
    private readyPromise;
    private resolveReady;
    private _isReady;
    constructor(options?: SqlEVOptions);
    whenReady(): Promise<void>;
    isReady(): boolean;
    private markAsReady;
    initializeEV(options: SqlEVOptions): Promise<void>;
}
export {};
