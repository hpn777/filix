import path from 'node:path'

import { startService, type ModuleRegistration } from 'filix'
import type { GenericBaseModule } from 'filix'

import { customModuleRegistrations } from './customModules'

const defaultConfigPath = path.resolve(__dirname, '../config/all.yml')
const configPath = process.env.FILIX_CONFIG ?? defaultConfigPath
const configSection = process.env.FILIX_CONFIG_SECTION ?? 'ui'
const moduleName = process.env.FILIX_MODULE_NAME ?? process.env.HOSTNAME ?? 'AppService'

const signalHandlers: Array<NodeJS.Signals> = ['SIGTERM', 'SIGINT']

const loadModuleRegistrations = (): ModuleRegistration<GenericBaseModule>[] => {
  return [...customModuleRegistrations]
}

const main = async () => {
  try {
    const service = await startService({
      configPath,
      configSection,
      moduleName,
      modules: loadModuleRegistrations(),
    })

    const shutdown = () => {
      Promise.resolve(service.stop()).finally(() => process.exit(0))
    }

    signalHandlers.forEach(signal => process.once(signal, shutdown))
  } catch (error) {
    console.error(`API service failed to start: ${String(error)}`)
    process.exit(1)
  }
}

void main()
