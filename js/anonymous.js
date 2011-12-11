/*

Jappix - An Open μSocial Platform
These are the anonymous mode JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function anonymousConnected(con) {
	// Open the new groupchat
	var room = $('#data .anonymous .room').val();
	checkChatCreate(room, 'groupchat');
	
	// Show the app
	$('#talk').show();
	
	// We change the title of the page
	pageTitle(room);
	
	// Remove some nasty elements for the anonymous mode (and to make the DOM liter)
	$('#channel, .tools-muc-close, .tools-mucadmin, #top-content, #left-content, #chat-switch, #vcard, #options, #about, #favorites, #discovery, #inbox, #muc-admin, #userinfos, #home, #general-wait').remove();
}

function anonymousLogin(server) {
	// We define the http binding parameters
	oArgs = new Object();
	oArgs.httpbase = getSystem('http-base');
	oArgs.timerval = 2000;
	
	// We create the new http-binding connection
	con = new JSJaCHttpBindingConnection(oArgs);
	
	// And we handle everything that happen
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('onconnect', anonymousConnected);
	con.registerHandler('onerror', handleError);
	
	// We set the anonymous connection parameters
	oArgs = new Object();
	oArgs.domain = server;
	oArgs.authtype = 'saslanon';
	oArgs.resource = 'JappixAnonymous';
	
	// We connect !
	con.connect(oArgs);
}

$(document).ready(function() {
	// We add the login wait div
	$("#general-wait").show();
	
	// Get some values
	var server = getHost('anonymous');
	
	// Fire the login action
	anonymousLogin(server);
});
