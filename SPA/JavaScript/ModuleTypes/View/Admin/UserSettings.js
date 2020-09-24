Ext.define('ExtModules.View.Admin.UserSettings', {
	extend: 'Ext.panel.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule'
	},
	requires: [

	],
	
	config: {
		dataProvider: null,
	},
	
	constructor: function (config) {
		var self = this;

		this.mixins.dashboardModule.constructor.call(this, config, arguments);

		var app = this.getApp();
		var appConfig = app.get('appConfig');
		var appSettings = [];//appConfig.get('appSettings');

		self.dashboardDP = self.setUpDataProvider({dataProviderId: 'Dashboard'})
		self.dashboardDP.error$.subscribe((err)=>{
			self.setLoading(err.error.message);
			setTimeout(function () { self.setLoading(false); }, 3000);
		})
		//----------------------------
		appSettings.push({
			xtype: 'fieldset',
			title: 'Appearance',
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			items: [{
				name: 'colorScheme',
				fieldLabel: 'Color scheme',
				allowBlank: false,
				editable: false,
				queryMode: 'local',
				displayField: 'name',
				valueField: 'value',
				value: appConfig.get('colorScheme'),
				store: {
					xtype: 'store',
					fields: ['value', 'name'],
					data: [{ name: 'Neptune', value: 'extStylesheetNeptune' }, { name: 'Gray', value: 'extStylesheetGray' }, { name: 'Classic', value: 'extStylesheetClassic' }, { name: 'Access', value: 'extStylesheetAccess' }, { name: 'Carbon', value: 'extStylesheetCarbon' }]
				},
				xtype: 'combo'
			}]
		});
		appSettings.push({
			xtype: 'fieldset',
			title: 'Change password',
			defaultType: 'textfield',
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			items: [{
				name: 'oldPassword',
				fieldLabel: 'Old Password',
				allowBlank: true,
				inputType: 'password'
			}, {
				name: 'newPassword',
				fieldLabel: 'New Password',
				allowBlank: true,
				inputType: 'password'
			}]
		});

		appConfig.get('appSettings').each(function (item) { appSettings.push(item.toExtJSForm()); });

		//------------------------------

		this.items = Ext.widget('form', {
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			border: false,
			bodyPadding: 10,
			app: app,
			fieldDefaults: {
				labelAlign: 'top',
				labelWidth: 100,
				labelStyle: 'font-weight:bold'
			},
			defaults: {
				margins: '0 0 10 0'
			},

			items: appSettings,
			listeners: {
				afterRender: function (thisForm, options) {
					this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
						enter: self.submitControlSettings,
						scope: this
					});
				}
			},
			buttons: [{
				text: 'Save',
				handler: self.submitAppSettings
			}]
		});

		this.callParentConstructor.apply(this, arguments);
		//this.getTab().add(this);
	},

	submitAppSettings: function () {
		var self = this.getValues ? this : this.up('form');
		var app = self.app;
		var appConfig = app.get('appConfig');
		var appSettings = appConfig.get('appSettings');
		
		if (self.isValid()) {
			var values = self.getValues();
			for (var index in values) {
				switch (index) {
					case 'colorScheme':
						appConfig.set('colorScheme', values[index]);
						break;
					case 'newPassword':
						if (values['newPassword'] && values['oldPassword']){
							var responseObj = self.ownerCt.dashboardDP.DoRequest({
								command: 'UpdatePassword',
								oldPassword: values['oldPassword'],
								newPassword: values['newPassword']
							})

							responseObj.$.subscribe((response)=>{
								if(response.data && response.data.passwordUpdated){
									self.setLoading('Password successfuly updated.');
									setTimeout(function () { self.setLoading(false); }, 3000);
								}
							})
						}
						else {
							self.setLoading('Old password field and/or new password is empty');
							setTimeout(function () { self.setLoading(false); }, 3000);
						}
						break;
					default:
						var tempSetting = appSettings.getSetting(index);
						if (tempSetting)
							tempSetting.set('value', values[index]);
						break;
				}
			}
			app.save();
		}
	}
});