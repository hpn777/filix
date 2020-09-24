define("Models/Generics/Collection", [
    'Models/Generics/Model'
], function (Model) {

	var Collection = Backbone.Collection.extend({
		model: Model,

		addEventListener: function (name, handler, ref) {
			this.on(name, handler, ref);
		},

		removeEventListener: function (name, handler, ref) {
			this.off(name, handler, ref);
		},

		add: function (model, options) {
			if (!Array.isArray(model)) {
				model = [model];
			}
			
			model.forEach(item => {
				item.collection = this
			});
			
			Backbone.Collection.prototype.add.call(this, model)
				.forEach(item => {
					item.on('all', (...args) => {
						this.trigger(...args)
					})
				})
		},

		clone: function () {
			var items = [];
			this.each(function (module) {
				items.push(module.clone());
			});
			return items;
		},

		ToEnumerable: function () {
			return Enumerable.from(this.models);
		},

		guid: function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
	});

	return Collection;
});
