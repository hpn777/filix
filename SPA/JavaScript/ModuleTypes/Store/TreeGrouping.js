Ext.define('ExtModules.Store.TreeGrouping', {
	requires: ['ExtModules.Model.TreeGrouping'],
	statics: {
		create: function (control, groupingColumns) {
			//generate a new model based on extension title and columns
			ExtModules.Model.TreeGrouping.create('groupingCoumns');
			var controlConfig = control.get('controlConfig');
			groupingColumns = (groupingColumns ? groupingColumns : controlConfig.get('groupByColumns'));
			var store = Ext.create('Ext.data.JsonStore', {
				// store configs
				autoDestroy: true,
				model: 'groupingCoumns',
				data: groupingColumns && groupingColumns.length > 0 ? groupingColumns : [{ dataIndex: 'All', title: 'All' }],
				autoLoad: false
			});
			return store;
		}
	}
});