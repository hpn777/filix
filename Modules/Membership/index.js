var crypto = require('crypto');
var BaseModule = require('../Base');
var {lodash:_} = require('tessio');
var logger = new (require('../../Core/Logger'))();
var Enumerable = require('linq');

var Membership = BaseModule.extend({
	defaults: function () {
		return {
			ready: false,
			users: null,
			roles: null,
			apiAccess: null
		}
	},

	initialize: function () {
		var self = this;
		var subscriptionManager = this.get('subscriptionManager')
		const config = this.get('config')

		this.baseInitialize()

		this.dbModule = this.get('subscriptionManager').getModule(config.dbModule);
		if (this.dbModule)
			this.evH = this.dbModule.evH
		
		if (this.get('config').activeDirectory) {
			var ADMembership = require('./ADMembership');
			this.set('adMembership', new ADMembership({ config: this.get('config').activeDirectory }));

			self.populateUsers(function () {
				self.set('ready', true);
			});
		}
		else {
			self.set('ready', true);
		}
	},

	GetAllUsers: function (request) {
		this.Publish(request.subscription, {
			users: this.evH.get('user').getLinq().select((x) => {
				return {
					id: x.id,
					userName: x.userName,
					email: x.email,
					displayName: x.displayName,
					active: x.active
				}
			}).toArray()
		}, request.parameters.command, request.requestId);
	},

	GetUsers: function (request) {
		const users = this.evH.get('user').createSession({
			columns: ['id', 'userName', 'email', 'displayName', 'active'].map(x => { return {name: x} })
		})

		this.Publish(request.subscription, {
			header: users.getSimpleHeader(),
			data: users.getData(),
			type: 'reset'
		}, request.parameters.command, request.requestId)

		users.on('dataUpdate', (updated)=>{
			self.Publish(request.subscription, { 
				data: updated.toJSON(), 
				type: 'update' 
			}, 'GetUsers');
		}, request.subscription)

		request.subscription.on('remove', function () {
			users.destroy()
		})
	},

	GetColumnsDefinition: function (request) {
		var header
		
		switch(request.parameters.tableName){
			case 'user':
			const includedColumns = ['id', 'userName', 'email', 'displayName', 'active']
			header = this.evH.get('user').getHeader().reduce((a, b)=>{
				var acc = Array.isArray(a)?a:[a]
				if(includedColumns.indexOf(b.columnName) !== -1){
					acc.push(b)
				}
				return acc
			})
			
			break;
		}

		this.Publish(request.subscription, {
			header: header,
			type: 'reset'
		}, request.parameters.command, request.requestId);
	},

	GetAllRoles: function (request) {
		this.Publish(request.subscription, { roles: this.evH.get('role').getData() }, request.parameters.command, request.requestId);
	},

	UpdateUser: function (request) {
		var req = request;
		var self = this;
		var user = request.parameters.data.user;
				
		this.updateUser(user, function (err, response) {
			self.Publish(request.subscription, { userUpdateResult: response }, req.parameters.command, request.requestId)
		});
	},

	RemoveUser: function (request) {
		if (request.parameters.data.userId != request.subscription.get('userId'))
			this.removeUser(request.parameters.data.userId);
	},

	updateUser: function (user, callbackFn) {
		var callback = callbackFn;
		var users = this.evH.get('user');

		var cachedUser = users.getById(user.id)
		if (!cachedUser) {
			user.password = crypto.createHash('sha256').update(user.userName).digest("hex")
		}
		else if(user.password){
			user.password = crypto.createHash('sha256').update(user.password).digest("hex")
		}
		
		this.dbModule.save('user', user, function (err) {
			callback(err, err ? false : true);
		});
	},

	updatePassword: function (data, callbackFn) {
		var callback = callbackFn;
		var users = this.evH.get('user');
		var cachedUser = users.getById(data.userId);

		if(cachedUser.password !== crypto.createHash('sha256').update(data.oldPassword).digest("hex")){
			callback({ message: 'Old password is invalid'});
		}
		else{
		cachedUser.password = crypto.createHash('sha256').update(data.newPassword).digest("hex")
			this.dbModule.save('user', cachedUser, function (err) {
				callback(err, err ? false : true);
			});
		}
	},

	removeUser: function (userId) {
		var user = this.evH.get('user').getById(userId)
		user.active = false
		this.dbModule.save('user', user)
	},

	login: function (userName, password) {
		var hash = crypto.createHash('sha256').update(password).digest("hex");
		var adMembership = this.get('adMembership');
		var users = this.evH.get('user');
		var config = this.get('config');
		var cd = 86400000;// day in milliseconds 24 * 60 * 60 * 1000;

		return new Promise((resolve, reject) => {
			var callBackFn = (selectedUser, adUser) => {
				if (selectedUser) {				
					if (
						!selectedUser.tokenCreated 
						|| (selectedUser.tokenCreated 
							&& Math.floor(
								((new Date()).getTime() - (new Date(selectedUser.tokenCreated)).getTime()) / cd) >= (config.tokenValidInDays || 1))
						){

						selectedUser.tokenCreated = new Date().toISOString().slice(0, 19).replace('T', ' ')
						selectedUser.authToken = this.guid()
					}
					selectedUser.roles = this.evH.get('user_roles').getLinq()
						.where(x => x.user_id === selectedUser.id)
						.select((x) => {
							return {
								id: x.roles_id,
								roleName: this.evH.get('role').getById(x.roles_id).roleName 
							}
						})
						.toArray()
					if (adUser) {
						selectedUser.displayName = adUser.displayName;
						selectedUser.email = adUser.mail;
					}
					
					this.dbModule.save('user', selectedUser, (err) => {
						resolve(selectedUser)
					})
				}
				else {
					reject({ category: "AUTH_ERROR", message: "Invalid credentials" })
				}
			}
	
			if (adMembership) {
				adMembership.login(userName, password, (err, auth) => {
					if (auth) {
						adMembership.getUser(userName, (err, adUser) => {
							var tempUsers = users.getLinq().firstOrDefault((x)=>{ return x.userName === userName })
							callBackFn(tempUsers, adUser)
						});
					}
					else {
						var friendlyError = {
							category: "AUTH_ERROR",
							message: 'User: ' + userName + ' used invalid credentials.'
						};
						logger.error('User: ' + userName + ' login error:', err);
						reject(friendlyError)
					}
				});
			}
			else {

				var tempUsers = users.getLinq().firstOrDefault((x) =>{ return x.userName === userName && x.password === hash && x.active })
				
				callBackFn(tempUsers);
			}
		})
	},

	authenticate: function (userId, authToken, callbackFn) {
		var callback = callbackFn;
		var config = this.get('config');
		var user;
		var cd = 86400000;// day in milliseconds 24 * 60 * 60 * 1000;
		var users = this.evH.get('user');
		var selectedUser = users.getLinq().firstOrDefault((x) => {
			
			return x.authToken === authToken && authToken;
		});

		if (selectedUser && selectedUser.active && selectedUser.tokenCreated && Math.floor(((new Date()).getTime() - (new Date(selectedUser.tokenCreated)).getTime()) / cd) < (config.tokenValidInDays || 1))
			user = selectedUser;

		if (callback) {
			callback(user ? undefined : {
				category: "AUTH_ERROR",
				message: "Invalid authentication token"
			}, user);
		}
	},

	resolveACL: function(userId, apiKey){
		var apiAccessInstance = this.evH.get('api_access').getById(apiKey);
						
		if (!apiAccessInstance ||
			(
				apiAccessInstance &&
				(
					!apiAccessInstance.roleId ||
					this.evH.get('user_roles').getLinq().any((x) => { return x.user_id === userId && x.roles_id === apiAccessInstance.roleId })
				)
			)) {
			return true
		}
		else{
			return false
		}

	},

	populateUsers: function (callbackFn) {//TODO require refactoring
		var self = this;
		var callback = callbackFn;
		var usersCache = this.evH.get('user');
		var config = this.get('config');
		var adMembership = this.get('adMembership');
		var usersToUpdate = []

		if (adMembership) {
			logger.info('Retriving Active Directory users from ' + this.get('config').activeDirectory.adGroup + ' group.');
			adMembership.getAllUsers(function (err, adUsers) {
				if (err) {
					logger.error('Retriving users from Active Directory error: ' + JSON.stringify(err));
					throw err;
				}
				if (adUsers) {
					logger.info(adUsers.length + ' user details recieved.');

					_.each(adUsers, function (adUser) {
						var user = {
							userName: adUser.sAMAccountName,
							email: adUser.mail,
							displayName: adUser.displayName,
							active: 1
						};

						var selectedUser = usersCache.getLinq().firstOrDefault((x) => { return x.userName === user.userName })
						if (!selectedUser) {
							self.dbModule.save('user', user, (err, response) => {
								if (!err) {
									self.dbModule.save('user_roles', {
										user_id: response[0].id,
										roles_id: 2
									})
								}
							})
						}
						else {
							user.id = selectedUser.id;
							self.dbModule.save('user', user)
						}
					});

					usersCache.getLinq().forEach((user) => {
						if (!_.find(adUsers, function (y) { return y.sAMAccountName === user.userName })) {
							user.active = 0
							self.dbModule.save('user', user)
						}
					});

					callback();
				}
				else
					logger.error('No users in ' + this.get('config').activeDirectory.adGroup + ' group.');
			});
		}
	},

	logApiAccess: function (options) {
		this.dbModule.save('audit', options, (err, updatedRecord) => {

		})
	}
});
module.exports = Membership;