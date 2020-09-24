Ext.define('ExtModules.Store.WebSocketHUBCollection', {
	require: ['ExtModules.Store.WebSocketHUB'],
	hubs: null,

	constructor: function (config, arguments) {
		this.initConfig(config);
		this.hubs = new Ext.util.MixedCollection();
	},

	add: function (webSocketHUB) {
		this.hubs.add(webSocketHUB.SubscriptionID, webSocketHUB);
	},

	remove: function (subscriptionId) {
		var hub = this.hubs.get(subscriptionId);
		hub.Unsubscribe();
		this.hubs.remove(subscriptionId);
		Ext.destroy(hub);
	}
});