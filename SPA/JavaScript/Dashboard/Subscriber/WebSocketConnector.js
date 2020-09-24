define('Subscriber/WebSocketConnector', [
	'Models/Generics/Model',
    'Common/ReconnectingWebSocket'
], function (Model) {

	var WebSocketConnector = Model.extend({
		defaults: function () {
			return {
				started: false,
				isError: false,
				callbacks: []
			};
		},

		initialize: function (model, options) {
			var self = this;
			this.streams$ = []
			this.message$ = new Rx.Subject()

			this.message$
				.where((message) => { return !message.success })
				.bufferWithTime(1000)
				.where(function (x) { return x.length })
				.subscribe(function (x) {
					Rx.Observable.from(x)
						.groupBy(function (x) { return x.error.message })
						.subscribe(function (x) {
							x.first().subscribe(function (message) {
								var error = message.error
								if (error.code === -32401)
									app.set('authenticated', app.get('authenticated') === false ? null : false)

								Ext.create('Ext.ux.window.Notification', {
									title: 'Server Error',
									position: 'tr',
									manager: 'errors',
									useXAxis: true,
									closable: true,
									slideInDuration: 500,
									slideBackDuration: 1000,
									autoCloseDelay: 10000,
									html: error.message
								}).show();
								console.log('Server Error:', error)
							})
						})
				})

			this.initiateWebSocket()
		},

		initiateWebSocket: function (options) {
			var self = this;

			if (self.get('socket'))
				self.get('socket').close()

			var urls = this._getUrl()
			if (!Array.isArray(urls))
				urls = [urls];
			
			var ws = new ReconnectingWebSocket({
				urls: urls,
				debug: false,
				reconnectInterval: 2000,
				onmessage: function (message) {
					if (message.data) {
						var parsedMessage;
						try {
							parsedMessage = JSON.parse(message.data);
						}
						catch (ex) {
							console.log('Response message error: ', message.data);
						}
						if (parsedMessage)
							self.message$.onNext(parsedMessage);
					}
				},
				onopen: function () {
					self.set('isError', false);
					self.set('started', true);

					var callbacks = self.get('callbacks');
					for (var i = 0; i < callbacks.length; i++) {
						callbacks[i]();
					}
					self.set('callbacks', []);

				},
				onclose: function () {
					self.set('started', false);
				},
				onerror: function () {
					self.set('isError', true);
				}
			});

			self.set('socket', ws);
		},

		getSubscription: function (requestId) {
			return this.streams$[requestId];
		},

		send: function (request) {
			var self = this;
			this._send(function () {
				self.get('socket').send(JSON.stringify(request));
			});
		},

		_send: function (callback) {
			if (this.get('started') && !this.get('isError')) {
				callback();
			} else {
				this.get('callbacks').push(callback);
			}
		},

		_getUrl: function () {
			var socketProtocol = 'ws://';

			if (location.protocol === 'https:')
				socketProtocol = 'wss://';

			var appServiceQueryString = $.QueryString('appService') || (location.host + ':30200');

			if (appServiceQueryString) {
				var value = appServiceQueryString;

				if (value.indexOf('#') > -1)
					value = value.substring(0, value.indexOf('#'));

				return socketProtocol + value;
			}
		}
	});

	return WebSocketConnector;

});
