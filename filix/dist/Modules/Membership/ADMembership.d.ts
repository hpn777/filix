import { Model } from '../../Model/model';
import type { ADUser, ADCallback } from './types';
declare class ADMembership extends Model {
    private config;
    initialize(): void;
    login(userName: string, password: string, callbackFn: ADCallback<boolean>): void;
    getUser(userName: string, callbackFn: ADCallback<ADUser>): void;
    getAllUsers(callback: ADCallback<ADUser[]>): void;
    getAllRoles(callbackFn: (roles: Array<{
        id: string;
    }>) => void): void;
}
export = ADMembership;
