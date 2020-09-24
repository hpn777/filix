
Ext.define('Ext.ux.grid.filter.CustomFilter', {
	requires: ['Ext.ux.aceeditor.Panel', 'Ext.ux.ExpressionEditor'],
	extend: 'Ext.menu.CheckItem',
	alias: 'gridfilter.custom',

	defaultValue: '',

	filterValue: '',

	constructor: function (config) {
		var me = this;
		//if (config.filter)
		//	this.filter = config.filter;
		me.callParent(arguments);
	},

	initComponent: function () {
		var me = this;
		this.on('click', this.openSettingsWindow, this);

		me.callParent(arguments);
	},

	openSettingsWindow: function (that, checked, obj) {
		var me = this;
		if (that.setChecked)
			that.setChecked(true);
		var tempFilterString = me.filterValue;
		var tempFilterActive = me.filter.active;
		var listOfColumnsStr = 'Available tokens: ';
		var listOfColumns = [];
		listOfColumns = me.columnsList;

		listOfColumnsStr = listOfColumns.join(', ');
		if (true) {
			var win = Ext.create('Ext.window.Window', {
				title: 'Custom filters',
				modal: false,
				closable: false,
				layout: 'fit',
				items: Ext.create('Ext.form.Panel', {
					frame: true,
					width: 800,
					bodyPadding: 5,

					fieldDefaults: {
						labelAlign: 'left',
						labelWidth: 90,
						anchor: '100%'
					},

					items: [
					{
						xtype: 'expressioneditor',
						name: 'CustomFilterAce',
						height: 600,
						Value: decodeURIComponent(me.filterValue),
						Markers: listOfColumns
					}],
					buttons: [{
						text: 'Apply',
						handler: function (saveButton, event) {
							//me.filter.fireUpdate();
							var tempItems = saveButton.ownerLayout.owner.ownerLayout.owner.items.items;
							var tempPanel = saveButton.ownerLayout.owner.ownerLayout.owner;
							//var customFilter = encodeURIComponent(tempPanel.down('[name=CustomFilter]').getValue());
							var customFilter = tempPanel.down('[name=CustomFilterAce]').getValue();
							me.filterValue = customFilter;
							me.filter.generateExpression(customFilter);
							me.setChecked(true);
							me.filter.setActive(true);
							me.filter.fireEvent('update', me.filter);
						}
					}, {
						text: 'Clear',
						handler: function () {
							me.filter.removeExpression();
							me.filter.fireEvent('update', me.filter);
						}
					}, {
						text: 'Save & Close',
						handler: function (saveButton, event) {
							//console.log(me);
							//me.filter.fireUpdate();
							var tempItems = saveButton.ownerLayout.owner.ownerLayout.owner.items.items;
							var tempPanel = saveButton.ownerLayout.owner.ownerLayout.owner;
							var customFilter = encodeURIComponent(tempPanel.down('[name=CustomFilterAce]').getValue());

							me.filterValue = customFilter;
							me.setChecked(true);
							me.filter.setActive(true);
							me.filter.fireEvent('update', me.filter);
							//console.log(me.filter);
							win.destroy();
						}
					}, {
						text: 'Cancel',
						handler: function () {
							me.filterValue = tempFilterString;
							me.filter.fireEvent('update', me.filter);
							me.filter.setActive(tempFilterActive);
							me.setChecked(tempFilterActive);
							win.destroy();
						}
					}, {
						text: 'Remove',
						handler: function () {
							me.filterValue = '';
							me.filter.setActive(false);
							me.setChecked(false);
							me.filter.fireEvent('update', me.filter);
							win.destroy();
						}
					}]
				})
			});
			win.show();
		}
		else {

		}
		return false;
	},

	getValue: function () {
		//return this.options[0].checked;
		return this.filterValue;
	},

	setValue: function (value) {
		//this.options[value ? 0 : 1].setChecked(true);
		this.filterValue = value;
		this.setChecked(true);
	},

	getSerialArgs: function () {
		//		var args = { type: 'boolean', value: this.getValue() };
		//		return args;
	},

	validateRecord: function (record) {
		//return record.get(this.dataIndex) == this.getValue();
	}
});
