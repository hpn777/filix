define("Views/Desktop/Tabs", [
	"Views/Desktop/ProjectBrowser",
    "Models/Tab"
], function (ProjectBrowser, Tab) {

	var DesktopTabs = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null,
				headerTimer: null,
				hideHeaderTimer: null,
				isSliding: false,
				isSorting: false,
				tabPanel: null,
				projectBrowser: null
			};
		},

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			this.set("projectBrowser", new ProjectBrowser({ app: app, main: self }));
			//#region Binding
			
			app.on("change:selectedTab", function (tab) {
				var tempTab = app.get('tabs').get(tab.get('id'));
				var tabPanel = self.get('tabPanel');
				var tabView = tabPanel.getComponent(tab.get('id'));
				if (tabView)
					tabPanel.setActiveTab(tabView);
			});

			app.get("tabs").on("change:name", function (tab) {
				// Update Brower Title and Url
				if (tab.get("selected")) {
					window.location.hash = tab.nameHash();
					document.title = tab.get("name");
				}
				self.updateTabView(tab);
			});

			var updateTabLayout = _.debounce(function (tab) {
				self.removeTab(tab.get('id'));
				self.addTabs(tab);
				self.selectTab(tab);
			}, 100);

			app.get("tabs").on("change:layout change:columns", function (tabConfig) {
				updateTabLayout(tabConfig.get('tab'))
			});

			app.get("tabs").on("reset", function (tab) {

			});
			
			app.get("tabs").on("remove", function (tab) {
				self.removeTab(tab.get('id'));
			});

			app.get("tabs").on("add", function (tabs) {
				self.addTabs(tabs);
			});

			app.get("tabs").on('change:isLocked', function (tabConfig) {
				self.lockTab(tabConfig.get('tab'));
			});

			var tabPanel = self.createTabPanel();
			
			main.get('desktopViewport').add([
				this.get("projectBrowser").accordion,
				{xtype: 'splitter'}, 
				tabPanel
			]);

			//clippy.load('Clippy', function (agent) {
			//	window.app.agent = agent;
			//	agent.show();
			//	agent.speak('Welcome to Aquila.');
			//	var rendomClippy = function () {
			//		agent.animate();
			//		setTimeout(rendomClippy, 15000);
			//	};
			//	rendomClippy();
			//});
		},

		updateTabView: function (tab) {
			var self = this;
			tabPanel = self.get('tabPanel');
			tabView = tabPanel.getComponent(tab.get('id'));

			tabView.tab.setText(tab.get('name'));
		},
		
		//Ext components, private methods
		tabContent: function (tab) {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			var gridPattern = new Array();
			var tabConfig = tab.get('tabConfig');

			//temporaru shit
			var portalItems = [];
			var tabPanel = self.get('tabPanel');
			var length = tabConfig.get('columns')?tabConfig.get('columns'):3;
			var columnWidth = (tabPanel.body.dom.clientWidth-20) / length;
			for (i = 0; i < length; i++) {
				portalItems.push({ id: tab.get('id') + i.toString(), width: columnWidth });
				if (i < length - 1)
					portalItems.push({ xtype: 'splitter', style: 'z-index: 1000;' });
			}
			//-----------------

			for (i = 0; i < 10000; i += 10)
				gridPattern.push(i);
			
			var newTab = {
				id: tab.get('id'),
				windowCount: 1,
				xtype: (tabConfig.get('layout').type == 'portal') ? 'portalpanel' : 'panel',
				autoScroll: (tabConfig.get('layout').type == 'absolute') ? true : false,
				closable: !tabConfig.get('isLocked'),
				icon: tabConfig.get('isLocked')?app.get('resourceStrings').get('lockedIcon').get('value'): undefined,
				stateful: true,
				gridPattern: gridPattern,
				selected: tab ? tab.selected : false,
				layout: tabConfig.get('layout'),
				bodyBorder: false,
				items: (tabConfig.get('layout').type == 'portal') ? portalItems : [],
				defaults: {
					split: true,
				},
				tabModel: tab,
				listeners: {
					removed: function (item) {
						var tab = app.get("tabs").get(item.id);
						tab.remove();
						app.get("tabs").save();
					},
					
				},
				title: tab ? tab.get('name') : app.get("tabs").getNewTabName()
			};
			return newTab;
		},

		createTabPanel: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			var tempControlId;

			//Presets menu
			var tabPresets = [];
			var addNewPageBtnHandler = function (item) {
				var tabPreset = app.get('tabPresets').get(item.presetId);
				var tab = tabPreset.toTab();
				app.get('tabs').update(tab);
				var newTab = app.get('tabs').get(tab.id);
				tabPreset.get('controlPresets').each(function (controlPreset) {
					var control = controlPreset.clone();
					tempControlId = control.id;
					control.tabId = tab.id;
					control.id = tessioUtils.guid();
					control.config = control.config.replace(new RegExp(tempControlId, 'g'), control.id);
					newTab.get('controls').update(control);
				});
				var tabView = self.get('tabPanel').getComponent(tab.id);
				if (tabView)
					self.get('tabPanel').setActiveTab(tabView);
				newTab.save({ saveControls: true });
			};
			
			var addNewPageBtn = Ext.create('Ext.button.Button', {
				name: 'addNewPageBtn',
				text: 'Add new page',
				menu: {
					xtype: 'menu',
					plain: true
				}
			});

			var generateNewPageMenu = function (tabPresets) {
				var toAdd = [];

				toAdd.push({
					text: 'Add empty page',
					handler: function () {
						var emptyTab = {
							id: tessioUtils.guid(),
							name: app.get('tabs').getNewTabName(),
							userId: app.get('userId')
						};

						app.get('tabs').update(emptyTab);
						var tabPanel = self.get('tabPanel');
						var tabView = tabPanel.getComponent(emptyTab.id);
						if (tabView) {
							// tabPanel.setActiveTab(tabView);
							app.get('tabs').get(emptyTab.id).save()
						}
					}
				}, '-');

				if (tabPresets){
					tabPresets.each(function (preset) {
						toAdd.push({
							text: preset.get('name'),
							presetId: preset.get('id'),
							handler: addNewPageBtnHandler
						})
					})
				}

				addNewPageBtn.menu.removeAll()
				addNewPageBtn.menu.add(toAdd)
			}

			generateNewPageMenu(app.get('tabPresets'))

			app.get('tabPresets').on('reset add remove', function () {
				generateNewPageMenu(app.get('tabPresets'))
			});
			//-------------

			var envColour = '#e6e6e6';
			var appNameSpace = window.settings ? settings.namespace : undefined;
			if (appNameSpace) {
				switch (appNameSpace) {
					case 'prod':
					case 'proddr':
						envColour = '#ee7777';
						break;
					case 'ct':
						envColour = '#77ee77';
						break;
					case 'qa':
						envColour = '#7777ee';
						break;
				}
			}

			var tabPanel = Ext.create('Ext.tab.Panel', {
				id: app.get('appName') + '-tabPanel',
				height: 800,
				width: 800,
				activeTab: 0,
				tabPosition: 'top',
				flex: 1,
				stateful: true,
				collapsible: false,
				header: false,
				listeners: {
					beforetabchange: function (tabPanel, newCard, oldCard, eOpts) {//its triggered twice per tab selection
						var selectedTab = app.get('tabs').get(newCard.id);

						app.set("selectedTab", selectedTab);
						//return false;
					}
				},
				plugins: [
					Ext.create('Ext.ux.TabReorderer', {
						animate: 200,
						listeners: {
							ChangeIndex: function (that, container, dragCmp, startIdx, idx, eOpts) {
								//on reorder
							},
							Drop: function (that, container, dragCmp, startIdx, idx, eOpts) {
								var tabs = app.get('tabs');
								var tabPanelItems = container.items.items;
								
								for (i in tabPanelItems) {
									tabs.get(tabPanelItems[i].card.id).set('order', i);
								}
								tabs.save();
								//after reorder
							}
						}
					}),
					Ext.create('Ext.ux.TabCloseMenu', {
						extraItemsTail: [
							'-',
							{
								text: 'Settings',
								handler: function (item) {
									var currentItem = item.ownerCt.currentItem;
									var tempTab = app.get('tabs').get(currentItem.tab.card.id);
									main.get('desktopDialogs').openTabSettings(tempTab);
								}
							},
							{
								text: 'Reset filters',
								id: 'resetFilters',
								handler: function (item) {
									var currentItem = item.ownerCt.currentItem;
									var selectedTab = app.get('tabs').get(currentItem.tab.card.id);
									selectedTab.get('tabConfig').get('filters').clearAll();
									selectedTab.save()
								}
							},
							{
								text: 'Clone tab',
								id: 'cloneTab',
								handler: function (item) {
									var currentItem = item.ownerCt.currentItem;
									var selectedTab = app.get('tabs').get(currentItem.tab.card.id);
									selectedTab.createCopy();
									selecteTab.save()
								}
							}
						],
						listeners: {
							aftermenu: function () {
								currentItem = null;
							},
							beforemenu: function (menu, item) {
								//var lockMenuItem = menu.getComponent('LockTab');
								//var selectedTab = app.get('tabs').get(item.tab.card.id);
								//if (selectedTab.get('isLocked'))
								//	lockMenuItem.setText("Unlock tab");
								//else
								//	lockMenuItem.setText("Lock tab");
								menu.currentItem = item;
							}
						}
					})
				],
				setActiveTab: function (card) {
					var me = this,
						previous;

					card = me.getComponent(card);
					if (card) {
						previous = me.getActiveTab();

						if (previous !== card && me.fireEvent('beforetabchange', me, card, previous) === false) {
							return false;
						}
						if (!card.isComponent) {
							Ext.suspendLayouts();
							card = me.add(card);
							Ext.resumeLayouts();
						}
						me.fireEvent('tabchange', me, card, previous);
						me.activeTab = card;
						Ext.suspendLayouts();
						me.layout.setActiveItem(card);
						card = me.activeTab = me.layout.getActiveItem();
						if (card && card !== previous) {
							me.tabBar.setActiveTab(card.tab);

							try {
								Ext.resumeLayouts(true);//TODO sometimes fails - do something on catch 
							}
							catch (ex) { }

							if (previous !== card) {
								me.fireEvent('tabchange', me, card, previous);
							}
						}
						else {
							Ext.resumeLayouts(true);
						}
						return card;
					}
				},
				items: [],
				
			});
			this.set('tabPanel', tabPanel);
			return Ext.create('Ext.panel.Panel', {
				flex: 1,
				layout: 'fit',
				dockedItems: {
					dock: 'top',
					xtype: 'toolbar',
					style: appNameSpace ? 'background-image: -webkit-linear-gradient(top,' + envColour + ',transparent) !important;' : undefined,
					items: [
						addNewPageBtn,
						{
							text: 'Add new module',
							handler: function () {
								main.get('desktopModules').getModulesWindow();
							}
						}, '->',
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
							//xtype: 'displayfield',
						}
					]
				},
				items: [tabPanel]
			});//tabPanel
		},

		addTabs: function (tabs) {
			var self = this;
			if (!Array.isArray(tabs)) {
				var modelArray = [];
				modelArray.push(tabs);
				tabs = modelArray;
			}
			_.each(tabs, function (tab) {
				self.get('tabPanel').insert(self.tabContent(tab));
			});

		},

		reloadData: function(){
			var tabs = this.get('app').get('tabs');
			this.clear();
			this.addTabs(tabs.toArray());
			//TODO select tab
			this.get("projectBrowser").reloadData();
		},

		clear: function () {
			var self = this;
			var app = this.get("app");

			var tabs = app.get('tabs');
			tabs.each(function (tab) {
				var tabToRemove = self.get('tabPanel').getComponent(tab.get('id'));
				if (tabToRemove) {
					tabToRemove.suspendEvent('removed');
					self.get('tabPanel').remove(tab.get('id'));
				}
			});
		},

		getTab: function (tabId) {
			return this.get('tabPanel').getComponent(tabId);
		},

		selectTab: function (tab) {
			this.get('tabPanel').setActiveTab(tab.get('id'));
			this.get("projectBrowser").selectTab(tab);
		},

		lockTab: function (tab) {
			var tabPanel = this.get('tabPanel');
			tabView = tabPanel.getComponent(tab.get('id'));
			tabView.tab.setClosable(!tab.get('tabConfig').get('isLocked'));
			tabView.tab.setIcon(tab.get('tabConfig').get('isLocked') ? this.get('app').get('resourceStrings').get('lockedIcon').get('value') : undefined);
		},

		getSelectedTab: function () {
			return this.get('tabPanel').getActiveTab();
		},

		removeTab: function (TabId) {
			var tabToRemove = this.get('tabPanel').getComponent(TabId);
			if (tabToRemove) {
				_.each(tabToRemove.items.items, function (item) {
					if (typeof item.unsubscribe === 'function') 
						item.unsubscribe();
				});
				tabToRemove.suspendEvent('removed');
				this.get('tabPanel').remove(TabId);
				//tabToRemove.destroy();
			}
		}
	});

	return DesktopTabs;
});