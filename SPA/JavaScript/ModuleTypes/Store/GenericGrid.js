Ext.define('ExtModules.Store.GenericGrid', {
	requires: ['ExtModules.Model.GenericGrid', 'ExtModules.Proxy.WebSocket', 'ExtModules.Store.Async'],
	statics: {
		create: function (control, data, pageSize, columnDefinition) {
			pageSize = 200;
			//generate a new model based on extension title and columns
			ExtModules.Model.GenericGrid.create(control.get('title'), columnDefinition);
			//-------------
			// Store definition

			//var groupField = config.Grouping != undefined ? config.Grouping[0].groupField : null;

			
			var store = Ext.create('ExtModules.Store.Async', {
				autoDestroy: true,
				model: control.get('title'),
				buffered: true, //needed to enabled lazy loading
				proxy: {
					type: 'socket',
					socketHUB: data.panel.getDataProvider(),
					control: control,
					reader: {
						type: 'json',
						root: 'data.data',
					    //idProperty: 'id',
						totalProperty: 'data.total'
					}
				},
				remoteSort: true,
				remoteGroup: true,
				autoLoad: false,
			    //groupField: groupField,
				pageSize: pageSize
			});
			return store;
		}
	}
}); 