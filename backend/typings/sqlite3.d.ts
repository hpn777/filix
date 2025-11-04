declare module 'sqlite3' {
  export class Database {
    constructor(filename: unknown, mode?: number, callback?: (err: Error | null) => void)

    all<T = any>(sql: string, callback: (err: Error | null, rows: T[]) => void): void
    all<T = any>(sql: string, params: unknown[], callback: (err: Error | null, rows: T[]) => void): void

    close(callback?: (err: Error | null) => void): void
  }
}
