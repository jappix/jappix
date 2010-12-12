/*

Jappix - An open social platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 11/12/10

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
		
		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// And we handle everything that happen
		setupCon(con);
		
		// We retrieve what the user typed in the login inputs
		oArgs = new Object();
		oArgs.domain = trim(lServer);
		oArgs.username = trim(lNick);
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
		
		// Change the page title
		pageTitle('wait');
		
		logThis('Jappix is connecting...', 3);
	}
	
	catch(e) {
		// Logs errors
		logThis('Error while logging in: ' + e, 1);
		
		// Reset Jappix
		destroyTalkPage();
		
		// Open an unknown error
		openThisError(2);
	}
	
	finally {
		return false;
	}
}

// Handles the user registration
function handleRegistered() {
	logThis('A new account has been registered.', 3);
	
	// We remove the waiting image
	removeGeneralWait();
	
	// Reset the title
	pageTitle('home');
	
	// We show the success information
	$('#home .registerer .success').fadeIn('fast');
	
	// We quit the session
	logout();
}

// Does the user registration
function doRegister(username, domain, pass) {
	logThis('Trying to register an account...', 3);
	
	try {
		// We define the http binding parameters
		oArgs = new Object();
		oArgs.httpbase = HOST_BOSH;
		
		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// We setup the connection !
		con.registerHandler('onconnect', handleRegistered);
		con.registerHandler('onerror', handleError);
		
		// We retrieve what the user typed in the register inputs
		oArgs = new Object();
		oArgs.domain = trim(domain);
		oArgs.username = trim(username);
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
		
		// Change the page title
		pageTitle('wait');
	}
	
	catch(e) {
		// Logs errors
		logThis(e, 1);
	}
	
	finally {
		return false;
	}
}

// Does the user anonymous login
function doAnonymous() {
	logThis('Trying to login anonymously...', 3);
	
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
				$(this).addClass('please-complete').focus();
			else
				$(this).removeClass('please-complete');	
		});
	}
	
	return false;
}

// Handles the user connected event
var CONNECTED = false;

function handleConnected() {
	logThis('Jappix is now connected.', 3);
	
	// Connected marker
	CONNECTED = true;
	
	// We hide the home page
	$('#home').hide();
	
	// Not resumed?
	if(!RESUME) {
		// We show the chatting app.
		createTalkPage();
		
		// We reset the homepage
		switchHome('default');
		
		// We get all the other things
		getEverything();
		
		// Set last activity stamp
		LAST_ACTIVITY = getTimeStamp();
		
		// We open a new chat if a XMPP link was submitted
		if((parent.location.hash != '#OK') && LINK_VARS['x']) {
			// A link is submitted in the URL
			xmppLink(LINK_VARS['x']);
		
			// Set a OK status
			parent.location.hash = 'OK';
		}
	}
	
	// Resumed
	else {
		presenceSend();
		
		// Change the title
		updateTitle();
	}
	
	// Remove the waiting item
	removeGeneralWait();
}

// Handles the user disconnected event
function handleDisconnected() {
	logThis('Jappix is now disconnected.', 3);
	
	// Is it a undesired disconnection?
	if(CURRENT_SESSION && CONNECTED)
		createReconnect('normal');
	else
		destroyTalkPage();
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
		return false;
	
	// Disconnect from the XMPP server
	con.disconnect();
	
	logThis('Jappix is disconnecting...', 3);
}

// Terminates a session
function terminate() {
	if((typeof con != 'undefined') && con && con.connected()) {
		// Clear temporary session storage
		CURRENT_SESSION = false;
		CONNECTED = false;
		RESUME = false;
		
		// Show the waiting item (useful if BOSH is sloooow)
		showGeneralWait();
		
		// Change the page title
		pageTitle('wait');
		
		// Disconnect from the XMPP server
		logout();
	}
}

// Quitss a session
function quit() {
	if(con.connected()) {
		// We show the waiting image
		showGeneralWait();
		
		// Change the page title
		pageTitle('wait');
		
		// We disconnect from the XMPP server
		logout();
	}
}

// Creates the reconnect pane
function createReconnect(mode) {
	logThis('This is not a normal disconnection, show the reconnect pane...', 1);
	
	// Reconnect pane not yet displayed?
	if(!exists('#reconnect')) {
		// Create the HTML code
		var html = '<div id="reconnect" class="lock">' + 
				'<div class="pane">' + 
					_e("Due to a network issue, you were disconnected. What do you want to do now?");
		
		// Can we cancel reconnection?
		if(mode == 'normal')
			html += '<a class="finish cancel">' + _e("Cancel") + '</a>';
		
		html += '<a class="finish reconnect">' + _e("Reconnect") + '</a>' + 
			'</div></div>';
		
		// Append the code
		$('body').append(html);
		
		// Click events
		if(mode == 'normal')
			$('#reconnect a.finish.cancel').click(function() {
				return cancelReconnect();
			});
		
		$('#reconnect a.finish.reconnect').click(function() {
			return acceptReconnect(mode);
		});
	}
}

// Reconnects the user if he was disconnected (network issue)
var RESUME = false;

function acceptReconnect(mode) {
	logThis('Trying to reconnect the user...', 3);
	
	// Resume marker
	RESUME = true;
	
	// Show waiting item
	showGeneralWait();
	
	// Reset some various stuffs
	var groupchats = '#page-engine .page-engine-chan[data-type=groupchat]';
	$(groupchats + ' .list .role').hide();
	$(groupchats + ' .one-line, ' + groupchats + ' .list .user').remove();
	$(groupchats).attr('data-initial', 'false');
	
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
	logThis('User has canceled automatic reconnection...', 3);
	
	// Remove the reconnect pane
	$('#reconnect').remove();
	
	// Destroy the talk page
	destroyTalkPage();
	
	// Renitialize the previous session parameters
	CURRENT_SESSION = false;
	CONNECTED = false;
	RESUME = false;
	
	return false;
}

// Clears session reminder database
function clearLastSession() {
	// Clear temporary storage
	CURRENT_SESSION = false;
	CONNECTED = false;
	RESUME = false;
	
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
		false
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
	
	return false;
}

// Gets all the users stuffs
function getEverything() {
	getFeatures();
	getRoster();
	getStorage(NS_ROSTERNOTES);
}

// Plugin launcher
function launchConnection() {
	// Logouts when Jappix is closed
	if(BrowserDetect.browser == 'Opera')
		$(window).bind('unload', terminate);
	else
		$(window).bind('beforeunload', terminate);
	
	// Nothing to do when anonymous!
	if(isAnonymous())
		return;
	
	// Try to resume a stored session, if not anonymous
	var session = getPersistent('session', 1);
	
	if($(session).find('stored').text() == 'true') {
		// Hide the homepage
		$('#home').hide();
		
		// Show the waiting icon
		showGeneralWait();
		
		// Login!
		loginFromSession(session);
		
		logThis('Saved session found, resuming it...', 3);
	}
	
	// Not connected, maybe a XMPP link is submitted?
	else if((parent.location.hash != '#OK') && LINK_VARS['x']) {
		switchHome('loginer');
		
		logThis('A XMPP link is set, switch to login page.', 3);
	}
}

// Launch this plugin!
$(document).ready(launchConnection);
