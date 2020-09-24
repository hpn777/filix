var Rx = require('rx')

const TailLogConnector = function (config) {
	var Tail = require('tail').Tail
	var row_id = 1
	var repetitionBuffer
	var repetitionBufferCount = 0
	
	var suppress = config.suppress || ['tcpflow', 'survtimeline3', 'tpmonitor']

	var parseLog = function (txt) {
		//var txt='Dec 17 15:48:56 ld4dvini01 appservice-slice0[21311]: 123456 I Number of ticks 3952300';
		var m = txt.split(/^((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))\ *((?:(?:[0-2]?\d{1})|(?:[3][01]{1})))(?![\d])\ ((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\s?(?:am|AM|pm|PM))?)\ (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-z0-9]*)\ ([a-z0-9_]*)(?:-slice(\d+))?(?:\[(.*?)\])?\:\ (\d+\ )?(?:(I|W|E|D)?\d{0,2}\ )(.*)/g);
		
		if (m.length !== 1) {
			tempTime = new Date();
			var timestamp = ((new Date(m[1] + ' ' + m[2] + ' ' + tempTime.getFullYear() + ' ' + m[3]).getTime() * 1000) + Number(m[8])) * 1000;

			if (suppress.indexOf(m[5]) !== -1) {
				var srcFileName = m[10].split(' ')[0]
				if (repetitionBuffer === srcFileName) {
					--row_id
					repetitionBufferCount++
				}
				else {
					repetitionBuffer = srcFileName
					repetitionBufferCount = 1
				}
			}
			else {
				repetitionBufferCount = 1
			}
			var data = {
				id: row_id,
				timestamp: timestamp,
				host: m[4],
				appName: m[5],
				slice: m[6],
				pId: m[7],
				type: m[9],
				msg: m[10],
				count: repetitionBufferCount
			};

			row_id++

			return data;
		}
		else if (txt) {
			return {
				id: row_id++,
				timestamp: new Date().getTime() * 1000000,
				msg: txt
			};
		}
		else
			return {}
	}
	
	config.encoding = config.encoding || 'ascii'
	var outputPath = config.path;
	var tail = new Tail(outputPath, undefined, { encoding: config.encoding, follow: true }, true);//params: (fileToTail, lineSeparator, watchOptions,fromBeginning)
	var tailStream = Rx.Observable.fromEvent(tail, 'line').map(parseLog);
	
	tailStream.watch = () => {
		tail.watch()
	}

	tailStream.unwatch = () => {
		tail.unwatch()
	}

	return tailStream
}

module.exports = TailLogConnector
