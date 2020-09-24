const BaseModule = require('./Base')
const fs = require('fs');
const wsServer = require('ws').Server;
const logger = new (require('../Core/Logger'))();

var WebSocketServer = BaseModule.extend({

	defaults: function () {
		return {

		}
	},

	initialize: function () {
		var self = this;
		var app;
		var subscriptionManager = this.get('subscriptionManager');
		var config = this.get('config');
		var seed = 1
		
		if (config.ssl) {
			var httpServ = require('https');
			config.key = fs.readFileSync(config.key, 'utf8')
			config.cert = fs.readFileSync(config.cert, 'utf8')
			app = httpServ.createServer(config).listen(config)
		} else {
			var httpServ = require('http');
			app = httpServ.createServer().listen(config);
		}

		var wss = new wsServer({ server: app });
		var connections = subscriptionManager.connections

		logger.info('WebSocket started on port: ' + config.port);

		wss.on('connection', function (socket) {
			var connectionId = seed++
			connections[connectionId] = socket

			socket.on('message', function (message, flags) {
				var request = JSON.parse(message);
				var webSoc = socket;
				request.clientId = connectionId;
				request.connectionType = 'ws';
				subscriptionManager[request.serverCommand](request);
			});

			socket.on('close', function () {
				subscriptionManager.UnsubscribeClient(connectionId);
			});

			socket.on('error', function (err) {
				logger.error('WebSocket connection error:', err);
			});
		})
		
		this.set('ready', true)
	}
});
module.exports = WebSocketServer;


