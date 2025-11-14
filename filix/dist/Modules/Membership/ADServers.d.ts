import { Collection } from '../../Model/collection';
declare class ADServers extends Collection {
    constructor();
    authenticate(username: any, password: any, callback: any): void;
    findUser(opts: any, username: any, includeMembership: any, callback: any): void;
    getUsersForGroup(opts: any, groupName: any, callback: any): void;
    findGroup(opts: any, groupName: any, callback: any): void;
    getActiveServer(): import("tessio/dist/lib/dataModels/backbone").Model | undefined;
    getCallback(method: any, server: any, callback: any): (error: any, response: any) => void;
}
export default ADServers;
