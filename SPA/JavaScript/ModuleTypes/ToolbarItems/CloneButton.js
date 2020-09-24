Ext.define('ExtModules.ToolbarItems.CloneButton', {

	cloneButton: function () {
		var control = this.getControl();
		return Ext.create('Ext.menu.Item', {
			text: 'Clone',
			handler: function () {
				control.copyControl();
			}
		});
	}

});