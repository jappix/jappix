/*

Jappix - The instant messaging. Reinvented.
These are all the necessary JavaScripts for Jappix

-------------------------------------------------

Licence : AGPL
Author : Valérian Saliou
Contact : mailing-list[at]jappix[dot]com
Last revision : 24/03/10

*/

/* BEGIN JQUERY v1.4.2 */
	(function( window, undefined ) {
	
	// Define a local copy of jQuery
	var jQuery = function( selector, context ) {
			// The jQuery object is actually just the init constructor 'enhanced'
			return new jQuery.fn.init( selector, context );
		},

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$,

		// Use the correct document accordingly with window argument (sandbox)
		document = window.document,

		// A central reference to the root jQuery(document)
		rootjQuery,

		// A simple way to check for HTML strings or ID strings
		// (both of which we optimize for)
		quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,

		// Is it a simple selector
		isSimple = /^.[^:#\[\.,]*$/,

		// Check if a string has a non-whitespace character in it
		rnotwhite = /\S/,

		// Used for trimming whitespace
		rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,

		// Match a standalone tag
		rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

		// Keep a UserAgent string for use with jQuery.browser
		userAgent = navigator.userAgent,

		// For matching the engine and version of the browser
		browserMatch,
	
		// Has the ready events already been bound?
		readyBound = false,
	
		// The functions to execute on DOM ready
		readyList = [],

		// The ready event handler
		DOMContentLoaded,

		// Save a reference to some core methods
		toString = Object.prototype.toString,
		hasOwnProperty = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		indexOf = Array.prototype.indexOf;

	jQuery.fn = jQuery.prototype = {
		init: function( selector, context ) {
			var match, elem, ret, doc;

			// Handle $(""), $(null), or $(undefined)
			if ( !selector ) {
				return this;
			}

			// Handle $(DOMElement)
			if ( selector.nodeType ) {
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			}
		
			// The body element only exists once, optimize finding it
			if ( selector === "body" && !context ) {
				this.context = document;
				this[0] = document.body;
				this.selector = "body";
				this.length = 1;
				return this;
			}

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				// Are we dealing with HTML string or an ID?
				match = quickExpr.exec( selector );

				// Verify a match, and that no context was specified for #id
				if ( match && (match[1] || !context) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[1] ) {
						doc = (context ? context.ownerDocument || context : document);

						// If a single string is passed in and it's a single tag
						// just do a createElement and skip the rest
						ret = rsingleTag.exec( selector );

						if ( ret ) {
							if ( jQuery.isPlainObject( context ) ) {
								selector = [ document.createElement( ret[1] ) ];
								jQuery.fn.attr.call( selector, context, true );

							} else {
								selector = [ doc.createElement( ret[1] ) ];
							}

						} else {
							ret = buildFragment( [ match[1] ], [ doc ] );
							selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
						}
					
						return jQuery.merge( this, selector );
					
					// HANDLE: $("#id")
					} else {
						elem = document.getElementById( match[2] );

						if ( elem ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id !== match[2] ) {
								return rootjQuery.find( selector );
							}

							// Otherwise, we inject the element directly into the jQuery object
							this.length = 1;
							this[0] = elem;
						}

						this.context = document;
						this.selector = selector;
						return this;
					}

				// HANDLE: $("TAG")
				} else if ( !context && /^\w+$/.test( selector ) ) {
					this.selector = selector;
					this.context = document;
					selector = document.getElementsByTagName( selector );
					return jQuery.merge( this, selector );

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return (context || rootjQuery).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return jQuery( context ).find( selector );
				}

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return rootjQuery.ready( selector );
			}

			if (selector.selector !== undefined) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return jQuery.makeArray( selector, this );
		},

		// Start with an empty selector
		selector: "",

		// The current version of jQuery being used
		jquery: "1.4.2",

		// The default length of a jQuery object is 0
		length: 0,

		// The number of elements contained in the matched element set
		size: function() {
			return this.length;
		},

		toArray: function() {
			return slice.call( this, 0 );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num == null ?

				// Return a 'clean' array
				this.toArray() :

				// Return just the object
				( num < 0 ? this.slice(num)[ 0 ] : this[ num ] );
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems, name, selector ) {
			// Build a new jQuery matched element set
			var ret = jQuery();

			if ( jQuery.isArray( elems ) ) {
				push.apply( ret, elems );
		
			} else {
				jQuery.merge( ret, elems );
			}

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			ret.context = this.context;

			if ( name === "find" ) {
				ret.selector = this.selector + (this.selector ? " " : "") + selector;
			} else if ( name ) {
				ret.selector = this.selector + "." + name + "(" + selector + ")";
			}

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		// (You can seed the arguments with an array of args, but this is
		// only used internally.)
		each: function( callback, args ) {
			return jQuery.each( this, callback, args );
		},
	
		ready: function( fn ) {
			// Attach the listeners
			jQuery.bindReady();

			// If the DOM is already ready
			if ( jQuery.isReady ) {
				// Execute the function immediately
				fn.call( document, jQuery );

			// Otherwise, remember the function for later
			} else if ( readyList ) {
				// Add the function to the wait list
				readyList.push( fn );
			}

			return this;
		},
	
		eq: function( i ) {
			return i === -1 ?
				this.slice( i ) :
				this.slice( i, +i + 1 );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ),
				"slice", slice.call(arguments).join(",") );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map(this, function( elem, i ) {
				return callback.call( elem, i, elem );
			}));
		},
	
		end: function() {
			return this.prevObject || jQuery(null);
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: [].sort,
		splice: [].splice
	};

	// Give the init function the jQuery prototype for later instantiation
	jQuery.fn.init.prototype = jQuery.fn;

	jQuery.extend = jQuery.fn.extend = function() {
		// copy reference to target object
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}

		// extend jQuery itself if only one argument is passed
		if ( length === i ) {
			target = this;
			--i;
		}

		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging object literal values or arrays
					if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
						var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
							: jQuery.isArray(copy) ? [] : {};

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend({
		noConflict: function( deep ) {
			window.$ = _$;

			if ( deep ) {
				window.jQuery = _jQuery;
			}

			return jQuery;
		},
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// Handle when the DOM is ready
		ready: function() {
			// Make sure that the DOM is not already loaded
			if ( !jQuery.isReady ) {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if ( !document.body ) {
					return setTimeout( jQuery.ready, 13 );
				}

				// Remember that the DOM is ready
				jQuery.isReady = true;

				// If there are functions bound, to execute
				if ( readyList ) {
					// Execute all of them
					var fn, i = 0;
					while ( (fn = readyList[ i++ ]) ) {
						fn.call( document, jQuery );
					}

					// Reset the list of functions
					readyList = null;
				}

				// Trigger any bound ready events
				if ( jQuery.fn.triggerHandler ) {
					jQuery( document ).triggerHandler( "ready" );
				}
			}
		},
	
		bindReady: function() {
			if ( readyBound ) {
				return;
			}

			readyBound = true;

			// Catch cases where $(document).ready() is called after the
			// browser event has already occurred.
			if ( document.readyState === "complete" ) {
				return jQuery.ready();
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			
				// A fallback to window.onload, that will always work
				window.addEventListener( "load", jQuery.ready, false );

			// If IE event model is used
			} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent("onreadystatechange", DOMContentLoaded);
			
				// A fallback to window.onload, that will always work
				window.attachEvent( "onload", jQuery.ready );

				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;

				try {
					toplevel = window.frameElement == null;
				} catch(e) {}

				if ( document.documentElement.doScroll && toplevel ) {
					doScrollCheck();
				}
			}
		},

		// See test/unit/core.js for details concerning isFunction.
		// Since version 1.3, DOM methods and functions like alert
		// aren't supported. They return false on IE (#2968).
		isFunction: function( obj ) {
			return toString.call(obj) === "[object Function]";
		},

		isArray: function( obj ) {
			return toString.call(obj) === "[object Array]";
		},

		isPlainObject: function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
				return false;
			}
		
			// Not own constructor property must be Object
			if ( obj.constructor
				&& !hasOwnProperty.call(obj, "constructor")
				&& !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
	
			var key;
			for ( key in obj ) {}
		
			return key === undefined || hasOwnProperty.call( obj, key );
		},

		isEmptyObject: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
	
		error: function( msg ) {
			throw msg;
		},
	
		parseJSON: function( data ) {
			if ( typeof data !== "string" || !data ) {
				return null;
			}

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );
		
			// Make sure the incoming data is actual JSON
			// Logic borrowed from http://json.org/json2.js
			if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
				.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
				.replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {

				// Try to use the native JSON parser first
				return window.JSON && window.JSON.parse ?
					window.JSON.parse( data ) :
					(new Function("return " + data))();

			} else {
				jQuery.error( "Invalid JSON: " + data );
			}
		},

		noop: function() {},

		// Evalulates a script in a global context
		globalEval: function( data ) {
			if ( data && rnotwhite.test(data) ) {
				// Inspired by code by Andrea Giammarchi
				// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
				var head = document.getElementsByTagName("head")[0] || document.documentElement,
					script = document.createElement("script");

				script.type = "text/javascript";

				if ( jQuery.support.scriptEval ) {
					script.appendChild( document.createTextNode( data ) );
				} else {
					script.text = data;
				}

				// Use insertBefore instead of appendChild to circumvent an IE6 bug.
				// This arises when a base node is used (#2709).
				head.insertBefore( script, head.firstChild );
				head.removeChild( script );
			}
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
		},

		// args is for internal usage only
		each: function( object, callback, args ) {
			var name, i = 0,
				length = object.length,
				isObj = length === undefined || jQuery.isFunction(object);

			if ( args ) {
				if ( isObj ) {
					for ( name in object ) {
						if ( callback.apply( object[ name ], args ) === false ) {
							break;
						}
					}
				} else {
					for ( ; i < length; ) {
						if ( callback.apply( object[ i++ ], args ) === false ) {
							break;
						}
					}
				}

			// A special, fast, case for the most common use of each
			} else {
				if ( isObj ) {
					for ( name in object ) {
						if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
							break;
						}
					}
				} else {
					for ( var value = object[0];
						i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
				}
			}

			return object;
		},

		trim: function( text ) {
			return (text || "").replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( array, results ) {
			var ret = results || [];

			if ( array != null ) {
				// The window, strings (and functions) also have 'length'
				// The extra typeof function check is to prevent crashes
				// in Safari 2 (See: #3039)
				if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
					push.call( ret, array );
				} else {
					jQuery.merge( ret, array );
				}
			}

			return ret;
		},

		inArray: function( elem, array ) {
			if ( array.indexOf ) {
				return array.indexOf( elem );
			}

			for ( var i = 0, length = array.length; i < length; i++ ) {
				if ( array[ i ] === elem ) {
					return i;
				}
			}

			return -1;
		},

		merge: function( first, second ) {
			var i = first.length, j = 0;

			if ( typeof second.length === "number" ) {
				for ( var l = second.length; j < l; j++ ) {
					first[ i++ ] = second[ j ];
				}
		
			} else {
				while ( second[j] !== undefined ) {
					first[ i++ ] = second[ j++ ];
				}
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, inv ) {
			var ret = [];

			// Go through the array, only saving the items
			// that pass the validator function
			for ( var i = 0, length = elems.length; i < length; i++ ) {
				if ( !inv !== !callback( elems[ i ], i ) ) {
					ret.push( elems[ i ] );
				}
			}

			return ret;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var ret = [], value;

			// Go through the array, translating each of the items to their
			// new value (or values).
			for ( var i = 0, length = elems.length; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

			return ret.concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		proxy: function( fn, proxy, thisObject ) {
			if ( arguments.length === 2 ) {
				if ( typeof proxy === "string" ) {
					thisObject = fn;
					fn = thisObject[ proxy ];
					proxy = undefined;

				} else if ( proxy && !jQuery.isFunction( proxy ) ) {
					thisObject = proxy;
					proxy = undefined;
				}
			}

			if ( !proxy && fn ) {
				proxy = function() {
					return fn.apply( thisObject || this, arguments );
				};
			}

			// Set the guid of unique handler to the same of original handler, so it can be removed
			if ( fn ) {
				proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
			}

			// So proxy can be declared as an argument
			return proxy;
		},

		// Use of jQuery.browser is frowned upon.
		// More details: http://docs.jquery.com/Utilities/jQuery.browser
		uaMatch: function( ua ) {
			ua = ua.toLowerCase();

			var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				!/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
			  	[];

			return { browser: match[1] || "", version: match[2] || "0" };
		},

		browser: {}
	});

	browserMatch = jQuery.uaMatch( userAgent );
	if ( browserMatch.browser ) {
		jQuery.browser[ browserMatch.browser ] = true;
		jQuery.browser.version = browserMatch.version;
	}

	// Deprecated, use jQuery.browser.webkit instead
	if ( jQuery.browser.webkit ) {
		jQuery.browser.safari = true;
	}

	if ( indexOf ) {
		jQuery.inArray = function( elem, array ) {
			return indexOf.call( array, elem );
		};
	}

	// All jQuery objects should point back to these
	rootjQuery = jQuery(document);

	// Cleanup functions for the document ready method
	if ( document.addEventListener ) {
		DOMContentLoaded = function() {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		};

	} else if ( document.attachEvent ) {
		DOMContentLoaded = function() {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", DOMContentLoaded );
				jQuery.ready();
			}
		};
	}

	// The DOM ready check for Internet Explorer
	function doScrollCheck() {
		if ( jQuery.isReady ) {
			return;
		}

		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch( error ) {
			setTimeout( doScrollCheck, 1 );
			return;
		}

		// and execute any waiting functions
		jQuery.ready();
	}

	function evalScript( i, elem ) {
		if ( elem.src ) {
			jQuery.ajax({
				url: elem.src,
				async: false,
				dataType: "script"
			});
		} else {
			jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );
		}

		if ( elem.parentNode ) {
			elem.parentNode.removeChild( elem );
		}
	}

	// Mutifunctional method to get and set values to a collection
	// The value/s can be optionally by executed if its a function
	function access( elems, key, value, exec, fn, pass ) {
		var length = elems.length;
	
		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}
	
		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);
		
			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}
		
			return elems;
		}
	
		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	}

	function now() {
		return (new Date).getTime();
	}
	(function() {

		jQuery.support = {};

		var root = document.documentElement,
			script = document.createElement("script"),
			div = document.createElement("div"),
			id = "script" + now();

		div.style.display = "none";
		div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

		var all = div.getElementsByTagName("*"),
			a = div.getElementsByTagName("a")[0];

		// Can't get basic test support
		if ( !all || !all.length || !a ) {
			return;
		}

		jQuery.support = {
			// IE strips leading whitespace when .innerHTML is used
			leadingWhitespace: div.firstChild.nodeType === 3,

			// Make sure that tbody elements aren't automatically inserted
			// IE will insert them into empty tables
			tbody: !div.getElementsByTagName("tbody").length,

			// Make sure that link elements get serialized correctly by innerHTML
			// This requires a wrapper element in IE
			htmlSerialize: !!div.getElementsByTagName("link").length,

			// Get the style information from getAttribute
			// (IE uses .cssText insted)
			style: /red/.test( a.getAttribute("style") ),

			// Make sure that URLs aren't manipulated
			// (IE normalizes it by default)
			hrefNormalized: a.getAttribute("href") === "/a",

			// Make sure that element opacity exists
			// (IE uses filter instead)
			// Use a regex to work around a WebKit issue. See #5145
			opacity: /^0.55$/.test( a.style.opacity ),

			// Verify style float existence
			// (IE uses styleFloat instead of cssFloat)
			cssFloat: !!a.style.cssFloat,

			// Make sure that if no value is specified for a checkbox
			// that it defaults to "on".
			// (WebKit defaults to "" instead)
			checkOn: div.getElementsByTagName("input")[0].value === "on",

			// Make sure that a selected-by-default option has a working selected property.
			// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
			optSelected: document.createElement("select").appendChild( document.createElement("option") ).selected,

			parentNode: div.removeChild( div.appendChild( document.createElement("div") ) ).parentNode === null,

			// Will be defined later
			deleteExpando: true,
			checkClone: false,
			scriptEval: false,
			noCloneEvent: true,
			boxModel: null
		};

		script.type = "text/javascript";
		try {
			script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
		} catch(e) {}

		root.insertBefore( script, root.firstChild );

		// Make sure that the execution of code works by injecting a script
		// tag with appendChild/createTextNode
		// (IE doesn't support this, fails, and uses .text instead)
		if ( window[ id ] ) {
			jQuery.support.scriptEval = true;
			delete window[ id ];
		}

		// Test to see if it's possible to delete an expando from an element
		// Fails in Internet Explorer
		try {
			delete script.test;
	
		} catch(e) {
			jQuery.support.deleteExpando = false;
		}

		root.removeChild( script );

		if ( div.attachEvent && div.fireEvent ) {
			div.attachEvent("onclick", function click() {
				// Cloning a node shouldn't copy over any
				// bound event handlers (IE does this)
				jQuery.support.noCloneEvent = false;
				div.detachEvent("onclick", click);
			});
			div.cloneNode(true).fireEvent("onclick");
		}

		div = document.createElement("div");
		div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";

		var fragment = document.createDocumentFragment();
		fragment.appendChild( div.firstChild );

		// WebKit doesn't clone checked state correctly in fragments
		jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

		// Figure out if the W3C box model works as expected
		// document.body must exist before we can do this
		jQuery(function() {
			var div = document.createElement("div");
			div.style.width = div.style.paddingLeft = "1px";

			document.body.appendChild( div );
			jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;
			document.body.removeChild( div ).style.display = 'none';

			div = null;
		});

		// Technique from Juriy Zaytsev
		// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
		var eventSupported = function( eventName ) { 
			var el = document.createElement("div"); 
			eventName = "on" + eventName; 

			var isSupported = (eventName in el); 
			if ( !isSupported ) { 
				el.setAttribute(eventName, "return;"); 
				isSupported = typeof el[eventName] === "function"; 
			} 
			el = null; 

			return isSupported; 
		};
	
		jQuery.support.submitBubbles = eventSupported("submit");
		jQuery.support.changeBubbles = eventSupported("change");

		// release memory in IE
		root = script = div = all = a = null;
	})();

	jQuery.props = {
		"for": "htmlFor",
		"class": "className",
		readonly: "readOnly",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		rowspan: "rowSpan",
		colspan: "colSpan",
		tabindex: "tabIndex",
		usemap: "useMap",
		frameborder: "frameBorder"
	};
	var expando = "jQuery" + now(), uuid = 0, windowData = {};

	jQuery.extend({
		cache: {},
	
		expando:expando,

		// The following elements throw uncatchable exceptions if you
		// attempt to add expando properties to them.
		noData: {
			"embed": true,
			"object": true,
			"applet": true
		},

		data: function( elem, name, data ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				return;
			}

			elem = elem == window ?
				windowData :
				elem;

			var id = elem[ expando ], cache = jQuery.cache, thisCache;

			if ( !id && typeof name === "string" && data === undefined ) {
				return null;
			}

			// Compute a unique ID for the element
			if ( !id ) { 
				id = ++uuid;
			}

			// Avoid generating a new cache unless none exists and we
			// want to manipulate it.
			if ( typeof name === "object" ) {
				elem[ expando ] = id;
				thisCache = cache[ id ] = jQuery.extend(true, {}, name);

			} else if ( !cache[ id ] ) {
				elem[ expando ] = id;
				cache[ id ] = {};
			}

			thisCache = cache[ id ];

			// Prevent overriding the named cache with undefined values
			if ( data !== undefined ) {
				thisCache[ name ] = data;
			}

			return typeof name === "string" ? thisCache[ name ] : thisCache;
		},

		removeData: function( elem, name ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				return;
			}

			elem = elem == window ?
				windowData :
				elem;

			var id = elem[ expando ], cache = jQuery.cache, thisCache = cache[ id ];

			// If we want to remove a specific section of the element's data
			if ( name ) {
				if ( thisCache ) {
					// Remove the section of cache data
					delete thisCache[ name ];

					// If we've removed all the data, remove the element's cache
					if ( jQuery.isEmptyObject(thisCache) ) {
						jQuery.removeData( elem );
					}
				}

			// Otherwise, we want to remove all of the element's data
			} else {
				if ( jQuery.support.deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				// Completely remove the data cache
				delete cache[ id ];
			}
		}
	});

	jQuery.fn.extend({
		data: function( key, value ) {
			if ( typeof key === "undefined" && this.length ) {
				return jQuery.data( this[0] );

			} else if ( typeof key === "object" ) {
				return this.each(function() {
					jQuery.data( this, key );
				});
			}

			var parts = key.split(".");
			parts[1] = parts[1] ? "." + parts[1] : "";

			if ( value === undefined ) {
				var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

				if ( data === undefined && this.length ) {
					data = jQuery.data( this[0], key );
				}
				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			} else {
				return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function() {
					jQuery.data( this, key, value );
				});
			}
		},

		removeData: function( key ) {
			return this.each(function() {
				jQuery.removeData( this, key );
			});
		}
	});
	jQuery.extend({
		queue: function( elem, type, data ) {
			if ( !elem ) {
				return;
			}

			type = (type || "fx") + "queue";
			var q = jQuery.data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( !data ) {
				return q || [];
			}

			if ( !q || jQuery.isArray(data) ) {
				q = jQuery.data( elem, type, jQuery.makeArray(data) );

			} else {
				q.push( data );
			}

			return q;
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ), fn = queue.shift();

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
			}

			if ( fn ) {
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift("inprogress");
				}

				fn.call(elem, function() {
					jQuery.dequeue(elem, type);
				});
			}
		}
	});

	jQuery.fn.extend({
		queue: function( type, data ) {
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
			}

			if ( data === undefined ) {
				return jQuery.queue( this[0], type );
			}
			return this.each(function( i, elem ) {
				var queue = jQuery.queue( this, type, data );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
		},
		dequeue: function( type ) {
			return this.each(function() {
				jQuery.dequeue( this, type );
			});
		},

		// Based off of the plugin by Clint Helfers, with permission.
		// http://blindsignals.com/index.php/2009/07/jquery-delay/
		delay: function( time, type ) {
			time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
			type = type || "fx";

			return this.queue( type, function() {
				var elem = this;
				setTimeout(function() {
					jQuery.dequeue( elem, type );
				}, time );
			});
		},

		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		}
	});
	var rclass = /[\n\t]/g,
		rspace = /\s+/,
		rreturn = /\r/g,
		rspecialurl = /href|src|style/,
		rtype = /(button|input)/i,
		rfocusable = /(button|input|object|select|textarea)/i,
		rclickable = /^(a|area)$/i,
		rradiocheck = /radio|checkbox/;

	jQuery.fn.extend({
		attr: function( name, value ) {
			return access( this, name, value, true, jQuery.attr );
		},

		removeAttr: function( name, fn ) {
			return this.each(function(){
				jQuery.attr( this, name, "" );
				if ( this.nodeType === 1 ) {
					this.removeAttribute( name );
				}
			});
		},

		addClass: function( value ) {
			if ( jQuery.isFunction(value) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					self.addClass( value.call(this, i, self.attr("class")) );
				});
			}

			if ( value && typeof value === "string" ) {
				var classNames = (value || "").split( rspace );

				for ( var i = 0, l = this.length; i < l; i++ ) {
					var elem = this[i];

					if ( elem.nodeType === 1 ) {
						if ( !elem.className ) {
							elem.className = value;

						} else {
							var className = " " + elem.className + " ", setClass = elem.className;
							for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
								if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
									setClass += " " + classNames[c];
								}
							}
							elem.className = jQuery.trim( setClass );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			if ( jQuery.isFunction(value) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					self.removeClass( value.call(this, i, self.attr("class")) );
				});
			}

			if ( (value && typeof value === "string") || value === undefined ) {
				var classNames = (value || "").split(rspace);

				for ( var i = 0, l = this.length; i < l; i++ ) {
					var elem = this[i];

					if ( elem.nodeType === 1 && elem.className ) {
						if ( value ) {
							var className = (" " + elem.className + " ").replace(rclass, " ");
							for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
								className = className.replace(" " + classNames[c] + " ", " ");
							}
							elem.className = jQuery.trim( className );

						} else {
							elem.className = "";
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value, isBool = typeof stateVal === "boolean";

			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
				});
			}

			return this.each(function() {
				if ( type === "string" ) {
					// toggle individual class names
					var className, i = 0, self = jQuery(this),
						state = stateVal,
						classNames = value.split( rspace );

					while ( (className = classNames[ i++ ]) ) {
						// check each className given, space seperated list
						state = isBool ? state : !self.hasClass( className );
						self[ state ? "addClass" : "removeClass" ]( className );
					}

				} else if ( type === "undefined" || type === "boolean" ) {
					if ( this.className ) {
						// store className if set
						jQuery.data( this, "__className__", this.className );
					}

					// toggle whole className
					this.className = this.className || value === false ? "" : jQuery.data( this, "__className__" ) || "";
				}
			});
		},

		hasClass: function( selector ) {
			var className = " " + selector + " ";
			for ( var i = 0, l = this.length; i < l; i++ ) {
				if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
					return true;
				}
			}

			return false;
		},

		val: function( value ) {
			if ( value === undefined ) {
				var elem = this[0];

				if ( elem ) {
					if ( jQuery.nodeName( elem, "option" ) ) {
						return (elem.attributes.value || {}).specified ? elem.value : elem.text;
					}

					// We need to handle select boxes special
					if ( jQuery.nodeName( elem, "select" ) ) {
						var index = elem.selectedIndex,
							values = [],
							options = elem.options,
							one = elem.type === "select-one";

						// Nothing was selected
						if ( index < 0 ) {
							return null;
						}

						// Loop through all the selected options
						for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
							var option = options[ i ];

							if ( option.selected ) {
								// Get the specifc value for the option
								value = jQuery(option).val();

								// We don't need an array for one selects
								if ( one ) {
									return value;
								}

								// Multi-Selects return an array
								values.push( value );
							}
						}

						return values;
					}

					// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
					if ( rradiocheck.test( elem.type ) && !jQuery.support.checkOn ) {
						return elem.getAttribute("value") === null ? "on" : elem.value;
					}
				

					// Everything else, we just grab the value
					return (elem.value || "").replace(rreturn, "");

				}

				return undefined;
			}

			var isFunction = jQuery.isFunction(value);

			return this.each(function(i) {
				var self = jQuery(this), val = value;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call(this, i, self.val());
				}

				// Typecast each time if the value is a Function and the appended
				// value is therefore different each time.
				if ( typeof val === "number" ) {
					val += "";
				}

				if ( jQuery.isArray(val) && rradiocheck.test( this.type ) ) {
					this.checked = jQuery.inArray( self.val(), val ) >= 0;

				} else if ( jQuery.nodeName( this, "select" ) ) {
					var values = jQuery.makeArray(val);

					jQuery( "option", this ).each(function() {
						this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
					});

					if ( !values.length ) {
						this.selectedIndex = -1;
					}

				} else {
					this.value = val;
				}
			});
		}
	});

	jQuery.extend({
		attrFn: {
			val: true,
			css: true,
			html: true,
			text: true,
			data: true,
			width: true,
			height: true,
			offset: true
		},
		
		attr: function( elem, name, value, pass ) {
			// don't set attributes on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
				return undefined;
			}

			if ( pass && name in jQuery.attrFn ) {
				return jQuery(elem)[name](value);
			}

			var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc( elem ),
				// Whether we are setting (or getting)
				set = value !== undefined;

			// Try to normalize/fix the name
			name = notxml && jQuery.props[ name ] || name;

			// Only do all the following if this is a node (faster for style)
			if ( elem.nodeType === 1 ) {
				// These attributes require special treatment
				var special = rspecialurl.test( name );

				// Safari mis-reports the default selected property of an option
				// Accessing the parent's selectedIndex property fixes it
				if ( name === "selected" && !jQuery.support.optSelected ) {
					var parent = elem.parentNode;
					if ( parent ) {
						parent.selectedIndex;
	
						// Make sure that it also works with optgroups, see #5701
						if ( parent.parentNode ) {
							parent.parentNode.selectedIndex;
						}
					}
				}

				// If applicable, access the attribute via the DOM 0 way
				if ( name in elem && notxml && !special ) {
					if ( set ) {
						// We can't allow the type property to be changed (since it causes problems in IE)
						if ( name === "type" && rtype.test( elem.nodeName ) && elem.parentNode ) {
							jQuery.error( "type property can't be changed" );
						}

						elem[ name ] = value;
					}

					// browsers index elements by id/name on forms, give priority to attributes.
					if ( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
						return elem.getAttributeNode( name ).nodeValue;
					}

					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					if ( name === "tabIndex" ) {
						var attributeNode = elem.getAttributeNode( "tabIndex" );

						return attributeNode && attributeNode.specified ?
							attributeNode.value :
							rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								undefined;
					}

					return elem[ name ];
				}

				if ( !jQuery.support.style && notxml && name === "style" ) {
					if ( set ) {
						elem.style.cssText = "" + value;
					}

					return elem.style.cssText;
				}

				if ( set ) {
					// convert the value to a string (all browsers do this but IE) see #1070
					elem.setAttribute( name, "" + value );
				}

				var attr = !jQuery.support.hrefNormalized && notxml && special ?
						// Some attributes require a special call on IE
						elem.getAttribute( name, 2 ) :
						elem.getAttribute( name );

				// Non-existent attributes return null, we normalize to undefined
				return attr === null ? undefined : attr;
			}

			// elem is actually elem.style ... set the style
			// Using attr for specific style information is now deprecated. Use style instead.
			return jQuery.style( elem, name, value );
		}
	});
	var rnamespaces = /\.(.*)$/,
		fcleanup = function( nm ) {
			return nm.replace(/[^\w\s\.\|`]/g, function( ch ) {
				return "\\" + ch;
			});
		};

	/*
	 * A number of helper functions used for managing events.
	 * Many of the ideas behind this code originated from
	 * Dean Edwards' addEvent library.
	 */
	jQuery.event = {

		// Bind an event to an element
		// Original by Dean Edwards
		add: function( elem, types, handler, data ) {
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// For whatever reason, IE has trouble passing the window object
			// around, causing it to be cloned in the process
			if ( elem.setInterval && ( elem !== window && !elem.frameElement ) ) {
				elem = window;
			}

			var handleObjIn, handleObj;

			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
			}

			// Make sure that the function being executed has a unique ID
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure
			var elemData = jQuery.data( elem );

			// If no elemData is found then we must be trying to bind to one of the
			// banned noData elements
			if ( !elemData ) {
				return;
			}

			var events = elemData.events = elemData.events || {},
				eventHandle = elemData.handle, eventHandle;

			if ( !eventHandle ) {
				elemData.handle = eventHandle = function() {
					// Handle the second event of a trigger and when
					// an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && !jQuery.event.triggered ?
						jQuery.event.handle.apply( eventHandle.elem, arguments ) :
						undefined;
				};
			}

			// Add elem as a property of the handle function
			// This is to prevent a memory leak with non-native events in IE.
			eventHandle.elem = elem;

			// Handle multiple events separated by a space
			// jQuery(...).bind("mouseover mouseout", fn);
			types = types.split(" ");

			var type, i = 0, namespaces;

			while ( (type = types[ i++ ]) ) {
				handleObj = handleObjIn ?
					jQuery.extend({}, handleObjIn) :
					{ handler: handler, data: data };

				// Namespaced event handlers
				if ( type.indexOf(".") > -1 ) {
					namespaces = type.split(".");
					type = namespaces.shift();
					handleObj.namespace = namespaces.slice(0).sort().join(".");

				} else {
					namespaces = [];
					handleObj.namespace = "";
				}

				handleObj.type = type;
				handleObj.guid = handler.guid;

				// Get the current list of functions bound to this event
				var handlers = events[ type ],
					special = jQuery.event.special[ type ] || {};

				// Init the event handler queue
				if ( !handlers ) {
					handlers = events[ type ] = [];

					// Check for a special event handler
					// Only use addEventListener/attachEvent if the special
					// events handler returns false
					if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
						// Bind the global event handler to the element
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle, false );

						} else if ( elem.attachEvent ) {
							elem.attachEvent( "on" + type, eventHandle );
						}
					}
				}
			
				if ( special.add ) { 
					special.add.call( elem, handleObj ); 

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add the function to the element's handler list
				handlers.push( handleObj );

				// Keep track of which events have been used, for global triggering
				jQuery.event.global[ type ] = true;
			}

			// Nullify elem to prevent memory leaks in IE
			elem = null;
		},

		global: {},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, pos ) {
			// don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			var ret, type, fn, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
				elemData = jQuery.data( elem ),
				events = elemData && elemData.events;

			if ( !elemData || !events ) {
				return;
			}

			// types is actually an event object here
			if ( types && types.type ) {
				handler = types.handler;
				types = types.type;
			}

			// Unbind all events for the element
			if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
				types = types || "";

				for ( type in events ) {
					jQuery.event.remove( elem, type + types );
				}

				return;
			}

			// Handle multiple events separated by a space
			// jQuery(...).unbind("mouseover mouseout", fn);
			types = types.split(" ");

			while ( (type = types[ i++ ]) ) {
				origType = type;
				handleObj = null;
				all = type.indexOf(".") < 0;
				namespaces = [];

				if ( !all ) {
					// Namespaced event handlers
					namespaces = type.split(".");
					type = namespaces.shift();

					namespace = new RegExp("(^|\\.)" + 
						jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)")
				}

				eventType = events[ type ];

				if ( !eventType ) {
					continue;
				}

				if ( !handler ) {
					for ( var j = 0; j < eventType.length; j++ ) {
						handleObj = eventType[ j ];

						if ( all || namespace.test( handleObj.namespace ) ) {
							jQuery.event.remove( elem, origType, handleObj.handler, j );
							eventType.splice( j--, 1 );
						}
					}

					continue;
				}

				special = jQuery.event.special[ type ] || {};

				for ( var j = pos || 0; j < eventType.length; j++ ) {
					handleObj = eventType[ j ];

					if ( handler.guid === handleObj.guid ) {
						// remove the given handler for the given type
						if ( all || namespace.test( handleObj.namespace ) ) {
							if ( pos == null ) {
								eventType.splice( j--, 1 );
							}

							if ( special.remove ) {
								special.remove.call( elem, handleObj );
							}
						}

						if ( pos != null ) {
							break;
						}
					}
				}

				// remove generic event handler if no more handlers exist
				if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
					if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
						removeEvent( elem, type, elemData.handle );
					}

					ret = null;
					delete events[ type ];
				}
			}

			// Remove the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				var handle = elemData.handle;
				if ( handle ) {
					handle.elem = null;
				}

				delete elemData.events;
				delete elemData.handle;

				if ( jQuery.isEmptyObject( elemData ) ) {
					jQuery.removeData( elem );
				}
			}
		},

		// bubbling is internal
		trigger: function( event, data, elem /*, bubbling */ ) {
			// Event object or event type
			var type = event.type || event,
				bubbling = arguments[3];

			if ( !bubbling ) {
				event = typeof event === "object" ?
					// jQuery.Event object
					event[expando] ? event :
					// Object literal
					jQuery.extend( jQuery.Event(type), event ) :
					// Just the event type (string)
					jQuery.Event(type);

				if ( type.indexOf("!") >= 0 ) {
					event.type = type = type.slice(0, -1);
					event.exclusive = true;
				}

				// Handle a global trigger
				if ( !elem ) {
					// Don't bubble custom events when global (to avoid too much overhead)
					event.stopPropagation();

					// Only trigger if we've ever bound an event for it
					if ( jQuery.event.global[ type ] ) {
						jQuery.each( jQuery.cache, function() {
							if ( this.events && this.events[type] ) {
								jQuery.event.trigger( event, data, this.handle.elem );
							}
						});
					}
				}

				// Handle triggering a single element

				// don't do events on text and comment nodes
				if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
					return undefined;
				}

				// Clean up in case it is reused
				event.result = undefined;
				event.target = elem;

				// Clone the incoming data, if any
				data = jQuery.makeArray( data );
				data.unshift( event );
			}

			event.currentTarget = elem;

			// Trigger the event, it is assumed that "handle" is a function
			var handle = jQuery.data( elem, "handle" );
			if ( handle ) {
				handle.apply( elem, data );
			}

			var parent = elem.parentNode || elem.ownerDocument;

			// Trigger an inline bound script
			try {
				if ( !(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) ) {
					if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {
						event.result = false;
					}
				}

			// prevent IE from throwing an error for some elements with some event types, see #3533
			} catch (e) {}

			if ( !event.isPropagationStopped() && parent ) {
				jQuery.event.trigger( event, data, parent, true );

			} else if ( !event.isDefaultPrevented() ) {
				var target = event.target, old,
					isClick = jQuery.nodeName(target, "a") && type === "click",
					special = jQuery.event.special[ type ] || {};

				if ( (!special._default || special._default.call( elem, event ) === false) && 
					!isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()]) ) {

					try {
						if ( target[ type ] ) {
							// Make sure that we don't accidentally re-trigger the onFOO events
							old = target[ "on" + type ];

							if ( old ) {
								target[ "on" + type ] = null;
							}

							jQuery.event.triggered = true;
							target[ type ]();
						}

					// prevent IE from throwing an error for some elements with some event types, see #3533
					} catch (e) {}

					if ( old ) {
						target[ "on" + type ] = old;
					}

					jQuery.event.triggered = false;
				}
			}
		},

		handle: function( event ) {
			var all, handlers, namespaces, namespace, events;

			event = arguments[0] = jQuery.event.fix( event || window.event );
			event.currentTarget = this;

			// Namespaced event handlers
			all = event.type.indexOf(".") < 0 && !event.exclusive;

			if ( !all ) {
				namespaces = event.type.split(".");
				event.type = namespaces.shift();
				namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
			}

			var events = jQuery.data(this, "events"), handlers = events[ event.type ];

			if ( events && handlers ) {
				// Clone the handlers to prevent manipulation
				handlers = handlers.slice(0);

				for ( var j = 0, l = handlers.length; j < l; j++ ) {
					var handleObj = handlers[ j ];

					// Filter the functions by class
					if ( all || namespace.test( handleObj.namespace ) ) {
						// Pass in a reference to the handler function itself
						// So that we can later remove it
						event.handler = handleObj.handler;
						event.data = handleObj.data;
						event.handleObj = handleObj;
	
						var ret = handleObj.handler.apply( this, arguments );

						if ( ret !== undefined ) {
							event.result = ret;
							if ( ret === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}

						if ( event.isImmediatePropagationStopped() ) {
							break;
						}
					}
				}
			}

			return event.result;
		},

		props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

		fix: function( event ) {
			if ( event[ expando ] ) {
				return event;
			}

			// store a copy of the original event object
			// and "clone" to set read-only properties
			var originalEvent = event;
			event = jQuery.Event( originalEvent );

			for ( var i = this.props.length, prop; i; ) {
				prop = this.props[ --i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Fix target property, if necessary
			if ( !event.target ) {
				event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either
			}

			// check if target is a textnode (safari)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && event.fromElement ) {
				event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
			}

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && event.clientX != null ) {
				var doc = document.documentElement, body = document.body;
				event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
			}

			// Add which for key events
			if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) ) {
				event.which = event.charCode || event.keyCode;
			}

			// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
			if ( !event.metaKey && event.ctrlKey ) {
				event.metaKey = event.ctrlKey;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && event.button !== undefined ) {
				event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
			}

			return event;
		},

		// Deprecated, use jQuery.guid instead
		guid: 1E8,

		// Deprecated, use jQuery.proxy instead
		proxy: jQuery.proxy,

		special: {
			ready: {
				// Make sure the ready event is setup
				setup: jQuery.bindReady,
				teardown: jQuery.noop
			},

			live: {
				add: function( handleObj ) {
					jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) ); 
				},

				remove: function( handleObj ) {
					var remove = true,
						type = handleObj.origType.replace(rnamespaces, "");
				
					jQuery.each( jQuery.data(this, "events").live || [], function() {
						if ( type === this.origType.replace(rnamespaces, "") ) {
							remove = false;
							return false;
						}
					});

					if ( remove ) {
						jQuery.event.remove( this, handleObj.origType, liveHandler );
					}
				}

			},

			beforeunload: {
				setup: function( data, namespaces, eventHandle ) {
					// We only want to do this special case on windows
					if ( this.setInterval ) {
						this.onbeforeunload = eventHandle;
					}

					return false;
				},
				teardown: function( namespaces, eventHandle ) {
					if ( this.onbeforeunload === eventHandle ) {
						this.onbeforeunload = null;
					}
				}
			}
		}
	};

	var removeEvent = document.removeEventListener ?
		function( elem, type, handle ) {
			elem.removeEventListener( type, handle, false );
		} : 
		function( elem, type, handle ) {
			elem.detachEvent( "on" + type, handle );
		};

	jQuery.Event = function( src ) {
		// Allow instantiation without the 'new' keyword
		if ( !this.preventDefault ) {
			return new jQuery.Event( src );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
		// Event type
		} else {
			this.type = src;
		}

		// timeStamp is buggy for some events on Firefox(#3843)
		// So we won't rely on the native value
		this.timeStamp = now();

		// Mark it as fixed
		this[ expando ] = true;
	};

	function returnFalse() {
		return false;
	}
	function returnTrue() {
		return true;
	}

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		preventDefault: function() {
			this.isDefaultPrevented = returnTrue;

			var e = this.originalEvent;
			if ( !e ) {
				return;
			}
		
			// if preventDefault exists run it on the original event
			if ( e.preventDefault ) {
				e.preventDefault();
			}
			// otherwise set the returnValue property of the original event to false (IE)
			e.returnValue = false;
		},
		stopPropagation: function() {
			this.isPropagationStopped = returnTrue;

			var e = this.originalEvent;
			if ( !e ) {
				return;
			}
			// if stopPropagation exists run it on the original event
			if ( e.stopPropagation ) {
				e.stopPropagation();
			}
			// otherwise set the cancelBubble property of the original event to true (IE)
			e.cancelBubble = true;
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		},
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse
	};

	// Checks if an event happened on an element within another element
	// Used in jQuery.event.special.mouseenter and mouseleave handlers
	var withinElement = function( event ) {
		// Check if mouse(over|out) are still within the same parent element
		var parent = event.relatedTarget;

		// Firefox sometimes assigns relatedTarget a XUL element
		// which we cannot access the parentNode property of
		try {
			// Traverse up the tree
			while ( parent && parent !== this ) {
				parent = parent.parentNode;
			}

			if ( parent !== this ) {
				// set the correct event type
				event.type = event.data;

				// handle event if we actually just moused on to a non sub-element
				jQuery.event.handle.apply( this, arguments );
			}

		// assuming we've left the element since we most likely mousedover a xul element
		} catch(e) { }
	},

	// In case of event delegation, we only need to rename the event.type,
	// liveHandler will take care of the rest.
	delegate = function( event ) {
		event.type = event.data;
		jQuery.event.handle.apply( this, arguments );
	};

	// Create mouseenter and mouseleave events
	jQuery.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			setup: function( data ) {
				jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
			},
			teardown: function( data ) {
				jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
			}
		};
	});

	// submit delegation
	if ( !jQuery.support.submitBubbles ) {

		jQuery.event.special.submit = {
			setup: function( data, namespaces ) {
				if ( this.nodeName.toLowerCase() !== "form" ) {
					jQuery.event.add(this, "click.specialSubmit", function( e ) {
						var elem = e.target, type = elem.type;

						if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
							return trigger( "submit", this, arguments );
						}
					});
		 
					jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
						var elem = e.target, type = elem.type;

						if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
							return trigger( "submit", this, arguments );
						}
					});

				} else {
					return false;
				}
			},

			teardown: function( namespaces ) {
				jQuery.event.remove( this, ".specialSubmit" );
			}
		};

	}

	// change delegation, happens here so we have bind.
	if ( !jQuery.support.changeBubbles ) {

		var formElems = /textarea|input|select/i,

		changeFilters,

		getVal = function( elem ) {
			var type = elem.type, val = elem.value;

			if ( type === "radio" || type === "checkbox" ) {
				val = elem.checked;

			} else if ( type === "select-multiple" ) {
				val = elem.selectedIndex > -1 ?
					jQuery.map( elem.options, function( elem ) {
						return elem.selected;
					}).join("-") :
					"";

			} else if ( elem.nodeName.toLowerCase() === "select" ) {
				val = elem.selectedIndex;
			}

			return val;
		},

		testChange = function testChange( e ) {
			var elem = e.target, data, val;

			if ( !formElems.test( elem.nodeName ) || elem.readOnly ) {
				return;
			}

			data = jQuery.data( elem, "_change_data" );
			val = getVal(elem);

			// the current data will be also retrieved by beforeactivate
			if ( e.type !== "focusout" || elem.type !== "radio" ) {
				jQuery.data( elem, "_change_data", val );
			}
		
			if ( data === undefined || val === data ) {
				return;
			}

			if ( data != null || val ) {
				e.type = "change";
				return jQuery.event.trigger( e, arguments[1], elem );
			}
		};

		jQuery.event.special.change = {
			filters: {
				focusout: testChange, 

				click: function( e ) {
					var elem = e.target, type = elem.type;

					if ( type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select" ) {
						return testChange.call( this, e );
					}
				},

				// Change has to be called before submit
				// Keydown will be called before keypress, which is used in submit-event delegation
				keydown: function( e ) {
					var elem = e.target, type = elem.type;

					if ( (e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") ||
						(e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
						type === "select-multiple" ) {
						return testChange.call( this, e );
					}
				},

				// Beforeactivate happens also before the previous element is blurred
				// with this event you can't trigger a change event, but you can store
				// information/focus[in] is not needed anymore
				beforeactivate: function( e ) {
					var elem = e.target;
					jQuery.data( elem, "_change_data", getVal(elem) );
				}
			},

			setup: function( data, namespaces ) {
				if ( this.type === "file" ) {
					return false;
				}

				for ( var type in changeFilters ) {
					jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
				}

				return formElems.test( this.nodeName );
			},

			teardown: function( namespaces ) {
				jQuery.event.remove( this, ".specialChange" );

				return formElems.test( this.nodeName );
			}
		};

		changeFilters = jQuery.event.special.change.filters;
	}

	function trigger( type, elem, args ) {
		args[0].type = type;
		return jQuery.event.handle.apply( elem, args );
	}

	// Create "bubbling" focus and blur events
	if ( document.addEventListener ) {
		jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
			jQuery.event.special[ fix ] = {
				setup: function() {
					this.addEventListener( orig, handler, true );
				}, 
				teardown: function() { 
					this.removeEventListener( orig, handler, true );
				}
			};

			function handler( e ) { 
				e = jQuery.event.fix( e );
				e.type = fix;
				return jQuery.event.handle.call( this, e );
			}
		});
	}

	jQuery.each(["bind", "one"], function( i, name ) {
		jQuery.fn[ name ] = function( type, data, fn ) {
			// Handle object literals
			if ( typeof type === "object" ) {
				for ( var key in type ) {
					this[ name ](key, data, type[key], fn);
				}
				return this;
			}
		
			if ( jQuery.isFunction( data ) ) {
				fn = data;
				data = undefined;
			}

			var handler = name === "one" ? jQuery.proxy( fn, function( event ) {
				jQuery( this ).unbind( event, handler );
				return fn.apply( this, arguments );
			}) : fn;

			if ( type === "unload" && name !== "one" ) {
				this.one( type, data, fn );

			} else {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					jQuery.event.add( this[i], type, handler, data );
				}
			}

			return this;
		};
	});

	jQuery.fn.extend({
		unbind: function( type, fn ) {
			// Handle object literals
			if ( typeof type === "object" && !type.preventDefault ) {
				for ( var key in type ) {
					this.unbind(key, type[key]);
				}

			} else {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					jQuery.event.remove( this[i], type, fn );
				}
			}

			return this;
		},
	
		delegate: function( selector, types, data, fn ) {
			return this.live( types, data, fn, selector );
		},
	
		undelegate: function( selector, types, fn ) {
			if ( arguments.length === 0 ) {
					return this.unbind( "live" );
		
			} else {
				return this.die( types, null, fn, selector );
			}
		},
	
		trigger: function( type, data ) {
			return this.each(function() {
				jQuery.event.trigger( type, data, this );
			});
		},

		triggerHandler: function( type, data ) {
			if ( this[0] ) {
				var event = jQuery.Event( type );
				event.preventDefault();
				event.stopPropagation();
				jQuery.event.trigger( event, data, this[0] );
				return event.result;
			}
		},

		toggle: function( fn ) {
			// Save reference to arguments for access in closure
			var args = arguments, i = 1;

			// link all the functions, so any of them can unbind this click handler
			while ( i < args.length ) {
				jQuery.proxy( fn, args[ i++ ] );
			}

			return this.click( jQuery.proxy( fn, function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			}));
		},

		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	});

	var liveMap = {
		focus: "focusin",
		blur: "focusout",
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	};

	jQuery.each(["live", "die"], function( i, name ) {
		jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
			var type, i = 0, match, namespaces, preType,
				selector = origSelector || this.selector,
				context = origSelector ? this : jQuery( this.context );

			if ( jQuery.isFunction( data ) ) {
				fn = data;
				data = undefined;
			}

			types = (types || "").split(" ");

			while ( (type = types[ i++ ]) != null ) {
				match = rnamespaces.exec( type );
				namespaces = "";

				if ( match )  {
					namespaces = match[0];
					type = type.replace( rnamespaces, "" );
				}

				if ( type === "hover" ) {
					types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
					continue;
				}

				preType = type;

				if ( type === "focus" || type === "blur" ) {
					types.push( liveMap[ type ] + namespaces );
					type = type + namespaces;

				} else {
					type = (liveMap[ type ] || type) + namespaces;
				}

				if ( name === "live" ) {
					// bind live handler
					context.each(function(){
						jQuery.event.add( this, liveConvert( type, selector ),
							{ data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
					});

				} else {
					// unbind live handler
					context.unbind( liveConvert( type, selector ), fn );
				}
			}
		
			return this;
		}
	});

	function liveHandler( event ) {
		var stop, elems = [], selectors = [], args = arguments,
			related, match, handleObj, elem, j, i, l, data,
			events = jQuery.data( this, "events" );

		// Make sure we avoid non-left-click bubbling in Firefox (#3861)
		if ( event.liveFired === this || !events || !events.live || event.button && event.type === "click" ) {
			return;
		}

		event.liveFired = this;

		var live = events.live.slice(0);

		for ( j = 0; j < live.length; j++ ) {
			handleObj = live[j];

			if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
				selectors.push( handleObj.selector );

			} else {
				live.splice( j--, 1 );
			}
		}

		match = jQuery( event.target ).closest( selectors, event.currentTarget );

		for ( i = 0, l = match.length; i < l; i++ ) {
			for ( j = 0; j < live.length; j++ ) {
				handleObj = live[j];

				if ( match[i].selector === handleObj.selector ) {
					elem = match[i].elem;
					related = null;

					// Those two events require additional checking
					if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
						related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];
					}

					if ( !related || related !== elem ) {
						elems.push({ elem: elem, handleObj: handleObj });
					}
				}
			}
		}

		for ( i = 0, l = elems.length; i < l; i++ ) {
			match = elems[i];
			event.currentTarget = match.elem;
			event.data = match.handleObj.data;
			event.handleObj = match.handleObj;

			if ( match.handleObj.origHandler.apply( match.elem, args ) === false ) {
				stop = false;
				break;
			}
		}

		return stop;
	}

	function liveConvert( type, selector ) {
		return "live." + (type && type !== "*" ? type + "." : "") + selector.replace(/\./g, "`").replace(/ /g, "&");
	}

	jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error").split(" "), function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		if ( jQuery.attrFn ) {
			jQuery.attrFn[ name ] = true;
		}
	});

	// Prevent memory leaks in IE
	// Window isn't included so as not to unbind existing unload events
	// More info:
	//  - http://isaacschlueter.com/2006/10/msie-memory-leaks/
	if ( window.attachEvent && !window.addEventListener ) {
		window.attachEvent("onunload", function() {
			for ( var id in jQuery.cache ) {
				if ( jQuery.cache[ id ].handle ) {
					// Try/Catch is to handle iframes being unloaded, see #4280
					try {
						jQuery.event.remove( jQuery.cache[ id ].handle.elem );
					} catch(e) {}
				}
			}
		});
	}
	/*!
	 * Sizzle CSS Selector Engine - v1.0
	 *  Copyright 2009, The Dojo Foundation
	 *  Released under the MIT, BSD, and GPL Licenses.
	 *  More information: http://sizzlejs.com/
	 */
	(function(){

	var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
		done = 0,
		toString = Object.prototype.toString,
		hasDuplicate = false,
		baseHasDuplicate = true;

	// Here we check if the JavaScript engine is using some sort of
	// optimization where it does not always call our comparision
	// function. If that is the case, discard the hasDuplicate value.
	//   Thus far that includes Google Chrome.
	[0, 0].sort(function(){
		baseHasDuplicate = false;
		return 0;
	});

	var Sizzle = function(selector, context, results, seed) {
		results = results || [];
		var origContext = context = context || document;

		if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
			return [];
		}
	
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}

		var parts = [], m, set, checkSet, extra, prune = true, contextXML = isXML(context),
			soFar = selector;
	
		// Reset the position of the chunker regexp (start from head)
		while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}

		if ( parts.length > 1 && origPOS.exec( selector ) ) {
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				set = posProcess( parts[0] + parts[1], context );
			} else {
				set = Expr.relative[ parts[0] ] ?
					[ context ] :
					Sizzle( parts.shift(), context );

				while ( parts.length ) {
					selector = parts.shift();

					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
				
					set = posProcess( selector, set );
				}
			}
		} else {
			// Take a shortcut and set the context if the root selector is an ID
			// (but not if it'll be faster if the inner selector is an ID)
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
				var ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
			}

			if ( context ) {
				var ret = seed ?
					{ expr: parts.pop(), set: makeArray(seed) } :
					Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
				set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

				if ( parts.length > 0 ) {
					checkSet = makeArray(set);
				} else {
					prune = false;
				}

				while ( parts.length ) {
					var cur = parts.pop(), pop = cur;

					if ( !Expr.relative[ cur ] ) {
						cur = "";
					} else {
						pop = parts.pop();
					}

					if ( pop == null ) {
						pop = context;
					}

					Expr.relative[ cur ]( checkSet, pop, contextXML );
				}
			} else {
				checkSet = parts = [];
			}
		}

		if ( !checkSet ) {
			checkSet = set;
		}

		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}

		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				results.push.apply( results, checkSet );
			} else if ( context && context.nodeType === 1 ) {
				for ( var i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
						results.push( set[i] );
					}
				}
			} else {
				for ( var i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}
		} else {
			makeArray( checkSet, results );
		}

		if ( extra ) {
			Sizzle( extra, origContext, results, seed );
			Sizzle.uniqueSort( results );
		}

		return results;
	};

	Sizzle.uniqueSort = function(results){
		if ( sortOrder ) {
			hasDuplicate = baseHasDuplicate;
			results.sort(sortOrder);

			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[i-1] ) {
						results.splice(i--, 1);
					}
				}
			}
		}

		return results;
	};

	Sizzle.matches = function(expr, set){
		return Sizzle(expr, null, null, set);
	};

	Sizzle.find = function(expr, context, isXML){
		var set, match;

		if ( !expr ) {
			return [];
		}

		for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
			var type = Expr.order[i], match;
		
			if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
				var left = match[1];
				match.splice(1,1);

				if ( left.substr( left.length - 1 ) !== "\\" ) {
					match[1] = (match[1] || "").replace(/\\/g, "");
					set = Expr.find[ type ]( match, context, isXML );
					if ( set != null ) {
						expr = expr.replace( Expr.match[ type ], "" );
						break;
					}
				}
			}
		}

		if ( !set ) {
			set = context.getElementsByTagName("*");
		}

		return {set: set, expr: expr};
	};

	Sizzle.filter = function(expr, set, inplace, not){
		var old = expr, result = [], curLoop = set, match, anyFound,
			isXMLFilter = set && set[0] && isXML(set[0]);

		while ( expr && set.length ) {
			for ( var type in Expr.filter ) {
				if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
					var filter = Expr.filter[ type ], found, item, left = match[1];
					anyFound = false;

					match.splice(1,1);

					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}

					if ( curLoop === result ) {
						result = [];
					}

					if ( Expr.preFilter[ type ] ) {
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

						if ( !match ) {
							anyFound = found = true;
						} else if ( match === true ) {
							continue;
						}
					}

					if ( match ) {
						for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								found = filter( item, match, i, curLoop );
								var pass = not ^ !!found;

								if ( inplace && found != null ) {
									if ( pass ) {
										anyFound = true;
									} else {
										curLoop[i] = false;
									}
								} else if ( pass ) {
									result.push( item );
									anyFound = true;
								}
							}
						}
					}

					if ( found !== undefined ) {
						if ( !inplace ) {
							curLoop = result;
						}

						expr = expr.replace( Expr.match[ type ], "" );

						if ( !anyFound ) {
							return [];
						}

						break;
					}
				}
			}

			// Improper expression
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );
				} else {
					break;
				}
			}

			old = expr;
		}

		return curLoop;
	};

	Sizzle.error = function( msg ) {
		throw "Syntax error, unrecognized expression: " + msg;
	};

	var Expr = Sizzle.selectors = {
		order: [ "ID", "NAME", "TAG" ],
		match: {
			ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
			CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
			NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
			TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
			CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
			PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},
		leftMatch: {},
		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},
		attrHandle: {
			href: function(elem){
				return elem.getAttribute("href");
			}
		},
		relative: {
			"+": function(checkSet, part){
				var isPartStr = typeof part === "string",
					isTag = isPartStr && !/\W/.test(part),
					isPartStrNotTag = isPartStr && !isTag;

				if ( isTag ) {
					part = part.toLowerCase();
				}

				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
							elem || false :
							elem === part;
					}
				}

				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},
			">": function(checkSet, part){
				var isPartStr = typeof part === "string";

				if ( isPartStr && !/\W/.test(part) ) {
					part = part.toLowerCase();

					for ( var i = 0, l = checkSet.length; i < l; i++ ) {
						var elem = checkSet[i];
						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}
				} else {
					for ( var i = 0, l = checkSet.length; i < l; i++ ) {
						var elem = checkSet[i];
						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								elem.parentNode === part;
						}
					}

					if ( isPartStr ) {
						Sizzle.filter( part, checkSet, true );
					}
				}
			},
			"": function(checkSet, part, isXML){
				var doneName = done++, checkFn = dirCheck;

				if ( typeof part === "string" && !/\W/.test(part) ) {
					var nodeCheck = part = part.toLowerCase();
					checkFn = dirNodeCheck;
				}

				checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
			},
			"~": function(checkSet, part, isXML){
				var doneName = done++, checkFn = dirCheck;

				if ( typeof part === "string" && !/\W/.test(part) ) {
					var nodeCheck = part = part.toLowerCase();
					checkFn = dirNodeCheck;
				}

				checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
			}
		},
		find: {
			ID: function(match, context, isXML){
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
					return m ? [m] : [];
				}
			},
			NAME: function(match, context){
				if ( typeof context.getElementsByName !== "undefined" ) {
					var ret = [], results = context.getElementsByName(match[1]);

					for ( var i = 0, l = results.length; i < l; i++ ) {
						if ( results[i].getAttribute("name") === match[1] ) {
							ret.push( results[i] );
						}
					}

					return ret.length === 0 ? null : ret;
				}
			},
			TAG: function(match, context){
				return context.getElementsByTagName(match[1]);
			}
		},
		preFilter: {
			CLASS: function(match, curLoop, inplace, result, not, isXML){
				match = " " + match[1].replace(/\\/g, "") + " ";

				if ( isXML ) {
					return match;
				}

				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
							if ( !inplace ) {
								result.push( elem );
							}
						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}

				return false;
			},
			ID: function(match){
				return match[1].replace(/\\/g, "");
			},
			TAG: function(match, curLoop){
				return match[1].toLowerCase();
			},
			CHILD: function(match){
				if ( match[1] === "nth" ) {
					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

					// calculate the numbers (first)n+(last) including if they are negative
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
				}

				// TODO: Move to normal caching system
				match[0] = done++;

				return match;
			},
			ATTR: function(match, curLoop, inplace, result, not, isXML){
				var name = match[1].replace(/\\/g, "");
			
				if ( !isXML && Expr.attrMap[name] ) {
					match[1] = Expr.attrMap[name];
				}

				if ( match[2] === "~=" ) {
					match[4] = " " + match[4] + " ";
				}

				return match;
			},
			PSEUDO: function(match, curLoop, inplace, result, not){
				if ( match[1] === "not" ) {
					// If we're dealing with a complex expression, or a simple one
					if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
						match[3] = Sizzle(match[3], null, null, curLoop);
					} else {
						var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
						if ( !inplace ) {
							result.push.apply( result, ret );
						}
						return false;
					}
				} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
					return true;
				}
			
				return match;
			},
			POS: function(match){
				match.unshift( true );
				return match;
			}
		},
		filters: {
			enabled: function(elem){
				return elem.disabled === false && elem.type !== "hidden";
			},
			disabled: function(elem){
				return elem.disabled === true;
			},
			checked: function(elem){
				return elem.checked === true;
			},
			selected: function(elem){
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				elem.parentNode.selectedIndex;
				return elem.selected === true;
			},
			parent: function(elem){
				return !!elem.firstChild;
			},
			empty: function(elem){
				return !elem.firstChild;
			},
			has: function(elem, i, match){
				return !!Sizzle( match[3], elem ).length;
			},
			header: function(elem){
				return /h\d/i.test( elem.nodeName );
			},
			text: function(elem){
				return "text" === elem.type;
			},
			radio: function(elem){
				return "radio" === elem.type;
			},
			checkbox: function(elem){
				return "checkbox" === elem.type;
			},
			file: function(elem){
				return "file" === elem.type;
			},
			password: function(elem){
				return "password" === elem.type;
			},
			submit: function(elem){
				return "submit" === elem.type;
			},
			image: function(elem){
				return "image" === elem.type;
			},
			reset: function(elem){
				return "reset" === elem.type;
			},
			button: function(elem){
				return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
			},
			input: function(elem){
				return /input|select|textarea|button/i.test(elem.nodeName);
			}
		},
		setFilters: {
			first: function(elem, i){
				return i === 0;
			},
			last: function(elem, i, match, array){
				return i === array.length - 1;
			},
			even: function(elem, i){
				return i % 2 === 0;
			},
			odd: function(elem, i){
				return i % 2 === 1;
			},
			lt: function(elem, i, match){
				return i < match[3] - 0;
			},
			gt: function(elem, i, match){
				return i > match[3] - 0;
			},
			nth: function(elem, i, match){
				return match[3] - 0 === i;
			},
			eq: function(elem, i, match){
				return match[3] - 0 === i;
			}
		},
		filter: {
			PSEUDO: function(elem, match, i, array){
				var name = match[1], filter = Expr.filters[ name ];

				if ( filter ) {
					return filter( elem, i, match, array );
				} else if ( name === "contains" ) {
					return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
				} else if ( name === "not" ) {
					var not = match[3];

					for ( var i = 0, l = not.length; i < l; i++ ) {
						if ( not[i] === elem ) {
							return false;
						}
					}

					return true;
				} else {
					Sizzle.error( "Syntax error, unrecognized expression: " + name );
				}
			},
			CHILD: function(elem, match){
				var type = match[1], node = elem;
				switch (type) {
					case 'only':
					case 'first':
						while ( (node = node.previousSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}
						if ( type === "first" ) { 
							return true; 
						}
						node = elem;
					case 'last':
						while ( (node = node.nextSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}
						return true;
					case 'nth':
						var first = match[2], last = match[3];

						if ( first === 1 && last === 0 ) {
							return true;
						}
					
						var doneName = match[0],
							parent = elem.parentNode;
	
						if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
							var count = 0;
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									node.nodeIndex = ++count;
								}
							} 
							parent.sizcache = doneName;
						}
					
						var diff = elem.nodeIndex - last;
						if ( first === 0 ) {
							return diff === 0;
						} else {
							return ( diff % first === 0 && diff / first >= 0 );
						}
				}
			},
			ID: function(elem, match){
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},
			TAG: function(elem, match){
				return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
			},
			CLASS: function(elem, match){
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf( match ) > -1;
			},
			ATTR: function(elem, match){
				var name = match[1],
					result = Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					value = result + "",
					type = match[2],
					check = match[4];

				return result == null ?
					type === "!=" :
					type === "=" ?
					value === check :
					type === "*=" ?
					value.indexOf(check) >= 0 :
					type === "~=" ?
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					value && result !== false :
					type === "!=" ?
					value !== check :
					type === "^=" ?
					value.indexOf(check) === 0 :
					type === "$=" ?
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},
			POS: function(elem, match, i, array){
				var name = match[2], filter = Expr.setFilters[ name ];

				if ( filter ) {
					return filter( elem, i, match, array );
				}
			}
		}
	};

	var origPOS = Expr.match.POS;

	for ( var type in Expr.match ) {
		Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
		Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, function(all, num){
			return "\\" + (num - 0 + 1);
		}));
	}

	var makeArray = function(array, results) {
		array = Array.prototype.slice.call( array, 0 );

		if ( results ) {
			results.push.apply( results, array );
			return results;
		}
	
		return array;
	};

	// Perform a simple check to determine if the browser is capable of
	// converting a NodeList to an array using builtin methods.
	// Also verifies that the returned array holds DOM nodes
	// (which is not the case in the Blackberry browser)
	try {
		Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

	// Provide a fallback method if it does not work
	} catch(e){
		makeArray = function(array, results) {
			var ret = results || [];

			if ( toString.call(array) === "[object Array]" ) {
				Array.prototype.push.apply( ret, array );
			} else {
				if ( typeof array.length === "number" ) {
					for ( var i = 0, l = array.length; i < l; i++ ) {
						ret.push( array[i] );
					}
				} else {
					for ( var i = 0; array[i]; i++ ) {
						ret.push( array[i] );
					}
				}
			}

			return ret;
		};
	}

	var sortOrder;

	if ( document.documentElement.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				if ( a == b ) {
					hasDuplicate = true;
				}
				return a.compareDocumentPosition ? -1 : 1;
			}

			var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
			if ( ret === 0 ) {
				hasDuplicate = true;
			}
			return ret;
		};
	} else if ( "sourceIndex" in document.documentElement ) {
		sortOrder = function( a, b ) {
			if ( !a.sourceIndex || !b.sourceIndex ) {
				if ( a == b ) {
					hasDuplicate = true;
				}
				return a.sourceIndex ? -1 : 1;
			}

			var ret = a.sourceIndex - b.sourceIndex;
			if ( ret === 0 ) {
				hasDuplicate = true;
			}
			return ret;
		};
	} else if ( document.createRange ) {
		sortOrder = function( a, b ) {
			if ( !a.ownerDocument || !b.ownerDocument ) {
				if ( a == b ) {
					hasDuplicate = true;
				}
				return a.ownerDocument ? -1 : 1;
			}

			var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
			aRange.setStart(a, 0);
			aRange.setEnd(a, 0);
			bRange.setStart(b, 0);
			bRange.setEnd(b, 0);
			var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
			if ( ret === 0 ) {
				hasDuplicate = true;
			}
			return ret;
		};
	}

	// Utility function for retreiving the text value of an array of DOM nodes
	function getText( elems ) {
		var ret = "", elem;

		for ( var i = 0; elems[i]; i++ ) {
			elem = elems[i];

			// Get the text from text nodes and CDATA nodes
			if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
				ret += elem.nodeValue;

			// Traverse everything else, except comment nodes
			} else if ( elem.nodeType !== 8 ) {
				ret += getText( elem.childNodes );
			}
		}

		return ret;
	}

	// Check to see if the browser returns elements by name when
	// querying by getElementById (and provide a workaround)
	(function(){
		// We're going to inject a fake input element with a specified name
		var form = document.createElement("div"),
			id = "script" + (new Date).getTime();
		form.innerHTML = "<a name='" + id + "'/>";

		// Inject it into the root element, check its status, and remove it quickly
		var root = document.documentElement;
		root.insertBefore( form, root.firstChild );

		// The workaround has to do additional checks after a getElementById
		// Which slows things down for other browsers (hence the branching)
		if ( document.getElementById( id ) ) {
			Expr.find.ID = function(match, context, isXML){
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
					return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
				}
			};

			Expr.filter.ID = function(elem, match){
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return elem.nodeType === 1 && node && node.nodeValue === match;
			};
		}

		root.removeChild( form );
		root = form = null; // release memory in IE
	})();

	(function(){
		// Check to see if the browser returns only elements
		// when doing getElementsByTagName("*")

		// Create a fake element
		var div = document.createElement("div");
		div.appendChild( document.createComment("") );

		// Make sure no comments are found
		if ( div.getElementsByTagName("*").length > 0 ) {
			Expr.find.TAG = function(match, context){
				var results = context.getElementsByTagName(match[1]);

				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [];

					for ( var i = 0; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}

					results = tmp;
				}

				return results;
			};
		}

		// Check to see if an attribute returns normalized href attributes
		div.innerHTML = "<a href='#'></a>";
		if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#" ) {
			Expr.attrHandle.href = function(elem){
				return elem.getAttribute("href", 2);
			};
		}

		div = null; // release memory in IE
	})();

	if ( document.querySelectorAll ) {
		(function(){
			var oldSizzle = Sizzle, div = document.createElement("div");
			div.innerHTML = "<p class='TEST'></p>";

			// Safari can't handle uppercase or unicode characters when
			// in quirks mode.
			if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
				return;
			}
	
			Sizzle = function(query, context, extra, seed){
				context = context || document;

				// Only use querySelectorAll on non-XML documents
				// (ID selectors don't work in non-HTML documents)
				if ( !seed && context.nodeType === 9 && !isXML(context) ) {
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(e){}
				}
		
				return oldSizzle(query, context, extra, seed);
			};

			for ( var prop in oldSizzle ) {
				Sizzle[ prop ] = oldSizzle[ prop ];
			}

			div = null; // release memory in IE
		})();
	}

	(function(){
		var div = document.createElement("div");

		div.innerHTML = "<div class='test e'></div><div class='test'></div>";

		// Opera can't find a second classname (in 9.6)
		// Also, make sure that getElementsByClassName actually exists
		if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
			return;
		}

		// Safari caches class attributes, doesn't catch changes (in 3.2)
		div.lastChild.className = "e";

		if ( div.getElementsByClassName("e").length === 1 ) {
			return;
		}
	
		Expr.order.splice(1, 0, "CLASS");
		Expr.find.CLASS = function(match, context, isXML) {
			if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
				return context.getElementsByClassName(match[1]);
			}
		};

		div = null; // release memory in IE
	})();

	function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
			if ( elem ) {
				elem = elem[dir];
				var match = false;

				while ( elem ) {
					if ( elem.sizcache === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}

					if ( elem.nodeType === 1 && !isXML ){
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( elem.nodeName.toLowerCase() === cur ) {
						match = elem;
						break;
					}

					elem = elem[dir];
				}

				checkSet[i] = match;
			}
		}
	}

	function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
		for ( var i = 0, l = checkSet.length; i < l; i++ ) {
			var elem = checkSet[i];
			if ( elem ) {
				elem = elem[dir];
				var match = false;

				while ( elem ) {
					if ( elem.sizcache === doneName ) {
						match = checkSet[elem.sizset];
						break;
					}

					if ( elem.nodeType === 1 ) {
						if ( !isXML ) {
							elem.sizcache = doneName;
							elem.sizset = i;
						}
						if ( typeof cur !== "string" ) {
							if ( elem === cur ) {
								match = true;
								break;
							}

						} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
							match = elem;
							break;
						}
					}

					elem = elem[dir];
				}

				checkSet[i] = match;
			}
		}
	}

	var contains = document.compareDocumentPosition ? function(a, b){
		return !!(a.compareDocumentPosition(b) & 16);
	} : function(a, b){
		return a !== b && (a.contains ? a.contains(b) : true);
	};

	var isXML = function(elem){
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833) 
		var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	var posProcess = function(selector, context){
		var tmpSet = [], later = "", match,
			root = context.nodeType ? [context] : context;

		// Position selectors must be done after the filter
		// And so must :not(positional) so we move all PSEUDOs to the end
		while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
			later += match[0];
			selector = selector.replace( Expr.match.PSEUDO, "" );
		}

		selector = Expr.relative[selector] ? selector + "*" : selector;

		for ( var i = 0, l = root.length; i < l; i++ ) {
			Sizzle( selector, root[i], tmpSet );
		}

		return Sizzle.filter( later, tmpSet );
	};

	// EXPOSE
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[":"] = jQuery.expr.filters;
	jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = getText;
	jQuery.isXMLDoc = isXML;
	jQuery.contains = contains;

	return;

	window.Sizzle = Sizzle;

	})();
	var runtil = /Until$/,
		rparentsprev = /^(?:parents|prevUntil|prevAll)/,
		// Note: This RegExp should be improved, or likely pulled from Sizzle
		rmultiselector = /,/,
		slice = Array.prototype.slice;

	// Implement the identical functionality for filter and not
	var winnow = function( elements, qualifier, keep ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep(elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) === keep;
			});

		} else if ( qualifier.nodeType ) {
			return jQuery.grep(elements, function( elem, i ) {
				return (elem === qualifier) === keep;
			});

		} else if ( typeof qualifier === "string" ) {
			var filtered = jQuery.grep(elements, function( elem ) {
				return elem.nodeType === 1;
			});

			if ( isSimple.test( qualifier ) ) {
				return jQuery.filter(qualifier, filtered, !keep);
			} else {
				qualifier = jQuery.filter( qualifier, filtered );
			}
		}

		return jQuery.grep(elements, function( elem, i ) {
			return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
		});
	};

	jQuery.fn.extend({
		find: function( selector ) {
			var ret = this.pushStack( "", "find", selector ), length = 0;

			for ( var i = 0, l = this.length; i < l; i++ ) {
				length = ret.length;
				jQuery.find( selector, this[i], ret );

				if ( i > 0 ) {
					// Make sure that the results are unique
					for ( var n = length; n < ret.length; n++ ) {
						for ( var r = 0; r < length; r++ ) {
							if ( ret[r] === ret[n] ) {
								ret.splice(n--, 1);
								break;
							}
						}
					}
				}
			}

			return ret;
		},

		has: function( target ) {
			var targets = jQuery( target );
			return this.filter(function() {
				for ( var i = 0, l = targets.length; i < l; i++ ) {
					if ( jQuery.contains( this, targets[i] ) ) {
						return true;
					}
				}
			});
		},

		not: function( selector ) {
			return this.pushStack( winnow(this, selector, false), "not", selector);
		},

		filter: function( selector ) {
			return this.pushStack( winnow(this, selector, true), "filter", selector );
		},
	
		is: function( selector ) {
			return !!selector && jQuery.filter( selector, this ).length > 0;
		},

		closest: function( selectors, context ) {
			if ( jQuery.isArray( selectors ) ) {
				var ret = [], cur = this[0], match, matches = {}, selector;

				if ( cur && selectors.length ) {
					for ( var i = 0, l = selectors.length; i < l; i++ ) {
						selector = selectors[i];

						if ( !matches[selector] ) {
							matches[selector] = jQuery.expr.match.POS.test( selector ) ? 
								jQuery( selector, context || this.context ) :
								selector;
						}
					}

					while ( cur && cur.ownerDocument && cur !== context ) {
						for ( selector in matches ) {
							match = matches[selector];

							if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
								ret.push({ selector: selector, elem: cur });
								delete matches[selector];
							}
						}
						cur = cur.parentNode;
					}
				}

				return ret;
			}

			var pos = jQuery.expr.match.POS.test( selectors ) ? 
				jQuery( selectors, context || this.context ) : null;

			return this.map(function( i, cur ) {
				while ( cur && cur.ownerDocument && cur !== context ) {
					if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors) ) {
						return cur;
					}
					cur = cur.parentNode;
				}
				return null;
			});
		},
	
		// Determine the position of an element within
		// the matched set of elements
		index: function( elem ) {
			if ( !elem || typeof elem === "string" ) {
				return jQuery.inArray( this[0],
					// If it receives a string, the selector is used
					// If it receives nothing, the siblings are used
					elem ? jQuery( elem ) : this.parent().children() );
			}
			// Locate the position of the desired element
			return jQuery.inArray(
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[0] : elem, this );
		},

		add: function( selector, context ) {
			var set = typeof selector === "string" ?
					jQuery( selector, context || this.context ) :
					jQuery.makeArray( selector ),
				all = jQuery.merge( this.get(), set );

			return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
				all :
				jQuery.unique( all ) );
		},

		andSelf: function() {
			return this.add( this.prevObject );
		}
	});

	// A painfully simple check to see if an element is disconnected
	// from a document (should be improved, where feasible).
	function isDisconnected( node ) {
		return !node || !node.parentNode || node.parentNode.nodeType === 11;
	}

	jQuery.each({
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return jQuery.dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return jQuery.nth( elem, 2, "nextSibling" );
		},
		prev: function( elem ) {
			return jQuery.nth( elem, 2, "previousSibling" );
		},
		nextAll: function( elem ) {
			return jQuery.dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return jQuery.dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return jQuery.dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return jQuery.sibling( elem.parentNode.firstChild, elem );
		},
		children: function( elem ) {
			return jQuery.sibling( elem.firstChild );
		},
		contents: function( elem ) {
			return jQuery.nodeName( elem, "iframe" ) ?
				elem.contentDocument || elem.contentWindow.document :
				jQuery.makeArray( elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var ret = jQuery.map( this, fn, until );
		
			if ( !runtil.test( name ) ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				ret = jQuery.filter( selector, ret );
			}

			ret = this.length > 1 ? jQuery.unique( ret ) : ret;

			if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}

			return this.pushStack( ret, name, slice.call(arguments).join(",") );
		};
	});

	jQuery.extend({
		filter: function( expr, elems, not ) {
			if ( not ) {
				expr = ":not(" + expr + ")";
			}

			return jQuery.find.matches(expr, elems);
		},
	
		dir: function( elem, dir, until ) {
			var matched = [], cur = elem[dir];
			while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
				if ( cur.nodeType === 1 ) {
					matched.push( cur );
				}
				cur = cur[dir];
			}
			return matched;
		},

		nth: function( cur, result, dir, elem ) {
			result = result || 1;
			var num = 0;

			for ( ; cur; cur = cur[dir] ) {
				if ( cur.nodeType === 1 && ++num === result ) {
					break;
				}
			}

			return cur;
		},

		sibling: function( n, elem ) {
			var r = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					r.push( n );
				}
			}

			return r;
		}
	});
	var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
		rleadingWhitespace = /^\s+/,
		rxhtmlTag = /(<([\w:]+)[^>]*?)\/>/g,
		rselfClosing = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
		rtagName = /<([\w:]+)/,
		rtbody = /<tbody/i,
		rhtml = /<|&#?\w+;/,
		rnocache = /<script|<object|<embed|<option|<style/i,
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,  // checked="checked" or checked (html5)
		fcloseTag = function( all, front, tag ) {
			return rselfClosing.test( tag ) ?
				all :
				front + "></" + tag + ">";
		},
		wrapMap = {
			option: [ 1, "<select multiple='multiple'>", "</select>" ],
			legend: [ 1, "<fieldset>", "</fieldset>" ],
			thead: [ 1, "<table>", "</table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
			col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
			area: [ 1, "<map>", "</map>" ],
			_default: [ 0, "", "" ]
		};

	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	// IE can't serialize <link> and <script> tags normally
	if ( !jQuery.support.htmlSerialize ) {
		wrapMap._default = [ 1, "div<div>", "</div>" ];
	}

	jQuery.fn.extend({
		text: function( text ) {
			if ( jQuery.isFunction(text) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					self.text( text.call(this, i, self.text()) );
				});
			}

			if ( typeof text !== "object" && text !== undefined ) {
				return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
			}

			return jQuery.text( this );
		},

		wrapAll: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each(function(i) {
					jQuery(this).wrapAll( html.call(this, i) );
				});
			}

			if ( this[0] ) {
				// The elements to wrap the target around
				var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

				if ( this[0].parentNode ) {
					wrap.insertBefore( this[0] );
				}

				wrap.map(function() {
					var elem = this;

					while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
						elem = elem.firstChild;
					}

					return elem;
				}).append(this);
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each(function(i) {
					jQuery(this).wrapInner( html.call(this, i) );
				});
			}

			return this.each(function() {
				var self = jQuery( this ), contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			});
		},

		wrap: function( html ) {
			return this.each(function() {
				jQuery( this ).wrapAll( html );
			});
		},

		unwrap: function() {
			return this.parent().each(function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			}).end();
		},

		append: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.appendChild( elem );
				}
			});
		},

		prepend: function() {
			return this.domManip(arguments, true, function( elem ) {
				if ( this.nodeType === 1 ) {
					this.insertBefore( elem, this.firstChild );
				}
			});
		},

		before: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this );
				});
			} else if ( arguments.length ) {
				var set = jQuery(arguments[0]);
				set.push.apply( set, this.toArray() );
				return this.pushStack( set, "before", arguments );
			}
		},

		after: function() {
			if ( this[0] && this[0].parentNode ) {
				return this.domManip(arguments, false, function( elem ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				});
			} else if ( arguments.length ) {
				var set = this.pushStack( this, "after", arguments );
				set.push.apply( set, jQuery(arguments[0]).toArray() );
				return set;
			}
		},
	
		// keepData is for internal use only--do not document
		remove: function( selector, keepData ) {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
					if ( !keepData && elem.nodeType === 1 ) {
						jQuery.cleanData( elem.getElementsByTagName("*") );
						jQuery.cleanData( [ elem ] );
					}

					if ( elem.parentNode ) {
						 elem.parentNode.removeChild( elem );
					}
				}
			}
		
			return this;
		},

		empty: function() {
			for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
				// Remove element nodes and prevent memory leaks
				if ( elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
				}

				// Remove any remaining nodes
				while ( elem.firstChild ) {
					elem.removeChild( elem.firstChild );
				}
			}
		
			return this;
		},

		clone: function( events ) {
			// Do the clone
			var ret = this.map(function() {
				if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
					// IE copies events bound via attachEvent when
					// using cloneNode. Calling detachEvent on the
					// clone will also remove the events from the orignal
					// In order to get around this, we use innerHTML.
					// Unfortunately, this means some modifications to
					// attributes in IE that are actually only stored
					// as properties will not be copied (such as the
					// the name attribute on an input).
					var html = this.outerHTML, ownerDocument = this.ownerDocument;
					if ( !html ) {
						var div = ownerDocument.createElement("div");
						div.appendChild( this.cloneNode(true) );
						html = div.innerHTML;
					}

					return jQuery.clean([html.replace(rinlinejQuery, "")
						// Handle the case in IE 8 where action=/test/> self-closes a tag
						.replace(/=([^="'>\s]+\/)>/g, '="$1">')
						.replace(rleadingWhitespace, "")], ownerDocument)[0];
				} else {
					return this.cloneNode(true);
				}
			});

			// Copy the events from the original to the clone
			if ( events === true ) {
				cloneCopyEvent( this, ret );
				cloneCopyEvent( this.find("*"), ret.find("*") );
			}

			// Return the cloned set
			return ret;
		},

		html: function( value ) {
			if ( value === undefined ) {
				return this[0] && this[0].nodeType === 1 ?
					this[0].innerHTML.replace(rinlinejQuery, "") :
					null;

			// See if we can take a shortcut and just use innerHTML
			} else if ( typeof value === "string" && !rnocache.test( value ) &&
				(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
				!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

				value = value.replace(rxhtmlTag, fcloseTag);

				try {
					for ( var i = 0, l = this.length; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						if ( this[i].nodeType === 1 ) {
							jQuery.cleanData( this[i].getElementsByTagName("*") );
							this[i].innerHTML = value;
						}
					}

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {
					this.empty().append( value );
				}

			} else if ( jQuery.isFunction( value ) ) {
				this.each(function(i){
					var self = jQuery(this), old = self.html();
					self.empty().append(function(){
						return value.call( this, i, old );
					});
				});

			} else {
				this.empty().append( value );
			}

			return this;
		},

		replaceWith: function( value ) {
			if ( this[0] && this[0].parentNode ) {
				// Make sure that the elements are removed from the DOM before they are inserted
				// this can help fix replacing a parent with child elements
				if ( jQuery.isFunction( value ) ) {
					return this.each(function(i) {
						var self = jQuery(this), old = self.html();
						self.replaceWith( value.call( this, i, old ) );
					});
				}

				if ( typeof value !== "string" ) {
					value = jQuery(value).detach();
				}

				return this.each(function() {
					var next = this.nextSibling, parent = this.parentNode;

					jQuery(this).remove();

					if ( next ) {
						jQuery(next).before( value );
					} else {
						jQuery(parent).append( value );
					}
				});
			} else {
				return this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value );
			}
		},

		detach: function( selector ) {
			return this.remove( selector, true );
		},

		domManip: function( args, table, callback ) {
			var results, first, value = args[0], scripts = [], fragment, parent;

			// We can't cloneNode fragments that contain checked, in WebKit
			if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
				return this.each(function() {
					jQuery(this).domManip( args, table, callback, true );
				});
			}

			if ( jQuery.isFunction(value) ) {
				return this.each(function(i) {
					var self = jQuery(this);
					args[0] = value.call(this, i, table ? self.html() : undefined);
					self.domManip( args, table, callback );
				});
			}

			if ( this[0] ) {
				parent = value && value.parentNode;

				// If we're in a fragment, just use that instead of building a new one
				if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
					results = { fragment: parent };

				} else {
					results = buildFragment( args, this, scripts );
				}
			
				fragment = results.fragment;
			
				if ( fragment.childNodes.length === 1 ) {
					first = fragment = fragment.firstChild;
				} else {
					first = fragment.firstChild;
				}

				if ( first ) {
					table = table && jQuery.nodeName( first, "tr" );

					for ( var i = 0, l = this.length; i < l; i++ ) {
						callback.call(
							table ?
								root(this[i], first) :
								this[i],
							i > 0 || results.cacheable || this.length > 1  ?
								fragment.cloneNode(true) :
								fragment
						);
					}
				}

				if ( scripts.length ) {
					jQuery.each( scripts, evalScript );
				}
			}

			return this;

			function root( elem, cur ) {
				return jQuery.nodeName(elem, "table") ?
					(elem.getElementsByTagName("tbody")[0] ||
					elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
					elem;
			}
		}
	});

	function cloneCopyEvent(orig, ret) {
		var i = 0;

		ret.each(function() {
			if ( this.nodeName !== (orig[i] && orig[i].nodeName) ) {
				return;
			}

			var oldData = jQuery.data( orig[i++] ), curData = jQuery.data( this, oldData ), events = oldData && oldData.events;

			if ( events ) {
				delete curData.handle;
				curData.events = {};

				for ( var type in events ) {
					for ( var handler in events[ type ] ) {
						jQuery.event.add( this, type, events[ type ][ handler ], events[ type ][ handler ].data );
					}
				}
			}
		});
	}

	function buildFragment( args, nodes, scripts ) {
		var fragment, cacheable, cacheresults,
			doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

		// Only cache "small" (1/2 KB) strings that are associated with the main document
		// Cloning options loses the selected state, so don't cache them
		// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
		// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
		if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
			!rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

			cacheable = true;
			cacheresults = jQuery.fragments[ args[0] ];
			if ( cacheresults ) {
				if ( cacheresults !== 1 ) {
					fragment = cacheresults;
				}
			}
		}

		if ( !fragment ) {
			fragment = doc.createDocumentFragment();
			jQuery.clean( args, doc, fragment, scripts );
		}

		if ( cacheable ) {
			jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
		}

		return { fragment: fragment, cacheable: cacheable };
	}

	jQuery.fragments = {};

	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ),
				parent = this.length === 1 && this[0].parentNode;
		
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				return this;
			
			} else {
				for ( var i = 0, l = insert.length; i < l; i++ ) {
					var elems = (i > 0 ? this.clone(true) : this).get();
					jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
					ret = ret.concat( elems );
				}
		
				return this.pushStack( ret, name, insert.selector );
			}
		};
	});

	jQuery.extend({
		clean: function( elems, context, fragment, scripts ) {
			context = context || document;

			// !context.createElement fails in IE with an error but returns typeof 'object'
			if ( typeof context.createElement === "undefined" ) {
				context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
			}

			var ret = [];

			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				if ( typeof elem === "number" ) {
					elem += "";
				}

				if ( !elem ) {
					continue;
				}

				// Convert html string into DOM nodes
				if ( typeof elem === "string" && !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );

				} else if ( typeof elem === "string" ) {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, fcloseTag);

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( var j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}

					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}

				if ( elem.nodeType ) {
					ret.push( elem );
				} else {
					ret = jQuery.merge( ret, elem );
				}
			}

			if ( fragment ) {
				for ( var i = 0; ret[i]; i++ ) {
					if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
						scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
				
					} else {
						if ( ret[i].nodeType === 1 ) {
							ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
						}
						fragment.appendChild( ret[i] );
					}
				}
			}

			return ret;
		},
	
		cleanData: function( elems ) {
			var data, id, cache = jQuery.cache,
				special = jQuery.event.special,
				deleteExpando = jQuery.support.deleteExpando;
		
			for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
				id = elem[ jQuery.expando ];
			
				if ( id ) {
					data = cache[ id ];
				
					if ( data.events ) {
						for ( var type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							} else {
								removeEvent( elem, type, data.handle );
							}
						}
					}
				
					if ( deleteExpando ) {
						delete elem[ jQuery.expando ];

					} else if ( elem.removeAttribute ) {
						elem.removeAttribute( jQuery.expando );
					}
				
					delete cache[ id ];
				}
			}
		}
	});
	// exclude the following css properties to add px
	var rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
		ralpha = /alpha\([^)]*\)/,
		ropacity = /opacity=([^)]*)/,
		rfloat = /float/i,
		rdashAlpha = /-([a-z])/ig,
		rupper = /([A-Z])/g,
		rnumpx = /^-?\d+(?:px)?$/i,
		rnum = /^-?\d/,

		cssShow = { position: "absolute", visibility: "hidden", display:"block" },
		cssWidth = [ "Left", "Right" ],
		cssHeight = [ "Top", "Bottom" ],

		// cache check for defaultView.getComputedStyle
		getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
		// normalize float css property
		styleFloat = jQuery.support.cssFloat ? "cssFloat" : "styleFloat",
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn.css = function( name, value ) {
		return access( this, name, value, true, function( elem, name, value ) {
			if ( value === undefined ) {
				return jQuery.curCSS( elem, name );
			}
		
			if ( typeof value === "number" && !rexclude.test(name) ) {
				value += "px";
			}

			jQuery.style( elem, name, value );
		});
	};

	jQuery.extend({
		style: function( elem, name, value ) {
			// don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
				return undefined;
			}

			// ignore negative width and height values #1599
			if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
				value = undefined;
			}

			var style = elem.style || elem, set = value !== undefined;

			// IE uses filters for opacity
			if ( !jQuery.support.opacity && name === "opacity" ) {
				if ( set ) {
					// IE has trouble with opacity if it does not have layout
					// Force it by setting the zoom level
					style.zoom = 1;

					// Set the alpha filter to set the opacity
					var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + value * 100 + ")";
					var filter = style.filter || jQuery.curCSS( elem, "filter" ) || "";
					style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : opacity;
				}

				return style.filter && style.filter.indexOf("opacity=") >= 0 ?
					(parseFloat( ropacity.exec(style.filter)[1] ) / 100) + "":
					"";
			}

			// Make sure we're using the right name for getting the float value
			if ( rfloat.test( name ) ) {
				name = styleFloat;
			}

			name = name.replace(rdashAlpha, fcamelCase);

			if ( set ) {
				style[ name ] = value;
			}

			return style[ name ];
		},

		css: function( elem, name, force, extra ) {
			if ( name === "width" || name === "height" ) {
				var val, props = cssShow, which = name === "width" ? cssWidth : cssHeight;

				function getWH() {
					val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

					if ( extra === "border" ) {
						return;
					}

					jQuery.each( which, function() {
						if ( !extra ) {
							val -= parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
						}

						if ( extra === "margin" ) {
							val += parseFloat(jQuery.curCSS( elem, "margin" + this, true)) || 0;
						} else {
							val -= parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
						}
					});
				}

				if ( elem.offsetWidth !== 0 ) {
					getWH();
				} else {
					jQuery.swap( elem, props, getWH );
				}

				return Math.max(0, Math.round(val));
			}

			return jQuery.curCSS( elem, name, force );
		},

		curCSS: function( elem, name, force ) {
			var ret, style = elem.style, filter;

			// IE uses filters for opacity
			if ( !jQuery.support.opacity && name === "opacity" && elem.currentStyle ) {
				ret = ropacity.test(elem.currentStyle.filter || "") ?
					(parseFloat(RegExp.$1) / 100) + "" :
					"";

				return ret === "" ?
					"1" :
					ret;
			}

			// Make sure we're using the right name for getting the float value
			if ( rfloat.test( name ) ) {
				name = styleFloat;
			}

			if ( !force && style && style[ name ] ) {
				ret = style[ name ];

			} else if ( getComputedStyle ) {

				// Only "float" is needed here
				if ( rfloat.test( name ) ) {
					name = "float";
				}

				name = name.replace( rupper, "-$1" ).toLowerCase();

				var defaultView = elem.ownerDocument.defaultView;

				if ( !defaultView ) {
					return null;
				}

				var computedStyle = defaultView.getComputedStyle( elem, null );

				if ( computedStyle ) {
					ret = computedStyle.getPropertyValue( name );
				}

				// We should always get a number back from opacity
				if ( name === "opacity" && ret === "" ) {
					ret = "1";
				}

			} else if ( elem.currentStyle ) {
				var camelCase = name.replace(rdashAlpha, fcamelCase);

				ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

				// From the awesome hack by Dean Edwards
				// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

				// If we're not dealing with a regular pixel number
				// but a number that has a weird ending, we need to convert it to pixels
				if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
					// Remember the original values
					var left = style.left, rsLeft = elem.runtimeStyle.left;

					// Put in the new values to get a computed value out
					elem.runtimeStyle.left = elem.currentStyle.left;
					style.left = camelCase === "fontSize" ? "1em" : (ret || 0);
					ret = style.pixelLeft + "px";

					// Revert the changed values
					style.left = left;
					elem.runtimeStyle.left = rsLeft;
				}
			}

			return ret;
		},

		// A method for quickly swapping in/out CSS properties to get correct calculations
		swap: function( elem, options, callback ) {
			var old = {};

			// Remember the old values, and insert the new ones
			for ( var name in options ) {
				old[ name ] = elem.style[ name ];
				elem.style[ name ] = options[ name ];
			}

			callback.call( elem );

			// Revert the old values
			for ( var name in options ) {
				elem.style[ name ] = old[ name ];
			}
		}
	});

	if ( jQuery.expr && jQuery.expr.filters ) {
		jQuery.expr.filters.hidden = function( elem ) {
			var width = elem.offsetWidth, height = elem.offsetHeight,
				skip = elem.nodeName.toLowerCase() === "tr";

			return width === 0 && height === 0 && !skip ?
				true :
				width > 0 && height > 0 && !skip ?
					false :
					jQuery.curCSS(elem, "display") === "none";
		};

		jQuery.expr.filters.visible = function( elem ) {
			return !jQuery.expr.filters.hidden( elem );
		};
	}
	var jsc = now(),
		rscript = /<script(.|\s)*?\/script>/gi,
		rselectTextarea = /select|textarea/i,
		rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
		jsre = /=\?(&|$)/,
		rquery = /\?/,
		rts = /(\?|&)_=.*?(&|$)/,
		rurl = /^(\w+:)?\/\/([^\/?#]+)/,
		r20 = /%20/g,

		// Keep a copy of the old load method
		_load = jQuery.fn.load;

	jQuery.fn.extend({
		load: function( url, params, callback ) {
			if ( typeof url !== "string" ) {
				return _load.call( this, url );

			// Don't do a request if no elements are being requested
			} else if ( !this.length ) {
				return this;
			}

			var off = url.indexOf(" ");
			if ( off >= 0 ) {
				var selector = url.slice(off, url.length);
				url = url.slice(0, off);
			}

			// Default to a GET request
			var type = "GET";

			// If the second parameter was provided
			if ( params ) {
				// If it's a function
				if ( jQuery.isFunction( params ) ) {
					// We assume that it's the callback
					callback = params;
					params = null;

				// Otherwise, build a param string
				} else if ( typeof params === "object" ) {
					params = jQuery.param( params, jQuery.ajaxSettings.traditional );
					type = "POST";
				}
			}

			var self = this;

			// Request the remote document
			jQuery.ajax({
				url: url,
				type: type,
				dataType: "html",
				data: params,
				complete: function( res, status ) {
					// If successful, inject the HTML into all the matched elements
					if ( status === "success" || status === "notmodified" ) {
						// See if a selector was specified
						self.html( selector ?
							// Create a dummy div to hold the results
							jQuery("<div />")
								// inject the contents of the document in, removing the scripts
								// to avoid any 'Permission Denied' errors in IE
								.append(res.responseText.replace(rscript, ""))

								// Locate the specified elements
								.find(selector) :

							// If not, just inject the full result
							res.responseText );
					}

					if ( callback ) {
						self.each( callback, [res.responseText, status, res] );
					}
				}
			});

			return this;
		},

		serialize: function() {
			return jQuery.param(this.serializeArray());
		},
		serializeArray: function() {
			return this.map(function() {
				return this.elements ? jQuery.makeArray(this.elements) : this;
			})
			.filter(function() {
				return this.name && !this.disabled &&
					(this.checked || rselectTextarea.test(this.nodeName) ||
						rinput.test(this.type));
			})
			.map(function( i, elem ) {
				var val = jQuery(this).val();

				return val == null ?
					null :
					jQuery.isArray(val) ?
						jQuery.map( val, function( val, i ) {
							return { name: elem.name, value: val };
						}) :
						{ name: elem.name, value: val };
			}).get();
		}
	});

	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function( i, o ) {
		jQuery.fn[o] = function( f ) {
			return this.bind(o, f);
		};
	});

	jQuery.extend({

		get: function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = null;
			}

			return jQuery.ajax({
				type: "GET",
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		},

		getScript: function( url, callback ) {
			return jQuery.get(url, null, callback, "script");
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get(url, data, callback, "json");
		},

		post: function( url, data, callback, type ) {
			// shift arguments if data argument was omited
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = {};
			}

			return jQuery.ajax({
				type: "POST",
				url: url,
				data: data,
				success: callback,
				dataType: type
			});
		},

		ajaxSetup: function( settings ) {
			jQuery.extend( jQuery.ajaxSettings, settings );
		},

		ajaxSettings: {
			url: location.href,
			global: true,
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			processData: true,
			async: true,
			/*
			timeout: 0,
			data: null,
			username: null,
			password: null,
			traditional: false,
			*/
			// Create the request object; Microsoft failed to properly
			// implement the XMLHttpRequest in IE7 (can't request local files),
			// so we use the ActiveXObject when it is available
			// This function can be overriden by calling jQuery.ajaxSetup
			xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
				function() {
					return new window.XMLHttpRequest();
				} :
				function() {
					try {
						return new window.ActiveXObject("Microsoft.XMLHTTP");
					} catch(e) {}
				},
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				script: "text/javascript, application/javascript",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajax: function( origSettings ) {
			var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings);
		
			var jsonp, status, data,
				callbackContext = origSettings && origSettings.context || s,
				type = s.type.toUpperCase();

			// convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Handle JSONP Parameter Callbacks
			if ( s.dataType === "jsonp" ) {
				if ( type === "GET" ) {
					if ( !jsre.test( s.url ) ) {
						s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
					}
				} else if ( !s.data || !jsre.test(s.data) ) {
					s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
				}
				s.dataType = "json";
			}

			// Build temporary JSONP function
			if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
				jsonp = s.jsonpCallback || ("jsonp" + jsc++);

				// Replace the =? sequence both in the query string and the data
				if ( s.data ) {
					s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
				}

				s.url = s.url.replace(jsre, "=" + jsonp + "$1");

				// We need to make sure
				// that a JSONP style response is executed properly
				s.dataType = "script";

				// Handle JSONP-style loading
				window[ jsonp ] = window[ jsonp ] || function( tmp ) {
					data = tmp;
					success();
					complete();
					// Garbage collect
					window[ jsonp ] = undefined;

					try {
						delete window[ jsonp ];
					} catch(e) {}

					if ( head ) {
						head.removeChild( script );
					}
				};
			}

			if ( s.dataType === "script" && s.cache === null ) {
				s.cache = false;
			}

			if ( s.cache === false && type === "GET" ) {
				var ts = now();

				// try replacing _= if it is there
				var ret = s.url.replace(rts, "$1_=" + ts + "$2");

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
			}

			// If data is available, append data to url for get requests
			if ( s.data && type === "GET" ) {
				s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
			}

			// Watch for a new set of requests
			if ( s.global && ! jQuery.active++ ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Matches an absolute URL, and saves the domain
			var parts = rurl.exec( s.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			// If we're requesting a remote document
			// and trying to load JSON or Script with a GET
			if ( s.dataType === "script" && type === "GET" && remote ) {
				var head = document.getElementsByTagName("head")[0] || document.documentElement;
				var script = document.createElement("script");
				script.src = s.url;
				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				// Handle Script loading
				if ( !jsonp ) {
					var done = false;

					// Attach handlers for all browsers
					script.onload = script.onreadystatechange = function() {
						if ( !done && (!this.readyState ||
								this.readyState === "loaded" || this.readyState === "complete") ) {
							done = true;
							success();
							complete();

							// Handle memory leak in IE
							script.onload = script.onreadystatechange = null;
							if ( head && script.parentNode ) {
								head.removeChild( script );
							}
						}
					};
				}

				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );

				// We handle everything using the script element injection
				return undefined;
			}

			var requestDone = false;

			// Create the request object
			var xhr = s.xhr();

			if ( !xhr ) {
				return;
			}

			// Open the socket
			// Passing null username, generates a login popup on Opera (#2865)
			if ( s.username ) {
				xhr.open(type, s.url, s.async, s.username, s.password);
			} else {
				xhr.open(type, s.url, s.async);
			}

			// Need an extra try/catch for cross domain requests in Firefox 3
			try {
				// Set the correct header, if data is being sent
				if ( s.data || origSettings && origSettings.contentType ) {
					xhr.setRequestHeader("Content-Type", s.contentType);
				}

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					if ( jQuery.lastModified[s.url] ) {
						xhr.setRequestHeader("If-Modified-Since", jQuery.lastModified[s.url]);
					}

					if ( jQuery.etag[s.url] ) {
						xhr.setRequestHeader("If-None-Match", jQuery.etag[s.url]);
					}
				}

				// Set header so the called script knows that it's an XMLHttpRequest
				// Only send the header if it's not a remote XHR
				if ( !remote ) {
					xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
				}

				// Set the Accepts header for the server, depending on the dataType
				xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
					s.accepts[ s.dataType ] + ", */*" :
					s.accepts._default );
			} catch(e) {}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend && s.beforeSend.call(callbackContext, xhr, s) === false ) {
				// Handle the global AJAX counter
				if ( s.global && ! --jQuery.active ) {
					jQuery.event.trigger( "ajaxStop" );
				}

				// close opended socket
				xhr.abort();
				return false;
			}

			if ( s.global ) {
				trigger("ajaxSend", [xhr, s]);
			}

			// Wait for a response to come back
			var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
				// The request was aborted
				if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
					// Opera doesn't call onreadystatechange before this point
					// so we simulate the call
					if ( !requestDone ) {
						complete();
					}

					requestDone = true;
					if ( xhr ) {
						xhr.onreadystatechange = jQuery.noop;
					}

				// The transfer is complete and the data is available, or the request timed out
				} else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
					requestDone = true;
					xhr.onreadystatechange = jQuery.noop;

					status = isTimeout === "timeout" ?
						"timeout" :
						!jQuery.httpSuccess( xhr ) ?
							"error" :
							s.ifModified && jQuery.httpNotModified( xhr, s.url ) ?
								"notmodified" :
								"success";

					var errMsg;

					if ( status === "success" ) {
						// Watch for, and catch, XML document parse errors
						try {
							// process the data (runs the xml through httpData regardless of callback)
							data = jQuery.httpData( xhr, s.dataType, s );
						} catch(err) {
							status = "parsererror";
							errMsg = err;
						}
					}

					// Make sure that the request was successful or notmodified
					if ( status === "success" || status === "notmodified" ) {
						// JSONP handles its own success callback
						if ( !jsonp ) {
							success();
						}
					} else {
						jQuery.handleError(s, xhr, status, errMsg);
					}

					// Fire the complete handlers
					complete();

					if ( isTimeout === "timeout" ) {
						xhr.abort();
					}

					// Stop memory leaks
					if ( s.async ) {
						xhr = null;
					}
				}
			};

			// Override the abort handler, if we can (IE doesn't allow it, but that's OK)
			// Opera doesn't fire onreadystatechange at all on abort
			try {
				var oldAbort = xhr.abort;
				xhr.abort = function() {
					if ( xhr ) {
						oldAbort.call( xhr );
					}

					onreadystatechange( "abort" );
				};
			} catch(e) { }

			// Timeout checker
			if ( s.async && s.timeout > 0 ) {
				setTimeout(function() {
					// Check to see if the request is still happening
					if ( xhr && !requestDone ) {
						onreadystatechange( "timeout" );
					}
				}, s.timeout);
			}

			// Send the data
			try {
				xhr.send( type === "POST" || type === "PUT" || type === "DELETE" ? s.data : null );
			} catch(e) {
				jQuery.handleError(s, xhr, null, e);
				// Fire the complete handlers
				complete();
			}

			// firefox 1.5 doesn't fire statechange for sync requests
			if ( !s.async ) {
				onreadystatechange();
			}

			function success() {
				// If a local callback was specified, fire it and pass it the data
				if ( s.success ) {
					s.success.call( callbackContext, data, status, xhr );
				}

				// Fire the global callback
				if ( s.global ) {
					trigger( "ajaxSuccess", [xhr, s] );
				}
			}

			function complete() {
				// Process result
				if ( s.complete ) {
					s.complete.call( callbackContext, xhr, status);
				}

				// The request was completed
				if ( s.global ) {
					trigger( "ajaxComplete", [xhr, s] );
				}

				// Handle the global AJAX counter
				if ( s.global && ! --jQuery.active ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		
			function trigger(type, args) {
				(s.context ? jQuery(s.context) : jQuery.event).trigger(type, args);
			}

			// return XMLHttpRequest to allow aborting the request etc.
			return xhr;
		},

		handleError: function( s, xhr, status, e ) {
			// If a local callback was specified, fire it
			if ( s.error ) {
				s.error.call( s.context || s, xhr, status, e );
			}

			// Fire the global callback
			if ( s.global ) {
				(s.context ? jQuery(s.context) : jQuery.event).trigger( "ajaxError", [xhr, s, e] );
			}
		},

		// Counter for holding the number of active queries
		active: 0,

		// Determines if an XMLHttpRequest was successful or not
		httpSuccess: function( xhr ) {
			try {
				// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
				return !xhr.status && location.protocol === "file:" ||
					// Opera returns 0 when status is 304
					( xhr.status >= 200 && xhr.status < 300 ) ||
					xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;
			} catch(e) {}

			return false;
		},

		// Determines if an XMLHttpRequest returns NotModified
		httpNotModified: function( xhr, url ) {
			var lastModified = xhr.getResponseHeader("Last-Modified"),
				etag = xhr.getResponseHeader("Etag");

			if ( lastModified ) {
				jQuery.lastModified[url] = lastModified;
			}

			if ( etag ) {
				jQuery.etag[url] = etag;
			}

			// Opera returns 0 when status is 304
			return xhr.status === 304 || xhr.status === 0;
		},

		httpData: function( xhr, type, s ) {
			var ct = xhr.getResponseHeader("content-type") || "",
				xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
				data = xml ? xhr.responseXML : xhr.responseText;

			if ( xml && data.documentElement.nodeName === "parsererror" ) {
				jQuery.error( "parsererror" );
			}

			// Allow a pre-filtering function to sanitize the response
			// s is checked to keep backwards compatibility
			if ( s && s.dataFilter ) {
				data = s.dataFilter( data, type );
			}

			// The filter can actually parse the response
			if ( typeof data === "string" ) {
				// Get the JavaScript object, if JSON is used.
				if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
					data = jQuery.parseJSON( data );

				// If the type is "script", eval it in global context
				} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
					jQuery.globalEval( data );
				}
			}

			return data;
		},

		// Serialize an array of form elements or a set of
		// key/values into a query string
		param: function( a, traditional ) {
			var s = [];
		
			// Set traditional to true for jQuery <= 1.3.2 behavior.
			if ( traditional === undefined ) {
				traditional = jQuery.ajaxSettings.traditional;
			}
		
			// If an array was passed in, assume that it is an array of form elements.
			if ( jQuery.isArray(a) || a.jquery ) {
				// Serialize the form elements
				jQuery.each( a, function() {
					add( this.name, this.value );
				});
			
			} else {
				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for ( var prefix in a ) {
					buildParams( prefix, a[prefix] );
				}
			}

			// Return the resulting serialization
			return s.join("&").replace(r20, "+");

			function buildParams( prefix, obj ) {
				if ( jQuery.isArray(obj) ) {
					// Serialize array item.
					jQuery.each( obj, function( i, v ) {
						if ( traditional || /\[\]$/.test( prefix ) ) {
							// Treat each array item as a scalar.
							add( prefix, v );
						} else {
							// If array item is non-scalar (array or object), encode its
							// numeric index to resolve deserialization ambiguity issues.
							// Note that rack (as of 1.0.0) can't currently deserialize
							// nested arrays properly, and attempting to do so may cause
							// a server error. Possible fixes are to modify rack's
							// deserialization algorithm or to provide an option or flag
							// to force array serialization to be shallow.
							buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v );
						}
					});
					
				} else if ( !traditional && obj != null && typeof obj === "object" ) {
					// Serialize object item.
					jQuery.each( obj, function( k, v ) {
						buildParams( prefix + "[" + k + "]", v );
					});
					
				} else {
					// Serialize scalar item.
					add( prefix, obj );
				}
			}

			function add( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction(value) ? value() : value;
				s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
			}
		}
	});
	var elemdisplay = {},
		rfxtypes = /toggle|show|hide/,
		rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/,
		timerId,
		fxAttrs = [
			// height animations
			[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
			// width animations
			[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
			// opacity animations
			[ "opacity" ]
		];

	jQuery.fn.extend({
		show: function( speed, callback ) {
			if ( speed || speed === 0) {
				return this.animate( genFx("show", 3), speed, callback);

			} else {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					var old = jQuery.data(this[i], "olddisplay");

					this[i].style.display = old || "";

					if ( jQuery.css(this[i], "display") === "none" ) {
						var nodeName = this[i].nodeName, display;

						if ( elemdisplay[ nodeName ] ) {
							display = elemdisplay[ nodeName ];

						} else {
							var elem = jQuery("<" + nodeName + " />").appendTo("body");

							display = elem.css("display");

							if ( display === "none" ) {
								display = "block";
							}

							elem.remove();

							elemdisplay[ nodeName ] = display;
						}

						jQuery.data(this[i], "olddisplay", display);
					}
				}

				// Set the display of the elements in a second loop
				// to avoid the constant reflow
				for ( var j = 0, k = this.length; j < k; j++ ) {
					this[j].style.display = jQuery.data(this[j], "olddisplay") || "";
				}

				return this;
			}
		},

		hide: function( speed, callback ) {
			if ( speed || speed === 0 ) {
				return this.animate( genFx("hide", 3), speed, callback);

			} else {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					var old = jQuery.data(this[i], "olddisplay");
					if ( !old && old !== "none" ) {
						jQuery.data(this[i], "olddisplay", jQuery.css(this[i], "display"));
					}
				}

				// Set the display of the elements in a second loop
				// to avoid the constant reflow
				for ( var j = 0, k = this.length; j < k; j++ ) {
					this[j].style.display = "none";
				}

				return this;
			}
		},

		// Save the old toggle function
		_toggle: jQuery.fn.toggle,

		toggle: function( fn, fn2 ) {
			var bool = typeof fn === "boolean";

			if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
				this._toggle.apply( this, arguments );

			} else if ( fn == null || bool ) {
				this.each(function() {
					var state = bool ? fn : jQuery(this).is(":hidden");
					jQuery(this)[ state ? "show" : "hide" ]();
				});

			} else {
				this.animate(genFx("toggle", 3), fn, fn2);
			}

			return this;
		},

		fadeTo: function( speed, to, callback ) {
			return this.filter(":hidden").css("opacity", 0).show().end()
						.animate({opacity: to}, speed, callback);
		},

		animate: function( prop, speed, easing, callback ) {
			var optall = jQuery.speed(speed, easing, callback);

			if ( jQuery.isEmptyObject( prop ) ) {
				return this.each( optall.complete );
			}

			return this[ optall.queue === false ? "each" : "queue" ](function() {
				var opt = jQuery.extend({}, optall), p,
					hidden = this.nodeType === 1 && jQuery(this).is(":hidden"),
					self = this;

				for ( p in prop ) {
					var name = p.replace(rdashAlpha, fcamelCase);

					if ( p !== name ) {
						prop[ name ] = prop[ p ];
						delete prop[ p ];
						p = name;
					}

					if ( prop[p] === "hide" && hidden || prop[p] === "show" && !hidden ) {
						return opt.complete.call(this);
					}

					if ( ( p === "height" || p === "width" ) && this.style ) {
						// Store display property
						opt.display = jQuery.css(this, "display");

						// Make sure that nothing sneaks out
						opt.overflow = this.style.overflow;
					}

					if ( jQuery.isArray( prop[p] ) ) {
						// Create (if needed) and add to specialEasing
						(opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
						prop[p] = prop[p][0];
					}
				}

				if ( opt.overflow != null ) {
					this.style.overflow = "hidden";
				}

				opt.curAnim = jQuery.extend({}, prop);

				jQuery.each( prop, function( name, val ) {
					var e = new jQuery.fx( self, opt, name );

					if ( rfxtypes.test(val) ) {
						e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );

					} else {
						var parts = rfxnum.exec(val),
							start = e.cur(true) || 0;

						if ( parts ) {
							var end = parseFloat( parts[2] ),
								unit = parts[3] || "px";

							// We need to compute starting value
							if ( unit !== "px" ) {
								self.style[ name ] = (end || 1) + unit;
								start = ((end || 1) / e.cur(true)) * start;
								self.style[ name ] = start + unit;
							}

							// If a +=/-= token was provided, we're doing a relative animation
							if ( parts[1] ) {
								end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
							}

							e.custom( start, end, unit );

						} else {
							e.custom( start, val, "" );
						}
					}
				});

				// For JS strict compliance
				return true;
			});
		},

		stop: function( clearQueue, gotoEnd ) {
			var timers = jQuery.timers;

			if ( clearQueue ) {
				this.queue([]);
			}

			this.each(function() {
				// go in reverse order so anything added to the queue during the loop is ignored
				for ( var i = timers.length - 1; i >= 0; i-- ) {
					if ( timers[i].elem === this ) {
						if (gotoEnd) {
							// force the next step to be the last
							timers[i](true);
						}

						timers.splice(i, 1);
					}
				}
			});

			// start the next in the queue if the last step wasn't forced
			if ( !gotoEnd ) {
				this.dequeue();
			}

			return this;
		}

	});

	// Generate shortcuts for custom animations
	jQuery.each({
		slideDown: genFx("show", 1),
		slideUp: genFx("hide", 1),
		slideToggle: genFx("toggle", 1),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, callback ) {
			return this.animate( props, speed, callback );
		};
	});

	jQuery.extend({
		speed: function( speed, easing, fn ) {
			var opt = speed && typeof speed === "object" ? speed : {
				complete: fn || !fn && easing ||
					jQuery.isFunction( speed ) && speed,
				duration: speed,
				easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
			};

			opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
				jQuery.fx.speeds[opt.duration] || jQuery.fx.speeds._default;

			// Queueing
			opt.old = opt.complete;
			opt.complete = function() {
				if ( opt.queue !== false ) {
					jQuery(this).dequeue();
				}
				if ( jQuery.isFunction( opt.old ) ) {
					opt.old.call( this );
				}
			};

			return opt;
		},

		easing: {
			linear: function( p, n, firstNum, diff ) {
				return firstNum + diff * p;
			},
			swing: function( p, n, firstNum, diff ) {
				return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
			}
		},

		timers: [],

		fx: function( elem, options, prop ) {
			this.options = options;
			this.elem = elem;
			this.prop = prop;

			if ( !options.orig ) {
				options.orig = {};
			}
		}

	});

	jQuery.fx.prototype = {
		// Simple function for setting a style value
		update: function() {
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			(jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

			// Set display property to block for height/width animations
			if ( ( this.prop === "height" || this.prop === "width" ) && this.elem.style ) {
				this.elem.style.display = "block";
			}
		},

		// Get the current size
		cur: function( force ) {
			if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
				return this.elem[ this.prop ];
			}

			var r = parseFloat(jQuery.css(this.elem, this.prop, force));
			return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
		},

		// Start an animation from one number to another
		custom: function( from, to, unit ) {
			this.startTime = now();
			this.start = from;
			this.end = to;
			this.unit = unit || this.unit || "px";
			this.now = this.start;
			this.pos = this.state = 0;

			var self = this;
			function t( gotoEnd ) {
				return self.step(gotoEnd);
			}

			t.elem = this.elem;

			if ( t() && jQuery.timers.push(t) && !timerId ) {
				timerId = setInterval(jQuery.fx.tick, 13);
			}
		},

		// Simple 'show' function
		show: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
			this.options.show = true;

			// Begin the animation
			// Make sure that we start at a small width/height to avoid any
			// flash of content
			this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

			// Start by showing the element
			jQuery( this.elem ).show();
		},

		// Simple 'hide' function
		hide: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
			this.options.hide = true;

			// Begin the animation
			this.custom(this.cur(), 0);
		},

		// Each step of an animation
		step: function( gotoEnd ) {
			var t = now(), done = true;

			if ( gotoEnd || t >= this.options.duration + this.startTime ) {
				this.now = this.end;
				this.pos = this.state = 1;
				this.update();

				this.options.curAnim[ this.prop ] = true;

				for ( var i in this.options.curAnim ) {
					if ( this.options.curAnim[i] !== true ) {
						done = false;
					}
				}

				if ( done ) {
					if ( this.options.display != null ) {
						// Reset the overflow
						this.elem.style.overflow = this.options.overflow;

						// Reset the display
						var old = jQuery.data(this.elem, "olddisplay");
						this.elem.style.display = old ? old : this.options.display;

						if ( jQuery.css(this.elem, "display") === "none" ) {
							this.elem.style.display = "block";
						}
					}

					// Hide the element if the "hide" operation was done
					if ( this.options.hide ) {
						jQuery(this.elem).hide();
					}

					// Reset the properties, if the item has been hidden or shown
					if ( this.options.hide || this.options.show ) {
						for ( var p in this.options.curAnim ) {
							jQuery.style(this.elem, p, this.options.orig[p]);
						}
					}

					// Execute the complete function
					this.options.complete.call( this.elem );
				}

				return false;

			} else {
				var n = t - this.startTime;
				this.state = n / this.options.duration;

				// Perform the easing function, defaults to swing
				var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
				var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
				this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
				this.now = this.start + ((this.end - this.start) * this.pos);

				// Perform the next step of the animation
				this.update();
			}

			return true;
		}
	};

	jQuery.extend( jQuery.fx, {
		tick: function() {
			var timers = jQuery.timers;

			for ( var i = 0; i < timers.length; i++ ) {
				if ( !timers[i]() ) {
					timers.splice(i--, 1);
				}
			}

			if ( !timers.length ) {
				jQuery.fx.stop();
			}
		},
		
		stop: function() {
			clearInterval( timerId );
			timerId = null;
		},
	
		speeds: {
			slow: 600,
	 		fast: 200,
	 		// Default speed
	 		_default: 400
		},

		step: {
			opacity: function( fx ) {
				jQuery.style(fx.elem, "opacity", fx.now);
			},

			_default: function( fx ) {
				if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
					fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
				} else {
					fx.elem[ fx.prop ] = fx.now;
				}
			}
		}
	});

	if ( jQuery.expr && jQuery.expr.filters ) {
		jQuery.expr.filters.animated = function( elem ) {
			return jQuery.grep(jQuery.timers, function( fn ) {
				return elem === fn.elem;
			}).length;
		};
	}

	function genFx( type, num ) {
		var obj = {};

		jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
			obj[ this ] = type;
		});

		return obj;
	}
	if ( "getBoundingClientRect" in document.documentElement ) {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];

			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}

			if ( !elem || !elem.ownerDocument ) {
				return null;
			}

			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}

			var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
				left = box.left + (self.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

			return { top: top, left: left };
		};

	} else {
		jQuery.fn.offset = function( options ) {
			var elem = this[0];

			if ( options ) { 
				return this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
			}

			if ( !elem || !elem.ownerDocument ) {
				return null;
			}

			if ( elem === elem.ownerDocument.body ) {
				return jQuery.offset.bodyOffset( elem );
			}

			jQuery.offset.initialize();

			var offsetParent = elem.offsetParent, prevOffsetParent = elem,
				doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
				body = doc.body, defaultView = doc.defaultView,
				prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
				top = elem.offsetTop, left = elem.offsetLeft;

			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
					break;
				}

				computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;

				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;

					if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}

					prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
				}

				if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevComputedStyle = computedStyle;
			}

			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}

			if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}

			return { top: top, left: left };
		};
	}

	jQuery.offset = {
		initialize: function() {
			var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.curCSS(body, "marginTop", true) ) || 0,
				html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

			jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

			container.innerHTML = html;
			body.insertBefore( container, body.firstChild );
			innerDiv = container.firstChild;
			checkDiv = innerDiv.firstChild;
			td = innerDiv.nextSibling.firstChild.firstChild;

			this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
			this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

			checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
			// safari subtracts parent border width here which is 5px
			this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
			checkDiv.style.position = checkDiv.style.top = "";

			innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
			this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

			this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

			body.removeChild( container );
			body = container = innerDiv = checkDiv = table = td = null;
			jQuery.offset.initialize = jQuery.noop;
		},

		bodyOffset: function( body ) {
			var top = body.offsetTop, left = body.offsetLeft;

			jQuery.offset.initialize();

			if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
				top  += parseFloat( jQuery.curCSS(body, "marginTop",  true) ) || 0;
				left += parseFloat( jQuery.curCSS(body, "marginLeft", true) ) || 0;
			}

			return { top: top, left: left };
		},
	
		setOffset: function( elem, options, i ) {
			// set position first, in-case top/left are set even on static elem
			if ( /static/.test( jQuery.curCSS( elem, "position" ) ) ) {
				elem.style.position = "relative";
			}
			var curElem   = jQuery( elem ),
				curOffset = curElem.offset(),
				curTop    = parseInt( jQuery.curCSS( elem, "top",  true ), 10 ) || 0,
				curLeft   = parseInt( jQuery.curCSS( elem, "left", true ), 10 ) || 0;

			if ( jQuery.isFunction( options ) ) {
				options = options.call( elem, i, curOffset );
			}

			var props = {
				top:  (options.top  - curOffset.top)  + curTop,
				left: (options.left - curOffset.left) + curLeft
			};
		
			if ( "using" in options ) {
				options.using.call( elem, props );
			} else {
				curElem.css( props );
			}
		}
	};


	jQuery.fn.extend({
		position: function() {
			if ( !this[0] ) {
				return null;
			}

			var elem = this[0],

			// Get *real* offsetParent
			offsetParent = this.offsetParent(),

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = /^body|html$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseFloat( jQuery.curCSS(elem, "marginTop",  true) ) || 0;
			offset.left -= parseFloat( jQuery.curCSS(elem, "marginLeft", true) ) || 0;

			// Add offsetParent borders
			parentOffset.top  += parseFloat( jQuery.curCSS(offsetParent[0], "borderTopWidth",  true) ) || 0;
			parentOffset.left += parseFloat( jQuery.curCSS(offsetParent[0], "borderLeftWidth", true) ) || 0;

			// Subtract the two offsets
			return {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		},

		offsetParent: function() {
			return this.map(function() {
				var offsetParent = this.offsetParent || document.body;
				while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent;
			});
		}
	});


	// Create scrollLeft and scrollTop methods
	jQuery.each( ["Left", "Top"], function( i, name ) {
		var method = "scroll" + name;

		jQuery.fn[ method ] = function(val) {
			var elem = this[0], win;
		
			if ( !elem ) {
				return null;
			}

			if ( val !== undefined ) {
				// Set the scroll offset
				return this.each(function() {
					win = getWindow( this );

					if ( win ) {
						win.scrollTo(
							!i ? val : jQuery(win).scrollLeft(),
							 i ? val : jQuery(win).scrollTop()
						);

					} else {
						this[ method ] = val;
					}
				});
			} else {
				win = getWindow( elem );

				// Return the scroll offset
				return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
					jQuery.support.boxModel && win.document.documentElement[ method ] ||
						win.document.body[ method ] :
					elem[ method ];
			}
		};
	});

	function getWindow( elem ) {
		return ("scrollTo" in elem && elem.document) ?
			elem :
			elem.nodeType === 9 ?
				elem.defaultView || elem.parentWindow :
				false;
	}
	// Create innerHeight, innerWidth, outerHeight and outerWidth methods
	jQuery.each([ "Height", "Width" ], function( i, name ) {

		var type = name.toLowerCase();

		// innerHeight and innerWidth
		jQuery.fn["inner" + name] = function() {
			return this[0] ?
				jQuery.css( this[0], type, false, "padding" ) :
				null;
		};

		// outerHeight and outerWidth
		jQuery.fn["outer" + name] = function( margin ) {
			return this[0] ?
				jQuery.css( this[0], type, false, margin ? "margin" : "border" ) :
				null;
		};

		jQuery.fn[ type ] = function( size ) {
			// Get window width or height
			var elem = this[0];
			if ( !elem ) {
				return size == null ? null : this;
			}
		
			if ( jQuery.isFunction( size ) ) {
				return this.each(function( i ) {
					var self = jQuery( this );
					self[ type ]( size.call( this, i, self[ type ]() ) );
				});
			}

			return ("scrollTo" in elem && elem.document) ? // does it walk and quack like a window?
				// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
				elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ "client" + name ] ||
				elem.document.body[ "client" + name ] :

				// Get document width or height
				(elem.nodeType === 9) ? // is it a document
					// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
					Math.max(
						elem.documentElement["client" + name],
						elem.body["scroll" + name], elem.documentElement["scroll" + name],
						elem.body["offset" + name], elem.documentElement["offset" + name]
					) :

					// Get or set width or height on the element
					size === undefined ?
						// Get width or height on the element
						jQuery.css( elem, type ) :

						// Set the width or height on the element (default to pixels if value is unitless)
						this.css( type, typeof size === "string" ? size : size + "px" );
		};

	});
	// Expose jQuery to the global object
	window.jQuery = window.$ = jQuery;

	})(window);
/* END JQUERY v1.4.2 */

/* BEGIN JQUERY EASING v1.3 */
	// t: current time, b: begInnIng value, c: change In value, d: duration
	jQuery.easing['jswing'] = jQuery.easing['swing'];

	jQuery.extend( jQuery.easing,
	{
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) {
			//alert(jQuery.easing.default);
			return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
		},
		easeInQuad: function (x, t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (x, t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (x, t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (x, t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (x, t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (x, t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (x, t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function (x, t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (x, t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (x, t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (x, t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (x, t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (x, t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function (x, t, b, c, d) {
			return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
		},
		easeOutBounce: function (x, t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function (x, t, b, c, d) {
			if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
			return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	});
/* END JQUERY EASING v1.3 */

/* BEGIN JQUERY FORM v2.36 */
	;(function($) {
	$.fn.ajaxSubmit = function(options) {
		// fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
		if (!this.length) {
			log('ajaxSubmit: skipping submit process - no element selected');
			return this;
		}

		if (typeof options == 'function')
			options = { success: options };

		var url = $.trim(this.attr('action'));
		if (url) {
			// clean url (don't include hash vaue)
			url = (url.match(/^([^#]+)/)||[])[1];
	   	}
	   	url = url || window.location.href || '';

		options = $.extend({
			url:  url,
			type: this.attr('method') || 'GET',
			iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
		}, options || {});

		// hook for manipulating the form data before it is extracted;
		// convenient for use with rich editors like tinyMCE or FCKEditor
		var veto = {};
		this.trigger('form-pre-serialize', [this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
			return this;
		}

		// provide opportunity to alter form data before it is serialized
		if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSerialize callback');
			return this;
		}

		var a = this.formToArray(options.semantic);
		if (options.data) {
			options.extraData = options.data;
			for (var n in options.data) {
			  if(options.data[n] instanceof Array) {
				for (var k in options.data[n])
				  a.push( { name: n, value: options.data[n][k] } );
			  }
			  else
				 a.push( { name: n, value: options.data[n] } );
			}
		}

		// give pre-submit callback an opportunity to abort the submit
		if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
			log('ajaxSubmit: submit aborted via beforeSubmit callback');
			return this;
		}

		// fire vetoable 'validate' event
		this.trigger('form-submit-validate', [a, this, options, veto]);
		if (veto.veto) {
			log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
			return this;
		}

		var q = $.param(a);

		if (options.type.toUpperCase() == 'GET') {
			options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
			options.data = null;  // data is null for 'get'
		}
		else
			options.data = q; // data is the query string for 'post'

		var $form = this, callbacks = [];
		if (options.resetForm) callbacks.push(function() { $form.resetForm(); });
		if (options.clearForm) callbacks.push(function() { $form.clearForm(); });

		// perform a load on the target only if dataType is not provided
		if (!options.dataType && options.target) {
			var oldSuccess = options.success || function(){};
			callbacks.push(function(data) {
				$(options.target).html(data).each(oldSuccess, arguments);
			});
		}
		else if (options.success)
			callbacks.push(options.success);

		options.success = function(data, status) {
			for (var i=0, max=callbacks.length; i < max; i++)
				callbacks[i].apply(options, [data, status, $form]);
		};

		// are there files to upload?
		var files = $('input:file', this).fieldValue();
		var found = false;
		for (var j=0; j < files.length; j++)
			if (files[j])
				found = true;

		var multipart = false;
	//	var mp = 'multipart/form-data';
	//	multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

		// options.iframe allows user to force iframe mode
		// 06-NOV-09: now defaulting to iframe mode if file input is detected
	   if ((files.length && options.iframe !== false) || options.iframe || found || multipart) {
		   // hack to fix Safari hang (thanks to Tim Molendijk for this)
		   // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
		   if (options.closeKeepAlive)
			   $.get(options.closeKeepAlive, fileUpload);
		   else
			   fileUpload();
		   }
	   else
		   $.ajax(options);

		// fire 'notify' event
		this.trigger('form-submit-notify', [this, options]);
		return this;


		// private function for handling file uploads (hat tip to YAHOO!)
		function fileUpload() {
			var form = $form[0];

			if ($(':input[name=submit]', form).length) {
				alert('Error: Form elements must not be named "submit".');
				return;
			}

			var opts = $.extend({}, $.ajaxSettings, options);
			var s = $.extend(true, {}, $.extend(true, {}, $.ajaxSettings), opts);

			var id = 'jqFormIO' + (new Date().getTime());
			var $io = $('<iframe id="' + id + '" name="' + id + '" src="'+ opts.iframeSrc +'" />');
			var io = $io[0];

			$io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

			var xhr = { // mock object
				aborted: 0,
				responseText: null,
				responseXML: null,
				status: 0,
				statusText: 'n/a',
				getAllResponseHeaders: function() {},
				getResponseHeader: function() {},
				setRequestHeader: function() {},
				abort: function() {
					this.aborted = 1;
					$io.attr('src', opts.iframeSrc); // abort op in progress
				}
			};

			var g = opts.global;
			// trigger ajax global events so that activity/block indicators work like normal
			if (g && ! $.active++) $.event.trigger("ajaxStart");
			if (g) $.event.trigger("ajaxSend", [xhr, opts]);

			if (s.beforeSend && s.beforeSend(xhr, s) === false) {
				s.global && $.active--;
				return;
			}
			if (xhr.aborted)
				return;

			var cbInvoked = 0;
			var timedOut = 0;

			// add submitting element to data if we know it
			var sub = form.clk;
			if (sub) {
				var n = sub.name;
				if (n && !sub.disabled) {
					options.extraData = options.extraData || {};
					options.extraData[n] = sub.value;
					if (sub.type == "image") {
						options.extraData[name+'.x'] = form.clk_x;
						options.extraData[name+'.y'] = form.clk_y;
					}
				}
			}

			// take a breath so that pending repaints get some cpu time before the upload starts
			setTimeout(function() {
				// make sure form attrs are set
				var t = $form.attr('target'), a = $form.attr('action');

				// update form attrs in IE friendly way
				form.setAttribute('target',id);
				if (form.getAttribute('method') != 'POST')
					form.setAttribute('method', 'POST');
				if (form.getAttribute('action') != opts.url)
					form.setAttribute('action', opts.url);

				// ie borks in some cases when setting encoding
				if (! options.skipEncodingOverride) {
					$form.attr({
						encoding: 'multipart/form-data',
						enctype:  'multipart/form-data'
					});
				}

				// support timout
				if (opts.timeout)
					setTimeout(function() { timedOut = true; cb(); }, opts.timeout);

				// add "extra" data to form if provided in options
				var extraInputs = [];
				try {
					if (options.extraData)
						for (var n in options.extraData)
							extraInputs.push(
								$('<input type="hidden" name="'+n+'" value="'+options.extraData[n]+'" />')
									.appendTo(form)[0]);

					// add iframe to doc and submit the form
					$io.appendTo('body');
					io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
					form.submit();
				}
				finally {
					// reset attrs and remove "extra" input elements
					form.setAttribute('action',a);
					t ? form.setAttribute('target', t) : $form.removeAttr('target');
					$(extraInputs).remove();
				}
			}, 10);

			var domCheckCount = 50;

			function cb() {
				if (cbInvoked++) return;

				io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

				var ok = true;
				try {
					if (timedOut) throw 'timeout';
					// extract the server response from the iframe
					var data, doc;

					doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
				
					var isXml = opts.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
					log('isXml='+isXml);
					if (!isXml && (doc.body == null || doc.body.innerHTML == '')) {
					 	if (--domCheckCount) {
							// in some browsers (Opera) the iframe DOM is not always traversable when
							// the onload callback fires, so we loop a bit to accommodate
							cbInvoked = 0;
							setTimeout(cb, 100);
							return;
						}
						log('Could not access iframe DOM after 50 tries.');
						return;
					}

					xhr.responseText = doc.body ? doc.body.innerHTML : null;
					xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
					xhr.getResponseHeader = function(header){
						var headers = {'content-type': opts.dataType};
						return headers[header];
					};

					if (opts.dataType == 'json' || opts.dataType == 'script') {
						// see if user embedded response in textarea
						var ta = doc.getElementsByTagName('textarea')[0];
						if (ta)
							xhr.responseText = ta.value;
						else {
							// account for browsers injecting pre around json response
							var pre = doc.getElementsByTagName('pre')[0];
							if (pre)
								xhr.responseText = pre.innerHTML;
						}			  
					}
					else if (opts.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
						xhr.responseXML = toXml(xhr.responseText);
					}
					data = $.httpData(xhr, opts.dataType);
				}
				catch(e){
					ok = false;
					$.handleError(opts, xhr, 'error', e);
				}

				// ordering of these callbacks/triggers is odd, but that's how $.ajax does it
				if (ok) {
					opts.success(data, 'success');
					if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
				}
				if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
				if (g && ! --$.active) $.event.trigger("ajaxStop");
				if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');

				// clean up
				setTimeout(function() {
					$io.remove();
					xhr.responseXML = null;
				}, 100);
			};

			function toXml(s, doc) {
				if (window.ActiveXObject) {
					doc = new ActiveXObject('Microsoft.XMLDOM');
					doc.async = 'false';
					doc.loadXML(s);
				}
				else
					doc = (new DOMParser()).parseFromString(s, 'text/xml');
				return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
			};
		};
	};
	
	$.fn.ajaxForm = function(options) {
		return this.ajaxFormUnbind().bind('submit.form-plugin', function() {
			$(this).ajaxSubmit(options);
			return false;
		}).bind('click.form-plugin', function(e) {
			var target = e.target;
			var $el = $(target);
			if (!($el.is(":submit,input:image"))) {
				// is this a child element of the submit el?  (ex: a span within a button)
				var t = $el.closest(':submit');
				if (t.length == 0)
					return;
				target = t[0];
			}
			var form = this;
			form.clk = target;
			if (target.type == 'image') {
				if (e.offsetX != undefined) {
					form.clk_x = e.offsetX;
					form.clk_y = e.offsetY;
				} else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
					var offset = $el.offset();
					form.clk_x = e.pageX - offset.left;
					form.clk_y = e.pageY - offset.top;
				} else {
					form.clk_x = e.pageX - target.offsetLeft;
					form.clk_y = e.pageY - target.offsetTop;
				}
			}
			// clear form vars
			setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
		});
	};

	// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
	$.fn.ajaxFormUnbind = function() {
		return this.unbind('submit.form-plugin click.form-plugin');
	};
	
	$.fn.formToArray = function(semantic) {
		var a = [];
		if (this.length == 0) return a;

		var form = this[0];
		var els = semantic ? form.getElementsByTagName('*') : form.elements;
		if (!els) return a;
		for(var i=0, max=els.length; i < max; i++) {
			var el = els[i];
			var n = el.name;
			if (!n) continue;

			if (semantic && form.clk && el.type == "image") {
				// handle image inputs on the fly when semantic == true
				if(!el.disabled && form.clk == el) {
					a.push({name: n, value: $(el).val()});
					a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
				}
				continue;
			}

			var v = $.fieldValue(el, true);
			if (v && v.constructor == Array) {
				for(var j=0, jmax=v.length; j < jmax; j++)
					a.push({name: n, value: v[j]});
			}
			else if (v !== null && typeof v != 'undefined')
				a.push({name: n, value: v});
		}

		if (!semantic && form.clk) {
			// input type=='image' are not found in elements array! handle it here
			var $input = $(form.clk), input = $input[0], n = input.name;
			if (n && !input.disabled && input.type == 'image') {
				a.push({name: n, value: $input.val()});
				a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
			}
		}
		return a;
	};
	
	$.fn.formSerialize = function(semantic) {
		//hand off to jQuery.param for proper encoding
		return $.param(this.formToArray(semantic));
	};
	
	$.fn.fieldSerialize = function(successful) {
		var a = [];
		this.each(function() {
			var n = this.name;
			if (!n) return;
			var v = $.fieldValue(this, successful);
			if (v && v.constructor == Array) {
				for (var i=0,max=v.length; i < max; i++)
					a.push({name: n, value: v[i]});
			}
			else if (v !== null && typeof v != 'undefined')
				a.push({name: this.name, value: v});
		});
		//hand off to jQuery.param for proper encoding
		return $.param(a);
	};
	
	$.fn.fieldValue = function(successful) {
		for (var val=[], i=0, max=this.length; i < max; i++) {
			var el = this[i];
			var v = $.fieldValue(el, successful);
			if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
				continue;
			v.constructor == Array ? $.merge(val, v) : val.push(v);
		}
		return val;
	};

	/**
	 * Returns the value of the field element.
	 */
	$.fieldValue = function(el, successful) {
		var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
		if (typeof successful == 'undefined') successful = true;

		if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
			(t == 'checkbox' || t == 'radio') && !el.checked ||
			(t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
			tag == 'select' && el.selectedIndex == -1))
				return null;

		if (tag == 'select') {
			var index = el.selectedIndex;
			if (index < 0) return null;
			var a = [], ops = el.options;
			var one = (t == 'select-one');
			var max = (one ? index+1 : ops.length);
			for(var i=(one ? index : 0); i < max; i++) {
				var op = ops[i];
				if (op.selected) {
					var v = op.value;
					if (!v) // extra pain for IE...
						v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
					if (one) return v;
					a.push(v);
				}
			}
			return a;
		}
		return el.value;
	};
	
	$.fn.clearForm = function() {
		return this.each(function() {
			$('input,select,textarea', this).clearFields();
		});
	};
	
	$.fn.clearFields = $.fn.clearInputs = function() {
		return this.each(function() {
			var t = this.type, tag = this.tagName.toLowerCase();
			if (t == 'text' || t == 'password' || tag == 'textarea')
				this.value = '';
			else if (t == 'checkbox' || t == 'radio')
				this.checked = false;
			else if (tag == 'select')
				this.selectedIndex = -1;
		});
	};
	
	$.fn.resetForm = function() {
		return this.each(function() {
			// guard against an input with the name of 'reset'
			// note that IE reports the reset function as an 'object'
			if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
				this.reset();
		});
	};
	
	$.fn.enable = function(b) {
		if (b == undefined) b = true;
		return this.each(function() {
			this.disabled = !b;
		});
	};
	
	$.fn.selected = function(select) {
		if (select == undefined) select = true;
		return this.each(function() {
			var t = this.type;
			if (t == 'checkbox' || t == 'radio')
				this.checked = select;
			else if (this.tagName.toLowerCase() == 'option') {
				var $sel = $(this).parent('select');
				if (select && $sel[0] && $sel[0].type == 'select-one') {
					// deselect all other options
					$sel.find('option').selected(false);
				}
				this.selected = select;
			}
		});
	};

	// helper fn for console logging
	// set $.fn.ajaxSubmit.debug to true to enable debug logging
	function log() {
		if ($.fn.ajaxSubmit.debug && window.console && window.console.log)
			window.console.log('[jquery.form] ' + Array.prototype.join.call(arguments,''));
	};

	})(jQuery);
/* END JQUERY FORM v2.36 */

/* BEGIN JQUERY TIMERS v1.2 */
	jQuery.fn.extend({
		everyTime: function(interval, label, fn, times) {
			return this.each(function() {
				jQuery.timer.add(this, interval, label, fn, times);
			});
		},
		oneTime: function(interval, label, fn) {
			return this.each(function() {
				jQuery.timer.add(this, interval, label, fn, 1);
			});
		},
		stopTime: function(label, fn) {
			return this.each(function() {
				jQuery.timer.remove(this, label, fn);
			});
		}
	});

	jQuery.extend({
		timer: {
			global: [],
			guid: 1,
			dataKey: "jQuery.timer",
			regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
			powers: {
				// Yeah this is major overkill...
				'ms': 1,
				'cs': 10,
				'ds': 100,
				's': 1000,
				'das': 10000,
				'hs': 100000,
				'ks': 1000000
			},
			timeParse: function(value) {
				if (value == undefined || value == null)
					return null;
				var result = this.regex.exec(jQuery.trim(value.toString()));
				if (result[2]) {
					var num = parseFloat(result[1]);
					var mult = this.powers[result[2]] || 1;
					return num * mult;
				} else {
					return value;
				}
			},
			add: function(element, interval, label, fn, times) {
				var counter = 0;
			
				if (jQuery.isFunction(label)) {
					if (!times) 
						times = fn;
					fn = label;
					label = interval;
				}
			
				interval = jQuery.timer.timeParse(interval);

				if (typeof interval != 'number' || isNaN(interval) || interval < 0)
					return;

				if (typeof times != 'number' || isNaN(times) || times < 0) 
					times = 0;
			
				times = times || 0;
			
				var timers = jQuery.data(element, this.dataKey) || jQuery.data(element, this.dataKey, {});
			
				if (!timers[label])
					timers[label] = {};
			
				fn.timerID = fn.timerID || this.guid++;
			
				var handler = function() {
					if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
						jQuery.timer.remove(element, label, fn);
				};
			
				handler.timerID = fn.timerID;
			
				if (!timers[label][fn.timerID])
					timers[label][fn.timerID] = window.setInterval(handler,interval);
			
				this.global.push( element );
			
			},
			remove: function(element, label, fn) {
				var timers = jQuery.data(element, this.dataKey), ret;
			
				if ( timers ) {
				
					if (!label) {
						for ( label in timers )
							this.remove(element, label, fn);
					} else if ( timers[label] ) {
						if ( fn ) {
							if ( fn.timerID ) {
								window.clearInterval(timers[label][fn.timerID]);
								delete timers[label][fn.timerID];
							}
						} else {
							for ( var fn in timers[label] ) {
								window.clearInterval(timers[label][fn]);
								delete timers[label][fn];
							}
						}
					
						for ( ret in timers[label] ) break;
						if ( !ret ) {
							ret = null;
							delete timers[label];
						}
					}
				
					for ( ret in timers ) break;
					if ( !ret ) 
						jQuery.removeData(element, this.dataKey);
				}
			}
		}
	});

	jQuery(window).bind("unload", function() {
		jQuery.each(jQuery.timer.global, function(index, item) {
			jQuery.timer.remove(item);
		});
	});
/* END JQUERY TIMERS v1.2 */

/* BEGIN JQUERY FANCYBOX v1.2.3 */
	;(function($) {
		$.fn.fixPNG = function() {
			return this.each(function () {
				var image = $(this).css('backgroundImage');

				if (image.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
					image = RegExp.$1;
					$(this).css({
						'backgroundImage': 'none',
						'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=" + ($(this).css('backgroundRepeat') == 'no-repeat' ? 'crop' : 'scale') + ", src='" + image + "')"
					}).each(function () {
						var position = $(this).css('position');
						if (position != 'absolute' && position != 'relative')
							$(this).css('position', 'relative');
					});
				}
			});
		};

		var elem, opts, busy = false, imagePreloader = new Image, loadingTimer, loadingFrame = 1, imageRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i;
		var oldIE = ($.browser.msie && parseInt($.browser.version.substr(0,1)) < 8);

		$.fn.fancybox = function(o) {
			var settings		= $.extend({}, $.fn.fancybox.defaults, o);
			var matchedGroup	= this;

			function _initialize() {
				elem = this;
				opts = $.extend({}, settings);

				_start();

				return false;
			};

			function _start() {
				if (busy) return;

				if ($.isFunction(opts.callbackOnStart)) {
					opts.callbackOnStart();
				}

				opts.itemArray		= [];
				opts.itemCurrent	= 0;

				if (settings.itemArray.length > 0) {
					opts.itemArray = settings.itemArray;
				} else {
					var item = {};

					if (!elem.rel || elem.rel == '') {
						var item = {href: elem.href, title: elem.title};

						if ($(elem).children("img:first").length) {
							item.orig = $(elem).children("img:first");
						} else {
							item.orig = $(elem);
						}

						if (item.title == '' || typeof item.title == 'undefined') {
						    item.title = item.orig.attr('alt');
						}
					
						opts.itemArray.push( item );

					} else {
						var subGroup = $(matchedGroup).filter("a[rel=" + elem.rel + "]");
						var item = {};

						for (var i = 0; i < subGroup.length; i++) {
							item = {href: subGroup[i].href, title: subGroup[i].title};

							if ($(subGroup[i]).children("img:first").length) {
								item.orig = $(subGroup[i]).children("img:first");
							} else {
								item.orig = $(subGroup[i]);
							}

							if (item.title == '' || typeof item.title == 'undefined') {
							    item.title = item.orig.attr('alt');
							}

							opts.itemArray.push( item );
						}
					}
				}
			
				while ( opts.itemArray[ opts.itemCurrent ].href != elem.href ) {
					opts.itemCurrent++;
				}

				if (opts.overlayShow) {
					if (oldIE) {
						$('embed, object, select').css('visibility', 'hidden');
					}

					$("#fancy_overlay").css({
						'height'			: $(document).height(),
						'background-color'	: opts.overlayColor,
						'opacity'			: opts.overlayOpacity
					}).show();
				}

				_change_item();
			};

			function _change_item() {
				$("#fancy_right, #fancy_left, #fancy_close, #fancy_title").hide();

				var href = opts.itemArray[ opts.itemCurrent ].href;

				if (href.match("iframe") || elem.className.indexOf("iframe") >= 0) {
					$.fn.fancybox.showLoading();
					_set_content('<iframe id="fancy_frame" onload="jQuery.fn.fancybox.showIframe()" name="fancy_iframe' + Math.round(Math.random()*1000) + '" frameborder="0" hspace="0" src="' + href + '"></iframe>', opts.frameWidth, opts.frameHeight);

				} else if (href.match(/#/)) {
					var target = window.location.href.split('#')[0]; target = href.replace(target, ''); target = target.substr(target.indexOf('#'));

					_set_content('<div id="fancy_div">' + $(target).html() + '</div>', opts.frameWidth, opts.frameHeight);

				} else if (href.match(imageRegExp)) {
					imagePreloader = new Image; imagePreloader.src = href;

					if (imagePreloader.complete) {
						_proceed_image();

					} else {
						$.fn.fancybox.showLoading();
						$(imagePreloader).unbind().bind('load', function() {
							$("#fancy_loading").hide();

							_proceed_image();
						});
					}
				} else {
					$.fn.fancybox.showLoading();
					$.get(href, function(data) {
					    $("#fancy_loading").hide();
						_set_content( '<div id="fancy_ajax">' + data + '</div>', opts.frameWidth, opts.frameHeight );
					});
				}
			};

			function _proceed_image() {
				var width	= imagePreloader.width;
				var height	= imagePreloader.height;

				var horizontal_space	= (opts.padding * 2) + 40;
				var vertical_space		= (opts.padding * 2) + 60;

				var w = $.fn.fancybox.getViewport();
			
				if (opts.imageScale && (width > (w[0] - horizontal_space) || height > (w[1] - vertical_space))) {
					var ratio = Math.min(Math.min(w[0] - horizontal_space, width) / width, Math.min(w[1] - vertical_space, height) / height);

					width	= Math.round(ratio * width);
					height	= Math.round(ratio * height);
				}

				_set_content('<img alt="" id="fancy_img" src="' + imagePreloader.src + '" />', width, height);
			};

			function _preload_neighbor_images() {
				if ((opts.itemArray.length -1) > opts.itemCurrent) {
					var href = opts.itemArray[opts.itemCurrent + 1].href;

					if (href.match(imageRegExp)) {
						objNext = new Image();
						objNext.src = href;
					}
				}

				if (opts.itemCurrent > 0) {
					var href = opts.itemArray[opts.itemCurrent -1].href;

					if (href.match(imageRegExp)) {
						objNext = new Image();
						objNext.src = href;
					}
				}
			};

			function _set_content(value, width, height) {
				busy = true;

				var pad = opts.padding;

				if (oldIE) {
					$("#fancy_content")[0].style.removeExpression("height");
					$("#fancy_content")[0].style.removeExpression("width");
				}

				if (pad > 0) {
					width	+= pad * 2;
					height	+= pad * 2;

					$("#fancy_content").css({
						'top'		: pad + 'px',
						'right'		: pad + 'px',
						'bottom'	: pad + 'px',
						'left'		: pad + 'px',
						'width'		: 'auto',
						'height'	: 'auto'
					});

					if (oldIE) {
						$("#fancy_content")[0].style.setExpression('height',	'(this.parentNode.clientHeight - '	+ pad * 2 + ')');
						$("#fancy_content")[0].style.setExpression('width',		'(this.parentNode.clientWidth - '	+ pad * 2 + ')');
					}
				} else {
					$("#fancy_content").css({
						'top'		: 0,
						'right'		: 0,
						'bottom'	: 0,
						'left'		: 0,
						'width'		: '100%',
						'height'	: '100%'
					});
				}

				if ($("#fancy_outer").is(":visible") && width == $("#fancy_outer").width() && height == $("#fancy_outer").height()) {
					$("#fancy_content").fadeOut("fast", function() {
						$("#fancy_content").empty().append($(value)).fadeIn("normal", function() {
							_finish();
						});
					});

					return;
				}

				var w = $.fn.fancybox.getViewport();
			
				var itemTop		= (height	+ 60) > w[1] ? w[3] : (w[3] + Math.round((w[1] - height	- 60) / 2));
				var itemLeft	= (width	+ 40) > w[0] ? w[2] : (w[2] + Math.round((w[0] - width	- 40) / 2));

				var itemOpts = {
					'left':		itemLeft,
					'top':		itemTop,
					'width':	width + 'px',
					'height':	height + 'px'
				};

				if ($("#fancy_outer").is(":visible")) {
					$("#fancy_content").fadeOut("normal", function() {
						$("#fancy_content").empty();
						$("#fancy_outer").animate(itemOpts, opts.zoomSpeedChange, opts.easingChange, function() {
							$("#fancy_content").append($(value)).fadeIn("normal", function() {
								_finish();
							});
						});
					});

				} else {

					if (opts.zoomSpeedIn > 0 && opts.itemArray[opts.itemCurrent].orig !== undefined) {
						$("#fancy_content").empty().append($(value));

						var orig_item	= opts.itemArray[opts.itemCurrent].orig;
						var orig_pos	= $.fn.fancybox.getPosition(orig_item);

						$("#fancy_outer").css({
							'left':		(orig_pos.left - 20 - opts.padding) + 'px',
							'top':		(orig_pos.top  - 20 - opts.padding) + 'px',
							'width':	$(orig_item).width() + (opts.padding * 2),
							'height':	$(orig_item).height() + (opts.padding * 2)
						});

						if (opts.zoomOpacity) {
							itemOpts.opacity = 'show';
						}

						$("#fancy_outer").animate(itemOpts, opts.zoomSpeedIn, opts.easingIn, function() {
							_finish();
						});

					} else {

						$("#fancy_content").hide().empty().append($(value)).show();
						$("#fancy_outer").css(itemOpts).fadeIn("normal", function() {
							_finish();
						});
					}
				}
			};

			function _set_navigation() {
				if (opts.itemCurrent != 0) {
					$("#fancy_left, #fancy_left_ico").unbind().bind("click", function(e) {
						e.stopPropagation();

						opts.itemCurrent--;
						_change_item();

						return false;
					});

					$("#fancy_left").show();
				}

				if (opts.itemCurrent != ( opts.itemArray.length -1)) {
					$("#fancy_right, #fancy_right_ico").unbind().bind("click", function(e) {
						e.stopPropagation();

						opts.itemCurrent++;
						_change_item();

						return false;
					});

					$("#fancy_right").show();
				}
			};

			function _finish() {
				_set_navigation();

				_preload_neighbor_images();

				$(document).bind("keydown.fb", function(e) {
					if (opts.showCloseButton && e.keyCode == 27) {
						$.fn.fancybox.close();

					} else if(e.keyCode == 37 && opts.itemCurrent != 0) {
					    $(document).unbind("keydown.fb");
						opts.itemCurrent--;
						_change_item();
					

					} else if(e.keyCode == 39 && opts.itemCurrent != (opts.itemArray.length - 1)) {
		            $(document).unbind("keydown.fb");
						 opts.itemCurrent++;
						_change_item();
					}
				});

				if (opts.centerOnScroll) {
					$(window).bind("resize.fb scroll.fb", $.fn.fancybox.scrollBox);
				} else {
					$("div#fancy_outer").css("position", "absolute");
				}

				if (opts.hideOnContentClick) {
					$("#fancy_content").click($.fn.fancybox.close);
				}
			
				if (opts.overlayShow && opts.hideOnOverlayClick) {
					$("#fancy_overlay").bind("click", $.fn.fancybox.close);
				}
			
				if (opts.showCloseButton) {
					$("#fancy_close").bind("click", $.fn.fancybox.close).show();
				}

				if (opts.itemArray[ opts.itemCurrent ].title !== undefined && opts.itemArray[ opts.itemCurrent ].title.length > 0) {
					var pos = $("#fancy_outer").position();

					$('#fancy_title div').html( opts.itemArray[ opts.itemCurrent ].title);

					$('#fancy_title').css({
						'top'	: pos.top + $("#fancy_outer").outerHeight() - 32,
						'left'	: pos.left + (($("#fancy_outer").outerWidth() / 2) - ($('#fancy_title').width() / 2))
					}).show();
				}
			
				if (opts.overlayShow && oldIE) {
					$('embed, object, select', $('#fancy_content')).css('visibility', 'visible');
				}

				if ($.isFunction(opts.callbackOnShow)) {
		        opts.callbackOnShow( opts.itemArray[ opts.itemCurrent ] );
				}

				busy = false;
			};

			return this.unbind('click.fb').click(_initialize);
		};

		$.fn.fancybox.scrollBox = function() {
			var w	= $.fn.fancybox.getViewport();
		var ow	= $("#fancy_outer").outerWidth();
		var oh	= $("#fancy_outer").outerHeight();
		
		var pos	= {
		    'top'   : (oh > w[1] ? w[3] : w[3] + Math.round((w[1] - oh) * 0.5)),
		    'left'	: (ow > w[0] ? w[2] : w[2] + Math.round((w[0] - ow) * 0.5))
		};

			$("#fancy_outer").css(pos);

			$('#fancy_title').css({
				'top'	: pos.top	+ oh - 32,
				'left'	: pos.left	+ ((ow * 0.5) - ($('#fancy_title').width() / 2))
			});
		
			$("#fancy_overlay").css({
				'height' : $(document).height()
			});
		};

		$.fn.fancybox.getNumeric = function(el, prop) {
			return parseInt($.curCSS(el.jquery?el[0]:el,prop,true))||0;
		};

		$.fn.fancybox.getPosition = function(el) {
			var pos = el.offset();

			pos.top	+= $.fn.fancybox.getNumeric(el, 'paddingTop');
			pos.top	+= $.fn.fancybox.getNumeric(el, 'borderTopWidth');

			pos.left += $.fn.fancybox.getNumeric(el, 'paddingLeft');
			pos.left += $.fn.fancybox.getNumeric(el, 'borderLeftWidth');

			return pos;
		};

		$.fn.fancybox.showIframe = function() {
			$("#fancy_loading").hide();
			$("#fancy_frame").show();
		};

		$.fn.fancybox.getViewport = function() {
			return [$(window).width(), $(window).height(), $(document).scrollLeft(), $(document).scrollTop() ];
		};

		$.fn.fancybox.animateLoading = function() {
			if (!$("#fancy_loading").is(':visible')){
				clearInterval(loadingTimer);
				return;
			}

			$("#fancy_loading > div").css('top', (loadingFrame * -40) + 'px');

			loadingFrame = (loadingFrame + 1) % 12;
		};

		$.fn.fancybox.showLoading = function() {
			clearInterval(loadingTimer);

			var w = $.fn.fancybox.getViewport();

			$("#fancy_loading").css({'left': ((w[0] - 40) / 2 + w[2]), 'top': ((w[1] - 40) / 2 + w[3])}).show();
			$("#fancy_loading").bind('click', $.fn.fancybox.close);

			loadingTimer = setInterval($.fn.fancybox.animateLoading, 66);
		};

		$.fn.fancybox.close = function() {
			busy = true;

			$(imagePreloader).unbind();

			$(document).unbind("keydown.fb");
			$(window).unbind("resize.fb scroll.fb");

			$("#fancy_overlay, #fancy_content, #fancy_close").unbind();

			$("#fancy_close, #fancy_loading, #fancy_left, #fancy_right, #fancy_title").hide();

			__cleanup = function() {
				$("#fancy_overlay, #fancy_outer").hide();
				$("#fancy_content").empty();
			
				if (opts.centerOnScroll) {
					$(window).unbind("resize.fb scroll.fb");
				}

				if (oldIE) {
					$('embed, object, select').css('visibility', 'visible');
				}

				if ($.isFunction(opts.callbackOnClose)) {
					opts.callbackOnClose();
				}

				busy = false;
			};

			if ($("#fancy_outer").is(":visible") !== false) {
				if (opts.zoomSpeedOut > 0 && opts.itemArray[opts.itemCurrent].orig !== undefined) {
					var orig_item	= opts.itemArray[opts.itemCurrent].orig;
					var orig_pos	= $.fn.fancybox.getPosition(orig_item);

					var itemOpts = {
						'left':		(orig_pos.left - 20 - opts.padding) + 'px',
						'top': 		(orig_pos.top  - 20 - opts.padding) + 'px',
						'width':	$(orig_item).width() + (opts.padding * 2),
						'height':	$(orig_item).height() + (opts.padding * 2)
					};

					if (opts.zoomOpacity) {
						itemOpts.opacity = 'hide';
					}

					$("#fancy_outer").stop(false, true).animate(itemOpts, opts.zoomSpeedOut, opts.easingOut, __cleanup);

				} else {
					$("#fancy_outer").stop(false, true).fadeOut("fast", __cleanup);
				}

			} else {
				__cleanup();
			}

			return false;
		};

		$.fn.fancybox.build = function() {
			var html = '';

			html += '<div id="fancy_overlay"></div>';
			html += '<div id="fancy_loading"><div></div></div>';

			html += '<div id="fancy_outer">';
			html += '<div id="fancy_inner">';

			html += '<div id="fancy_close"></div>';

			html += '<div id="fancy_bg"><div class="fancy_bg" id="fancy_bg_n"></div><div class="fancy_bg" id="fancy_bg_ne"></div><div class="fancy_bg" id="fancy_bg_e"></div><div class="fancy_bg" id="fancy_bg_se"></div><div class="fancy_bg" id="fancy_bg_s"></div><div class="fancy_bg" id="fancy_bg_sw"></div><div class="fancy_bg" id="fancy_bg_w"></div><div class="fancy_bg" id="fancy_bg_nw"></div></div>';

			html += '<a href="javascript:;" id="fancy_left"><span class="fancy_ico" id="fancy_left_ico"></span></a><a href="javascript:;" id="fancy_right"><span class="fancy_ico" id="fancy_right_ico"></span></a>';

			html += '<div id="fancy_content"></div>';

			html += '</div>';
			html += '</div>';
		
			html += '<div id="fancy_title"></div>';
		
			$(html).appendTo("body");

			$('<table cellspacing="0" cellpadding="0" border="0"><tr><td class="fancy_title" id="fancy_title_left"></td><td class="fancy_title" id="fancy_title_main"><div></div></td><td class="fancy_title" id="fancy_title_right"></td></tr></table>').appendTo('#fancy_title');

			if (oldIE) {
				$("#fancy_inner").prepend('<iframe id="fancy_bigIframe" src="javascript:false;" scrolling="no" frameborder="0"></iframe>');

				// Get rid of the 'false' text introduced by the URL of the iframe
				var frameDoc = $('#fancy_bigIframe')[0].contentWindow.document;
				frameDoc.open();
				frameDoc.close();
			}
		
			if ($.browser.msie) {
				$("#fancy_loading div, #fancy_close, .fancy_bg, .fancy_title, .fancy_ico").fixPNG();
			}
		};

		$.fn.fancybox.defaults = {
			padding				:	10,
			imageScale			:	true,
			zoomOpacity			:	true,
			zoomSpeedIn			:	0,
			zoomSpeedOut		:	0,
			zoomSpeedChange		:	300,
			easingIn			:	'swing',
			easingOut			:	'swing',
			easingChange		:	'swing',
			frameWidth			:	560,
			frameHeight			:	340,
			overlayShow			:	true,
			overlayOpacity		:	0.3,
			overlayColor		: 	'#666',
			showCloseButton		:	true,
			hideOnOverlayClick	:	true,
			hideOnContentClick	:	true,
			centerOnScroll		:	true,
			itemArray			:	[],
			callbackOnStart		:	null,
			callbackOnShow		:	null,
			callbackOnClose		:	null
		};

		$(document).ready(function() {
			$.fn.fancybox.build();
		});

	})(jQuery);
/* END JQUERY FANCYBOX v1.2.3 */

/* BEGIN JQUERY TOOLTIP v1.1.2 */
	(function($) { 

		var instances = [];
	
		// static constructs
		$.tools = $.tools || {};
	
		$.tools.tooltip = {
			version: '1.1.2',
		
			conf: { 
			
				// default effect variables
				effect: 'toggle',			
				fadeOutSpeed: "fast",
				tip: null,
			
				predelay: 0,
				delay: 30,
				opacity: 1,			
				lazy: undefined,
			
				// 'top', 'bottom', 'right', 'left', 'center'
				position: ['top', 'center'], 
				offset: [0, 0],			
				cancelDefault: true,
				relative: false,
				oneInstance: true,
			
			
				// type to event mapping 
				events: {
					def: 			"mouseover,mouseout",
					input: 		"focus,blur",
					widget:		"focus mouseover,blur mouseout",
					tooltip:		"mouseover,mouseout"
				},			
			
				api: false
			},
		
			addEffect: function(name, loadFn, hideFn) {
				effects[name] = [loadFn, hideFn];	
			} 
		};
	
	
		var effects = { 
			toggle: [ 
				function(done) { 
					var conf = this.getConf(), tip = this.getTip(), o = conf.opacity;
					if (o < 1) { tip.css({opacity: o}); }
					tip.show();
					done.call();
				},
			
				function(done) { 
					this.getTip().hide();
					done.call();
				} 
			],
		
			fade: [
				function(done) { this.getTip().fadeIn(this.getConf().fadeInSpeed, done); },  
				function(done) { this.getTip().fadeOut(this.getConf().fadeOutSpeed, done); } 
			]		
		};   

		function Tooltip(trigger, conf) {

			var self = this, $self = $(this);
		
			trigger.data("tooltip", self);
		
			// find the tip
			var tip = trigger.next();
		
			if (conf.tip) {
			
				tip = $(conf.tip);
			
				// multiple tip elements
				if (tip.length > 1) {
				
					// find sibling
					tip = trigger.nextAll(conf.tip).eq(0);	
				
					// find sibling from the parent element
					if (!tip.length) {
						tip = trigger.parent().nextAll(conf.tip).eq(0);
					}
				} 
			} 				
		
			/* calculate tip position relative to the trigger */  	
			function getPosition(e) {	
			
				// get origin top/left position 
				var top = conf.relative ? trigger.position().top : trigger.offset().top, 
					 left = conf.relative ? trigger.position().left : trigger.offset().left,
					 pos = conf.position[0];

				top  -= tip.outerHeight() - conf.offset[0];
				left += trigger.outerWidth() + conf.offset[1];
			
				// adjust Y		
				var height = tip.outerHeight() + trigger.outerHeight();
				if (pos == 'center') 	{ top += height / 2; }
				if (pos == 'bottom') 	{ top += height; }
			
				// adjust X
				pos = conf.position[1]; 	
				var width = tip.outerWidth() + trigger.outerWidth();
				if (pos == 'center') 	{ left -= width / 2; }
				if (pos == 'left')   	{ left -= width; }	 
			
				return {top: top, left: left};
			}		

		
			// event management
			var isInput = trigger.is(":input"), 
				 isWidget = isInput && trigger.is(":checkbox, :radio, select, :button"),			
				 type = trigger.attr("type"),
				 evt = conf.events[type] || conf.events[isInput ? (isWidget ? 'widget' : 'input') : 'def']; 
		
			evt = evt.split(/,\s*/); 
			if (evt.length != 2) { throw "Tooltip: bad events configuration for " + type; }
				
			trigger.bind(evt[0], function(e) {
			
				// close all instances
				if (conf.oneInstance) {
					$.each(instances, function()  {
						this.hide();		
					});
				}
				
				// see if the tip was launched by this trigger
				var t = tip.data("trigger");			
				if (t && t[0] != this) { tip.hide().stop(true, true); }			
			
				e.target = this;
				self.show(e); 
			
				// tooltip close events
				evt = conf.events.tooltip.split(/,\s*/);
				tip.bind(evt[0], function() { self.show(e); });
				if (evt[1]) { tip.bind(evt[1], function() { self.hide(e); }); }
			
			});
		
			trigger.bind(evt[1], function(e) {
				self.hide(e); 
			});
		
			// ensure that the tip really shows up. IE cannot catch up with this.
			if (!$.browser.msie && !isInput && !conf.predelay) {
				trigger.mousemove(function()  {					
					if (!self.isShown()) {
						trigger.triggerHandler("mouseover");	
					}
				});
			}

			// avoid "black box" bug in IE with PNG background images
			if (conf.opacity < 1) {
				tip.css("opacity", conf.opacity);		
			}
		
			var pretimer = 0, title = trigger.attr("title");
		
			if (title && conf.cancelDefault) { 
				trigger.removeAttr("title");
				trigger.data("title", title);			
			}						
		
			$.extend(self, {
				
				show: function(e) {
				
					if (e) { trigger = $(e.target); }				

					clearTimeout(tip.data("timer"));					

					if (tip.is(":animated") || tip.is(":visible")) { return self; }
				
					function show() {
					
						// remember the trigger element for this tip
						tip.data("trigger", trigger);
					
						// get position
						var pos = getPosition(e);					
					
						// title attribute					
						if (conf.tip && title) {
							tip.html(trigger.data("title"));
						} 				
					
						// onBeforeShow
						e = e || $.Event();
						e.type = "onBeforeShow";
						$self.trigger(e, [pos]);				
						if (e.isDefaultPrevented()) { return self; }
			
					
						// onBeforeShow may have altered the configuration
						pos = getPosition(e);
					
						// set position
						tip.css({position:'absolute', top: pos.top, left: pos.left});					
					
						// invoke effect
						var eff = effects[conf.effect];
						if (!eff) { throw "Nonexistent effect \"" + conf.effect + "\""; }
					
						eff[0].call(self, function() {
							e.type = "onShow";
							$self.trigger(e);			
						});					
					
					}
				
					if (conf.predelay) {
						clearTimeout(pretimer);
						pretimer = setTimeout(show, conf.predelay);	
					
					} else {
						show();	
					}
				
					return self;
				},
			
				hide: function(e) {

					clearTimeout(tip.data("timer"));
					clearTimeout(pretimer);
				
					if (!tip.is(":visible")) { return; }
				
					function hide() {
					
						// onBeforeHide
						e = e || $.Event();
						e.type = "onBeforeHide";
						$self.trigger(e);				
						if (e.isDefaultPrevented()) { return; }
					
						effects[conf.effect][1].call(self, function() {
							e.type = "onHide";
							$self.trigger(e);		
						});
					}
					 
					if (conf.delay && e) {
						tip.data("timer", setTimeout(hide, conf.delay));
					
					} else {
						hide();	
					}			
				
					return self;
				},
			
				isShown: function() {
					return tip.is(":visible, :animated");	
				},
				
				getConf: function() {
					return conf;	
				},
				
				getTip: function() {
					return tip;	
				},
			
				getTrigger: function() {
					return trigger;	
				},
			
				// callback functions			
				bind: function(name, fn) {
					$self.bind(name, fn);
					return self;	
				},
			
				onHide: function(fn) {
					return this.bind("onHide", fn);
				},

				onBeforeShow: function(fn) {
					return this.bind("onBeforeShow", fn);
				},
			
				onShow: function(fn) {
					return this.bind("onShow", fn);
				},
			
				onBeforeHide: function(fn) {
					return this.bind("onBeforeHide", fn);
				},

				unbind: function(name) {
					$self.unbind(name);
					return self;	
				}			

			});		

			// bind all callbacks from configuration
			$.each(conf, function(name, fn) {
				if ($.isFunction(fn)) { self.bind(name, fn); }
			}); 		
		
		}
		
	
		// jQuery plugin implementation
		$.prototype.tooltip = function(conf) {
		
			// return existing instance
			var api = this.eq(typeof conf == 'number' ? conf : 0).data("tooltip");
			if (api) { return api; }
		
			// setup options
			var globals = $.extend(true, {}, $.tools.tooltip.conf);		
		
			if ($.isFunction(conf)) {
				conf = {onBeforeShow: conf};
			
			} else if (typeof conf == 'string') {
				conf = {tip: conf};	
			}

			conf = $.extend(true, globals, conf);
		
			// can also be given as string
			if (typeof conf.position == 'string') {
				conf.position = conf.position.split(/,?\s/);	
			}
		
			// assign tip's only when apiement is being mouseovered		
			if (conf.lazy !== false && (conf.lazy === true || this.length > 20)) {	
				
				this.one("mouseover", function(e) {	
					api = new Tooltip($(this), conf);
					api.show(e);
					instances.push(api);
				}); 
			
			} else {
			
				// install tooltip for each entry in jQuery object
				this.each(function() {
					api = new Tooltip($(this), conf); 
					instances.push(api);
				});
			} 

			return conf.api ? api: this;		
		
		};
		
	}) (jQuery);
	
	(function($) { 

		// version number
		var t = $.tools.tooltip;
		t.effects = t.effects || {};
		t.effects.slide = {version: '1.0.0'}; 
		
		// extend global configuragion with effect specific defaults
		$.extend(t.conf, { 
			direction: 'up', // down, left, right 
			bounce: false,
			slideOffset: 10,
			slideInSpeed: 200,
			slideOutSpeed: 200, 
			slideFade: !$.browser.msie
		});			
	
		// directions for slide effect
		var dirs = {
			up: ['-', 'top'],
			down: ['+', 'top'],
			left: ['-', 'left'],
			right: ['+', 'left']
		};
	
		/* default effect: "slide"  */
		$.tools.tooltip.addEffect("slide", 
		
			// show effect
			function(done) { 

				// variables
				var conf = this.getConf(), 
					 tip = this.getTip(),
					 params = conf.slideFade ? {opacity: conf.opacity} : {}, 
					 dir = dirs[conf.direction] || dirs.up;

				// direction			
				params[dir[1]] = dir[0] +'='+ conf.slideOffset;
			
				// perform animation
				if (conf.slideFade) { tip.css({opacity:0}); }
				tip.show().animate(params, conf.slideInSpeed, done); 
			}, 
		
			// hide effect
			function(done) {
			
				// variables
				var conf = this.getConf(), 
					 offset = conf.slideOffset,
					 params = conf.slideFade ? {opacity: 0} : {}, 
					 dir = dirs[conf.direction] || dirs.up;
			
				// direction
				var sign = "" + dir[0];
				if (conf.bounce) { sign = sign == '+' ? '-' : '+'; }			
				params[dir[1]] = sign +'='+ offset;			
			
				// perform animation
				this.getTip().animate(params, conf.slideOutSpeed, function()  {
					$(this).hide();
					done.call();		
				});
			}
		);  
	
	})(jQuery);
	
	(function($) { 

		// version number
		var t = $.tools.tooltip;
		t.plugins = t.plugins || {};
	
		t.plugins.dynamic = {
			version: '1.0.1',
	
			conf: {
				api: false,
				classNames: "top right bottom left"
			}
		};
		
		/* 
		 * See if element is on the viewport. Returns an boolean array specifying which
		 * edges are hidden. Edges are in following order:
		 * 
		 * [top, right, bottom, left]
		 * 
		 * For example following return value means that top and right edges are hidden
		 * 
		 * [true, true, false, false]
		 * 
		 */
		function getCropping(el) {
		
			var w = $(window); 
			var right = w.width() + w.scrollLeft();
			var bottom = w.height() + w.scrollTop();		
		
			return [
				el.offset().top <= w.scrollTop(), 						// top
				right <= el.offset().left + el.width(),				// right
				bottom <= el.offset().top + el.height(),			// bottom
				w.scrollLeft() >= el.offset().left 					// left
			]; 
		}
	
		/*
			Returns true if all edges of an element are on viewport. false if not
		
			@param crop the cropping array returned by getCropping function
		 */
		function isVisible(crop) {
			var i = crop.length;
			while (i--) {
				if (crop[i]) { return false; }	
			}
			return true;
		}
	
		// scrollable mousewheel implementation
		$.fn.dynamic = function(conf) {
		
			var globals = $.extend({}, t.plugins.dynamic.conf), ret;
			if (typeof conf == 'number') { conf = {speed: conf}; }
			conf = $.extend(globals, conf);
		
			var cls = conf.classNames.split(/\s/), orig;	
			
			this.each(function() {		
				
				if ($(this).tooltip().jquery)  {
					throw "Lazy feature not supported by dynamic plugin. set lazy: false for tooltip";	
				}
				
				var api = $(this).tooltip().onBeforeShow(function(e, pos) {				

					// get nessessary variables
					var tip = this.getTip(), tipConf = this.getConf();  

					/*
						We store the original configuration and use it to restore back to the original state.
					*/					
					if (!orig) {
						orig = [
							tipConf.position[0], 
							tipConf.position[1], 
							tipConf.offset[0], 
							tipConf.offset[1], 
							$.extend({}, tipConf)
						];
					}
				
					/*
						display tip in it's default position and by setting visibility to hidden.
						this way we can check whether it will be on the viewport
					*/
					$.extend(tipConf, orig[4]);
					tipConf.position = [orig[0], orig[1]];
					tipConf.offset = [orig[2], orig[3]];
				
					tip.css({
						visibility: 'hidden',
						position: 'absolute',
						top: pos.top,
						left: pos.left
					
					}).show(); 
				
					// now let's see for hidden edges
					var crop = getCropping(tip);		
								
					// possibly alter the configuration
					if (!isVisible(crop)) {
					
						// change the position and add class
						if (crop[2]) { $.extend(tipConf, conf.top);		tipConf.position[0] = 'top'; 		tip.addClass(cls[0]); }
						if (crop[3]) { $.extend(tipConf, conf.right);	tipConf.position[1] = 'right'; 	tip.addClass(cls[1]); }					
						if (crop[0]) { $.extend(tipConf, conf.bottom); 	tipConf.position[0] = 'bottom';	tip.addClass(cls[2]); } 
						if (crop[1]) { $.extend(tipConf, conf.left);		tipConf.position[1] = 'left'; 	tip.addClass(cls[3]); }					
					
						// vertical offset
						if (crop[0] || crop[2]) { tipConf.offset[0] *= -1; }
					
						// horizontal offset
						if (crop[1] || crop[3]) { tipConf.offset[1] *= -1; }
					}  
				
					tip.css({visibility: 'visible'}).hide();
		
				});
			
				// restore positioning
				api.onShow(function() {
					var c = this.getConf(), tip = this.getTip();				
					c.position = [orig[0], orig[1]];
					c.offset = [orig[2], orig[3]];				
				});
			
				// remove custom class names and restore original effect
				api.onHide(function() {
					var tip = this.getTip(); 
					tip.removeClass(conf.classNames);
				});
				
				ret = api;
			
			});
		
			return conf.api ? ret : this;
		};	
	
	}) (jQuery);
/* END JQUERY TOOLTIP v1.1.2 */

/* BEGIN JQUERY SCROLLABLE v1.1.2 */
	(function($) { 
		
		// static constructs
		$.tools = $.tools || {};
	
		$.tools.scrollable = {
			version: '1.1.2',
		
			conf: {
			
				// basics
				size: 5,
				vertical: false,
				speed: 400,
				keyboard: true,		
			
				// by default this is the same as size
				keyboardSteps: null, 
			
				// other
				disabledClass: 'disabled',
				hoverClass: null,		
				clickable: true,
				activeClass: 'active', 
				easing: 'swing',
				loop: false,
			
				items: '.items',
				item: null,
			
				// navigational elements			
				prev: '.prev',
				next: '.next',
				prevPage: '.prevPage',
				nextPage: '.nextPage', 
				api: false
			
				// CALLBACKS: onBeforeSeek, onSeek, onReload
			} 
		};
				
		var current;		
	
		// constructor
		function Scrollable(root, conf) {   
		
			// current instance
			var self = this, $self = $(this),
				 horizontal = !conf.vertical,
				 wrap = root.children(),
				 index = 0,
				 forward;  
		
		
			if (!current) { current = self; }
		
			// bind all callbacks from configuration
			$.each(conf, function(name, fn) {
				if ($.isFunction(fn)) { $self.bind(name, fn); }
			});
		
			if (wrap.length > 1) { wrap = $(conf.items, root); }
		
			// navigational items can be anywhere when globalNav = true
			function find(query) {
				var els = $(query);
				return conf.globalNav ? els : root.parent().find(query);	
			}
		
			// to be used by plugins
			root.data("finder", find);
		
			// get handle to navigational elements
			var prev = find(conf.prev),
				 next = find(conf.next),
				 prevPage = find(conf.prevPage),
				 nextPage = find(conf.nextPage);

		
			// methods
			$.extend(self, {
			
				getIndex: function() {
					return index;	
				},
			
				getClickIndex: function() {
					var items = self.getItems(); 
					return items.index(items.filter("." + conf.activeClass));	
				},
	
				getConf: function() {
					return conf;	
				},
			
				getSize: function() {
					return self.getItems().size();	
				},
	
				getPageAmount: function() {
					return Math.ceil(this.getSize() / conf.size); 	
				},
			
				getPageIndex: function() {
					return Math.ceil(index / conf.size);	
				},

				getNaviButtons: function() {
					return prev.add(next).add(prevPage).add(nextPage);	
				},
			
				getRoot: function() {
					return root;	
				},
			
				getItemWrap: function() {
					return wrap;	
				},
			
				getItems: function() {
					return wrap.children(conf.item);	
				},
			
				getVisibleItems: function() {
					return self.getItems().slice(index, index + conf.size);	
				},
			
				/* all seeking functions depend on this */		
				seekTo: function(i, time, fn) {

					if (i < 0) { i = 0; }				
				
					// nothing happens
					if (index === i) { return self; }				
				
					// function given as second argument
					if ($.isFunction(time)) {
						fn = time;
					}

					// seeking exceeds the end				 
					if (i > self.getSize() - conf.size) { 
						return conf.loop ? self.begin() : this.end(); 
					} 				

					var item = self.getItems().eq(i);					
					if (!item.length) { return self; }				
				
					// onBeforeSeek
					var e = $.Event("onBeforeSeek");

					$self.trigger(e, [i]);				
					if (e.isDefaultPrevented()) { return self; }				
				
					// get the (possibly altered) speed
					if (time === undefined || $.isFunction(time)) { time = conf.speed; }
				
					function callback() {
						if (fn) { fn.call(self, i); }
						$self.trigger("onSeek", [i]);
					}
				
					if (horizontal) {
						wrap.animate({left: -item.position().left}, time, conf.easing, callback);					
					} else {
						wrap.animate({top: -item.position().top}, time, conf.easing, callback);							
					}
				
				
					current = self;
					index = i;				
				
					// onStart
					e = $.Event("onStart");
					$self.trigger(e, [i]);				
					if (e.isDefaultPrevented()) { return self; }				
	
				
					/* default behaviour */
				
					// prev/next buttons disabled flags
					prev.add(prevPage).toggleClass(conf.disabledClass, i === 0);
					next.add(nextPage).toggleClass(conf.disabledClass, i >= self.getSize() - conf.size);
				
					return self; 
				},			
			
				
				move: function(offset, time, fn) {
					forward = offset > 0;
					return this.seekTo(index + offset, time, fn);
				},
			
				next: function(time, fn) {
					return this.move(1, time, fn);	
				},
			
				prev: function(time, fn) {
					return this.move(-1, time, fn);	
				},
			
				movePage: function(offset, time, fn) {
					forward = offset > 0;
					var steps = conf.size * offset;
				
					var i = index % conf.size;
					if (i > 0) {
					 	steps += (offset > 0 ? -i : conf.size - i);
					}
				
					return this.move(steps, time, fn);		
				},
			
				prevPage: function(time, fn) {
					return this.movePage(-1, time, fn);
				},  
	
				nextPage: function(time, fn) {
					return this.movePage(1, time, fn);
				},			
			
				setPage: function(page, time, fn) {
					return this.seekTo(page * conf.size, time, fn);
				},			
			
				begin: function(time, fn) {
					forward = false;
					return this.seekTo(0, time, fn);	
				},
			
				end: function(time, fn) {
					forward = true;
					var to = this.getSize() - conf.size;
					return to > 0 ? this.seekTo(to, time, fn) : self;	
				},
			
				reload: function() {				
					$self.trigger("onReload");
					return self;
				},			
			
				focus: function() {
					current = self;
					return self;
				},
			
				click: function(i) {
				
					var item = self.getItems().eq(i), 
						 klass = conf.activeClass,
						 size = conf.size;			
				
					// check that i is sane
					if (i < 0 || i >= self.getSize()) { return self; }
				
					// size == 1							
					if (size == 1) {
						if (conf.loop) { return self.next(); }
					
						if (i === 0 || i == self.getSize() -1)  { 
							forward = (forward === undefined) ? true : !forward;	 
						}
						return forward === false  ? self.prev() : self.next(); 
					} 
				
					// size == 2
					if (size == 2) {
						if (i == index) { i--; }
						self.getItems().removeClass(klass);
						item.addClass(klass);					
						return self.seekTo(i, time, fn);
					}				
		
					if (!item.hasClass(klass)) {				
						self.getItems().removeClass(klass);
						item.addClass(klass);
						var delta = Math.floor(size / 2);
						var to = i - delta;
		
						// next to last item must work
						if (to > self.getSize() - size) { 
							to = self.getSize() - size; 
						}
		
						if (to !== i) {
							return self.seekTo(to);		
						}
					}
				
					return self;
				},
			
				// bind / unbind
				bind: function(name, fn) {
					$self.bind(name, fn);
					return self;	
				},	
			
				unbind: function(name) {
					$self.unbind(name);
					return self;	
				}			
			
			});
		
			// callbacks	
			$.each("onBeforeSeek,onStart,onSeek,onReload".split(","), function(i, ev) {
				self[ev] = function(fn) {
					return self.bind(ev, fn);	
				};
			});  
			
			
			// prev button		
			prev.addClass(conf.disabledClass).click(function() {
				self.prev(); 
			});
		

			// next button
			next.click(function() { 
				self.next(); 
			});
		
			// prev page button
			nextPage.click(function() { 
				self.nextPage(); 
			});
		
			if (self.getSize() < conf.size) {
				next.add(nextPage).addClass(conf.disabledClass);	
			}
		

			// next page button
			prevPage.addClass(conf.disabledClass).click(function() { 
				self.prevPage(); 
			});		
		
		
			// hover
			var hc = conf.hoverClass, keyId = "keydown." + Math.random().toString().substring(10); 
			
			self.onReload(function() { 

				// hovering
				if (hc) {
					self.getItems().hover(function()  {
						$(this).addClass(hc);		
					}, function() {
						$(this).removeClass(hc);	
					});						
				}
			
				// clickable
				if (conf.clickable) {
					self.getItems().each(function(i) {
						$(this).unbind("click.scrollable").bind("click.scrollable", function(e) {
							if ($(e.target).is("a")) { return; }	
							return self.click(i);
						});
					});
				}				
			
				// keyboard			
				if (conf.keyboard) {				
				
					// keyboard works on one instance at the time. thus we need to unbind first
					$(document).unbind(keyId).bind(keyId, function(evt) {

						// do nothing with CTRL / ALT buttons
						if (evt.altKey || evt.ctrlKey) { return; }
					
						// do nothing for unstatic and unfocused instances
						if (conf.keyboard != 'static' && current != self) { return; }
					
						var s = conf.keyboardSteps;				
										
						if (horizontal && (evt.keyCode == 37 || evt.keyCode == 39)) {					
							self.move(evt.keyCode == 37 ? -s : s);
							return evt.preventDefault();
						}	
					
						if (!horizontal && (evt.keyCode == 38 || evt.keyCode == 40)) {
							self.move(evt.keyCode == 38 ? -s : s);
							return evt.preventDefault();
						}
					
						return true;
					
					});
				
				} else  {
					$(document).unbind(keyId);	
				}				

			});
		
			self.reload(); 
		
		} 

		
		// jQuery plugin implementation
		$.fn.scrollable = function(conf) { 
			
			// already constructed --> return API
			var el = this.eq(typeof conf == 'number' ? conf : 0).data("scrollable");
			if (el) { return el; }		 
	 
			var globals = $.extend({}, $.tools.scrollable.conf);
			conf = $.extend(globals, conf);
		
			conf.keyboardSteps = conf.keyboardSteps || conf.size;
		
			this.each(function() {			
				el = new Scrollable($(this), conf);
				$(this).data("scrollable", el);	
			});
		
			return conf.api ? el: this; 
		
		};
			
	
	})(jQuery);
	
	(function($) {
		
		$.fn.wheel = function( fn ){
			return this[ fn ? "bind" : "trigger" ]( "wheel", fn );
		};

		// special event config
		$.event.special.wheel = {
			setup: function(){
				$.event.add( this, wheelEvents, wheelHandler, {} );
			},
			teardown: function(){
				$.event.remove( this, wheelEvents, wheelHandler );
			}
		};

		// events to bind ( browser sniffed... )
		var wheelEvents = !$.browser.mozilla ? "mousewheel" : // IE, opera, safari
			"DOMMouseScroll"+( $.browser.version<"1.9" ? " mousemove" : "" ); // firefox

		// shared event handler
		function wheelHandler( event ) {
		
			switch ( event.type ){
			
				// FF2 has incorrect event positions
				case "mousemove": 
					return $.extend( event.data, { // store the correct properties
						clientX: event.clientX, clientY: event.clientY,
						pageX: event.pageX, pageY: event.pageY
					});
				
				// firefox	
				case "DOMMouseScroll": 
					$.extend( event, event.data ); // fix event properties in FF2
					event.delta = -event.detail / 3; // normalize delta
					break;
				
				// IE, opera, safari	
				case "mousewheel":				
					event.delta = event.wheelDelta / 120;
					break;
			}
		
			event.type = "wheel"; // hijack the event	
			return $.event.handle.call( this, event, event.delta );
		}
	
	
		// version number
		var t = $.tools.scrollable; 
		t.plugins = t.plugins || {};
		t.plugins.mousewheel = {	
			version: '1.0.1',
			conf: { 
				api: false,
				speed: 50
			} 
		}; 
	
		// scrollable mousewheel implementation
		$.fn.mousewheel = function(conf) {

			var globals = $.extend({}, t.plugins.mousewheel.conf), ret;
			if (typeof conf == 'number') { conf = {speed: conf}; }
			conf = $.extend(globals, conf);
		
			this.each(function() {		

				var api = $(this).scrollable();
				if (api) { ret = api; }
			
				api.getRoot().wheel(function(e, delta)  { 
					api.move(delta < 0 ? 1 : -1, conf.speed || 50);
					return false;
				});
			});
		
			return conf.api ? ret : this;
		};
	
	})(jQuery);
/* END JQUERY SCROLLABLE v1.1.2 */

/* BEGIN JQUERY EXISTS */
	$.exists = function(selector) {
		return ($(selector).length > 0);
	}
/* END JQUERY EXISTS */

/* BEGIN HOSTS */
	function getHost(id) {
		var type = $("#data-store .hosts .host-" + id).val();
		return type;
	}
/* END HOSTS */

/* BEGIN VERSION */
	function getSystem(id) {
		var type = $("#data-store .system ." + id).val();
		return type;
	}
/* END VERSION */

// BEGIN TRANSLATION
	function getTranslation(id) {
		var lang = $('#data-store .translate .translation-' + id).val();
		return lang;
	}
// END TRANSLATION

/* BEGIN JSJAC v1.3.2 */
	function XmlHttp() {}

	/**
	 * creates a cross browser compliant XmlHttpRequest object
	 */
	XmlHttp.create = function () {
	  try {
	    if (window.XMLHttpRequest) {
	      var req = new XMLHttpRequest();
	     
	      // some versions of Moz do not support the readyState property
	      // and the onreadystate event so we patch it!
	      if (req.readyState == null) {
		req.readyState = 1;
		req.addEventListener("load", function () {
				       req.readyState = 4;
				       if (typeof req.onreadystatechange == "function")
					 req.onreadystatechange();
				     }, false);
	      }
	     
	      return req;
	    }
	    if (window.ActiveXObject) {
	      return new ActiveXObject(XmlHttp.getPrefix() + ".XmlHttp");
	    }
	  }
	  catch (ex) {}
	  // fell through
	  throw new Error("Your browser does not support XmlHttp objects");
	};

	/**
	 * used to find the Automation server name
	 * @private
	 */
	XmlHttp.getPrefix = function() {
	  if (XmlHttp.prefix) // I know what you did last summer
	    return XmlHttp.prefix;
	 
	  var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
	  var o;
	  for (var i = 0; i < prefixes.length; i++) {
	    try {
	      // try to create the objects
	      o = new ActiveXObject(prefixes[i] + ".XmlHttp");
	      return XmlHttp.prefix = prefixes[i];
	    }
	    catch (ex) {};
	  }
	 
	  throw new Error("Could not find an installed XML parser");
	};


	/**
	 * XmlDocument factory
	 * @private
	 */
	function XmlDocument() {}

	XmlDocument.create = function (name,ns) {
	  name = name || 'foo';
	  ns = ns || '';
	  try {
	    var doc;
	    // DOM2
	    if (document.implementation && document.implementation.createDocument) {
	      doc = document.implementation.createDocument(ns, name, null);
	      // some versions of Moz do not support the readyState property
	      // and the onreadystate event so we patch it!
	      if (doc.readyState == null) {
		doc.readyState = 1;
		doc.addEventListener("load", function () {
				       doc.readyState = 4;
				       if (typeof doc.onreadystatechange == "function")
					 doc.onreadystatechange();
				     }, false);
	      }
	    } else if (window.ActiveXObject) {
	      doc = new ActiveXObject(XmlDocument.getPrefix() + ".DomDocument");
	    }
	   
	    if (!doc.documentElement || doc.documentElement.tagName != name ||
		(doc.documentElement.namespaceURI &&
		 doc.documentElement.namespaceURI != ns)) {
		  try {
		    if (ns != '')
		      doc.appendChild(doc.createElement(name)).
		        setAttribute('xmlns',ns);
		    else
		      doc.appendChild(doc.createElement(name));
		  } catch (dex) {
		    doc = document.implementation.createDocument(ns,name,null);
		   
		    if (doc.documentElement == null)
		      doc.appendChild(doc.createElement(name));

		     // fix buggy opera 8.5x
		    if (ns != '' &&
		        doc.documentElement.getAttribute('xmlns') != ns) {
		      doc.documentElement.setAttribute('xmlns',ns);
		    }
		  }
		}
	   
	    return doc;
	  }
	  catch (ex) { alert(ex.name+": "+ex.message); }
	  throw new Error("Your browser does not support XmlDocument objects");
	};

	/**
	 * used to find the Automation server name
	 * @private
	 */
	XmlDocument.getPrefix = function() {
	  if (XmlDocument.prefix)
	    return XmlDocument.prefix;

	  var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
	  var o;
	  for (var i = 0; i < prefixes.length; i++) {
	    try {
	      // try to create the objects
	      o = new ActiveXObject(prefixes[i] + ".DomDocument");
	      return XmlDocument.prefix = prefixes[i];
	    }
	    catch (ex) {};
	  }
	 
	  throw new Error("Could not find an installed XML parser");
	};


	// Create the loadXML method
	if (typeof(Document) != 'undefined' && window.DOMParser) {

	  /**
	   * XMLDocument did not extend the Document interface in some
	   * versions of Mozilla.
	   * @private
	   */
	  Document.prototype.loadXML = function (s) {
	
	    // parse the string to a new doc
	    var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
	
	    // remove all initial children
	    while (this.hasChildNodes())
	      this.removeChild(this.lastChild);
		
	    // insert and import nodes
	    for (var i = 0; i < doc2.childNodes.length; i++) {
	      this.appendChild(this.importNode(doc2.childNodes[i], true));
	    }
	  };
	 }

	// Create xml getter for Mozilla
	if (window.XMLSerializer &&
	    window.Node && Node.prototype && Node.prototype.__defineGetter__) {

	  /**
	   * xml getter
	   *
	   * This serializes the DOM tree to an XML String
	   *
	   * Usage: var sXml = oNode.xml
	   * @deprecated
	   * @private
	   */
	  // XMLDocument did not extend the Document interface in some versions
	  // of Mozilla. Extend both!
	  XMLDocument.prototype.__defineGetter__("xml", function () {
		                                   return (new XMLSerializer()).serializeToString(this);
		                                 });
	  /**
	   * xml getter
	   *
	   * This serializes the DOM tree to an XML String
	   *
	   * Usage: var sXml = oNode.xml
	   * @deprecated
	   * @private
	   */
	  Document.prototype.__defineGetter__("xml", function () {
		                                return (new XMLSerializer()).serializeToString(this);
		                              });

	  /**
	   * xml getter
	   *
	   * This serializes the DOM tree to an XML String
	   *
	   * Usage: var sXml = oNode.xml
	   * @deprecated
	   * @private
	   */
	  Node.prototype.__defineGetter__("xml", function () {
		                            return (new XMLSerializer()).serializeToString(this);
		                          });
	 }

	/**
	 * @fileoverview Collection of functions to make live easier
	 * @author Stefan Strigler
	 * @version $Revision: 437 $
	 */

	/**
	 * Convert special chars to HTML entities
	 * @addon
	 * @return The string with chars encoded for HTML
	 * @type String
	 */
	String.prototype.htmlEnc = function() {
	  var str = this.replace(/&/g,"&amp;");
	  str = str.replace(/</g,"&lt;");
	  str = str.replace(/>/g,"&gt;");
	  str = str.replace(/\"/g,"&quot;");
	  str = str.replace(/\n/g,"<br />");
	  return str;
	};

	/**
	 * Converts from jabber timestamps to JavaScript Date objects
	 * @addon
	 * @param {String} ts A string representing a jabber datetime timestamp as
	 * defined by {@link http://www.xmpp.org/extensions/xep-0082.html XEP-0082}
	 * @return A javascript Date object corresponding to the jabber DateTime given
	 * @type Date
	 */
	Date.jab2date = function(ts) {
	  var date = new Date(Date.UTC(ts.substr(0,4),ts.substr(5,2)-1,ts.substr(8,2),ts.substr(11,2),ts.substr(14,2),ts.substr(17,2)));
	  if (ts.substr(ts.length-6,1) != 'Z') { // there's an offset
	    var offset = new Date();
	    offset.setTime(0);
	    offset.setUTCHours(ts.substr(ts.length-5,2));
	    offset.setUTCMinutes(ts.substr(ts.length-2,2));
	    if (ts.substr(ts.length-6,1) == '+')
	      date.setTime(date.getTime() - offset.getTime());
	    else if (ts.substr(ts.length-6,1) == '-')
	      date.setTime(date.getTime() + offset.getTime());
	  }
	  return date;
	};

	/**
	 * Takes a timestamp in the form of 2004-08-13T12:07:04+02:00 as argument
	 * and converts it to some sort of humane readable format
	 * @addon
	 */
	Date.hrTime = function(ts) {
	  return Date.jab2date(ts).toLocaleString();
	};

	/**
	 * somewhat opposit to {@link #hrTime}
	 * expects a javascript Date object as parameter and returns a jabber
	 * date string conforming to
	 * {@link http://www.xmpp.org/extensions/xep-0082.html XEP-0082}
	 * @see #hrTime
	 * @return The corresponding jabber DateTime string
	 * @type String
	 */
	Date.prototype.jabberDate = function() {
	  var padZero = function(i) {
	    if (i < 10) return "0" + i;
	    return i;
	  };

	  var jDate = this.getUTCFullYear() + "-";
	  jDate += padZero(this.getUTCMonth()+1) + "-";
	  jDate += padZero(this.getUTCDate()) + "T";
	  jDate += padZero(this.getUTCHours()) + ":";
	  jDate += padZero(this.getUTCMinutes()) + ":";
	  jDate += padZero(this.getUTCSeconds()) + "Z";

	  return jDate;
	};

	/**
	 * Determines the maximum of two given numbers
	 * @addon
	 * @param {Number} A a number
	 * @param {Number} B another number
	 * @return the maximum of A and B
	 * @type Number
	 */
	Number.max = function(A, B) {
	  return (A > B)? A : B;
	};

	/* Copyright (c) 1998 - 2007, Paul Johnston & Contributors
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions
	 * are met:
	 *
	 * Redistributions of source code must retain the above copyright
	 * notice, this list of conditions and the following
	 * disclaimer. Redistributions in binary form must reproduce the above
	 * copyright notice, this list of conditions and the following
	 * disclaimer in the documentation and/or other materials provided
	 * with the distribution.
	 *
	 * Neither the name of the author nor the names of its contributors
	 * may be used to endorse or promote products derived from this
	 * software without specific prior written permission.
	 *
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
	 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
	 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
	 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
	 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
	 * OF THE POSSIBILITY OF SUCH DAMAGE.
	 *
	 */

	/**
	 * @fileoverview Collection of MD5 and SHA1 hashing and encoding
	 * methods.
	 * @author Stefan Strigler steve@zeank.in-berlin.de
	 * @version $Revision: 482 $
	 */

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
	var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
	function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
	function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
	function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
	function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
	function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function sha1_vm_test()
	{
	  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
	}

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	function core_sha1(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;

	  var w = Array(80);
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;

	  for(var i = 0; i < x.length; i += 16)
	    {
	      var olda = a;
	      var oldb = b;
	      var oldc = c;
	      var oldd = d;
	      var olde = e;

	      for(var j = 0; j < 80; j++)
		{
		  if(j < 16) w[j] = x[i + j];
		  else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
		  var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
		                   safe_add(safe_add(e, w[j]), sha1_kt(j)));
		  e = d;
		  d = c;
		  c = rol(b, 30);
		  b = a;
		  a = t;
		}

	      a = safe_add(a, olda);
	      b = safe_add(b, oldb);
	      c = safe_add(c, oldc);
	      d = safe_add(d, oldd);
	      e = safe_add(e, olde);
	    }
	  return Array(a, b, c, d, e);

	}

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	function sha1_ft(t, b, c, d)
	{
	  if(t < 20) return (b & c) | ((~b) & d);
	  if(t < 40) return b ^ c ^ d;
	  if(t < 60) return (b & c) | (b & d) | (c & d);
	  return b ^ c ^ d;
	}

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	function sha1_kt(t)
	{
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	    (t < 60) ? -1894007588 : -899497514;
	}

	/*
	 * Calculate the HMAC-SHA1 of a key and some data
	 */
	function core_hmac_sha1(key, data)
	{
	  var bkey = str2binb(key);
	  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	    {
	      ipad[i] = bkey[i] ^ 0x36363636;
	      opad[i] = bkey[i] ^ 0x5C5C5C5C;
	    }

	  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
	  return core_sha1(opad.concat(hash), 512 + 160);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 */
	function str2binb(str)
	{
	  var bin = Array();
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < str.length * chrsz; i += chrsz)
	    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
	  return bin;
	}

	/*
	 * Convert an array of big-endian words to a string
	 */
	function binb2str(bin)
	{
	  var str = "";
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += chrsz)
	    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
	  return str;
	}

	/*
	 * Convert an array of big-endian words to a hex string.
	 */
	function binb2hex(binarray)
	{
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	    {
	      str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
		hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	    }
	  return str;
	}

	/*
	 * Convert an array of big-endian words to a base-64 string
	 */
	function binb2b64(binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	    {
	      var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
		| (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
		|  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
	      for(var j = 0; j < 4; j++)
		{
		  if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
		  else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
		}
	    }
	  return str.replace(/AAA\=(\=*?)$/,'$1'); // cleans garbage chars at end of string
	}

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	// var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	// var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	// var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
	function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
	function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
	function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
	function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
	function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	function core_hmac_md5(key, data)
	{
	  var bkey = str2binl(key);
	  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
	  return core_md5(opad.concat(hash), 512 + 128);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	 * Convert a string to an array of little-endian words
	 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	function str2binl(str)
	{
	  var bin = Array();
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < str.length * chrsz; i += chrsz)
	    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
	  return bin;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2str(bin)
	{
	  var str = "";
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += chrsz)
	    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
	  return str;
	}

	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	function binl2hex(binarray)
	{
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	  {
	    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
		   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
	  }
	  return str;
	}

	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	function binl2b64(binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	  {
	    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
		        | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
		        |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
	      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
	    }
	  }
	  return str;
	}

	/* #############################################################################
	   UTF-8 Decoder and Encoder
	   base64 Encoder and Decoder
	   written by Tobias Kieslich, justdreams
	   Contact: tobias@justdreams.de				http://www.justdreams.de/
	   ############################################################################# */

	// returns an array of byterepresenting dezimal numbers which represent the
	// plaintext in an UTF-8 encoded version. Expects a string.
	// This function includes an exception management for those nasty browsers like
	// NN401, which returns negative decimal numbers for chars>128. I hate it!!
	// This handling is unfortunately limited to the user's charset. Anyway, it works
	// in most of the cases! Special signs with an unicode>256 return numbers, which
	// can not be converted to the actual unicode and so not to the valid utf-8
	// representation. Anyway, this function does always return values which can not
	// misinterpretd by RC4 or base64 en- or decoding, because every value is >0 and
	// <255!!
	// Arrays are faster and easier to handle in b64 encoding or encrypting....
	function utf8t2d(t)
	{
	  t = t.replace(/\r\n/g,"\n");
	  var d=new Array; var test=String.fromCharCode(237);
	  if (test.charCodeAt(0) < 0)
	    for(var n=0; n<t.length; n++)
	      {
		var c=t.charCodeAt(n);
		if (c>0)
		  d[d.length]= c;
		else {
		  d[d.length]= (((256+c)>>6)|192);
		  d[d.length]= (((256+c)&63)|128);}
	      }
	  else
	    for(var n=0; n<t.length; n++)
	      {
		var c=t.charCodeAt(n);
		// all the signs of asci => 1byte
		if (c<128)
		  d[d.length]= c;
		// all the signs between 127 and 2047 => 2byte
		else if((c>127) && (c<2048)) {
		  d[d.length]= ((c>>6)|192);
		  d[d.length]= ((c&63)|128);}
		// all the signs between 2048 and 66536 => 3byte
		else {
		  d[d.length]= ((c>>12)|224);
		  d[d.length]= (((c>>6)&63)|128);
		  d[d.length]= ((c&63)|128);}
	      }
	  return d;
	}
	
	// returns plaintext from an array of bytesrepresenting dezimal numbers, which
	// represent an UTF-8 encoded text; browser which does not understand unicode
	// like NN401 will show "?"-signs instead
	// expects an array of byterepresenting decimals; returns a string
	function utf8d2t(d)
	{
	  var r=new Array; var i=0;
	  while(i<d.length)
	    {
	      if (d[i]<128) {
		r[r.length]= String.fromCharCode(d[i]); i++;}
	      else if((d[i]>191) && (d[i]<224)) {
		r[r.length]= String.fromCharCode(((d[i]&31)<<6) | (d[i+1]&63)); i+=2;}
	      else {
		r[r.length]= String.fromCharCode(((d[i]&15)<<12) | ((d[i+1]&63)<<6) | (d[i+2]&63)); i+=3;}
	    }
	  return r.join("");
	}

	// included in <body onload="b64arrays"> it creates two arrays which makes base64
	// en- and decoding faster
	// this speed is noticeable especially when coding larger texts (>5k or so)
	function b64arrays() {
	  var b64s='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  b64 = new Array();f64 =new Array();
	  for (var i=0; i<b64s.length ;i++) {
	    b64[i] = b64s.charAt(i);
	    f64[b64s.charAt(i)] = i;
	  }
	}

	// creates a base64 encoded text out of an array of byerepresenting dezimals
	// it is really base64 :) this makes serversided handling easier
	// expects an array; returns a string
	function b64d2t(d) {
	  var r=new Array; var i=0; var dl=d.length;
	  // this is for the padding
	  if ((dl%3) == 1) {
	    d[d.length] = 0; d[d.length] = 0;}
	  if ((dl%3) == 2)
	    d[d.length] = 0;
	  // from here conversion
	  while (i<d.length)
	    {
	      r[r.length] = b64[d[i]>>2];
	      r[r.length] = b64[((d[i]&3)<<4) | (d[i+1]>>4)];
	      r[r.length] = b64[((d[i+1]&15)<<2) | (d[i+2]>>6)];
	      r[r.length] = b64[d[i+2]&63];
	      i+=3;
	    }
	  // this is again for the padding
	  if ((dl%3) == 1)
	    r[r.length-1] = r[r.length-2] = "=";
	  if ((dl%3) == 2)
	    r[r.length-1] = "=";
	  // we join the array to return a textstring
	  var t=r.join("");
	  return t;
	}

	// returns array of byterepresenting numbers created of an base64 encoded text
	// it is still the slowest function in this modul; I hope I can make it faster
	// expects string; returns an array
	function b64t2d(t) {
	  var d=new Array; var i=0;
	  // here we fix this CRLF sequenz created by MS-OS; arrrgh!!!
	  t=t.replace(/\n|\r/g,""); t=t.replace(/=/g,"");
	  while (i<t.length)
	    {
	      d[d.length] = (f64[t.charAt(i)]<<2) | (f64[t.charAt(i+1)]>>4);
	      d[d.length] = (((f64[t.charAt(i+1)]&15)<<4) | (f64[t.charAt(i+2)]>>2));
	      d[d.length] = (((f64[t.charAt(i+2)]&3)<<6) | (f64[t.charAt(i+3)]));
	      i+=4;
	    }
	  if (t.length%4 == 2)
	    d = d.slice(0, d.length-2);
	  if (t.length%4 == 3)
	    d = d.slice(0, d.length-1);
	  return d;
	}

	if (typeof(atob) == 'undefined' || typeof(btoa) == 'undefined')
	  b64arrays();

	if (typeof(atob) == 'undefined') {
	  atob = function(s) {
	    return utf8d2t(b64t2d(s));
	  }
	}

	if (typeof(btoa) == 'undefined') {
	  btoa = function(s) {
	    return b64d2t(utf8t2d(s));
	  }
	}

	function cnonce(size) {
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	  var cnonce = '';
	  for (var i=0; i<size; i++) {
	    cnonce += tab.charAt(Math.round(Math.random(new Date().getTime())*(tab.length-1)));
	  }
	  return cnonce;
	}


	var JSJAC_HAVEKEYS = true;  // whether to use keys
	var JSJAC_NKEYS    = 16;    // number of keys to generate
	var JSJAC_INACTIVITY = 300; // qnd hack to make suspend/resume work more smoothly with polling
	var JSJAC_ERR_COUNT = 10;   // number of retries in case of connection errors

	var JSJAC_ALLOW_PLAIN = true; // whether to allow plaintext logins

	var JSJAC_CHECKQUEUEINTERVAL = 1; // msecs to poll send queue
	var JSJAC_CHECKINQUEUEINTERVAL = 1; // msecs to poll incoming queue

	// Options specific to HTTP Binding (BOSH)
	var JSJACHBC_BOSH_VERSION  = "1.6";
	var JSJACHBC_USE_BOSH_VER  = true;

	var JSJACHBC_MAX_HOLD = 1;
	var JSJACHBC_MAX_WAIT = 300;

	var JSJACHBC_MAXPAUSE = 120;

	/*** END CONFIG ***/

	var NS_DISCO_ITEMS =  "http://jabber.org/protocol/disco#items";
	var NS_DISCO_INFO =   "http://jabber.org/protocol/disco#info";
	var NS_VCARD =        "vcard-temp";
	var NS_AUTH =         "jabber:iq:auth";
	var NS_AUTH_ERROR =   "jabber:iq:auth:error";
	var NS_REGISTER =     "jabber:iq:register";
	var NS_SEARCH =       "jabber:iq:search";
	var NS_ROSTER =       "jabber:iq:roster";
	var NS_PRIVACY =      "jabber:iq:privacy";
	var NS_PRIVATE =      "jabber:iq:private";
	var NS_VERSION =      "jabber:iq:version";
	var NS_TIME =         "jabber:iq:time";
	var NS_LAST =         "jabber:iq:last";
	var NS_XDATA =        "jabber:x:data";
	var NS_IQDATA =       "jabber:iq:data";
	var NS_DELAY =        "jabber:x:delay";
	var NS_EXPIRE =       "jabber:x:expire";
	var NS_EVENT =        "jabber:x:event";
	var NS_XCONFERENCE =  "jabber:x:conference";
	var NS_STATS =        "http://jabber.org/protocol/stats";
	var NS_MUC =          "http://jabber.org/protocol/muc";
	var NS_MUC_USER =     "http://jabber.org/protocol/muc#user";
	var NS_MUC_ADMIN =    "http://jabber.org/protocol/muc#admin";
	var NS_MUC_OWNER =    "http://jabber.org/protocol/muc#owner";
	var NS_PUBSUB =       "http://jabber.org/protocol/pubsub";
	var NS_PUBSUB_EVENT = "http://jabber.org/protocol/pubsub#event";
	var NS_PUBSUB_OWNER = "http://jabber.org/protocol/pubsub#owner";
	var NS_PUBSUB_NMI =   "http://jabber.org/protocol/pubsub#node-meta-info";
	var NS_COMMANDS =     "http://jabber.org/protocol/commands";
	var NS_STREAM =       "http://etherx.jabber.org/streams";

	var NS_STANZAS =      "urn:ietf:params:xml:ns:xmpp-stanzas";
	var NS_STREAMS =      "urn:ietf:params:xml:ns:xmpp-streams";

	var NS_TLS =          "urn:ietf:params:xml:ns:xmpp-tls";
	var NS_SASL =         "urn:ietf:params:xml:ns:xmpp-sasl";
	var NS_SESSION =      "urn:ietf:params:xml:ns:xmpp-session";
	var NS_BIND =         "urn:ietf:params:xml:ns:xmpp-bind";

	var NS_FEATURE_IQAUTH = "http://jabber.org/features/iq-auth";
	var NS_FEATURE_IQREGISTER = "http://jabber.org/features/iq-register";
	var NS_FEATURE_COMPRESS = "http://jabber.org/features/compress";

	var NS_COMPRESS =     "http://jabber.org/protocol/compress";

	function STANZA_ERROR(code, type, cond) {
	  if (window == this)
	    return new STANZA_ERROR(code, type, cond);

	  this.code = code;
	  this.type = type;
	  this.cond = cond;
	}

	var ERR_BAD_REQUEST =
		STANZA_ERROR("400", "modify", "bad-request");
	var ERR_CONFLICT =
		STANZA_ERROR("409", "cancel", "conflict");
	var ERR_FEATURE_NOT_IMPLEMENTED =
		STANZA_ERROR("501", "cancel", "feature-not-implemented");
	var ERR_FORBIDDEN =
		STANZA_ERROR("403", "auth",   "forbidden");
	var ERR_GONE =
		STANZA_ERROR("302", "modify", "gone");
	var ERR_INTERNAL_SERVER_ERROR =
		STANZA_ERROR("500", "wait",   "internal-server-error");
	var ERR_ITEM_NOT_FOUND =
		STANZA_ERROR("404", "cancel", "item-not-found");
	var ERR_JID_MALFORMED =
		STANZA_ERROR("400", "modify", "jid-malformed");
	var ERR_NOT_ACCEPTABLE =
		STANZA_ERROR("406", "modify", "not-acceptable");
	var ERR_NOT_ALLOWED =
		STANZA_ERROR("405", "cancel", "not-allowed");
	var ERR_NOT_AUTHORIZED =
		STANZA_ERROR("401", "auth",   "not-authorized");
	var ERR_PAYMENT_REQUIRED =
		STANZA_ERROR("402", "auth",   "payment-required");
	var ERR_RECIPIENT_UNAVAILABLE =
		STANZA_ERROR("404", "wait",   "recipient-unavailable");
	var ERR_REDIRECT =
		STANZA_ERROR("302", "modify", "redirect");
	var ERR_REGISTRATION_REQUIRED =
		STANZA_ERROR("407", "auth",   "registration-required");
	var ERR_REMOTE_SERVER_NOT_FOUND =
		STANZA_ERROR("404", "cancel", "remote-server-not-found");
	var ERR_REMOTE_SERVER_TIMEOUT =
		STANZA_ERROR("504", "wait",   "remote-server-timeout");
	var ERR_RESOURCE_CONSTRAINT =
		STANZA_ERROR("500", "wait",   "resource-constraint");
	var ERR_SERVICE_UNAVAILABLE =
		STANZA_ERROR("503", "cancel", "service-unavailable");
	var ERR_SUBSCRIPTION_REQUIRED =
		STANZA_ERROR("407", "auth",   "subscription-required");
	var ERR_UNEXPECTED_REQUEST =
		STANZA_ERROR("400", "wait",   "unexpected-request");

	/* Copyright 2003-2006 Peter-Paul Koch
	 */

	/**
	 * @fileoverview OO interface to handle cookies.
	 * Taken from {@link http://www.quirksmode.org/js/cookies.html
	 * http://www.quirksmode.org/js/cookies.html}
	 * Regarding licensing of this code the author states:
	 *
	 * "You may copy, tweak, rewrite, sell or lease any code example on
	 * this site, with one single exception."
	 *
	 * @author Stefan Strigler
	 * @version $Revision: 481 $
	 */

	/**
	 * Creates a new Cookie
	 * @class Class representing browser cookies for storing small amounts of data
	 * @constructor
	 * @param {String} name  The name of the value to store
	 * @param {String} value The value to store
	 * @param {int}    secs  Number of seconds until cookie expires (may be empty)
	 */
	function JSJaCCookie(name,value,secs)
	{
	  if (window == this)
	    return new JSJaCCookie(name, value, secs);

	  /**
	   * This cookie's name
	   * @type String
	   */
	  this.name = name;
	  /**
	   * This cookie's value
	   * @type String
	   */
	  this.value = value;
	  /**
	   * Time in seconds when cookie expires (thus being delete by
	   * browser). A value of -1 denotes a session cookie which means that
	   * stored data gets lost when browser is being closed. 
	   * @type int
	   */
	  this.secs = secs;

	  /**
	   * Stores this cookie
	   */
	  this.write = function() {
	    if (this.secs) {
	      var date = new Date();
	      date.setTime(date.getTime()+(this.secs*1000));
	      var expires = "; expires="+date.toGMTString();
	    } else
	      var expires = "";
	    document.cookie = this.getName()+"="+this.getValue()+expires+"; path=/";
	  };
	  /**
	   * Deletes this cookie
	   */
	  this.erase = function() {
	    var c = new JSJaCCookie(this.getName(),"",-1);
	    c.write();
	  };

	  /**
	   * Gets the name of this cookie
	   * @return The name
	   * @type String
	   */
	  this.getName = function() {
	    return this.name;
	  };
	 
	  /**
	   * Sets the name of this cookie
	   * @param {String} name The name for this cookie
	   * @return This cookie
	   * @type Cookie
	   */
	  this.setName = function(name) {
	    this.name = name;
	    return this;
	  };

	  /**
	   * Gets the value of this cookie
	   * @return The value
	   * @type String
	   */
	  this.getValue = function() {
	    return this.value;
	  };
	 
	  /**
	   * Sets the value of this cookie
	   * @param {String} value The value for this cookie
	   * @return This cookie
	   * @type Cookie
	   */
	  this.setValue = function(value) {
	    this.value = value;
	    return this;
	  };
	}

	/**
	 * Reads the value for given <code>name</code> from cookies and return new
	 * <code>Cookie</code> object
	 * @param {String} name The name of the cookie to read
	 * @return A cookie object of the given name
	 * @type Cookie
	 * @throws CookieException when cookie with given name could not be found
	 */
	JSJaCCookie.read = function(name) {
	  var nameEQ = name + "=";
	  var ca = document.cookie.split(';');
	  for(var i=0;i < ca.length;i++) {
	    var c = ca[i];
	    while (c.charAt(0)==' ') c = c.substring(1,c.length);
	    if (c.indexOf(nameEQ) == 0) return new JSJaCCookie(name, c.substring(nameEQ.length,c.length));
	  }
	  throw new JSJaCCookieException("Cookie not found");
	};

	/**
	 * Reads the value for given <code>name</code> from cookies and returns
	 * its valued new
	 * @param {String} name The name of the cookie to read
	 * @return The value of the cookie read
	 * @type String
	 * @throws CookieException when cookie with given name could not be found
	 */
	JSJaCCookie.get = function(name) {
	  return JSJaCCookie.read(name).getValue();
	};

	/**
	 * Deletes cookie with given <code>name</code>
	 * @param {String} name The name of the cookie to delete
	 * @throws CookieException when cookie with given name could not be found
	 */
	JSJaCCookie.remove = function(name) {
	  JSJaCCookie.read(name).erase();
	};

	/**
	 * Some exception denoted to dealing with cookies
	 * @constructor
	 * @param {String} msg The message to pass to the exception
	 */
	function JSJaCCookieException(msg) {
	  this.message = msg;
	  this.name = "CookieException";
	}

	/* Copyright (c) 2005-2007 Sam Stephenson
	 *
	 * Permission is hereby granted, free of charge, to any person
	 * obtaining a copy of this software and associated documentation
	 * files (the "Software"), to deal in the Software without
	 * restriction, including without limitation the rights to use, copy,
	 * modify, merge, publish, distribute, sublicense, and/or sell copies
	 * of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 */

	/*
	  json.js
	  taken from prototype.js, made static
	*/
	function JSJaCJSON() {}
	JSJaCJSON.toString = function (obj) {
	  var m = {
	    '\b': '\\b',
	    '\t': '\\t',
	    '\n': '\\n',
	    '\f': '\\f',
	    '\r': '\\r',
	    '"' : '\\"',
	    '\\': '\\\\'
	  },
	  s = {
	    array: function (x) {
	      var a = ['['], b, f, i, l = x.length, v;
	      for (i = 0; i < l; i += 1) {
		v = x[i];
		f = s[typeof v];
		if (f) {
		  v = f(v);
		  if (typeof v == 'string') {
		    if (b) {
		      a[a.length] = ',';
		    }
		    a[a.length] = v;
		    b = true;
		  }
		}
	      }
	      a[a.length] = ']';
	      return a.join('');
	    },
	    'boolean': function (x) {
	      return String(x);
	    },
	    'null': function (x) {
	      return "null";
	    },
	    number: function (x) {
	      return isFinite(x) ? String(x) : 'null';
	    },
	    object: function (x) {
	      if (x) {
		if (x instanceof Array) {
		  return s.array(x);
		}
		var a = ['{'], b, f, i, v;
		for (i in x) {
		  if (x.hasOwnProperty(i)) {
		    v = x[i];
		    f = s[typeof v];
		    if (f) {
		      v = f(v);
		      if (typeof v == 'string') {
		        if (b) {
		          a[a.length] = ',';
		        }
		        a.push(s.string(i), ':', v);
		        b = true;
		      }
		    }
		  }
		}
		 
		a[a.length] = '}';
		return a.join('');
	      }
	      return 'null';
	    },
	    string: function (x) {
	      if (/["\\\x00-\x1f]/.test(x)) {
		            x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
		  var c = m[b];
		  if (c) {
		    return c;
		  }
		  c = b.charCodeAt();
		  return '\\u00' +
		  Math.floor(c / 16).toString(16) +
		  (c % 16).toString(16);
		});
	  }
	  return '"' + x + '"';
	}
	  };

	switch (typeof(obj)) {
	 case 'object':
	   return s.object(obj);
	 case 'array':
	   return s.array(obj);
	   
	 }
	};

	JSJaCJSON.parse = function (str) {
	  try {
	    return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
		                                               str.replace(/"(\\.|[^"\\])*"/g, ''))) &&
		    eval('(' + str + ')');
	    } catch (e) {
		return false;
	    }
	};

	/**
	 * @fileoverview This file contains all things that make life easier when
	 * dealing with JIDs
	 * @author Stefan Strigler
	 * @version $Revision: 437 $
	 */

	/**
	 * list of forbidden chars for nodenames
	 * @private
	 */
	var JSJACJID_FORBIDDEN = ['"',' ','&','\'','/',':','<','>','@'];

	/**
	 * Creates a new JSJaCJID object
	 * @class JSJaCJID models xmpp jid objects
	 * @constructor
	 * @param {Object} jid jid may be either of type String or a JID represented
	 * by JSON with fields 'node', 'domain' and 'resource'
	 * @throws JSJaCJIDInvalidException Thrown if jid is not valid
	 * @return a new JSJaCJID object
	 */
	function JSJaCJID(jid) {
	  /**
	   *@private
	   */
	  this._node = '';
	  /**
	   *@private
	   */
	  this._domain = '';
	  /**
	   *@private
	   */
	  this._resource = '';

	  if (typeof(jid) == 'string') {
	    if (jid.indexOf('@') != -1) {
		this.setNode(jid.substring(0,jid.indexOf('@')));
		jid = jid.substring(jid.indexOf('@')+1);
	    }
	    if (jid.indexOf('/') != -1) {
	      this.setResource(jid.substring(jid.indexOf('/')+1));
	      jid = jid.substring(0,jid.indexOf('/'));
	    }
	    this.setDomain(jid);
	  } else {
	    this.setNode(jid.node);
	    this.setDomain(jid.domain);
	    this.setResource(jid.resource);
	  }
	}


	/**
	 * Gets the node part of the jid
	 * @return A string representing the node name
	 * @type String
	 */
	JSJaCJID.prototype.getNode = function() { return this._node; };

	/**
	 * Gets the domain part of the jid
	 * @return A string representing the domain name
	 * @type String
	 */
	JSJaCJID.prototype.getDomain = function() { return this._domain; };

	/**
	 * Gets the resource part of the jid
	 * @return A string representing the resource
	 * @type String
	 */
	JSJaCJID.prototype.getResource = function() { return this._resource; };


	/**
	 * Sets the node part of the jid
	 * @param {String} node Name of the node
	 * @throws JSJaCJIDInvalidException Thrown if node name contains invalid chars
	 * @return This object
	 * @type JSJaCJID
	 */
	JSJaCJID.prototype.setNode = function(node) {
	  JSJaCJID._checkNodeName(node);
	  this._node = node || '';
	  return this;
	};

	/**
	 * Sets the domain part of the jid
	 * @param {String} domain Name of the domain
	 * @throws JSJaCJIDInvalidException Thrown if domain name contains invalid
	 * chars or is empty
	 * @return This object
	 * @type JSJaCJID
	 */
	JSJaCJID.prototype.setDomain = function(domain) {
	  if (!domain || domain == '')
	    throw new JSJaCJIDInvalidException("domain name missing");
	  // chars forbidden for a node are not allowed in domain names
	  // anyway, so let's check
	  JSJaCJID._checkNodeName(domain);
	  this._domain = domain;
	  return this;
	};

	/**
	 * Sets the resource part of the jid
	 * @param {String} resource Name of the resource
	 * @return This object
	 * @type JSJaCJID
	 */
	JSJaCJID.prototype.setResource = function(resource) {
	  this._resource = resource || '';
	  return this;
	};

	/**
	 * The string representation of the full jid
	 * @return A string representing the jid
	 * @type String
	 */
	JSJaCJID.prototype.toString = function() {
	  var jid = '';
	  if (this.getNode() && this.getNode() != '')
	    jid = this.getNode() + '@';
	  jid += this.getDomain(); // we always have a domain
	  if (this.getResource() && this.getResource() != "")
	    jid += '/' + this.getResource();
	  return jid;
	};

	/**
	 * Removes the resource part of the jid
	 * @return This object
	 * @type JSJaCJID
	 */
	JSJaCJID.prototype.removeResource = function() {
	  return this.setResource();
	};

	/**
	 * creates a copy of this JSJaCJID object
	 * @return A copy of this
	 * @type JSJaCJID
	 */
	JSJaCJID.prototype.clone = function() {
	  return new JSJaCJID(this.toString());
	};

	/**
	 * Compares two jids if they belong to the same entity (i.e. w/o resource)
	 * @param {String} jid a jid as string or JSJaCJID object
	 * @return 'true' if jid is same entity as this
	 * @type Boolean
	 */
	JSJaCJID.prototype.isEntity = function(jid) {
	  if (typeof jid == 'string')
		  jid = (new JSJaCJID(jid));
	  jid.removeResource();
	  return (this.clone().removeResource().toString() === jid.toString());
	};

	/**
	 * Check if node name is valid
	 * @private
	 * @param {String} node A name for a node
	 * @throws JSJaCJIDInvalidException Thrown if name for node is not allowed
	 */
	JSJaCJID._checkNodeName = function(nodeprep) {
	    if (!nodeprep || nodeprep == '')
	      return;
	    for (var i=0; i< JSJACJID_FORBIDDEN.length; i++) {
	      if (nodeprep.indexOf(JSJACJID_FORBIDDEN[i]) != -1) {
		throw new JSJaCJIDInvalidException("forbidden char in nodename: "+JSJACJID_FORBIDDEN[i]);
	      }
	    }
	};

	/**
	 * Creates a new Exception of type JSJaCJIDInvalidException
	 * @class Exception to indicate invalid values for a jid
	 * @constructor
	 * @param {String} message The message associated with this Exception
	 */
	function JSJaCJIDInvalidException(message) {
	  /**
	   * The exceptions associated message
	   * @type String
	   */
	  this.message = message;
	  /**
	   * The name of the exception
	   * @type String
	   */
	  this.name = "JSJaCJIDInvalidException";
	}

	/* Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
	 *
	 * Permission is hereby granted, free of charge, to any person
	 * obtaining a copy of this software and associated documentation
	 * files (the "Software"), to deal in the Software without
	 * restriction, including without limitation the rights to use, copy,
	 * modify, merge, publish, distribute, sublicense, and/or sell copies
	 * of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 */

	/**
	 * @private
	 * This code is taken from {@link
	 * http://wiki.script.aculo.us/scriptaculous/show/Builder
	 * script.aculo.us' Dom Builder} and has been modified to suit our
	 * needs.<br/>
	 * The original parts of the code do have the following
	 * copyright and license notice:<br/>
	 * Copyright (c) 2005, 2006 Thomas Fuchs (http://script.aculo.us,
	 * http://mir.acu lo.us) <br/>
	 * script.aculo.us is freely distributable under the terms of an
	 * MIT-style license.<br>
	 * For details, see the script.aculo.us web site:
	 * http://script.aculo.us/<br>
	 */
	var JSJaCBuilder = {
	  /**
	   * @private
	   */
	  buildNode: function(doc, elementName) {

	    var element, ns = arguments[4];

	    // attributes (or text)
	    if(arguments[2])
	      if(JSJaCBuilder._isStringOrNumber(arguments[2]) ||
		 (arguments[2] instanceof Array)) {
		element = this._createElement(doc, elementName, ns);
		JSJaCBuilder._children(doc, element, arguments[2]);
	      } else {
		ns = arguments[2]['xmlns'] || ns;
		element = this._createElement(doc, elementName, ns);
		for(attr in arguments[2]) {
		  if (arguments[2].hasOwnProperty(attr) && attr != 'xmlns')
		    element.setAttribute(attr, arguments[2][attr]);
		}
	      }
	    else
	      element = this._createElement(doc, elementName, ns);
	    // text, or array of children
	    if(arguments[3])
	      JSJaCBuilder._children(doc, element, arguments[3], ns);

	    return element;
	  },

	  _createElement: function(doc, elementName, ns) {
	    try {
	      if (ns)
		return doc.createElementNS(ns, elementName);
	    } catch (ex) { }

	    var el = doc.createElement(elementName);

	    if (ns)
	      el.setAttribute("xmlns", ns);

	    return el;
	  },

	  /**
	   * @private
	   */
	  _text: function(doc, text) {
	    return doc.createTextNode(text);
	  },

	  /**
	   * @private
	   */
	  _children: function(doc, element, children, ns) {
	    if(typeof children=='object') { // array can hold nodes and text
	      for (var i in children) {
		if (children.hasOwnProperty(i)) {
		  var e = children[i];
		  if (typeof e=='object') {
		    if (e instanceof Array) {
		      var node = JSJaCBuilder.buildNode(doc, e[0], e[1], e[2], ns);
		      element.appendChild(node);
		    } else {
		      element.appendChild(e);
		    }
		  } else {
		    if(JSJaCBuilder._isStringOrNumber(e)) {
		      element.appendChild(JSJaCBuilder._text(doc, e));
		    }
		  }
		}
	      }
	    } else {
	      if(JSJaCBuilder._isStringOrNumber(children)) {
		element.appendChild(JSJaCBuilder._text(doc, children));
	      }
	    }
	  },

	  _attributes: function(attributes) {
	    var attrs = [];
	    for(attribute in attributes)
	      if (attributes.hasOwnProperty(attribute))
		attrs.push(attribute +
		  '="' + attributes[attribute].toString().htmlEnc() + '"');
	    return attrs.join(" ");
	  },

	  _isStringOrNumber: function(param) {
	    return(typeof param=='string' || typeof param=='number');
	  }
	};

	/**
	 * @fileoverview Contains all Jabber/XMPP packet related classes.
	 * @author Stefan Strigler steve@zeank.in-berlin.de
	 * @version $Revision: 480 $
	 */

	var JSJACPACKET_USE_XMLNS = true;

	/**
	 * Creates a new packet with given root tag name (for internal use)
	 * @class Somewhat abstract base class for all kinds of specialised packets
	 * @param {String} name The root tag name of the packet
	 * (i.e. one of 'message', 'iq' or 'presence')
	 */
	function JSJaCPacket(name) {
	  /**
	   * @private
	   */
	  this.name = name;

	  if (typeof(JSJACPACKET_USE_XMLNS) != 'undefined' && JSJACPACKET_USE_XMLNS)
	    /**
	     * @private
	     */
	    this.doc = XmlDocument.create(name,'jabber:client');
	  else
	    /**
	     * @private
	     */
	    this.doc = XmlDocument.create(name,'');
	}

	/**
	 * Gets the type (name of root element) of this packet, i.e. one of
	 * 'presence', 'message' or 'iq'
	 * @return the top level tag name
	 * @type String
	 */
	JSJaCPacket.prototype.pType = function() { return this.name; };

	/**
	 * Gets the associated Document for this packet.
	 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#i-Document Document}
	 */
	JSJaCPacket.prototype.getDoc = function() {
	  return this.doc;
	};
	/**
	 * Gets the root node of this packet
	 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
	 */
	JSJaCPacket.prototype.getNode = function() {
	  if (this.getDoc() && this.getDoc().documentElement)
	    return this.getDoc().documentElement;
	  else
	    return null;
	};

	/**
	 * Sets the 'to' attribute of the root node of this packet
	 * @param {String} to
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.setTo = function(to) {
	  if (!to || to == '')
	    this.getNode().removeAttribute('to');
	  else if (typeof(to) == 'string')
	    this.getNode().setAttribute('to',to);
	  else
	    this.getNode().setAttribute('to',to.toString());
	  return this;
	};
	/**
	 * Sets the 'from' attribute of the root node of this
	 * packet. Usually this is not needed as the server will take care
	 * of this automatically.
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.setFrom = function(from) {
	  if (!from || from == '')
	    this.getNode().removeAttribute('from');
	  else if (typeof(from) == 'string')
	    this.getNode().setAttribute('from',from);
	  else
	    this.getNode().setAttribute('from',from.toString());
	  return this;
	};
	/**
	 * Sets 'id' attribute of the root node of this packet.
	 * @param {String} id The id of the packet.
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.setID = function(id) {
	  if (!id || id == '')
	    this.getNode().removeAttribute('id');
	  else
	    this.getNode().setAttribute('id',id);
	  return this;
	};
	/**
	 * Sets the 'type' attribute of the root node of this packet.
	 * @param {String} type The type of the packet.
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.setType = function(type) {
	  if (!type || type == '')
	    this.getNode().removeAttribute('type');
	  else
	    this.getNode().setAttribute('type',type);
	  return this;
	};
	/**
	 * Sets 'xml:lang' for this packet
	 * @param {String} xmllang The xml:lang of the packet.
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.setXMLLang = function(xmllang) {
	  if (!xmllang || xmllang == '')
	    this.getNode().removeAttribute('xml:lang');
	  else
	    this.getNode().setAttribute('xml:lang',xmllang);
	  return this;
	};

	/**
	 * Gets the 'to' attribute of this packet
	 * @type String
	 */
	JSJaCPacket.prototype.getTo = function() {
	  return this.getNode().getAttribute('to');
	};
	/**
	 * Gets the 'from' attribute of this packet.
	 * @type String
	 */
	JSJaCPacket.prototype.getFrom = function() {
	  return this.getNode().getAttribute('from');
	};
	/**
	 * Gets the 'to' attribute of this packet as a JSJaCJID object
	 * @type JSJaCJID
	 */
	JSJaCPacket.prototype.getToJID = function() {
	  return new JSJaCJID(this.getTo());
	};
	/**
	 * Gets the 'from' attribute of this packet as a JSJaCJID object
	 * @type JSJaCJID
	 */
	JSJaCPacket.prototype.getFromJID = function() {
	  return new JSJaCJID(this.getFrom());
	};
	/**
	 * Gets the 'id' of this packet
	 * @type String
	 */
	JSJaCPacket.prototype.getID = function() {
	  return this.getNode().getAttribute('id');
	};
	/**
	 * Gets the 'type' of this packet
	 * @type String
	 */
	JSJaCPacket.prototype.getType = function() {
	  return this.getNode().getAttribute('type');
	};
	/**
	 * Gets the 'xml:lang' of this packet
	 * @type String
	 */
	JSJaCPacket.prototype.getXMLLang = function() {
	  return this.getNode().getAttribute('xml:lang');
	};
	/**
	 * Gets the 'xmlns' (xml namespace) of the root node of this packet
	 * @type String
	 */
	JSJaCPacket.prototype.getXMLNS = function() {
	  return this.getNode().namespaceURI;
	};

	/**
	 * Gets a child element of this packet. If no params given returns first child.
	 * @param {String} name Tagname of child to retrieve. Use '*' to match any tag. [optional]
	 * @param {String} ns   Namespace of child. Use '*' to match any ns.[optional]
	 * @return The child node, null if none found
	 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
	 */
	JSJaCPacket.prototype.getChild = function(name, ns) {
	  if (!this.getNode()) {
	    return null;
	  }
	 
	  name = name || '*';
	  ns = ns || '*';

	  if (this.getNode().getElementsByTagNameNS) {
	    return this.getNode().getElementsByTagNameNS(ns, name).item(0);
	  }

	  // fallback
	  var nodes = this.getNode().getElementsByTagName(name);
	  if (ns != '*') {
	    for (var i=0; i<nodes.length; i++) {
	      if (nodes.item(i).namespaceURI == ns) {
		return nodes.item(i);
	      }
	    }
	  } else {
	    return nodes.item(0);
	  }
	  return null; // nothing found
	}

	/**
	 * Gets the node value of a child element of this packet.
	 * @param {String} name Tagname of child to retrieve.
	 * @param {String} ns   Namespace of child
	 * @return The value of the child node, empty string if none found
	 * @type String
	 */
	JSJaCPacket.prototype.getChildVal = function(name, ns) {
	  var node = this.getChild(name, ns);
	  var ret = '';
	  if (node && node.hasChildNodes()) {
	    // concatenate all values from childNodes
	    for (var i=0; i<node.childNodes.length; i++)
	      if (node.childNodes.item(i).nodeValue)
		ret += node.childNodes.item(i).nodeValue;
	  }
	  return ret;
	};

	/**
	 * Returns a copy of this node
	 * @return a copy of this node
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.clone = function() {
	  return JSJaCPacket.wrapNode(this.getNode());
	};

	/**
	 * Checks if packet is of type 'error'
	 * @return 'true' if this packet is of type 'error', 'false' otherwise
	 * @type boolean
	 */
	JSJaCPacket.prototype.isError = function() {
	  return (this.getType() == 'error');
	};

	/**
	 * Returns an error condition reply according to {@link http://www.xmpp.org/extensions/xep-0086.html XEP-0086}. Creates a clone of the calling packet with senders and recipient exchanged and error stanza appended.
	 * @param {STANZA_ERROR} stanza_error an error stanza containing error cody, type and condition of the error to be indicated
	 * @return an error reply packet
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.errorReply = function(stanza_error) {
	  var rPacket = this.clone();
	  rPacket.setTo(this.getFrom());
	  rPacket.setFrom();
	  rPacket.setType('error');

	  rPacket.appendNode('error',
		             {code: stanza_error.code, type: stanza_error.type},
		             [[stanza_error.cond]]);

	  return rPacket;
	};

	/**
	 * Returns a string representation of the raw xml content of this packet.
	 * @type String
	 */
	JSJaCPacket.prototype.xml = typeof XMLSerializer != 'undefined' ?
	function() {
	  var r = (new XMLSerializer()).serializeToString(this.getNode());
	  if (typeof(r) == 'undefined')
	    r = (new XMLSerializer()).serializeToString(this.doc); // oldschool
	  return r
	} :
	function() {// IE
	  return this.getDoc().xml
	};


	// PRIVATE METHODS DOWN HERE

	/**
	 * Gets an attribute of the root element
	 * @private
	 */
	JSJaCPacket.prototype._getAttribute = function(attr) {
	  return this.getNode().getAttribute(attr);
	};

	/**
	 * Replaces this node with given node
	 * @private
	 */
	JSJaCPacket.prototype._replaceNode = function(aNode) {
	  // copy attribs
	  for (var i=0; i<aNode.attributes.length; i++)
	    if (aNode.attributes.item(i).nodeName != 'xmlns')
	      this.getNode().setAttribute(aNode.attributes.item(i).nodeName,
		                          aNode.attributes.item(i).nodeValue);

	  // copy children
	  for (var i=0; i<aNode.childNodes.length; i++)
	    if (this.getDoc().importNode)
	      this.getNode().appendChild(this.getDoc().importNode(aNode.
		                                                  childNodes.item(i),
		                                                  true));
	    else
	      this.getNode().appendChild(aNode.childNodes.item(i).cloneNode(true));
	};
	 
	/**
	 * Set node value of a child node
	 * @private
	 */
	JSJaCPacket.prototype._setChildNode = function(nodeName, nodeValue) {
	  var aNode = this.getChild(nodeName);
	  var tNode = this.getDoc().createTextNode(nodeValue);
	  if (aNode)
	    try {
	      aNode.replaceChild(tNode,aNode.firstChild);
	    } catch (e) { }
	  else {
	    try {
	      aNode = this.getDoc().createElementNS(this.getNode().namespaceURI,
		                                    nodeName);
	    } catch (ex) {
	      aNode = this.getDoc().createElement(nodeName)
	    }
	    this.getNode().appendChild(aNode);
	    aNode.appendChild(tNode);
	  }
	  return aNode;
	};

	/**
	 * Builds a node using {@link
	 * http://wiki.script.aculo.us/scriptaculous/show/Builder
	 * script.aculo.us' Dom Builder} notation.
	 * This code is taken from {@link
	 * http://wiki.script.aculo.us/scriptaculous/show/Builder
	 * script.aculo.us' Dom Builder} and has been modified to suit our
	 * needs.<br/>
	 * The original parts of the code do have the following copyright
	 * and license notice:<br/>
	 * Copyright (c) 2005, 2006 Thomas Fuchs (http://script.aculo.us,
	 * http://mir.acu lo.us) <br/>
	 * script.aculo.us is freely distributable under the terms of an
	 * MIT-style licen se.  // For details, see the script.aculo.us web
	 * site: http://script.aculo.us/<br>
	 * @author Thomas Fuchs
	 * @author Stefan Strigler
	 * @return The newly created node
	 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
	 */
	JSJaCPacket.prototype.buildNode = function(elementName) {
	  return JSJaCBuilder.buildNode(this.getDoc(),
		                        elementName,
		                        arguments[1],
		                        arguments[2]);
	};

	/**
	 * Appends node created by buildNode to this packets parent node.
	 * @param {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node} element The node to append or
	 * @param {String} element A name plus an object hash with attributes (optional) plus an array of childnodes (optional)
	 * @see #buildNode
	 * @return This packet
	 * @type JSJaCPacket
	 */
	JSJaCPacket.prototype.appendNode = function(element) {
	  if (typeof element=='object') { // seems to be a prebuilt node
	    return this.getNode().appendChild(element)
	  } else { // build node
	    return this.getNode().appendChild(this.buildNode(element,
		                                             arguments[1],
		                                             arguments[2],
		                                             null,
		                                             this.getNode().namespaceURI));
	  }
	};


	/**
	 * A jabber/XMPP presence packet
	 * @class Models the XMPP notion of a 'presence' packet
	 * @extends JSJaCPacket
	 */
	function JSJaCPresence() {
	  /**
	   * @ignore
	   */
	  this.base = JSJaCPacket;
	  this.base('presence');
	}
	JSJaCPresence.prototype = new JSJaCPacket;

	/**
	 * Sets the status message for current status. Usually this is set
	 * to some human readable string indicating what the user is
	 * doing/feel like currently.
	 * @param {String} status A status message
	 * @return this
	 * @type JSJaCPacket
	 */
	JSJaCPresence.prototype.setStatus = function(status) {
	  this._setChildNode("status", status);
	  return this;
	};
	/**
	 * Sets the online status for this presence packet.
	 * @param {String} show An XMPP complient status indicator. Must
	 * be one of 'chat', 'away', 'xa', 'dnd'
	 * @return this
	 * @type JSJaCPacket
	 */
	JSJaCPresence.prototype.setShow = function(show) {
	  if (show == 'chat' || show == 'away' || show == 'xa' || show == 'dnd')
	    this._setChildNode("show",show);
	  return this;
	};
	/**
	 * Sets the priority of the resource bind to with this connection
	 * @param {int} prio The priority to set this resource to
	 * @return this
	 * @type JSJaCPacket
	 */
	JSJaCPresence.prototype.setPriority = function(prio) {
	  this._setChildNode("priority", prio);
	  return this;
	};
	/**
	 * Some combined method that allowes for setting show, status and
	 * priority at once
	 * @param {String} show A status message
	 * @param {String} status A status indicator as defined by XMPP
	 * @param {int} prio A priority for this resource
	 * @return this
	 * @type JSJaCPacket
	 */
	JSJaCPresence.prototype.setPresence = function(show,status,prio) {
	  if (show)
	    this.setShow(show);
	  if (status)
	    this.setStatus(status);
	  if (prio)
	    this.setPriority(prio);
	  return this;
	};

	/**
	 * Gets the status message of this presence
	 * @return The (human readable) status message
	 * @type String
	 */
	JSJaCPresence.prototype.getStatus = function() {
	  return this.getChildVal('status');
	};
	/**
	 * Gets the status of this presence.
	 * Either one of 'chat', 'away', 'xa' or 'dnd' or null.
	 * @return The status indicator as defined by XMPP
	 * @type String
	 */
	JSJaCPresence.prototype.getShow = function() {
	  return this.getChildVal('show');
	};
	/**
	 * Gets the priority of this status message
	 * @return A resource priority
	 * @type int
	 */
	JSJaCPresence.prototype.getPriority = function() {
	  return this.getChildVal('priority');
	};


	/**
	 * A jabber/XMPP iq packet
	 * @class Models the XMPP notion of an 'iq' packet
	 * @extends JSJaCPacket
	 */
	function JSJaCIQ() {
	  /**
	   * @ignore
	   */
	  this.base = JSJaCPacket;
	  this.base('iq');
	}
	JSJaCIQ.prototype = new JSJaCPacket;

	/**
	 * Some combined method to set 'to', 'type' and 'id' at once
	 * @param {String} to the recepients JID
	 * @param {String} type A XMPP compliant iq type (one of 'set', 'get', 'result' and 'error'
	 * @param {String} id A packet ID
	 * @return this
	 * @type JSJaCIQ
	 */
	JSJaCIQ.prototype.setIQ = function(to,type,id) {
	  if (to)
	    this.setTo(to);
	  if (type)
	    this.setType(type);
	  if (id)
	    this.setID(id);
	  return this;
	};
	/**
	 * Creates a 'query' child node with given XMLNS
	 * @param {String} xmlns The namespace for the 'query' node
	 * @return The query node
	 * @type {@link  http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
	 */
	JSJaCIQ.prototype.setQuery = function(xmlns) {
	  var query;
	  try {
	    query = this.getDoc().createElementNS(xmlns,'query');
	  } catch (e) {
	    // fallback
	    query = this.getDoc().createElement('query');
	  }
	  if (query && query.getAttribute('xmlns') != xmlns) // fix opera 8.5x
	    query.setAttribute('xmlns',xmlns);
	  this.getNode().appendChild(query);
	  return query;
	};

	/**
	 * Gets the 'query' node of this packet
	 * @return The query node
	 * @type {@link  http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
	 */
	JSJaCIQ.prototype.getQuery = function() {
	  return this.getNode().getElementsByTagName('query').item(0);
	};
	/**
	 * Gets the XMLNS of the query node contained within this packet
	 * @return The namespace of the query node
	 * @type String
	 */
	JSJaCIQ.prototype.getQueryXMLNS = function() {
	  if (this.getQuery())
	    return this.getQuery().namespaceURI;
	  else
	    return null;
	};

	/**
	 * Creates an IQ reply with type set to 'result'. If given appends payload to first child if IQ. Payload maybe XML as string or a DOM element (or an array of such elements as well).
	 * @param {Element} payload A payload to be appended [optional]
	 * @return An IQ reply packet
	 * @type JSJaCIQ
	 */
	JSJaCIQ.prototype.reply = function(payload) {
	  var rIQ = this.clone();
	  rIQ.setTo(this.getFrom());
	  rIQ.setType('result');
	  if (payload) {
	    if (typeof payload == 'string')
	      rIQ.getChild().appendChild(rIQ.getDoc().loadXML(payload));
	    else if (payload.constructor == Array) {
	      var node = rIQ.getChild();
	      for (var i=0; i<payload.length; i++)
		if(typeof payload[i] == 'string')
		  node.appendChild(rIQ.getDoc().loadXML(payload[i]));
		else if (typeof payload[i] == 'object')
		  node.appendChild(payload[i]);
	    }
	    else if (typeof payload == 'object')
	      rIQ.getChild().appendChild(payload);
	  }
	  return rIQ;
	};

	/**
	 * A jabber/XMPP message packet
	 * @class Models the XMPP notion of an 'message' packet
	 * @extends JSJaCPacket
	 */
	function JSJaCMessage() {
	  /**
	   * @ignore
	   */
	  this.base = JSJaCPacket;
	  this.base('message');
	}
	JSJaCMessage.prototype = new JSJaCPacket;

	/**
	 * Sets the body of the message
	 * @param {String} body Your message to be sent along
	 * @return this message
	 * @type JSJaCMessage
	 */
	JSJaCMessage.prototype.setBody = function(body) {
	  this._setChildNode("body",body);
	  return this;
	};
	/**
	 * Sets the subject of the message
	 * @param {String} subject Your subject to be sent along
	 * @return this message
	 * @type JSJaCMessage
	 */
	JSJaCMessage.prototype.setSubject = function(subject) {
	  this._setChildNode("subject",subject);
	  return this;
	};
	/**
	 * Sets the 'tread' attribute for this message. This is used to identify
	 * threads in chat conversations
	 * @param {String} thread Usually a somewhat random hash.
	 * @return this message
	 * @type JSJaCMessage
	 */
	JSJaCMessage.prototype.setThread = function(thread) {
	  this._setChildNode("thread", thread);
	  return this;
	};
	/**
	 * Gets the 'thread' identifier for this message
	 * @return A thread identifier
	 * @type String
	 */
	JSJaCMessage.prototype.getThread = function() {
	  return this.getChildVal('thread');
	};
	/**
	 * Gets the body of this message
	 * @return The body of this message
	 * @type String
	 */
	JSJaCMessage.prototype.getBody = function() {
	  return this.getChildVal('body');
	};
	/**
	 * Gets the subject of this message
	 * @return The subject of this message
	 * @type String
	 */
	JSJaCMessage.prototype.getSubject = function() {
	  return this.getChildVal('subject')
	};


	/**
	 * Tries to transform a w3c DOM node to JSJaC's internal representation
	 * (JSJaCPacket type, one of JSJaCPresence, JSJaCMessage, JSJaCIQ)
	 * @param: {Node
	 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247}
	 * node The node to be transformed
	 * @return A JSJaCPacket representing the given node. If node's root
	 * elemenent is not one of 'message', 'presence' or 'iq',
	 * <code>null</code> is being returned.
	 * @type JSJaCPacket
	 */
	JSJaCPacket.wrapNode = function(node) {
	  var aNode;
	  switch (node.nodeName.toLowerCase()) {
	  case 'presence':
	    aNode = new JSJaCPresence();
	    break;
	  case 'message':
	    aNode = new JSJaCMessage();
	    break;
	  case 'iq':
	    aNode = new JSJaCIQ();
	    break;
	  default : // unknown
	    return null;
	  }

	  aNode._replaceNode(node);

	  return aNode;
	};


	/**
	 * an error packet for internal use
	 * @private
	 * @constructor
	 */
	function JSJaCError(code,type,condition) {
	  var xmldoc = XmlDocument.create("error","jsjac");

	  xmldoc.documentElement.setAttribute('code',code);
	  xmldoc.documentElement.setAttribute('type',type);
	  xmldoc.documentElement.appendChild(xmldoc.createElement(condition)).
	    setAttribute('xmlns','urn:ietf:params:xml:ns:xmpp-stanzas');
	  return xmldoc.documentElement;
	}


	/**
	 * Creates a new set of hash keys
	 * @class Reflects a set of sha1/md5 hash keys for securing sessions
	 * @constructor
	 * @param {Function} func The hash function to be used for creating the keys
	 * @param {Debugger} oDbg Reference to debugger implementation [optional]
	 */									 
	function JSJaCKeys(func,oDbg) {
	  var seed = Math.random();

	  /**
	   * @private
	   */
	  this._k = new Array();
	  this._k[0] = seed.toString();
	  if (oDbg)
	    /**
	     * Reference to Debugger
	     * @type Debugger
	     */
	    this.oDbg = oDbg;
	  else {
	    this.oDbg = {};
	    this.oDbg.log = function() {};
	  }

	  if (func) {
	    for (var i=1; i<JSJAC_NKEYS; i++) {
	      this._k[i] = func(this._k[i-1]);
	      oDbg.log(i+": "+this._k[i],4);
	    }
	  }

	  /**
	   * @private
	   */
	  this._indexAt = JSJAC_NKEYS-1;
	  /**
	   * Gets next key from stack
	   * @return New hash key
	   * @type String
	   */
	  this.getKey = function() {
	    return this._k[this._indexAt--];
	  };
	  /**
	   * Indicates whether there's only one key left
	   * @return <code>true</code> if there's only one key left, false otherwise
	   * @type boolean
	   */
	  this.lastKey = function() { return (this._indexAt == 0); };
	  /**
	   * Returns number of overall/initial stack size
	   * @return Number of keys created
	   * @type int
	   */
	  this.size = function() { return this._k.length; };

	  /**
	   * @private
	   */
	  this._getSuspendVars = function() {
	    return ('_k,_indexAt').split(',');
	  }
	}

	/**
	 * @fileoverview Contains all things in common for all subtypes of connections
	 * supported.
	 * @author Stefan Strigler steve@zeank.in-berlin.de
	 * @version $Revision: 476 $
	 */

	/**
	 * Creates a new Jabber connection (a connection to a jabber server)
	 * @class Somewhat abstract base class for jabber connections. Contains all
	 * of the code in common for all jabber connections
	 * @constructor
	 * @param {JSON http://www.json.org/index} oArg JSON with properties: <br>
	 * * <code>httpbase</code> the http base address of the service to be used for
	 * connecting to jabber<br>
	 * * <code>oDbg</code> (optional) a reference to a debugger interface
	 */
	function JSJaCConnection(oArg) {

	  if (oArg && oArg.oDbg && oArg.oDbg.log)
	    /**
	     * Reference to debugger interface
	     *(needs to implement method <code>log</code>)
	     * @type Debugger
	     */
	    this.oDbg = oArg.oDbg;
	  else {
	    this.oDbg = new Object(); // always initialise a debugger
	    this.oDbg.log = function() { };
	  }

	  if (oArg && oArg.httpbase)
	    /**
	     * @private
	     */
	    this._httpbase = oArg.httpbase;
	 
	  if (oArg && oArg.allow_plain)
	    /**
	     * @private
	     */
	    this.allow_plain = oArg.allow_plain;
	  else
	    this.allow_plain = JSJAC_ALLOW_PLAIN;

	  /**
	   * @private
	   */
	  this._connected = false;
	  /**
	   * @private
	   */
	  this._events = new Array();
	  /**
	   * @private
	   */
	  this._keys = null;
	  /**
	   * @private
	   */
	  this._ID = 0;
	  /**
	   * @private
	   */
	  this._inQ = new Array();
	  /**
	   * @private
	   */
	  this._pQueue = new Array();
	  /**
	   * @private
	   */
	  this._regIDs = new Array();
	  /**
	   * @private
	   */
	  this._req = new Array();
	  /**
	   * @private
	   */
	  this._status = 'intialized';
	  /**
	   * @private
	   */
	  this._errcnt = 0;
	  /**
	   * @private
	   */
	  this._inactivity = JSJAC_INACTIVITY;
	  /**
	   * @private
	   */
	  this._sendRawCallbacks = new Array();

	  if (oArg && oArg.timerval)
	    this.setPollInterval(oArg.timerval);
	}

	JSJaCConnection.prototype.connect = function(oArg) {
	  this._setStatus('connecting');

	  this.domain = oArg.domain || 'localhost';
	  this.username = oArg.username;
	  this.resource = oArg.resource;
	  this.pass = oArg.pass;
	  this.register = oArg.register;

	  this.authhost = oArg.authhost || this.domain;
	  this.authtype = oArg.authtype || 'sasl';

	  if (oArg.xmllang && oArg.xmllang != '')
	    this._xmllang = oArg.xmllang;

	  this.host = oArg.host || this.domain;
	  this.port = oArg.port || 5222;
	  if (oArg.secure)
	    this.secure = 'true';
	  else
	    this.secure = 'false';

	  if (oArg.wait)
	    this._wait = oArg.wait;

	  this.jid = this.username + '@' + this.domain;
	  this.fulljid = this.jid + '/' + this.resource;

	  this._rid  = Math.round( 100000.5 + ( ( (900000.49999) - (100000.5) ) * Math.random() ) );

	  // setupRequest must be done after rid is created but before first use in reqstr
	  var slot = this._getFreeSlot();
	  this._req[slot] = this._setupRequest(true);

	  var reqstr = this._getInitialRequestString();

	  this.oDbg.log(reqstr,4);

	  this._req[slot].r.onreadystatechange = 
	  JSJaC.bind(function() {
		       if (this._req[slot].r.readyState == 4) {
		         this.oDbg.log("async recv: "+this._req[slot].r.responseText,4);
		         this._handleInitialResponse(slot); // handle response
		       }
		     }, this);
	  
	  if (typeof(this._req[slot].r.onerror) != 'undefined') {
	    this._req[slot].r.onerror = 
	      JSJaC.bind(function(e) {
		           this.oDbg.log('XmlHttpRequest error',1);
		           return false;
		         }, this);
	  }

	  this._req[slot].r.send(reqstr);
	};

	/**
	 * Tells whether this connection is connected
	 * @return <code>true</code> if this connections is connected,
	 * <code>false</code> otherwise
	 * @type boolean
	 */
	JSJaCConnection.prototype.connected = function() { return this._connected; };

	/**
	 * Disconnects from jabber server and terminates session (if applicable)
	 */
	JSJaCConnection.prototype.disconnect = function() {
	  this._setStatus('disconnecting');

	  if (!this.connected())
	    return;
	  this._connected = false;

	  clearInterval(this._interval);
	  clearInterval(this._inQto);

	  if (this._timeout)
	    clearTimeout(this._timeout); // remove timer

	  var slot = this._getFreeSlot();
	  // Intentionally synchronous
	  this._req[slot] = this._setupRequest(false);

	  request = this._getRequestString(false, true);

	  this.oDbg.log("Disconnecting: " + request,4);
	  this._req[slot].r.send(request);

	  try {
	    JSJaCCookie.read('JSJaC_State').erase();
	  } catch (e) {}

	  this.oDbg.log("Disconnected: "+this._req[slot].r.responseText,2);
	  this._handleEvent('ondisconnect');
	};

	/**
	 * Gets current value of polling interval
	 * @return Polling interval in milliseconds
	 * @type int
	 */
	JSJaCConnection.prototype.getPollInterval = function() {
	  return this._timerval;
	};

	/**
	 * Registers an event handler (callback) for this connection.

	 * <p>Note: All of the packet handlers for specific packets (like
	 * message_in, presence_in and iq_in) fire only if there's no
	 * callback associated with the id.<br>

	 * <p>Example:<br/>
	 * <code>con.registerHandler('iq', 'query', 'jabber:iq:version', handleIqVersion);</code>


	 * @param {String} event One of

	 * <ul>
	 * <li>onConnect - connection has been established and authenticated</li>
	 * <li>onDisconnect - connection has been disconnected</li>
	 * <li>onResume - connection has been resumed</li>

	 * <li>onStatusChanged - connection status has changed, current
	 * status as being passed argument to handler. See {@link #status}.</li>

	 * <li>onError - an error has occured, error node is supplied as
	 * argument, like this:<br><code>&lt;error code='404' type='cancel'&gt;<br>
	 * &lt;item-not-found xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/&gt;<br>
	 * &lt;/error&gt;</code></li>

	 * <li>packet_in - a packet has been received (argument: the
	 * packet)</li>

	 * <li>packet_out - a packet is to be sent(argument: the
	 * packet)</li>

	 * <li>message_in | message - a message has been received (argument:
	 * the packet)</li>

	 * <li>message_out - a message packet is to be sent (argument: the
	 * packet)</li>

	 * <li>presence_in | presence - a presence has been received
	 * (argument: the packet)</li>

	 * <li>presence_out - a presence packet is to be sent (argument: the
	 * packet)</li>

	 * <li>iq_in | iq - an iq has been received (argument: the packet)</li>
	 * <li>iq_out - an iq is to be sent (argument: the packet)</li>
	 * </ul>

	 * @param {String} childName A childnode's name that must occur within a
	 * retrieved packet [optional]

	 * @param {String} childNS A childnode's namespace that must occure within
	 * a retrieved packet (works only if childName is given) [optional]

	 * @param {String} type The type of the packet to handle (works only if childName and chidNS are given (both may be set to '*' in order to get skipped) [optional]

	 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
	 */
	JSJaCConnection.prototype.registerHandler = function(event) {
	  event = event.toLowerCase(); // don't be case-sensitive here
	  var eArg = {handler: arguments[arguments.length-1],
		      childName: '*',
		      childNS: '*',
		      type: '*'};
	  if (arguments.length > 2)
	    eArg.childName = arguments[1];
	  if (arguments.length > 3)
	    eArg.childNS = arguments[2];
	  if (arguments.length > 4)
	    eArg.type = arguments[3];
	  if (!this._events[event])
	    this._events[event] = new Array(eArg);
	  else
	    this._events[event] = this._events[event].concat(eArg);

	  // sort events in order how specific they match criterias thus using
	  // wildcard patterns puts them back in queue when it comes to
	  // bubbling the event
	  this._events[event] =
	  this._events[event].sort(function(a,b) {
	    var aRank = 0;
	    var bRank = 0;
	    with (a) {
	      if (type == '*')
		aRank++;
	      if (childNS == '*')
		aRank++;
	      if (childName == '*')
		aRank++;
	    }
	    with (b) {
	      if (type == '*')
		bRank++;
	      if (childNS == '*')
		bRank++;
	      if (childName == '*')
		bRank++;
	    }
	    if (aRank > bRank)
	      return 1;
	    if (aRank < bRank)
	      return -1;
	    return 0;
	  });
	  this.oDbg.log("registered handler for event '"+event+"'",2);
	};

	JSJaCConnection.prototype.unregisterHandler = function(event,handler) {
	  event = event.toLowerCase(); // don't be case-sensitive here

	  if (!this._events[event])
	    return;

	  var arr = this._events[event], res = new Array();
	  for (var i=0; i<arr.length; i++)
	    if (arr[i].handler != handler)
	      res.push(arr[i]);

	  if (arr.length != res.length) {
	    this._events[event] = res;
	    this.oDbg.log("unregistered handler for event '"+event+"'",2);
	  }
	};

	/**
	 * Register for iq packets of type 'get'.
	 * @param {String} childName A childnode's name that must occur within a
	 * retrieved packet

	 * @param {String} childNS A childnode's namespace that must occure within
	 * a retrieved packet (works only if childName is given)

	 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
	 */
	JSJaCConnection.prototype.registerIQGet =
	  function(childName, childNS, handler) {
	  this.registerHandler('iq', childName, childNS, 'get', handler);
	};

	/**
	 * Register for iq packets of type 'set'.
	 * @param {String} childName A childnode's name that must occur within a
	 * retrieved packet

	 * @param {String} childNS A childnode's namespace that must occure within
	 * a retrieved packet (works only if childName is given)

	 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
	 */
	JSJaCConnection.prototype.registerIQSet =
	  function(childName, childNS, handler) {
	  this.registerHandler('iq', childName, childNS, 'set', handler);
	};

	/**
	 * Resumes this connection from saved state (cookie)
	 * @return Whether resume was successful
	 * @type boolean
	 */
	JSJaCConnection.prototype.resume = function() {
	  try {
	    this._setStatus('resuming');
	    var s = unescape(JSJaCCookie.read('JSJaC_State').getValue());
	     
	    this.oDbg.log('read cookie: '+s,2);

	    var o = JSJaCJSON.parse(s);
	     
	    for (var i in o)
	      if (o.hasOwnProperty(i))
		this[i] = o[i];
	     
	    // copy keys - not being very generic here :-/
	    if (this._keys) {
	      this._keys2 = new JSJaCKeys();
	      var u = this._keys2._getSuspendVars();
	      for (var i=0; i<u.length; i++)
		this._keys2[u[i]] = this._keys[u[i]];
	      this._keys = this._keys2;
	    }

	    try {
	      JSJaCCookie.read('JSJaC_State').erase();
	    } catch (e) {}

	    if (this._connected) {
	      // don't poll too fast!
	      this._handleEvent('onresume');
	      setTimeout(JSJaC.bind(this._resume, this),this.getPollInterval());
	      this._interval = setInterval(JSJaC.bind(this._checkQueue, this),
					   JSJAC_CHECKQUEUEINTERVAL);
	      this._inQto = setInterval(JSJaC.bind(this._checkInQ, this),
					JSJAC_CHECKINQUEUEINTERVAL);
	    }

	    return (this._connected === true);
	  } catch (e) {
	    if (e.message)
	      this.oDbg.log("Resume failed: "+e.message, 1);
	    else
	      this.oDbg.log("Resume failed: "+e, 1);
	    return false;
	  }
	};

	/**
	 * Sends a JSJaCPacket
	 * @param {JSJaCPacket} packet  The packet to send
	 * @param {Function}    cb      The callback to be called if there's a reply
	 * to this packet (identified by id) [optional]
	 * @param {Object}      arg     Arguments passed to the callback
	 * (additionally to the packet received) [optional]
	 * @return 'true' if sending was successfull, 'false' otherwise
	 * @type boolean
	 */
	JSJaCConnection.prototype.send = function(packet,cb,arg) {
	  if (!packet || !packet.pType) {
	    this.oDbg.log("no packet: "+packet, 1);
	    return false;
	  }

	  if (!this.connected())
	    return false;

	  // remember id for response if callback present
	  if (cb) {
	    if (!packet.getID())
	      packet.setID('JSJaCID_'+this._ID++); // generate an ID

	    // register callback with id
	    this._registerPID(packet.getID(),cb,arg);
	  }

	  try {
	    this._handleEvent(packet.pType()+'_out', packet);
	    this._handleEvent("packet_out", packet);
	    this._pQueue = this._pQueue.concat(packet.xml());
	  } catch (e) {
	    this.oDbg.log(e.toString(),1);
	    return false;
	  }

	  return true;
	};

	/**
	 * Sends an IQ packet. Has default handlers for each reply type.
	 * Those maybe overriden by passing an appropriate handler.
	 * @param {JSJaCIQPacket} iq - the iq packet to send
	 * @param {Object} handlers - object with properties 'error_handler',
	 *                            'result_handler' and 'default_handler'
	 *                            with appropriate functions
	 * @param {Object} arg - argument to handlers
	 * @return 'true' if sending was successfull, 'false' otherwise
	 * @type boolean
	 */
	JSJaCConnection.prototype.sendIQ = function(iq, handlers, arg) {
	  if (!iq || iq.pType() != 'iq') {
	    return false;
	  }

	  handlers = handlers || {};
	  var error_handler = handlers.error_handler || function(aIq) {
	    this.oDbg.log(iq.xml(), 1);
	  };
	 
	  var result_handler = handlers.result_handler ||  function(aIq) {
	    this.oDbg.log(aIq.xml(), 2);
	  };
	  // unsure, what's the use of this?
	  var default_handler = handlers.default_handler || function(aIq) {
	    this.oDbg.log(aIq.xml(), 2);
	  };

	  var iqHandler = function(aIq, arg) {
	    switch (aIq.getType()) {
	      case 'error':
	      error_handler(aIq);
	      break;
	      case 'result':
	      result_handler(aIq, arg);
	      break;
	      default: // may it be?
	      default_handler(aIq, arg);
	    }
	  };
	  return this.send(iq, iqHandler, arg);
	};

	/**
	 * Sets polling interval for this connection
	 * @param {int} millisecs Milliseconds to set timer to
	 * @return effective interval this connection has been set to
	 * @type int
	 */
	JSJaCConnection.prototype.setPollInterval = function(timerval) {
	  if (timerval && !isNaN(timerval))
	    this._timerval = timerval;
	  return this._timerval;
	};

	/**
	 * Returns current status of this connection
	 * @return String to denote current state. One of
	 * <ul>
	 * <li>'initializing' ... well
	 * <li>'connecting' if connect() was called
	 * <li>'resuming' if resume() was called
	 * <li>'processing' if it's about to operate as normal
	 * <li>'onerror_fallback' if there was an error with the request object
	 * <li>'protoerror_fallback' if there was an error at the http binding protocol flow (most likely that's where you interested in)
	 * <li>'internal_server_error' in case of an internal server error
	 * <li>'suspending' if suspend() is being called
	 * <li>'aborted' if abort() was called
	 * <li>'disconnecting' if disconnect() has been called
	 * </ul>
	 * @type String
	 */
	JSJaCConnection.prototype.status = function() { return this._status; };

	/**
	 * Suspsends this connection (saving state for later resume)
	 */
	JSJaCConnection.prototype.suspend = function() {
	
	    // remove timers
	    clearTimeout(this._timeout);
	    clearInterval(this._interval);
	    clearInterval(this._inQto);

	    this._suspend();

	    var u = ('_connected,_keys,_ID,_inQ,_pQueue,_regIDs,_errcnt,_inactivity,domain,username,resource,jid,fulljid,_sid,_httpbase,_timerval,_is_polling').split(',');
	    u = u.concat(this._getSuspendVars());
	    var s = new Object();

	    for (var i=0; i<u.length; i++) {
	      if (!this[u[i]]) continue; // hu? skip these!
	      if (this[u[i]]._getSuspendVars) {
		var uo = this[u[i]]._getSuspendVars();
		var o = new Object();
		for (var j=0; j<uo.length; j++)
		  o[uo[j]] = this[u[i]][uo[j]];
	      } else
		var o = this[u[i]];

	      s[u[i]] = o;
	    }
	    var c = new JSJaCCookie('JSJaC_State', escape(JSJaCJSON.toString(s)),
		                    this._inactivity);
	    this.oDbg.log("writing cookie: "+unescape(c.value)+"\n(length:"+
		          unescape(c.value).length+")",2);
	    c.write();

	    try {
	      var c2 = JSJaCCookie.read('JSJaC_State');
	      if (c.value != c2.value) {
		this.oDbg.log("Suspend failed writing cookie.\nRead: "+
		              unescape(JSJaCCookie.read('JSJaC_State')), 1);
		c.erase();
	      }

	      this._connected = false;

	      this._setStatus('suspending');
	    } catch (e) {
	      this.oDbg.log("Failed reading cookie 'JSJaC_State': "+e.message);
	    }

	  };

	/**
	 * @private
	 */
	JSJaCConnection.prototype._abort = function() {
	  clearTimeout(this._timeout); // remove timer

	  clearInterval(this._inQto);
	  clearInterval(this._interval);

	  this._connected = false;

	  this._setStatus('aborted');

	  this.oDbg.log("Disconnected.",1);
	  this._handleEvent('ondisconnect');
	  this._handleEvent('onerror',
		            JSJaCError('500','cancel','service-unavailable'));
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._checkInQ = function() {
	  for (var i=0; i<this._inQ.length && i<10; i++) {
	    var item = this._inQ[0];
	    this._inQ = this._inQ.slice(1,this._inQ.length);
	    var packet = JSJaCPacket.wrapNode(item);

	    if (!packet)
	      return;

	    this._handleEvent("packet_in", packet);

	    if (packet.pType && !this._handlePID(packet)) {
	      this._handleEvent(packet.pType()+'_in',packet);
	      this._handleEvent(packet.pType(),packet);
	    }
	  }
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._checkQueue = function() {
	  if (this._pQueue.length != 0)
	    this._process();
	  return true;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doAuth = function() {
	  if (this.has_sasl && this.authtype == 'nonsasl')
	    this.oDbg.log("Warning: SASL present but not used", 1);

	  if (!this._doSASLAuth() &&
	      !this._doLegacyAuth()) {
	    this.oDbg.log("Auth failed for authtype "+this.authtype,1);
	    this.disconnect();
	    return false;
	  }
	  return true;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doInBandReg = function() {
	  if (this.authtype == 'saslanon' || this.authtype == 'anonymous')
	    return; // bullshit - no need to register if anonymous

	  /* ***
	   * In-Band Registration see JEP-0077
	   */

	  var iq = new JSJaCIQ();
	  iq.setType('set');
	  iq.setID('reg1');
	  iq.appendNode("query", {xmlns: "jabber:iq:register"},
		        [["username", this.username],
		         ["password", this.pass]]);

	  this.send(iq,this._doInBandRegDone);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doInBandRegDone = function(iq) {
	  if (iq && iq.getType() == 'error') { // we failed to register
	    this.oDbg.log("registration failed for "+this.username,0);
	    this._handleEvent('onerror',iq.getChild('error'));
	    return;
	  }

	  this.oDbg.log(this.username + " registered succesfully",0);

	  this._doAuth();
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doLegacyAuth = function() {
	  if (this.authtype != 'nonsasl' && this.authtype != 'anonymous')
	    return false;

	  /* ***
	   * Non-SASL Authentication as described in JEP-0078
	   */
	  var iq = new JSJaCIQ();
	  iq.setIQ(this.server,'get','auth1');
	  iq.appendNode('query', {xmlns: 'jabber:iq:auth'},
		        [['username', this.username]]);

	  this.send(iq,this._doLegacyAuth2);
	  return true;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doLegacyAuth2 = function(iq) {
	  if (!iq || iq.getType() != 'result') {
	    if (iq && iq.getType() == 'error')
	      this._handleEvent('onerror',iq.getChild('error'));
	    this.disconnect();
	    return;
	  }

	  var use_digest = (iq.getChild('digest') != null);

	  /* ***
	   * Send authentication
	   */
	  var iq = new JSJaCIQ();
	  iq.setIQ(this.server,'set','auth2');

	  query = iq.appendNode('query', {xmlns: 'jabber:iq:auth'},
		                [['username', this.username],
		                 ['resource', this.resource]]);

	  if (use_digest) { // digest login
	    query.appendChild(iq.buildNode('digest', {xmlns: 'jabber:iq:auth'},
		                           hex_sha1(this.streamid + this.pass)));
	  } else if (this.allow_plain) { // use plaintext auth
	    query.appendChild(iq.buildNode('password', {xmlns: 'jabber:iq:auth'},
		                           this.pass));
	  } else {
	    this.oDbg.log("no valid login mechanism found",1);
	    this.disconnect();
	    return false;
	  }

	  this.send(iq,this._doLegacyAuthDone);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doLegacyAuthDone = function(iq) {
	  if (iq.getType() != 'result') { // auth' failed
	    if (iq.getType() == 'error')
	      this._handleEvent('onerror',iq.getChild('error'));
	    this.disconnect();
	  } else
	    this._handleEvent('onconnect');
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doSASLAuth = function() {
	  if (this.authtype == 'nonsasl' || this.authtype == 'anonymous')
	    return false;

	  if (this.authtype == 'saslanon') {
	    if (this.mechs['ANONYMOUS']) {
	      this.oDbg.log("SASL using mechanism 'ANONYMOUS'",2);
	      return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='ANONYMOUS'/>",
		                   this._doSASLAuthDone);
	    }
	    this.oDbg.log("SASL ANONYMOUS requested but not supported",1);
	  } else {
	    if (this.mechs['DIGEST-MD5']) {
	      this.oDbg.log("SASL using mechanism 'DIGEST-MD5'",2);
	      return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='DIGEST-MD5'/>",
		                   this._doSASLAuthDigestMd5S1);
	    } else if (this.allow_plain && this.mechs['PLAIN']) {
	      this.oDbg.log("SASL using mechanism 'PLAIN'",2);
	      var authStr = this.username+'@'+
	      this.domain+String.fromCharCode(0)+
	      this.username+String.fromCharCode(0)+
	      this.pass;
	      this.oDbg.log("authenticating with '"+authStr+"'",2);
	      authStr = btoa(authStr);
	      return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>"+authStr+"</auth>",
		                   this._doSASLAuthDone);
	    }
	    this.oDbg.log("No SASL mechanism applied",1);
	    this.authtype = 'nonsasl'; // fallback
	  }
	  return false;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doSASLAuthDigestMd5S1 = function(el) {
	  if (el.nodeName != "challenge") {
	    this.oDbg.log("challenge missing",1);
	    this._handleEvent('onerror',JSJaCError('401','auth','not-authorized'));
	    this.disconnect();
	  } else {
	    var challenge = atob(el.firstChild.nodeValue);
	    this.oDbg.log("got challenge: "+challenge,2);
	    this._nonce = challenge.substring(challenge.indexOf("nonce=")+7);
	    this._nonce = this._nonce.substring(0,this._nonce.indexOf("\""));
	    this.oDbg.log("nonce: "+this._nonce,2);
	    if (this._nonce == '' || this._nonce.indexOf('\"') != -1) {
	      this.oDbg.log("nonce not valid, aborting",1);
	      this.disconnect();
	      return;
	    }

	    this._digest_uri = "xmpp/";
	    //     if (typeof(this.host) != 'undefined' && this.host != '') {
	    //       this._digest-uri += this.host;
	    //       if (typeof(this.port) != 'undefined' && this.port)
	    //         this._digest-uri += ":" + this.port;
	    //       this._digest-uri += '/';
	    //     }
	    this._digest_uri += this.domain;

	    this._cnonce = cnonce(14);

	    this._nc = '00000001';

	    var A1 = str_md5(this.username+':'+this.domain+':'+this.pass)+
	    ':'+this._nonce+':'+this._cnonce;

	    var A2 = 'AUTHENTICATE:'+this._digest_uri;

	    var response = hex_md5(hex_md5(A1)+':'+this._nonce+':'+this._nc+':'+
		                   this._cnonce+':auth:'+hex_md5(A2));

	    var rPlain = 'username="'+this.username+'",realm="'+this.domain+
	    '",nonce="'+this._nonce+'",cnonce="'+this._cnonce+'",nc="'+this._nc+
	    '",qop=auth,digest-uri="'+this._digest_uri+'",response="'+response+
	    '",charset=utf-8';
	   
	    this.oDbg.log("response: "+rPlain,2);

	    this._sendRaw("<response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>"+
		          binb2b64(str2binb(rPlain))+"</response>",
		          this._doSASLAuthDigestMd5S2);
	  }
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doSASLAuthDigestMd5S2 = function(el) {
	  if (el.nodeName == 'failure') {
	    if (el.xml)
	      this.oDbg.log("auth error: "+el.xml,1);
	    else
	      this.oDbg.log("auth error",1);
	    this._handleEvent('onerror',JSJaCError('401','auth','not-authorized'));
	    this.disconnect();
	    return;
	  }

	  var response = atob(el.firstChild.nodeValue);
	  this.oDbg.log("response: "+response,2);

	  var rspauth = response.substring(response.indexOf("rspauth=")+8);
	  this.oDbg.log("rspauth: "+rspauth,2);

	  var A1 = str_md5(this.username+':'+this.domain+':'+this.pass)+
	  ':'+this._nonce+':'+this._cnonce;

	  var A2 = ':'+this._digest_uri;

	  var rsptest = hex_md5(hex_md5(A1)+':'+this._nonce+':'+this._nc+':'+
		                this._cnonce+':auth:'+hex_md5(A2));
	  this.oDbg.log("rsptest: "+rsptest,2);

	  if (rsptest != rspauth) {
	    this.oDbg.log("SASL Digest-MD5: server repsonse with wrong rspauth",1);
	    this.disconnect();
	    return;
	  }

	  if (el.nodeName == 'success')
	    this._reInitStream(this.domain, this._doStreamBind);
	  else // some extra turn
	    this._sendRaw("<response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'/>",
		          this._doSASLAuthDone);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doSASLAuthDone = function (el) {
	  if (el.nodeName != 'success') {
	    this.oDbg.log("auth failed",1);
	    this._handleEvent('onerror',JSJaCError('401','auth','not-authorized'));
	    this.disconnect();
	  } else
	    this._reInitStream(this.domain, this._doStreamBind);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doStreamBind = function() {
	  var iq = new JSJaCIQ();
	  iq.setIQ(this.domain,'set','bind_1');
	  iq.appendNode("bind", {xmlns: "urn:ietf:params:xml:ns:xmpp-bind"},
		        [["resource", this.resource]]);
	  this.oDbg.log(iq.xml());
	  this.send(iq,this._doXMPPSess);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doXMPPSess = function(iq) {
	  if (iq.getType() != 'result' || iq.getType() == 'error') { // failed
	    this.disconnect();
	    if (iq.getType() == 'error')
	      this._handleEvent('onerror',iq.getChild('error'));
	    return;
	  }
	 
	  this.fulljid = iq.getChildVal("jid");
	  this.jid = this.fulljid.substring(0,this.fulljid.lastIndexOf('/'));
	 
	  iq = new JSJaCIQ();
	  iq.setIQ(this.domain,'set','sess_1');
	  iq.appendNode("session", {xmlns: "urn:ietf:params:xml:ns:xmpp-session"},
		        []);
	  this.oDbg.log(iq.xml());
	  this.send(iq,this._doXMPPSessDone);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._doXMPPSessDone = function(iq) {
	  if (iq.getType() != 'result' || iq.getType() == 'error') { // failed
	    this.disconnect();
	    if (iq.getType() == 'error')
	      this._handleEvent('onerror',iq.getChild('error'));
	    return;
	  } else
	    this._handleEvent('onconnect');
	};
	 
	/**
	 * @private
	 */
	JSJaCConnection.prototype._handleEvent = function(event,arg) {
	  event = event.toLowerCase(); // don't be case-sensitive here
	  this.oDbg.log("incoming event '"+event+"'",3);
	  if (!this._events[event])
	    return;
	  this.oDbg.log("handling event '"+event+"'",2);
	  for (var i=0;i<this._events[event].length; i++) {
	    var aEvent = this._events[event][i];
	    if (aEvent.handler) {
	      try {
		if (arg) {
		  if (arg.pType) { // it's a packet
		    if ((!arg.getNode().hasChildNodes() && aEvent.childName != '*') ||
					(arg.getNode().hasChildNodes() &&
					 !arg.getChild(aEvent.childName, aEvent.childNS)))
		      continue;
		    if (aEvent.type != '*' &&
		        arg.getType() != aEvent.type)
		      continue;
		    this.oDbg.log(aEvent.childName+"/"+aEvent.childNS+"/"+aEvent.type+" => match for handler "+aEvent.handler,3);
		  }
		  if (aEvent.handler.call(this,arg)) // handled!
		    break;
		}
		else
		  if (aEvent.handler.call(this)) // handled!
		    break;
	      } catch (e) { this.oDbg.log(aEvent.handler+"\n>>>"+e.name+": "+ e.message,1); }
	    }
	  }
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._handlePID = function(aJSJaCPacket) {
	  if (!aJSJaCPacket.getID())
	    return false;
	  for (var i in this._regIDs) {
	    if (this._regIDs.hasOwnProperty(i) &&
		this._regIDs[i] && i == aJSJaCPacket.getID()) {
	      var pID = aJSJaCPacket.getID();
	      this.oDbg.log("handling "+pID,3);
	      try {
		if (this._regIDs[i].cb.call(this, aJSJaCPacket,this._regIDs[i].arg) === false) {
		  // don't unregister
		  return false;
		} else {
		  this._unregisterPID(pID);
		  return true;
		}
	      } catch (e) {
		// broken handler?
		this.oDbg.log(e.name+": "+ e.message);
		this._unregisterPID(pID);
		return true;
	      }
	    }
	  }
	  return false;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._handleResponse = function(req) {
	  var rootEl = this._parseResponse(req);

	  if (!rootEl)
	    return;

	  for (var i=0; i<rootEl.childNodes.length; i++) {
	    if (this._sendRawCallbacks.length) {
	      var cb = this._sendRawCallbacks[0];
	      this._sendRawCallbacks = this._sendRawCallbacks.slice(1, this._sendRawCallbacks.length);
	      cb.fn.call(this, rootEl.childNodes.item(i), cb.arg);
	      continue;
	    }
	    this._inQ = this._inQ.concat(rootEl.childNodes.item(i));
	  }
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._parseStreamFeatures = function(doc) {
	  if (!doc) {
	    this.oDbg.log("nothing to parse ... aborting",1);
	    return false;
	  }

	  var errorTag;
	  if (doc.getElementsByTagNameNS)
	    errorTag = doc.getElementsByTagNameNS("http://etherx.jabber.org/streams", "error").item(0);
	  else {
	    var errors = doc.getElementsByTagName("error");
	    for (var i=0; i<errors.length; i++)
	      if (errors.item(i).namespaceURI == "http://etherx.jabber.org/streams") {
		errorTag = errors.item(i);
		break;
	      }
	  }

	  if (errorTag) {
	    this._setStatus("internal_server_error");
	    clearTimeout(this._timeout); // remove timer
	    clearInterval(this._interval);
	    clearInterval(this._inQto);
	    this._handleEvent('onerror',JSJaCError('503','cancel','session-terminate'));
	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');
	    return false;
	  }

	  this.mechs = new Object();
	  var lMec1 = doc.getElementsByTagName("mechanisms");
	  this.has_sasl = false;
	  for (var i=0; i<lMec1.length; i++)
	    if (lMec1.item(i).getAttribute("xmlns") ==
		"urn:ietf:params:xml:ns:xmpp-sasl") {
	      this.has_sasl=true;
	      var lMec2 = lMec1.item(i).getElementsByTagName("mechanism");
	      for (var j=0; j<lMec2.length; j++)
		this.mechs[lMec2.item(j).firstChild.nodeValue] = true;
	      break;
	    }
	  if (this.has_sasl)
	    this.oDbg.log("SASL detected",2);
	  else {
	    this.authtype = 'nonsasl';
	    this.oDbg.log("No support for SASL detected",2);
	  }

	  /* [TODO]
	   * check if in-band registration available
	   * check for session and bind features
	   */

	  return true;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._process = function(timerval) {
	  if (!this.connected()) {
	    this.oDbg.log("Connection lost ...",1);
	    if (this._interval)
	      clearInterval(this._interval);
	    return;
	  }

	  this.setPollInterval(timerval);

	  if (this._timeout)
	    clearTimeout(this._timeout);

	  var slot = this._getFreeSlot();

	  if (slot < 0)
	    return;

	  if (typeof(this._req[slot]) != 'undefined' &&
	      typeof(this._req[slot].r) != 'undefined' &&
	      this._req[slot].r.readyState != 4) {
	    this.oDbg.log("Slot "+slot+" is not ready");
	    return;
	  }
	
	  if (!this.isPolling() && this._pQueue.length == 0 &&
	      this._req[(slot+1)%2] && this._req[(slot+1)%2].r.readyState != 4) {
	    this.oDbg.log("all slots busy, standby ...", 2);
	    return;
	  }

	  if (!this.isPolling())
	    this.oDbg.log("Found working slot at "+slot,2);

	  this._req[slot] = this._setupRequest(true);

	  /* setup onload handler for async send */
	  this._req[slot].r.onreadystatechange = 
	  JSJaC.bind(function() {
		       if (!this.connected())
		         return;
		       if (this._req[slot].r.readyState == 4) {
		         this._setStatus('processing');
		         this.oDbg.log("async recv: "+this._req[slot].r.responseText,4);
		         this._handleResponse(this._req[slot]);
		         // schedule next tick
		         if (this._pQueue.length) {
		           this._timeout = setTimeout(JSJaC.bind(this._process, this),100);
		         } else {
		           this.oDbg.log("scheduling next poll in "+this.getPollInterval()+
		                         " msec", 4);
		           this._timeout = setTimeout(JSJaC.bind(this._process, this),this.getPollInterval());
		         }
		       }
		     }, this);

	  try {
	    this._req[slot].r.onerror = 
	      JSJaC.bind(function() {
		           if (!this.connected())
		             return;
		           this._errcnt++;
		           this.oDbg.log('XmlHttpRequest error ('+this._errcnt+')',1);
		           if (this._errcnt > JSJAC_ERR_COUNT) {
		             // abort
		             this._abort();
		             return false;
		           }
		           
		           this._setStatus('onerror_fallback');
			
		           // schedule next tick
		           setTimeout(JSJaC.bind(this._resume, this),this.getPollInterval());
		           return false;
		         }, this);
	  } catch(e) { } // well ... no onerror property available, maybe we
	  // can catch the error somewhere else ...

	  var reqstr = this._getRequestString();

	  if (typeof(this._rid) != 'undefined') // remember request id if any
	    this._req[slot].rid = this._rid;

	  this.oDbg.log("sending: " + reqstr,4);
	  this._req[slot].r.send(reqstr);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._registerPID = function(pID,cb,arg) {
	  if (!pID || !cb)
	    return false;
	  this._regIDs[pID] = new Object();
	  this._regIDs[pID].cb = cb;
	  if (arg)
	    this._regIDs[pID].arg = arg;
	  this.oDbg.log("registered "+pID,3);
	  return true;
	};

	/**
	 * send empty request
	 * waiting for stream id to be able to proceed with authentication
	 * @private
	 */
	JSJaCConnection.prototype._sendEmpty = function JSJaCSendEmpty() {
	  var slot = this._getFreeSlot();
	  this._req[slot] = this._setupRequest(true);

	  this._req[slot].r.onreadystatechange = 
	  JSJaC.bind(function() {
		       if (this._req[slot].r.readyState == 4) {
		         this.oDbg.log("async recv: "+this._req[slot].r.responseText,4);
		         this._getStreamID(slot); // handle response
		       }
		     },this);

	  if (typeof(this._req[slot].r.onerror) != 'undefined') {
	    this._req[slot].r.onerror = 
	      JSJaC.bind(function(e) {
		           this.oDbg.log('XmlHttpRequest error',1);
		           return false;
		         }, this);
	  }

	  var reqstr = this._getRequestString();
	  this.oDbg.log("sending: " + reqstr,4);
	  this._req[slot].r.send(reqstr);
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._sendRaw = function(xml,cb,arg) {
	  if (cb)
	    this._sendRawCallbacks.push({fn: cb, arg: arg});
	 
	  this._pQueue.push(xml);
	  this._process();

	  return true;
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._setStatus = function(status) {
	  if (!status || status == '')
	    return;
	  if (status != this._status) { // status changed!
	    this._status = status;
	    this._handleEvent('onstatuschanged', status);
	    this._handleEvent('status_changed', status);
	  }
	};

	/**
	 * @private
	 */
	JSJaCConnection.prototype._unregisterPID = function(pID) {
	  if (!this._regIDs[pID])
	    return false;
	  this._regIDs[pID] = null;
	  this.oDbg.log("unregistered "+pID,3);
	  return true;
	};

	/**
	 * @fileoverview All stuff related to HTTP Polling
	 * @author Stefan Strigler steve@zeank.in-berlin.de
	 * @version $Revision: 452 $
	 */

	/**
	 * Instantiates an HTTP Polling session
	 * @class Implementation of {@link
	 * http://www.xmpp.org/extensions/xep-0025.html HTTP Polling}
	 * @extends JSJaCConnection
	 * @constructor
	 */
	function JSJaCHttpPollingConnection(oArg) {
	  /**
	   * @ignore
	   */
	  this.base = JSJaCConnection;
	  this.base(oArg);

	  // give hint to JSJaCPacket that we're using HTTP Polling ...
	  JSJACPACKET_USE_XMLNS = false;
	}
	JSJaCHttpPollingConnection.prototype = new JSJaCConnection();

	/**
	 * Tells whether this implementation of JSJaCConnection is polling
	 * Useful if it needs to be decided
	 * whether it makes sense to allow for adjusting or adjust the
	 * polling interval {@link JSJaCConnection#setPollInterval}
	 * @return <code>true</code> if this is a polling connection,
	 * <code>false</code> otherwise.
	 * @type boolean
	 */
	JSJaCHttpPollingConnection.prototype.isPolling = function() { return true; };

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._getFreeSlot = function() {
	  if (typeof(this._req[0]) == 'undefined' ||
	      typeof(this._req[0].r) == 'undefined' ||
	      this._req[0].r.readyState == 4)
	    return 0;
	  else
	    return -1;
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._getInitialRequestString = function() {
	  var reqstr = "0";
	  if (JSJAC_HAVEKEYS) {
	    this._keys = new JSJaCKeys(b64_sha1,this.oDbg); // generate first set of keys
	    key = this._keys.getKey();
	    reqstr += ";"+key;
	  }
	  var streamto = this.domain;
	  if (this.authhost)
	    streamto = this.authhost;

	  reqstr += ",<stream:stream to='"+streamto+"' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams'";
	  if (this.authtype == 'sasl' || this.authtype == 'saslanon')
	    reqstr += " version='1.0'";
	  reqstr += ">";
	  return reqstr;
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._getRequestString = function(raw, last) {
	  var reqstr = this._sid;
	  if (JSJAC_HAVEKEYS) {
	    reqstr += ";"+this._keys.getKey();
	    if (this._keys.lastKey()) {
	      this._keys = new JSJaCKeys(b64_sha1,this.oDbg);
	      reqstr += ';'+this._keys.getKey();
	    }
	  }
	  reqstr += ',';
	  if (raw)
	    reqstr += raw;
	  while (this._pQueue.length) {
	    reqstr += this._pQueue[0];
	    this._pQueue = this._pQueue.slice(1,this._pQueue.length);
	  }
	  if (last)
	    reqstr += '</stream:stream>';
	  return reqstr;
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._getStreamID = function() {
	  if (this._req[0].r.responseText == '') {
	    this.oDbg.log("waiting for stream id",2);
	    this._timeout = setTimeout(JSJaC.bind(this._sendEmpty, this),1000);
	    return;
	  }

	  this.oDbg.log(this._req[0].r.responseText,4);

	  // extract stream id used for non-SASL authentication
	  if (this._req[0].r.responseText.match(/id=[\'\"]([^\'\"]+)[\'\"]/))
	    this.streamid = RegExp.$1;
	  this.oDbg.log("got streamid: "+this.streamid,2);

	  var doc;

	  try {
	    var response = this._req[0].r.responseText;
	    if (!response.match(/<\/stream:stream>\s*$/))
	      response += '</stream:stream>';

	    doc = XmlDocument.create("doc");
	    doc.loadXML(response);
	    if (!this._parseStreamFeatures(doc))
	      return;
	  } catch(e) {
	    this.oDbg.log("loadXML: "+e.toString(),1);
	  }

	  this._connected = true;

	  if (this.register)
	    this._doInBandReg();
	  else
	    this._doAuth();

	  this._process(this._timerval); // start polling
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._getSuspendVars = function() {
	  return new Array();
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._handleInitialResponse = function() {
	  // extract session ID
	  this.oDbg.log(this._req[0].r.getAllResponseHeaders(),4);
	  var aPList = this._req[0].r.getResponseHeader('Set-Cookie');
	  aPList = aPList.split(";");
	  for (var i=0;i<aPList.length;i++) {
	    aArg = aPList[i].split("=");
	    if (aArg[0] == 'ID')
	      this._sid = aArg[1];
	  }
	  this.oDbg.log("got sid: "+this._sid,2);

	  /* start sending from queue for not polling connections */
	  this._connected = true;

	  this._interval= setInterval(JSJaC.bind(this._checkQueue, this),
		                      JSJAC_CHECKQUEUEINTERVAL);
	  this._inQto = setInterval(JSJaC.bind(this._checkInQ, this),
		                    JSJAC_CHECKINQUEUEINTERVAL);

	  /* wait for initial stream response to extract streamid needed
	   * for digest auth
	   */
	  this._getStreamID();
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._parseResponse = function(r) {
	  var req = r.r;
	  if (!this.connected())
	    return null;

	  /* handle error */
	  // proxy error (!)
	  if (req.status != 200) {
	    this.oDbg.log("invalid response ("+req.status+"):" + req.responseText+"\n"+req.getAllResponseHeaders(),1);

	    this._setStatus('internal_server_error');

	    clearTimeout(this._timeout); // remove timer
	    clearInterval(this._interval);
	    clearInterval(this._inQto);
	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');
	    this._handleEvent('onerror',JSJaCError('503','cancel','service-unavailable'));
	    return null;
	  }

	  this.oDbg.log(req.getAllResponseHeaders(),4);
	  var sid, aPList = req.getResponseHeader('Set-Cookie');

	  if (aPList == null)
	    sid = "-1:0"; // Generate internal server error
	  else {
	    aPList = aPList.split(";");
	    var sid;
	    for (var i=0;i<aPList.length;i++) {
	      var aArg = aPList[i].split("=");
	      if (aArg[0] == 'ID')
		sid = aArg[1];
	    }
	  }

	  // http polling component error
	  if (typeof(sid) != 'undefined' && sid.indexOf(':0') != -1) {
	    switch (sid.substring(0,sid.indexOf(':0'))) {
	    case '0':
	      this.oDbg.log("invalid response:" + req.responseText,1);
	      break;
	    case '-1':
	      this.oDbg.log("Internal Server Error",1);
	      break;
	    case '-2':
	      this.oDbg.log("Bad Request",1);
	      break;
	    case '-3':
	      this.oDbg.log("Key Sequence Error",1);
	      break;
	    }

	    this._setStatus('internal_server_error');

	    clearTimeout(this._timeout); // remove timer
	    clearInterval(this._interval);
	    clearInterval(this._inQto);
	    this._handleEvent('onerror',JSJaCError('500','wait','internal-server-error'));
	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');
	    return null;
	  }

	  if (!req.responseText || req.responseText == '')
	    return null;

	  try {
	    var response = req.responseText.replace(/\<\?xml.+\?\>/,"");
	    if (response.match(/<stream:stream/))
		response += "</stream:stream>";
	    var doc = JSJaCHttpPollingConnection._parseTree("<body>"+response+"</body>");

	    if (!doc || doc.tagName == 'parsererror') {
	      this.oDbg.log("parsererror",1);

	      doc = JSJaCHttpPollingConnection._parseTree("<stream:stream xmlns:stream='http://etherx.jabber.org/streams'>"+req.responseText);
	      if (doc && doc.tagName != 'parsererror') {
		this.oDbg.log("stream closed",1);

		if (doc.getElementsByTagName('conflict').length > 0)
		  this._setStatus("session-terminate-conflict");
			
		clearTimeout(this._timeout); // remove timer
		clearInterval(this._interval);
		clearInterval(this._inQto);
		this._handleEvent('onerror',JSJaCError('503','cancel','session-terminate'));
		this._connected = false;
		this.oDbg.log("Disconnected.",1);
		this._handleEvent('ondisconnect');
	      } else
		this.oDbg.log("parsererror:"+doc,1);
		
	      return doc;
	    }

	    return doc;
	  } catch (e) {
	    this.oDbg.log("parse error:"+e.message,1);
	  }
	  return null;;
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._reInitStream = function(to,cb,arg) {
	  this._sendRaw("<stream:stream xmlns:stream='http://etherx.jabber.org/streams' xmlns='jabber:client' to='"+to+"' version='1.0'>",cb,arg);
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._resume = function() {
	  this._process(this._timerval);
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._setupRequest = function(async) {
	  var r = XmlHttp.create();
	  try {
	    r.open("POST",this._httpbase,async);
	    if (r.overrideMimeType)
	      r.overrideMimeType('text/plain; charset=utf-8');
	    r.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	  } catch(e) { this.oDbg.log(e,1); }

	  var req = new Object();
	  req.r = r;
	  return req;
	};

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection.prototype._suspend = function() {};

	/*** [static] ***/

	/**
	 * @private
	 */
	JSJaCHttpPollingConnection._parseTree = function(s) {
	  try {
	    var r = XmlDocument.create("body","foo");
	    if (typeof(r.loadXML) != 'undefined') {
	      r.loadXML(s);
	      return r.documentElement;
	    } else if (window.DOMParser)
	      return (new DOMParser()).parseFromString(s, "text/xml").documentElement;
	  } catch (e) { }
	  return null;
	};

	/**
	 * @fileoverview All stuff related to HTTP Binding
	 * @author Stefan Strigler steve@zeank.in-berlin.de
	 * @version $Revision: 483 $
	 */

	/**
	 * Instantiates an HTTP Binding session
	 * @class Implementation of {@link
	 * http://www.xmpp.org/extensions/xep-0206.html XMPP Over BOSH}
	 * formerly known as HTTP Binding.
	 * @extends JSJaCConnection
	 * @constructor
	 */
	function JSJaCHttpBindingConnection(oArg) {
	  /**
	   * @ignore
	   */
	  this.base = JSJaCConnection;
	  this.base(oArg);

	  // member vars
	  /**
	   * @private
	   */
	  this._hold = JSJACHBC_MAX_HOLD;
	  /**
	   * @private
	   */
	  this._inactivity = 0;
	  /**
	   * @private
	   */
	  this._last_requests = new Object(); // 'hash' storing hold+1 last requests
	  /**
	   * @private
	   */
	  this._last_rid = 0;                 // I know what you did last summer
	  /**
	   * @private
	   */
	  this._min_polling = 0;

	  /**
	   * @private
	   */
	  this._pause = 0;
	  /**
	   * @private
	   */
	  this._wait = JSJACHBC_MAX_WAIT;
	}
	JSJaCHttpBindingConnection.prototype = new JSJaCConnection();

	/**
	 * Inherit an instantiated HTTP Binding session
	 */
	JSJaCHttpBindingConnection.prototype.inherit = function(oArg) {
	  this.domain = oArg.domain || 'localhost';
	  this.username = oArg.username;
	  this.resource = oArg.resource;
	  this._sid = oArg.sid;
	  this._rid = oArg.rid;
	  this._min_polling = oArg.polling;
	  this._inactivity = oArg.inactivity;
	  this._setHold(oArg.requests-1);
	  this.setPollInterval(this._timerval);
	  if (oArg.wait)
	    this._wait = oArg.wait; // for whatever reason

	  this._connected = true;

	  this._handleEvent('onconnect');

	  this._interval= setInterval(JSJaC.bind(this._checkQueue, this),
		                      JSJAC_CHECKQUEUEINTERVAL);
	  this._inQto = setInterval(JSJaC.bind(this._checkInQ, this),
		                    JSJAC_CHECKINQUEUEINTERVAL);
	  this._timeout = setTimeout(JSJaC.bind(this._process, this),
		                     this.getPollInterval());
	};

	/**
	 * Sets poll interval
	 * @param {int} timerval the interval in seconds
	 */
	JSJaCHttpBindingConnection.prototype.setPollInterval = function(timerval) {
	  if (timerval && !isNaN(timerval)) {
	    if (!this.isPolling())
	      this._timerval = 100;
	    else if (this._min_polling && timerval < this._min_polling*1000)
	      this._timerval = this._min_polling*1000;
	    else if (this._inactivity && timerval > this._inactivity*1000)
	      this._timerval = this._inactivity*1000;
	    else
	      this._timerval = timerval;
	  }
	  return this._timerval;
	};

	/**
	 * whether this session is in polling mode
	 * @type boolean
	 */
	JSJaCHttpBindingConnection.prototype.isPolling = function() { return (this._hold == 0) };

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getFreeSlot = function() {
	  for (var i=0; i<this._hold+1; i++)
	    if (typeof(this._req[i]) == 'undefined' || typeof(this._req[i].r) == 'undefined' || this._req[i].r.readyState == 4)
	      return i;
	  return -1; // nothing found
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getHold = function() { return this._hold; };

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getRequestString = function(raw, last) {
	  raw = raw || '';
	  var reqstr = '';

	  // check if we're repeating a request

	  if (this._rid <= this._last_rid && typeof(this._last_requests[this._rid]) != 'undefined') // repeat!
	    reqstr = this._last_requests[this._rid].xml;
	  else { // grab from queue
	    var xml = '';
	    while (this._pQueue.length) {
	      var curNode = this._pQueue[0];
	      xml += curNode;
	      this._pQueue = this._pQueue.slice(1,this._pQueue.length);
	    }

	    reqstr = "<body rid='"+this._rid+"' sid='"+this._sid+"' xmlns='http://jabber.org/protocol/httpbind' ";
	    if (JSJAC_HAVEKEYS) {
	      reqstr += "key='"+this._keys.getKey()+"' ";
	      if (this._keys.lastKey()) {
		this._keys = new JSJaCKeys(hex_sha1,this.oDbg);
		reqstr += "newkey='"+this._keys.getKey()+"' ";
	      }
	    }
	    if (last)
	      reqstr += "type='terminate'";
	    else if (this._reinit) {
	      if (JSJACHBC_USE_BOSH_VER) 
		reqstr += "xmpp:restart='true' xmlns:xmpp='urn:xmpp:xbosh'";
	      this._reinit = false;
	    }

	    if (xml != '' || raw != '') {
	      reqstr += ">" + raw + xml + "</body>";
	    } else {
	      reqstr += "/>";
	    }

	    this._last_requests[this._rid] = new Object();
	    this._last_requests[this._rid].xml = reqstr;
	    this._last_rid = this._rid;

	    for (var i in this._last_requests)
	      if (this._last_requests.hasOwnProperty(i) &&
		  i < this._rid-this._hold)
		delete(this._last_requests[i]); // truncate
	  }
	
	  return reqstr;
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getInitialRequestString = function() {
	  var reqstr = "<body content='text/xml; charset=utf-8' hold='"+this._hold+"' xmlns='http://jabber.org/protocol/httpbind' to='"+this.authhost+"' wait='"+this._wait+"' rid='"+this._rid+"'";
	  if (this.secure)
	    reqstr += " secure='"+this.secure+"'";
	  if (JSJAC_HAVEKEYS) {
	    this._keys = new JSJaCKeys(hex_sha1,this.oDbg); // generate first set of keys
	    key = this._keys.getKey();
	    reqstr += " newkey='"+key+"'";
	  }
	  if (this._xmllang)
	    reqstr += " xml:lang='"+this._xmllang + "'";

	  if (JSJACHBC_USE_BOSH_VER) {
	    reqstr += " ver='" + JSJACHBC_BOSH_VERSION + "'";
	    reqstr += " xmlns:xmpp='urn:xmpp:xbosh'";
	    if (this.authtype == 'sasl' || this.authtype == 'saslanon')
	      reqstr += " xmpp:version='1.0'";
	  }
	  reqstr += "/>";
	  return reqstr;
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getStreamID = function(slot) {

	  this.oDbg.log(this._req[slot].r.responseText,4);

	  if (!this._req[slot].r.responseXML || !this._req[slot].r.responseXML.documentElement) {
	    this._handleEvent('onerror',JSJaCError('503','cancel','service-unavailable'));
	    return;
	  }
	  var body = this._req[slot].r.responseXML.documentElement;

	  // extract stream id used for non-SASL authentication
	  if (body.getAttribute('authid')) {
	    this.streamid = body.getAttribute('authid');
	    this.oDbg.log("got streamid: "+this.streamid,2);
	  } else {
	    this._timeout = setTimeout(JSJaC.bind(this._sendEmpty, this),
		                       this.getPollInterval());
	    return;
	  }

	  this._timeout = setTimeout(JSJaC.bind(this._process, this),
		                     this.getPollInterval());

	  if (!this._parseStreamFeatures(body))
	    return;

	  if (this.register)
	    this._doInBandReg();
	  else
	    this._doAuth();
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._getSuspendVars = function() {
	  return ('host,port,secure,_rid,_last_rid,_wait,_min_polling,_inactivity,_hold,_last_requests,_pause').split(',');
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._handleInitialResponse = function(slot) {
	  try {
	    // This will throw an error on Mozilla when the connection was refused
	    this.oDbg.log(this._req[slot].r.getAllResponseHeaders(),4);
	    this.oDbg.log(this._req[slot].r.responseText,4);
	  } catch(ex) {
	    this.oDbg.log("No response",4);
	  }

	  if (this._req[slot].r.status != 200 || !this._req[slot].r.responseXML) {
	    this.oDbg.log("initial response broken (status: "+this._req[slot].r.status+")",1);
	    this._handleEvent('onerror',JSJaCError('503','cancel','service-unavailable'));
	    return;
	  }
	  var body = this._req[slot].r.responseXML.documentElement;

	  if (!body || body.tagName != 'body' || body.namespaceURI != 'http://jabber.org/protocol/httpbind') {
	    this.oDbg.log("no body element or incorrect body in initial response",1);
	    this._handleEvent("onerror",JSJaCError("500","wait","internal-service-error"));
	    return;
	  }

	  // Check for errors from the server
	  if (body.getAttribute("type") == "terminate") {
	    this.oDbg.log("invalid response:\n" + this._req[slot].r.responseText,1);
	    clearTimeout(this._timeout); // remove timer
	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');
	    this._handleEvent('onerror',JSJaCError('503','cancel','service-unavailable'));
	    return;
	  }

	  // get session ID
	  this._sid = body.getAttribute('sid');
	  this.oDbg.log("got sid: "+this._sid,2);

	  // get attributes from response body
	  if (body.getAttribute('polling'))
	    this._min_polling = body.getAttribute('polling');

	  if (body.getAttribute('inactivity'))
	    this._inactivity = body.getAttribute('inactivity');

	  if (body.getAttribute('requests'))
	    this._setHold(body.getAttribute('requests')-1);
	  this.oDbg.log("set hold to " + this._getHold(),2);

	  if (body.getAttribute('ver'))
	    this._bosh_version = body.getAttribute('ver');

	  if (body.getAttribute('maxpause'))
	    this._pause = Number.max(body.getAttribute('maxpause'), JSJACHBC_MAXPAUSE);

	  // must be done after response attributes have been collected
	  this.setPollInterval(this._timerval);

	  /* start sending from queue for not polling connections */
	  this._connected = true;

	  this._inQto = setInterval(JSJaC.bind(this._checkInQ, this),
		                    JSJAC_CHECKINQUEUEINTERVAL);
	  this._interval= setInterval(JSJaC.bind(this._checkQueue, this),
		                      JSJAC_CHECKQUEUEINTERVAL);

	  /* wait for initial stream response to extract streamid needed
	   * for digest auth
	   */
	  this._getStreamID(slot);
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._parseResponse = function(req) {
	  if (!this.connected() || !req)
	    return null;

	  var r = req.r; // the XmlHttpRequest

	  try {
	    if (r.status == 404 || r.status == 403) {
	      // connection manager killed session
	      this._abort();
	      return null;
	    }

	    if (r.status != 200 || !r.responseXML) {
	      this._errcnt++;
	      var errmsg = "invalid response ("+r.status+"):\n" + r.getAllResponseHeaders()+"\n"+r.responseText;
	      if (!r.responseXML)
		errmsg += "\nResponse failed to parse!";
	      this.oDbg.log(errmsg,1);
	      if (this._errcnt > JSJAC_ERR_COUNT) {
		// abort
		this._abort();
		return null;
	      }
	      this.oDbg.log("repeating ("+this._errcnt+")",1);
	     
	      this._setStatus('proto_error_fallback');
	     
	      // schedule next tick
	      setTimeout(JSJaC.bind(this._resume, this),
		         this.getPollInterval());
	     
	      return null;
	    }
	  } catch (e) {
	    this.oDbg.log("XMLHttpRequest error: status not available", 1);
		this._errcnt++;
		if (this._errcnt > JSJAC_ERR_COUNT) {
		  // abort
		  this._abort();
		} else {
		  this.oDbg.log("repeating ("+this._errcnt+")",1);
	     
		  this._setStatus('proto_error_fallback');
	     
		  // schedule next tick
		  setTimeout(JSJaC.bind(this._resume, this),
		             this.getPollInterval()); 
	    }
	    return null;
	  }

	  var body = r.responseXML.documentElement;
	  if (!body || body.tagName != 'body' ||
		  body.namespaceURI != 'http://jabber.org/protocol/httpbind') {
	    this.oDbg.log("invalid response:\n" + r.responseText,1);

	    clearTimeout(this._timeout); // remove timer
	    clearInterval(this._interval);
	    clearInterval(this._inQto);

	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');

	    this._setStatus('internal_server_error');
	    this._handleEvent('onerror',
						  JSJaCError('500','wait','internal-server-error'));

	    return null;
	  }

	  if (typeof(req.rid) != 'undefined' && this._last_requests[req.rid]) {
	    if (this._last_requests[req.rid].handled) {
	      this.oDbg.log("already handled "+req.rid,2);
	      return null;
	    } else
	      this._last_requests[req.rid].handled = true;
	  }


	  // Check for errors from the server
	  if (body.getAttribute("type") == "terminate") {
	    this.oDbg.log("session terminated:\n" + r.responseText,1);

	    clearTimeout(this._timeout); // remove timer
	    clearInterval(this._interval);
	    clearInterval(this._inQto);

	    if (body.getAttribute("condition") == "remote-stream-error")
	      if (body.getElementsByTagName("conflict").length > 0)
		this._setStatus("session-terminate-conflict");
	    this._handleEvent('onerror',JSJaCError('503','cancel',body.getAttribute('condition')));
	    this._connected = false;
	    this.oDbg.log("Disconnected.",1);
	    this._handleEvent('ondisconnect');
	    return null;
	  }

	  // no error
	  this._errcnt = 0;
	  return r.responseXML.documentElement;
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._reInitStream = function(to,cb,arg) {
	  /* [TODO] we can't handle 'to' here as this is not (yet) supported
	   * by the protocol
	   */

	  // tell http binding to reinit stream with/before next request
	  this._reinit = true;
	  cb.call(this,arg); // proceed with next callback

	  /* [TODO] make sure that we're checking for new stream features when
	   * 'cb' finishes
	   */
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._resume = function() {
	  /* make sure to repeat last request as we can be sure that
	   * it had failed (only if we're not using the 'pause' attribute
	   */
	  if (this._pause == 0 && this._rid >= this._last_rid)
	    this._rid = this._last_rid-1;

	  this._process();
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._setHold = function(hold)  {
	  if (!hold || isNaN(hold) || hold < 0)
	    hold = 0;
	  else if (hold > JSJACHBC_MAX_HOLD)
	    hold = JSJACHBC_MAX_HOLD;
	  this._hold = hold;
	  return this._hold;
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._setupRequest = function(async) {
	  var req = new Object();
	  var r = XmlHttp.create();
	  try {
	    r.open("POST",this._httpbase,async);
	    r.setRequestHeader('Content-Type','text/xml; charset=utf-8');
	  } catch(e) { this.oDbg.log(e,1); }
	  req.r = r;
	  this._rid++;
	  req.rid = this._rid;
	  return req;
	};

	/**
	 * @private
	 */
	JSJaCHttpBindingConnection.prototype._suspend = function() {
	  if (this._pause == 0)
	    return; // got nothing to do

	  var slot = this._getFreeSlot();
	  // Intentionally synchronous
	  this._req[slot] = this._setupRequest(false);

	  var reqstr = "<body pause='"+this._pause+"' xmlns='http://jabber.org/protocol/httpbind' sid='"+this._sid+"' rid='"+this._rid+"'";
	  if (JSJAC_HAVEKEYS) {
	    reqstr += " key='"+this._keys.getKey()+"'";
	    if (this._keys.lastKey()) {
	      this._keys = new JSJaCKeys(hex_sha1,this.oDbg);
	      reqstr += " newkey='"+this._keys.getKey()+"'";
	    }

	  }
	  reqstr += ">";

	  while (this._pQueue.length) {
	    var curNode = this._pQueue[0];
	    reqstr += curNode;
	    this._pQueue = this._pQueue.slice(1,this._pQueue.length);
	  }

	  //reqstr += "<presence type='unavailable' xmlns='jabber:client'/>";
	  reqstr += "</body>";

	  this.oDbg.log("Disconnecting: " + reqstr,4);
	  this._req[slot].r.send(reqstr);
	};

	/**
	 * @fileoverview Contains Debugger interface for Firebug and Safari
	 * @class Implementation of the Debugger interface for {@link
	 * http://www.getfirebug.com/ Firebug} and Safari
	 * Creates a new debug logger to be passed to jsjac's connection
	 * constructor. Of course you can use it for debugging in your code
	 * too.
	 * @constructor
	 * @param {int} level The maximum level for debugging messages to be
	 * displayed. Thus you can tweak the verbosity of the logger. A value
	 * of 0 means very low traffic whilst a value of 4 makes logging very
	 * verbose about what's going on.
	 */
	function JSJaCConsoleLogger(level) {
	  /**
	   * @private
	   */
	  this.level = level || 4;

	  /**
	   * Empty function for API compatibility
	   */
	  this.start = function() {};
	  /**
	   * Logs a message to firebug's/safari's console
	   * @param {String} msg The message to be logged.
	   * @param {int} level The message's verbosity level. Importance is
	   * from 0 (very important) to 4 (not so important). A value of 1
	   * denotes an error in the usual protocol flow.
	   */
	  this.log = function(msg, level) {
	    level = level || 0;
	    if (level > this.level)
	      return;
	    if (typeof(console) == 'undefined')
	      return;
	    try {
	      switch (level) {
	      case 0:
		console.warn(msg);
		break;
	      case 1:
		console.error(msg);
		break;
	      case 2:
		console.info(msg);
		break;
	      case 4:
		console.debug(msg);
		break;
	      default:
		console.log(msg);
		break;
	      }
	    } catch(e) { try { console.log(msg) } catch(e) {} }
	  };

	  /**
	   * Sets verbosity level.
	   * @param {int} level The maximum level for debugging messages to be
	   * displayed. Thus you can tweak the verbosity of the logger. A
	   * value of 0 means very low traffic whilst a value of 4 makes
	   * logging very verbose about what's going on.
	   * @return This debug logger
	   * @type ConsoleLogger
	   */
	  this.setLevel = function(level) { this.level = level; return this; };
	  /**
	   * Gets verbosity level.
	   * @return The level
	   * @type int
	   */
	  this.getLevel = function() { return this.level; };
	}

	/**
	 * @fileoverview Magic dependency loading. Taken from script.aculo.us
	 * and modified to break it.
	 * @author Stefan Strigler steve@zeank.in-berlin.de 
	 * @version $Revision: 456 $
	 */

	var JSJaC = {
	  Version: '$Rev: 456 $',
	  require: function(libraryName) {
	    // inserting via DOM fails in Safari 2.0, so brute force approach
	    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
	  },
	  load: function() {
	    var includes =
	    ['xmlextras',
	     'jsextras',
	     'crypt',
	     'JSJaCConfig',
	     'JSJaCConstants',
	     'JSJaCCookie',
	     'JSJaCJSON',
	     'JSJaCJID',
	     'JSJaCBuilder',
	     'JSJaCPacket',
	     'JSJaCError',
	     'JSJaCKeys',
	     'JSJaCConnection',
	     'JSJaCHttpPollingConnection',
	     'JSJaCHttpBindingConnection',
	     'JSJaCConsoleLogger'
	     ];
	    var scripts = document.getElementsByTagName("script");
	    var path = './';
	    for (var i=0; i<scripts.length; i++) {
	      if (scripts.item(i).src && scripts.item(i).src.match(/JSJaC\.js$/)) {
		path = scripts.item(i).src.replace(/JSJaC.js$/,'');
		break;
	      }
	    }
	    for (var i=0; i<includes.length; i++)
	      this.require(path+includes[i]+'.js');
	  },
	  bind: function(fn, obj, arg) {
	    return function() {
	      if (arg)
		fn.apply(obj, arg);
	      else
		fn.apply(obj);
	    };
	  }
	};

	if (typeof JSJaCConnection == 'undefined')
	  JSJaC.load();

/* END JSJAC v1.3.2 */

/* BEGIN HOMEPAGE SCRIPTS */
		// BEGIN THE MENU FUNCTIONS
			function switchMenu(id) {
				$(".rightbar-group").hide();
				$("#rightmenu a").removeClass("selected");
				$("#rightmenu ." + id).addClass("selected");
				$("#" + id).show();
			}
		// END THE MENU FUNCTIONS
		
		// BEGIN THE FANCYBOX FUNCTIONS			
			// The function for the thumbs viewer
			$(document).ready(function() {
				$.fn.getTitle = function() {
					var arr = $("a.fancybox");
					$.each(arr, function() {
						var title = $(this).children("img").attr("title");
						$(this).attr('title',title);
					})
				}
				
				$(".thumb").addClass("fancybox").attr({ rel: "fancybox" }).getTitle();
				
				$(".thumb").fancybox({
					'frameWidth': 640,
					'frameHeight': 480,
					'hideOnContentClick': false,
					'centerOnScroll': true,
					'imageScale': true,
					'padding': 5
				});
			});
		// END THE FANCYBOX FUNCTIONS
		
		// BEGIN THE REGISTER FORM FUNCTIONS
			// The tooltip function for the register form
			$(document).ready(function() {
				$("#ajax-r-form input").tooltip({
					position: "center right",
					offset: [0, 15],
					effect: "fade",
					opacity: 0.7,
					tip: '#home .tooltip'
				});
			});
			
			function registerOpen() {
				// We hide other opened bubbles
				$(".bubble").fadeOut('fast');
				
				// We show the necessary divs
				$("#registered").show();
			}
			
			function handleRegError(e) {
				/* REF : http://xmpp.org/extensions/xep-0086.html */
				
				switch (e.getAttribute('code')) {
					case '400':
						openThisError(10);
						break;
					
					case '409':
						openThisError(5);
						break;
					
					case '503':
						openThisError(6);
						break;
					
					case '500':
						openThisError(7);
						break;
						
					default:
						openThisError(8);
						break;
				}
				
				$('.register-wait').hide();
				
				// And we disconnect the user from his Jabber account
				if (con.connected())
					disconnect();
			}
			
			function handleRegistered() {
				// We get some values
				var domain = $('#r-server').val();
				var username = $('#r-nick').val();
				
				// We reset some useless things
				$('.removable').remove();
				$('#registered .jabber-id').prepend('<div class="removable">' + username + '@' + domain + '</div>');
				$('.register-wait').hide();
				
				// And we show the success image !
				registerOpen();
			}
			
			function doRegister() {
				try {
					var domain = $('#r-server').val();
					var username = $('#r-nick').val();
					var pass = $('#r-pass').val();
					
					// If the form is correctly completed
					if(domain != '' && username != '' && pass != '') {
						// We remove the not completed class to avoid problems
						$("#ajax-l-form input, #ajax-r-form input, ").removeClass("please-complete");
						
						// We define the http binding parameters
						oArgs = new Object();
						oArgs.httpbase = getSystem('http-base');
						oArgs.timerval = 2000;
						
						// We create the new http-binding connection
						con = new JSJaCHttpBindingConnection(oArgs);
						
						// We setup the connection !
						con.registerHandler('onconnect',handleRegistered);
						con.registerHandler('onerror',handleRegError);
						
						// We retrieve what the user typed in the loggin inputs
						oArgs = new Object();
						oArgs.domain = $('#r-server').val();
						oArgs.username = $('#r-nick').val();
						oArgs.resource = 'Web';
						oArgs.pass = $('#r-pass').val();
						oArgs.register = true;
						
						// We show the waiting info
						$('.register-wait').show();
						
						// And here we go : we connect !
						con.connect(oArgs);
					}
					
					// We check if the form is entirely completed
					else {
						if(username != '') {
							$("#r-nick").removeClass("please-complete");
						}
						
						if(domain != '') {
							$("#r-server").removeClass("please-complete");
						}
						
						if(pass != '') {
							$("#r-pass").removeClass("please-complete");
						}
						
						if(username == '') {
							$("#r-nick").addClass("please-complete");
						}
						
						if(domain == '') {
							$("#r-server").addClass("please-complete");
						}
						
						if(pass == '') {
							$("#r-pass").addClass("please-complete");
						}
					}
				}
				
				finally {
					return false;
				}
			}
			
			function registerClose() {
				// We close the previous opened divs
				$("#registered").hide();
				
				// We disconnect the user
				if (con.connected())
					disconnect();
				
				// We set the values to help the user
				$("#l-jid").val($("#r-nick").val());
				$("#l-server").val($("#r-server").val());
				$("#l-pass").val($("#r-pass").val());
			}
		// END THE REGISTER FORM FUNCTIONS
		
		// BEGIN THE LOGIN FORM FUNCTIONS
			// The tooltip function for the login form
			$(document).ready(function() {
				$("#ajax-l-form input").tooltip({
					position: "bottom center",
					offset: [10, -85],
					effect: "fade",
					opacity: 0.7,
					tip: '#home .tooltip'
				});
			});
			
			// When the form is submitted, login !
			function doLogin() {
				try {
					// We get the values
					var lServer = $('#l-server').val();
					var lNick = $('#l-jid').val();
					var lPass = $('#l-pass').val();
					
					if(lServer != '' && lNick != '' && lPass != '') {
						// We remove the not completed class to avoid problems
						$("#ajax-l-form input, #ajax-r-form input, ").removeClass("please-complete");
						
						// We add the login wait div
						$("#general-wait").show();
					
						// We define the http binding parameters
						oArgs = new Object();
						oArgs.httpbase = getSystem('http-base');
						oArgs.timerval = 2000;
					
						// We create the new http-binding connection
						con = new JSJaCHttpBindingConnection(oArgs);
					
						// And we handle everything that happen
						setupCon(con);
						
						// We set a ressource hash to avoid some problems
						var lResource = 'Web';
					
						// We retrieve what the user typed in the loggin inputs
						oArgs = new Object();
						oArgs.domain = lServer;
						oArgs.username = lNick;
						oArgs.resource = lResource;
						oArgs.pass = lPass;
					
						// We store the infos of the user into the data-base
						$('#data-store .current .username').val(lNick);
						$('#data-store .current .domain').val(lServer);
						$('#data-store .current .resource').val(lResource);
						$('#data-store .current .password').val(hex_md5(lPass));
						
						// We hide previous errors or infos
						closeThisError();
						closeThisInfo();
					
						// And here we go : we connect !
						con.connect(oArgs);
					}
					
					else {
						if(lNick != '') {
							$("#l-jid").removeClass("please-complete");
						}
						
						if(lServer != '') {
							$("#l-server").removeClass("please-complete");
						}
						
						if(lPass != '') {
							$("#l-pass").removeClass("please-complete");
						}
						
						if(lNick == '') {
							$("#l-jid").addClass("please-complete");
						}
						
						if(lServer == '') {
							$("#l-server").addClass("please-complete");
						}
						
						if(lPass == '') {
							$("#l-pass").addClass("please-complete");
						}
					}
				}
				
				finally {
					return false;
				}
			}
		// END THE LOGIN FORM FUNCTIONS
		
		// BEGIN THE SCROLLABLE FUNCTIONS
			// The scrolling effect of the video div
			$.easing.custom = function (x, t, b, c, d) { 
				var s = 1.70158;  
				if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b; 
				return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b; 
			}
			
			// The scrolling function of the video div
			$(document).ready(function() {
				$("div.scrollable").scrollable({easing: 'custom', speed: 700}).mousewheel();
			});
		// END THE SCROLLABLE FUNCTIONS
		
		// BEGIN OFFICIAL MUC LIST FUNCTIONS
			function showOfficialMUC() {
				// We hide other opened bubbles
				$(".bubble").fadeOut('fast');
				
				// We show the target bubble
				$("#official-muc").fadeIn('fast');
			}
			
			function hideOfficialMUC() {
				$("#official-muc").fadeOut('fast');
			}
			
			function joinOfficialMUC(jid) {
				// We hide the bubble
				hideOfficialMUC();
				
				// We join the chan
				checkChatCreate(jid, 'groupchat');
			}
		// END OFFICIAL MUC LIST FUNCTIONS
		
		// BEGIN INVITE FUNCTIONS
			// When the user open the invite form
			function inviteFriendOpen() {
				// We display the invite containers
				$("#invite").show();
				
				// We hide some stuffs
				$("#invite .mail-info").hide();
			}
			
			// When the user close the invite form
			function inviteFriendClose() {
				// We hide the invite containers
				$("#invite").hide();
				
				// We hide some stuffs
				$("#invite .mail-info").hide();
			}
			
			// We set the invite mail submit function
			$(document).ready(function() {
				// We define the options of the ajax form
				var options = {
					beforeSubmit:	showMailWait,
					success:	showMailResponse,
					clearForm:	true
				};
				
				// We make this form ajax-able !
				$('#invite-email').submit(function() {
					$(this).ajaxSubmit(options);
					return false;
				});
			});
			
			function showMailResponse(responseText)  {
				$("#invite .mail-info").hide();
				
				if(responseText == '0') {
					$("#invite .mail-ok").show();
					
					$(document).oneTime("5s", function() {
						$("#invite .mail-ok").fadeOut('fast');
					});
				}
				
				else {
					$("#invite .mail-error").show();
					
					$(document).oneTime("5s", function() {
						$("#invite .mail-error").fadeOut('fast');
					});
				}
			}
			
			function showMailWait()  {
				$("#invite .mail-info").hide();
				$("#invite .mail-wait").show();
			}
		// END INVITE FUNCTIONS
		
		// BEGIN ERROR FUNCTIONS
			function closeThisError() {
				$("#error .error-p").slideUp();
			}
			
			function openThisError(errorID) {
				// In a first, we hide a previous error/info that can be displayed
				closeThisError();
				closeThisInfo();
				
				// Then we display the error
				$("#error .error-" + errorID).slideDown();
				
				// Fix the login bug
				$("#general-wait").hide();
				
				// After a while, we close the error automatically
				$(document).oneTime("5s", function() {
					closeThisError();
				});
			}
		// END ERROR FUNCTIONS
		
		// BEGIN INFO FUNCTIONS
			function closeThisInfo() {
				$("#info .info-p").slideUp();
			}
			
			function openThisInfo(infoID) {
				// In a first, we hide a previous error/info that can be displayed
				closeThisInfo();
				closeThisError();
				
				// Then we display the info
				$('#info .info-' + infoID).slideDown();
				
				// After a while, we close the info automatically
				$(document).oneTime("5s", function() {
					closeThisInfo();
				});
			}
		// END INFO FUNCTIONS
/* END HOMEPAGE SCRIPTS */

/* BEGIN TALKPAGE SCRIPTS */
		// BEGIN THE SWITCH FUNCTIONS
			function switchChan(id) {
				if($.exists("#" + id)) {
					// We show the chat-engine content
					$(".chat-engine-chan").hide();
					$("#" + id).show();
				
					// We edit the tab switcher
					$("#chat-switch .switcher").removeClass("activechan").addClass("chan");
					$("#chat-switch ." + id).addClass("activechan").removeClass("chan");
				
					// We scroll down to the last message
					if(id != 'newchan')
						autoScroll(id);
				
					// We put the focus on the talk input
					var focusOn = '#chat-engine #' + id + ' .text .message-area';
					$(focusOn).focus();
				}
			}
		// END THE SWITCH FUNCTIONS
		
		// BEGIN THE ICONS FUNCTIONS
			function hoverTooltip(id, type) {
				$("#" + id + " .tools-" + type + ", #" + id + " .bubble-" + type).hover(function() {
					$("#" + id + " .bubble-" + type).show();
				}, function() {
					$("#" + id + " .bubble-" + type).hide();
				});
			}
			
			// We apply a beautiful big tooltip that contain elements to chat-engine tool-icons
			function tooltipIcons(id) {
				hoverTooltip(id, 'smileys');
				hoverTooltip(id, 'colors');
				hoverTooltip(id, 'save');
				hoverTooltip(id, 'send');
				hoverTooltip(id, 'webcam');
				hoverTooltip(id, 'infos');
			}
		// END THE ICONS FUNCTIONS
		
		// BEGIN THE SMILEYS FUNCTIONS
			// We put the selected smiley in the good chat-engine input
			function insertSmiley(smileyName, insertInChatHash) {
				// We replace the odd smileys
				var smileyName = smileyName.replace(/’/g,"'");
				
				// We define the variables
				var insertInChatHashPath = "#" + insertInChatHash + " .message-area";
				var oldInputValue = $(insertInChatHashPath).val();
				var valueSoup = oldInputValue + " " + smileyName + " ";
				$(insertInChatHashPath).val(valueSoup);
				
				// We put the focus on the target input
				var focusOn = '#chat-engine #' + insertInChatHash + ' .text .message-area';
				$(focusOn).focus();
			}
		// END THE SMILEYS FUNCTIONS
		
		// BEGIN THE ADD-REMOVE CHAT FUNCTIONS
			// We delete all the associated elements of the chat we want to remove
			function deleteThisChat(hash) {
				$("#" + hash).remove();
				$("#chat-switch ." + hash).remove();
			}
			
			// The chat-close function
			function quitThisChat(jid, hash, type) {
				deleteThisChat(hash);
				getJID();
				
				if(type == 'chat') {
					chatStateSend('gone', jid);
				}
				
				if(type == 'groupchat') {
					// We send our unavailable presence
					var userNick = getNick();
					var aPresence = new JSJaCPresence();
					aPresence.setFrom(userJID);
					aPresence.setTo(jid + '/' + userNick);
					aPresence.setType('unavailable');
					me = this;
					con.send(aPresence);
					
					// We remove the groupchat from the data-storer
					$('#data-store .groupchats .' + hash).remove();
				}
				
				// We reset the switcher overflowing
				switcherScroll();
				
				// We reset the switcher
				switchChan('newchan');
			}
		// END THE ADD-REMOVE CHAT FUNCTIONS
		
		// BEGIN THE SAVE CHAT FUNCTIONS
			function downloadChat(chat) {
				var hash = hex_md5(chat);
				var contentToSend = $("#chatContentFor" + hash).html();
				
				$.post("./php/chatengine-generate-chat.php", { originalchat: contentToSend, fromjid: chat }, function(data){
					$("#" + hash + " .tooltip-right-dchat").hide();
					$("#" + hash + " .tooltip-right-fchat").show();
					$("#" + hash + " .tooltip-right-fchat").attr("href", "./php/chatengine-download-chat.php?id=" + data);
				});
				
				$("#" + hash + " .tooltip-right-fchat").click(function() {
					$("#" + hash + " .tooltip-right-dchat").show();
					$("#" + hash + " .tooltip-right-fchat").hide();
				});
			}
		// END THE SAVE CHAT FUNCTIONS
		
		// BEGIN THE PEP FUNCTIONS
			// The icon-values linking functions
			function presenceIcon(value) {
				$("#my-infos .icon-status").hide();
				$("#my-infos .status-" + value).show();
			}
			
			function moodIcon(value) {
				$("#my-infos .icon-mood").hide();
				
				if(value == 'angry' || value == 'cranky' || value == 'hot' || value == 'invincible' || value == 'mean' || value == 'restless' || value == 'serious' || value == 'strong')
					$("#my-infos .mood-one").show();
				else if(value == 'contemplative' || value == 'happy' || value == 'playful')
					$("#my-infos .mood-two").show();
				else if(value == 'aroused' || value == 'envious' || value == 'excited' || value == 'interested' || value == 'lucky' || value == 'proud' || value == 'relieved' || value == 'satisfied' || value == 'shy')
					$("#my-infos .mood-three").show();
				else if(value == 'calm' || value == 'cautious' || value == 'contented' || value == 'creative' || value == 'humbled' || value == 'lonely' || value == 'undefined')
					$("#my-infos .mood-four").show();
				else if(value == 'afraid' || value == 'amazed' || value == 'confused' || value == 'dismayed' || value == 'hungry' || value == 'in_awe' || value == 'indignant' || value == 'jealous' || value == 'lost' || value == 'offended' || value == 'outraged' || value == 'shocked' || value == 'surprised' || value == 'embarrassed' || value == 'impressed')
					$("#my-infos .mood-five").show();
				else if(value == 'crazy' || value == 'distracted' || value == 'neutral' || value == 'relaxed' || value == 'thirsty')
					$("#my-infos .mood-six").show();
				else if(value == 'annoyed' || value == 'anxious' || value == 'ashamed' || value == 'bored' || value == 'cold' || value == 'dejected' || value == 'depressed' || value == 'disappointed' || value == 'disgusted' || value == 'frustrated' || value == 'grieving' || value == 'grumpy' || value == 'guilty' || value == 'humiliated' || value == 'hurt' || value == 'intoxicated' || value == 'moody' || value == 'sad' || value == 'sick' || value == 'sleepy' || value == 'stressed' || value == 'tired' || value == 'weak' || value == 'worried' || value == 'remorseful')
					$("#my-infos .mood-seven").show();
				else if(value == 'amorous' || value == 'curious' || value == 'in_love' || value == 'nervous' || value == 'sarcastic')
					$("#my-infos .mood-eight").show();
				else if(value == 'brave' || value == 'confident' || value == 'hopeful' || value == 'grateful' || value == 'spontaneous' || value == 'thankful')
					$("#my-infos .mood-nine").show();
				else
					$("#my-infos .mood-four").show();
			}
			
			function activityIcon(value) {
				$("#my-infos .icon-activity").hide();
				
				if(value == 'doing_chores')
					$("#my-infos .activity-chores").show();
				else if(value == 'drinking')
					$("#my-infos .activity-drinking").show();
				else if(value == 'eating')
					$("#my-infos .activity-eating").show();
				else if(value == 'exercising')
					$("#my-infos .activity-exercising").show();
				else if(value == 'grooming')
					$("#my-infos .activity-grooming").show();
				else if(value == 'having_appointment')
					$("#my-infos .activity-appointment").show();
				else if(value == 'inactive')
					$("#my-infos .activity-inactive").show();
				else if(value == 'relaxing')
					$("#my-infos .activity-relaxing").show();
				else if(value == 'talking')
					$("#my-infos .activity-talking").show();
				else if(value == 'traveling')
					$("#my-infos .activity-traveling").show();
				else if(value == 'working')
					$("#my-infos .activity-working").show();
				else
					$("#my-infos .activity-exercising").show();
			}
			
			// The value send functions
			$(document).ready(function() {
				// Safer : we hide the others elements yet opened
				$("#my-infos .myInfosSelect").change(function() {
					$(".my-infos-text-item").fadeOut();
				});
				
				// When the user wants to change his presence...
				$(".changePresence").change(function() {
					// We add a beautiful effect
					$("#my-infos-text-first").fadeIn('fast');
					
					// We put the focus on the aimed input
					$("#my-infos-text-first .textPresence").focus();
					
					// Then we define the default text of each presence type
					var valuePresenceSwitch = $(".changePresence").val();
					switch(valuePresenceSwitch) {
						case "available":
							$(".textPresence").val(getTranslation(0));
							break;
						case "chat":
							$(".textPresence").val(getTranslation(1));
							break;
						case "away":
							$(".textPresence").val(getTranslation(2));
							break;
						case "xa":
							$(".textPresence").val(getTranslation(3));
							break;
						case "dnd":
							$(".textPresence").val(getTranslation(4));
							break;
						default:
							$(".textPresence").val(getTranslation(0));
							break;
					}
					
					// The function to send the presence
					function presenceSend() {
						// We get the values of the inputs
						var valuePresence = $(".changePresence").val();
						var valueTextPresence = $(".textPresence").val();
						
						// We send the data
						var userPresence = new JSJaCPresence();
						userPresence.setShow(valuePresence).setStatus(valueTextPresence).setPriority(10);
						con.send(userPresence);
						
						// We set the good icon
						presenceIcon(valuePresence);
						
						// We hide the form
						$("#my-infos-text-first").fadeOut('fast');
					}
					
					// When a key is pressed...
					$(".textPresence").keyup(function(e) {
						// Enter : continue
						if(e.keyCode == 13) {
							// We send the new presence
							presenceSend();
						}
						
						// Escape : quit
						if(e.keyCode == 27) {
							// We send the new presence
							presenceSend();
						}
					});
					
					// If the user click on the quit button
					$("#my-infos-text-first .my-infos-text-close").click(function() {
						// We send the new presence
						presenceSend();
					});
				});
				
				// When the user wants to change his mood
				$(".changeMood").change(function() {
					/* REF : http://xmpp.org/extensions/xep-0107.html */
					
					// We reset the input to avoid problems
					$(".textMood").val("");
					
					// We catch the inputs values
					var valueMood = $(".changeMood").val();
					
					if(valueMood != "none") {
						// We add a beautiful effect
						$("#my-infos-text-second").fadeIn('fast');
					
						// We put the focus on the aimed input
						$("#my-infos-text-second .textMood").focus();
					}
					
					// The function to send the iq
					function sendMood() {
						// We get the text of the mood
						var valueTextMood = $(".textMood").val();
						
						// We just get the JID of the user logged in
						getJID();
						
						// We propagate the mood on the xmpp network
						var iq = new JSJaCIQ();
						iq.setType('set');
						iq.setFrom(userJID);
						
						// We create the XML document
						var pubsub = iq.appendNode('pubsub', {'xmlns': 'http://jabber.org/protocol/pubsub'});
						var publish = pubsub.appendChild(iq.getDoc().createElement('publish'));
						publish.setAttribute("node", "http://jabber.org/protocol/mood");
						var item = publish.appendChild(iq.getDoc().createElement('item'));
						var mood = item.appendChild(iq.getDoc().createElement('mood'));
						
						if(valueMood != 'none') {
							var value = mood.appendChild(iq.getDoc().createElement(valueMood));
							var text = mood.appendChild(iq.getDoc().createElement('text')).appendChild(iq.getDoc().createTextNode(valueTextMood));
						}
						
						// And finally we send the mood that is set
						con.send(iq);
						
						// We set the good icon
						moodIcon(valueMood);
						
						// We close everything opened
						$("#my-infos-text-second").fadeOut('fast');
					}
					
					// We detect if the user pressed a key
					$("#my-infos-text-second").keyup(function(e) {
						// Enter : send
						if(e.keyCode == 13) {
							sendMood();
						}
						
						// Escape : quit
						if(e.keyCode == 27) {
							sendMood();
						}
					});
					
					// If the user click on the quit button
					$("#my-infos-text-second .my-infos-text-close").click(function() {
						sendMood();
					});
					
					// If no mood has been defined
					if(valueMood == "none") {
						sendMood();
					}
				});
				
				// When the user wants to change his activity
				$(".changeActivity").change(function() {
					/* REF : http://xmpp.org/extensions/xep-0108.html */
					
					// We reset the input to avoid problems
					$(".textActivity").val("");
					
					// We get the input values
					var valueActivity = $(".changeActivity").val();
					
					if(valueActivity != "none") {
						// We add a beautiful effect
						$("#my-infos-text-third").fadeIn('fast');
					
						// We put the focus on the aimed input
						$("#my-infos-text-third .textActivity").focus();
					}
					
					// The function that send the new activity through the xmpp network
					function sendActivity() {
						// We retrieve all the needed values
						var valueTextActivity = $(".textActivity").val();
						var splitValueActivity = valueActivity.split("/");
						var valueActivityMainType = splitValueActivity[0];
						var valueActivitySubType = splitValueActivity[1];
						
						// We just get the JID of the user logged in
						getJID();
						
						// We propagate the mood on the xmpp network
						var iq = new JSJaCIQ();
						iq.setType('set');
						iq.setFrom(userJID);
						
						// We create the XML document
						var pubsub = iq.appendNode('pubsub', {'xmlns': 'http://jabber.org/protocol/pubsub'});
						var publish = pubsub.appendChild(iq.getDoc().createElement('publish'));
						publish.setAttribute("node", "http://jabber.org/protocol/activity");
						var item = publish.appendChild(iq.getDoc().createElement('item'));
						var activity = item.appendChild(iq.getDoc().createElement('activity'));
						
						if(valueActivity != "none") {
							var mainType = activity.appendChild(iq.getDoc().createElement(valueActivityMainType));
							var subType = mainType.appendChild(iq.getDoc().createElement(valueActivitySubType));
							var text = activity.appendChild(iq.getDoc().createElement('text')).appendChild(iq.getDoc().createTextNode(valueTextActivity));
						}
						
						// And finally we send the mood that is set
						con.send(iq);
						
						// We set the good icon
						activityIcon(valueActivityMainType);
						
						// We close everything opened
						$("#my-infos-text-third").fadeOut('fast');
					}
					
					// We detect if the user pressed a key
					$(".textActivity").keyup(function(e) {
						// Enter : send
						if(e.keyCode == 13) {
							sendActivity();
						}
						
						// Escape : quit
						if(e.keyCode == 27) {
							sendActivity();
						}
					});
					
					// If the user click on the quit button
					$("#my-infos-text-third .my-infos-text-close").click(function() {
						sendActivity();
					});
					
					// If no activity has been defined
					if(valueActivity == "none") {
						sendActivity();
					}
				});
			});
		// END THE PEP FUNCTIONS
		
		// BEGIN THE ROSTER FUNCTIONS
			// BEGIN THE BUDDY LIST RETRIEVING FUNCTIONS
				// We first request the roster's XML
				function getRoster() {
					var iq = new JSJaCIQ();
					iq.setType('get');
					iq.setQuery('jabber:iq:roster');
					me = this;
					con.send(iq,me.handleRoster);
				}
				
				// We got it ! Now it's time to parse this XML sheet
				function handleRoster(iq) {
					var handleXML = iq.getQuery();
					var vcardItemExists = $(handleXML).find('item');
					
					// Parse the vcard xml
					if ($.exists(vcardItemExists)) {
						// We delete the loading icon
						$(".loadingRosterIcon").hide();
						
						$(handleXML).find('item').each(function() {
							var jid = $(this).attr('jid');
							var name = $(this).attr('name');
							var subscription = $(this).attr('subscription');
							var group = $(this).find('group').text();
							var jidHash = hex_md5(jid);
							var getNick = jid.split("@");
							var nick = getNick[0];
							
							// If no name is defined, we get the default nick of the buddy
							if(name == undefined) {
								name = nick;
							}
							
							// If no group is defined, we put the buddy in an "Other" group
							if(group == undefined) {
								group = "Autres";
							}
							
							if (!$.exists('#data-store .roster .' + jidHash)) {
								// We store the user informations
								var rosterStorable = "<buddy><jid>" + jid + "</jid><hash>" + jidHash + "</hash><nick>" + nick + "</nick><name>" + name + "</name><group>" + group + "</group></buddy>";
								$('#data-store .roster').prepend('<input class="buddy removable ' + jidHash + '" type="hidden" value="' + rosterStorable + '" />');
								
								// And we display the roster !
								displayRoster(jid, jidHash, name, subscription, group, 'none');
							}
						});
					}
					
					else {
						// We delete the loading icon
						$(".loadingRosterIcon").hide();
						
						// We tell the user that he has no buddy
						$('.no-buddy').show();
					}
				}
			// END THE BUDDY LIST RETRIEVING FUNCTIONS
			
			// BEGIN THE AVATARS RETRIEVING FUNTIONS
				// Woaw, it's nearly finish, here we show the user's roster on the page
				function displayRoster(dJID, dJIDHash, dName, dSubscription, dGroup, dType) {
					// If the buddy hasn't yet been displayed
					if(!$.exists('#buddy-list .' + dJIDHash)) {
						// Security : we hide the no buddy alert
						$('.no-buddy').hide();
						
						// And we create the HTML markup of the roster ! :)
						$(".loadingRosterIcon").before(
							'<div class="hidden-buddy buddy ' + dJIDHash + ' removable" onclick="openFromRoster(\'' + dJID + '\', \'' + dJIDHash + '\');">' + 
								'<div class="avatar-container"><img class="avatar" src="./img/others/default-avatar.png" alt="" /></div>' + 
								
								'<div class="name">' + 
									'<p class="buddyName">' + dName + '</p>' + 
									'<input class="buddyRename" type="text" value="' + dName + '" />' + 
									'<p class="buddyPresence disconnected">' + getTranslation(19) + '</p>' + 
									'<p class="buddyManage"><a onclick="removeBuddy(\'' + dJID + '\');">' + getTranslation(40) + '</a><a onclick="renameBuddy(\'' + dJID + '\');">' + getTranslation(41) + '</a></p>' + 
								'</div>' + 
							'</div>'
						);
					}
					
					// If the user wants to subscribe to our presence
					if(dType == 'subscribe') {
						var subPath = '#buddy-list .' + dJIDHash;
						$(subPath).addClass('buddy-subscribe frozen').removeClass('hidden-buddy');
						
						// If the subscribtion question doen't exists, we display it
						if(!$.exists(subPath + ' .buddySubscribe'))
							$(subPath + ' .buddyPresence').after('<a class="buddySubscribe" onclick="acceptSubscribe(\'' + dJID + '\');">' + getTranslation(38) + '</a><a class="buddySubscribe" onclick="removeSubscribe(\'' + dJID + '\');">' + getTranslation(39) + '</a>');
					}
					
					// If we are unauthorized to see the presence of this user
					else if(dSubscription == 'none') {
						$("#buddy-list ." + dJIDHash + " .name .disconnected").addClass("error").removeClass("disconnected");
						$("#buddy-list ." + dJIDHash + " .name .error").text(getTranslation(35));
					}
					
					// We get the user presence
					else if($.exists('#data-store .presence .' + dJIDHash)) {
						var pParam = $('#data-store .presence .' + dJIDHash).val();
						var pShow = $(pParam).find('show').text();
						var pType = $(pParam).find('type').text();
						var pStatus = $(pParam).find('status').text();
						presenceIA(pType, pShow, pStatus, dJIDHash, dJID, 'roster');
					}
				}
				
				// We request the vCard of each buddy to get their avatars
				function getAvatar(jid) {
					// We just get the JID of the user logged in
					getJID();
					
					// And we retrieve the avatar
					var iq = new JSJaCIQ();
					iq.setType('get');
					iq.setTo(jid);
					iq.setFrom(userJID);
					iq.appendNode('vCard', {'xmlns': 'vcard-temp'});
					me = this;
					con.send(iq,me.handleAvatar);
				}
				
				// We parse the XML of the vCard (so boring...)
				function handleAvatar(iq) {
					var handleXML = iq.getNode();
					var handleFrom = iq.getFrom();
					var hash = hex_md5(handleFrom);
					
					$(handleXML).find('vCard').each(function() {
						// We get the civility
						var nComplete = $(this).find('FN').text();
						var nNickname = $(this).find('NICKNAME').text();
						var nGiven = $(this).find('GIVEN').text();
						var nFamily = $(this).find('FAMILY').text();
						var nBirthday = $(this).find('BDAY').text();
						
						// We get the contact infos
						var cMail = $(this).find('USERID').text();
						var cPhone = $(this).find('NUMBER').text();
						var cSite = $(this).find('URL').text();
						
						// We get the avatar
						var aType = $(this).find('TYPE').text();
						var aBinval = $(this).find('BINVAL').text();
						
						// We get the postal adress
						var pStreet = $(this).find('STREET').text();
						var pLocality = $(this).find('LOCALITY').text();
						var pCode = $(this).find('PCODE').text();
						var pCountry = $(this).find('CTRY').text();
						
						// We get the user description
						var bDescription = $(this).find('DESC').text();
						
						// We display the user avatar in the buddy list
						displayAvatar(hash, aType, aBinval);
						
						var applyToThis = "#data-store .vcard ." + hash;
						var storeValue = '<vCard><FN>' + nComplete + '</FN><NICKNAME>' + nNickname + '</NICKNAME><N><GIVEN>' + nGiven + '</GIVEN><FAMILY>' + nFamily + '</FAMILY></N><BDAY>' + nBirthday + '</BDAY><EMAIL><USERID>' + cMail + '</USERID></EMAIL><TEL><NUMBER>' + cPhone + '</NUMBER></TEL><URL>' + cSite + '</URL><PHOTO><TYPE>' + aType + '</TYPE><BINVAL>' + aBinval + '</BINVAL></PHOTO>><ADR><STREET>' + pStreet + '</STREET><LOCALITY>' + pLocality + '</LOCALITY><PCODE>' + pCode + '</PCODE><CTRY>' + pCountry + '</CTRY></ADR><DESC>' + bDescription + '</DESC></vCard>';
						
						// If the avatar wasn't yet retrieved, we create the input
						if(!$.exists(applyToThis)) {
							$('#data-store .vcard').prepend('<input class="one-vcard removable ' + hash + '" type="hidden" />');
						}
						
						$(applyToThis).val(storeValue);
					});
				}
				
				// And finally, if the buddy have an avatar, we replace the default one
				function displayAvatar(hash, type, binval) {
					var replacement = "." + hash + " .avatar-container";
					$(replacement).replaceWith('<div class="avatar-container"><img class="avatar removable" src="data:' + type + ';base64,' + binval + '" /></div>');
				}
				
				function getAllBuddiesInfos() {
					// We catch all our buddies avatars
					$("#data-store .roster input").each(function() {
						var value = $(this).val();
						var jid = $(value).find('jid').text();
						var hash = $(value).find('hash').text();
						getUserInfos(hash, jid);
					});
				}
			// END THE AVATARS RETRIEVING FUNTIONS
			
			// BEGIN THE MANAGEMENT FUNCTIONS
				function sendSubscribe(from, to, type) {
					var aPresence = new JSJaCPresence();
					aPresence.setType(type);
					aPresence.setFrom(from);
					aPresence.setTo(to);
					con.send(aPresence);
				}
				
				function sendRoster(jid, subscription) {
					var iq = new JSJaCIQ();
					iq.setType('set');
					var iqQuery = iq.setQuery('jabber:iq:roster');
					var item = iqQuery.appendChild(iq.buildNode('item'));
					item.setAttribute("jid", jid);
					if(subscription)
						item.setAttribute("subscription", subscription);
					
					con.send(iq);
				}
				
				function acceptSubscribe(to) {
					// We generate the values to be used
					var hash = hex_md5(to);
					var from = getJID();
					var sNick = to.split('@');
					var nick = sNick[0];
					
					// We remove the add element
					$('#buddy-list .' + hash).remove();
					
					// We update our roster
					$(document).oneTime("4s", function() {
						displayRoster(to, hash, nick, 'both', '', 'none');
					});
					
					// We send a subsribed presence (to confirm)
					sendSubscribe(from, to, 'subscribed');
					// We send a new subscription request (to subscribe both)
					sendSubscribe(from, to, 'subscribe');
				}
				
				function removeSubscribe(to) {
					// We generate the values to be used
					var hash = hex_md5(to);
					var from = getJID();
					
					// We send a unsubsribe presence
					sendSubscribe(from, to, 'unsubscribe');
					
					// We remove the buddy from our roster
					sendRoster(to, 'remove');
					$('#buddy-list .' + hash).remove();
					
					// We check if the roster is yet full
					if(!$.exists('#buddy-list .buddy'))
						$('.no-buddy').show();
				}
				
				function handleSubscribe(from, type) {
					// We generate the values
					var hash = hex_md5(from);
					var sNick = from.split('@');
					var nick = sNick[0];
					
					$('#data-store .presence .' + hash, '#buddy-list .' + hash).remove();
					
					if(type != 'subscribed') {
						// We display the buddy in our roster
						displayRoster(from, hash, nick, 'none', '', type);
						
						// We display the avatar of the user
						getAvatar(from);
						
						// We remove the user presence to avoid display bugs
						$('#buddy-list .' + hash + ' .buddyPresence').remove();
					}
				}
				
				function handleUnsubscribe(from) {
					// We do the neccessary to remove the user
					openThisInfo(11);
					removeSubscribe(from);
				}
				
				function addThisContact(user, server) {
					// If the form is complete
					if((user != '') && (server != '')) {
						// Determine the buddy's JID
						var addThisJID = user + '@' + server;
						
						// We get the JID of the user logged in
						var uJID = getJID();
						
						// We send the subscription
						sendSubscribe(uJID, addThisJID, 'subscribe');
						sendRoster(addThisJID, '');
						
						// We hide the bubble
						$("#buddy-conf-add").fadeOut('fast');
					}
					
					// If a value is missing
					else {
						if(user == '') {
							$(".textAddContactJID").addClass("textAddContactNotComplete");
						}
						
						if(user != '') {
							$(".textAddContactJID").removeClass("textAddContactNotComplete");
						}
						
						if(server == '') {
							$(".textAddContactServer").addClass("textAddContactNotComplete");									
						}
						
						if(server != '') {
							$(".textAddContactServer").removeClass("textAddContactNotComplete");									
						}
						
						// We re-focus on the input
						$(".textAddContactJID").focus();
					}
				}
				
				function buddyEdit() {
					// We apply the links for each buddy
					$('#buddy-list .buddy').each(function() {
						$(this).addClass('frozen');
					});
					
					$('#buddy-list .buddy .buddyPresence').each(function() {
						$(this).hide();
					});
					
					$('#buddy-list .buddy .buddyManage').each(function() {
						$(this).show();
					});
					
					$('#buddy-list .foot-elements').hide();
					$('#buddy-list .foot-edit-finish').show();
				}
				
				function buddyEditFinish() {
					// We remove the links for each buddy
					$('#buddy-list .buddy').each(function() {
						$(this).removeClass('frozen');
					});
					
					$('#buddy-list .buddy .buddyPresence').each(function() {
						$(this).show();
					});
					
					$('#buddy-list .buddy .buddyManage').each(function() {
						$(this).hide();
					});
					
					// We show/hide certain elements
					$('#buddy-list .buddyRename').hide();
					$('#buddy-list .buddyName').show();
					$('#buddy-list .foot-elements').show();
					$('#buddy-list .foot-edit-finish').hide();
				}
				
				function removeBuddy(jid) {
					removeSubscribe(jid);
				}
				
				function resetBuddyName(jid, hash) {
					// We show/hide certain elements
					$('#buddy-list .buddyRename').hide();
					$('#buddy-list .buddyName').show();
					
					// We get the old buddy name
					var old = $('#buddy-list .' + hash + ' .buddyName').text();
					$('#buddy-list .' + hash + ' .buddyRename').val(old);
				}
				
				function sendBuddyName(jid, hash, value) {
					// If the submitted name is not blank
					if(value) {
						// We show/hide certain elements
						$('#buddy-list .buddyRename').hide();
						$('#buddy-list .buddyName').show();
						
						// We change the buddy name in the buddy list
						var old = $('#buddy-list .' + hash + ' .buddyName').text(value);
						
						// We send the new buddy name
						var iq = new JSJaCIQ();
						iq.setType('set');
						var iqQuery = iq.setQuery('jabber:iq:roster');
						var item = iqQuery.appendChild(iq.buildNode('item'));
						item.setAttribute("jid", jid);
						item.setAttribute("name", value);
						con.send(iq);
					 }
					 
					 else
					 	resetBuddyName(jid, hash);
				}
				
				function renameBuddy(jid) {
					// We generate the needed values
					var hash = hex_md5(jid);
					
					// We show the input and focus it to enter the new name
					$('#buddy-list .' + hash + ' .buddyName').hide();
					$('#buddy-list .' + hash + ' .buddyRename').show().focus();
					
					// We create an event to detect a keypress
					$('#buddy-list .' + hash + ' .buddyRename').keyup(function(e) {
						// Enter : continue
						if(e.keyCode == 13) {
							var value = $('#buddy-list .' + hash + ' .buddyRename').val();
							sendBuddyName(jid, hash, value);
						}
						
						// Escape : quit
						if(e.keyCode == 27) {
							resetBuddyName(jid, hash);
						}
					});
				}
				
				$(document).ready(function() {
					// Safer : we hide the others elements yet opened
					$("#buddy-list .foot .buddy-list-icon").click(function() {
						$(".buddy-conf-item").fadeOut();
					});
					
					// When the user click on the add button, show the contact adding tool
					$("#buddy-list .foot .add").click(function() {
						// We hide other opened bubbles
						$(".bubble").fadeOut('fast');
						
						// We show the requested div
						$("#buddy-conf-add").fadeIn('fast');
						
						// We reset the input to avoid problems
						$(".textAddContactJID").val("");
						$(".textAddContactServer").val(getHost('main'));
						
						// We focus on the input
						$(".textAddContactJID").focus();
					});
					
					// When a key is pressed...
					$("#buddy-conf-add").keyup(function(e) {
						// Enter : continue
						if(e.keyCode == 13) {
						// Get the values
							var enteredJID = $(".textAddContactJID").val();
							var enteredServer = $(".textAddContactServer").val();
							
							// Submit the form
							addThisContact(enteredJID, enteredServer);
						}
						
						// Escape : quit
						if(e.keyCode == 27) {
							$("#buddy-conf-add").fadeOut('fast');
						}
					});
					
					// If the user click on the quit button
					$("#buddy-conf-add .buddy-conf-close").click(function() {
						$("#buddy-conf-add").fadeOut('fast');
					});
					
					// When the user click on the edit button, show the edit menu
					$("#buddy-list .foot .edit").click(function() {
						// We launch the roster editing
						buddyEdit();
					});
					
					// When the user click on the groupchat button, show the groupchat menu
					$("#buddy-list .foot .groupchat").click(function() {
						// We hide other opened bubbles
						$(".bubble").fadeOut('fast');
						
						// We show the requested div
						$("#buddy-conf-groupchat").fadeIn('fast');
						
						// Focus on the first input
						$(".textAddGroupchatRoom").focus();
						
						// When the form is sent, do this
						function joinThisGroupchat() {
							// Get the values
							var enteredGCRoom = $(".textAddGroupchatRoom").val();
							var enteredGCServer = $(".textAddGroupchatServer").val();
							var enteredGroupchatNick = $(".textAddGroupchatNick").val();
							
							// If the form is complete
							if((enteredGCRoom != '') && (enteredGCServer != '')) {
								// Determine the buddy's JID
								var joinThisGC = enteredGCRoom + '@' + enteredGCServer;
								
								// We get the JID of the user logged in
								getJID();
								
								// Close everything
								$("#buddy-conf-groupchat").fadeOut('fast');
							}
							
							// If a value is missing
							else {
								if(enteredGCRoom == '') {
									$(".textAddGroupchatRoom").addClass("textAddGroupchatNotComplete");
								}
								
								if(enteredGCRoom != '') {
									$(".textAddGroupchatRoom").removeClass("textAddGroupchatNotComplete");
								}
								
								if(enteredGCServer == '') {
									$(".textAddGroupchatServer").addClass("textAddGroupchatNotComplete");									
								}
								
								if(enteredGCServer != '') {
									$(".textAddGroupchatServer").removeClass("textAddGroupchatNotComplete");									
								}
								
								if(enteredGCNick == '') {
									$(".textAddGroupchatNick").addClass("textAddGroupchatNotComplete");									
								}
								
								if(enteredGCNick != '') {
									$(".textAddGroupchatNick").removeClass("textAddGroupchatNotComplete");									
								}
							}
						}
						
						// When a key is pressed...
						$("#buddy-conf-groupchat").keyup(function(e) {
							// Enter : continue
							if(e.keyCode == 13) {
								joinThisGroupchat();
							}
							
							// Escape : quit
							if(e.keyCode == 27) {
								$("#buddy-conf-groupchat").fadeOut('fast');
							}
						});
						
						// If the user click on the quit button
						$("#buddy-conf-groupchat .buddy-conf-close").click(function() {
							$("#buddy-conf-groupchat").fadeOut('fast');
						});
					});
					
					// When the user wants to edit his groupchat favorites
					$(".buddy-conf-groupchat-edit").click(function() {
						openFavorites();
						$("#buddy-conf-groupchat").fadeOut('fast');
					});
					
					// When the user click on the more button, show the more menu
					$("#buddy-list .foot .more").click(function() {
						// We hide other opened bubbles
						$(".bubble").fadeOut('fast');
						
						// We show the target bubble
						$("#buddy-conf-more").fadeIn('fast');
						
						$("#buddy-conf-more").keyup(function(e) {
							// Enter : continue
							if(e.keyCode == 13) {
								
							}
							
							// Escape : quit
							if(e.keyCode == 27) {
								$("#buddy-conf-more").fadeOut('fast');
							}
						});
						
						// If the user click on the quit button
						$("#buddy-conf-more .buddy-conf-close").click(function() {
							$("#buddy-conf-more").fadeOut('fast');
						});
					});
					
					// When the user wants to display all his buddies
					$(".buddy-conf-more-display-unavailable").click(function() {
						$(".buddy-conf-more-display-unavailable").hide();
						$(".buddy-conf-more-display-available").show();
						$("#buddy-conf-more").fadeOut('fast');
						
						// We set a false class to the disconnected buddies
						$(".hidden-buddy").addClass("unavailable-buddy");
						$(".unavailable-buddy").removeClass("hidden-buddy");
						
						// We show all the buddies avatar
						// WARNING : disabled now because this is too heavy for the client/server
						// getAllBuddiesInfos(); 
					});
					
					// When the user wants to display only online buddies
					$(".buddy-conf-more-display-available").click(function() {
						$(".buddy-conf-more-display-available").hide();
						$(".buddy-conf-more-display-unavailable").show();
						$("#buddy-conf-more").fadeOut('fast');
						
						// We set a false class to the disconnected buddies
						$(".unavailable-buddy").addClass("hidden-buddy");
						$(".hidden-buddy").removeClass("unavailable-buddy");
					});
					
					// When the user click on the user directory link
					$(".buddy-conf-more-user-directory").click(function() {
						openDirectory();
						$("#buddy-conf-more").fadeOut('fast');
					});
					
					// When the user click on the service discovery link
					$(".buddy-conf-more-service-disco").click(function() {
						openDiscovery();
						$("#buddy-conf-more").fadeOut('fast');
					});
					
					// When the user click on the help link
					$(".buddy-conf-more-help-jappix").click(function() {
						openHelp();
						$("#buddy-conf-more").fadeOut('fast');
					});
					
					// When the user click on the about link
					$(".buddy-conf-more-about-jappix").click(function() {
						openAbout();
						$("#buddy-conf-more").fadeOut('fast');
					});
				});
			// END THE MANAGEMENT FUNCTIONS
		// END THE ROSTER FUNCTIONS
		
		// BEGIN THE STORAGE FUNCTIONS			
			/* REF : http://xmpp.org/extensions/xep-0049.html */
			
			function getStorage() {
				var iq = new JSJaCIQ();
				iq.setType('get');
				var iqQuery = iq.setQuery('jabber:iq:private');
				iqQuery.appendChild(iq.getDoc().createElementNS('storage:bookmarks', 'storage'));
				iqQuery.appendChild(iq.getDoc().createElementNS('jappix:messages', 'storage'));
				iqQuery.appendChild(iq.getDoc().createElementNS('jappix:options', 'storage'));
				me = this;
				con.send(iq,me.handleStorage);
			}
			
			// We got it ! Now it's time to parse this XML sheet
			function handleStorage(iq) {
				var handleXML = iq.getQuery();
				
				// Parse the options xml
				$(handleXML).find('storage[xmlns=jappix:options]').each(function() {
					$(this).find('option').each(function() {
						// We retrieve the informations
						var type = $(this).attr('type');
						var value = $(this).text();
						
						// We display the storage
						displayOptions(type, value);
					});
				});
				
				// Parse the messages xml
				$(handleXML).find('storage[xmlns=jappix:messages]').each(function() {
					$(this).find('message').each(function() {
						// We retrieve the informations
						var from = $(this).attr('from');
						var subject = $(this).attr('subject');
						var content = $(this).text();
						var status = $(this).attr('status');
						var id = $(this).attr('id');
						
						// We display the message
						displayMessage(from, subject, content, status, id, 'old')
					});
				});
				
				// Parse the conference xml
				$(handleXML).find('storage[xmlns=storage:bookmarks]').each(function() {
					$(this).find('conference').each(function() {
						// We retrieve the informations
						var jid = $(this).attr('jid');
						var gcName = $(this).attr('name');
						var nick = $(this).find('nick').text();
						var hash = hex_md5(jid);
					
						// We display the storage
						displayFavorites(jid, gcName, nick, hash);
					});
				});
			}
		// END THE STORAGE FUNCTIONS
		
		// BEGIN THE FUNCTION TO GET EVERYTHING NEEDED
			function getEverything() {
				getRoster();
				getStorage();
				geolocalise();
				joinFromFavorite();
			}
		// END THE FUNCTION FOR GETTING EVERYTHING NEEDED
		
		// BEGIN THE DATE FUNCTIONS
			function getCompleteTime() {
				var oDate = new Date();
				var oHours = oDate.getHours();
				var oMinutes = oDate.getMinutes();
				var OSeconds = oDate.getSeconds();
				
				if(oHours < 10)
					var hours = '0' + oHours;
				else
					var hours = oHours;
					
				if(oMinutes < 10)
					var minutes = '0' + oMinutes;
				else
					var minutes = oMinutes;
					
				if(OSeconds < 10)
					var seconds = '0' + OSeconds;
				else
					var seconds = OSeconds;
				
				var time = hours + ':' + minutes + ':' + seconds;
				
				return time;
			}
		// END THE DATE FUNCTIONS
		
		// BEGIN THE CHATSTATE FUNCTIONS
			function chatStateSend(state, jid) {
				getJID();
				
				var aMsg = new JSJaCMessage();
				aMsg.setTo(new JSJaCJID(jid));
				aMsg.setFrom(userJID);
				aMsg.setType('chat');
				aMsg.appendNode(state, {'xmlns': 'http://jabber.org/protocol/chatstates'});
				con.send(aMsg);
			}
			
			function displayChatState(state, hash) {
				// We reset the previous state
				$("#" + hash + " .one-chatstate").hide();
				
				// We change the buddy name colour in the chat-switch
				$("#chat-switch ." + hash + " .name a").attr("class", state);
				
				// We display the state in the chat
				if(state == 'active') {
					$("#" + hash + " .chatstate").hide();
				}
				
				else {
					$("#" + hash + " ." + state).show();
					$("#" + hash + " .chatstate").show();
				}
			}
		// END THE CHATSTATE FUNCTIONS
			
		// BEGIN THE HANDLING FUNCTIONS
			function handleMessage(aJSJaCPacket) {
				// We get the message items
				var messageFromJID = aJSJaCPacket.getFromJID();
				var messageType = aJSJaCPacket.getType();
				var messageBody = aJSJaCPacket.getBody();
				var messageNode = aJSJaCPacket.getNode();
				var messageSubject = aJSJaCPacket.getSubject();
				var messageTime = getCompleteTime();
				
				if(messageType != 'error') {
					// For the groupchats
					var messageFromXHashable = "" + messageFromJID + "";
					var messageFromXSplitted = messageFromXHashable.split("/");
					var messageFromRoom = messageFromXSplitted[0];
					var messageFromNick = messageFromXSplitted[1];
					var fromMUCHash = hex_md5(messageFromRoom);
					var messageStamp = $(messageNode).find('x').attr('stamp');
				
					// We remove the ressource of the user
					var noRessourceJID = messageFromJID + '';
				
					// If the jid has yet no resource
					if (noRessourceJID.indexOf('/') == -1) {
						var messageFromJIDNoRessource = noRessourceJID;
					}
				
					// Else we must remove the resource from the jid
					else {
						var splittednoRessourceJID = noRessourceJID.split('/');
						var messageFromJIDNoRessource = splittednoRessourceJID[0];
					}
				
					// We generate the hash
					var messageFromJIDHashable = '' + messageFromJIDNoRessource + '';
					var fromJIDHash = hex_md5(messageFromJIDHashable);
					var noHashfriendJID = messageFromJIDNoRessource;
				
					if(messageNode != '' && $(messageNode).find('error').attr('code') == undefined) {
						/* REF : http://xmpp.org/extensions/xep-0085.html */
					
						if($(messageNode).find('composing').attr('xmlns') != undefined) {
							displayChatState('composing', fromJIDHash);
						}
					
						if($(messageNode).find('paused').attr('xmlns') != undefined) {
							displayChatState('paused', fromJIDHash);
						}
					
						if($(messageNode).find('active').attr('xmlns') != undefined) {
							displayChatState('active', fromJIDHash);
						}
					
						if($(messageNode).find('inactive').attr('xmlns') != undefined) {
							displayChatState('inactive', fromJIDHash);
						}
					
						if($(messageNode).find('gone').attr('xmlns') != undefined) {
							displayChatState('gone', fromJIDHash);
						}
					}
					
					// If this is a room topic message
					if(messageSubject) {
						var filteredSubject = filterThisMessage(messageSubject, messageFromNick);
						$("#" + fromMUCHash + " .top .name .buddy-infos .muc-topic").replaceWith('<span class="muc-topic">' + filteredSubject + '</span>');
					}
					
					// If the message is really a message
					if(messageBody) {
						if(messageType == 'chat') {
							// Gets the nickname of the user
							var splittingJID = noHashfriendJID + '';
							var messageFromName = getBuddyName(splittingJID);
						
							// Filter the received message
							var filteredMessage = filterThisMessage(messageBody, messageFromName);
							
							// If the chat is yet opened, doesn't create a new one
							var DIVfromJIDHash = '#' + fromJIDHash;
							
							if ($.exists(DIVfromJIDHash)) {
								// We tell the user with a sound
								soundPlay(3);
							
								// We notify the user if he has not the focus on the chat
								var chanToTest = '#chat-switch .channels .' + fromJIDHash;
								if (!$(chanToTest).hasClass('activechan')) {
									$(chanToTest).addClass('chan-newmessage');
									pageTitle('new');
								}
							}
						
							// If the chat isn't yet opened, open it !
							else {
								chatCreate(fromJIDHash, noHashfriendJID, messageFromName); // JID hash, JID without hash, the JID name
								// We tell the user that a new chat has started
								soundPlay(2);
							}
						
							// Display the received message
							$("#" + fromJIDHash + " .content " + ".thisFalseDivIsForJQuery").before('<div class="one-line user-message"><p><em>(' + messageTime + ') </em><b class="him">' + messageFromName + ' : </b> ' + filteredMessage + '</p></div>');
							
							// We apply the videobox
							applyVideoBox();
							
							// Scroll to the last message
							autoScroll(fromJIDHash);
						}
						
						else if(messageType == 'groupchat') {
							/* REF : http://xmpp.org/extensions/xep-0045.html */
						
							// Filter the received message
							var filteredMessage = filterThisMessage(messageBody, messageFromNick);
						
							// We get the message time
							if(messageStamp != undefined) {
								var messageT = messageStamp.split("T");
								messageT = messageT[1];
								var messageType = 'old-message';
							}
						
							else {
								var messageT = messageTime;
								var messageType = 'user-message';
							}
						
							var color = generateColour(messageFromNick);
						
							function displayMUCMessage(type) {
								// Display the received message in the room
								$("#" + fromMUCHash + " .content " + ".thisFalseDivIsForJQuery").before('<div class="one-line ' + type + '"><p><em>(' + messageT + ') </em><b style="color: ' + color + ';">' + messageFromNick + ' : </b> ' + filteredMessage + '</p></div>');
								
								// We apply the videobox
								applyVideoBox();
								
								// Scroll to the last message
								autoScroll(fromMUCHash);
							}
						
							if(messageFromNick == undefined) {
								messageFromNick = 'server';
								displayMUCMessage('system-message');
							}
						
							else {
								displayMUCMessage(messageType);
							}
						}
					
						else if(messageType == 'normal') {
							var messageSubject = aJSJaCPacket.getSubject();
							var dateOfTheMessage = getCompleteTime();
							var messageID = hex_md5(messageFromJIDNoRessource + messageSubject + dateOfTheMessage);
							var htmlMessage = messageBody.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
						
							// We display the received message
							displayMessage(messageFromJIDNoRessource, messageSubject, htmlMessage, 'unread', messageID, 'fresh');
						}
					
						else {
							openThisError(2);
						}
					}
				}
			}
			
			function handleConnected() {
				// We hide the home page
				$("#home").hide();
				switchMenu('whatsjappix');
				
				// We hide the login wait div
				$("#general-wait").hide();
				
				// We show the chatting app.
				$("#talk").show();
				switchChan('newchan');
				
				// We show a ok notification
				openThisInfo(4);
				
				// We tell the world that we are online
				var defaultPresence = new JSJaCPresence();
				defaultPresence.setShow("available").setStatus(getTranslation(0)).setPriority(10);
				con.send(defaultPresence);
				
				// We change the title of the page
				pageTitle('talk');
				
				// We set the good url for the sharer
				var oldTwitterURL = $(".twitter-share").attr("href");
				$(".twitter-share").attr("href", oldTwitterURL + getJID() + " ! !jappix");
				$("#email-jid").val(getJID());
				
				// We get all the other things
				getEverything();
			}
			
			function handleDisconnected() {
				// We put the old title of the Jappix home
				pageTitle('home');
				
				// And we show the home like when the user wasn't logged in
				$("#home").show();
				$("#talk").hide();
			}
			
			function handleIQ(iq) {
				var iqContent = iq.getDoc();
				var iqFrom = iq.getFrom();
				var iqID = iq.getID();
				var iqQueryXMLNS = iq.getQueryXMLNS();
				var iqQuery = iq.getQuery();
				var iqType = iq.getType();
				var iqTo = getJID() + '/' + $('#data-store .current .resource').val();
				
				// If this is a software version iq
				if(iqQueryXMLNS == 'jabber:iq:version' && iqType == 'get') {
					/* REF : http://xmpp.org/extensions/xep-0092.html */
					
					var iqResponse = new JSJaCIQ();
					iqResponse.setFrom(iqTo);
					iqResponse.setTo(iqFrom);
					iqResponse.setType('result');
					iqResponse.setID(iqID);
					var iqQuery = iqResponse.setQuery('jabber:iq:version');
					iqQuery.appendChild(iq.getDoc().createElement('name')).appendChild(iq.getDoc().createTextNode('Jappix'));
					iqQuery.appendChild(iq.getDoc().createElement('version')).appendChild(iq.getDoc().createTextNode(getSystem('version')));
					iqQuery.appendChild(iq.getDoc().createElement('os')).appendChild(iq.getDoc().createTextNode(navigator.userAgent));
					con.send(iqResponse);
				}
				
				// If this is a roster iq
				if(iqQueryXMLNS == 'jabber:iq:roster' && iqType == 'set') {
					// REF : http://xmpp.org/extensions/xep-0092.html
					
					var jid = $(iqQuery).find('item').attr('jid');
					var sub = $(iqQuery).find('item').attr('subscription');
					hash = hex_md5(jid);
					sNick = jid.split('@');
					nick = sNick[0];
					
					displayRoster(jid, hash, nick, sub, '', '');
				}
			}
			
			function handlePresence(aJSJaCPacket) {
				// We define everything needed here
				var presenceFromJID = aJSJaCPacket.getFromJID() + '';
				var presenceFromJIDHash = hex_md5(presenceFromJID);
				var presenceNode = aJSJaCPacket.getNode();
				var splitPresenceFromJID = presenceFromJID.split('/');
				var jidHash = hex_md5(splitPresenceFromJID[0]);
				var jidNoRes = splitPresenceFromJID[0];
				var storedElement = '#data-store .groupchats .' + jidHash;
				
				// We get the presence content
				var show = aJSJaCPacket.getShow();
				var type = aJSJaCPacket.getType();
				var status = aJSJaCPacket.getStatus();
				
				// We let Jappix know if the presence comes from a groupchat
				if($.exists(storedElement)) {
					var affiliation = $(aJSJaCPacket.getNode()).find('item').attr('affiliation');
					var role = $(aJSJaCPacket.getNode()).find('item').attr('role');
					var iNick = $(aJSJaCPacket.getNode()).find('item').attr('nick');
					var sNick = presenceFromJID.split("/");
					var nick = sNick[1];
					
					// If one user is quitting
					if(type && type == 'unavailable') {
						// If we've been banned from the room
						if(affiliation == 'outcast' && nick == getNick() && !iNick) {
							quitThisChat(jidNoRes, jidHash, 'groupchat');
							openThisInfo(9);
						}
						
						// If we've been kicked from the room
						else if(affiliation == 'none' && nick == getNick() && !iNick) {
							quitThisChat(jidNoRes, jidHash, 'groupchat');
							openThisInfo(10);
						}
						
						// Else, that's a room user that has left
						else {
							$('#' + jidHash + ' .user' + presenceFromJIDHash).remove();
						}
					}
					
					// If one user is joining
					else {
						displayMucPresence(presenceFromJID, jidHash, presenceFromJIDHash, show, status, affiliation, role);
					}
				}
				
				// Else, that comes from a buddy that is in our roster
				else {
					// We store the buddy presence
					var presenceStorePath = "#data-store .presence";
					var presenceStoreInput = presenceStorePath + " ." + jidHash;
					var presenceStoreXML = '<presence jid="' + jidNoRes + '"><show>' + show + '</show><type>' + type + '</type><status>' + status + '</status></presence>';
					
					if($.exists(presenceStoreInput)) {
						$(presenceStoreInput).val(presenceStoreXML);
					}
					
					else {
						$(presenceStorePath).prepend('<input class="one-presence ' + jidHash + ' removable" type="hidden" />');
						$(presenceStoreInput).val(presenceStoreXML);
					}
					
					// We manage the presence
					presenceFunnel(type, show, status, jidHash, jidNoRes, 'roster');
				}
			}
			
			// The function that disconnects the user
			function disconnectTheUser() {
				if (con.connected()) {
					// We quit the current session
					quit();
					
					// We show a message to alert the user
					openThisError(8);
				}
			}
			
			function handleError(e) {
				/* REF : http://xmpp.org/extensions/xep-0086.html */
				
				// We tell the user that an error occured
				switch (e.getAttribute('code')) {
					case '302':
						openThisError(13);
						break;
					
					case '400':
						openThisError(10);
						break;
					
					case '401':
						openThisError(9);
						disconnectTheUser();
						break;
					
					case '402':
						openThisError(17);
						disconnectTheUser();
						break;
					
					case '403':
						openThisError(12);
						disconnectTheUser();
						break;
					
					case '404':
						openThisError(18);
						break;
						
					case '405':
						openThisError(20);
						break;
						
					case '406':
						openThisError(17);
						break;
					
					case '407':
						openThisError(21);
						disconnectTheUser();
						break;
					
					case '409':
						openThisError(23);
						disconnectTheUser();
						break;
						
					case '500':
						openThisError(14);
						disconnectTheUser();
						break;
					
					case '501':
						openThisError(11);
						break;
					
					case '503':
						openThisError(6);
						break;
					
					case '504':
						openThisError(22);
						break;
					
					default:
						openThisError(1);
						break;
				}
			}			
		// END THE HANDLING FUNCTIONS
			
		// BEGIN THE SCROLLING FUNCTIONS
			function autoScroll(hash) {
				if($.exists("#" + hash)) {
					pathToLastMessage = 'chatContentFor' + hash;
					var objDiv = document.getElementById(pathToLastMessage);
					objDiv.scrollTop = objDiv.scrollHeight;
				}
			}
		// END THE SCROLLING FUNCTIONS
			
		// BEGIN THE CHAN FUNCTIONS
			function chanClick(hash) {
				var chanSwitch = "#chat-switch ." + hash + " a, #chat-switch ." + hash + " a";
				var chanCreate = "#buddy-list .content ." + hash;
				
				$(chanSwitch + ", " + chanCreate).click(function() {
					if($(this).parent().parent().hasClass('chan-newmessage')) {
						// We remove the class that tell the user of a new message
						$(this).parent().parent().removeClass('chan-newmessage');
						
						// We set the classical title
						pageTitle('talk');
					}
				});
			}
			
		// END THE CHAN FUNCTIONS
			
		// BEGIN PREVENTING FUNCTIONS
			// When the user close his window without disconnecting correctly	
			function preventClose() {
				// If the user is connected and the server admin allowed the close preventing
				if (con.connected() && getSystem('close-prevent') == 'on') {
					return getTranslation(29);
				}
			}
			
			window.onbeforeunload = preventClose;
		// END PREVENTING FUNCTIONS
		
		// BEGIN JID RETRIEVING FUNCTIONS
			function getJID() {
				var user = $('#data-store .current .username').val();
				var server = $('#data-store .current .domain').val();
				
				// We get the JID of the current logged in user
				userJID = user + "@" + server;
				return userJID;
			}
			
			function getNick() {
				// We get the JID of the current logged in user
				var userNick = $('#data-store .current .username').val();
				return userNick;
			}
			
			function quoteMyNick(hash, nick) {
				var pathToInput = '#chat-engine #' + hash + ' .message-area';
				$(pathToInput).val(nick + ', ');
				$(pathToInput).focus();
			}
		// BEGIN JID RETRIEVING FUNCTIONS
		
		// BEGIN TITLE FUNCTIONS
			function pageTitle(title) {
				// We change the title of the page so that it will give the user's JID when he's logged in
				switch(title) {
					case "home":
						$('title').html($('#data-store .titles .home').val());
						break;
					case "talk":
						getJID();
						$('title').html('Jappix &bull; ' + userJID);
						break;
					case "new":
						getJID();
						$('title').html('[✎] Jappix &bull; ' + userJID);
						break;
					default:
						$('title').html($('#data-store .titles .home').val());
						break;
					}
			}
		// END TITLE FUNCTIONS
			
		// BEGIN PRESENCE FUNCTIONS
			function displayMucPresence(from, roomHash, hash, show, status, affiliation, role) {
				var thisUser = "#chat-engine #" + roomHash + " .list .user" + hash;
				var chatterNickSplit = from.split("/");
				var chatterNick = chatterNickSplit[1];
				
				if(!$.exists(thisUser) && status != 'offline') {
					$("#chat-engine #" + roomHash + " .list ." + role + " .title").after(
						'<div class="user user' + hash + '" onclick="quoteMyNick(\'' + roomHash + '\', \'' + chatterNick + '\');">' + 
							'<div class="name">' + chatterNick + '</div>' + 
							'<input class="userJid-' + chatterNick + '"  type="hidden" value="' + from + '" />' + 
						'</div>'
					);
				}
				
				if(status == 'offline') {
					$(thisUser).remove();
				}
			}
			
			function displayPresence(value, type, show, status, hash, jid, ref) {
				// WE DISPLAY THE PRESENCE IN THE ROSTER
					var setThisToDIV = "#buddy-list .content ." + hash + " .name .buddyPresence";
					
					$(setThisToDIV).replaceWith(
						'<p class="buddyPresence ' + type + '">' + value + '</p>'
					);
					
					// When the buddy disconnect himself, we hide him
					if(type == 'disconnected' || type == 'error' && ref == 'roster') {
						$("#buddy-list .content ." + hash).addClass('hidden-buddy');
					}
					
					// If the buddy is online
					else {
						if(ref == 'roster') {
							// We play a sound to tell the user someone is online
							if($('#buddy-list .content .' + hash).hasClass('hidden-buddy')) {
								soundPlay(0);
							}
						
							// When the buddy is online, we show it
							$("#buddy-list .content ." + hash).removeClass('hidden-buddy');
							$("#buddy-list .content ." + hash).removeClass('unavailable-buddy');
						}
					
						// If the buddy is online and his vcard isn't cached, we get it
						var storedVCard = "#data-store .vcard ." + hash;
						if(!$.exists(storedVCard) && !$(storedVCard).hasClass('hidden-buddy')) {
							getAvatar(jid);
						}
					}
				
				// WE DISPLAY THE PRESENCE IN THE CHAT
					if($.exists("#" + hash)) {
						// We get the status message
						if(status != '')
							var sMessage = ' (' + status + ')';
						else
							var sMessage = '';
						
						// We show the presence value
						$("#" + hash + " .buddy-infos").replaceWith(
							'<p class="buddy-infos ' + type + '">' + value + sMessage + '</p>'
						);
					}
				
				// WE DISPLAY THE PRESENCE IN THE SWITCHER
					if($.exists('#chat-switch .' + hash)) {
						// We remove all the possible icons
						$('#chat-switch .' + hash + ' .icon').removeClass('available away busy disconnected');
						
						// We apply the new icon
						$('#chat-switch .' + hash + ' .icon').addClass(type);
					}
			}
			
			function presenceIA(type, show, status, hash, jid, ref) {
				// We first hide the extra options to avoid display errors
				$('#buddy-list .' + hash + ' .buddyRename, #buddy-list .' + hash + ' .buddyManage').hide();
				
				// Then we can handle the events
				if(type == 'subscribe')
					handleSubscribe(jid, 'subscribe');
				else if(type == 'subscribed')
					handleSubscribe(jid, 'subscribed');
				else if(type == 'unsubscribe')
					handleUnsubscribe(jid);
				else if(type == 'error')
					displayPresence(getTranslation(36), 'error', show, status, hash, jid, ref);
				else if(type == 'unavailable')
					displayPresence(getTranslation(19), 'disconnected', show, status, hash, jid, ref);
				else {
					switch(show) {
						case 'chat':
							displayPresence(getTranslation(15), 'available', show, status, hash, jid, ref);
							break;
						
						case 'away':
							displayPresence(getTranslation(16), 'away', show, status, hash, jid, ref);
							break;
						
						case 'xa':
							displayPresence(getTranslation(17), 'busy', show, status, hash, jid, ref);
							break;
						
						case 'dnd':
							displayPresence(getTranslation(18), 'busy', show, status, hash, jid, ref);
						
						default:
							displayPresence(getTranslation(14), 'available', show, status, hash, jid, ref);
							break;
					}
				}
			}
			
			function presenceFunnel(type, show, status, hash, jid, ref) {
				if (!type && !show && ref == 'roster')  {
					presenceIA('available', '', '', hash, jid, ref);
				}
				
				else {
					if (type && type != '') {
						presenceIA(type, show, status, hash, jid, ref);
					}
					
					else {
						presenceIA(show, show, status, hash, jid, ref);
					}
				}
			}
		// END PRESENCE FUNCTIONS
			
		// BEGIN CONNECTION FUNCTIONS
			function setupCon(con) {
				// We setup all the necessary handlers for the connection
				con.registerHandler('message',handleMessage);
				con.registerHandler('presence',handlePresence);
				con.registerHandler('iq', handleIQ);
				con.registerHandler('onconnect',handleConnected);
				con.registerHandler('onerror',handleError);
				con.registerHandler('ondisconnect',handleDisconnected);
			}
			
			function disconnect() {
				var p = new JSJaCPresence();
				p.setType("unavailable");
				con.send(p);
				con.disconnect();
			}
			
			// When the user wants to disconnect from his account
			function quit() {
				// We disconnect from the Jabber server
				disconnect();
				pageTitle('home');
				
				// We renitalise the html markup as its initiale look
				$(".removable").remove();
				$(".showable").show();
				$(".hidable").hide();
				$(".resetable").val("");
				$("#general-wait").hide();
				
				// We reset values for dynamic things
				$("#l-server, #r-server").val(getHost("main"));
				$(".twitter-share").attr("href", getTranslation(5));
			}
			
			function normalQuit() {
				// We quit the current session
				quit();
				
				// We show an info
				openThisInfo(3);
			}
			
			onerror = function(e) { 
				if (con && con.connected())
					openThisError(25);
				return false; 
			};
		// END CONNECTION FUNCTIONS
			
		// BEGIN AUDIO FUNCTIONS
			function soundPlay(num) {
				dataRead = $("#data-store .options .sounds").val();
				
				// If the sounds are enabled
				if(dataRead == 'on') {
					// If the audio elements aren't yet in the DOM
					if(!$.exists("#audio")) {
						$("#data-store").after(
						'<!-- BEGIN AUDIO -->' + 
							'<div id="audio">' + 
								'<audio id="buddy-connect" src="./snd/buddy-connect.oga" type="audio/ogg" />' + 
								'<audio id="buddy-disconnect" src="./snd/buddy-disconnect.oga" type="audio/ogg" />' + 
								'<audio id="new-chat" src="./snd/new-chat.oga" type="audio/ogg" />' + 
								'<audio id="receive-message" src="./snd/receive-message.oga" type="audio/ogg" />' + 
								'<audio id="send-message" src="./snd/send-message.oga" type="audio/ogg" />' + 
							'</div>' + 
						'<!-- END AUDIO -->'
						);
					}
					
					// We play the target sound
					var playThis = document.getElementsByTagName("audio")[num];
					playThis.load();
					playThis.play();
				}
			}
		// END AUDIO FUNCTIONS
		
		// BEGIN VIDEO FUNCTIONS
			function applyVideoBox() {
				$('.video-link').fancybox({
					'frameWidth': 640,
					'frameHeight': 385,
					'hideOnContentClick': false,
					'centerOnScroll': true,
					'imageScale': true,
					'padding': 5
				});
			}
		// END VIDEO FUNCTIONS
		
		// BEGIN FILTERING FUNCTIONS
			function filterThisMessage(neutralMessage, nick) {
				var filteredMessageA = neutralMessage
				
				// We replace the shortcuts
				.replace(/^\/me /,'*' + nick + ' ')
				
				// We replace the html symbols by ones that will hurt nothing !
				.replace(/&/g,"&amp;")
				.replace(/</g,"&lt;")
				.replace(/>/g,"&gt;")
				
				// We replace the smilies text into images
				.replace(/:-@/g,"</p></p><div class=\"emoticon emoticon-space emoticon-angry\"></div><p>")
				.replace(/:-\[/g,"</p><div class=\"emoticon emoticon-space emoticon-bat\"></div><p>")
				.replace(/\(B\)/g,"</p><div class=\"emoticon emoticon-space emoticon-beer\"></div><p>")
				.replace(/:-D/g,"</p><div class=\"emoticon emoticon-space emoticon-biggrin\"></div><p>")
				.replace(/:D/g,"</p><div class=\"emoticon emoticon-space emoticon-biggrin\"></div><p>")
				.replace(/xD/g,"</p><div class=\"emoticon emoticon-space emoticon-biggrin\"></div><p>")
				.replace(/XD/g,"</p><div class=\"emoticon emoticon-space emoticon-biggrin\"></div><p>")
				.replace(/:-\$/g,"</p><div class=\"emoticon emoticon-space emoticon-blush\"></div><p>")
				.replace(/\(Z\)/g,"</p><div class=\"emoticon emoticon-space emoticon-boy\"></div><p>")
				.replace(/\(W\)/g,"</p><div class=\"emoticon emoticon-space emoticon-brflower\"></div><p>")			
				.replace(/&lt;\/3/g,"</p><div class=\"emoticon emoticon-space emoticon-brheart\"></div><p>")			
				.replace(/\(C\)/g,"</p><div class=\"emoticon emoticon-space emoticon-coffee\"></div><p>")			
				.replace(/8-\)/g,"</p><div class=\"emoticon emoticon-space emoticon-coolglasses\"></div><p>")
				.replace(/:'-\(/g,"</p><div class=\"emoticon emoticon-space emoticon-cry\"></div><p>")
				.replace(/\(%\)/g,"</p><div class=\"emoticon emoticon-space emoticon-cuffs\"></div><p>")
				.replace(/\]:-&gt;/g,"</p><div class=\"emoticon emoticon-space emoticon-devil\"></div><p>")			
				.replace(/\(D\)/g,"</p><div class=\"emoticon emoticon-space emoticon-drink\"></div><p>")
				.replace(/@}-&gt;--/g,"</p><div class=\"emoticon emoticon-space emoticon-flower\"></div><p>")
				.replace(/:-\//g,"</p><div class=\"emoticon emoticon-space emoticon-frowning\"></div><p>")	
				.replace(/:S/g,"</p><div class=\"emoticon emoticon-space emoticon-frowning\"></div><p>")
				.replace(/\(X\)/g,"</p><div class=\"emoticon emoticon-space emoticon-girl\"></div><p>")
				.replace(/&lt;3/g,"</p><div class=\"emoticon emoticon-space emoticon-heart\"></div><p>")
				.replace(/\(}\)/g,"</p><div class=\"emoticon emoticon-space emoticon-hugleft\"></div><p>")			
				.replace(/\({\)/g,"</p><div class=\"emoticon emoticon-space emoticon-hugright\"></div><p>")			
				.replace(/:-{}/g,"</p><div class=\"emoticon emoticon-space emoticon-kiss\"></div><p>")
				.replace(/\(I\)/g,"</p><div class=\"emoticon emoticon-space emoticon-lamp\"></div><p>")
				.replace(/:3/g,"</p><div class=\"emoticon emoticon-space emoticon-lion\"></div><p>")
				.replace(/\(E\)/g,"</p><div class=\"emoticon emoticon-space emoticon-mail\"></div><p>")
				.replace(/\(S\)/g,"</p><div class=\"emoticon emoticon-space emoticon-moon\"></div><p>")
				.replace(/\(8\)/g,"</p><div class=\"emoticon emoticon-space emoticon-music\"></div><p>")
				.replace(/=-O/g,"</p><div class=\"emoticon emoticon-space emoticon-oh\"></div><p>")
				.replace(/\(T\)/g,"</p><div class=\"emoticon emoticon-space emoticon-phone\"></div><p>")
				.replace(/\(P\)/g,"</p><div class=\"emoticon emoticon-space emoticon-photo\"></div><p>")
				.replace(/:-!/g,"</p><div class=\"emoticon emoticon-space emoticon-puke\"></div><p>")
				.replace(/\(@\)/g,"</p><div class=\"emoticon emoticon-space emoticon-pussy\"></div><p>")
				.replace(/\(R\)/g,"</p><div class=\"emoticon emoticon-space emoticon-rainbow\"></div><p>")			
				.replace(/:-\)/g,"</p><div class=\"emoticon emoticon-space emoticon-smile\"></div><p>")
				.replace(/:\)/g,"</p><div class=\"emoticon emoticon-space emoticon-smile\"></div><p>")
				.replace(/\(\*\)/g,"</p><div class=\"emoticon emoticon-space emoticon-star\"></div><p>")
				.replace(/:-\|/g,"</p><div class=\"emoticon emoticon-space emoticon-stare\"></div><p>")
				.replace(/\(N\)/g,"</p><div class=\"emoticon emoticon-space emoticon-thumbdown\"></div><p>")			
				.replace(/\(Y\)/g,"</p><div class=\"emoticon emoticon-space emoticon-thumbup\"></div><p>")			
				.replace(/:-P/g,"</p><div class=\"emoticon emoticon-space emoticon-tongue\"></div><p>")
				.replace(/:P/g,"</p><div class=\"emoticon emoticon-space emoticon-tongue\"></div><p>")
				.replace(/:-\(/g,"</p><div class=\"emoticon emoticon-space emoticon-unhappy\"></div><p>")			
				.replace(/:\(/g,"</p><div class=\"emoticon emoticon-space emoticon-unhappy\"></div><p>")
				.replace(/;-\)/g,"</p><div class=\"emoticon emoticon-space emoticon-wink\"></div><p>")
				.replace(/;\)/g,"</p><div class=\"emoticon emoticon-space emoticon-wink\"></div><p>");
				
				// YouTube video box
				if(filteredMessageA.match(/[\S]+(\b|$)youtube\.com\/watch\?v\=([\w\-]+)/))
					var filteredMessageB = filteredMessageA.replace(/[\S]+(\b|$)youtube\.com\/watch\?v\=([\w\-]+)/gim,'<a class="video-link" href="./php/chatengine-video-embed.php?id=$2&amp;service=youtube">[⌘ YouTube]</a>');
				
				// DailyMotion video box
				else if(filteredMessageA.match(/[\S]+(\b|$)dailymotion\.com\/video\/([\w\-]+)/))
					var filteredMessageB = filteredMessageA.replace(/[\S]+(\b|$)dailymotion\.com\/video\/([\w\-]+)/gim,'<a class="video-link" href="./php/chatengine-video-embed.php?id=$2&amp;service=dailymotion">[⌘ DailyMotion]</a>');
				
				// Vimeo video box
				else if(filteredMessageA.match(/[\S]+(\b|$)vimeo\.com\/([\w\-]+)/))
					var filteredMessageB = filteredMessageA.replace(/[\S]+(\b|$)vimeo\.com\/([\w\-]+)/gim,'<a class="video-link" href="./php/chatengine-video-embed.php?id=$2&amp;service=vimeo">[⌘ Vimeo]</a>');
				
				// Simple link
				else
					var filteredMessageB = filteredMessageA.replace(/([^\/])(www[\S]+(\b|$))/gim,'$1<a href="http://$2" target="_blank">$2</a>')
					.replace(/<br>/gim, '\n')
					.replace(/(ftp|http|https|file|ssh|irc|xmpp|apt):\/\/[\S]+(\b|$)/gim,'<a href="$&" target="_blank">$&</a>');
				
				var filteredMessage = filteredMessageB;
				
				return filteredMessage;
			}
		// END FILTERING FUNCTIONS
		
		// BEGIN THE CHAT FUNCTIONS
			function sendMessage(aForm, type) {
				// We just get the JID of the user logged in
				getJID();
				
				// If the user didn't entered any message, stop
				if (aForm.msg.value == '' || aForm.sendTo.value == '')
					return false;
			  	
				// Define who will receive the message
				if (aForm.sendTo.value.indexOf('@') == -1)
					aForm.sendTo.value += '@' + con.domain;
			  	
				try {
					// We send the message through the XMPP network
					var aMsg = new JSJaCMessage();
					var body = aForm.msg.value;
					var jid = aForm.sendTo.value;
					aMsg.setTo(jid);
					aMsg.setFrom(userJID);
					
					if(type == 'chat') {
						aMsg.setType('chat');
						aMsg.setBody(body);
						aMsg.appendNode('active', {'xmlns': 'http://jabber.org/protocol/chatstates'});
						con.send(aMsg);
						
						// We play a send sound
						soundPlay(4);
					}
					
					else if(type == 'groupchat') {
						// We check if the message is not a shortcut like /topic
						if (body.match(/^\/say (.+)/)) {
							// Say
							body = body.replace(/^\/say (.+)/, '$1');
							aMsg.setType('groupchat');
							aMsg.setBody(body);
							con.send(aMsg);
						}
						
						else if (body.match(/^\/clear/)) {
							// Clear
							var hash = hex_md5(jid);
							cleanChat(hash);
						}
						
						else if (body.match(/^\/nick (.+)/)) {
							// Nick
							var nick = body.replace(/^\/nick (.+)/, '$1');
							var aPresence = new JSJaCPresence();
							aPresence.setTo(jid + '/' + nick);
							con.send(aPresence);
						}
						
						else if (body.match(/^\/topic (.+)/)) {
							// Topic
							var topic = body.replace(/^\/topic (.+)/, '$1');
							aMsg.setType('groupchat');
							aMsg.setSubject(topic);
							con.send(aMsg);
						}
						
						else if (body.match(/^\/ban (\S+)\s*(.*)/)) {
							// Ban
							var nick = RegExp.$1;
							var reason = RegExp.$2;
							var hash = hex_md5(jid);
							var nJid = $('#' + hash + ' .userJid-' + nick).val();
							
							// We check if the user to ban exists
							if (nJid == undefined) {
								openThisInfo(7);
							}
							
							else {
								// We generate the ban IQ
								var iq = new JSJaCIQ();
								iq.setTo(jid);
								iq.setType('set');
								
								var iqQuery = iq.setQuery('http://jabber.org/protocol/muc#admin');
								var item = iqQuery.appendChild(iq.getDoc().createElement('item'));
								item.setAttribute('affiliation', 'outcast');
								item.setAttribute('jid', nJid);
								
								if(reason)
									item.appendChild(iq.getDoc().createElement('reason')).appendChild(iq.getDoc().createTextNode(reason));
								
								con.send(iq);
							}
						}
						
						else if (body.match(/^\/kick (\S+)\s*(.*)/)) {
							// Kick
							var nick = RegExp.$1;
							var reason = RegExp.$2;
							var hash = hex_md5(jid);
							var nJid = $('#' + hash + ' .userJid-' + nick).val();
							
							// We check if the user to kick exists
							if (nJid == undefined) {
								openThisInfo(7);
							}
							
							else {
								// We generate the kick IQ
								var iq = new JSJaCIQ();
								iq.setTo(jid);
								iq.setType('set');
								
								var iqQuery = iq.setQuery('http://jabber.org/protocol/muc#admin');
								var item = iqQuery.appendChild(iq.getDoc().createElement('item'));
								item.setAttribute('nick', nick);
								item.setAttribute('role', 'none');
								
								if(reason)
									item.appendChild(iq.getDoc().createElement('reason')).appendChild(iq.getDoc().createTextNode(reason));
								
								con.send(iq);
							}
						}
						
						else if (body.match(/^\/invite (\S+)\s*(.*)/)) {
							// Invite
							var jid = RegExp.$1;
							var reason = RegExp.$2;
							
							var x = aMsg.appendNode('x', {'xmlns': 'http://jabber.org/protocol/muc#user'});
							var aNode = x.appendChild(aMsg.getDoc().createElement('invite'));
							aNode.setAttribute('to', jid);
							if (reason && reason != '')
								aNode.appendChild(aMsg.getDoc().createElement('reason')).appendChild(aMsg.getDoc().createTextNode(reason));
							
							con.send(aMsg);
						}
						
						else if (body.match(/^\/join (\S+)\s*(.*)/)) {
							// Join
							var room = RegExp.$1;
							var pass = RegExp.$2;
							checkChatCreate(room, 'groupchat');
						}
						
						else if (body.match(/^\/msg (\S+)\s*(.*)/)) {
							// Message
							var nick = RegExp.$1;
							var body = RegExp.$2;
							var hash = hex_md5(jid);
							var nJid = $('#' + hash + ' .userJid-' + nick).val();
							
							// We check if the user to kick exists
							if (nJid == undefined) {
								openThisInfo(7);
							}
							
							// If the private message is not empty
							else if(body) {
								aMsg.setType('chat');
								aMsg.setTo(jid);
								aMsg.setBody(body);
								con.send(aMsg);
							}
							
							else {
								openThisInfo(8);
							}
						}
						
						else if (body.match(/^\/part\s*(.*)/)) {
							// Part
							var hash = hex_md5(jid);
							quitThisChat(jid, hash, 'groupchat');
						}
						
						else {
							aMsg.setType('groupchat');
							aMsg.setBody(body);
							con.send(aMsg);
						}
					}
					
					// We define where to display it and some other stuffs
					var dateOfTheMessage = getCompleteTime();
					var writeOnDivHash = hex_md5("" + aForm.sendTo.value + "");
					var writeOnDiv = "#" + writeOnDivHash + " .content .thisFalseDivIsForJQuery";
					
					// We filter the sent message for the display
					var filteredMessage = filterThisMessage(aForm.msg.value, getNick());
					
					if(type != 'groupchat') {
						// Finally we display the message we juste sent
						$(writeOnDiv).before('<div class="one-line user-message"><p><em>(' + dateOfTheMessage + ') </em><b class="me">' + getTranslation(37) + ' : </b> ' + filteredMessage + '</p></div>');
					}
					
					// We apply the videobox
					applyVideoBox();
					
					// Scroll to the last message
					autoScroll(writeOnDivHash);
					
					// We reset the message input
					aForm.msg.value = '';
					
					return false;
				}
				
				catch (e) {
					// We catch the errors if there are some...
					alert(e);
					return false;
				}
			}
			
			// Here we have all the necessary functions to open a new custom chat !
			$(document).ready(function() {
				// Define what user to send a message in the case of a custome chat
				function openNewChat(e) {
					if(e.keyCode == 13) {
						var valueSendToJID = $(".newchan-pm-sendToJID").val();
						var valueSendToServer = $(".newchan-pm-sendToServer").val();
						var sendToJID = valueSendToJID + '@' + valueSendToServer;
					
						if (valueSendToJID == '' || valueSendToServer == '')
							return false;
					
						else {
							checkChatCreate(sendToJID, 'chat');
							$(".newchan-pm-sendToJID").val('');
							$(".newchan-pm-sendToServer").val(getHost('main'));
						}
					}
				}
				
				// Define what custom muc room to join
				function openNewMUC(e) {
					if(e.keyCode == 13) {
						var valueConnectToRoom = $(".newchan-muc-connectToRoom").val();
						var valueConnectToMUCServer = $(".newchan-pm-connectToMUCServer").val();
						var connectToThis = valueConnectToRoom + '@' + valueConnectToMUCServer;
					
						if (valueConnectToRoom == '' || valueConnectToMUCServer == '')
							return false;
					
						else {
							checkChatCreate(connectToThis, 'groupchat');
							$(".newchan-muc-connectToRoom").val('');
							$(".newchan-pm-connectToMUCServer").val(getHost('muc'));
						}
					}
				}
				
				// Tell us if the user wants to send what he just typed
					// For the private chats
					$(".newchan-pm-sendToJID").keyup(function(e) {
						openNewChat(e);
					});
				
					$(".newchan-pm-sendToServer").keyup(function(e) {
						openNewChat(e);
					});
					
					// For the MUC chats
					$(".newchan-muc-connectToRoom").keyup(function(e) {
						openNewMUC(e);
					});
				
					$(".newchan-pm-connectToMUCServer").keyup(function(e) {
						openNewMUC(e);
					});
			});
			
			function openFromRoster(jid, hash) {
				if(!$('#buddy-list .' + hash).hasClass('frozen'))
					checkChatCreate(jid, 'chat');
			}
			
			function switcherScroll() {
				if($('#chat-switch .switcher').length > 9)
					$('#chat-switch .channels').addClass('chan-scroll');
				else
					$('#chat-switch .channels').removeClass('chan-scroll');
			}
			
			function checkChatCreate(sendToJID, typeOfChat) {
				var sendToJIDDIVHashable = "" + sendToJID + "";
				var sendToJIDDIVHash = hex_md5(sendToJIDDIVHashable);
				var noHashSendToJIDDIV = sendToJID;
				
				// Gets the nickname of the user
				var splittingJID = noHashSendToJIDDIV + '"';
				var splittedMessageToNick = splittingJID.split("@");
				var messageToNick = splittedMessageToNick[0];
				
				// Check if the target div exists, so that the script will not create a new one !
				var DIVtoJIDHash = '#' + sendToJIDDIVHash;
				
				if (!$.exists(DIVtoJIDHash)) {
					// We check the type of the chat to open
					if(typeOfChat == 'chat')
						chatCreate(sendToJIDDIVHash, noHashSendToJIDDIV, messageToNick);
					else if(typeOfChat == 'groupchat')
						groupchatCreate(sendToJIDDIVHash, noHashSendToJIDDIV, messageToNick);
					else
						openThisError(3);
					
					// We check if a scrollbar's needed for the switcher
					switcherScroll();
				}
				
				else {
					// Else we focus on the yet created chat
					switchChan(sendToJIDDIVHash);
				}
			}
			
			function cleanChat(chat) {
				$('#chat-engine #' + chat + ' .content .one-line').remove();
				$('#chat-engine #' + chat + ' .text .message-area').focus();
			}
			
			function chatCreate(friendJID, noHashfriendJID, friendName) {		
				// We copy the sample chat div
				$("#sample-elements .sample-chat").clone().insertAfter('#newchan');
				$("#sample-elements .sample-chan").clone().insertAfter('#chat-switch .thisFalseChanIsForJQuery');
				
				// We set the good id and class and remove the old sample class
				$('#chat-switch .content .channels .sample-chan').addClass(friendJID).addClass("removable");
				$('#chat-switch .content .channels .sample-chan').removeClass("sample-chan");
				$("#chat-switch .content .channels ." + friendJID + " a").text(friendName);
				$("#chat-engine .sample-chat").attr("id", friendJID).addClass("removable");
				$('#chat-engine .sample-chat').removeClass("sample-chat");
				$("#chat-switch .channels ." + friendJID + " .icon").addClass('disconnected');
				
				// We put the good values into the sample div
				var currentChat = "#chat-engine #" + friendJID;
				$(currentChat + " .top .name .buddy-name").text(friendName);
				$(currentChat + " .content").attr("id", "chatContentFor" + friendJID);
				$(currentChat + " .text .send-to").attr("value", noHashfriendJID);
				$(currentChat + " .text .tooltip-insert-smiley").after(smileyLinks(friendJID));
				
				var switchPath = '#chat-switch .channels .' + friendJID;
				
				$(switchPath + ' .icon, ' + switchPath + ' .name').click(function() {
					switchChan(friendJID);
				});
				
				$(switchPath + ' .exit, ' + currentChat + ' .text .tools-close').click(function() {
					quitThisChat(noHashfriendJID, friendJID, 'chat');
				});
				
				$(currentChat + " .text .tools-clear").click(function() {
					cleanChat(friendJID);
				});
				
				$(currentChat + " .text .tooltip-right-dchat").click(function() {
					downloadChat(noHashfriendJID);
				});
				
				// We catch the user's informations (like this avatar, vcard, and so and so...)
				getUserInfos(friendJID, noHashfriendJID);
				
				// We tell our friend that we've created the chat
				chatStateSend('active', noHashfriendJID);
				
				// The icons-click functions
				tooltipIcons(friendJID);
				
				// The chan-clic function
				chanClick(friendJID);
				
				// The composing notification needed stuffs
				var inputDetect = "#chat-engine #" + friendJID + " .text .message-area";
				var stateDetect = '#data-store .chatstates .' + friendJID;
				
				$('#data-store .chatstates').prepend('<input class="chatstate removable ' + friendJID + '" type="hidden" />');
				
				$(inputDetect).keypress(function() {
					if($(stateDetect).val() != 'on') {
						$(stateDetect).val('on');
						chatStateSend('composing', noHashfriendJID);
					}
				});
				
				$(inputDetect).change(function() {
					$(stateDetect).val('off');
					chatStateSend('paused', noHashfriendJID);
				});
				
				// Finally, we switch to the created div
				switchChan(friendJID);
			}
			
			function displayMucAdmin(affiliation, id, jid, statuscode) {
				// We check if the user is the room admin to give him privileges
				if(affiliation == 'owner') {
					$("#" + id + " .tools-topic").show();
					$("#" + id + " .tools-mucadmin").show();
				}
				
				// We check if the room hasn't been yet created
				if(statuscode == '201') {
					openThisInfo(5);
				}
				
				// We add the click event
				$("#" + id + " .tools-mucadmin").click(function() {
					openMucAdmin(jid);
				});
			}
			
			function getMUC(room) {
				getJID();
				var userNick = getNick();
				
				var aPresence = new JSJaCPresence();
				aPresence.setFrom(userJID);
				aPresence.setTo(room + '/' + userNick);
				aPresence.appendNode('x',{'xmlns': 'http://jabber.org/protocol/muc'});
				me = this;
				con.send(aPresence,me.handleMUC);
			}
			
			function handleMUC(aPresence) {
				// We get the presence content
				var xml = aPresence.getNode();
				var from = '' + aPresence.getFromJID() + '';
				var splitted = from.split('/');
				var room = splitted[0];
				var roomHash = hex_md5(room);
				var hash = hex_md5(from);
				var show = aPresence.getShow();
				var status = aPresence.getStatus();
				var role = $(xml).find('item').attr('role');
				var affiliation = $(xml).find('item').attr('affiliation');
				var statuscode = $(xml).find('status').attr('code');
				
				// We display the presence
				displayMucPresence(from, roomHash, hash, show, status, affiliation, role);
				displayMucAdmin(affiliation, roomHash, room, statuscode);
			}
			
			function generateColour(jid) {
				var colors = new Array('b1af75','83d08e','ecc866','698dc9','9b6d8e','6ea4ae','c87b6e','476a3b');
				
				var number = 0;
				    for (var i=0; i<jid.length; i++)
				      number += jid.charCodeAt(i);
				    
				var color = '#' + colors[number%(colors.length)];
				
				return color;
			}
			
			function groupchatCreate(hash, room, chan) {
				/* REF : http://xmpp.org/extensions/xep-0045.html */
				
				// We set the groupchat infos in the data-storer
				$('#data-store .groupchats').prepend('<input class="groupchats removable ' + hash + '" type="hidden" />');
				$("#data-store .groupchats ." + hash).val("<MUC><room>" + room + "</room><name>" + chan + "</name><hash>" + hash + "</hash></MUC>");
				
				// We copy the sample chat div
				$("#sample-elements .sample-groupchat").clone().insertAfter('#newchan');
				$("#sample-elements .sample-chan").clone().insertAfter('#chat-switch .thisFalseChanIsForJQuery');
				
				// We set the good id and class and remove the old sample class
				$('#chat-switch .content .channels .sample-chan').addClass(hash).addClass("removable");
				$('#chat-switch .content .channels .sample-chan').removeClass("sample-chan");
				$("#chat-switch .content .channels ." + hash + " a").text(chan);
				$("#chat-engine .sample-groupchat").attr("id", hash).addClass("removable");
				$('#chat-engine .sample-groupchat').removeClass("sample-groupchat");
				
				// We put the good values into the sample div
				var currentChat = "#chat-engine #" + hash;
				$(currentChat + " .top .name .buddy-name").text(chan);
				$(currentChat + " .content").attr("id", "chatContentFor" + hash);
				$(currentChat + " .text .send-to").attr("value", room);
				$(currentChat + " .text .tooltip-insert-smiley").after(smileyLinks(hash));
				$("#chat-switch .channels ." + hash + " .icon").addClass('groupchat-default');
				
				var switchPath = '#chat-switch .channels .' + hash;
				
				$(switchPath + ' .icon, ' + switchPath + ' .name').click(function() {
					switchChan(hash);
				});
				
				$(switchPath + ' .exit, ' + currentChat + ' .text .tools-close').click(function() {
					quitThisChat(room, hash, 'groupchat');
				});
				
				$(currentChat + " .text .tools-clear").click(function() {
					cleanChat(hash);
				});
				
				$(currentChat + " .text .tooltip-right-dchat").click(function() {
					downloadChat(room);
				});
				
				// The icons-click functions
				tooltipIcons(hash);
				
				// The chan-clic function
				chanClick(hash);
				
				// We switch to the create div
				switchChan(hash);
				
				// Get the current muc informations and content
				getMUC(room);
			}
		// END THE CHAT FUNCTIONS
			
		// BEGIN USER INFOS FUNCTIONS
			// This function can be called everytime to get the user's defined name
			function getBuddyName(jid) {
				var hash = hex_md5(jid);
				var stored = $('#data-store .roster .' + hash).val();
				var cname = $(stored).find('name').text();
				
				// If the complete name exists
				if(cname != '') {
					var bname = cname;
				}
				
				// Else, we just get the nickname of the buddy
				else {
					var splitted = jid.split("@");
					var bname = splitted[0];
				}
				
				return bname;
			}
			
			// These functions get the user's informations when creating a new chat
			function getUserInfos(hash, jid) {
				var userInfos = $("#data-store .vcard ." + hash).val();
				
				// If the user infos are yet stored (cached in fact) on our data-base
				if(userInfos != undefined) {
					handleUserInfos(userInfos, jid, hash);
				}
				
				// Else we request the infos to the server
				else {
					// We just get the JID of the user logged in
					getJID();
					
					// And we retrieve the infos
					var iq = new JSJaCIQ();
					iq.setType('get');
					iq.setTo(jid);
					iq.setFrom(userJID);
					iq.appendNode('vCard', {'xmlns': 'vcard-temp'});
					me = this;
					con.send(iq,me.handleUserInfosIQ);
				}
			}
			
			function handleUserInfosIQ(iq) {
				var handleXML = iq.getNode();
				var handleFrom = iq.getFrom();
				var uHash = hex_md5(handleFrom);
				
				// If we got the data return
				if($(handleXML).find('vCard').text() != '' || $(handleXML).find('vcard').text() != '') {
					handleUserInfos(handleXML, handleFrom, uHash);
				}
				
				// If there were an error
				else {
					handleUserInfos('', handleFrom, uHash);
				}
			}
			
			function handleUserInfos(handleXML, handleFrom, uHash) {
				// We get the friend name
				var bName = getBuddyName(handleFrom);
				
				// We get the user presence if stored
				if($.exists('#data-store .presence .' + uHash)) {
					var pParam = $('#data-store .presence .' + uHash).val();
					var pShow = $(pParam).find('show').text();
					var pType = $(pParam).find('type').text();
					var pStatus = $(pParam).find('status').text();
				}
				
				// Else, the buddy is offline
				else {
					var pShow = '';
					var pType = 'unavailable';
					var pStatus = '';
				}
				
				// We get the civility
				var nComplete = $(handleXML).find('FN').text();
				var nBirthday = $(handleXML).find('BDAY').text();
				
				// We get the contact infos
				var cMail = $(handleXML).find('USERID').text();
				var cPhone = $(handleXML).find('NUMBER').text();
				var cSite = $(handleXML).find('URL').text();
				
				// We get the avatar
				var aType = $(handleXML).find('TYPE').text();
				var aBinval = $(handleXML).find('BINVAL').text();
				
				// We get the postal adress
				var pLocality = $(handleXML).find('LOCALITY').text();
				var pCountry = $(handleXML).find('CTRY').text();
				
				// We check if the website url is okay (if there's one)
				if((cSite.indexOf('http://') == -1) && (cSite != ''))
					cSite = 'http://' + cSite;
				
				// We define the corresponding html markup of each value
				var NewnComplete = '<p style="text-decoration: underline; font-weight: bold;"><span>' + nComplete + '</span></p>';
				var NewnBirthday = '<p><b>' + getTranslation(6) + '</b><span>' + nBirthday + '</span></p>';
				var NewcMail = '<p><b>' + getTranslation(7) + '</b><em><span><a href="mailto:' + cMail + '" target="_blank">' + cMail + '</a></span></em></p>';
				var NewcPhone = '<p><b>' + getTranslation(8) + '</b><em><span>' + cPhone + '</span></em></p>';
				var NewcSite = '<p><b>' + getTranslation(9) + '</b><em><span><a href="' + cSite + '" target="_blank">' + cSite + '</a></span></em></p>';
				var NewpLocality = '<p><b>' + getTranslation(10) + '</b><em><span>' + pLocality + '</span></em></p>';
				var NewpCountry = '<p><b>' + getTranslation(11) + '</b><em><span>' + pCountry + '</span></em></p>';
				
				// We set a default value if an information is missing
				if(nComplete == '')
					NewnComplete = '<p style="text-decoration: underline; font-weight: bold;">' + getTranslation(12) + '</p>';
				if(nBirthday == '')
					NewnBirthday = '<p><b>' + getTranslation(6) + '</b>' + getTranslation(12) + '</p>';
				if(cMail == '')
					NewcMail = '<p><b>' + getTranslation(7) + '</b><em>' + getTranslation(12) + '</em></p>';
				if(cPhone == '')
					NewcPhone = '<p><b>' + getTranslation(8) + '</b><em>' + getTranslation(12) + '</em></p>';
				if(cSite == '')
					NewcSite = '<p><b>' + getTranslation(9) + '</b><em>' + getTranslation(12) + '</em></p>';
				if(pLocality == '')
					NewpLocality = '<p><b>' + getTranslation(10) + '</b><em>' + getTranslation(13) + '</em></p>';
				if(pCountry == '')
					NewpCountry = '<p><b>' + getTranslation(11) + '</b><em>' + getTranslation(12) + '</em></p>';
				
				displayUserInfos(handleFrom, uHash, NewnComplete, NewnBirthday, NewcMail, NewcPhone, NewcSite, aType, aBinval, NewpLocality, NewpCountry, bName, pShow, pType, pStatus);
			}
			
			function displayUserInfos(handleFrom, uHash, NewnComplete, NewnBirthday, NewcMail, NewcPhone, NewcSite, aType, aBinval, NewpLocality, NewpCountry, bName, pShow, pType, pStatus) {
				// We display the user's name
				if(bName != '') {
					$("#" + uHash + " .top .name .buddy-name").text(bName);
					$("#chat-switch ." + uHash + " a").text(bName);
				}
				
				// |||||||||||||||||||||||||||||||||||||||||||||||||||
				// ||||||| WARNING ! THIS IS A FUNCTION TODO ! |||||||
				// |||||||||||||||||||||||||||||||||||||||||||||||||||
				
				// We display the user's pubsub
				// TODO
				
				// We display the user's presence
				presenceFunnel(pType, pShow, pStatus, uHash, handleFrom, 'chat')
				
				// We display the user's avatar
				var aPath = "#" + uHash + " .top .avatar-container";
				$(aPath).replaceWith('<div class="avatar-container"><img class="avatar removable" src="data:' + aType + ';base64,' + aBinval + '" /></div>');
				
				// We display the user vCard (in a tooltip)
				var cAfterThisDiv = "#" + uHash + " .text .tools .left .tooltip .tooltip-right .thisFalseVCardDivIsForJQuery";
				$(cAfterThisDiv).after(NewnComplete + NewnBirthday + NewcMail + NewcPhone + NewcSite + NewpLocality + NewpCountry);
			}
		// END USER INFOS FUNCTIONS
			
		// BEGIN SMILEYS FUNCTIONS
			function smileyLinks(friendJID) {
				var links = '<div onclick="insertSmiley(\':-@\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-angry"></div>' + 
				'<div onclick="insertSmiley(\':-[\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-bat"></div>' + 
				'<div onclick="insertSmiley(\'(B)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-beer"></div>' + 
				'<div onclick="insertSmiley(\':-D\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-biggrin"></div>' + 
				'<div onclick="insertSmiley(\':-$\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-blush"></div>' + 
				'<div onclick="insertSmiley(\'(Z)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-boy"></div>' + 
				'<div onclick="insertSmiley(\'(W)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-brflower"></div>' + 
				'<div onclick="insertSmiley(\'</3\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-brheart"></div>' + 
				'<div onclick="insertSmiley(\'(C)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-coffee"></div>' + 
				'<div onclick="insertSmiley(\'8-)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-coolglasses"></div>' + 
				'<div onclick="insertSmiley(\':’-\(\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-cry"></div>' + 
				'<div onclick="insertSmiley(\'(%)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-cuffs"></div>' + 
				'<div onclick="insertSmiley(\']:->\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-devil"></div>' + 
				'<div onclick="insertSmiley(\'(D)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-drink"></div>' + 
				'<div onclick="insertSmiley(\'@}->--\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-flower"></div>' + 
				'<div onclick="insertSmiley(\':-/\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-frowning"></div>' + 
				'<div onclick="insertSmiley(\'(X)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-girl"></div>' + 
				'<div onclick="insertSmiley(\'<3\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-heart"></div>' + 
				'<div onclick="insertSmiley(\'(})\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-hugleft"></div>' + 
				'<div onclick="insertSmiley(\'({)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-hugright"></div>' + 
				'<div onclick="insertSmiley(\':-{}\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-kiss"></div>' + 
				'<div onclick="insertSmiley(\'(I)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-lamp"></div>' + 
				'<div onclick="insertSmiley(\':3\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-lion"></div>' + 
				'<div onclick="insertSmiley(\'(E)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-mail"></div>' + 
				'<div onclick="insertSmiley(\'(S)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-moon"></div>' + 
				'<div onclick="insertSmiley(\'(8)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-music"></div>' + 
				'<div onclick="insertSmiley(\'=-O\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-oh"></div>' + 
				'<div onclick="insertSmiley(\'(T)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-phone"></div>' + 
				'<div onclick="insertSmiley(\'(P)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-photo"></div>' + 
				'<div onclick="insertSmiley(\':-!\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-puke"></div>' + 
				'<div onclick="insertSmiley(\'(@)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-pussy"></div>' + 
				'<div onclick="insertSmiley(\'(R)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-rainbow"></div>' + 
				'<div onclick="insertSmiley(\':-)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-smile"></div>' + 
				'<div onclick="insertSmiley(\'(*)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-star"></div>' + 
				'<div onclick="insertSmiley(\':-|\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-stare"></div>' + 
				'<div onclick="insertSmiley(\'(N)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-thumbdown"></div>' + 
				'<div onclick="insertSmiley(\'(Y)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-thumbup"></div>' + 
				'<div onclick="insertSmiley(\':-P\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-tongue"></div>' + 
				'<div onclick="insertSmiley(\':-(\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-unhappy"></div>' + 
				'<div onclick="insertSmiley(\';-)\', \'' + friendJID + '\');" class="emoticon-select emoticon emoticon-wink"></div>';
				
				return links;
			}
		// BEGIN SMILEYS FUNCTIONS
		
		// BEGIN MESSAGES FUNCTIONS
			function messagesOpen() {
				$("#messages").show();
			}
			
			function messagesStore() {
				var hash = hex_md5(getJID());
				
				var iq = new JSJaCIQ();
				iq.setType('set');
				var query = iq.setQuery('jabber:iq:private');
				var storage = query.appendChild(iq.buildNode('storage', {'xmlns': 'jappix:messages'}));
				
				// We retrieve all the messages
				$("#data-store .messages input").each(function() {
					var value = $(this).val();
					var messageID = $(value).find('id').text();
					var messageFrom = $(value).find('from').text();
					var messageSubject = $(value).find('subject').text();
					var messageStatus = $(value).find('status').text();
					var messageContent = $(value).find('content').text();
					
					var oneMessage = storage.appendChild(iq.getDoc().createElement('message'));
					oneMessage.setAttribute('id',messageID);
					oneMessage.setAttribute('from',messageFrom);
					oneMessage.setAttribute('subject',messageSubject);
					oneMessage.setAttribute('status',messageStatus);
					oneMessage.appendChild(iq.getDoc().createTextNode(messageContent));
				});
				
				con.send(iq);
			}
			
			function messagesClose() {
				$("#messages").hide();
				
				// We reset the divs
				showMessages();
				
				// We get the inbox
				var content = $("#messages .messages-results .inbox").html();
				
				// We send to the database the new inbox
				messagesStore();
			}
			
			function newMessage() {
				// We switch the divs
				$("#messages .messages-results").hide();
				$("#messages .messages-new").show();
				
				// We show a new link in the menu
				$("#messages .a-new-message").hide();
				$("#messages .a-delete-messages").hide();
				$("#messages .a-show-messages").show();
				
				// We focus on the first input
				$("#messages .messages-new-user-input").focus();
				
				// We reset some stuffs
				cleanNewMessage();
			}
			
			function cleanNewMessage() {
				// We reset the forms
				$("#messages .messages-new input, #messages .messages-new textarea").val("");
				$("#messages .messages-new-server-input").val(getHost('main'));
				$("#messages .messages-new input, #messages .messages-new textarea").removeClass("please-complete");
				
				// We close an eventual opened message
				$("#messages .one-message-body").hide();
				$("#messages .one-message").removeClass("message-reading");
			}
			
			function normalMessageSender(to, from, subject, body) {
				// We send the message
				var mess = new JSJaCMessage();
				mess.setTo(to);
				mess.setFrom(from);
				mess.setSubject(subject);
				mess.setBody(body);
				mess.setType('normal');
				con.send(mess);
			}
			
			function sendThisMessage() {
				// We get some informations
				var user = $("#messages .messages-new-user-input").val();
				var server = $("#messages .messages-new-server-input").val();
				var body = $("#messages .messages-new-textarea").val();
				var subject = $("#messages .messages-new-subject-input").val();
				
				if(user != '' && server != '' && body != '' && subject != '') {
					var to = user + "@" + server;
					var from = getJID();
					
					// We send the message
					normalMessageSender(to, from, subject, body);
					
					// We clean the inputs
					cleanNewMessage();
				}
				
				else {
					if (user == '') {
						$("#messages .messages-new-user-input").addClass("please-complete");
					}
				
					if (server == '') {
						$("#messages .messages-new-server-input").addClass("please-complete");
					}
				
					if (body == '') {
						$("#messages .messages-new-textarea").addClass("please-complete");
					}
					
					if (subject == '') {
						$("#messages .messages-new-subject-input").addClass("please-complete");
					}
					
					if (user != '') {
						$("#messages .messages-new-user-input").removeClass("please-complete");
					}
					
					if (server != '') {
						$("#messages .messages-new-server-input").removeClass("please-complete");
					}
					
					if (body != '') {
						$("#messages .messages-new-textarea").removeClass("please-complete");
					}
					
					if (subject != '') {
						$("#messages .messages-new-subject-input").removeClass("please-complete");
					}
				}
			}
			
			$(document).ready(function() {
				// We activate the form
				$("#messages .messages-new input").keyup(function(e) {
					if(e.keyCode == 13) {
						sendThisMessage();
					}
				});
			});
			
			function showMessages() {
				// We switch the divs
				$("#messages .messages-new").hide();
				$("#messages .messages-results").show();
				
				// We show a new link in the menu
				$("#messages .a-show-messages").hide();
				$("#messages .a-delete-messages").show();
				$("#messages .a-new-message").show();
				
				// We reset some stuffs
				cleanNewMessage();
			}
			
			function messageFilter(ch) {
				var ch = ch.replace(/\n/g,"");
				ch = ch.replace(/&/g,"&amp;");
				ch = ch.replace(/</g,"&lt;");
				ch = ch.replace(/>/g,"&gt;");
				return ch;
			}
			
			function displayMessage(from, subject, content, status, id, type) {
				// We generate something that JS can understand
				var fSubject = messageFilter(subject);
				var fContent = messageFilter(content);
				
				// We generate the html code
				var nContent = '<div class="one-message message-' + status + ' ' + id + ' removable">' + 
							'<div class="message-jid" onclick="revealMessage(\'' + id + '\');">' + from + '</div>' + 
							'<div class="message-subject" onclick="revealMessage(\'' + id + '\');">' + subject + '</div>' + 
							'<a onclick="deleteThisMessage(\'' + id + '\');" class="message-remove">' + getTranslation(31) + '</a>' + 
						'</div>' + 
						
						'<div class="one-message-body one-message-body' + id + ' removable">' + 
							'<div class="message-body">' + content + '</div>' + 
							'<div class="message-meta">' + 
								'<a onclick="replyToThisMessage(\'' + id + '\');">' + getTranslation(32) + '</a>' + 
								'<a onclick="hideThisMessage(\'' + id + '\');">' + getTranslation(33) + '</a>' + 
							'</div>' + 
						'</div>';
				
				// We set the message to the index
				$("#messages .messages-results .inbox").prepend(nContent);
				
				// We tell the user with an icon that he has a message
				checkNewMessages();
				
				// We send to the database the new inbox
				var xml = '<message><id>' + id + '</id><from>' + from + '</from><subject>' + fSubject + '</subject><status>' + status + '</status><content>' + fContent + '</content></message>';
				$('#data-store .messages').prepend('<input class="' + id + ' removable" value="' + xml + '" />');
				
				if(type == 'fresh') {
					messagesStore();
				}
			}
			
			function deleteThisMessage(id) {
				$("#messages ." + id).remove();
				$("#messages .one-message-body" + id).remove();
				$('#data-store .messages .' + id).remove();
				checkNewMessages();
			}
			
			function deleteAllMessages() {
				$("#messages .one-message").remove();
				$("#messages .one-message-body").remove();
				$('#data-store .messages input').remove();
				checkNewMessages();
			}
			
			function checkNewMessages() {
				// If there's no more unread messages
				if($.exists("#messages .message-unread")) {
					$(".new-n-messages").fadeIn();
				}
				
				else {
					$(".new-n-messages").fadeOut();
				}
				
				// If there's no more messages, we show a message
				if($.exists("#messages .one-message")) {
					$("#messages .messages-noresults").hide();
				}
				
				else {
					$("#messages .messages-noresults").show();
				}
			}
			
			function revealMessage(id) {
				// We reset all the other messages
				$("#messages .one-message-body").hide();
				$("#messages .one-message").removeClass("message-reading");
				
				// We update the database
				var oldValue = $('#data-store .messages .' + id).val();
				var newValue = oldValue.replace(/<status>unread/g,"<status>read");
				$('#data-store .messages .' + id).val(newValue);
				
				// We show the message
				$("#messages .one-message-body" + id).show();
				$("#messages ." + id).removeClass("message-unread");
				$("#messages ." + id).addClass("message-reading");
				checkNewMessages();
			}
			
			function hideThisMessage(id) {
				$("#messages .one-message-body" + id).hide();
				$("#messages ." + id).removeClass("message-reading");
			}
			
			function replyToThisMessage(id) {
				// We generate the values
				var nPath = '#messages .' + id;
				var jid = $(nPath + ' .message-jid').text();
				var fromSep = jid.split("@");
				var nNick = fromSep[0];
				var nServer = fromSep[1];
				var nSubject = 'Re: ' + $(nPath + ' .message-subject').text();
				var nContent = $('#messages .one-message-body' + id + ' .message-body').text() + '\n' + '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' + '\n';
				
				// We switch to the writing div
				newMessage();
				
				// We apply the generated values to the form
				$("#messages .messages-new-user-input").val(nNick);
				$("#messages .messages-new-server-input").val(nServer);
				$("#messages .messages-new-subject-input").val(nSubject);
				$("#messages .messages-new-textarea").val(nContent);
				
				// We focus on the textarea
				$("#messages .messages-new-textarea").focus();
			}
		// END MESSAGES FUNCTIONS
		
		// BEGIN VCARD FUNCTIONS
			// When the user open his own VCard
			function vcardOpen() {
				// We display the VCard containers
				$("#vcard").show();

				// We remove things that could keep being displayed
				removeVCardAvatarThings();
				
				// We get the VCard informations
				getVCard();
			}
			
			function switchVCard(id) {
				$(".one-lap").hide();
				$("#lap" + id).show();
			}
			
			// BEGIN AVATAR BASE64 ENCODER FORM FUNCTIONS
				// We set the avatar submit function
				$(document).ready(function() {
					// We define the options of the ajax form
					var options = {
						beforeSubmit:	showWait,
						success:	showResponse,
						clearForm:	true
					};
					
					// We make this form ajax-able !
					$('#vCard-avatar').submit(function() {
						$(this).ajaxSubmit(options);
						return false;
					});
				});
				
				// While the file is uploading, show a message
				function showWait() {
					// We remove everything that isn't useful right here
					removeVCardAvatarThings();
					
					// And we display all the things needed
					$(".thisFalseAvatarWaitIsForJQuery").after(
						'<div class="avatar-wait removable"><p>' + getTranslation(20) + '</p></div>'
					);
				}
				
				// This function removes unuseful things
				function removeVCardAvatarThings() {
					$('#lap2 .forms .avatar-wait').remove();
					$('#lap2 .forms .avatar-ok').remove();
					$('#lap2 .forms .avatar-info').remove();
					$('#lap2 .forms .avatar-error').remove();
				}
				
				// And when the upload is finished, show the transformated avatar
				function showResponse(responseText)  {
					// The necessary functions to understand the error codes and so...
					function showErrorType(errorMessage) {
						// We remove everything that isn't useful right here
						removeVCardAvatarThings();
						
						// And we display all the things needed
						$(".thisFalseAvatarWaitIsForJQuery").after(errorMessage);
					}
					
					function avatarSendOK() {
						// We remove everything that isn't useful right here
						removeVCardAvatarThings();
						$('#lap2 .forms .no-avatar').hide();
						$('#lap2 .forms .avatar').remove();
						
						// We parse the XML return of the PHP script
						var b64Type = $(responseText).find('TYPE').text();
						var b64Binval = $(responseText).find('BINVAL').text();
						
						// We put the base64 values in a hidden input to be sent
						$("#PHOTO-TYPE").val(b64Type);
						$("#PHOTO-BINVAL").val(b64Binval);
						
						// We display the delete button
						$("#lap2 .forms .avatar-delete").show();
						
						// And we display all the things needed
						$(".thisFalseAvatarWaitIsForJQuery").after(
							'<div class="avatar-ok removable"><p>' + getTranslation(21) + '</p></div>'
						);
						
						$("#lap2 .forms .avatar-container").replaceWith('<div class="avatar-container"><img class="avatar removable" src="data:' + b64Type + ';base64,' + b64Binval + '" /></div>');
					}
					
					switch(responseText) {
						// We got the first error message
						case '1':
							showErrorType('<div class="avatar-info removable"><p>' + getTranslation(22) + '</p></div>');
							break;
							
						// We got the second error message
						case '2':
							showErrorType('<div class="avatar-error removable"><p>' + getTranslation(23) + '</p></div>');
							break;
							
						// We got the third error message
						case '3':
							showErrorType('<div class="avatar-error removable"><p>' + getTranslation(24) + '</p></div>');
							break;
							
						// We got the fourth error message
						case '4':
							showErrorType('<div class="avatar-error removable"><p>' + getTranslation(25) + '</p></div>');
							break;
							
						// We got the fifth error message
						case '5':
							showErrorType('<div class="avatar-error removable"><p>' + getTranslation(26) + '</p></div>');
							break;
							
						// We got the sixth error message
						case '6':
							showErrorType('<div class="avatar-error removable"><p>' + getTranslation(27) + '</p></div>');
							break;
						
						// Everything is okay, we continue !
						default:
							avatarSendOK();
							break;
					}
				}
			// END AVATAR BASE64 ENCODER FORM FUNCTIONS
			
			function getVCard() {
				// WE GET THE JID OF THE USER LOGGED IN
					getJID();
					jid = userJID;
					
				// WE REQUEST THE VCARD
					var iq = new JSJaCIQ();
					iq.setType('get');
					iq.setTo(jid);
					iq.setFrom(jid);
					iq.appendNode('vCard', {'xmlns': 'vcard-temp'});
					me = this;
					con.send(iq,me.handleVCard);
			}
			
			function handleVCard(iq) {
				var handleXML = iq.getNode();
				
				$(handleXML).find('vCard').each(function() {
					// WE GET EVERYTHING
						// We get the civility
						var nComplete = $(this).find('FN').text();
						var nNickname = $(this).find('NICKNAME').text();
						var nGiven = $(this).find('GIVEN').text();
						var nFamily = $(this).find('FAMILY').text();
						var nBirthday = $(this).find('BDAY').text();
						
						// We get the contact infos
						var cMail = $(this).find('USERID').text();
						var cPhone = $(this).find('NUMBER').text();
						var cSite = $(this).find('URL').text();
						
						// We get the avatar
						var aType = $(this).find('TYPE').text();
						var aBinval = $(this).find('BINVAL').text();
						
						// We get the postal adress
						var pStreet = $(this).find('STREET').text();
						var pLocality = $(this).find('LOCALITY').text();
						var pCode = $(this).find('PCODE').text();
						var pCountry = $(this).find('CTRY').text();
						
						// We get the user description
						var bDescription = $(this).find('DESC').text();
						
					// WE DISPLAY EVERYTHING
						// We display the civility
						$("#FN").val(nComplete);
						$("#NICKNAME").val(nNickname);
						$("#N-GIVEN").val(nGiven);
						$("#N-FAMILY").val(nFamily);
						$("#BDAY").val(nBirthday);
						
						// We display the contact infos
						$("#EMAIL-USERID").val(cMail);
						$("#TEL-NUMBER").val(cPhone);
						$("#URL").val(cSite);
						
						// We display the avatar
						if(aBinval != '') {
							// We remove all the things that we don't need in that case
							$('#lap2 .forms .no-avatar').hide();
							$("#lap2 .avatar").remove();
							
							// We display the delete button
							$("#lap2 .forms .avatar-delete").show();
							
							// We display the avatar we have just received
							$("#vcard .avatar-container").replaceWith(
								'<div class="avatar-container"><img class="avatar removable" src="data:' + aType + ';base64,' + aBinval + '" /></div>');
							
							// And we complete the hidden form to keep the current avatar
							$("#PHOTO-TYPE").val(aType);
							$("#PHOTO-BINVAL").val(aBinval);
						}
						
						// We display the postal adress
						$("#ADR-STREET").val(pStreet);
						$("#ADR-LOCALITY").val(pLocality);
						$("#ADR-PCODE").val(pCode);
						$("#ADR-CTRY").val(pCountry);
						
						// We display the user description
						$("#DESC").val(bDescription);
				});
				
				// WE HIDE THE WAITING IMAGE
					$("#vcard .wait").hide();
			}
			
			function deleteAvatar() {
				// We remove the avatar displayed elements
				$("#lap2 .forms .avatar-info, .avatar-error, .avatar-ok, .avatar-delete").hide();
				$('#lap2 .forms .avatar').remove();
				
				// We reset the input value
				$("#PHOTO-TYPE").val('');
				$("#PHOTO-BINVAL").val('');
				
				// We show the avatar-uploading request
				$("#lap2 .forms .no-avatar").show();
			}
			
			function sendVCard() {
				// WE DEFINE THE THINGS THAT ARE NEEDED TO SEND AN IQ
					var iq = new JSJaCIQ();
					iq.setType('set');
					var vCard = iq.appendNode('vCard', {'xmlns': 'vcard-temp'});
					
				// AND WE RETRIEVE THE NEEDED DATA TO CONVERT IN INTO AN XML STRING
					// We send the identity part of the form
					for (var i=0; i<document.forms["vCard-identity"].elements.length; i++) {
						var item = document.forms["vCard-identity"].elements[i];
						if (item.id == '') continue;
						if (item.value == '' ) continue;
						
						if (item.id.indexOf('-') != -1) {
							var tagname = item.id.substring(0,item.id.indexOf('-'));
							var aNode;
							
							if (vCard.getElementsByTagName(tagname).length > 0)
								aNode = vCard.getElementsByTagName(tagname).item(0);
							
							else
								aNode = vCard.appendChild(iq.getDoc().createElement(tagname));
								aNode.appendChild(iq.getDoc().createElement(item.id.substring(item.id.indexOf('-')+1))).appendChild(iq.getDoc().createTextNode(item.value));
						}
						
						else {
							vCard.appendChild(iq.getDoc().createElement(item.id)).appendChild(iq.getDoc().createTextNode(item.value));
						}
					}
					
					// We send the avatar of the form
					for (var i=0; i<document.forms["vCard-avatar"].elements.length; i++) {
						var item = document.forms["vCard-avatar"].elements[i];
						if (item.id == '') continue;
						if (item.value == '' ) continue;
						
						if (item.id.indexOf('-') != -1) {
							var tagname = item.id.substring(0,item.id.indexOf('-'));
							var aNode;
							
							if (vCard.getElementsByTagName(tagname).length > 0)
								aNode = vCard.getElementsByTagName(tagname).item(0);
							
							else
								aNode = vCard.appendChild(iq.getDoc().createElement(tagname));
								aNode.appendChild(iq.getDoc().createElement(item.id.substring(item.id.indexOf('-')+1))).appendChild(iq.getDoc().createTextNode(item.value));
						}
						
						else {
							vCard.appendChild(iq.getDoc().createElement(item.id)).appendChild(iq.getDoc().createTextNode(item.value));
						}
					}
					
					// We send the other stuffs of the form
					for (var i=0; i<document.forms["vCard-other"].elements.length; i++) {
						var item = document.forms["vCard-other"].elements[i];
						if (item.id == '') continue;
						if (item.value == '' ) continue;
						
						if (item.id.indexOf('-') != -1) {
							var tagname = item.id.substring(0,item.id.indexOf('-'));
							var aNode;
							
							if (vCard.getElementsByTagName(tagname).length > 0)
								aNode = vCard.getElementsByTagName(tagname).item(0);
							
							else
								aNode = vCard.appendChild(iq.getDoc().createElement(tagname));
								aNode.appendChild(iq.getDoc().createElement(item.id.substring(item.id.indexOf('-')+1))).appendChild(iq.getDoc().createTextNode(item.value));
						}
						
						else {
							vCard.appendChild(iq.getDoc().createElement(item.id)).appendChild(iq.getDoc().createTextNode(item.value));
						}
					}
					
				// WE SEND THE NEW VCARD
					con.send(iq);
				
				// WE CLOSE THE VCARD THINGSs	
				closeVCard();
			}
			
			function cancelVCard() {
				closeVCard();
			}
			
			function closeVCard() {
				// WE HIDE THE FORM
				$("#vcard").hide();
				
				// WE RESET SOME STUFFS
				$("#vcard .wait").show();
				$("#vcard .resetable").val("");
				deleteAvatar();
				
				// WE SHOW AGAIN THE FIRST LAP
				switchVCard(1);
			}
		// END VCARD FUNCTIONS
		
		// BEGIN OPTIONS FUNCTIONS
			// When the user open his options
			function optionsOpen() {
				// We get the values of the forms for the sounds
				sounds = $("#data-store .options .sounds").val();
				if(sounds == 'on') {
					$("#options .sounds").val('sounds-on');
				}
				
				else {
					$("#options .sounds").val('sounds-off');
				}
				
				// We get the values of the forms for the geolocalisation
				geolocalisation = $("#data-store .options .geolocalisation").val();
				if(geolocalisation == 'on') {
					$("#options .geolocalisation").val('geolocalisation-on');
				}
				
				else {
					$("#options .geolocalisation").val('geolocalisation-off');
				}
				
				// The button click functions
				function subAskShow() {
					$("#options .sub-ask").fadeIn();
					$("#options .sub-ask .sub-ask-element").hide();
				}
				
				$("#options .change-password").click(function() {
					subAskShow();
					$("#options .sub-ask .sub-ask-pass").show();
				});
				
				$("#options .delete-account").click(function() {
					subAskShow();
					$("#options .sub-ask .sub-ask-delete").show();
				});
				
				$("#options .sub-ask .sub-ask-top .sub-ask-close").click(function() {
					$("#options .sub-ask").fadeOut();
					$("#options .sub-ask .sub-ask-element").hide();
				});
				
				$("#options").show();
			}
			
			function cancelOptions() {
				$("#options").hide();
				$("#options .sub-ask").hide();
				
				// We reset the inputs
				$("#options input").removeClass("please-complete");
			}
			
			function displayOptions(type, value) {
				$("#data-store .options ." + type).val(value);
			}
			
			function storeOptions() {
				var sounds = $("#data-store .options .sounds").val();
				var geolocalisation = $("#data-store .options .geolocalisation").val();
				
				var iq = new JSJaCIQ();
				iq.setType('set');
				var query = iq.setQuery('jabber:iq:private');
				var storage = query.appendChild(iq.buildNode('storage', {'xmlns': 'jappix:options'}));
				
				var item1 = storage.appendChild(iq.getDoc().createElement('option'));
				item1.setAttribute('type','sounds');
				item1.appendChild(iq.getDoc().createTextNode(sounds));
				
				var item2 = storage.appendChild(iq.getDoc().createElement('option'));
				item2.setAttribute('type','geolocalisation');
				item2.appendChild(iq.getDoc().createTextNode(geolocalisation));
				
				con.send(iq);
			}
			
			function saveOptions() {
				// We hide the divs
				$("#options, #options .sub-ask, .sub-ask-element").hide();
				
				// We apply the sounds
				if ($("#options .sounds").val() == 'sounds-on') {
					$("#data-store .options .sounds").val("on");
				}
				
				else {
					$("#data-store .options .sounds").val("off");
				}
				
				// We apply the geolocalisation
				if ($("#options .geolocalisation").val() == 'geolocalisation-on') {
					$("#data-store .options .geolocalisation").val("on");
					
					// We geolocalise the user on the go
					myPosition();
				}
				
				else {
					$("#data-store .options .geolocalisation").val("off");
					
					// We delete the geolocalisation informations in pubsub
					deleteMyPosition();
				}
				
				// We send the options to the database
				storeOptions();
				
				// We reset the inputs
				$("#options input").removeClass("please-complete");
			}
			
			function sendNewPassword() {
				/* REF : http://xmpp.org/extensions/xep-0077.html#usecases-changepw */
				
				var user = $('#data-store .current .username').val();
				var server = $('#data-store .current .domain').val();
				var userPassHash = $('#data-store .current .password').val();
				var password0 = $('#options .old').val();
				var password1 = $('#options .new1').val();
				var password2 = $('#options .new2').val();
				
				if (password1 == password2 && hex_md5(password0) == userPassHash) {
					// We send the IQ
					var iq = new JSJaCIQ();
					iq.setType('set');
					iq.setTo(server);
					var iqQuery = iq.setQuery('jabber:iq:register');
					iqQuery.appendChild(iq.buildNode('username', user));
					iqQuery.appendChild(iq.buildNode('password', password1));
					con.send(iq);
					
					// We quit the session
					quit();
					
					// We show a message to alert the user
					openThisInfo(1);
				}
				
				else {
					if (password0 == '') {
						$("#options .old").addClass("please-complete");
					}
				
					if (password1 == '') {
						$("#options .new1").addClass("please-complete");
					}
				
					if (password2 == '') {
						$("#options .new2").addClass("please-complete");
					}
					
					if (password0 != '') {
						$("#options .old").removeClass("please-complete");
					}
					
					if (password1 != '') {
						$("#options .new1").removeClass("please-complete");
					}
					
					if (password2 != '') {
						$("#options .new2").removeClass("please-complete");
					}
					
					if (hex_md5(password0) != userPassHash) {
						$("#options .old").addClass("please-complete");
					}
					
					if (password1 != password2) {
						$("#options .new1, #options .new2").addClass("please-complete");
					}
				}
			}
			
			function deleteMyAccount() {
				/* REF : http://xmpp.org/extensions/xep-0077.html#usecases-cancel */
				
				var user = $('#data-store .current .username').val();
				var server = $('#data-store .current .domain').val();
				var resource = $('#data-store .current .resource').val();
				var userPassHash = $('#data-store .current .password').val();
				var password = $('#options .check-password').val();
				
				if (hex_md5(password) == userPassHash) {
					// We send the IQ
					var iq = new JSJaCIQ();
					iq.setType('set');
					iq.setFrom(user + "@" + server + "/" + resource);
					var iqQuery = iq.setQuery('jabber:iq:register');
					iqQuery.appendChild(iq.buildNode('remove'));
					con.send(iq);
					
					// We quit the session
					quit();
					
					// We show a message to alert the user
					openThisInfo(2);
				}
				
				else {
					if (password == '') {
						$("#options .check-password").addClass("please-complete");
					}
					
					if (password != '') {
						$("#options .check-password").removeClass("please-complete");
					}
					
					if (hex_md5(password) != userPassHash) {
						$("#options .check-password").addClass("please-complete");
					}
				}
			}
		// END OPTIONS FUNCTIONS
		
		// BEGIN GEOLOCALISE FUNCTIONS
			function sendPosition(vLat, vLon, vAlt) {
				/* REF : http://xmpp.org/extensions/xep-0080.html */
				
				// We propagate the position on pubsub
				var iq = new JSJaCIQ();
				iq.setType('set');
				iq.setFrom(getJID());
				
				// We create the XML document
				var pubsub = iq.appendNode('pubsub', {'xmlns': 'http://jabber.org/protocol/pubsub'});
				var publish = pubsub.appendChild(iq.getDoc().createElement('publish'));
				publish.setAttribute("node", "http://jabber.org/protocol/geoloc");
				var item = publish.appendChild(iq.getDoc().createElement('item'));
				var geoloc = item.appendChild(iq.getDoc().createElementNS('http://jabber.org/protocol/geoloc', 'geoloc'));
				
				if(vLat != '') {
					var lat = geoloc.appendChild(iq.getDoc().createElement('lat')).appendChild(iq.getDoc().createTextNode(vLat));
				}
				
				if(vLon != '') {
					var lon = geoloc.appendChild(iq.getDoc().createElement('lon')).appendChild(iq.getDoc().createTextNode(vLon));
				}
				
				if(vAlt != '') {
					var alt = geoloc.appendChild(iq.getDoc().createElement('alt')).appendChild(iq.getDoc().createTextNode(vAlt));
				}
				
				// And finally we send the XML
				con.send(iq);
			}
			
			function getPosition(position) {
				var vLat = '' + position.coords.latitude + '';
				var vLon = '' + position.coords.longitude + '';
				var vAlt = '' + position.coords.altitude + '';
				sendPosition(vLat, vLon, vAlt);
			}
			
			function myPosition() {
				// If the browser take the geolocalisation in charge
				if(navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(getPosition);
				}
			}
			
			function geolocalise() {
				// We wait a bit...
				$(document).oneTime("4s", function() {
					var value = $("#data-store .options .geolocalisation").val();
					
					// We publish the user location if allowed
					if(value == 'on') {
						myPosition();
					}
				});
			}
			
			function deleteMyPosition() {
				sendPosition('', '', '');
			}
		// END GEOLOCALISE FUNCTIONS
		
		// BEGIN MUC-ADMIN FUNCTIONS
			function fillMucAdmin(field, type, label, value, node) {
				var hash = hex_md5(type);
				var input;
				
				// We check the checkboxes with boolean values
				if(type == 'boolean') {
					var checked;
					
					if(value == '1')
						checked = 'checked';
					else
						checked = '';
					
					input = '<input id="' + hash + '" name="' + field + '" type="checkbox" class="muc-admin-i muc-checkbox removable" ' + checked + ' />';
				}
				
				// We check if the value comes from a radio input
				else if(type == 'list-single') {
					input = '<select id="' + hash + '" name="' + field + '" class="muc-admin-i removable">';
					var selected;
					
					$(node).find('option').each(function() {
						var nLabel = $(this).attr('label');
						var nValue = $(this).find('value').text();
						
						// If this is the selected value
						if(nValue == value)
							selected = 'selected';
						else
							selected = '';
						
						input += '<option ' + selected + ' value="' + nValue + '">' + nLabel + '</option>';
					});
					
					input += '</select>';
				}
				
				// We fill the blank inputs with the text values
				else {
					// We change the type of the input
					if(type == 'text-private')
						iType = 'password';
					else
						iType = 'text';
					
					input = '<input id="' + hash + '" name="' + field + '" type="' + iType + '" class="muc-admin-i removable" value="' + value + '" />';
				}
				
				$('.muc-admin-conf .last-element').before('<label for="' + hash + '" class="removable">' + label + '</label>' + input);
			}
			
			function removeInputMucAdmin(hash) {
				var path = '#muc-admin .aut-group .' + hash;
				
				// We first hide the container of the input
				$(path).hide();
				
				// Then, we add a special class to the input
				$(path + ' input').addClass('aut-dustbin');
			}
			
			function addInputMucAdmin(jid, affiliation) {
				var hash = hex_md5(jid + affiliation);
				
				$("#muc-admin .aut-" + affiliation + " .aut-add").after(
					'<div class="one-aut removable ' + hash + '">' + 
						'<input id="aut-' + affiliation + '" name="' + affiliation + '" type="text" class="muc-admin-i" value="' + jid + '" />' + 
						'<a class="aut-remove">[-]</a>' + 
					'</div>'
				);
				
				$('#muc-admin .' + hash + ' .aut-remove').click(function() {
					removeInputMucAdmin(hash);
				});
			}
			
			function handleMucAdmin(iq) {
				var handleXML = iq.getQuery();
				
				// If we got the form results
				if($(handleXML).find('x').attr('xmlns') != undefined) {
					$(handleXML).find('field').each(function() {
						// We parse the received xml
						var field = $(this).attr('var');
						var type = $(this).attr('type');
						var label = $(this).attr('label');
						var value = $(this).find('value:first').text();
						var node = this;
						
						// If we have correct data to be exploited
						if(field != undefined && type != undefined && label != undefined && value != undefined ) {
							// We create and fill the inputs
							fillMucAdmin(field, type, label, value, node);
						}
					});
				}
				
				// If we got the authorizations results
				else if($(handleXML).find('item').attr('jid') != undefined) {
					$(handleXML).find('item').each(function() {
						// We parse the received xml
						var jid = $(this).attr('jid');
						var affiliation = $(this).attr('affiliation');
						
						// We create one input for one jid
						addInputMucAdmin(jid, affiliation);
					});
				}
				
				// We hide the wait icon
				$("#muc-admin .wait").hide();
			}
			
			function queryMucAdmin(jid, type) {
				var iq = new JSJaCIQ();
				iq.setTo(jid);
				iq.setType('get');
				
				if(type == 'options') {
					iq.setQuery('http://jabber.org/protocol/muc#owner');
				}
				
				else {
					var iqQuery = iq.setQuery('http://jabber.org/protocol/muc#admin');
					var item = iqQuery.appendChild(iq.getDoc().createElement('item'));
					item.setAttribute('affiliation', type);
				}
				
				me = this;
				con.send(iq,me.handleMucAdmin);
			}
			
			function resetMucAdmin() {
				// We hide the room name
				$("#muc-admin .muc-admin-head-jid").text('');
				
				// We reset the inputs that has to be reseted
				$("#muc-admin .resetable").val("");
				
				// We delete the removable items
				$("#muc-admin .removable").remove();
				
				// We show the wait icon
				$("#muc-admin .wait").show();
			}
			
			function openMucAdmin(jid) {
				// We reset the muc admin values
				resetMucAdmin();
				
				// We show the popup
				$("#muc-admin").show();
				
				// We show the room name
				$("#muc-admin .muc-admin-head-jid").text(jid);
				
				// We query the room to edit
				queryMucAdmin(jid, 'options');
				
				// We get the affiliated user's privileges
				queryMucAdmin(jid, 'member');
				queryMucAdmin(jid, 'owner');
				queryMucAdmin(jid, 'admin');
				queryMucAdmin(jid, 'outcast');
			}
			
			function sendMucAdminTopic(jid) {
				// We get the new topic
				var topic = $('.muc-admin-topic textarea').val();
				
				// We send the new topic if not blank
				if(topic != '') {
					var m = new JSJaCMessage();
					m.setTo(jid);
					m.setType('groupchat');
					m.setSubject(topic);
					con.send(m);
				}
			}
			
			function sendMucAdminIQ(jid, rights, form) {
				// We set the iq headers
				var iq = new JSJaCIQ();
				iq.setTo(jid);
				iq.setType('set');
				var iqQuery = iq.setQuery('http://jabber.org/protocol/muc#' + rights + '');
				
				if(form == 'form') {
					var x = iqQuery.appendChild(iq.getDoc().createElementNS('jabber:x:data', 'x'));
					x.setAttribute('type', 'submit');
					
					// We loop for all the elements
					$('.muc-admin-conf input, .muc-admin-conf select').each(function() {
						// We get the needed values
						var type = $(this).attr('name');
						
						// If the input is a checkbox
						if($(this).is(':checkbox')) {
							if($(this).is(':checked')) {
								var value = '1';
							}
							
							else {
								var value = '0';
							}
						}
						
						// Else, the input is a text field
						else {
							var value = $(this).val();
						}
						
						// We add a node to the xml
						var field = x.appendChild(iq.getDoc().createElement('field'));
						field.setAttribute('var', type);
						field.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(value));
					});
				}
				
				else if(form == 'aut') {
					// We define the values array
					var types = ['member', 'owner', 'admin', 'outcast'];
					
					for(var i=0; i<=3; i++) {
						// We get the current type
						var tType = types[i];
						
						// We loop for all the elements
						$('.muc-admin-aut .aut-' + tType + ' input').each(function() {
							// We get the needed values
							var value = $(this).val();
							
							// If there's a value
							if(value) {
								var item = iqQuery.appendChild(iq.getDoc().createElement('item'));
								item.setAttribute('jid', value);
							}
							
							// It the user had removed the jid
							if($(this).hasClass('aut-dustbin') && value) {
								item.setAttribute('affiliation', 'none');
							}
							
							// If the value is not blank and okay
							else if(value) {
								item.setAttribute('affiliation', tType);
							}
						});
					}
				}
				
				// We send the iq !
				con.send(iq);
			}
			
			function handleDestroyMucAdminIQ(iq) {
				if (!iq || iq.getType() != 'result') {
					// We tell the user there's a problem
					openThisError(26);
				}
				
				else {
					// We close the groupchat
					var room = $("#muc-admin .muc-admin-head-jid").text();
					var hash = hex_md5(room);
					quitThisChat(room, hash, 'groupchat');
					
					// We close the muc admin popup
					quitMucAdmin();
					
					// We tell the user that all is okay
					openThisInfo(6);
				}
				
				// We hide the wait icon
				$("#muc-admin .wait").hide();
			}
			
			function destroyMucAdminIQ(jid) {
				// We ask the server to delete the room
				var iq = new JSJaCIQ();
				iq.setTo(jid);
				iq.setType('set');
				var iqQuery = iq.setQuery('http://jabber.org/protocol/muc#owner');
				iqQuery.appendChild(iq.getDoc().createElement('destroy'));
				me = this;
				con.send(iq,me.handleDestroyMucAdminIQ);
			}
			
			function destroyMucAdmin() {
				// We get the jid of the current room
				var jid = $("#muc-admin .muc-admin-head-jid").text();
				
				// We show the wait icon
				$("#muc-admin .wait").show();
				
				// We send the iq
				destroyMucAdminIQ(jid);
			}
			
			function sendMucAdmin() {
				// We get the jid of the current room
				var jid = $("#muc-admin .muc-admin-head-jid").text();
				
				// We change the room topic
				sendMucAdminTopic(jid);
				
				// We send the needed queries
				sendMucAdminIQ(jid, 'owner', 'form');
				sendMucAdminIQ(jid, 'admin', 'aut');
			}
			
			function quitMucAdmin() {
				$("#muc-admin").hide();
				
				// We reset the current values
				resetMucAdmin();
			}
			
			function saveMucAdmin() {
				// We send the new options
				sendMucAdmin();
				
				// And we quit the popup
				quitMucAdmin();
			}
			
			function cancelMucAdmin() {
				quitMucAdmin();
			}
		// END MUC-ADMIN FUNCTIONS
		
		// BEGIN DISCOVERY FUNCTIONS
			$(document).ready(function() {
				// We activate the form
				$("#discovery .disco-server-input").keyup(function(e) {
					if(e.keyCode == 13) {
						launchDiscovery();
					}
				});
			});
			
			function launchDiscovery() {
				/* REF : http://xmpp.org/extensions/xep-0030.html */
				
				// We clean the discovery window
				cleanDiscovery();
				
				// We tell the user that a search has been launched
				$("#discovery .wait").show();
				
				// We get the server to query
				var discoServer = $("#discovery .disco-server-input").val();
				
				// We launch the query
				var iq = new JSJaCIQ();
				iq.setTo(discoServer);
				iq.setType('get');
				iq.setQuery('http://jabber.org/protocol/disco#items');
				me = this;
				con.send(iq,me.handleDiscovery);
			}
			
			function handleDiscovery(iq) {
				// If an error occured
				if (!iq || iq.getType() != 'result') {
					openThisError(23);
					
					// We hide the wait icon
					$("#discovery .wait").hide();
				}
				
				else {
					var handleXML = iq.getQuery();
					
					// If we got one or more results
					if($(handleXML).find('item').attr('jid') != undefined) {
						$(handleXML).find('item').each(function() {
							// We parse the received xml
							var itemHost = $(this).attr('jid');
							
							// We ask the server what's the server type
							askThisDiscovery(itemHost);
						});
					}
					
					// Else, there are no items for this query
					else {
						// We show the no result alert
						$("#discovery .discovery-noresults").show();
						
						// We hide the wait icon
						$("#discovery .wait").hide();
					}
				}
			}
			
			function cleanDiscovery() {
				// We remove the results
				$("#discovery .discovery-oneresult").remove();
				$("#discovery .disco-category").hide();
				
				// We hide the no result alert
				$("#discovery .discovery-noresults").hide();
				
				// We hide the wait icon
				$("#discovery .wait").hide();
			}
			
			function resetDiscovery() {
				// We clean the results
				cleanDiscovery();
				
				// We set the old server value
				$("#discovery .disco-server-input").val(getHost('main'));
			}
			
			function askThisDiscovery(service) {
				var iq = new JSJaCIQ();
				iq.setTo(service);
				iq.setType('get');
				iq.setQuery('http://jabber.org/protocol/disco#info');
				me = this;
				con.send(iq,me.handleThisDiscovery);
			}
			
			function handleThisDiscovery(iq) {
				/* REF : http://xmpp.org/registrar/disco-categories.html */
				
				var from = iq.getFrom();
				var handleXML = iq.getQuery();
				
				if($(handleXML).find('identity').attr('type') != undefined) {
					var category = $(handleXML).find('identity').attr('category');
					var type = $(handleXML).find('identity').attr('type');
					var named = $(handleXML).find('identity').attr('name');
					
					// As defined in the ref, we detect the type of each category to put an icon
					if(category == 'account') {
						icon = '⚖';
					}
					
					else if(category == 'auth') {
						icon = '⚗';
					}
					
					else if(category == 'automation') {
						icon = '⚡';
					}
					
					else if(category == 'client') {
						icon = '☘';
					}
					
					else if(category == 'collaboration') {
						icon = '☻';
					}
					
					else if(category == 'component') {
						icon = '☌';
					}
					
					else if(category == 'conference') {
						icon = '⚑';
					}
					
					else if(category == 'directory') {
						icon = '☎';
					}
					
					else if(category == 'gateway') {
						icon = '⚙';
					}
					
					else if(category == 'headline') {
						icon = '☀';
					}
					
					else if(category == 'hierarchy') {
						icon = '☛';
					}
					
					else if(category == 'proxy') {
						icon = '☔';
					}
					
					else if(category == 'pubsub') {
						icon = '♞';
					}
					
					else if(category == 'server') {
						icon = '⛂';
					}
					
					else if(category == 'store') {
						icon = '⛃';
					}
					
					else {
						icon = '★';
						category == 'others';
					}
					
					// We display the category
					$("#discovery .disco-" + category).show();
					
					// We display the item that we found
					$("#discovery .discovery-results .disco-" + category + " .disco-category-title").after(
						'<div class="discovery-oneresult">' + 
							'<div class="one-icon">' + icon + '</div>' + 
							'<div class="one-host">' + from + '</div>' + 
							'<div class="one-type">' + named + '</div>' + 
						'</div>'
					);
				}
				
				else {
					$("#discovery .discovery-results .disco-others .disco-category-title").after(
						'<div class="discovery-oneresult">' + 
							'<div class="one-icon">★</div>' + 
							'<div class="one-host">' + from + '</div>' + 
							'<div class="one-type">' + getTranslation(28) + '</div>' + 
						'</div>'
					);
				}
				
				// We hide the wait icon
				$("#discovery .wait").hide();
			}
			
			function openDiscovery() {
				// We reset the dicovery
				resetDiscovery();
				
				// We show the needed elements
				$("#discovery").show();
				
				// We request a disco to the default server
				launchDiscovery();
			}

			function quitDiscovery() {
				$("#discovery").hide();
				
				resetDiscovery();
			}
		// END DISCOVERY FUNCTIONS
		
		// BEGIN DIRECTORY FUNCTIONS
			function openDirectory() {
				cleanDirectory();
				
				$("#directory").show();
				
				// We focus on the first input
				$("#directory .dsearch-user").focus();
			}
			
			$(document).ready(function() {
				// We activate the form
				$("#directory .dsearch-input").keyup(function(e) {
					if(e.keyCode == 13) {
						searchDirectory();
					}
				});
			});
			
			function cleanDirectory() {
				// We hide the wait image
				$("#directory .wait").hide();
				
				// We switch to the first div
				$("#directory .dsearch-firstgroup").show();
				$("#directory .dsearch-results").hide();
				$("#directory .dsearch-head-first").show();
				$("#directory .dsearch-head-second").hide();
				
				// We reset the values
				$("#directory .dsearch-input").val("");
				$("#directory .dsearch-head-input").val(getHost('vjud'));
				
				// We remove the search results
				$("#directory .dsearch-oneresult").remove();
				
				// We hide the no result alert
				$("#directory .dsearch-noresults").hide();
			}

			function quitDirectory() {
				$("#directory").hide();
				
				// We reset the popup
				cleanDirectory();
			}
			
			function onceAgainDirectory() {
				// We switch to the initial situation
				cleanDirectory();
				
				// We focus on the first input
				$("#directory .dsearch-user").focus();
			}
			
			function chatFromDirectory(jid) {
				// We quit the directory
				quitDirectory();
				
				// We open a new chat
				checkChatCreate(jid, 'chat');
			}
			
			function searchThisDirectory(dServer, dUser, dName, dFamily, dCountry, dCity, dMail) {
				var iq = new JSJaCIQ();
				iq.setTo(dServer);
				iq.setType('set');
				var iqQuery = iq.setQuery('jabber:iq:search');
				var iqX = iqQuery.appendChild(iq.getDoc().createElementNS('jabber:x:data', 'x'));
				iqX.setAttribute("type", "submit");
				
				// The user field
				var field1 = iqX.appendChild(iq.getDoc().createElement('field'));
				field1.setAttribute("var", "user");
				field1.setAttribute("type", "text-single");
				field1.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dUser));
				
				// The name field
				var field2 = iqX.appendChild(iq.getDoc().createElement('field'));
				field2.setAttribute("var", "first");
				field2.setAttribute("type", "text-single");
				field2.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dName));
					
				// The family field
				var field3 = iqX.appendChild(iq.getDoc().createElement('field'));
				field3.setAttribute("var", "last");
				field3.setAttribute("type", "text-single");
				field3.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dFamily));
				
				// The country field
				var field4 = iqX.appendChild(iq.getDoc().createElement('field'));
				field4.setAttribute("var", "ctry");
				field4.setAttribute("type", "text-single");
				field4.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dCountry));
				
				// The city field
				var field5 = iqX.appendChild(iq.getDoc().createElement('field'));
				field5.setAttribute("var", "locality");
				field5.setAttribute("type", "text-single");
				field5.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dCity));
				
				// The email field
				var field6 = iqX.appendChild(iq.getDoc().createElement('field'));
				field6.setAttribute("var", "email");
				field6.setAttribute("type", "text-single");
				field6.appendChild(iq.getDoc().createElement('value')).appendChild(iq.getDoc().createTextNode(dMail));
				me = this;
				con.send(iq,me.handleThisDirectory);
			}
			
			function handleThisDirectory(iq) {
				if (!iq || iq.getType() != 'result') {
					openThisError(23);
				}
				
				else {						
					var handleXML = iq.getQuery();
					
					// If we got one or more users
					if($(handleXML).find('item').text() != '') {
						$(handleXML).find('item').each(function() {
							// We parse the received xml
							var uName = $(this).find('field[var=first]').text() + ' ' + $(this).find('field[var=last]').text();
							var uJID = $(this).find('field[var=jid]').text();
							var uCountry = $(this).find('field[var=ctry]').text();
							var uCity = $(this).find('field[var=locality]').text();
						
							// We define a value for the one that have no value
							if(uName == ' ')
								uName = '?';
							if(uJID == '')
								uJID = '?';
							if(uCountry == '')
								uCountry = '?';
							if(uCity == '')
								uCity = '?';
						
							// |||||||||||||||||||||||||||||||||||||||||||||||||||
							// ||||||| WARNING ! THIS IS A FUNCTION TODO ! |||||||
							// |||||||||||||||||||||||||||||||||||||||||||||||||||
							// TODO : add this user to my buddy list
						
							// We display the user that we found
							$("#directory .dsearch-results-list").prepend(
								'<div class="dsearch-oneresult" onclick="chatFromDirectory(\'' + uJID + '\');">' + 
									'<div class="one-name">' + uName + '</div>' + 
									'<div class="one-jid">' + uJID + '</div>' + 
									'<div class="one-country">' + uCountry + '</div>' + 
									'<div class="one-city">' + uCity + '</div>' + 
								'</div>'
							);
						});
					}
					
					// Else, there are nobody for this query
					else {
						// We show the no result alert
						$("#directory .dsearch-noresults").show();
					}
				}
				
				$("#directory .wait").hide();
			}
			
			function searchDirectory() {
				/* REF : http://xmpp.org/extensions/xep-0055.html */
				
				// We get the values
				var dServer = $("#directory .dsearch-head-input").val();
				var dUser = $("#directory .dsearch-user").val();
				var dName = $("#directory .dsearch-name").val();
				var dFamily = $("#directory .dsearch-family").val();
				var dCountry = $("#directory .dsearch-country").val();
				var dCity = $("#directory .dsearch-city").val();
				var dMail = $("#directory .dsearch-mail").val();
				
				// If one or more other inputs have values
				if(dServer != "" && dUser != "" || dName != "" || dFamily != "" || dCountry != "" || dCity != "" || dMail != "") {
					// We show the wait image
					$("#directory .wait").show();
				
					// We switch the divs
					$("#directory .dsearch-firstgroup").hide();
					$("#directory .dsearch-results").show();
					$("#directory .dsearch-head-first").hide();
					$("#directory .dsearch-head-second").show();
					
					// We send the request
					searchThisDirectory(dServer, dUser, dName, dFamily, dCountry, dCity, dMail);
				}
			}
		// END DIRECTORY FUNCTIONS
		
		// BEGIN ABOUT FUNCTIONS
			function openAbout() {
				$("#about").show();
			}

			function quitAbout() {
				$("#about").hide();
			}
		// END ABOUT FUNCTIONS
		
		// BEGIN HELP FUNCTIONS
			function openHelp() {
				$("#help").show();
			}

			function quitHelp() {
				$("#help").hide();
			}
		// END HELP FUNCTIONS
		
		// BEGIN FAVORITES FUNCTIONS
			function openFavorites() {
				$("#favorites").show();
				switchFavorites();
			}
			
			$(document).ready(function() {
				// If the user sent the server name
				$("#favorites .fsearch-head-server").keyup(function(e) {
					if(e.keyCode == 13) {
						getServerGCList();
					}
				});
			
				$(".fedit-head-select").change(function() {
					editFavorite();
				});
			});
			
			function resetFavorites() {
				$("#favorites .wait").hide();
				$("#favorites .fsearch-oneresult").remove();
				$("#favorites .fedit-input").val("");
				$("#favorites .fsearch-head-server, .fedit-server").val(getHost("muc"));
				$(".fedit-terminate").hide();
				$(".fedit-add").show();
			}
			
			function quitFavorites() {
				// We hide the popup
				$("#favorites").hide();
				
				// We reset some stuffs
				resetFavorites();
				$("#favorites .favorites-content").hide();
				$("#favorites .favorites-edit").show();
			}
			
			function switchFavorites() {
				$("#favorites .room-switcher").click(function() {
					$("#favorites .favorites-content").hide();
					resetFavorites();
				});
				
				$("#favorites .room-list").click(function() {
					$("#favorites .favorites-edit").show();
				});
				
				$("#favorites .room-search").click(function() {
					$("#favorites .favorites-search").show();
					getServerGCList();
				});
			}
			
			function addThisRoomToFav(roomJID, roomName) {
				// We switch to the other part
				$("#favorites .favorites-content").hide();
				$("#favorites .favorites-edit").show();
				$("#favorites .fedit-add").show();
				
				// We define the values
				var separated = roomJID.split("@");
				var chan = separated[0];
				var server = separated[1];
				var nick = getNick();
				var separatedName = roomName.split(" (");
				var newName = separatedName[0];
				
				// We set the good values to the inputs
				$("#favorites .fedit-title").val(newName);
				$("#favorites .fedit-chan").val(chan);
				$("#favorites .fedit-server").val(server);
				$("#favorites .fedit-nick").val(nick);
				$("#favorites .fedit-password").val('');
			}
			
			function editFavorite() {
				// Show the edit/remove button, hide the others
				$(".fedit-terminate").hide();
				$(".fedit-edit").show();
				$(".fedit-remove").show();
				
				// We retrieve the values
				var jid = $("#favorites .fedit-head-select").val();
				var hash = hex_md5(jid);
				var data = $("#data-store .favorites ." + hash).val();
				
				// If this is not the default room
				if(jid != 'none') {
					// We parse the values
					var jidSplit = jid.split("@");
					var chan = jidSplit[0];
					var server = jidSplit[1];
					var rName = $(data).find('name').text();
					var nick = $(data).find('nick').text();
					var pass = $(data).find('password').text();
				
					// We apply the values
					$(".fedit-title").val(rName);
					$(".fedit-nick").val(nick);
					$(".fedit-chan").val(chan);
					$(".fedit-server").val(server);
					$(".fedit-password").val(pass);
				}
				
				else {
					resetFavorites();
				}
			}
			
			function addFavorite() {
				// We reset the inputs
				$(".fedit-title, .fedit-nick, .fedit-chan, .fedit-server, .fedit-password").val("");
				
				// Show the add button, hide the others
				$(".fedit-terminate").hide();
				$(".fedit-add").show();
			}
			
			function terminateThisFavorite(type) {
				// Get the input values
				var title = $(".fedit-title").val();
				var nick = $(".fedit-nick").val();
				var room = $(".fedit-chan").val();
				var server = $(".fedit-server").val();
				
				// We check the missing values and send this if okay
				if(type == 'add' || type == 'edit') {
					if(title != '' && nick != '' && room != '' && server != '')
						favoritePublish(type);
					if(title == '')
						$(".fedit-title").addClass('please-complete');
					if(nick == '')
						$(".fedit-nick").addClass('please-complete');
					if(room == '')
						$(".fedit-chan").addClass('please-complete');
					if(server == '')
						$(".fedit-server").addClass('please-complete');
					if(title != '')
						$(".fedit-title").removeClass('please-complete');
					if(nick != '')
						$(".fedit-nick").removeClass('please-complete');
					if(room != '')
						$(".fedit-chan").removeClass('please-complete');
					if(server != '')
						$(".fedit-server").removeClass('please-complete');
				}
				
				else if(type == 'remove') {
					favoritePublish(type);
				}
			}
			
			function removeThisFavorite(hash) {
				// We remove the target favorite everywhere needed
				$(".buddy-conf-groupchat-select ." + hash).remove();
				$(".fedit-head-select ." + hash).remove();
				$("#data-store .favorites ." + hash).remove();
			}
			
			function favoritePublish(type) {
				// We reset some things
				$('.please-complete').removeClass('please-complete');
				
				var iq = new JSJaCIQ();
				iq.setType('set');
				var query = iq.setQuery('jabber:iq:private');
				var storage = query.appendChild(iq.buildNode('storage', {'xmlns': 'storage:bookmarks'}));
				
				// We get the values of the current edited groupchat
				var title = $(".fedit-title").val();
				var nick = $(".fedit-nick").val();
				var room = $(".fedit-chan").val();
				var server = $(".fedit-server").val();
				var jid = room + '@' + server;
				var hash = hex_md5(jid);
				var password = $(".fedit-password").val();
				
				// We check what's the type of the query
				if(type == 'add') {
					// We add the room everywhere needed
					displayStorage(jid, title, nick, hash);
				}
				
				else if(type == 'edit') {
					// We delete the edited room
					removeThisFavorite(hash);
					
					// We add the room everywhere needed
					displayStorage(jid, title, nick, hash);
				}
				
				else if(type == 'remove') {
					// We delete the edited room
					removeThisFavorite(hash);
				}
				
				// We regenerate the XML
				$("#data-store .favorites input").each(function() {
					// We retrieve the value of the current input
					var data = $(this).val();
					var jid = $(data).find('jid').text();
					var rName = $(data).find('name').text();
					var nick = $(data).find('nick').text();
					var pass = $(data).find('password').text();
					
					// We create the node for this groupchat
					var item = storage.appendChild(iq.getDoc().createElement('conference'));
					item.setAttribute('name',rName);
					item.setAttribute('jid',jid);
					item.setAttribute('autojoin','0');
					item.appendChild(iq.getDoc().createElement('nick')).appendChild(iq.getDoc().createTextNode(nick));
					if (pass != '')
						item.appendChild(iq.getDoc().createElement('password')).appendChild(iq.getDoc().createTextNode(pass));
				});
				
				con.send(iq);
				
				// We reset the inputs if a room has been added or removed
				resetFavorites();
			}
			
			function getServerGCList() {
				var gcServer = $(".fsearch-head-server").val();
				
				// We reset some things
				$("#favorites .fsearch-oneresult").remove();
				$("#favorites .fsearch-noresults").hide();
				$("#favorites .wait").show();
				
				var iq = new JSJaCIQ();
				iq.setType('get');
				iq.setTo(gcServer);
				iq.setID(gcServer+"IQ");
				iq.setQuery('http://jabber.org/protocol/disco#items');
				me = this;
				con.send(iq,me.getGCList);
			}
			
			function getGCList(iq) {
				if (!iq || iq.getType() != 'result') {
					openThisError(23);
					$("#favorites .wait").hide();
				}
				
				else {
					var handleXML = iq.getQuery();
					
					if($(handleXML).find('item').attr('jid') != undefined) {
						$(handleXML).find('item').each(function() {
							var roomJID = $(this).attr('jid');
							var roomName = $(this).attr('name');
						
							$("#favorites .fsearch-results").prepend(
			 					'<div class="fsearch-oneresult">' + 
									'<div class="room-name" onclick="gcJoinFavorites(\'' + roomJID + '\');">' + roomName + '</div>' + 
									'<div class="add-this-room" title="' + getTranslation(28) + '" onclick="addThisRoomToFav(\'' + roomJID + '\', \'' + roomName + '\');"></div>' + 
								'</div>');
						});
					}
					
					else {
						$("#favorites .fsearch-noresults").show();
					}
				}
				
				$("#favorites .wait").hide();
			}
			
			function gcJoinFavorites(room) {
				quitFavorites();
				checkChatCreate(room, 'groupchat');
			}
			
			function joinFromFavorite() {
				// When the user want to join a groupchat from his favorites
				$('.buddy-conf-groupchat-select').change(function() {
					// We hide the bubble
					$('#buddy-conf-groupchat').fadeOut('fast');
					
					// We do what we've to do
					var groupchat = $(this).val();
					checkChatCreate(groupchat, 'groupchat');
					
					// We reset the select value
					$(".buddy-conf-groupchat-select").val("none");
				});
			}
			
			function displayFavorites(jid, gcName, nick, hash) {
				var optionSet = '<option value="' + jid + '" class="' + hash + ' removable">' + gcName + '</option>';
				
				// We complete the select forms
				$(".gc-join-first-option").after(optionSet);
				$(".fedit-head-select-first-option").after(optionSet);
				
				// We store the informations
				var favoritesStorePath = '#data-store .favorites';
				var oneInput = favoritesStorePath + ' .' + hash;
				var valueToStore = '<groupchat><jid>' + jid + '</jid><name>' + gcName + '</name><nick>' + nick + '</nick></groupchat>';
				
				if(!$.exists(oneInput)) {
					$(favoritesStorePath).prepend('<input class="one-favorite ' + hash + ' removable" type="hidden" />');
				}
				
				$(oneInput).val(valueToStore);
				
				// We show the default room
				$(".buddy-conf-groupchat-select").val("none");
			}
		// END FAVORITES FUNCTIONS
/* END TALKPAGE SCRIPTS */
