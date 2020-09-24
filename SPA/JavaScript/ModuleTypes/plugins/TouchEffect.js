//Namespace defined for plugin
Ext.ns('Ext.plugin');

//Plug-in Defination
Ext.plugin.TouchEffect = (function () {
	return {
		init: function (f) {
			//Register and event for Plug-in
			console.log('init')
			f.on('afterRender', this.afterRenderFn, f);
		},

		/**
		 *       Method to handle right swap on component
		 */
		swapRight: function (a, b) {
			b.moveRight();
		},

		/**
		 *       Method to handle right swap on component
		 */
		swapLeft: function (a, b) {
			b.moveLeft();
		},

		/**
		 *       Method to handle right swap on component
		 */
		itemClick: function (a, b) {
			a.tap(b.id);
		},

		/**
		 *       Method That will activate touch actions on component
		 */
		activateTouch: function (element) {
			this.HORIZONTAL = 1;
			this.VERTICAL = 2;
			this.AXIS_THRESHOLD = 30;
			this.GESTURE_DELTA = 60;

			this.direction = this.HORIZONTAL;
			this.element = element;
			this.onswiperight = null;
			this.onswipeleft = null;
			this.onswipeup = null;
			this.onswipedown = null;
			this.onclick = null;
			this.inGesture = false;

			this._originalX = 0
			this._originalY = 0
			var _this = this;
			this._touchStarted = false;
			this._touchMoved = false;

			var mousedown = function (event) {
				event.preventDefault();
				_this.inGesture = true;
				_this._touchStarted = true;
				_this._touchMoved = false;
				_this._originalX = (event.touches) ? event.touches[0].pageX : event.pageX;
				_this._originalY = (event.touches) ? event.touches[0].pageY : event.pageY;
				if (event.touches && event.touches.length != 1) {
					_this.inGesture = false;
				}
			};

			var mouseup = function () {
				event.preventDefault();
				if (_this._touchStarted && !_this._touchMoved) {
					_this.onclick(_this.parent, _this.clickParent);
				}
				_this._touchStarted = false;
				_this._touchMoved = false;
			};

			var mousemove = function (event) {
				event.preventDefault();
				_this._touchMoved = true;
				var delta = 0;
				var currentX = (event.touches) ? event.touches[0].pageX : event.pageX;
				var currentY = (event.touches) ? event.touches[0].pageY : event.pageY;

				if (_this.inGesture) {
					if ((_this.direction == _this.HORIZONTAL)) {
						delta = Math.abs(currentY - _this._originalY);
					} else {
						delta = Math.abs(currentX - _this._originalX);
					}
					if (delta > _this.AXIS_THRESHOLD) {
						_this.inGesture = false;
					}
				}
				if (_this.inGesture) {
					if (_this.direction == _this.HORIZONTAL) {
						delta = Math.abs(currentX - _this._originalX);
						if (currentX > _this._originalX) {
							direction = 0;
						} else {
							direction = 1;
						}
					} else {
						delta = Math.abs(currentY - _this._originalY);
						if (currentY > _this._originalY) {
							direction = 2;
						} else {
							direction = 3;
						}
					}

					if (delta >= _this.GESTURE_DELTA) {
						var handler = null;
						switch (direction) {
							case 0: handler = _this.onswiperight; break;
							case 1: handler = _this.onswipeleft; break;
							case 2: handler = _this.onswipedown; break;
							case 3: handler = _this.onswipeup; break;
						}
						if (handler != null) {
							handler(delta, _this.parent);
						}
						_this.inGesture = false;
					}

				}
			};

			var onclickHandler = function (e) {
				_this.onclick(_this.parent, _this.clickParent);
			};
			this.element.addEventListener('click', onclickHandler, false);
			this.element.addEventListener('touchstart', mousedown, false);
			this.element.addEventListener('touchmove', mousemove, false);
			this.element.addEventListener('touchend', mouseup, false);
			this.element.addEventListener('touchcancel', function () {
				_this.inGesture = false;
			}, false);
		},

		/**
		 *       Event Handler that was registered in "init" method
		 */
		afterRenderFn: function () {
			console.log('afterRenderFn')
			var me = this;
			this.plugins[0].parent = this;
			var swapRgt = this.plugins[0].swapRight;
			var swapLft = this.plugins[0].swapLeft;
			var itemClk = this.plugins[0].itemClick;
			try {
				var swipeHor = new this.plugins[0].activateTouch(me.el.dom);
				swipeHor.direction = swipeHor.HORIZONTAL;
				swipeHor.parent = this;
				swipeHor.clickParent = me;
				swipeHor.onswiperight = swapRgt;
				swipeHor.onswipeleft = swapLft;
				swipeHor.onclick = itemClk;
			} catch (e) {
				console.log(e);
			}
		}
	};
})();