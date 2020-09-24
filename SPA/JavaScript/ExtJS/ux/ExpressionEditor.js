Ext.define('Ext.ux.ExpressionEditor', {
	requires: ['Ext.ux.aceeditor.Panel'],
	extend: 'Ext.container.Container',
	alias: 'widget.expressioneditor',
	Value: '',
	layout: 'fit',
	Markers: [],
	Presets: [],
	tempExpressionTree: {},
	tempMarkersTree: {},

	constructor: function (config) {
		var self = this;
		require([
			"Models/Tesseract/ExpressionEngine"
		], function (ExpressionEngine) {
			self.parser = new ExpressionEngine();
			self.setupComponent(config);
		});
		this.superclass.constructor.apply(this, arguments);
	},

	setupComponent: function (config) {
		var me = this;
		
		//load presets
		me.loadPresets();

		//node model for expression tree
		Ext.define('ExpressionTree', {
			extend: 'Ext.data.Model',
			fields: [
                { name: 'tree', type: 'string' },
                { name: 'text', type: 'string' },
                { name: 'subExpression', type: 'string' },
                { name: 'Value', type: 'string' },
                { name: 'Type', type: 'string' },
                { name: 'Operand', type: 'string' }
            ]
		});

		//store for collection of markers
		var markersStore = Ext.create('Ext.data.TreeStore', {
			autoDestroy: true,
			root: me.getMarkersData(),
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			},
			model: 'ExpressionTree',
			autoLoad: false
		});

		//streepanel with collection of markers
		me.markersTree = Ext.create('Ext.tree.Panel', {
			store: markersStore,
			width: 210,
			animate: false,
			rootVisible: false,
			header: false,
			selModel: Ext.create('Ext.selection.CheckboxModel', {
				showHeaderCheckbox: false,
				mode: 'SINGLE',
				allowDeselect: true,
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
						me.markersTree.getStore().sync();
						me.savePresets();
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
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					xtype: 'textfield',
					name: 'searchField',
					fieldLabel: 'Filter',
					labelWidth: 40,
					//hideLabel: true,
					height: 22,
					width: 195,
					listeners: {
						change: function (that, newStr, oldStr) {
							me.markersTree.getStore().setRootNode(me.getMarkersData(newStr));
						}
					}
				}]
			}, {
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Delete',
					handler: function () {
						for (i in me.markersTree.selModel.selected.items) {
							if (me.markersTree.selModel.selected.items[i].parentNode.data.Value == 'Presets') {
								if (Enumerable.from(me.Presets).count("x=>x.text == '" + me.markersTree.selModel.selected.items[i].data.text + "'") > 0) {
									var tempNode = Enumerable.from(me.Presets).first("x=>x.text == '" + me.markersTree.selModel.selected.items[i].data.text + "'");
									Ext.Array.remove(me.Presets, tempNode);
								}
								me.markersTree.selModel.selected.items[i].remove();
								me.savePresets();
							}
						}
					}
				}]
			}],
			viewConfig: {
				//copy: true,
				plugins: {
					ptype: 'treeviewdragdrop',
					enableDrop: true
				},
				listeners: {
					beforedrop: function (node, data, overModel, dropPosition) {
						if (dropPosition == 'append') {
							if (overModel) {
								if (overModel.data.Value == 'Presets') {
									//data.copy = true;
									me.tempExpressionTree = me.retriveData(me.expressionTree.getStore().tree.root);
									return true;
								}
							}
						}
						return false;
					},
					drop: function (node, data, overModel, dropPosition) {
						for (i in data.records) {
							data.records[i].data.expanded = false;
							me.Presets.push(me.retriveSimpleData(data.records[i]));
						}
						me.reloadTree(me.markersTree, false);
						me.expressionTree.getStore().setRootNode(me.tempExpressionTree);
						me.savePresets();
					}
				}
			}
		});

		//expression tree store
		//var expressionData = me.parseExpression(me.removeWhitespaces(me.Value));
		var expressionData = me.parser.generateExpressionTree(me.Value);
		if (expressionData.text == '')
			expressionData = undefined;
		var expressionStore = Ext.create('Ext.data.TreeStore', {
			autoDestroy: true,
			root: {
				expanded: true,
				leaf: false,
				children: expressionData
			},
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			},
			model: 'ExpressionTree',
			autoLoad: false
		});

		//expression tree treepanel
		me.expressionTree = Ext.create('Ext.tree.Panel', {
			//id: 'expressionTree',
			store: expressionStore,
			//height: me.height - 150,
			//rootVisible: false,
			//useArrows: true,
			flex: 3,
			animate: false,
			selModel: Ext.create('Ext.selection.CheckboxModel', {
				showHeaderCheckbox: false,
				mode: 'SINGLE',
				allowDeselect: true,
				headerWidth: 0
			}),
			dockedItems: {
				xtype: 'toolbar',
				items: [
                    {
                    	text: 'Delete',
                    	handler: function () {
                    		for (i in me.expressionTree.selModel.selected.items) {
                    			me.expressionTree.selModel.selected.items[i].remove();
                    			me.reloadTree(me.expressionTree, true);
                    		}
                    	}
                    }
                ]
			},
			columns: [{
				xtype: 'treecolumn', //this is so we know which column will show the tree
				text: '',
				flex: 2,
				sortable: false,
				dataIndex: 'text',
				getEditor: function (record) {
					var boolOperatorsRegex = /(\|\||\&\&)/;
					var boolExprRegex = /(\=\=|\!\=|\>\=|\<\=|\<|\>|LIKE|NOTLIKE)/;
					var conditionalExprRegex = /(\?|\:)/;
					var arithmeticExprRegex = /(\+|\-|\*|\/)/;
					var functionExprRegex = /(Math\.Sqrt|Math\.Sign|Math\.Pow|Math\.Log|Math\.Log10|Math\.Floor|Math\.Ceiling|Math\.Round|Math\.Exp|Math\.Abs|Math\.Average)/;
					var storeData = [];
					if (boolOperatorsRegex.test(record.data.Operand))
						storeData = ['||', '&&'];
					else if (boolExprRegex.test(record.data.Operand))
						storeData = ['==', '!=', '<=', '>=', '<', '>', 'like', 'notlike'];
					else if (conditionalExprRegex.test(record.data.Operand))
						storeData = ['?:'];
					else if (arithmeticExprRegex.test(record.data.Operand))
						storeData = ['+', '-', '*', '/'];
					else if (functionExprRegex.test(record.data.Operand))
						storeData = ['Math.Sqrt', 'Math.Sign', 'Math.Pow', 'Math.Log', 'Math.Log10', 'Math.Floor', 'Math.Ceiling', 'Math.Round', 'Math.Exp', 'Math.Abs', 'Math.Average'];
					else
						storeData = me.Markers;
					return Ext.create('Ext.grid.CellEditor', {
						field: Ext.create('Ext.form.field.ComboBox', {
							typeAhead: true,
							triggerAction: 'all',
							selectOnTab: true,
							store: storeData,
							lazyRender: true
						})
					});
				},
				beforeEdit: function (that, context) {
				},
				afterEdit: function (that, context) {
					if (context.record.data.Operand)
						context.record.data.Operand = context.value;
					else
						context.record.data.Value = context.value;
					me.reloadTree(me.expressionTree, true);
				}
			}, {
				text: 'Expression',
				flex: 2,
				sortable: false,
				dataIndex: 'subExpression'
			}],
			plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                	clicksToEdit: 2,
                	clicksToMoveEditor: 1,
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
                })
            ],
			viewConfig: {
				//				copy: true,
				//				allowCopy: true,
				plugins: {
					ptype: 'treeviewdragdrop',
					allowContainerDrop: true
				},
				listeners: {
					beforedrop: function (node, data, overModel, dropPosition) {
						//data.copy = true;
						if (dropPosition != 'append') {
							if (overModel) {
								if (overModel.parentNode) {
									if ((overModel.parentNode.data.Value == '[BoolExpression]' || overModel.parentNode.data.Value == '[ArithmeticExpression]') && overModel.parentNode.childNodes.length > 2) {
										if (!(overModel.parentNode.data.Value == '[ConditionalExpression]' && overModel.parentNode.childNodes.length > 3))
											return false;
									}
									else if ((overModel.parentNode.data.Value == '[BoolExpression]' || overModel.parentNode.data.Value == '[ArithmeticExpression]') && overModel.parentNode.childNodes.length == 2) {
										for (i in overModel.parentNode.childNodes)
											if (overModel.parentNode.childNodes[i] == data.records[0]) {
												me.tempMarkersTree = me.retriveData(me.markersTree.getStore().tree.root);
												return true;
											}
										return false;
									}
								}
							}
						}
						else {
							if (overModel) {
								if (overModel.parentNode) {
									if ((overModel.data.Value == '[BoolExpression]' || overModel.data.Value == '[ArithmeticExpression]') && overModel.childNodes.length > 2) {
										if (!(overModel.data.Value == '[ConditionalExpression]' && overModel.childNodes.length > 3))
											return false;
									}
									else if ((overModel.data.Value == '[BoolExpression]' || overModel.data.Value == '[ArithmeticExpression]') && overModel.childNodes.length == 2) {
										for (i in overModel.childNodes)
											if (overModel.childNodes[i] == data.records[0]) {
												me.tempMarkersTree = me.retriveData(me.markersTree.getStore().tree.root);
												return true;
											}
										return false;
									}
								}
							}
						}
						me.tempMarkersTree = me.retriveData(me.markersTree.getStore().tree.root);
						return true;
					},
					drop: function (node, data, overModel, dropPosition) {
						me.reloadTree(me.expressionTree, true);
						me.markersTree.getStore().setRootNode(me.tempMarkersTree);
					}

				}
			}
		});

		me.aceEditor = Ext.create('Ext.ux.aceeditor.Panel', {
			name: 'CustomFilterAce',
			theme: 'github',
			parser: 'javascript',
			region: 'north',
			header: false,
			height: 150,
			collapsible: true,
			collapsed: false,
			sourceCode: me.Value,
			showInvisible: false,
			printMargin: true,
			dockedItems: {
				xtype: 'toolbar',
				items: [
                    {
                    	text: 'Parse',
                    	handler: function () {
                    		me.expressionTree.getStore().setRootNode({
                    			expanded: true,
                    			leaf: false,
                    			children: me.parser.generateExpressionTree(me.aceEditor.editor.getSession().getValue()),// me.parseExpression(me.removeWhitespaces(me.aceEditor.editor.getSession().getValue()))
                    		});
                    	}
                    }
                ]
			}
		});

		me.add( [{
			layout: 'border',
			defaults: {
				collapsible: true,
				split: true
			},
			items: [me.aceEditor, {
				xtype: 'panel',
				flex: 1,
				//title: 'Quick Editor',
				collapsible: false,
				//height: me.height - 150,
				region: 'center',
				layout: {
					type: 'hbox',
					pack: 'start',
					align: 'stretch'
				},
				items: [me.expressionTree, me.markersTree]
			}]
		}]);

		//this.callParent(arguments);
	},

	getValue: function () {
		return this.aceEditor.editor.getSession().getValue(); //this.Value;
	},

	setValue: function (value) {
		this.aceEditor.editor.getSession().setValue(value);
		this.Value = value;
	},

	retriveSimpleData: function (node) {
		var me = this;
		var newNode = {
			//id: Ext.id(),
			Value: node.data.Value,
			text: node.data.text,
			Type: node.data.Type,
			leaf: node.data.leaf,
			Operand: node.data.Operand,
			subExpression: node.data.subExpression,
			children: [],
			expanded: node.data.expanded
		};
		for (i in node.childNodes) {
			newNode.children.push(me.retriveSimpleData(node.childNodes[i]));
		}
		return newNode;
	},

	retriveData: function (node) {
		var me = this;
		var newNode = {
			//id: Ext.id(),
			Value: node.data.Value,
			text: node.data.text,
			Type: node.data.Type,
			leaf: node.data.leaf,
			Operand: node.data.Operand,
			children: [],
			expanded: node.data.expanded,
			ToString: me.parser.ToString
		};
		for (i in node.childNodes) {
			newNode.children.push(me.retriveData(node.childNodes[i]));
		}
		var ExprRegex = /(\=\=|\!\=|\>\=|\<\=|\<|\>|LIKE|NOTLIKE|\+|\-|\*|\/|\?\:)/;
		if (ExprRegex.test(newNode.Operand))
			newNode.subExpression = newNode.ToString();
		return newNode;
	},

	reloadTree: function (tree, updateCodeEditor) {
		var me = this;
		var store = tree.getStore();
		if (store.tree.root.childNodes.length > 0) {
			var tempData = [];
			var tempValueStr = '';
			for (i in store.tree.root.childNodes) {
				var tempNode = me.retriveData(store.tree.root.childNodes[i]);
				tempData.push(tempNode);
				tempValueStr += tempNode.ToString() + ' ';
			}
			//this.Value = tempData.ToString();
			if (updateCodeEditor)
				me.setValue(tempValueStr);

			//tree.scrollTemp = tree.getEl().down('.x-grid-view').getScroll();
			store.setRootNode({
				expanded: true,
				leaf: false,
				children: tempData
			});
			//tree.getEl().down('.x-grid-view').scrollTo('top', tree.scrollTemp.top, false);

			return this.Value;
		}
		return {};
	},

	getMarkersData: function (str) {
		var me = this;
		var markersData = {};
		var markersList = [];
		var presetsList = [];

		var collapsed = false;
		str = str == undefined ? '' : str;
		for (i in me.Markers) {
			markersList.push({
				text: me.Markers[i],
				Value: me.Markers[i],
				leaf: true
			});
		}

		for (i in me.Presets)
			presetsList.push(_.extend({}, me.Presets[i]));

		markersList = Enumerable.from(markersList).orderBy("x=>x.text").toArray();
		presetsList = Enumerable.from(presetsList).orderBy("x=>x.text").toArray();

		if (str != '') {
			collapsed = false;
			markersList = Enumerable.from(markersList).where("x=>x.text.toLowerCase().search('" + str.toLowerCase() + "') != -1").toArray();
			presetsList = Enumerable.from(presetsList).where("x=>x.text.toLowerCase().search('" + str.toLowerCase() + "') != -1").toArray();

		}
		markersData = {
			text: 'root',
			leaf: false,
			expanded: true,
			children: [
				{ text: 'Logical Operators', leaf: false, expanded: collapsed, children: [
				{ text: '&&', Operand: '&&', Value: '[LogicalOperator]', leaf: false, expanded: true },
				{ text: '||', Operand: '||', Value: '[LogicalOperator]', leaf: false, expanded: true }
			]
				},
			{
				text: 'Comparison Operators', leaf: false, expanded: collapsed, children: [
				{ text: '==', Operand: '==', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '!=', Operand: '!=', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '<=', Operand: '<=', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '>=', Operand: '>=', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '<', Operand: '<', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '>', Operand: '>', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: 'LIKE', Operand: 'like', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: 'NOTLIKE', Operand: 'notlike', Value: '[ComparisonExpression]', leaf: false, expanded: true },
				{ text: '.', Operand: 'stdout', Value: '[ComparisonExpression]', leaf: false, expanded: true }
			]
			},
			{ text: 'Conditional Operators', Value: '?:', leaf: false, expanded: true },
			{
				text: 'Arythmetic Operators', leaf: false, expanded: false, children: [
				{ text: '+', Operand: '+', Value: '[ArithmeticExpression]', leaf: false, expanded: true },
				{ text: '-', Operand: '-', Value: '[ArithmeticExpression]', leaf: false, expanded: true },
				{ text: '*', Operand: '*', Value: '[ArithmeticExpression]', leaf: false, expanded: true },
				{ text: '/', Operand: '/', Value: '[ArithmeticExpression]', leaf: false, expanded: true }
			]
			},
			{ text: 'Value...', Value: '0', leaf: true },
			{ text: 'Variables', leaf: false, expanded: !collapsed, children: markersList },
			{ text: 'Presets', Value: 'Presets', leaf: false, expanded: !collapsed, children: presetsList },
			]
		};
		return markersData
	},

	loadPresets: function () {
		if (localStorage.getItem('CustomFilters'))
			this.Presets = Ext.decode(localStorage.getItem('CustomFilters'));
	},

	savePresets: function () {
		localStorage.setItem('CustomFilters', Ext.encode(this.Presets));
	}

});
