import _ from 'lodash'
import { EventHorizon } from 'tessio'

import filterOutDeletedAndOwned from './utils/filterOutDeletedAndOwned'
import { Tesseract } from '../../../../typings/tesseract'
import { Subscription } from '../../../Model/subscriptions'
import { 
  GenericDBRequest, 
  QueryConfig, 
  SessionConfig,
  TesseractSession,
  SessionHeader,
  ResponseData
} from '../types'
import { Module as GenericDB, getAPIKey } from '../index'
import { logger } from '../../../utils/logger'
import { CommonHelpers } from './utils/commonHelpers'

export class GetData {
  async GetData(
    this: GenericDB,
    request: Subscription,
    subscription: Subscription,
  ): Promise<void> {
    const {
      query,
      tableName,
      permanentFilter,
    }: { tableName: string; query: SessionConfig | undefined; permanentFilter: any } =
      request.parameters

    let session: any = subscription.get('tesseractSession')
    let tesseract: Tesseract | undefined
    let header: SessionHeader[] | undefined

    if (!request.parameters.rpc) {
      subscription.requestId = request.requestId
    }

    // Validate request access rights
    if (!(await CommonHelpers.validateRequestAccess(this, request as any, subscription))) {
      return
    }

    if (query) {
      await this.handleMultiTableQuery(
        request,
        subscription,
        query,
      )
    } else if (tableName) {
      await this.handleSingleTableQuery(
        request,
        subscription,
        tableName,
        permanentFilter,
      )
    } else {
      CommonHelpers.publishError(subscription, 'No query or dataset: provided.')
      return
    }

    // Note: session is set in handleMultiTableQuery or handleSingleTableQuery
    const finalSession =
      subscription.get('tesseractSession') || session
    if (finalSession) {
      this.setupSessionEventHandlers(finalSession, subscription, request)
    }
  }

  /**
   * Handle queries spanning multiple tables
   */
  async handleMultiTableQuery(
    this: GenericDB,
    request: Subscription,
    subscription: Subscription,
    query: SessionConfig,
  ): Promise<void> {
    const tableNames = this.getTableNames(query)

    ;(query as any).id = subscription.id
    request.parameters.filter = request.parameters.query.permanentFilter

    // Load remote tables
    await this.loadRemoteTables(tableNames)

    // Create or reuse session
    const session =
      subscription.get('tesseractSession') || this.createSession(query)
    subscription.set('tesseractSession', session)

    // Publish response
    const response = this.getResponseData(request, session)
    subscription.publish(response, request.requestId)
  }

  /**
   * Load remote tables into memory
   */
  async loadRemoteTables(
    this: GenericDB,
    tableNames: string[],
  ): Promise<void> {
    for (const table of tableNames) {
      try {
        const tesseract = this.evH.get(table)

        if (tesseract && tesseract.isRemote) {
          const res = await this.DBModels.getAllAsync(table)
          tesseract.reset(res.rows, true, true)
          tesseract.isRemote = false
        }
      } catch (error: any) {
        logger.error(error.message, {
          module: 'GenericDB::GetData',
          table,
        })
      }
    }
  }

  /**
   * Handle query for a single table
   */
  async handleSingleTableQuery(
    this: GenericDB,
    request: Subscription,
    subscription: Subscription,
    tableName: string,
    permanentFilter: any,
  ): Promise<void> {
    const tesseract = this.evH.get(tableName)

    if (!tesseract) {
      subscription.publishError({
        message: `Dataset: "${tableName}" doesn't exist.`,
      })
      return
    }

    // Filter columns and create session
    const columns = tesseract.columns.filter(filterOutDeletedAndOwned)
    const session =
      subscription.get('tesseractSession') ||
      this.createSession({
        id: subscription.id,
        table: tableName,
        columns,
        permanentFilter,
      } as any)

    const header = session.getHeader(true)
    subscription.set('tesseractSession', session)

    // Handle remote vs local data
    if (tesseract.isRemote) {
      await this.handleRemoteTableQuery(
        request,
        subscription,
        session,
        header,
      )
    } else {
      const response = this.getResponseData(request, session)
      subscription.publish(response, request.requestId)
    }
  }

  /**
   * Handle remote table query with async data loading
   */
  async handleRemoteTableQuery(
    this: GenericDB,
    request: Subscription,
    subscription: Subscription,
    session: any,
    header: SessionHeader[],
  ): Promise<void> {
    if (session.permanentFilter) {
      request.parameters.filter = session.permanentFilter.concat(
        request.parameters.filter || [],
      )
    }

    try {
      const result = await this.DBModels.sessionQuery(request.parameters)

      request.parameters.requestId = request.requestId
      request.parameters.totalLength = result.totalCount
      session.set('config', request.parameters)

      const response = this.buildRemoteQueryResponse(
        result.data,
        header,
        request.parameters,
        result.totalCount,
      )

      subscription.publish(response, request.requestId)
    } catch (err) {
      subscription.publishError(err)
    }
  }

  /**
   * Build response object for remote query
   */
  buildRemoteQueryResponse(
    this: GenericDB,
    data: any[],
    header: SessionHeader[],
    parameters: any,
    totalLength: number,
  ): any {
    const response: any = {
      data: data.map(x => {
        const tempData: any = []
        header?.forEach(column => {
          tempData.push(x[column.name])
        })
        return tempData
      }),
    }

    if (parameters.page) {
      response.total = totalLength
      response.page = parameters.page
      response.reload = parameters.reload
    } else {
      response.header = header
      response.type = 'reset'
    }

    return response
  }

  /**
   * Setup event handlers for session data updates
   */
  setupSessionEventHandlers(
    this: GenericDB,
    session: any,
    subscription: Subscription,
    request: Subscription,
  ): void {
    session.off('dataUpdate', null, subscription)
    session.on(
      'dataUpdate',
      (data: any) => {
        const sessionConfig = session.get('config')
        const updateData = this.buildDataUpdatePayload(data)

        if (sessionConfig.page !== undefined) {
          subscription.publish({
            data: updateData,
            total: sessionConfig.totalLength || session.dataCache.length,
            type: 'update',
            page: sessionConfig.page,
            reload: false,
          })
        } else {
          subscription.publish(
            {
              data: updateData,
              type: 'update',
            },
            request.requestId,
          )
        }
      },
      subscription,
    )

    subscription.on('remove', () => {
      session.off('dataUpdate', null, subscription)
      session.destroy()
    })
  }

  /**
   * Build data update payload from session update
   */
  buildDataUpdatePayload(this: GenericDB, data: any): any {
    return {
      addedIds: data.addedIds,
      addedData: data.addedData.select((x: any) => x.array).toArray(),
      updatedIds: data.updatedIds,
      updatedData: data.updatedData.select((x: any) => x.array).toArray(),
      updateReason: data.updateReason,
      removedIds: data.removedIds,
    }
  }

  getResponseData(request: any, session: any): ResponseData {
    const header = session.getHeader(true)
    const responseData = session
      .getLinq(request.parameters)
      .select(x => x.array)
      .toArray()
    const response: ResponseData = {
      data: responseData,
    }

    request.parameters.requestId = request.requestId

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

  createSession(this: GenericDB, config: SessionConfig): any {
    const tesseract = this.evH.get(config.table)

    if (tesseract?.businessDelete) {
      config.permanentFilter = (config.permanentFilter || []).concat([
        {
          field: 'is_deleted',
          comparison: '!=',
          value: true,
        },
      ])
    }

    return this.evH.createSession(config, true)
  }

  getTableNames(query: SessionConfig): string[] {
    return _.uniq(
      [
        ...(typeof query.table === 'string'
          ? [query.table]
          : this.getTableNames(query.table as any)),
        ...(query.columns ? query.columns : [])
          .filter(x => x.resolve && x.resolve.childrenTable)
          .map(x => x.resolve!.childrenTable!),
        ...Object.values(query.subSessions || {}).map(x =>
          this.getTableNames(x),
        ),
      ].flat(),
    )
  }
}
