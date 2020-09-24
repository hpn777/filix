define("Models/FilterCollection", [
    'Models/Filter'
], function (Filter) {

    var FilterCollection = Backbone.Collection.extend({
        model: Filter,

        setFilter: function (newFilter, options) {
        	newFilter.id = newFilter.field;
        	var filter = this.get(newFilter.id);
        	if (filter) {
            	if (newFilter.value == null) {
            		// Remove filter
                    this.remove(filter);
                } else {
            		// Set Filter Value
            		filter.set(newFilter);
                }
        	} else if (newFilter.value != null) {
                this.add(new Filter(newFilter));
			}
			
        	if (!options || (options && !options.silent)) {
				this.trigger('change:filter:' + newFilter.field, newFilter);
            }
        },

        clearAll: function () {
        	var self = this;
        	this.each(function (item) {
        		self.setFilter({field: item.get('id'), value: null});
        	});
        },

        clone: function () {
        	var filters = [];
        	this.each(function (module) {
        		filters.push(module.clone());
        	});
        	return filters;
        },
    });

    return FilterCollection;
});