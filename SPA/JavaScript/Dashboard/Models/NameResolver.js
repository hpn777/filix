define("Models/NameResolver", [], function () {
	class NameResolver extends EventHorizon {
		constructor(model, options) {
			super(options)

			this.subscruptionInProgress = {};
			this.subscriptions = new Backbone.Collection();
			
			if (options) {
				this.dataProviderId = options.dataProviderId
			}

			if (app.get('authenticated')) {
				this.createCustomSubscription('users', 'Membership', 'GetAllUsers');
				this.createCustomSubscription('roles', 'Membership', 'GetAllRoles');
			}

			app.on('change:authenticated', () => {
				if (app.get('authenticated')) {
					this.createCustomSubscription('users', 'Membership', 'GetAllUsers');
					this.createCustomSubscription('roles', 'Membership', 'GetAllRoles');
				}
			});

			this.remoteSubscriptions$ = new Rx.Subject();
			this.remoteSubscriptions$.bufferWithTime(500)
				.where(function (x) { return x.length })
				.subscribe( x => {
					Enumerable.from(x)
						.groupBy( x => x.childrenTable )
						.forEach( x => {
							var selectedRows = x.getSource();
							var childrenTable = x.key();
							if (selectedRows.length) {
								var fieldName = selectedRows[0].valueField
								var dataProviderId = selectedRows[0].dataProviderId

								var filter = [{
									field: fieldName,
									type: 'list',
									comparison: 'in',
									value: Enumerable.from(selectedRows).select(x => x.value).distinct().toArray()
								}]
								
								this.doRequest({
									dataProviderId: dataProviderId,
									tableName: childrenTable,
									filter: filter
								})
							}
						})
				})
		}

		doRequest(request) {
			request.dataProviderId = request.dataProviderId || this.dataProviderId
			request.command = request.requestName || 'GetData'
			var subscriptionName = request.dataProviderId + '.' + request.tableName
			var dataProvider = this.subscriptions.get( subscriptionName )
			
			if (dataProvider)
				return this.streamHandler(dataProvider.DoRequest(request), request);
			else {
				dataProvider = this.createSubscription(request.tableName, request.dataProviderId)
				return this.streamHandler(dataProvider.DoRequest(request), request);
			}
		}

		doSubscribe(request) {
			var self = this;
			request.dataProviderId = request.dataProviderId || this.dataProviderId
			request.command = request.requestName || 'GetData'
			var subscriptionName = request.dataProviderId + '.' + request.tableName
			var dataProvider = this.subscriptions.find(function(x){ return x.containerId === subscriptionName })
			
			if (!dataProvider)
				dataProvider = this.createSubscription(request.tableName, request.dataProviderId)

			return this.streamHandler(dataProvider.DoSubscribe(request), request)
		}

		streamHandler(subscription, request) {
			var self = this;
			var stream$ = subscription.$;
			var tableName = request.tableName;

			stream$
				.filter( message => message.data.type === 'reset'  && !request.remote )
				.subscribe(function (message) {
					var tempData = message.data.data;
					var header = message.data.header;
					var tesseractTemp = self.get(tableName)
					if (!tesseractTemp) {
						tesseractTemp = self.createTesseract(tableName, {
							columns: header
						});
					}

					tesseractTemp.update(tempData)

					self.subscruptionInProgress[request.tableName] = false
				},
				function (err) { console.log(err) })

			stream$
				.filter(function (message) { return message.data.type === 'update' && !request.remote })
				.subscribe(function (message) {
					if (message && message.success && message.data && message.data.data){
						var tesseractTemp = self.get(tableName)
						var tempData = message.data.data;
						tesseractTemp.update(tempData)
					}
				})
			
			return stream$
		}

		resolve(config, data) {//resolve({dataProviderId: 'dataProviderId',childrenTable: 'client', valueField: 'id', value: 1})
			var self = this;
			config.requestName = config.requestName || 'GetData'
			var tesseract = self.get(config.childrenTable)
			if (tesseract) {
				var tempRecord = super.resolve.call(this, config, data)
				
				if (tempRecord !== config.value) {
					return tempRecord
				}
				else if (config.remote) {
					this.remoteSubscriptions$.onNext(config);
				}
			} else if (!this.subscruptionInProgress[config.childrenTable]) {
				if (config.remote) {
					this.remoteSubscriptions$.onNext(config);
				}
				else {
					config.cacheRequest = true
					this.subscruptionInProgress[config.childrenTable] = true
					self.doSubscribe(config)
				}
			}
			return config.value
		}

		quickResolve(tableName, valueField, value, displayfield, dataProviderId, requestName) {
			return app.nameResolver.resolve({ tableName: tableName, valueField: valueField, value: value, dataProviderId: dataProviderId, requestName: requestName })[displayfield] || value;
		}

		getList(tableName, dataProviderId, requestName) {
			requestName = requestName || 'GetData'

			var tesseract = this.get(tableName)

			if (tesseract) {
				return tesseract.dataCache
			}
			else if(!this.subscruptionInProgress[tableName]){
				this.subscruptionInProgress[tableName] = true;
				this.doSubscribe({
					dataProviderId: dataProviderId,
					tableName: tableName,
					command: requestName,
					cacheRequest: true
				})
			}
		}

		getTesseract(tableName, dataProviderId, requestName) {
			requestName = requestName || 'GetData'

			var tesseract = this.get(tableName)

			if (tesseract) {
				return tesseract
			}
			else if(!this.subscruptionInProgress[tableName]){
				this.subscruptionInProgress[tableName] = true;
				this.doSubscribe({
					dataProviderId: dataProviderId,
					tableName: tableName,
					command: requestName,
					cacheRequest: true
				})
			}
		}

		createSubscription (tableName, dataProviderId, requestName) {
			var containerId = dataProviderId + '.' + tableName

			var subscription = new app.Subscription({
				id: containerId,
				subscriptionId: tessioUtils.guid(),
				containerId: containerId,
				dataProviderId: dataProviderId,
				parameters: {
					command: requestName
				}
			})

			this.subscriptions.add(subscription);

			return subscription
		}

		createCustomSubscription (tableName, dataProviderId, subscriptionMessage) {
			var self = this;
			var subscriptionId = tessioUtils.guid();

			var subscription = new app.Subscription({
				id: subscriptionId,
				subscriptionId: subscriptionId,
				containerId: subscriptionId,
				dataProviderId: dataProviderId
			})

			this.subscruptionInProgress[tableName] = true;
			subscription.DoSubscribe({
				command: subscriptionMessage
			}).$.subscribe((message) => {
				var tempData = message.data[tableName];
				var header = message.header;

				if (!header) {
					header = []
					_.each(Object.keys(tempData[0]), function (attr) {
						var columnDefinition = {};
						columnDefinition.columnName = attr;
						columnDefinition.columnType = 'string';
						columnDefinition.columnTitle = attr;
						header.push(columnDefinition);
					});
				}
				var tesseractTemp = self.get(tableName)
				if (!tesseractTemp) {
					tesseractTemp = self.createTesseract(tableName, {
						columns: header
					});
				}

				tesseractTemp.update(tempData)
				delete self.subscruptionInProgress[tableName];
			})
		}

		guid() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
	}

	return NameResolver
})