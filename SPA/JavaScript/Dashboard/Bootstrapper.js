
// Setup Require JS
requirejs.config({
	baseUrl: './JavaScript/Dashboard',
	//urlArgs: "bust=" + GitVersion,//(new Date()).getTime(),
    paths: {
    	'View': './View',
    	'Models': './Models',
    	'Views': './Views',
    	'Subscriber': './Subscriber',
    	'ModuleTypes': './View',
    	'ace': '../ThirdParty/aceNew',
    	'ThirdParty': '../ThirdParty'
    },
    waitSeconds: 60
});

// Setup ExtJS
Ext.Loader.setConfig({
	enabled: true,
	//disableCaching: false,
    paths: {
    	'Ext.ux': "./JavaScript/ExtJS/ux",
    	'ExtModules': "./JavaScript/ModuleTypes",
    }
});

// Stop console.log error in internet explorer
if (typeof console === "undefined") {
	console = {
		log: function () {
			return;
		}
	};
}

var app;
$(function () {
    //restart at midnight
    var currentDate = new Date().getDate();
    function tryRestartApp() {
        if (currentDate != new Date().getDate()) {
            // Day changed (reload page)
            window.location.reload();
        } else {
            // Set Timeout
            setTimeout(function () { tryRestartApp(); }, 600000);
        }
    };
    tryRestartApp();

	//Q-tips setup
    Ext.QuickTips.init();
    Ext.apply(Ext.tip.QuickTipManager.getQuickTip(), {
    	maxWidth: 600,
    	minWidth: 100,
    	showDelay: 50,
    	title: '',
    	trackMouse: true
    });

    Ext.require('ExtModules.Layouts.Portal.PortalPanel');

    require([
		"Models/App",
		'Subscriber/AppSubscription',
		'Views/Desktop/Main'
    ], function (App, AppSubscription, ViewType) {

    	// Setup App
    	app = new App({appName: 'Filix'});
    	app.set("sync", new AppSubscription({ app: app }));

    	new ViewType({ app: app })
    });
});