/*

Jappix - An open social platform
These are the utilities JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Olivier M.
Contact: http://project.jappix.com/contact
Last revision: 01/11/10

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

// Gets the asked translated string
function _e(string) {
	return string;
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
	return exists('#data .anonymous');
}

// Checks if this is a private chat user
function isPrivate(xid) {
	if(exists('[data-xid=' + xid + '][data-type=groupchat]'))
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

// Parses a date TZO
function parseDateTZO(tzo) {
	// Get the sign
	var sign = -1;
	
	if(tzo.match(/^-/))
		sign = 1;
	
	// Remove the sign
	tzo = tzo.replace(/^(\+|-)(.+)$/, '$2');
	
	// Get the hours
	var hours = parseInt(explodeThis(':', tzo, 0));
	
	// Get the minutes
	var minutes = parseInt(explodeThis(':', tzo, 1));
	
	// Process the TZO stamp
	var stamp = (((hours * 60) + (minutes)) * 60 * 1000) * sign;
	
	return stamp;
}

// Parses a XMPP date into an human-readable one
function parseDate(to_parse) {
	var date = new Date(to_parse);
	var parsed = date.toLocaleDateString() + ' (' + date.toLocaleTimeString() + ')';
	
	return parsed; 
}

// Parses a XMPP date stamp into a relative one
function relativeDate(to_parse) {
	// Get the current date
	var current_date = new Date(getXMPPTime());
	var current_stamp = current_date.getTime();
	
	// Parse the given date
	var old_date = new Date(to_parse);
	var old_stamp = old_date.getTime();
	var old_time = old_date.toLocaleTimeString();
	
	// Get the day number between the two dates
	var days = parseInt(Math.abs((old_stamp - current_stamp) / 86400000));
	
	// Invalid date?
	if(isNaN(old_stamp) || isNaN(days))
		return getCompleteTime();
	
	// Is it today?
	if((days == 0) || (current_date < old_date))
		return old_time;
	
	// It is yesterday?
	if(days == 1)
		return _e("Yesterday") + ' - ' + old_time;
	
	// Another longer period
	return _e("%s days ago").replace(/%s/, days) + ' - ' + old_time;
}

// Reverses the HTML encoding of a string
String.prototype.revertHtmlEnc = function() {
	var str = this.replace(/&amp;/g,'&');
	str = str.replace(/&lt;/g,'<');
	str = str.replace(/&gt;/g,'>');
	str = str.replace(/&quot;/g,'\"');
	str = str.replace(/<br>/g,'\n');
	
	return str;
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
	return $('#' + hex_md5(room) + ' div[data-nick=' + nick + ']').attr('data-xid');
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

// Escapes a string for an onEvent usage
function escapeOnEvent(str) {
	return str.replace(/['"]/g, '\\$&');
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
	if((DEVELOPER == 'on') && (typeof(console) != 'undefined'))
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

// Returns the XMPP server PubSub support
function enabledPubSub() {
	// Feature available?
	if(getDB('feature', NS_PUBSUB) == 'true')
		return true;
	
	return false;
}

// Converts a XML document into a string
function xmlToString(xmlData) {
	// For Internet Explorer
	if(window.ActiveXObject)
		return xmlData.xml;
	
	// For Mozilla, Firefox, Opera, etc.
	return (new XMLSerializer()).serializeToString(xmlData);
}
