var {backbone} = require('tessio');
var config = {};

var Logger = backbone.Model.extend({

	initialize: function (params, options) {
		if (options)
			config = options
	},

	info: function () {
		var args = Array.prototype.slice.call(arguments)
		args.unshift('I')
		this.log.apply(this, args)
	},

	warning: function () {
		var args = Array.prototype.slice.call(arguments)
		args.unshift('W')
		this.log.apply(this, args)
	},

	error: function () {
		var args = Array.prototype.slice.call(arguments)
		args.unshift('E')
		//this.log.apply(this, args)
		args.unshift((new Date().getMilliseconds() * 1000) + ' ' + args.shift())

		if (config.includeAppInfo)
			args.unshift(this.getAppInfo())

		console.trace.apply(this, args)
	},

	dev: function () {
		var args = Array.prototype.slice.call(arguments)
		args.unshift('D')
		this.log.apply(this, args)
	},

	log: function () {
		var args = Array.prototype.slice.call(arguments)

		args.unshift((new Date().getMilliseconds() * 1000) + ' ' + args.shift())

		if (config.includeAppInfo)
			args.unshift(this.getAppInfo())

		console.log.apply(this, args)
	},

	getAppInfo: function () {
		var date = (new Date).toUTCString().split(' ');
		return date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + (process.env.HOSTNAME || '127.0.0.1') + ' ' + 'appservice-slice' + (process.env.SLICE || 0) + '[' + process.pid + ']:';
	}
});
module.exports = Logger;