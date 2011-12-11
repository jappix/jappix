/*

Jappix - An Open μSocial Platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function handleRegistered() {
	// We hide the waiting image
	$("#general-wait").hide();
	
	// We show the success information
	$('#home .registerer .success').fadeIn();
	
	// We quit the session
	logout();
}

function doRegister() {
	try {
		// We first fade out the old success info
		$('#home .registerer .success').hide();
		
		var lPath = '#home .registerer .';
		var domain = $(lPath + 'server').val();
		var username = $(lPath + 'nick').val();
		var pass = $(lPath + 'password').val();
		var spass = $(lPath + 'spassword').val();
		
		// If the form is correctly completed
		if(domain && username && pass && spass && pass == spass) {
			// We remove the not completed class to avoid problems
			$('#home .loginer input, #home .registerer input').removeClass("please-complete");
			
			// We define the http binding parameters
			oArgs = new Object();
			oArgs.httpbase = getSystem('http-base');
			oArgs.timerval = 2000;
			
			// We create the new http-binding connection
			con = new JSJaCHttpBindingConnection(oArgs);
			
			// We setup the connection !
			con.registerHandler('onconnect',handleRegistered);
			con.registerHandler('onerror',handleError);
			
			// We retrieve what the user typed in the register inputs
			oArgs = new Object();
			oArgs.domain = domain;
			oArgs.username = username;
			oArgs.resource = 'JappixRegister';
			oArgs.pass = pass;
			oArgs.register = true;
			
			// We show the waiting image
			$("#general-wait").show();
			
			// We show the registered information
			$('#home .registerer .success b').text(username + '@' + domain);
			
			// And here we go : we connect !
			con.connect(oArgs);
		}
		
		// We check if the form is entirely completed
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
			$('#home .loginer input, #home .registerer input').removeClass("please-complete");
			
			// We add the login wait div
			$("#general-wait").show();
			
			// We define the http binding parameters
			oArgs = new Object();
			oArgs.httpbase = getSystem('http-base');
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
			
			// Remember me?
			if($(lPath + 'remember').is(':checked')) {
				setPersistent('session', 'stored', true);
				setPersistent('session', 'domain', lServer);
				setPersistent('session', 'username', lNick);
				setPersistent('session', 'resource', lResource);
				setPersistent('session', 'password', lPass);
				setPersistent('session', 'priority', lPriority);
			}
			
			// We store the infos of the user into the data-base
			setDB('resource', 1, lResource);
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

function handleConnected() {
	// We hide the home page
	$('#home, #general-wait').hide();
	
	// We show the chatting app.
	$('#talk').show();
	switchChan('channel');
	
	// We reset the homepage
	switchHome('default');
	
	// We put a special class on our avatar
	var jid = getJID();
	$('.channel-header').attr('class', 'showable channel-header mixed ' + hex_md5(jid));
	
	// We change the title of the page
	pageTitle('talk');
	
	// We get all the other things
	getEverything();
}

function handleDisconnected() {
	// We show the waiting image
	$('#general-wait').show();
	
	// We stop the music player
	actionMusic('abord');
	
	// We disconnect from the XMPP server
	logout();
	pageTitle('home');
	
	// Reset our database
	resetDB();
	
	// We renitalise the html markup as its initiale look
	$('.removable').remove();
	$('.showable').show();
	$('.hidable').hide();
	$('.resetable').val('');
	$('#general-wait').hide();
	$('#my-infos .element').attr('title', '');
	$('#buddy-list').removeClass('show-all-buddies');
	
	// We reset values for dynamic things
	$('#home .server').val(getHost('main'));
	$('#home .resource').val($('#home .dresource').val());
	
	// We reset the notification tool
	checkNotifications();
	
	// And we show the home like when the user wasn't logged in
	$("#home").show();
	$("#talk").hide();
}

function setupCon(con) {
	// We setup all the necessary handlers for the connection
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('iq', handleIQ);
	con.registerHandler('onconnect', handleConnected);
	con.registerHandler('onerror', handleError);
	con.registerHandler('ondisconnect', handleDisconnected);
}

function unavailable() {
	var aPresence = new JSJaCPresence();
	aPresence.setType('unavailable')
		 .setID(genID());
	
	con.send(aPresence);
}

function logout() {
	// If the con has been yet aborted, end
	if(!con.connected())
		return;
	
	// Else, continue
	unavailable();
	con.disconnect();
}

function terminate() {
	// Show the waiting item (useful if BOSH is sloooow)
	if(con.connected())
		$("#general-wait").show();
	
	logout();
}

// When the user wants to disconnect from his account
function quit() {
	if(con.connected()) {
		// We show the waiting image
		$('#general-wait').show();
		
		// We disconnect from the XMPP server
		logout();
	}
}

function clearLastSession() {
	if(getPersistent('session', 'stored')) {
		removePersistent('session', 'stored');
		removePersistent('session', 'domain');
		removePersistent('session', 'username');
		removePersistent('session', 'resource');
		removePersistent('session', 'password');
		removePersistent('session', 'priority');
	}
}

function normalQuit() {
	// Reset our database
	clearLastSession();
	
	// We quit the current session
	quit();
	
	// We show an info
	openThisInfo(3);
}

function getEverything() {
	getRoster();
	getStorage(NS_OPTIONS);
	getStorage(NS_MESSAGES);
	getStorage(NS_BOOKMARKS);
	getStorage(NS_ROSTERNOTES);
	joinFromFavorite();
	getFeatures();
}

$(document).ready(function() {
	// Try to resume a stored session, if not anonymous
	if(!isAnonymous() && getPersistent('session', 'stored')) {
		// Hide the homepage
		$('#home').hide();
		
		// Show the waiting icon
		$('#general-wait').show();
		
		// Apply the data to the form
		var lPath = '#home .loginer .';
		var lServer = $(lPath + 'server').val(getPersistent('session', 'domain'));
		var lNick = $(lPath + 'nick').val(getPersistent('session', 'username'));
		var lPass = $(lPath + 'password').val(getPersistent('session', 'password'));
		var lResource = $(lPath + 'resource').val(getPersistent('session', 'resource'));
		var lPriority = $(lPath + 'priority').val(getPersistent('session', 'priority'));
		
		// Fire the login event
		doLogin();
	}
});

$(window).bind('beforeunload', terminate);
