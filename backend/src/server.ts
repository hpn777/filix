import findConfigurationSection from './utils/findConfigurationSection'

Error.stackTraceLimit = 50

import { ArgumentParser } from 'argparse'
import { SubscriptionManager } from './subscriptionManager'
import { logger, getConfiguration, getSessionId } from './utils'

const moduleName = process.env.HOSTNAME || 'AppService'

const parser = new ArgumentParser()

parser.add_argument('-c', '--config', {
  help: 'Sets a custom config file path (default: ./config/all.yml)',
})
parser.add_argument('-s', '--config-section', {
  help: 'Section of the config file to use (default: )',
})

const args = parser.parse_args()

const configurationFilePath = args.config || './config/all.yml'
const configurationSection = args.config_section || 'ui'

logger.init('AppService started', {
  module: moduleName,
  sessionId: getSessionId({ moduleName, getConfiguration }),
})

const sectionsArray = configurationSection.split('.')

// TODO: Move code related to config into to a function or module
const config = findConfigurationSection(
  getConfiguration({ configurationFilePath, moduleName }),
  sectionsArray,
)

if (!config) {
  logger.error(
    `Section not found in configuration file!: ${configurationSection}`,
    { module: moduleName },
  )

  process.exit(0)
}

const coreBusMonitorConfig = config.modules.find(m => m.id === 'CoreBusMonitor')

if (coreBusMonitorConfig) {
  if (!coreBusMonitorConfig.session_id) {
    logger.error('session_id missing!', { module: moduleName })

    process.exit(0)
  }

  coreBusMonitorConfig.mem_reader.path =
    coreBusMonitorConfig.mem_reader.path.replace(
      '{session_id}',
      coreBusMonitorConfig.session_id,
    )
}

logger.info(`Config file path: ${configurationFilePath}`, {
  module: moduleName,
})
logger.info(`Section of the config file to use: ${configurationSection}`, {
  module: moduleName,
})

const runOnProgramExit = (lambda, timeout) => {
  let runOnExit
  if (timeout)
    runOnExit = function () {
      setTimeout(lambda, timeout)
    }
  else runOnExit = lambda
  process.on('SIGTERM', runOnExit)
  process.on('SIGINT', runOnExit)
}

runOnProgramExit(() => {
  process.exit(0)
}, 200)

new SubscriptionManager(config)
