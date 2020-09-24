Ext.define('ExtModules.ToolbarItems.ClearFiltersButton', {
	clearFiltersButton: function () {
		var self = this;
		var control = this.getControl();

		return Ext.create('Ext.button.Button', {
			text: 'Clear filters',
			handler: function (that, event) {
				self.filtersFeature.clearFilters();
			}
		});
	}
});