import * as crypto from 'crypto'
import Enumerable from 'linq'
import { lodash as _ , Cluster} from 'tessio'
import { Subscription } from 'Model/subscriptions'
import { BaseModule, ModuleEndpoint } from '../base'
import { BaseModuleRequest } from '../types'
import { Module as GenericDBModule } from '../GenericDB'
import { Module as MembershipModule } from '../Membership'
import { uiModuleLoader } from './uiModuleLoader'
import controlPresets from '../../fixtures/control_preset.json'
import tabPresets from '../../fixtures/tab_preset.json'
import { logger } from '../../utils/logger'
import { ModuleHelpers } from '../utils/ModuleHelpers'

interface DashboardRequestParameters {
  tabId?: string
  tab?: {
    id: string
    name: string
    description: string
    tabId: string
  }
  control?: { id: string }
  controls?: Array<{
    id: string
    name: string
    description: string
    type: string
    options: Array<{
      value: string
      label: string
    }>
  }>
  tabs?: Array<any>
  userConfig?: any
  oldPassword?: string
  newPassword?: string
  tabPreset?: { id: string }
}

type Request = BaseModuleRequest<DashboardRequestParameters> & {
  control?: { id: string }
}

export class Module extends BaseModule {
  evH!: Cluster
  dbModule!: GenericDBModule
  membershipProvider!: MembershipModule
  moduleName: string = 'Dashboard'

  publicMethods: Map<string, ModuleEndpoint> = new Map([
    ['Ready', this.Ready],
    ['GetDashboardTabs', this.GetDashboardTabs],
    ['GetDashboardControls', this.GetDashboardControls],
    ['GetDashboardModulesVersions', this.GetDashboardModulesVersions],
    ['GetDashboardModules', this.GetDashboardModules],
    ['SaveTabOrderAndSelection', this.SaveTabOrderAndSelection],
    ['SaveDashboardTab', this.SaveDashboardTab],
    ['RemoveDashboardTab', this.RemoveDashboardTab],
    ['SaveControl', this.SaveControl],
    ['RemoveControl', this.RemoveControl],
    ['GetTabPresets', this.GetTabPresets],
    ['SaveTabPreset', this.SaveTabPreset],
    ['RemoveTabPreset', this.RemoveTabPreset],
    ['GetAllUsers', this.GetAllUsers],
    ['GetUserConfig', this.GetUserConfig],
    ['SaveUserConfig', this.SaveUserConfig],
    ['UpdatePassword', this.UpdatePassword],
  ])

  public async init(): Promise<BaseModule> {
    logger.info('Module initialized', {
      module: this.moduleName,
    })

    this.membershipProvider = await ModuleHelpers.getModule(
      this.subscriptionManager,
      this.config.membership_module as string,
    )
    this.dbModule = await ModuleHelpers.getModule(
      this.subscriptionManager,
      this.config.db_module as string,
    )

    if (this.dbModule) {
      this.evH = this.dbModule.evH as Cluster
    }

    // Wait for event horizon to be ready before checking for existing data
    if (typeof (this.evH as any).whenReady === 'function') {
      await (this.evH as any).whenReady()
    }

    const codebaseUiModules = uiModuleLoader()
    const modules = this.evH.get('module')?.getData() ?? []
    const tabPresets = this.evH.get('tab_preset')?.getData() ?? []

    if (_.isEmpty(modules)) {
      logger.info('Reloading UI modules and presets from the codebase', {
        module: this.moduleName,
      })
      await this.reloadVersionsFromCodebase(codebaseUiModules)
    } else {
      logger.info(
        'Appending new UI modules and new modules versions from the codebase',
        { module: this.moduleName },
      )
      await this.appendMissingVersions(codebaseUiModules)
    }

    if (_.isEmpty(tabPresets)) {
      logger.info('Appending tab and control presets from the codebase', {
        module: this.moduleName,
      })
      await this.appendMissingPresets()
    }

    return new Promise((resolve, _reject) => {
      resolve(this)
    })
  }

  Ready(_request: Request, subscription: Subscription) {
    subscription.publish(null)
  }

  GetDashboardTabs(request: Request, subscription: Subscription) {
    const tesseract = ModuleHelpers.getTesseract(
      this.evH,
      'tab',
      subscription,
      'Tab tesseract not found',
    )
    if (!tesseract) return

    ModuleHelpers.setupSession(
      tesseract,
      {
        filter: [
          {
            field: 'userId',
            value: subscription.userId,
            comparison: '==',
          },
          {
            field: 'is_deleted',
            comparison: '!=',
            value: true,
          },
        ],
        sort: [
          {
            field: 'sortOrder',
            direction: 'ASC',
          },
        ],
      },
      subscription,
      request,
    )
  }

  GetDashboardControls(request: Request, subscription: Subscription) {
    let session = this.evH.createSession(
      {
        table: 'control',
        subSessions: {
          module_roles: {
            table: 'module_roles',
            subSessions: {
              user_roles: {
                table: 'user_roles',
                columns: [
                  {
                    name: 'roles_id',
                    primaryKey: true,
                  },
                  {
                    name: 'user_id',
                  },
                ],
                filter: [
                  {
                    field: 'user_id',
                    value: subscription.userId,
                    comparison: '==',
                  },
                ],
              },
            },
            columns: [
              {
                name: 'module_id',
                primaryKey: true,
              },
              {
                name: 'roles_id',
              },
              {
                name: 'user_role',
                resolve: {
                  underlyingField: 'roles_id',
                  session: 'user_roles',
                  displayField: 'roles_id',
                },
              },
            ],
            filter: [
              {
                field: 'user_role',
                value: null,
                comparison: '!=',
              },
            ],
          },
        },
        columns: [
          {
            name: 'id',
            primaryKey: true,
          },
          {
            name: 'title',
          },
          {
            name: 'config',
          },
          {
            name: 'tabId',
          },
          {
            name: 'moduleClassName',
          },
          {
            name: 'moduleVersionId',
          },
          {
            name: 'moduleId',
            resolve: {
              underlyingField: 'moduleVersionId',
              childrenTable: 'module_version',
              displayField: 'moduleId',
            },
          },
          {
            name: 'module_id_acl',
            resolve: {
              underlyingField: 'moduleId',
              session: 'module_roles',
              displayField: 'module_id',
            },
          },
        ],
        filter: [
          {
            field: 'tabId',
            value: request.parameters.tabId!,
            comparison: '==',
          },
          {
            field: 'module_id_acl',
            value: null,
            comparison: '!=',
          },
        ],
      },
      true,
    )

    // temp workaround to prevend disappering controls in UI
    // TODO: should be fixed in tessio
    session.on(
      'dataUpdate',
      data => {
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
  }

  GetDashboardModulesVersions(request: Request, subscription: Subscription) {
    let session = this.evH.createSession(
      {
        table: 'module_version',
        subSessions: {
          module_roles: {
            table: 'module_roles',
            subSessions: {
              user_roles: {
                table: 'user_roles',
                columns: [
                  {
                    name: 'roles_id',
                    primaryKey: true,
                  },
                  {
                    name: 'user_id',
                  },
                ],
                filter: [
                  {
                    field: 'user_id',
                    value: subscription.userId,
                    comparison: '==',
                  },
                ],
              },
            },
            columns: [
              {
                name: 'module_id',
                primaryKey: true,
              },
              {
                name: 'roles_id',
              },
              {
                name: 'user_role',
                resolve: {
                  underlyingField: 'roles_id',
                  session: 'user_roles',
                  displayField: 'roles_id',
                },
              },
            ],
            filter: [
              {
                field: 'user_role',
                value: null,
                comparison: '!=',
              },
            ],
          },
        },
        columns: [
          {
            name: 'id',
            primaryKey: true,
          },
          {
            name: 'config',
          },
          {
            name: 'version',
          },
          {
            name: 'moduleId',
          },
          {
            name: 'module_id_acl',
            resolve: {
              underlyingField: 'moduleId',
              session: 'module_roles',
              displayField: 'module_id',
            },
          },
          {
            name: 'public',
          },
        ],
        filter: [
          {
            field: 'public',
            value: 1,
            comparison: '==',
          },
        ],
      },
      true,
    )

    session.on('dataUpdate', data => {
      subscription.publish(data.toJSON(), request.requestId)
    })

    subscription.on('remove', () => {
      session.destroy()
    })

    subscription.publish(
      {
        addedData: session.getData(),
      },
      request.requestId,
    )
  }

  GetDashboardModules(request: Request, subscription: Subscription) {
    let session = this.evH.createSession(
      {
        table: 'module',
        subSessions: {
          module_roles: {
            table: 'module_roles',
            subSessions: {
              user_roles: {
                table: 'user_roles',
                columns: [
                  {
                    name: 'roles_id',
                    primaryKey: true,
                  },
                  {
                    name: 'user_id',
                  },
                ],
                filter: [
                  {
                    field: 'user_id',
                    value: subscription.userId,
                    comparison: '==',
                  },
                ],
              },
            },
            columns: [
              {
                name: 'module_id',
                primaryKey: true,
              },
              {
                name: 'roles_id',
              },
              {
                name: 'user_role',
                resolve: {
                  underlyingField: 'roles_id',
                  session: 'user_roles',
                  displayField: 'roles_id',
                },
              },
            ],
            filter: [
              {
                field: 'user_role',
                value: null,
                comparison: '!=',
              },
            ],
          },
        },
        columns: [
          {
            name: 'id',
            primaryKey: true,
          },
          {
            name: 'name',
          },
          {
            name: 'moduleClassName',
          },
          {
            name: 'moduleType',
          },
          {
            name: 'moduleGroup',
          },
          {
            name: 'config',
          },
          {
            name: 'parentId',
          },
          {
            name: 'owner_id',
          },
          {
            name: 'description',
          },
          {
            name: 'module_id_acl',
            resolve: {
              underlyingField: 'id',
              session: 'module_roles',
              displayField: 'module_id',
            },
          },
        ],
        filter: [
          {
            field: 'module_id_acl',
            value: null,
            comparison: '!=',
          },
        ],
      },
      true,
    )

    // temp workaround to prevend disappering controls in UI
    // TODO: should be fixed in tessio
    session.on('dataUpdate', data => {
      subscription.publish(data.toJSON(), request.requestId)
    })

    subscription.on('remove', () => {
      session.destroy()
    })

    subscription.publish(
      {
        addedData: session.getData(),
      },
      request.requestId,
    )
  }

  async SaveTabOrderAndSelection(request: Request, subscription: Subscription) {
    try {
      const response = await this.dbModule.save('tab', request.parameters.tabs)
      subscription.publish(
        {
          err: null,
          response,
          success: true,
        },
        request.requestId,
      )
    } catch (err: any) {
      subscription.publish(
        {
          err,
          response: null,
          success: false,
        },
        request.requestId,
      )
    }
  }

  async SaveDashboardTab(request: Request, subscription: Subscription) {
    const { tab, controls } = request.parameters

    try {
      await this.dbModule.save('tab', tab)
      
      if (controls) {
        const response = await this.dbModule.save('control', controls)
        subscription.publish(
          {
            err: null,
            response,
            success: true,
          },
          request.requestId,
        )
      } else {
        subscription.publish(
          {
            err: null,
            response: null,
            success: true,
          },
          request.requestId,
        )
      }
    } catch (err: any) {
      subscription.publish(
        {
          err,
          response: null,
          success: false,
        },
        request.requestId,
      )
    }
  }

  async RemoveDashboardTab(request: Request, subscription: Subscription) {
    let { err, result } = await this.dbModule.cascadeRemove(
      'tab',
      request.parameters.tab!.id,
    )
    subscription.publish(
      {
        err,
        response: result,
        success: err ? true : false,
      },
      request.requestId,
    )
  }

  async RemoveTabPreset(request: Request, subscription: Subscription) {
    let { err, result } = await this.dbModule.cascadeRemove(
      'tab_preset',
      request.parameters.tabPreset!.id,
    )
    subscription.publish(
      {
        err,
        response: result,
        success: err ? true : false,
      },
      request.requestId,
    )
  }

  async SaveControl(request: Request, subscription: Subscription) {
    try {
      const response = await this.dbModule.save(
        'control',
        request.parameters.control,
      )
      subscription.publish(
        {
          err: null,
          response,
          success: true,
        },
        request.requestId,
      )
    } catch (err: any) {
      subscription.publish(
        {
          err,
          response: null,
          success: false,
        },
        request.requestId,
      )
    }
  }

  async RemoveControl(request: Request, subscription: Subscription) {
    //TODO check if control belongs to the user
    try {
      const controlId = request.parameters.control!.id
      await this.dbModule.remove('control', [controlId])

      subscription.publish(
        {
          err: null,
          result: { controlId },
          success: true,
        },
        request.requestId,
      )
    } catch (err: any) {
      subscription.publish(
        {
          err,
          result: null,
          success: false,
        },
        request.requestId,
      )
    }
  }

  GetTabPresets(request: Request, subscription: Subscription) {
    const tabPresets = this.evH.get('tab_preset')
    const userDataTesseract = this.evH.get('user_data')
    const userRolesTesseract = this.evH.get('user_roles')
    
    if (!tabPresets || !userDataTesseract || !userRolesTesseract) {
      subscription.publishError({ message: 'Required tesseracts not found' }, request.requestId)
      return
    }

    const user = userDataTesseract.getById(subscription.userId)
    if (!user) {
      subscription.publishError({ message: 'User not found' }, request.requestId)
      return
    }

    const userRolesIds = userRolesTesseract
      .getLinq()
      .where(x => x.user_id === subscription.userId)
      .select(x => x.roles_id)
      .toArray()

    const session = tabPresets.createSession({
      filter: [
        {
          field: 'userId',
          value: [user.id, null],
          comparison: 'in',
        },
      ],
    })

    const controlPresets = this.evH.get('control_preset')
    const moduleVersionsTesseract = this.evH.get('module_version')
    const moduleRolesTesseract = this.evH.get('module_roles')
    
    if (!controlPresets || !moduleVersionsTesseract || !moduleRolesTesseract) {
      subscription.publishError({ message: 'Module data not available' }, request.requestId)
      return
    }

    const moduleVersions = moduleVersionsTesseract.getLinq()
    const moduleRoles = moduleRolesTesseract.getLinq()

    const getPresets = tabPresets => {
      const data = Enumerable.from<any>(tabPresets)
        .where(tabPreset => {
          tabPreset.controlPresets = controlPresets
            .getLinq()
            .where(controlPreset => {
              const moduleVersionId = controlPreset.moduleVersionId
              const moduleVersion = moduleVersions.firstOrDefault(
                version => version.id === moduleVersionId,
              )

              return (
                controlPreset.tabPresetId === tabPreset.id &&
                moduleRoles.firstOrDefault(
                  moduleRole =>
                    moduleRole.module_id === moduleVersion.moduleId &&
                    userRolesIds.indexOf(moduleRole.roles_id) !== -1,
                )
              )
            })
            .toArray()

          return tabPreset
        })
        .orderBy(x => x.name)
        .toArray()

      return data
    }

    session.off(undefined, undefined, subscription)
    session.on(
      'dataUpdate',
      tabPresetsData => {
        tabPresetsData = tabPresetsData.toJSON()
        tabPresetsData.addedData = getPresets(tabPresetsData.addedData)
        tabPresetsData.updatedData = getPresets(tabPresetsData.updatedData)
        subscription.publish(
          {
            presets: tabPresetsData,
          },
          request.requestId,
        )
      },
      subscription,
    )

    subscription.on('remove', () => {
      session.destroy()
    })

    subscription.publish(
      {
        presets: {
          updatedData: getPresets(session.getData()),
        },
      },
      request.requestId,
    )
  }

  async SaveTabPreset(request: Request, subscription: Subscription) {
    const controlsCache = await this.evH.getTesseract('control')
    const controlsData = controlsCache.getData()
    const tabPreset = request.parameters.tab
    
    if (tabPreset) {
      const tabId = tabPreset.tabId
      const tabPresetId = tabPreset.id
      
      try {
        await this.dbModule.save('tab_preset', tabPreset)
        
        const controls = controlsData.reduce((acc, control) => {
          if (control.tabId === tabId) {
            control.tabPresetId = tabPresetId
            acc.push(control)
          }

          return acc
        }, [])

        const controlPresets: any[] = []

        controls.forEach(control => {
          controlPresets.push({
            id: crypto.randomUUID(),
            tabPresetId: control.tabPresetId,
            title: control.title,
            config: control.config,
            moduleClassName: control.moduleClassName,
            moduleVersionId: control.moduleVersionId,
          })
        })

        const response = await this.dbModule.save(
          'control_preset',
          controlPresets,
        )
        
        subscription.publish(
          {
            err: null,
            response,
            success: true,
          },
          request.requestId,
        )
      } catch (err: any) {
        subscription.publish(
          {
            err,
            response: null,
            success: false,
          },
          request.requestId,
        )
      }
    }
  }

  GetAllUsers(request: Request, subscription: Subscription) {
    const userDataTesseract = this.evH.get('user_data')
    if (!userDataTesseract) {
      subscription.publishError({ message: 'User data not available' }, request.requestId)
      return
    }

    const users = userDataTesseract
      .getLinq()
      .select(x => {
        return {
          id: x.id,
          userName: x.userName,
          email: x.email,
          displayName: x.displayName,
        }
      })
      .toArray()

    subscription.publish(
      {
        users,
      },
      request.requestId,
    )
  }

  GetUserConfig(request: Request, subscription: Subscription) {
    const userDataTesseract = this.evH.get('user_data')
    if (!userDataTesseract) {
      subscription.publishError({ message: 'User data not available' }, request.requestId)
      return
    }

    const user = userDataTesseract.getById(subscription.userId)

    if (user) {
      subscription.publish(
        {
          config: user.config,
        },
        request.requestId,
      )
    } else {
      subscription.publishError({ message: 'User not found' }, request.requestId)
    }
  }

  async SaveUserConfig(request: Request, subscription: Subscription) {
    try {
      const status = await this.membershipProvider.dbModule.save(
        'user_data',
        {
          id: subscription.userId,
          config: request.parameters.userConfig,
        },
      )
      subscription.publish(
        {
          configUpdated: status,
        },
        request.requestId,
      )
    } catch (_err) {
      subscription.publish(
        {
          configUpdated: null,
        },
        request.requestId,
      )
    }
  }

  async UpdatePassword(request: Request, subscription: Subscription) {
    const data = {
      userId: subscription.userId,
      oldPassword: request.parameters.oldPassword,
      newPassword: request.parameters.newPassword,
    }

    try {
      await this.membershipProvider.updatePassword(data)
      subscription.publish(
        {
          passwordUpdated: true,
        },
        request.requestId,
      )
    } catch (err) {
      subscription.publishError(err, request.requestId)
    }
  }

  async reloadVersionsFromCodebase(codebaseUiModules) {
    const modules: any = Object.values(codebaseUiModules).reduce(
      (acc: any, m: any) => {
        const def = {
          id: m.id,
          name: m.name,
          moduleClassName: m.moduleClassName,
          moduleType: m.moduleType,
          moduleGroup: m.moduleGroup,
          parentId: m.parentId,
          description: m.description,
        }
        acc.definitions.push(def)
        m.roles.forEach(roleId => {
          acc.roles.push({ module_id: m.id, roles_id: roleId })
        })

        return acc
      },
      { definitions: [], roles: [] },
    )

    await this.dbModule.save('module', modules.definitions)
    const versions = Object.values(codebaseUiModules).reduce(
      (acc: any, m: any) => {
        m.versions.forEach(v => acc.push(this.createModuleVersion(m, v)))
        return acc
      },
      [],
    )
    const cPresets = (controlPresets as any[]).filter((cp: any) =>
      (versions as Array<{ id: number }>).find(
        v => v.id === cp.moduleVersionId,
      ),
    )
    await this.dbModule.save('module_version', versions)
    await this.dbModule.save('module_roles', modules.roles)
    await this.dbModule.save('tab_preset', tabPresets)
    await this.dbModule.save('control_preset', cPresets)
  }

  async appendMissingVersions(codebaseUiModules) {
    await Promise.all([
      ...Object.entries(codebaseUiModules).map(async ([id, def]: any[]) => {
        const moduleTesseract = this.evH.get('module')
        if (!moduleTesseract) {
          throw new Error('Module tesseract not available')
        }

        const dbModule = moduleTesseract.getById(id)
        const versions = def.versions

        if (!dbModule) {
          logger.info(`missing module id: ${def.id}, name: ${def.name}`, {
            module: this.moduleName,
          })
          const defRoles = def.roles
          
          const module = await this.dbModule.save('module', def)

          const roles = defRoles.map(roleId => ({
            module_id: def.id,
            roles_id: roleId,
          }))

          await this.dbModule.save('module_roles', roles)

          versions.forEach(v => (v.moduleId = module[0].id))
          // INFO: TESTING
          console.log({ versions })

          if (!_.isEmpty(versions)) {
            const paths = versions.map(v => v.path)

            logger.info(
              `New modules versions loaded from the codebase: ${paths}`,
              { module: this.moduleName },
            )

            await this.dbModule.save('module_version', versions)
          }
        } else {
          const moduleVersionTesseract = this.evH.get('module_version')
          if (!moduleVersionTesseract) {
            throw new Error('Module version tesseract not available')
          }

          const existingVersions = moduleVersionTesseract
            .getLinq()
            .where(mv => mv.moduleId === dbModule.id)
            .toArray()

          const missingVersions = versions
            .filter(
              v => !existingVersions.find(ev => ev.version === v.version),
            )
            .map(v => this.createModuleVersion(dbModule, v))

          if (!_.isEmpty(missingVersions)) {
            logger.info(
              `New modules versions loaded from the codebase: ${missingVersions.map(
                version => version.id,
              )}`,
              {
                module: this.moduleName,
              },
            )
            
            await this.dbModule.save('module_version', missingVersions)
          }
        }
      }),
    ])
  }

  async appendMissingPresets() {
    const tabPresetTesseract = this.evH.get('tab_preset')
    const controlPresetTesseract = this.evH.get('control_preset')
    
    if (!tabPresetTesseract || !controlPresetTesseract) {
      throw new Error('Preset tesseracts not available')
    }

    const missingTabPresets: any[] = []
    ;(tabPresets as any[]).forEach((tp: any) => {
      const present = tabPresetTesseract.getById(tp.id)

      if (!present) {
        missingTabPresets.push(tp)
      }
    })

    const missingControlPresets: any[] = []
    ;(controlPresets as any[]).forEach((cp: any) => {
      const present = controlPresetTesseract.getById(cp.id)

      if (!present) {
        missingControlPresets.push(cp)
      }
    })

    await this.dbModule.save('tab_preset', missingTabPresets)
    await this.dbModule.save('control_preset', missingControlPresets)
  }

  createModuleVersion(module, version) {
    return {
      id: version.id,
      version: version.version,
      config: version.config,
      moduleId: module.id,
      public: version.public,
    }
  }
}
