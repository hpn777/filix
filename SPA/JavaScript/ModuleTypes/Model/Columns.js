Ext.define('ExtModules.Model.Columns', {
	requires: [
        'Ext.ux.grid.FiltersFeature',//move
        'Ext.ux.ComponentSnapDragger',//move
        'Ext.ux.CheckColumn',//move
        'Ext.ux.layout.Center',//move
        'Ext.ux.form.ItemSelector',//move
		'Ext.ux.CTemplate',
		'ExtModules.Components.resolverCombo',
		'Ext.ux.grid.ColumnComponent'
	],

	createColumnsDefinition: function (control, columns) {
		var columnTypes = new Array();
		var panel = this;
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		var app = control.get('tab').get('app');

		if (!columns)
			columns = this.getColumnDefinitions();

		var tempConfig = control.get('controlConfig');

		var priceRenderer = function (value, metaData, record, colIndex, store, view) {
			return '<span class="price">' + moneyFormat(parseFloat(value), 4, ',', '.') + '</span>';
		}

		var prcRenderer = function (value, metaData, record, colIndex, store, view) {
			return value + '%';
		}
		
		var priceSimpleRenderer = function (value, metaData, record, colIndex, store, view) {
			if (value)
				return '<span class="price">' + moneyFormat(parseFloat(value), 3, ',', '.') + '</span>';
		}

		var moneyFormat = function (n, c, t, d) {
			n = Math.abs(n);
			c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
			return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		}
		
		var processEnums = function (enums) {
			var response = [];
			if (enums) {
				for (var i = 0; i < enums.length; i++) {
					response.push([i, enums[i]]);
				}
			}
			return response;
		}

		var processComplexEnums = function (enums) {
			var response = [];
			for (var i = 0; i < enums.length; i++) {
				if (enums[i].hidden !== '1')
					response.push([i, enums[i].name]);
			}
			return response;
		}

		if (panel.xtype == "treepanel") {
			var tempColumnType = {
				id: control.get("id") + '-columnId',
				//id: 'Header-' + control.get("id") + '-' + columns[i].columnTitle.replace(/ /g,''),
				dataIndex: panel.idProperty,
				//flex: 1,
				xtype: 'treecolumn',
				sortable: false,
				//filter: true,
				draggable: false,
				menuDisabled: true,
				renderer: function (value, metaData, record, colIndex, store, view) {
					return '';
				}
			};
			columnTypes.push(tempColumnType);
		}

		for (var i = 0; i < columns.length; i++) {
			var allowBlank = columns[i].allowBlank !== undefined ? columns[i].allowBlank : true;
			//console.log(columns[i]);
			var tempColumnType = {
				id: control.get('id') + columns[i].name,
				dataIndex: columns[i].name,
				text: columns[i].title,
				//groupable: true,
				editor: false,
				flex: 1,
				//hideable: false,
				minWidth: 20,
				sortable: true,
				filter: true,
				beforeEdit: function (that, context) {
					return true;
				}
			};

			switch (columns[i].type) {
				case 'id':
				case 'string':
				case 'text':
				case 'TEXT':
				case 'currency':
					tempColumnType.filter = { type: 'string' };
					tempColumnType.align = 'left';
					tempColumnType.field = {
						allowBlank: allowBlank,
						selectOnFocus: true,
						xtype: 'textfield',
					};
					break;
				case 'price'://float
					tempColumnType.filter = { type: 'float' };
					tempColumnType.align = 'right';
					tempColumnType.field = {
						allowBlank: allowBlank,
						selectOnFocus: true,
						xtype: 'numberfield',
					};
					tempColumnType.renderer = priceRenderer;
					break;
				case 'columnSchemaName':
					tempColumnType.filter = { type: 'string' };
					tempColumnType.align = 'left';
					tempColumnType.field = {
						allowBlank: allowBlank,
						selectOnFocus: true,
						xtype: 'textfield',
					};
					tempColumnType.afterEdit = function (that, context, field, key) {
						context.newValues.id = context.newValues.tableName + ':' + context.newValues.name;
					};
					break;
				case 'denormalizedPrice'://float
					tempColumnType.filter = { type: 'float' };
					tempColumnType.align = 'right';
					tempColumnType.field = {
						allowBlank: allowBlank,
						selectOnFocus: true,
						xtype: 'numberfield',
					};
					tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
						return '<span class="price">' + moneyFormat(Number(value)/100000, 5, ',', '.') + '</span>';
					};
					break;
				case 'prc'://float
					tempColumnType.filter = { type: 'float' };
					tempColumnType.align = 'right';
					tempColumnType.renderer = prcRenderer;
					break;
				case 'number':
				case 'uint':
				case 'decimal':
				case 'serial':
					tempColumnType.filter = { type: 'float' };
					tempColumnType.align = 'right';
					if (columns[i].format) {
						tempColumnType.xtype = 'numbercolumn';
						tempColumnType.format = columns[i].format;
					}
					tempColumnType.field = {
						allowBlank: allowBlank,
						selectOnFocus: true,
						xtype: 'numberfield',
					};
					break;
				case 'bool':
					var columnEnums = columns[i].enum ? columns[i].enum : ['False', 'True'];
					var processedEnums = processEnums(columnEnums);
					tempColumnType.filter = {
						type: 'list',
						options: processedEnums
					};
					tempColumnType.field = {
						xtype: 'combobox',
						store: processedEnums
					};
					tempColumnType.align = 'right';
					(function () {
						var enums = columnEnums;
						tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
							return enums[value];
						};
					})();
					break;
				case 'boolean':
					tempColumnType.filter = {
						type: 'boolean'
					};
					tempColumnType.align = 'left';
					tempColumnType.field = {
						xtype: 'checkbox'
					};
					tempColumnType.renderer = function(value) {
						return "<input type='checkbox'" + (value ? "checked='checked'" : "") + " disabled>";
					}
					break;
				case 'simpleenum':
					var columnEnums = columns[i].enum;
					tempColumnType.filter = {
						type: 'list',
						options: columnEnums
					};
					tempColumnType.field = {
						xtype: 'combobox',
						store: columnEnums
					};
					break;
				case 'enum':
					var columnEnums = columns[i].enum;
					var processedEnums = processEnums(columnEnums);
					tempColumnType.filter = {
						type: 'list',
						options: processedEnums
					};
					tempColumnType.field = {
						xtype: 'combobox',
						store: processedEnums
					};
					tempColumnType.align = 'right';
					(function () {
						var enums = columnEnums;
						tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
							return enums[value];
						};
					})();
					break;
				case 'complexEnum':
					var columnEnums = columns[i].enum;
					var processedEnums = processComplexEnums(columnEnums);
					tempColumnType.filter = {
						type: 'list',
						options: processedEnums
					};
					tempColumnType.field = {
						xtype: 'combobox',
						store: processedEnums
					};
					tempColumnType.align = 'right';
					(function () {
						var enums = columnEnums;
						tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
							return enums[value].name;
						};
					})();
					break;
				case 'LoginType':
					tempColumnType.filter = {
						type: 'list',
						options: processEnums(columns[i].enum)
					};
					tempColumnType.align = 'right';
					(function () {
						var enums = columns[i].enum;
						tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
							return enums[value];
						};
					})();
					break;
				case 'date':
					tempColumnType.filter = { type: 'date' };
					tempColumnType.renderer = Ext.util.Format.dateRenderer('Y-m-d');
					tempColumnType.field = {
						xtype: 'datefield',
						format: 'Y-m-d'
					};
					break;
				case 'time':
					tempColumnType.filter = { type: 'datetime' };
					tempColumnType.renderer = Ext.util.Format.dateRenderer('H:i:s');
					break;
				case 'datetime':
					tempColumnType.filter = { type: 'datetime' };
					tempColumnType.renderer = Ext.util.Format.dateRenderer('Y-m-d H:i:s');
					break;
				case 'timestamp':
					tempColumnType.filter = false;
					tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
						return Ext.Date.format(new Date(value / 1000000), 'H:i:s.u') + "&nbsp;" + value.toString().slice(-6, -3);
					};
					break;
				case 'action':
					tempColumnType.xtype = 'actioncolumn';
					tempColumnType.text = undefined;
					tempColumnType.menuDisabled = true;
					tempColumnType.align = 'center';
					tempColumnType.width = 25;
					tempColumnType.flex = undefined;
					tempColumnType.items = [{
						icon: app.get('resourceStrings').get('deleteIcon').get('value'),
						//cls: 'group-cancel',
						tooltip: 'Remove item',
						align: 'center',
						handler: function (grid, rowIndex, colIndex) {
							Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function (btn) {
								if (btn === 'yes') {
									var rec = grid.store.getAt(rowIndex);
									if (rec.data.isNewRow) {
										grid.store.remove(rec);
									}
									else if (moduleConfig.tableName) {
										var tempRow = {};
										tempRow[panel.idProperty] = rec.data[panel.idProperty]
										panel.doRequest({
											command: "RemoveData",
											tableName: moduleConfig.tableName,
											data: tempRow,
											noRequestCache: true
										});
									}
									else
										panel.store.remove(rec);
								}
							});
						}
					}];
					break;
				case 'custom':
					tempColumnType = _.extend(tempColumnType, columns[i].custom);
					break;
				default:
					
					break;
			}

			if(columns[i].resolveView !== undefined){
				(() => {
					var resolveView = columns[i].resolveView
					var columnName = columns[i].name
					var dropDownTemplate
					if(resolveView.displayTemplate){
						var gridTemplate = new Ext.Template(resolveView.displayTemplate,
							{
								compiled: true,      // compile immediately
							}
						);
						dropDownTemplate = '<tpl for=".">' + resolveView.displayTemplate + '</tpl>';
						dropDownTemplateList = '<ul class="x-list-plain"><tpl for="."><li style="height:22px;" class="x-boundlist-item" unselectable="on" role="option">' + resolveView.displayTemplate + '</li></tpl></ul>';
					}
					tempColumnType.filter = {
						type: 'resolver',
						addBlank: false,
						underlyingField: columnName,
						...resolveView,
						control: control
					};
					tempColumnType.renderer = function (value, metaData, record, colIndex, store, view) {
						if(value !== null && value !== undefined){
							return app.nameResolver.resolve({
								value: value,
								underlyingField: columnName,
								...resolveView
							}, record.data)
						}
					};
					if (columns[i].editable !== false) {
						tempColumnType.field = {
							xtype: 'resolvercombo',
							underlyingField: columnName,
							...resolveView
						};
					}
					if (dropDownTemplate) {
						tempColumnType.field.tpl = dropDownTemplateList;
						tempColumnType.field.displayTpl = dropDownTemplate;
						tempColumnType.filter.tpl = dropDownTemplateList;
						tempColumnType.filter.displayTpl = dropDownTemplate;
					}
				})()
			}
			// inject custom filters from module type config
			var tempFilterDef = tempConfig.get('filters').find(x=>x.name === columns[i].name)
			if (tempFilterDef != undefined) {
				tempColumnType.filter = tempFilterDef;
			}

			//add column to definition collection
			if (tempColumnType != undefined) {
				if (columns[i].renderer) {
					tempColumnType.renderer = columns[i].renderer.bind(this);
				}

				if (columns[i].filter) {
					tempColumnType.filter = columns[i].filter;
				}

				if (columns[i].beforeEdit) {
					tempColumnType.beforeEdit = columns[i].beforeEdit.bind(this);
				}

				if (columns[i].afterEdit) {
					tempColumnType.afterEdit = columns[i].afterEdit.bind(this);
				}

				if (columns[i].canceledit) {
					tempColumnType.canceledit = columns[i].canceledit.bind(this);
				}

				if (!columns[i].hidden)
					columnTypes.push(tempColumnType);

				if (columns[i].editable === false)
					tempColumnType.field = undefined;

				if (columns[i].sortable === false)
					tempColumnType.sortable = false;

				if (columns[i].format) {
					tempColumnType.format = columns[i].format;
				} 
			}
		}
		return columnTypes;
	},

	createModelFields: function (columns) {
		var self = this;
		var tempModel = new Array();
		if (self.xtype == "treepanel") {
			tempModel.push({ name: 'id', type: 'string' });
		}
		for (i in columns) {
			var columnType;
			var sortDirection = 'ASC';
			var convertFunction = null;
			switch (columns[i].type) {
				case 'id':
					columnType = 'string';
					break;
				case 'uint':
				case 'bool':
				case 'prc':
				case 'int':
				case 'float':
				case 'price':
				case 'macPrice':
				case 'number':
				case 'decimal':
				case 'serial':
				case 'enum':
				case 'denormalizedPrice':
					columnType = 'float';
					sortDirection = 'DESC';
					break;
				case 'boolean':
					columnType = 'boolean';
					convertFunction = function (value, record) {
						if (isNaN(value))
							return value === 'true' ? '1' : '0';
						else
							return value;
					}
					break;
				case 'date':
					columnType = 'date';
					sortDirection = 'DESC';
					convertFunction = function (value, record) {
						return new Date(value);
					}
					break;
				case 'time':
					columnType = 'date';
					sortDirection = 'DESC';
					convertFunction = function (value, record) {
						return new Date(Number(value.slice(0, -6)));
					}
					break;
				case 'datetime':
					columnType = 'date';
					sortDirection = 'DESC';
					break;
				case 'timestamp':
					columnType = 'int';
					sortDirection = 'DESC';
					convertFunction = function (value, record) {
						return Number(value);
					}
					break;
				case 'action':
					break;
				default:
					columnType = 'object';
					break;
			}
			if (columnType) {
				if (columns[i].convertFunction)
					convertFunction = columns[i].convertFunction;
				var tempmodelElement = { name: columns[i].name, type: columnType, sortDir: sortDirection, useNull: true };
				if (convertFunction)
					tempmodelElement.convert = convertFunction
				tempModel.push(tempmodelElement);
			}
		}

		return tempModel;
	}
});
