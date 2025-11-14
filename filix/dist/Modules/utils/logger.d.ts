export declare enum LogLevel {
    Init = 1,
    Critical = 2,
    Error = 4,
    Warning = 8,
    Info = 16,
    Debug = 32,
    Verbose_1 = 64,
    Verbose_2 = 128,
    Verbose_3 = 256,
    Verbose_4 = 512,
    Verbose_5 = 1024,
    Verbose_6 = 2048,
    Verbose_7 = 4096,
    Verbose_8 = 8192,
    Verbose_9 = 16384,
    Verbose_10 = 32768
}
export type LogLevelBitMask = number;
export interface Logger {
    setLevel(level: LogLevelBitMask): void;
    getLevel(): LogLevelBitMask;
    log(level: LogLevel, msg: string): void;
    logUnfiltered(level: LogLevel, msg: string): void;
}
export declare const createStdoutLogger: (debugLevel: LogLevelBitMask) => Logger;
