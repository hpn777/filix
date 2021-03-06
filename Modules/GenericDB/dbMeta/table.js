module.exports = Table;

var dbmUtil = require('./util');

function Table(props) {
  this.meta = dbmUtil.lowercaseKeys(props);
}

Table.prototype.getName = function() {
  return this.meta.table_name;
};

Table.prototype.getType = function () {
	return this.meta.table_type == 'VIEW' ? 'VIEW' : 'TABLE';
};
