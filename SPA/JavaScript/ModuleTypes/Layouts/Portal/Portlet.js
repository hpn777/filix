Ext.define('ExtModules.Layouts.Portal.Portlet', {
    
	init: function (config, arguments) {
		var self = this;
		this.anchor = '100%';
		this.animCollapse = true;
		this.cls = 'x-portlet';
		this.draggable = {
			moveOnDrag: false
		};
    	this.draggable.locked = config.locked;
    	this.resizable = {
    		handles: 's',
    		widthIncrement: 10,
    		heightIncrement: 10
    	};
	},

    doClose: function() {
        if (!this.closing) {
            this.closing = true;
            this.el.animate({
                opacity: 0,
                callback: function(){
                    var closeAction = this.closeAction;
                    this.closing = false;
                    this.fireEvent('close', this);
                    this[closeAction]();
                    if (closeAction == 'hide') {
                        this.el.setOpacity(1);
                    }
                },
                scope: this
            });
        }
    }
});

Ext.resizer.ResizeTracker.prototype.updateDimensions = function (e, atEnd) {
	var me = this,
        region = me.activeResizeHandle.region,
        offset = me.getOffset(me.constrainTo ? 'dragTarget' : null),
        box = me.startBox,
        ratio,
        widthAdjust = 0,
        heightAdjust = 0,
        snappedWidth,
        snappedHeight,
        adjustX = 0,
        adjustY = 0,
        dragRatio,
        horizDir = offset[0] < 0 ? 'right' : 'left',
        vertDir = offset[1] < 0 ? 'down' : 'up',
        oppositeCorner,
        axis, // 1 = x, 2 = y, 3 = x and y.
        newBox,
        newHeight, newWidth;

	region = me.convertRegionName(region);

	switch (region) {
		case 'south':
			heightAdjust = offset[1];
			axis = 2;
			break;
		case 'north':
			heightAdjust = -offset[1];
			adjustY = -heightAdjust;
			axis = 2;
			break;
		case 'east':
			widthAdjust = offset[0];
			axis = 1;
			break;
		case 'west':
			widthAdjust = -offset[0];
			adjustX = -widthAdjust;
			axis = 1;
			break;
		case 'northeast':
			heightAdjust = -offset[1];
			adjustY = -heightAdjust;
			widthAdjust = offset[0];
			oppositeCorner = [box.x, box.y + box.height];
			axis = 3;
			break;
		case 'southeast':
			heightAdjust = offset[1];
			widthAdjust = offset[0];
			oppositeCorner = [box.x, box.y];
			axis = 3;
			break;
		case 'southwest':
			widthAdjust = -offset[0];
			adjustX = -widthAdjust;
			heightAdjust = offset[1];
			oppositeCorner = [box.x + box.width, box.y];
			axis = 3;
			break;
		case 'northwest':
			heightAdjust = -offset[1];
			adjustY = -heightAdjust;
			widthAdjust = -offset[0];
			adjustX = -widthAdjust;
			oppositeCorner = [box.x + box.width, box.y + box.height];
			axis = 3;
			break;
	}

	newBox = {
		width: box.width + widthAdjust,
		height: box.height + heightAdjust,
		x: box.x + adjustX,
		y: box.y + adjustY
	};

	// Snap value between stops according to configured increments
	snappedWidth = Ext.Number.snap(newBox.width, me.widthIncrement);
	snappedHeight = Ext.Number.snap(newBox.height, me.heightIncrement);
	if (snappedWidth != newBox.width || snappedHeight != newBox.height) {
		switch (region) {
			case 'northeast':
				newBox.y -= snappedHeight - newBox.height;
				break;
			case 'north':
				newBox.y -= snappedHeight - newBox.height;
				break;
			case 'southwest':
				newBox.x -= snappedWidth - newBox.width;
				break;
			case 'west':
				newBox.x -= snappedWidth - newBox.width;
				break;
			case 'northwest':
				newBox.x -= snappedWidth - newBox.width;
				newBox.y -= snappedHeight - newBox.height;
		}
		newBox.width = snappedWidth;
		newBox.height = snappedHeight;
	}

	// out of bounds
	if (newBox.width < me.minWidth || newBox.width > me.maxWidth) {
		newBox.width = Ext.Number.constrain(newBox.width, me.minWidth, me.maxWidth);

		// Re-adjust the X position if we were dragging the west side
		if (adjustX) {
			newBox.x = box.x + (box.width - newBox.width);
		}
	} else {
		me.lastX = newBox.x;
	}
	if (newBox.height < me.minHeight || newBox.height > me.maxHeight) {
		newBox.height = Ext.Number.constrain(newBox.height, me.minHeight, me.maxHeight);

		// Re-adjust the Y position if we were dragging the north side
		if (adjustY) {
			newBox.y = box.y + (box.height - newBox.height);
		}
	} else {
		me.lastY = newBox.y;
	}

	// If this is configured to preserve the aspect ratio, or they are dragging using the shift key
	if (me.preserveRatio || e.shiftKey) {
		ratio = me.startBox.width / me.startBox.height;

		// Calculate aspect ratio constrained values.
		newHeight = Math.min(Math.max(me.minHeight, newBox.width / ratio), me.maxHeight);
		newWidth = Math.min(Math.max(me.minWidth, newBox.height * ratio), me.maxWidth);

		// X axis: width-only change, height must obey
		if (axis == 1) {
			newBox.height = newHeight;
		}

			// Y axis: height-only change, width must obey
		else if (axis == 2) {
			newBox.width = newWidth;
		}

			// Corner drag.
		else {
			// Drag ratio is the ratio of the mouse point from the opposite corner.
			// Basically what edge we are dragging, a horizontal edge or a vertical edge.
			dragRatio = Math.abs(oppositeCorner[0] - this.lastXY[0]) / Math.abs(oppositeCorner[1] - this.lastXY[1]);

			// If drag ratio > aspect ratio then width is dominant and height must obey
			if (dragRatio > ratio) {
				newBox.height = newHeight;
			} else {
				newBox.width = newWidth;
			}

			// Handle dragging start coordinates
			if (region == 'northeast') {
				newBox.y = box.y - (newBox.height - box.height);
			} else if (region == 'northwest') {
				newBox.y = box.y - (newBox.height - box.height);
				newBox.x = box.x - (newBox.width - box.width);
			} else if (region == 'southwest') {
				newBox.x = box.x - (newBox.width - box.width);
			}
		}
	}

	if (heightAdjust === 0) {
		vertDir = 'none';
	}
	if (widthAdjust === 0) {
		horizDir = 'none';
	}
	delete newBox.x;
	delete newBox.y;
	me.resize(newBox, {
		horizontal: horizDir,
		vertical: vertDir
	}, atEnd);
}