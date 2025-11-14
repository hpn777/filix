type TXConfig = {
  interface: string
  address: string
  port: number
  retry_count: number
  retry_delay: number
}

type MemReaderConfig = {
  path: './shm/cb.{session_id}.mem'
  size: number
  num: number
  overlap: number
  writable: boolean
  poll_interval: number
  reconnect_interval: number
}

type DBConfig = {
  protocol: string
  user: string
  password: string
  host: string
  port: number
  database: string
  schema: string
  query: { pool: boolean }
  notify_retry_timeout?: number
}

type ModuleConfig = {
  id: string
  session_id: number
  module_path: string
  db_module?: string
  autofetch?: boolean
  db_config?: DBConfig
  mem_reader?: MemReaderConfig
  tx?: TXConfig
}

type ServiceConfig = {
  session_id: number
  modules: ModuleConfig[]
}

type ServicesConfig = {
  [key: string]: ServiceConfig
}

export type AppServiceConfig = {
  session_id: number
  cb_mem_path: string
  services: ServicesConfig
}
