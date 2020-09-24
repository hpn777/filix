Ext.define('ExtModules.ToolbarItems.DatePicker', {
	requires: [],

	datePicker: function () {
		var self = this;
		var controlConfig = this.getControlConfig();
		var selectedDate = new Date();
		var dateFilter = controlConfig.get('filters').find(function (x) { return x.get('field') == 'date' });
		if(dateFilter){
			var selectedValue = dateFilter.get('value');
			var selectedDate = new Date(selectedValue.substring(0, 4) + '/' + selectedValue.substring(4, 6) + '/' + selectedValue.substring(6, 8));
		}
		
		var ra = {
			xtype: 'datefield',
			itemId: 'date',
			anchor: '100%',
			format: 'd M, Y',
			name: 'date',
			value: selectedDate
		};

		return ra;
	}
});