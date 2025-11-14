import { Subscription } from 'Model/subscriptions'
import os from 'os'

import { BaseModule } from '../base'
import { TcpCommandPort } from './TcpCommandPort'
import { logger } from '../../utils/logger'

export class Module extends BaseModule {
  init(): Promise<BaseModule> {
    new TcpCommandPort(this.config, this)

    setInterval(() => {
      this.resendStatus()
    }, 60000)

    return new Promise((resolve, reject) => {
      resolve(this as BaseModule)
    })
  }

  GetStatus(request, subscription: Subscription) {
    subscription.publish(this.getStatus(), request.requestId)
  }

  getStatus() {
    return {
      hostName: this.getHostname(),
      processUptime: this.formatUptime(process.uptime()),
      memoryUsage: process.memoryUsage(),
      modules: this.getModulesList(),
    }
  }

  private formatUptime(totalSec: number): string {
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec / 3600) % 24)
    const minutes = Math.floor((totalSec / 60) % 60)
    const seconds = Math.floor(totalSec % 60)
    return `${days}d. ${hours}h. ${minutes}m. ${seconds}s.`
  }

  private getHostname(): string {
    if (process.env.HOSTNAME) {
      return process.env.HOSTNAME
    }

    const ifaces = os.networkInterfaces()
    if (ifaces.eth0 && ifaces.eth0.length > 0) {
      return ifaces.eth0[0].address
    }

    return '0.0.0.0'
  }

  private getModulesList(): any[] {
    const modules: any[] = []
    for (const [attr, module] of Object.entries(this.subscriptionManager.modules)) {
      if (!module.config.private && module.publicMethods) {
        modules.push({
          moduleId: attr,
          publicMethods: Object.keys(module.publicMethods),
        })
      }
    }
    return modules
  }

  reset() {
    logger.info('Service has been terminated using command port.', {
      module: 'ServerManager',
    })
    process.kill(process.pid, 'SIGTERM')
  }

  resendStatus() {
    const { subscriptions } = this.subscriptionManager
    const status = this.getStatus()
    subscriptions.each((subscription: Subscription) => {
      if (subscription.get('moduleId') == 'ServerManager') {
        subscription.publish(status, subscription.requestId)
      }
    })
  }
}
