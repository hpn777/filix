Ext.define('ExtModules.Helpers.GridHelper', {
	mixins: {
		columnDefinitionsGenerator: 'ExtModules.Model.Columns',
		basicStoreGenerator: 'ExtModules.Store.Basic',
		remoteStoreGenerator: 'ExtModules.Store.Remote',
		filterHelper: 'ExtModules.Helpers.FilterHelper',
		clearFiltersButton: 'ExtModules.ToolbarItems.ClearFiltersButton'
	},
	config: {
		columnDefinitions: null,
		allColumnDefinitions: null
	},

	resetData: function (response, options) {
		var self = this;
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		var data = response.data;
		this.dataMap = {};
		var bypassSyncColumns = (options && options.bypassSyncColumns) ? true : false;
		this.setLoading(false);

		//if (!this.getColumnDefinitions()) {
		if (!bypassSyncColumns) {
			var columns = response.header;

			if (moduleConfig.deletable)
				columns.push({
					name: 'action',
					type: 'action',
					title: 'action'
				});

			var updatedColumns = tessioUtils.mergeColumns(columns, moduleConfig.columns)
			if (!this.tesseract) {
				this.tesseract = app.nameResolver.createTesseract(control.get('id'), {
					idProperty: self.idProperty,
					eventHorizon: app.nameResolver,
					columns: columns
				})
			} else {
				this.tesseract.updateColumns(updatedColumns, true)
			}
			
			this.tesseractSession = app.nameResolver.createSession({
				table: control.get('id'),
				columns: updatedColumns
			})

			this.tesseractSession.on('dataUpdate', data => {
				data = data.toJSON()
				if (data.addedData && data.addedData.length > 0) {
					this.updateView(data.addedData)
				}
				if (data.updatedData && data.updatedData.length > 0) {
					this.updateView(data.updatedData)
				}
				if (data.removedIds && data.removedIds.length > 0) {
					data.removedIds.forEach(x => {
						var record = this.store.getById(x);
						if (record) {
							this.store.remove(record);
						}
					})
				}
			})

			updatedColumns.forEach(function (col) {
				control.off('change:filter:' + moduleConfig.tableName + ':' + col.name, null, self);
				control.on('change:filter:' + moduleConfig.tableName + ':' + col.name, function (filter) {
					var gridFilter = self.filtersFeature.getFilter(filter.field.split(':')[1]);
					if (gridFilter) {
						filter.value = filter.value || undefined;
						var operator = gridFilter.type == 'string' ? 'like' : 'eq';

						switch (gridFilter.type) {
							case 'auto':
							case 'string':
								gridFilter.setValue({
									like: filter.value
								});
								break;
							case 'id':
							case 'int':
							case 'float':
								gridFilter.setValue({
									eq: filter.value
								});
								break;
							case 'bool':
							case 'resolver':
							case 'list':
							case 'members':
							case 'security':
								gridFilter.setValue(filter.value);
								break;
						}

						gridFilter.setActive(filter.value !== undefined ? true : false);
						var columnName = filter.field.split(':')[1];
						if (self.titleTpl.html.indexOf('{' + columnName + '}') !== -1) {
							var tempData = {
								title: control.get('title')
							};
							if (col.resolve) {
								tempData[columnName] = app.nameResolver.resolve({
									dataProviderId: col.resolveView.dataProviderId,
									tableName: col.resolveView.childrenTable,
									valueField: col.resolveView.valueField,
									value: filter.value,
									remote: col.resolveView.remote
								})[col.resolveView.displayField];
							} else
								tempData[columnName] = filter.value;
							self.setTitle(self.titleTpl.apply(tempData));
						}
					}
				}, self);
			});

			this.setColumnDefinitions(updatedColumns);
			this.syncColumns(this.initialState || this.getState());

			var onColumnHideShow = function (ct, column) {
				var tempcolumn = Enumerable.from(controlConfig.get('columns')).firstOrDefault(function (x) {
					return x.id == column.id
				});
				if (tempcolumn) {
					tempcolumn.hidden = column.hidden;
					tempcolumn.width = column.width;
				} else
					controlConfig.get('columns').push({
						id: column.id,
						hidden: column.hidden,
						width: column.width
					});
			};

			this.on('columnhide', onColumnHideShow);
			this.on('columnshow', onColumnHideShow);
			this.on('columnresize', onColumnHideShow);

			if (this.initialState && !control.get('fullyLoaded')) {
				try {
					self.applyState(this.initialState);
					delete this.initialState
				} catch (ex) {
					console.log('Invalid state', ex.stack)
				}
			}

			self.registerNameResolverEvents();
			self.updateTitle()
		}


		if (moduleConfig.storeType != 'remote') {
			if (data)
				self.tesseract.reset(data)
			else
				self.tesseract.clear()

			self.store.loadData(this.tesseractSession.getData());
			control.set('fullyLoaded', true);

		} else if (moduleConfig.storeType == 'remote') {
			control.set('fullyLoaded', true);
			self.store.load();
		}
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

		if (moduleConfig.selectors || moduleConfig.defaultSelect) {
			if (moduleConfig.listeners && moduleConfig.listeners.selectionchange)
				var orgSelectionchange = moduleConfig.listeners.selectionchange;
			this.listeners.selectionchange = function (grid, records, eOpts) {
				if (records.length) {


					var rowData = self.tesseract.getById(records[0].data[self.tesseract.idProperty])
					if (rowData !== undefined && !Enumerable.from(self.selectedRecords).firstOrDefault((x) => {
							return x.data[self.tesseract.idProperty] === rowData[self.tesseract.idProperty]
						})) {
						if (moduleConfig.defaultSelect) {
							control.get('tab').setFilter({
								value: {
									columnDefinitions: self.getColumnDefinitions(),
									data: rowData
								},
								field: moduleConfig.defaultSelect
							});
						}

						if (moduleConfig.selectors) {
							moduleConfig.selectors.forEach(function (item) {
								control.get('tab').setFilter({
									value: rowData[item.columnName],
									field: item.foreignTableName + ':' + item.foreignColumnName
								});
							});
						}
					}
					self.selectedRecords = records
				}

				if (orgSelectionchange)
					orgSelectionchange(grid, records, eOpts)
			};
		}

		if (moduleConfig.storeType == 'remote') {
			var previousPos = 0;
			var currentPos = 0;
			this.listeners.viewready = function (grid, eOpts) {
				self.view.getEl().on('scroll', function (e, t) {
					var currentPos = self.verticalScroller.getFirstVisibleRowIndex()
					if (currentPos === 0 && previousPos !== 0) {
						self.store.removeAll()
						self.store.load()
					}
					previousPos = currentPos
				});
			}
		}

		if (moduleConfig.contextMenu) {
			this.viewConfig.listeners.itemcontextmenu = function (view, record, el, index, e, eOpts) {
				e.preventDefault();
				self.actionMenu.rec = record;
				self.actionMenu.selectedRecords = self.getSelectionModel().getSelection()
				self.actionMenu.module = self;
				self.actionMenu.showAt(e.getXY());
			};
		}

		this.refresh = _.debounce(function () {
			self.store.suspendEvents();
			self.store.sort();
			self.store.resumeEvents();
			self.getView().refresh();
			self.setLoading(false);
		}, 100);

		this.liteRefresh = _.debounce(function () {
			self.tesseractSession.getLinq().forEach(function (item) {
				var record = self.store.getById(item.id)
				if (record) {
					var newRecord = self.store.model.create(item);
					record.data = newRecord.data;
				}
			})
			self.getView().refresh();
		}, 100);

		this.fullRefresh = _.debounce(function () {
			self.store.loadData(self.tesseract.dataCache);
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
		} else
			this.onRowUpdate = function () {};
		//----------------

		//set up custom filter
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
		//------------

		this.addPlugins({
			editable: moduleConfig.editable,
			gridviewdragdrop: moduleConfig.gridviewdragdrop,
			rowexpander: moduleConfig.rowexpander,
			bufferedrenderer: true, //moduleConfig.storeType == 'remote' ? false : true,
			//columnAutoWidth: true//get from settings
		});

		if (moduleConfig.contextMenu) {
			var menuItems = [];
			moduleConfig.contextMenu.forEach(function (item) {
				if (typeof item === 'string')
					menuItems.push(self.getMenuItem(item));
				else
					menuItems.push(item);
			});
			this.setupContextMenu(menuItems);
		}

		this.multiSelect = moduleConfig.multiSelect || false;

		this.model = Ext.define(control.get('title'), {
			extend: 'Ext.data.Model',
			idProperty: self.idProperty,
			fields: []
		});

		if (moduleConfig.storeType == 'remote') {
			this.store = this.createRemoteStore(this.model);

			this.store.on('load', function () {
				if (self.selectedRecords)
					self.getSelectionModel().select(self.selectedRecords)
			}, self)
		} else
			this.store = this.createBasicStore(this.model);

		this.columns = [];
		this.initialState = Ext.decode(controlConfig.get("state"));

		// Call tree constructor
		this.callParentConstructor.apply(this, this.getArguments());

		if (moduleConfig.extensionBar) {
			var toolbarItems = [];
			moduleConfig.extensionBar.forEach(function (item) {
				var generatedToolbarItem = self.getToolbarItem(item);
				if (generatedToolbarItem instanceof Array)
					generatedToolbarItem.forEach(function (subItem) {
						toolbarItems.push(subItem);
					});
				else
					toolbarItems.push(self.getToolbarItem(item));
			});

			if (toolbarItems)
				this.setUpExtensionBar(toolbarItems, 'top');
		}

		self.on('afterrender', function () {
			var isMouseOver = false;
			var copyFuncton = function (event) {
				if (isMouseOver) {
					var clipboard = '';
					_.each(self.getSelectionModel().getSelection(), function (row) {
						if (!clipboard) {
							_.each(row.data, function (cell, attr) {
								clipboard += (attr + '\t');
							});
							clipboard += '\n';
						}
						_.each(row.data, function (cell) {
							clipboard += (cell + '\t');
						});
						clipboard += '\n';
					});
					event.clipboardData.setData('text/plain', clipboard);
					event.preventDefault();
				}
			}
			document.addEventListener('copy', copyFuncton);

			self.on('destroy', function () {
				document.removeEventListener('copy', copyFuncton);
			});

			$(self.body.dom)
				.mouseover(function () {
					isMouseOver = true;
				})
				.mouseout(function () {
					isMouseOver = false;
				});
		});
		//--------------------

		this.on('filterchange sortchange', function () {
			var selectedTab = app.get('selectedTab');
			control.save()
		});

		this.setIsSetup(true);
		control.set('loaded', true);
	},

	getAllFilters: function () {
		var controlConfig = this.getControlConfig();
		var filters = controlConfig.get('filters').clone();
	},

	syncColumns: function (state) {
		var panel = this;
		var control = this.getControl();
		var columnDefinitions = this.getColumnDefinitions();
		var controlConfig = this.getControlConfig();
		var newColumnDefinitions = [];
		var update = false;
		var requiredFields = [];
		var gridHeader = panel.normalGrid ? panel.normalGrid.headerCt : panel.headerCt;

		gridHeader.removeAll();

		//update model
		this.model.setFields(this.createModelFields(columnDefinitions),this.tesseract.idProperty)

		if (columnDefinitions.length > 0) {
			var newColumns = this.createColumnsDefinition(control, columnDefinitions);

			if (state && state.columns && state.columns.length) {
				var tempColumns = [];
				var additionalColumns = [];
				_.each(newColumns, function (item) {

					var index = _.findIndex(state.columns, function (x) {
						return x.id === item.id
					})
					if (index != -1) {
						var tempColumn = Enumerable.from(controlConfig.get('columns')).firstOrDefault(function (x) {
							return x.id === item.id
						})

						tempColumns.push(_.extend(item, tempColumn))
						if (item.width)
							delete item.flex
					} else
						additionalColumns.push(item)
				});

				newColumns = tempColumns.concat(additionalColumns)
			}

			if (!this.columns || !this.columns.length)
				this.columns = newColumns;

			gridHeader.add(newColumns);
			update = true;
		}

		if (update && control.get('status') == 'started') {
			if (columnDefinitions) {
				panel.filtersFeature.createFilters();
				if (panel.customFilter)
					panel.customFilter.columnsList = Enumerable.from(columnDefinitions).select(function (x) {
						return x.columnName;
					}).toArray();
			}
		}
	},

	updateData: function (response) {
		if (response.data.addedData && response.data.addedData.length > 0) {
			this.tesseract.updateAsync(response.data.addedData).then(x => {
				// this.updateView(x)
			})
		}
		if (response.data.updatedData && response.data.updatedData.length > 0) {
			this.tesseract.updateAsync(response.data.updatedData).then(x => {
				// this.updateView(x)
			})
		}
		if (response.data.removedIds && response.data.removedIds.length > 0) {
			this.tesseract.removeAsync(response.data.removedIds).then(removedIds => {
				// var idProperty = this.tesseract.idProperty
				// removedIds.forEach(x => {
				// 	var record = this.store.getById(x);
				// 	if (record) {
				// 		this.store.remove(record);
				// 	}
				// })
			})
		}
	},

	updateView: function (data) {
		var store = this.store;

		for (var i = 0; i < data.length; i++) {
			var tempData = data[i]

			if (store.snapshot) {

				var rec = Enumerable.from(store.snapshot.items).firstOrDefault(x => {
					return x.data[this.idProperty] == tempData[this.idProperty]
				})

				if (rec) {
					this.onRowUpdate(rec.data, tempData, store);
					rec.data = tempData;
					rec.dirty = false;
					rec.modified = {};
					var visibleRec = Enumerable.from(store.data.items).firstOrDefault((x) => {
						return x.data[this.idProperty] == tempData[this.idProperty]
					});
					if (visibleRec) {
						if (!this.filtersFeature.filterFunction(visibleRec)) {
							store.data.remove(visibleRec);
						}
					} else if (this.filtersFeature.filterFunction(rec))
						store.data.add(rec);
				} else {
					if (this.filtersFeature.filterFunction(tempData)) {
						var newRecord = store.model.create(tempData);
						if (store.snapshot)
							store.snapshot.add(newRecord);
						store.data.add(newRecord);
					} else
						store.snapshot.add(newRecord);
				}
			} else {
				var rec = store.data.findBy((record) => {
					return record.data[this.idProperty] == tempData[this.idProperty]
				});
				if (rec)
					rec.data = tempData;
				else {
					var newRecord = store.model.create(tempData);
					store.data.add(newRecord);
				}
			}
		}

		this.refresh()
	},

	setupAutoWidthColumns: function (columns) {
		if (this.getSetting('autoWidthColumns') && this.getSetting('autoWidthColumns').get("checked")) {
			_.each(columns, function (column) {
				column.flex = null;
				column.resizable = false;
				column.autoWidth = true;
			});
			this.cls += " auto-width-columns";
		}
	},

	updateAutoWidthColumns: function (columns) {
		if (this.getSetting('autoWidthColumns') && this.getSetting('autoWidthColumns').get("checked")) {
			var ColumnAutoWidthPlugin = _.find(this.plugins, function (item) {
				return item.pluginName == 'ColumnAutoWidthPlugin'
			});
			if (ColumnAutoWidthPlugin)
				ColumnAutoWidthPlugin.refresh();
		}
	},

	setupColumns: function (columnDefinitions) {
		var control = this.getControl();
		var columns = this.createColumnsDefinition(control, columnDefinitions);
		this.setupAutoWidthColumns(columns);
		this.columns = columns;
	},

	setupCellEditing: function () {
		var panel = this;

		var cellEditingPlugin = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});

		if (!panel.plugins) panel.plugins = [];
		panel.plugins.push(cellEditingPlugin);

		cellEditingPlugin.init(panel);
	},

	setupRowTemplates: function (definition) {
		//temporary overrite
		Ext.apply(Ext.view.TableChunker, {
			getTableTpl: function (cfg, textOnly) {
				var tpl,
					tableTplMemberFns = {
						openRows: this.openRows,

						closeRows: this.closeRows,
						embedFeature: this.embedFeature,
						embedFullWidth: this.embedFullWidth,
						openTableWrap: this.openTableWrap,
						closeTableWrap: this.closeTableWrap
					},
					tplMemberFns = {},
					features = cfg.features || [],
					ln = features.length,
					i = 0,
					memberFns = {
						embedRowCls: this.embedRowCls,
						embedRowAttr: this.embedRowAttr,
						firstOrLastCls: this.firstOrLastCls,
						unselectableAttr: cfg.enableTextSelection ? '' : 'unselectable="on"',
						unselectableCls: cfg.enableTextSelection ? '' : Ext.baseCSSPrefix + 'unselectable'
					},
					// copy the default
					metaRowTpl = Array.prototype.slice.call(this.metaRowTpl, 0),
					metaTableTpl;

				for (; i < ln; i++) {
					if (!features[i].disabled) {
						features[i].mutateMetaRowTpl(metaRowTpl);
						Ext.apply(memberFns, features[i].getMetaRowTplFragments());
						Ext.apply(tplMemberFns, features[i].getFragmentTpl());
						Ext.apply(tableTplMemberFns, features[i].getTableFragments());
					}
				}

				metaRowTpl = new Ext.XTemplate(metaRowTpl.join(''), memberFns);
				cfg.row = metaRowTpl.applyTemplate(cfg);
				metaTableTpl = new Ext.XTemplate(this.metaTableTpl.join(''), tableTplMemberFns);

				tpl = metaTableTpl.applyTemplate(cfg);
				// TODO: Investigate eliminating.
				if (!textOnly) {
					tpl = new Ext.XTemplate(tpl, tplMemberFns);
				}
				tpl.rowTpl = cfg.row;
				return tpl;
			}
		});
	},

	registerNameResolverEvents: function () {
		var moduleConfig = this.getModuleConfig();

		app.nameResolver.off(null, null, self);

		//update view on new lookup
		app.nameResolver.on('add', list => {
			if (Enumerable.from(this.getColumnDefinitions()).any( x => {
					return x.resolveView && x.resolveView.childrenTable === list.get('id')
				})) {
				if (moduleConfig.storeType === 'remote')
					this.liteRefresh()
				else
					this.fullRefresh();

				this.updateTitle()

				list.on('dataUpdate', () => {
					if (moduleConfig.storeType === 'remote')
						this.liteRefresh()
					else
						this.fullRefresh();

					this.updateTitle()
				})
			}
		}, this);
	},

	addPlugins: function (config) {
		var self = this;

		// row editin plugin
		var editingPlugin = Ext.create('Ext.grid.plugin.RowEditing', {
			pluginName: 'ColumnEditorPlugin',
			clicksToEdit: 2,
			clicksToMoveEditor: 1,
			autoCancel: true,
			moveEditorByClick: function () {
				var me = this;
				if (me.editing) {
					if (me.context.record.original)
						me.context.record.data = me.context.record.original;
					me.superclass.onCellClick.apply(me, arguments);
				}
			},
			listeners: {
				beforeedit: function (that, context) {
					var response = true;
					var columns = that.grid.columnManager.columns;
					context.record.original = Ext.clone(context.record.data);
					for (i in columns) {
						if (columns[i].beforeEdit) {
							response = columns[i].beforeEdit(that, context, that.editor.items.items[i], columns[i].dataIndex);
							if (response === false) return false;
						}
					}
					if (config.editable && config.editable.beforeedit)
						response = config.editable.beforeedit(that, context);
					return response;
				},
				edit: function (that, context) {
					var response = true;
					var columns = that.grid.columnManager.columns;
					for (i in columns) {
						if (columns[i].afterEdit)
							response = columns[i].afterEdit(that, context, that.editor.items.items[i], columns[i].dataIndex);
					}
					if (config.editable && config.editable.edit)
						response = config.editable.edit(that, context);
					return response;
				},
				canceledit: function (that, context) {
					var response = true;
					var columns = self.columnManager.columns;
					context.record.data = context.record.original;
					for (i in columns) {
						if (columns[i].cancelEdit)
							response = columns[i].cancelEdit(that, context, columns[i].dataIndex);
					}
					if (config.editable && config.editable.canceledit)
						response = config.editable.canceledit(that, context);
					return response;
				}
			}
		});
		if (!self.plugins)
			self.plugins = [];

		if (config.gridviewdragdrop) {
			if (!self.viewConfig.plugins)
				self.viewConfig.plugins = [];

			self.viewConfig.plugins.push(config.gridviewdragdrop);
		}
		if (config && config.editable)
			self.plugins.push(editingPlugin);
		if (config && config.bufferedrenderer)
			self.plugins.push('bufferedrenderer');
		if (config && config.rowexpander)
			self.plugins.push({
				ptype: 'rowexpander',
				columnWidth: 24,
				getHeaderConfig: function () {
					var me = this;

					return {
						width: me.columnWidth,
						lockable: false,
						sortable: false,
						resizable: false,
						draggable: false,
						hideable: false,
						menuDisabled: true,
						tdCls: Ext.baseCSSPrefix + 'grid-cell-special',
						innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-row-expander',
						renderer: function (value, metadata, record) {
							if (!me.grid.ownerLockable) {
								metadata.tdAttr += ' style="vertical-align: top !important;" rowspan="2"';
							}
							//if (record.data.commentsNr)
							return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation"></div>';
							//else
							//	return '<div role="presentation"></div>';
						},
						processEvent: function (type, view, cell, rowIndex, cellIndex, e, record) {
							if (e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander')) {
								if (type == "click") {
									me.toggleRow(rowIndex, record);
									return me.selectRowOnExpand;
								}
							}
						}
					};
				},
				rowBodyTpl: config.rowBodyTpl
			});
		//if (config && config.columnAutoWidth)
		//	self.plugins.push(Ext.create('Ext.ux.ColumnAutoWidthPlugin', { autoUpdate: true, pluginName: 'ColumnAutoWidthPlugin' }));
	}
});