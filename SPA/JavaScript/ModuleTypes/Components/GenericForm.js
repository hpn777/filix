Ext.define('ExtModules.Components.GenericForm', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.ux.form.field.BoxSelect', 'Ext.ux.data.Printer'],
	mixins: {
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

	constructor: function (config) {//{ columns: ..., tableName: ..., serviceCommand: ...}
		var self = this;
		this.layout = 'anchor';

		this.superclass.constructor.apply(this, arguments);

		this.crateForm(config);

		this.updateButton = Ext.create('Ext.button.Button', {
			id: 'updataButton' + self.id,
			text: config.submitButtonTitle || 'Save',
			disabled: true,
			handler: function () {
				if (self.isValid()) {
					var values = self.getValues();
					var filters = [];
					if (self.orgRecord) {
						for (var attr in self.orgRecord.data) {
							self.orgRecord.data[attr] = values[attr] ? values[attr] : self.orgRecord.data[attr];
						}
					}
					else {
						self.orgRecord = {
							data: values
						};
					}
					self.doRequest({
						command: config.serviceCommand || 'SetData',
						tableName: config.tableName,
						data: config.data
					});
				}
			}
		});

		this.resetButton = Ext.create('Ext.button.Button', {
			id: 'resetButton' + self.id,
			text: 'Reset',
			handler: function () {
				self.orgRecord = null;
				self.add(self.createFormFields(config.columns));
			}
		});

		this.setUpExtensionBar(['->', this.resetButton, this.updateButton], 'bottom');
	},

	crateForm: function (config) {
		self.setColumnDefinitions(config.columns);
		self.add(self.createFormFields(config.columns, config.data));
		this.updateButton.enable()
	}
});