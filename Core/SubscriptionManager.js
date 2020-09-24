var {lodash:_} = require('tessio');
var Model = require('./Model/Model');
var Collection = require('./Model/Collection');
var Enumerable = require('linq');
var logger = new (require('./Logger'))();

var config;

var SubscriptionManager = Model.extend({
	defaults: function () {
		return {
			subscriptions: new Collection(),
			connections: [],
			modules: []
		}
	},

	initialize: function (params, options) {
		var self = this;

        this.subscriptions = this.get('subscriptions')
        this.connections = this.get('connections')
        this.modules = this.get('modules')

		if (options && options.config) {
			config = options.config;
		}
		else {
			logger.error('App Service config is missing or invalid.');
			return;
		}
		
		var initModule = (index) => {
			index = index || 0

			if (config.modules && config.modules[index]) {

                var tempDP = self.getModule(config.modules[index].id);
				if (tempDP) {
					if (tempDP.get('ready')) {
						initModule(++index);
					}
					else {
						tempDP.once('change:ready', () => {
							initModule(++index);
						});
					}
				}
			}
			else {
				self.generateApiAccess();
				self.set('ready', true);
			}
		}

		initModule()
    },
    
    ready() {
        if (this.get('ready')) {
            return Promise.resolve(true)
        }

        return new Promise((resolve, reject) => {
            this.on('change:ready', () => resolve(this))
        })
    },

	Subscribe: function (request) {
		var self = this;
		var callback = (err, response) => {
			if (response) {
				self.subscriptions.add({
					id: request.subscriptionId,
					requestId: request.requestId,
					subscriptionId: request.subscriptionId,
					clientId: request.clientId,
					containerId: request.containerId,
					moduleId: request.moduleId || request.dataProviderId,
					connectionType: request.connectionType,
					userId: request.userId,
					authToken: request.authToken
				});
				self.Execute(request);
			}
			else {
				//var requestedUser = config.membershipModule ? self.getDefaultMembershipDP().evh.get('user').getById(request.userId) : 'Unknown';

				//logger.info('User: ' + (requestedUser ? requestedUser.get('userName') : req.userId) + ' - ' + req.moduleId + ' authentication failed');

				self.PublishError(request, { message: "Unauthorized access", code: -32401 });
			}
		}
		
		if (config.membershipModule && request.connectionType !== 'cluster') {
			this.getDefaultMembershipDP().authenticate(request.userId, request.authToken, callback);
		}
		else {
			callback(null, true);
		}
	},

	Unsubscribe: function (request) {
		this.clearSubscription(request.subscriptionId, request.connectionType);
	},

	clearSubscription: function (subscriptionId, connectionType) {
		var subscription = this.subscriptions.get(subscriptionId);
		if (subscription) {
			subscription.remove();

            this.connections.forEach(connection => {
                if(connection.connectionType == 'cluster') {
                    connection.sendMessage({
                        subscriptionId: subscriptionId,
                        serverCommand: 'Unsubscribe'
                    })
                }
            })
		}
	},

	UnsubscribeContainer: function (request) {
		var self = this;
		var containerId = request.containerId;
		var subscriptions = this.subscriptions.where({ containerId: containerId });

		_.each(subscriptions, function (subscription) {
			self.clearSubscription(subscription.get('subscriptionId'));
		});
	},

	UnsubscribeClient(clientId) {

        this.subscriptions
            .filter({ clientId })
            .forEach(subscription => {
                this.clearSubscription(subscription.get('subscriptionId'))
            })

        delete this.connections[clientId]
	},

	Login: function (request) {
		var self = this;
		var req = request;
		this.getDefaultMembershipDP()
			.login(request.parameters.userName, request.parameters.password)
				.then((response) => {
					self.Publish(req.clientId, {
						requestId: req.requestId,
						containerId: req.containerId,
						subscriptionId: req.subscriptionId,
						authToken: response.authToken,
						data: { user: response },
						request: "Login",
						success: true
					})
				})
				.catch((err)=>{
					self.PublishError(req, { message: err.message, code: -32401 })
				})
	},

	Execute: function (request) {
		var subscription = this.subscriptions.get(request.subscriptionId);
		if (subscription) {

			if(request.authToken !== subscription.get('authToken')){
				this.PublishError(request, { message: "Unauthorized access", code: -32401 });
				return
			}
			request.subscription = subscription;
			if (config.membershipModule) {
				var moduleId = request.moduleId || request.dataProviderId
				var membershipDP = this.getDefaultMembershipDP();
				try {
					if (request.parameters && request.parameters.command) {

						var apiKey = moduleId + '.' + request.parameters.command;
						var apiAccessInstance = membershipDP.evH.get('api_access').getById(apiKey);
						if (
							request.connectionType === 'cluster' ||
							membershipDP.resolveACL(subscription.get('userId'), apiKey)) {
							if (apiAccessInstance && apiAccessInstance.audit)
								membershipDP.logApiAccess({
									request: JSON.stringify(request.parameters),
									api_access_id: apiKey,
									user_id: subscription.get('userId'),
									timestamp: new Date()
								})

                            let module = this.getModule(subscription.get('moduleId'))

							module.publicMethods[request.parameters.command].apply(module, arguments);
						}
						else
							this.PublishError(request, { message: 'Insufficient access rights to call: ' + apiKey });
					}
				}
				catch (ex) {
					logger.error('Error to execute ' + request.parameters.command + ' in ' + moduleId + ': ', ex);
					this.PublishError(request, { message: 'Command: ' + request.parameters.command + ' error: ' + ex });
				}
			}
			else{
				try {
					if (request.parameters && request.parameters.command) {
                        let module = this.getModule(subscription.get('moduleId'))
						module.publicMethods[request.parameters.command].apply(module, arguments);
					}
				}
				catch (ex) {
					logger.error('Error to execute ' + request.parameters.command + ' in ' + request.moduleId + ': ', ex);
					this.PublishError(request, { message: 'Command: ' + request.parameters.command + ' error: ' + ex });
				}
			}
		}
	},

	Publish: function (clientId, response) {
		var message = JSON.stringify(response);
		var connection = this.getConnection(clientId)
		try {
			if (connection)
				connection.send(message)
		}
		catch (ex) { } //connection is already dead
	},

	PublishError: function (request, response) {
		var connection = this.getConnection(request.clientId)
		var errorResponse = {
			error: response,
			requestId: request.requestId,
			containerId: request.containerId,
			subscriptionId: request.subscriptionId,
			//request: request.data.Command,
			success: false
		};
		var errorMessage = JSON.stringify(errorResponse);
		try {
			if (connection)
			connection.send(errorMessage)
		}
		catch (ex) { } //connection is already dead
		//else
		//	logger.error('Conecion nr ' + request.clientId + ' does not exist.');
	},

	getModule: function (moduleId) {
		var modules = this.modules

		if (!modules[moduleId]) {
            var moduleConfig = config.modules.find(m => m.id === moduleId)

			if (!moduleConfig) {
				logger.error('Data Provider Exception: Config for Data Provider ' + moduleId + ' has not been found.');
				return;
			} 
			try {
				var Module = moduleConfig.module || require('../Modules/' + moduleConfig.moduleId);
				modules[moduleConfig.id] = new Module({
					moduleId: moduleConfig.id,
					subscriptionManager: this,
					config: moduleConfig
				}, {
					// This is duplicated for now, but the above can be removed
					// once all modules are refactored to use this properties
					moduleId: moduleConfig.id,
					subscriptionManager: this,
					config: moduleConfig
                });
				if (!moduleConfig.private && modules[moduleConfig.id].generatePublicMethods)
					modules[moduleConfig.id].generatePublicMethods();
			}
			catch (ex) {
				logger.error('Data Provider ' + moduleId + ' Exception: ', ex);
				throw ex;
				//self.PublishError(request, { message: 'Data provider: ' + ModuleId + ' error: ' + ex });
			}
		}
		return modules[moduleId];
	},

    getConnection(clientId) {
        return this.connections[clientId]
    },

    getDefaultMembershipDP: function () {
        if (config.membershipModule) {
            return this.getModule(config.membershipModule)
        }
	},

    generateApiAccess() {
        if (config.membershipModule) {
			for (let [key, module] of Object.entries(this.modules)) {
                if(module.generateApiAccess) {
                    module.generateApiAccess()
                }
			}
        }
    },

	getConfig: function () {
		return config
	}
});
module.exports = SubscriptionManager;