/**
 * Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires Core, underscore
 */

import { Collection } from '../../Model/collection'
import { logger } from '../../utils/logger'

/**
 * Description
 *
 * @class ADServers
 * @constructor
 */
class ADServers extends Collection {
  constructor() {
    super()
  }

  /**
   * Description
   * @method authenticate
   * @param {} username
   * @param {} password
   * @param {} callback
   * @return
   */
  authenticate(username, password, callback) {
    const serverWrapper = this.getActiveServer()

    logger.info(`Server wrpapper ${serverWrapper}`, {
      module: 'Membership::ADServers',
    })

    if (!serverWrapper) {
      callback(new Error('No active AD server available'), null)
      return
    }

    serverWrapper
      .get('server')
      .authenticate(
        username,
        password,
        this.getCallback(
          { arguments, methodName: 'authenticate' },
          serverWrapper,
          callback,
        ),
      )
  }

  /**
   * Description
   * @method findUser
   * @param {} opts
   * @param {} username
   * @param {} includeMembership
   * @param {} callback
   * @return
   */
  findUser(opts, username, includeMembership, callback) {
    const serverWrapper = this.getActiveServer()

    if (!serverWrapper) {
      callback(new Error('No active AD server available'), null)
      return
    }

    serverWrapper
      .get('server')
      .findUser(
        opts,
        username,
        includeMembership,
        this.getCallback(
          { arguments, methodName: 'findUser' },
          serverWrapper,
          callback,
        ),
      )
  }

  /**
   * Description
   * @method getUsersForGroup
   * @param {} opts
   * @param {} groupName
   * @param {} callback
   * @return
   */
  getUsersForGroup(opts, groupName, callback) {
    const serverWrapper = this.getActiveServer()
    
    if (!serverWrapper) {
      callback(new Error('No active AD server available'), null)
      return
    }

    const newCallback = this.getCallback(
      { arguments, methodName: 'getUsersForGroup' },
      serverWrapper,
      callback,
    )
    const server = serverWrapper.get('server')

    logger.info(`server ${server}`, { module: 'Membership::ADServers' })

    server.getUsersForGroup(groupName, newCallback)
  }

  /**
   * Description
   * @method findGroup
   * @param {} opts
   * @param {} groupName
   * @param {} callback
   * @return
   */
  findGroup(opts, groupName, callback) {
    const serverWrapper = this.getActiveServer()

    if (!serverWrapper) {
      callback(new Error('No active AD server available'), null)
      return
    }

    serverWrapper
      .get('server')
      .findGroup(
        opts,
        groupName,
        this.getCallback(
          { arguments, methodName: 'findGroup' },
          serverWrapper,
          callback,
        ),
      )
  }

  /**
   * Description
   * @method getActiveServer
   * @return
   */
  getActiveServer() {
    let adServer = this.find(x => x.get('online'))

    if (adServer) {
      return adServer
    }

    // TODO: Dlaczego tutaj tak ustawiamy online na true? Na jakiej podstawie tak zakładamy, że jest online???
    this.each(x => {
      x.set('online', true)
    })

    adServer = this.find(x => x.get('online'))

    if (adServer) {
      return adServer
    }
  }

  /**
   * Description
   * @method getCallback
   * @param {} method
   * @param {} server
   * @param {} callback
   * @return FunctionExpression
   */
  getCallback(method, server, callback) {
    const acServer = server
    const callbackFn = callback

    return (error, response) => {
      if (error) {
        logger.error(`AD server error: ${JSON.stringify(error)}`, {
          module: 'Membership::ADServers',
        })

        // TODO: Refactor handling of error codes to retry or disconnect
        if (
          error.code == 3 ||
          error.code == 80 ||
          error.code == 51 ||
          error.code == 128
        ) {
          acServer.set('online', false)
          this[method.methodName].apply(this, method.arguments)
        }
      } else {
        acServer.set('online', true)
      }

      callbackFn(error, response)
    }
  }
}

export default ADServers
