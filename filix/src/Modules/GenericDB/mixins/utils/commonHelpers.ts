import { Subscription } from '../../../../Model/subscriptions'
import { Module as GenericDB, getAPIKey } from '../../index'
import { Tesseract } from '../../../../types/tessio'

/**
 * Shared helper functions for GenericDB mixins
 */
export class CommonHelpers {
  /**
   * Validate request access rights
   */
  static async validateRequestAccess(
    module: GenericDB,
    request: any,
    subscription: Subscription,
  ): Promise<boolean> {
    const requestValid = await module.validateRequest(request, subscription)

    if (!requestValid) {
      subscription.publishError({
        message: `Insufficient access rights to call: ${getAPIKey(request)}`,
      })
      return false
    }

    return true
  }

  /**
   * Get tesseract with error handling
   */
  static getTesseract(
    evH: any,
    tableName: string,
    subscription: Subscription,
  ): Tesseract | null {
    const tesseract = evH.get(tableName)

    if (!tesseract) {
      subscription.publishError({ 
        message: `Table "${tableName}" not found` 
      })
      return null
    }

    return tesseract
  }

  /**
   * Validate table name is provided
   */
  static validateTableName(
    tableName: string | undefined,
    subscription: Subscription,
    errorMessage: string = 'table name missing',
  ): boolean {
    if (!tableName) {
      subscription.publishError({ message: errorMessage })
      return false
    }
    return true
  }

  /**
   * Publish success response
   */
  static publishSuccess(
    subscription: Subscription,
    requestId: string,
    data: any = { success: true },
  ): void {
    subscription.publish(data, requestId)
  }

  /**
   * Publish error response
   */
  static publishError(
    subscription: Subscription,
    message: string,
    code?: string,
  ): void {
    const error: any = { message }
    if (code) {
      error.code = code
    }
    subscription.publishError(error)
  }
}
