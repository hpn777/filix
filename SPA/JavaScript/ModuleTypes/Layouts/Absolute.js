Ext.define('ExtModules.Layouts.Absolute', {
	alias: 'ExtModules.plugin.absoluteplugin',

	init: function (config, arguments) {
		var self = this;
		var appConfig = app.get('appConfig');
		var control = this.getControl();
		var controlConfig = control.get('controlConfig');
		var selectedTab = app.get('selectedTab');

		this.draggable = {
			maxX: 1000,
			containerScroll: false,
			clearConstraints: function () {
				this.constrainX = false;
				this.constrainY = false;
			},
			alignElWithMouse: function (el, iPageX, iPageY) {
				var oCoord = this.getTargetCoord(iPageX, iPageY),
					fly = el.dom ? el : Ext.fly(el, '_dd'),
					elSize = fly.getSize(),
					EL = Ext.Element,
					vpSize,
					aCoord,
					newLeft,
					newTop;

				if (!this.deltaSetXY) {
					vpSize = this.cachedViewportSize = { width: EL.getDocumentWidth(), height: EL.getDocumentHeight() };
					aCoord = [
						Math.max(0, Math.min(oCoord.x, vpSize.width + 5000 - elSize.width)),
						Math.max(0, Math.min(oCoord.y, vpSize.height + 5000 - elSize.height))
					];
					fly.setXY(aCoord);
					newLeft = this.getLocalX(fly);
					newTop = fly.getLocalY();
					this.deltaSetXY = [newLeft - oCoord.x, newTop - oCoord.y];
				} else {
					vpSize = this.cachedViewportSize;
					this.setLocalXY(
						fly,
						Math.max(0, Math.min(oCoord.x + this.deltaSetXY[0], vpSize.width + 5000 - elSize.width)),
						Math.max(0, Math.min(oCoord.y + this.deltaSetXY[1], vpSize.height + 5000 - elSize.height))
					);
				}

				this.cachePosition(oCoord.x, oCoord.y);
				this.autoScroll(oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);

				//window position broadcasting
				var orgX = this.panel.x;
				var orgY = this.panel.y;
				var relativePosX = this.lastPageX - this.startPageX + orgX;
				var relativePosY = this.lastPageY - this.startPageY + orgY;
				
				controlConfig.set({ x: relativePosX, y: relativePosY }, { silent: true });
				controlConfig.encodeConfig()
				control.save()
				//--------------------

				return oCoord;
			}
		};//need to use function to set draggable otherwise it was override
		this.draggable.xTicks = this.draggable.yTicks = config.gridPattern;
		this.draggable.locked = config.locked;
	},

	resizable: {
		handles: 's e se',
		widthIncrement: 10,
		heightIncrement: 10,
	}
});