var Table = require('../table');
var Column = require('./column');
var Index = require('./index');

exports.connect = function (options, callback) {
	var mysql = require('mysql2');
	try {
		var client = mysql.createClient(options);
		callback(null, new Driver(client));
	} catch (err) {
		callback(err);
	}
};

exports.connectToExistingConnection = function (client, callback) {
	callback(null, new Driver(client));
};

function Driver(client) {
	this.client = client;
}

Driver.prototype.getVersion = function (callback) {
	this.client.query('select version() as version', onResult);

	function onResult(err, result) {
		if (err) {
			return callback(err);
		}

		callback(null, result[0].version);
	}
};

Driver.prototype.getTables = function (callback) {
	var handler = handleResults.bind(this, Table, callback);
	var db = getClientDatabase(this.client);
	this.client.query("select * from information_schema.tables where table_schema = ?", [db], handler);
};

Driver.prototype.getColumns = function (tableName, callback) {
	var handler = handleResults.bind(this, Column, callback);
	var db = getClientDatabase(this.client);
	this.client.query("SELECT a.*, b.CONSTRAINT_NAME, b.REFERENCED_TABLE_NAME, b.REFERENCED_COLUMN_NAME, c.UPDATE_RULE, c.DELETE_RULE FROM INFORMATION_SCHEMA.COLUMNS a LEFT OUTER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE b on a.table_schema = b.table_schema AND a.table_name = b.table_name AND a.column_name = b.column_name LEFT OUTER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS c on c.CONSTRAINT_NAME = b.CONSTRAINT_NAME where a.table_schema = ? and a.table_name = ?", [db, tableName], handler);
};

Driver.prototype.getIndexes = function (tableName, callback) {
	var handler = handleResults.bind(this, Index, callback);
	this.client.query("SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME =  '" + tableName + "'", handler);
};

Driver.prototype.close = function (callback) {
	this.client.end(callback);
};

function handleResults(obj, callback, err, result) {
	if (err) {
		return callback(err);
	}

	var objects = result.map(function (row) {
		return new obj(row);
	});

	callback(null, objects);
}

function getClientDatabase(client) {
	return client.database || client.config.database;
}
