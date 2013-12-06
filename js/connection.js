/*

Jappix - An open social platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda
Last revision: 20/02/12

*/

// Does the user login
var CURRENT_SESSION = false;
var DESKTOP_HASH = null;

function doLogin(lNick, lServer, lPass, lResource, lPriority, lRemember, loginOpts) {
	try {
		// get optionnal conn handlers
		oExtend = loginOpts || {};

		// We remove the not completed class to avoid problems
		$('#home .loginer input').removeClass('please-complete');
		
		// We add the login wait div
		showGeneralWait();
		
		// We define the http binding parameters
		oArgs = new Object();
		
		if(HOST_BOSH_MAIN)
			oArgs.httpbase = HOST_BOSH_MAIN;
		else
			oArgs.httpbase = HOST_BOSH;
		
		// Check BOSH origin
		BOSH_SAME_ORIGIN = isSameOrigin(oArgs.httpbase);

		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// And we handle everything that happen
		setupCon(con,oExtend);
		
		// Generate a resource
		var random_resource = getDB(DESKTOP_HASH, 'session', 'resource');
		
		if(!random_resource)
			random_resource = lResource + ' (' + (new Date()).getTime() + ')';
		
		// We retrieve what the user typed in the login inputs
		oArgs = new Object();
		oArgs.domain = trim(lServer);
		oArgs.username = trim(lNick);
		oArgs.resource = random_resource;
		oArgs.pass = lPass;
		oArgs.secure = true;
		oArgs.xmllang = XML_LANG;

		DESKTOP_HASH = 'jd.' + hex_md5(oArgs.username + '@' + oArgs.domain);
		
		// Store the resource (for reconnection)
		setDB(DESKTOP_HASH, 'session', 'resource', random_resource);
		
		// Store session XML in temporary database
		storeSession(lNick, lServer, lPass, lResource, lPriority, lRemember);
		
		// We store the infos of the user into the data-base
		setDB(DESKTOP_HASH, 'priority', 1, lPriority);
		
		// We connect !
		con.connect(oArgs);
		
		// Change the page title
		pageTitle('wait');
		
		Console.info('Jappix is connecting...');
	}
	
	catch(e) {
		// Logs errors
		Console.error('doLogin', e);
		
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
	Console.info('A new account has been registered.');
	
	// We remove the waiting image
	removeGeneralWait();
	
	// Reset the title
	pageTitle('home');
	
	// We show the success information
	$('#home .registerer .success').fadeIn('fast');
	
	// We quit the session
	if(isConnected())
		logout();
}

// Does the user registration
function doRegister(username, domain, pass, captcha) {
	Console.info('Trying to register an account...');
	
	// We change the registered information text
	$('#home .homediv.registerer').append(
		'<div class="info success">' + 
			_e("You have been registered, here is your XMPP address:") + ' <b>' + username.htmlEnc() + '@' + domain.htmlEnc() + '</b> - <a href="#">' + _e("Login") + '</a>' + 
		'</div>'
	);
	
	// Login link
	$('#home .homediv.registerer .success a').click(function() {
		return doLogin(username, domain, pass, '', '10', false);
	});
	
	if((REGISTER_API == 'on') && (domain == HOST_MAIN) && captcha) {
		// Show the waiting image
		showGeneralWait();
		
		// Change the page title
		pageTitle('wait');
		
		// Send request
		$.post('./php/register.php', {username: username, domain: domain, password: pass, captcha: captcha}, function(data) {
			// Error registering
			removeGeneralWait();
			pageTitle('home');
			
			// In all case, update CAPTCHA
			$('#home img.captcha_img').attr('src', './php/captcha.php?id=' + genID());
			$('#home input.captcha').val('');
			
			// Registration okay
			if($(data).find('query status').text() == '1') {
				handleRegistered();
			} else {
				// Show error message
				var error_message = '';
				
				switch($(data).find('query message').text()) {
					case 'CAPTCHA Not Matching':
						error_message = _e("The security code you entered is invalid. Please retry with another one.");
						
						$('#home input.captcha').focus();
						
						break;
					
					case 'Username Unavailable':
						error_message = _e("The username you picked is not available. Please try another one.");
						
						$('#home input.nick').focus();
						
						break;
					
					default:
						error_message = _e("There was an error registering your account. Please retry.");
						
						break;
				}
				
				if(error_message)
					showError('', error_message, '');
			}
		});
	} else {
		
			// Show the waiting image
			showGeneralWait();
			
			// Change the page title
			pageTitle('wait');
		
		try {
			// We define the http binding parameters
			oArgs = new Object();
			
			if(HOST_BOSH_MAIN)
				oArgs.httpbase = HOST_BOSH_MAIN;
			else
				oArgs.httpbase = HOST_BOSH;
			
			// Check BOSH origin
			BOSH_SAME_ORIGIN = isSameOrigin(oArgs.httpbase);

			// We create the new http-binding connection
			con = new JSJaCHttpBindingConnection(oArgs);
			
			// We setup the connection !
			con.registerHandler('onconnect', handleRegistered);
			con.registerHandler('onerror', handleError);
			
			// We retrieve what the user typed in the register inputs
			oArgs = new Object();
			oArgs.domain = trim(domain);
			oArgs.username = trim(username);
			oArgs.resource = JAPPIX_RESOURCE + ' Register (' + (new Date()).getTime() + ')';
			oArgs.pass = pass;
			oArgs.register = true;
			oArgs.secure = true;
			oArgs.xmllang = XML_LANG;
			
			con.connect(oArgs);
			//let's assume it's ok if no errors in try/catch
			handleRegistered();
		}
		
		catch(e) {
			// Logs errors
			Console.error('doRegister', e);
		}
	}
	
	return false;
}

// Does the user anonymous login
function doAnonymous() {
	Console.info('Trying to login anonymously...');
	
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
		$(aPath + 'input[type="text"]').each(function() {
			var select = $(this);
			
			if(!select.val())
				$(document).oneTime(10, function() {
					select.addClass('please-complete').focus();
				});
			else
				select.removeClass('please-complete');	
		});
	}
	
	return false;
}

// Handles the user connected event
var CONNECTED = false;

function handleConnected() {
	Console.info('Jappix is now connected.');
	
	// Connection markers
	CONNECTED = true;
	RECONNECT_TRY = 0;
	RECONNECT_TIMER = 0;
	
	// We hide the home page
	$('#home').hide();
	
	// Any suggest to do before triggering connected event?
	suggestCheck();
	
	// Remove the waiting item
	removeGeneralWait();

	// Init Jingle
	Jingle.init();
}

// Triggers the connected state
function triggerConnected() {
	try {
		// Not resumed?
		if(!RESUME) {
			// Remember the session?
			if(getDB(DESKTOP_HASH, 'remember', 'session'))
				setPersistent('global', 'session', 1, CURRENT_SESSION);
			
			// We show the chatting app.
			createTalkPage();
			
			// We reset the homepage
			switchHome('default');
			
			// We get all the other things
			getEverything();
			
			// Set last activity stamp
			LAST_ACTIVITY = getTimeStamp();
		}
		
		// Resumed
		else {
			// Send our presence
			presenceSend();
			
			// Change the title
			updateTitle();
		}
	} catch(e) {
		Console.error('triggerConnected', e);
	}
}

// Handles the user disconnected event
function handleDisconnected() {
	Console.info('Jappix is now disconnected.');
	
	// Normal disconnection
	if(!CURRENT_SESSION && !CONNECTED) {
		destroyTalkPage();
		DESKTOP_HASH = null;
	}
}

// Setups the normal connection
function setupCon(con, oExtend) {
	// Setup connection handlers
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('iq', handleIQ);
	con.registerHandler('onconnect', handleConnected);
	con.registerHandler('onerror', handleError);
	con.registerHandler('ondisconnect', handleDisconnected);
	
	// Extended handlers
	oExtend = oExtend || {};
	
	jQuery.each(oExtend, function(keywd,funct) {
		con.registerHandler(keywd, funct);
	});
}

// Logouts from the server
function logout() {
	// We are not connected
	if(!isConnected())
		return false;
	
	// Disconnect from the XMPP server
	con.disconnect();
	
	Console.info('Jappix is disconnecting...');
}

// Terminates a session
function terminate() {
	if(!isConnected())
		return;
	
	// Clear temporary session storage
	resetConMarkers();
	
	// Show the waiting item (useful if BOSH is sloooow)
	showGeneralWait();
	
	// Change the page title
	pageTitle('wait');
	
	// Disconnect from the XMPP server
	logout();
}

// Quitss a session
function quit() {
	if(!isConnected())
		return;
	
	// We show the waiting image
	showGeneralWait();
	
	// Change the page title
	pageTitle('wait');
	
	// We disconnect from the XMPP server
	logout();
}

// Creates the reconnect pane
var RECONNECT_TRY = 0;
var RECONNECT_TIMER = 0;

function createReconnect(mode) {
	Console.error('This is not a normal disconnection, show the reconnect pane...');
	
	// Reconnect pane not yet displayed?
	if(!exists('#reconnect')) {
		// Blur the focused input/textarea/select
		$('input, select, textarea').blur();
		
		// Create the HTML code
		var html = '<div id="reconnect" class="lock">' + 
				'<div class="pane">' + 
					_e("Due to a network issue, you were disconnected. What do you want to do now?");
		
		// Can we cancel reconnection?
		if(mode == 'normal')
			html += '<a href="#" class="finish cancel">' + _e("Cancel") + '</a>';
		
		html += '<a href="#" class="finish reconnect">' + _e("Reconnect") + '</a>' + 
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
		
		// Try to reconnect automatically after a while
		if(RECONNECT_TRY < 5)
			RECONNECT_TIMER = 5 + (5 * RECONNECT_TRY);
		else
			RECONNECT_TIMER = 120;
		
		// Change the try number
		RECONNECT_TRY++;
		
		// Fire the event!
		$('#reconnect a.finish.reconnect').everyTime('1s', function() {
			// We can reconnect!
			if(RECONNECT_TIMER == 0)
				return acceptReconnect(mode);
			
			// Button text
			if(RECONNECT_TIMER <= 10)
				$(this).text(_e("Reconnect") + ' (' + RECONNECT_TIMER + ')');
			
			// Remove 1 second
			RECONNECT_TIMER--;
		});
		
		// Page title
		updateTitle();
	}
}

// Reconnects the user if he was disconnected (network issue)
var RESUME = false;

function acceptReconnect(mode) {
	Console.info('Trying to reconnect the user...');
	
	// Resume marker
	RESUME = true;
	
	// Show waiting item
	showGeneralWait();
	
	// Reset some various stuffs
	var groupchats = '#page-engine .page-engine-chan[data-type="groupchat"]';
	$(groupchats + ' .list .role').hide();
	$(groupchats + ' .one-group, ' + groupchats + ' .list .user').remove();
	$(groupchats).attr('data-initial', 'false');
	
	// Stop the timer
	$('#reconnect a.finish.reconnect').stopTime();
	
	// Remove the reconnect pane
	$('#reconnect').remove();
	
	// Try to login again
	if(mode == 'normal')
		loginFromSession(XMLFromString(CURRENT_SESSION));
	else if(mode == 'anonymous')
		anonymousLogin(HOST_ANONYMOUS);
	
	return false;
}

// Cancel the reconnection of user account (network issue)
function cancelReconnect() {
	Console.info('User has canceled automatic reconnection...');
	
	// Stop the timer
	$('#reconnect a.finish.reconnect').stopTime();
	
	// Remove the reconnect pane
	$('#reconnect').remove();
	
	// Destroy the talk page
	destroyTalkPage();
	
	// Renitialize the previous session parameters
	resetConMarkers();
	
	return false;
}

// Clears session reminder database
function clearLastSession() {
	// Clear temporary storage
	resetConMarkers();
	
	// Clear persistent storage
	if($(XMLFromString(getPersistent('global', 'session', 1))).find('stored').text() == 'true')
		removePersistent('global', 'session', 1);
}

// Resets the connection markers
function resetConMarkers() {
	CURRENT_SESSION = false;
	CONNECTED = false;
	RESUME = false;
	RECONNECT_TRY = 0;
	RECONNECT_TIMER = 0;
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
	try {
		getFeatures();
		getRoster();
		listPrivacy();
		getStorage(NS_ROSTERNOTES);
	} catch(e) {
		Console.error('getEverything', e);
	}
}

// Generates session data to store
function storeSession(lNick, lServer, lPass, lResource, lPriority, lRemember) {
	// Generate a session XML to be stored
	session_xml = '<session><stored>true</stored><domain>' + lServer.htmlEnc() + '</domain><username>' + lNick.htmlEnc() + '</username><resource>' + lResource.htmlEnc() + '</resource><password>' + lPass.htmlEnc() + '</password><priority>' + lPriority.htmlEnc() + '</priority></session>';
	
	// Save the session parameters (for reconnect if network issue)
	CURRENT_SESSION = session_xml;
	
	// Remember me?
	if(lRemember)
		setDB(DESKTOP_HASH, 'remember', 'session', 1);
	
	return session_xml;
}

// Plugin launcher
function launchConnection() {
	// Logouts when Jappix is closed
	$(window).bind('beforeunload', terminate);
	
	// Nothing to do when anonymous!
	if(isAnonymous())
		return;
	
	// Connection params submitted in URL?
	if(LINK_VARS['u'] && LINK_VARS['q']) {
		// Generate login data
		var login_xid = bareXID(generateXID(LINK_VARS['u'], 'chat'));
		var login_nick = getXIDNick(login_xid);
		var login_server = getXIDHost(login_xid);
		var login_pwd = LINK_VARS['q'];
		var login_resource = JAPPIX_RESOURCE + ' (' + (new Date()).getTime() + ')';
		var login_priority = '10';
		var login_remember = 1;
		
		// Must store session?
		if(LINK_VARS['h'] && (LINK_VARS['h'] == '1')) {
			// Store session
			var session_xml = storeSession(login_nick, login_server, login_pwd, login_resource, login_priority, true);
			setPersistent('global', 'session', 1, session_xml);
			
			// Redirect to a clean URL
			document.location.href = './';
		} else {
			// Hide the homepage
			$('#home').hide();
			
			// Show the waiting icon
			showGeneralWait();
			
			// Proceed login
			doLogin(login_nick, login_server, login_pwd, login_resource, login_priority, login_remember);
		}
		
		return;
	}
	
	// Try to resume a stored session, if not anonymous
	var session = XMLFromString(getPersistent('global', 'session', 1));
	
	if($(session).find('stored').text() == 'true') {
		// Hide the homepage
		$('#home').hide();
		
		// Show the waiting icon
		showGeneralWait();
		
		// Login!
		loginFromSession(session);
		
		Console.info('Saved session found, resuming it...');
	}
	
	// Not connected, maybe a XMPP link is submitted?
	else if((parent.location.hash != '#OK') && LINK_VARS['x']) {
		switchHome('loginer');
		
		Console.info('A XMPP link is set, switch to login page.');
	}
}

// Launch this plugin!
$(document).ready(launchConnection);
