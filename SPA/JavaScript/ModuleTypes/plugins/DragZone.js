Ext.define('ExtModules.plugins.DragZone', {
	extend: 'Ext.dd.DragZone',
	colHeaderCls: 'thumb-wrap',
	maxProxyWidth: 120,

	constructor: function (headerCt, ddGroup) {
		this.headerCt = headerCt;
		this.ddGroup = ddGroup;
		this.callParent([headerCt.el]);
	},

	getDragData: function (e) {
		var sourceEl = e.getTarget(this.headerCt.itemSelector, 10);
        if (sourceEl) {
            d = sourceEl.cloneNode(true);
            d.id = Ext.id();
            return this.headerCt.dragData = {
                sourceEl: sourceEl,
                repairXY: Ext.fly(sourceEl).getXY(),
                ddel: d,
                itemData: this.headerCt.getRecord(sourceEl).data
            }
        }
	},

	onInitDrag: function () {
		this.headerCt.dragging = true;
		this.callParent(arguments);
	},

	onDragDrop: function () {
		this.headerCt.dragging = false;
		this.callParent(arguments);
	},

	afterRepair: function () {
		this.callParent();
		this.headerCt.dragging = false;
	},

	getRepairXY: function () {
		return this.dragData.repairXY;
	},

	disable: function () {
		this.disabled = true;
	},

	enable: function () {
		this.disabled = false;
	}
});
