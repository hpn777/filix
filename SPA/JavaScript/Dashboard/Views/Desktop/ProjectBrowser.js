define("Views/Desktop/ProjectBrowser", [
], function () {

	var ProjectBrowser = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null
			};
		},

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");

			//removed change:isFullyLoaded
			app.get("tabs").on("change:featured add remove change:name change:isLocked", function (tab) {
				self.reloadData();
			});

			app.on("change:selectedTab", function () {
				var selectedTab = app.get('selectedTab');
				self.selectTab(selectedTab);
			});

			app.get('tabs').on("tab:change:pageType", function (tab) {
				this.pagesTree = this.createDataTree({ id: 'pagesTree', title: 'Pages', collapsed: false });
			});

			Ext.define('PagesTree', {
				extend: 'Ext.data.Model',
				fields: [
					{ name: 'id', type: 'string' },
					{ name: 'tree', type: 'string' },
					{ name: 'text', type: 'string' },
					{ name: 'balue', type: 'string' },
				]
			});

			this.pagesTree = this.createDataTree({ id: 'pagesTree', title: 'Pages', collapsed: false });

			this.accordion = Ext.create('Ext.panel.Panel', {
				xtype: 'layout-accordion',
				id: 'projectBrowserPanel',
				layout: 'accordion',
				width: 240,
				title: app.get('appName') + ' Control Centre',
				headerPosition: 'left',
				animCollapse: false,
				header: true,
				stateful: true,
				collapsible: true,
				collapsed: true,
				defaults: {
					bodyPadding: 5
				},
				listeners: {
					beforecollapse: function () {
						main.get('tabPanel').tabBar.show();
					},
					beforeexpand: function () {
						main.get('tabPanel').tabBar.hide();
					},
					added: function () {
						if(!this.getCollapsed())
							main.get('tabPanel').tabBar.hide();
					}
				},
				items: [this.featuredPagesTree, this.pagesTree],
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						xtype: 'textfield',
						name: 'searchField',
						fieldLabel: 'Search',
						labelWidth: 40,
						width: 195,
						listeners: {
							change: function (that, newStr, oldStr) {
								var expandedPanel = self.accordion.down('panel:not([collapsed])');
								if (expandedPanel.getXType() == 'treepanel') {
									if (expandedPanel.id == 'pagesTree')
										expandedPanel.getStore().setRootNode(self.getPagesData({ str: newStr, featured: false }));
								}
							}
						}
					}]
				}]
			});
		},

		createDataTree: function (options) {
			var self = this;
			var app = self.get('app');
			var contextMenu = this.pageContextMenu();
			return Ext.create('Ext.tree.Panel', {
				id: options.id,
				store: this.createPagesStore(),
				title: options.title,
				scroll: 'vertical',
				stateful: true,
				collapsed: options.collapsed,
				hideHeaders: true,
				animate: false,
				rootVisible: false,
				selModel: Ext.create('Ext.selection.CheckboxModel', {
					showHeaderCheckbox: false,
					mode: 'SINGLE',
					allowDeselect: false,
					headerWidth: 0
				}),
				columns: [{
					dataIndex: 'text',
					editor: {
						xtype: 'textfield',
						allowBlank: false
					},
					xtype: 'treecolumn',
					flex: 1,
					sortable: false,
					filter: false,
					beforeEdit: function (that, context) {
						if (context.record.parentNode.data.Value != 'Presets')
							return false;
					},
					afterEdit: function (that, context) {
						if (context.originalValue != context.value) {
							var tempNode = Enumerable.from(me.Presets).first("x=>x.text == '" + context.originalValue + "'");
							tempNode.text = context.value;
							self.pagesTree.getStore().sync();
						}
					}
				}],
				plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 2,
					listeners: {
						beforeedit: function (that, record) {
							if (record.column.beforeEdit)
								return record.column.beforeEdit(that, record);
							else
								return true;
						},
						edit: function (that, record) {
							if (record.column.afterEdit)
								return record.column.afterEdit(that, record);
							else
								return true;
						},
						canceledit: function (that, record) {
							if (record.column.cancelEdit)
								return record.column.cancelEdit(that, record);
							else
								return true;
						}
					}
				})],
				viewConfig: {
					//copy: true,
					plugins: {
						ptype: 'treeviewdragdrop',
						enableDrop: true
					},
					listeners: {
						drop: function (node, data, overModel, dropPosition) {
							var tabs = app.get('tabs');
							for (var i = 0; i < data.records[0].store.data.items.length; i++) {
								var item = data.records[0].store.data.items[i].data;
								tabs.get(item.id).set({ parentId: item.parentId, order: i });
								tabs.get(item.id).clone()
							}
							tabs.save();
						}
					}
				},
				listeners: {
					itemclick: function (grid, record, item, index, e) {
						app.get('view').selectTab(record.raw.value);
					},
					itemcontextmenu: function (view, rec, node, index, e) {
						e.stopEvent();
						var tab = app.get('tabs').get(rec.data.id);
						contextMenu.mainCmp = this;

						_.each(contextMenu.items.items, function (item) {
							switch (item.idd) {
								case 'lockTab':
									item.setChecked(tab.get('tabConfig').get('isLocked'));
									break;
							}
						});

						contextMenu.showAt(e.getXY());
						return false;
					},
					itemmouseenter: function (that, record, item, index, event, eOpts) {
						var toolTip = Ext.getCmp('ext-quicktips-tip');
						if (toolTip) {
							var tab = app.get('tabs').get(record.data.id);
							var filters = tab.getFilters();
							var tooltipBody = [];
							_.each(filters, function (filter) {
								tooltipBody.push(filter.field);
							});
							if (tooltipBody.length) {
								toolTip.setTitle('Set filters:');
								toolTip.update(tooltipBody.join(', '));
								toolTip.show();
							}
						}
					}
				},
			});
		},

		createPagesStore: function () {
			return Ext.create('Ext.data.TreeStore', {
				autoDestroy: true,
				root: {},//self.getMarkersData(),
				proxy: {
					type: 'memory',
					reader: {
						type: 'json'
					}
				},
				model: 'PagesTree',
				autoLoad: false
			});
		},

		pageContextMenu: function () {
			var self = this;
			var menuItems = [];
			menuItems.push({idd: 'selectTab', text: 'Select'});
			menuItems.push('-');
			menuItems.push({idd: 'cloneTab',text: 'Clone'});
			menuItems.push({idd: 'lockTab',xtype: 'menucheckitem',text: 'Locked'});
			menuItems.push('-');
			menuItems.push({ idd: 'editTab', text: 'Settings' });
			menuItems.push({
				text: 'Reset filters',
				iid: 'resetFilters'
			});
			menuItems.push({ idd: 'saveAsTemplate', text: 'Save as Template' });
			if(app.isAdmin())
				menuItems.push({ idd: 'saveAsGlobalTemplate', text: 'Save as Global Template' });
			menuItems.push({ idd: 'deleteTab', text: 'Delete' });
			menuItems.push({idd: 'cascadeWindows',text: 'Cascade windows'});
			
			return Ext.create('Ext.menu.Menu',{
				items: menuItems,
				listeners: {
					click: function (menu, item) {
						var treeCmp = item.ownerCt.mainCmp
						for (i in treeCmp.selModel.selected.items) {
							var tabId = treeCmp.selModel.selected.items[i].raw.value;
							var tab = app.get("tabs").get(tabId);
							switch (item.idd) {
								case 'selectTab':
									var tabPanel = app.get('view').get('desktopTabs').get('tabPanel');
									var tabView = tabPanel.getComponent(tab.get('id'));
									if (tabView)
										tabPanel.setActiveTab(tabView);
									break;
								case 'featured':
									tab.get('tabConfig').set('featured', !tab.get('tabConfig').get('featured'));
									app.get("tabs").save();
									break;
								case 'cloneTab':
									tab.createCopy();
									break;
								case 'lockTab':
									tab.get('tabConfig').set('isLocked', !tab.get('tabConfig').get('isLocked'));
									tab.save();
									break;
								case 'editTab':
									app.get('view').get('desktopDialogs').openTabSettings(tab);
									break;
								case 'saveAsTemplate':
									var tempPreset = app.get('tabPresets').add(tab);
									tempPreset.set('userId', app.get('userId'))
									tempPreset.save();
									break;
								case 'saveAsGlobalTemplate':
									var tempPreset = app.get('tabPresets').add(tab);
									tempPreset.save();
									break;
								case 'resetFilters':
									tab.get('tabConfig').get('filters').clearAll();
									tab.save();
									break;
								case 'deleteTab':
									for (i in treeCmp.selModel.selected.items) {
										if (!tab.get('tabConfig').get('isLocked')) {
											tab.remove();
											app.get("tabs").save();
										}
									}
									break;
								case 'cascadeWindows':
									var windowCount = 3;
									//reorder by zIndex
									zIndex = 0;
									_.each(tab.get('controls').sortBy(function (x) { return x.get('controlConfig').get('zIndex'); }), function (control) {
										var xyTempPos = 30 * windowCount++;
										control.get('controlConfig').set({ x: xyTempPos, y: xyTempPos, zIndex: zIndex++ });
									});
									//----------------
									tab.save();
									break;
							}
						}
						menu.hide();
					}
				}
			});
		},
		getPagesData: function (options) {
			var me = this;
			var app = this.get('app');
			str = options.str == undefined ? '' : options.str.toLowerCase();
			var tabs = app.get('tabs').ToEnumerable()
				.where(function (x) {
						return x.get('name').toLowerCase().indexOf(str) != -1
				})
				.toArray();
			
			var grouppedData = _.groupBy(tabs, function (x) { return x.get('parentId') });
			var createTree = function (grouppedTabs, parentId) {
				var response = [];
				_.each(grouppedTabs[parentId], function (tab) {
					response.push({
						id: tab.get('id'),
						text: tab.get('name'),
						order: tab.get('order'),
						value: tab.get('id'),
						leaf: false,
						children: createTree(grouppedTabs, tab.get('id')),
						icon: tab.get('tabConfig').get('isLocked') ? app.get('resourceStrings').get('lockedIcon').get('value') : undefined,
						expanded: true
					})
				});
				return response;
			}

			markersData = {
				text: 'root',
				leaf: false,
				expanded: true,
				children: createTree(grouppedData, 'root')
			};
			return markersData;
		},

		reloadData: function () {
			this.pagesTree.getStore().setRootNode(this.getPagesData({ featured: false }));
		},

		selectTab: function (selectedTab) {
			var self = this;
			var record = self.pagesTree.getSelectionModel().store.getById(selectedTab.get('id'));
			self.pagesTree.getSelectionModel().select(record);
		}
	});

	return ProjectBrowser;
});