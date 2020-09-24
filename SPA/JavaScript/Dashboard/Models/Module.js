define("Models/Module", [

], function () {
    var Module = Backbone.Model.extend({
        
        defaults: function () {
            return {
                id: 0,
                name: "",
                moduleTypeId: 0,
                moduleClassName: '',
                config: null,
                parentId: null,
            };
        },

        clone: function () {
        	return {
        		id: this.get("id"),
        		name: this.get("name"),
        		moduleTypeId: this.get("moduleTypeId"),
        		moduleClassName: this.get("moduleClassName"),
        		assetListId: this.get("assetListId"),
        		config: this.get("config"),
        		parentId: this.get("parentId"),
        	};
        }
    });

    return Module;
});