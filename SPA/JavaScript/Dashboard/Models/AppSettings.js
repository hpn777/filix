define("Models/AppSettings", [
    'Models/AppSettingsItem'
], function (AppSettingsItem) {

	var AppSettings = Backbone.Collection.extend({
		model: AppSettingsItem,


		initialize: function (model, options) {
			var self = this;
			var app = options.app;
			var appConfig = app.get('appConfig');
			if (options) {
				self.app = app;
			}

			this.on('add', function (setting) {
				setting.on("all", function (eventName, args) {
					//custom events on atribute change
				});
			});
			
		},

		getSetting: function (name) {
			return this.find(function (x) { return x.get("name") == name; });
		},

		clone: function () {
			//TODO magic of cloning
			var appSettings = [];
			this.each(function (module) {
				appSettings.push(module.clone());
			});
			return appSettings;
		},

		toExtJSForm: function () {
			//TODO magic of cloning
			var appSettings = [];
			this.each(function (module) {
				appSettings.push(module.toExtJSItem());
			});
			return appSettings;
		}
	});

	return AppSettings;
});
