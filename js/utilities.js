/*

Jappix - An open social platform
These are the utilities JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Olivier M.
Contact: http://project.jappix.com/contact
Last revision: 12/11/10

*/

// Checks if an element exists in the DOM
function exists(selector) {
	if($(selector).size() > 0)
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
	
	// Nothing special (yet full XID)
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
		return ' disabled="disabled"';
	
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

// Gets the nick from a XID
function getXIDNick(aXID) {
	return explodeThis('@', aXID, 0);
}

// Gets the host from a XID
function getXIDHost(aXID) {
	return explodeThis('@', aXID, 1);
}

// Checks if we are in the anonymous mode
function isAnonymous() {
	if(ANONYMOUS_ROOM)
		return true;
	
	return false;
}

// Checks if this is a private chat user
function isPrivate(xid) {
	if(exists('[data-xid=' + escape(xid) + '][data-type=groupchat]'))
		return true;
	
	return false;
}

// Gets the OS of the user
function osDetect() {
	var platform = navigator.platform;
	
	if(platform.indexOf('Win') != -1) platform = 'Windows';
	else if(platform.indexOf('Linux') != -1) platform = 'Linux';
	else if(platform.indexOf('Mac') != -1) platform = 'MacOS';
	else if(platform.indexOf('X11') != -1) platform = 'UNIX';
	
	return platform;
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

// Gets the timestamp
function getTimeStamp() {
	return Math.round(new Date().getTime() / 1000);
}

// Gets the last user activity in seconds
var LAST_ACTIVITY = 0;

function getLastActivity() {
	// Last activity not yet initialized?
	if(LAST_ACTIVITY == 0)
		return 0;
	
	return getTimeStamp() - LAST_ACTIVITY;
}

// Gets the last user available presence in seconds
var PRESENCE_LAST_ACTIVITY = 0;

function getPresenceLast() {
	// Last presence stamp not yet initialized?
	if(PRESENCE_LAST_ACTIVITY == 0)
		return 0;
	
	return getTimeStamp() - PRESENCE_LAST_ACTIVITY;
}

// Generates the time for XMPP
function getXMPPTime(location) {
	/* FROM : http://trac.jwchat.org/jsjac/browser/branches/jsjac_1.0/jsextras.js?rev=221 */
	
	// Initialize
	var jInit = new Date();
	var year, month, date, hours, minutes, seconds;
	
	// Gets the UTC date
	if(location == 'utc') {
		year = jInit.getUTCFullYear();
		month = jInit.getUTCMonth();
		date = jInit.getUTCDate();
		hours = jInit.getUTCHours();
		minutes = jInit.getUTCMinutes();
		seconds = jInit.getUTCSeconds();
	}
	
	// Gets the local date
	else {
		year = jInit.getFullYear();
		month = jInit.getMonth();
		date = jInit.getDate();
		hours = jInit.getHours();
		minutes = jInit.getMinutes();
		seconds = jInit.getSeconds();
	}
	
	// Generates the date string
	var jDate = year + '-';
	jDate += padZero(month + 1) + '-';
	jDate += padZero(date) + 'T';
	jDate += padZero(hours) + ':';
	jDate += padZero(minutes) + ':';
	jDate += padZero(seconds) + 'Z';
	
	// Returns the date string
	return jDate;
}

// Generates then human time
function getCompleteTime() {
	var init = new Date();
	var time = padZero(init.getHours()) + ':';
	time += padZero(init.getMinutes()) + ':';
	time += padZero(init.getSeconds());
	
	return time;
}

// Gets the TZO of a date
function getDateTZO() {
	// Get the date
	var date = new Date();
	var offset = date.getTimezoneOffset();
	
	// Default vars
	var sign = '-';
	var hours = 0;
	var minutes = 0;
	
	// Process a neutral offset
	if(offset < 0) {
		offset = offset * -1;
		sign = '+';
	}
	
	// Get the values
	var n_date = new Date(offset * 60 * 1000);
	hours = n_date.getHours() - 1;
	minutes = n_date.getMinutes();
	
	// Process the TZO
	tzo = sign + padZero(hours) + ':' + padZero(minutes);
	
	// Return the processed value
	return tzo;
}

// Parses a XMPP date into an human-readable one
function parseDate(to_parse) {
	var date = Date.jab2date(to_parse);
	var parsed = date.toLocaleDateString() + ' (' + date.toLocaleTimeString() + ')';
	
	return parsed; 
}

// Parses a XMPP date stamp into a relative one
function relativeDate(to_parse) {
	// Get the current date
	var current_date = Date.jab2date(getXMPPTime('utc'));
	var current_stamp = current_date.getTime();
	
	// Parse the given date
	var old_date = Date.jab2date(to_parse);
	var old_stamp = old_date.getTime();
	var old_time = old_date.toLocaleTimeString();
	
	// Get the day number between the two dates
	var days = Math.round((current_stamp - old_stamp) / 86400000);
	
	// Invalid date?
	if(isNaN(old_stamp) || isNaN(days))
		return getCompleteTime();
	
	// Is it today?
	if(days <= 0)
		return old_time;
	
	// It is yesterday?
	if(days == 1)
		return _e("Yesterday") + ' - ' + old_time;
	
	// Another longer period
	return printf(_e("%s days ago"), days) + ' - ' + old_time;
}

// Reverses the HTML encoding of a string
String.prototype.revertHtmlEnc = function() {
	var str = this.replace(/&amp;/gi,'&');
	str = str.replace(/&lt;/gi,'<');
	str = str.replace(/&gt;/gi,'>');
	str = str.replace(/&quot;/gi,'\"');
	str = str.replace(/<br( )?(\/)?>/gi,'\n');
	
	return str;
}

// Checks if we are in developer mode
function isDeveloper() {
	if(DEVELOPER == 'on')
		return true;
	
	return false;
}

// Gets the full XID of the user
function getXID() {
	// Return the XID of the user
	return con.username + '@' + con.domain;
}

// Gets the nickname of the user
function getNick() {
	// Return the username of the user
	return con.username;
}

// Gets the MUC nickname of the user
function getMUCNick(id) {
	return $('#' + id).attr('data-nick');
}

// Gets a MUC user XID
function getMUCUserXID(room, nick) {
	return unescape($('#' + hex_md5(room) + ' div[data-nick=' + nick + ']').attr('data-xid'));
}

// Gets a MUC user read XID
function getMUCUserRealXID(room, nick) {
	return $('#' + hex_md5(room) + ' div[data-nick=' + nick + ']').attr('data-realxid');
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

// Quotes the nick of an user
function quoteMyNick(hash, nick) {
	$('#chat-engine #' + hash + ' .message-area').val(nick + ', ').focus();
}

// Checks if the XID is a gateway
function isGateway(xid) {
	if(xid.indexOf('@') != -1)
		return false;
	
	return true;
}

// Returns the given XID buddy name
function getBuddyName(xid) {
	// Initialize
	var cname, bname;
	
	// Cut the XID resource
	xid = cutResource(xid);
	
	// This is me?
	if(xid == getXID())
		bname = _e("You");
	
	// Not me...
	else {
		cname = $('#buddy-list .buddy[data-xid=' + xid + ']:first .buddy-name').html();
		
		// If the complete name exists
		if(cname)
			bname = cname;
		
		// Else, we just get the nickname of the buddy
		else
			bname = getXIDNick(xid);
	}
	
	return bname.revertHtmlEnc();
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
function logThis(data) {
	// A console is available
	if(isDeveloper() && (typeof(console) != 'undefined'))
		console.log(data);
}

// Gets all the buddies in our roster
function getAllBuddies() {
	var buddies = new Array();
	
	$('#buddy-list .buddy').each(function() {
		var xid = $(this).attr('data-xid');
		
		if(xid)
			buddies.push(xid);
	});
	
	return buddies;
}

// Enables a feature
function enableFeature(feature) {
	setDB('feature', feature, 'true');
}

// Checks if a feature is enabled
function enabledFeature(feature) {
	if(getDB('feature', feature) == 'true')
		return true;
	else
		return false;
}

// Returns the XMPP server PEP support
function enabledPEP() {
	return enabledFeature('pep');
}

// Returns the XMPP server PubSub support
function enabledPubSub() {
	return enabledFeature(NS_PUBSUB);
}

// Returns the XMPP server archives support
function enabledArchives(sub) {
	var xmlns = NS_URN_ARCHIVE;
	
	// Any sub element sent?
	if(sub)
		xmlns += ':' + sub;
	
	return enabledFeature(xmlns);
}

// Converts a XML document into a string
function xmlToString(xmlData) {
	// For Internet Explorer
	if(window.ActiveXObject)
		return xmlData.xml;
	
	// For Mozilla, Firefox, Opera, etc.
	return (new XMLSerializer()).serializeToString(xmlData);
}

// Registers Jappix as the default XMPP links handler
function xmppLinksHandler() {
	navigator.registerProtocolHandler('xmpp', JAPPIX_LOCATION + '?x=%s', SERVICE_NAME);
}
