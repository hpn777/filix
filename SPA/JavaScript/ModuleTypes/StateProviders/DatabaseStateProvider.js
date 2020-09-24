Ext.define("ExtModules.StateProviders.DatabaseStateProvider", {
	extend: 'Ext.state.Provider',

	config: {
		app: null
	},

	constructor: function () {
		var me = this;
		me.callParent(arguments);
		me.state = Ext.state.LocalStorageProvider.create();
	},

	set: function (guid, state) {
		var me = this;
		var control = this.app.getControl(guid);
		if (control) {
			//console.log('setState', JSON.stringify(state))
			var controlConfig = control.get('controlConfig');
			var newState = JSON.stringify(state)
			if (controlConfig.get("state") != newState) {
				controlConfig.set({ "state": newState });
				control.save()
			}
		}
		else {
			me.clear(guid);
			if (typeof state == "undefined" || state === null) {
				return;
			}
			me.state.set(guid, state);
			me.callParent(arguments);
		}
	},

	clear: function (guid) {
		var control = this.app.getControl(guid);
		if (control) {
			var controlConfig = control.get('controlConfig');
			controlConfig.set({ "state": null });
		}
		else {
			this.state.set(guid, undefined);
			this.callParent(arguments);
		}
	},

	get: function (guid, defaultState) {
		var control = this.app.getControl(guid);
		if (control) {
			var controlConfig = control.get('controlConfig');
			if (controlConfig.get("state")) {
				try {
					//console.log('get', Ext.decode(controlConfig.get("state")));
					return JSON.parse(controlConfig.get("state"));
				}
				catch (ex) { console.log(ex); }
			}
			else
				return defaultState;
		} else {
			return typeof this.state.get(guid) == "undefined" ?
				defaultState : this.state.get(guid);
		}
	}
});