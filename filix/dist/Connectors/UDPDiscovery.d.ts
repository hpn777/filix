import * as dgram from 'dgram';
import { Observable } from 'rxjs';
type UdpConfig = {
    udpPort: number;
    multicastPort: number;
    multicastHost: string;
};
type UdpResponse = {
    data: any;
    sender: dgram.RemoteInfo;
    success: boolean;
    error?: any;
};
type SendOptions = {
    timeout?: number;
    nrOfRetries?: number;
    port?: number;
    host?: string;
};
export declare class UdpDiscovery {
    private udpEndPoint;
    all$: Observable<UdpResponse>;
    message$: Observable<UdpResponse>;
    error$: Observable<UdpResponse>;
    private config;
    constructor(config: UdpConfig);
    send(data: any, options?: SendOptions): Observable<UdpResponse>;
    discover(serviceName: string, options?: SendOptions): Observable<UdpResponse>;
}
export {};
