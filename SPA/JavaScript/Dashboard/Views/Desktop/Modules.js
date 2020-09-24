define("Views/Desktop/Modules", [
], function () {

	var DesktopModules = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null,
			};
		},

		modulesStore: null,
		moduleTypesStore: null,
		dataTypeStore: null,
		modulesGrid: null,

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			var modules = this.get('app').get('modules');

			this.moduleStore = self.createStore()
		},

		createStore: function () {
			var self = this;
			var app = this.get('app');
			var modules = this.get('app').get('modules').clone();

			Ext.define('Module', {
				extend: 'Ext.data.Model',
				fields: [
					{ name: 'id', display: false },
					{ name: 'name' },
					{ name: 'config' },
					{ name: 'moduleType' },
					{ name: 'moduleGroup' },
					{ name: 'moduleClassName' },
					{ name: 'parentId' }
				]
			});

			var store = Ext.create('Ext.data.TreeStore', {
				model: 'Module',
				autoDestroy: true,
				proxy: {
					type: 'memory',
					reader: {
						type: 'json'
					}
				}
			});

			var updateTree = _.debounce((item) => {
				store.setRootNode(self.processData(self.get('app').get('modules').clone()))
			}, 100)

			this.get('app').get('modules').on('add remove change', updateTree)

			store.setRootNode(this.processData(modules));
			return store
		},

		getModulesWindow: function (tab) {
			var self = this;
			var app = this.get('app');
			
			if (!this.modulesGrid) {
				this.modulesGrid = Ext.create('Ext.tree.Panel', {
					id: 'ModulesSelectorId',
					store: self.moduleStore,
					rootVisible: false,
					scroll: 'vertical',
					stateful: true,
					border: 'false',
					columns: [{
						header: 'Name',
						xtype: 'treecolumn',
						flex: 1,
						sortable: true,
						dataIndex: 'name'
					}],
					stripeRows: true,
					listeners: {
						itemclick: function (grid, record, item, index, e) {
							if (app.get('modules').get(record.data.id))
								self.addControl(app.get('modules').get(record.data.id));
						}
					},
					header: false
				});
			}
			var win = Ext.widget('window', {
				title: 'Module selector',
				closeAction: 'hide',
				width: 500,
				height: 500,
				layout: 'fit',
				//resizable: false,
				modal: true,
				items: this.modulesGrid
			});
			win.show();
		},

		addControl: function (module) {
			var app = this.get('app');
			var tabsView = app.get('view').get('desktopTabs');
			var tabPanel = tabsView.get('tabPanel');
			var selectedPanel = tabPanel.getActiveTab()
			var maxZControl = app.get('selectedTab').get('controls').maxBy(x => x.get('controlConfig').get('zIndex'))
			var zIndex = 0;
			if (maxZControl !== undefined ){
				zIndex = maxZControl.get('controlConfig').get('zIndex') + 1;
			}

			try {
				var tempConfig = Ext.decode(module.get('config'));
			}
			catch (ex) {
				var tempConfig = {};
			}

			var controlConfig = {
				x: selectedPanel.windowCount * 30,
				y: selectedPanel.windowCount * 30,
				width: tempConfig.width,
				height: tempConfig.height,
				settings: tempConfig.settings|| [],
				zIndex: zIndex
			};

			if (selectedPanel) {
				selectedPanel.windowCount++;
				var control = {
					id: tessioUtils.guid(),
					tabId: selectedPanel.id,
					title: module.get('name'),
					moduleClassName: module.get('moduleClassName'),
					config: Ext.encode(controlConfig),
					status: "stopped",
					isLoading: true,
					moduleId: module.get('id'),
					module: module,
					isNew: true
				};
				app.get('selectedTab').get('controls').update(control);
				app.get('selectedTab').get('controls').get(control.id).save();
			}
		},

		processData: function (data) {
			var processedData = {
				id: 'rootId',
				name: 'root',
				children: []
			};
			var grouppedData = _.groupBy(data, function (x) { return x.moduleGroup });
			for (var attr in grouppedData) {
				var children = [];
				_.each(grouppedData[attr], function (x) {
					x.leaf = true;
					children.push(x);
				});
				processedData.children.push({
					id: attr+'Id',
					name: attr == 'undefined'? 'Ungrouped': attr,
					expanded: true,
					children: children
				});
			}
			return processedData;
		}
	});

	return DesktopModules;
});
