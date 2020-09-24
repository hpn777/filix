Ext.define('ExtModules.View.GenericGrid', {
	extend: 'Ext.grid.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule',
		gridHelper: 'ExtModules.Helpers.GridHelper',
		API: 'ExtModules.Helpers.API',
	},
	requires: [
		'ExtModules.Model.GenericGrid',
		'Ext.ux.ColumnAutoWidthPlugin'
	],

	config: {
		dataProvider: null,
		animate: false,
		disableSelection: false,
		stateful: true,
		isSetup: false,
		columnSyncRequired: false,
		currentFilter: null
	},
	multiSelect: false,
	listeners: {

	},

	constructor: function (config) {
		var self = this;
		this.mixins.dashboardModule.constructor.call(this, config, arguments);
		
		var control = this.getControl();
		var moduleConfig = this.getModuleConfig();
		this.idProperty = moduleConfig.idProperty || 'id';

		control.on("change:status", function () {
			var dp = self.getDataProvider()
			switch (control.get("status")) {
				case "started":
					if (!dp.subscribed) {
						dp.Resubscribe()

						if (moduleConfig.storeType === 'remote') {
							self.store.removeAll()
							self.store.load()
						}
					}
					break;
				case "stopped":
					if (!moduleConfig.keepSubscribed) {
						dp.Unsubscribe();
					}
					break;
				case "hidden":
					if (!moduleConfig.keepSubscribed || moduleConfig.storeType !== 'remote') {
						dp.Unsubscribe();
					}
					break;
				case "destroyed":
					self.unsubscribe();
			}
		}, self);
		
		this.setUpPanel();
	}
});
