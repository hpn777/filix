define("Views/Desktop/Main", [
    "Views/Desktop/Tabs",
    "Views/Desktop/Page",
    "Views/Desktop/Controls",
	"Views/Desktop/Modules",
	"Views/Desktop/Dialogs"
], function (DesktopTabs, DesktopPage, DesktopControls, DesktopModules, DesktopDialogs) {

    var DesktopMain = Backbone.Model.extend({

        defaults: function () {
            return {
            	app: null,
            	desktopViewport: null,
            	DesktopPage: null,
                desktopTabs: null,
                desktopControls: null,
                desktopDialogs: null,
				desktopModules: null
            };
        },

        initialize: function () {
            var self = this;
            var app = self.get("app");
            var appConfig = app.get('appConfig');
            Ext.override(Ext.button.Button, {
            	cls: 'x-btn-default-small'
            });
            Ext.state.Manager.setProvider(Ext.create('ExtModules.StateProviders.DatabaseStateProvider', {app: app}));

            var contentWrapper = Ext.create('Ext.panel.Panel', {
            	border: false,
            	//stateful: true,
            	header: false,
            	layout: {
            		type: 'hbox',
            		pack: 'start',
            		align: 'stretch'
            	},
            	items: []
            });

            self.set('desktopViewport', contentWrapper);
            
        	//adding viewport
            var viewPort = Ext.create('Ext.container.Viewport', {
            	layout: 'fit',
            	stateful: true,
				border: false,
            	items: [
					contentWrapper
            	]
            });
        	//--------------------

            this.set("desktopDialogs", new DesktopDialogs({ app: app, main: self }));
			switch (appConfig.get('mode')) {
            	case 'dashboardView':
            	case 'dashboardEdit':
            		this.set("desktopTabs", new DesktopTabs({ app: app, main: self }));
            		
            		break;
            	case 'pageView':
            	case 'pageEdit':
            		this.set("desktopTabs", new DesktopPage({ app: app, main: self }));
            		break;
            }
            this.set("desktopControls", new DesktopControls({ app: app, main: self }));
            this.set("desktopModules", new DesktopModules({ app: app, main: self }));


            appConfig.on('change:mode', function () {
            	if (self.get("desktopTabs").get('tabPanel'))
            		self.get("desktopTabs").get('tabPanel').destroy();
            	self.get("desktopTabs").destroy();
            	switch (appConfig.get('mode')) {
            		case 'dashboardView':
            		case 'dashboardEdit':
            			self.set("desktopTabs", new DesktopTabs({ app: app, main: self }));
            			break;
            		case 'pageView':
            		case 'pageEdit':
            			self.set("desktopTabs", new DesktopPage({ app: app, main: self }));
            			break;
            	}
            	self.get("desktopTabs").reloadData();
            });

            app.on('change:authenticated', function () {
            	if (app.get('authenticated')) {
            		//app.get('tabs').fetch();

            		var loginWindow = Ext.getCmp('loginWindow');
            		if (loginWindow)
            			loginWindow.destroy();
            		switch (appConfig.get('mode')) {
            			case 'dashboardView':
            			case 'dashboardEdit':
            				Ext.getCmp('userNameDisplayField').setText('Hi ' + app.get('userDisplayName'));
            				Ext.getCmp('loginButton').setText('Logout');
            				break;
            			case 'pageView':
            			case 'pageEdit':

            				break;
            		}
            		self.get('desktopViewport').show();
            	}
            	else {
            		self.get('desktopViewport').hide();
            		switch (appConfig.get('mode')) {
            			case 'dashboardView':
            			case 'dashboardEdit':
            				Ext.getCmp('loginButton').setText('Login');
            				Ext.getCmp('userNameDisplayField').setText('');
            				break;
            		}
            		self.get('desktopDialogs').openLogin();
            	}
            });

            app.get("tabs").on("change:isLoading change:selected", function (tab) {
                
            });

            app.on("change:isSaving", function () {
                
            });
            
            if (!app.get('appSubscription').get('isError'))
				viewPort.setLoading(app.get('appName') + ' is loading...');
            else
            	viewPort.setLoading(app.get('appName') + ' is disconnected form the server.');

            app.get('appSubscription').on('change:started', function () {
            	if (app.get('appSubscription').get('started'))
            		viewPort.setLoading(false);
			});
            app.get('appSubscription').on('change:isError', function () {
            	if (app.get('appSubscription').get('isError'))
            		viewPort.setLoading(app.get('appName') + ' has been disconnected form the server.');
            	else
            		viewPort.setLoading(false);
            });
            app.on("change:isFullyLoaded", function () {
                if (app.get("isFullyLoaded")) {
                	viewPort.setLoading(false);
                } else {
                    
                }
            });
            app.set("view", self);
        },

        selectTab: function (tabId) {
        	var app = this.get('app');
        	var tempTab = app.get('tabs').get(tabId);
        	var tabPanel = this.get('desktopTabs').get('tabPanel');
        	var tabView = tabPanel.getComponent(tabId);
        	if (tabView)
        		tabPanel.setActiveTab(tabView);
        	else
        		app.set("selectedTab", tempTab);
        },

        selectTabByType: function (pageType) {
        	var tab = this.get('app').get("tabs").getTabByPageType(pageType);
        	if (tab) {
        		this.selectTab(tab.get('id'));
        		return tab;
        	}
        },
    });

    return DesktopMain;

});
