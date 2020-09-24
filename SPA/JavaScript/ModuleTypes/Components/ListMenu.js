Ext.define('ExtModules.Components.ListMenu', {
    extend: 'Ext.menu.Menu',
    
    idField :  'id',

    labelField :  'text',
    
    loadingText : 'Loading...',
    
    loadOnShow: true,

    single : false,

    plain: true,

    constructor : function (cfg) {
        var me = this,
            options,
            i,
            len,
            value;
            
        me.selected = [];
        me.addEvents(
            'itmSelected'
        );
    	
        me.callParent([cfg = cfg || {}]);
        if (cfg.itemClsTpl)
        	me.itemClsTpl = new Ext.Template(cfg.itemClsTpl || '{value}', { compiled: true });
        
        if(!cfg.store && cfg.options) {
            options = [];
            for(i = 0, len = cfg.options.length; i < len; i++){
                value = cfg.options[i];
                switch(Ext.type(value)){
                    case 'array':  options.push(value); break;
                    case 'object': options.push([value[me.idField], value[me.labelField]]); break;
                    case 'string': options.push([value, value]); break;
                }
            }

            me.store = Ext.create('Ext.data.ArrayStore', {
                fields: [me.idField, me.labelField],
                data:   options,
                listeners: {
                    load: me.onLoad,
                    scope:  me
                }
            });
            me.loaded = true;
            me.autoStore = true;
        } else {
            me.add({
                text: me.loadingText,
                iconCls: 'loading-indicator'
            });
            me.store.on('load', me.onLoad, me);
        }
    },

    destroy : function () {
        var me = this,
            store = me.store;
            
        if (store) {
            if (me.autoStore) {
                store.destroyStore();
            } else {
                store.un('unload', me.onLoad, me);
            }
        }
        me.callParent();
    },

    show : function () {
        var me = this;
        if (me.loadOnShow && !me.loaded && !me.store.loading) {
            me.store.load();
        }
        me.callParent();
    },

    /** @private */
    onLoad : function (store, records) {
        var me = this,
            gid, itemValue, i, len
			listeners = {
				click: me.itemSelected,
        		scope: me
			};

        records = store.data.items;

        Ext.suspendLayouts();
        me.removeAll(true);
        gid = me.single ? Ext.id() : null;
        for (i = 0, len = records.length; i < len; i++) {
        	itemValue = records[i].get(me.idField);
            me.add(Ext.create('Ext.menu.Item', {
            	text: records[i].get(me.labelField),
            	cls: me.itemClsTpl ? me.itemClsTpl.apply(records[i].data) : '',
            	//group: gid,
            	//checked: Ext.Array.contains(me.selected, itemValue),
            	//hideOnClick: false,
            	value: itemValue,
            	listeners: listeners
            }));
        }

        me.loaded = true;
        Ext.resumeLayouts(true);
        me.fireEvent('load', me, records);
    },

    itemSelected: function (a, b) {
    	var value = {};
    	value[this.idField] = a.value;
    	value[this.labelField] = a.text;

    	this.fireEvent('itmSelected', value);
    }
});
