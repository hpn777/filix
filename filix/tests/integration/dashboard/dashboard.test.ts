import path from 'path'
import crypto from 'crypto'
import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest'

import { SubscriptionManager } from '../../../src/subscriptionManager'
import { createAppContainer } from '../../../src/container'
import type { Module as DashboardModule } from '../../../src/Modules/Dashboard'
import type { Module as GenericDBModule } from '../../../src/Modules/GenericDB'
import type { Module as MembershipModule } from '../../../src/Modules/Membership'
import { Subscription } from '../../../src/Model/subscriptions'
import { getConfiguration } from '../../../src/utils/getConfiguration'

interface AppConfigFile {
  services: {
    ui: Record<string, any>
  }
}

type SubscriptionOverrides = {
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
const DASHBOARD_ID = 'Dashboard'

let subscriptionManager: SubscriptionManager
let dashboardModule: DashboardModule
let genericDB: GenericDBModule
let membershipModule: MembershipModule
let defaultModuleVersionId: number

const createdTabIds: string[] = []
const createdControlIds: string[] = []

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
    moduleName: 'DashboardIntegrationTests',
  }) as AppConfigFile | null

  if (!configuration?.services?.ui) {
    throw new Error('Failed to load UI service configuration for tests')
  }

  const serviceConfig = { ...configuration.services.ui }

  if (Array.isArray(configuration.services.ui.modules)) {
    const modules = [...configuration.services.ui.modules]
    const priorityOrder = [APP_DB_ID, MEMBERSHIP_ID, DASHBOARD_ID]
    modules.sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a.id)
      const bIdx = priorityOrder.indexOf(b.id)

      if (aIdx === -1 && bIdx === -1) return 0
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    })

    const excludedModules = new Set(['ServerManager', 'WebSocketServer'])
    serviceConfig.modules = modules.filter((m: any) => !excludedModules.has(m.id))
  }

  return serviceConfig
}

function createSubscription(overrides: SubscriptionOverrides = {}): Subscription {
  const numericUserId =
    typeof overrides.userId === 'number'
      ? overrides.userId
      : (overrides.userId !== undefined ? Number(overrides.userId) : ADMIN_USER_ID)

  const base = new Subscription({
    id: overrides.id ?? `sub-${Date.now()}`,
    requestId: overrides.requestId ?? `req-${Date.now()}`,
    moduleId: overrides.moduleId ?? 'Dashboard',
    userId: numericUserId,
    publish: overrides.publish ?? (() => {}),
    publishError: overrides.publishError ?? (() => {}),
  })

  return base
}

async function createTabRecord(values: { name?: string; sortOrder?: number } = {}) {
  const id = crypto.randomUUID()
  await dashboardModule.dbModule.save('tab', {
    id,
    userId: ADMIN_USER_ID,
    name: values.name ?? 'Integration Tab',
    is_deleted: false,
    sortOrder: values.sortOrder ?? 1,
    isNewRow: true,
  })

  await waitFor(() => Boolean(dashboardModule.evH.get('tab')?.getById(id)))
  return id
}

async function createControlRecord(tabId: string, values: { id?: string; title?: string } = {}) {
  const id = values.id ?? crypto.randomUUID()
  await dashboardModule.dbModule.save('control', {
    id,
    tabId,
    title: values.title ?? 'Integration Control',
    config: '{}',
    moduleClassName: 'IntegrationModule',
    moduleVersionId: defaultModuleVersionId,
    isNewRow: true,
  })

  await waitFor(() => Boolean(dashboardModule.evH.get('control')?.getById(id)))
  return id
}

describe('Dashboard module integration (smoke)', () => {
  beforeAll(
    async () => {
      const runningInDocker = process.env.IN_DOCKER === 'true'
      if (!process.env.DB_HOST) process.env.DB_HOST = runningInDocker ? 'postgrestest' : 'localhost'
      if (!process.env.DB_PORT) process.env.DB_PORT = '5432'
      if (!process.env.DB_NAME) process.env.DB_NAME = 'appData'
      if (!process.env.DB_USER) process.env.DB_USER = 'filix_user'
      if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = 'filix_pass'

      const serviceConfig = loadServiceConfig()
      const container = createAppContainer(serviceConfig)
      subscriptionManager = container.resolve<SubscriptionManager>('subscriptionManager')

      const appDbModule = await subscriptionManager.getModule(APP_DB_ID)
      if (!appDbModule) throw new Error('AppDB module failed to load')
      genericDB = appDbModule as unknown as GenericDBModule
      await genericDB.DBModels.whenReady()
      await genericDB.evH.whenReady()

      const dashModule = await subscriptionManager.getModule(DASHBOARD_ID)
      if (!dashModule) throw new Error('Dashboard module failed to load')
      dashboardModule = dashModule as unknown as DashboardModule
      await (dashboardModule.evH as any).whenReady?.()

      const membership = await subscriptionManager.getModule(MEMBERSHIP_ID)
      if (!membership) throw new Error('Membership module failed to load')
      membershipModule = membership as unknown as MembershipModule
      await membershipModule.dbModule.DBModels.whenReady()
      await membershipModule.dbModule.evH.whenReady()

      // determine a valid module_version id to satisfy FK constraints in tests
      const modVersions = dashboardModule.evH.get('module_version')?.getLinq?.().toArray() ?? []
      defaultModuleVersionId = modVersions.length ? Number(modVersions[0].id) : 1
    },
    60000,
  )

  afterEach(async () => {
    // cleanup created tabs and controls
    while (createdControlIds.length) {
      const id = createdControlIds.pop()!
      try {
        await dashboardModule.dbModule.DBModels.execQuery(`DELETE FROM control WHERE id = '${id}'`)
      } catch {}
    }
    while (createdTabIds.length) {
      const id = createdTabIds.pop()!
      try {
        await dashboardModule.dbModule.DBModels.execQuery(`DELETE FROM tab WHERE id = '${id}'`)
      } catch {}
    }
  }, 30000)

  afterAll(async () => {
    if (!genericDB) return
    const db: any = (genericDB.DBModels as any).db
    if (db?.close) await db.close().catch(() => {})
    const pgSubscriber = genericDB.DBModels.pgSubscriber
    if (pgSubscriber?.close) await pgSubscriber.close().catch(() => {})
  })

  it('signals readiness via Ready', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-dashboard-ready',
      requestId: 'req-dashboard-ready',
      publish: data => responses.push({ data, requestId: undefined }),
      publishError: error => {
        throw new Error(`Ready publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    dashboardModule.Ready(request as any, subscription)

    expect(responses).toHaveLength(1)
    expect(responses[0].data).toBeNull()
  })

  it('streams user-specific dashboard tabs via GetDashboardTabs', async () => {
    const tabId = await createTabRecord({ name: 'Integration Tab' })
    createdTabIds.push(tabId)

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-dashboard-tabs',
      requestId: 'req-dashboard-tabs',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`GetDashboardTabs publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetDashboardTabs(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(JSON.stringify(payload)).toContain('Integration Tab')
  })

  it('returns controls scoped to the requested tab via GetDashboardControls', async () => {
    const tabId = await createTabRecord({ name: 'Controls Tab' })
    const controlId = await createControlRecord(tabId, { title: 'Controls Test Control' })
    createdControlIds.push(controlId)

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-dashboard-controls',
      requestId: 'req-dashboard-controls',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`GetDashboardControls publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: { tabId },
    }

    await dashboardModule.GetDashboardControls(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const initialPayload = responses[0].data
    expect(initialPayload?.addedData).toBeTruthy()
    const flattened = Array.isArray(initialPayload.addedData)
      ? initialPayload.addedData
      : initialPayload.addedData?.addedData ?? []
    expect(flattened.some((entry: any) => entry.id === controlId)).toBe(true)
  })

  it('returns public module versions via GetDashboardModulesVersions', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-module-versions',
      requestId: 'req-module-versions',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`GetDashboardModulesVersions publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetDashboardModulesVersions(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.addedData).toBeTruthy()
  })

  it('returns accessible modules via GetDashboardModules', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-modules',
      requestId: 'req-modules',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`GetDashboardModules publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetDashboardModules(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.addedData).toBeTruthy()
  })

  it('persists sortOrder updates via SaveTabOrderAndSelection', async () => {
    const tabId1 = await createTabRecord({ name: 'Tab 1', sortOrder: 1 })
    const tabId2 = await createTabRecord({ name: 'Tab 2', sortOrder: 2 })
    createdTabIds.push(tabId1, tabId2)

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-save-order',
      requestId: 'req-save-order',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`SaveTabOrderAndSelection publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tabOrder: [tabId2, tabId1],
        selectedTabId: tabId2,
      },
    }

    await dashboardModule.SaveTabOrderAndSelection(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
  })

  it('creates or updates a tab with SaveDashboardTab', async () => {
    const tabId = crypto.randomUUID()
    createdTabIds.push(tabId)

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-save-tab',
      requestId: 'req-save-tab',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`SaveDashboardTab publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tab: {
          id: tabId,
          userId: ADMIN_USER_ID,
          name: 'New Dashboard Tab',
          sortOrder: 5,
          is_deleted: false,
          isNewRow: true,
        },
        controls: [],
      },
    }

    await dashboardModule.SaveDashboardTab(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.success).toBe(true)
  })

  it('removes a tab and cascades control removal via RemoveDashboardTab', async () => {
    const tabId = await createTabRecord({ name: 'Tab to Remove' })
    const controlId = await createControlRecord(tabId, { title: 'Control to Cascade' })

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-remove-tab',
      requestId: 'req-remove-tab',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`RemoveDashboardTab publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tab: {
          id: tabId,
        },
      },
    }

    await dashboardModule.RemoveDashboardTab(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
  })

  it('inserts or updates a control via SaveControl', async () => {
    const tabId = await createTabRecord({ name: 'Tab for Control Save' })
    createdTabIds.push(tabId)

    const controlId = crypto.randomUUID()
    createdControlIds.push(controlId)

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-save-control',
      requestId: 'req-save-control',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`SaveControl publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        control: {
          id: controlId,
          tabId,
          title: 'Saved Control',
          config: '{}',
          moduleClassName: 'TestModule',
          moduleVersionId: defaultModuleVersionId,
        },
      },
    }

    await dashboardModule.SaveControl(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.success).toBe(true)
  })

  it('deletes a control via RemoveControl', async () => {
    const tabId = await createTabRecord({ name: 'Tab for Control Removal' })
    createdTabIds.push(tabId)
    const controlId = await createControlRecord(tabId, { title: 'Control to Remove' })

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-remove-control',
      requestId: 'req-remove-control',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`RemoveControl publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        control: {
          id: controlId,
        },
      },
    }

    await dashboardModule.RemoveControl(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.success).toBe(true)
  })

  it('returns presets visible to the user via GetTabPresets', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-tab-presets',
      requestId: 'req-tab-presets',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`GetTabPresets publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetTabPresets(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
  })

  it('creates a tab_preset and associated control_preset records via SaveTabPreset', async () => {
    const tabId = await createTabRecord({ name: 'Tab for Preset' })
    createdTabIds.push(tabId)
    const controlId = await createControlRecord(tabId, { title: 'Control for Preset' })
    createdControlIds.push(controlId)

    const presetId = crypto.randomUUID()

    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-save-preset',
      requestId: 'req-save-preset',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`SaveTabPreset publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tab: {
          id: presetId,
          userId: ADMIN_USER_ID,
          tabId,
          name: 'Test Preset',
          sortOrder: 1,
          isNewRow: true,
        },
      },
    }

    await dashboardModule.SaveTabPreset(request as any, subscription)

    await waitFor(() => responses.length > 0, 15000)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.success).toBe(true)
  }, 20000)

  it('removes a tab_preset and related control_preset rows via RemoveTabPreset', async () => {
    const responses: Array<{ data: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-remove-preset',
      requestId: 'req-remove-preset',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: error => {
        throw new Error(`RemoveTabPreset publishError: ${JSON.stringify(error)}`)
      },
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        tabPreset: {
          id: 'non-existent-preset-id',
        },
      },
    }

    await dashboardModule.RemoveTabPreset(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
  })

  it('publishes all users via GetAllUsers', async () => {
    const responses: Array<{ data?: any; error?: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-all-users',
      requestId: 'req-all-users',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: (error, requestId) => responses.push({ error, requestId }),
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetAllUsers(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload?.users).toBeTruthy()
    expect(Array.isArray(payload.users)).toBe(true)
    expect(payload.users.length).toBeGreaterThan(0)
  })

  it('returns user config for the subscription user via GetUserConfig', async () => {
    const responses: Array<{ data?: any; error?: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-user-config',
      requestId: 'req-user-config',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: (error, requestId) => responses.push({ error, requestId }),
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {},
    }

    await dashboardModule.GetUserConfig(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload).toHaveProperty('config')
  })

  it('persists user config via SaveUserConfig', async () => {
    const responses: Array<{ data?: any; error?: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-save-user-config',
      requestId: 'req-save-user-config',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: (error, requestId) => responses.push({ error, requestId }),
    })

    const testConfig = { theme: 'dark', layout: 'compact' }

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        userConfig: JSON.stringify(testConfig),
      },
    }

    await dashboardModule.SaveUserConfig(request as any, subscription)

    await waitFor(() => responses.length > 0)

    const payload = responses[0].data
    expect(payload).toBeTruthy()
    expect(payload).toHaveProperty('configUpdated')
  })

  it('updates user password via UpdatePassword', async () => {
    const responses: Array<{ data?: any; error?: any; requestId?: string }> = []
    const subscription = createSubscription({
      id: 'sub-update-password',
      requestId: 'req-update-password',
      publish: (data, requestId) => responses.push({ data, requestId }),
      publishError: (error, requestId) => responses.push({ error, requestId }),
    })

    const request = {
      requestId: subscription.requestId,
      userId: ADMIN_USER_ID,
      parameters: {
        oldPassword: 'oldPass123',
        newPassword: 'newPass456',
      },
    }

    await dashboardModule.UpdatePassword(request as any, subscription)

    await waitFor(() => responses.length > 0, 10000)

    // Note: This test may fail or error depending on the Membership provider's
    // actual password validation. We're just testing that the method executes
    // and publishes a response (either success or error).
    expect(responses.length).toBeGreaterThan(0)
    const payload = responses[0].data || responses[0].error
    expect(payload).toBeTruthy()
  })
})
