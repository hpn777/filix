/**
 * @class Ext.ux.grid.filter.StringFilter
 * @extends Ext.ux.grid.filter.Filter
 * Filter by a configurable Ext.form.field.Text
 * <p><b><u>Example Usage:</u></b></p>
 * <pre><code>
var filters = Ext.create('Ext.ux.grid.GridFilters', {
    ...
    filters: [{
        // required configs
        type: 'string',
        dataIndex: 'name',

        // optional configs
        value: 'foo',
        active: true, // default is false
        iconCls: 'ux-gridfilter-text-icon' // default
        // any Ext.form.field.Text configs accepted
    }]
});
 * </code></pre>
 */
Ext.define('Ext.ux.grid.filter.StringFilter', {
	extend: 'Ext.ux.grid.filter.Filter',
	alias: 'gridfilter.string',

	/**
	* @cfg {String} iconCls
	* The iconCls to be applied to the menu item.
	* Defaults to <tt>'ux-gridfilter-text-icon'</tt>.
	*/
	/**
	* @cfg {Object} iconCls
	* The iconCls to be applied to each comparator field item.
	* Defaults to:<pre>
	iconCls : {
	gt : 'ux-rangemenu-gt',
	lt : 'ux-rangemenu-lt',
	eq : 'ux-rangemenu-eq'
	}
	* </pre>
	*/
	iconCls: {
		like: 'ux-rangemenu-like',
		notlike: 'ux-rangemenu-notlike'
	},

	/**
	* @cfg {Object} fieldLabels
	* Accessible label text for each comparator field item. Can be overridden by localization
	* files. Defaults to:<pre>
	fieldLabels : {
	gt: 'Greater Than',
	lt: 'Less Than',
	eq: 'Equal To'
	}</pre>
	*/
	fieldLabels: {
		like: 'Like',
		notlike: 'Not Like'
	},

	emptyText: 'Enter Filter Text...',
	selectOnFocus: true,
	width: 125,
	menuItems: ['like', 'notlike'],
	menuItemsTitles: {
		'like': 'inputItemLike',
		'notlike': 'inputItemNotLike'
	},
	/**
	* @private
	* Template method that is to initialize the filter and install required menu items.
	*/
	init: function (config) {
		var me = this;
		Ext.applyIf(config, {
			enableKeyEvents: true,
			hideLabel: false,
			labelSeparator: '',
			labelWidth: 29,
			labelStyle: 'position: relative;',
			listeners: {
				scope: this,
				change: this.onInputChange,
				keyup: this.onInputKeyUp,
				el: {
					click: function (e) {
						e.stopPropagation();
					}
				}
			}
		});

		for (i = 0, len = me.menuItems.length; i < len; i++) {
			item = me.menuItems[i];
			config.labelCls = 'ux-rangemenu-icon ' + this.iconCls[item];
			config.hideEmptyLabel = false;
			this[this.menuItemsTitles[item]] = Ext.create('Ext.form.field.Text', config);
			this.menu.add(this[this.menuItemsTitles[item]]);
		}
		this.menu.showSeparator = false;
		this.updateTask = Ext.create('Ext.util.DelayedTask', function () {
			me.values = me.getValue()
			me.fireUpdate()
		}, this);
	},

	/**
	* @private
	* Template method that is to get and return the value of the filter.
	* @return {String} The value of this filter
	*/
	getValue: function () {
		if (this.inputItemLike.getValue() != '')
			return { like: this.inputItemLike.getValue() };
		else if (this.inputItemNotLike.getValue() != '')
			return { notlike: this.inputItemNotLike.getValue() };
		//else
		//	return { custom: this.customFilter.getValue() };
	},

	/**
	* @private
	* Template method that is to set the value of the filter.
	* @param {Object} value The value to set the filter
	*/
	setValue: function (value) {
		if (value.like)
			this.inputItemLike.setValue(value.like);
		else if (value.notlike)
			this.inputItemNotLike.setValue(value.notlike);
		//else
		//	this.customFilter.setValue(value.custom)
		this.values = value
		this.fireEvent('update', this);
	},

	/**
	* @private
	* Template method that is to return <tt>true</tt> if the filter
	* has enough configuration information to be activated.
	* @return {Boolean}
	*/
	isActivatable: function () {
		return this.inputItemLike.getValue().length > 0 || this.inputItemNotLike.getValue().length > 0;// || this.customFilter.checked;
	},

	/**
	* @private
	* Template method that is to get and return serialized filter data for
	* transmission to the server.
	* @return {Object/Array} An object or collection of objects containing
	* key value pairs representing the current configuration of the filter.
	*/
	getSerialArgs: function () {
		if (this.inputItemLike.getValue() != '')
			return { type: 'string', value: this.inputItemLike.getValue(), comparison: 'like' };
		else if (this.inputItemNotLike.getValue() != '')
			return { type: 'string', value: this.inputItemNotLike.getValue(), comparison: 'notlike' };
		//else
		//	return { type: 'string', value: this.customFilter.getValue(), comparison: 'custom' };
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

		if (typeof val != 'string') {
			return (this.values.length === 0);
		}

		var query = this.values;

		if (query.like)
			return val.toLowerCase().indexOf(query.like.toLowerCase()) > -1
		else
			return val.toLowerCase().indexOf(query.notlike.toLowerCase()) == -1;
	},

	/**
	* @private
	* Handler method called when there is a keyup event on this.inputItem
	*/
	onInputKeyUp: function (field, e) {
		var k = e.getKey();
		if (k == e.RETURN && field.isValid()) {
			e.stopEvent();
			this.menu.hide();
			return;
		}
		// restart the timer
		this.updateTask.delay(this.updateBuffer);
	},
	onInputChange: function (field) {
		var like = this.inputItemLike,
            nenotlike = this.inputItemNotLike;

		if (field == like) {
			nenotlike.setValue(null);
		}
		else {
			like.setValue(null);
		}

		// restart the timer
		this.updateTask.delay(this.updateBuffer);
	}
}, function () {

	/**
	* @cfg {Ext.XTemplate} iconTpl
	* A template for generating the label for each field in the menu
	*/
	this.prototype.iconTpl = Ext.create('Ext.XTemplate',
	'<img src="{src}" alt="{text}" class="' + Ext.baseCSSPrefix + 'menu-item-icon ux-rangemenu-icon {cls}" />'
	);

});
