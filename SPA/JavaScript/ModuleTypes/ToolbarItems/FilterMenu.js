Ext.define('ExtModules.ToolbarItems.FilterMenu', {

	filterMenu: function () {
		var self = this;

		//Clear all filters
		var cleafiltersBrowserBtn = Ext.create('Ext.menu.Item', {
			text: 'Clear filters',
			handler: function (that, event) {
				self.filtersFeature.clearFilters();
			}
		});

		var filtersMenuBtn = {
			xtype: 'button',
			name: 'FiltersMenu',
			text: 'Filters...',
			//height: 12,
			//margin: 4,
			menu: {
				xtype: 'menu',
				items: [cleafiltersBrowserBtn, this.customFilter]
			}
		};

		return filtersMenuBtn;
	},

	filterMenuItem: function () {
		var self = this;

		//Clear all filters
		var cleafiltersBrowserBtn = Ext.create('Ext.menu.Item', {
			text: 'Clear filters',
			handler: function (that, event) {
				self.filtersFeature.removeAll();
			}
		});

		var customFilterEditor;
		try {
			var filterFeature = _.find(self.features, function (x) { return x.ftype == "filters"; });
			customFilterEditor = filterFeature.filters[0].customFilter;
			customFilterEditor.filter = self.features[0].filters[0];
		} catch (error) {
			customFilterEditor = null;
		}
		var filtersMenuBtn = {
			xtype: 'menuitem',
			name: 'FiltersMenu',
			text: 'Edit Filters',
			menu: {
				xtype: 'menu',
				items: [cleafiltersBrowserBtn, customFilterEditor]
			}
		};

		return filtersMenuBtn;
	}

});