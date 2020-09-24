const dpConnector = require('./DpConnector')
const tailLogConnector = require('./TailLogConnector')
const fixConnector = require('./FixConnector')
const CommandPortConnector = require('./CommandPortConnector')

var connectors = {
	dpConnector,
	tailLogConnector,
	fixConnector,
	CommandPortConnector,
}

module.exports = connectors;
