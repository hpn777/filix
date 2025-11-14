import { RangeSpecifier } from './types';
export declare class RangeRetrievalSpecifierAttribute implements RangeSpecifier {
    attributeName: string;
    low: number;
    high: number | null;
    constructor(attribute: string | RangeSpecifier);
    next(): RangeRetrievalSpecifierAttribute | null;
    toString(): string;
    static getRangeAttributes(item: Record<string, any>): RangeRetrievalSpecifierAttribute[] | null;
    static isRangeAttribute(attribute: string): boolean;
    static hasRangeAttributes(item: Record<string, any> | undefined): boolean;
}
export default RangeRetrievalSpecifierAttribute;
