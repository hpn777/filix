Ext.define('ExtModules.Base.DashboardModule', {
	mixins: {
		extensions: 'ExtModules.ToolbarItems.SettingsEditor',
		toolbarHelper: 'ExtModules.Helpers.ToolbarHelper'
	},
	requires: [
		'ExtModules.StateProviders.DatabaseStateProvider',
		'ExtModules.Store.WebSocketHUBCollection',
		'ExtModules.Layouts.Absolute',
		'ExtModules.Layouts.Portal.Portlet',
		'ExtModules.Components.colorPicker'
	],

	config: {
		app: null,
		arguments: null,
		control: null,
		tab: null,
		controlConfig: null,
		moduleConfig: null,
		controlSettings: null,
		state: null
	},
	selModel: {
		allowDeselect: true,
		storeHasSelected: function (record) {
			var store = this.store,
				records,
				len, id, i;

			if (record.hasId() && store.getById(record)) {
				return true;
			} else {
				records = store.data.items;
				if (!records)
					return false;
				len = records.length;
				id = record.internalId;

				for (i = 0; i < len; ++i) {
					if (id === records[i].internalId) {
						return true;
					}
				}
			}
			return false;
		},
	},
	webSocketHUBCollection: null,

	constructor: function (config, arguments) {

		this.viewConfig = {
			loadMask: false,
			preserveScrollOnRefresh: true,
			listeners: {}
		};

		this.initConfig(config);

		this.webSocketHUBCollection = Ext.create('ExtModules.Store.WebSocketHUBCollection', {});

		this.initAdditionalConfig(arguments)
	},

	unsubscribe: function () {
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		control.off(null, null, this);
		controlConfig.off(null, null, this);
		if (this.getDataProvider && this.getDataProvider()) {
			this.getDataProvider().Unsubscribe();
		}
	},

	updateTitle: function () {
		var self = this;
		var moduleConfig = this.getModuleConfig();
		var columns = [];

		if (this.getColumnDefinitions && moduleConfig.tableName)
			columns = this.getColumnDefinitions();

		columns.forEach(function (col) {
			var filterName = moduleConfig.tableName + ':' + col.columnName;
			var selectedFilter = Enumerable
				.from(self.control.getAllFilters())
				.firstOrDefault(function (x) {
					return x.field === filterName
				})

			if (selectedFilter && self.titleTpl.html.indexOf('{' + col.columnName + '}') !== -1) {
				var tempData = {
					title: self.control.get('title')
				};
				if (col.resolve) {
					tempData[col.columnName] = app.nameResolver.resolve({
						dataProviderId: col.resolveView.dataProviderId,
						tableName: col.resolveView.childrenTable,
						valueField: col.resolveView.valueField,
						value: selectedFilter.value,
						remote: true
					})[col.resolveView.displayField];
				} else
					tempData[col.columnName] = selectedFilter.value;
				self.setTitle(self.titleTpl.apply(tempData));
			}
		});
	},

	initAdditionalConfig: function (arguments) {
		var self = this;
		var app = this.getApp();
		var appConfig = app.get('appConfig');
		var control = this.getControl();
		var controlConfig = control.get('controlConfig');
		var controlSettings = controlConfig.get('controlSettings');

		this.setArguments(arguments);
		this.setControlConfig(controlConfig);

		if (control.get('module')) {
			this.setModuleConfig(JSONfn.parse(control.get('module').get('config'), this));
		}

		this.setControlSettings(controlSettings);
		this.settingsValueMap = controlSettings.createSettingsValueMap()
		var moduleConfig = this.getModuleConfig()

		control.set('view', self);
		control.on('change:title', function () {
			self.setTitle(self.titleTpl.apply({
				title: control.get('title')
			}));
		});
		this.titleTpl = new Ext.Template(moduleConfig.titleTemplate || '{title}', {
			compiled: true
		});
		this.title = this.titleTpl.apply({
			title: control.get('title')
		});

		var selectedPanel = this.getTab();
		var tabConfig = control.get('tab').get('tabConfig');

		this.id = control.get('id');

		this.stateful = true;
		if (tabConfig.get('layout').type != 'fit') {
			if (tabConfig.get('layout').type == 'vbox' || tabConfig.get('layout').type == 'hbox') {
				this.flex = 1;
			} else if (tabConfig.get('layout').type == 'absolute') {
				this.x = controlConfig.get('x');
				this.y = controlConfig.get('y');
				this.width = controlConfig.get('width');
				this.height = controlConfig.get('height');
			} else if (tabConfig.get('layout').type == 'portal') {
				this.height = controlConfig.get('height');
			}
		}

		//this.collapsible = true;
		this.icon = controlConfig.get('isLocked') ? app.get('resourceStrings').get('lockedIcon').get('value') : undefined;

		this.closable = true;
		this.tools = [{
			type: 'help',
			tooltip: 'Module info',
			handler: function (event, toolEl, panel) {
				var alertWin = Ext.create('Ext.window.Window', {
					title: 'Module info: ' + control.get('module').get('name'),
					collapsible: false,
					animCollapse: false,
					closable: false,
					maximizable: true,
					width: 950,
					height: 600,
					minWidth: 200,
					minHeight: 200,

					layout: 'fit',
					items: [{
						xtype: 'panel',
						autoScroll: true,
						overflowY: 'auto',
						html: control.get('module').get('description')
					}],
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'bottom',
						ui: 'footer',
						layout: {
							pack: 'center'
						},
						items: [{
							minWidth: 80,
							text: 'Close',
							xtype: 'button',
							handler: function () {
								alertWin.destroy();
							}
						}]
					}]
				});
				alertWin.show();
			}
		}, {
			type: 'gear',
			tooltip: 'WidgetSettings',
			// hidden:true,
			handler: function (event, toolEl, panel) {
				app.get('view').get('desktopDialogs').openControlSettings(control);
			}
		}];

		this.listeners = moduleConfig.listeners || {}

		this.listeners.afterlayout = function (panel) {
			panel.getEl().setStyle('z-index', controlConfig.get('zIndex'));
			panel.mon(panel.el, 'click', function () {
				var maxZControl = app.get('selectedTab').get('controls').maxBy(x => x.get('controlConfig').get('zIndex'));
				var zIndex = 0;
				if (maxZControl != '-Infinity')
					zIndex = maxZControl !== control ? maxZControl.get('controlConfig').get('zIndex') + 1 : maxZControl.get('controlConfig').get('zIndex');
				controlConfig.set('zIndex', zIndex);
				control.save()
			});
		}

		this.listeners.beforeclose = function () {
			if (!controlConfig.get('isLocked')) {
				control.remove();
				//app.get('selectedTab').save();
			}
			return false;
		}

		this.listeners.destroy = function () {
			self.unsubscribe()
		}

		this.listeners.move = function (that, x, y, eOpts) {
			var selectedTab = app.get('selectedTab');
			//if (!control.get('isLocked')) {
			controlConfig.set({
				width: this.width,
				height: this.height,
				x: that.x,
				y: that.y
			}, {
				silent: true
			});

			//}
		}
		this.listeners.startDrag = function (x, y) {
			return false;
		}

		if (moduleConfig.viewConfig)
			this.viewConfig.listeners = moduleConfig.viewConfig.listeners || {}

		this.layout = 'fit';
		switch (appConfig.get('mode')) {
			case 'dashboardView':
			case 'pageView':
				this.header = false;
				//this.border = false;
				this.margin = 5;
				break;
			case 'dashboardEdit':
			case 'pageEdit':
				if (tabConfig.get('layout').type == 'absolute') {
					self.self.mixin('absoluteLayout', ExtModules.Layouts.Absolute);
					self.mixins.absoluteLayout.init.apply(self, [{
						gridPattern: selectedPanel.gridPattern,
						locked: controlConfig.get('isLocked')
					}]);
				} else if (tabConfig.get('layout').type == 'portal') {
					self.self.mixin('portalLayout', ExtModules.Layouts.Portal.Portlet);
					self.mixins.portalLayout.init.apply(self, [{
						gridPattern: selectedPanel.gridPattern,
						locked: controlConfig.get('isLocked')
					}]);
				}
				break;
		}

		setTimeout(function () {
			control.set('loaded', true);
			//control.set('fullyLoaded', true);
		}, 5000);
	},

	reapplyState: function () {
		var self = this;
		var control = this.getControl();
		var controlConfig = control.get("controlConfig");
		if (this.getState) {
			if (controlConfig.get('state') != Ext.encode(this.getState())) {
				try {
					//TODO reload only if filtring, sorting changes
					//self.getView().refresh();
					self.applyState(Ext.decode(controlConfig.get('state')));
					self.store.load();
				} catch (e) {} finally {
					//
					//self.store.load();
				}
			}
		}
	},

	getSetting: function (name) {
		return this.settingsValueMap[name]
	},

	restart: function () {
		var oldPanel = this;
		var control = this.getControl();
		var header = this.getHeaderElement();
		var element = this.getElement();

		// Unsubscribe
		try {
			oldPanel.getDataProvider().Unsubscribe();
			oldPanel.setDataProvider(null);
		} catch (error) {}

		// Kill old panel
		control.off(null, null, oldPanel);
		control.get("filters").off(null, null, oldPanel);
		control.get("controlConfig").off(null, null, oldPanel);
		control.get("tab").get("filters").off(null, null, oldPanel);
		oldPanel.destroy();
		oldPanel = null;
		delete oldPanel;

		// Start new panel
		var newPanel = Ext.create('ExtModules.View.' + control.get("widgetTypeString"), {
			renderTo: element[0],
			control: control,
			headerElement: header,
			element: element
		});
		element.data('panels', [newPanel]);
	},

	setUpDataProvider: function (options) {
		var panel = this;
		var control = this.getControl();
		var subscriptionId = tessioUtils.guid();
		var dataProvider = Ext.create('ExtModules.Store.WebSocketHUB', {
			subscription: new app.Subscription({
				id: subscriptionId,
				subscriptionId: subscriptionId,
				containerId: control.get('id'),
				parameters: (options.parameters ? options.parameters : null),
				dataProviderId: options.dataProviderId
			}),
			//parameters: (options.parameters ? options.parameters : null),
			MessageReceived: options.messageReceived,
			ErrorReceived: options.errorReceived,
			scope: this
		});

		this.webSocketHUBCollection.add(dataProvider);
		return dataProvider;
	}
});