Ext.define('ExtModules.Model.FormFields', {
	requires: [
		'Ext.ux.CTemplate',
		'ExtModules.Components.resolverCombo'
	],

	createFormFields: function (columns, data) {
		return columns
			.filter(column => {
				var formField = this.getForm().findField(column.name)
			
				if (formField) {
					switch (column.type) {
						case 'date':
						case 'datetime':
								formField.setValue(data?new Date(data[column.name]):null);
							break;
						default:
							formField.setValue(data?data[column.name]:null);
					}
					
				}

				return column.name !== 'removed' && column.hidden !== true && column.type !== 'action' && !formField
			})
			.map(column => {
				var field = {
					xtype: 'textfield',
					value: data ? data[column.name] : null,
					name: column.name
				};

				switch (column.type) {
					case 'number':
						field.xtype = 'numberfield';
						break;
					case 'textarea':
						field.xtype = 'textareafield';
						break;
					case 'date':
						field.xtype = 'datefield'
						field.format = 'Y-m-d'
						break;
					case 'datetime':
						field.xtype = 'datetimefield';
						field.format = 'Y-m-d H:i:s'
						break;
					case 'multiselector':
						field = Ext.create('ExtModules.Components.multiSelector', {
							name: column.name,
							...column.resolveView
						})
						break;
					case 'sourcecode':
						var aceTheme = 'katzenmilch';
						field = Ext.create('Ext.ux.aceeditor.Field', {
							id: this.id + 'codeeditor',
							stateful: true,
							name: column.name,
							theme: aceTheme,
							parser: 'javascript',
							value: data ? data[column.name] : '',
							height: column.height || 110,
							resizable: {
								handles: 's',
								heightIncrement: 14
							}
						});
						break;
					case 'htmleditor':
						field = {
							xtype: 'htmleditor',
							stateful: true,
							allowBlank: true,
							name: column.name,
							value: data ? data[column.name] : '',
							height: column.height || 110,
							resizable: {
								handles: 's',
								heightIncrement: 14
							}
						};
						break;
					case 'boolean':
						field = {
							xtype: 'checkbox',
							stateful: true,
							//value: true,
							//checked: data ?true: false,
							name: column.name
						};
						break;
					case 'simpleenum':
						field = {
							xtype: 'combobox',
							store: column.enum,
							stateful: true,
							name: 'active'
						};
						break;
					case 'enum':
						field = {
							xtype: 'combobox',
							store: this.processEnums(column.enum),
							align: 'right',
							stateful: true,
							name: column.name
						};
						break;
					case 'complexEnum':
						field = {
							type: 'list',
							options: this.processComplexEnums(column.enum),
							align: 'right',
							stateful: true,
							name: column.name
						};
						break;
				}

				if(column.resolveView){
					(function () {
						var resolveView = column.resolveView;
						var selectedValue = data ? data[column.name] : null;
						var dropDownTemplate;
						if (resolveView.displayTemplate) {
							var gridTemplate = new Ext.Template(resolveView.displayTemplate,
								{
									compiled: true,      // compile immediately
								}
							);
							dropDownTemplate = '<tpl for=".">' + resolveView.displayTemplate + '</tpl>';
							dropDownTemplateList = '<ul class="x-list-plain"><tpl for="."><li style="height:22px;" class="x-boundlist-item" unselectable="on" role="option">' + resolveView.displayTemplate + '</li></tpl></ul>';
						}

						if(resolveView.xref){
							field = Ext.create('ExtModules.Components.multiSelector', {
								name: column.name,
								...resolveView
							})
						}else{
							field = {
								xtype: 'resolvercombo',
								name: column.name,
								...resolveView
							};
						}
						if (dropDownTemplate) {
							field.tpl = dropDownTemplateList;
							field.displayTpl = dropDownTemplate;
						}
					})();
				}

				if (column.primaryKey || column.editable === false)
					field.xtype = 'displayfield';

				return {
					xtype: 'fieldset',
					title: column.title,
					layout: 'anchor',
					stateful: true,
					defaults: {
						anchor: '100%'
					},
					items: Array.isArray(field) ? field : [field]
				}
			})
	},

	processEnums: function (enums) {
		var response = [];
		if (enums) {
			for (var i = 0; i < enums.length; i++) {
				response.push([i, enums[i]]);
			}
		}
		return response;
	},

	processComplexEnums: function (enums) {
		var response = [];
		for (var i = 0; i < enums.length; i++) {
			if (enums[i].hidden !== '1')
				response.push([i + '', enums[i].name]);
		}
		return response;
	}
});
