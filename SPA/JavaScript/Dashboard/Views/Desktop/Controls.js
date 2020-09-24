define("Views/Desktop/Controls", [
], function () {

	var DesktopControls = Backbone.Model.extend({
		defaults: function () {
			return {
				app: null,
				main: null
			};
		},

		initialize: function () {
			var self = this;
			var app = this.get("app");
			var main = this.get("main");
			
			app.on("change:selectedTab", function () {
				//var tab = app.get("selectedTab");
			});

			app.get("tabs").on("change:status:controls", function (control) {
				var tab = control.get('tab');
				var status = control.get("status");
				switch (status) {
					case "started":
						var controlElement = Ext.getCmp(control.get('id'));
						if (!controlElement) {
							var selectedTab = main.get('desktopTabs').getTab(tab.get('id'));
							if (selectedTab)
								self.createControlElement(control, selectedTab, function (panel) { });
						}
						break;
					case "stopped":

						break;
					case "hidden":

						break;
					case "destroyed":
						self.removeControlElement(control);
						break;
				}
			});

			app.get("tabs").on("change:x:controls change:y:controls", function (controlConfig) {
				var controlElement = self.getControl(controlConfig.get('control'));
				if (controlElement)
					if (controlElement.x != controlConfig.get('x') || controlElement.y != controlConfig.get('y')) {
						controlElement.suspendEvent('move');
						controlElement.setPosition(controlConfig.get('x'), controlConfig.get('y'));//, { callback: function () { controlElement.resumeEvent('move'); } });
						controlElement.resumeEvent('move');
					}
			});

			app.get("tabs").on("change:width:controls change:height:controls", function (controlConfig) {
				var controlElement = self.getControl(controlConfig.get('control'));
				if (controlElement)
					if (controlElement.width != controlConfig.get('width') || controlElement.height != controlConfig.get('height')) {
						controlElement.suspendEvent('resize');
						controlElement.setSize(controlConfig.get('width'), controlConfig.get('height'));
						controlElement.resumeEvent('resize');
					}
			});

			app.get("tabs").on("change:isLocked:controls", function (controlConfig) {
				var controlElement = self.getControl(controlConfig.get('control'));
				if (controlElement.dd) {
					controlElement.dd.locked = controlConfig.get('isLocked');
					controlElement.setIcon(controlConfig.get('isLocked') ? app.get('resourceStrings').get('lockedIcon').get('value') : undefined);
				}
			});

			app.get("tabs").on("change:zIndex:controls", function (controlConfig) {
				var controlElement = self.getControl(controlConfig.get('control'));
				if (controlElement)
					controlElement.getEl().setStyle('z-index', controlConfig.get('zIndex'));
			});

			$(document).bind('msvisibilitychange', function () {
				self.visibilityChange();
			});
			$(document).bind('webkitvisibilitychange', function () {
				self.visibilityChange();
			});
		},

		getControl: function (control) {
			return Ext.getCmp(control.get('id'));
		},

		createControlElement: function (control, selectedPanel, callback) {
			var self = this;
			var app = this.get("app");
			var tabConfig = control.get('tab').get('tabConfig');
			var module = control.get('module');
			var moduleClassName = control.get("moduleClassName")

			if (module) {
				moduleClassName = module.get("moduleClassName")
			}
			else {
				control.remove()
				return false
			}

			var moduleConfig = JSONfn.parse(module.get('config'))
			var requiredClasses = [
				'Ext.container.Container',
				'Ext.layout.Context',
				'Ext.FocusManager',
				'ExtModules.View.' + moduleClassName,
			]
			try {
				Ext.syncRequire(requiredClasses.concat(moduleConfig.mixins), function () {
					
					if (Ext.isEmpty(Ext.ClassManager.get('ExtModules.' + module.get('name')))) {
						Ext.define('ExtModules.' + module.get('name'), {
							extend: 'ExtModules.View.' + moduleClassName,
							mixins: moduleConfig.mixins,
							callParentConstructor: function () {
								this.__proto__.__proto__.superclass.constructor.apply(this, arguments);
							}
						})
					}
					
					var panel = Ext.create('ExtModules.' + module.get('name'), {
						app: app,
						control: control,
						tab: selectedPanel
					});
					if (selectedPanel.items.length && (tabConfig.get('layout').type == 'vbox' || tabConfig.get('layout').type == 'hbox')) {
						selectedPanel.add([{ xtype: 'splitter' }, panel]);
					}
					else if(tabConfig.get('layout').type == 'portal'){
						selectedPanel.addItem(panel);
					}
					else {
						selectedPanel.add(panel);
					}
					if (callback)
						callback(panel);
				});
			}
			catch (ex) {
				Ext.create('Ext.ux.window.Notification', {
					title: 'UI Error',
					position: 'tr',
					manager: 'errors',
					useXAxis: true,
					closable: true,
					slideInDuration: 500,
					slideBackDuration: 1000,
					autoCloseDelay: 10000,
					html: 'Module: "' + control.get("title") + '", using class name: "' + moduleClassName + '", couldn\' be loaded.'
				}).show();
				console.log('UI Error:', ex);
			}
			
		},

		removeControlElement: function (control) {
			var self = this;
			var controlElement = Ext.getCmp(control.get('id'));
			if (controlElement) {
				//controlElement.suspendEvents();
				controlElement.destroy();
			}
			//remove control
		},

		visibilityChange: function () {
			var self = this;
			var app = self.get("app");
			var selectedTab = app.get("selectedTab");
			if (selectedTab != null) {
				if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
					if (document.hidden || document.msHidden || document.webkitHidden) {
						selectedTab.get("controls").each(function (control) {
							control.set("status", "hidden");
						});
					} else {
						selectedTab.get("controls").each(function (control) {
							control.set("status", "started");
						});
					}
				}
			}
		}
    });

    return DesktopControls;
});