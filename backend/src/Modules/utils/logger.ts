export enum LogLevel {
  Init = 1,
  Critical = 1 << 1,
  Error = 1 << 2,
  Warning = 1 << 3,
  Info = 1 << 4,
  Debug = 1 << 5,
  Verbose_1 = 1 << 6,
  Verbose_2 = 1 << 7,
  Verbose_3 = 1 << 8,
  Verbose_4 = 1 << 9,
  Verbose_5 = 1 << 10,
  Verbose_6 = 1 << 11,
  Verbose_7 = 1 << 12,
  Verbose_8 = 1 << 13,
  Verbose_9 = 1 << 14,
  Verbose_10 = 1 << 15,
}

export type LogLevelBitMask = number

export interface Logger {
  setLevel(level: LogLevelBitMask): void
  getLevel(): LogLevelBitMask
  log(level: LogLevel, msg: string): void
  logUnfiltered(level: LogLevel, msg: string): void
}

export const createStdoutLogger = (debugLevel: LogLevelBitMask): Logger => ({
  setLevel(level: LogLevelBitMask) {
    debugLevel = level
  },

  getLevel() {
    return debugLevel
  },

  log(level: LogLevel, msg: string) {
    // In V8, template literals seem to be faster than string concat
    /* tslint:disable:no-unused-expression */
    level & debugLevel && this.logUnfiltered(level, msg)
  },
  /* tslint:enable:no-unused-expression */

  logUnfiltered(level: LogLevel, msg: string) {
    const date = new Date()
    const dateString = date.toUTCString().split(' ')
    const milliseconds = date.getMilliseconds() * 1000
    process.stdout.write(
      `${process.env.HOSTNAME || '127.0.0.1'} [${dateString[2]} ${
        dateString[1]
      } ${dateString[4]}.${milliseconds}] [${LogLevel[level]}] ${msg}\n`,
    )
  },
})
