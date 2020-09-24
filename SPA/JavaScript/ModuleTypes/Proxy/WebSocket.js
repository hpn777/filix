Ext.define('ExtModules.Proxy.WebSocket', {
	extend: 'Ext.data.proxy.Server',
	alias: 'proxy.socket',

	url: 'dupa',
	isSynchronous: false,
	socketHUB: null,
	control: null,
	parameters: null,

	constructor: function (config) {
		Ext.merge(this, config);
		this.hubRequests = {};
		this.callParent(arguments);
	},

	doRequest: function (operation, callback, scope) {
		var me = this,
			request = this.buildRequest(operation),
			timeout = Ext.isDefined(request.timeout) ? request.timeout : me.timeout,
			requestId = tessioUtils.guid();

		Ext.apply(request, {
			headers: this.headers,
			timeout: this.timeout,
			scope: this,
			callbackFn: this.createRequestCallback(request, operation, callback, scope),
			disableCaching: false
		});

		if (operation.params) {
			var filters = operation.params.filter;
			if (this.control.getFilters())
				filters = filters ? filters.concat(this.control.getFilters()) : this.control.getFilters();
			
			var sort = operation.params.sort ?
				JSON.parse(operation.params.sort).map(x => {
					return {
						field: x.property,
						direction: x.direction
					}
				}) : undefined
				
			var apiRequest = {
				filter: filters,
				sort: sort,
				command: 'GetData',
				remote: true,
				query: this.socketHUB.GetParameters().query,
				tableName: this.socketHUB.GetParameters().tableName,
				reload: true,
				cacheRequest: true,
				page: operation.page,
				start: operation.start,
				limit: operation.limit,
				cleanParameters: true,
				requestId: requestId
			}

			var handler

			if (operation.start === 0) {
				if(me.grid.tesseract)
					me.grid.tesseract.clear()
				handler = this.socketHUB.DoSubscribe(apiRequest, requestId);
			} else {
				handler = this.socketHUB.DoRequest(apiRequest, requestId);
			}
			handler.$.subscribe(function (response) {
				try {
					var data = response.data.data
					if (data.updateReason) {
						response.data.data = data.addedData
						me.onMessageHandler(response, operation)
						response.data.data = data.updatedData
						me.onMessageHandler(response, operation)
					} else {
						me.onMessageHandler(response, operation)
					}
				} catch (ex) {
					console.log(ex)
				}
			});
		}
		operation.setStarted();
		this.hubRequests[requestId] = request;
		return request;
	},

	onCloseHandler: function () {
		this.socketHUB.Unsubscribe();
	},

	close: function () {
		if (this.socketHUB) {
			this.socketHUB.Unsubscribe();
		}
	},

	onMessageHandler: function (response = '', operation) {
		response.data.data = response.data.data.map(x => this.grid.tesseract.generateRow(x, this.grid.getColumnDefinitions()))
		var request = this.hubRequests[response.requestId];
		this.fireEvent('requestcomplete', this, response, request);
		this.handleResponse(response, $.extend(true, {}, request));
	},

	handleTimeout: function (request) {
		if (this.hub_request.timeout) {
			clearTimeout(this.hub_request.timeout);
			this.hub_request.timeout = null;
		}

		Ext.Msg.alert('Server Not Responding', 'The server timed out when trying to data.', Ext.emptyFn);

		request.errorType = 'timeout';
		this.handleResponse({
			responseText: '{ \'items\' : []}'
		}, request);
	},

	handleResponse: function (result, request) {
		var success = true;
		if (request.errorType) {
			success = false;
			Ext.callback(request.failure, request.scope, [request.errorType]);
		} else {
			Ext.callback(request.success, request.scope, [result]);
		}
		Ext.callback(request.callbackFn, request.scope, [success, result, request.errorType]);
	},

	createRequestCallback: function (request, operation, callback, scope) {
		var me = this;
		return function (success, response, errorType) {
			//operation.setStarted();
			if (response.page > 0)
				operation.page = response.page;

			me.processResponse(success, operation, request, response, callback, scope);
		};
	},

	guidGenerator: function () {
		var S4 = function () {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	},
});