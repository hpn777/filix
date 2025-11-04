import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import { WebSocketServer } from 'ws'

import { BaseModule } from './base'
import { SubscriptionManager } from '../subscriptionManager'
import { logger } from '../utils/logger'
import { ModuleHelpers } from './utils/ModuleHelpers'

export class Module extends BaseModule {
  moduleName: string = 'WebSocketServer'

  public constructor(config: any, subscriptionManager: SubscriptionManager) {
    super(config, subscriptionManager)
  }

  public init(): Promise<BaseModule> {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    const config = this.config
    return new Promise((resolve, reject) => {
      if (config === undefined) {
        reject('Undefined config')
        return
      }

      const app = this.createServer(config)
      const wss = this.setupWebSocketServer(app)

      resolve(this)
    })
  }

  private createServer(config: any): any {
    const host = config.host || '0.0.0.0'

    if (config.key && config.cert) {
      const sslConfig = {
        ...config,
        key: fs.readFileSync(config.key, 'utf8'),
        cert: fs.readFileSync(config.cert, 'utf8'),
        host,
      }
      return https.createServer(sslConfig).listen(sslConfig)
    } else {
      return http.createServer().listen({ ...config, host })
    }
  }

  private setupWebSocketServer(app: any): WebSocketServer {
    let seed = 1
    const wss = new WebSocketServer({ server: app })
    const connections: any = this.subscriptionManager.connections

    logger.info(`WebSocket started on port: ${this.config.port}`, {
      module: this.moduleName,
    })

    wss.on('connection', socket => {
      const connectionId = seed++
      connections[connectionId] = socket

      socket.on('message', message => {
        this.handleMessage(message, connectionId)
      })

      socket.on('close', () => {
        this.subscriptionManager.UnsubscribeClient(connectionId)
      })

      socket.on('error', error => {
        this.handleSocketError(error)
      })
    })

    return wss
  }

  private handleMessage(message: any, connectionId: number): void {
    try {
      const request = JSON.parse(message.toString())
      request.clientId = connectionId
      request.connectionType = 'ws'
      
      const command = this.subscriptionManager[request.serverCommand]
      if (typeof command === 'function') {
        command.call(this.subscriptionManager, request)
      } else {
        logger.error(`Unknown command: ${request.serverCommand}`, {
          module: this.moduleName,
          availableCommands: Object.keys(this.subscriptionManager).filter(
            k => typeof this.subscriptionManager[k] === 'function'
          ),
        })
      }
    } catch (error) {
      logger.error(`Failed to handle WebSocket message: ${error}`, {
        module: this.moduleName,
        message: message.toString().substring(0, 100),
      })
    }
  }

  private handleSocketError(error: Error): void {
    logger.error(`WebSocket connection error: ${error}`, {
      module: this.moduleName,
    })
  }
}
