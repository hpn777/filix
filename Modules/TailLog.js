var BaseModule = require('./Base');
var {lodash:_} = require('tessio');
var os = require('os');
var Enumerable = require('linq');
var Rx = require('rx');
var path = require('path');
var logger = new (require('../Core/Logger'))();
var {Tesseract} = require('tessio');
var connDefs = require('../Core/Connectors')

var tailStream;

var TailLog = BaseModule.extend({

	defaults: function () {
		return {
			ready: false,
		}
	},

	initialize: function () {
		var self = this;
		var config = this.get('config');
		config.separator = os.EOL

		var header = [{
			columnName: 'id',
			columnTitle: 'Id',
			columnType: 'id'
		}, {
			columnName: 'timestamp',
			columnTitle: 'Timestamp',
			columnType: 'timestamp'
		}, {
			columnName: 'host',
			columnTitle: 'Host',
			columnType: 'string'
		}, {
			columnName: 'appName',
			columnTitle: 'App Name',
			columnType: 'string'
		}, {
			columnName: 'slice',
			columnTitle: 'Slice',
			columnType: 'number'
		}, {
			columnName: 'pId',
			columnTitle: 'pId',
			columnType: 'number'
		}, {
			columnName: 'type',
			columnTitle: 'Type',
			columnType: 'simpleenum',
			enum: config.messageTypes || ['I', 'W', 'E']
		}, {
			columnName: 'msg',
			columnTitle: 'Message',
			columnType: 'text'
		}, {
			columnName: 'count',
			columnTitle: 'Count',
			columnType: 'uint'
		}];

		self.tesseract = new Tesseract({
			idProperty: 'id',
			columns: header
		});

		this.baseInitialize()

		logger.info('TailLog has started');

		if (config.path) {
			var tail$ = connDefs.tailLogConnector(config)
			if (config.messageTypes) {
				tail$.subscribe(function (data) {
					if (data.type && config.messageTypes.indexOf(data.type) !== -1) {
						self.tesseract.add([data]);
					}
				})
			}
			else {
				tail$.subscribe(function (data) {
					self.tesseract.add([data]);
				})
			}
		}

		this.set('ready', true);
	},

	GetColumnsDefinition: function (request) {
		var self = this;
		self.Publish(request.subscription, { header: self.tesseract.getHeader(), type: 'reset' }, request.parameters.command, request.requestId);
	},

	GetData: function (request) {
		var self = this;
		var header = self.tesseract.getHeader();
		var session = request.subscription.get('tesseractSession');

		if (!request.parameters.rpc)
			request.subscription.set('requestId', request.requestId);

		if (!session) {
			session = self.tesseract.createSession({ immediateUpdate: false });
			session.on('dataUpdate', function (data) {
				var sessionConfig = session.get('config')
				if (sessionConfig.page !== undefined) {

					self.Publish(request.subscription, {
						data: data.updatedData,
						total: sessionConfig.totalLength || session.dataCache.length,
						type: 'update',
						page: sessionConfig.page,
						reload: false
					}, 'GetData', request.subscription.get('requestId'));

					if (data.removedData.length) {
						self.Publish(request.subscription, {
							data: data.removedData,
							total: sessionConfig.totalLength || session.dataCache.length,
							type: 'remove',
							page: sessionConfig.page,
							reload: false
						}, 'GetData', request.subscription.get('requestId'));
					}
				}
				else {
					self.Publish(request.subscription, { data: data.updatedData, type: 'update' }, 'GetData', request.requestId);

					if (data.removedData.length) {
						self.Publish(request.subscription, { data: data.removedData, type: 'remove' }, 'GetData', request.requestId);
					}
				}
			}, request.subscription)

			session.on('dataRemoved', function (data) {
				var sessionConfig = session.get('config')
				if (sessionConfig.page !== undefined) {
					var response =
					self.Publish(request.subscription, {
						data: data,
						total: sessionConfig.totalLength || session.dataCache.length,
						type: 'remove',
						page: sessionConfig.page,
						reload: false
					}, 'GetData', request.subscription.get('requestId'));
				}
				else {
					self.Publish(request.subscription, { data: data, type: 'remove' }, 'GetData', request.requestId);
				}
			}, request.subscription)

			request.subscription.once('remove', function () {
				session.off('dataUpdate', null, request.subscription)
				session.off('dataRemoved', null, request.subscription)
				session.remove();
			})

			request.subscription.set('tesseractSession', session);
		}

		request.parameters.requestId = request.requestId;
		var resposeData = session.getData(request.parameters)
		var tempData = Enumerable.from(resposeData).select(function (item) {
			var t = [];
			for (var i = 0; i < header.length; i++) {
				t.push(item[header[i].columnName]);
			}

			return t;
		}).toArray();

		var response = { data: tempData }
		if (request.parameters.page) {
			response.total = session.dataCache.length;
			response.page = request.parameters.page;
			response.reload = request.parameters.reload;
		}
		else {
			response.header = header;
			response.type = 'reset';
		}
		self.Publish(request.subscription, response, request.parameters.command, request.requestId);
	}
});

module.exports = TailLog;