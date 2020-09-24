Ext.define('ExtModules.plugins.DropZone', {
	extend: 'Ext.dd.DropZone',
	colHeaderCls: 'thumb-wrap',
	proxyOffsets: [-4, -9],

	constructor: function (config) {

		this.headerCt = config.view;
		this.ddGroup = config.ddGroup;
		this.itemDrop = config.itemDrop;
		this.headerDrop = config.headerDrop;

		this.callParent([config.view.el]);
	},

	getTargetFromEvent: function (e) {
		return e.getTarget('.' + this.colHeaderCls);
	},

	getTopIndicator: function () {
		if (!this.topIndicator) {
			this.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
				cls: "col-move-top",
				html: "&#160;"
			}, true);
		}
		return this.topIndicator;
	},

	getBottomIndicator: function () {
		if (!this.bottomIndicator) {
			this.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
				cls: "col-move-bottom",
				html: "&#160;"
			}, true);
		}
		return this.bottomIndicator;
	},

	getLocation: function (e, t) {
		var x = e.getXY()[0],
            region = Ext.fly(t).getRegion(),
            pos, header;

		if ((region.right - x) <= (region.right - region.left) / 2) {
			pos = "after";
		} else {
			pos = "before";
		}
		return {
			pos: pos,
			header: Ext.getCmp(t.id),
			node: t
		};
	},

	positionIndicator: function (draggedHeader, node, e) {
		var location = this.getLocation(e, node),
            header = location.header,
            pos = location.pos,
            region, topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX,
            allDropZones, ln, i, dropZone;

		this.lastLocation = location;

		allDropZones = Ext.dd.DragDropManager.getRelated(this);
		ln = allDropZones.length;
		i = 0;

		for (; i < ln; i++) {
			dropZone = allDropZones[i];
			if (dropZone !== this && dropZone.invalidateDrop) {
				dropZone.invalidateDrop();
			}
		}


		this.valid = true;
		topIndicator = this.getTopIndicator();
		bottomIndicator = this.getBottomIndicator();
		if (pos === 'before') {
			topAnchor = 'tl';
			bottomAnchor = 'bl';
		} else {
			topAnchor = 'tr';
			bottomAnchor = 'br';
		}
		topXY = this.el.getAnchorXY(topAnchor);
		bottomXY = this.el.getAnchorXY(bottomAnchor);

		// constrain the indicators to the viewable section
		headerCtEl = Ext.get(node);
		minX = headerCtEl.getLeft();
		maxX = headerCtEl.getRight();

		topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
		bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

		topXY[0] -= 4;
		topXY[1] -= 9;
		bottomXY[0] -= 4;

		// position and show indicators
		topIndicator.setXY(topXY);
		bottomIndicator.setXY(bottomXY);
		topIndicator.show();
		bottomIndicator.show();
	},

	invalidateDrop: function () {
		this.valid = false;
		this.hideIndicators();
	},

	onNodeOver: function (node, dragZone, e, data) {
		//console.log(node, dragZone, e, data);
		var me = this,
            header = me.headerCt,
            doPosition = true,
            from = data.header,
            to;

		doPosition = true; //(from.ownerCt === to.ownerCt) || (!from.ownerCt.sealed && !to.ownerCt.sealed);
		//		}

		if (doPosition) {
			me.positionIndicator(data.header, node, e);
		} else {
			me.valid = false;
		}
		return me.valid ? me.dropAllowed : me.dropNotAllowed;
	},

	hideIndicators: function () {
		this.getTopIndicator().hide();
		this.getBottomIndicator().hide();
	},

	onNodeOut: function () {
		this.hideIndicators();
	},

	onNodeDrop: function (node, dragZone, e, data) {
		var location = this.getLocation(e, node).pos;
		if (data.itemData) {
			//add collback
			if (this.itemDrop)
				this.itemDrop(node, dragZone, e, data, location);
		}
		else if (data.header) {
			//add collback
			if (this.headerDrop)
				this.headerDrop(node, dragZone, e, data, location);
		}
	}
});
