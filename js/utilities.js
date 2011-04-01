/*

Jappix - An open social platform
These are the utilities JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Olivier Migeot
Last revision: 01/04/11

*/

// Checks if an element exists in the DOM
function exists(selector) {
	if(jQuery(selector).size() > 0)
		return true;
	else
		return false;
}

// Checks if a function exists
function functionExists(func) {
	if(typeof func == 'function')
		return true;
	
	return false;
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
		return false;
	}
}

// Generates the good XID
function generateXID(xid, type) {
	// XID needs to be transformed
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

// Generates the good storage URL
function generateURL(url) {
	// HTTPS not allowed
	if((HTTPS_STORAGE != 'on') && url.match(/^https(.+)/))
		url = 'http' + RegExp.$1;
	
	return url;
}

// Disables an input if needed
function disableInput(value, condition) {
	if(value == condition)
		return ' disabled=""';
	
	return '';
}

// Gets the asked translated string
function _e(string) {
	return string;
}

// Replaces '%s' to a given value for a translated string
function printf(string, value) {
	return string.replace('%s', value);
}

// Cuts a string
function cut(string, limit) {
	return string.substr(0, limit);
}

// Truncates a string
function truncate(string, limit) {
	// Must truncate the string
	if(string.length > limit)
		string = string.substr(0, limit) + '...';
	
	return string;
}

// Removes the new lines
function noLines(string) {
	return string.replace(/\n/g, ' ');
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

// Does stringprep on a string
function stringPrep(string) {
	// Replacement arrays
	var invalid = new Array('Š', 'š', 'Đ', 'đ', 'Ž', 'ž', 'Č', 'č', 'Ć', 'ć', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ø', 'ù', 'ú', 'û', 'ý', 'þ', 'ÿ', 'Ŕ', 'ŕ');
	
	var valid   = new Array('S', 's', 'Dj', 'dj', 'Z', 'z', 'C', 'c', 'C', 'c', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'C', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'N', 'O', 'O', 'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'Y', 'B', 'Ss', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'n', 'o', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'y', 'b', 'y', 'R', 'r');
	
	// Compute a new string
	for(i in invalid)
		string = string.replace(invalid[i], valid[i]);
	
	return string;
}

// Encodes quotes in a string
function encodeQuotes(str) {
	return (str + '').replace(/"/g, '&quot;');
}

// Encodes a string for onclick attribute
function encodeOnclick(str) {
	return (encodeQuotes(str)).replace(/'/g, '\\$&');
}

// Gets the bare XID from a XID
function bareXID(xid) {
	// Cut the resource
	xid = cutResource(xid);
	
	// Launch the stringprep
	xid = stringPrep(xid);
	
	// Set the XID to lower case
	xid = xid.toLowerCase();
	
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
	return explodeThis('@', aXID, 0);
}

// Gets the host from a XID
function getXIDHost(aXID) {
	return explodeThis('@', aXID, 1);
}

// Checks if anonymous mode is allowed
function allowedAnonymous() {
	if(ANONYMOUS == 'on')
		return true;
	
	return false;
}

// Checks if we are in the anonymous mode
function isAnonymous() {
	if(allowedAnonymous() && LINK_VARS['r'])
		return true;
	
	return false;
}

// Checks if this is a private chat user
function isPrivate(xid) {
	if(exists('[data-xid=' + escape(xid) + '][data-type=groupchat]'))
		return true;
	
	return false;
}

// Checks if the user browser is obsolete
function isObsolete() {
	// Get browser name & version
	var browser_name = BrowserDetect.browser;
	var browser_version = BrowserDetect.version;
	
	// Obsolete IE
	if((browser_name == 'Explorer') && (browser_version < 8))
		return true;
	
	// Obsolete Chrome
	if((browser_name == 'Chrome') && (browser_version < 7))
		return true;
	
	// Obsolete Safari
	if((browser_name == 'Safari') && (browser_version < 4))
		return true;
	
	// Obsolete Firefox
	if((browser_name == 'Firefox') && (browser_version < 3.5))
		return true;
	
	// Obsolete Opera
	if((browser_name == 'Opera') && (browser_version < 9))
		return true;
	
	return false;
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

// Checks if we are in developer mode
function isDeveloper() {
	if(DEVELOPER == 'on')
		return true;
	
	return false;
}

// Checks if host is locked
function lockHost() {
	if(LOCK_HOST == 'on')
		return true;
	
	return false;
}

// Gets the full XID of the user
function getXID() {
	// Return the XID of the user
	if(con.username && con.domain)
		return con.username + '@' + con.domain;
	
	return '';
}

// Gets a MUC user XID
function getMUCUserXID(room, nick) {
	return unescape($('div.chat[data-xid=' + escape(room) + '] div[data-nick=' + escape(nick) + ']').attr('data-xid'));
}

// Gets a MUC user read XID
function getMUCUserRealXID(room, nick) {
	return $('div.chat[data-xid=' + escape(room) + '] div[data-nick=' + escape(nick) + ']').attr('data-realxid');
}

// Gets the server of the user
function getServer() {
	// Return the domain of the user
	return con.domain;
}

// Gets the password of the user
function getPassword() {
	// Return the password of the user
	return con.pass;
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

// Quotes the nick of an user
function quoteMyNick(hash, nick) {
	$(document).oneTime(10, function() {
		$('#page-engine #' + hash + ' .message-area').val(nick + ', ').focus();
	});
}

// Checks if the XID is a gateway
function isGateway(xid) {
	if(xid.indexOf('@') != -1)
		return false;
	
	return true;
}

// Escapes a string for a regex usage
function escapeRegex(query) {
	return query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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

// Converts a XML document to a string
function xmlToString(xmlData) {
	try {
		// For Mozilla, Firefox, Opera, etc.
		if(window.XMLSerializer)
			return (new XMLSerializer()).serializeToString(xmlData);
		
		// For Internet Explorer
		if(window.ActiveXObject)
			return xmlData.xml;
		
		return null;
	}
	
	catch(e) {
		return null;
	}
}

// Converts a string to a XML document
function XMLFromString(sXML) {
	try {
		// No data?
		if(!sXML)
			return '';
		
		// Add the XML tag
		if(!sXML.match(/^<\?xml/i))
			sXML = '<?xml version="1.0"?>' + sXML;
		
		// Parse it!
		if(window.DOMParser)
			return (new DOMParser()).parseFromString(sXML, 'text/xml');
		
		if(window.ActiveXObject) {
			var oXML = new ActiveXObject('Microsoft.XMLDOM');
			oXML.loadXML(sXML);
			
	 		return oXML;
		}
	}
	
	catch(e) {
		return '';
	}
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

// Return the file category
function fileCategory(ext) {
	var cat;
	
	switch(ext) {
		// Images
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'bmp':
		case 'gif':
		case 'tif':
		case 'svg':
		case 'psp':
		case 'xcf':
			cat = 'image';
			
			break;
		
		// Videos
		case 'ogv':
		case 'mkv':
		case 'avi':
		case 'mov':
		case 'mp4':
		case 'm4v':
		case 'wmv':
		case 'asf':
		case 'mpg':
		case 'mpeg':
		case 'ogm':
		case 'rmvb':
		case 'rmv':
		case 'qt':
		case 'flv':
		case 'ram':
		case '3gp':
		case 'avc':
			cat = 'video';
			
			break;
		
		// Sounds
		case 'oga':
		case 'ogg':
		case 'mka':
		case 'flac':
		case 'mp3':
		case 'wav':
		case 'm4a':
		case 'wma':
		case 'rmab':
		case 'rma':
		case 'bwf':
		case 'aiff':
		case 'caf':
		case 'cda':
		case 'atrac':
		case 'vqf':
		case 'au':
		case 'aac':
		case 'm3u':
		case 'mid':
		case 'mp2':
		case 'snd':
		case 'voc':
			cat = 'audio';
			
			break;
		
		// Documents
		case 'pdf':
		case 'odt':
		case 'ott':
		case 'sxw':
		case 'stw':
		case 'ots':
		case 'sxc':
		case 'stc':
		case 'sxi':
		case 'sti':
		case 'pot':
		case 'odp':
		case 'ods':
		case 'doc':
		case 'docx':
		case 'docm':
		case 'xls':
		case 'xlsx':
		case 'xlsm':
		case 'xlt':
		case 'ppt':
		case 'pptx':
		case 'pptm':
		case 'pps':
		case 'odg':
		case 'otp':
		case 'sxd':
		case 'std':
		case 'std':
		case 'rtf':
		case 'txt':
		case 'htm':
		case 'html':
		case 'shtml':
		case 'dhtml':
		case 'mshtml':
			cat = 'document';
			
			break;
		
		// Packages
		case 'tgz':
		case 'gz':
		case 'tar':
		case 'ar':
		case 'cbz':
		case 'jar':
		case 'tar.7z':
		case 'tar.bz2':
		case 'tar.gz':
		case 'tar.lzma':
		case 'tar.xz':
		case 'zip':
		case 'xz':
		case 'rar':
		case 'bz':
		case 'deb':
		case 'rpm':
		case '7z':
		case 'ace':
		case 'cab':
		case 'arj':
		case 'msi':
			cat = 'package';
			
			break;
		
		// Others
		default:
			cat = 'other';
			
			break;
	}
	
	return cat;
}

// Registers Jappix as the default XMPP links handler
function xmppLinksHandler() {
	try {
		navigator.registerProtocolHandler('xmpp', JAPPIX_LOCATION + '?x=%s', SERVICE_NAME);
		
		return true;
	}
	
	catch(e) {
		return false;
	}
}

// Removes spaces at the beginning & the end of a string
function trim(str) {
	return str.replace(/^\s+/g,'').replace(/\s+$/g,'');
}

// Checks if a value exists in an array
function existArrayValue(array, value) {
	// Loop in the array
	for(i in array) {
		if(array[i] == value)
			return true;
	}
	
	return false;
}

// Removes a value from an array
function removeArrayValue(array, value) {
	for(i in array) {
		// It matches, remove it!
		if(array[i] == value) {
			array.splice(i, 1);
			
			return true;
		}
	}
	
	return false;
}
