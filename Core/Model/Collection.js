var {backbone, lodash:_} = require('tessio');
var Model = require('./Model');
var Enumerable = require('linq');

var Collection = backbone.Collection.extend({
	model: Model,
	
	defaults: function () {
		return {

		}
	},

	initialize: function () {

	},

	addEventListener: function (name, handler, ref) {
		this.on(name, handler, ref);
	},

	removeEventListener: function (name, handler, ref) {
		this.off(name, handler, ref);
	},

	add: function (model, options) {
		var self = this;
		if (!Array.isArray(model)) {
			model = [model];
		}
		_.each(model, function (item) {
			item.collection = self;
		});
		
		backbone.Collection.prototype.add.call(this, model, options);
	},

	set: function (model, options) {
		var self = this;
		if (!Array.isArray(model)) {
			model = [model];
		}
		_.each(model, function (item) {
			item.collection = self;
		});
		backbone.Collection.prototype.set.call(this, model, options);
	},

	clone: function () {
		var items = [];
		this.each(function (module) {
			items.push(module.clone());
		});
		return items;
	},

	toEnumerable: function () {
		return Enumerable.from(this.models);
	},

	guid: function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
});
module.exports = Collection;