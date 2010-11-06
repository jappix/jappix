/*

Jappix - An open social platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Does the user login
var CURRENT_SESSION = false;

function doLogin(lNick, lServer, lPass, lResource, lPriority, lRemember) {
	try {
		// We remove the not completed class to avoid problems
		$('#home .loginer input').removeClass('please-complete');
		
		// We add the login wait div
		showGeneralWait();
		
		// We define the http binding parameters
		oArgs = new Object();
		oArgs.httpbase = HOST_BOSH;
		oArgs.timerval = 2000;
		
		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// And we handle everything that happen
		setupCon(con);
		
		// We retrieve what the user typed in the login inputs
		oArgs = new Object();
		oArgs.domain = lServer;
		oArgs.username = lNick;
		oArgs.resource = lResource;
		oArgs.pass = lPass;
		oArgs.secure = true;
		
		// Generate a session XML to be stored
		session_xml = '<session><stored>true</stored><domain>' + lServer + '</domain><username>' + lNick + '</username><resource>' + lResource + '</resource><password>' + lPass + '</password><priority>' + lPriority + '</priority></session>';
		
		// Save the session parameters (for reconnect if network issue)
		CURRENT_SESSION = session_xml;
		
		// Remember me?
		if(lRemember)
			setPersistent('session', 1, session_xml);
		
		// We store the infos of the user into the data-base
		setDB('priority', 1, lPriority);
		
		// We connect !
		con.connect(oArgs);
		
		logThis('Jappix is connecting...');
	}
	
	catch(e) {
		// Logs errors
		logThis(e);
		
		// Reset the database (maximum size might be reached)
		resetPersistent();
		
		// Try to login again
		doLogin();
	}
	
	finally {
		return false;
	}
}

// Handles the user registration
function handleRegistered() {
	logThis('A new account has been registered.');
	
	// We remove the waiting image
	removeGeneralWait();
	
	// We show the success information
	$('#home .registerer .success').fadeIn('fast');
	
	// We quit the session
	logout();
}

// Does the user registration
function doRegister(username, domain, pass) {
	logThis('Trying to register an account...');
	
	try {
		// We define the http binding parameters
		oArgs = new Object();
		oArgs.httpbase = HOST_BOSH;
		oArgs.timerval = 2000;
		
		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// We setup the connection !
		con.registerHandler('onconnect', handleRegistered);
		con.registerHandler('onerror', handleError);
		
		// We retrieve what the user typed in the register inputs
		oArgs = new Object();
		oArgs.domain = domain;
		oArgs.username = username;
		oArgs.resource = JAPPIX_RESOURCE + ' Register';
		oArgs.pass = pass;
		oArgs.register = true;
		oArgs.secure = true;
		
		// We show the waiting image
		showGeneralWait();
		
		// We change the registered information text
		$('#home .registerer .success b').text(username + '@' + domain);
		
		// And here we go : we connect !
		con.connect(oArgs);
	}
	
	catch(e) {
		// Logs errors
		logThis(e);
	}
	
	finally {
		return false;
	}
}

// Does the user anonymous login
function doAnonymous() {
	logThis('Trying to login anonymously...');
	
	var aPath = '#home .anonymouser ';
	var room = $(aPath + '.room').val();
	var nick = $(aPath + '.nick').val();
	
	// If the form is correctly completed
	if(room && nick) {
		// We remove the not completed class to avoid problems
		$('#home .anonymouser input').removeClass('please-complete');
		
		// Redirect the user to the anonymous room
		window.location.href = JAPPIX_LOCATION + '?r=' + room + '&n=' + nick;
	}
	
	// We check if the form is entirely completed
	else {
		$(aPath + 'input[type=text]').each(function() {
			if(!$(this).val())
				$(this).addClass('please-complete');
			else
				$(this).removeClass('please-complete');	
		});
	}
	
	return false;
}

// Handles the user connected event
var CONNECTED = false;

function handleConnected() {
	logThis('Jappix is now connected.');
	
	// Connected marker
	CONNECTED = true;
	
	// We hide the home page
	$('#home').hide();
	removeGeneralWait();
	
	// We show the chatting app.
	createTalkPage();
	
	// We reset the homepage
	switchHome('default');
	
	// We change the title of the page
	pageTitle('talk');
	
	// We get all the other things
	getEverything();
	
	// Set last activity stamp
	LAST_ACTIVITY = getTimeStamp();
	
	// We open a new chat if a XMPP link was submitted
	var link = getVar('x');
	
	if(parent.location.hash != '#OK' && link) {
		// A link is submitted in the URL
		xmppLink(link);
		
		// Set a OK status
		parent.location.hash = 'OK';
	}
}

// Handles the user disconnected event
function handleDisconnected() {
	logThis('Jappix is now disconnected.');
	
	// Reset everything
	destroyTalkPage();
	
	// Is it a undesired disconnection?
	if(CURRENT_SESSION && CONNECTED)
		createReconnect('normal');
}

// Setups the normal connection
function setupCon(con) {
	// We setup all the necessary handlers for the connection
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('iq', handleIQ);
	con.registerHandler('onconnect', handleConnected);
	con.registerHandler('onerror', handleError);
	con.registerHandler('ondisconnect', handleDisconnected);
}

// Logouts from the server
function logout() {
	// We are not connected
	if(!con.connected())
		return;
	
	// Send unavailable presence
	sendPresence('', 'unavailable');
	
	// Disconnect from the XMPP server
	con.disconnect();
}

// Terminates a session
function terminate() {
	if((typeof con != 'undefined') && con && con.connected()) {
		// Clear temporary session storage
		CURRENT_SESSION = false;
		CONNECTED = false;
		
		// Show the waiting item (useful if BOSH is sloooow)
		showGeneralWait();
		
		// Disconnect from the XMPP server
		logout();
	}
}

// Quitss a session
function quit() {
	if(con.connected()) {
		// We show the waiting image
		showGeneralWait();
		
		// We disconnect from the XMPP server
		logout();
	}
}

// Creates the reconnect pane
function createReconnect(mode) {
	logThis('This is not a normal disconnection, show the reconnect pane...');
	
	// Reconnect pane not yet displayed?
	if(!exists('#reconnect')) {
		// Create the HTML code
		var html = '<div id="reconnect" class="lock">' + 
				'<div class="pane">' + 
					_e("Due to a network issue, you were disconnected. What do you want to do now?");
		
		// Can we cancel reconnection?
		if(mode == 'normal')
			html += '<a class="finish" onclick="return cancelReconnect();">' + _e("Cancel") + '</a>';
		
		html += '<a class="finish" onclick="return acceptReconnect(\'' + mode + '\');">' + _e("Reconnect") + '</a>' + 
			'</div></div>';
		
		$('body').append(html);
	}
}

// Reconnects the user if he was disconnected (network issue)
function acceptReconnect(mode) {
	logThis('Trying to reconnect the user...');
	
	// Show waiting item
	showGeneralWait();
	
	// Remove the reconnect pane
	$('#reconnect').remove();
	
	// Try to login again
	if(mode == 'normal')
		loginFromSession(CURRENT_SESSION);
	else if(mode == 'anonymous')
		anonymousLogin(HOST_ANONYMOUS);
	
	return false;
}

// Cancel the reconnection of user account (network issue)
function cancelReconnect() {
	logThis('User has canceled automatic reconnection...');
	
	// Remove the reconnect pane
	$('#reconnect').remove();
	
	// Renitialize the previous session parameters
	CURRENT_SESSION = false;
	CONNECTED = false;
	
	return false;
}

// Clears session reminder database
function clearLastSession() {
	// Clear temporary storage
	CURRENT_SESSION = false;
	CONNECTED = false;
	
	// Clear persistent storage
	if($(getPersistent('session', 1)).find('stored').text() == 'true')
		removePersistent('session', 1);
}

// Logins from a saved session
function loginFromSession(data) {
	// Select the data
	var session = $(data);
	
	// Fire the login event
	doLogin(
		session.find('username').text(),
		session.find('domain').text(),
		session.find('password').text(),
		session.find('resource').text(),
		session.find('priority').text(),
		'false'
	);
}

// Quits a session normally
function normalQuit() {
	// Reset our database
	clearLastSession();
	
	// We quit the current session
	quit();
	
	// We show an info
	openThisInfo(3);
}

// Gets all the users stuffs
function getEverything() {
	getFeatures();
	getRoster();
	getStorage(NS_OPTIONS);
	getStorage(NS_MESSAGES);
	getStorage(NS_ROSTERNOTES);
}

// Plugin launcher
function launchConnection() {
	// Try to resume a stored session, if not anonymous
	var session = getPersistent('session', 1);
	
	if(!isAnonymous() && ($(session).find('stored').text() == 'true')) {
		logThis('Saved session found, resuming it...');
		
		// Hide the homepage
		$('#home').hide();
		
		// Show the waiting icon
		showGeneralWait();
		
		// Login!
		loginFromSession(session);
	}
	
	// Not connected, maybe a XMPP link is submitted?
	else {
		// We open a new chat if a XMPP link was submitted
		var link = getVar('x');
		
		// Show the login tool
		if(parent.location.hash != '#OK' && link) {
			logThis('A XMPP link is set, switch to login page.');
			switchHome('loginer');
		}
	}
}

// Logouts when the application is closed
$(window).bind('beforeunload', terminate);

// Launch this plugin!
$(document).ready(launchConnection);
