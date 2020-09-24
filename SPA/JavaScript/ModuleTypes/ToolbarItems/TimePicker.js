Ext.define('ExtModules.ToolbarItems.TimePicker', {
	requires: [],

	timePicker: function () {
		var self = this;
		var d = (new Date());
		var m = m1 = d.getMinutes();
		var h = h1 = d.getHours();
		var o = m % 5;

		m = m - o;
		m1 = m + 5;

		if (m1 >= 60) {
			m1 = 0;
			h1++;
		}

		var dfrom = new Date();
		dfrom.setMinutes(m);
		dfrom.setHours(h);

		var dto = new Date();
		dto.setMinutes(m1);
		dto.setHours(h1);

		var ra = [
            'Time:',
            {
            	xtype: 'timefield',
            	name: 'from',
            	itemId: 'from',
            	increment: 5,
            	format: 'H:i',
            	minValue: Ext.Date.parse('07:00:00', 'H:i:s'),
            	maxValue: Ext.Date.parse('18:00:00', 'H:i:s'),
            	width: 60,
            	value: dfrom,
            	emptyText: 'from'

            },
            {
            	xtype: 'timefield',
            	name: 'to',
            	itemId: 'to',
            	increment: 5,
            	format: 'H:i',
            	minValue: Ext.Date.parse('07:00:00', 'H:i:s'),
            	maxValue: Ext.Date.parse('18:00:00', 'H:i:s'),
            	width: 60,
            	value: dto,
            	emptyText: 'to'
            }
		];

		return ra;
	}
});