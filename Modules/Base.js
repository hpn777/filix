var {lodash:_, backbone} = require('tessio');
var logger = new (require('../Core/Logger'))();
var Model = require('../Core/Model/Model');
var Rx = require('rx');
var Base = Model.extend({
	message$: new Rx.Subject(),//global stream
	error$: new Rx.Subject(),//global stream

	baseInitialize: function () {
		this.message$ = new Rx.Subject()//override with per data provider stream
		this.error$ = new Rx.Subject()//override with per data provider stream
	},

	Publish: function (subscription, responseData, command, requestId) {
		var response = {
			requestId: requestId || subscription.get('requestId'),
			containerId: subscription.get('containerId'),
			subscriptionId: subscription.get('subscriptionId'),
			authToken: subscription.get('authToken'),
			data: responseData,
			request: command,
			success: true
		}

		if (subscription.get('clientId')) {
			this.get('subscriptionManager').Publish(subscription.get('clientId'), response);
		}
		else {
			this.message$.onNext(response);
		}
	},

	ByPassRequest: function (subscription, request) {
		var subscriptionManager = this.get('subscriptionManager');
		subscriptionManager.Publish(subscription.get('clientId'), {
			serverCommand: request.serverCommand,
			requestId: request.requestId,
			containerId: subscription.get('containerId'),
			subscriptionId: request.subscriptionId,//subscription.get('subscriptionId'),
			dataProviderId: subscription.get('moduleId'),
			authToken: subscription.get('authToken'),
			userId: request.userId,//subscription.get('userid'),
			parameters: request.parameters
		});
	},

	PublishError: function (subscription, responseData, command) {
		var response = {
			requestId: subscription.get('requestId'),
			containerId: subscription.get('containerId'),
			subscriptionId: subscription.get('subscriptionId'),
			authToken: subscription.get('authToken'),
			error: responseData,
			request: command,
			success: false
		}

		if (subscription.get('clientId')) {
			this.get('subscriptionManager').Publish(subscription.get('clientId'), response);
		}
		else
			this.message$.onNext(response);
	},

	ExecuteSubRequest: function (request) {
		var subscriptionManager = this.get('subscriptionManager');

		if (request.parameters.subrequests) {
			_.each(request.parameters.subrequests, (item) => {
				var subRequest = {
					dataProviderId: item.dataProviderId,
					subscription: request.subscription,
					parameters: item.parameters
				};
				try {
					subscriptionManager.getModule(subRequest.dataProviderId).publicMethods[subRequest.parameters.command](subRequest);
				}
				catch (ex) {
					logger.error('Execute SubRequest error: ' + request.dataProviderId, ex)
					this.PublishError(subRequest.subscription, { code: 'Command: ' + request.parameters.command + ' is not implemented.' }, subRequest.parameters.command);
				}
			});
		}
	},

	GetPublicMethods: function (request) {
		this.Publish(request.subscription, Object.keys(this.publicMethods), 'GetPublicMethods');
	},

	generatePublicMethods: function (scope) {
		var publicMethods = this.publicMethods || {};
		var self = scope || Object.getPrototypeOf(this);
		_.each(self, (item, attr) => {
			var firstLetter = attr[0];
			if (typeof item === 'function' && firstLetter === firstLetter.toUpperCase()) {
				publicMethods[attr] = item;
			}
		})
		
		this.publicMethods = publicMethods;
	},

	generateApiAccess: function () {
		var membershipDP = this.get('subscriptionManager').getDefaultMembershipDP();
		var apiAccess = membershipDP ? membershipDP.evH.get('api_access') : null;
		if (apiAccess) {
			
			_.each(this.publicMethods, (item, attr) => {
				var accessId = this.get('moduleId') + '.' + attr;
				if (!apiAccess.getById(accessId)) {
					membershipDP.dbModule.save('api_access', { id: accessId, roleId: null, audit: 0 })
				}
			});
		}
	}
});
module.exports = Base;