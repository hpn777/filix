Ext.define('ExtModules.ToolbarItems.SaveAllButton', {

	saveAllButton: function () {
		return Ext.create('Ext.button.Button', {
			text: 'Save all',
			handler: () => {
				var store = this.getStore();
				var records = []
				var moduleConfig = this.getModuleConfig()
				
				if (moduleConfig.storeType === 'remote') {
					store.data.forEach((x) => {
						if (x.dirty)
							records.push(x)
					})
				}
				else {
					records = Enumerable.from((store.snapshot && store.snapshot.items) || store.data.items).where(x => x.dirty).toArray();
				}

				if (records && this.saveAll){
					Ext.MessageBox.confirm('Confirm', 'Are you sure you want to update ' + records.length + ' records?', btn => {
						if (btn === 'yes') {
							this.saveAll(records);
						}
					})
				}
			}
		});
	}
});