/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 28/11/10

*/

// Jappix Mini vars
var MINI_CONNECTOR = false;
var MINI_INITIALIZED = false;
var MINI_ANONYMOUS = false;
var MINI_NICKNAME = null;
var MINI_GROUPCHATS = null;

// Setups connection handlers
function setupCon(con) {
	con.registerHandler('message', handleMessage);
	con.registerHandler('presence', handlePresence);
	con.registerHandler('iq', handleIQ);
	con.registerHandler('onconnect', connected);
	con.registerHandler('ondisconnect', disconnected);
}

// Connects the user with the given logins
function connect(domain, user, password) {
	// Update the marker
	MINI_CONNECTOR = false;
	
	try {
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
		oArgs.secure = true;
		oArgs.resource = JAPPIX_RESOURCE + ' Mini';
		oArgs.domain = domain;
		
		// Anonymous login?
		if(MINI_ANONYMOUS) {
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
			
			// No nickname?
			if(!MINI_NICKNAME)
				MINI_NICKNAME = user;
			
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
	// Do not get the roster if anonymous
	if(MINI_ANONYMOUS)
		initialize();
	else
		getRoster();
	
	// Join the groupchats
	if(MINI_GROUPCHATS) {
		// Open each defined groupchats
		for(i in MINI_GROUPCHATS) {
			// Current chat room
			var chat_room = bareXID(generateXID(MINI_GROUPCHATS[i], 'groupchat'));
			
			// Open the current chat
			chat('groupchat', chat_room, getXIDNick(chat_room), hex_md5(chat_room));
		}
	}
	
	logThis('Jappix Mini is now connected.', 3);
}

// When the user disconnects
function saveSession() {
	if((typeof con != 'undefined') && con && con.connected()) {
		// Save the actual Jappix Mini DOM
                setDB('jappix-mini', con.domain, $('#jappix_mini').html());
		
		// Suspend connection
		con.suspend();
		
		logThis('Jappix Mini session saved...', 3);
	}
}

// When the user is disconnected
function disconnected() {
	// Remove Jappix Mini when disconnected
	$('#jappix_mini').remove();
	
	logThis('Jappix Mini is now disconnected.', 3);
}

// Handles the incoming messages
function handleMessage(msg) {
	var type = msg.getType();
	
	// This is a message Jappix can handle
	if((type == 'chat') || (type == 'normal') || (type == 'groupchat') || !type) {
		// Get the body
		var body = msg.getBody();
		
		if(body) {
			// Get the values
			var from = fullXID(getStanzaFrom(msg));
			var xid = bareXID(from);
			var hash = hex_md5(xid);
			var nick = thisResource(from);
			
			// Is this a groupchat private message?
			if(exists('#jappix_mini #chat-' + hash + '[data-type=groupchat]') && ((type == 'chat') || !type)) {
				// Regenerate some stuffs
				xid = from;
				hash = hex_md5(xid);
			}
			
			// Message type
			var message_type = 'user-message';
			
			// Grouphat values
			if(type == 'groupchat') {
				// System message?
				if(!nick)
					message_type = 'system-message';
			}
			
			// Chat values
			else {
				nick = $('#jappix_mini a#friend-' + hash).text().revertHtmlEnc();
				
				// No nickname?
				if(!nick)
					nick = getXIDNick(xid);
			}
			
			// Define the target div
			var target = '#jappix_mini #chat-' + hash;
			
			// Create the chat if it does not exist
			if(!exists(target))
				chat(type, xid, nick, hash);
			
			// Display the message
			displayMessage(type, body, nick, hash, message_type);
			
			// Notify the user if not focused
			if(!$(target + ' a.chat-tab').hasClass('clicked') || !document.hasFocus())
				notifyMessage(hash);
			
			logThis('Message received from: ' + from);
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
	var iqNode = iq.getNode();
	
	// Build the response
	var iqResponse = new JSJaCIQ();
	
	iqResponse.setID(iqID);
	iqResponse.setTo(iqFrom);
	iqResponse.setType('result');
	
	// Software version query
	if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
		/* REF: http://xmpp.org/extensions/xep-0092.html */
		
		var iqQuery = iqResponse.setQuery(NS_VERSION);
		
		iqQuery.appendChild(iq.buildNode('name', {'xmlns': NS_VERSION}, 'Jappix Mini'));
		iqQuery.appendChild(iq.buildNode('version', {'xmlns': NS_VERSION}, JAPPIX_VERSION));
		iqQuery.appendChild(iq.buildNode('os', {'xmlns': NS_VERSION}, osDetect()));
		
		con.send(iqResponse);
		
		logThis('Received software version query: ' + iqFrom);
	}
	
	// Roster push
	else if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set')) {
		// Display the friend
		handleRoster(iq);
		
		con.send(iqResponse);
		
		logThis('Received a roster push.');
	}
	
	// Disco info query
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
	
	// User time query
	else if($(iqNode).find('time').size() && (iqType == 'get')) {
		/* REF: http://xmpp.org/extensions/xep-0202.html */
		
		var iqTime = iqResponse.appendNode('time', {'xmlns': NS_URN_TIME});
		iqTime.appendChild(iq.buildNode('tzo', {'xmlns': NS_URN_TIME}, getDateTZO()));
		iqTime.appendChild(iq.buildNode('utc', {'xmlns': NS_URN_TIME}, getXMPPTime('utc')));
		
		con.send(iqResponse);
		
		logThis('Received local time query: ' + iqFrom);
	}
}

// Handles the incoming presences
function handlePresence(pr) {
	// Get the values
	var from = fullXID(getStanzaFrom(pr));
	var xid = bareXID(from);
	var resource = thisResource(from);
	var hash = hex_md5(xid);
	var type = pr.getType();
	var show = pr.getShow();
	
	// Manage the received presence values
	if((type == 'error') || (type == 'unavailable'))
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
	
	// Is this a groupchat presence?
	var groupchat_path = '#jappix_mini #chat-' + hash + '[data-type=groupchat]';
	
	if(exists(groupchat_path)) {
		// Is it my groupchat presence?
		if(resource == unescape($(groupchat_path).attr('data-nick'))) {
			// Remove this groupchat
			if(show == 'unavailable')
				removeGroupchat(xid);
		}
		
		// Groupchat buddy presence
		else {
			// Regenerate some stuffs
			var groupchat = xid;
			xid = from;
			hash = hex_md5(xid);
			
			// Remove this from the roster
			if(show == 'unavailable')
				removeBuddy(hash, groupchat);
			
			// Add this to the roster
			else
				addBuddy(xid, hash, resource, groupchat);
		}
	}
	
	// Friend path
	var friend = '#jappix_mini a#friend-' + hash;
	
	// Is this friend online?
	if(show == 'unavailable')
		$(friend).addClass('offline').removeClass('online');
	else
		$(friend).removeClass('offline').addClass('online');
	
	// Change the show presence of this buddy
	$(friend + ' span.presence').attr('class', 'presence mini-images ' + show);
	$('#jappix_mini #chat-' + hash + ' span.presence').attr('class', 'presence mini-images ' + show);
	
	// Update the presence counter
	updateRoster();
	
	logThis('Presence received from: ' + from);
}

// Handles the MUC main elements
function handleMUC(pr) {
	// We get the xml content
	var xml = pr.getNode();
	var from = fullXID(getStanzaFrom(pr));
	var room = bareXID(from);
	var resource = thisResource(from);
	
	// Password required?
	if($(xml).find('error[type=auth] not-authorized').size()) {
		var password = prompt(printf(_e("This room (%s) is protected with a password."), room), '');
		
		// Any password?
		if(password)
			presence('', '', '', '', from, password, true, handleMUC);
	}
	
	// Nickname conflict?
	else if($(xml).find('error[type=cancel] conflict').size()) {
		var nickname = prompt(printf(_e("Please enter a different nickname, the previous one is not available on %s."), room), resource + '_');
		
		// Any nickname?
		if(nickname) {
			presence('', '', '', '', room + '/' + nickname, '', true, handleMUC);
			
			// Update the nickname marker
			$('#jappix_mini #chat-' + hex_md5(room)).attr('data-nick', escape(nickname));
		}
	}
}

// Updates the user presence
function presence(type, show, priority, status, to, password, limit_history, handler) {
	var pr = new JSJaCPresence();
	
	// Add the attributes
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
	
	// Special presence elements
	if(password || limit_history) {
		var x = pr.appendNode('x', {'xmlns': NS_MUC});
		
		// Any password?
		if(password)
			x.appendChild(pr.buildNode('password', {'xmlns': NS_MUC}, password));
		
		// Any history limit?
		if(limit_history)
			x.appendChild(pr.buildNode('history', {'maxstanzas': 10, 'seconds': 86400, 'xmlns': NS_MUC}));
	}
	
	// Send the packet
	if(handler)
		con.send(pr, handler);
	else
		con.send(pr);
	
	// No type?
	if(!type)
		type = 'available';
	
	logThis('Presence sent: ' + type, 3);
}

// Sends a given message
function sendMessage(aForm) {
	try {
		var body = aForm.body.value;
		var xid = aForm.xid.value;
		var type = aForm.type.value;
		var hash = hex_md5(xid);
		
		if(body && xid) {
			// Send the message
			var aMsg = new JSJaCMessage();
			
			aMsg.setTo(xid);
			aMsg.setType(type);
			aMsg.setBody(body);
			
			con.send(aMsg);
			
			// Clear the input
			aForm.body.value = '';
			
			// Display the message we sent
			if(type != 'groupchat')
				displayMessage(type, body, 'me', hash, 'user-message');
			
			logThis('Message (' + type + ') sent to: ' + xid);
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

// Notifies incoming chat messages
function notifyMessage(hash) {
	// Define the paths
	var tab = '#jappix_mini #chat-' + hash + ' a.chat-tab';
	var notify = tab + ' span.notify';
	
	// Notification box not yet added
	if(!exists(notify))
		$(tab).append('<span class="notify">0</span>');
	
	// Increment the notification number
	var number = parseInt($(notify).text());
	$(notify).text(number + 1);
	
	// Change the page title
	notifyTitle();
}

// Updates the page title with the new notifications
var PAGE_TITLE = null;

function notifyTitle() {
	// No saved title? Abort!
	if(PAGE_TITLE == null)
		return false;
	
	// Page title code
	var title = PAGE_TITLE;
	
	// Count the number of notifications
	var number = 0;
	
	$('#jappix_mini span.notify').each(function() {
		number = number + parseInt($(this).text());
	});
	
	// No new stuffs? Reset the title!
	if(number)
		title = '[' + number + '] ' + title;
	
	// Apply the title
	$('head title').html(title);
	
	return true;
}

// Clears the notifications
function clearNotifications(hash) {
	// Remove the notifications counter
	$('#jappix_mini #chat-' + hash + ' span.notify').remove();
	
	// Update the page title
	notifyTitle();
}

// Updates the roster counter
function updateRoster() {
	$('#jappix_mini a.button span.counter').text($('#jappix_mini a.online').size());
}

// Creates the Jappix Mini DOM content
function createMini(domain, user, password) {
	// Try to restore the DOM
        var dom = getDB('jappix-mini', domain);
	var suspended = true;
	
	// New DOM
	if(!dom) {
		dom = 
			'<div class="conversations"></div>' + 
			
			'<div class="starter">' + 
				'<div class="roster">' + 
					'<div class="actions">' + 
						'<a class="logo mini-images" href="http://mini.jappix.com/" target="_blank"></a>' + 
						'<a class="one-action join mini-images" title="' + _e("Join a chat") + '"></a>' + 
					'</div>' + 
					
					'<div class="buddies"></div>' + 
				'</div>' + 
				
				'<a class="pane button mini-images"><span class="counter mini-images">0</span></a>' + 
			'</div>';
		
		suspended = false;
	}
	
	// Create the DOM
	$('body').append('<div id="jappix_mini" class="hidden">' + dom + '</div>');
	
	// Adapt roster height
	adaptRoster();
	
	// The click events
	$('#jappix_mini a.button').click(function() {
		// Anonymous connection?
		if(MINI_CONNECTOR) {
			// Show a waiting icon
			$('#jappix_mini a.pane.button span.counter').text(_e("Please wait..."));
			
			// Launch the connection
			return connect(domain, user, password);
		}
		
		if(!$(this).hasClass('clicked'))
			showRoster();
		else
			hideRoster();
		
		return false;
	});
	
	$('#jappix_mini div.actions a.join').click(function() {
		var join_this = prompt(_e("Please enter the group chat address to join."));
		
		// Any submitted chat to join?
		if(join_this) {
			// Get the chat room to join
			chat_room = bareXID(generateXID(join_this, 'groupchat'));
			
			// Create a new groupchat
			chat('groupchat', chat_room, getXIDNick(chat_room), hex_md5(chat_room));
		}
		
		return false;
	});
	
	// Hides the roster when clicking away of Jappix Mini
	$(document).click(function(evt) {
		if(!$(evt.target).parents('#jappix_mini').size())
			hideRoster();
	});
	
	// Hides all panes double clicking away of Jappix Mini
	$(document).dblclick(function(evt) {
		if(!$(evt.target).parents('#jappix_mini').size())
			switchPane();
	});
	
	// Can resume a session?
	con = new JSJaCHttpBindingConnection();
	setupCon(con);
	
	if(suspended && con.resume()) {
		// Restore buddy click events
		$('#jappix_mini a.friend').click(function() {
			return chat('chat', unescape($(this).attr('data-xid')), unescape($(this).attr('data-nick')), $(this).attr('data-hash'));
		});
		
		// Restore chat click events
		$('#jappix_mini div.conversation').each(function() {
			chatEvents($(this).attr('data-type'), unescape($(this).attr('data-xid')), $(this).attr('data-hash'));
		});
		
		// Show Jappix Mini!
		$('#jappix_mini').removeClass('hidden');
		
		// Scroll down to the last message
		// FIXME: not working because of a lag time
		var scroll_hash = $('#jappix_mini div.conversation:has(a.pane.clicked)').attr('data-hash');
		
		if(scroll_hash)
			messageScroll(scroll_hash);
	}
	
	// Anonymous: do not connect
	else if(MINI_ANONYMOUS) {
		// Marker
		MINI_CONNECTOR = true;
		
		// Hide the buddy number
		$('#jappix_mini a.pane.button span.counter').text(_e("Chat"));
		
		// Show Jappix Mini!
		$('#jappix_mini').removeClass('hidden');
	}
	
	// Connect if not anonymous
	else
		connect(domain, user, password);
}

// Displays a given message
function displayMessage(type, body, nick, hash, message_type) {
	// Generate some stuffs
	var path = '#chat-' + hash;
	var escaped_nick = escape(nick);
	
	// Remove the previous message border if needed
	var last = $(path + ' p:last');
	var last_b = $(path + ' b:last');
	var last_nick = last_b.attr('data-nick');
	var last_type = last.attr('data-type');
	var header = '';
	
	if((last_nick == escaped_nick) && (message_type == last_type))
		last.removeClass('group');
	
	else {
		// Write the buddy name at the top of the message group
		if(type == 'groupchat')
			header = '<b style="color: ' + generateColor(nick) + ';" data-nick="' + escaped_nick + '">' + nick.htmlEnc() + '</b>';
		else if(nick == 'me')
			header = '<b class="me" data-nick="' + escaped_nick + '">' + _e("You") + '</b>';
		else
			header = '<b class="him" data-nick="' + escaped_nick + '">' + nick.htmlEnc() + '</b>';
	}
	
	// Filter the message
	body = body.htmlEnc()
	       .replace(/(;\)|;-\))(\s|$)/gi, smiley('wink'))
	       .replace(/(:3|:-3)(\s|$)/gi, smiley('waii'))
	       .replace(/(:\(|:-\()(\s|$)/gi, smiley('unhappy'))
	       .replace(/(:P|:-P)(\s|$)/gi, smiley('tongue'))
	       .replace(/(:O|:-O)(\s|$)/gi, smiley('surprised'))
	       .replace(/(:\)|:-\))(\s|$)/gi, smiley('smile'))
	       .replace(/(\^\^|\^_\^)(\s|$)/gi, smiley('happy'))
	       .replace(/(:D|:-D)(\s|$)/gi, smiley('grin'))
	       .replace(/(>:-\))(\s|$)/gi, smiley('evilgrin'));
	
	// Filter the links
	body = filterLinks(body, 'mini');
	
	// Display the message
	$('#jappix_mini #chat-' + hash + ' div.received-messages').append('<p class="group" data-type="' + message_type + '">' + header + body + '</p>');
	
	// Scroll to the last element
	messageScroll(hash);
}

// Switches to a given point
function switchPane(element, hash) {
	// Hide every item
	$('#jappix_mini a.pane').removeClass('clicked');
	$('#jappix_mini .roster, #jappix_mini .chat-content').hide();
	
	// Show the asked element
	if(element && (element != 'roster')) {
		var current = '#jappix_mini #' + element;
		
		$(current + ' a.pane').addClass('clicked');
		$(current + ' .chat-content').show();
		$(current + ' input.send-messages').focus();
		
		// Scroll to the last message
		if(hash)
			messageScroll(hash);
	}
}

// Scrolls to the last chat message
function messageScroll(hash) {
	var id = document.getElementById('received-' + hash);
	id.scrollTop = id.scrollHeight;
}

// Manages and creates a chat
function chat(type, xid, nick, hash) {
	var current = '#jappix_mini #chat-' + hash;
	
	// Not yet added?
	if(!exists(current)) {
		// Groupchat nickname
		if(type == 'groupchat') {
			var nickname = MINI_NICKNAME;
			
			// No nickname?
			if(!nickname) {
				nickname = prompt(printf(_e("Please enter your nickname to join %s."), xid), '');
				
				// No nickname submitted?!
				if(!nickname)
					return false;
				
				// Update the stored one
				MINI_NICKNAME = nickname;
			}
		}
		
		// Get the icon to show
		var show = 'available';
		
		// Get the presence of this friend
		if(type != 'groupchat') {
			var selector = $('#jappix_mini a#friend-' + hash + ' span.presence');
			
			if(selector.hasClass('unavailable'))
				show = 'unavailable';
			else if(selector.hasClass('chat'))
				show = 'chat';
			else if(selector.hasClass('away'))
				show = 'away';
			else if(selector.hasClass('xa'))
				show = 'xa';
			else if(selector.hasClass('dnd'))
				show = 'dnd';
		}
		
		// Create the HTML markup
		$('#jappix_mini div.conversations').append(
			'<div class="conversation" id="chat-' + hash + '" data-xid="' + escape(xid) + '" data-type="' + type + '" data-hash="' + hash + '" data-origin="' + escape(cutResource(xid)) + '">' + 
				'<div class="chat-content">' + 
					'<div class="actions">' + 
						nick + 
						'<a class="one-action close mini-images" title="' + _e("Close") + '"></a>' + 
					'</div>' + 
					
					'<div class="received-messages" id="received-' + hash + '"></div>' + 
					
					'<form action="#" method="post">' + 
						'<input type="text" class="send-messages" name="body" />' + 
						'<input type="hidden" name="xid" value="' + xid + '" />' + 
						'<input type="hidden" name="type" value="' + type + '" />' + 
					'</form>' + 
				'</div>' + 
				
				'<a class="pane chat-tab mini-images"><span class="presence mini-images ' + show + '"></span> ' + nick.htmlEnc() + '</a>' + 
			'</div>'
		);
		
		// The click events
		chatEvents(type, xid, hash);
		
		// Join the groupchat
		if(type == 'groupchat') {
			// Add the nickname value
			$(current).attr('data-nick', escape(nickname));
			
			// Send the first groupchat presence
			presence('', '', '', '', xid + '/' + nickname, '', true, handleMUC);
		}
	}
	
	// Focus on our pane
	switchPane('chat-' + hash, hash);
	
	return false;
}

// Events on the chat tool
function chatEvents(type, xid, hash) {
	var current = '#jappix_mini #chat-' + hash;
	
	// Submit the form
	$(current + ' form').submit(function() {
		return sendMessage(this);
	});
	
	// Click on the tab
	$(current + ' a.chat-tab').click(function() {
		// Not yet opened: open it!
		if(!$(this).hasClass('clicked')) {
			// The routine to show it
			$(current + ' .chat-content').show();
			$(this).addClass('clicked');
			switchPane('chat-' + hash, hash);
			
			// Clear the eventual notifications
			clearNotifications(hash);
		}
		
		// Yet opened: close it!
		else {
			$(current + ' .chat-content').hide();
			$(this).removeClass('clicked');
		}
		
		return false;
	});
	
	// Click on the close button
	$(current + ' a.close').click(function() {
		$(current).remove();
		
		// Quit the groupchat?
		if(type == 'groupchat') {
			// Send an unavailable presence
			presence('unavailable', '', '', '', xid + '/' + unescape($(current).attr('data-nick')));
			
			// Remove this groupchat!
			removeGroupchat(xid);
		}
		
		return false;
	});
	
	// Click on the chat content
	$(current + ' div.received-messages').click(function() {
		$(current + ' input.send-messages').focus();
		
		return false;
	});
	
	// Focus on the chat input
	$(current + ' input.send-messages').focus(function() {
		// Clear the eventual notifications
		clearNotifications(hash);
	});
}

// Shows the roster
function showRoster() {
	switchPane('roster');
	$('#jappix_mini div.roster').show();
	$('#jappix_mini a.button').addClass('clicked');
}

// Hides the roster
function hideRoster() {
	$('#jappix_mini div.roster').hide();
	$('#jappix_mini a.button').removeClass('clicked');
}

// Removes a groupchat from DOM
function removeGroupchat(xid) {
	// Remove the groupchat private chats & the groupchat buddies from the roster
	$('#jappix_mini div.conversation[data-origin=' + escape(cutResource(xid)) + '], #jappix_mini div.roster div.group[data-xid=' + escape(xid) + ']').remove();
	
	// Update the presence counter
	updateRoster();
}

// Initializes Jappix Mini
function initialize() {
	// Update the marker
	MINI_INITIALIZED = true;
	
	// Must show the roster?
	if(MINI_ANONYMOUS) {
		$('#jappix_mini a.pane.button span.counter').text('0');
		showRoster();
	}
	
	// Send the initial presence
	presence();
	
	// Show Jappix Mini
	$('#jappix_mini').removeClass('hidden');
}

// Displays a roster buddy
function addBuddy(xid, hash, nick, groupchat) {
	// Element
	var element = '#jappix_mini a.friend#friend-' + hash;
	
	// Yet added?
	if(exists(element))
		return false;
	
	// Generate the path
	var path = '#jappix_mini div.roster div.buddies';
	
	// Groupchat buddy
	if(groupchat) {
		// Generate the groupchat group path
		path = '#jappix_mini div.roster div.group[data-xid=' + escape(groupchat) + ']';
		
		// Must add a groupchat group?
		if(!exists(path)) {
			$('#jappix_mini div.roster div.buddies').append(
				'<div class="group" data-xid="' + escape(groupchat) + '">' + 
					'<div class="name">' + getXIDNick(groupchat).htmlEnc() + '</div>' + 
				'</div>'
			);
		}
	}
	
	// Append this buddy content
	var code = '<a class="friend offline" id="friend-' + hash + '" data-xid="' + escape(xid) + '" data-nick="' + escape(nick) +  '" data-hash="' + hash + '"><span class="presence mini-images unavailable"></span> ' + nick.htmlEnc() + '</a>';
	
	if(groupchat)
		$(path).append(code);
	else
		$(path).prepend(code);
	
	// Click event on this buddy
	$(element).click(function() {
		return chat('chat', xid, nick, hash);
	});
	
	return true;
}

// Removes a roster buddy
function removeBuddy(hash, groupchat) {
	// Remove the buddy from the roster
	$('#jappix_mini a.friend#friend-' + hash).remove();
	
	// Empty group?
	var group = '#jappix_mini div.roster div.group[data-xid=' + escape(groupchat) + ']';
	
	if(groupchat && !$(group + ' a.friend').size())
		$(group).remove();
	
	return true;
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
			
			// No name is defined?
			if(!nick)
				nick = getXIDNick(xid);
			
			// Action on the current buddy
			if(subscription == 'remove')
				removeBuddy(hash);
			else
				addBuddy(xid, hash, nick);
		}
	});
	
	// Not yet initialized
	if(!MINI_INITIALIZED)
		initialize();
	
	logThis('Roster got.', 3);
}

// Adapts the roster height to the window
function adaptRoster() {
	// Process the new height
	var height = $(window).height() - 70;
	
	// Apply the new height
	$('#jappix_mini div.roster div.buddies').css('max-height', height);
}

// Plugin launcher
function launchMini(domain, user, password) {
	// Anonymous mode?
	if(!user || !password)
		MINI_ANONYMOUS = true;
	
	// Append the mini stylesheet
	$('head').append('<link id="jappix_mini_css" rel="stylesheet" href="' + JAPPIX_STATIC + 'php/get.php?h=none&amp;t=css&amp;g=mini.xml" type="text/css" media="all" />');
	
	// Disables the browser HTTP-requests stopper
	$(document).keydown(function(e) {
		if((e.keyCode == 27) && !isDeveloper())
			return false;
	});
	
	// Save the page title
	if($('head title').size())
		PAGE_TITLE = $('head title:first').html();
	
	// Sets the good roster max-height
	$(window).resize(adaptRoster);
	
	// Disconnects when the user quit
	$(window).bind('unload', saveSession);
	
	// Create the Jappix Mini DOM content
	createMini(domain, user, password);
	
	logThis('Welcome to Jappix Mini! Happy coding in developer mode!');
}
