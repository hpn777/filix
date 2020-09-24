var configPath = './conf/config_local';
if (process.argv[2]) {
	configPath = process.argv[2];
}

var config = require(configPath);
global.applicationDB = config.applicationDB;
var logger = new (require('./Core/Logger'))(null, { enableSyslog: config.enableSyslog });

var Defaults = require('./Defaults.js');

var defaults = new Defaults();