// var Backbone = require('backbone');
var {backbone} = require('tessio');

var Model = backbone.Model.extend({

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

	remove: function () {
		this.trigger('remove', this);
		this.off('remove');
		this.collection.remove(this);
		this.off();
	},

	clone: function (selectedAttributes) {
		var self = this;
		var clonedSetting = new Object
		if (selectedAttributes) {
			for (var i = 0; i < selectedAttributes.length; i++) {
				clonedSetting[selectedAttributes[i]] = self.get(selectedAttributes[i]);
			}
		}
		else {
			for (var attr in self.attributes) {
				switch (attr) {
					case 'collection':
						break;
					default:
						clonedSetting[attr] = self.get(attr);
						break;
				}
			}
		}
		return clonedSetting;
	},

	guid: function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
});
module.exports = Model;