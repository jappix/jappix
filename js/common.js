/*

Jappix - An open social platform
These are the common JS script for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, olivierm, regilero, Maranda
Last revision: 24/09/12

*/

// Checks if an element exists in the DOM
function exists(selector) {
	if(jQuery(selector).size() > 0)
		return true;
	else
		return false;
}

// Checks if the URL passed has the same origin than Jappix itself
function isSameOrigin(url) {
	/* Source: http://stackoverflow.com/questions/9404793/check-if-same-origin-policy-applies */

    var loc = window.location,
        a = document.createElement('a');

    a.href = url;

    return (!a.hostname	|| (a.hostname == loc.hostname))	&&
           (!a.port		|| (a.port == loc.port))			&&
           (!a.protocol	|| (a.protocol == loc.protocol));
}

// Checks if Jappix is connected
function isConnected() {
	if((typeof con != 'undefined') && con && con.connected())
		return true;
	
	return false;
}

// Checks if Jappix has focus
function isFocused() {
	try {
		if(document.hasFocus())
			return true;
		
		return false;
	}
	
	catch(e) {
		return true;
	}
}

// Generates the good XID
function generateXID(xid, type) {
	// XID needs to be transformed
	// .. and made lowercase (uncertain though this is the right place...)
	xid = xid.toLowerCase();

	if(xid && (xid.indexOf('@') == -1)) {
		// Groupchat
		if(type == 'groupchat')
			return xid + '@' + HOST_MUC;
		
		// One-to-one chat
		if(xid.indexOf('.') == -1)
			return xid + '@' + HOST_MAIN;
		
		// It might be a gateway?
		return xid;
	}
	
	// Nothing special (yet bare XID)
	return xid;
}

// Gets the asked translated string
function _e(string) {
	return string;
}

// Replaces '%s' to a given value for a translated string
function printf(string, value) {
	return string.replace('%s', value);
}

// Returns the string after the last given char
function strAfterLast(given_char, str) {
	if(!given_char || !str)
		return '';
	
	var char_index = str.lastIndexOf(given_char);
	var str_return = str;
	
	if(char_index >= 0)
		str_return = str.substr(char_index + 1);
	
	return str_return;
}

// Properly explodes a string with a given character
function explodeThis(toEx, toStr, i) {
	// Get the index of our char to explode
	var index = toStr.indexOf(toEx);
	
	// We split if necessary the string
	if(index != -1) {
		if(i == 0)
			toStr = toStr.substr(0, index);
		else
			toStr = toStr.substr(index + 1);
	}
	
	// We return the value
	return toStr;
}

// Cuts the resource of a XID
function cutResource(aXID) {
	return explodeThis('/', aXID, 0);
}

// Gets the resource of a XID
function thisResource(aXID) {
	// Any resource?
	if(aXID.indexOf('/') != -1)
		return explodeThis('/', aXID, 1);
	
	// No resource
	return '';
}

// nodepreps an XMPP node
function nodeprep(node) {
	// Spec: http://tools.ietf.org/html/rfc6122#appendix-A

	if(!node)
		return node;

	// Remove prohibited chars
	var prohibited_chars = ['"', '&', '\'', '/', ':', '<', '>', '@'];

	for(j in prohibited_chars)
		node = node.replace(prohibited_chars[j], '');

	// Lower case
	node = node.toLowerCase();

	return node;
}

// Encodes quotes in a string
function encodeQuotes(str) {
	return (str + '').htmlEnc();
}

// Gets the bare XID from a XID
function bareXID(xid) {
	// Cut the resource
	xid = cutResource(xid);
	
	// Launch nodeprep
	if(xid.indexOf('@') != -1)
		xid = nodeprep(getXIDNick(xid)) + '@' + getXIDHost(xid);
	
	return xid;
}

// Gets the full XID from a XID
function fullXID(xid) {
	// Normalizes the XID
	var full = bareXID(xid);
	var resource = thisResource(xid);
	
	// Any resource?
	if(resource)
		full += '/' + resource;
	
	return full;
}

// Gets the nick from a XID
function getXIDNick(aXID) {
	// Gateway nick?
	if(aXID.match(/\\40/))
		return explodeThis('\\40', aXID, 0);
	
	return explodeThis('@', aXID, 0);
}

// Gets the host from a XID
function getXIDHost(aXID) {
	return explodeThis('@', aXID, 1);
}

// Checks if we are in developer mode
function isDeveloper() {
	return (DEVELOPER == 'on');
}

// Checks if we are RTL (Right-To-Left)
function isRTL() {
	return (_e("default:LTR") == 'default:RTL');
}

// Checks if anonymous mode is allowed
function allowedAnonymous() {
	return (ANONYMOUS == 'on');
}

// Checks if host is locked
function lockHost() {
	return (LOCK_HOST == 'on');
}

// Gets the full XID of the user
function getXID() {
	// Return the XID of the user
	if(con.username && con.domain)
		return con.username + '@' + con.domain;
	
	return '';
}

// Generates the colors for a given user XID
function generateColor(xid) {
	var colors = new Array(
			'ac0000',
			'a66200',
			'007703',
			'00705f',
			'00236b',
			'4e005c'
		     );
	
	var number = 0;
	
	for(var i = 0; i < xid.length; i++)
		number += xid.charCodeAt(i);
	
	var color = '#' + colors[number % (colors.length)];
	
	return color;
}

// Checks if the XID is a gateway
function isGateway(xid) {
	if(xid.indexOf('@') != -1)
		return false;
	
	return true;
}

// Gets the from attribute of a stanza (overrides some servers like Prosody missing from attributes)
function getStanzaFrom(stanza) {
	var from = stanza.getFrom();
	
	// No from, we assume this is our XID
	if(!from)
		from = getXID();
	
	return from;
}

// Logs a given data in the console
function logThis(data, level) {
	// Console not available
	if(!isDeveloper() || (typeof(console) == 'undefined'))
		return false;
	
	// Switch the log level
	switch(level) {
		// Debug
		case 0:
			console.debug(data);
			
			break;
		
		// Error
		case 1:
			console.error(data);
			
			break;
		
		// Warning
		case 2:
			console.warn(data);
			
			break;
		
		// Information
		case 3:
			console.info(data);
			
			break;
		
		// Default log level
		default:
			console.log(data);
			
			break;
	}
	
	return true;
}

// Gets the current Jappix app. location
function getJappixLocation() {
	var url = window.location.href;
	
	// If the URL has variables, remove them
	if(url.indexOf('?') != -1)
		url = url.split('?')[0];
	if(url.indexOf('#') != -1)
		url = url.split('#')[0];
	
	// No "/" at the end
	if(!url.match(/(.+)\/$/))
		url += '/';
	
	return url;
}

// Removes spaces at the beginning & the end of a string
function trim(str) {
	return str.replace(/^\s+/g,'').replace(/\s+$/g,'');
}

// Adds a zero to a date when needed
function padZero(i) {
	// Negative number (without first 0)
	if(i > -10 && i < 0)
		return '-0' + (i * -1);
	
	// Positive number (without first 0)
	if(i < 10 && i >= 0)
		return '0' + i;
	
	// All is okay
	return i;
}

// Escapes a string for a regex usage
function escapeRegex(query) {
	return query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Returns a random array value
function randomArrayValue(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Returns whether the browser is mobile or not
function isMobile() {
	try {
		return /Android|iPhone|iPod|iPad|Windows Phone|BlackBerry|Bada|Maemo|Meego|webOS/i.test(navigator.userAgent);
	} catch(e) {
		return false;
	}
}