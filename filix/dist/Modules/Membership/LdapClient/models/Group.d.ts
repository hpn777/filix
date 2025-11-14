export interface GroupProperties {
    dn?: string;
    cn?: string;
    gidNumber?: number;
    member?: string[];
    memberOf?: string[];
    [key: string]: any;
}
export declare class Group implements GroupProperties {
    dn?: string;
    cn?: string;
    gidNumber?: number;
    member?: string[];
    memberOf?: string[];
    [key: string]: any;
    constructor(properties?: GroupProperties);
}
export default Group;
