define("Models/App", [
	'Models/ResourceStringCollection',
    'Models/TabCollection',
    'Models/FilterCollection',
    'Models/ModuleCollection',
	'Models/AppConfig',
	'Subscriber/Subscription',
	'Models/TabPresetCollection',
	'Models/Generics/Collection',
	'Models/NameResolver',
], function (ResourceStringCollection, TabCollection, FilterCollection, ModuleCollection, AppConfig, Subscription, TabPresetCollection, Collection, NameResolver) {

	var App = Backbone.Model.extend({

		defaults: function () {
			return {
				appName: 'Filix',
				tabs: new TabCollection(null, { app: this }),
				modules: new ModuleCollection(null, { app: this }),
				resourceStrings: new ResourceStringCollection(null),
				tabs: new TabCollection(null, { app: this }),
				tabPresets: new TabPresetCollection(null, { app: this }),
				selectedTab: null,
				globalFilters: new FilterCollection(),
				templates: new TabCollection(),
				deletedTabs: new TabCollection(),
				users: new Collection(),
				tradeTicket: null,
				notification: null,
				sync: null,
				isSaving: false,
				isFullyLoaded: false,
				compactMode: false,
				view: null,
				userId: 0,
				userName: '',
				userDisplayName: '',
				authenticated: null,
				authToken: null,
				config: '{}',
				localStorage: Ext.state.LocalStorageProvider.create(),
				autoHide: true,
				layout: 2,
				showHidden: false,
				showUpdateNotifications: true,
			};
		},

		Subscription: Subscription,

		initialize: function () {
			var app = this;
			this.set("appConfig", new AppConfig({ app: this }));
			if (this.get('appConfig').get('colorScheme') == 'extStylesheetCarbon')
				Highcharts.selectTheme('gray')
			else
				Highcharts.selectTheme('grid')

			this.EventHorizon = EventHorizon
			this.Tesseract = Tesseract
			//this.evH = new EventHorizon();			

			var authState = app.get('localStorage').get('auth');
			if (authState) {
				app.set('userId', authState.id);
				app.set('userName', authState.userName);
				app.set('userDisplayName', authState.displayName);
				app.set('authToken', authState.authToken);
				app.set('userRoles', new Collection(authState.roles));
				app.set('userEmail', authState.email);
			}

			app.on("change:authenticated", function (selectedTab) {
				if (!app.get('authenticated') && app.get('localStorage').get('auth')) {
					app.get('localStorage').set('auth', undefined);
					location.reload(true);
				}
			});

			this.on("change:config", function () {
				var updatedConfig = JSONfn.parse(app.get("config"));
				var appConfig = app.get("appConfig");
				appConfig.set(updatedConfig);
			});

			// Tab selection
			app.on("change:selectedTab", function () {
				var selectedTab = this.get("selectedTab");
				this.get("tabs").each(function (tab) {
					if (tab.get('id') != selectedTab.get('id'))
						tab.set("selected", false);
					else
						tab.set("selected", true);
				});
				//this.get("tabs").save();
			});

			setTimeout(() => {
				app.nameResolver = new NameResolver([], {
					dataProviderId: 'ConfigDB'
				});
			}, 0)
			
			app.on('change:authenticated', function () {
				if (app.get('authenticated')){
					app.off('change:authenticated', null, app)
					app.get('sync').getDashboardTabs()
				}
			}, app);

			app.once('change:isFullyLoaded', function () {
				if (app.get('authenticated') && app.get('isFullyLoaded')) {
					app.get('sync').getDashboardModules();
					app.get('sync').getUserCollection()
					app.get('sync').getTabPresets()
					app.get('sync').getUserConfig()
				}
			});

			app.on('change:colorScheme', function (appConfig) {
				var link = $('#extStylesheet');
				link.attr('href', app.get('resourceStrings').get(app.get('appConfig').get('colorScheme')).get('value'));
				if (app.get('appConfig').get('colorScheme') == 'extStylesheetCarbon')
					Highcharts.selectTheme('gray')
				else
					Highcharts.selectTheme('grid')
				setTimeout(function () {
					app.get('view').get('desktopViewport').doLayout();
				}, 1000);
			});

			this.get("tabs").on("change:isFullyLoaded", function (tab) {
				if (app.get("selectedTab") == tab) {
					app.set("isFullyLoaded", tab.get("isFullyLoaded"));
				}
			});
		},

		isAdmin: function () {
			return this.get('userRoles').find(function (x) { return x.get('roleName') === 'admin'; }) ? true : false;
		},

		isUserInRole: function (roleName) {
			return this.get('userRoles').find(function (x) { return x.get('roleName') === roleName; }) ? true : false;
		},

		selectInitialTab: function () {
			var app = this;
			var appMode = this.getUrlAttribute('mode');
			if (window.location.hash) {
				// Get from url hash
				var tab = app.get("tabs").find(function (x) { return x.nameHash() == window.location.hash.substring(1); });
				if (tab != null) {
					//window.location.hash = "";
					app.get('appConfig').set('mode', appMode ? appMode : 'dashboardEdit');
					app.set("selectedTab", tab);
					//tab.set("isLoading", true);
					if (!tab.get("isLoading") && !tab.get('isSynced')) {//FIX - temp solutuion prevent accidental double loading all widgets. Need to be fixed properly
						tab.set('isSynced', true)
						app.get('sync').getDashboardControls(tab.get('id'))
					}
					app.get('view').get('desktopTabs').selectTab(tab);
				}
				else
					app.get('appConfig').set('mode', appMode ? appMode : 'dashboardEdit');

			} else {
				// Get from db
				var tab = app.get("tabs").find(function (x) { return x.get("tabConfig").get('pageType') == 'landingPage'; });
				if (!tab) {
					tab = app.get("tabs").find(function (x) { return x.get('selected') }) || app.get("tabs").first();
					app.get('appConfig').set('mode', appMode ? appMode : 'dashboardEdit');
				}
				else if (appMode)
					app.get('appConfig').set('mode', appMode);

				if (tab) {
					app.set("selectedTab", tab);
					if (!tab.get("isLoading"))
						app.get('sync').getDashboardControls(tab.get('id'))
					app.get('view').get('desktopTabs').selectTab(tab);
				}
			}
		},

		createTabFromTemplate: function (id, group) {
			this.get("tabs").trigger("createFromTemplate", { id: id, group: group });
		},

		sendTabToUser: function (tab, userID) {
			this.get("tabs").trigger("sendTabToUser", { tab: tab, userID: userID });
		},

		setFilter: function (id, value, options) {
			if (_.include(["lInstrumentID"], id)) {
				// Global Filter
				this.get("globalFilters").setFilter(id, value, options);
				this.get("tabs").each(function (tab) {
					if (tab.allowFilter(id)) {
						tab.get("filters").setFilter(id, value, options);
					}
				});
			} else {
				// Local Filter
				if (this.get("selectedTab")) {
					this.get("selectedTab").get("filters").setFilter(id, value, options);
				}
			}
		},

		setFilters: function (filters) {
			var app = this;
			var previous = "";
			if (app.get("selectedTab")) {
				previous = JSON.stringify(app.get("selectedTab").get("filters").toJSON());
			}
			_.each(filters, function (filter) {
				app.setFilter(filter.id, filter.value, { silent: true });
			});
			if (app.get("selectedTab")) {
				var current = JSON.stringify(app.get("selectedTab").get("filters").toJSON());
				if (current != previous) {
					app.get("selectedTab").get("filters").trigger("change:value");
				}
			}
		},

		setFiltersOnSiblings: function (guid, filters) {
			var app = this;
			var control = app.get('selectedTab').get('controls').find(function (x) { return x.get("guid") == guid });
			if (control != null) control.setFiltersOnSiblings(filters);
		},

		save: function (attributes, options) {
			// Ensure wait is always set on save
			app.get('sync').saveUserConfig()
		},

		getUrlAttribute: function (attributeName) {
			var queryString = $.QueryString(attributeName);
			if (queryString != null) {
				var value = queryString;
				if (value.indexOf("#") > -1) {
					value = value.substring(0, value.indexOf("#"));
				}
				return value;
			}
		},

		getControl: function (guid) {
			var control = null;

			// Check selected tab first
			if (this.get("selectedTab") != null) {
				var control = this.get("selectedTab").get("controls").find(function (x) { return x.get("id") == guid });
			}

			if (control != null) {
				return control;
			} else {
				// Check all tabs
				this.get("tabs").each(function (tab) {
					var control = tab.get("controls").find(function (x) { return x.get("id") == guid });
					if (control != null) {
						return control;
					}
				});
			}
		},

		getControlAsHtml: function (guid) {
			var self = this;
			var control = self.getControl(guid);
			if (control != null) {
				return self.get("view").get("desktopPdf").getDashboardControlHtml(control);
			} else {
				return "";
			}
		},

		updateTabs: function (tabs) {
			var self = this;
			_.each(tabs, function (tab) {
				var currentTab = self.get("tabs").get(tab.id);
				if (currentTab != null) {
					currentTab.set(tab);
				} else {
					self.get("tabs").add(tab);
				}
			});

			self.get("tabs").each(function (tab) {
				if (!_.any(tabs, function (tempTab) { return tempTab.id == tab.get('id') })) {
					tab.remove();
				}
			});
		}
	});

	return App;
});