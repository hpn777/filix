Ext.define('ExtModules.Store.BasicTree', {
	createBasicTreeStore: function (model) {
		var store = Ext.create('Ext.data.TreeStore', {
			model: model,
			proxy: {
				type: 'memory',
				reader: {
					type: 'json'
				}
			},
			setRootNode: function (root, /* private */ preventLoad) {
				var me = this,
					model = me.model,
					idProperty = model.prototype.idProperty

				root = root || {};
				if (!root.isModel) {
					root = Ext.apply({}, root);
					// create a default rootNode and create internal data struct.
					Ext.applyIf(root, {
						id: me.defaultRootId,
						text: me.defaultRootText,
						allowDrag: false
					});
					if (root[idProperty] === undefined) {
						root[idProperty] = me.defaultRootId;
					}
						
					Ext.data.NodeInterface.decorate(model);
					root = Ext.ModelManager.create(root, model);
				} else if (root.isModel && !root.isNode) {
					Ext.data.NodeInterface.decorate(model);
				}

				me.getProxy().getReader().buildExtractors(true);

				me.tree.setRootNode(root);

				if (preventLoad !== true && !root.isLoaded() && (me.autoLoad === true || root.isExpanded())) {
					root.data.expanded = false;
					root.expand();
				}

				this.fireEvent('load', this);

				return root;
			},
			//sort: function (sorters, direction, where, doSort) {
			//	return this.ownerTree.getView().store.sort(sorters, direction, where, doSort);
			//},
		});
		return store;
	}
}); 