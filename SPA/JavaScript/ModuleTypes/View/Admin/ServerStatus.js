Ext.define('ExtModules.View.Admin.ServerStatus', {
	extend: 'Ext.panel.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule'
	},

	cls: 'x-plain',
	data: {},
	autoScroll: true,
	
	config: {
		dataProvider: null,
	},

	tpl: new Ext.XTemplate(
		'<span class="x-panel-body-default x-ux-grid-printer eventExpRow">',
			'<table class="x-grid-table">',
				'<tr>',
					'<th colspan=2 style="text-align: center; padding: 10px;" class="x-grid-header-ct">Server Info</th>',
				'</tr>',
				'<tr class="x-grid-row x-grid-row-alt x-grid-data-row">',
					'<th class="x-grid-header-ct" style="width: 100px !important;">Host name</th>',
					'<td class="x-grid-cell x-grid-td">{hostName}</td>',
				'</tr>',
				'<tr class="x-grid-row x-grid-row-alt x-grid-data-row">',
					'<th class="x-grid-header-ct" style="width: 100px !important;">Uptime</th>',
					'<td class="x-grid-cell x-grid-td">{processUptime}</td>',
				'</tr>',
				'<tr class="x-grid-row x-grid-row-alt x-grid-data-row">',
					'<th class="x-grid-header-ct" style="width: 100px !important;">Memory Usage</th>',
					'<td class="x-grid-cell x-grid-td">{memoryUsage.heapUsed}</td>',
				'</tr>',
				'<tr>',
					//'<th valign="top" class="x-grid-header-ct" style="width: 100px !important;">Available data providers</th>',
					'<td colspan="2" class="x-grid-row x-grid-row-alt x-grid-data-row">',
						'<table class="x-grid-table">',
							'<tr>',
								'<td valign="top">',
									'<table class="x-grid-table">',
										'<tr>',
											'<th class="x-grid-header-ct">Data Providers</th>',
										'</tr>',
										'<tpl for="modules">',
											'<tr>',
												'<td class="x-grid-cell x-grid-td">{moduleId}</td>',
												'</tr>',
											'</tpl>',
										'</table>',
									'</td>',
									'<td valign="top">',
										'<table class="x-grid-table">',
											'<tr>',
												'<th class="x-grid-header-ct">Cache List</th>',
											'</tr>',
											'<tpl for="cluster.cacheCollectionsSynced">',
												'<tr>',
													'<td class="x-grid-row x-grid-row-alt x-grid-data-row">{.}</td>',
												'</tr>',
											'</tpl>',
										'</table>',
									'</td>',
								'</tr>',
							'</table>',
					'</td>',
				'</tr>',
				'<tr>',
					'<th colspan=2 style="text-align: center; padding: 10px;" class="x-grid-header-ct">Cluster Nodes Info</th>',
				'</tr>',
				'<tpl for="cluster.connections">',
					'<tr>',
						'<th  valign="top" class="x-grid-header-ct" style="width: 100px !important;">{id}</th>',
						'<td>',
							'<table class="x-grid-table">',
								'<tr>',
									'<td valign="top">',
										'<table class="x-grid-table">',
											'<tr>',
												'<th class="x-grid-header-ct">Data Providers</th>',
											'</tr>',
											'<tpl for="modules">',
												'<tr>',
													'<td class="x-grid-cell x-grid-td">{moduleId}</td>',
													'</tr>',
												'</tpl>',
											'</table>',
										'</td>',
										'<td valign="top">',
											'<table class="x-grid-table">',
												'<tr>',
													'<th class="x-grid-header-ct">Cache List</th>',
												'</tr>',
												'<tpl for="cacheList">',
													'<tr>',
														'<td class="x-grid-row x-grid-row-alt x-grid-data-row">{.}</td>',
													'</tr>',
												'</tpl>',
											'</table>',
										'</td>',
									'</tr>',
								'</table>',
							'</td>',
						'</tr>',
					'</tpl>',
				'</table>',
			'</span>'
		),

	constructor: function (config) {
		var self = this;

		this.mixins.dashboardModule.constructor.call(this, config, arguments);
		var control = this.getControl();
		this.callParentConstructor.apply(this, arguments);

		control.on("change:status", function () {
			switch (control.get("status")) {
				case "started":
					//self.subscribe();
					break;
				case "stopped":
					//self.unsubscribeWebSocket();
					break;
				case "hidden":
					//self.unsubscribeWebSocket();
					break;
				case "destroyed":
					self.unsubscribe();
			}
		}, self);
		this.subscribe();
	},

	subscribe: function () {
		var self = this;
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		this.setLoading(true);
		this.refreshTimeout = null;

		if (!this.getDataProvider()) {
			this.setDataProvider(this.setUpDataProvider({
				dataProviderId: moduleConfig.dataProviderId ? moduleConfig.dataProviderId : "ServerManager",
				parameters: {
					command: "GetStatus"
				},
				messageReceived: this.messageReceived,
				errorReceived: this.errorReceived
			}));
		}
		else {
			this.getDataProvider().subscription.trigger('resubscribe');
		}
	},

	messageReceived: function (message) {
		var self = this;
		var controlConfig = this.getControlConfig();
		var filters = controlConfig.get('filters').clone();
		if (message.data.cluster) {
			_.each(message.data.cluster.connections, function (item) {
				if (!Array.isArray(item.modules))
					item.modules = Object.keys(item.modules);
			});
		}
		self.update(message.data);
	},

	errorReceived: function (message) {
		var self = this;
		this.setLoading('Server error: ' + (message.error.code || message.error.message));
		setTimeout(function () { self.setLoading(false); }, 5000);
	},

	unsubscribe: function () {
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		control.off(null, null, this);
		controlConfig.off(null, null, this);
		app.nameResolver.off(null, null, this);
		this.getDataProvider().Unsubscribe();
		this.setDataProvider(null);
	},
});