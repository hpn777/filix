
Ext.define('Ext.ux.grid.filter.ListFilter', {
	extend: 'Ext.ux.grid.filter.Filter',
	alias: 'gridfilter.list',

	phpMode: false,

	init: function (config) {
		var me = this;

		this.dt = Ext.create('Ext.util.DelayedTask', function () {
			me.values = me.menu.getSelected();
			me.fireUpdate()
		}, this);
	},

	/**
     * @private @override
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
	createMenu: function (config) {
		var displayField = config.displayField;
		var valueField = config.valueField;

		if (displayField && valueField) {
			config.idField = valueField;
			config.labelField = displayField;

			config.store = Ext.create('Ext.data.Store', {
				fields: [valueField, displayField],
				loadData: function (data, append) {
					var length = data.length,
						newData = [],
						i;

					for (i = 0; i < length; i++) {
						newData.push(this.createModel(data[i]));
					}
					this.loadRecords(newData, append ? this.addRecordsOptions : undefined);
					this.fireEvent('load', this);
				}
			});

			var menu = Ext.create('Ext.ux.grid.menu.ListMenu', config);
			menu.on('checkchange', this.onCheckChange, this);

			if (config.childrenTable) {
				var list = app.nameResolver.getTesseract(config.childrenTable, config.dataProviderId);
				if (list) {
					config.store.loadData(list.getData())
				}

				app.nameResolver.on(config.childrenTable + ':add ' + config.childrenTable + ':update', function (list) {
					config.store.loadData(list.dataCache)
				});
			}
		}

		else {
			var menu = Ext.create('Ext.ux.grid.menu.ListMenu', config);
			menu.on('checkchange', this.onCheckChange, this);
		}

		return menu;
	},

	/**
     * @private
     * Template method that is to get and return the value of the filter.
     * @return {String} The value of this filter
     */
	getValue: function () {
		return this.menu.getSelected();
	},
	/**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     */
	setValue: function (value) {
		this.menu.setSelected(value);
		this.values = this.getValue();
		this.fireEvent('update', this);
	},

	/**
     * @private
     * Template method that is to return <tt>true</tt> if the filter
     * has enough configuration information to be activated.
     * @return {Boolean}
     */
	isActivatable: function () {
		return this.getValue().length > 0;
	},

	/**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
	getSerialArgs: function () {
		return { type: 'list', comparison: 'inlike', value: this.getValue() };
	},

	/** @private */
	onCheckChange: function () {
		this.dt.delay(this.updateBuffer);
	},


	/**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
	validateRecord: function (record) {
		var valuesArray = this.values;
		var val = typeof (record.get) === 'function' ? record.get(this.dataIndex) : record[this.dataIndex];

		return Ext.Array.indexOf(valuesArray, val) > -1;
	}
});