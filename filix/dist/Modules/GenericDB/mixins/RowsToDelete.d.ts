import { Module as GenericDB } from '../index';
export type TKeyValue<Value> = {
    [x: string]: Value;
};
export declare class RowsToDelete {
    private dataBase;
    private dataCache;
    private readonly idProperty;
    constructor(dataBase: GenericDB, dataCache: any);
    getFromDataBase<IdPropertyType>(tableName: string, columName: string, rowIds: number[] | string[] | (number | string)[]): Promise<IdPropertyType[] | null>;
    getFromDataCache<IdPropertyType>(columName: string, rowIds: IdPropertyType[] | (number | string)[]): IdPropertyType[] | null;
    private getIdPropertyValue;
}
