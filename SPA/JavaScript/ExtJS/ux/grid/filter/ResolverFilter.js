Ext.define('Ext.ux.grid.filter.ResolverFilter', {
	extend: 'Ext.ux.grid.filter.Filter',
	alias: 'gridfilter.resolver',
	requires: ['ExtModules.Components.resolverCombo'],

	/**
     * @cfg {String} iconCls
     * The iconCls to be applied to the menu item.
     * Defaults to <tt>'ux-gridfilter-text-icon'</tt>.
     */
	iconCls: 'ux-gridfilter-text-icon',

	emptyText: 'Enter Filter Text...',
	selectOnFocus: true,
	width: 125,

	/**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
	init: function (config) {
		Ext.applyIf(config, {
			enableKeyEvents: true,
			fieldLabel: '',
			//hideEmptyLabel: false,
			labelSeparator: '',
			labelWidth: 29,
			listeners: {
				scope: this,
				select: this.onSelected,
				el: {
					click: function (e) {
						e.stopPropagation();
					}
				}
			}
		});
		
		this.inputItem = Ext.create('ExtModules.Components.resolverCombo', config);
		this.menu.add(this.inputItem);
		this.menu.showSeparator = false;
	},

	/**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
	getValue: function () {
		//return this.filterValue || this.inputItem.getValue();
		
		return this.filterValue;
	},

	/**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
	setValue: function (value) {
		this.filterValue = value;
		this.inputItem.setValue(value);
		this.fireEvent('update', this);
	},

	/**
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
	isActivatable: function () {
		return this.inputItem.getValue() > 0;
	},

	/**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
	getSerialArgs: function () {
		return { type: 'number', value: this.getValue(), comparison: 'eq' };
	},

	/**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
	validateRecord: function (record) {
		var val = typeof (record.get) === 'function' ? record.get(this.dataIndex) : record[this.dataIndex];

		return val == this.getValue();
	},

	/**
     * @private
     * Handler method called when there is a keyup event on this.inputItem
     */
	onSelected: function (that, value) {
		this.filterValue = this.inputItem.getValue()
		this.menu.hide();
		this.fireUpdate();
		return;
	}
});
