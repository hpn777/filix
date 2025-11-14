import { Module as ServerMenager } from './';
export declare class TcpCommandPort {
    config: Record<string, any>;
    serverManager: ServerMenager;
    HOST: any;
    moduleName: string;
    constructor(config: Record<string, any>, serverManager: ServerMenager);
    processRequest(message: string, callbackFn: (err: Error | null, response: string) => void): void;
    private processCommand;
    private handleStatusCommand;
    private handleHelpCommand;
    private handleRestartCommand;
}
