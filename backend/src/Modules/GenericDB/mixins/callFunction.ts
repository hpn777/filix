import { Subscription } from '../../../Model/subscriptions'
import { Module as GenericDB } from '../index'
import sanitizeString from './utils/sanitizeString'
import { CommonHelpers } from './utils/commonHelpers'

type DataItem = { [key: string]: string | number | boolean | null }

export class CallFunction {
  CallFunction(this: GenericDB, request, subscription: Subscription): void {
    const { functionName, functionParameter } = request.parameters

    const query = this.buildFunctionQuery(functionName, functionParameter)

    this.executeFunctionQuery(
      query,
      functionName,
      subscription,
      request.requestId,
    )
  }

  /**
   * Build SQL query for function call
   */
  buildFunctionQuery(
    this: GenericDB,
    functionName: string,
    functionParameter: string,
  ): string {
    return `SELECT * FROM ${sanitizeString(functionName)}('${sanitizeString(
      functionParameter,
    )}')`
  }

  /**
   * Execute function query and publish results - REFACTORED FOR ORM3
   */
  async executeFunctionQuery(
    this: GenericDB,
    query: string,
    functionName: string,
    subscription: Subscription,
    requestId: string,
  ): Promise<void> {
    try {
      const data: DataItem[] = await this.DBModels.execQuery<DataItem[]>(query)

      CommonHelpers.publishSuccess(
        subscription,
        requestId,
        {
          data: data,
          type: 'reset',
        },
      )
    } catch (err) {
      CommonHelpers.publishError(
        subscription,
        `Error while calling function: ${functionName}`,
      )
    }
  }
}
