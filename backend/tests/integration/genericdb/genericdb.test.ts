import path from 'path'
import { describe, beforeAll, afterAll, it, expect } from 'vitest'

import { SubscriptionManager } from '../../../src/subscriptionManager'
import type { Module as GenericDBModule } from '../../../src/Modules/GenericDB'
import type { Module as MembershipModule } from '../../../src/Modules/Membership'
import { Subscription } from '../../../src/Model/subscriptions'
import { getConfiguration } from '../../../src/utils/getConfiguration'

interface AppConfigFile {
  services: {
    ui: Record<string, any>
  }
}

type GenericRequest = {
  requestId: string
  userId: number
  dataProviderId: string
  parameters: Record<string, any>
}

const ADMIN_USER_ID = 1
const CONFIG_PATH = path.resolve(__dirname, '../../../config/test.yml')
const APP_DB_ID = 'AppDB'
const MEMBERSHIP_ID = 'Membership'

let subscriptionManager: SubscriptionManager
let genericDB: GenericDBModule
let membershipModule: MembershipModule

async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 20000,
  intervalMs = 250,
): Promise<void> {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    if (await condition()) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timeout while waiting for condition to be met')
}

async function getNextRoleId(): Promise<number> {
  const result = await genericDB.DBModels.execQuery<Array<{ next?: string | number }>>(
    'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM app_role',
  )

  const nextValue = result?.[0]?.next
  const numericValue = typeof nextValue === 'string' ? Number(nextValue) : nextValue

  if (typeof numericValue === 'number' && Number.isFinite(numericValue)) {
    return numericValue
  }

  return Math.floor(Math.random() * 100000) + 100
}

function loadServiceConfig(): Record<string, any> {
  const configuration = getConfiguration({
    configurationFilePath: CONFIG_PATH,
    moduleName: 'GenericDBIntegrationTests',
  }) as AppConfigFile | null

  if (!configuration?.services?.ui) {
    throw new Error('Failed to load UI service configuration for tests')
  }

  const serviceConfig = { ...configuration.services.ui }

  if (Array.isArray(configuration.services.ui.modules)) {
    const modules = [...configuration.services.ui.modules]
    const priorityOrder = [APP_DB_ID, MEMBERSHIP_ID]
    modules.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.id)
      const bIdx = priorityOrder.indexOf(b.id)

      if (aIdx === -1 && bIdx === -1) {
        return 0
      }
      if (aIdx === -1) {
        return 1
      }
      if (bIdx === -1) {
        return -1
      }
      return aIdx - bIdx
    })

    const excludedModules = new Set(['ServerManager', 'WebSocketServer'])
    serviceConfig.modules = modules.filter(module => !excludedModules.has(module.id))
  }

  return serviceConfig
}

interface SubscriptionOverrides {
  id?: string
  requestId?: string
  moduleId?: string
  userId?: number | string
  publish?: (data: unknown, requestId?: string) => void
  publishError?: (error: unknown, requestId?: string) => void
}

function createSubscription(overrides: SubscriptionOverrides = {}): Subscription {
  const numericUserId =
    typeof overrides.userId === 'number'
      ? overrides.userId
      : (overrides.userId !== undefined ? Number(overrides.userId) : ADMIN_USER_ID)

  const base = new Subscription({
    id: overrides.id ?? `sub-${Date.now()}`,
    requestId: overrides.requestId ?? `req-${Date.now()}`,
    moduleId: overrides.moduleId ?? APP_DB_ID,
    userId: numericUserId,
    publish: overrides.publish ?? (() => {}),
    publishError: overrides.publishError ?? (() => {}),
  })

  return base
}

describe('GenericDB module integration', () => {
  beforeAll(async () => {
    const runningInDocker = process.env.IN_DOCKER === 'true'
    if (!process.env.DB_HOST) {
      process.env.DB_HOST = runningInDocker ? 'postgrestest' : 'localhost'
    }
    if (!process.env.DB_PORT) {
      process.env.DB_PORT = '5432'
    }
    if (!process.env.DB_NAME) {
      process.env.DB_NAME = 'appData'
    }
    if (!process.env.DB_USER) {
      process.env.DB_USER = 'filix_user'
    }
    if (!process.env.DB_PASSWORD) {
      process.env.DB_PASSWORD = 'filix_pass'
    }

    const serviceConfig = loadServiceConfig()
    subscriptionManager = new SubscriptionManager(serviceConfig)

  const genericModule = await subscriptionManager.getModule(APP_DB_ID)
    if (!genericModule) {
      throw new Error('GenericDB module failed to load')
    }

    genericDB = genericModule as unknown as GenericDBModule
    await genericDB.DBModels.whenReady()
    await genericDB.evH.whenReady()

  const membership = await subscriptionManager.getModule(MEMBERSHIP_ID)
    if (!membership) {
      throw new Error('Membership module failed to load')
    }

    membershipModule = membership as unknown as MembershipModule
    await membershipModule.dbModule.DBModels.whenReady()
    await membershipModule.dbModule.evH.whenReady()

    await waitFor(() => {
      const tesseract = membershipModule.evH.get('api_access_app_role')
      return Boolean(tesseract && !tesseract.isRemote)
    })

    await waitFor(() => {
      const tesseract = genericDB.evH.get('app_role')
      return Boolean(tesseract && !tesseract.isRemote)
    })
  }, 30000)

  afterAll(async () => {
    if (!genericDB) {
      return
    }

    const db: any = (genericDB.DBModels as any).db
    if (db?.close) {
      await db.close().catch(() => {})
    }

    const pgSubscriber = genericDB.DBModels.pgSubscriber
    if (pgSubscriber?.close) {
      await pgSubscriber.close().catch(() => {})
    }
  })

  it('returns table data via GetData', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-getdata',
      requestId: 'req-getdata',
      publish: (data, requestId) => {
        responses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`GetData publishError: ${JSON.stringify(error)}`)
      },
    })

    const request: GenericRequest = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      dataProviderId: APP_DB_ID,
      parameters: {
        command: 'GetData',
        tableName: 'app_role',
      },
    }

    await genericDB.GetData(request as any, subscription)

    expect(responses.length).toBeGreaterThan(0)
    const payload = responses[0].data
    expect(payload?.type).toBe('reset')
    expect(Array.isArray(payload?.data)).toBe(true)
    expect(payload.data.length).toBeGreaterThan(0)
    expect(payload.header.some((column: any) => column.name === 'id')).toBe(true)
  })

  it('creates and removes records via SetData and RemoveData', async () => {
    const roleId = await getNextRoleId()
    const roleName = `integration_role_${roleId}_${Date.now()}`
    const successResponses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-setdata',
      requestId: 'req-setdata',
      publish: (data, requestId) => {
        successResponses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`SetData publishError: ${JSON.stringify(error)}`)
      },
    })

    const setDataRequest: GenericRequest = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      dataProviderId: APP_DB_ID,
      parameters: {
        command: 'SetData',
        tableName: 'app_role',
        data: {
          id: roleId,
          roleName,
          isNewRow: true,
        },
      },
    }

    await genericDB.SetData(setDataRequest as any, subscription)

    expect(successResponses.length).toBeGreaterThan(0)
    expect(successResponses[0].data).toEqual({ success: true })

    const appRoleCache = genericDB.evH.get('app_role')
    expect(appRoleCache).toBeTruthy()

    await waitFor(
      () => Boolean(appRoleCache?.getById(roleId)),
      10000,
      250,
    )

    const dbCheck = await genericDB.DBModels.sessionQuery({
      tableName: 'app_role',
      where: { id: roleId },
    })

    expect(dbCheck.data.length).toBe(1)
    const [insertedRecord] = dbCheck.data as Array<{ id: number }>
    expect(insertedRecord?.id).toBe(roleId)

    const removalResponses: Array<{ data: any; requestId?: string }> = []
    const removalSubscription = createSubscription({
      id: 'sub-removedata',
      requestId: 'req-removedata',
      publish: (data, requestId) => {
        removalResponses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`RemoveData publishError: ${JSON.stringify(error)}`)
      },
    })

    const removeRequest: GenericRequest = {
      requestId: removalSubscription.requestId,
      userId: ADMIN_USER_ID,
      dataProviderId: APP_DB_ID,
      parameters: {
        command: 'RemoveData',
        tableName: 'app_role',
        data: [roleId],
      },
    }

    await genericDB.RemoveData(removeRequest as any, removalSubscription)

    expect(removalResponses.length).toBeGreaterThan(0)
    expect(removalResponses[0].data).toEqual({ success: true })

    await waitFor(
      () => !appRoleCache?.getById(roleId),
      10000,
      250,
    )

    const dbCheckAfterRemoval = await genericDB.DBModels.sessionQuery({
      tableName: 'app_role',
      where: { id: roleId },
    })
    expect(dbCheckAfterRemoval.data.length).toBe(0)
  })

  it('denies access when user lacks ACL permissions', async () => {
    const username = `unauth_${Date.now()}`
    const [createdUserResult] = (await membershipModule.dbModule.save('user_data', {
      userName: username,
      password: 'plain-password',
      email: `${username}@test.local`,
      displayName: 'Unauthorized User',
      active: true,
    })) as any[]

    const newUserId = Number(createdUserResult?.id ?? createdUserResult?.user_id)
    if (!newUserId) {
      throw new Error('Failed to create unauthorized test user')
    }

    const errors: unknown[] = []
    const subscription = createSubscription({
      id: 'sub-unauthorized',
      requestId: 'req-unauthorized',
      userId: newUserId,
      publish: () => {
        throw new Error('Unauthorized request should not publish data')
      },
      publishError: error => {
        errors.push(error)
      },
    })

    const request: GenericRequest = {
      requestId: subscription.requestId,
      userId: newUserId,
      dataProviderId: APP_DB_ID,
      parameters: {
        command: 'GetData',
        tableName: 'app_role',
      },
    }

    await genericDB.GetData(request as any, subscription)

    expect(errors.length).toBe(1)
    const errorPayload = errors[0] as { message?: string }
    expect(errorPayload?.message).toContain('Insufficient access rights')

    const cleanupResponses: any[] = []
    const cleanupSubscription = createSubscription({
      id: 'sub-cleanup-user',
      requestId: 'req-cleanup-user',
      publish: data => cleanupResponses.push(data),
      publishError: err => {
        throw new Error(`Cleanup failed: ${JSON.stringify(err)}`)
      },
    })

    await genericDB.RemoveData(
      {
        requestId: cleanupSubscription.requestId,
        userId: ADMIN_USER_ID,
        dataProviderId: APP_DB_ID,
        parameters: {
          command: 'RemoveData',
          tableName: 'user_data',
          data: [newUserId],
        },
      } as any,
      cleanupSubscription,
    )

    expect(cleanupResponses[0]).toEqual({ success: true })

    const userCache = membershipModule.evH.get('user_data')
    expect(userCache?.getById(newUserId)).toBeUndefined()
  })

  it('executes stored functions through CallFunction', async () => {
    await genericDB.DBModels.execQuery(`
      CREATE OR REPLACE FUNCTION public.test_genericdb_callfunction(p_input text)
      RETURNS TABLE(result text) AS $$
      BEGIN
        RETURN QUERY SELECT CONCAT('echo:', p_input);
      END;
      $$ LANGUAGE plpgsql;
    `)

    try {
      const responses: Array<{ data: any; requestId?: string }> = []
      const subscription = createSubscription({
        id: 'sub-callfunction',
        requestId: 'req-callfunction',
        publish: (data, requestId) => {
          responses.push({ data, requestId })
        },
        publishError: err => {
          throw new Error(`CallFunction publishError: ${JSON.stringify(err)}`)
        },
      })

      const request: GenericRequest = {
        requestId: subscription.requestId,
        userId: ADMIN_USER_ID,
        dataProviderId: APP_DB_ID,
        parameters: {
          command: 'CallFunction',
          functionName: 'test_genericdb_callfunction',
          functionParameter: 'payload',
        },
      }

  await genericDB.CallFunction(request as any, subscription)

  await waitFor(() => responses.length > 0)
  expect(responses.length).toBe(1)
      const payload = responses[0].data
      expect(payload?.type).toBe('reset')
      expect(payload?.data?.[0]?.result).toBe('echo:payload')
    } finally {
      await genericDB.DBModels.execQuery(
        `DROP FUNCTION IF EXISTS public.test_genericdb_callfunction(text);`,
      )
    }
  })
})
