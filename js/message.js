/*

Jappix - An open social platform
These are the messages JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda
Contact: http://project.jappix.com/contact
Last revision: 05/12/10

*/

// Handles the incoming message packets
function handleMessage(message) {
	// Error packet? Stop!
	if(handleErrorReply(message))
		return;
	
	// We get the message items
	var from = fullXID(getStanzaFrom(message));
	var type = message.getType();
	var body = message.getBody();
	var node = message.getNode();
	var subject = message.getSubject();
	
	// We generate some values
	var xid = bareXID(from);
	var resource = thisResource(from);
	var hash = hex_md5(xid);
	var xHTML = $(node).find('html body').size();
	var GCUser = false;
	
	// This message comes from a groupchat user
	if(isPrivate(xid) && (type == 'chat') && resource) {
		GCUser = true;
		xid = from;
		hash = hex_md5(xid);
	}
	
	// Get message date
	var time, stamp, d_stamp;
	
	// Read the delay
	var delay = readMessageDelay(node);
	
	// Any delay?
	if(delay) {
		time = relativeDate(delay);
		d_stamp = Date.jab2date(delay);
	}
	
	// No delay: get actual time
	else {
		time = getCompleteTime();
		d_stamp = new Date();
	}
	
	// Get the date stamp
	stamp = extractStamp(d_stamp);
	
	// Chatstate message
	if(node && ((type == 'chat') || !type)) {
		/* REF: http://xmpp.org/extensions/xep-0085.html */
		
		// Do something depending of the received state
		if($(node).find('active').size()) {
			displayChatState('active', hash);
			
			// Tell Jappix the entity supports chatstates
			$('#' + hash + ' .message-area').addClass('chatstates');
			
			logThis('Active chatstate received from: ' + from);
		}
		
		else if($(node).find('composing').size())
			displayChatState('composing', hash);
		
		else if($(node).find('paused').size())
			displayChatState('paused', hash);
		
		else if($(node).find('inactive').size())
			displayChatState('inactive', hash);
		
		else if($(node).find('gone').size())
			displayChatState('gone', hash);
	}
	
	// Invite message
	if($(node).find('x[xmlns=' + NS_MUC_USER + '] invite').size()) {
		// We get the needed values
		var iFrom = $(node).find('x[xmlns=' + NS_MUC_USER + '] invite').attr('from');
		var iRoom = $(node).find('x[xmlns=' + NS_XCONFERENCE + ']').attr('jid');
		
		// Old invite method?
		if(!iRoom)
			iRoom = from;
		
		// We display the notification
		newNotification('invite/room', iFrom, [iRoom], body);
		
		return false;
	}
	
	// Request message
	if(message.getChild('confirm', NS_HTTP_AUTH)) {
		// Open a new notification
		newNotification('request', xid, [message], body);
		
		return false;
	}
	
	// Normal messages
	if((type == 'normal') && body) {
		// Message date
		var messageDate = delay;
		
		// No message date?
		if(!messageDate)
			messageDate = getXMPPTime('utc');
		
		// Message ID
		var messageID = hex_md5(xid + subject + messageDate);
		
		// Attached message file
		var msg_file = $(node).find('x[xmlns=' + NS_X_ATTACH + '] file:first');
		var msg_file_arr = [
				    msg_file.attr('name'),
				    msg_file.attr('url'),
				    msg_file.attr('type'),
				    msg_file.attr('ext')
				   ];
		
		// We store the received message
		storeInboxMessage(xid, subject, body, 'unread', messageID, messageDate, msg_file_arr);
		
		// Display the inbox message
		if(exists('#inbox'))
			displayInboxMessage(xid, subject, body, 'unread', messageID, messageDate, msg_file_arr);
		
		// Check we have new messages (play a sound if any unread messages)
		if(checkInboxMessages())
			soundPlay(2);
		
		// Send it to the server
		storeInbox();
		
		return false;
	}
	
	// PubSub event
	if($(node).find('event').attr('xmlns') == NS_PUBSUB_EVENT) {
		// We get the needed values
		var iParse = $(node).find('event items');
		var iNode = iParse.attr('node');
		
		// Turn around the different result cases
		if(iNode) {
			switch(iNode) {
				// Mood
				case NS_MOOD:
					// Retrieve the values
					var iMood = iParse.find('mood');
					var fValue = '';
					var tText = '';
					
					// There's something
					if(iMood.children().size()) {
						fValue = node.getElementsByTagName('mood').item(0).childNodes.item(0).nodeName;
						tText = iMood.find('text').text();
					}
					
					// Store the PEP event (and display it)
					storePEP(xid, 'mood', fValue, tText);
					
					break;
				
				// Activity
				case NS_ACTIVITY:
					// Retrieve the values
					var iActivity = iParse.find('activity');
					var fValue = '';
					var tText = '';
					
					// There's something
					if(iActivity.children().size()) {
						fValue = node.getElementsByTagName('activity').item(0).childNodes.item(0).nodeName;
						var sValue = node.getElementsByTagName(fValue).item(0).childNodes.item(0).nodeName;
						
						if(sValue && fValue)
							fValue = fValue + '/' + sValue;
						
						tText = iActivity.find('text').text();
						
						if(!fValue)
							fValue = '';
					}
					
					// Store the PEP event (and display it)
					storePEP(xid, 'activity', fValue, tText);
					
					break;
				
				// Tune
				case NS_TUNE:
					// Retrieve the values
					var iTune = iParse.find('tune');
					var tArtist = iTune.find('artist').text();
					var tSource = iTune.find('source').text();
					var tTitle = iTune.find('title').text();
					
					// Store the PEP event (and display it)
					storePEP(xid, 'tune', tArtist, tTitle, tSource);
					
					break;
				
				// Geolocation
				case NS_GEOLOC:
					// Retrieve the values
					var iGeoloc = iParse.find('geoloc');
					var tLat = iGeoloc.find('lat').text();
					var tLon = iGeoloc.find('lon').text();
					
					// Any extra-values?
					var tLocality = iGeoloc.find('locality').text();
					var tCountry = iGeoloc.find('country').text();
					var tHuman = '';
					
					// Build an human-readable location string
					if(tLocality && tCountry)
						tHuman = tLocality + ' (' + tCountry + ')';
					else if(tLocality && !tCountry)
						tHuman = tLocality;
					else if(tCountry && !tLocality)
						tHuman = tCountry;
					
					// Store the PEP event (and display it)
					storePEP(xid, 'geoloc', tLat, tLon, tHuman);
					
					break;
				
				// Microblog
				case NS_URN_MBLOG:
					displayMicroblog(message, xid, hash, 'mixed');
					
					break;
			}
		}
		
		return false;
	}
	
	// If this is a room topic message
	if(subject && (type == 'groupchat')) {
		// Filter the vars
		var filteredSubject = filterThisMessage(subject, resource, true);
		var filteredName = resource.htmlEnc();
		
		// Display the new subject at the top
		$('#' + hash + ' .top .name .bc-infos .muc-topic').replaceWith('<span class="muc-topic" title="' + subject + '">' + filteredSubject + '</span>');
		
		// Display the new subject as a system message
		if(resource) {
			var topic_body = filteredName + ' ' + _e("changed the subject to:") + ' ' + filteredSubject;
			displayMessage(type, from, hash, filteredName, topic_body, time, stamp, 'system-message', false);
		}
		
		// Scroll to this subject
		autoScroll(hash);
	}
	
	// If the message has a content
	if(xHTML || body) {
		var filteredMessage;
		var notXHTML = true;
		
		//If this is a xHTML message
		if(xHTML) {
			notXHTML = false;
			
			// Filter the xHTML message
			body = filterThisXHTML(node);
		}
		
		// Groupchat message
		if(type == 'groupchat') {
			/* REF: http://xmpp.org/extensions/xep-0045.html */
			
			// We generate the message type and time
			var message_type = 'user-message';
			
			// This is an old message
			if(delay && resource)
				message_type = 'old-message';
			
			// This is a system message
			else if(!resource)
				message_type = 'system-message';
			
			var nickQuote = '';
			
			// If this is not an old message
			if(message_type == 'user-message') {
				var myNick = getMUCNick(hash);
				
				// If an user quoted our nick (with some checks)
				var regex = new RegExp('((^)|( )|(@))' + escapeRegex(myNick) + '(($)|(:)|(,)|( ))', 'gi');
				
				if(body.match(regex) && (myNick != resource) && (message_type == 'user-message') && !isAnonymous())
					nickQuote = ' my-nick';
				
				// We notify the user if there's a new personnal message
				if(nickQuote) {
					messageNotify(hash, 'personnal');
					soundPlay(1);
				}
				
				// We notify the user there's a new unread muc message
				messageNotify(hash, 'unread');
			}
			
			// Display the received message
			displayMessage(type, from, hash, resource.htmlEnc(), body, time, stamp, message_type, notXHTML, nickQuote);
			
			// Scroll to the last message
			autoScroll(hash);
		}
		
		// Chat message
		else {
			// Gets the nickname of the user
			var fromName = resource;
			var chatType = 'chat';
			
			// It does not come from a groupchat user, get the full name
			if(!GCUser)
				fromName = getBuddyName(xid).htmlEnc();
			else
				chatType = 'private';
			
			// If the chat isn't yet opened, open it !
			if(!exists('#' + hash)) {
				// We create a new chat
				chatCreate(hash, xid, fromName, chatType);
				
				// We tell the user that a new chat has started
				soundPlay(0);
			}
			
			else
				soundPlay(1);
			
			// Display the received message
			displayMessage(type, xid, hash, fromName.htmlEnc(), body, time, stamp, 'user-message', notXHTML, '', 'him');
			
			// We notify the user
			messageNotify(hash, 'personnal');
			
			// Scroll to the last message
			autoScroll(hash);
		}
		
		return false;
	}
	
	return false;
}

// Sends a given message
function sendMessage(id, type) {
	// Get the values
	var message_area = $('#' + id + ' .message-area');
	var body = message_area.val();
	var xid = unescape(message_area.attr('data-to'));
	
	// If the user didn't entered any message, stop
	if(!body || !xid)
		return false;
	
	try {
		// We send the message through the XMPP network
		var aMsg = new JSJaCMessage();
		aMsg.setTo(xid);
		
		// /clear shortcut
		if(body.match(/^\/clear/))
			cleanChat(hex_md5(xid));
		
		// /join shortcut
		else if(body.match(/^\/join (\S+)\s*(.*)/)) {
			// Join
			var room = generateXID(RegExp.$1, 'groupchat');
			var pass = RegExp.$2;
			
			checkChatCreate(room, 'groupchat');
		}
		
		// /part shortcut
		else if(body.match(/^\/part\s*(.*)/) && (!isAnonymous() || (isAnonymous() && (type != 'groupchat'))))
			quitThisChat(xid, hex_md5(xid), type);
		
		// /whois shortcut
		else if(body.match(/^\/whois(( (\S+))|($))/)) {
			var whois_xid = RegExp.$3;
			
			// Groupchat WHOIS
			if(type == 'groupchat') {
				var nXID = getMUCUserXID(xid, whois_xid);
				
				if(!nXID)
					openThisInfo(6);
				else
					openUserInfos(nXID);
			}
			
			// Chat or private WHOIS
			else {
				if(!whois_xid)
					openUserInfos(xid);
				else
					openUserInfos(whois_xid);
			}
		}
		
		// Chat message type
		else if(type == 'chat') {
			aMsg.setType('chat');
			
			// Generates the correct message depending of the choosen style
			var notXHTML = true;
			var genMsg = generateMessage(aMsg, body, id);
			
			if(genMsg == 'XHTML')
				notXHTML = false;
			
			aMsg.appendNode('active', {'xmlns': NS_CHATSTATES});
			con.send(aMsg, handleErrorReply);
			
			// Filter the xHTML message (for us!)
			if(!notXHTML)
				body = filterThisXHTML(aMsg.getNode());
			
			// Finally we display the message we just sent
			var my_xid = getXID();
			
			displayMessage('chat', my_xid, id, getBuddyName(my_xid).htmlEnc(), body, getCompleteTime(), getTimeStamp(), 'user-message', notXHTML, '', 'me');
			
			// Scroll to the last message
			autoScroll(id);
		}
		
		// Groupchat message type
		else if(type == 'groupchat') {
			// /say shortcut
			if(body.match(/^\/say (.+)/)) {
				body = body.replace(/^\/say (.+)/, '$1');
				
				aMsg.setType('groupchat');
				generateMessage(aMsg, body, id);
				
				con.send(aMsg, handleErrorReply);
			}
			
			// /nick shortcut
			else if(body.match(/^\/nick (.+)/)) {
				var nick = body.replace(/^\/nick (.+)/, '$1');
				
				// Get our old presence status
				var show = $('.change-presence').val();
				var status = $('.textPresence').val();
				
				// Send a new presence
				sendPresence(xid + '/' + nick, '', show, status, '', false, false, handleErrorReply);
				
				// Change the stored nickname
				$('#' + hex_md5(xid)).attr('data-nick', escape(nick));
			}
			
			// /msg shortcut
			else if(body.match(/^\/msg (\S+)\s+(.+)/)) {
				var nick = RegExp.$1;
				var body = RegExp.$2;
				var nXID = getMUCUserXID(xid, nick);
				
				// We check if the user to kick exists
				if(!nXID)
					openThisInfo(6);
				
				// If the private message is not empty
				else if(body) {
					aMsg.setType('chat');
					aMsg.setTo(xid);
					generateMessage(aMsg, body, id);
					
					con.send(aMsg, handleErrorReply);
				}
			}
			
			// /topic shortcut
			else if(body.match(/^\/topic (.+)/)) {
				var topic = body.replace(/^\/topic (.+)/, '$1');
				
				aMsg.setType('groupchat');
				aMsg.setSubject(topic);
				
				con.send(aMsg, handleMessageError);
			}
			
			// /ban shortcut
			else if(body.match(/^\/ban (\S+)\s*(.*)/)) {
				var nick = RegExp.$1;
				var reason = RegExp.$2;
				var nXID = getMUCUserRealXID(xid, nick);
				
				// We check if the user to ban exists
				if(!nXID)
					openThisInfo(6);
				
				else {
					// We generate the ban IQ
					var iq = new JSJaCIQ();
					iq.setTo(xid);
					iq.setType('set');
					
					var iqQuery = iq.setQuery(NS_MUC_ADMIN);
					var item = iqQuery.appendChild(iq.buildNode('item', {'affiliation': 'outcast', 'jid': nXID, 'xmlns': NS_MUC_ADMIN}));
					
					if(reason)
						item.appendChild(iq.buildNode('reason', {'xmlns': NS_MUC_ADMIN}, reason));
					
					con.send(iq, handleErrorReply);
				}
			}
			
			// /kick shortcut
			else if(body.match(/^\/kick (\S+)\s*(.*)/)) {
				var nick = RegExp.$1;
				var reason = RegExp.$2;
				var nXID = getMUCUserXID(xid, nick);
				
				// We check if the user to kick exists
				if(!nXID)
					openThisInfo(6);
				
				else {
					// We generate the kick IQ
					var iq = new JSJaCIQ();
					iq.setTo(xid);
					iq.setType('set');
					
					var iqQuery = iq.setQuery(NS_MUC_ADMIN);
					var item = iqQuery.appendChild(iq.buildNode('item', {'nick': nick, 'role': 'none', 'xmlns': NS_MUC_ADMIN}));
					
					if(reason)
						item.appendChild(iq.buildNode('reason', {'xmlns': NS_MUC_ADMIN}, reason));
					
					con.send(iq, handleErrorReply);
				}
			}
			
			// /invite shortcut
			else if(body.match(/^\/invite (\S+)\s*(.*)/)) {
				var xid = RegExp.$1;
				var reason = RegExp.$2;
				
				var x = aMsg.appendNode('x', {'xmlns': NS_MUC_USER});
				var aNode = x.appendChild(aMsg.buildNode('invite', {'to': xid, 'xmlns': NS_MUC_USER}));
				
				if(reason)
					aNode.appendChild(aMsg.buildNode('reason', {'xmlns': NS_MUC_USER}, reason));
				
				con.send(aMsg, handleErrorReply);
			}
			
			// No shortcut, this is a message
			else {
				aMsg.setType('groupchat');
				generateMessage(aMsg, body, id);
				
				con.send(aMsg, handleMessageError);
			}
		}
		
		// We reset the message input
		$('#' + id + ' .message-area').val('');
	}
	
	finally {
		logThis('Message sent to: ' + xid + ' / ' + type, 3);
		
		return false;
	}
}

// Generates the correct message area style
function generateStyle(id) {
	// Initialize the vars
	var styles = '#' + id + ' div.bubble-style';
	var checkbox = styles + ' input[type=checkbox]:checked';
	var color = styles + ' a.color.selected';
	var style = '';
	
	// Loop the input values
	$(checkbox).each(function() {
		// If there is a previous element
		if(style)
			style += ' ';
		
		// Get the current style
		switch($(this).attr('class')) {
			case 'bold':
				style += 'font-weight: bold;';
				break;
			
			case 'italic':
				style += 'font-style: italic;';
				break;
			
			case 'underline':
				style += 'text-decoration: underline;';
				break;
		}
	});
	
	// Get the color value
	$(color).each(function() {
		style += 'color: #' + $(this).attr('data-color');
	});
	
	return style;
}

// Generates the correct message code
function generateMessage(aMsg, body, id) {
	// Create the classical body
	aMsg.setBody(body);
	
	// Get the style
	var style = $('#' + id + ' .message-area').attr('style');
	
	// A message style is choosen
	if(style) {
		// Explode the message body new lines (to create one <p /> element by line)
		var new_lines = new Array(body);
		
		if(body.match(/\n/))
			new_lines = body.split('\n');
		
		// Create the XML elements
		var aHtml = aMsg.appendNode('html', {'xmlns': NS_XHTML_IM});
		var aBody = aHtml.appendChild(aMsg.buildNode('body', {'xmlns': NS_XHTML}));
		
		// Use the exploded body array to create one element per entry
		for(i in new_lines) {
			// Current line
			var cLine = new_lines[i];
			
			// Blank line, we put a <br />
			if(cLine.match(/(^)(\s+)($)/) || !cLine)
				aBody.appendChild(aMsg.buildNode('br', {'xmlns': NS_XHTML}));
			
			// Line with content, we put a <p />
			else {
				// HTML encode the line
				cLine = cLine.htmlEnc();
				
				// Filter the links
				cLine = filterLinks(cLine, 'xhtml-im', style);
				
				// Append the filtered line
				$(aBody).append($('<p style="' + style + '">' + cLine + '</p>'));
			}
		}
		
		return 'XHTML';
	}
	
	return 'PLAIN';
}

// Displays a given message in a chat tab
function displayMessage(type, xid, hash, name, body, time, stamp, message_type, is_xhtml, nick_quote, mode) {
	// Generate some stuffs
	var has_avatar = false;
	var xid_hash = '';
	var escaped_name = escape(name);
	
	if(!nick_quote)
		nick_quote = '';
	
	if(message_type != 'system-message') {
		has_avatar = true;
		xid_hash = hex_md5(xid);
	}
	
	// Filter the message
	var filteredMessage = filterThisMessage(body, name, is_xhtml);
	
	// Display the received message in the room
	var messageCode = '<div class="one-line last ' + xid_hash + ' ' + message_type + nick_quote + '" data-type="' + message_type + '" data-stamp="' + stamp + '">';
	
	// Name color attribute
	if(type == 'groupchat')
		attribute = ' style="color: ' + generateColor(name) + ';" class="name';
	else
		attribute = ' class="name ' + mode;
	
	// Close the class attribute
	if(message_type == 'system-message')
		attribute += ' hidden"';
	else
		attribute += '"';
	
	// Filter the previous displayed message
	var one_line = '#' + hash + ' .one-line';
	var last = $(one_line + ':last');
	var first_last = $(one_line + ':has(b.name):last');
	var last_name = $(one_line + ' b:last').attr('data-name');
	var last_type = first_last.attr('data-type');
	var last_stamp = parseInt(first_last.attr('data-stamp'));
	
	if((last_name == escaped_name) && (message_type == last_type) && ((stamp - last_stamp) <= 1800)) {
		last.removeClass('last');
		
		// No need to get the avatar
		has_avatar = false;
	}
	
	else {
		// Any avatar to add?
		if(has_avatar)
			messageCode += '<div class="avatar-container"><img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" /></div>';
		
		messageCode += '<span class="date">' + time + '</span><b data-name="' + escaped_name + '" ' + attribute + '>' + name + '</b>';
	}
	
	// Is it a /me command?
	if(body.match(/(^|>)(\/me )([^<]+)/))
		filteredMessage = '<i>' + filteredMessage + '</i>';
	
	messageCode += filteredMessage + '</div>';
	
	// Write the code in the DOM
	$('#' + hash + ' .content').append(messageCode);
	
	// Must get the avatar?
	if(has_avatar && xid)
		getAvatar(xid, 'cache', 'true', 'forget');
}
