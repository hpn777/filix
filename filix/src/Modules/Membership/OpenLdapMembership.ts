/**
 * OpenLDAP Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires DataProvider.Base, Core, underscore, linq
 */
import { lodash as _ } from 'tessio'

import ADServers from './ADServers'
import LdapClient from './LdapClient/LdapClient'
import { Model } from '../../Model/model'
import type { LDAPConfig, ADUser, ADCallback } from './types'

const lookupServers = new ADServers()
const authenticateServers = new ADServers()

/**
 * OpenLDAP Membership provider
 *
 * @class OpenLdapMembership
 * @extends Model
 */
class OpenLdapMembership extends Model {
  private config!: LDAPConfig

  /**
   * Initialize the OpenLDAP connection
   * @method initialize
   */
  initialize(): void {
    this.config = this.get('config') as LDAPConfig

    // Setup servers for lookup operations and authentication
    _.each(this.config.servers, (adServer) => {
      lookupServers.push({
        server: new LdapClient({
          url: adServer.url,
          baseDN: adServer.baseDN,
          username: adServer.lookupUsername,
          password: adServer.lookupPassword,
          group: adServer.adGroup,
        }),
      })

      authenticateServers.push({
        server: new LdapClient({
          url: adServer.url,
          baseDN: adServer.baseDN,
          username: adServer.lookupUsername,
          password: adServer.lookupPassword,
        }),
      })
    })
  }

  /**
   * Authenticate user with OpenLDAP
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
   * Get user information from OpenLDAP
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
   * Get all users from OpenLDAP group
   * @method getAllUsers
   * @param callbackFn - Callback function
   */
  getAllUsers(callbackFn: ADCallback<ADUser[]>): void {
    lookupServers.getUsersForGroup(
      {},
      this.config.adGroup || '',
      (err: any, users: ADUser[]) => {
        if (err) {
          console.log('OpenLDAP membership error:', err)
        }
        callbackFn(err, users)
      }
    )
  }
}

export = OpenLdapMembership
