import { Subscription } from 'Model/subscriptions'

import { BaseModule } from '../base'
import { TcpCommandPort } from './TcpCommandPort'
import { logger } from '../../utils/logger'
import { ModuleHelpers } from '../utils/ModuleHelpers'

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
      hostName: ModuleHelpers.getHostname(),
      processUptime: ModuleHelpers.formatUptime(process.uptime()),
      memoryUsage: process.memoryUsage(),
      modules: this.getModulesList(),
    }
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
