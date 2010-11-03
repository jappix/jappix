/*

Jappix - An open social platform
These are the anonymous mode JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/11/10

*/

// Connected to an anonymous session
function anonymousConnected(con) {
	logThis('Jappix (anonymous) is now connected.');
	
	// Connected marker
	CURRENT_SESSION = true;
	
	// Send our first presence
	firstPresence('');
	
	// Start the auto idle functions
	liveIdle();
	
	// Open the new groupchat
	var room = $('#data .anonymous').attr('data-room');
	
	// If no domain is defined, we assume this must be ours
	if(room.indexOf('@') == -1)
		room = room + '@' + HOST_MUC;
	
	// Store the room XID in the database
	setDB('anonymous', 'room', room);
	
	// Create the new groupchat
	checkChatCreate(room, 'groupchat');
	
	// Show the app
	$('#talk').show();
	
	// We change the title of the page
	pageTitle('talk');
	
	// Remove some nasty elements for the anonymous mode (and to make the DOM lighter)
	$('#channel, #chat-switch .channel, .tools-mucadmin, .tools-add, .lock:has(.popup):not(#userinfos, #integratebox), #top-content, #buddy-list, #my-infos .element:not(.f-presence)').remove();
	
	// Hide waiting icon
	$('#general-wait').hide();
}

// Disconnected from an anonymous session
function anonymousDisconnected() {
	logThis('Jappix (anonymous) is now disconnected.');
	
	// Reset the anonymous tools
	$('#talk').hide();
	$('.removable').remove();
	$('.showable').show();
	$('.hidable').hide();
	$('.resetable').val('');
	
	// Kill the auto idle functions
	dieIdle();
	
	// Reconnect pane
	if(CURRENT_SESSION)
		createReconnect('anonymous');
}

// Logins to a anonymous account
function anonymousLogin(server) {
	// We define the http binding parameters
	oArgs = new Object();
	oArgs.httpbase = HOST_BOSH;
	oArgs.timerval = 2000;
	
	// We create the new http-binding connection
	con = new JSJaCHttpBindingConnection(oArgs);
	
	// And we handle everything that happen
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('iq', handleIQ);
	con.registerHandler('onconnect', anonymousConnected);
	con.registerHandler('onerror', handleError);
	con.registerHandler('ondisconnect', anonymousDisconnected);
	
	// We set the anonymous connection parameters
	oArgs = new Object();
	oArgs.domain = server;
	oArgs.authtype = 'saslanon';
	oArgs.resource = JAPPIX_RESOURCE + ' Anonymous';
	oArgs.secure = true;
	
	// We connect !
	con.connect(oArgs);
}

// Launch this plugin!
$(document).ready(function() {
	logThis('Anonymous mode detected, connecting...');
	
	// We add the login wait div
	$('#general-wait').show();
	
	// Fire the login action
	anonymousLogin(HOST_ANONYMOUS);
});
