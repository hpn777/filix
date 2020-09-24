define('Subscriber/AppSubscription', [
    'Models/Generics/Model',
	'Subscriber/Subscription',
	'Models/Generics/Collection'
], function (Model, Subscription, Collection) {

	var AppSubscription = Model.extend({

        initialize: function (model, options) {
            var self = this;
            
            var subscriptionId = tessioUtils.guid();
            var appSubscription = new Subscription({
            	id: subscriptionId,
            	subscriptionId: subscriptionId,
            	containerId: tessioUtils.guid(),
            	dataProviderId: 'Dashboard',
            	parameters: { command: 'Ready' }
            });

            appSubscription.message$.subscribe((message) => {
            	if (message.request === "Ready")
            		app.set('authenticated', true);
            })

            app.set('appSubscription', appSubscription)
        },

        getDashboardControls: function (tabId) {
        	app.get("appSubscription").DoSubscribe({ command: 'GetDashboardControls', tabId: tabId }).$.subscribe((x) => {
        		var tab = app.get("tabs").get(tabId);
        		if (tab != null) {
					tab.set("isLoading", false)
					
					var controls = tab.get("controls")
					if(x.data.addedData && x.data.addedData.length !== 0)
						controls.update(x.data.addedData)
					if(x.data.updatedData && x.data.updatedData.length !== 0)
						controls.update(x.data.updatedData)
					if(x.data.removedIds && x.data.removedIds.length !== 0){
						_.each(x.data.removedIds, x => {
							// controls.remove(x.data.removedIds)
        					var tControl = tab.get("controls").get(x)
        					if (tControl) {
								tControl.set('status', 'destroyed')//TODO need to get rid of this abomination
								controls.remove(x)
        					}
						})
						
					}
        		}
        	})
        },

        saveControl: function (control) {
        	app.get("appSubscription").DoRequest({
        		command: 'SaveControl',
        		control: control
        	}).$.subscribe((x) => {

        	})
        },

        removeControl: function (control) {
        	app.get("appSubscription").DoRequest({
        		command: 'RemoveControl',
        		control: control
        	}).$.subscribe((x) => {
				
        	})
        },

        getUserCollection: function () {
        	app.get("appSubscription").DoSubscribe({ command: 'GetAllUsers' }).$.subscribe((x) => {
        		app.get("users").reset(x.data.users)
        	})
        },

        getDashboardTabs: function () {
			app.get("tabs").reset([])
			app.get("appSubscription").DoSubscribe({ command: 'GetDashboardTabs' })
				.$.subscribe((x) => {
					app.get("tabs").update(x.data.addedData || []);
					app.get("tabs").update(x.data.updatedData || []);
					(x.data.removedIds || [])
						.map(x => app.get("tabs").get(x))
						.filter(x => x !== undefined)
						.forEach(x => app.get("tabs").remove(x))

					//app.updateTabs(x.data.tabs)
					app.set('isFullyLoaded', true);
					//if(!app.set("selectedTab"))
					app.selectInitialTab();
				})
        },

        saveDashboardTab: function (tab, controls) {
        	app.get("appSubscription").DoRequest({
        		command: 'SaveDashboardTab',
        		tab: tab,
        		controls: controls
        	}).$.subscribe((x) => {

        	})
        },

        removeDashboardTab: function (tab) {
        	app.get("appSubscription").DoRequest({
        		command: 'RemoveDashboardTab',
        		tab: tab
        	}).$.subscribe((x) => {

        	})
        },

        saveTabOrderAndSelection: function (tabs) {
        	app.get("appSubscription").DoRequest({
        		command: 'SaveTabOrderAndSelection',
        		tabs: tabs
        	}).$.subscribe((x) => {
        		
        	})
        },

        getDashboardModules: function () {
        	app.get("appSubscription").DoSubscribe({ command: 'GetDashboardModules' }).$.subscribe((x) => {	
				var modules = app.get("modules")
				if(x.data.addedData && x.data.addedData.length !== 0)
					modules.add(x.data.addedData)
				if(x.data.updatedData && x.data.updatedData.length !== 0)
					modules.update(x.data.updatedData)
				if(x.data.removedIds && x.data.removedIds.length !== 0)
					modules.remove(x.data.removedIds)
        	})
        },

        getTabPresets: function () {
        	app.get("appSubscription").DoSubscribe({ command: 'GetTabPresets' }).$.subscribe((x) => {
				var tabPresets = app.get("tabPresets")
				if(x.data.presets.addedData && x.data.presets.addedData.length !== 0)
					tabPresets.add(x.data.presets.addedData)
				if(x.data.presets.updatedData && x.data.presets.updatedData.length !== 0)
					tabPresets.update(x.data.presets.updatedData)
				if(x.data.presets.removedIds && x.data.presets.removedIds.length !== 0)
					tabPresets.remove(x.data.presets.removedIds)
        	})
        },

        saveTabPreset: function (tab, controls) {
        	app.get("appSubscription").DoRequest({
        		command: 'SaveTabPreset',
        		tab: tab,
        		controls: controls
        	}).$.subscribe((x) => {

        	})
        },

        getUserConfig: function () {
        	app.get("appSubscription").DoSubscribe({ command: 'GetUserConfig' }).$.subscribe((x) => {
        		if (x.data.config)
        			app.set('config', x.data.config);
        	})
        },

        saveUserConfig: function () {
        	app.get("appSubscription").DoRequest({
        		command: 'SaveUserConfig',
        		userConfig: app.get("config")
        	}).$.subscribe((x) => {
				
        	})
        },

        login: function (parameters) {
        	app.get("appSubscription").login(parameters).subscribe((x) => {
        		var response = x.data
        		app.get('localStorage').set('auth', response.user);
        		app.set('userId', response.user.id);
        		app.set('authToken', response.user.authToken);
        		app.set('userName', response.user.userName);
        		app.set('userDisplayName', response.user.displayName);
        		app.set('userRoles', new Collection(response.user.roles));
        		app.set('userEmail', response.user.email);
        		app.get("appSubscription").Subscribe({ command: "Ready" })
        		app.set('authenticated', true);
        	});
        }
    });

	return AppSubscription;
});
