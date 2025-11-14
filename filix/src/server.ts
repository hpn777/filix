Error.stackTraceLimit = 50

import { ArgumentParser } from 'argparse'
import { startService } from '.'
import { logger } from './utils'

const moduleName = process.env.HOSTNAME || 'AppService'

const parser = new ArgumentParser()

parser.add_argument('-c', '--config', {
  help: 'Sets a custom config file path (default: ./config/all.yml)',
})
parser.add_argument('-s', '--config-section', {
  help: 'Section of the config file to use (default: ui)',
})

const args = parser.parse_args()

const configurationFilePath = args.config || './config/all.yml'
const configurationSection = args.config_section || 'ui'

const runOnProgramExit = (
  callback: () => Promise<void> | void,
  delay = 0,
): void => {
  const handler = () => {
    const execute = () => {
      Promise.resolve(callback()).finally(() => process.exit(0))
    }

    if (delay > 0) {
      setTimeout(execute, delay)
    } else {
      execute()
    }
  }

  ;['SIGTERM', 'SIGINT'].forEach(signal => process.once(signal, handler))
}

const main = async () => {
  try {
    const service = await startService({
      configPath: configurationFilePath,
      configSection: configurationSection,
      moduleName,
    })

    runOnProgramExit(service.stop, 200)
  } catch (error) {
    logger.error(`API service failed to start: ${error}`, {
      module: moduleName,
    })
    process.exit(1)
  }
}

void main()
