/*

Jappix - An open social platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

// Handles the user registration
function handleRegistered() {
	logThis('A new account has been registered.');
	
	// We hide the waiting image
	$('#general-wait').hide();
	
	// We show the success information
	$('#home .registerer .success').fadeIn('fast');
	
	// We quit the session
	logout();
}

// Does the user registration
function doRegister() {
	logThis('Trying to register an account...');
	
	try {
		var rPath = '#home .registerer .';
		
		// Fade out the old success info
		$(rPath + 'success').hide();
		
		// Get the values
		var domain = $(rPath + 'server').val();
		var username = $(rPath + 'nick').val();
		var pass = $(rPath + 'password').val();
		var spass = $(rPath + 'spassword').val();
		
		// If the form is correctly completed
		if(domain && username && pass && spass && pass == spass) {
			// We remove the not completed class to avoid problems
			$('#home .registerer input').removeClass('please-complete');
			
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
			$('#general-wait').show();
			
			// We show the registered information
			$('#home .registerer .success b').text(username + '@' + domain);
			
			// And here we go : we connect !
			con.connect(oArgs);
		}
		
		// We check if the form is entirely completed
		else {
			$(rPath + 'resetable').each(function() {
				if(!$(this).val())
					$(this).addClass('please-complete');
				else
					$(this).removeClass('please-complete');	
			});
		}
	}
	
	finally {
		return false;
	}
}

// Does the user login
var CURRENT_SESSION = false;

function doLogin() {
	try {
		// We get the values
		var lPath = '#home .loginer .';
		var lServer = $(lPath + 'server').val();
		var lNick = $(lPath + 'nick').val();
		var lPass = $(lPath + 'password').val();
		var lResource = $(lPath + 'resource').val();
		var lPriority = $(lPath + 'priority').val();
		
		if(lServer && lNick && lPass && lResource && lPriority) {
			// We remove the not completed class to avoid problems
			$('#home .loginer input').removeClass('please-complete');
			
			// We add the login wait div
			$('#general-wait').show();
			
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
			if($(lPath + 'remember').is(':checked'))
				setPersistent('session', 1, session_xml);
			
			// We store the infos of the user into the data-base
			setDB('priority', 1, lPriority);
			
			// We connect !
			con.connect(oArgs);
		}
		
		else {
			$(lPath + 'resetable').each(function() {
				if(!$(this).val())
					$(this).addClass('please-complete');
				else
					$(this).removeClass('please-complete');	
			});
		}
	}
	
	finally {
		return false;
	}
}

// Does the user anonymous login
function doAnonymous() {
	logThis('Trying to login anonymously...');
	
	var aPath = '#home .anonymouser .';
	var room = $(aPath + 'room').val();
	var nick = $(aPath + 'nick').val();
	
	// If the form is correctly completed
	if(room && nick) {
		// We remove the not completed class to avoid problems
		$('#home .anonymouser input').removeClass('please-complete');
		
		// Redirect the user to the anonymous room
		window.location.href = JAPPIX_LOCATION + '?r=' + room + '&n=' + nick;
	}
	
	// We check if the form is entirely completed
	else {
		$(aPath + 'resetable').each(function() {
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
	$('#home, #general-wait').hide();
	
	// We show the chatting app.
	$('#talk').show();
	switchChan('channel');
	
	// We reset the homepage
	switchHome('default');
	
	// Initialize our avatar
	$('.channel-header').attr('class', 'showable channel-header mixed ' + hex_md5(getXID()));
	$('.channel-header .avatar-container').html('<img class="avatar removable" src="' + './img/others/default-avatar.png' + '" alt="" />');
	
	// We change the title of the page
	pageTitle('talk');
	
	// We get all the other things
	getEverything();
	
	// Set last activity stamp
	LAST_ACTIVITY = getTimeStamp();
	
	// Start the auto idle functions
	liveIdle();
	
	// We open a new chat if a XMPP link was submitted
	var link = getVar('x');
	
	if(parent.location.hash != '#OK' && link) {
		// A link is submitted in the URL
		xmppLink(link);
		
		// Set a OK status
		parent.location.hash = 'OK';
	}
}

// Resets the Jappix session
function resetJappix() {
	// We stop the music player
	actionMusic('abord');
	
	// Reset the page title
	pageTitle('home');
	
	// Reset our database
	resetDB();
	
	// Renitialize the stanza ID counter
	STANZA_ID = 1;
	
	// We renitalise the html markup as its initiale look
	$('.removable').remove();
	$('.showable').show();
	$('.hidable').hide();
	$('.resetable').val('');
	$('#general-wait').hide();
	$('#my-infos .element').attr('title', '');
	$('#my-infos .f-presence select').attr('disabled', true);
	$('#my-infos .f-presence .icon').attr('class', 'icon talk-images status-available');
	$('#my-infos .f-mood .icon').attr('class', 'icon talk-images mood-four');
	$('#my-infos .f-activity .icon').attr('class', 'icon talk-images activity-exercising');
	
	// Reset the buddy list tools
	BLIST_ALL = false;
	
	// Reset our first presence marker
	FIRST_PRESENCE_SENT = false;
	
	// Reset the microblog tools
	unattachMicroblog();
	
	// Reset the filtering tool
	SEARCH_FILTERED = false;
	var iFilter = $('#buddy-list .filter input');
	var pFilter = iFilter.attr('placeholder');
	$('#buddy-list .filter a').hide();
	iFilter.val(pFilter);
	
	// Kill all timers, exept the board ones
	$('*:not(#error, #info)').stopTime();
	
	// Kill the auto idle functions
	dieIdle();
	
	// We reset values for dynamic things
	$('#home .server').val(HOST_MAIN);
	$('#home .resource').val(JAPPIX_RESOURCE);
	
	// We reset the notification tool
	checkNotifications();
	
	// And we show the home like when the user wasn't logged in
	$('#home').show();
	$('#talk').hide();
}

// Handles the user disconnected event
function handleDisconnected() {
	logThis('Jappix is now disconnected.');
	
	// We show the waiting image
	//$('#general-wait').show();
	
	// Reset everything
	resetJappix();
	
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
		$('#general-wait').show();
		
		// Disconnect from the XMPP server
		logout();
	}
}

// Quitss a session
function quit() {
	if(con.connected()) {
		// We show the waiting image
		$('#general-wait').show();
		
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
	$('#general-wait').show();
	
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
	
	// Apply the data to the form
	var lPath = '#home .loginer .';
	var lServer = $(lPath + 'server').val(session.find('domain').text());
	var lNick = $(lPath + 'nick').val(session.find('username').text());
	var lPass = $(lPath + 'password').val(session.find('password').text());
	var lResource = $(lPath + 'resource').val(session.find('resource').text());
	var lPriority = $(lPath + 'priority').val(session.find('priority').text());
	
	// Fire the login event
	doLogin();
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

// Logouts when the application is closed
$(window).bind('beforeunload', terminate);

// Launch this plugin!
$(document).ready(function() {
	logThis('Welcome to Jappix! Happy coding in developer mode :)');
	
	// Try to resume a stored session, if not anonymous
	var session = getPersistent('session', 1);
	
	if(!isAnonymous() && ($(session).find('stored').text() == 'true')) {
		logThis('Saved session found, resuming it...');
		
		// Hide the homepage
		$('#home').hide();
		
		// Show the waiting icon
		$('#general-wait').show();
		
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
});
