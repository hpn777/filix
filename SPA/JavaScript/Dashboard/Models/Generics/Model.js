define("Models/Generics/Model", [
], function () {
	var Model = Backbone.Model.extend({

		addEventListener: function (name, handler, ref) {
			this.on(name, handler, ref);
		},

		removeEventListener: function (name, handler, ref) {
			this.off(name, handler, ref);
		},

		remove: function () {
			if (this.get('collection'))
				this.get('collection').remove(this);
		},

		clone: function () {
			var self = this;
			var clonedObject = {};
			for (var attr in self.attributes) {
				switch (attr) {
					case 'collection':
						break;
					default:
						clonedObject[attr] = self.get(attr);
						break;
				}
			}
			return clonedObject;
		},

		guid: function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
	});
	return Model;
});