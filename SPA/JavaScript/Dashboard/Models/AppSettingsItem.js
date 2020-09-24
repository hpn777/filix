define("Models/AppSettingsItem", [
], function (Control) {
	var AppSettingsItem = Backbone.Model.extend({

		defaults: function () {
			return {
				name: null,
				fieldLabel: null,
				value: null,
				xtype: 'text',
				checked: null,
				allowBlank: false
			};
		},

		getValue: function () {
			if (this.get('checked') != null)
				return this.get('checked');
			else
				return get('value');
		},

		clone: function () {
			var self = this;
			var clonedSetting = new Object();
			for (var attr in self.attributes) {
				if (attr != 'app')
					switch (attr) {
						default:
							clonedSetting[attr] = self.get(attr);
							break;
					}
			}
			return clonedSetting;
		},

		toExtJSItem: function () {
			var self = this;
			var clonedSetting = new Object();
			for (var attr in self.attributes) {
				if (attr != 'app')
					switch (attr) {
						default:
							clonedSetting[attr] = self.get(attr);
							clonedSetting[attr].labelWidth = 100;
							break;
					}
			}
			return clonedSetting;
		}
	});

	return AppSettingsItem;
});