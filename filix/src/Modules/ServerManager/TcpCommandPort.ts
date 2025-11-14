import * as net from 'net'

import { lodash as _ } from 'tessio'

import { Module as ServerMenager } from './'
import { Collection } from '../../Model/collection'
import { logger } from '../../utils/logger'
import { ModuleHelpers } from '../utils/ModuleHelpers'

export class TcpCommandPort {
  HOST
  moduleName: string = 'TcpCommandPort'

  constructor(public config: Record<string, any>, public serverManager: ServerMenager) {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    const connectionSessions = new Collection()

    const HOST = ModuleHelpers.getHostAddress(config)
    this.HOST = process.env.HOSTNAME || HOST

    const PORT = config.port || process.env.COMMAND_PORT || 1100
    const SLICE = config.slice || process.env.SLICENO || 0

    const welcomeMessage = `#appService@${this.HOST}(${SLICE}): `

    net
      .createServer(connection => {
        logger.info(
          `Client connected to Command Port: ${connection.remoteAddress}:${connection.remotePort}`,
          { module: this.moduleName },
        )

        connectionSessions.set(connection)
        connection.write(welcomeMessage)

        connection.on('data', data => {
          const message = data.toString()

          this.processRequest(message, (err, response) => {
            if (response) {
              connection.write(`${response}\r\n${welcomeMessage}`)
            }
          })
        })

        connection.on('error', data => {
          logger.error('Comand Port error:', {
            module: this.moduleName,
            objectOrArray: data,
          })
        })
      })
      .listen(PORT, HOST, () => {
        // 'listening' listener
        logger.info(`Command Port started on: ${HOST}:${PORT}`, {
          module: this.moduleName,
        })
      })
  }

  processRequest(message: string, callbackFn: (err: Error | null, response: string) => void): void {
    const messagesArray = ModuleHelpers.splitMessage(message)

    _.each(messagesArray, (item: string) => {
      if (item) {
        const response = this.processCommand(item)
        callbackFn(null, response)
      }
    })
  }

  private processCommand(item: string): string {
    const messageArray = item.split(' ')
    if (!messageArray.length) {
      return ''
    }

    const command = messageArray[0]
    const args = messageArray.slice(1)

    switch (command) {
      case 'status':
        return this.handleStatusCommand()
      case 'ls':
      case 'help':
        return this.handleHelpCommand()
      case 'restart':
        return this.handleRestartCommand(args)
      default:
        return 'Unrecognized command.'
    }
  }

  private handleStatusCommand(): string {
    const status = this.serverManager.getStatus()
    return `Up time: ${status.processUptime}\r\nMemory usage: ${JSON.stringify(status.memoryUsage)}\r\n`
  }

  private handleHelpCommand(): string {
    return 'status - service status\r\nls - available commands\r\nrestart = kill service\r\n'
  }

  private handleRestartCommand(args: string[]): string {
    if (args[0] && args[0] === this.HOST) {
      this.serverManager.reset()
      return ''
    }
    return 'Invalid host name.'
  }
}
