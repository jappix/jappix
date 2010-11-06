/*

Jappix - An open social platform
These are the anonymous mode JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Connected to an anonymous session
function anonymousConnected(con) {
	logThis('Jappix (anonymous) is now connected.');
	
	// Create the app
	createTalkPage();
	
	// Connected marker
	CURRENT_SESSION = true;
	
	// Send our first presence
	firstPresence('');
	
	// Open the new groupchat
	var room = $('#data .anonymous').attr('data-room');
	
	// If no domain is defined, we assume this must be ours
	if(room.indexOf('@') == -1)
		room = room + '@' + HOST_MUC;
	
	// Store the room XID in the database
	setDB('anonymous', 'room', room);
	
	// Create the new groupchat
	checkChatCreate(room, 'groupchat');
	
	// We change the title of the page
	pageTitle('talk');
	
	// Remove some nasty elements for the anonymous mode
	$('.tools-mucadmin, .tools-add').remove();
	
	// Remove the waiting icon
	removeGeneralWait();
}

// Disconnected from an anonymous session
function anonymousDisconnected() {
	logThis('Jappix (anonymous) is now disconnected.');
	
	// Reset the anonymous tools
	$('.removable').remove();
	
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

// Plugin launcher
function launchAnonymous() {
	logThis('Anonymous mode detected, connecting...');
	
	// We add the login wait div
	showGeneralWait();
	
	// Fire the login action
	anonymousLogin(HOST_ANONYMOUS);
}

// Launch this plugin!
$(document).ready(launchAnonymous);
