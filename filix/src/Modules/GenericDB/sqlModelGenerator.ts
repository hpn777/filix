import * as orm from 'orm3'
import type { Pool, QueryResult } from 'pg'
import type {
  ConnectionConfig as OrmConnectionConfig,
  ConnectionOptions as OrmConnectionOptions,
  DefineModelsFromSchemaOptions,
  DriverResult,
  FindOptions as OrmFindOptions,
  Model as OrmModel,
  Property as OrmProperty,
  QueryConditions,
} from 'orm3/dist/types/Core'

import { logger } from '../../utils/logger'
import { DataBaseError } from './dataBaseError'

const pgListen = require('pg-listen')

type Nullable<T> = T | null | undefined

type SupportedProtocol = 'mysql' | 'pg' | 'sqlite3'

type ConnectionConfig = Omit<OrmConnectionConfig, 'protocol'> & {
  protocol: SupportedProtocol
  schema: string
  notify_retry_timeout?: number
  query?: OrmConnectionOptions['query']
}

type SortDirection = NonNullable<OrmFindOptions['order']>[number][1]

type QueryConditionValue = QueryConditions[string]

interface FilterItem {
  field: string
  comparison: 'in' | 'neq' | 'like' | 'notlike' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  value: QueryConditionValue
}

interface SortItem {
  field: string
  direction: SortDirection
}

interface MergeOptions {
  id: string
  ref_id: string
  table_name: string
  where?: QueryConditions
}

interface SessionQueryParams {
  tableName: string
  select?: string[]
  where?: FilterItem[] | QueryConditions
  filter?: FilterItem[] | QueryConditions
  sort?: SortItem[]
  merge?: MergeOptions
  limit?: OrmFindOptions['limit']
  start?: OrmFindOptions['offset']
}

interface SessionQueryResult {
  data: DriverResult[]
  totalCount: number
}

interface FindOptions {
  offset?: number
  limit?: number
  order?: Array<[string, 'A' | 'Z']>
  merge?: {
    from: { field: string }
    to: { field: string }
    select: string[]
    where?: Record<string, unknown>
  }
}

type OrmFindResult = Array<Record<string, unknown>> | { rows?: Array<Record<string, unknown>> }

type AttributeType =
  | { type: 'number'; key?: boolean }
  | { type: 'date'; time: boolean; key?: boolean }
  | { type: 'boolean'; key?: boolean }
  | { type: 'text'; key?: boolean }

type AttributeDefinition = AttributeType | { type: 'serial'; key: true }

type SessionQueryFunction = (parameters: SessionQueryParams) => Promise<SessionQueryResult>

export type Orm3Model = OrmModel & {
  count(filter: Record<string, unknown>): Promise<number>
  sessionQuery?: SessionQueryFunction
  getAllAsync?: (tableName: string) => Promise<QueryResult<Record<string, unknown>>>
}

interface Orm3Database {
  settings: {
    set(key: string, value: unknown): void
  }
  sync(): Promise<void>
  close(): Promise<void>
  define(
    tableName: string,
    attributes: Record<string, AttributeDefinition>,
    options?: Record<string, unknown>,
  ): Orm3Model
  defineAllFromSchema<T = unknown>(
    options?: DefineModelsFromSchemaOptions<T>,
  ): Promise<Record<string, OrmModel>>
  driver: {
    db: Pool
    find(
      select: string[],
      table: string,
      filter: Record<string, unknown>,
      options: FindOptions,
    ): Promise<OrmFindResult>
    execQuery(query: string): Promise<unknown>
  }
  on(event: string, handler: (error: unknown) => void): void
}

type ModelDictionary = Record<string, Orm3Model>

export class DBModels {
  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private _isReady = false
  private connectionConfig!: ConnectionConfig
  private db!: Orm3Database
  private driver!: Pool
  private reconnectTimer?: NodeJS.Timeout
  private models: ModelDictionary = {}
  pgSubscriber?: ReturnType<typeof pgListen>

  constructor(options?: { config?: ConnectionConfig }) {
    
    this.readyPromise = new Promise<void>(resolve => {
      this.resolveReady = resolve
    })

    if (options?.config) {
      this.connectionConfig = options.config
      this.initialize()
    }
  }

  whenReady(): Promise<void> {
    return this.readyPromise
  }

  isReady(): boolean {
    return this._isReady
  }

  private markAsReady(): void {
    this._isReady = true
    this.resolveReady()
  }

  private registerOrmModel(tableName: string, model: Orm3Model): void {
    this.models[tableName] = model

    Object.defineProperty(this, tableName, {
      value: model,
      writable: false,
      enumerable: true,
      configurable: true,
    })
  }

  private getQualifiedTableName(tableName: string): string {
    if (this.connectionConfig?.schema) {
      return `${this.connectionConfig.schema}.${tableName}`
    }

    return tableName
  }

  getTableNames(): string[] {
    return Object.keys(this.models)
  }

  getColumns(tableName: string): OrmProperty[] {
    const model = this.getModel(tableName)
    if (!model) {
      return []
    }

    return Object.values(model.properties)
  }

  getPrimaryKeyColumn(tableName: string): string {
    const model = this.getModel(tableName)

    if (model) {
      const id = model.id as Nullable<string | string[]>
      if (typeof id === 'string') {
        return id
      }
      if (Array.isArray(id) && id.length > 0) {
        return id[0]
      }
    }

    const column = this.getColumns(tableName).find(item => item.key || item.primary)
    if (column) {
      return column.name
    }

    return 'id'
  }

  getReferencingColumns(targetTableName: string): Array<{
    tableName: string
    column: OrmProperty & { referencedTableName?: string; referencedColumnName?: string }
  }> {
    const references: Array<{ 
      tableName: string
      column: OrmProperty & { referencedTableName?: string; referencedColumnName?: string }
    }> = []
    const normalizedTarget = targetTableName.toLowerCase()

    this.getTableNames().forEach(tableName => {
      const model = this.getModel(tableName)
      if (!model) return

      // Check associations for references to target table
      const associations = (model as any).associations || []
      associations.forEach((assoc: any) => {
        if (assoc.model && typeof assoc.model === 'string') {
          if (assoc.model.toLowerCase() === normalizedTarget && tableName.toLowerCase() !== normalizedTarget) {
            // Find the property for this association
            const prop = model.properties[assoc.name]
            if (prop) {
              references.push({ 
                tableName, 
                column: {
                  ...prop,
                  referencedTableName: assoc.model,
                  referencedColumnName: assoc.field || 'id'
                }
              })
            }
          }
        }
      })
    })

    return references
  }

  private getModel(tableName: string): Orm3Model | undefined {
    return this.models[tableName]
  }

  async initialize() {
    if (!this.connectionConfig) {
      // Config not provided yet, skip initialization
      // This happens when DBModels is created with empty object as placeholder
      return
    }

    this.models = {}

    await this.connectWithRetry()
  }

  private async connectWithRetry() {
    if (this.pgSubscriber) {
      try {
        await this.pgSubscriber.close()
      } catch (error) {
        logger.warn('Failed to close existing PG listener', {
          module: 'GenericDB::DBModels',
          objectOrArray: error,
        })
      } finally {
        this.pgSubscriber = undefined
      }
    }

    try {
      this.db = (await orm.connect(this.connectionConfig)) as Orm3Database
      
      this.db.settings.set('instance.cache', false)
      
      await this.db.sync()
      
      this.driver = this.db.driver.db

      if (!this._isReady) {
        await this.createModels(this.connectionConfig)
      }
      if (this.connectionConfig.protocol === 'pg') {
        const pgListenConfig: Record<string, unknown> = {
          user: this.connectionConfig.user,
          password: this.connectionConfig.password,
          host: this.connectionConfig.host,
          port: this.connectionConfig.port,
          database: this.connectionConfig.database,
        }

        if (typeof this.connectionConfig.notify_retry_timeout === 'number') {
          pgListenConfig.retryTimeout = this.connectionConfig.notify_retry_timeout
        }

        if ('ssl' in this.connectionConfig) {
          pgListenConfig.ssl = (this.connectionConfig as Record<string, unknown>).ssl
        }

        if ('connectionString' in this.connectionConfig) {
          pgListenConfig.connectionString = (this.connectionConfig as Record<string, unknown>).connectionString
        }

        const subscriber = pgListen(pgListenConfig)
        await subscriber.connect()
        await subscriber.listenTo('changed_data_notify')
        this.pgSubscriber = subscriber
      }

      // Setup error handler for disconnections
      this.db.on('error', (error: any) => {
        const dbName = this.connectionConfig?.database || 'unknown'
        logger.error(
          `ORM ${dbName} db error: ${JSON.stringify(error)}`,
          { module: 'GenericDB::DBModels' },
        )

        if (
          error.code === 'PROTOCOL_CONNECTION_LOST' ||
          error.code === 'ECONNRESET'
        ) {
          this.scheduleReconnect()
        }
      })

    } catch (error) {
      const dbName = this.connectionConfig?.database || 'unknown'
      logger.error(
        `Error when ORM connecting ${dbName} db: ${JSON.stringify(error)}`,
        { module: 'GenericDB::DBModels' },
      )
      
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.connectWithRetry()
    }, 2000)
  }

  async cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.pgSubscriber) {
      try {
        await this.pgSubscriber.close()
      } catch (error) {
        logger.warn('Failed to close PG listener during cleanup', {
          module: 'GenericDB::DBModels',
          objectOrArray: error,
        })
      } finally {
        this.pgSubscriber = undefined
      }
    }
    if (this.db) {
      await this.db.close()
    }
  }

  async createModels(connectionConfig: ConnectionConfig): Promise<void> {
    try {
      const ormModels = await this.db.defineAllFromSchema<Record<string, unknown>>({
        schema: connectionConfig.schema,
        includeViews: true,
        modelNamingStrategy: 'preserve',
        defineOptions: {
          namingStrategy: 'preserve',
          modelOptions: {
            cache: false,
          },
        },
      })

      const entries = Object.entries(ormModels)

      if (entries.length === 0) {
        this.markAsReady()
        return
      }

      for (const [tableName, model] of entries) {

        this.registerOrmModel(tableName, model as Orm3Model)
      }

      this.markAsReady()
    } catch (error) {
      logger.error(`Failed to define models from schema: ${error}`, {
        module: 'GenericDB::DBModels',
      })
    }
  }

  async sessionQuery(parameters: SessionQueryParams): Promise<SessionQueryResult> {
    const {
      tableName,
      select: requestedSelect,
      sort,
      merge,
      limit,
      start = 0,
    } = parameters

    const ormModel = this.getModel(tableName)

    if (!ormModel) {
      throw new Error(`Model not found for table: ${tableName}`)
    }

    const select =
      requestedSelect || this.getColumns(tableName).map(prop => prop.mapsTo || prop.name) || []
    const filters = parameters.where ?? parameters.filter

    const dbFilter: QueryConditions = {}
    const dbOptions: FindOptions = {
      offset: start,
    }

    if (typeof limit === 'number') {
      dbOptions.limit = limit
    }

    if (sort) {
      dbOptions.order = sort.map(item => [
        item.field,
        item.direction === 'ASC' ? 'A' : 'Z',
      ])
    }

    if (merge) {
      dbOptions.merge = {
        from: {
          field: merge.id,
        },
        to: {
          field: merge.ref_id,
        },
        select: [merge.table_name],
        where: merge.where,
      }
    }

    if (filters) {
      if (Array.isArray(filters)) {
        filters.forEach(item => {
          switch (item.comparison) {
            case 'neq':
              dbFilter[item.field] = { $ne: item.value }
              break
            case 'like':
              dbFilter[item.field] = { $like: `%${item.value}%` }
              break
            case 'notlike':
              dbFilter[item.field] = { $not_like: `%${item.value}%` }
              break
            case 'gt':
              dbFilter[item.field] = { $gt: item.value }
              break
            case 'gte':
              dbFilter[item.field] = { $gte: item.value }
              break
            case 'lt':
              dbFilter[item.field] = { $lt: item.value }
              break
            case 'lte':
              dbFilter[item.field] = { $lte: item.value }
              break
            default:
              dbFilter[item.field] = item.value
          }
        })
      } else {
        Object.assign(dbFilter, filters)
      }
    }

    try {
      // orm3: driver methods return promises
      const queryResult = await this.db.driver.find(
        select,
        `${this.connectionConfig.schema}.${tableName}`,
        dbFilter,
        dbOptions,
      )

      // orm3: count method returns a promise
      const totalCount = await ormModel.count(dbFilter)

      return {
        data: Array.isArray(queryResult)
          ? queryResult
          : queryResult.rows ?? [],
        totalCount,
      }
    } catch (error) {
      const dataBaseError = new DataBaseError(error as Error)

      logger.error(
        `DB select query ${dataBaseError} in table "${tableName}"`,
        {
          module: 'GenericDB::DBModels',
          objectOrArray: dataBaseError,
          stack: dataBaseError.stack,
        },
      )

      throw dataBaseError
    }
  }

  async execQuery<T = unknown>(query: string): Promise<T> {
    // orm3: execQuery returns a promise
    return this.db.driver.execQuery(query) as Promise<T>
  }

  async getAll(tableName: string): Promise<QueryResult<Record<string, unknown>>> {
    if (!this.getModel(tableName)) {
      throw new Error(`Table: ${tableName} not found`)
    }

    return this.driver.query<Record<string, unknown>>(
      `SELECT * FROM ${this.getQualifiedTableName(tableName)}`,
    )
  }

  getAllAsync(tableName: string): Promise<QueryResult<Record<string, unknown>>> {
    return this.getAll(tableName)
  }

  getAttributeType(dbType: string): AttributeType {
    const numberRegex =
      /^(?:int|integer|tinyint|smallint|float|bigint|decimal|double|double precision|real|numeric)/
    const dateRegex = /^(?:date)/
    const dateTimeRegex = /^(?:date|datetime|timestamp|time)/
    const boolRegex = /^(?:bit|boolean|binary)/

    if (numberRegex.test(dbType)) {
      return { type: 'number' }
    }

    if (dateRegex.test(dbType)) {
      return { type: 'date', time: false }
    }

    if (dateTimeRegex.test(dbType)) {
      return { type: 'date', time: true }
    }

    if (boolRegex.test(dbType)) {
      return { type: 'boolean' }
    }

    return {
      type: 'text',
    }
  }
}
