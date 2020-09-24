function ReconnectingWebSocket(options) {
	this.debug = false;
	this.reconnectInterval = 2000;
	this.timeoutInterval = 10000;

	var self = this;
	var ws;
	var url;
	var urlIndex;
	var forcedClose = false;
	var timedOut = false;

	var getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var getNextUrl = function () {
		if (isNaN(urlIndex)) 
			urlIndex = getRandomInt(0, urls.length - 1);
		else
			urlIndex++;
		
		if (urlIndex === urls.length)
			urlIndex = 0;

		return urls[urlIndex];
	};

	$.extend(true, this, options);

	this.protocols = ['json'];
	this.readyState = WebSocket.CONNECTING;
	var urls = options.urls ? options.urls : [options.url];
	if (urls && urls.length) {
		url = getNextUrl();
	}
	
	function connect(reconnectAttempt) {
		ws = new WebSocket(url);
		if (self.debug || ReconnectingWebSocket.debugAll) {
			console.debug('ReconnectingWebSocket', 'attempt-connect', url);
		}

		var localWs = ws;
		var timeout = setTimeout(function () {
			if (self.debug || ReconnectingWebSocket.debugAll) {
				console.debug('ReconnectingWebSocket', 'connection-timeout', rl);
			}
			timedOut = true;
			localWs.close();
			timedOut = false;
		}, self.timeoutInterval);

		ws.onopen = function (event) {
			clearTimeout(timeout);
			if (self.debug || ReconnectingWebSocket.debugAll) {
				console.debug('ReconnectingWebSocket', 'onopen', url);
			}
			self.readyState = WebSocket.OPEN;
			reconnectAttempt = false;
			self.onopen(event);
		};

		ws.onclose = function (event) {
			clearTimeout(timeout);
			ws = null;
			if (forcedClose) {
				self.readyState = WebSocket.CLOSED;
				self.onclose(event);
			} else {
				self.readyState = WebSocket.CONNECTING;
				if (!reconnectAttempt && !timedOut) {
					if (self.debug || ReconnectingWebSocket.debugAll) {
						console.debug('ReconnectingWebSocket', 'onclose', url);
					}
					self.onclose(event);
				}
				setTimeout(function () {
					url = getNextUrl();
					connect(true);
				}, self.reconnectInterval);
			}
		};
		ws.onmessage = function (event) {
			if (self.debug || ReconnectingWebSocket.debugAll) {
				console.debug('ReconnectingWebSocket', 'onmessage', url, event.data);
			}
			self.onmessage(event);
		};
		ws.onerror = function (event) {
			if (self.debug || ReconnectingWebSocket.debugAll) {
				console.debug('ReconnectingWebSocket', 'onerror', url, event);
			}
			self.onerror(event);
		};
	}
	connect();

	this.send = function (data) {
		if (ws) {
			if (self.debug || ReconnectingWebSocket.debugAll) {
				console.debug('ReconnectingWebSocket', 'send', url, data);
			}
			return ws.send(data);
		} else {
			throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
		}
	};

	this.close = function () {
		if (ws) {
			forcedClose = true;
			ws.close();
		}
	};

	/**
	* Additional public API method to refresh the connection if still open (close, re-open).
	* For example, if the app suspects bad data / missed heart beats, it can try to refresh.
	*/
	this.refresh = function () {
		if (ws) {
			ws.close();
		}
	};
}