define("Views/Desktop/Dialogs", [
    "Models/Tab"
], function (Tab) {

	var DesktopDialogs = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null
			};
		},

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
		},

		openControlSettings: function (control) {
			var self = this;
			var controlConfig = control.get('controlConfig');
			var controlSettings = controlConfig.get('controlSettings');
			
			var form = Ext.widget('form', {
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				border: false,
				bodyPadding: 10,
				height: 400,
				autoScroll: true,
				control: control,
				fieldDefaults: {
					labelAlign: 'top',
					labelWidth: 100,
					labelStyle: 'font-weight:bold'
				},
				defaults: {
					margins: '0 0 10 0'
				},

				items: controlSettings.toExtJSForm(),
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
					handler: self.submitControlSettings
				}, {
					text: 'Cancel',
					handler: function () {
						this.up('form').getForm().reset();
						this.up('window').destroy();
					}
				}]
			});

			var win = Ext.widget('window', {
				title: 'Widget settings',
				closeAction: 'hide',
				width: 400,
				layout: 'fit',
				resizable: true,
				modal: true,
				items: form
			});
			win.show();
		},

		submitControlSettings: function () {
			var self = this.getValues ? this : this.up('form');
			var tab = self.control.get('tab');
			var controlConfig = self.control.get('controlConfig');
			var controlSettings = controlConfig.get('controlSettings');
			if (self.isValid()) {
				var values = self.getValues(false, false, false, true);
				//self.control.set('title', values.title);
				for (var index in values) {
					var tempSetting = controlSettings.getSetting(index);
                    if (tempSetting.get('xtype') === 'checkbox') {
                        tempSetting.set('checked', values[index]);
                    } else {
					    tempSetting.set('value', values[index]);
                    }
				}
				self.control.save();
				this.up('window').destroy();
			}
		},

		openTabSettings: function (tab) {
			var self = this;
			var tabConfig = tab.get('tabConfig');

			var layouts = Ext.create('Ext.data.Store', {
				fields: ['value', 'name'],
				data: [ 
					{ "value": "fit", "name": "Fit layout" },
					//{ "value": "hbox", "name": "Horizontal Split layout" },
					//{ "value": "vbox", "name": "Vertical Split layout" },
					{ "value": "portal", "name": "Portal layout" },
					{ "value": "absolute", "name": "Absolute layout" }
				]
			});

			var types = Ext.create('Ext.data.Store', {
				fields: ['value', 'name'],
				data: [
					{ "value": "default", "name": "Default" },
					{ "value": "landingPage", "name": "Landing page" },
					{ "value": "eventPage", "name": "Alerts" },
					{ "value": "timelineLongTerm", "name": "Timeline Long Term" },
					{ "value": "timelineOverviewPage", "name": "Timeline overview" },
					{ "value": "timelineDetailsPage", "name": "Timeline details" },
					{ "value": "messagesPage", "name": "Messages" },
					{ "value": "adminPage", "name": "Settings" }
				]
			});

			var form = Ext.widget('form', {
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				border: false,
				bodyPadding: 10,
				tab: tab,
				fieldDefaults: {
					labelAlign: 'top',
					labelWidth: 100,
					labelStyle: 'font-weight:bold'
				},
				defaults: {
					margins: '0 0 10 0'
				},

				items: [{
					xtype: 'textfield',
					fieldLabel: 'Page title',
					value: tab.get('name'),
					name: 'pageTitle',
					allowBlank: false
				}, {
					xtype: 'combo',
					name: 'pageLayout',
					fieldLabel: 'Page layout',
					value: tabConfig.get('layout').type,
					displayField: 'name',
					valueField: 'value',
					editable: false,
					store: layouts,
					allowBlank: false,
					listeners: {
						select: function (that, records,c) {
							if (records[0].data.value == 'portal')
								form.query('[name=columns]')[0].show();
							else
								form.query('[name=columns]')[0].hide();
						}
					}
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Number of columns',
					value: tabConfig.get('columns'),
					name: 'columns',
					hidden: tabConfig.get('layout').type == 'portal' ? false : true
				}, {
					xtype: 'combo',
					name: 'pageType',
					fieldLabel: 'Page type',
					value: tabConfig.get('pageType'),
					displayField: 'name',
					valueField: 'value',
					editable: false,
					store: types,
					allowBlank: false
				}],
				listeners: {
					afterRender: function (thisForm, options) {
						this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
							enter: self.submitTabSettings,
							scope: this
						});
					}
				},
				buttons: [{
					text: 'Save',
					handler: self.submitTabSettings
				}, {
					text: 'Cancel',
					handler: function () {
						this.up('form').getForm().reset();
						this.up('window').destroy();
					}
				}]
			});

			var win = Ext.widget('window', {
				title: 'Tab settings',
				closeAction: 'hide',
				width: 400,
				layout: 'fit',
				resizable: true,
				modal: true,
				items: form
			});
			win.show();
		},

		submitTabSettings: function () {
			var self = this.getValues ? this : this.up('form');
			if (self.isValid()) {
				var values = self.getValues();
				var tabModel = self.tab;//app.get('tabs').get(self.tab.get());
				tabModel.set('name', values.pageTitle);

				if (tabModel.get('tabConfig').get('layout').type != values.pageLayout){
					tabModel.get('tabConfig').set('layout', {
						type: values.pageLayout,
						align: 'stretch',
						pack: 'start'
					});
				}

				if (tabModel.get('tabConfig').get('pageType') !== values.pageType) {// if pageType changed
					app.get('tabs').each(function (tab) {
						if (tab.get('tabConfig').get('pageType') == values.pageType && tab.get('tabConfig').get('pageType') != 'default')
							tab.get('tabConfig').set('pageType', 'default');
					});
				}

				tabModel.get('tabConfig').set('columns', values.columns);
				tabModel.get('tabConfig').set('pageType', values.pageType );
				tabModel.save();
				//app.get('tabs').save();

				this.up('window').destroy();
			}
		},

		openLogin: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");

			var form = Ext.widget('form', {
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				border: false,
				bodyPadding: 10,

				fieldDefaults: {
					labelAlign: 'top',
					labelWidth: 100,
					labelStyle: 'font-weight:bold'
				},
				defaults: {
					margins: '0 0 10 0'
				},

				items: [{
					xtype: 'textfield',
					fieldLabel: 'User name',
					name: 'userName',
					allowBlank: false
				}, {
					xtype: 'textfield',
					inputType: 'password',
					fieldLabel: 'Password',
					name: 'password',
					allowBlank: true
				}],
				listeners:{
					afterRender: function(thisForm, options){
						this.keyNav = Ext.create('Ext.util.KeyNav', this.el, {
							enter: self.processLogin,
							scope: this
						});
					}
				},
				buttons: [{
					text: 'Log In',
					handler: self.processLogin
				}]
			});
			var loginWindow = Ext.getCmp('loginWindow');
			if (loginWindow)
				loginWindow.destroy();
			var win = Ext.widget('window', {
				id: 'loginWindow',
				title: 'Login to ' + app.get('appName') + ' Control Centre',
				closeAction: 'hide',
				width: 300,
				layout: 'fit',
				resizable: false,
				closable: false,
				modal: true,
				items: form
			});
			win.show();
		},

		processLogin: function () {
			var self = this.getValues ? this : this.up('form');
			if (self.isValid()) {
				var values = self.getValues();

				var parameters = {
					userName: values.userName,
					password: values.password,
				};
				app.get('sync').login(parameters);
			}
		},

		openPdf: function (url) {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");

			var loginWindow = Ext.getCmp('pdfPreviewWindow');
			if (loginWindow)
				loginWindow.destroy();
			var win = Ext.widget('window', {
				id: 'pdfPreviewWindow',
				title: 'Document Viewer',
				closeAction: 'hide',
				width: 800,
				height: 600,
				layout: 'fit',
				resizable: true,
				closable: true,
				modal: false,
				items: [{
					xtype: 'panel',
					html: '<object data="' + url + '" type="application/pdf" width="100%" height="100%"></object>'
				}]
			});
			win.show();
		}
	});
	//<object data="test.pdf" type="application/pdf" width="300" height="200"></object>
	return DesktopDialogs;
});