define("Models/TabConfig", [
	'Models/FilterCollection'
], function (FilterCollection) {
	var TabConfig = Backbone.Model.extend({

		defaults: function () {
			return {
				tab: null,
				selected: false,
				isLocked: false,
				filters: new FilterCollection(),
				opened: true,
				featured: false,
				autoSave: true,
				layout: {
					type: 'absolute',
					align: 'stretch',
					pack: 'start'
				},
				columns: 3,
				pageType: 'default',
				numberOfSlots: 0
			};
		},

		initialize: function () {
			var self = this;
			var config = this.get("tab").get("config");
			if (config) {

				var configObject;
				try {
					configObject = (new Function("return " + config))();
				} catch (error) {
					configObject = null;
				}

				if (configObject != null) {
					// Set values from config object
					for (var attr in configObject) {
						switch (attr) {
							case 'filters':
								_.each(configObject.filters, function (filter) {
									self.get('filters').setFilter(filter, {silent: true});
								});
								break;
							default:
								this.set(attr, configObject[attr]);
								break
						}
						
					}
				}
			}

			//Serialize config if anything updated
			this.on("change", function () {
				var config = JSON.stringify(this.clone());
				this.get("tab").set({ "config": config }, {silent: true});
			});

			this.on("all", function (eventName, args) {
				// Trigger events on parent tab
				switch (eventName) {
					default:
						self.get('tab').trigger(eventName, args);
						break;
				}
			});

			var controls = self.get('tab').get('controls');
			self.get('filters').on('all', function (eventName, filter) {
				if (eventName.indexOf('change:filter:') == 0) {
					controls.each(function (control) {
						control.trigger('change:filter:' + filter.field, filter);
					});
					self.encodeConfig();
				}
			});

			this.encodeConfig();
		},

		encodeConfig: function () {
			var config = JSON.stringify(this.clone());
			this.get("tab").set({ "config": config }, { silent: true });
		},

		clone: function () {
			var self = this;
			var clonedConfig = new Object();
			for(var attr in self.attributes){
				if (attr != 'tab') {
					switch (attr) {
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

	return TabConfig;
});