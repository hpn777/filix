var BaseModule = require('../Base');
var DBModels = require('./SqlModelGenerator');
var SqlEventHorizon = require('./SqlEV');
var {lodash:_} = require('tessio');
var Enumerable = require('linq');
var logger = new(require('../../Core/Logger'))();

var getAPIKey = (request) => (request.dataProviderId + '.' + request.parameters.command + '.' + request.parameters.tableName)

var GenericDB = BaseModule.extend({

	defaults: function () {
		return {
			ready: false,
		}
	},

	initialize: function () {
		var self = this;
		var config = this.get('config');

		this.baseInitialize()

		var iniSchemaEventsReload = (autofetch) => {
			self.evH = new SqlEventHorizon({
				DBModels: self.DBModels,
				namespace: self.get('moduleId'),
				autofetch: autofetch
			});

			if (config.autofetch)
				self.evH.once('ready', () => {
					self.set('ready', true)
				})
			else
				self.set('ready', true);
		}

		if (config.dbConfig) {
			self.DBModels = new DBModels({
				config: config.dbConfig
			});

			if (self.DBModels.get('ready'))
				iniSchemaEventsReload(config.autofetch);
			else
				self.DBModels.once('change:ready', function (value) {
					iniSchemaEventsReload(config.autofetch);
				});
		}
	},

	getApiAccess: function (request) {
		var membershipDP = this.get('subscriptionManager').getDefaultMembershipDP()
		if (!membershipDP) {
			return
		}
		return membershipDP.evH.get('api_access').getById(getAPIKey(request));
	},

	validateRequest: function (request) {
		var membershipDP = this.get('subscriptionManager').getDefaultMembershipDP()
		var apiAccessInstance = this.getApiAccess(request);

		if (
			!apiAccessInstance ||
			(
				apiAccessInstance &&
				(
					!apiAccessInstance.roleId ||
					membershipDP.evH.get('user_roles').getLinq().any((x) => {
						return x.user_id === request.subscription.get('userId') && x.roles_id === apiAccessInstance.roleId
					})
				)
			))
			return true
		else
			return false
	},

	GetData: function (request) {

		var self = this;
		var tableName = request.parameters.tableName;
		var query = request.parameters.query
		var session, header

		if (!request.parameters.rpc)
			request.subscription.set('requestId', request.requestId);

		if (this.validateRequest(request)) {//TODO check access to all tables within query
			if(query) {
				query.id = request.subscription.get('id')
				session = request.subscription.get('tesseractSession') || self.evH.createSession(query, true)
				request.subscription.set('tesseractSession', session);
				header = session.getSimpleHeader()
			} 
			else if (tableName) {
				var tesseract = self.evH.get(tableName)
				if (!tesseract) {
					self.PublishError(request.subscription, {
						message: 'Dataset: "' + tableName + '" dosn\'t exist.'
					}, request.parameters.command)
					return;
				}

				header = tesseract.getHeader();
				session = request.subscription.get('tesseractSession') || tesseract.createSession({})
				request.subscription.set('tesseractSession', session);
			}
			else{
				self.PublishError(request.subscription, {
					message: 'No query or dataset: provided.'
				}, request.parameters.command)
				return;
			}

				
			session.on('dataUpdate', data => {
				var sessionConfig = session.get('config')
				if (sessionConfig.page !== undefined) {
					self.Publish(request.subscription, {
						data: data.toJSON(), //.map(x=>x.array),
						total: sessionConfig.totalLength || session.dataCache.length,
						type: 'update',
						page: sessionConfig.page,
						reload: false
					}, 'GetData', request.subscription.get('requestId'))
				} else {
					self.Publish(request.subscription, {
						data: data.toJSON(),
						type: 'update'
					}, 'GetData', request.requestId);
				}
			}, request.subscription)

			request.subscription.once('remove', () => {
				session.off('dataUpdate', null, request.subscription)
				session.destroy();
			})

			if (tesseract && tesseract.isRemote) {
				//TODO add static resolved columns as merge and filter i role of user filtering required
				self.DBModels.sessionQuery(request.parameters, function (err, data, totalLength) {
					request.parameters.requestId = request.requestId
					request.parameters.totalLength = totalLength
					session.set('config', request.parameters)

					var response = {
						data: data
					}

					if (request.parameters.page) {
						response.total = totalLength;
						response.page = request.parameters.page;
						response.reload = request.parameters.reload;
					} else {
						response.header = header;
						response.type = 'reset';
					}
					self.Publish(request.subscription, response, request.parameters.command, request.requestId);
				})
			} else {
				request.parameters.requestId = request.requestId;
				var resposeData = session.getLinq(request.parameters).select(x => x.object).toArray()
				var response = {
					data: resposeData
					}
					if (request.parameters.page) {
						response.total = session.dataCache.length;
						response.page = request.parameters.page;
						response.reload = request.parameters.reload;
					} else {
						response.header = header;
						response.type = 'reset';
					}
					self.Publish(request.subscription, response, request.parameters.command, request.requestId);
				}
		} else {
			self.PublishError(request.subscription, {
				message: 'Insufficient access rights to call: ' + getAPIKey(request)
			}, request.parameters.command);
		}
	},

	GetColumnsDefinition: function (request) {
		var self = this;
		var query = request.parameters.query;
		var tableName = request.parameters.tableName;
		var simpleHeader

		if(query){
			const session = self.evH.createSession(query, true)
			simpleHeader = session.getSimpleHeader()
		}
		else if(tableName){
			const tesseract = self.evH.get(tableName)
			if(tesseract){
				simpleHeader = tesseract.getSimpleHeader()
			}
		}
		
		if (simpleHeader) {
			self.Publish(request.subscription, {
				header: simpleHeader,
				type: 'reset'
			}, request.parameters.command, request.requestId);
		} else {
			// log errror
		}
	},

	SetData: function (request) {
		var self = this;
		var tableName = request.parameters.tableName;
		var record = request.parameters.data;

		if (this.validateRequest(request)) {
			if (tableName) {
				switch (tableName) {
					case 'tables_schema':
						var tempTable = self.DBModels.metaTables.get(record.name);
						if (!tempTable) {
							self.DBModels.metaTables.addTable(record.name, null, function (err, response) {
								if (!err) {
									var metaTable = self.DBModels.metaTables.get(record.name)
									var tesseractTable = self.evH.get('tables_schema')
									tesseractTable.update({
										id: metaTable.get('id'),
										name: metaTable.get('name'),
										type: metaTable.get('type'),
									})

									var tesseractColumn = self.evH.get('columns_schema')
									metaTable.get('columns').each(function (metaColumn) {
										var tempRow = metaColumn.clone(['name', 'tableName', 'notNull', 'maxLength', 'type', 'primaryKey', 'defaultValue', 'unique', 'autoIncrement', 'constraintName', 'referencedTableName', 'referencedColumnName', 'onUpdate', 'onDelete']);
										tempRow.id = metaColumn.get('tableName') + ':' + metaColumn.get('id');
										tesseractColumn.update(tempRow);
									});
								} else {
									self.PublishError(request.subscription, {
										code: JSON.stringify(err)
									}, request.parameters.command);
									logger.error(err);
								}
							});
						} else {
							self.PublishError(request.subscription, {
								code: 'Table: ' + tableName + ' already exist.'
							}, request.parameters.command);
						}
						break;
					case 'columns_schema':
						if (Array.isArray(record))
							record = record[0]

						self.DBModels.metaTables.setColumn(record.tableName, record.name, record, function (err, response) {
							if (!err) {
								var metaTable = self.DBModels.metaTables.get(record.tableName)
								var tesseractColumn = self.evH.get('columns_schema')
								metaTable.get('columns').each(function (metaColumn) {
									var tempRow = metaColumn.clone(['name', 'tableName', 'notNull', 'maxLength', 'type', 'primaryKey', 'defaultValue', 'unique', 'autoIncrement', 'constraintName', 'referencedTableName', 'referencedColumnName', 'onUpdate', 'onDelete']);
									tempRow.id = metaColumn.get('tableName') + ':' + metaColumn.get('id');
									tesseractColumn.update(tempRow);
								});
							} else {
								self.PublishError(request.subscription, {
									code: JSON.stringify(err)
								}, request.parameters.command);
								logger.error(err);
							}
						});
						break;
					default:
						self.save(tableName, record, function (err, updatedRecord) {
							if (err)
								self.PublishError(request.subscription, {
									code: JSON.stringify(err)
								}, request.parameters.command);
							else
								self.Publish(request.subscription, {
									success: true
								}, request.parameters.command, request.requestId);
						});
				}
			}
		} else {
			self.PublishError(request.subscription, {
				message: 'Insufficient access rights to call: ' + getAPIKey(request)
			}, request.parameters.command);
		}
	},

	RemoveData: function (request) {
		var self = this;
		var tableName = request.parameters.tableName;
		var metaTable = self.DBModels.metaTables.get(tableName);

		if (tableName == 'tables_schema' || tableName == 'columns_schema') {
			var primaryKey = 'id';
		} else {
			var is_row_id = metaTable.get('columns').find(function (x) {
				return x.get('name') == 'id'
			});
			var primaryKey = is_row_id ? 'id' : metaTable.get('columns').find(function (x) {
				return x.get('primaryKey')
			}).get('name');
		}
		var rowId = request.parameters.data[primaryKey];

		if (this.validateRequest(request)) {
			if (tableName) {
				switch (tableName) {
					case 'tables_schema':
						var tableColumns = [];
						metaTable = self.DBModels.metaTables.get(rowId);
						var metaColumns = metaTable.get('columns');
						metaColumns.each(function (metaColumn) {
							var tempRow = {
								id: metaColumn.get('tableName') + ':' + metaColumn.get('id')
							};
							tableColumns.push(tempRow);
						});
						self.evH.get('columns_schema').remove(tableColumns)
						//------------------------

						self.DBModels.metaTables.removeTable(rowId, function (err, result) {
							if (err) {
								self.PublishError(request.subscription, {
									code: JSON.stringify(err)
								}, request.parameters.command);
								logger.error(err);
							} else {
								self.evH.get('tables_schema').remove([rowId])
							}
						});
						break;
					case 'columns_schema':
						var metaTableName = rowId.split(':')[0];
						var metaColumnName = rowId.split(':')[1];

						self.DBModels.metaTables.removeColumn(metaTableName, metaColumnName, function (err, result) {
							if (err) {
								self.PublishError(request.subscription, {
									code: JSON.stringify(err)
								}, request.parameters.command);
								logger.error(err);
							} else {
								self.evH.get('columns_schema').remove([rowId])
							}
						});
						break;
					default:
						self.remove(tableName, [rowId], (err) => {
							if (err) {

							}
						})
				}
			}
		} else {
			self.PublishError(request.subscription, {
				message: 'Insufficient access rights to call: ' + getAPIKey(request)
			}, request.parameters.command);
		}
	},

	remove: function (tableName, rowIds, callback) {
		var self = this;
		var dataCache = self.evH.get(tableName)

		if (!Array.isArray(rowIds))
			rowIds = [rowIds];

		var ormModel = this.DBModels[tableName]
		if (!ormModel) {
			logger.error(tableName + 'is not a valid table name.')
			return
		}
		var lastError;

		Promise.all([
			...rowIds.map((rowId) => 
				new Promise((resolve, reject) => {
					ormModel.get(rowId, (err, response) => {
						if (err) {
							logger.error(err);
							lastError = err
							resolve(undefined)
						} else {
							response.remove(function (err) {
								if (err) {
									logger.error(err)
									lastError = err
								}

								resolve(rowId)
							});
						}
					})
				})
			)
		]).then((result) => {
			dataCache.remove(result)
			if (callback)
				callback(lastError, result)
		})
	},

	CreateModule: function (request) {
		var self = this;
		var tableName = request.parameters.tableName;
		var columns = [];
		var appDB = this.get('subscriptionManager').getModule('AppDB');
		var config = this.get('config');
		var moduleId = appDB.evH.get('module').getLinq().max(function (x) {
			return x.id
		}) + 1;
		var metaTable = this.DBModels.metaTables.get(tableName);
		var selectors = [];
		var primaryKey = 'id';

		metaTable.get('columns').each(function (metaColumn) {
			var columnDefinition = {};

			columnDefinition.name = metaColumn.get('name');
			columnDefinition.title = metaColumn.get('name');

			if (metaColumn.get('primaryKey'))
				primaryKey = metaColumn.get('name');

			if (metaColumn.get('referencedTableName')) {
				columnDefinition.type = self.DBModels.getAttributeType(metaColumn.get('type')).type;
				var refMetaTable = self.DBModels.metaTables.get(metaColumn.get('referencedTableName'));
				var displayField = refMetaTable.get('columns').find(function (x) {
					return x.get('name') !== 'id' && x.get('name') !== primaryKey
				});
				columnDefinition.resolveView = {
					dataProviderId: config.id,
					childrenTable: metaColumn.get('referencedTableName'),
					remote: true,
					valueField: metaColumn.get('referencedColumnName'),
					displayField: displayField ? displayField.get('name') : primaryKey,
					addBlank: true
				};
			} else {
				columnDefinition.type = self.DBModels.getAttributeType(metaColumn.get('type')).type;
				if (metaColumn.get('primaryKey'))
					columnDefinition.primaryKey = true
			}

			if (metaColumn.get('defaultValue'))
				columnDefinition.defaultValue = metaColumn.get('defaultValue');

			columns.push(columnDefinition);
		});

		this.DBModels.metaTables.each(function (metaTable) {
			metaTable.get('columns').each(function (metaColumn) {
				if (metaColumn.get('referencedTableName') == tableName) {
					selectors.push({
						columnName: metaColumn.get('referencedColumnName'),
						foreignTableName: metaColumn.get('tableName'),
						foreignColumnName: metaColumn.get('name'),
					});
				}
			});
		});

		var moduleConfig = {
			dataProviderId: config.id,
			idProperty: primaryKey,
			tableName: tableName,
			storeType: 'remote',
			serviceCommand: 'GetData',
			initialCommand: 'GetColumnsDefinition',
			defaultSelect: tableName,
			selectors: selectors,
			editable: true,
			deletable: true,
			extensionBar: [
				'moreContextMenu',
				'clearFiltersButton',
				'addGenericRow',
				'saveAllButton',
				'reloadButton'
			],
			columns: columns
		};

		var moduleGrid = {
			id: moduleId,
			name: tableName + ' - manager',
			moduleClassName: 'GenericGrid',
			moduleGroup: self.get('moduleId') + ' - CRUD',
			config: JSON.stringify(moduleConfig, null, 4)
		}

		appDB.save('module', moduleGrid, () => {
			appDB.save('module_roles', {
				module_id: moduleId,
				roles_id: 1
			})
		});

		var moduleForm = {
			id: moduleId + 1,
			name: tableName + ' - form',
			moduleClassName: 'GenericForm',
			moduleGroup: self.get('moduleId') + ' - CRUD',
			config: JSON.stringify(moduleConfig, null, 4)
		}

		appDB.save('module', moduleForm, () => {
			appDB.save('module_roles', {
				module_id: moduleId + 1,
				roles_id: 1
			})
		});
	},

	save: function (modelName, data, callbackFn) {
		var metaTable = this.DBModels.metaTables.get(modelName)
		var primaryKey = metaTable
			.get('columns')
			.find(x => x.get('primaryKey'))
			.get('name')
		var ormModel = this.DBModels[modelName]

		if (!Array.isArray(data)){
			data = [data]
		}

		var lastError

		Promise.all([
			...(data.map((item) => {
				return new Promise((resolve, reject) => {
					if (!item.isNewRow && item[primaryKey] !== undefined) {
						ormModel.get(item[primaryKey], (err, response) => {
							if (response) {
								response.save(item, (err, response) => {
									if (err) {
										logger.error(item , err)
										lastError = err
									}

									resolve(response)
								})
							} else {
								ormModel.create(item, (err, response) => {
									if (err) {
										logger.error(err)
										lastError = err
									}

									resolve(response)
								});
							}
						});
					} else {
						ormModel.create(item, (err, response) => {
							if (err) {
								logger.error(err)
								lastError = err
							}

							resolve(response)
						});
					}
				})
			}))
		]).then((updatedData) => {
			this.evH.get(modelName).update(updatedData)
			if (callbackFn)
				callbackFn(lastError, updatedData)
		})
	}
});
module.exports = GenericDB;