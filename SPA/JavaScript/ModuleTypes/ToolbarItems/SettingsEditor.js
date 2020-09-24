Ext.define('ExtModules.ToolbarItems.SettingsEditor', {

	settingsEditor: function () {
		var panel = this;
		var element = this.getElement();
		var controlConfig = this.getControlConfig();
		var settings = controlConfig.get("settings");

		var win = Ext.create('Ext.window.Window', {
			title: 'Settings',
			modal: true,
			layout: 'fit',
			items: Ext.create('Ext.form.Panel', {
				frame: true,
				width: 340,
				bodyPadding: 5,

				fieldDefaults: {
					labelAlign: 'left',
					labelWidth: 90,
					anchor: '100%'
				},

				items: settings.toJSON(),
				buttons: [{
					text: 'Save',
					handler: function (saveButton, event) {

						tempItems = saveButton.ownerLayout.owner.ownerLayout.owner.items.items;
						tempPanel = saveButton.ownerLayout.owner.ownerLayout.owner;

						settings.each(function (setting) {
							if (setting.get("checked") != undefined) {
								setting.set("checked", tempPanel.down('[name=' + setting.get("name") + ']').checked);
							}
							else {
								setting.set("value", tempPanel.down('[name=' + setting.get("name") + ']').getValue());
							}
						});

						win.close();
					}
				}, {
					text: 'Cancel',
					handler: function () { win.close(); }
				}]
			})
		});
		win.show();
	},

	

});