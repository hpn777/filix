import { logger } from '../../utils'
import { lodash as _ } from 'tessio'
import { BaseModule, ModuleEndpoint } from '../base'
import { applyMixins } from '../../utils/mixins'
import { SqlEV } from './sqlEV'
import { DBModels } from './sqlModelGenerator'
import { GenericDBRequest } from './types'
import { CreateModule } from './mixins/createModule'
import { GetData } from './mixins/GetData'
import { GetColumnsDefinition } from './mixins/getColumnsDefinition'
import { SetData } from './mixins/setData'
import { RemoveData } from './mixins/removeData'
import { CallFunction } from './mixins/callFunction'

export const getAPIKey = request => {
  const queryEnding = '-query'
  if (request.parameters.tableName?.endsWith(queryEnding)) {
    request.parameters.tableName = request.parameters.tableName.slice(
      0,
      -queryEnding.length,
    )
  }

  return `${request.dataProviderId}.${request.parameters.command}.${request.parameters.tableName}`
}

export enum DataActions {
  GetData = 'GetData',
  SetData = 'SetData',
  RemoveData = 'RemoveData',
}

class Module extends BaseModule {
  // These are initialized in init() which is called immediately after construction
  // The definite assignment assertion (!) tells TypeScript they will be set before use
  public evH!: SqlEV
  public DBModels!: DBModels

  publicMethods: Map<string, ModuleEndpoint> = new Map([
    [DataActions.GetData, this.GetData],
    [DataActions.SetData, this.SetData],
    [DataActions.RemoveData, this.RemoveData],
    ['RemoveProxy', this.RemoveProxy],
    ['GetColumnsDefinition', this.GetColumnsDefinition],
    ['CreateModule', this.CreateModule],
    ['CallFunction', this.CallFunction],
  ])

  public async init(): Promise<BaseModule> {
    logger.info('Module initialized', {
      module: this.config.id,
    })

    const config = this.config

    if (config.db_config) {
      this.DBModels = new DBModels({
        config: config.db_config as any,
      })

      await this.DBModels.whenReady()

      this.evH = new SqlEV({
        DBModels: this.DBModels,
        namespace: this.config.moduleId,
        tessio: config.tessio as any,
        autofetch: config.autofetch as boolean,
      })

      if (config.autofetch) {
        await this.evH.whenReady()
      }
    }

    return this
  }

  getApiAccess(request: GenericDBRequest): Array<{ api_access_id: string; app_role_id: number }> {
    const membershipDP: any =
      this.subscriptionManager.getDefaultMembershipModule()
    if (!membershipDP) {
      return []
    }

    const apiAccessTesseract = membershipDP.evH.get('api_access_app_role')
    if (!apiAccessTesseract) {
      logger.warn('api_access_app_role tesseract not found', {
        module: this.config.id,
      })
      return []
    }

    return apiAccessTesseract
      .getLinq()
      .where(x => x.api_access_id === getAPIKey(request))
      .toArray()
  }

  validateRequest(request: GenericDBRequest, subscription: any): boolean {
    const membershipDP: any =
      this.subscriptionManager.getDefaultMembershipModule()
    
    if (!membershipDP) {
      logger.warn('Membership module not found for request validation', {
        module: this.config.id,
      })
      return false
    }

    // Check if the api_access entry exists and get enforce_role flag
    const apiAccessTesseract = membershipDP.evH.get('api_access')
    if (!apiAccessTesseract) {
      logger.warn('api_access tesseract not found', {
        module: this.config.id,
      })
      return false
    }

    const apiKey = getAPIKey(request)
    const apiAccessEntry = apiAccessTesseract.getById(apiKey)
    
    // If no api_access entry exists, deny access
    if (!apiAccessEntry) {
      return false
    }

    // If enforce_role is false or null, allow access to any authenticated user
    if (!apiAccessEntry.enforce_role) {
      return true
    }


    // If enforce_role is true, check user roles against api_access_app_role
    const apiAccessInstance = this.getApiAccess(request)
    if (!apiAccessInstance.length) {
      return false
    }

    const userRolesTesseract = membershipDP.evH.get('user_roles')
    if (!userRolesTesseract) {
      logger.warn('user_roles tesseract not found', {
        module: this.config.id,
      })
      return false
    }

    return userRolesTesseract
      .getLinq()
      .any(
        x =>
          x.user_id === subscription.userId &&
          !!apiAccessInstance.some(ar => ar.app_role_id === x.roles_id),
      )
  }

  async runDBQuery(sessionQuery): Promise<any[]> {
    const result = await this.DBModels.sessionQuery(sessionQuery)
    return result?.data || []
  }
}

interface Module
  extends CreateModule,
    GetData,
    GetColumnsDefinition,
    SetData,
    CallFunction,
    RemoveData {}

applyMixins(Module, [
  CreateModule,
  GetData,
  GetColumnsDefinition,
  SetData,
  RemoveData,
  CallFunction,
])
export { Module }
