export interface LdapClientConfig {
    url: string;
    baseDN: string;
    username: string;
    password: string;
    group?: string;
}
export interface SearchOptions {
    filter: string;
    scope: string;
    attributes?: string[];
    sizeLimit?: number;
    timeLimit?: number;
}
export interface LdapEntry {
    dn?: string;
    [key: string]: any;
}
export type LdapCallback<T> = (err: LdapError | null, result?: T) => void;
export type AuthCallback = (err: LdapError | null, authenticated: boolean) => void;
export interface LdapError {
    code?: number;
    errno?: string;
    description?: string;
    message?: string;
}
export interface RangeSpecifier {
    attributeName: string;
    low: number;
    high: number | null;
}
