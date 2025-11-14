import { lodash as _, EventHorizon } from 'tessio'
import { SubscriptionManager } from '../subscriptionManager'
import { Subscription } from '../Model/subscriptions'

// Module configuration interface
export interface ModuleConfig {
  id: string
  moduleId?: string
  module_path?: string
  module_class?: new (
    config: ModuleConfig,
    subscriptionManager: SubscriptionManager,
  ) => GenericBaseModule
  name?: string
  [key: string]: unknown
}

// Module endpoint type - keeps existing signature for compatibility
export type ModuleEndpoint = (
  request: any,
  subscription: Subscription
) => void | Promise<void>

export interface IBaseModule {
  publicMethods: Map<string, ModuleEndpoint>
  init(): Promise<BaseModule>
  GetPublicMethods(request: any, subscription: Subscription): void
}

export abstract class BaseModule implements IBaseModule {
  public publicMethods: Map<string, ModuleEndpoint> = new Map()

  abstract init(): Promise<BaseModule>

  public constructor(
    public config: ModuleConfig,
    public subscriptionManager: SubscriptionManager,
  ) {}

  public GetPublicMethods(request: any, subscription: Subscription): void {
    subscription.publish(Array.from(this.publicMethods.keys()))
  }
}

export class GenericBaseModule extends BaseModule {
  evH!: EventHorizon
  
  public constructor(
    public config: ModuleConfig,
    public subscriptionManager: SubscriptionManager,
  ) {
    super(config, subscriptionManager)
  }
  
  public init(): Promise<GenericBaseModule> {
    throw new Error('Method not implemented.')
  }
}

export type ModuleConstructor<T extends GenericBaseModule = GenericBaseModule> = new (
  config: ModuleConfig,
  subscriptionManager: SubscriptionManager,
) => T
