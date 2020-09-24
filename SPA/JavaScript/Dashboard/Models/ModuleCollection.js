define("Models/ModuleCollection", [
	'Models/Generics/Collection',
    //'Models/Generics/Model'
], function (Collection, Module) {

	var ModuleCollection = Collection.extend({
		//model: Module,

		initialize: function (model, options) {
			var self = this;
			if (options) {
				self.app = options.app;
			}
		},

		update: function (model) {
			var self = this

			if (!Array.isArray(model)) {
				model = [model];
			}

			_.each(model, (item) => {
				var existingItem = self.get(item.id)
				if (existingItem) {
					existingItem.set(item)
				}
				else {
					self.add(item)
				}
			})
		},

		clone: function () {
			var moduleCollection = [];
			this.each(function (module) {
				moduleCollection.push(module.clone());
			});
			return moduleCollection;
		}
	});

	return ModuleCollection;
});
