Ext.define('ExtModules.Store.Remote', {
	requires: ['ExtModules.Proxy.WebSocket', 'ExtModules.Store.Async'],
	
	createRemoteStore: function (model, options) {
		var store = Ext.create('ExtModules.Store.Async', _.extend({
			grid: this,
			autoDestroy: true,
			model: model,
			buffered: true,
			proxy: {
				type: 'socket',
				socketHUB: this.getDataProvider(),
				grid: this,
				control: this.getControl(),
				reader: {
					type: 'json',
					root: 'data.data',
					idProperty: this.idProperty,
					totalProperty: 'data.total'
				}
			},
			remoteSort: true,
			remoteGroup: true,
			autoLoad: false,
			//groupField: groupField,
			pageSize: 100
		}, options));
		return store;
	}
}); 