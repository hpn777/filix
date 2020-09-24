var BaseModule = require('./Base');
var Collection = require('../Core/Model/Collection');
var Rx = require('rx');
var {lodash:_} = require('tessio');
var Enumerable = require('linq');

var Dashboard = BaseModule.extend({

	defaults: function () {
		return {
			ready: false,
		}
	},

	initialize: function ({
		subscriptionManager,
		config
	}) {

		this.subscriptionManager = subscriptionManager
		this.config = config
		this.membershipProvider = this.subscriptionManager.getModule(config.membershipModule);

		this.baseInitialize()

		this.dbModule = this.subscriptionManager.getModule(this.config.dbModule);

		if (this.dbModule)
			this.evH = this.dbModule.evH

		this.set('ready', true);
	},

	Ready: function (request) {
		var self = this;
		this.Publish(request.subscription, null, 'Ready');
	},

	GetDashboardTabs: function (request) {
		var self = this;
		var tesseract = self.evH.get('tab')
		var session = tesseract.createSession({
			filter: [{
				field: 'userId',
				value: request.subscription.get('userId'),
				comparison: 'eq'
			}],
			sort: [{
				property: 'order',
				direction: 'ASC'
			}]
		});

		session.on('dataUpdate', function (data) {
			self.Publish(request.subscription, data.toJSON(), request.parameters.command, request.requestId);
		}, request.subscription)

		request.subscription.on('remove', () => {
			session.destroy()
		})

		self.Publish(request.subscription, {
			addedData: session.getData()
		}, request.parameters.command, request.requestId);
	},

	GetDashboardControls: function (request) {

		let session = this.evH.createSession({
			table: 'control',
			subSessions: {
				module_roles: {
					table: 'module_roles',
					subSessions: {
						user_roles: {
							table: 'user_roles',
							columns: [{
								name: 'roles_id', primaryKey: true
							},{
								name: 'user_id'
							}],
							filter:[{
								field: 'user_id',
								value: request.subscription.get('userId'),
								comparison: 'eq'
							}]
						}
					},
					columns: [{
						name: 'module_id', primaryKey: true
					},{
						name: 'roles_id',
					},{
						name: 'user_role',
						resolve: {
							underlyingField: 'roles_id',
							session: 'user_roles',
							displayField: 'roles_id',
						},
					}]
				}
			},
			columns: [
				{name: 'id', primaryKey: true},
				{name: 'title'},
				{name: 'config'},
				{name: 'tabId'},
				{name: 'moduleClass'},
				{name: 'moduleId'},
				{
					name: 'user_role',
					resolve: {
						underlyingField: 'moduleId',
						session: 'module_roles',
						displayField: 'user_role',
					}
				}
			],
			filter: [{
				field: 'tabId',
				value: request.parameters.tabId,
				comparison: 'eq'
			},{
				field: 'user_role',
				value: undefined,
				comparison: 'neq'
			}]
		}, true)

		session.on('dataUpdate', data => {
			this.Publish(request.subscription, data.toJSON(), request.parameters.command, request.requestId);
		}, request.subscription)
		
		request.subscription.on('remove', () => {
			session.destroy()
		})
		this.Publish(request.subscription, {addedData: session.getData()}, request.parameters.command, request.requestId);
	},

	GetDashboardModules: function (request) {
		let session = this.evH.createSession({
			table: 'module',
			subSessions: {
				module_roles: {
					table: 'module_roles',
					subSessions: {
						user_roles: {
							table: 'user_roles',
							columns: [{
								name: 'roles_id', primaryKey: true
							},{
								name: 'user_id'
							}],
							filter:[{
								field: 'user_id',
								value: request.subscription.get('userId'),
								comparison: 'eq'
							}]
						}
					},
					columns: [{
						name: 'module_id', primaryKey: true
					},{
						name: 'roles_id',
					},{
						name: 'user_role',
						resolve: {
							underlyingField: 'roles_id',
							session: 'user_roles',
							displayField: 'roles_id',
						},
					}],
					filter: [{
						field: 'user_role',
						value: undefined,
						comparison: 'neq'
					}]
				}
			},
			columns: [
				{name: 'id', primaryKey: true},
				{name: 'name'},
				{name: 'moduleClassName'},
				{name: 'moduleType'},
				{name: 'moduleGroup'},
				{name: 'config'},
				{name: 'parentId'},
				{name: 'owner_id'},
				{name: 'description'},
				{
					name: 'user_role',
					resolve: {
						underlyingField: 'id',
						session: 'module_roles',
						displayField: 'user_role',
					}
				}
			],
			filter: [{
				field: 'user_role',
				value: undefined,
				comparison: 'neq'
			}]
		}, true)

		session.on('dataUpdate', data => {
			this.Publish(request.subscription, data.toJSON(), request.parameters.command, request.requestId)
		})

		request.subscription.on('remove', () => {
			session.destroy()
		})

		this.Publish(request.subscription, { addedData: session.getData()}, request.parameters.command, request.requestId);
	},

	SaveTabOrderAndSelection: function (request) {
		this.dbModule.save('tab', request.parameters.tabs, (err, response) => {
			this.Publish(request.subscription, {
				err,
				response
			}, request.parameters.command, request.requestId)
		})
	},

	SaveDashboardTab: function (request) {
		var self = this;
		var tab = request.parameters.tab;
		var controls = request.parameters.controls;

		self.dbModule.save('tab', tab, (err, response) => {
			
		})

		if (controls) {
			self.dbModule.save('control', controls, (err, response) => {
				this.Publish(request.subscription, {
					err,
					response
				}, request.parameters.command, request.requestId)
			})
		}
	},

	RemoveDashboardTab: function (request) {
		this.dbModule.remove('tab', request.parameters.tab.id, (err, response) => {
			this.Publish(request.subscription, {
				err,
				response
			}, request.parameters.command, request.requestId)
		})
	},

	SaveControl: function (request) {
		this.dbModule.save('control', request.parameters.control, (err, response) => {
			this.Publish(request.subscription, {
				err,
				response
			}, request.parameters.command, request.requestId)
		})
	},

	RemoveControl: function (request) {
		//TODO check if control belongs to the user
		this.dbModule.remove('control', request.parameters.control.id, (err, response) => {
			this.Publish(request.subscription, {
				err,
				response
			}, request.parameters.command, request.requestId)
		})
	},

	GetTabPresets: function (request) {
		var self = this;
		var tabPresets = this.evH.get('tab_preset');
		var controlPresets = this.evH.get('control_preset');
		var moduleRolesE = self.evH.get('module_roles').getLinq()
		var user = this.evH.get('user').getById(request.subscription.get('userId'));
		var userRolesIds = self.evH.get('user_roles').getLinq()
			.where((x) => {
				return x.user_id === request.subscription.get('userId')
			})
			.select((x) => {
				return x.roles_id
			})
			.toArray()

		var session = tabPresets.createSession({
			filter: [{
				field: 'userId',
				value: [user.id, null],
				comparison: 'in'
			}]
		});

		var getPresets = function (data) {
			return Enumerable.from(data)
				.where((tabPreset) => {
					tabPreset.controlPresets = controlPresets.getLinq()
						.where((x) => {
							return x.tabPresetId === tabPreset.id &&
								moduleRolesE.firstOrDefault((y) => {
									return y.module_id === x.moduleId 
										&& userRolesIds.indexOf(y.roles_id) !== -1 ? true : false;
								})
						})
						.toArray();

					return tabPreset.controlPresets.length > 0
				})
				.orderBy((x) => {
					return x.name
				})
				.toArray()
		}

		session.off(null, null, request.subscription)
		session.on('dataUpdate', function (data) {
			data = data.toJSON()
			data.addedData = getPresets(data.addedData)
			data.updatedData = getPresets(data.updatedData)
			self.Publish(request.subscription, {
				presets: data
			}, request.parameters.command, request.requestId);
		}, request.subscription)
		
		request.subscription.on('remove', () => {
			session.destroy()
		})

		self.Publish(request.subscription, {
			presets: {
				updatedData: getPresets(session.getData())
			}
		}, request.parameters.command, request.requestId);
	},

	SaveTabPreset: function (request) {
		var self = this;
		var tab = request.parameters.tab;
		var controls = request.parameters.controls;
		var subscription = request.subscription;
		var tabPresets = this.evH.get('tab_preset');
		var controlPresets = this.evH.get('control_preset');
		if (tab && controls && controls.length) {
			//var user = this.membershipProvider.get('users').get(subscription.get('userId'));

			//if (!tab.userId && this.membershipProvider.get('users').isUserInRole(subscription.get('userId'), 'admin'))
			//	tab.userId = undefined;
			//else
			//	tab.userId = subscription.get('userId');

			self.dbModule.save('tab_preset', tab, (err, response) => {
				if (!err)
					self.dbModule.save('control_preset', controls, (err, response) => {
						this.Publish(request.subscription, {
							err,
							response
						}, request.parameters.command, request.requestId)
					})
			})
		}
	},

	GetAllUsers: function (request) {
		var self = this;
		var users = this.evH.get('user').getLinq().select((x) => {
			return {
				id: x.id,
				userName: x.userName,
				email: x.email,
				displayName: x.displayName
			}
		}).toArray()
		this.Publish(request.subscription, {
			users: users
		}, request.parameters.command, request.requestId);
	},

	GetUserConfig: function (request) {
		var self = this;
		var userId = request.subscription.get('userId')

		var user = this.evH.get('user').getById(userId);

		if (user)
			self.Publish(request.subscription, {
				config: user.config
			}, request.parameters.command, request.requestId);
	},

	SaveUserConfig: function (request) {
		var self = this;
		this.membershipProvider.dbModule.save('user', {
			id: request.subscription.get('userId'),
			config: request.parameters.userConfig
		}, function (err, status) {
			self.Publish(request.subscription, {
				configUpdated: status
			}, request.parameters.command, request.requestId);
		});
	},

	UpdatePassword: function (request) {
		var self = this;
		var data = {
			userId: request.subscription.get('userId'),
			oldPassword: request.parameters.oldPassword,
			newPassword: request.parameters.newPassword
		};
		this.membershipProvider.updatePassword(data, function (err) {
			if (!err)
				self.Publish(request.subscription, {
					passwordUpdated: true
				}, request.parameters.command, request.requestId);
			else
				self.PublishError(request.subscription, err, request.parameters.command, request.requestId);
		});
	}
});
module.exports = Dashboard;