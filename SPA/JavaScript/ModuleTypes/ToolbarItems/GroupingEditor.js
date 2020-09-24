Ext.define('ExtModules.ToolbarItems.GroupingEditor', {

	requires: [
		'ExtModules.plugins.DragZone',
		'ExtModules.plugins.DropZone'
	],

	groupingEditor: function () {
		var panel = this;
		this.setupTreeGroupingStore();
		var treeGroupingStore = panel.getTreeGroupingStore();
		var itemId = panel.id;

		return Ext.create('Ext.view.View', {
			store: treeGroupingStore,
			height: 14,
			margin: 6,
			flex: 1,
			trackOver: true,
			overItemCls: 'x-item-over',
			itemSelector: 'span.thumb-wrap',
			emptyText: 'Drag column here to group by...',
			plugins: [
				Ext.create('Ext.ux.DataView.DragSelector', {}),
			//Ext.create('Ext.ux.DataView.LabelEditor', {dataIndex: 'name'})
			],
			tpl: [
				'<span class="x-column-header-inner">Group by: </span>',
				'<tpl for=".">',
					'<span class="thumb-wrap" style="" id="{dataIndex}">',
					'<span style="padding: 2px; background-color: #aaa; color: #000; border-radius: 3px; cursor: pointer;" class="x-editable x-column-header-inner">{title}</span>&nbsp;</span>',
				'</tpl>'
			],
			multiSelect: true,
			trackOver: true,
			listeners: {
				selectionchange: function (that, record) {
					if (record.length > 0) {
						if (record[0].data.dataIndex != 'All') {
							treeGroupingStore.remove(record);
							treeGroupingStore.commitChanges();
							
							panel.storeGroupingColumns();
						}
					}
				},
				render: function (v) {
					this.dragZone = new ExtModules.plugins.DragZone(v, 'header-dd-zone-' + itemId);
					this.dropZone = new ExtModules.plugins.DropZone({
						view: v,
						ddGroup: 'header-dd-zone-' + itemId,
						headerDrop: function (node, dragZone, e, data, location) {
							var underNode = Ext.get(node);
							var tmpIndex = treeGroupingStore.findExact('dataIndex', underNode.id);
							if (location == 'after')
								tmpIndex++;

							treeGroupingStore.insert(tmpIndex, { dataIndex: data.header.dataIndex, title: data.header.text });
							treeGroupingStore.commitChanges();
							v.refresh();

							panel.storeGroupingColumns();
						},
						itemDrop: function (node, dragZone, e, data, location) {
							var underNode = Ext.get(node);
							var tmpIndex = treeGroupingStore.findExact('dataIndex', underNode.id);
							if (location == 'after')
								tmpIndex++;

							var record = treeGroupingStore.findRecord('dataIndex', data.itemData.dataIndex);
							treeGroupingStore.remove(record);
							treeGroupingStore.insert(tmpIndex, record);
							treeGroupingStore.commitChanges();
							v.refresh();

							panel.storeGroupingColumns();
						}
					});
				},
				buffer: 10
			}
		});
	}

});