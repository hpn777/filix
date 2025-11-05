import * as crypto from 'crypto'

import { Subscription } from 'Model/subscriptions'
import { lodash as _, Cluster } from 'tessio'

import { BaseModule, ModuleEndpoint } from '../base'
import adminData from '../../fixtures/adminData.json'
import rolesData from '../../fixtures/roles.json'
import {
  isSuperAdmin,
  superAdminRoleId,
} from '../utils/user'
import { logger } from '../../utils/logger'
import { ModuleHelpers } from '../utils/ModuleHelpers'
import { Module as GenericDBModule } from '../GenericDB'
import type { IdentityProvider } from './types'

const rolesDataCopy = JSON.parse(JSON.stringify(rolesData))

export class Module extends BaseModule {
  defaults() {
    return {
      ready: false,
      users: null,
      roles: null,
      apiAccess: null,
      usernameKey: null,
    }
  }
  dbModule!: GenericDBModule
  evH!: Cluster
  identityProvider?: IdentityProvider
  users
  roles
  apiAccess
  usernameKey

  publicMethods: Map<string, ModuleEndpoint> = new Map([
    ['GetAllUsers', this.GetAllUsers],
    ['GetUsers', this.GetUsers],
    ['GetAllRoles', this.GetAllRoles],
    ['UpdateUser', this.UpdateUser],
    ['DeactiveUser', this.DeactiveUser],
    ['GetColumnsDefinition', this.GetColumnsDefinition],
    ['RemoveData', this.RemoveUser],
  ])

  async init(): Promise<BaseModule> {
    const config = this.config
    return new Promise(async (resolve, reject) => {
      this.dbModule = await ModuleHelpers.getModule(
        this.subscriptionManager,
        config.db_module as string,
      )

      if (!this.dbModule) {
        reject(new Error(`Membership module cannot load data provider '${config.db_module}'`))
        return
      }

      const waitForEventHorizon = async () => {
        const deadline = Date.now() + 30000
        while (Date.now() < deadline) {
          if (this.dbModule.evH) {
            return this.dbModule.evH
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        throw new Error(`Membership module timed out waiting for '${config.db_module}' event horizon`)
      }

      this.evH = this.dbModule.evH || (await waitForEventHorizon())

      if (typeof (this.evH as any).whenReady === 'function') {
        await (this.evH as any).whenReady()
      }

      const roles = this.evH.get('app_role')?.getData() ?? []
      const users = this.evH.get('user_data')?.getData() ?? []
      const userRoles = this.evH.get('user_roles')?.getData() ?? []

      // Skip fixture loading in test environment if configured
      const skipFixtures = config.skipFixtureLoading || false

      if (!skipFixtures) {
        if (_.isEmpty(roles)) {
          await this.dbModule.save('app_role', rolesDataCopy)
        }

        if (_.isEmpty(users)) {
          // Ensure admin user gets id=1 to match adminData.roles reference
          const adminUser = { ...adminData.admin, id: 1 }
          await this.dbModule.save('user_data', adminUser)
        }

        if (_.isEmpty(userRoles)) {
          await this.dbModule.save('user_roles', adminData.roles)
        }
      }

      if (this.config.activeDirectory) {
        try {
          const { default: ADMembershipModule } = await import('./ADMembership').then(
            module => ({ default: (module as any).default ?? module }),
          )

          const config = this.config.activeDirectory as any
          this.identityProvider = new ADMembershipModule({ config })
          this.usernameKey = config.usernameKey
          this.populateUsers(config, () => resolve(this))
        } catch (error) {
          reject(error)
          return
        }
      } else if (this.config.openLdap) {
        try {
          const { default: OpenLdapMembershipModule } = await import('./OpenLdapMembership').then(
            module => ({ default: (module as any).default ?? module }),
          )

          const config = this.config.openLdap as any
          this.identityProvider = new OpenLdapMembershipModule({ config })
          this.usernameKey = config.usernameKey
          this.populateUsers(config, () => resolve(this))
        } catch (error) {
          reject(error)
          return
        }
      } else {
        resolve(this)
      }
    })
  }

  GetAllUsers(request, subscription: Subscription) {
    const userDataTesseract = ModuleHelpers.getTesseract(
      this.evH,
      'user_data',
      subscription,
      'User data not found',
    )
    if (!userDataTesseract) return

    ModuleHelpers.publishSuccess(subscription, request.requestId, {
      users: userDataTesseract
        .getLinq()
        .select(x => ({
          id: x.id,
          userName: x.userName,
          email: x.email,
          displayName: x.displayName,
          active: x.active,
        }))
        .toArray(),
    })
  }

  GetUsers(request, subscription: Subscription) {
    const userDataTesseract = ModuleHelpers.getTesseract(
      this.evH,
      'user_data',
      subscription,
      'User data not found',
    )
    if (!userDataTesseract) return

    const users = userDataTesseract.createSession({
      columns: userDataTesseract
        .getHeader()
        .filter(x =>
          [
            'id',
            'userName',
            'email',
            'displayName',
            'active',
          ].some(y => y === x.name),
        ),
    })

    subscription.publish(
      {
        header: users.getSimpleHeader(),
        data: users.getData(),
        type: 'reset',
      },
      request.requestId,
    )

    users.on(
      'dataUpdate',
      updated => {
        subscription.publish(
          {
            data: updated.toJSON(),
            type: 'update',
          },
          request.requestId,
        )
      },
      subscription,
    )

    subscription.on('remove', () => {
      users.destroy()
    })
  }

  GetColumnsDefinition(request, subscription: Subscription) {
    let header

    switch (request.parameters.tableName) {
      case 'user_data':
        const includedColumns = [
          'id',
          'userName',
          'email',
          'displayName',
          'active',
        ]
        const userDataTesseract = this.evH.get('user_data')
        header = userDataTesseract
          ?.getHeader()
          .filter(x => includedColumns.some(y => y === x.name))
        break
    }

    subscription.publish(
      {
        header,
        type: 'reset',
      },
      request.requestId,
    )
  }

  GetAllRoles(request, subscription: Subscription) {
    subscription.publish(
      { roles: this.evH.get('app_role')?.getData() ?? [] },
      request.requestId,
    )
  }

  async UpdateUser(request, subscription: Subscription) {
    try {
      await this.updateUsers(request.parameters.data)
      subscription.publish(
        {
          success: true,
        },
        request.requestId,
      )
    } catch (error: any) {
      subscription.publishError({ message: error.sqlMessage || error.message })
    }
  }

  DeactiveUser(request, subscription: Subscription) {
    const userId = request.parameters.data[0]

    if (userId != subscription.userId) {
      this.deactiveUser(userId)
    }
  }

  async RemoveUser(request, subscription: Subscription) {
    const userId = request.parameters.data[0]

    if (userId != subscription.userId) {
      await this.dbModule.cascadeRemove('user_data', [userId])
    }
  }

  async updateUsers(users) {
    const cachedUsers = this.evH.get('user_data')

    if (!cachedUsers) {
      throw new Error('User data not found')
    }

    if (!Array.isArray(users)) {
      users = [users]
    }

    const results: any[] = []
    for (const user of users) {
      const cachedUser = cachedUsers.getById(user.id)

      if (!cachedUser) {
        user.password = crypto
          .createHash('sha256')
          .update(user.userName)
          .digest('hex')
      } else if (user.password) {
        user.password = crypto
          .createHash('sha256')
          .update(user.password)
          .digest('hex')
      }

      const result = await this.dbModule.save('user_data', user)
      results.push(result)
    }
    
    return results
  }

  async updatePassword(data) {
    const users = this.evH.get('user_data')
    
    if (!users) {
      throw new Error('User data not found')
    }
    
    const cachedUser = users.getById(data.userId)

    if (
      cachedUser.password !==
      crypto.createHash('sha256').update(data.oldPassword).digest('hex')
    ) {
      throw new Error('Old password is invalid')
    }
    
    cachedUser.password = crypto
      .createHash('sha256')
      .update(data.newPassword)
      .digest('hex')
    cachedUser.firstLogin = false
    
    await this.dbModule.save('user_data', cachedUser)
    return true
  }

  deactiveUser(userId) {
    const userDataTesseract = this.evH.get('user_data')
    if (!userDataTesseract) {
      logger.error('User data not found')
      return
    }
    
    const user = userDataTesseract.getById(userId)
    user.active = false
    this.dbModule.save('user_data', user)
  }

  async login(userName, password) {
    const hash = crypto.createHash('sha256').update(password).digest('hex')
    const identityProvider = this.identityProvider
    const users = this.evH.get('user_data')
    const config: any = this.config
    const cd = 86400000 // day in milliseconds 24 * 60 * 60 * 1000;
    const tokenValidInDays = (config.tokenValidInDays as number) || 1

    if (!users) {
      throw { category: 'AUTH_ERROR', message: 'User data not available' }
    }

    const prepareUserForLogin = async (selectedUser, adUser?) => {
      if (!selectedUser) {
        throw { category: 'AUTH_ERROR', message: 'Invalid credentials' }
      }

      if (
        !selectedUser.tokenCreated ||
        (selectedUser.tokenCreated &&
          Math.floor(
            (new Date().getTime() -
              new Date(selectedUser.tokenCreated).getTime()) /
              cd,
          ) >= tokenValidInDays)
      ) {
        selectedUser.tokenCreated = new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ')
        selectedUser.authToken = crypto.randomUUID()
      }
      
      const userRolesTesseract = this.evH.get('user_roles')
      const appRoleTesseract = this.evH.get('app_role')
      
      if (userRolesTesseract && appRoleTesseract) {
        selectedUser.roles = userRolesTesseract
          .getLinq()
          .where(x => x.user_id === selectedUser.id)
          .select(x => ({
            id: x.roles_id,
            roleName: appRoleTesseract.getById(x.roles_id)?.roleName,
          }))
          .toArray()
      } else {
        selectedUser.roles = []
      }
      
      if (adUser) {
        selectedUser.displayName = adUser.displayName
        selectedUser.email = adUser.mail
      }

      await this.dbModule.save('user_data', selectedUser)
      return selectedUser
    }

    if (identityProvider) {
      return new Promise((resolve, reject) => {
        identityProvider.login(userName, password, (error, auth) => {
          if (auth) {
            identityProvider.getUser(userName, (err, adUser) => {
              if (adUser) {
                const cachedUser = users
                  .getLinq()
                  .firstOrDefault(x => x.userName === adUser[this.usernameKey])
                prepareUserForLogin(cachedUser, adUser)
                  .then(resolve)
                  .catch(reject)
              } else {
                reject({ category: 'AUTH_ERROR', message: 'Invalid credentials' })
              }
            })
          } else {
            const friendlyError = {
              category: 'AUTH_ERROR',
              message: `User: ${userName} used invalid credentials.`,
            }
            logger.error(`User: ${userName} login error: ${error}`, {
              module: 'Membership',
            })
            reject(friendlyError)
          }
        })
      })
    } else {
      const tempUsers = users
        .getLinq()
        .firstOrDefault(
          x => x.userName === userName && x.password === hash && x.active,
        )
      return prepareUserForLogin(tempUsers)
    }
  }

  authenticate(userId, authToken) {
    const config = this.config
    let user
    const cd = 86400000 // day in milliseconds 24 * 60 * 60 * 1000;
    const tokenValidInDays = ((config as any).tokenValidInDays as number) || 1
    const users = this.evH.get('user_data')
    
    if (!users) {
      throw {
        category: 'AUTH_ERROR',
        message: 'User data not available',
      }
    }
    
    const selectedUser = users
      .getLinq()
      .firstOrDefault(x => x.authToken === authToken && authToken)

    if (
      selectedUser &&
      selectedUser.active &&
      selectedUser.tokenCreated &&
      Math.floor(
        (new Date().getTime() - new Date(selectedUser.tokenCreated).getTime()) /
          cd,
      ) < tokenValidInDays
    ) {
      user = selectedUser
    }

    if (!user) {
      throw {
        category: 'AUTH_ERROR',
        message: 'Invalid authentication token',
      }
    }
    
    return user
  }

  resolveACL(userId, apiKey) {
    const apiAccessTesseract = this.evH.get('api_access')
    const userRolesTesseract = this.evH.get('user_roles')
    
    if (!apiAccessTesseract || !userRolesTesseract) {
      return false
    }
    
    const apiAccessInstance = apiAccessTesseract.getById(apiKey)

    if (
      !apiAccessInstance ||
      (apiAccessInstance &&
        (!apiAccessInstance.roleId ||
          userRolesTesseract
            .getLinq()
            .any(
              x =>
                x.user_id === userId && x.roles_id === apiAccessInstance.roleId,
            )))
    ) {
      return true
    }
    return false
  }

  populateUsers(config, callback) {
    // TODO require refactoring
    const usersCache = this.evH.get('user_data')
    const identityProvider = this.identityProvider

    if (!identityProvider) {
      return
    }

    if (!usersCache) {
      logger.error('User data not available', { module: 'Membership' })
      return
    }

    logger.info(
      `Retriving Active Directory users from ${config.adGroup} group.`,
      { module: 'Membership' },
    )
    identityProvider.getAllUsers(async (error, adUsers) => {
      if (error) {
        logger.error(
          `Retriving users from Active Directory error: ${JSON.stringify(
            error,
          )}`,
          { module: 'Membership' },
        )

        throw error
      }

      if (adUsers) {
        logger.info(`${adUsers.length} user details received.`, {
          module: 'Membership',
        })

        for (const adUser of adUsers) {
          const user: any = {
            userName: adUser[this.usernameKey],
            email: adUser.userPrincipalName,
            displayName: adUser.displayName,
            active: true,
          }

          const selectedUser = usersCache
            .getLinq()
            .firstOrDefault(x => x.userName === user.userName)

          if (!selectedUser) {
            try {
              await this.dbModule.save('user_data', user)
              logger.info(`${user.email} user saved`, {
                module: 'Membership',
              })
            } catch (error) {
              logger.error(`Failed to save user ${user.email}: ${error}`, {
                module: 'Membership',
              })
            }
          } else {
            user.id = selectedUser.id
            await this.dbModule.save('user_data', user)
          }
        }

        for (const user of usersCache.getLinq().toArray()) {
          if (!_.find(adUsers, y => y[this.usernameKey] === user.userName)) {
            // dlaczego tutaj dezaktywujemy userów którzy nie są w AD??
            // jak to powinno być
            user.active = false
            await this.dbModule.save('user_data', user)
          }
        }

        callback()
      } else {
        logger.error('No users in group.', { module: 'Membership' })
      }
    })
  }

  logApiAccess(options) {
    this.dbModule.save('audit', options)
  }
}
