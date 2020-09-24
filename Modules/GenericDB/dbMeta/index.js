var path = require('path');

module.exports = function (options, callback) {
	var driverPath = path.join(__dirname, options.protocol, 'driver');
	var driver = require(driverPath);
	try {
		if (options.hasOwnProperty("connection")) {
			driver.connectToExistingConnection(options["connection"], callback);
		}else{
			driver.connect(options, callback);
		}
	} catch (e) {
		callback(new Error('Unsupported driver: ' + driverName));
	}
};