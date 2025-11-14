import { AwilixContainer, asFunction, asValue } from 'awilix'

import { lodash as _ } from 'tessio'
import { BaseModule, GenericBaseModule, ModuleConstructor } from './Modules/base'
import { Subscriptions, Subscription } from './Model/subscriptions'
import { logger } from './utils/logger'

class SubscriptionManager {
  subscriptions = new Subscriptions()
  connections: any[] = []
  modules: GenericBaseModule[] = []
  moduleName: string = 'SubscriptionManager'
  private moduleConfigs: Map<string, any> = new Map()
  private modulePromises: Map<string, Promise<GenericBaseModule>> = new Map()

  public constructor(private config: any, private container: AwilixContainer) {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    if (!config) {
      logger.error('App Service config is missing or invalid.', {
        module: this.moduleName,
      })

      return
    }

    if (Array.isArray(config.modules)) {
      config.modules.forEach(moduleConfig => {
        if (!moduleConfig?.id) {
          return
        }

        this.moduleConfigs.set(moduleConfig.id, moduleConfig)
        this.registerModuleFactory(moduleConfig.id)
      })
    }
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

  private getModuleToken(moduleId: string) {
    return `module:${moduleId}`
  }

  private registerModuleFactory(moduleId: string) {
    const token = this.getModuleToken(moduleId)

    if (!this.container.hasRegistration(token)) {
      this.container.register({
        [token]: asFunction(() => this.getModule(moduleId)).singleton(),
      })
    }
  }

  private registerModuleInstance(moduleId: string, instance: GenericBaseModule) {
    const token = this.getModuleToken(moduleId)

    this.container.register({
      [token]: asValue(instance),
    })
  }

  // INFO: pass whole module to avoid finding by id
  async getModule(moduleId) {
    if (!this.modulePromises.has(moduleId)) {
      const loader = this.loadModule(moduleId)
      this.modulePromises.set(moduleId, loader)
    }

    try {
      const moduleInstance = await this.modulePromises.get(moduleId)!
      return moduleInstance
    } catch (error) {
      this.modulePromises.delete(moduleId)
      throw error
    }
  }

  private async loadModule(moduleId: string): Promise<GenericBaseModule> {
    const existing = this.modules[moduleId]
    if (existing) {
      return existing
    }

    const moduleConfig = this.moduleConfigs.get(moduleId)

    if (!moduleConfig) {
      logger.error(
        `Data Provider Exception: Config for Data Provider ${moduleId} has not been found.`,
        { module: this.moduleName },
      )

      throw new Error(`Module config missing for ${moduleId}`)
    }

    try {
      let ModuleCtor: ModuleConstructor | undefined = moduleConfig.module_class as
        | ModuleConstructor
        | undefined

      if (!ModuleCtor && moduleConfig.module_path) {
        const importedModule = await import(moduleConfig.module_path)
        ModuleCtor =
          (importedModule as any).Module ??
          (importedModule as any).default ??
          undefined
      }

      if (!ModuleCtor) {
        throw new Error(
          `Module '${moduleId}' does not provide module_class or module_path`,
        )
      }

      const moduleInstance = new ModuleCtor(moduleConfig, this)
      moduleConfig.module_class = ModuleCtor
      this.modules[moduleConfig.id] = moduleInstance
      await moduleInstance.init()
      this.registerModuleInstance(moduleConfig.id, moduleInstance)

      return moduleInstance
    } catch (error) {
      logger.error(`Data Provider ${moduleId} Exception: ${error}`, {
        module: this.moduleName,
      })

      throw error
    }
  }

  public async resolveModule<T = any>(moduleId: string): Promise<T> {
    const token = this.getModuleToken(moduleId)

    if (this.container.hasRegistration(token)) {
      const resolved = this.container.resolve(token) as T | Promise<T>
      return resolved instanceof Promise ? await resolved : resolved
    }

    return (await this.getModule(moduleId)) as unknown as T
  }

  public getDefaultMembershipModule() {
    return this.modules[this.config.membership_module]
  }
}

export { SubscriptionManager }
