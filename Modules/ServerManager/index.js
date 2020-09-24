var BaseModule = require('../Base');
var {lodash: _} = require('tessio');
var Enumerable = require('linq');
var os = require('os');
var TcpCommandPort = require('./TcpCommandPort');
var logger = new (require('../../Core/Logger'))();
var cluster;
var ServerManager = BaseModule.extend({

	defaults: function () {
		return {
			ready: false,
		}
	},

	initialize: function () {
		var self = this;
		var config = this.get('config');
		//cluster = self.get('subscriptionManager').getModule('Cluster');
		this.baseInitialize()

		var server = new TcpCommandPort({ serverManager: self, config: this.get('config') });

		var clusterConnections = self.get('subscriptionManager').get('clusterConnections');
		if (clusterConnections) {
			clusterConnections.on('add change remove', function (node) {
				self.resendStatus()
			});
		}

		setInterval(function () {
			self.resendStatus()
		}, 60000);

		self.set('ready', true);
	},

	GetStatus: function (request) {
		var self = this;
		request.subscription.set('requestId', request.requestId)
		this.Publish(request.subscription, this.getStatus(), request.parameters.command, request.requestId);
	},

	getStatus: function (options) {
		var modules = [];
		var subscriptionManager = this.get('subscriptionManager');
		var totalSec = process.uptime();
		var days = parseInt(totalSec / 86400);
		var hours = parseInt(totalSec / 3600) % 24;
		var minutes = parseInt(totalSec / 60) % 60;
		var seconds = parseInt(totalSec % 60);
		var HOST = process.env.HOSTNAME;
		if (!HOST) {
			var ifaces = os.networkInterfaces();
			if (ifaces.eth0 && ifaces.eth0.length)
				HOST = ifaces.eth0[0].address;
			else
				HOST = '0.0.0.0'
		}
		
		for (let [attr, module] of Object.entries(subscriptionManager.modules)) {
			if (!module.get('config').private && module.publicMethods)
                modules.push({
                    moduleId: attr,
                    publicMethods: Object.keys(module.publicMethods),
                    componentInfo: module.get('componentInfo')
                })
		  }

		var gitVersion = ''
		try {
			GitVersion = require('../../GitVersion').gitVersion;
		}
		catch (ex){ }

		return {
			hostName: HOST,
			version: gitVersion,
			processUptime: days + 'd. ' + hours + 'h. ' + minutes + 'm. ' + seconds + 's.',
			memoryUsage: process.memoryUsage(),
			//cluster: cluster ? cluster.status() : undefined,
			modules: modules
		}
	},

	reset: function () {
		logger.info('Service has been terminated using command port.');
		process.kill(process.pid, 'SIGTERM')
	},

	resendStatus: function () {
		var subscriptions = this.get('subscriptionManager').subscriptions;
		var status = this.getStatus();
		subscriptions.each(subscription => {
			if (subscription.get('moduleId') == 'ServerManager') {
				this.Publish(subscription, status, 'GetStatus', subscription.get('requestId'));
			}
		});
	}
});
module.exports = ServerManager;