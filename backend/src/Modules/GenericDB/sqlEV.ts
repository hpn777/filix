import { Subject } from 'rx'
import { Cluster, lodash as _, Tesseract } from 'tessio'
import { logger } from '../../utils/logger'
import type { DBModels } from './sqlModelGenerator'

// Extended Tesseract interface to include custom properties
interface TesseractExtended extends Tesseract {
  isRemote?: boolean
  businessDelete?: boolean
}

interface SqlEVOptions {
  DBModels?: DBModels
  tessio?: {
    redis?: any
  }
  autofetch?: boolean
  namespace?: string
}

export class SqlEV extends Cluster {
  DBModels!: DBModels
  private readyPromise: Promise<void>
  private resolveReady!: () => void
  private _isReady = false

  constructor(options: SqlEVOptions = {}) {
    super(options)
    
    this.readyPromise = new Promise<void>(resolve => {
      this.resolveReady = resolve
    })
    
    if (options.DBModels) {
      this.DBModels = options.DBModels
      this.DBModels.whenReady().then(() => {
        logger.debug('db models ready, about to initialize ev', {
          module: 'GenericDB::SqlEV',
        })
        this.initializeEV(options)
      })
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

  async initializeEV(options: SqlEVOptions): Promise<void> {
    const loadedData$ = new Subject()
    const isClusterTessio = options.tessio?.redis
    if (isClusterTessio) {
      await this.connect(options.tessio)
    }

    const tableNames = this.DBModels.getTableNames()

    logger.debug('about to take len', tableNames.length, {
      module: 'GenericDB::SqlEV',
    })

    loadedData$.take(tableNames.length).subscribe(
      () => {},
      null,
      () => {
        logger.debug('subscribe should be ready', {
          module: 'GenericDB::SqlEV',
        })
        this.markAsReady()
      },
    )

    logger.debug('about to iterate', { module: 'GenericDB::SqlEV' })

    for (const tableName of tableNames) {
      const columnsForTable = this.DBModels.getColumns(tableName)
      const columns: Array<any> = []
      let businessDelete = false

      columnsForTable.forEach(column => {
        const columnDefinition: any = {
          name: column.name,
          type: this.DBModels.getAttributeType(column.type).type,
          title: column.name,
        }

        if (column.key || column.primary) {
          columnDefinition.primaryKey = true
        }

        if (column.name === 'is_deleted' || column.name === 'deleted_on') {
          columnDefinition.hidden = true
          businessDelete = true
        }

        if (!columns.some(existing => existing.name === columnDefinition.name)) {
          columns.push(columnDefinition)
        } 
      })

      const tesseractTemp = await this.createTesseract(tableName, {
        clusterSync: isClusterTessio,
        disableDefinitionSync: true,
        persistent: false,
        syncSchema: false,
        columns,
      }) as TesseractExtended

      tesseractTemp.isRemote = true
      tesseractTemp.businessDelete = businessDelete

      if (options.autofetch) {
        this.DBModels.getAll(tableName)
          .then((result) => {
            tesseractTemp.isRemote = false
            tesseractTemp.update(result.rows, true)
            loadedData$.onNext({})
          })
          .catch((error) => {
            logger.error(error, { module: 'GenericDB::SqlEV' })
          })
      } else {
        // If not autofetching, still notify that this table is "loaded"
        loadedData$.onNext({})
      }
    }

    // Listen to PostgreSQL NOTIFY events for data changes
    // Only available when using PostgreSQL and pgSubscriber is initialized
    this.DBModels.pgSubscriber?.notifications.on('changed_data_notify', async (payload: any) => {
      const notifications = Array.isArray(payload) ? payload : [payload]
      
      for (const notification of notifications) {
        try {
          const result: any = await this.DBModels.execQuery(
            `SELECT * FROM ${notification.entityName} WHERE ${notification.recordSelector[0].field} = ${notification.recordSelector[0].value}`,
          )
          
          const cache = this.get(notification.entityName)
          const data = result[0]
          
          if (data && data.is_deleted) {
            data.is_deleted = false
            cache.update([data])
            cache.remove([data[cache.idProperty]])
          } else if (data) {
            cache.update(data)
          }
        } catch (error) {
          logger.error(
            `error while selecting FROM ${notification.entityName} WHERE ${notification.recordSelector[0].field} = ${notification.recordSelector[0].value}`,
            { module: 'GenericDB::SqlEV', objectOrArray: error },
          )
        }
      }
    })
  }
}
