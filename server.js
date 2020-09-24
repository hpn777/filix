Error.stackTraceLimit = 10;
var configPath = './conf/config_local';
if (process.argv[2]) {
	configPath = process.argv[2];
}

global.runOnProgramExit = (lambda, timeout) => {
	var runOnExit
	if(timeout)
		runOnExit = function(){setTimeout(lambda, timeout)}
	else
		runOnExit = lambda
	process.on('SIGTERM', runOnExit)
	process.on('SIGINT', runOnExit)
}

global.runOnProgramExit(()=>{
	process.exit(0)
}, 200)

var config = require(configPath );

var logger = new (require('./Core/Logger'))(null, config.logger);

process.on('uncaughtException', function (err) {
	logger.error('General exception: ', err);
});

var SubscriptionManager = require('./Core/SubscriptionManager.js');

var subscriptionManager = new SubscriptionManager({}, { config: config });




