define("Models/ControlConfig", [
	'Models/ControlSettings',
	"Models/FilterCollection"
], function (ControlSettings, FilterCollection) {
	var ControlConfig = Backbone.Model.extend({

		defaults: function () {
			return {
				control: null,
				x: 0,
				y: 0,
				width: 400,
				height: 400,
				zIndex: 0,
				settings: null,
				selectedColumns: '',
				columns: null,
				state: null,
				filters: new FilterCollection(),
				isLocked: false
			};
		},

		initialize: function () {
			var self = this;
			var config = this.get("control").get("config");
			this.set('columns', []);
			if (config) {
				var configObject;
				try {
					configObject = (new Function("return " + config))();
				} catch (error) {
					configObject = null;
				}
				
				self.set('controlSettings', new ControlSettings([], { control: this.get("control") }));
				self.loadConfiguration(configObject)

				this.on("change:settings", function () {
					var controlSettings = self.get("controlSettings");
					_.each(self.get('settings'), function (setting) {
						controlSettings.getSetting(setting.name).set(setting);
					});
				});

				self.get("controlSettings").on('all', function (eventName) {
					self.set('settings', self.get('controlSettings').clone());
				});

				self.get('filters').on('all', function (eventName, filter) {
					if (eventName.indexOf('change:filter:') == 0) {
						self.get("control").trigger(eventName, filter);
						self.encodeConfig();
					}
				});
			}

			this.on("all", function (eventName, args) {
				// Trigger events on parent tab
				switch (eventName) {
					case 'change':
						self.encodeConfig()
						break;
					case 'change:width':
					case 'change:height':
					case 'change:x':
					case 'change:y':
					case 'change:zIndex':
					case 'change:isLocked':
					case 'change:order':
						//self.get('control').get('tab').trigger(eventName + ":controls", args);
						app.get('tabs').trigger(eventName + ":controls", args)
						break;
				}
			});
		},

		loadConfiguration: function (configObject) {
			var self = this

			if (configObject != null) {
				// Set values from config object
				for (var attr in configObject) {
					switch (attr) {
						case 'settings':
							if (!self.get('controlSettings').length) {
								if (self.get("control").get('module')) {
									var moduleConfig = JSONfn.parse(self.get("control").get('module').get("config"));

									_.each(moduleConfig.settings, function (setting) {
										var tempSetting = Enumerable
											.from(configObject.settings)
											.firstOrDefault(function (x) { return x.name == setting.name });

										if (tempSetting) {
											if (tempSetting.checked != undefined)
												setting.checked = tempSetting.checked;
											else
												setting.value = tempSetting.value;
										}
										self.get('controlSettings').add(setting, { control: self.get("control") });
									});
								}
								//inject title settings
								var titleSetting = Enumerable
										.from(configObject.settings)
										.firstOrDefault(function (x) { return x.name == 'title' });
								if (!titleSetting) {
									titleSetting = {
										name: 'title',
										//fieldLabel: 'Widget title',
										allowBlank: false,
										value: self.get("control").get('title'),
										group: 'Widget title',
										xtype: 'textfield',
									}
								}
								self.get('controlSettings').add(titleSetting, { control: self.get("control"), at: 0 });
							}
							else {
								_.each(configObject.filters, function (setting) {
									self.get('controlSettings').set(setting);
								});
							}
							break;
						case 'filters':
							_.each(configObject.filters, function (filter) {
								self.get('filters').setFilter(filter, { silent: true });
							});
							break;
						default:
							this.set(attr, configObject[attr]);
							break
					}
				}
			}
		},

		encodeConfig: function () {
			var config = JSON.stringify(this.clone());
			this.get("control").set({ "config": config }, { silent: true });
		},

		clone: function () {
			var self = this;
			var clonedConfig = new Object();
			for(var attr in self.attributes){
				if (attr != 'control' && attr != 'controlSettings') {
					switch (attr) {
						case 'settings':
							clonedConfig[attr] = self.get('controlSettings').clone();
							break;
						case 'filters':
							clonedConfig[attr] = self.get('filters').clone();
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

	return ControlConfig;
});