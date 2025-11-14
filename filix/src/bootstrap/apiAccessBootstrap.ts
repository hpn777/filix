import { lodash as _ } from 'tessio'

import roles from '../fixtures/roles.json'
import systemTablesAccesses from '../fixtures/systemTablesAccesses.json'
import { SubscriptionManager } from '../subscriptionManager'
import { DataActions } from '../Modules/GenericDB'
import { GenericBaseModule } from '../Modules/base'
import { logger } from '../utils/logger'

export class ApiAccessBootstrap {
  private initialized = false

  public constructor(
    private config: any,
    private subscriptionManager: SubscriptionManager,
  ) {}

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (!this.config?.membership_module || !Array.isArray(this.config.modules)) {
      this.initialized = true
      return
    }

    try {
      const modules = await this.loadConfiguredModules()
      const membershipDP: any = await this.subscriptionManager.resolveModule(
        this.config.membership_module,
      )

      if (!membershipDP?.evH || !membershipDP.dbModule) {
        logger.warn('Membership data provider not ready for API access bootstrap', {
          module: 'ApiAccessBootstrap',
        })
        this.initialized = true
        return
      }

      const apiAccess = membershipDP.evH.get('api_access')

      if (!apiAccess) {
        this.initialized = true
        return
      }

      const data: Array<{ id: string; audit: boolean }> = []

      modules.forEach(module => {
        const moduleAny = module as any
        const publicMethods = moduleAny.publicMethods
        publicMethods.forEach((_item, attr) => {
          if (!moduleAny.config?.id) {
            return
          }

          const accessId = `${moduleAny.config.id}.${attr}`

          if (!apiAccess.getById(accessId)) {
            data.push({
              id: accessId,
              audit: false,
            })
          }

          const dataActions = Object.values(DataActions) as Array<string>

          if (dataActions.includes(attr)) {
            if (!moduleAny.DBModels) {
              return
            }

            moduleAny.DBModels.getTableNames().forEach((tableName: string) => {
              const tableAccessId = `${moduleAny.config.id}.${attr}.${tableName}`

              if (!apiAccess.getById(tableAccessId)) {
                data.push({
                  id: tableAccessId,
                  audit: ([DataActions.SetData, DataActions.RemoveData] as Array<string>).includes(
                    attr,
                  ),
                })
              }
            })
          }
        })
      })

      membershipDP.dbModule.save('api_access', data, (err, apiAccesses) => {
        if (err) {
          logger.error('Failed to save api_access data', {
            module: 'ApiAccessBootstrap',
            error: err,
          })
          throw new Error(err)
        }

        const apiRoleAccesses = membershipDP.dbModule.evH
          .get('api_access_app_role')
          .getData()

        if (_.isEmpty(apiRoleAccesses)) {
          this.saveAllRolesAccesses(apiAccesses, membershipDP)
        }
      })
    } catch (error) {
      logger.error(`API access bootstrap failed: ${error}`, {
        module: 'ApiAccessBootstrap',
      })
    } finally {
      this.initialized = true
    }
  }

  private async loadConfiguredModules(): Promise<GenericBaseModule[]> {
    const result: GenericBaseModule[] = []

    for (const moduleConfig of this.config.modules) {
      if (!moduleConfig?.id) {
        continue
      }

      try {
        const moduleInstance = await this.subscriptionManager.resolveModule<GenericBaseModule>(
          moduleConfig.id,
        )
        if (moduleInstance) {
          result.push(moduleInstance)
        }
      } catch (error) {
        logger.error(`Failed to load module '${moduleConfig.id}' during bootstrap: ${error}`, {
          module: 'ApiAccessBootstrap',
        })
      }
    }

    return result
  }

  private saveAllRolesAccesses(apiAccesses: Array<any>, membershipDP: any) {
    let accesses: any[] = []
    const rolesDataCopy = JSON.parse(JSON.stringify(systemTablesAccesses))

    ;(roles as any[]).forEach((role: any) => {
      if (role.roleName === 'superadmin' && role.id === 1) {
        const items = apiAccesses.map(i => ({
          api_access_id: i.id,
          app_role_id: role.id,
        }))

        accesses = [...accesses, ...items]
      } else {
        if (!role.api_accesses) {
          return
        }

        role.api_accesses = [...rolesDataCopy, ...role.api_accesses]

        const roleAccesses = role.api_accesses.reduce((acc: any, apiAccess) => {
          const items = apiAccess.methods.map(method => ({
            api_access_id: `${apiAccess.module}.${method}.${apiAccess.name}`,
            app_role_id: role.id,
          }))
          acc = [...acc, ...items]

          return acc
        }, [])

        accesses = [...accesses, ...roleAccesses]
      }
    })

    membershipDP.dbModule.save('api_access_app_role', accesses, (err: unknown) => {
      if (err) {
        throw new Error(err as string)
      }
    })
  }
}
