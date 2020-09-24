define("Subscriber/Subscription", [
	'Models/Generics/Model',
	'Subscriber/WebSocketConnector'
], function (Model, WebSocketConnector) {
	websocket = new WebSocketConnector()

	var Subscription = Model.extend({

		defaults: function () {
			return {
				subscriptionId: null,
				ContainerId: null,
				dataProviderId: null
			};
		},

		initialize: function () {
			this.streams = {};
			this.parameters = this.get('parameters') || {};
			var subscriptionId = this.get('subscriptionId')
			
			this.set('started', websocket.get('started'))
			websocket.on('change:started', () => {
				this.set('started', websocket.get('started'))
			});

			this.set('isError', websocket.get('isError'))
			websocket.on('change:isError', () => {
				this.set('isError', websocket.get('isError'))
			});
			
			this.message$ = websocket.message$
				.where((message) => { return message.subscriptionId === subscriptionId && message.success })

			this.message$.subscribe((message) => {
					this.trigger("messageReceived", message)
				})

			this.error$ = websocket.message$
				.where((message) => { return message.subscriptionId === subscriptionId && !message.success })

			this.resubscribe$ = new Rx.Subject()

			websocket.on('change:started', () => {
				if (websocket.get('started') && this.subscribed) {
					this.Resubscribe()
				}
			})
			
			this.Subscribe(this.parameters);
		},

		Subscribe: function (parameters, requestId) {
			if (parameters)
				Ext.merge(this.parameters, parameters);

			requestId = requestId || tessioUtils.guid();
			this.parameters.rpc = false;
			this.parameters.requestId = requestId;

			this.streams[this.parameters.command] = {
				parameters: this.parameters,
				$: this.message$
					.filter(function (m) { return m.requestId === requestId }),
			};

			this.send('Subscribe', this.parameters, requestId)
			this.subscribed = true;
		},

		Resubscribe: function () {
			var lastSession = this.streams[this.parameters.command] || this.streams[this.previousRequestId];
			if (lastSession) {
				this.send('Subscribe', lastSession.parameters, lastSession.parameters.requestId)
				this.subscribed = true
			}
		},

		Unsubscribe: function () {
			this.send('Unsubscribe')
			this.subscribed = false;
		},

		UnsubscribeContainer: function () {
			this.send('UnsubscribeContainer')
			this.subscribed = false;
		},

		Execute: function (parameters, requestId) {
			if (parameters) {
				if (!parameters.cacheRequest) {
					this.execute(parameters, requestId);
				}
				else if (parameters.cleanParameters) {
					this.parameters = parameters;
					delete parameters.cacheRequest;
					delete parameters.cleanParameters;
					this.execute(this.parameters, requestId);
				}
				else {
					delete parameters.cacheRequest;
					Ext.merge(this.parameters, parameters);
					this.send(this.parameters, requestId);
				}
			}
			else
				this.send(this.parameters, requestId);
		},

		DoRequest: function (parameters, requestId) {
			requestId = requestId || tessioUtils.guid();
			parameters = Ext.merge({ rpc: true }, parameters || this.parameters);
			parameters.requestId = requestId

			this.streams[requestId] = {
				parameters: parameters,
				$: this.message$
					.filter(function (m) { return m.requestId === requestId })
					.take(1),
			};

			this.streams[requestId].$.subscribe(() => {
				if (this.previousRequestId && this.previousRequestId != requestId)
					delete this.streams[this.previousRequestId]
				this.previousRequestId = requestId;
			});

			this.send('Execute', parameters, requestId)

			return this.streams[requestId];
		},

		DoSubscribe: function (parameters, requestId) {
			requestId = requestId || tessioUtils.guid();
			parameters = Ext.merge({ rpc: false }, parameters || this.parameters);
			parameters.requestId = requestId

			this.streams[parameters.command] = {
				parameters: parameters,
				$: this.message$
					.filter(function (m) { return m.requestId === requestId })
			};

			if (parameters)
				this.send('Execute', parameters, requestId)
			else
				this.send('Execute', this.parameters, requestId)

			return this.streams[parameters.command];
		},

		GetSubscription: function (name) {
			return this.streams[name];
		},

		login: function (parameters) {
			this.send('Login', parameters)
			return this.message$
					.filter(function (m) { return m.request === 'Login' })
					.take(1)
		},

		send: function (serverCommand, parameters, requestId) {
        	var request = {
        		requestId: requestId ? requestId : tessioUtils.guid(),
        		userId: app.get('userId'),
        		authToken: app.get("authToken"),
        		containerId: this.get('containerId'),
        		dataProviderId: this.get('dataProviderId'),
        		subscriptionId: this.get('subscriptionId'),
        		serverCommand: serverCommand,
        		parameters: parameters
        	};

        	websocket.send(request)
        }
    });

	return Subscription;
});
