// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../typings/global.d.ts" />

import { getConfiguration, logger } from './index'

export type GetSessionIdArgs = {
  moduleName?: string
  getConfiguration?: typeof getConfiguration
}

export const getSessionId = ({
  moduleName,
  getConfiguration,
}: Partial<GetSessionIdArgs> = {}): number | null => {
  if (global.sessionId) {
    return global.sessionId
  }

  if (moduleName) {
    return getSessionIdFromTheConfigFile({
      moduleName,
      getConfiguration,
    })
  }

  logger.error('Cannot retrieve Session ID', { module: moduleName })

  return null
}

const getSessionIdFromTheConfigFile = ({
  moduleName,
  getConfiguration,
}: GetSessionIdArgs): number | null => {
  const config = getConfiguration?.({ moduleName })

  if (config?.services?.ui?.session_id) {
    global.sessionId = config.services.ui.session_id

    return config.services.ui.session_id
  }

  if (!config) {
    logger.error('Configuration not found in configuration file', {
      module: moduleName,
    })
  }

  logger.error('Session ID not found in configuration file', {
    module: moduleName,
  })

  return null
}
