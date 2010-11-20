/*

Jappix - An open social platform
These are the anonymous mode JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Emmanuel Gil Peyrot
Contact: http://project.jappix.com/contact
Last revision: 20/11/10

*/

// Connected to an anonymous session
function anonymousConnected(con) {
	logThis('Jappix (anonymous) is now connected.', 3);
	
	// Create the app
	createTalkPage();
	
	// Connected marker
	CURRENT_SESSION = true;
	
	// Send our first presence
	firstPresence('');
	
	// If no domain is defined, we assume this must be ours
	if(ANONYMOUS_ROOM.indexOf('@') == -1)
		ANONYMOUS_ROOM = ANONYMOUS_ROOM + '@' + HOST_MUC;
	
	// Create the new groupchat
	checkChatCreate(ANONYMOUS_ROOM, 'groupchat');
	
	// We change the title of the page
	pageTitle('talk');
	
	// Remove some nasty elements for the anonymous mode
	$('.tools-mucadmin, .tools-add').remove();
	
	// Remove the waiting icon
	removeGeneralWait();
}

// Disconnected from an anonymous session
function anonymousDisconnected() {
	logThis('Jappix (anonymous) is now disconnected.', 3);
	
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
	try {
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
		
		// Change the page title
		pageTitle('wait');
	}
	
	catch(e) {
		// Logs errors
		logThis('Error while anonymous loggin in: ' + e, 1);
		
		// Reset Jappix
		anonymousDisconnected();
		
		// Open an unknown error
		openThisError(2);
	}
	
	finally {
		return false;
	}
}

// Plugin launcher
function launchAnonymous() {
	logThis('Anonymous mode detected, connecting...', 3);
	
	// We add the login wait div
	showGeneralWait();
	
	// Fire the login action
	anonymousLogin(HOST_ANONYMOUS);
}

// Launch this plugin!
$(document).ready(launchAnonymous);

var anon_params = (function() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	
	for(var i = 0; i < hashes.length; i++) {
		var hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	
	return vars;
})();

if(anon_params['r'] && anon_params['n'] !== '')
	ANONYMOUS_ROOM = anon_params['r'];

if(anon_params['n'] && anon_params['n'] !== '')
	ANONYMOUS_NICK = anon_params['n'];
