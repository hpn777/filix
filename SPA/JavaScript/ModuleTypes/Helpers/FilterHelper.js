Ext.define('ExtModules.Helpers.FilterHelper', {
	required: ['Ext.ux.grid.filter.CustomFilter'],

	setupCustomFilters: function (dataIndex, columnDefinitions) {
		//add filters
		this.filtersFeature = {
			ftype: 'filters',
			encode: true, // json encode the filter query
			local: false,
			autoReload: true,
			phpMode: false,
			filters: [{
				type: 'custom',
				dataIndex: 'dupa',
				customFilter: Ext.create('Ext.ux.grid.filter.CustomFilter', {
					text: 'Custom filters',
					checked: false,
					columnsList: columnDefinitions
				})
			}]
		};
		if (!this.features)
			this.features = [];
		this.features.push(this.filtersFeature);
	},

	setupLocalFilters: function (customFilters) {
		//add filters
		this.filtersFeature = Ext.create('Ext.ux.grid.FiltersFeature', {
			encode: true, // json encode the filter query
			local: true,
			autoReload: false,
			filters: customFilters
			//phpMode: false
		});
		if (!this.features)
			this.features = [];
		this.features.push(this.filtersFeature);
	},

	setupRemoteFilters: function (customFilters) {
		//add filters
		this.filtersFeature = Ext.create('Ext.ux.grid.FiltersFeature', {
			encode: true, // json encode the filter query
			local: false,
			autoReload: true,
			filters: customFilters
			//phpMode: false
		});
		if (!this.features)
			this.features = [];
		this.features.push(this.filtersFeature);
	},

	setupGroups: function () {
		//add filters
		var groups = {
			ftype: 'grouping',
			groupHeaderTpl: '{columnName}: {name}',
			hideGroupedHeader: false,
			collapsible : true
		};

		if (!this.features)
			this.features = [];
		this.features.push(groups);
	},

	getEncodedFilters: function (filtersList) {
		if (this.filters) {
			var filtersConfig = [];
			var filtersList = this.filtersFeature.getFilterData();
			console.trace(filtersList)
			for (i in filtersList) {
				filtersConfig.push({
					property: filtersList[i].field,
					value: filtersList[i].data.value,
					comparison: filtersList[i].data.comparison,
					type: filtersList[i].data.type
				});
			}
			return Ext.encode(filtersConfig);	
		}
		return null;
	}
});