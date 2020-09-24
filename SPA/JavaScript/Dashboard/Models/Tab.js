define("Models/Tab", [
	'Models/Generics/Model',
    'Models/ControlCollection',
	'Models/TabConfig',
], function (Model, ControlCollection, TabConfig) {

	var Tab = Model.extend({

		defaults: function () {
			return {
				id: 0,
				name: "New Tab",
				userId: null,
				columns: 3,
				order: 0,
				parentId: 'root',
				config: null,
				controls: new ControlCollection(null, { tab: this }),
				selected: false,
				width: 1200,
				isLoading: false,
				isSorting: false,
				isResizing: false,
				isReordering: false,
				app: null,
				autoSaveTimer: null,
				saveControls: false,
				description: null,
				autoSave: true,
				isFullyLoaded: false,
			};
		},

		nameHash: function () {
			return this.get("name").replace(/\s/g, "").replace(/[^a-zA-Z 0-9]+/g, "").toLowerCase();
		},

		initialize: function () {
			var self = this;
			var tab = this;
			var app = this.get('app');
			var collection = this.get('collection')

			this.save =  _.debounce(function (options) {
				if (options && options.saveControls) {
					app.get('sync').saveDashboardTab(this.clone(), this.get('controls').clone())
				}
				else
					app.get('sync').saveDashboardTab(this.clone())
			}, 500)

			this.set("tabConfig", new TabConfig({ tab: this }));
			
			this.set('parentId', this.get('parentId') || 'root')

			this.get('controls').on("all", function (eventName, model) {
				switch (eventName) {
					case 'add':
						var selected = tab.get("selected");
						if (selected) {
							model.set("status", "started");
						}
						break;
					default:
						app.get('tabs').trigger(eventName, model)
				}
				
			});
			
			this.on('change:isLocked', function () {
				tab.get('controls').each(function (control) {
					control.get('controlConfig').set('isLocked', tab.get('tabConfig').get('isLocked'));
				});
			});

			this.on("change:selected", function () {
				var selected = tab.get("selected");
				if (selected) {
					// Load Controls
					if (tab.get("controls").length == 0 && !tab.get('isSynced')) {
						tab.set("isLoading", true);
						tab.set('isSynced', true)
						app.get('sync').getDashboardControls(tab.get('id'))
					}

					// Start / Wake Up all Controls
					tab.get("controls").each(function (control) {
						control.set("status", "started");
					});
					// Update Brower Title and Url
					window.location.hash = tab.nameHash();
					document.title = tab.get("name");
				} else {
					// Destroy / Stop all Controls
					var newStatus = "stopped";
					tab.get("controls").each(function (control) {
						control.set("status", newStatus);
					});
				}
			});

			this.on("change:config", function () {
				var updatedConfig = new TabConfig({ tab: tab });
				var tabConfig = tab.get("tabConfig");

				for (var attrib in tabConfig.attributes) {
					if (attrib != 'tab')
						tabConfig.set(attrib, updatedConfig.get(attrib));
				}

				updatedConfig.destroy();
			});

			this.get('tabConfig').on("change:pageType", function () {
				app.get('tabs').trigger('tab:change:type', tab);
			});

			this.get("controls").on("change:isLoading", function (control) {
				if (tab.get("controls").some(function (x) { return x.get("isLoading"); })) {
                    tab.set("isFullyLoaded", false);
                } else {
                    tab.set("isFullyLoaded", true);
                }
			});
		},

		clone: function () {
			return {
				id: this.get("id"),
				name: this.get("name"),
				userId: this.get("userId"),
				selected: this.get("selected"),
				config: this.get("config"),
				order: this.get('order'),
				parentId: this.get('parentId'),
				//isLocked: this.get('isLocked'),
				//isDeleted: this.get('isDeleted')
			};
		},

		cloneSummary: function () {
			return {
				id: this.get("id"),
				name: this.get("name"),
				userId: this.get("userId"),
				selected: this.get("selected")
			};
		},

		createCopy: function () {
			var app = this.get('app');
			var tabs = app.get('tabs');
			var tabClone = this.clone();
			tabClone.id = tessioUtils.guid();
			tabClone.name = 'Copy of ' + tabClone.name;
			tabs.set(tabClone);
			var newTab = tabs.get(tabClone.id);
			newTab.set("saveControls", true);
			newTab.save();
			var clonedControls = [];
			this.get('controls').each(function (control) {
				var tempControl = control.clone();
				tempControl.id = tessioUtils.guid();
				tempControl.tabId = tabClone.id;
				clonedControls.push(tempControl);
			});
			newTab.get("controls").set(clonedControls)
		},

		remove: function () {
			//remove all children
			app.get('sync').removeDashboardTab(this.clone())
			this.get("app").get("tabs").remove(this);
		},

		getFilter: function (filterName) {
			var filter = this.get('tabConfig').get("filters").get(filterName);
			if(filter)
				return filter.clone()
		},

		getFilters: function () {
			return this.get('tabConfig').get("filters").clone();
		},

		setFilter: function (filter) {
			this.get('tabConfig').get("filters").setFilter(filter);
		}
	});

	return Tab;
});