import * as os from 'os'
import Enumerable from 'linq'
import { Tesseract } from 'tessio'

import { Subscription } from '../Model/subscriptions'
import { BaseModule, ModuleEndpoint } from './base'
import { tailLogConnector } from '../Connectors'
import { logger } from '../utils/logger'
import { ModuleHelpers } from './utils/ModuleHelpers'
import { BaseModuleRequest, ColumnDef, DataRequestParameters } from './types'

type LogData = {
  id: string
  timestamp: number
  host: string
  appName: string
  slice: number
  pId: number
  type: string
  msg: string
  count: number
}

type Request = BaseModuleRequest<DataRequestParameters & { command: string }>

export class Module extends BaseModule {
  tesseract!: Tesseract
  moduleName: string = 'TailLog'

  publicMethods: Map<string, ModuleEndpoint> = new Map([
    ['GetColumnsDefinition', this.GetColumnsDefinition],
    ['GetData', this.GetData],
  ])

  public async init(): Promise<BaseModule> {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    const config = this.config
    config.separator = os.EOL

    const header = this.createColumnHeaders(config)
    
    this.tesseract = new Tesseract({
      idProperty: 'id',
      columns: header,
    } as any)

    this.setupLogTail(config)

    return Promise.resolve(this)
  }

  private createColumnHeaders(config: any): ColumnDef[] {
    return [
      {
        name: 'id',
        title: 'Id',
        columnType: 'string',
        primaryKey: true,
      },
      {
        name: 'timestamp',
        title: 'Timestamp',
        columnType: 'number',
      },
      {
        name: 'host',
        title: 'Host',
        columnType: 'string',
      },
      {
        name: 'appName',
        title: 'App Name',
        columnType: 'string',
      },
      {
        name: 'slice',
        title: 'Slice',
        columnType: 'number',
      },
      {
        name: 'pId',
        title: 'pId',
        columnType: 'number',
      },
      {
        name: 'type',
        title: 'Type',
        columnType: 'string',
        enum: config.messageTypes || ['I', 'W', 'E'],
      },
      {
        name: 'msg',
        title: 'Message',
        columnType: 'text',
      },
      {
        name: 'count',
        title: 'Count',
        columnType: 'number',
      },
    ]
  }

  private setupLogTail(config: any): void {
    if (!config.path) {
      return
    }

    const tail$ = tailLogConnector(config)
    
    if (config.messageTypes) {
      tail$.subscribe((data: LogData) => {
        if (data.type && config.messageTypes.indexOf(data.type) !== -1) {
          this.tesseract.add([data])
        }
      })
    } else {
      tail$.subscribe((data: LogData) => {
        this.tesseract.add([data])
      })
    }
  }

  GetColumnsDefinition(request: Request, subscription: Subscription): void {
    subscription.publish(
      {
        header: this.tesseract.getHeader(),
        type: 'reset',
      },
      request.requestId,
    )
  }

  GetData(request: Request, subscription: Subscription): void {
    const header = this.tesseract.getHeader()
    let session = this.getOrCreateSession(request, subscription)

    if (!session) {
      return
    }

    const responseData = this.prepareResponseData(request, session, header)
    
    subscription.publish(
      responseData,
      request.requestId,
    )
  }

  private getOrCreateSession(request: Request, subscription: Subscription): any {
    let session = subscription.get('tesseractSession')

    if (!request.parameters.rpc) {
      subscription.set('requestId', request.requestId)
    }

    if (!session) {
      session = this.tesseract.createSession({ immediateUpdate: false })
      this.attachSessionListeners(session, request, subscription)
      subscription.set('tesseractSession', session)
    }

    return session
  }

  private attachSessionListeners(
    session: any,
    request: Request,
    subscription: Subscription,
  ): void {
    session.on(
      'dataUpdate',
      (data: any) => {
        this.handleDataUpdate(data, session, request, subscription)
      },
      subscription,
    )

    session.on(
      'dataRemoved',
      (data: any) => {
        this.handleDataRemoved(data, session, request, subscription)
      },
      subscription,
    )

    subscription.once('remove', () => {
      this.cleanupSession(session, subscription)
    })
  }

  private handleDataUpdate(
    data: any,
    session: any,
    request: Request,
    subscription: Subscription,
  ): void {
    const sessionConfig = session.get('config')
    const isPaged = sessionConfig.page !== undefined

    if (isPaged) {
      this.publishPagedUpdate(data, session, subscription, 'update')
      
      if (data.removedData?.length) {
        this.publishPagedUpdate(data, session, subscription, 'remove', true)
      }
    } else {
      subscription.publish(
        { data: data.updatedData, type: 'update' },
        request.requestId,
      )

      if (data.removedData?.length) {
        subscription.publish(
          { data: data.removedData, type: 'remove' },
          request.requestId,
        )
      }
    }
  }

  private handleDataRemoved(
    data: any,
    session: any,
    request: Request,
    subscription: Subscription,
  ): void {
    const sessionConfig = session.get('config')
    const isPaged = sessionConfig.page !== undefined

    if (isPaged) {
      subscription.publish(
        {
          data,
          total: sessionConfig.totalLength || session.dataCache.length,
          type: 'remove',
          page: sessionConfig.page,
          reload: false,
        },
        subscription.get('requestId'),
      )
    } else {
      subscription.publish(
        { data, type: 'remove' },
        request.requestId,
      )
    }
  }

  private publishPagedUpdate(
    data: any,
    session: any,
    subscription: Subscription,
    type: 'update' | 'remove',
    useRemovedData: boolean = false,
  ): void {
    const sessionConfig = session.get('config')
    const dataToPublish = useRemovedData ? data.removedData : data.updatedData

    subscription.publish(
      {
        data: dataToPublish,
        total: sessionConfig.totalLength || session.dataCache.length,
        type,
        page: sessionConfig.page,
        reload: false,
      },
      subscription.get('requestId'),
    )
  }

  private cleanupSession(session: any, subscription: Subscription): void {
    session.off('dataUpdate', null, subscription)
    session.off('dataRemoved', null, subscription)
    session.remove()
  }

  private prepareResponseData(
    request: Request,
    session: any,
    header: ColumnDef[],
  ): any {
    request.parameters.requestId = request.requestId
    const responseData = session.getData(request.parameters)
    
    const transformedData = Enumerable.from(responseData)
      .select((item: any) => {
        const row: any[] = []
        for (let i = 0; i < header.length; i++) {
          row.push(item[header[i].name])
        }
        return row
      })
      .toArray()

    const response: any = { data: transformedData }

    if (request.parameters.page) {
      response.total = session.dataCache.length
      response.page = request.parameters.page
      response.reload = request.parameters.reload
    } else {
      response.header = header
      response.type = 'reset'
    }

    return response
  }
}
