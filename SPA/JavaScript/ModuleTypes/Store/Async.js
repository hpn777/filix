Ext.define('ExtModules.Store.Async', {
	extend: 'Ext.data.Store',
	alias: 'store.asyncjson',
	requires: [
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Json',
        'Ext.data.writer.Json'
    ],

	constructor: function (config) {
		var me = this;
		config = Ext.apply({
			proxy: {
				type: 'ajax',
				reader: 'json',
				writer: 'json'
			}
		}, config);

		this.updateAndRefreshData = _.debounce(function (records, requireReload) {
			if ((me.grid.verticalScroller.getFirstVisibleRowIndex() === 0 && requireReload)) {
				me.load()
			}
			else {
				me.grid.getView().refresh()
			}
		}, 300);

		this.callParent([config]);
	},

	onProxyPrefetch: function (operation) {
		var me = this,
            resultSet = operation.getResultSet(),
            records = operation.getRecords(),
            successful = operation.wasSuccessful(),
            page = operation.page;
		
		// Only cache the data if the operation was invoked for the current generation of the page map.
		// If the generation has changed since the request was fired off, it will have been cancelled.
		if (operation.pageMapGeneration === me.data.pageMapGeneration) {

			if (resultSet) {
				me.totalCount = resultSet.total;
				me.fireEvent('totalcountchange', me.totalCount);
			}

			// Remove the loaded page from the outstanding pages hash
			if (page !== undefined) {
				delete me.pageRequests[page];
			}

			// Prefetch is broadcast before the page is cached
			me.loading = false;
			
			me.fireEvent('prefetch', me, records, successful, operation);

			// Add the page into the page map.
			// pageAdded event may trigger the onGuaranteedRange
			if (successful) {
				me.cachePage(records, operation.page, operation.response.data);
			}

			//this is a callback that would have been passed to the 'read' function and is optional
			Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
		}
	},
	
	cachePage: function (records, page, options) {
		var me = this,
            len = records.length, i;

        if (!Ext.isDefined(me.totalCount)) {
            me.totalCount = records.length;
            me.fireEvent('totalcountchange', me.totalCount);
        }
        
		// Add the fetched page into the pageCache
        if (options.reload) {
        	//me.data.clear(true);
        	for (i = 0; i < len; i++) {
        		records[i].join(this);
        	}
        	this.data.addPage(page, records);
        	//me.data.fireEvent('pageAdded', page, records);
        }
        else if (options.type == 'remove') {
        	this.removeAll()
        	this.updateAndRefreshData([], true)
        }
        else {
			var requireReload = false;
			var idProperty = this.grid.tesseract.idProperty
        	_.each(records, (item) => {
				var record = this.getById(item.raw[idProperty])
        		if (record) {
        			var newRecord = this.model.create(item.raw);
        			record.data = newRecord.data;
        			record.dirty = false;
        			record.modified = {};
        		}
        		else{
					requireReload = true
					
				}
        	})
        	this.updateAndRefreshData(records, requireReload)
        }
	},

	loadToPrefetch: function (options) {
		var me = this,
            i,
            records,
            dataSetSize,
            prefetchOptions = options,

            // Get the requested record index range in the dataset
            startIdx = options.start,
            endIdx = options.start + options.limit - 1,

            // The end index to load into the store's live record collection
            loadEndIdx = Math.min(endIdx, options.start + (me.viewSize || options.limit) - 1),

            // Calculate a page range which encompasses the requested range plus both buffer zones.
            // The endPage will be adjusted to be in the dataset size range as soon as the first data block returns.
            startPage = me.getPageFromRecordIndex(Math.max(startIdx - me.trailingBufferZone, 0)),
            endPage = me.getPageFromRecordIndex(endIdx + me.leadingBufferZone),

            // Wait for the viewable range to be available
            waitForRequestedRange = function () {
            	if (me.rangeCached(startIdx, loadEndIdx)) {
            		me.loading = false;
            		records = me.data.getRange(startIdx, loadEndIdx);
            		me.data.un('pageAdded', waitForRequestedRange);
            		// If there is a listener for guranteedrange then fire that event
            		if (me.hasListeners.guaranteedrange) {
            			me.guaranteeRange(startIdx, loadEndIdx, options.callback, options.scope);
            		}
            		if (options.callback) {
            			options.callback.call(options.scope || me, records, startIdx, endIdx, options);
            		}

            		me.fireEvent('datachanged', me);
            		me.fireEvent('refresh', me);
            		me.fireEvent('load', me, records, true);
            		if (options.groupChange) {
            			me.fireGroupChange();
            		}
            	}
            };
		
		if (me.fireEvent('beforeload', me, options) !== false) {

			// So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
			delete me.totalCount;

			me.loading = true;

			// Any configured callback is handled in waitForRequestedRange above.
			// It should not be processed by onProxyPrefetch.
			if (options.callback) {
				prefetchOptions = Ext.apply({}, options);
				delete options.callback;
			}

			// Load the first page in the range, which will give us the initial total count.
			// Once it is loaded, go ahead and prefetch any subsequent pages, if necessary.
			// The prefetchPage has a check to prevent us loading more than the totalCount,
			// so we don't want to blindly load up <n> pages where it isn't required. 
			me.on('prefetch', function (records, successful, operation) {
				if (successful) {
					// If there is data in the dataset, we can go ahead and add the pageAdded listener which waits for the visible range
					// and we can also issue the requests to fill the surrounding buffer zones.
					if ((dataSetSize = me.getTotalCount())) {
						// Wait for the requested range to become available in the page map
						me.data.on('pageAdded', waitForRequestedRange);

						// As soon as we have the size of the dataset, ensure we are not waiting for more than can ever arrive,
						// And make sure we never ask for pages beyond the end of the dataset.
						loadEndIdx = Math.min(loadEndIdx, dataSetSize - 1);
						endPage = me.getPageFromRecordIndex(loadEndIdx);

						for (i = startPage + 1; i <= endPage; ++i) {
							me.prefetchPage(i, prefetchOptions);
						}
					} else {
						me.fireEvent('datachanged', me);
						me.fireEvent('refresh', me);
						me.fireEvent('load', me, records, true);
					}
				}
					// Unsuccessful prefetch: fire a load event with success false.
				else {
					me.fireEvent('load', me, records, false);
				}
			}, null, { single: true });

			me.prefetchPage(startPage, prefetchOptions);
		}
	},
	prefetch: function (options) {
		var me = this,
            pageSize = me.pageSize,
            proxy,
            operation;

		// Check pageSize has not been tampered with. That would break page caching
		if (pageSize) {
			if (me.lastPageSize && pageSize != me.lastPageSize) {
				Ext.Error.raise("pageSize cannot be dynamically altered");
			}
			if (!me.data.pageSize) {
				me.data.pageSize = pageSize;
			}
		}

			// Allow first prefetch call to imply the required page size.
		else {
			me.pageSize = me.data.pageSize = pageSize = options.limit;
		}

		// So that we can check for tampering next time through
		me.lastPageSize = pageSize;

		// Always get whole pages.
		if (!options.page) {
			options.page = me.getPageFromRecordIndex(options.start);
			options.start = (options.page - 1) * pageSize;
			options.limit = Math.ceil(options.limit / pageSize) * pageSize;
		}

		// Currently not requesting this page, then request it...
		if (!me.pageRequests[options.page]) {

			// Copy options into a new object so as not to mutate passed in objects
			options = Ext.apply({
				action: 'read',
				filters: me.filters.items,
				sorters: me.sorters.items,
				groupers: me.groupers.items,

				// Generation # of the page map to which the requested records belong.
				// If page map is cleared while this request is in flight, the generation will increment and the payload will be rejected
				pageMapGeneration: me.data.pageMapGeneration
			}, options);

			operation = new Ext.data.Operation(options);

			if (me.fireEvent('beforeprefetch', me, operation) !== false) {
				proxy = me.proxy;
				me.pageRequests[options.page] = proxy.read(operation, me.onProxyPrefetch, me);
				if (proxy.isSynchronous) {
					delete me.pageRequests[options.page];
				}
			}
		}

		return me;
	},
	prefetchRange: function (start, end) {
		var me = this,
            startPage, endPage, page;
		if (!me.rangeCached(start, end)) {
			startPage = me.getPageFromRecordIndex(start);
			endPage = me.getPageFromRecordIndex(end);

			// Ensure that the page cache's max size is correct.
			// Our purgePageCount is the number of additional pages *outside of the required range* which
			// may be kept in the cache. A purgePageCount of zero means unlimited.
			me.data.maxSize = me.purgePageCount ? (endPage - startPage + 1) + me.purgePageCount : 0;

			// We have the range, but ensure that we have a "buffer" of pages around it.
			for (page = startPage; page <= endPage; page++) {
				if (!me.pageCached(page)) {
					me.prefetchPage(page);
				}
			}
		}
	},
	loadRecords: function (records, options) {
		var me = this,
            i = 0,
            length = records.length,
            start,
            addRecords,
            snapshot = me.snapshot;
		
		if (options) {
			start = options.start;
			addRecords = options.addRecords;
		}

		if (!addRecords) {
			delete me.snapshot;
			me.clearData(true);
		} else if (snapshot) {
			snapshot.addAll(records);
		}

		me.data.addAll(records);

		if (start !== undefined) {
			for (; i < length; i++) {
				records[i].index = start + i;
				records[i].join(me);
			}
		} else {
			for (; i < length; i++) {
				records[i].join(me);
			}
		}

		/*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
		me.suspendEvents();

		if (me.filterOnLoad && !me.remoteFilter) {
			me.filter();
		}

		if (me.sortOnLoad && !me.remoteSort) {
			me.sort(undefined, undefined, undefined, true);
		}

		me.resumeEvents();
		if (me.isGrouped()) {
			me.constructGroups();
		}
		me.fireEvent('datachanged', me);
		me.fireEvent('refresh', me);
	}
});
