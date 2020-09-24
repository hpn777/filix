Ext.define("Ext.ux.grid.Printer", {

	requires: 'Ext.XTemplate',

	statics: {
		/**
		* Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
		* @param {Ext.grid.Panel} grid The grid to print
		*/
		print: function (grid) {
			//We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
			//the other to create the body (see the escaped {} below)
			
			//account for grouped columns
			var columns = Ext.Array.filter(grid.columns, function (col) {
				return !col.hidden; // && (!col.xtype || col.xtype != "actioncolumn");
			});

			//build a useable array of store data for the XTemplate
			var data = [];
			if (grid.store.tree) {
				//convert treestore to collection of records
				var getChildRecords = function (node, me) {
					var convertedData = {};
					for (var key in node.data) {
						var value = node.data[key];

						Ext.each(columns, function (column, col) {
							if (column.dataIndex == key) {
								/*
								* TODO: add the meta to template
								*/
								var meta = { item: '', tdAttr: '', style: '' };
								value = column.renderer ? column.renderer.call(grid, value, meta, node, node.data, col, grid.store, grid.view) : value;
							}
						}, this);
						convertedData[key] = value;
					}
					data.push(convertedData);
					if (node.childNodes.length > 0)
						for (var i in node.childNodes)
							getChildRecords(node.childNodes[i], me);
				};

				getChildRecords(grid.store.tree.root);

			}
			else {
				var records = grid.store.getRange(0, grid.store.data.getCount() - 1);
				for (var i in records) {
					var item = records[i];
					var row = item.data;
					var convertedData = {};

					//apply renderers from column model
					for (var key in item.data) {
						var value = item.data[key];

						Ext.each(columns, function (column, col) {
							if (column.dataIndex == key) {
								/*
								* TODO: add the meta to template
								*/
								var meta = { item: '', tdAttr: '', style: '' };
								value = column.renderer ? column.renderer.call(grid, value, meta, item, row, col, grid.store, grid.view) : value;
							}
						}, this);
						convertedData[key] = value;
					}

					data.push(convertedData);
				}
			}

			//remove columns that do not contains dataIndex or dataIndex is empty. for example: columns filter or columns button
			var clearColumns = [];
			Ext.each(columns, function (column) {
				if (!Ext.isEmpty(column.dataIndex) && !column.hidden) {
					clearColumns.push(column);
				}
			});
			columns = clearColumns;

			//get Styles file relative location, if not supplied
			if (this.stylesheetPath === null) {
				var scriptPath = Ext.Loader.getPath('Ext.ux.grid.Printer');
				this.stylesheetPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'gridPrinterCss/print.css';
				//this.stylesheetPath = './javascript/extjs/ux/grid/gridPrinterCss/print.css';
			}

			//use the headerTpl and bodyTpl markups to create the main XTemplate below
			var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(columns);
			var body = ''; //Ext.create('Ext.XTemplate', this.bodyTpl).apply(columns);

			var index = 0;
			for (i in data) {
				var rowClass = '';
				//if (data[i].id) {
				//	if (data[i].id.split('~~').length > 0) {
				//		if (data[i].id.split('~~').length == 2)
				//			rowClass = 'posexMainRow';
				//		else
				//			rowClass = 'posexRow' + (data[i].id.split('~~').length - 2);
				//	}
				//}

				body += '<tr class="' + rowClass + '">';

				var rowBody = '';
				for (j in columns) {
					rowBody += '<td>' + data[i][columns[j].dataIndex] + '</td>';
				}
				body += rowBody + '</tr>';
				index++;
			}

			var pluginsBody = '',
                pluginsBodyMarkup = [];

			//add relevant plugins
			Ext.each(grid.plugins, function (p) {
				if (p.ptype == 'rowexpander') {
					pluginsBody += p.rowBodyTpl.join('');
				}
			});

			if (pluginsBody != '') {
				pluginsBodyMarkup = [
                    '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}"><td colspan="' + columns.length + '">',
                      pluginsBody,
                    '</td></tr>',
                ];
			}
			//Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
			var htmlMarkup = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">',
                  '<head>',
                    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
                    '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" />',
			//'<link href="/css/resources/css/ext-all-gray.css" rel="stylesheet" type="text/css" />',
                    '<title>' + grid.title + '</title>',
                  '</head>',
                  '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body">',
                  '<div class="' + Ext.baseCSSPrefix + 'ux-grid-printer-noprint ' + Ext.baseCSSPrefix + 'ux-grid-printer-links">',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
                  '</div>',
                  '<h1>' + grid.title + '</h1>',
                    '<table>',
                      '<tr>',
                        headings,
                      '</tr>',
			//                      '<tpl for=".">',
			//                        '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
                          body,
			//                        '</tr>',
			//                        pluginsBodyMarkup.join(''),
			//                      '</tpl>',
                    '</table>',
                  '</body>',
                '</html>'
            ];

			var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(data);
			//open up a new printing window, write to it, print it and close
			var win = window.open('', 'printgrid');

			//document must be open and closed
			win.document.open();
			win.document.write(html);
			win.document.close();

			//An attempt to correct the print command to the IE browser
			if (this.printAutomatically) {
				if (Ext.isIE) {
					window.print();
				} else {
					win.print();
				}
			}

			//Another way to set the closing of the main
			if (this.closeAutomaticallyAfterPrint) {
				if (Ext.isIE) {
					window.close();
				} else {
					win.close();
				}
			}
		},

		/**
		* @property stylesheetPath
		* @type String
		* The path at which the print stylesheet can be found (defaults to 'ux/grid/gridPrinterCss/print.css')
		*/
		stylesheetPath: null,

		/**
		* @property printAutomatically
		* @type Boolean
		* True to open the print dialog automatically and close the window after printing. False to simply open the print version
		* of the grid (defaults to false)
		*/
		printAutomatically: false,

		/**
		* @property closeAutomaticallyAfterPrint
		* @type Boolean
		* True to close the window automatically after printing.
		* (defaults to false)
		*/
		closeAutomaticallyAfterPrint: false,

		/**
		* @property mainTitle
		* @type String
		* Title to be used on top of the table
		* (defaults to empty)
		*/
		mainTitle: '',

		/**
		* Text show on print link
		* @type String
		*/
		printLinkText: 'Print',

		/**
		* Text show on close link
		* @type String
		*/
		closeLinkText: 'Close',

		/**
		* @property headerTpl
		* @type {Object/Array} values
		* The markup used to create the headings row. By default this just uses <th> elements, override to provide your own
		*/
		headerTpl: [
            '<tpl for=".">',
                '<th>{text}</th>',
            '</tpl>',
        ],

		/**
		* @property bodyTpl
		* @type {Object/Array} values
		* The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
		* are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
		*/
		bodyTpl: [
            '<tpl for=".">',
                '<td>\{{dataIndex}\}</td>',
            '</tpl>',
        ]
	}
});
