/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/11/10

*/

// Connects the user with the given logins
function connect(user, domain, password, resource, anonymous) {
	// Create the Jappix Mini initial DOM content
	var oldDOM = getDB('jmini', user + '@' + domain);
	
	if(oldDOM) {
		// Restore the HTML markup
		$('body').append(
			'<div id="jmini">' + 
				oldDOM + 
			'</div>'
		);
		
		// Restore the chat click events
		$('#jmini .conversation').each(function() {
			// Get the hash of the current chat
			var hash = explodeThis('-', $(this).attr('id'), 1);
			
			// Attach the click events
			chatClick(hash);
		});
		
		// Restore the roster click events
		$('#jmini .roster .friend').each(function() {
			// Get the values of the current friend
			var xid = $(this).attr('name');
			var nick = $(this).text();
			var hash = explodeThis('-', $(this).attr('id'), 1);
			
			$('#jmini a.friend#friend-' + hash).click(function() {
				chat(xid, nick, hash);
			});
		});
		
		logThis('Old DOM restored.');
	}
	
	else {
		$('body').append(
			'<div id="jmini">' + 
				'<div class="conversations"></div>' + 
				
				'<div class="starter">' + 
					'<div class="roster">' + 
						'<div class="logo mini-images"></div>' + 
					'</div>' + 
					
					'<a class="pane button mini-images"><span class="counter mini-images">0</span></a>' + 
				'</div>' + 
			'</div>'
		);
		
		logThis('New DOM created.');
	}
	
	// The click events
	$('#jmini a.button').click(function() {
		if(!$(this).hasClass('clicked') && ($(this).find('span').text() != '0'))
			showRoster();
		else
			hideRoster();
	});
	
	// Hides the roster when clicking away of Jappix Mini
	$(document).click(function(evt) {
		if(!$(evt.target).parents('#jmini').size())
			hideRoster();
	});
	
	// Hides everything when double clicking away of Jappix Mini
	$(document).dblclick(function(evt) {
		if(!$(evt.target).parents('#jmini').size()) {
			hideRoster();
			switchPane();
		}
	});
	
	// The connection
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
		con.registerHandler('onconnect', connected);
		con.registerHandler('ondisconnect', disconnected);
		
		// The roster was yet retrieved
		if(oldDOM)
			con.registerHandler('onconnect', initialize);
		
		// Not yet retrieved
		else
			con.registerHandler('onconnect', getRoster);
		
		// We retrieve what the user typed in the login inputs
		oArgs = new Object();
		oArgs.secure = true;
		oArgs.resource = resource;
		oArgs.domain = domain;
		
		// Anonymous login?
		if(anonymous) {
			// Bad domain?
			if(lockHost() && (domain != HOST_ANONYMOUS)) {
				logThis('Not allowed to connect to this anonymous domain: ' + domain, 2);
				
				return false;
			}
			
			oArgs.authtype = 'saslanon';
		}
		
		// Normal login
		else {
			// Bad domain?
			if(lockHost() && (domain != HOST_MAIN)) {
				logThis('Not allowed to connect to this main domain: ' + domain, 2);
				
				return false;
			}
			
			oArgs.username = user;
			oArgs.pass = password;
		}
		
		// We connect !
		con.connect(oArgs);
		
		logThis('Jappix Mini is connecting...', 3);
	}
	
	catch(e) {
		// Logs errors
		logThis('Error while logging in: ' + e, 1);
		
		// Reset Jappix Mini
		disconnected();
	}
	
	finally {
		return false;
	}
}

// When the user is connected
function connected() {
	logThis('Jappix Mini is now connected.', 3);
}

// When the user disconnects
function disconnect() {
	if(typeof con != 'undefined' && con && con.connected()) {
		// Save the actual Jappix Mini DOM
		setDB('jmini', con.username + '@' + con.domain, $('#jmini').html());
		
		// Send unavailable presence
		presence('unavailable');
		
		// Disconnect
		con.disconnect();
		
		logThis('Jappix Mini is disconnecting...', 3);
	}
}

// When the user is disconnected
function disconnected() {
	// Remove Jappix Mini when disconnected
	$('#jmini').remove();
	
	logThis('Jappix Mini is now disconnected.', 3);
}

// Handles the incoming messages
function handleMessage(msg) {
	var type = msg.getType();
	
	if((type == 'chat') || (type == 'normal')) {
		// Get the body
		var body = msg.getBody();
		
		if(body) {
			// Get the values
			var xid = bareXID(getStanzaFrom(msg));
			var hash = hex_md5(xid);
			var nick = $('#jmini a#friend-' + hash).text();
			
			// Define the target div
			var target = '#jmini #chat-' + hash;
			
			// Create the chat if it does not exist
			if(!exists(target))
				chat(xid, nick, hash);
			
			// Display the message
			displayMessage(xid, body, nick, hash);
			
			// Notify the user if not focused
			var notify = $(target + ' a.chat-tab');
			
			if(!notify.hasClass('clicked'))
				notify.addClass('unread');
			
			logThis('Message received from: ' + xid);
		}
	}
}

// Handles the incoming IQs
function handleIQ(iq) {
	// Define some variables
	var iqFrom = fullXID(getStanzaFrom(iq));
	var iqID = iq.getID();
	var iqQueryXMLNS = iq.getQueryXMLNS();
	var iqType = iq.getType();
	
	// Create the response
	if((iqType == 'get') && ((iqQueryXMLNS == NS_ROSTER) || (iqQueryXMLNS == NS_DISCO_INFO))) {
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
	}
	
	// Roster push
	if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set')) {
		// Display the friend
		handleRoster(iq);
		
		con.send(iqResponse);
		
		logThis('Received a roster push.');
	}
	
	else if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
		/* REF: http://xmpp.org/extensions/xep-0030.html */
		
		var iqQuery = iqResponse.setQuery(NS_DISCO_INFO);
		
		// We set the name of the client
		iqQuery.appendChild(iq.appendNode('identity', {
			'category': 'client',
			'type': 'web',
			'name': 'Jappix Mini'
		}));
		
		// We set all the supported features
		var fArray = new Array(
			NS_DISCO_INFO,
			NS_VERSION,
			NS_ROSTER
		);
		
		for(i in fArray)
			iqQuery.appendChild(iq.buildNode('feature', {'var': fArray[i]}));
		
		con.send(iqResponse);
		
		logThis('Received a disco#infos query.');
	}
}

// Handles the incoming presences
function handlePresence(pr) {
	// Get the values
	var xid = bareXID(getStanzaFrom(pr));
	var hash = hex_md5(xid);
	var type = pr.getType();
	var show = pr.getShow();
	var friend = '#jmini a#friend-' + hash;
	
	// Process the presence
	if(type == 'subscribe') {
		// Automatically accept presence subscription (for integration with big websites systems)
		// Note that you can remove this!
		presence('subscribed', '', '', '', xid);
		presence('subscribe', '', '', '', xid);
	}
	
	else if(type == 'unsubscribe') {
		// Automatically remove friends who unsubscribe (for integration with big websites systems)
		// Note that you can remove this!
		sendRoster(xid, 'remove');
		presence('unsubscribed', '', '', '', xid);
		presence('unsubscribe', '', '', '', xid);
	}
	
	else if(type == 'error' || type == 'unavailable')
		show = 'unavailable';
	
	else {
		switch(show) {
			case 'chat':
			case 'away':
			case 'xa':
			case 'dnd':
				break;
			
			default:
				show = 'available';
				break;
		}
	}
	
	// Is this friend online?
	if(show == 'unavailable')
		$(friend).addClass('offline').removeClass('online');
	else
		$(friend).removeClass('offline').addClass('online');
	
	// Change the show presence of this buddy
	$(friend + ' span.presence').attr('class', 'presence mini-images ' + show);
	$('#jmini #chat-' + hash + ' span.presence').attr('class', 'presence mini-images ' + show);
	
	// Update the presence counter
	var online_buddies = $('#jmini a.online').size();
	$('#jmini a.button span.counter').text(online_buddies);
	
	// Hide the roster if no online buddies
	if(online_buddies == 0) {
		$('#jmini div.roster').hide();
		$('#jmini a.button').removeClass('clicked');
	}
	
	logThis('Presence received from: ' + xid);
}

// Updates the user presence
function presence(type, show, priority, status, to) {
	var pr = new JSJaCPresence();
	
	if(to)
		pr.setTo(to);
	if(type)
		pr.setType(type);
	if(show)
		pr.setShow(show);
	if(priority)
		pr.setPriority(priority);
	if(status)
		pr.setStatus(status);
	
	con.send(pr);
	
	// No type?
	if(!type)
		type = 'available';
	
	logThis('Presence sent: ' + type, 3);
}

function sendRoster(xid, subscription) {
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': xid}));
	
	if(subscription)
		item.setAttribute('subscription', subscription);
	
	con.send(iq);
}

// Sends a given message
function sendMessage(aForm) {
	try {
		var body = aForm.body.value;
		var xid = aForm.xid.value;
		var hash = hex_md5(xid);
		
		if(body && xid) {
			// Send the message
			var aMsg = new JSJaCMessage();
			aMsg.setTo(xid);
			aMsg.setType('chat');
			aMsg.setBody(body);
			con.send(aMsg);
			
			// Clear our input
			aForm.body.value = '';
			
			// Display the message we sent
			displayMessage(xid, body, 'me', hash);
		}
	}
	
	finally {
		return false;
	}
}

// Generates the asked smiley image
function smiley(image) {
	return ' <span class="smiley smiley-' + image + ' mini-images"></span> ';
}

// Displays a given message
function displayMessage(xid, body, nick, hash) {
	// Get the path
	var path = '#chat-' + hash;
	
	// Remove the previous message border if needed
	var last = $(path + ' p:last');
	var last_b = $(path + ' b:last');
	var header = '';
	
	if(((last_b.hasClass('him')) && (nick != 'me')) || ((last_b.hasClass('me')) && (nick == 'me')))
		last.removeClass('group');
	
	else {
		// Write the buddy name at the top of the message group
		if(nick == 'me')
			header = '<b class="me">' + _e("You") + '</b>';
		else
			header = '<b class="him">' + nick + '</b>';
	}
	
	// Filter the message
	body = body.htmlEnc()
	       .replace(/(https?|ftp|file|xmpp|irc|mailto|vnc|webcal|ssh|ldap|smb|magnet)(:)([^<>'"\s]+)/gim, '<a href="$&" target="_blank">$&</a>')
	       .replace(/(;\)|;-\))(\s|$)/gi, smiley('wink'))
	       .replace(/(:3|:-3)(\s|$)/gi, smiley('waii'))
	       .replace(/(:\(|:-\()(\s|$)/gi, smiley('unhappy'))
	       .replace(/(:P|:-P)(\s|$)/gi, smiley('tongue'))
	       .replace(/(:O|:-O)(\s|$)/gi, smiley('surprised'))
	       .replace(/(:\)|:-\))(\s|$)/gi, smiley('smile'))
	       .replace(/(\^\^|\^_\^)(\s|$)/gi, smiley('happy'))
	       .replace(/(:D|:-D)(\s|$)/gi, smiley('grin'))
	       .replace(/(>:-\))(\s|$)/gi, smiley('evilgrin'))
	
	// Display the message
	$('#jmini #chat-' + hash + ' div.received-messages').append('<p class="group">' + header + body + '</p>');
	
	// Scroll to the last element
	var id = document.getElementById('received-' + hash);
	id.scrollTop = id.scrollHeight;
}

// Switches to a given point
function switchPane(element) {
	// Hide every item
	$('#jmini a.pane').removeClass('clicked');
	$('#jmini .roster, #jmini .chat-content').hide();
	
	// Show the asked element
	if(element && (element != 'roster')) {
		var current = '#jmini #' + element;
		
		$(current + ' a.pane').addClass('clicked');
		$(current + ' .chat-content').show();
		$(current + ' input.send-messages').focus();
	}
}

// Manages and creates a chat
function chat(xid, nick, hash) {
	var current = '#jmini #chat-' + hash;
	
	if(!exists(current)) {
		// Get the presence of this friend
		var selector = $('#jmini a#friend-' + hash + ' span.presence');
		
		if(selector.hasClass('available'))
			show = 'available';
		else if(selector.hasClass('chat'))
			show = 'chat';
		else if(selector.hasClass('away'))
			show = 'away';
		else if(selector.hasClass('xa'))
			show = 'xa';
		else if(selector.hasClass('dnd'))
			show = 'dnd';
		else
			show = 'unavailable';
		
		// Create the HTML markup
		$('#jmini .conversations').append(
			'<div class="conversation" id="chat-' + hash + '">' + 
				'<div class="chat-content">' + 
					'<div class="manage-messages">' + 
						nick + 
						'<a class="close" title="' + _e("Close") + '">x</a>' + 
					'</div>' + 
					
					'<div class="received-messages" id="received-' + hash + '"></div>' + 
					
					'<form action="#" method="post" onsubmit="return sendMessage(this);">' + 
						'<input type="text" class="send-messages" name="body" />' + 
						'<input type="hidden" name="xid" value="' + xid + '" />' + 
					'</form>' + 
				'</div>' + 
				
				'<a class="pane chat-tab mini-images"><span class="presence mini-images ' + show + '"></span> ' + nick + '</a>' + 
			'</div>'
		);
		
		// The click events
		chatClick(hash);
	}
	
	// Focus on our pane
	switchPane('chat-' + hash);
}

// Click events on the chat tool
function chatClick(hash) {
	var current = '#jmini #chat-' + hash;
	
	// The clic events
	$(current + ' .chat-tab').click(function() {
		// Not yet opened: open it!
		if(!$(this).hasClass('clicked')) {
			// The routine to show it
			$(current + ' .chat-content').show();
			$(this).addClass('clicked');
			switchPane('chat-' + hash);
			
			// Clear the eventual notifications
			$(this).removeClass('unread');
		}
		
		// Yet opened: close it!
		else {
			$(current + ' .chat-content').hide();
			$(this).removeClass('clicked');
		}
	});
	
	$(current + ' a.close').click(function() {
		$(current).remove();
	});
}

// Shows the roster
function showRoster() {
	switchPane('roster');
	$('#jmini div.roster').show();
	$('#jmini a.button').addClass('clicked');
}

// Hides the roster
function hideRoster() {
	$('#jmini div.roster').hide();
	$('#jmini a.button').removeClass('clicked');
}

// Initializes Jappix Mini
function initialize() {
	// Send the initial presence
	presence();
	
	// Show Jappix Mini
	$('#jmini').show();
}

// Gets the user's roster
function getRoster() {
	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setQuery(NS_ROSTER);
	con.send(iq, handleRoster);
	
	logThis('Getting roster...', 3);
}

// Handles the user's roster
function handleRoster(iq) {
	// Parse the roster
	$(iq.getQuery()).find('item').each(function() {
		// Get the values
		var current = $(this);
		var xid = current.attr('jid');
		var subscription = current.attr('subscription');
		
		// Not a gateway
		if(!isGateway(xid)) {
			var nick = current.attr('name');
			var hash = hex_md5(xid);
			var element = '#jmini a.friend#friend-' + hash;
			
			// No name is defined?
			if(!nick)
				nick = getXIDNick(xid);
			
			// Display the current buddy
			if(!exists(element) && subscription != 'remove') {
				$('#jmini div.roster').append('<a class="friend offline" id="friend-' + hash + '" name="' + xid + '"><span class="presence mini-images unavailable"></span> ' + nick + '</a>');
				
				// Click event on this buddy
				$(element).click(function() {
					chat(xid, nick, hash);
				});
			}
			
			else if(subscription == 'remove')
				$(element).remove();
		}
	});
	
	initialize();
	
	logThis('Roster got.', 3);
}

// Loads a given page
function loadPage(path, element) {
	// First change the page URL
	window.location.hash = path;
	
	// Then, load the page
	$(element).load(path + ' ' + element, function() {
		replaceLinks(element)
	});
	
	// Do not quit this page!
	return false;
}

// Replace page links
function replaceLinks(element) {
	$(element + ' a').each(function() {
		var link = $(this).attr('href');
		var regex = new RegExp(window.location.hostname, 'gi');
		
		if(link && link.match(regex))
			$(this).click(function() {
				return loadPage(link, element);
			});
	});
	
	logThis('Page links have been replaced.');
}

// Plugin launcher
function launchMini() {
	// Append the mini stylesheet
	$('head').append('<link rel="stylesheet" href="' + JAPPIX_LOCATION + 'php/get.php?h=none&t=css&g=mini.xml" type="text/css" media="all" />');
	
	// Disables the browser HTTP-requests stopper
	$(document).keydown(function(e) {
		if((e.keyCode == 27) && !isDeveloper())
			return false;
	});
	
	logThis('Welcome to Jappix Mini! Happy coding in developer mode!');
}

// Disconnects when the user quit
$(window).bind('unload', disconnect);

// Append the CSS stylesheet
$(document).ready(launchMini);
