/**
 * Active Directory Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires DataProvider.Base, Core, underscore, linq
 */
import ActiveDirectory = require('activedirectory')
import * as Enumerable from 'linq'
import { lodash as _ } from 'tessio'

import { Model } from '../../Model/model'
import ADServers from './ADServers'
import type { LDAPConfig, ADUser, ADCallback, ADGroup } from './types'

const lookupServers = new ADServers()
const authenticateServers = new ADServers()

interface ADServerWrapper {
  server: ActiveDirectory
}

/**
 * Active Directory Membership provider
 *
 * @class ADMembership
 * @extends Model
 */
class ADMembership extends Model {
  private config!: LDAPConfig

  /**
   * Initialize the Active Directory connection
   * @method initialize
   */
  initialize(): void {
    this.config = this.get('config') as LDAPConfig

    _.each(this.config.servers, (adServer) => {
      const server = new ActiveDirectory({
        url: adServer.url,
        baseDN: adServer.lookupDN || adServer.baseDN,
        username: adServer.lookupUsername,
        password: adServer.lookupPassword,
      })

      lookupServers.push({
        server,
      })

      authenticateServers.push({
        server: new ActiveDirectory({
          url: adServer.url,
          baseDN: adServer.baseDN,
        }),
      })
    })
  }

  /**
   * Authenticate user with Active Directory
   * @method login
   * @param userName - Username to authenticate
   * @param password - Password for authentication
   * @param callbackFn - Callback function
   */
  login(
    userName: string,
    password: string,
    callbackFn: ADCallback<boolean>
  ): void {
    const callback = callbackFn
    const name = userName
    const pass = password

    authenticateServers.authenticate(
      name,
      pass,
      (err: any, auth: boolean) => {
        if (err) {
          err.category = 'AUTH_ERROR'
          err.message = err.name || err.message
        } else if (!auth) {
          err = {
            category: 'AUTH_ERROR',
            message: 'Invalid credentials',
          }
        }
        callback(err, auth)
      }
    )
  }

  /**
   * Get user information from Active Directory
   * @method getUser
   * @param userName - Username to lookup
   * @param callbackFn - Callback function
   */
  getUser(userName: string, callbackFn: ADCallback<ADUser>): void {
    const callback = callbackFn
    lookupServers.findUser({}, userName, false, (err: any, users: ADUser) => {
      callback(err, users)
    })
  }

  /**
   * Get all users from Active Directory group
   * @method getAllUsers
   * @param callback - Callback function
   */
  getAllUsers(callback: ADCallback<ADUser[]>): void {
    lookupServers.getUsersForGroup(
      {},
      this.config.adGroup || '',
      (err: any, users: ADUser[]) => {
        callback(err, users)
      }
    )
  }

  /**
   * Get all roles from Active Directory
   * @method getAllRoles
   * @param callbackFn - Callback function
   */
  getAllRoles(callbackFn: (roles: Array<{ id: string }>) => void): void {
    const callback = callbackFn
    lookupServers.findGroup(
      {},
      this.config.adGroup || '',
      (err: any, rootGroup: ADGroup) => {
        if (rootGroup && rootGroup.member) {
          const groups = Enumerable.from(rootGroup.member)
            .select((x: string) => ({
              id: x.split(',')[0].split('=')[1],
            }))
            .toArray()
          callback(groups)
        }
      }
    )
  }
}

export = ADMembership
