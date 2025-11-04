declare module 'mysql2' {
  interface MysqlConnectionConfig {
    [key: string]: unknown
  }

  interface MysqlConnection {
    query(sql: string, callback: (err: Error | null, rows: any[]) => void): void
    query(sql: string, values: unknown[], callback: (err: Error | null, rows: any[]) => void): void
    end(callback: (err?: Error | null) => void): void
    config: { database?: string }
    database?: string
  }

  export function createConnection(options: MysqlConnectionConfig): MysqlConnection
}
