define("Models/AppConfig", [
	'Models/AppSettings'
], function (AppSettings) {
	var AppConfig = Backbone.Model.extend({

		defaults: function () {
			return {
				app: null,
				settings: null,
				assetPopUpFactors: '',//default factors display in popup when hover over asset
				mode: 'pageEdit',
				colorScheme: 'extStylesheetCarbon'
			};
		},

		initialize: function () {
			var self = this;
			var config = this.get("app").get("config");
			if (config) {
				var configObject;
				try {
					configObject = (new Function("return " + config))();
				} catch (error) {
					configObject = null;
				}

				self.set('appSettings', new AppSettings([], { app: this.get("app") }));
				if (configObject != null) {
					// Set values from config object
					for (var attr in configObject) {
						switch (attr) {
							case 'settings':
								_.each(configObject.settings, function (setting) {
									self.get('appSettings').add(setting, { app: self.get("app") });
								});
								//this.set(attr, new ControlSettings(configObject.settings, { control: this.get("control") }));
								break;
							default:
								this.set(attr, configObject[attr]);
								break
						}
					}
				}
				
				this.on("change:settings", function () {
					var appSettings = self.get("appSettings");
					_.each(self.get('settings'), function (setting) {
						appSettings.getSetting(setting.name).set(setting);
					});
				});

				self.get("appSettings").on('all', function (eventName) {
					self.set('settings', self.get('appSettings').clone());
				});
			}

			//Serialize config if anything updated
			this.on("change", function () {
				var config = JSON.stringify(this.clone());
				this.get("app").set({ "config": config }, {silent: true});
			});

			this.on("all", function (eventName, args) {
				// Trigger events on parent tab
				switch (eventName) {
					default:
						self.get('app').trigger(eventName, args);
						break;
				}
			});
		},

		encodeConfig: function () {
			var config = JSON.stringify(this.clone());
			this.get("app").set({ "config": config }, { silent: true });
		},

		clone: function () {
			var self = this;
			var clonedConfig = new Object();
			for(var attr in self.attributes){
				if (attr != 'app' && attr != 'appSettings' && attr != 'mode') {
					switch (attr) {
						case 'settings':
							clonedConfig[attr] = self.get('appSettings')?self.get('appSettings').clone():null;
							break;
						default:
							clonedConfig[attr] = self.get(attr);
							break;
					}
					
				}
			}
			return clonedConfig;
		}

	});

	return AppConfig;
});