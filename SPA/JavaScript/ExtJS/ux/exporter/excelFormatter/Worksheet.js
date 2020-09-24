/**
 * @class Ext.ux.Exporter.ExcelFormatter.Worksheet
 * @extends Object
 * Represents an Excel worksheet
 * @cfg {Ext.data.Store} store The store to use (required)
 */
Ext.define("Ext.ux.exporter.excelFormatter.Worksheet", {

	constructor: function (tree, config) {
		config = config || {};
		if (typeof (tree.getStore) == 'function')
			this.store = tree.getStore();
		else
			this.store = tree;
		Ext.applyIf(config, {
			hasTitle: true,
			hasHeadings: true,
			stripeRows: true,

			title: "Workbook",
			columns: tree.columns == undefined ? {} : Enumerable.from(tree.columns).where('x=>x.dataIndex != "id"').toArray()
		});

		Ext.apply(this, config);

		Ext.ux.exporter.excelFormatter.Worksheet.superclass.constructor.apply(this, arguments);
	},

	/**
	* @property dateFormatString
	* @type String
	* String used to format dates (defaults to "Y-m-d"). All other data types are left unmolested
	*/
	dateFormatString: "Y-m-d",

	worksheetTpl: new Ext.XTemplate(
    '<ss:Worksheet ss:Name="{title}">',
      '<ss:Names>',
        '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'{title}\'!R1:R2" />',
      '</ss:Names>',
      '<ss:Table x:FullRows="1" x:FullColumns="1" ss:ExpandedColumnCount="{colCount}" ss:ExpandedRowCount="{rowCount}">',
        '{columns}',
        '<ss:Row ss:Height="38">',
            '<ss:Cell ss:StyleID="title" ss:MergeAcross="{colCount - 1}">',
              '<ss:Data xmlns:html="http://www.w3.org/TR/REC-html40" ss:Type="String">',
                '<html:B><html:U><html:Font html:Size="15">{title}',
                '</html:Font></html:U></html:B></ss:Data><ss:NamedCell ss:Name="Print_Titles" />',
            '</ss:Cell>',
        '</ss:Row>',
        '<ss:Row ss:AutoFitHeight="1">',
          '{header}',
        '</ss:Row>',
        '{rows}',
      '</ss:Table>',
      '<x:WorksheetOptions>',
        '<x:PageSetup>',
          '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />',
          '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />',
          '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />',
        '</x:PageSetup>',
        '<x:FitToPage />',
        '<x:Print>',
          '<x:PrintErrors>Blank</x:PrintErrors>',
          '<x:FitWidth>1</x:FitWidth>',
          '<x:FitHeight>32767</x:FitHeight>',
          '<x:ValidPrinterInfo />',
          '<x:VerticalResolution>600</x:VerticalResolution>',
        '</x:Print>',
        '<x:Selected />',
        '<x:DoNotDisplayGridlines />',
        '<x:ProtectObjects>False</x:ProtectObjects>',
        '<x:ProtectScenarios>False</x:ProtectScenarios>',
      '</x:WorksheetOptions>',
    '</ss:Worksheet>'
  ),

	/**
	* Builds the Worksheet XML
	* @param {Ext.data.Store} store The store to build from
	*/
	render: function (store) {
		var rows = this.buildRows();
		var data = {
			header: this.buildHeader(),
			columns: this.buildColumns().join(""),
			rows: rows.join(""),
			colCount: this.columns.length,
			rowCount: rows.length + 2,
			title: this.title
		};
		return this.worksheetTpl.apply(data);
	},

	buildColumns: function () {
		var cols = [];

		Ext.each(this.columns, function (column) {
			cols.push(this.buildColumn());
		}, this);

		return cols;
	},

	buildColumn: function (width) {
		return Ext.String.format('<ss:Column ss:AutoFitWidth="1" ss:Width="{0}" />', width || 164);
	},

	buildRows: function () {
		var rows = [];
		var me = this;
		if (this.store.tree) {
			//convert treestore to collection of records
			var getChildRecords = function (node, me) {
				rows.push(node.data);
				if (node.childNodes.length > 0)
					for (var i in node.childNodes)
						getChildRecords(node.childNodes[i], me);
			};
			getChildRecords(this.store.tree.root);
			for (i in rows)
				rows[i] = me.buildRowFromNode(rows[i], i);
		}
		else {
			var records = this.store.data.getRange(0, this.store.data.getCount() - 1);
			for (var i in records){
				rows.push(this.buildRow(records[i], i));
			}
		}
		return rows;
	},

	buildHeader: function () {
		var cells = [];

		Ext.each(this.columns, function (col) {
			var title;

			//if(col.dataIndex != 'id') {
			if (col.text != undefined) {
				title = col.text;
			} else if (col.name) {
				//make columns taken from Record fields (e.g. with a col.name) human-readable
				title = col.name.replace(/_/g, " ");
				title = Ext.String.capitalize(title);
			}

			cells.push(Ext.String.format('<ss:Cell ss:StyleID="headercell"><ss:Data ss:Type="String">{0}</ss:Data><ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>', title));
			//}
		}, this);

		return cells.join("");
	},

	buildRow: function (record, index) {
		var style,
        cells = [];
		if (this.stripeRows === true) style = index % 2 == 0 ? 'even' : 'odd';

		Ext.each(this.columns, function (col) {
			var name = col.name || col.dataIndex;

			if (name) {
				//if given a renderer via a ColumnModel, use it and ensure data type is set to String
				if (Ext.isFunction(col.renderer)) {
					var value = col.renderer(record.get(name), null, record),
					type = this.typeMappings[col.type];
					value = Ext.util.Format.stripTags(value);
				} else {
					var value = record.get(name),
					type = this.typeMappings[col.type || record.fields.get(name).type.type];
				}

				cells.push(this.buildCell(value, type, style).render());
			}
		}, this);

		return Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join(""));
	},

	buildRowFromNode: function (nodeData, index) {
		var style,
        cells = [];
		if (this.stripeRows === true) style = index % 2 == 0 ? 'even' : 'odd';

		Ext.each(this.columns, function (col) {
			var name = col.name || col.dataIndex;

			if (name) {
				//console.log(col, name, );
				//if given a renderer via a ColumnModel, use it and ensure data type is set to String
				if (Ext.isFunction(col.renderer)) {
					var value = col.renderer(nodeData[name], null, nodeData),
					type = this.typeMappings[col.type];
					value = Ext.util.Format.stripTags(value);
				} else {
					var value = nodeData[name],
					type = this.typeMappings[col.type];
				}

				cells.push(this.buildCell(value, type, style).render());
			}
		}, this);

		return Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join(""));
	},

	buildCell: function (value, type, style) {
		if (type == "DateTime" && Ext.isFunction(value.format)) value = value.format(this.dateFormatString);

		return new Ext.ux.exporter.excelFormatter.Cell({
			value: value,
			type: type,
			style: style
		});
	},

	/**
	* @property typeMappings
	* @type Object
	* Mappings from Ext.data.Record types to Excel types
	*/
	typeMappings: {
		'int': "Number",
		'string': "String",
		'float': "Number",
		'date': "DateTime"
	}
});