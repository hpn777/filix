
Ext.define('Ext.ux.ComponentSnapDragger', {
	extend: 'Ext.dd.DragTracker',

	autoStart: 500,

	constructor: function (comp, config) {
		this.comp = comp;
		this.initialConstrainTo = config.constrainTo;
		this.callParent([config]);
	},

	calculateConstrainRegion: function() {
        var me = this,
            comp = me.comp,
            c = me.initialConstrainTo,
            delegateRegion,
            elRegion,
            shadowSize = comp.el.shadow ? comp.el.shadow.offset : 0;

        // The configured constrainTo might be a Region or an element
        if (!(c instanceof Ext.util.Region)) {
            c =  Ext.fly(c).getViewRegion();
        }

        // Reduce the constrain region to allow for shadow
        if (shadowSize) {
            c.adjust(0, -shadowSize, -shadowSize, shadowSize);
        }

        // If they only want to constrain the *delegate* to within the constrain region,
        // adjust the region to be larger based on the insets of the delegate from the outer
        // edges of the Component.
        if (!me.constrainDelegate) {
            delegateRegion = Ext.fly(me.dragTarget).getRegion();
            elRegion = me.proxy ? me.proxy.el.getRegion() : comp.el.getRegion();

            c.adjust(
                delegateRegion.top - elRegion.top,
                delegateRegion.right - elRegion.right,
                delegateRegion.bottom - elRegion.bottom,
                delegateRegion.left - elRegion.left
            );
        }
        return c;
    },

	onStart: function (x, y) {
		var me = this,
            comp = me.comp;

		// Cache the start [X, Y] array
		this.startPosition = comp.getPosition();

		// If client Component has a ghost method to show a lightweight version of itself
		// then use that as a drag proxy unless configured to liveDrag.
		if (comp.ghost && !comp.liveDrag) {
			me.proxy = comp.ghost();
			me.dragTarget = me.proxy.header.el;
		}

		// Set the constrainTo Region before we start dragging.
		if (me.constrain || me.constrainDelegate) {
			me.constrainTo = me.calculateConstrainRegion();
		}
		//--------------
//		Ext.ux.WindowSnap.DD.superclass.startDrag.call(this, x, y);
//		if (Ext.ux.WindowSnap.dragSnap)
//			this._getSnapData();
	},

	onEnd: function (e) {
		if (this.proxy && !this.comp.liveDrag) {
            this.comp.unghost();
        }
		//--------------
		Ext.ux.WindowSnap.DD.superclass.endDrag.apply(this, arguments);
		if (Ext.ux.WindowSnap.dropSnap) {
			this._getSnapData();
			if (this._halfmaxed) {
				var box = this._halfmaxed.getBox();
				this._halfmaxed.hide();
				this._halfmaxed.remove();
				delete this._halfmaxed;
				this.win._prevPosition = this.win.getBox();
				this.win.setPagePosition(box.x, box.y);
				this.win.setSize(box.width, box.height);
			} else {
				var pos = this.win.getPosition();
				this.setSnapXY(this.win.el, pos[0], pos[1], undefined, undefined, true);
			}
		}
		this.snapDD = [];
		delete this._box;
		delete this._halfmaxed;
	},

	onDrag: function (e) {
		var me = this,
			comp = (me.proxy && !me.comp.liveDrag) ? me.proxy : me.comp,
			offset = me.getOffset(me.constrain || me.constrainDelegate ? 'dragTarget' : null);
	//---------------
//        comp.setPosition(me.startPosition[0] + offset[0], me.startPosition[1] + offset[1]);
//		if (!this._box)
//			this._getViewArea();
//		var iPageX = e.getPageX(), iPageY = e.getPageY();
//		var oCoord = this.getTargetCoord(iPageX, iPageY);
//		var fly = this.proxy.dom ? this.proxy : Ext.fly(this.proxy, '_dd');
//		var useXLeft = iPageX, useXRight = iPageX;
//		var x = null, y = null, width = null, height = null;
//		if (!this.deltaSetXY) {
//			fly.setXY([oCoord.x, oCoord.y]);
//			var newLeft = fly.getLeft(true); // css pos
//			var newTop = fly.getTop(true);  // css pos
//			this.deltaSetXY = [newLeft - oCoord.x, newTop - oCoord.y];
//		} else {
//			// left edge
//			if (useXLeft < 1 || (useXLeft < 1 && iPageY <= 0)) {
//				if (!this._halfmaxed) {
//					var ghost = this.win.createGhost();
//					ghost.setLocation(0, this._box.y);
//					var half = this._box.right / 2;
//					if (iPageY <= 0) {
//						ghost._type = 'tl';
//						ghost.setSize(half, this._box.bottom / 2);
//					} else {
//						ghost._type = 'l';
//						ghost.setSize(half, this._box.bottom - this._box.y);
//					}
//					this._halfmaxed = ghost;
//					animate = true;
//				}
//			//right edge
//			if (useXRight + 1 >= this._box.right) {
//				if (!this._halfmaxed) {
//					var ghost = this.win.createGhost();
//					ghost.setLocation(this._box.right / 2, this._box.y);
//					this._halfmaxed = ghost;
//					if (iPageY <= 0) {
//						ghost._type = 'tr';
//						ghost.setSize(half, this._box.bottom / 2);
//					} else {
//						ghost._type = 'r';
//						ghost.setSize(half, this._box.bottom - this._box.y);
//					}
//				}
//				var s = this._halfmaxed.getSize();
//				var halfh = this._box.right / 2;
//				halfv = this._box.bottom / 2;
//				if (iPageY <= 0 && s[1] != halfv) {
//					this._halfmaxed.setSize(halfh, halfv);
//				} else if (s[1] != this._box.bottom - this._box.y) {
//					this._halfmaxed.setSize(halfh, this._box.bottom - this._box.y);
//				}
//			}
//			if (this._halfmaxed && useXLeft > 10 && this._box.right - useXRight > 10) {
//				if (this._halfmaxed) {
//					this._halfmaxed.hide();
//					this._halfmaxed.remove();
//					delete this._halfmaxed;
//				}
//			}
//			if (x === null)
//				x = oCoord.x + this.deltaSetXY[0];
//			if (y === null)
//				y = oCoord.y + this.deltaSetXY[1];

//			if (Ext.ux.WindowSnap.dragSnap) {
//				this.setSnapXY(fly, x, y, width, height);
//			} else {
//				if (width !== null) {
//					fly.setBounds(x, y, width, height);
//				} else {
//					fly.setLeftTop(x, y);
//				}
//			}
//		}

//		//this.cachePosition( oCoord.x, oCoord.y );
//		this.cachePosition(x, y);
//		this.autoScroll(x, y, fly.dom.offsetHeight, fly.dom.offsetWidth);
//		return oCoord;
	},

	setSnapXY: function (fly, x, y, width, height, drop) {
		var ox = x, oy = y;
		var lx = [], ly = [];
		var box = this.win.getBox();
		var range = Ext.ux.WindowSnap.snapRange;
		// check the edges of the window's parent
		// right and left
		if (Math.abs(x - this._box.x) < range)
			lx.push(this._box.x);
		else if (Math.abs((x + box.width) - this._box.right) < range)
			lx.push(this._box.right - box.width);
		// top and bottom
		if (Math.abs(y - this._box.y) < range)
			ly.push(this._box.y);
		else if (Math.abs((y + box.height) - this._box.bottom) < range)
			ly.push(this._box.bottom - box.height);

		// now check all visible windows
		for (var i = 0, len = this.snapDD.length; i < len; i++) {

			var nx = undefined;
			if (Math.abs(x - (this.snapDD[i].x + this.snapDD[i].width)) < range) {
				// check the left edge of the current window Y against the right edge of window X
				nx = this.snapDD[i].x + this.snapDD[i].width;
			} else if (Math.abs((x + box.width) - this.snapDD[i].x) < range) {
				// check the right edge of the current window Y against the left edge of window x
				nx = this.snapDD[i].x - box.width;
			}
			// verify if the window is touching
			if (nx !== undefined
                && (y >= this.snapDD[i].y && y <= (this.snapDD[i].y + this.snapDD[i].height)
                || (y + box.height >= this.snapDD[i].y
                && y + box.height <= (this.snapDD[i].y + this.snapDD[i].height)))) {
				// if this move would force the window off the left side of the screen, the avoid it
				if (nx < 0)
					continue;
				lx.push(nx);
				continue;
			}

			var ny = undefined;
			if (Math.abs(y - (this.snapDD[i].y + this.snapDD[i].height)) < range) {
				// check the top edge of the current window Y against the bottom edge of window X
				ny = this.snapDD[i].y + this.snapDD[i].height;
			} else if (Math.abs((y + box.height) - this.snapDD[i].y) < range) {
				// check the bottom edge of window Y with the top of window X
				ny = this.snapDD[i].y - box.height;
			}
			if (ny !== undefined
                && (x >= this.snapDD[i].x && x <= (this.snapDD[i].x + this.snapDD[i].width)
                || (x + box.width >= this.snapDD[i].x
                && x + box.width <= (this.snapDD[i].x + this.snapDD[i].width)))) {
				// if this move would force the title off the screen, the avoid it
				if (ny < 0)
					continue;
				ly.push(ny);
				continue;
			}
		}

		// nearest item sort.  if x is 63, and the list is [ 600, 75, 0, 300 ], then 75 will be first
		if (lx.length) {
			lx = lx.sort(function (a, b) {
				return Math.abs(a - x) < Math.abs(b - x) ? -1 : Math.abs(a - x) > Math.abs(b - y) ? 1 : 0
			});
			x = lx[0];
		}
		// same as x
		if (ly.length) {
			ly = ly.sort(function (a, b) {
				return Math.abs(a - y) < Math.abs(b - y) ? -1 : Math.abs(a - y) > Math.abs(b - y) ? 1 : 0
			});
			y = ly[0];
		}

		// slide the window to the edge or just snap it
		if ((x != ox || y != oy) && drop && Ext.ux.WindowSnap.animateDropSnap) {
			this.win.el.disableShadow();
			fly.shift({
				x: x,
				y: y,
				easing: 'bounceOut',
				duration: .3,
				callback: function () {
					this.win.setPagePosition(x, y);
					this.win.setActive(true);
					if (!this.win.maximized)
						this.win.el.enableShadow(true);
				},
				scope: this
			});
		} else
			fly.setXY([x, y]);
	},

	_getViewArea: function () {
		// get the window's parent container
		var el = Ext.fly(this.win.el.parent());
		this._box = el.getBox();
		this._box.right = this._box.x + this._box.width;
	},

	_getSnapData: function () {
		if (!this._box)
			this._getViewArea();
		var snapDD = this.snapDD = [];
		var win = this.win;
		win.manager.each(function (w) {
			if (!w || !w.isVisible() || win === w)
				return;
			snapDD.push(w.getBox());
			/*
			var box = w.getBox();
			box.id = w.id;
			box.a = w._lastAccess;
			snapDD.push( box );
			*/
		});
		/* XXX sort by lastAccess (or zIndex)?
		this.snapDD = this.snapDD.sort(function(a,b) {
		return b.a < a.a ? -1 : ( ( b.a > a.a ) ? 1 : 0 );
		});
		*/
	}

});