import roles from './fixtures/roles.json'
import systemTablesAccesses from './fixtures/systemTablesAccesses.json'

import { lodash as _ } from 'tessio'
import { BaseModule, GenericBaseModule } from './Modules/base'
import { Subscriptions, Subscription } from './Model/subscriptions'
import { logger } from './utils/logger'
import { DataActions } from './Modules/GenericDB'

class SubscriptionManager {
  subscriptions = new Subscriptions()
  connections: any[] = []
  modules: GenericBaseModule[] = []
  moduleName: string = 'SubscriptionManager'

  public constructor(private config: any) {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    if (!config) {
      logger.error('App Service config is missing or invalid.', {
        module: this.moduleName,
      })

      return
    }

    const getModules = async () => {
      let modules: Array<any> = []
      for (let i in config.modules) {
        const module = await this.getModule(config.modules[i].id)
        modules.push(module)
      }

      const membershipDP: any = await this.getDefaultMembershipModule()

      const apiAccess = membershipDP.evH.get('api_access')

      if (!apiAccess) {
        // TODO: Prawdopodobnie warto tutaj rzucić logiem
        return
      }

      const data: Array<{ id: string; audit: boolean }> = []

      modules.forEach(module => {
        const publicMethods = module.publicMethods
        publicMethods.forEach((item, attr) => {
          if (!module.config.id) {
            return
          }

          const accessId = `${module.config.id}.${attr}`

          if (!apiAccess.getById(accessId)) {
            data.push({
              id: accessId,
              audit: false,
            })
          }

          if (Object.values(DataActions).includes(attr)) {
            if (!module.DBModels) {
              // TODO: Prawdopodobnie warto tutaj rzucić logiem
              return
            }

            module.DBModels.getTableNames().forEach(tableName => {
              const accessId = `${module.config.id}.${attr}.${tableName}`

              if (!apiAccess.getById(accessId)) {
                data.push({
                  id: accessId,
                  audit: [DataActions.SetData, DataActions.RemoveData].includes(
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
            module: this.moduleName,
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
    }

    getModules()
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
          // TODO: Prawdopodobnie warto tutaj rzucić logiem
          return
        }

        role.api_accesses = [...rolesDataCopy, ...role.api_accesses]

        const roleAccesses = role.api_accesses.reduce((acc: any, apiAccess) => {
          const accesses = apiAccess.methods.map(method => ({
            api_access_id: `${apiAccess.module}.${method}.${apiAccess.name}`,
            app_role_id: role.id,
          }))
          acc = [...acc, ...accesses]

          return acc
        }, [])

        accesses = [...accesses, ...roleAccesses]
      }
    })

    membershipDP.dbModule.save('api_access_app_role', accesses, (err, res) => {
      if (err) {
        // TODO: Prawdopodobnie warto tutaj rzucić logiem
        throw new Error(err)
      }
    })
  }

  public async Subscribe(request) {
    if (this.config.membership_module) {
      const membershipModule: any = this.getDefaultMembershipModule()

      try {
        const response = membershipModule.authenticate(request.userId, request.authToken)
        
        if (response) {
          let subscription: Subscription = this.subscriptions.set(
            {
              id: request.subscriptionId,
              requestId: request.requestId,
              clientId: request.clientId,
              containerId: request.containerId,
              moduleId: request.moduleId || request.dataProviderId,
              connectionType: request.connectionType,
              userId: request.userId,
              authToken: request.authToken,
            },
            { remove: false },
          ) as Subscription

          subscription.publish = this.createPublish(
            request.clientId,
            subscription,
          )

          subscription.publishError = this.createPublishError(
            request.clientId,
            subscription,
          )

          this.Execute(request)
        } else {
          this.PublishError(request, {
            message: 'Unauthorized access',
            code: -32401,
          })
        }
      } catch (err) {
        this.PublishError(request, {
          message: 'Unauthorized access',
          code: -32401,
        })
      }
    }
  }

  Unsubscribe(request) {
    this.clearSubscription(request.subscriptionId)
  }

  clearSubscription(subscriptionId) {
    (this.subscriptions.get(subscriptionId) as Subscription | undefined)?.remove()
  }

  public UnsubscribeContainer(request) {
    const { containerId } = request
    const subscriptions = this.subscriptions.filter((model: any) => 
      model.get('containerId') === containerId
    ) as Subscription[]

    _.each(subscriptions, subscription => {
      this.clearSubscription(subscription.id)
    })
  }

  public UnsubscribeClient(clientId) {
    (this.subscriptions
      .filter((model: any) => model.get('clientId') === clientId) as Subscription[])
      .forEach(subscription => {
        subscription.remove()
      })

    delete this.connections[clientId]
  }

  public Login(request) {
    const req = request
    const membership: any = this.getDefaultMembershipModule()

    membership
      .login(request.parameters.userName, request.parameters.password)
      .then(response => {
        this.Publish(req.clientId, {
          requestId: req.requestId,
          containerId: req.containerId,
          subscriptionId: req.subscriptionId,
          authToken: response.authToken,
          data: {
            user: response,
          },
          request: 'Login',
          success: true,
        })
      })
      .catch(err => {
        // TODO: Prawdopodobnie warto tutaj rzucić logiem
        this.PublishError(req, {
          message: err.message,
          code: -32401,
        })
      })
  }

  public Execute(request) {
    const subscription = this.subscriptions.get(
      request.subscriptionId,
    ) as Subscription

    if (!subscription) {
      // TODO: Prawdopodobnie warto tutaj rzucić logiem
      return
    }

    if (request.authToken !== subscription.authToken) {
      // TODO: Prawdopodobnie warto tutaj rzucić logiem
      subscription.publishError({
        message: 'Unauthorized access',
        code: -32401,
      })

      return
    }

    if (this.config.membership_module) {
      const moduleId = request.moduleId || request.dataProviderId
      const membershipDP: any = this.getDefaultMembershipModule()

      if (!membershipDP) {
        const errorMesage = `Error to execute ${request.parameters.command} in ${moduleId}: Membership module not loaded.`

        logger.error(errorMesage, { module: this.moduleName })
        subscription.publishError({ message: errorMesage })

        return
      }

      try {
        if (!request.parameters || !request.parameters.command) {
          // TODO: handle the case when command is missing
          // TODO: Prawdopodobnie warto tutaj rzucić logiem
          return
        }

        const apiKey = `${moduleId}.${request.parameters.command}.${request.parameters.tableName}`
        const apiAccessInstance = membershipDP.evH
          .get('api_access')
          .getById(apiKey)

        if (membershipDP.resolveACL(subscription.userId, apiKey)) {
          if (apiAccessInstance && apiAccessInstance.audit) {
            membershipDP.logApiAccess({
              request: JSON.stringify(request.parameters),
              api_access_id: apiKey,
              user_id: subscription.userId,
              timestamp: new Date(),
            })
          }

          const module: BaseModule = this.modules[subscription.moduleId]
          if (!module) {
            // TODO: Prawdopodobnie warto tutaj rzucić logiem
            subscription.publishError({
              message: `Module not supported: ${subscription.moduleId}`,
            })
          }

          const method = module?.publicMethods.get(request.parameters.command)
          if (method) {
            method.bind(module, request, subscription)()
          } else {
            // TODO: Prawdopodobnie warto tutaj rzucić logiem
            subscription.publishError({
              message: `Command not supported: ${request.parameters.command}`,
            })
          }
        } else {
          // TODO: Prawdopodobnie warto tutaj rzucić logiem
          subscription.publishError({
            message: `Insufficient access rights to call: ${apiKey}`,
          })
        }
      } catch (error) {
        logger.error(
          `Error to execute ${request.parameters.command} in ${moduleId}: ${error}`,
          { module: this.moduleName },
        )
        subscription.publishError({
          message: `Command: ${request.parameters.command} error: ${error}`,
        })
      }
    } else {
      try {
        if (request.parameters && request.parameters.command) {
          const module: any = this.modules[subscription.moduleId]

          module[request.parameters.command](request, subscription)
        }
      } catch (error) {
        logger.error(
          `Error to execute ${request.parameters.command} in ${request.moduleId}: ${error}`,
          { module: this.moduleName },
        )
        subscription.publishError({
          message: `Command: ${request.parameters.command} error: ${error}`,
        })
      }
    }
  }

  private createPublish(clientId, subscription: Subscription) {
    const connection: any = this.connections[clientId]

    return function (responseData, requestId = subscription.requestId) {
      const response = {
        requestId: requestId,
        containerId: subscription.containerId,
        subscriptionId: subscription.id,
        authToken: subscription.authToken,
        data: responseData,
        success: true,
      }

      const message = JSON.stringify(
        response,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
      )

      try {
        connection?.send(message)
      } catch {} // INFO: connection is already dead
    }
  }

  private createPublishError(clientId, subscription: Subscription) {
    const connection: any = this.connections[clientId]

    return function (err, requestId = subscription.requestId) {
      const response = {
        error: err,
        requestId: requestId,
        containerId: subscription.containerId,
        subscriptionId: subscription.id,
        success: false,
      }
      const message = JSON.stringify(response)

      try {
        connection?.send(message)
      } catch {} // INFO: connection is already dead
    }
  }

  private Publish(clientId, response) {
    const message = JSON.stringify(
      response,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    )
    const connection: any = this.connections[clientId]

    try {
      connection?.send(message)
    } catch {} // INFO: connection is already dead
  }

  private PublishError(request, response) {
    const connection: any = this.connections[request.clientId]
    const errorResponse = {
      error: response,
      requestId: request.requestId,
      containerId: request.containerId,
      subscriptionId: request.subscriptionId,
      success: false,
    }
    const errorMessage = JSON.stringify(errorResponse)

    try {
      connection?.send(errorMessage)
    } catch {} // INFO: connection is already dead
  }

  // INFO: pass whole module to avoid finding by id
  async getModule(moduleId) {
    const modules = this.modules

    if (!modules[moduleId]) {
      const moduleConfig = this.config.modules.find(m => m.id === moduleId)

      if (!moduleConfig) {
        logger.error(
          `Data Provider Exception: Config for Data Provider ${moduleId} has not been found.`,
          { module: this.moduleName },
        )

        return
      }

      try {
        const Module = (await import(moduleConfig.module_path))
          .Module as typeof GenericBaseModule

        const moduleInstance = new Module(moduleConfig, this)
        modules[moduleConfig.id] = moduleInstance
        await moduleInstance.init()
      } catch (error) {
        logger.error(`Data Provider ${moduleId} Exception: ${error}`, {
          module: this.moduleName,
        })

        throw error
      }
    }

    return modules[moduleId]
  }

  public getDefaultMembershipModule() {
    return this.modules[this.config.membership_module]
  }
}

export { SubscriptionManager }
