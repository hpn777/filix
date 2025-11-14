export interface WebSocketOptions {
    debug?: boolean;
    reconnectInterval?: number;
    timeoutInterval?: number;
    url?: string;
    protocols?: string[];
    onopen?: (event: any) => void;
    onclose?: (event: any) => void;
    onmessage?: (event: any) => void;
    onerror?: (event: any) => void;
}
export declare class WebSocket {
    debug: boolean;
    reconnectInterval: number;
    timeoutInterval: number;
    url?: string;
    protocols: string[];
    onopen: (event: any) => void;
    onclose: (event: any) => void;
    onmessage: (event: any) => void;
    onerror: (event: any) => void;
    private ws?;
    private forcedClose;
    private timedOut;
    constructor(options: WebSocketOptions);
    private connect;
    send(data: string): void;
    close(): void;
    refresh(): void;
}
