Ext.define('ExtModules.ToolbarItems.ClearGridButton', {
	clearGridButton: function () {
		var self = this;
		var control = this.getControl();

		return Ext.create('Ext.button.Button', {
			text: 'Clear',
			handler: function () {
				self.getStore().removeAll();
			}
		});
	}
});