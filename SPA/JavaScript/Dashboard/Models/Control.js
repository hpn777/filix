define("Models/Control", [
	"Models/ControlConfig"
], function (ControlConfig) {
	var Control = Backbone.Model.extend({

		defaults: function () {
			return {
				tab: null,
				id: 0,
				tabId: 0,
				title: "",
				moduleClassName: "GenericGrid",
				config: null,
				parentId: null,
				moduleId: 0,
				//status: "stopped",
				isLoading: true,
				loaded: false,
				fullyLoaded: false,
				isNew: false,
				isSorting: false
			};
		},

		initialize: function () {
			var self = this;
			var collection = this.get('collection')

			this.save = _.debounce(function () {
				app.get('sync').saveControl(this.clone())
			}, 100)

			this.set("controlConfig", new ControlConfig({ control: this }));
			var controlConfig = self.get("controlConfig");

			//this.on('all', (name, model) => { collection.trigger(name, model) })

			this.on("change:isDeleted", function () {
				self.set("status", "destroyed");
			});

			this.on('change:status', () => { app.get('tabs').trigger('change:status:controls', self) })

			this.on("change:config", function () {
				controlConfig.loadConfiguration((new Function("return " + self.get('config')))())
			});
		},

		clone: function () {
			return {
				id: this.get("id"),
				tabId: this.get("tabId"),
				title: this.get("title"),
				moduleClassName: this.get("moduleClassName"),
				moduleId: this.get("moduleId"),
				config: this.get("config"),
				//parentModuleId: this.get("parentModuleId"),
				//parentId: this.get("parentId"),
			};
		},

		getFilter: function (fieldName) {
			var filter = this.get('controlConfig').get("filters").get(fieldName);
			var tabFilter = this.get('tab').get('tabConfig').get("filters").get(fieldName);

			filter = filter || tabFilter

			if (filter)
				return filter.clone();
		},

		getFilters: function () {
			var localFilter = this.get('controlConfig').get("filters").clone();
			return localFilter;
		},

		getAllFilters: function () {
			var allFilters = this.get('controlConfig').get("filters").clone().concat(this.get('tab').getFilters());
			return allFilters;
		},

		setFilter: function (filter) {
			this.get('controlConfig').get("filters").setFilter(filter);
		},

		remove: function () {
			this.set('status', 'destroyed');
			this.get("tab").get("controls").remove(this);
			app.get('sync').removeControl(this.clone())
		},

		copyControl: function () {
			var copy = this.clone();
			var controls = this.get("tab").get("controls");

			copy.id = tessioUtils.guid();


			//TODO update config
			var config = Ext.decode(copy.config);
			config.x += 30;
			config.y += 30;

			// Update State IDs
			if (config.state) {
				var regExp = new RegExp(this.get("id"), "g");
				config.state = config.state.replace(regExp, copy.id)
			}

			copy.config = Ext.encode(config);

			// Add to collection
			controls.set(copy);
			//save befoere control starts (might race)
			controls.get(copy.id).save();
		}


	});

	return Control;
});
