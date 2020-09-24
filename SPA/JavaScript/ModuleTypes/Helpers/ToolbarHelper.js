Ext.define('ExtModules.Helpers.ToolbarHelper', {
	mixins: {
		filterMenu: 'ExtModules.ToolbarItems.FilterMenu',
		groupingEditor:'ExtModules.ToolbarItems.GroupingEditor',
		exportToExcel:'ExtModules.ToolbarItems.ExportToExcel',
		print: 'ExtModules.ToolbarItems.Print',
		saveAllButton: 'ExtModules.ToolbarItems.SaveAllButton',
		cloneButton: 'ExtModules.ToolbarItems.CloneButton',
		addGenericRow: 'ExtModules.ToolbarItems.AddGenericRow',
		reloadButton: 'ExtModules.ToolbarItems.ReloadButton',
		filterButton: 'ExtModules.ToolbarItems.FilterButton',
		timePicker: 'ExtModules.ToolbarItems.TimePicker',
		clearGridButton: 'ExtModules.ToolbarItems.ClearGridButton',
		datePicker: 'ExtModules.ToolbarItems.DatePicker',
	},

	setUpExtensionBar: function (extensions, position) {
		var self = this;
		var extensionBar = Ext.create('Ext.toolbar.Toolbar', {
			layout: {
				type: 'hbox',
				pack: 'start',
				align: 'stretch'
			},
			//height: 40,
			dock: position ? position : 'top',
			items: extensions
		});
		this.addDocked(extensionBar);
	},

	getToolbarItem: function (alias) {
		if (this[alias])
			return this[alias]();
		else
			return alias;
	},

	moreContextMenu: function () {
		return {
			xtype: 'button',
			name: 'MoreMenu',
			text: 'More...',
			menu: {
				xtype: 'menu',
				items: [
					this.exportToExcel(),
					this.print(),
					this.cloneButton()
				]
			}
		}
	}
});