Ext.define('ExtModules.Helpers.TreeHelper', {
	requires: [
		'ExtModules.Store.TreeGrouping'
	],

	mixins: {
		basicStoreGenerator: 'ExtModules.Store.BasicTree'
	},

	config: {
		treeGroupingStore: null
	},

	resetData: function (response, options) {
		var self = this;
		this.dataMap = {};
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();


		var bypassSyncColumns = (options && options.bypassSyncColumns) ? true : false;

		this.setLoading(false);

		if (!bypassSyncColumns) {
			var columns = response.header;

			if (moduleConfig.deletable)
				columns.push({
					columnName: 'action',
					columnType: 'action',
					columnTitle: 'action'
				});

			var updatedColumns = tessioUtils.mergeColumns(columns, moduleConfig.columns)

			if (!this.tesseract) {
				this.tesseract = new app.Tesseract({
					id: control.get('id'),
					idProperty: self.idProperty,
					eventHorizon: app.nameResolver,
					columns: updatedColumns
				})
			}
			else {
				this.tesseract.updateColumns(updatedColumns, true)
			}

			columns.forEach(function (col) {
				control.on('change:filter:' + moduleConfig.tableName + ':' + col.columnName, function (filter) {
					var gridFilter = self.filtersFeature.getFilter(filter.field.split(':')[1]);
					var operator = gridFilter.type == 'string' ? 'like' : 'eq';

					switch (gridFilter.type) {
						case 'auto':
						case 'string':
							gridFilter.setValue({ like: filter.value });
							break;
						case 'id':
						case 'int':
						case 'float':
							gridFilter.setValue({ eq: filter.value });
							break;
						case 'bool':
						case 'resolver':
						case 'list':
						case 'members':
						case 'security':
							gridFilter.setValue(filter.value);
							break;
					}
					gridFilter.setActive(filter.value ? true : false);
				});
			});

			this.setColumnDefinitions(updatedColumns);
			this.syncColumns(this.initialState || this.getState());
			//delete this.initialState;
			//this.saveState();

			var onColumnHideShow = function (ct, column) {
				var tempcolumn = Enumerable.from(controlConfig.get('columns')).firstOrDefault(function (x) { return x.id == column.id });
				if (tempcolumn) {
					tempcolumn.hidden = column.hidden;
					tempcolumn.width = column.width;
				}
				else
					controlConfig.get('columns').push({ id: column.id, hidden: column.hidden, width: column.width });
			};

			self.on('columnhide', onColumnHideShow);
			self.on('columnshow', onColumnHideShow);
			self.on('columnresize', onColumnHideShow);

			this.getView().refresh();
			if (this.initialState && !control.get('fullyLoaded')) {
				try {
					self.applyState(this.initialState);
					delete this.initialState
				}
				catch (ex) {
					console.log('Invalid state', ex.stack)
				}
			}
		}

		if (response.data)
			this.tesseract.update(response.data, true)
		else
			this.tesseract.clear()

		filteredData = Enumerable.from(this.tesseract.dataCache).where(function (x) { return self.filtersFeature.filterFunction(x) }).select(function (x) { return x }).toArray();
		
		if (filteredData.length) {
			try {
				var parentIdField = moduleConfig.parentIdField
				var rootIdValue = moduleConfig.rootIdValue
				if (rootIdValue !== undefined && parentIdField !== undefined) {
					self.store.setRootNode(self.tesseract.returnTree(rootIdValue, parentIdField));
				}
				else {
					self.store.setRootNode(self.tesseract.groupData(filteredData, controlConfig.get('groupByColumns'), moduleConfig.includeLeafs)[0]);
				}
				control.set('fullyLoaded', true);
			}
			catch(ex){console.log(ex)}
		}
		self.registerNameResolverEvents();
	},

	setUpPanel: function () {
		var self = this;
		var control = this.getControl();
		var controlConfig = control.get('controlConfig');
		var moduleConfig = this.getModuleConfig();
		this.selType = "rowmodel";
		this.disableSelection = moduleConfig.disableSelection;
		this.multiSelect = moduleConfig.multiSelect;

		this.subscribe();

		this.listeners.beforefilter = function () {
			self.fullRefresh();
		}

		if (moduleConfig.selectors || moduleConfig.defaultSelect) {
			this.listeners.selectionchange = function (grid, records) {
				if (records.length) {
					var rowData = self.tesseract.getById(records[0].data[self.tesseract.idProperty])
					if (moduleConfig.defaultSelect) {
						control.get('tab').get('tabConfig').get('filters').setFilter({
							value: { columnDefinitions: self.getColumnDefinitions(), data: rowData },
							field: moduleConfig.defaultSelect
						});
					}

					if (moduleConfig.selectors) {
						moduleConfig.selectors.forEach(function (item) {
							control.get('tab').get('tabConfig').get('filters').setFilter({
								value: rowData[item.columnName],
								field: item.foreignTableName + ':' + item.foreignColumnName
							});
						});
					}
				}
			};
		}

		if (moduleConfig.contextMenu) {
			this.viewConfig.listeners.itemcontextmenu = function (view, record, el, index, e, eOpts) {
				e.preventDefault();
				self.actionMenu.rec = record;
				self.actionMenu.module = self;
				self.actionMenu.showAt(e.getXY());
			};
		}

		this.refresh = _.debounce(function (hard) {
			if (self.requireResort) {
				self.store.suspendEvents();
				self.store.sort();
				self.store.resumeEvents();
			}
			self.getView().refresh();
		}, 100);

		this.fullRefresh = _.debounce(function () {
			var columns = self.getColumnDefinitions();
			var filteredData = Enumerable.from(this.tesseract.dataCache)
				//.select(function (x) { return self.generateRow(x, columns, x)} )
				.where(function (x) { return self.filtersFeature.filterFunction(x) })
				.toArray();
			self.getView().refresh();

			var parentIdField = moduleConfig.parentIdField
			var rootIdValue = moduleConfig.rootIdValue
			//console.log(rootIdValue, parentIdField, self.tesseract.returnTree(rootIdValue, parentIdField))
			if (rootIdValue !== undefined && parentIdField !== undefined) {
				self.store.setRootNode(self.tesseract.returnTree(rootIdValue, parentIdField));
			}
			else {
				var groupBy = controlConfig.get('groupByColumns');
				self.store.setRootNode(self.tesseract.groupData(filteredData, groupBy, moduleConfig.includeLeafs)[0]);
			}
		}, 300);

		//added getRowClass function and onRowUpdate event from moduleConfig 
		if (moduleConfig.getRowClass) {
			this.viewConfig.getRowClass = new Function("return " + moduleConfig.getRowClass).call(this);
			if (typeof (moduleConfig.getRowClass) == 'string')
				this.viewConfig.getRowClass = new Function("var self = this; return " + moduleConfig.getRowClass).call(this);
			else
				this.viewConfig.getRowClass = moduleConfig.getRowClass;
		}

		if (moduleConfig.onRowUpdate) {
			if (typeof (moduleConfig.onRowUpdate) == 'string')
				this.onRowUpdate = new Function("var self = this; return " + moduleConfig.onRowUpdate).call(this);
			else
				this.onRowUpdate = moduleConfig.onRowUpdate;
		}
		else
			this.onRowUpdate = function () { };
		//----------------

		var groupByColumns = controlConfig.get('groupByColumns') || moduleConfig.groupByColumns;
		if (groupByColumns)
			controlConfig.set('groupByColumns', groupByColumns);
		else
			controlConfig.set('groupByColumns', [{ dataIndex: 'All', title: 'All' }], { silent: true });

		controlConfig.on("change:groupByColumns", function (change) {
			//self.updateGrid(null, { bypassSyncColumns: true });
			self.fullRefresh();
		}, self);

		this.customFilter = Ext.create('Ext.ux.grid.filter.CustomFilter', {
			text: 'Custom filters',
			checked: false,
			columnsList: []
		});
		if (moduleConfig.storeType == 'remote')
			this.setupRemoteFilters([{
				type: 'custom',
				dataIndex: 'dupa',
				customFilter: this.customFilter
			}]);
		else
			this.setupLocalFilters([{
				type: 'custom',
				dataIndex: 'dupa',
				customFilter: this.customFilter
			}]);

		this.addPlugins({
			editable: moduleConfig.editable ? {} : false,
			bufferedrenderer: true,
			columnAutoWidth: true//get from settings
		});

		if (moduleConfig.contextMenu) {
			var menuItems = [];
			moduleConfig.contextMenu.forEach(function (item) {
				menuItems.push(self.getMenuItem(item));
			});
			this.setupContextMenu(menuItems);
		}

		//this.setupGroups();

		this.model = Ext.define(control.get('title'), {
			extend: 'Ext.data.Model',
			idProperty: self.idProperty,
			fields: []
		});
		this.store = this.createBasicTreeStore(this.model); 
		this.rootVisible = moduleConfig.rootVisible === false ? false : true;
		this.columns = [];

		this.initialState = Ext.decode(controlConfig.get("state"));

		// Call tree constructor
		this.callParentConstructor.apply(this, this.getArguments());

		//this.getTab().add(this);

		if (moduleConfig.extensionBar) {
			var toolbarItems = [];
			moduleConfig.extensionBar.forEach(function (item) {
				var generatedToolbarItem = self.getToolbarItem(item);
				if (generatedToolbarItem instanceof Array)
					generatedToolbarItem.forEach(function (subItem) { toolbarItems.push(subItem); });
				else
					toolbarItems.push(self.getToolbarItem(item));
			});

			if (toolbarItems)
				this.setUpExtensionBar(toolbarItems, 'top');
		}

		this.setIsSetup(true);
		control.set('loaded', true);
	},

	setupTreeGroupingStore: function () {//TODO fix this mess - its ugly
		var controlConfig = this.getControlConfig();

		this.setTreeGroupingStore(
			ExtModules.Store.TreeGrouping.create(this.getControl(), controlConfig.get("groupByColumns"))
		);
	},

	storeGroupingColumns: function () {
		var controlConfig = this.getControlConfig();
		var store = this.getTreeGroupingStore();
		var result = [];
		var records = store.getRange();
		_.each(records, function (item) {
			result.push({ dataIndex: item.data.dataIndex, title: item.data.title });
		});
		controlConfig.set("groupByColumns", result);
	},

	updateData: function (response) {
		var self = this;
		var store = this.store;
		var controlConfig = this.getControlConfig();
		var isfullyLoaded = this.getControl().get('fullyLoaded')
		var parentIdField = controlConfig.get('parentIdField')
		var rootIdValue = controlConfig.get('rootIdValue')

		this.requireResort = false;
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		var groupBy = controlConfig.get('groupByColumns');
		var tempId;

		var updateView = function (aggregatedData, parentNode) {
			for (var i = 0; i < aggregatedData.length; i++) {
				tempId = aggregatedData[i][self.idProperty];
				var node = store.getNodeById(tempId);
				if (tempId === 'All' && !node) {
					self.store.setRootNode(aggregatedData[i]);
					node = store.getNodeById(tempId);
				}

				if (node) {//update
					if (!aggregatedData[i].leaf && aggregatedData[i].children) {//store branch in case siblings will have to be added
						updateView(aggregatedData[i].children, node)
					}

					_.each(aggregatedData[i], function (item, attr) {
						node.data[attr] = item;
					});
				}
				else if (parentNode) {//add
					try {
						parentNode.appendChild(aggregatedData[i]);
					}
					catch (ex) { }
				}
			}
		}

		this.tesseract.once('dataUpdated', function (data) {
			if (rootIdValue !== undefined && parentIdField !== undefined) {
				self.store.setRootNode(self.tesseract.returnTree(rootIdValue, parentIdField));
			}
			else {
				var filteredData = Enumerable.from(self.tesseract.dataCache).where(function (x) { return self.filtersFeature.filterFunction(x) }).toArray();
				var selectedRowsIds = Enumerable.from(data).select(function (x) { return x[self.idProperty]; }).toArray();
				var selectedRowsIds = {}
				data.forEach((x) => { selectedRowsIds[x[self.idProperty]] = true })
				var aggregatedData = self.tesseract.groupSelectedData(filteredData, groupBy, selectedRowsIds, moduleConfig.includeLeafs);

				if (isfullyLoaded)
					updateView(aggregatedData);
			}
			self.refresh();
		})

		this.tesseract.update(response.data)
	},

	removeData: function (data) {
		var self = this;
		self.tesseract.remove(data)
		self.fullRefresh();
	},

	removeRows: function (response) {
		var self = this;
		var data = response.data;
		if (data) {
			var store = this.store;
			_.each(data.data, function (item) {
				var rec = store.snapshot.findBy(function (record) { return record.data[self.idProperty] == item[self.idProperty] });
				if (rec) {
					store.remove(rec);
				}
			});
		}
	}
});