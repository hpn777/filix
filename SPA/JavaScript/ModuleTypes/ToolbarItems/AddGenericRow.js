Ext.define('ExtModules.ToolbarItems.AddGenericRow', {

	addGenericRow: function () {
		var self = this;
		var control = this.getControl();
		var controlConfig = control.get('controlConfig');

		return Ext.create('Ext.button.Button', {
			text: 'Add new',
			handler: function () {
				var grid = self;
				var moduleConfig = self.getModuleConfig()

				if (moduleConfig.storeType === 'remote') {
					self.setLoading('Can\'t add new element. Please use coresponding form.');
					setTimeout(function () { self.setLoading(false); }, 5000);
					return 
				}

				var store = self.getStore();
				var rowEditing = _.find(self.plugins, function (item) { return item.pluginName == 'ColumnEditorPlugin' });
				if (rowEditing) 
					rowEditing.cancelEdit();

				var recordIndex = store.getCount();
				var columns = self.getColumnDefinitions();
				var newId = 1;

				if (self.tesseract.dataCache.length) {
					var topId = self.tesseract.getLinq().maxBy(function (x) { return x[self.tesseract.idProperty] })[self.tesseract.idProperty]
					if (isNaN(topId))
						newId = tessioUtils.guid()
					else
						newId = topId + 1;
				}

				var newRec = {};
				newRec[self.idProperty] = newId;
				
				Enumerable.from(columns).forEach(function (x) {
					if (x.defaultValue) {
						if (typeof (x.defaultValue) == 'function')
							newRec[x.columnName] = x.defaultValue();
						else
							newRec[x.columnName] = x.defaultValue;
					}
				});

				self.tesseract.add(newRec)
				newRec = self.tesseract.getById(newId)
				newRec = store.model.create(newRec);
				newRec.dirty = true;
				newRec.data.isNewRow = true;
				Ext.apply(newRec.modified, newRec.data);

				if (self.getSelectionModel() && self.getSelectionModel().getSelection()[0]) {
					var rec = self.getSelectionModel().getSelection()[0];
					recordIndex = self.store.indexOf(rec);
				}

				store.insert(recordIndex, newRec);

				if (rowEditing) {
					self.getSelectionModel().select(recordIndex);
					rowEditing.startEdit(recordIndex, 1);
				}
				else
					self.getSelectionModel().select(recordIndex);
			}
		});
	}
});