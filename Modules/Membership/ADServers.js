/**
 * Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires Core, underscore
 */
var {lodash:_} = require('tessio');
var Collection = require('../../Core/Model/Collection');
var ADServer = require('./ADServer');
var logger = new (require('../../Core/Logger'))();

/**
 * Description
 *
 * @class ADServers
 * @constructor
 */
var ADServers = Collection.extend({
	model: ADServer,

	/**
	 * Description
	 * @method authenticate
	 * @param {} username
	 * @param {} password
	 * @param {} callback
	 * @return 
	 */
	authenticate: function(username, password, callback){
		var callbackFn = callback;
		var serverWrapper = this.getActiveServer();
		serverWrapper.getServer().authenticate(username, password, this.getCallback({arguments: arguments, methodName: 'authenticate'}, serverWrapper, callback));
	},

	/**
	 * Description
	 * @method findUser
	 * @param {} opts
	 * @param {} username
	 * @param {} includeMembership
	 * @param {} callback
	 * @return 
	 */
	findUser: function(opts, username, includeMembership, callback){
		var callbackFn = callback;
		var serverWrapper = this.getActiveServer();
		serverWrapper.getServer().findUser(opts, username, includeMembership, this.getCallback({arguments: arguments, methodName: 'findUser'}, serverWrapper, callback));
	},

	/**
	 * Description
	 * @method getUsersForGroup
	 * @param {} opts
	 * @param {} groupName
	 * @param {} callback
	 * @return 
	 */
	getUsersForGroup: function(opts, groupName, callback){
		var callbackFn = callback;
		var serverWrapper = this.getActiveServer();
		serverWrapper.getServer().getUsersForGroup(opts, groupName, this.getCallback({arguments: arguments, methodName: 'getUsersForGroup'}, serverWrapper, callback));
	},

	/**
	 * Description
	 * @method findGroup
	 * @param {} opts
	 * @param {} groupName
	 * @param {} callback
	 * @return 
	 */
	findGroup: function(opts, groupName, callback){
		var callbackFn = callback;
		var serverWrapper = this.getActiveServer();
		serverWrapper.getServer().findGroup(opts, groupName, this.getCallback({arguments: arguments, methodName: 'findGroup'}, serverWrapper, callback));
	},

	/**
	 * Description
	 * @method getActiveServer
	 * @return 
	 */
	getActiveServer: function(){
		var self = this;
		var adServer = this.find(function(x){ return x.get('online'); });
		if(adServer)
			return adServer;
		else {
			self.each(function(x){ x.set('online', true)});
			adServer = this.find(function(x){ return x.get('online'); });
			if(adServer)
				return adServer;
		}
	},

	/**
	 * Description
	 * @method getCallback
	 * @param {} method
	 * @param {} server
	 * @param {} callback
	 * @return FunctionExpression
	 */
	getCallback: function(method, server, callback){
		var self = this;
		var acServer = server;
		var callbackFn = callback;
		return function(err, response){
			if(err){
				//logger.error('AD server error: ' + JSON.stringify(err));
				if (err.code == 3 || err.code == 80 || err.code == 51 || err.code == 128) {
					acServer.set('online', false);
					self[method.methodName].apply(self, method.arguments);
				}
			}
			else{
				acServer.set('online', true);
			}
			callbackFn(err, response);
		}
	}

});
module.exports = ADServers;