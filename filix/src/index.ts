import { AwilixContainer } from 'awilix'

import findConfigurationSection from './utils/findConfigurationSection'
import { createAppContainer } from './container'
import { ApiAccessBootstrap } from './bootstrap/apiAccessBootstrap'
import { logger, getConfiguration, getSessionId } from './utils'
import { GenericBaseModule, ModuleConfig, ModuleConstructor } from './Modules/base'
import { SubscriptionManager } from './subscriptionManager'

export interface ModuleRegistration<T extends GenericBaseModule = GenericBaseModule> {
  id: string
  module: ModuleConstructor<T>
  config?: Partial<ModuleConfig>
}

export interface StartServiceOptions {
  configPath: string
  configSection?: string
  moduleName?: string
  modules?: ModuleRegistration[]
}

export interface ServiceHandle {
  container: AwilixContainer
  subscriptionManager: SubscriptionManager
  stop(): Promise<void>
}

export async function startService(options: StartServiceOptions): Promise<ServiceHandle> {
  const {
    configPath,
    configSection = 'ui',
    moduleName = process.env.HOSTNAME || 'AppService',
    modules = [],
  } = options

  logger.init('AppService started', {
    module: moduleName,
    sessionId: getSessionId({ moduleName, getConfiguration }),
  })

  logger.info(`Config file path: ${configPath}`, {
    module: moduleName,
  })
  logger.info(`Section of the config file to use: ${configSection}`, {
    module: moduleName,
  })

  const configuration = getConfiguration({
    configurationFilePath: configPath,
    moduleName,
  })
  const sectionsArray = configSection.split('.')
  const config = findConfigurationSection(configuration, sectionsArray)

  if (!config) {
    throw new Error(`Section not found in configuration file!: ${configSection}`)
  }

  applyModuleRegistrations(config, modules)

  const container = createAppContainer(config)
  const apiAccessBootstrap = container.resolve<ApiAccessBootstrap>('apiAccessBootstrap')
  await apiAccessBootstrap.initialize()

  const subscriptionManager = container.resolve<SubscriptionManager>('subscriptionManager')

  return {
    container,
    subscriptionManager,
    stop: async () => {
      if (typeof container.dispose === 'function') {
        await container.dispose()
      }
    },
  }
}

function applyModuleRegistrations(
  config: Record<string, any>,
  registrations: ModuleRegistration[],
): void {
  if (!registrations.length) {
    return
  }

  if (!Array.isArray(config.modules)) {
    config.modules = []
  }

  for (const registration of registrations) {
    if (!registration.id || typeof registration.module !== 'function') {
      throw new Error('Invalid module registration')
    }

    let moduleConfig: ModuleConfig | undefined = config.modules.find(
      (moduleConfig: ModuleConfig) => moduleConfig?.id === registration.id,
    )

    if (!moduleConfig) {
      moduleConfig = { id: registration.id }
      config.modules.push(moduleConfig)
    }

    if (registration.config) {
      Object.assign(moduleConfig, registration.config)
    }

    moduleConfig.module_class = registration.module
  }
}

export default startService
export type { ModuleConfig } from './Modules/base'
export { GenericBaseModule } from './Modules/base'
