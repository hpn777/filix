import path from 'path'
import crypto from 'crypto'
import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest'

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

interface SubscriptionOverrides {
  id?: string
  requestId?: string
  moduleId?: string
  userId?: number | string
  publish?: (data: unknown, requestId?: string) => void
  publishError?: (error: unknown, requestId?: string) => void
}

const ADMIN_USER_ID = 1
const CONFIG_PATH = path.resolve(__dirname, '../../../config/test.yml')
const APP_DB_ID = 'AppDB'
const MEMBERSHIP_ID = 'Membership'

let subscriptionManager: SubscriptionManager
let genericDB: GenericDBModule
let membershipModule: MembershipModule

const createdUserIds: number[] = []
const createdRoleIds: number[] = []

function normalizeBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase()
    if (['true', 't', '1'].includes(normalized)) {
      return true
    }
    if (['false', 'f', '0'].includes(normalized)) {
      return false
    }
  }

  return undefined
}

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

function loadServiceConfig(): Record<string, any> {
  const configuration = getConfiguration({
    configurationFilePath: CONFIG_PATH,
    moduleName: 'MembershipIntegrationTests',
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

function createSubscription(overrides: SubscriptionOverrides = {}): Subscription {
  const baseUserId =
    overrides.userId !== undefined
      ? String(overrides.userId)
      : `${ADMIN_USER_ID}`

  const base = new Subscription({
    id: overrides.id ?? `sub-${Date.now()}`,
    requestId: overrides.requestId ?? `req-${Date.now()}`,
    moduleId: overrides.moduleId ?? MEMBERSHIP_ID,
    userId: baseUserId,
  })

  const numericUserId =
    typeof overrides.userId === 'number'
      ? overrides.userId
      : Number(overrides.userId ?? ADMIN_USER_ID)

  if (!Number.isNaN(numericUserId)) {
    base.set('userId', numericUserId)
  }

  base.publish = overrides.publish ?? (() => {})
  base.publishError = overrides.publishError ?? (() => {})

  return base
}

async function getNextRoleId(): Promise<number> {
  const result = await membershipModule.dbModule.DBModels.execQuery<Array<{ next?: string | number }>>(
    'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM app_role',
  )

  const nextValue = result?.[0]?.next
  const numericValue = typeof nextValue === 'string' ? Number(nextValue) : nextValue

  if (typeof numericValue === 'number' && Number.isFinite(numericValue)) {
    return numericValue
  }

  return Math.floor(Math.random() * 100000) + 100
}

async function createTestRole(): Promise<{ id: number; roleName: string }> {
  const roleId = await getNextRoleId()
  const roleName = `integration_role_${roleId}_${Date.now()}`

  const [createdRole] = (await membershipModule.dbModule.save('app_role', {
    id: roleId,
    roleName,
    isNewRow: true,
  })) as Array<{ id: number }>

  if (!createdRole?.id) {
    throw new Error('Failed to insert test role')
  }

  createdRoleIds.push(roleId)

  await waitFor(() => Boolean(membershipModule.dbModule.evH.get('app_role')?.getById(roleId)))

  return { id: roleId, roleName }
}

async function createTestUser(overrides: Partial<{
  userName: string
  email: string
  displayName: string
  password: string
  active: boolean
}> = {}): Promise<{ id: number; userName: string; email: string; displayName: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
  const userName = overrides.userName ?? `integration_user_${suffix}`
  const email = overrides.email ?? `${userName}@test.local`
  const displayName = overrides.displayName ?? 'Integration User'
  const password = overrides.password ?? 'initial-password'
  const active = overrides.active ?? true

  const [createdUser] = (await membershipModule.dbModule.save('user_data', {
    userName,
    email,
    displayName,
    password,
    active,
  })) as Array<{ id: number }>

  const userId = Number(createdUser?.id)
  if (!userId) {
    throw new Error('Failed to insert test user')
  }

  createdUserIds.push(userId)

  await waitFor(() => Boolean(membershipModule.evH.get('user_data')?.getById(userId)))

  return { id: userId, userName, email, displayName }
}

describe('Membership module integration', () => {
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

    await waitFor(() => Boolean(membershipModule.evH.get('user_data')))
  }, 30000)

  afterEach(async () => {
    if (!membershipModule?.dbModule) {
      createdUserIds.length = 0
      createdRoleIds.length = 0
      return
    }

    while (createdUserIds.length) {
      const userId = createdUserIds.pop()!
      await membershipModule.dbModule.cascadeRemove('user_data', [userId])
      await waitFor(
        () => !membershipModule.evH.get('user_data')?.getById(userId),
        10000,
        200,
      ).catch(() => {})
    }

    while (createdRoleIds.length) {
      const roleId = createdRoleIds.pop()!
      await membershipModule.dbModule.cascadeRemove('app_role', [roleId])
      await waitFor(
        () => !membershipModule.dbModule.evH.get('app_role')?.getById(roleId),
        10000,
        200,
      ).catch(() => {})
    }
  })

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

  it('returns user data via GetAllUsers', async () => {
    const testUser = await createTestUser()
    const responses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-membership-getallusers',
      requestId: 'req-membership-getallusers',
      publish: (data, requestId) => {
        responses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`GetAllUsers publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await membershipModule.GetAllUsers(request as any, subscription)

    expect(responses.length).toBeGreaterThan(0)
    const payload = responses[0].data as { users?: Array<Record<string, any>> }
    expect(payload).toBeTruthy()
    const users = Array.isArray(payload?.users) ? payload.users : []
    expect(users.length).toBeGreaterThan(0)
    const userNames = users.map(user => user.userName)
    expect(userNames).toContain(testUser.userName)
  })

  it('returns roles via GetAllRoles', async () => {
    const role = await createTestRole()
    const responses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-membership-getallroles',
      requestId: 'req-membership-getallroles',
      publish: (data, requestId) => {
        responses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`GetAllRoles publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
    }

    await membershipModule.GetAllRoles(request as any, subscription)

    expect(responses.length).toBeGreaterThan(0)
    const payload = responses[0].data
    expect(Array.isArray(payload?.roles)).toBe(true)
    expect(JSON.stringify(payload.roles)).toContain(role.roleName)
  })

  it('updates user passwords and display names via UpdateUser', async () => {
    const testUser = await createTestUser()
    const responses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-membership-updateuser',
      requestId: 'req-membership-updateuser',
      publish: (data, requestId) => {
        responses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`UpdateUser publishError: ${JSON.stringify(error)}`)
      },
    })

    const newDisplayName = 'Updated Integration User'
    const newPassword = 'NewSecurePassword123!'
    const expectedHash = crypto.createHash('sha256').update(newPassword).digest('hex')

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        data: {
          id: testUser.id,
          userName: testUser.userName,
          displayName: newDisplayName,
          password: newPassword,
        },
      },
    }

    await membershipModule.UpdateUser(request as any, subscription)

    expect(responses.length).toBeGreaterThan(0)
    expect(responses[0].data).toEqual({ success: true })

    await waitFor(() => {
      const cachedUser = membershipModule.evH.get('user_data')?.getById(testUser.id)
      return cachedUser?.displayName === newDisplayName
    })

    const dbCheck = await membershipModule.dbModule.DBModels.sessionQuery({
      tableName: 'user_data',
      where: { id: testUser.id },
    })

    const [updatedRecord] = dbCheck.data as Array<Record<string, any>>
    const dbDisplayName = updatedRecord?.displayName ?? updatedRecord?.displayname
    expect(dbDisplayName).toBe(newDisplayName)
    expect(updatedRecord?.password).toBe(expectedHash)
  })

  it('deactivates other users but not the requesting user', async () => {
    const targetUser = await createTestUser({ displayName: 'Target User' })
    const subscription = createSubscription({
      id: 'sub-membership-deactivate',
      requestId: 'req-membership-deactivate',
      userId: ADMIN_USER_ID,
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        data: [targetUser.id],
      },
    }

    await membershipModule.DeactiveUser(request as any, subscription)

    await waitFor(() => {
      const cachedUser = membershipModule.evH.get('user_data')?.getById(targetUser.id)
      return normalizeBoolean(cachedUser?.active) === false
    })

    await waitFor(async () => {
      const dbCheckResult = await membershipModule.dbModule.DBModels.sessionQuery({
        tableName: 'user_data',
        where: { id: targetUser.id },
      })
      const [record] = dbCheckResult.data as Array<Record<string, any>>
      return normalizeBoolean(record?.active) === false
    })

    const selfUser = await createTestUser({ displayName: 'Self User' })
    const selfSubscription = createSubscription({
      id: 'sub-membership-deactivate-self',
      requestId: 'req-membership-deactivate-self',
      userId: selfUser.id,
    })

    const selfRequest = {
      requestId: selfSubscription.requestId,
      userId: selfUser.id,
      parameters: {
        data: [selfUser.id],
      },
    }

    await membershipModule.DeactiveUser(selfRequest as any, selfSubscription)

    await waitFor(
      () => {
        const cachedUser = membershipModule.evH.get('user_data')?.getById(selfUser.id)
        return normalizeBoolean(cachedUser?.active) !== false
      },
      5000,
      200,
    )

    await waitFor(async () => {
      const selfCheckResult = await membershipModule.dbModule.DBModels.sessionQuery({
        tableName: 'user_data',
        where: { id: selfUser.id },
      })
      const [selfRecord] = selfCheckResult.data as Array<Record<string, any>>
      return normalizeBoolean(selfRecord?.active) !== false
    }, 5000, 200)
  })

  it('streams user data via GetUsers with session management', async () => {
    const testUser = await createTestUser()
    const responses: Array<{ data?: any; requestId?: string; type?: string }> = []

    const subscription = createSubscription({
      id: 'sub-membership-getusers',
      requestId: 'req-membership-getusers',
      publish: (data: any, requestId) => {
        responses.push({ data, requestId, type: data?.type })
      },
      publishError: error => {
        throw new Error(`GetUsers publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await membershipModule.GetUsers(request as any, subscription)

    // Verify initial reset response
    await waitFor(() => responses.length > 0)
    const firstResponse = responses[0]
    expect(firstResponse.type).toBe('reset')
    expect(firstResponse.data?.header).toBeTruthy()
    expect(Array.isArray(firstResponse.data?.data)).toBe(true)

    const userNames = firstResponse.data.data.map((user: any) => user.userName)
    expect(userNames).toContain(testUser.userName)
  })

  it('returns column definitions for user_data table via GetColumnsDefinition', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []

    const subscription = createSubscription({
      id: 'sub-membership-coldef',
      requestId: 'req-membership-coldef',
      publish: (data, requestId) => {
        responses.push({ data, requestId })
      },
      publishError: error => {
        throw new Error(`GetColumnsDefinition publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tableName: 'user_data',
      },
    }

    await membershipModule.GetColumnsDefinition(request as any, subscription)

    expect(responses.length).toBeGreaterThan(0)
    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(Array.isArray(payload?.header)).toBe(true)
    expect(payload.type).toBe('reset')

    // Verify expected columns are present
    const columnNames = payload.header.map((col: any) => col.name)
    const expectedColumns = ['id', 'userName', 'email', 'displayName', 'active']
    expectedColumns.forEach(col => {
      expect(columnNames).toContain(col)
    })
  })

  it('removes users via RemoveData (RemoveUser)', async () => {
    const targetUser = await createTestUser({ displayName: 'User to Remove' })
    createdUserIds.pop() // Remove from cleanup list since we're explicitly testing removal

    const subscription = createSubscription({
      id: 'sub-membership-removeuser',
      requestId: 'req-membership-removeuser',
      userId: ADMIN_USER_ID,
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        data: [targetUser.id],
      },
    }

    // Execute the removal
    await membershipModule.RemoveUser(request as any, subscription)

    // Verify user is removed from cache
    const cachedUser = membershipModule.evH.get('user_data')?.getById(targetUser.id)
    expect(cachedUser).toBeFalsy()

    // Verify user is soft-deleted in database (is_deleted = true)
    const dbCheckResult = await membershipModule.dbModule.DBModels.sessionQuery({
      tableName: 'user_data',
      where: { id: targetUser.id, is_deleted: false },
    })
    expect((dbCheckResult.data as any[]).length).toBe(0)
  }, 20000)

  it('does not remove the requesting user via RemoveData', async () => {
    const selfUser = await createTestUser({ displayName: 'User Cannot Remove Self' })
    
    const selfSubscription = createSubscription({
      id: 'sub-membership-removeuser-self',
      requestId: 'req-membership-removeuser-self',
      userId: selfUser.id,
    })

    const request = {
      requestId: selfSubscription.requestId,
      userId: selfUser.id,
      parameters: {
        data: [selfUser.id],
      },
    }

    await membershipModule.RemoveUser(request as any, selfSubscription)

    // Verify user still exists in cache
    await waitFor(() => Boolean(membershipModule.evH.get('user_data')?.getById(selfUser.id)), 5000, 200)

    const cachedUser = membershipModule.evH.get('user_data')?.getById(selfUser.id)
    expect(cachedUser).toBeTruthy()
    expect(cachedUser?.id).toBe(selfUser.id)

    // Verify user still exists in database
    const dbCheckResult = await membershipModule.dbModule.DBModels.sessionQuery({
      tableName: 'user_data',
      where: { id: selfUser.id },
    })
    expect((dbCheckResult.data as any[]).length).toBeGreaterThan(0)
  })
})
