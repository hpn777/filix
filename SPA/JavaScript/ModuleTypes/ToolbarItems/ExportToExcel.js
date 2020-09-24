Ext.define('ExtModules.ToolbarItems.ExportToExcel', {
	requires: [
		'Ext.ux.exporter.Exporter'
	],

	exportToExcel: function () {
		var grid = this;
		var control = this.getControl();
		return Ext.create('Ext.menu.Item', {
			text: 'Export to Excel',
			handler: function () {
				//Ext.ux.grid.Printer.print(grid);
				if (!window.BlobBuilder && window.WebKitBlobBuilder) {
					window.BlobBuilder = window.WebKitBlobBuilder;
				}
				var excelDoc = Ext.ux.exporter.Exporter.exportAny(grid, 'excel', { title: control.get("name") });
				var blob = new Blob([ excelDoc], { type: 'application/vnd.ms-excel' });
				var url = window.URL.createObjectURL(blob);
				window.open(url);
			}
		});
	}
});