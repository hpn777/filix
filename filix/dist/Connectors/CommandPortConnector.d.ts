import * as net from 'net';
import { Observable } from 'rxjs';
interface ConnectionOptions {
    port: number;
    host: string;
}
interface Connection extends net.Socket {
    send: (message: string) => void;
    connect$: Observable<boolean>;
    error$: Observable<Error>;
    data$: Observable<string>;
}
declare const CommandPortConnector: (config: ConnectionOptions) => Promise<Connection>;
export default CommandPortConnector;
