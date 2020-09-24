/**
 * Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires DataProvider.Base, Core, underscore, linq
 */
var Enumerable = require('linq');
var ActiveDirectory = require('activedirectory');
var Model = require('../../Core/Model/Model');
var Collection = require('../../Core/Model/Collection');
var ADServers = require('./ADServers');
var {lodash:_} = require('tessio');

var lookupServers = new ADServers();
var authenticateServers = new ADServers();


/**
 * Description
 *
 * @class ADMembership
 * @constructor
 */
var ADMembership = Model.extend({

	/**
	 * Description
	 * @method defaults
	 * @return ObjectExpression
	 */
	defaults: function () {
		return {
			
		}
	},

	/**
	 * Description
	 * @method initialize
	 * @return 
	 */
	initialize: function () {
		var self = this;

		this.config = this.get('config');

		_.each(this.config.servers, function(adServer){
			lookupServers.push({
				server: new ActiveDirectory({ 
					url: adServer.url,
		        	baseDN: adServer.lookupDN,
		        	username: adServer.lookupUsername,
		        	password: adServer.lookupPassword
		        })
			});

			authenticateServers.push({
				server: new ActiveDirectory({
					url: adServer.url,
					baseDN: adServer.baseDN
				})	
			});
		});
	},

	/**
	 * Description
	 * @method Ready
	 * @param {} request
	 * @return 
	 */
	Ready: function (request) {

	},

	//Internal methods
	/**
	 * Description
	 * @method login
	 * @param {} userName
	 * @param {} password
	 * @param {} callbackFn
	 * @return 
	 */
	login: function (userName, password, callbackFn) {
		var self = this;
		var callback = callbackFn;
		var name = userName;
		var pass = password;

		authenticateServers.authenticate(self.config.userPrefix + name, pass, function (err, auth) {
			if (err) {
				err.category = "AUTH_ERROR";
				err.message = err.name;
			}
			else if (auth) { }
			else {
				err = {
					category: "AUTH_ERROR",
					message: "Invalid credentials"
				}
			}
			callback(err, auth);
		});
	},

	/**
	 * Description
	 * @method getAllUsers
	 * @param {} callbackFn
	 * @return 
	 */
	getUser: function (userName, callbackFn) {
		var self = this;
		var callback = callbackFn;
		lookupServers.findUser(userName, function (err, users) {
			callback(err, users);
		});
	},
	/**
		 * Description
		 * @method getAllUsers
		 * @param {} callbackFn
		 * @return 
		 */
	getAllUsers: function (callbackFn) {
		var self = this;
		var callback = callbackFn;
		lookupServers.getUsersForGroup(self.config.adGroup, true, function (err, users) {
			callback(err, users);
		});
	},

	/**
	 * Description
	 * @method getAllRoles
	 * @param {} callbackFn
	 * @return 
	 */
	getAllRoles: function (callbackFn) {
		var self = this;
		var callback = callbackFn;
		lookupServers.findGroup(self.config.adGroup, function (err, rootGroup) {
			if (rootGroup && rootGroup.member){
				var groups = Enumerable.From(rootGroup.member)
					.Select(function(x){ 
						return { id: x.split(',')[0].split('=')[1] } 
					}).ToArray();
				callback(groups);
			}
		});
	}
});
module.exports = ADMembership;