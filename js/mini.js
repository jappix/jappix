/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 08/12/10

*/

// Jappix Mini vars
var MINI_CONNECTING = false;
var MINI_AUTOCONNECT = false;
var MINI_SHOWPANE = false;
var MINI_INITIALIZED = false;
var MINI_ANONYMOUS = false;
var MINI_NICKNAME = null;
var MINI_GROUPCHATS = [];
var MINI_PASSWORDS = [];

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
	MINI_CONNECTING = true;
	
	try {
		// We define the http binding parameters
		oArgs = new Object();
		oArgs.httpbase = HOST_BOSH;
		
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
	// Update the roster
	$('#jappix_mini a.jm_pane.jm_button span.jm_counter').text('0');
	
	// Must show the roster?
	if(!MINI_AUTOCONNECT)
		showRoster();
	
	// Do not get the roster if anonymous
	if(MINI_ANONYMOUS)
		initialize();
	else
		getRoster();
	
	// Join the groupchats
	for(var i = 0; i < MINI_GROUPCHATS.length; i++) {
		// Empty value?
		if(!MINI_GROUPCHATS[i])
			continue;
		
		// Using a try/catch override IE issues
		try {
			// Current chat room
			var chat_room = bareXID(generateXID(MINI_GROUPCHATS[i], 'groupchat'));
			
			// Open the current chat
			chat('groupchat', chat_room, getXIDNick(chat_room), hex_md5(chat_room), MINI_PASSWORDS[i]);
		}
		
		catch(e) {}
	}
	
	// Must hide all panes?
	if(!MINI_SHOWPANE)
		switchPane();
	
	logThis('Jappix Mini is now connected.', 3);
}

// When the user disconnects
function saveSession() {
	if(MINI_INITIALIZED) {
		// Save the actual Jappix Mini DOM
                setDB('jappix-mini', 'dom', $('#jappix_mini').html());
		setDB('jappix-mini', 'nickname', MINI_NICKNAME);
		
		// Suspend connection
		con.suspend();
		
		logThis('Jappix Mini session saved.', 3);
	}
}

// When the user is disconnected
function disconnected() {
	// Reset initialized marker
	MINI_INITIALIZED = false;
	
	// Remove Jappix Mini when disconnected
	$('#jappix_mini').remove();
	
	// Remove the stored DOM
	removeDB('jappix-mini', 'dom');
	removeDB('jappix-mini', 'nickname');
	
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
			
			// Read the delay
			var delay = readMessageDelay(msg.getNode());
			var d_stamp;
			
			// Manage this delay
			if(delay) {
				time = relativeDate(delay);
				d_stamp = Date.jab2date(delay);
			}
			
			else {
				time = getCompleteTime();
				d_stamp = new Date();
			}
			
			// Get the stamp
			var stamp = extractStamp(d_stamp);
			
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
				// Old message
				if(msg.getChild('delay', NS_URN_DELAY) || msg.getChild('x', NS_DELAY))
					message_type = 'old-message';
				
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
			if(!exists(target) && (type != 'groupchat'))
				chat(type, xid, nick, hash);
			
			// Display the message
			displayMessage(type, body, nick, hash, time, stamp, message_type);
			
			// Notify the user if not focused & the message is not a groupchat old one
			if((!$(target + ' a.jm_chat-tab').hasClass('jm_clicked') || !document.hasFocus()) && (message_type == 'user-message'))
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
		iqQuery.appendChild(iq.buildNode('os', {'xmlns': NS_VERSION}, BrowserDetect.OS));
		
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
			NS_ROSTER,
			NS_MUC,
			NS_VERSION,
			NS_URN_TIME
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
		// Groupchat buddy presence (not me)
		if(resource != unescape($(groupchat_path).attr('data-nick'))) {
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
		$(friend).addClass('jm_offline').removeClass('jm_online');
	else
		$(friend).removeClass('jm_offline').addClass('jm_online');
	
	// Change the show presence of this buddy
	$(friend + ' span.jm_presence').attr('class', 'jm_presence mini-images jm_' + show);
	$('#jappix_mini #chat-' + hash + ' span.jm_presence').attr('class', 'jm_presence mini-images jm_' + show);
	
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
		// New nickname
		var nickname = resource + '_';
		
		// Send the new presence
		presence('', '', '', '', room + '/' + nickname, '', true, handleMUC);
		
		// Update the nickname marker
		$('#jappix_mini #chat-' + hex_md5(room)).attr('data-nick', escape(nickname));
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
				displayMessage(type, body, 'me', hash, getCompleteTime(), getTimeStamp(), 'user-message');
			
			logThis('Message (' + type + ') sent to: ' + xid);
		}
	}
	
	finally {
		return false;
	}
}

// Generates the asked smiley image
function smiley(image) {
	return ' <span class="jm_smiley jm_smiley-' + image + ' mini-images"></span> ';
}

// Notifies incoming chat messages
function notifyMessage(hash) {
	// Define the paths
	var tab = '#jappix_mini #chat-' + hash + ' a.jm_chat-tab';
	var notify = tab + ' span.jm_notify';
	
	// Notification box not yet added
	if(!exists(notify))
		$(tab).append('<span class="jm_notify">0</span>');
	
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
	
	$('#jappix_mini span.jm_notify').each(function() {
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
	$('#jappix_mini #chat-' + hash + ' span.jm_notify').remove();
	
	// Update the page title
	notifyTitle();
}

// Updates the roster counter
function updateRoster() {
	$('#jappix_mini a.jm_button span.jm_counter').text($('#jappix_mini a.jm_online').size());
}

// Creates the Jappix Mini DOM content
function createMini(domain, user, password) {
	// Try to restore the DOM
        var dom = getDB('jappix-mini', 'dom');
	var suspended = true;
	
	// New DOM?
	if(!dom) {
		dom = 
			'<div class="jm_conversations"></div>' + 
			
			'<div class="jm_starter">' + 
				'<div class="jm_roster">' + 
					'<div class="jm_actions">' + 
						'<a class="jm_logo mini-images" href="http://mini.jappix.com/" target="_blank"></a>' + 
						'<a class="jm_one-action jm_join mini-images" title="' + _e("Join a chat") + '" href="#"></a>' + 
					'</div>' + 
					
					'<div class="jm_buddies"></div>' + 
				'</div>' + 
				
				'<a class="jm_pane jm_button mini-images" href="#"><span class="jm_counter mini-images">' + _e("Please wait...") + '</span></a>' + 
			'</div>';
		
		suspended = false;
	}
	
	// Old DOM?
	else
		MINI_NICKNAME = getDB('jappix-mini', 'nickname');
	
	// Create the DOM
	$('body').append('<div id="jappix_mini">' + dom + '</div>');
	
	// Adapt roster height
	adaptRoster();
	
	// The click events
	$('#jappix_mini a.jm_button').click(function() {
		// Using a try/catch override IE issues
		try {
			var counter = '#jappix_mini a.jm_pane.jm_button span.jm_counter';
			
			// Cannot open the roster?
			if($(counter).text() == _e("Please wait..."))
				return false;
			
			// Not yet connected?
			if(!MINI_CONNECTING && !MINI_AUTOCONNECT) {
				// Add a waiting marker
				$(counter).text(_e("Please wait..."));
				
				// Launch the connection!
				connect(domain, user, password);
				
				return false;
			}
			
			// Normal actions
			if(!$(this).hasClass('jm_clicked'))
				showRoster();
			else
				hideRoster();
		}
		
		catch(e) {}
		
		finally {
			return false;
		}
	});
	
	$('#jappix_mini div.jm_actions a.jm_join').click(function() {
		// Using a try/catch override IE issues
		try {
			var join_this = prompt(_e("Please enter the group chat address to join."), '');
			
			// Any submitted chat to join?
			if(join_this) {
				// Get the chat room to join
				chat_room = bareXID(generateXID(join_this, 'groupchat'));
				
				// Create a new groupchat
				chat('groupchat', chat_room, getXIDNick(chat_room), hex_md5(chat_room));
			}
		}
		
		catch(e) {}
		
		finally {
			return false;
		}
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
		// Initialized marker
		MINI_INITIALIZED = true;
		
		// Restore buddy click events
		$('#jappix_mini a.jm_friend').click(function() {
			// Using a try/catch override IE issues
			try {
				chat('chat', unescape($(this).attr('data-xid')), unescape($(this).attr('data-nick')), $(this).attr('data-hash'));
			}
			
			catch(e) {}
			
			finally {
				return false;
			}
		});
		
		// Restore chat click events
		$('#jappix_mini div.jm_conversation').each(function() {
			chatEvents($(this).attr('data-type'), unescape($(this).attr('data-xid')), $(this).attr('data-hash'));
		});
		
		// Scroll down to the last message
		var scroll_hash = $('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');
		
		if(scroll_hash) {
			// Use a timer to override the DOM lag issue
			$(document).oneTime(10, function() {
				messageScroll(scroll_hash);
			})
		}
	}
	
	// Can auto-connect?
	else if(MINI_AUTOCONNECT)
		connect(domain, user, password);
	
	// Cannot auto-connect?
	else
		$('#jappix_mini a.jm_pane.jm_button span.jm_counter').text(_e("Chat"));
}

// Displays a given message
function displayMessage(type, body, nick, hash, time, stamp, message_type) {
	// Generate some stuffs
	var path = '#chat-' + hash;
	var escaped_nick = escape(nick);
	
	// Remove the previous message border if needed
	var last = $(path + ' div.jm_group:last');
	var last_stamp = parseInt(last.attr('data-stamp'));
	var last_b = $(path + ' b:last');
	var last_nick = last_b.attr('data-nick');
	var last_type = last.attr('data-type');
	var grouped = false;
	var header = '';
	
	if((last_nick == escaped_nick) && (message_type == last_type) && ((stamp - last_stamp) <= 1800))
		grouped = true;
	
	else {
		// Write the message date
		if(nick)
			header += '<span class="jm_date">' + time + '</span>';
		
		// Write the buddy name at the top of the message group
		if(type == 'groupchat')
			header += '<b style="color: ' + generateColor(nick) + ';" data-nick="' + escaped_nick + '">' + nick.htmlEnc() + '</b>';
		else if(nick == 'me')
			header += '<b class="jm_me" data-nick="' + escaped_nick + '">' + _e("You") + '</b>';
		else
			header += '<b class="jm_him" data-nick="' + escaped_nick + '">' + nick.htmlEnc() + '</b>';
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
	       .replace(/(:D|:-D)(\s|$)/gi, smiley('grin'));
	
	// Filter the links
	body = '<p>' + filterLinks(body, 'mini') + '</p>';
	
	// Create the message
	if(grouped)
		$('#jappix_mini #chat-' + hash + ' div.jm_received-messages div.jm_group:last').append(body);
	else
		$('#jappix_mini #chat-' + hash + ' div.jm_received-messages').append('<div class="jm_group" data-type="' + message_type + '" data-stamp="' + stamp + '">' + header + body + '</div>');
	
	// Scroll to the last element
	messageScroll(hash);
}

// Switches to a given point
function switchPane(element, hash) {
	// Hide every item
	$('#jappix_mini a.jm_pane').removeClass('jm_clicked');
	$('#jappix_mini div.jm_roster, #jappix_mini div.jm_chat-content').hide();
	
	// Show the asked element
	if(element && (element != 'roster')) {
		var current = '#jappix_mini #' + element;
		
		$(current + ' a.jm_pane').addClass('jm_clicked');
		$(current + ' div.jm_chat-content').show();
		$(current + ' input.jm_send-messages').focus();
		
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
function chat(type, xid, nick, hash, pwd) {
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
		
		// Create the HTML markup
		$('#jappix_mini div.jm_conversations').prepend(
			'<div class="jm_conversation" id="chat-' + hash + '" data-xid="' + escape(xid) + '" data-type="' + type + '" data-hash="' + hash + '" data-origin="' + escape(cutResource(xid)) + '">' + 
				'<div class="jm_chat-content">' + 
					'<div class="jm_actions">' + 
						'<span class="jm_nick">' + nick + '</span>' + 
						'<a class="jm_one-action jm_close mini-images" title="' + _e("Close") + '" href="#"></a>' + 
					'</div>' + 
					
					'<div class="jm_received-messages" id="received-' + hash + '"></div>' + 
					
					'<form action="#" method="post">' + 
						'<input type="text" class="jm_send-messages" name="body" />' + 
						'<input type="hidden" name="xid" value="' + xid + '" />' + 
						'<input type="hidden" name="type" value="' + type + '" />' + 
					'</form>' + 
				'</div>' + 
				
				'<a class="jm_pane jm_chat-tab mini-images" href="#">' + 
					'<span class="jm_name">' + nick.htmlEnc() + '</span>' + 
				'</a>' + 
			'</div>'
		);
		
		// Get the presence of this friend
		if(type != 'groupchat') {
			var selector = $('#jappix_mini a#friend-' + hash + ' span.jm_presence');
			
			// Default presence
			var show = 'available';
			
			// Read the presence
			if(selector.hasClass('jm_unavailable'))
				show = 'unavailable';
			else if(selector.hasClass('jm_chat'))
				show = 'chat';
			else if(selector.hasClass('jm_away'))
				show = 'away';
			else if(selector.hasClass('jm_xa'))
				show = 'xa';
			else if(selector.hasClass('jm_dnd'))
				show = 'dnd';
			
			// Create the presence marker
			$(current + ' a.jm_chat-tab').prepend('<span class="jm_presence mini-images jm_' + show + '"></span>');
		}
		
		// The click events
		chatEvents(type, xid, hash);
		
		// Join the groupchat
		if(type == 'groupchat') {
			// Add the nickname value
			$(current).attr('data-nick', escape(nickname));
			
			// Send the first groupchat presence
			presence('', '', '', '', xid + '/' + nickname, pwd, true, handleMUC);
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
	$(current + ' a.jm_chat-tab').click(function() {
		// Using a try/catch override IE issues
		try {
			// Not yet opened: open it!
			if(!$(this).hasClass('jm_clicked')) {
				// Show it!
				switchPane('chat-' + hash, hash);
				
				// Clear the eventual notifications
				clearNotifications(hash);
			}
			
			// Yet opened: close it!
			else
				switchPane();
		}
		
		catch(e) {}
		
		finally {
			return false;
		}
	});
	
	// Click on the close button
	$(current + ' a.jm_close').click(function() {
		// Using a try/catch override IE issues
		try {
			$(current).remove();
			
			// Quit the groupchat?
			if(type == 'groupchat') {
				// Send an unavailable presence
				presence('unavailable', '', '', '', xid + '/' + unescape($(current).attr('data-nick')));
				
				// Remove this groupchat!
				removeGroupchat(xid);
			}
		}
		
		catch(e) {}
		
		finally {
			return false;
		}
	});
	
	// Click on the chat content
	$(current + ' div.jm_received-messages').click(function() {
		$(current + ' input.jm_send-messages').focus();
	});
	
	// Focus on the chat input
	$(current + ' input.jm_send-messages').focus(function() {
		// Clear the eventual notifications
		clearNotifications(hash);
	});
}

// Shows the roster
function showRoster() {
	switchPane('roster');
	$('#jappix_mini div.jm_roster').show();
	$('#jappix_mini a.jm_button').addClass('jm_clicked');
}

// Hides the roster
function hideRoster() {
	$('#jappix_mini div.jm_roster').hide();
	$('#jappix_mini a.jm_button').removeClass('jm_clicked');
}

// Removes a groupchat from DOM
function removeGroupchat(xid) {
	// Remove the groupchat private chats & the groupchat buddies from the roster
	$('#jappix_mini div.jm_conversation[data-origin=' + escape(cutResource(xid)) + '], #jappix_mini div.jm_roster div.jm_grouped[data-xid=' + escape(xid) + ']').remove();
	
	// Update the presence counter
	updateRoster();
}

// Initializes Jappix Mini
function initialize() {
	// Update the marker
	MINI_INITIALIZED = true;
	
	// Send the initial presence
	if(!MINI_ANONYMOUS)
		presence();
}

// Displays a roster buddy
function addBuddy(xid, hash, nick, groupchat) {
	// Element
	var element = '#jappix_mini a.jm_friend#friend-' + hash;
	
	// Yet added?
	if(exists(element))
		return false;
	
	// Generate the path
	var path = '#jappix_mini div.jm_roster div.jm_buddies';
	
	// Groupchat buddy
	if(groupchat) {
		// Generate the groupchat group path
		path = '#jappix_mini div.jm_roster div.jm_grouped[data-xid=' + escape(groupchat) + ']';
		
		// Must add a groupchat group?
		if(!exists(path)) {
			$('#jappix_mini div.jm_roster div.jm_buddies').append(
				'<div class="jm_grouped" data-xid="' + escape(groupchat) + '">' + 
					'<div class="jm_name">' + getXIDNick(groupchat).htmlEnc() + '</div>' + 
				'</div>'
			);
		}
	}
	
	// Append this buddy content
	var code = '<a class="jm_friend jm_offline" id="friend-' + hash + '" data-xid="' + escape(xid) + '" data-nick="' + escape(nick) +  '" data-hash="' + hash + '" href="#"><span class="jm_presence mini-images jm_unavailable"></span>' + nick.htmlEnc() + '</a>';
	
	if(groupchat)
		$(path).append(code);
	else
		$(path).prepend(code);
	
	// Click event on this buddy
	$(element).click(function() {
		// Using a try/catch override IE issues
		try {
			chat('chat', xid, nick, hash);
		}
		
		catch(e) {}
		
		finally {
			return false;
		}
	});
	
	return true;
}

// Removes a roster buddy
function removeBuddy(hash, groupchat) {
	// Remove the buddy from the roster
	$('#jappix_mini a.jm_friend#friend-' + hash).remove();
	
	// Empty group?
	var group = '#jappix_mini div.jm_roster div.jm_grouped[data-xid=' + escape(groupchat) + ']';
	
	if(groupchat && !$(group + ' a.jm_friend').size())
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
	$('#jappix_mini div.jm_roster div.jm_buddies').css('max-height', height);
}

// Plugin launcher
function launchMini(autoconnect, show_pane, domain, user, password) {
	// Browser not taken in charge (IE6 and lower)?
	if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 7)) {
		logThis('This browser is not taken in charge (' + BrowserDetect.browser + ' ' + BrowserDetect.version + ').', 2);
		
		return false;
	}
	
	// Anonymous mode?
	if(!user || !password)
		MINI_ANONYMOUS = true;
	
	// Autoconnect?
	if(autoconnect)
		MINI_AUTOCONNECT = true;
	
	// Show pane?
	if(show_pane)
		MINI_SHOWPANE = true;
	
	// Append the mini stylesheet
	$('head').append('<link rel="stylesheet" href="' + JAPPIX_STATIC + 'php/get.php?h=none&amp;t=css&amp;g=mini.xml" type="text/css" media="all" />');
	
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
	if(BrowserDetect.browser == 'Opera')
		$(window).bind('unload', saveSession);
	else
		$(window).bind('beforeunload', saveSession);
	
	// Create the Jappix Mini DOM content
	createMini(domain, user, password);
	
	logThis('Welcome to Jappix Mini! Happy coding in developer mode!');
}
