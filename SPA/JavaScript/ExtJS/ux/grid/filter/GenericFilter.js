Ext.define('Ext.ux.grid.filter.GenericFilter', {
	extend: 'Ext.ux.grid.filter.Filter',
	alias: 'gridfilter.generic',

	init: function (config) {
		var self = this
		self.parser = new ExpressionEngine.ExpressionEngine();
		var tempCodeString = self.customFilter.getValue();
		if (tempCodeString) {
			self.generateExpression(tempCodeString);
			self.fireEvent('update', this);
		}
	},

	getValue: function () {
		return { custom: this.customFilter.getValue() };
	},

	setValue: function (value) {
		if (this.customFilter) {
			var tempCodeString = unescape(value.custom);
			this.customFilter.setValue(tempCodeString);
			if (!this.expressionTee && this.parser)
				this.generateExpression(tempCodeString);
			this.fireEvent('update', this);
		}
	},

	isActivatable: function () {
		this.customFilter.checked;
	},

	getSerialArgs: function () {
		return { type: 'custom', value: this.customFilter.getValue(), comparison: 'custom' };
	},

	generateExpression: function (stringCode) {
		this.expressionTee = this.parser.generateExpressionTree(stringCode);
	},

	removeExpression: function () {
		this.expressionTee = null;
	},

	validateRecord: function (record) {
		return this.expressionTee ? this.parser.executeExpressionTree(this.expressionTee, record.data || record) : true;
	}
});
