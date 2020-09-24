Ext.define('ExtModules.Helpers.API', {
	subscribe: function () {
		var self = this;
		var moduleConfig = this.getModuleConfig();

		var serviceSubscription = moduleConfig.serviceSubscription
		if (!serviceSubscription) {
			serviceSubscription = {
				command: moduleConfig.storeType == 'remote' ? moduleConfig.initialCommand : moduleConfig.serviceCommand,
				query: moduleConfig.query,
				tableName: moduleConfig.tableName
			}
		}

		this.setLoading(true);
		this.messageHederTemp = [];

		if (!this.getDataProvider()) {
			this.setDataProvider(this.setUpDataProvider({
				dataProviderId: moduleConfig.dataProviderId ? moduleConfig.dataProviderId : "ConfigDB",
				parameters: serviceSubscription
			}));
		} else {
			this.getDataProvider().Resubscribe();
		}

		this.getDataProvider().error$.subscribe(function (message) {
			self.setLoading('Server error: ' + (message.error.message || message.error.code));
			setTimeout(function () {
				self.setLoading(false);
			}, 5000);
		});

		if (serviceSubscription.command)
			this.streamHandler(this.getDataProvider().GetSubscription(serviceSubscription.command), serviceSubscription);

		if (moduleConfig.serviceRPC) {
			this.doRequest(moduleConfig.serviceRPC)
		}
	},

	doUnsubscribe: function () {
		this.getDataProvider().DoRequest({
			command: 'Unsubscribe',
			requestId: this.getDataProvider().parameters.requestId
		})
	},

	doRequest: function (request) {
		var self = this;
		var moduleConfig = this.getModuleConfig();

		if (moduleConfig.loadingMask) {
			this.setLoading(true);
			setTimeout(function () {
				self.setLoading(false);
			}, 5000)
		}

		return this.streamHandler(this.getDataProvider().DoRequest(request), request);
	},

	doSubscribe: function (request) {
		var self = this;
		var moduleConfig = this.getModuleConfig();

		if (moduleConfig.loadingMask) {
			this.setLoading(true);
			setTimeout(function () {
				self.setLoading(false);
			}, 5000)
		}

		return this.streamHandler(this.getDataProvider().DoSubscribe(request), request);
	},

	saveAll: function (records) {
		var moduleConfig = this.getModuleConfig()

		this.doRequest({
			command: 'SetData',
			tableName: moduleConfig.tableName,
			data: Enumerable.from(records).select((x) => {
				return x.data
			}).toArray(),
			noRequestCache: true
		})
	},

	streamHandler: function (subscription, request) {
		var stream$ = subscription.$;

		stream$
			.filter(message => {
				return message.data.type === 'reset'
			})
			.subscribe(message => {
				this.setLoading(false)
				if (!message.data.header) {
					this.resetData(message.data, {
						bypassSyncColumns: true
					}, request);
				} else if (Array.isArray(message.data.header) && Enumerable.from(message.data.header).count(x => 
						Enumerable.from(this.messageHederTemp).any(y => y.columnName === x.columnName)
					) === message.data.header.length) {
						this.resetData(message.data, {
							bypassSyncColumns: this.bypassSyncColumns
					}, request);
				} else {
					this.resetData(message.data, request)
					this.messageHederTemp = message.data.header;
				}
				this.bypassSyncColumns = true;
			},
			err => {
				console.log(err)
			})

		var updateStream = stream$
			.filter(message => message.data.type === 'update')

		updateStream.subscribe(message => {
			if (message && message.success && message.data && message.data.data)
				this.updateData(message.data, request);
		})

		return subscription
	}
});