define("Models/ControlCollection", [
    'Models/Control'
], function (Control) {

	var ControlCollection = Backbone.Collection.extend({
		defaults: function () {
			return {
				isSynced: false
			}
		},
		model: Control,
		comparator: function (control) {
			return control.get('order');
		},
		initialize: function (model, options) {
			this.tab = options.tab;
			this.tempID = -1;
		},
        
		clone: function () {
			var clone = [];
			for (var i = 0; i < this.length; i++) {
				clone.push(this.at(i).clone());
			}
			return clone;
		},

		update: function (model) {
			var self = this

			if (!Array.isArray(model)) {
				model = [model];
			}

			_.each(model, (item) => {
				var existingItem = self.get(item.id)
				if (existingItem) {
					existingItem.set(item)
				}
				else {
					var module = self.tab.get("app").get("modules").filter(function (x) { return x.get("id") === item.moduleId; });
					if (module.length)
						item.module = module[0];

					item.order = self.getNewTabOrder();
					item.tab = self.tab;
					self.add(item)
				}
			})
		},

		getNewTabOrder: function () {
			var order = 0;
			if (this.length > 0) {
				order = this.maxBy(function (x) { return x.get("order"); }).get("order") + 1;
			}
			return order
		},

		create: function (attributes, options) {
			Backbone.Collection.prototype.create.call(this, attributes, options);
			this.trigger("create", this);
		},

		reset: function (models, options) {
			if (!models || models.length == 0) {
				this.each(function (control) {
					control.set("status", "destroyed");
				});
			}
			this.trigger('reset', this, options);
			return Backbone.Collection.prototype.reset.call(this, models, options);
		},

		convertModuleToControl: function (module) {

			var freeSpace = this.findFreeSpace((module.get("defaultWidth") != null ? module.get("defaultWidth") : 400));
			var control = {
				id: this.tempID--,
				title: module.get("title"),
				widgetType: module.get("widgetType"),
				widgetTypeString: module.get("widgetTypeString"),
				width: (module.get("defaultWidth") != null ? module.get("defaultWidth") : 400),
				height: (module.get("defaultHeight") != null ? module.get("defaultHeight") : 200),
				x: freeSpace.x,
				y: freeSpace.y,
				config: (module.get("widgetType") == "WebPage" ? module.get("url") : module.get("defaultConfig")),
				proc: module.get("proc"),
				refreshInterval: module.get("refreshInterval"),
				url: module.get("url"),
				moduleId: module.get("id"),
				parentID: module.get("parentId"),
				isNew: true
			};
			return control;
		},

		checkForConfigUpdate: function (control, defaultConfig) {
			var currentVersion = this.getVersionFromConfig(control.config);
			var newVersion = this.getVersionFromConfig(defaultConfig);

			// Update Config
			if (newVersion > currentVersion) {
				control.config = defaultConfig;
			}
		},

		getVersionFromConfig: function (config) {
			version = 0;
			if (config) {
				try {
					var json = (new Function("return " + config))();
					if (json.Version) version = json.Version;
				} catch (error) { }
			}
			return version;
		}

	});

	return ControlCollection;
});