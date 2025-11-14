import { EventEmitter } from 'events'
import * as ldap from 'ldapjs'
import { Client, SearchEntry, SearchOptions as LdapjsSearchOptions } from 'ldapjs'
import * as async from 'async'
import * as _ from 'lodash'

import Group from './models/Group'
import User from './models/User'
import RangeRetrievalSpecifierAttribute from './RangeRetrievalSpecifierAttribute'
import {
  LdapClientConfig,
  SearchOptions,
  LdapEntry,
  LdapCallback,
  AuthCallback,
  LdapError,
} from './types'

/**
 * Agent for retrieving LDAP user & group information
 */
export class LdapClient extends EventEmitter {
  private opts: LdapClientConfig

  /**
   * Creates a new LdapClient instance
   * @param config The configuration for the LDAP server
   */
  constructor(config: LdapClientConfig) {
    super()
    this.opts = config
  }

  /**
   * Factory to create the LDAP client object
   * @returns LDAP client instance
   */
  private createClient(): Client {
    return ldap.createClient({ 
      url: this.opts.url, 
      reconnect: true 
    })
  }

  /**
   * Performs a search on the LDAP tree
   * @param opts LDAP query string parameters to execute
   * @param callback The callback to execute when completed
   */
  private search(opts: SearchOptions, callback: LdapCallback<LdapEntry[]>): void {
    const client = this.createClient()
    
    client.on('error', (err: LdapError) => {
      // Ignore ECONNRESET errors
      if ((err || {}).errno !== 'ECONNRESET') {
        this.emit('error', err)
      }
    })

    const results: LdapEntry[] = []

    /**
     * Occurs when a search entry is received
     * @param entry The entry received
     */
    const onSearchEntry = (entry: SearchEntry): void => {
      const result = entry.object as LdapEntry
      delete (result as any).controls // Remove the controls array returned as part of the SearchEntry

      // Some attributes can have range attributes (paging). Execute the query
      // again to get additional items.
      this.parseRangeAttributes(result, opts, (err, item) => {
        // On error, use the original result
        if (err) item = result
        results.push(item || result)
      })
    }

    /**
     * Occurs when a search error occurs
     * @param err The error object or string
     */
    const onSearchError = (err: Error): void => {
      this.emit('error', err)
      if (callback) callback(err as LdapError)
    }

    /**
     * Occurs when search results have all been processed
     */
    const onSearchEnd = (): void => {
      client.unbind()
      if (callback) callback(null, results)
    }

    client.bind(this.opts.username, this.opts.password, (err: Error | null) => {
      if (err) {
        console.log('err', err)
      }
      
      const searchOpts: LdapjsSearchOptions = {
        filter: opts.filter,
        scope: opts.scope as 'base' | 'one' | 'sub',
        attributes: opts.attributes,
        sizeLimit: opts.sizeLimit,
        timeLimit: opts.timeLimit,
      }

      client.search(this.opts.baseDN, searchOpts, (err, res) => {
        if (err) {
          if (callback) callback(err as LdapError)
          return
        }

        res.on('searchEntry', onSearchEntry)
        res.on('error', onSearchError)
        res.on('end', onSearchEnd)
      })
    })
  }

  /**
   * Handles any attributes that might have been returned with a range= specifier
   * @param result The entry returned from the query
   * @param opts The original LDAP query string parameters to execute
   * @param callback The callback to execute when completed
   */
  private parseRangeAttributes(
    result: LdapEntry,
    opts: SearchOptions,
    callback: LdapCallback<LdapEntry>
  ): void {
    // Check to see if any of the result attributes have range= attributes
    if (!RangeRetrievalSpecifierAttribute.hasRangeAttributes(result)) {
      callback(null, result)
      return
    }

    // Parse the range attributes that were provided
    const rangeAttributes = RangeRetrievalSpecifierAttribute.getRangeAttributes(result)
    if (!rangeAttributes || rangeAttributes.length <= 0) {
      callback(null, result)
      return
    }

    // Parse each of the range attributes. Merge the range attributes into
    // the properly named property
    const queryAttributes: string[] = []
    
    rangeAttributes.forEach(rangeAttribute => {
      // Merge existing range into the properly named property
      const attrName = rangeAttribute.attributeName
      const rangeAttrName = rangeAttribute.toString()
      
      if (!result[attrName]) {
        result[attrName] = []
      }
      
      if (Array.isArray(result[attrName]) && Array.isArray(result[rangeAttrName])) {
        result[attrName].push(...result[rangeAttrName])
      }
      
      delete result[rangeAttrName]

      // Build our ldap query attributes with the proper attribute;range= tags
      const queryAttribute = rangeAttribute.next()
      if (queryAttribute) {
        queryAttributes.push(queryAttribute.toString())
      }
    })

    // If we're at the end of the range (i.e. all items retrieved), return the result
    if (queryAttributes.length <= 0) {
      callback(null, result)
      return
    }

    // Execute the query again with the query attributes updated
    const newOpts: SearchOptions = { ...opts, attributes: queryAttributes }
    
    this.search(newOpts, (err, results) => {
      if (err) {
        if (callback) callback(err)
        return
      }

      // Parse any range attributes if they are specified
      const rangeResult = (results || [])[0]
      if (RangeRetrievalSpecifierAttribute.hasRangeAttributes(rangeResult)) {
        // Append the attributes from the range to the original result
        for (const key in rangeResult) {
          result[key] = rangeResult[key]
        }
        this.parseRangeAttributes(result, newOpts, callback)
      } else {
        callback(null, result)
      }
    })
  }

  /**
   * For the specified group, retrieve all of the users that belong to the group
   * @param groupName The name of the group to retrieve membership from
   * @param callback The callback to execute when completed
   */
  getUsersForGroup(groupName: string, callback: LdapCallback<User[]>): void {
    this.findGroup({} as SearchOptions, groupName, (err, group) => {
      if (err) {
        if (callback) callback(err)
        return
      }

      // Group not found
      if (!group) {
        callback(null, [])
        return
      }

      const users: User[] = []
      const filter = personGroupFilter(group.gidNumber!)

      const opts: SearchOptions = {
        filter,
        scope: 'sub',
        attributes: ['dn', 'sn', 'cn', 'gidNumber', 'uid', 'displayName', 'mail'],
      }

      this.search(opts, (err, members) => {
        if (err) {
          if (callback) callback(err)
          return
        }

        // Parse the results in parallel
        async.forEach(
          members || [],
          (member: LdapEntry, asyncCallback: async.ErrorCallback<Error>) => {
            // If a user, no groupType will be specified
            if (!(member as any).groupType) {
              users.push(new User(member))
              asyncCallback()
            } else {
              // We have a group, recursively get the users belonging to this group
              this.getUsersForGroup((member as any).cn, (err, nestedUsers) => {
                if (nestedUsers) {
                  users.push(...nestedUsers)
                }
                asyncCallback()
              })
            }
          },
          () => {
            if (callback) {
              // Remove duplicates
              callback(null, _.uniqBy(users, user => user.dn))
            }
          }
        )
      })
    })
  }

  /**
   * Retrieves the specified group
   * @param opts Optional LDAP query string parameters to execute
   * @param groupName The group (cn) to retrieve information about
   * @param callback The callback to execute when completed
   */
  findGroup(opts: SearchOptions, groupName: string, callback: LdapCallback<Group>): void {
    const filter = groupFilter(groupName)
    const searchOpts: SearchOptions = {
      filter,
      scope: 'sub',
    }

    this.search(searchOpts, (err, results) => {
      if (err) {
        if (callback) callback(err)
        return
      }

      if (!results || results.length === 0) {
        if (callback) callback(null, undefined)
        return
      }

      const group = new Group(results[0])
      this.emit('group', group)
      if (callback) callback(null, group)
    })
  }

  /**
   * Retrieves the specified user
   * @param opts Optional LDAP query string parameters to execute
   * @param username The username to retrieve information about
   * @param includeMembership Indicates if the request should also retrieve group memberships
   * @param callback The callback to execute when completed
   */
  findUser(
    opts: SearchOptions,
    username: string,
    includeMembership: boolean,
    callback: LdapCallback<User>
  ): void {
    const options: SearchOptions = {
      filter: personFilter(username),
      scope: 'sub',
      attributes: ['dn', 'sn', 'cn', 'gidNumber', 'uid', 'mail', 'displayName'],
    }

    this.search(options, (err, results) => {
      if (err) {
        if (callback) callback(err)
        return
      }

      if (!results || results.length === 0) {
        if (callback) callback(null, undefined)
        return
      }

      const user = new User(results[0])
      this.emit('user', user)
      if (callback) callback(err, user)
    })
  }

  /**
   * Attempts to authenticate the specified username / password combination
   * @param username The username to authenticate
   * @param password The password to use for authentication
   * @param callback The callback to execute when authentication is completed
   */
  authenticate(username: string, password: string, callback: AuthCallback): void {
    if (!username || !password) {
      if (callback) {
        const err: LdapError = {
          code: 0x31,
          errno: 'LDAP_INVALID_CREDENTIALS',
          description: 'The supplied credential is invalid',
        }
        callback(err, false)
      }
      return
    }

    const client = this.createClient()
    
    client.on('error', (err: Error) => {
      // Ignore ECONNRESET errors
      if ((err as any).errno !== 'ECONNRESET') {
        this.emit('error', err)
      }
    })

    client.bind(this.opts.username, this.opts.password, (err: Error | null) => {
      if (err) {
        if (callback) callback(err as LdapError, false)
        return
      }

      this.findUser({} as SearchOptions, username, false, (err, res) => {
        if (err || !res || !res.dn) {
          if (callback) callback(err || null, false)
          return
        }

        client.bind(res.dn, password, (err: Error | null) => {
          client.unbind()
          if (err) {
            if (callback) callback(err as LdapError, false)
            return
          }
          if (callback) callback(null, true)
        })
      })
    })
  }
}

// Helper filter functions
const personFilter = (username: string): string => `(&(objectClass=Person)(uid=${username}))`
const groupFilter = (groupName: string): string => `(&(objectClass=posixGroup)(cn=${groupName}))`
const personGroupFilter = (gidNumber: number): string => `(&(objectClass=Person)(gidNumber=${gidNumber}))`

export default LdapClient
