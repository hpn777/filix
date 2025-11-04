import { Subscription } from 'Model/subscriptions'
import { Module as GenericDB, getAPIKey } from '../index'
import { isSuperAdmin } from '../../utils/user'
import { logger } from '../../../utils/logger'
import { CommonHelpers } from './utils/commonHelpers'

export class SetData {
  async SetData(this: GenericDB, request: any, subscription: Subscription) {
    const { tableName, query, data: record } = request.parameters

    // Validate request parameters
    if (!this.validateSetDataRequest(query, tableName, subscription)) {
      return
    }

    // Validate access rights
    if (!(await CommonHelpers.validateRequestAccess(this, request, subscription))) {
      return
    }

    const tesseract = CommonHelpers.getTesseract(this.evH, tableName, subscription)
    if (!tesseract) {
      return
    }

    // Validate ownership if required
    if (!this.validateRecordOwnership(
      record,
      tesseract,
      request.userId,
      subscription,
    )) {
      return
    }

    // Save the record
    try {
      await this.save(tableName, record)
      CommonHelpers.publishSuccess(subscription, request.requestId)
    } catch (err: any) {
      CommonHelpers.publishError(subscription, err.message)
    }
  }

  /**
   * Validate basic request parameters
   */
  validateSetDataRequest(
    this: GenericDB,
    query: any,
    tableName: string,
    subscription: Subscription,
  ): boolean {
    if (query || !tableName) {
      CommonHelpers.publishError(subscription, 'Cannot set data!')
      return false
    }
    return true
  }

  /**
   * Validate record ownership permissions
   */
  validateRecordOwnership(
    this: GenericDB,
    record: any,
    tesseract: any,
    userId: number,
    subscription: Subscription,
  ): boolean {
    // Record ownership checks removed - simplified validation
    const isSystemAdmin = isSuperAdmin(this.subscriptionManager, userId)
    const existingRecord = tesseract.getById(record[tesseract.idProperty])

    if (existingRecord) {
      return this.validateExistingRecordOwnership(
        existingRecord,
        isSystemAdmin,
        subscription,
      )
    } else {
      return this.handleNewRecordOwnership(record)
    }
  }

  /**
   * Validate ownership for existing records
   */
  validateExistingRecordOwnership(
    this: GenericDB,
    existingRecord: any,
    isSystemAdmin: boolean,
    subscription: Subscription,
  ): boolean {
    // Simplified ownership validation - admin can modify all records
    if (!isSystemAdmin && existingRecord.record_holder_id) {
      CommonHelpers.publishError(subscription, 'Only owner can set the data')
      return false
    }

    return true
  }

  /**
   * Handle ownership for new records
   */
  handleNewRecordOwnership(
    this: GenericDB,
    record: any,
  ): boolean {
    // Simplified - no automatic ownership assignment
    return true
  }

  async save(this: GenericDB, modelName: string, data: any): Promise<any[]> {
    const tesseract = this.evH.get(modelName)

    if (!tesseract) {
      throw new Error(`Table "${modelName}" not found`)
    }

    const primaryKey = this.getPrimaryKey(modelName)
    const ormModel = this.DBModels[modelName]
    const dataArray = Array.isArray(data) ? data : [data]

    const updatedData = await this.saveRecords(
      dataArray,
      ormModel,
      tesseract,
      primaryKey,
    )

    // Update tesseract cache
    const validData = updatedData.filter(d => !!d[primaryKey])
    if (validData.length > 0) {
      tesseract.update(validData)
    }

    return updatedData
  }

  /**
   * Get primary key for a model
   */
  getPrimaryKey(this: GenericDB, modelName: string): string {
    return this.DBModels.getPrimaryKeyColumn(modelName)
  }

  /**
   * Save multiple records (create or update)
   */
  async saveRecords(
    this: GenericDB,
    dataArray: any[],
    ormModel: any,
    tesseract: any,
    primaryKey: string,
  ): Promise<any[]> {
    return Promise.all(
      dataArray.map(item =>
        this.saveRecord(item, ormModel, tesseract, primaryKey),
      ),
    )
  }

  /**
   * Save a single record (create or update)
   */
  async saveRecord(
    this: GenericDB,
    item: any,
    ormModel: any,
    tesseract: any,
    primaryKey: string,
  ): Promise<any> {
    // Mark as not deleted for business delete pattern
    if (tesseract.businessDelete) {
      item.is_deleted = false
    }

    const isUpdate = !item.isNewRow && item[primaryKey] !== undefined

    if (isUpdate) {
      return this.updateExistingRecord(item, ormModel, primaryKey)
    } else {
      return this.createNewRecord(item, ormModel)
    }
  }

  /**
   * Update an existing record - REFACTORED FOR ORM3
   */
  async updateExistingRecord(
    this: GenericDB,
    item: any,
    ormModel: any,
    primaryKey: string,
  ): Promise<any> {
    try {
      // orm3: Model.get() returns a Promise
      const record = await ormModel.get(item[primaryKey])
      
      if (record) {
        // orm3: instance.save() returns a Promise
        const response = await record.save(item)
        return response
      } else {
        // Record not found, create new one
        return await this.createNewRecord(item, ormModel)
      }
    } catch (error: any) {
      if (error?.literalCode === 'NOT_FOUND' || error?.code === 'NOT_FOUND' || error?.code === 2) {
        logger.warn('Record not found when updating, creating a new record instead', {
          module: 'GenericDB::SetData',
          item,
        })
        return this.createNewRecord(item, ormModel)
      }

      logger.error(`Failed to update record: ${error}`, {
        module: 'GenericDB::SetData',
        item,
      })
      throw error
    }
  }

  /**
   * Create a new record - REFACTORED FOR ORM3
   */
  async createNewRecord(this: GenericDB, item: any, ormModel: any): Promise<any> {
    try {
      // orm3: Model.create() returns a Promise
      const response = await ormModel.create(item)
      return response
    } catch (error) {
      logger.error(`Failed to create record: ${error}`, {
        module: 'GenericDB::SetData',
        item,
      })
      throw error
    }
  }
}
