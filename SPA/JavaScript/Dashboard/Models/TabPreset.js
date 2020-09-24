define("Models/TabPreset", [
	'Models/Generics/Model',
	'Models/Generics/Collection'
], function (Model, Collection) {
	var TabPreset = Model.extend({

		defaults: function () {
			return {
				name: '',
				controlPresets: null,
				config: '{}'
			};
		},

		initialize: function () {
			this.set('controlPresets', new Collection(this.get('controlPresets')), {silent: true});
		},

		clone: function () {
			var self = this;
			var clonedObject = {};
			for (var attr in self.attributes) {
				switch (attr) {
					case 'app':
					case 'collection':
					case 'controlPresets':
						break;
					default:
						clonedObject[attr] = self.get(attr);
						break;
				}
			}
			return clonedObject;
		},

		save: function () {
			app.get('sync').saveTabPreset(this.clone(), this.get('controlPresets').clone())
		},

		toTab: function () {
			var self = this;
			var tab = this.clone();
			tab.id = tessioUtils.guid();
			tab.userId = app.get('userId');
			return tab;
		}

    });

	return TabPreset;
});