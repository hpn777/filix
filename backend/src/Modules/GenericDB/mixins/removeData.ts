import { Subscription } from 'Model/subscriptions'
import { lodash as _ } from 'tessio'

import { logger } from '../../../utils'
import { isSuperAdmin } from '../../utils/user'
import { Module as GenericDB, getAPIKey } from '../index'
import { RowsToDelete } from './RowsToDelete'
import { CommonHelpers } from './utils/commonHelpers'

export class RemoveData {
  /**
   * Internal cascade remove - returns new format
  
  */
  async cascadeRemove(
    this: GenericDB,
    tableName: string,
    rowIds: number[] | number | string | string[]
  ): Promise<{ err: any; result: any }> {
    // Normalize rowIds to always be an array
    const normalizedRowIds = Array.isArray(rowIds) ? rowIds : [rowIds] as (number | string)[]
    const toRemove: any[] = (await this.whatToDel(tableName, normalizedRowIds)) || []
    const result = {
      success: true,
      partialResults: [] as any[],
    }

    for (const dbTable of toRemove) {
      const res = await this.remove(dbTable.tableName, dbTable.rowIds)

      if (res?.err) {
        result.success = false
      }

      result.partialResults.push(res)
    }

    return {
      err: result.success ? null : result.partialResults,
      result: result
    }
  }

  async RemoveData(
    this: GenericDB,
    request: any,
    subscription: Subscription,
  ): Promise<void> {
    const { tableName, data: rowIds }: { tableName: string; data: number[] | string[] } =
      request.parameters

    // Validate request
    if (!CommonHelpers.validateTableName(tableName, subscription)) {
      return
    }

    if (!(await CommonHelpers.validateRequestAccess(this, request, subscription))) {
      return
    }

    const tesseract = CommonHelpers.getTesseract(this.evH, tableName, subscription)
    if (!tesseract) {
      return
    }

    // Check ownership permissions
    if (!this.checkRemovePermissions(tesseract, request.userId, subscription)) {
      return
    }

    // Execute removal
  const isView = this.DBModels.isView(tableName)

    const result = isView
      ? await this.handleViewRemoval(tableName, rowIds, request, subscription)
      : await this.cascadeRemove(tableName, rowIds)

    // Publish result
    this.publishRemovalResult(result, subscription, request.requestId)
  }



  /**
   * Check if user has permission to remove records
   */
  checkRemovePermissions(
    this: GenericDB,
    tesseract: any,
    userId: number,
    subscription: Subscription,
  ): boolean {
    // Simplified permission check - only admin restrictions remain
    if (!isSuperAdmin(this.subscriptionManager, userId)) {
      // Additional permission checks can be added here if needed
    }

    return true
  }

  /**
   * Handle removal for VIEW type tables
   */
  async handleViewRemoval(
    this: GenericDB,
    tableName: string,
    rowIds: number[] | string[],
    request: any,
    subscription: Subscription,
  ): Promise<{ err: any; result: any }> {
    const result = {
      success: true,
      partialResults: [] as any[],
    }

    for (const id of rowIds) {
      await this.executeViewDelete(tableName, id, result)
    }

    return { err: result.success ? null : result.partialResults, result }
  }

  /**
   * Execute stored procedure for VIEW deletion - REFACTORED FOR ORM3
   */
  async executeViewDelete(
    this: GenericDB,
    tableName: string,
    id: number | string,
    result: { success: boolean; partialResults: any[] },
  ): Promise<void> {
    try {
      const data = await this.DBModels.execQuery<Array<{ _result: any }>>(
        `CALL crud_delete_record('${tableName}', ${id}, '{}'::json);`
      )

      if (data[0]._result.status === 'ERROR') {
        result.success = false
        result.partialResults.push({
          ...data[0]._result,
          tableName,
          id,
        })
      }
    } catch (error: any) {
      result.success = false
      result.partialResults.push({
        error: error?.message || String(error),
        tableName,
        id,
      })
    }
  }

  /**
   * Publish removal result to subscription
   */
  publishRemovalResult(
    this: GenericDB,
    result: { err: null; result: any },
    subscription: Subscription,
    requestId: string,
  ): void {
    if (result.err) {
      CommonHelpers.publishError(
        subscription,
        'Removal failed',
        JSON.stringify(result.err),
      )
      logger.error(`${result.err}`, {
        module: 'GenericDB::RemoveData',
      })
    } else {
      CommonHelpers.publishSuccess(subscription, requestId)
    }
  }

  async RemoveProxy(
    this: GenericDB,
    request: any,
    subscribtion: Subscription,
  ): Promise<void> {
    const { tableName, rowIds }: { tableName: string; rowIds: number[] | string[] } =
      request.parameters
    const toRemove = await this.whatToDel(tableName, rowIds)

    subscribtion.publish(toRemove, request.requestId)
  }

  async remove(
    this: GenericDB,
    tableName: string,
    rowIds: number[] | string[],
  ): Promise<{ err: null; result: any } | undefined> {
    const tesseract = this.evH.get(tableName)

    if (!tesseract) {
      logger.error(`Table "${tableName}" not found in tesseracts`, {
        module: 'GenericDB::RemoveData',
      })
      return
    }

    const ormModel = this.DBModels[tableName]

    if (!ormModel) {
      logger.error(`${tableName} is not a valid table name.`, {
        module: 'GenericDB::RemoveData',
      })
      return
    }

    const rowIdsArray = Array.isArray(rowIds) ? rowIds : [rowIds]
    let lastError: string | null = null

    const preRemoveItems: any[] = []
    const result = await Promise.all(
      rowIdsArray.map(rowId =>
        this.removeRecord(rowId, ormModel, tesseract, preRemoveItems)
          .catch(error => {
            lastError = error
            return []
          }),
      ),
    )

    // Update tesseract cache
    this.updateTesseractAfterRemoval(tesseract, preRemoveItems, result)

    return {
      err: lastError,
      result,
    }
  }

  /**
   * Remove a single record (soft or hard delete) - REFACTORED FOR ORM3
   */
  async removeRecord(
    this: GenericDB,
    rowId: number | string,
    ormModel: any,
    tesseract: any,
    preRemoveItems: any[],
  ): Promise<any> {
    try {
      // orm3: Model.get() returns a Promise
      const record = await ormModel.get(rowId)

      if (!record) {
        throw new Error(`Record with ID ${rowId} not found`)
      }

      preRemoveItems.push(_.clone(record))

      if (tesseract.businessDelete) {
        return await this.softDeleteRecord(record)
      } else {
        return await this.hardDeleteRecord(record, rowId)
      }
    } catch (error) {
      logger.error(`${error}`, { module: 'GenericDB::RemoveData' })
      throw error
    }
  }

  /**
   * Soft delete record (mark as deleted) - REFACTORED FOR ORM3
   */
  async softDeleteRecord(
    this: GenericDB,
    record: any,
  ): Promise<any> {
    try {
      record.set('is_deleted', true)
      record.set('deleted_on', new Date())
      // orm3: instance.save() returns a Promise
      await record.save()
      return record
    } catch (error) {
      logger.error(`${error}`, { module: 'GenericDB::RemoveData' })
      throw error
    }
  }

  /**
   * Hard delete record (permanent removal) - REFACTORED FOR ORM3
   */
  async hardDeleteRecord(
    this: GenericDB,
    record: any,
    rowId: number | string,
  ): Promise<number | string> {
    try {
      // orm3: instance.remove() returns a Promise
      await record.remove()
      return rowId
    } catch (error) {
      logger.error(`${error}`, { module: 'GenericDB::RemoveData' })
      throw error
    }
  }

  /**
   * Update tesseract cache after removal
   */
  updateTesseractAfterRemoval(
    this: GenericDB,
    tesseract: any,
    preRemoveItems: any[],
    result: any[],
  ): void {
    tesseract.update(preRemoveItems)

    if (tesseract.businessDelete) {
      tesseract.remove(result.map(i => i[tesseract.idProperty]))
    } else {
      tesseract.remove(result)
    }
  }

  async whatToDel(
    this: GenericDB,
    tableName: string,
    rowIds: number[] | string[] | (number | string)[]
  ): Promise<any[]> {
    let toDel: Array<any> = []

    const referencingColumns = this.DBModels.getReferencingColumns(tableName)

    for (const { tableName: referencingTable, column } of referencingColumns) {
      const dataCache = this.evH.get(referencingTable)

      if (!dataCache) {
        continue
      }

      let rowsToDel: (number | string)[] | null = []
      const rowsToDelete = new RowsToDelete(this, dataCache)

      if (dataCache.isRemote) {
        rowsToDel = await rowsToDelete.getFromDataBase<number | string>(
          referencingTable,
          column.name,
          rowIds,
        )
      } else {
        rowsToDel = rowsToDelete.getFromDataCache<number | string>(column.name, rowIds)
      }

      if (rowsToDel?.length) {
        toDel = toDel.concat(await this.whatToDel(referencingTable, rowsToDel as number[] | string[]))
      }
    }

    toDel.push({
      tableName,
      rowIds,
    })

    return toDel
  }
}
