Ext.define('ExtModules.Components.resolverCombo', {
	extend: 'Ext.form.ComboBox',
	alias: 'widget.resolvercombo',

	forceSelection: true,
	queryMode: 'local',
	emptyText: 'Select...',
	multiSelect: false,
	//minChars: 2,
	//typeAhead: false,
	labelAlign: 'left',
	allowBlank: true,
	addBlank: false,
	//remote: false,
	displayField: 'name',
	valueField: 'id',
	anchor: '100%',
	//hideTrigger: true,
	matchFieldWidth: false,
	minListWidth: 100,
	listeners: {},
	enableKeyEvents: true,

	constructor: function (config) {
		var self = this;
		config.fields = config.fields || [config.valueField, config.displayField];
		this.tpl = '<ul class="x-list-plain"><tpl for="."><li style="height:22px;" class="x-boundlist-item" unselectable="on" role="option">{' + config.displayField + '}</li></tpl></ul>',
			this.store = Ext.create('Ext.data.Store', {
				fields: config.fields,
				//sorters: [{ direction: 'DESC' }],
				loadData: function (data, append) {
					var length = data.length,
						newData = [],
						i;

					for (i = 0; i < length; i++) {
						newData.push(this.createModel(data[i]));
					}
					this.loadRecords(newData, append ? this.addRecordsOptions : undefined);

					if (!config.remote)
						this.fireEvent('load', this);
				}
			});

		var getRemoteData = _.debounce(function (value) {
			var filter = [{
				field: config.displayField,
				comparison: 'like',
				value: value
			}]

			app.nameResolver.doRequest({
				dataProviderId: config.dataProviderId,
				tableName: config.childrenTable,
				filter: filter,
				limit: 20
			}).subscribe(function (message) {
				var tempTesseract = app.nameResolver.get(config.childrenTable)
				if (message.data.data) {
					self.store.loadData(self.processList(tempTesseract.generateData(message.data.data)));
					self.onTriggerClick();
				}
			})
		}, 300)

		config.listeners = config.listeners || {}

		if (config.remote) {
			config.listeners.keyup = function () {
				getRemoteData(self.getValue())
			}
		}

		config.listeners.destroy = function () {
			app.nameResolver.off(null, null, this);
		};

		this.callParent(arguments);
	},

	initComponent: function (config) {
		var me = this;
		var store = me.getStore();
		Ext.apply(me, config);
		me.callParent(arguments);

		const subscribeToData = (tesseract) => {
			store.loadData(this.processList(tesseract.getData()))
			tesseract.on('dataUpdate dataRemove', x => {
				store.loadData(this.processList(tesseract.getData()))
			})
		}

		if (!me.remote) {
			var list = app.nameResolver.getTesseract(me.childrenTable, me.dataProviderId, me.requestName)
			if (list) {
				subscribeToData(list)
			} else {
				app.nameResolver.on('add', function (list) {
					if (list.get('id') == me.childrenTable) {
						subscribeToData(list)
					}
				}, me)
			}
		}
	},

	processList: function (list) {
		var me = this;
		var processedList = list.map(function (x) {
			var tempElement = {};
			_.each(me.fields, function (fieldName) {
				tempElement[fieldName] = x[fieldName];
			});
			return tempElement;
		});

		if (me.addBlank) {
			var tempElement = {};
			_.each(me.fields, function (fieldName) {
				tempElement[fieldName] = undefined;
			});
			processedList.unshift(tempElement);
		}
		return processedList;
	},

	selectById: function (id) {
		this.select(this.getStore().findRecord(this.valueField, id));
	},

	getValue: function () {
		return this.callParent(arguments);
	},

	setValue: function (value, doSelect) {
		var self = this;
		var store = this.store;

		if (store.count() == 0) {
			var functionArgs = arguments;
			store.on('load', () => {
				this.setValueSuper.apply(this, functionArgs);
			});
		}

		this.setValueSuper(value, doSelect);
	},

	setValueSuper: function (value, doSelect) {
		var me = this,
			valueNotFoundText = me.valueNotFoundText,
			inputEl = me.inputEl,
			i, len, record,
			dataObj,
			matchedRecords = [],
			displayTplData = [],
			processedValue = [];

		if (me.store && me.store.loading) {
			// Called while the Store is loading. Ensure it is processed by the onLoad method.
			me.value = value;
			me.setHiddenValue(me.value);
			return me;
		}

		// This method processes multi-values, so ensure value is an array.
		value = Ext.Array.from(value);

		// Loop through values, matching each from the Store, and collecting matched records
		for (i = 0, len = value.length; i < len; i++) {
			record = value[i];
			if (!record || !record.isModel) {
				record = me.findRecordByValue(record);
			}
			// record found, select it.
			if (record) {
				matchedRecords.push(record);
				displayTplData.push(record.data);
				processedValue.push(record.get(me.valueField));
			}
			// record was not found, this could happen because
			// store is not loaded or they set a value not in the store
			else {
				// If we are allowing insertion of values not represented in the Store, then push the value and
				// create a fake record data object to push as a display value for use by the displayTpl
				if (!me.forceSelection) {
					processedValue.push(value[i]);
					dataObj = {};
					dataObj[me.displayField] = value[i];
					displayTplData.push(dataObj);
					// TODO: Add config to create new records on selection of a value that has no match in the Store
				}
				// Else, if valueNotFoundText is defined, display it, otherwise display nothing for this value
				else if (Ext.isDefined(valueNotFoundText)) {
					displayTplData.push(valueNotFoundText);
				}
			}
		}

		// Set the value of this field. If we are multiselecting, then that is an array.
		me.setHiddenValue(processedValue);
		me.value = me.multiSelect ? processedValue : processedValue[0];
		if (!Ext.isDefined(me.value)) {
			me.value = null;
		}
		me.displayTplData = displayTplData; //store for getDisplayValue method
		me.lastSelection = me.valueModels = matchedRecords;

		if (inputEl && me.emptyText && !Ext.isEmpty(value)) {
			inputEl.removeCls(me.emptyCls);
		}

		// Calculate raw value from the collection of Model data
		me.setRawValue(me.getDisplayValue());
		me.checkChange();

		if (doSelect !== false) {
			me.syncSelection();
		}
		me.applyEmptyText();

		return me;
	},
});