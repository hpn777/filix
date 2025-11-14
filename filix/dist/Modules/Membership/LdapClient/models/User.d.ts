export interface UserProperties {
    dn?: string;
    sn?: string;
    cn?: string;
    gidNumber?: number;
    uid?: string;
    displayName?: string;
    mail?: string;
    groups?: Array<{
        cn?: string;
        [key: string]: any;
    }>;
    [key: string]: any;
}
export declare class User implements UserProperties {
    dn?: string;
    sn?: string;
    cn?: string;
    gidNumber?: number;
    uid?: string;
    displayName?: string;
    mail?: string;
    groups?: Array<{
        cn?: string;
        [key: string]: any;
    }>;
    [key: string]: any;
    constructor(properties?: UserProperties);
    isMemberOf(group: string): boolean;
}
export default User;
