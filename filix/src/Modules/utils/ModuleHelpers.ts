/**
 * Common helper functions shared across all modules
 * This utility class provides standardized patterns for:
 * - Tesseract validation and retrieval
 * - Subscription publishing (success/error)
 * - Session management
 * - Network interface resolution
 */

import * as os from 'os'
import { Subscription } from '../../Model/subscriptions'
import { Cluster, Tesseract } from 'tessio'
import { Session } from 'tessio/dist/lib/session'
import { CreateSessionParameters } from 'tessio/dist/types'

// Type definitions for module helpers
interface HostConfig {
  hostName?: string
  interface?: string
  host?: string
}

interface DataUpdateEvent {
  toJSON(): string
}

interface SubscriptionManager {
  resolveModule<T = any>(moduleName: string): Promise<T>
}

export class ModuleHelpers {
  /**
   * Get tesseract with validation
   */
  static getTesseract(
    evH: Cluster,
    tableName: string,
    subscription: Subscription,
    errorMessage?: string,
  ): Tesseract | null {
    const tesseract = evH.get(tableName)
    if (!tesseract) {
      const message = errorMessage || `${tableName} tesseract not found`
      subscription.publishError({ message }, subscription.requestId)
      return null
    }
    return tesseract
  }

  /**
   * Publish success response
   */
  static publishSuccess(
    subscription: Subscription,
    requestId: string,
    data?: unknown,
  ): void {
    subscription.publish(data ?? null, requestId)
  }

  /**
   * Create and setup a session with dataUpdate handler
   */
  static setupSession(
    tesseract: Tesseract,
    config: CreateSessionParameters,
    subscription: Subscription,
    request: { requestId: string },
  ): Session {
    const session = tesseract.createSession(config)

    session.on(
      'dataUpdate',
      (data: DataUpdateEvent) => {
        subscription.publish(data.toJSON(), request.requestId)
      },
      subscription,
    )

    subscription.on('remove', () => {
      session.destroy()
    })

    subscription.publish(
      {
        addedData: session.getData(),
      },
      request.requestId,
    )

    return session
  }

  /**
   * Get host address from network interfaces or config
   */
  static getHostAddress(config: HostConfig): string {
    if (config.hostName) {
      return config.hostName
    }

    if (config.host && config.host !== '0.0.0.0') {
      return config.host
    }

    if (config.interface) {
      const ifaces = os.networkInterfaces()
      const iface = ifaces[config.interface]
      if (iface && iface.length > 0) {
        return iface[0].address
      }
    }

    // Try eth0 as fallback
    const ifaces = os.networkInterfaces()
    if (ifaces.eth0 && ifaces.eth0.length > 0) {
      return ifaces.eth0[0].address
    }

    return '0.0.0.0'
  }

  /**
   * Split message by line breaks (cross-platform)
   */
  static splitMessage(message: string): string[] {
    if (message.indexOf('\r\n') > 0) {
      // Windows
      return message.split('\r\n')
    }
    // Linux/Mac
    return message.split('\n')
  }

  /**
   * Safely get module from subscription manager
   */
  static async getModule<T = any>(
    subscriptionManager: SubscriptionManager,
    moduleName: string,
  ): Promise<T> {
    try {
      if (typeof subscriptionManager.resolveModule !== 'function') {
        throw new Error('Subscription manager does not support resolveModule')
      }

      return await subscriptionManager.resolveModule<T>(moduleName)
    } catch (error) {
      throw new Error(`Failed to load module '${moduleName}': ${error}`)
    }
  }
}
