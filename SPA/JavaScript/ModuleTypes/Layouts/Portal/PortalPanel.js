Ext.define('ExtModules.Layouts.Portal.PortalPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.portalpanel',

	requires: [
        'Ext.layout.container.Column',

        'ExtModules.Layouts.Portal.PortalDropZone',
        'ExtModules.Layouts.Portal.PortalColumn'
	],

	cls: 'x-portal',
	bodyCls: 'x-portal-body',
	defaultType: 'portalcolumn',
	overflowY: 'auto',
	manageHeight: false,

	initComponent : function() {
		var me = this;

		delete this.autoScroll;
		this.overflowY = 'auto';
		this.overflowX = 'none';

		// Implement a Container beforeLayout call from the layout to this Container
		this.layout = {
			type : 'hbox'
		};

		this.listeners.resize = function (that, width, height) {
			var tabPanel = that;
			var items = that.layout.getLayoutItems();
			var length = (items.length + 1) / 2;
			var offset = (length * 5) + 5;
			var columnWidth = (width) / length;
			var allLength = items.length;

			var sum = 0;
			for (var i = 0; i < allLength; i += 2) {
				if (items[i].xtype != 'splitter') {
					sum += items[i].width;
				}
			}
			sum += offset;

			var aspect = width / sum;
			for (var i = 0; i < allLength; i += 2) {
				if (items[i].xtype != 'splitter') {
					items[i].setWidth(items[i].width * aspect);
				}
			}
		}

		this.listeners.destroy = function () {
			me.tabModel.off('layoutUpdated', null, self);
		}

		this.listeners.drop = function (dd, e, data, col, c, pos) {
			var controlConfig;
			var columnId = 0
			_.each(this.items.items, function (column) {
				if (column.xtype != 'splitter') {
					var elementId = 0;
					_.each(column.items.items, function (controlPanel) {
						controlConfig = controlPanel.control.get('controlConfig');
						controlConfig.set('order', columnId + ',' + elementId++);
					});
				}
				columnId++;
			});
			me.tabModel.save({ saveControls : true});
		}
		
		var refreshLayout = _.debounce(() => {
			me.doLayout();
		}, 500)

		//app.get("tabs").on("change:order:controls", function (controlConfig) {
		//	me.updateItem(Ext.getCmp(controlConfig.get('control').get('id')));
		//	refreshLayout()
		//})

		this.callParent();

		this.addEvents({
			validatedrop: true,
			beforedragover: true,
			dragover: true,
			beforedrop: true,
			drop: true
		});
	},

	// Set columnWidth, and set first and last column classes to allow exact CSS targeting.
	beforeLayout: function() {
		var items = this.layout.getLayoutItems(),
            len = items.length,
            firstAndLast = ['x-portal-column-first', 'x-portal-column-last'],
            i, item, last;

		for (i = 0; i < len; i++) {
			item = items[i];
			//item.columnWidth = 1 / len;
			last = (i == len-1);

			if (!i) { // if (first)
				if (last) {
					item.addCls(firstAndLast);
				} else {
					item.addCls('x-portal-column-first');
					item.removeCls('x-portal-column-last');
				}
			} else if (last) {
				item.addCls('x-portal-column-last');
				item.removeCls('x-portal-column-first');
			} else {
				item.removeCls(firstAndLast);
			}
		}

		return this.callParent(arguments);
	},

	// private
	initEvents : function(){
		this.callParent();
		this.dd = Ext.create('ExtModules.Layouts.Portal.PortalDropZone', this, this.dropConfig);
	},

	// private
	beforeDestroy : function() {
		if (this.dd) {
			this.dd.unreg();
		}
		this.callParent();
	},

	addItem: function (item) {
		var targetColumn = this.items.items[0];
		if (targetColumn) {
			var controlConfig = item.control.get('controlConfig');
			var order = controlConfig.get('order');
			if (order) {
				var columnId = parseInt(order.split(',')[0]);
				var elementId = parseInt(order.split(',')[1]);
				if (this.items.items[columnId]) {
					targetColumn = this.items.items[columnId];
					targetColumn.insert(elementId, item);
				}
				else {
					var minCount = this.items.items[0].items.length;
					_.each(this.items.items, function (x) {
						if (x.xtype != 'splitter' && x.items.length < minCount)
							targetColumn = x;
					});
					targetColumn.add(item);
				}
			}
			else {
				var minCount = this.items.items[0].items.length;
				_.each(this.items.items, function (x) {
					if (x.xtype != 'splitter' && x.items.length < minCount)
						targetColumn = x;
				});
				targetColumn.add(item);
			}
		}
	},

	updateItem: function (item) {
		if (item && item.ownerCt) {
			item.ownerCt.remove(item, false);
			this.addItem(item);
		}
	}
});
