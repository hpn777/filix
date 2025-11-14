export interface Header {
    name: string;
    type: string;
    title: string;
}
export declare function joinColumnNamesWithData(headers: Header[], dataRow: any): {
    [x: string]: any;
}[];
