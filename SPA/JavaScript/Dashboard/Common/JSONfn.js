window.JSONfn = (new(function() {
	var me = this,
    encodingFunction,
    decodingFunction,
    useNative = null,
    useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
    	return false;
    },
    pad = function(n) {
    	return n < 10 ? "0" + n : n;
    },
    doDecode = function (json, scope) {
    	scope = scope || {};
    	return (new Function("var self = this; return " + json + ';')).bind(scope)();
    },
    doEncode = function(o, newline) {
    	if (o === null || o === undefined) {
    		return "null";
    	} else if (isDate(o)) {
    		return encodeDate(o);
    	} else if (isString(o)) {
    		return encodeString(o);
    	} else if (typeof o == "number") {
    		//don't use isNumber here, since finite checks happen inside isNumber
    		return isFinite(o) ? String(o) : "null";
    	} else if (isBoolean(o)) {
    		return String(o);
    	}
    		// Allow custom zerialization by adding a toJSON method to any object type.
    		// Date/String have a toJSON in some environments, so check these first.
    	else if (o.toJSON) {
    		return o.toJSON();
    	} else if (isArray(o)) {
    		return encodeArray(o, newline);
    	} else if (isObject(o)) {
    		return encodeObject(o, newline);
    	} else if (typeof o === "function") {
    		return o.toString();
    	}
    	return 'undefined';
    },
    m = {
    	"\b": '\\b',
    	"\t": '\\t',
    	"\n": '\\n',
    	"\f": '\\f',
    	"\r": '\\r',
    	'"': '\\"',
    	"\\": '\\\\',
    	'\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
    	return '"' + s.replace(charToReplace, function(a) {
    		var c = m[a];
    		return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    	}) + '"';
    },

    //<debug>
    encodeArrayPretty = function(o, newline) {
    	var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline], // Note newline in case there are no members
            i;

    	for (i = 0; i < len; i += 1) {
    		a.push(me.encodeValue(o[i], cnewline), sep);
    	}

    	// Overwrite trailing comma (or empty string)
    	a[a.length - 1] = newline + ']';

    	return a.join('');
    },

    encodeObjectPretty = function(o, newline) {
    	var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline], // Note newline in case there are no members
            i, val;

    	for (i in o) {
    		val = o[i];
    		if (!useHasOwn || o.hasOwnProperty(i)) {
    			// To match JSON.stringify, we shouldn't encode functions or undefined
    			if (typeof val === 'function' || val === undefined) {
    				continue;
    			}
    			a.push(me.encodeValue(i) + ': ' + me.encodeValue(val, cnewline), sep);
    		}
    	}

    	// Overwrite trailing comma (or empty string)
    	a[a.length - 1] = newline + '}';

    	return a.join('');
    },
    //</debug>

    encodeArray = function(o, newline) {
    	//<debug>
    	if (newline) {
    		return encodeArrayPretty(o, newline);
    	}
    	//</debug>

    	var a = ["[", ""], // Note empty string in case there are no serializable members.
            len = o.length,
            i;
    	for (i = 0; i < len; i += 1) {
    		a.push(me.encodeValue(o[i]), ',');
    	}
    	// Overwrite trailing comma (or empty string)
    	a[a.length - 1] = ']';
    	return a.join("");
    },
    isEmpty= function(value, allowEmptyString) {
    	return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (this.isArray(value) && value.length === 0);
    },

    isArray= ('isArray' in Array) ? Array.isArray : function(value) {
    	return toString.call(value) === '[object Array]';
    },

    isDate= function(value) {
    	return toString.call(value) === '[object Date]';
    },

    isObject= (toString.call(null) === '[object Object]') ?
        function(value) {
        	// check ownerDocument here as well to exclude DOM nodes
        	return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
        	return toString.call(value) === '[object Object]';
        },

    isSimpleObject= function(value) {
    	return value instanceof Object && value.constructor === Object;
    },
    
    isPrimitive= function(value) {
    	var type = typeof value;

    	return type === 'string' || type === 'number' || type === 'boolean';
    },

    isFunction= (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
    		return !!value && toString.call(value) === '[object Function]';
		} : function(value) {
    		return !!value && typeof value === 'function';
		},

    isNumber= function(value) {
    	return typeof value === 'number' && isFinite(value);
    },

    isNumeric= function(value) {
    	return !isNaN(parseFloat(value)) && isFinite(value);
    },

    isString= function(value) {
    	return typeof value === 'string';
    },

    isBoolean= function(value) {
    	return typeof value === 'boolean';
    },
    encodeObject = function(o, newline) {
    	//<debug>
    	if (newline) {
    		return encodeObjectPretty(o, newline);
    	}
    	//</debug>

    	var a = ["{", ""], // Note empty string in case there are no serializable members.
            i, val;
    	for (i in o) {
    		val = o[i];
    		if (!useHasOwn || o.hasOwnProperty(i)) {
    			a.push(me.encodeValue(i), ":", me.encodeValue(val), ',');
    		}
    	}
    	// Overwrite trailing comma (or empty string)
    	a[a.length - 1] = '}';
    	return a.join("");
    };

	me.encodeString = encodeString;

	me.encodeValue = doEncode;

	me.encodeDate = function(o) {
		return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
	};

	me.stringify = function(o) {
		if (!encodingFunction) {
			// setup encoding function on first access
			encodingFunction = me.encodeValue;
		}
		return encodingFunction(o);
	};

	me.parse = function (json, scope, safe) {
		try {
			return doDecode(json, scope);
		} catch (e) {
			if (safe === true) {
				return null;
			}
		}
	};
})());