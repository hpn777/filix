define("Models/TabPresetCollection", [
    'Models/Generics/Collection',
	'Models/TabPreset',
	'Models/Tab'
], function (Collection, TabPreset, Tab) {

	var TabPresetCollection = Collection.extend({
		model: TabPreset,

		initialize: function (model, options) {
			var self = this;
		},

        add: function (model, options) {
        	var self = this;
        	if (model instanceof Tab) {
        		model = self.tabToPreset(model);
        	}

        	Backbone.Collection.prototype.add.call(self, model);
			return model
        },

        update: function (model) {
        	var self = this
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

        tabToPreset: function (tab) {
        	var self = this;
        	var controlPresetsData = [];
        	var presetId = tessioUtils.guid();
        	tab.get('controls').each(function (control) {
        		controlPresetsData.push({
        			id: control.get('id'),
        			tabPresetId: presetId,
        			title: control.get('title'),
        			config: control.get('config'),
        			moduleClassName: control.get('moduleClassName'),
        			moduleId: control.get('moduleId')
        		});
        	});
        	return new TabPreset({
				id: presetId,
				name: tab.get('name'),
				//userId: tab.get('userId'),
        		controlPresets: controlPresetsData,
        		config: tab.get('config'),
				collection: self
        	});
        }
	});

	return TabPresetCollection;
});