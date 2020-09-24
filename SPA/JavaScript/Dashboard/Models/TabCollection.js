define("Models/TabCollection", [
    'Models/Tab',
	'Models/Generics/Collection',
    'Models/FilterCollection'
], function (Tab, Collection, FilterCollection) {

	var TabCollection = Collection.extend({
		model: Tab,
		comparator: function (tab) {
			return tab.get('order');
		},
		initialize: function (model, options) {
			if (options) {
				this.app = options.app;
			}
		},
		clone: function () {
			var clone = [];
			var tabs = this;
			for (var i = 0; i < this.length; i++) {
				clone.push(this.at(i).clone());
			}
			return clone;
		},
		getNewTabName: function () {
			var tabNumber = 1;
			while (this.some(function (tab) { return tab.get("name") == 'New Tab ' + tabNumber; })) {
				tabNumber++;
			}
			return 'New Tab ' + tabNumber;
		},

		getNewTabOrder: function () {
			var order = 0;
			if (this.length > 0) {
				order = this.maxBy(function (x) { return x.get("order"); }).get("order") + 1;
			}
			return order
		},

		getTabByPageType: function (pageType) {
			return this.find(function (x) { return x.get("tabConfig").get('pageType') == pageType; });
		},

		update: function (model) {
			var self = this

			if (!Array.isArray(model)) {
				model = [model];
			}

			_.each(model, (item) => {
				delete item.selected
				var existingItem = self.get(item.id)
				if (existingItem) {
					existingItem.set(item)
				}
				else {
					item.order = self.getNewTabOrder();
					item.app = self.app;
					self.add(item)
				}
			})
		},

		save: function () {
			var tabs = this.ToEnumerable().select((x) => {
				return x.clone()
				//return {
				//	id: x.get('id'),
				//	order: x.get('order'),
				//	selected: x.get('selected'),
				//	parentId: x.get('parentId')
				//}
			}).toArray()

			app.get('sync').saveTabOrderAndSelection(tabs)
		}
	});

	return TabCollection;
});