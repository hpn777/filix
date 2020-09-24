define("Models/ControlSettings", [
    'Models/ControlSettingsItem'
], function (ControlSettingsItem) {

	var ControlSettings = Backbone.Collection.extend({
		model: ControlSettingsItem,


		initialize: function (model, options) {
			var self = this;
			var control = options.control;
			var controlConfig = control.get('controlConfig');
			if (options) {
				self.control = control;
			}

			this.on("change:value", function (args) {
				if (args.get('name') == 'title') {
					control.set( {title: args.get('value')});
				}
			});
		},

		getSetting: function (name) {
			return this.find(function (x) { return x.get("name") == name; });
		},

		clone: function () {
			var controlSettings = [];
			this.each(function (module) {
				controlSettings.push(module.clone());
			});
			return controlSettings;
		},

		createSettingsValueMap: function () {
			var controlSettings = {};
			this.each(function (module) {
				controlSettings[module.get('name')] = module;
			});
			return controlSettings;
		},

		toExtJSForm: function () {
			var settings = [];

			var groupedSettings = this.groupBy(function (x) { return x.get('group') });
			for (var attr in groupedSettings) {
				var group = {
					xtype: 'fieldset',
					layout: 'anchor',
					defaults: {
						anchor: '100%'
					},
					title: attr,
					items: []
				};
				_.each(groupedSettings[attr], function (module) {
					if (attr == 'undefined')
						settings.push(module.toExtJSItem());
					else
						group.items.push(module.toExtJSItem());
				});
				if (group.items.length > 0)
					settings.push(group);
			}

			return settings;
		},
	});

	return ControlSettings;
});
