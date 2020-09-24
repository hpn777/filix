define("Models/ResourceStringCollection", [
	'Models/Generics/Collection',
    'Models/ResourceString'
], function (Collection, ResourceString) {

	var ResourceStringCollection = Collection.extend({
		model: ResourceString,

		initialize: function (model, options) {
			var self = this;
			this.add([{ id: 'lockedIcon', value: './ThirdParty/extjs/extjs/css/neptune/images/grid/hmenu-lock.png' }]);
			this.add([{ id: 'addIcon', value: './ThirdParty/extjs/extjs/css/neptune/images/dd/drop-add.png' }]);
			this.add([{ id: 'deleteIcon', value: './resources/img/16/delete.png' }]);
			this.add([{ id: 'maskIcon', value: './ThirdParty/extjs/extjs/css/neptune/images/loadmask/loading.gif' }]);
			this.add([{ id: 'disconnect', value: './resources/img/16/disconnect.png' }]);
			this.add([{ id: 'extStylesheetNeptune', value: './ThirdParty/extjs/extjs/css/neptune/ext-theme-neptune-all.css' }]);
			this.add([{ id: 'extStylesheetGray', value: './ThirdParty/extjs/extjs/css/gray/ext-theme-gray-all.css' }]);
			this.add([{ id: 'extStylesheetAccess', value: './ThirdParty/extjs/extjs/css/access/ext-theme-access-all.css' }]);
			this.add([{ id: 'extStylesheetDarkGray', value: './ThirdParty/extjs/extjs/css/darkgray/ext-all-darkgray.min.css' }]);
			this.add([{ id: 'extStylesheetClassic', value: './ThirdParty/extjs/extjs/css/classic/ext-theme-classic-all.css' }]);
			this.add([{ id: 'extStylesheetCarbon', value: './ThirdParty/extjs/extjs/css/carbon/carbon.css' }]);
			
		}
	});

	return ResourceStringCollection;
});