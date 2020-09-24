Ext.define('ExtModules.ToolbarItems.ReloadButton', {

	reloadButton: function () {
		var self = this;
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		var filters = controlConfig.get('filters').clone();
		return Ext.create('Ext.button.Button', {
			text: 'Reload',
			handler: function () {
				self.setLoading(true);
				self.getStore().removeAll();
				//self.bypassSyncColumns = false;
				self.doRequest({
					command: 'GetData',
					spName: moduleConfig.spGetName,
					tableName: moduleConfig.tableName,
					filters: filters
				});
			}
		});
	}

});