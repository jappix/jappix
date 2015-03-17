/*

Jappix - An open social platform
These are the common JS script for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, olivierm, regilero, Maranda

*/

// Bundle
var Common = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Constants */
    self.R_DOMAIN_NAME = /^(([a-zA-Z0-9-\.]+)\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/i;


    /**
     * Checks if an element exists in the DOM
     * @public
     * @param {string} path
     * @return {boolean}
     */
    self.exists = function(path) {

        var exists = false;

        try {
            if(jQuery(path).size() > 0) {
                exists = true;
            }
        } catch(e) {
            Console.error('Common.exists', e);
        } finally {
            return exists;
        }

    };


    /**
     * Checks if Jappix is connected
     * @public
     * @return {boolean}
     */
    self.isConnected = function() {

        connected = false;

        try {
            if((typeof con != 'undefined') && con && con.connected()) {
                connected = true;
            }
        } catch(e) {
            Console.error('Common.isConnected', e);
        } finally {
            return connected;
        }

    };


    /**
     * Checks if Jappix is connected
     * @public
     * @return {boolean}
     */
    self.hasWebSocket = function() {

        has_websocket = false;

        try {
            if(HOST_WEBSOCKET && typeof window.WebSocket != 'undefined') {
                has_websocket = true;
            }
        } catch(e) {
            Console.error('Common.hasWebSocket', e);
        } finally {
            return has_websocket;
        }

    };


    /**
     * Checks if Jappix has focus
     * @public
     * @return {boolean}
     */
    self.isFocused = function() {

        has_focus = true;

        try {
            if(!document.hasFocus()) {
                has_focus = false;
            }
        } catch(e) {
            Console.error('Common.isFocused', e);
        } finally {
            return has_focus;
        }

    };


    /**
     * Matches a domain name
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isDomain = function(xid) {

        is_domain = false;

        try {
            if(xid.match(self.R_DOMAIN_NAME)) {
                is_domain = true;
            }
        } catch(e) {
            Console.error('Common.isDomain', e);
        } finally {
            return is_domain;
        }

    };


    /**
     * Generates the good XID
     * @public
     * @param {string} xid
     * @param {string} type
     * @return {string}
     */
    self.generateXID = function(xid, type) {

        try {
            // XID needs to be transformed
            xid = xid.toLowerCase();

            if(xid && (xid.indexOf('@') === -1)) {
                // Groupchat XID
                if(type == 'groupchat') {
                    return xid + '@' + HOST_MUC;
                }

                // Gateway XID
                if(self.isDomain(xid) === true) {
                    return xid;
                }

                // User XID
                return xid + '@' + HOST_MAIN;
            }

            // Nothing special (yet bare XID)
            return xid;
        } catch(e) {
            Console.error('Common.generateXID', e);
        }

    };


    /**
     * Gets the asked translated string
     * @public
     * @param {string} string
     * @return {string}
     */
    self._e = function(string) {

        try {
            return string;
        } catch(e) {
            Console.error('Common._e', e);
        }

    };


    /**
     * Replaces '%s' to a given value for a translated string
     * @public
     * @param {string} string
     * @param {string} value
     * @return {string}
     */
    self.printf = function(string, value) {

        try {
            return string.replace('%s', value);
        } catch(e) {
            Console.error('Common.printf', e);
        }

    };


    /**
     * Returns the string after the last given char
     * @public
     * @param {string} given_char
     * @param {string} str
     * @return {string}
     */
    self.strAfterLast = function(given_char, str) {

        try {
            if(!given_char || !str) {
                return '';
            }

            var char_index = str.lastIndexOf(given_char);
            var str_return = str;

            if(char_index >= 0) {
                str_return = str.substr(char_index + 1);
            }

            return str_return;
        } catch(e) {
            Console.error('Common.strAfterLast', e);
        }

    };


    /**
     * Properly explodes a string with a given character
     * @public
     * @param {string} toEx
     * @param {string} toStr
     * @param {number} i
     * @return {string}
     */
    self.explodeThis = function(toEx, toStr, i) {

        try {
            // Get the index of our char to explode
            var index = toStr.indexOf(toEx);

            // We split if necessary the string
            if(index !== -1) {
                if(i === 0) {
                    toStr = toStr.substr(0, index);
                } else {
                    toStr = toStr.substr(index + 1);
                }
            }

            // We return the value
            return toStr;
        } catch(e) {
            Console.error('Common.explodeThis', e);
        }

    };


    /**
     * Cuts the resource of a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.cutResource = function(aXID) {

        try {
            return self.explodeThis('/', aXID, 0);
        } catch(e) {
            Console.error('Common.cutResource', e);
        }

    };


    /**
     * Gets the resource of a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.thisResource = function(aXID) {

        resource = '';

        try {
            // Any resource?
            if(self.isFullXID(aXID)) {
                resource = self.explodeThis('/', aXID, 1);
            }
        } catch(e) {
            Console.error('Common.thisResource', e);
        } finally {
            return resource;
        }

    };


    /**
     * Returns whether this XID is full or not
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isFullXID = function(xid) {

        try {
            return xid.indexOf('/') !== -1;
        } catch(e) {
            Console.error('Common.isFullXID', e);

            return false;
        }

    };


    /**
     * nodepreps an XMPP node
     * @public
     * @param {string} node
     * @return {string}
     */
    self.nodeprep = function(node) {

        // Spec: http://tools.ietf.org/html/rfc6122#appendix-A

        try {
            if(!node) {
                return node;
            }

            // Remove prohibited chars
            var prohibited_chars = ['"', '&', '\'', '/', ':', '<', '>', '@'];

            for(var j in prohibited_chars) {
                node = node.replace(prohibited_chars[j], '');
            }

            // Lower case
            node = node.toLowerCase();

            return node;
        } catch(e) {
            Console.error('Common.nodeprep', e);
        }

    };


    /**
     * Encodes quotes in a string
     * @public
     * @param {string} str
     * @return {string}
     */
    self.encodeQuotes = function(str) {

        try {
            return (str + '').htmlEnc();
        } catch(e) {
            Console.error('Common.encodeQuotes', e);
        }

    };


    /**
     * Escapes quotes in a string
     * @public
     * @param {string} str
     * @return {string}
     */
    self.escapeQuotes = function(str) {

        try {
            return escape(self.encodeQuotes(str));
        } catch(e) {
            Console.error('Common.escapeQuotes', e);
        }

    };


    /**
     * Unescapes quotes in a string
     * @public
     * @param {string} str
     * @return {string}
     */
    self.unescapeQuotes = function(str) {

        try {
            return unescape(str);
        } catch(e) {
            Console.error('Common.unescapeQuotes', e);
        }

    };


    /**
     * Gets the bare XID from a XID
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.bareXID = function(xid) {

        try {
            // Cut the resource
            xid = self.cutResource(xid);

            // Launch nodeprep
            if(xid.indexOf('@') !== -1) {
                xid = self.nodeprep(self.getXIDNick(xid, true)) + '@' + self.getXIDHost(xid);
            }

            return xid;
        } catch(e) {
            Console.error('Common.bareXID', e);
        }

    };


    /**
     * Gets the full XID from a XID
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.fullXID = function(xid) {

        try {
            // Normalizes the XID
            var full = self.bareXID(xid);
            var resource = self.thisResource(xid);

            // Any resource?
            if(resource) {
                full += '/' + resource;
            }

            return full;
        } catch(e) {
            Console.error('Common.fullXID', e);
        }

    };


    /**
     * Gets the nick from a XID
     * @public
     * @param {string} aXID
     * @param {boolean} raw_explode
     * @return {string}
     */
    self.getXIDNick = function(aXID, raw_explode) {

        try {
            if(raw_explode !== true) {
                // Gateway nick?
                if(aXID.match(/\\40/)) {
                    return self.explodeThis('\\40', aXID, 0);
                }
            }

            return self.explodeThis('@', aXID, 0);
        } catch(e) {
            Console.error('Common.getXIDNick', e);
        }

    };


    /**
     * Gets the host from a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.getXIDHost = function(aXID) {

        try {
            return self.explodeThis('@', aXID, 1);
        } catch(e) {
            Console.error('Common.getXIDHost', e);
        }

    };


    /**
     * Checks if we are RTL (Right-To-Left)
     * @public
     * @return {boolean}
     */
    self.isRTL = function() {

        try {
            return (self._e("default:LTR") == 'default:RTL');
        } catch(e) {
            Console.error('Common.isRTL', e);
        }

    };


    /**
     * Checks if anonymous mode is allowed
     * @public
     * @return {boolean}
     */
    self.allowedAnonymous = function() {

        try {
            return (ANONYMOUS == 'on');
        } catch(e) {
            Console.error('Common.allowedAnonymous', e);
        }

    };


    /**
     * Checks if host is locked
     * @public
     * @return {boolean}
     */
    self.lockHost = function() {

        try {
            return (LOCK_HOST == 'on');
        } catch(e) {
            Console.error('Common.lockHost', e);
        }

    };


    /**
     * Gets the bare XID of the user
     * @public
     * @return {string}
     */
    self.getXID = function() {

        try {
            // Return the XID of the user
            if(con.username && con.domain) {
                return con.username + '@' + con.domain;
            }

            return '';
        } catch(e) {
            Console.error('Common.getXID', e);
        }

    };


    /**
     * Gets the full XID of the user
     * @public
     * @return {string}
     */
    self.getFullXID = function() {

        try {
            var xid = self.getXID();

            // Return the full XID of the user
            if(xid) {
                return xid + '/' + con.resource;
            }

            return '';
        } catch(e) {
            Console.error('Common.getFullXID', e);
        }

    };


    /**
     * Generates the colors for a given user XID
     * @public
     * @param {type} xid
     * @return {string}
     */
    self.generateColor = function(xid) {

        try {
            var colors = new Array(
                'ac0000',
                'a66200',
                '007703',
                '00705f',
                '00236b',
                '4e005c'
            );

            var number = 0;

            for(var i = 0; i < xid.length; i++) {
                number += xid.charCodeAt(i);
            }

            var color = '#' + colors[number % (colors.length)];

            return color;
        } catch(e) {
            Console.error('Common.generateColor', e);
        }

    };


    /**
     * Checks if the XID is a gateway
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isGateway = function(xid) {

        is_gateway = true;

        try {
            if(xid.indexOf('@') !== -1) {
                is_gateway = false;
            }
        } catch(e) {
            Console.error('Common.isGateway', e);
        } finally {
            return is_gateway;
        }

    };


    /**
     * Gets the from attribute of a stanza (overrides some servers like Prosody missing from attributes)
     * @public
     * @param {object} stanza
     * @return {string}
     */
    self.getStanzaFrom = function(stanza) {

        try {
            var from = stanza.getFrom();

            // No from, we assume this is our XID
            if(!from) {
                from = self.getXID();
            }

            return from;
        } catch(e) {
            Console.error('Common.getStanzaFrom', e);
        }

    };


    /**
     * Returns whether the stanza has been really sent from our own server or entity
     * @public
     * @param {object} stanza
     * @return {string}
     */
    self.isSafeStanza = function(stanza) {

        var is_safe = false;

        try {
            var from = self.getStanzaFrom(stanza);

            is_safe = (!from || from == con.domain || from == self.getXID()) && true;
        } catch(e) {
            Console.error('Common.isSafeStanza', e);
        } finally {
            return is_safe;
        }

    };


    /**
     * Adds a zero to a date when needed
     * @public
     * @param {number} i
     * @return {string}
     */
    self.padZero = function(i) {

        try {
            // Negative number (without first 0)
            if(i > -10 && i < 0) {
                return '-0' + (i * -1);
            }

            // Positive number (without first 0)
            if(i < 10 && i >= 0) {
                return '0' + i;
            }

            // All is okay
            return i;
        } catch(e) {
            Console.error('Common.padZero', e);
        }

    };


    /**
     * Escapes a string (or an array of string) for a regex usage. In case of an
     * array, escapes are not done "in place", keeping the query unmodified
     * @public
     * @param {object} query
     * @return {object}
     */
    self.escapeRegex = function(query) {

        var result = [];

        try {
            if(query instanceof Array) {
                result = [query.length];

                for(i = 0; i < query.length; i++) {
                    try {
                        result[i] = Common.escapeRegex(query[i]);
                    } catch(e) {
                        Console.error('Common.escapeRegex', e);
                        result[i] = null;
                    }
                }
            } else {
                try {
                    result = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                } catch(e) {
                    Console.error('Common.escapeRegex[inner]', e);
                }
            }
        } catch(e) {
            Console.error('Common.escapeRegex', e);
        } finally {
            return result;
        }

    };


    /**
     * Returns a random array value
     * @public
     * @param {object} arr
     * @return {object}
     */
    self.randomArrayValue = function(arr) {

        try {
            return arr[Math.floor(Math.random() * arr.length)];
        } catch(e) {
            Console.error('Common.randomArrayValue', e);
        }

    };


    /**
     * Returns whether the browser is mobile or not
     * @public
     * @return {boolean}
     */
    self.isMobile = function() {

        is_mobile = false;

        try {
            is_mobile = /Android|iPhone|iPod|iPad|Windows Phone|BlackBerry|Bada|Maemo|Meego|webOS/i.test(navigator.userAgent);
        } catch(e) {
            Console.error('Common.isMobile', e);
        } finally {
            return is_mobile;
        }

    };


    /**
     * Converts a XML document to a string
     * @public
     * @param {object} xmlData
     * @return {string}
     */
    self.xmlToString = function(xmlData) {

        xml_str = null;

        try {
            // For Mozilla, Firefox, Opera, etc.
            if(window.XMLSerializer) {
                xml_str = (new XMLSerializer()).serializeToString(xmlData);
            }

            // For Internet Explorer
            if(window.ActiveXObject) {
                xml_str = xmlData.xml;
            }
        } catch(e) {
            Console.error('Common.xmlToString', e);
        } finally {
            return xml_str;
        }

    };


    /**
     * Converts a string to a XML document
     * @public
     * @param {string} sXML
     * @return {object}
     */
    self.XMLFromString = function(sXML) {

        try {
            // No data?
            if(!sXML) {
                return '';
            }

            // Add the XML tag
            if(!sXML.match(/^<\?xml/i)) {
                sXML = '<?xml version="1.0"?>' + sXML;
            }

            // Parse it!
            if(window.DOMParser) {
                return (new DOMParser()).parseFromString(sXML, 'text/xml');
            }

            if(window.ActiveXObject) {
                var oXML = new ActiveXObject('Microsoft.XMLDOM');
                oXML.loadXML(sXML);

                return oXML;
            }
        } catch(e) {
            Console.error('Common.XMLFromString', e);

            return '';
        }

    };


    /**
     * Watches for input value change (delays callback)
     * @public
     * @param {function} cb
     * @return {function}
     */
    self.typewatch = function(cb) {

        try {
            var timer = 0;

            return function(callback, ms) {
                clearTimeout(timer);
                timer = setTimeout(callback, ms);
            };
        } catch(e) {
            Console.error('Common.typewatch', e);
        }

    };
    
    /**
     * Convert all applicable characters to HTML entities
     * @public
     * @param {string} cb
     * @return {string}
     */
    self.htmlentities = function(s) {
        return $('<div/>').text(s + '').html();
    };



    /**
     * Return class scope
     */
    return self;

})();

var JappixCommon = Common;
