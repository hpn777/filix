define("Views/Desktop/Page", [
    "Models/Tab"
], function (Tab) {

	var dashboardPage = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null,
				selectedTab: null,
				headerTimer: null,
				hideHeaderTimer: null,
				isSliding: false,
				isSorting: false,
				pagePanel: null,
				projectBrowser: null
			};
		},

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			app.on("change:selectedTab", function (app) {
				//TODO!!! single page object is not removed properly and events are stil unbinded
				if (app.get('appConfig').get('mode') == 'pageView' || app.get('appConfig').mode == 'pageEdit') {
					var selectedTab = app.get('selectedTab');
					//self.set('selectedTab', app.get('selectedTab'));
					var slots = [];
					for (var i = 0; i < selectedTab.get('numberOfSlots') ; i++) {
						slots.push({busy: false});
					}
					self.set('numberOfSlots', slots);

					self.selectTab(app.get('selectedTab'));
				}
				//TODO: find how many 
			});

			app.get("tabs").on("change:name", function (tab) {
				// Update Brower Title and Url
				if (tab.get("selected")) {
					window.location.hash = tab.nameHash();
					document.title = tab.get("name");
				}
				//self.updateTabView(tab);
			});

			app.get("tabs").on("reset", function (tab) {

			});

			app.get("tabs").on("remove", function (tab) {

			});
			
			main.get('desktopViewport').add([
				self.get('pagePanel')
			]);
			//#endregion
		},

		updatePageView: function (tab) {
			var self = this;
			tabPanel = self.get('pagePanel');
			tabView = tabPanel.getComponent(tab.get('id'));

			tabView.tab.setText(tab.get('name'));
		},

		//Ext components, private methods
		createPagePanel: function (tab) {
			var self = this;
			var app = this.get("app");
			
			var appConfig = app.get('appConfig');
			var main = this.get("main");
			var gridPattern = new Array();
			var tabConfig = tab.get('tabConfig');
			var header = false;

			for (i = 0; i < 10000; i += 10)
				gridPattern.push(i);

			switch (appConfig.get('mode')) {
				case 'dashboardView':
				case 'pageView':
					header = false;
					break;
			}

			//temporaru shit
			var portalItems = [];
			var tabPanel = main.get('desktopViewport');
			var length = tabConfig.get('columns') ? tabConfig.get('columns') : 3;
			var columnWidth = (tabPanel.body.dom.clientWidth - 20) / length;
			for (i = 0; i < length; i++) {
				portalItems.push({ id: tab.get('id') + i.toString(), width: columnWidth });
				if (i < length - 1)
					portalItems.push({ xtype: 'splitter' });
			}
			//-----------------

			var className = (tabConfig.get('layout').type == 'portal') ? 'ExtModules.Layouts.Portal.PortalPanel' : 'Ext.panel.Panel';
			var newTab = Ext.create(className,{
				id: tab.get('id'),
				windowCount: 1,
				flex: 1,
				tabModel: tab,
				autoScroll: true,
				closable: false,//!tabConfig.get('isLocked'),
				icon: tabConfig.get('isLocked')?app.get('resourceStrings').get('lockedIcon').get('value'): undefined,
				border: false,
				stateful: true,
				gridPattern: gridPattern,
				selected: tab ? tab.selected : false,
				layout: tabConfig.get('layout'),
				title: tab ? tab.get('name') : app.get("tabs").getNewTabName(),
				header: header,
				items: (tabConfig.get('layout').type == 'portal') ? portalItems : [],
				closable: true,
				listeners: { },
				dockedItems: {
					dock: 'top',
					xtype: 'toolbar',
					items: [{
						xtype: 'displayfield',
							value: tab ? tab.get('name') : app.get("tabs").getNewTabName()
						},
						'->', {
						text: 'Dashboard',
						handler: function () {
							var tab = app.get("tabs").first();
							app.get('appConfig').set('mode', 'dashboardEdit');
							app.set('selectedTab', null, { silent: true });
							app.set('selectedTab', tab);
							tab.set("isLoading", true);
							tab.get("controls").fetch();
							//this.app.get('view').get('desktopTabs').selectTab(tab);
						}
					},
					//{
					//	text: 'Undo',
					//	handler: function () {
					//		app.get('selectedTab').undo();
					//	}
					//}, {
					//	text: 'Redo',
					//	handler: function () {
					//		app.get('selectedTab').redo();
					//	}
					//},
					{
					 	text: 'Settings',
					 	handler: function () {
					 		app.get('view').selectTabByType('adminPage');
					 	}
					},
					{
						id: 'loginButton',
						text: 'Logout',
						handler: function () {
							var app = main.get('app');
							if (app.get('authenticated')) {
								app.set('authenticated', false);
							}
						}
					}, {
						//text: '',
						id: 'userNameDisplayField',
						text: 'Hi ' + app.get('userDisplayName'),
					}]
				}
			});
			this.set('tabPanel', newTab);

			main.get('desktopViewport').add(self.get('tabPanel'));
			return newTab
		},

		getTab: function (tabId) {
			//get first available box
			if (tabId == this.get('tabPanel').id)
				return this.get('tabPanel');
		},

		selectTab: function (tab) {
			if (this.get('tabPanel')) {
				this.get('tabPanel').destroy();
			}
			this.createPagePanel(tab);
		},

		reloadData: function () {
			var tab = this.get('app').get('selectedTab') || this.get('app').get('tabs').find(function (x) { return x.get('selected')});
			this.selectTab(tab);
		},

		clear: function () { }
	});

	return dashboardPage;
});