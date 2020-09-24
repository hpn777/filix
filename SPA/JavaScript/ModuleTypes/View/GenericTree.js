Ext.define('ExtModules.View.GenericTree', {
	extend: 'Ext.tree.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule',
		treeHelper: 'ExtModules.Helpers.TreeHelper',
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
		disableSelection: true,
		stateful: true,
		isSetup: false,
		columnSyncRequired: false,
		currentFilter: null
	},

	constructor: function (config) {
		var self = this;
		this.mixins.dashboardModule.constructor.call(this, config, arguments);

		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		this.idProperty = moduleConfig.idProperty || 'id';
		
		control.on("change:status", function () {
			var dp = self.getDataProvider()
			switch (control.get("status")) {
				case "started":
					if (!dp.subscribed)
						dp.Resubscribe();
					break;
				case "stopped":
					if (!moduleConfig.keepSubscribed) {
						dp.Unsubscribe();
					}
					break;
				case "hidden":
					if (!moduleConfig.keepSubscribed) {
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
