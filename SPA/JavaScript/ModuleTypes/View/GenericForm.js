Ext.define('ExtModules.View.GenericForm', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.ux.form.field.BoxSelect', 'Ext.ux.data.Printer'],
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule',
		formFields: 'ExtModules.Model.FormFields'
	},
	requires: [

	],

	bodyPadding: 10,
	overflowY: 'auto',

	config: {
		dataProvider: null,
		dashboardDataProvider: null,
		columnDefinitions: null
	},

	constructor: function (config) {
		var self = this;
		this.mixins.dashboardModule.constructor.call(this, config, arguments);
		this.layout = 'anchor';
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		this.idProperty = moduleConfig.idProperty || 'id';

		this.callParentConstructor.apply(this, arguments);

		if (moduleConfig.extensionBarBottom) {
			this.setUpExtensionBar(moduleConfig.extensionBarBottom, 'bottom');
		}
		else {
			this.updateButton = Ext.create('Ext.button.Button', {
				id: 'updateButton' + self.id,
				text: config.submitButtonTitle ? config.submitButtonTitle : 'Save',
				disabled: true,
				handler: function () {
					if (self.isValid()) {
						var validityState = true
						var values = self.getValues();
						var filters = [];

						var columns = self.getColumnDefinitions()
					
						_.each(columns, (column) => {
							if (column.afterEdit) {
								var component = self.form.findField(column.name)
								var oldData = self.orgRecord ? self.orgRecord.data : {}
								validityState = validityState && column.afterEdit(component, values[column.name], oldData[column.name], values, oldData);
							}
						})
						
						if (!validityState)
							return 

						if (self.orgRecord) {
							for (var attr in self.orgRecord.data) {
								self.orgRecord.data[attr] = values[attr] !== undefined ? values[attr] : self.orgRecord.data[attr];
							}
						}
						else {
							self.orgRecord = {
								data: values
							};
						}
						
						self.getDataProvider().DoRequest({
							command: 'SetData',
							tableName: moduleConfig.tableName,
							data: self.orgRecord.data
						}).$.subscribe((x) => {
							if(x.data.success === true)
								self.setLoading('Successfuly saved.');
							setTimeout(function () { self.setLoading(false); }, 2000);
						});
					}
				}
			});

			this.resetButton = Ext.create('Ext.button.Button', {
				id: 'resetButton' + self.id,
				text: 'Reset',
				handler: function () {
					self.orgRecord = null;
					self.add(self.createFormFields(self.getColumnDefinitions()));
				}
			});

			this.setUpExtensionBar(['->', this.resetButton, this.updateButton], 'bottom');
		}
		
		control.on('change:filter:' + moduleConfig.defaultSelect, (record) => {
			record.value.data = self.tesseract.generateRow(record.value.data, self.getColumnDefinitions())
			self.orgRecord = record.value;
			self.add(self.createFormFields(self.tesseract.getHeader(), record.value.data));
			self.updateButton.enable();
		});

		control.on("change:status", function () {
			switch (control.get("status")) {
				case "started":
					//self.subscribe();
					//self.reapplyState();
					break;
				case "stopped":
					//self.unsubscribe();
					break;
				case "hidden":
					//self.unsubscribe();
					break;
				case "destroyed":
					control.off(null, null, self);
					controlConfig.off(null, null, self);
					self.unsubscribe();
			}
		}, self);

		this.subscribe();
	},

	subscribe: function () {
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		var filters = controlConfig.get('filters').clone();

		if (!this.getDataProvider()) {
			this.setDataProvider(this.setUpDataProvider({
				dataProviderId: moduleConfig.dataProviderId,
				parameters: {
					command: moduleConfig.initialCommand,
					query: moduleConfig.query,
					tableName: moduleConfig.tableName,
					filters: filters
				},
				messageReceived: this.messageReceived,
				errorReceived: this.errorReceived
			}));
		}
		else {
			this.getDataProvider().subscription.trigger('resubscribe');
		}
	},

	messageReceived: function (message) {
		var self = this;
		var moduleConfig = this.getModuleConfig();
		var controlConfig = this.getControlConfig();
		switch (message.request) {
			case 'GetColumnsDefinition':
				var columns = message.data.header;
				var updatedColumns = tessioUtils.mergeColumns(columns, moduleConfig.columns)
				if (!this.tesseract) {
					self.tesseract = new app.Tesseract({
						id: self.getControl().get('id'),
						idProperty: self.idProperty,
						eventHorizon: app.nameResolver,
						columns: updatedColumns
					})
				}
				else {
					self.tesseract.updateColumns(updatedColumns, true)
				}
				self.setColumnDefinitions(updatedColumns);
				self.add(self.createFormFields(updatedColumns));
				this.updateButton.enable()
				break;
			case "GetData":
				//if (message.success && message.data) {
				//	if (self.orgRecord) {
				//		self.orgRecord.data = message.data;
				//	}
				//	else {
				//		self.orgRecord = {
				//			data: message.data
				//		};
				//	}
				//	self.add(self.createFormFields(self.getColumnDefinitions(), message.data));
				//}
				break;
		}
	},

	errorReceived: function (message) {
		var self = this;

		this.setLoading('Server error code: ' + message.error.code);
		setTimeout(function () { self.setLoading(false); }, 5000);
	},

	doRequest: function (config) {
		var self = this;
		//this.setLoading(true);
		this.getDataProvider().Execute(config);
	}
});