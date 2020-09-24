Ext.define('ExtModules.Store.Basic', {
	createBasicStore: function (model) {
		var store = Ext.create('Ext.data.Store', {
			model: this.model,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			},
			loadData: function (data, append) {
				var length = data.length,
					newData = [],
					i;

				for (i = 0; i < length; i++) {
					newData.push(this.createModel(data[i]));
				}
				this.loadRecords(newData, append ? this.addRecordsOptions : undefined);
				this.fireEvent('load', this);
			}
		});
		return store;
	}
}); 