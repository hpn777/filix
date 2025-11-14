import { EventEmitter } from 'events';
import Group from './models/Group';
import User from './models/User';
import { LdapClientConfig, SearchOptions, LdapCallback, AuthCallback } from './types';
export declare class LdapClient extends EventEmitter {
    private opts;
    constructor(config: LdapClientConfig);
    private createClient;
    private search;
    private parseRangeAttributes;
    getUsersForGroup(groupName: string, callback: LdapCallback<User[]>): void;
    findGroup(opts: SearchOptions, groupName: string, callback: LdapCallback<Group>): void;
    findUser(opts: SearchOptions, username: string, includeMembership: boolean, callback: LdapCallback<User>): void;
    authenticate(username: string, password: string, callback: AuthCallback): void;
}
export default LdapClient;
