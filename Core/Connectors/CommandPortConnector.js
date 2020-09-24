const { Observable } = require('rx')
const net = require('net')

const CommandPortConnector = function (config, callback) {

	const connection = createConnection(config)

	connection.connect$.subscribe(() => {
		callback(connection)
	})

	return connection
}

var createConnection = function (options) {
	var self = this;

	var cinnection = net.createConnection(options);
	cinnection.setEncoding('utf8');

	cinnection.send = (message) => { cinnection.write(message + '\n') }

	cinnection.connect$ = Observable.create((observer) => {
		cinnection.on('connect', function () {
			observer.onNext(true)
		});
	})

	cinnection.error$ = Observable.create((observer) => {
		cinnection.on('error', function (ex) {
			observer.onNext(ex)
		});
	})

	cinnection.data$ = Observable.create((observer) => {
		cinnection.on('data', function (data) {
			data = data.replace(/#(?:[a-z][a-z0-9_]*)\@.*?\([0-9]*\)\:/, '')
			observer.onNext(data)
		});

		cinnection.on('close', function () {
			observer.onComplete()
		});
	})

	return cinnection
}

module.exports = CommandPortConnector 
