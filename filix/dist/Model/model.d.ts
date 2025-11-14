import { backbone } from 'tessio';
interface ModelAttributes {
    [key: string]: any;
}
interface ModelOptions {
    parse?: boolean;
    silent?: boolean;
    collection?: any;
}
declare class Model extends backbone.Model {
    constructor(item?: Partial<ModelAttributes>, options?: ModelOptions);
    remove(): void;
    cloneAttributes(selectedAttributes?: string[]): Record<string, any>;
    guid(): string;
}
export { Model };
