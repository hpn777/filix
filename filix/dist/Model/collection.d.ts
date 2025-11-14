import { backbone } from 'tessio';
import { Model } from './model';
declare class Collection extends backbone.Collection {
    each: (iterator: (element: any, index: number, list: any[]) => void, context?: any) => void;
    model: typeof Model;
    cloneAll(): any[];
    toEnumerable(): any;
    guid(): string;
}
export { Collection };
