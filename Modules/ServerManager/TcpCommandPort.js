var net = require('net');
var os = require('os');
var {lodash:_, backbone} = require('tessio');
var Collection = require('../../Core/Model/Collection');
var Enumerable = require('linq');
var logger = new (require('../../Core/Logger'))();

var TcpService = backbone.Model.extend({

	defaults: function () {
		return {
			
		}
	},

	initialize: function () {
		var self = this;
		connectionSessions = new Collection();
		var connectionIndex = 0;
		var config = this.get('config');

		var HOST

		if (config.hostName) {
			HOST = config.hostName
		}
		else if (config.interface) {
			var ifaces = os.networkInterfaces();
			if (ifaces[config.interface] && ifaces[config.interface].length)
				HOST = ifaces[config.interface][0].address;
			else
				HOST = '0.0.0.0'
		}
		else {
			HOST = '0.0.0.0'
		}
		this.HOST = process.env.HOSTNAME || HOST;

		var PORT = config.port || process.env.COMMAND_PORT || 1100;
		var SLICE = config.slice || process.env.SLICENO || 0;

		var welcomeMessage = '#appService@' + this.HOST + '(' + SLICE + '): ';

		net.createServer( function (connection) {
			logger.info('Client connected to Command Port: ' + connection.remoteAddress + ':' + connection.remotePort);

			connectionSessions.set(connection);
			connection.write(welcomeMessage);

			connection.on('data', function (data) {
				var message = data.toString();

				self.processRequest(message, function (err, response) {
					if (response) {
						connection.write(response + '\r\n' + welcomeMessage);
					}
				});
			});

			connection.on('error', function (data) {
				logger.info('Comand Port error: ' + JSON.stringify(data));
			});

		}).listen(PORT, HOST, function () { //'listening' listener
			logger.info('Command Port started on: ' + HOST + ':' + PORT);
		});
	},

	processRequest: function (message, callbackFn) {
		var self = this;
		var messagesArray;
		var callback = callbackFn;
		var serverManager = this.get('serverManager');
		
		if(message.indexOf('\r\n') > 0)//windows
			messagesArray = message.split('\r\n');
		else//linux
			messagesArray = message.split('\n');
		
		_.each(messagesArray, function (item) {
			if (item) {
				var messageArray = item.split(' ');
				var response = '';
				if (messageArray.length) {
					switch (messageArray[0]) {
						case 'status':
							var status = serverManager.getStatus();
							response = 'Up time: ' + status.processUptime + '\r\nMemory usage: ' + JSON.stringify(status.memoryUsage) + '\r\nCluster info: ' + JSON.stringify(status.cluster) + '\r\n';
							break;
						case 'ls':
						case 'help':
							response = 'status - service status\r\nls - available commands\r\nrestart = kill service\r\n';
							break;
						case 'restart':
							if (messageArray[1] && messageArray[1] == self.HOST)
								serverManager.reset();
							else
								response = 'Invalid host name.';
							break;
						default:
							response = 'Unrecognized command.'
					}
				}
				callback(null, response);
			}
		});
	}
});
module.exports = TcpService;
