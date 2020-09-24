var {EventHorizon} = require('tessio')
var logger = new (require('../../Core/Logger'))();
var {lodash:_} = require('tessio');
var Enumerable = require('linq');
var Rx = require('rx');
var dbtype = require('./dbMigrator/data_type');

class SqlEV extends EventHorizon {

	constructor(options = {}) {
		super(options)

		var self = this
		
		if (options.DBModels) {
			self.DBModels = options.DBModels;

			if (self.DBModels.get('ready')) {
				self.initializeEV(options)
			}
		}
	}

	initializeEV(options) {
		var self = this
		
		var loadedData$ = new Rx.Subject()
		loadedData$.take(this.DBModels.metaTables.length)
			.subscribe(() => { }, null, () => {
				self.trigger('ready')
			})


		this.DBModels.metaTables.each(function (metaTable) {
			var updatedColumns;
			var columns = [];
			var tableName = metaTable.get('name');

			metaTable.get('columns').each((item) => {
				var columnDefinition = {};
				columnDefinition.name = item.get('name')
				columnDefinition.type = self.DBModels.getAttributeType(item.get('type')).type
				columnDefinition.title = item.get('name')

				if (item.get('primaryKey'))
					columnDefinition.primaryKey = true

				columns.push(columnDefinition)
			})
			
			var tesseractTemp = self.createTesseract(tableName, {
				columns: columns
			});
			tesseractTemp.isRemote = true

			if (options.autofetch) {
				self.DBModels.getAll(tableName, (err, result) => {
					if (!err) {
						tesseractTemp.isRemote = false
						tesseractTemp.update(result, true, true)
						loadedData$.onNext({})
					}
					else
						logger.error(err)
				})
			}

			tesseractTemp.on('dataUpdate', (updatedRows) => {
				self.trigger('dataUpdate', tableName, tesseractTemp, updatedRows)
			})

			tesseractTemp.on('dataRemoved', (updatedRows) => {
				self.trigger('dataRemoved', tableName, tesseractTemp, updatedRows)
			})
		});

		self.DBModels.metaTables.on('column:change column:remove', _.throttle(function (metaColumn) {
			var tableName = metaColumn.get('tableName');
			var header = [];

			_.each(self.DBModels[tableName].allProperties, function (item, attr) {
				var columnDefinition = {};
				columnDefinition.name = attr;
				columnDefinition.type = item.type;
				columnDefinition.title = attr;


				header.push(columnDefinition);
			});

			self.evH.get(tableName).updateColumns(header, true)
		}, 100));

		this.addTableSchema()
		this.addColumnSchema()
	}

	addTableSchema() {
		var self = this

		var header = [{
			name: 'id',
			title: 'Id',
			type: 'id'
		}, {
			name: 'name',
			title: 'Name',
			type: 'string'
		}, {
			name: 'type',
			title: 'Type',
			type: 'string',
			editable: false
		}];

		var result = []
		this.DBModels.metaTables.each(function (metaTable) {
			result.push({
				id: metaTable.get('id'),
				name: metaTable.get('name'),
				type: metaTable.get('type'),
			});
		});

		var tesseractTemp = self.createTesseract('tables_schema', {
			columns: header,
			//clusterSync: true
		});

		tesseractTemp.update(result, true, true)

		tesseractTemp.on('dataUpdate', (updatedRows) => {
			self.trigger('dataUpdate', 'tables_schema', tesseractTemp, updatedRows)
		})

		tesseractTemp.on('dataRemoved', (updatedRows) => {
			self.trigger('dataRemoved', 'tables_schema', tesseractTemp, updatedRows)
		})
	}

	addColumnSchema() {
		var self = this

		var header = [{
			name: 'id',
			title: 'Id',
			type: 'id'
		}, {
			name: 'name',
			title: 'Name',
			type: 'columnSchemaName'
		}, {
			name: 'tableName',
			title: 'Table Name',
			type: 'string',
			//editable: false
		}, {
			name: 'notNull',
			title: 'Not Null',
			type: 'boolean'
		}, {
			name: 'maxLength',
			title: 'Max Length',
			type: 'number'
		}, {
			name: 'type',
			title: 'Type',
			type: 'simpleenum',
			enum: Enumerable.from(dbtype).select(function (x) { return x.value; }).toArray()
		}, {
			name: 'primaryKey',
			title: 'Primary Rey',
			type: 'boolean'
		}, {
			name: 'defaultValue',
			title: 'Default Value',
			type: 'string'
		}, {
			name: 'unique',
			title: 'Unique',
			type: 'boolean'
		}, {
			name: 'autoIncrement',
			title: 'Auto Increment',
			type: 'boolean'
		}, {
			name: 'constraintName',
			title: 'Constraint Name',
			type: 'string',
			hidden: true
		}, {
			name: 'referencedTableName',
			title: 'Ref Table Name',
			type: 'resolve',
			// resolve: {
			// 	dataProviderId: self.namespace,
			// 	childrenTable: 'tables_schema',
			// 	valueField: 'name',
			// 	displayField: 'name',
			// 	addBlank: true
			// }
		}, {
			name: 'referencedColumnName',
			title: 'Ref Column Name',
			type: 'string',
			hidden: true
		}, {
			name: 'onUpdate',
			title: 'On Update',
			type: 'simpleenum',
			enum: ['NO ACTION', 'RESTRICT', 'CASCADE', 'SET NULL']
		}, {
			name: 'onDelete',
			title: 'On Delete',
			type: 'simpleenum',
			enum: ['NO ACTION', 'RESTRICT', 'CASCADE', 'SET NULL']
		}];

		var result = []
		self.DBModels.metaTables.each(function (metaTable) {
			var metaColumns = metaTable.get('columns');
			metaColumns.each(function (metaColumn) {
				var tempRow = metaColumn.clone(['name', 'tableName', 'notNull', 'maxLength', 'type', 'primaryKey', 'defaultValue', 'unique', 'autoIncrement', 'constraintName', 'referencedTableName', 'referencedColumnName', 'onUpdate', 'onDelete']);
				tempRow.id = metaColumn.get('tableName') + ':' + metaColumn.get('id');
				result.push(tempRow);
			});
		});

		var tesseractTemp = self.createTesseract('columns_schema', {
			columns: header,
			//clusterSync: true
		});

		tesseractTemp.update(result, true, true)

		tesseractTemp.on('dataUpdate', (updatedRows) => {
			self.trigger('dataUpdate', 'columns_schema', tesseractTemp, updatedRows)
		})

		tesseractTemp.on('dataRemoved', (updatedRows) => {
			self.trigger('dataRemoved', 'columns_schema', tesseractTemp, updatedRows)
		})
	}
}

module.exports = SqlEV
