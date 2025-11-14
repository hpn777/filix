import { backbone } from 'tessio';
export interface SubscriptionData {
    id?: string;
    requestId?: string;
    clientId?: string;
    containerId?: string;
    moduleId?: string;
    connectionType?: string;
    userId?: number;
    authToken?: string;
    publish?: PublishFunction;
    publishError?: PublishFunction;
    parameters?: any;
    [key: string]: any;
}
interface BackboneOptions {
    parse?: boolean;
    silent?: boolean;
    collection?: any;
}
type PublishFunction = (responseData: unknown, requestId?: string) => void;
export declare class Subscription extends backbone.Model {
    [key: string]: any;
    id: string;
    requestId: string;
    clientId: string;
    containerId: string;
    moduleId: string;
    connectionType: string;
    userId: number;
    authToken: string;
    publish: PublishFunction;
    publishError: PublishFunction;
    constructor(item?: Partial<SubscriptionData>, options?: BackboneOptions);
    remove(): void;
}
export declare class Subscriptions extends backbone.Collection {
    model: typeof Subscription;
    each: (iterator: (element: Subscription, index: number, list: Subscription[]) => void, context?: any) => void;
    where: (properties: Partial<SubscriptionData>) => Subscription[];
}
export {};
