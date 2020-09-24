Ext.define('ExtModules.Components.multiSelector', {
	extend: 'Ext.container.Container',
	mixins: { field: 'Ext.form.field.Field' },
	alias: 'widget.miltiselector',

	forceSelection: true,
	labelAlign: 'left',
	displayField: 'name',
	valueField: 'id',
	anchor: '100%',
	matchFieldWidth: false,
	minListWidth: 100,
	enableKeyEvents: true,
	layout: 'anchor',
	defaults: {
		anchor: '100%'
	},

	constructor: function (config) {
		var self = this
		config.fields = config.fields || [config.valueField, config.displayField];

		config.listeners = config.listeners || {}

		config.listeners.destroy = function () {
			app.nameResolver.off(null, null, this);
		};

		this.buildField(config)
		this.callParent(arguments);
	},

	initComponent: function () {
		this.initField();
		this.callParent(arguments);
	},
	 
	buildField: function (config) {
		var self = this
		config.fields = config.fields || [config.valueField, config.displayField];

		this.xref = config.xref

		this.elementSelector = Ext.create('ExtModules.Components.resolverCombo', {
			...config,
			listeners: {
				select: function (that, selected) {
					var module_role = {
						isNewRow: true
					}
					module_role[self.xref.leftField] = self.xref.leftValue
					module_role[self.xref.rightField] = selected[0].data[config.valueField]
					
					app.nameResolver.doRequest({
						dataProviderId: self.xref.dataProviderId,
						tableName: self.xref.childrenTable,
						requestName: 'SetData',
						data: module_role
					}).subscribe(function (message) {

					})
					self.selectedElements.addValue(selected[0].data[config.valueField]);
					self.elementSelector.setValue('');

				}
			}
		});

		//var subConfig = config.xref ? config.xref : config

		this.selectedElements = Ext.create('Ext.ux.form.field.BoxSelect', {
			store: this.elementSelector.store,
			displayField: config.displayField,
			valueField: config.valueField,
			//value: records[i],
			name: 'selectedElements',
			editable: false,
			hideTrigger: true,
			queryMode: "local",
			getValue: function () {
				var response = [];
				_.each(this.value, function (item) { response.push({ id: item }) });
				return response;
			}
		});

		

		if (config.remote) {
			this.elementSelector.on('keyup', () => {
				getRemoteData(this.getValue())
			})
		}

		if (config.xref) {
			this.selectedElements.on('remove', (record) => {
				app.nameResolver.get(self.xref.childrenTable).getLinq()
					.where((x) => x[self.xref.rightField] === record.data[config.valueField] 
						&& x[self.xref.leftField] === self.xref.leftValue)
					.forEach((x) => {
						app.nameResolver.doRequest({
							dataProviderId: self.xref.dataProviderId,
							tableName: self.xref.childrenTable,
							requestName: 'RemoveData',
							data: x
						}).subscribe(function (message) {

						})
					})
				
			})
		}

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

		this.items = [this.selectedElements, this.elementSelector]
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
		return this.selectedElements.getValue()
	},

	setValue: function (value, doSelect) {
		var self = this
		if (self.xref) {
			self.xref.leftValue = value
			app.nameResolver.doRequest({
				dataProviderId: self.xref.dataProviderId,
				tableName: self.xref.childrenTable,
				filter: [{
					field: self.xref.leftField,
					value: value,
					comparison: 'eq'
				}]
			}).subscribe(function (message) {
				var tempTesseract = app.nameResolver.get(self.xref.childrenTable)
				var selectedIds = Enumerable.from(tempTesseract.generateData(message.data.data)).select(x =>  x[self.xref.rightField] ).toArray()
				self.selectedElements.setValue(selectedIds)
			})
		}
		else
			this.selectedElements.setValue(value)
	},
});