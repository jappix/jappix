/*

Jappix - An Open μSocial Platform
These are the utilities JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// Checks if an element exists in the DOM
function exists(selector) {
	if($(selector).length > 0)
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

// Gets the asked host
function getHost(id) {
	var type = $("#data .hosts .host-" + id).val();
	return type;
}

// Generates the good JID
function generateJID(jid, type) {
	// JID needs to be transformed
	if((jid.indexOf('@') == -1) && (jid.indexOf('.') == -1)) {
		// Groupchat
		if(type == 'groupchat')
			return jid + '@' + getHost('muc');
		
		// One-to-one chat
		return jid + '@' + getHost('main');
	}
	
	// Nothing special
	return jid;
}

// Gets the Jappix version
function getSystem(id) {
	var type = $("#data .system ." + id).val();
	return type;
}

// Gets the asked translated string
function _e(id) {
	var lang = $('#data .translate .translation-' + id).val();
	return lang;
}

// Generates a random ID
function genID() {
	return getDOMLife() + Math.floor(Math.random() * 100000001);
}

// Does an action on a JID resource
function actionResource(aJID, i) {
	// We split if necessary the JID
	if (aJID.indexOf('/') != -1)
		aJID = aJID.split('/')[i];
	
	// We return the value
	return aJID;
}

// Cuts the resource of a JID
function cutResource(aJID) {
	return actionResource(aJID, 0);
}

// Gets the resource of a JID
function getResource(aJID) {
	return actionResource(aJID, 1);
}

// Checks if we are in the anonymous mode
function isAnonymous() {
	return exists('#data .anonymous');
}

// Hides all the bubbles on double click
$(document).ready(function() {
	$('#talk').dblclick(function() {
		$('.bubble').hide();
	});
});

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
	if (i < 10)
		return '0' + i;
	else
		return i;
}

// Gets the DOM life in seconds
function getDOMLife() {
	var date = new Date();
	date.setYear(2010);
	date.setMonth(1);
	return parseInt(date.getTime() / 1000);
}

// Gets the last user activity in seconds
function getLastActivity() {
	return getDOMLife() - parseInt(getDB('domlife', 1));
}

// Generates the time for XMPP
function getXMPPTime() {
	/* FROM : http://trac.jwchat.org/jsjac/browser/branches/jsjac_1.0/jsextras.js?rev=221 */
	
	var jInit = new Date();
	var jDate = jInit.getFullYear() + '-';
	jDate += padZero(jInit.getMonth()+1) + '-';
	jDate += padZero(jInit.getDate()) + 'T';
	jDate += padZero(jInit.getHours()) + ':';
	jDate += padZero(jInit.getMinutes()) + ':';
	jDate += padZero(jInit.getSeconds()) + 'Z';
	
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

// Reverses the HTML encoding of a string
String.prototype.revertHtmlEnc = function() {
	var str = this.replace(/&amp;/g,"&");
	str = str.replace(/&lt;/g,"<");
	str = str.replace(/&gt;/g,">");
	str = str.replace(/&quot;/g,"\"");
	str = str.replace(/<br>/g,"\n");
	
	return str;
}

// Returns an array of all the disco#infos
function getDiscoInfos() {
	var fArray = new Array(
		NS_MUC,
		NS_MUC_USER,
		NS_MUC_ADMIN,
		NS_MUC_OWNER,
		NS_MUC_CONFIG,
		NS_DISCO_INFO,
		NS_DISCO_ITEMS,
		NS_PUBSUB_RI,
		NS_BOSH,
		NS_CAPS,
		NS_MOOD,
		NS_ACTIVITY,
		NS_TUNE,
		NS_GEOLOC,
		NS_NICK,
		NS_URN_ADATA,
		NS_URN_AMETA,
		NS_URN_MBLOG,
		NS_MOOD + NS_NOTIFY,
		NS_ACTIVITY + NS_NOTIFY,
		NS_TUNE + NS_NOTIFY,
		NS_GEOLOC + NS_NOTIFY,
		NS_URN_MBLOG + NS_NOTIFY,
		NS_ROSTER,
		NS_HTTP_AUTH,
		NS_CHATSTATES,
		NS_XHTML_IM,
		NS_IPV6,
		NS_LAST,
		NS_PRIVATE,
		NS_REGISTER,
		NS_SEARCH,
		NS_COMMANDS,
		NS_VERSION,
		NS_XDATA,
		NS_VCARD,
		NS_URN_TIME,
		NS_URN_PING
	);
	
	return fArray;
}

// Generates the CAPS hash
function processCaps() {
	// Initialize
	var cString = 'client/web//Jappix<';
	var cArray = getDiscoInfos().sort();
	
	// Process the sorted feature strings
	for(var i = 0; i < cArray.length; i++)
		cString += cArray[i] + '<';
	
	// Process the SHA-1 hash
	var cHash = b64_sha1(cString);
	
	return cHash;
}

// Gets the full JID of the user
function getJID() {
	// Return the JID of the user
	return con.username + "@" + con.domain;
}

// Gets the nickname of the user
function getNick() {
	// Return the username of the user
	return con.username;
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
	var pathToInput = '#chat-engine #' + hash + ' .message-area';
	$(pathToInput).val(nick + ', ');
	$(pathToInput).focus();
}
