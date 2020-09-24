Ext.define('ExtModules.View.GenericModule', {
	extend: 'Ext.panel.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule'
	},
	requires: [

	],

	config: {
		dataProvider: null,
	},

	constructor: function (config) {
		var self = this;
		this.mixins.dashboardModule.constructor.call(this, config, arguments);
		var control = this.getControl();
		var customClass = this.getModuleConfig().panelClass();

		var panel = new customClass({
			id: this.id + 'custom',
			header: false,
			control: control,
			controlConfig: this.getControlConfig(),
			controlSettings: this.getControlSettings(),
			moduleConfig: this.getModuleConfig()
		});
		
		this.items = [panel];
		
		this.callParentConstructor.apply(this, arguments);
	},
});