export interface ADServerConfig {
    url: string;
    baseDN: string;
    lookupDN?: string;
    lookupUsername: string;
    lookupPassword: string;
    adGroup?: string;
}
export interface LDAPConfig {
    servers: ADServerConfig[];
    usernameKey: string;
    adGroup?: string;
}
export interface ADUser {
    id?: string;
    dn?: string;
    cn?: string;
    sn?: string;
    uid?: string;
    gidNumber?: string;
    displayName?: string;
    mail?: string;
    userName?: string;
    [key: string]: any;
}
export interface ADGroup {
    id: string;
    dn?: string;
    cn?: string;
    gidNumber?: string;
    member?: string[];
    [key: string]: any;
}
export interface ADError {
    category?: string;
    message: string;
    name?: string;
    code?: number;
    errno?: string;
    description?: string;
}
export type ADCallback<T> = (err: ADError | null, result?: T) => void;
export interface AuthResult {
    authenticated: boolean;
    user?: ADUser;
}
export interface IdentityProvider {
    login(userName: string, password: string, callback: ADCallback<boolean>): void;
    getUser(userName: string, callback: ADCallback<ADUser>): void;
    getAllUsers(callback: ADCallback<ADUser[]>): void;
}
