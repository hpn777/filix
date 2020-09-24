Ext.define('ExtModules.View.GenericChart', {
	extend: 'Ext.panel.Panel',
	mixins: {
		dashboardModule: 'ExtModules.Base.DashboardModule',
		API: 'ExtModules.Helpers.API'
	},
	requires: [
		'Ext.ux.highchart.HighStock'
	],

	config: {
		dataProvider: null,
	},
	
	listeners: {

	},

	constructor: function (config) {
		var self = this;
		this.mixins.dashboardModule.constructor.call(this, config, arguments);

		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();

		this.refresh = _.debounce(function (request) {
			if (moduleConfig.listeners && moduleConfig.listeners.beforeRefresh)
				moduleConfig.listeners.beforeRefresh(self.highStockChart, self.tesseract, request)

			self.highStockChart.refresh()

			if (moduleConfig.listeners && moduleConfig.listeners.afterRefresh)
				moduleConfig.listeners.afterRefresh(self.highStockChart, self.tesseract, request)
		}, 100)

		if (moduleConfig.selectors || moduleConfig.defaultSelect) {
			this.listeners.selectionchange = function (grid, records) {
				if (records.length) {
					if (moduleConfig.defaultSelect) {
						control.get('tab').get('tabConfig').get('filters').setFilter({
							value: { columnDefinitions: self.getColumnDefinitions(), data: records[0].data },
							field: moduleConfig.defaultSelect
						});
					}

					if (moduleConfig.selectors) {
						moduleConfig.selectors.forEach(function (item) {
							control.get('tab').get('tabConfig').get('filters').setFilter({
								value: records[0].data[item.columnName],
								field: item.foreignTableName + ':' + item.foreignColumnName
							});
						});
					}
				}
			};
		}

		control.on("change:status", function () {
			var dp = self.getDataProvider()
			switch (control.get("status")) {
				case "started":
					if (!dp.subscribed)
						dp.Resubscribe()
					break;
				case "stopped":
					if (!moduleConfig.keepSubscribed) {
						dp.Unsubscribe();
					}
					break;
				case "hidden":
					if (!moduleConfig.keepSubscribed) {
						dp.Unsubscribe();
					}
					break;
				case "destroyed":
					self.unsubscribe();
			}
		}, self);

		this.setUpPanel();
	},

	resetData: function (data, request, update) {
		var self = this;
		var control = this.getControl();
		var controlConfig = this.getControlConfig();
		var moduleConfig = this.getModuleConfig();
		
		if (Array.isArray(data.header)) {
			this.multipleSources = false

			if (!this.tesseract) {
				var updatedColumns = tessioUtils.mergeColumns(data.header, moduleConfig.columns);
				this.tesseract = new app.Tesseract({
					id: control.get('id'),
					idProperty: updatedColumns[0].columnName,
					eventHorizon: app.nameResolver,
					columns: updatedColumns
				})
			}
		}
		else {
			this.multipleSources = true

			if (!this.tesseract)
				this.tesseract = {}
			
			_.each(data.header, function (series, attr) {
				if (!self.tesseract[attr]) {
					//console.log(series, moduleConfig.columns[attr])
					var updatedColumns = tessioUtils.mergeColumns(series, moduleConfig.columns[attr]);
					self.tesseract[attr] = new app.Tesseract({
						id: control.get('id') + attr,
						idProperty: updatedColumns[0].columnName,
						eventHorizon: app.nameResolver,
						columns: updatedColumns
					})
				}
			});
		}
		
		if (Array.isArray(data.data)) {
			self.tesseract[attr].update(data.data, !update)
		}
		else {
			_.each(data.data, function (series, attr) {
				self.tesseract[attr].update(series, !update)
			});
		}

		if (!this.highStockChart) {
			var chartConfig = moduleConfig.createChartConfig();
			chartConfig.plotOptions = chartConfig.plotOptions || {};
			chartConfig.plotOptions.series = chartConfig.plotOptions.series || {};
			chartConfig.plotOptions.series.events = chartConfig.plotOptions.series.events || {};
			if (!chartConfig.plotOptions.series.events.legendItemClick) {
				chartConfig.plotOptions.series.events.legendItemClick = function (event) {
					
					var conf = _.find(self.highStockChart.chartConfig.series, function (x) {
						return x.name === event.target.name
					})
					conf.visible = !event.target.visible
				}
			}

			chartConfig.series = self.createSeries();
			this.createPlotlines(chartConfig)

			this.highStockChart = Ext.create('Ext.ux.highchart.HighStock', {
				chartConfig: chartConfig
			});
			this.add(this.highStockChart);
		}
		else {
			var chartSeries = self.createSeries(this.highStockChart.chartConfig);
			this.createPlotlines(this.highStockChart.chartConfig)
			this.highStockChart.chartConfig.series = chartSeries;
		}

		this.refresh(request);
	},

	updateData: function (data, request) {
		this.resetData(data, request, true)
	},

	removeData: function (data) {
		
	},

	createSeries: function (chartConfig) {
		var self = this;
		var moduleConfig = this.getModuleConfig();
		var response = [];
		if (moduleConfig.seriesConfig) {
			_.each(moduleConfig.seriesConfig, function (item) {
				var source = item.source;
				var fields = item.fields;
				var dataTemp = source ? self.tesseract[source] : self.tesseract;

				if (!dataTemp)
					return;

				if (fields.length === 1 && item.type == 'flags') {
					var seriesData = dataTemp.getLinq().select(function (x) {
						return {
							x: x[fields[0]],
							title: 'A',
							data: x
						};
					}).toArray();
				}
				else if (fields.length == 2) {
					var enumerableData = dataTemp.getLinq()
					if (item.take)
						enumerableData = enumerableData.skip(dataTemp.dataCache.length - item.take);
					if (item.orderBy === 'ASC')
						enumerableData = enumerableData.orderBy(function (x) { return x[fields[0]] })
					if (item.orderBy === 'DESC')
						enumerableData = enumerableData.OrderByDescending(function (x) { return x[fields[0]] })
					var seriesData = enumerableData.orderBy(function (x) { return x[fields[0]] }).select(function (x) {
						var tempItem = {
							x: x[fields[0]],
							y: x[fields[1]],
							data: x
						};
						return tempItem;
					}).toArray();
				}
				else {
					var enumerableData = dataTemp.getLinq()
					if (item.orderBy === 'ASC')
						enumerableData = enumerableData.orderBy(function (x) { return x[fields[0]] })
					if (item.orderBy === 'DESC')
						enumerableData = enumerableData.OrderByDescending(function (x) { return x[fields[0]] })

					var seriesData = enumerableData.select(function (x) {
						var tempItem = [];
						for (var i = 0; i < fields.length; i++) {
							tempItem.push(x[fields[i]]);
						}
						return tempItem;
					}).toArray();
				}

				if (chartConfig) {
					item = _.find(chartConfig.series, function (x) {
						return x.id === item.id
					})

				}

				response.push(_.extend({}, item, {
					data: seriesData
				}));
			});
		}
		return response;
	},
	
	createPlotlines: function (chartConfig) {
		var self = this;
		var moduleConfig = this.getModuleConfig();
		var response = [];
		if (moduleConfig.plotLinesConfig) {
			_.each(moduleConfig.plotLinesConfig, function (item) {
				var source = item.source;
				var fields = item.fields;
				var dataTemp = source ? self.tesseract[source] : self.tesseract;

				item.value = dataTemp.dataCache[0] ? dataTemp.dataCache[0][fields[0]] : null
				if (chartConfig.yAxis[item.yAxis]) {
					chartConfig.yAxis[item.yAxis].plotLines = chartConfig.yAxis[item.yAxis].plotLines || []
					chartConfig.yAxis[item.yAxis].plotLines.push(item)
				}
			});
		}
	},

	setUpPanel: function () {
		var self = this;
		var control = this.getControl();
		var controlConfig = control.get('controlConfig');
		var moduleConfig = this.getModuleConfig();

		this.callParentConstructor.apply(this, this.getArguments());
		
		if (moduleConfig.extensionBar) {
			var toolbarItems = [];
			moduleConfig.extensionBar.forEach(function (item) {
				var generatedToolbarItem = self.getToolbarItem(item);
				if (generatedToolbarItem instanceof Array)
					generatedToolbarItem.forEach(function (subItem) { toolbarItems.push(subItem); });
				else
					toolbarItems.push(self.getToolbarItem(item));
			});

			if (toolbarItems)
				this.setUpExtensionBar(toolbarItems, 'top');
		}

		this.subscribe()

		control.set('loaded', true);
		control.set('fullyLoaded', true);
	},

	statics: {
		isInstance: function () { return true; }
	}
});
