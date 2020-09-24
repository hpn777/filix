/**
 * Membership Data Provider module
 *
 * @module DataProvider.Membership
 * @requires Core
 */
var Model = require('../../Core/Model/Model');

/**
 * Description
 *
 * @class ADServer
 * @constructor
 */
var ADServer = Model.extend({

	/**
	 * Description
	 * @method defaults
	 * @return ObjectExpression
	 */
	defaults: function () {
		return {
			server: null,
			online: true
		}
	},

	/**
	 * Description
	 * @method initialize
	 * @return 
	 */
	initialize: function () {
		
	},

	/**
	 * Description
	 * @method getServer
	 * @return CallExpression
	 */
	getServer: function(){
		return this.get('server');
	}

});
module.exports = ADServer;