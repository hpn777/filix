Ext.define('Ext.ux.grid.filter.NumericFilter', {
	extend: 'Ext.ux.grid.filter.Filter',
	alias: 'gridfilter.numeric',
	requires: ['Ext.form.field.Number'],

	/**
	* @private @override
	* Creates the Menu for this filter.
	* @param {Object} config Filter configuration
	* @return {Ext.menu.Menu}
	*/
	createMenu: function (config) {
		var me = this,
            menu;
		menu = Ext.create('Ext.ux.grid.menu.RangeMenu', config);
		menu.on('update', function () {
			me.values = me.menu.getValue();
			me.fireUpdate();
		}, me);
		return menu;
	},

	/**
	* @private
	* Template method that is to get and return the value of the filter.
	* @return {String} The value of this filter
	*/
	getValue: function () {
		return this.values;
	},

	/**
	* @private
	* Template method that is to set the value of the filter.
	* @param {Object} value The value to set the filter
	*/
	setValue: function (value) {
		this.menu.setValue(value);
		this.values = this.menu.getValue();
	},

	/**
	* @private
	* Template method that is to return <tt>true</tt> if the filter
	* has enough configuration information to be activated.
	* @return {Boolean}
	*/
	isActivatable: function () {
		var values = this.getValue(),
            key;
		for (key in values) {
			if (values[key] !== undefined) {
				return true;
			}
		}
		return false;
	},

	/**
	* @private
	* Template method that is to get and return serialized filter data for
	* transmission to the server.
	* @return {Object/Array} An object or collection of objects containing
	* key value pairs representing the current configuration of the filter.
	*/
	getSerialArgs: function () {
		var key,
            args = [],
            values = this.values;
		for (key in values) {
			args.push({
				type: 'numeric',
				comparison: key,
				value: values[key]
			});
		}
		return args;
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
		var values = this.values;

		if (Ext.isNumber(values.eq) && val != values.eq) {
			return false;
		}
		if (Ext.isNumber(values.neq) && val == values.neq) {
			return false;
		}

		var returValue = true;
		if (Ext.isNumber(values.lt) && val >= values.lt) {
			returValue = false;
		}
		if (Ext.isNumber(values.gt) && val <= values.gt) {
			returValue = false;
		}
		if (Ext.isNumber(values.lte) && val > values.lte) {
			returValue = false;
		}
		if (Ext.isNumber(values.gte) && val < values.gte) {
			returValue = false;
		}
		return returValue;
	}
});
