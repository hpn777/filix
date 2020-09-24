Ext.define('ExtModules.ToolbarItems.Print', {
	requires: [
		'Ext.ux.grid.Printer'
	],

	print: function () {
		var grid = this;
		var tempTitle = this.getSetting("headerTitle") ? this.getSetting("headerTitle").get("value") : this.getControl().get("name");
		return Ext.create('Ext.menu.Item', {
			text: 'Print',
			handler: function () {
				Ext.ux.grid.Printer.mainTitle = tempTitle;
				Ext.ux.grid.Printer.print(grid);
			}
		});
	}
});