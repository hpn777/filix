import { AwilixContainer, InjectionMode, asClass, asValue, createContainer } from 'awilix'
import { SubscriptionManager } from './subscriptionManager'
import { ApiAccessBootstrap } from './bootstrap/apiAccessBootstrap'

export type AppContainer = AwilixContainer

export const createAppContainer = (config: any): AwilixContainer => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  })

  container.register({
    container: asValue(container),
    config: asValue(config),
    subscriptionManager: asClass(SubscriptionManager).singleton(),
    apiAccessBootstrap: asClass(ApiAccessBootstrap).singleton(),
  })

  return container
}
