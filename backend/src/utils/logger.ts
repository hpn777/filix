import {
  LeveledLogMethod as LeveledLogMethodFromWinston,
  Logger,
  createLogger,
  transports,
} from 'winston'

import _ from 'lodash'

// INFO: Nie ma możliwości zaimportowania TransformableInfo, dlatego format jest dodawany za pomocą require()
const { format } = require('winston')
const { combine, timestamp, printf, metadata } = format

function transformDate(timestamp: string): string {
  const date = new Date(timestamp)

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  const milliseconds = date.getUTCMilliseconds()
  const nanoseconds = String(milliseconds).padStart(3, '0') + '000000'

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${nanoseconds}`
}

type CustomFormat = {
  timestamp: string
  level: string
  message: string
  stack?: string
  module?: string
  sessionId?: number
  objectOrArray?: Object | Array<any>
}

enum CustomLevelsEnum {
  INIT = 'init',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE1 = 'verbose1',
  VERBOSE2 = 'verbose2',
  VERBOSE3 = 'verbose3',
  VERBOSE4 = 'verbose4',
  VERBOSE5 = 'verbose5',
  VERBOSE6 = 'verbose6',
  VERBOSE7 = 'verbose7',
  VERBOSE8 = 'verbose8',
  VERBOSE9 = 'verbose9',
  VERBOSE10 = 'verbose10',
}

const customFormat = printf(
  ({
    timestamp,
    level,
    message,
    stack,
    module,
    sessionId,
    objectOrArray,
  }: CustomFormat): string => {
    const formattedTimestamp = `[${transformDate(timestamp)}]`
    const formattedModule = module ? `[${module}]` : '[no_module]'
    const formattedLevel = `[${_.capitalize(level)}]`

    const formattedObjectOrArray = objectOrArray
      ? `\n${JSON.stringify(objectOrArray)}`
      : ''
    const formattedMessage = `${message}${formattedObjectOrArray}`

    if (level === CustomLevelsEnum.INIT) {
      const formattedSessionID = sessionId
        ? `session_id: ${sessionId}`
        : 'session_id: no_session_id'

      return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage} (${formattedSessionID})`
    }

    if (level === CustomLevelsEnum.ERROR) {
      const formattedStack = stack ? `\n${stack}` : ''

      return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage}${formattedStack}`
    }

    return `${formattedTimestamp} ${formattedLevel} ${formattedModule} ${formattedMessage}`
  },
)

const customLevels = {
  levels: {
    init: 0,
    critical: 1,
    error: 2,
    warn: 3,
    info: 4,
    debug: 5,
    verbose1: 6,
    verbose2: 7,
    verbose3: 8,
    verbose4: 9,
    verbose5: 10,
    verbose6: 11,
    verbose7: 12,
    verbose8: 13,
    verbose9: 14,
    verbose10: 15,
  },
}

export type LeveledLogMethod = LeveledLogMethodFromWinston
type CustomLevels = {
  init: LeveledLogMethod
  critical: LeveledLogMethod
  error: LeveledLogMethod
  warn: LeveledLogMethod
  info: LeveledLogMethod
  debug: LeveledLogMethod
  verbose1: LeveledLogMethod
  verbose2: LeveledLogMethod
  verbose3: LeveledLogMethod
  verbose4: LeveledLogMethod
  verbose5: LeveledLogMethod
  verbose6: LeveledLogMethod
  verbose7: LeveledLogMethod
  verbose8: LeveledLogMethod
  verbose9: LeveledLogMethod
  verbose10: LeveledLogMethod
}

// TODO: Trzeba odfiltrować log levels z type def; nie pokrywają się z implementacją
// mamy jednocześnie warn i warning w type def
export type LoggerWithCustomLevels = Logger & CustomLevels
export const logger: LoggerWithCustomLevels = createLogger({
  levels: customLevels.levels,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'filix.all.log',
      level: 'verbose10',
    }),
    new transports.File({
      filename: 'filix.log',
      level: 'info',
    }),
    new transports.File({
      filename: 'filix.error.log',
      level: 'error',
    }),
  ],
  exceptionHandlers: [new transports.Console()],
  format: combine(timestamp(), customFormat, metadata()),
}) as LoggerWithCustomLevels
