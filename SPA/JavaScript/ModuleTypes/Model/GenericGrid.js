Ext.define('ExtModules.Model.GenericGrid', {
	statics: {
		create: function (widgetTitle, columns) {
			if (Ext.ModelManager.getModel(widgetTitle) == undefined) {
				var tempModel = new Array();
				for (i in columns) {
					var columnType = 'object';
					switch (columns[i].columnType) {
						case 'Index':
						case 'quantity':
						case 'uint':
							columnType = 'int';
							break;
						case 'PRICE':
						case 'money':
						case 'MONEY':
						case 'DEC':
						case 'percentChange':
						case 'PCNTCH':
							columnType = 'float';
							break;
						case 'bool':
							columnType = 'boolean';
							break;
						case 'REALDATE':
							columnType = 'date';
							break;
					}
					var tempmodelElement = { name: columns[i].columnName, type: columnType, useNull: true };
					console.log(tempmodelElement)
					tempModel.push(tempmodelElement);
				}
				Ext.define(widgetTitle, {
					extend: 'Ext.data.Model',
					fields: tempModel
				});
			}
		},

		createFromCSV: function (modelName, columns) {
			for (i in columns) {
				var columnType = 'object';
				var tempmodelElement = { name: columns[i], type: columnType, useNull: true };
				tempModel.push(tempmodelElement);
			}
			Ext.define(modelName, {
				extend: 'Ext.data.Model',
				fields: tempModel
			});
		}
	}
});