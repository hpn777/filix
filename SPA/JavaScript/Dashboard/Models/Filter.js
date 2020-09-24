define("Models/Filter", [

], function () {
    var Filter = Backbone.Model.extend({
        defaults: function () {
            return {
                id: null,
                type: 'string',
                value: null,
                comparison: 'eq',
                field: null
            };
        },

        clone: function () {
        	var self = this;
        	var clonedSetting = new Object();
        	for (var attr in self.attributes) {
        		if (attr != 'app' && attr != 'id')
        			switch (attr) {
        				default:
        					clonedSetting[attr] = self.get(attr);
        					break;
        			}
        	}
        	return clonedSetting;
        },
    });

    return Filter;
});