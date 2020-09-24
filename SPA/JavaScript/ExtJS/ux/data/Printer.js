Ext.define("Ext.ux.data.Printer", {

	requires: 'Ext.XTemplate',

	config:{
		stylesheetPath: '../css/print.css',

		printAutomatically: false,

		closeAutomaticallyAfterPrint: false,

		title: '',

		printLinkText: 'Print',

		closeLinkText: 'Close',
	},

	constructor: function (config) {
		this.initConfig(config);
		this.superclass.constructor.apply(this, arguments);
	},

	print: function (data, model) {

		var content = '';
		if (typeof data == 'string') {
			content = data;
		}
		else {
			content += '<table>';
			if (model) {
				for (var attr in data) {
					var modelAttribute = Ext.Array.findBy(model, function (item) {
						return item.name == i;
					});
					content += '<tr><td>' + attr + '</td><td>' + data[attr] + '</td></tr>';
				}
			}
			else {
				for (var attr in data) {
					content += '<tr><td>' + attr + '</td><td>' + data[attr] + '</td></tr>';
				}
			}
			
			content += '</table>';
		}

		//Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
		var htmlMarkup = [
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
            '<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">',
                '<head>',
                '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
                '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" />',
		//'<link href="/css/resources/css/ext-all-gray.css" rel="stylesheet" type="text/css" />',
                '<title>' + this.getTitle() + '</title>',
                '</head>',
                '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body">',
					'<div class="' + Ext.baseCSSPrefix + 'ux-grid-printer-noprint ' + Ext.baseCSSPrefix + 'ux-grid-printer-links">',
						'<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
						'<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
					'</div>',
					//'<h1>' + this.getTitle() + '</h1>',
					content,
                '</body>',
            '</html>'
		];

		var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(data);
		//open up a new printing window, write to it, print it and close
		var win = window.open('', 'printpanel');

		//document must be open and closed
		win.document.open();
		win.document.write(html);
		win.document.close();

		//An attempt to correct the print command to the IE browser
		if (this.printAutomatically) {
			setTimeout(function () {
				if (Ext.isIE) {
					window.print();
				} else {
					win.print();
				}
				//Another way to set the closing of the main
				if (this.closeAutomaticallyAfterPrint) {
					if (Ext.isIE) {
						window.close();
					} else {
						win.close();
					}
				}
			}, 0);
			
		}
	}
});
