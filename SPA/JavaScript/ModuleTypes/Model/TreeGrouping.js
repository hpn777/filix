Ext.define('ExtModules.Model.TreeGrouping', {
	statics: {
		create: function (widgetTitle) {
			Ext.define(widgetTitle, {
				extend: 'Ext.data.Model',
				fields: ['dataIndex','title']
			});
		}
	}
});