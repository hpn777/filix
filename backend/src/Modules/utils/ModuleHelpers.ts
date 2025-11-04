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
  getModule(moduleName: string): Promise<any>
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
   * Publish error response with consistent format
   */
  static publishError(
    subscription: Subscription,
    message: string,
    requestId?: string,
    code?: string,
  ): void {
    const error = code ? { message, code } : { message }
    subscription.publishError(error, requestId || subscription.requestId)
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
   * Format process uptime as human-readable string
   */
  static formatUptime(totalSec: number): string {
    const days = Math.floor(totalSec / 86400)
    const hours = Math.floor((totalSec / 3600) % 24)
    const minutes = Math.floor((totalSec / 60) % 60)
    const seconds = Math.floor(totalSec % 60)
    return `${days}d. ${hours}h. ${minutes}m. ${seconds}s.`
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
   * Get hostname from environment or network interfaces
   */
  static getHostname(): string {
    if (process.env.HOSTNAME) {
      return process.env.HOSTNAME
    }

    const ifaces = os.networkInterfaces()
    if (ifaces.eth0 && ifaces.eth0.length > 0) {
      return ifaces.eth0[0].address
    }

    return '0.0.0.0'
  }

  /**
   * Safely get module from subscription manager
   */
  static async getModule<T = any>(
    subscriptionManager: SubscriptionManager,
    moduleName: string,
  ): Promise<T> {
    try {
      return await subscriptionManager.getModule(moduleName)
    } catch (error) {
      throw new Error(`Failed to load module '${moduleName}': ${error}`)
    }
  }

  /**
   * Create session with cleanup on subscription remove
   */
  static createSessionWithCleanup(
    evH: Cluster,
    config: CreateSessionParameters,
    subscription: Subscription,
    useEventHorizon: boolean = false,
  ): Session | null {
    let session: Session | undefined
    
    if (useEventHorizon) {
      session = evH.createSession(config, true)
    } else if (config.table) {
      const tesseract = evH.get(config.table)
      session = tesseract?.createSession(config)
    }

    if (!session) {
      return null
    }

    subscription.on('remove', () => {
      session.destroy()
    })

    return session
  }
}
