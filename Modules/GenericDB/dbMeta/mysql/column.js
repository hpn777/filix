module.exports = Column;

var util = require('util');
var dbmUtil = require('../util');
var BaseColumn = require('../column');

function Column(props) {
	this.meta = dbmUtil.lowercaseKeys(props);
}
util.inherits(Column, BaseColumn);

Column.prototype.getName = function () {
	return this.meta.column_name;
};

Column.prototype.isNullable = function () {
	return this.meta.is_nullable === 'YES';
};

Column.prototype.getMaxLength = function () {
	return this.meta.character_maximum_length;
};

Column.prototype.getDataType = function () {
	return this.meta.data_type;//.toLowerCase();
};

Column.prototype.isPrimaryKey = function () {
	return this.meta.column_key === 'PRI';
};

Column.prototype.getDefaultValue = function () {
	return this.meta.column_default;
};

Column.prototype.isUnique = function () {
	return (this.meta.column_key === 'UNI') || (this.meta.column_key === 'PRI');
};

Column.prototype.isAutoIncrementing = function () {
	return this.meta.extra === 'auto_increment';
};

Column.prototype.getConstraintName = function () {
	return this.meta.constraint_name;
};

Column.prototype.getReferencedTableName = function () {
	return this.meta.referenced_table_name;
};

Column.prototype.getReferencedColumnName = function () {
	return this.meta.referenced_column_name;
};

Column.prototype.getUpdateRule = function () {
	return this.meta.update_rule;
};

Column.prototype.getDeleteRule = function () {
	return this.meta.delete_rule;
};
