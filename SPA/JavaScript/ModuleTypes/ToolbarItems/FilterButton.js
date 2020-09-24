Ext.define('ExtModules.ToolbarItems.FilterButton', {
	requires: [],

	filterButton: function () {
		var self = this;

		var filterButton = {
			xtype: 'button', text: 'Go', itemId: 'goBtn', iconCls: 'tradebust-retrieve', iconAlign: 'right',
			handler: function () {
				var tb = self.getDockedItems('toolbar')[0];
				if (tb) {
					var toolbarItems = tb.items;
					var filter = [];
					var executionId = toolbarItems.get('executionId');
					var orderId = toolbarItems.get('orderId');
					var clientId = toolbarItems.get('clientId');
					var marketId = toolbarItems.get('marketId');
					var securityId = toolbarItems.get('securityId');
					var from = toolbarItems.get('from');
					var to = toolbarItems.get('to');

					var createFilter = function (value, comparison, field) {
						return {
							field: field,
							comparison: comparison,
							value: value,
							type: 'number'
						};
					}

					if (executionId && executionId.getValue())
						filter.push(createFilter(executionId.getValue(), 'eq', 'executionId'));
					if (orderId && orderId.getValue())
						filter.push(createFilter(orderId.getValue(), 'eq', 'orderId'));
					if (clientId && clientId.getValue())
						filter.push(createFilter(clientId.getValue(), 'eq', 'clientId'));
					if (marketId && marketId.getValue())
						filter.push(createFilter(marketId.getValue(), 'eq', 'marketId'));
					if (securityId && securityId.getValue())
						filter.push(createFilter(securityId.getValue(), 'eq', 'securityId'));
					if (from && from.getValue())
						filter.push(createFilter(Ext.Date.parse(Ext.Date.format(new Date(), 'Y-m-d') + ' ' + Ext.Date.format(from.getValue(), 'H:i'), 'Y-m-d H:i').getTime() + '000000', 'get', 'timeSpan'));
					if (to && to.getValue())
						filter.push(createFilter(Ext.Date.parse(Ext.Date.format(new Date(), 'Y-m-d') + ' ' + Ext.Date.format(to.getValue(), 'H:i'), 'Y-m-d H:i').getTime() + '000000', 'let', 'timeSpan'));

					var moduleConfig = self.getModuleConfig();
					self.doRequest({
						command: moduleConfig.serviceRequestCommand,
						filter: filter
					});
				}
			},
			scope: self
		};

		return filterButton;
	}
});