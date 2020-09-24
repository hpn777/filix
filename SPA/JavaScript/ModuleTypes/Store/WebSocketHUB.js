Ext.define('ExtModules.Store.WebSocketHUB', {
	control: null,
	scope: null,

	constructor: function (config) {
		var self = this;
		this.scope = this;
		
		Ext.apply(this, config);
		this.parameters = this.parameters || {};

		this.message$ = config.subscription.message$
		this.error$ = config.subscription.error$
		this.resubscribe$ = config.subscription.resubscribe$
		
		if (config.MessageReceived) {
			config.subscription.on('messageReceived', function (message) {
				self.MessageReceived.call(self.scope, message);
			}, this);
		}

		if (config.ErrorReceived) {
			config.subscription.on('errorReceived', function (message) {
				self.ErrorReceived.call(self.scope, message);
			}, this);
		}
		
		config.subscription.on("resubscribe", function () {
			self.subscription.Resubscribe.call(self);
		}, this);

		this.callParent(arguments);
	},
	
	isSubscribed: function () {
		return this.subscription.subscribed
	},

	Unsubscribe: function () {
		this.subscription.Unsubscribe()
	},

	UnsubscribeContainer: function () {
		this.subscription.UnsubscribeContainer()
	},

	Resubscribe: function () {
		this.subscription.Resubscribe()
	},

	Execute: function (parameters, requestId) {
		this.subscription.Execute(parameters, requestId)
	},

	DoRequest: function (parameters, requestId) {
		return this.subscription.DoRequest(parameters, requestId)
	},

	DoSubscribe: function (parameters, requestId) {
		return this.subscription.DoSubscribe(parameters, requestId)
	},

	GetParameters: function () {
		return this.subscription.parameters
	},

	GetSubscription: function (name) {
		return this.subscription.GetSubscription(name)
	},

	SetCallback: function (param, scope) {
		this.MessageReceived = param;
		this.scope = scope;
	}
});