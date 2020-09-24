define("Models/ResourceString", [
	// 'Models/Generics/Model'
], function () {
	var ResourceString = Backbone.Model.extend({
        
        defaults: function () {
            return {
                id: "0",
                value: ""
            };
        }

    });

	return ResourceString;
});