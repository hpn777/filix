var orm = require('orm');
var {
	lodash: _
} = require('tessio');
var Collection = require('../../Core/Model/Collection');
var Model = require('../../Core/Model/Model');
var dbMeta = require('./dbMeta');
var dbMigrator = require('./dbMigrator');
var events = require('events');
var logger = new(require('../../Core/Logger'))();

var SqlModelGenerator = Model.extend({

	defaults: function () {
		return {
			ready: false,
			modelLoaded: false
		};
	},

	initialize: function () {
		var self = this;
		this.db;
		this.dbMetaInstance;
		this.dbMigratorInstance;
		this.connectionConfig = this.get('config');
		this.metaTables = new Collection();

		var handleConnection = function (err) {
			if (err) {
				logger.error('Error when ORM connecting ' + self.connectionConfig.database + ' db: ' + JSON.stringify(err));
				setTimeout(function () {
					self.db.driver.reconnect(handleConnection);
				}, 2000);
			} else {
				if (!self.get('modelLoaded')) {
					self.createModels(self.connectionConfig.database);
				}

				self.db.settings.set('instance.cache', false);
				self.db.sync(function (err) {
					if (err)
						logger.error('Error when trying to synch ' + self.connectionConfig.database + ' db: ' + JSON.stringify(err));
				});
			}
		}

		self.db = orm.connect(self.connectionConfig, handleConnection);

		self.driver = self.db.driver.db

		self.db.on('error', function (err) {
			logger.error('ORM ' + self.connectionConfig.database + ' db error: ' + JSON.stringify(err));
			if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code == 'ECONNRESET') {
				self.db.driver.reconnect(handleConnection);
			}
		});
	},

	createModels: function (database) {
		var self = this;

		self.metaTables.addTable = function (tableName, options, callback) {
			var keyColumn;
			options = options || {};

			options.id = keyColumn = {
				notNull: false,
				maxLength: 0,
				type: 'int',
				primaryKey: true,
				autoIncrement: true
			}

			self.dbMigratorInstance.createTable(tableName, options, function (err, response) {
				if (!err) {
					self.metaTables.add({
						id: tableName,
						name: tableName,
						type: 'TABLE',
						columns: new Collection()
					});

					var metaTable = self.metaTables.get(tableName);
					var metaColumns = metaTable.get('columns');

					keyColumn.id = keyColumn.name = 'id';
					keyColumn.tableName = tableName;
					keyColumn.metaTable = metaTable;
					metaColumns.add(keyColumn);
					metaColumns.on('add change', function (metaColumn) {
						self.metaTables.trigger('column:change', metaColumn);
					});

					metaColumns.on('remove', function (metaColumn) {
						self.metaTables.trigger('column:remove', metaColumn);
					});
				}
				callback(err, response);
			});
		};

		self.metaTables.removeTable = function (tableName, callback) {
			var metaTable = this.get(tableName);

			self.dbMigratorInstance.removeTable(tableName, function (err, response) {
				if (!err) {
					metaTable.remove();
				}
				callback(err, response);
			});
		};

		self.metaTables.setColumn = function (tableName, columnName, options, callback) {
			var tempColumn = _.extend({}, options);
			if (options.defaultValue == null || options.defaultValue == '')
				delete options.defaultValue;

			var existingColumn = self.metaTables.get(tableName)
				.get('columns')
				.get(columnName);

			if (existingColumn) {
				self.dbMigratorInstance.changeColumn(tableName, columnName, options, function (err, response) {
					if (!err) {
						if (existingColumn.get('referencedTableName') && existingColumn.get('constraintName')) {
							self.dbMigratorInstance.removeForeignKey(tableName, existingColumn.get('constraintName'), function (err, response) {
								if (err) {
									logger.error('Remove Foreign Key ' + existingColumn.get('constraintName') + ' on ' + columnName + ' failed', err);
									callback(err, response);
								} else {
									existingColumn.set('referencedColumnName', '');
									existingColumn.set('constraintName', '');
									existingColumn.set('onUpdate', '');
									existingColumn.set('onDelete', '');
								}
							});
						}
						if (options.referencedTableName) {
							var referencedColumnName = options.referencedColumnName || 'id';
							var constraintName = tableName + '_' + options.name + '_fk';
							self.dbMigratorInstance.addForeignKey(
								tableName,
								options.referencedTableName,
								options.name,
								referencedColumnName, {
									onDelete: options.onDelete,
									onUpdate: options.onUpdate
								},
								function (err, response) {
									if (err)
										logger.error(err);
									else {
										existingColumn.set(tempColumn);
										existingColumn.set('referencedColumnName', referencedColumnName);
										existingColumn.set('constraintName', constraintName);
									}
									callback(err, response);
								});
						} else {
							existingColumn.set(tempColumn);
							callback(err, response);
						}
					} else
						callback(err, response);
				});
			} else {
				self.dbMigratorInstance.addColumn(tableName, columnName, options, function (err, response) {
					if (!err) {
						tempColumn.id = options.name;
						tempColumn.metaTable = self.metaTables.get(tableName)
						self.metaTables.get(tableName).get('columns').add(tempColumn);
						existingColumn = self.metaTables.get(tableName).get('columns').get(options.name);

						if (options.referencedTableName) {
							var referencedColumnName = options.referencedColumnName || 'id';
							var constraintName = tableName + '_' + options.name + '_fk';
							self.dbMigratorInstance.addForeignKey(
								tableName,
								options.referencedTableName,
								options.name,
								referencedColumnName, {
									onDelete: options.onDelete,
									onUpdate: options.onUpdate
								},
								function (err, response) {
									if (err)
										logger.error(err);
									else {
										existingColumn.set('referencedColumnName', referencedColumnName);
										existingColumn.set('constraintName', constraintName);
									}
									callback(err, response);
								});
						}
					}
					callback(err, response);
				});
			}
		};

		self.metaTables.removeColumn = function (tableName, columnName, callback) {
			var selectedColumn = self.metaTables.get(tableName).get('columns').get(columnName);

			if (selectedColumn.get('referencedTableName') && selectedColumn.get('constraintName')) {
				self.dbMigratorInstance.removeForeignKey(selectedColumn.get('tableName'), selectedColumn.get('constraintName'), function (err, response) {
					if (err)
						logger.error('Remove Foreign Key ' + existingColumn.get('constraintName') + ' on ' + columnName + ' failed', err);
					else {
						self.dbMigratorInstance.removeColumn(tableName, columnName, function (err, response) {
							if (!err)
								selectedColumn.remove();
							callback(err, response);
						});
					}
				});
			} else {
				self.dbMigratorInstance.removeColumn(tableName, columnName, function (err, response) {
					if (!err)
						selectedColumn.remove();
					callback(err, response);
				});
			}
		};

		self.metaTables.on('add', function (metaTable) {

		});

		var updateColumnsSchema = function (metaTable) {
			var ormAttributes = {};
			var primaryKey = false

			var idCoulumn = metaTable.get('columns').get('id')
			if (idCoulumn) {
				ormAttributes.id = {
					type: 'serial',
					key: true
				};
				primaryKey = true;
			}

			metaTable.get('columns').forEach(function (column) {
				if (column.get('primaryKey') && !primaryKey) {
					ormAttributes[column.get('name')] = {
						type: self.getAttributeType(column.get('type')).type,
						key: true
					};
					primaryKey = true;
				} else if (column.get('name') != 'id')
					ormAttributes[column.get('name')] = self.getAttributeType(column.get('type'));
			});

			self[metaTable.get('name')] = self.db.define(metaTable.get('name'), ormAttributes, {
				cache: false
			});

			self[metaTable.get('name')].sessionQuery = function (parameters, callback) {
				self.sessionQuery(parameters, callback)
			}
		}

		self.metaTables.on('column:change column:remove', function (metaColumn) {
			var metaTable = metaColumn.get('metaTable');
			updateColumnsSchema(metaTable);
		});

		self.metaTables.on('metaReady', function (metaTable) {
			updateColumnsSchema(metaTable);
		});

		self.metaTables.on('remove', function (metaTable) {
			metaTable.get('columns').each(function (metaColumn) {
				metaColumn.remove();
			});
		});

		dbMeta({
			connection: self.db.driver.db,
			protocol: self.connectionConfig.protocol
		}, function (err, meta) {
			if (err) {
				logger.error('Database Meta sniffer error:', err);
				return;
			}

			self.dbMetaInstance = meta;

			meta.getTables(function (err, tables) {
				var tablesLength = tables.length;

				if (tables.length == 0) {
					self.set('modelLoaded', true);
					self.set('ready', true);
				}
				tables.forEach(function (table) {
					self.metaTables.add({
						id: table.getName(),
						name: table.getName(),
						type: table.getType(),
						columns: new Collection()
					});

					var metaTable = self.metaTables.get(table.getName());
					var metaColumns = metaTable.get('columns');

					metaColumns.on('add change', function (metaColumn) {
						if (self.get('modelLoaded'))
							self.metaTables.trigger('column:change', metaColumn);
					});

					metaColumns.on('remove', function (metaColumn) {
						if (self.get('modelLoaded'))
							self.metaTables.trigger('column:remove', metaColumn);
					});

					var ormAttributes = {};

					meta.getColumns(table.getName(), function (err, columns) {
						tablesLength--;
						columns.forEach(function (column) {
							let tempColumn = metaColumns.get(column.getName())
							if (tempColumn === undefined) {
								metaColumns.add({
									id: column.getName(),
									name: column.getName(),
									tableName: table.getName(),
									metaTable: metaTable,
									notNull: !column.isNullable(),
									maxLength: column.getMaxLength(),
									type: column.getDataType(),
									primaryKey: column.isPrimaryKey(),
									defaultValue: column.getDefaultValue(),
									unique: column.isUnique(),
									autoIncrement: column.isAutoIncrementing(),
									constraintName: column.getConstraintName(),
									referencedTableName: column.getReferencedTableName(),
									referencedColumnName: column.getReferencedColumnName(),
									onUpdate: column.getUpdateRule(),
									onDelete: column.getDeleteRule()
								}, {
									silent: true
								})
							} else {
								tempColumn.set({
									id: column.getName(),
									constraintName: column.getConstraintName(),
									referencedTableName: column.getReferencedTableName(),
									referencedColumnName: column.getReferencedColumnName(),
									onUpdate: column.getUpdateRule(),
									onDelete: column.getDeleteRule()
								}, {
									silent: true
								})
							}

						});
						self.metaTables.trigger('metaReady', metaTable);
						if (!tablesLength) {
							self.set('modelLoaded', true);
							self.set('ready', true);
						}
					});
				});
			});
		});

		dbMigrator({
			connection: self.db.driver.db,
			protocol: self.connectionConfig.protocol
		}, function (err, migrator) {
			if (err) {
				logger.error('Database Schema Migrator error:', err);
				return;
			}
			self.dbMigratorInstance = migrator;
		});
	},

	sessionQuery: function (parameters, callback) {
		var self = this
		var ormModel = self[parameters.tableName]
		var select = parameters.select || _.map(ormModel.allProperties, (x) => {
			return x.mapsTo
		})
		var filters = parameters.where || parameters.filter
		var sort = parameters.sort
		var merge = parameters.merge
		var start = parameters.start || 0
		var limit = parameters.limit

		if (ormModel) {
			var dbFilter = {};
			var dbOptions = {
				offset: start,
				limit: limit
			};

			if (sort) {
				dbOptions.order = _.map(sort, x => {
					return x.direction == 'ASC' ? [x.field, 'A'] : [x.field, 'Z']
				})
			}

			if (merge) {
				dbOptions.merge = {
					from: {
						field: merge.id
					},
					to: {
						field: merge.ref_id
					},
					select: [merge.table_name],
					where: merge.where
				}
			}

			if (filters && filters.length) {
				_.each(filters, function (item) {
					switch (item.comparison) {
						case 'in':
							dbFilter[item.field] = item.value
							break;
						case 'like':
							dbFilter[item.field] = orm.like('%' + item.value + '%')
							break;
						case 'notlike':
							dbFilter[item.field] = orm.not_like('%' + item.value + '%')
							break;
						default:
							dbFilter[item.field] = orm[item.comparison](item.value)
					}
				})
			}

			self.db.driver.find(select, parameters.tableName, dbFilter, dbOptions, function (err, data) {
				ormModel.count(dbFilter, function (err, totalCount) {
					callback(err, data, totalCount)
				})
			})
		}
	},

	execQuery: function (query, callback) {
		var self = this
		var ormModel = self[query.table]

		self.db.driver.execQuery(query, function (err, data) {
			callback(err, data)
		})
	},

	getAll: function (tableName, callback) {
		var ormModel = this[tableName]

		if (ormModel)
			this.driver.query('SELECT * FROM ' + this.connectionConfig.database + '.' + tableName, callback)
	},

	getAttributeType: function (dbType) {
		var numberRegex = /^(?:int|tinyint|smallint|float|decimal|double|real)/;
		var stringRegex = /^(?:char|varchar|text|longtext|bigint|enum)/;
		var dateRegex = /^(?:date)/;
		var dateTimeRegex = /^(?:datetime|timestamp|time)/;
		var boolRegex = /^(?:bit|boolean|binary)/;
		if (numberRegex.test(dbType))
			return {
				type: 'number'
			};
		else if (dateRegex.test(dbType))
			return {
				type: 'date',
				time: false
			};
		else if (dateTimeRegex.test(dbType))
			return {
				type: 'date',
				time: true
			};
		else if (boolRegex.test(dbType))
			return {
				type: 'boolean'
			};
		else
			return {
				type: 'text'
			};
	}
});
module.exports = SqlModelGenerator;