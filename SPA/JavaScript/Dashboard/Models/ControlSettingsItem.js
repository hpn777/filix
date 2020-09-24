define("Models/ControlSettingsItem", [
], function (Control) {
	var ControlSettingsItem = Backbone.Model.extend({

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
				return this.get('value');
		},

		clone: function () {
			var self = this;
			var clonedSetting = new Object();
			for(var attr in self.attributes){
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
				if (attr != 'control')
					switch (attr) {
						default:
							clonedSetting[attr] = self.get(attr);
							break;
					}
			}
			return clonedSetting;
		}
	});

	return ControlSettingsItem;
});