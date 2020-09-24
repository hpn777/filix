Ext.define('Ext.ux.grid.FiltersFeature', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.filters',
    requires: [
        'Ext.ux.grid.menu.ListMenu',
        'Ext.ux.grid.menu.RangeMenu',
        'Ext.ux.grid.filter.BooleanFilter',
        'Ext.ux.grid.filter.DateFilter',
        'Ext.ux.grid.filter.DateTimeFilter',
        'Ext.ux.grid.filter.ListFilter',
        'Ext.ux.grid.filter.NumericFilter',
        'Ext.ux.grid.filter.StringFilter',
		'Ext.ux.grid.filter.GenericFilter',
		'Ext.ux.grid.filter.ResolverFilter'
    ],

    autoReload: true,
    filterCls: 'ux-filtered-column',
    local : false,
    menuFilterText : 'Filters',
    paramPrefix : 'filter',
    showMenu : true,
    stateId : undefined,
    updateBuffer : 0,

    // doesn't handle grid body events
    hasFeatureEvent: false,


    /** @private */
    constructor : function (config) {
        var me = this;

        config = config || {};
        Ext.apply(me, config);

        me.deferredUpdate = Ext.create('Ext.util.DelayedTask', me.reload, me);

        // Init filters
        me.filters = me.createFiltersCollection();
        me.filterConfigs = config.filters;
    },

    init: function(grid) {
        var me = this,
            view = me.view,
            headerCt = view.headerCt;

        me.bindStore(view.getStore(), true);
        // Listen for header menu being created
        headerCt.on('menucreate', me.onMenuCreate, me);

        view.on('refresh', me.onRefresh, me);
        grid.on({
            scope: me,
            beforestaterestore: me.applyState,
            beforestatesave: me.saveState,
            beforedestroy: me.destroy
        });

        // Add event and filters shortcut on grid panel
        grid.filters = me;
        grid.addEvents('filterupdate');
        grid.addEvents('beforefilter');
        grid.on('added', function () {
        	me.createFilters();
        });
    },

    createFiltersCollection: function () {
        return Ext.create('Ext.util.MixedCollection', false, function (o) {
            return o ? o.dataIndex : null;
        });
    },

    /**
     * @private Create the Filter objects for the current configuration, destroying any existing ones first.
     */
    createFilters: function() {
        var me = this,
            hadFilters = me.filters.getCount(),
            grid = me.getGridPanel(),
            filters = me.createFiltersCollection(),
            model = grid.store.model,
            fields = model.prototype.fields,
            field,
            filter,
            state;

        function add (dataIndex, config, filterable) {
            if (dataIndex && (filterable || config)) {
                field = fields.get(dataIndex);
                filter = {
                    dataIndex: dataIndex,
                    type: (field && field.type && field.type.type) || 'auto'
                };

                if (Ext.isObject(config)) {
                    Ext.apply(filter, config);
                }

                filters.replace(filter);
            }
        }

        // We start with filters from our config
        Ext.Array.each(me.filterConfigs, function (filterConfig) {
            add(filterConfig.dataIndex, filterConfig);
        });

        // Then we merge on filters from the columns in the grid. The columns' filters take precedence.
        Ext.Array.each(grid.columns, function (column) {
            if (column.filterable === false) {
                filters.removeAtKey(column.dataIndex);
            } else {
                add(column.dataIndex, column.filter, column.filterable);
            }
        });
        
        me.removeAll();
        if (filters.items) {
			me.initializeFilters(filters.items);
        }
        if (hadFilters) {
        	me.applyState(grid, state);
        }
    },

    /**
     * @private
     */
    initializeFilters: function (filters) {
        var me = this,
            filtersLength = filters.length,
            i, filter, FilterClass;
            	
        for (i = 0; i < filtersLength; i++) {
            filter = filters[i];
            if (filter) {
            	FilterClass = me.getFilterClass(filter.type);
            	filter = filter.menu ? filter : new FilterClass(filter);
            	if (filter.type == 'custom')
            		filter.customFilter.filter = filter;

                me.filters.add(filter);
                Ext.util.Observable.capture(filter, this.onStateChange, this);
            }
        }
        me.filterFunction = me.getRecordFilter()
    },

    /**
     * @private Handle creation of the grid's header menu. Initializes the filters and listens
     * for the menu being shown.
     */
    onMenuCreate: function(headerCt, menu) {
        var me = this;
       
        menu.on('beforeshow', me.onMenuBeforeShow, me);
    },

    /**
     * @private Handle showing of the grid's header menu. Sets up the filter item and menu
     * appropriate for the target column.
     */
    onMenuBeforeShow: function(menu) {
        var me = this,
            menuItem, filter;

        if (me.showMenu) {
            menuItem = me.menuItem;
            if (!menuItem || menuItem.isDestroyed) {
                me.createMenuItem(menu);
                menuItem = me.menuItem;
            }

            filter = me.getMenuFilter();

            if (filter) {
                menuItem.setMenu(filter.menu, false);
                menuItem.setChecked(filter.active);
                // disable the menu if filter.disabled explicitly set to true
                menuItem.setDisabled(filter.disabled === true);
            }
            menuItem.setVisible(!!filter);
            this.sep.setVisible(!!filter);
        }
    },


    createMenuItem: function(menu) {
        var me = this;
        me.sep  = menu.add('-');
        me.menuItem = menu.add({
            checked: false,
            itemId: 'filters',
            text: me.menuFilterText,
            listeners: {
                scope: me,
                checkchange: me.onCheckChange,
                beforecheckchange: me.onBeforeCheck
            }
        });
    },

    getGridPanel: function() {
    	return this.view.up('gridpanel') || this.view.up('treepanel');
    },

    /**
     * @private
     * Handler for the grid's beforestaterestore event (fires before the state of the
     * grid is restored).
     * @param {Object} grid The grid object
     * @param {Object} state The hash of state values returned from the StateProvider.
     */
    applyState : function (grid, state) {
        var me = this,
            key, filter;
        var functionArgs = arguments;

        me.applyingState = true;
        me.clearFilters();
        if (state&&state.filters) {
        	if (me.filters.items.length) {
        		_.each(state.filters, function (item, key) {
        			filter = me.filters.get(key);
        			if (filter) {
        				filter.setValue(item);
        				filter.setActive(true);
        			}
        		});
				me.deferredUpdate.cancel();
				if (me.local) {
					me.reload();
				}
				delete state.filters;
        	}
        	else if (grid.getControl) {
        		this.initialState = state;
        		(function () {
        			var self = me;
        			var tempArgs = functionArgs;
        			var control = grid.getControl();
        			control.off('change:fullyLoaded', null, self);
        			control.on('change:fullyLoaded', function () {
        				if (control.get('fullyLoaded')) {
        					control.off('change:fullyLoaded', null, self);
        					self.applyState.apply(self, tempArgs);
        				}
        			}, self);
        		})();
        		
        	}
        }
        delete me.applyingState;
    },

    /**
     * Saves the state of all active filters
     * @param {Object} grid
     * @param {Object} state
     * @return {Boolean}
     */
    saveState : function (grid, state) {
    	var filters = {};
        this.filters.each(function (filter) {
            if (filter.active) {
            	filters[filter.dataIndex] = filter.getValue();
            }
        });
        
        return (state.filters = filters);
    },

    /**
     * @private
     * Handler called by the grid 'beforedestroy' event
     */
    destroy : function () {
        var me = this;
        Ext.destroyMembers(me, 'menuItem', 'sep');
        me.removeAll();
        me.clearListeners();
    },

    /**
     * Remove all filters, permanently destroying them.
     */
    removeAll : function () {
        if(this.filters){
            Ext.destroy.apply(Ext, this.filters.items);
            // remove all items from the collection
            this.filters.clear();
        }
    },


    /**
     * Changes the data store bound to this view and refreshes it.
     * @param {Ext.data.Store} store The store to bind to this view
     */
    bindStore : function(store) {
        var me = this;

        // Unbind from the old Store
        if (me.store && me.storeListeners) {
            me.store.un(me.storeListeners);
        }

        // Set up correct listeners
        if (store) {
            me.storeListeners = {
                scope: me
            };
            if (me.local) {
            	me.storeListeners.load = me.onLoad;
            	//me.storeListeners.filterchange = me.onLoad;
            } else {
                me.storeListeners['before' + (store.buffered ? 'prefetch' : 'load')] = me.onBeforeLoad;
            }
            store.on(me.storeListeners);
        } else {
            delete me.storeListeners;
        }
        me.store = store;
    },

    /**
     * @private
     * Get the filter menu from the filters MixedCollection based on the clicked header
     */
    getMenuFilter : function () {
        var header = this.view.headerCt.getMenu().activeHeader;
        return header ? this.filters.get(header.dataIndex) : null;
    },

    /** @private */
    onCheckChange : function (item, value) {
        this.getMenuFilter().setActive(value);
    },

    /** @private */
    onBeforeCheck : function (check, value) {
        return !value || this.getMenuFilter().isActivatable();
    },

    /**
     * @private
     * Handler for all events on filters.
     * @param {String} event Event name
     * @param {Object} filter Standard signature of the event before the event is fired
     */
    onStateChange : function (event, filter) {
        if (event !== 'serialize') {
            var me = this,
                grid = me.getGridPanel();

            if (filter == me.getMenuFilter()) {
                me.menuItem.setChecked(filter.active, false);
            }

            if ((me.autoReload || me.local) && !me.applyingState) {
                me.deferredUpdate.delay(me.updateBuffer);
            }
            me.updateColumnHeadings();

            if (!me.applyingState) {
                grid.saveState();
            }
            me.filterFunction = me.getRecordFilter()
			grid.fireEvent('filterupdate', me, filter);
        }
    },

    /**
     * @private
     * Handler for store's beforeload event when configured for remote filtering
     * @param {Object} store
     * @param {Object} options
     */
    onBeforeLoad : function (store, options) {
        options.params = options.params || {};
        this.cleanParams(options.params);
        var params = this.buildQuery(this.getFilterData());
        Ext.apply(options.params, params);
    },

    /**
     * @private
     * Handler for store's load event when configured for local filtering
     * @param {Object} store
     */
    onLoad: function (store) {
    	if (!this.getGridPanel().fireEvent('beforefilter'))
    		return;
    	store.filterBy(this.getRecordFilter());
    },

    /**
     * @private
     * Handler called when the grid's view is refreshed
     */
    onRefresh : function () {
        this.updateColumnHeadings();
    },

    /**
     * Update the styles for the header row based on the active filters
     */
    updateColumnHeadings : function () {
        var me = this,
            headerCt = me.view.headerCt;
        if (headerCt) {
            headerCt.items.each(function(header) {
                var filter = me.getFilter(header.dataIndex);
                header[filter && filter.active ? 'addCls' : 'removeCls'](me.filterCls);
            });
        }
    },

    /** @private */
    reload: function () {
        var me = this,
            store = me.view.getStore();

        if (!this.getGridPanel().fireEvent('beforefilter'))
        	return;

        if (me.local) {
        	store.clearFilter(true);
        	store.filterBy(me.getRecordFilter());
            store.sort();
        } else {
            me.deferredUpdate.cancel();
            if (store.buffered) {
                store.data.clear();
            }
            store.loadPage(1);
        }
    },

    /**
     * Method factory that generates a record validator for the filters active at the time
     * of invokation.
     * @private
     */
    getRecordFilter : function () {
        var f = [], len, i;
        this.filters.each(function (filter) {
            if (filter.active) {
                f.push(filter);
            }
        });

        len = f.length;
        
        return function (record) {
			if(record)
				for (i = 0; i < len; i++) {
            		if (!f[i].validateRecord(record)) {
						return false;
					}
				}

            return true;
        };
    },

    /**
     * Adds a filter to the collection and observes it for state change.
     * @param {Object/Ext.ux.grid.filter.Filter} config A filter configuration or a filter object.
     * @return {Ext.ux.grid.filter.Filter} The existing or newly created filter object.
     */
    addFilter : function (config) {
        var me = this,
            columns = me.getGridPanel().columns,
            i, columnsLength, column, filtersLength, filter;

        
        for (i = 0, columnsLength = columns.length; i < columnsLength; i++) {
            column = columns[i];
            if (column.dataIndex === config.dataIndex) {
                column.filter = config;
            }
        }
        
        if (me.view.headerCt.menu) {
            me.createFilters();
        } else {
            // Call getMenu() to ensure the menu is created, and so, also are the filters. We cannot call
            // createFilters() withouth having a menu because it will cause in a recursion to applyState()
            // that ends up to clear all the filter values. This is likely to happen when we reorder a column
            // and then add a new filter before the menu is recreated.
            me.view.headerCt.getMenu();
        }
        
        for (i = 0, filtersLength = me.filters.items.length; i < filtersLength; i++) {
            filter = me.filters.items[i];
            if (filter.dataIndex === config.dataIndex) {
                return filter;
            }
        }
    },

    /**
     * Adds filters to the collection.
     * @param {Array} filters An Array of filter configuration objects.
     */
    addFilters : function (filters) {
        if (filters) {
            var me = this,
                i, filtersLength;
            for (i = 0, filtersLength = filters.length; i < filtersLength; i++) {
                me.addFilter(filters[i]);
            }
        }
    },

    /**
     * Returns a filter for the given dataIndex, if one exists.
     * @param {String} dataIndex The dataIndex of the desired filter object.
     * @return {Ext.ux.grid.filter.Filter}
     */
    getFilter : function (dataIndex) {
        return this.filters.get(dataIndex);
    },

    /**
     * Turns all filters off. This does not clear the configuration information
     * (see {@link #removeAll}).
     */
    clearFilters : function () {
        this.filters.each(function (filter) {
            filter.setActive(false);
        });
    },

    getFilterItems: function () {
        var me = this;

        // If there's a locked grid then we must get the filter items for each grid.
        if (me.lockingPartner) {
            return me.filters.items.concat(me.lockingPartner.filters.items);
        }

        return me.filters.items;
    },

    /**
     * Returns an Array of the currently active filters.
     * @return {Array} filters Array of the currently active filters.
     */
    getFilterData : function () {
        var items = this.getFilterItems(),
            filters = [],
            n, nlen, item, d, i, len;

        for (n = 0, nlen = items.length; n < nlen; n++) {
            item = items[n];
            if (item.active) {
                d = [].concat(item.serialize());
                for (i = 0, len = d.length; i < len; i++) {
                    filters.push({
                        field: item.dataIndex,
                        data: d[i]
                    });
                }
            }
        }
        return filters;
    },

    /**
     * Function to take the active filters data and build it into a query.
     * The format of the query depends on the {@link #encode} configuration:
     *
     *   - `false` (Default) :
     *     Flatten into query string of the form (assuming <code>{@link #paramPrefix}='filters'</code>:
     *
     *         filters[0][field]="someDataIndex"&
     *         filters[0][data][comparison]="someValue1"&
     *         filters[0][data][type]="someValue2"&
     *         filters[0][data][value]="someValue3"&
     *
     *
     *   - `true` :
     *     JSON encode the filter data
     *
     *         {filters:[{"field":"someDataIndex","comparison":"someValue1","type":"someValue2","value":"someValue3"}]}
     *
     * Override this method to customize the format of the filter query for remote requests.
     *
     * @param {Array} filters A collection of objects representing active filters and their configuration.
     * Each element will take the form of {field: dataIndex, data: filterConf}. dataIndex is not assured
     * to be unique as any one filter may be a composite of more basic filters for the same dataIndex.
     *
     * @return {Object} Query keys and values
     */
    buildQuery : function (filters) {
        var p = {}, i, f, root, dataPrefix, key, tmp,
            len = filters.length;

        if (!this.encode){
            for (i = 0; i < len; i++) {
                f = filters[i];
                root = [this.paramPrefix, '[', i, ']'].join('');
                p[root + '[field]'] = f.field;

                dataPrefix = root + '[data]';
                for (key in f.data) {
                    p[[dataPrefix, '[', key, ']'].join('')] = f.data[key];
                }
            }
        } else {
            tmp = [];
            for (i = 0; i < len; i++) {
                f = filters[i];
                tmp.push(Ext.apply(
                    {},
                    {field: f.field},
                    f.data
                ));
            }
            // only build if there is active filter
            if (tmp.length > 0){
                p[this.paramPrefix] = tmp;
            }
        }
        return p;
    },

    /**
     * Removes filter related query parameters from the provided object.
     * @param {Object} p Query parameters that may contain filter related fields.
     */
    cleanParams : function (p) {
        // if encoding just delete the property
        if (this.encode) {
            delete p[this.paramPrefix];
        // otherwise scrub the object of filter data
        } else {
            var regex, key;
            regex = new RegExp('^' + this.paramPrefix + '\[[0-9]+\]');
            for (key in p) {
                if (regex.test(key)) {
                    delete p[key];
                }
            }
        }
    },

    /**
     * Function for locating filter classes, overwrite this with your favorite
     * loader to provide dynamic filter loading.
     * @param {String} type The type of filter to load ('Filter' is automatically
     * appended to the passed type; eg, 'string' becomes 'StringFilter').
     * @return {Function} The Ext.ux.grid.filter.Class
     */
    getFilterClass: function (type) {
        // map the supported Ext.data.Field type values into a supported filter
        switch(type) {
            case 'auto':
				type = 'string';
				break;
            case 'int':
            case 'float':
				type = 'numeric';
				break;
            case 'bool':
				type = 'boolean';
				break;
        	case 'custom':
        		type = 'generic';
        		break;
        }
        return Ext.ClassManager.getByAlias('gridfilter.' + type);
    }
});
