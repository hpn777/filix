var log = require('./log');

module.exports = function(config, callback) {
	if (config.protocol === undefined) {
    throw new Error('config must include a driver key specifing which driver to use');
  }

	var req = './driver/' + config.protocol;
	var driver = require(req);
	driver.connect(config, function(err, db) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, db);
	});
};
