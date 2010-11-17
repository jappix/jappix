/*

Jappix - An open social platform
These are the chat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/11/10

*/

// Correctly opens a new chat
function checkChatCreate(xid, type, nickname, password, title) {
	// We generate some stuffs
	var hash = hex_md5(xid);
	var name;
	
	// Gets the name of the user/title of the room
	if(title)
		name = title;
	
	else {
		// Private groupchat chat
		if(type == 'private')
			name = thisResource(xid).htmlEnc();
		
		// XMPP-ID
		else if(xid.indexOf('@') != -1)
			name = getBuddyName(xid);
		
		// Gateway
		else
			name = xid;
	}
	
	// If the target div does not exist
	if(!exists('#' + hash)) {
		// We check the type of the chat to open
		if((type == 'chat') || (type == 'private'))
			chatCreate(hash, xid, name, type);
		
		else if(type == 'groupchat') {
			// Try to read the room stored configuration
			if(!isAnonymous() && (!nickname || !password || !title)) {
				// Catch the room data
				var fData = $(getDB('favorites', xid));
				var fNick = fData.find('nick').text();
				var fPwd = fData.find('password').text();
				var fName = fData.find('name').text();
				
				// Apply the room data
				if(!nickname && fNick)
					nickname = fNick;
				if(!password && fPwd)
					password = fPwd;
				if(!title && fName)
					name = fName;
			}
			
			groupchatCreate(hash, xid, name, nickname, password);
		}
	}
	
	// Switch to the newly-created chat
	switchChan(hash);
	
	return false;
}

// Generates the chat DOM elements
function generateChat(type, id, xid, nick) {
	// Generate some stuffs
	var path = '#' + id + ' .';
	var escaped_xid = escape(xid);
	
	// Special code
	var specialAttributes, specialAvatar, specialName, specialCode, specialLink, specialDisabled, specialStyle;
	
	// Groupchat special code
	if(type == 'groupchat') {
		specialAttributes = ' data-type="groupchat" data-xid="' + escaped_xid + '"';
		specialAvatar = '';
		specialName = '<p class="bc-infos"><b>' + _e("Subject") + '</b> <span class="muc-topic">' + _e("no subject defined for this room.") + '</span></p>';
		specialCode = '<div class="content groupchat-content" id="chat-content-' + id + '"></div><div class="list"><div class="moderator role"><p class="title">' + _e("Moderators") + '</p></div><div class="participant role"><p class="title">' + _e("Participants") + '</p></div><div class="visitor role"><p class="title">' + _e("Visitors") + '</p></div><div class="none role"><p class="title">' + _e("Others") + '</p></div></div>';
		specialLink = '<a class="tools-mucadmin tools-tooltip talk-images chat-tools-content" title="' + _e("Administration panel for this room") + '"></a>';
		specialStyle = '';
		
		// Is this a gateway?
		if(xid.match(/%/))
			specialDisabled = '';
		else
			specialDisabled = ' disabled="disabled"';
	}
	
	// Chat (or other things?!) special code
	else {
		specialAttributes = '';
		specialAvatar = '<div class="avatar-container"><img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" /></div>';
		specialName = '<div class="bc-pep"></div><p class="bc-infos"></p>';
		specialCode = '<div class="content" id="chat-content-' + id + '"></div>';
		specialLink = '<a class="tools-infos tools-tooltip talk-images chat-tools-content" title="' + _e("Show user profile") + '"></a>';
		specialStyle = ' style="display: none;"';
		specialDisabled = '';
	}
	
	// Not a groupchat private chat, we can use the buddy add icon
	if((type == 'chat') || (type == 'groupchat')) {
		var addTitle;
		
		if(type == 'chat')
			addTitle = _e("Add this contact to your friends");
		else
			addTitle = _e("Add this groupchat to your favorites");
		
		specialLink += '<a class="tools-add tools-tooltip talk-images chat-tools-content" title="' + addTitle + '"></a>';
	}
	
	// Append the chat HTML code
	$('#page-engine').append(
		'<div id="' + id + '" class="page-engine-chan chat"' + specialAttributes + ' data-xid="' + escaped_xid + '">' + 
			'<div class="top ' + id + '">' + 
				specialAvatar + 
				
				'<div class="name">' + 
					'<p class="bc-name bc-name-nick">' + nick + '</p>' + 
					specialName + 
				'</div>' + 
			'</div>' + 
			
			specialCode + 
			
			'<div class="text">' + 
				'<div class="footer">' + 
					'<div class="chat-tools-content chat-tools-smileys">' + 
						'<a class="tools-smileys tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					'<div class="chat-tools-content chat-tools-style"' + specialStyle + '>' + 
						'<a class="tools-style tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					'<div class="chat-tools-content chat-tools-save">' + 
						'<a class="tools-save tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					'<a class="tools-clear tools-tooltip talk-images chat-tools-content" title="' + _e("Clean current chat") + '"></a>' + 
					
					specialLink + 
				'</div>' + 
				
				'<div class="compose">' + 
					'<textarea class="message-area focusable" ' + specialDisabled + ' data-to="' + escaped_xid + '" /></textarea>' + 
				'</div>' + 
			'</div>' + 
		'</div>'
	);
	
	// Click event: chat cleaner
	$(path + 'tools-clear').click(function() {
		cleanChat(id);
	});
	
	// Click event: user-infos
	$(path + 'tools-infos').click(function() {
		openUserInfos(xid);
	});
}

// Generates the chat switch elements
function generateSwitch(type, id, xid, nick) {
	// Paths to the elements
	var chat_switch = '#page-switch .';
	var path = chat_switch + id;
	
	// Special code
	var specialClass = ' unavailable';
	var show_close = true;
	
	if(type == 'groupchat') {
		specialClass = ' groupchat-default';
		
		if(isAnonymous())
			show_close = false;
	}
	
	// Generate the HTML code
	var html = '<div class="' + id + ' switcher chan">' + 
			'<div class="icon talk-images' + specialClass + '"></div>' + 
			
			'<div class="name">' + nick + '</div>';
	
	// Show the close button if not MUC and not anonymous
	if(show_close)
		html += '<div class="exit" title="' + _e("Close this tab") + '">x</div>';
	
	// Close the HTML
	html += '</div>';
	
	// Append the HTML code
	$(chat_switch + 'chans, ' + chat_switch + 'more-content').append(html);
	
	// Click event: switch to this chan
	$(path).click(function() {
		switchChan(id);
	});
	
	// Click event: quit this chan
	$(path + ' .exit').click(function() {
		quitThisChat(xid, id, type);
	});
}

// Cleans given the chat lines
function cleanChat(chat) {
	$('#page-engine #' + chat + ' .content .one-line').remove();
	$('#page-engine #' + chat + ' .text .message-area').focus();
}

// Creates a new chat
function chatCreate(hash, xid, nick, type) {
	logThis('New chat: ' + xid, 3);
	
	// Create the chat content
	generateChat(type, hash, xid, nick);
	
	// Create the chat switcher
	generateSwitch(type, hash, xid, nick);
	
	// If the user is not in our buddy-list
	if((type == 'chat') && !exists('#buddy-list .buddy[data-xid=' + xid + ']')) {
		// We add a click event on the add button
		$('#' + hash + ' .tools-add').click(function() {
			// Hide the icon (to tell the user all is okay)
			$(this).hide();
			
			// Send the subscribe request
			addThisContact(xid);
		}).show();
	}
	
	// We catch the user's informations (like this avatar, vcard, and so on...)
	getUserInfos(hash, xid, nick, type);
	
	// The icons-hover functions
	tooltipIcons(xid, hash);
	
	// The event handlers
	var inputDetect = $('#page-engine #' + hash + ' .message-area');
	
	inputDetect.keypress(function(e) {
		// Enter key
		if(e.keyCode == 13) {
			// Send the message
			sendMessage(hash, 'chat');
			
			// Reset the composing database entry
			setDB('chatstate', xid, 'off');
			
			return false;
		}
	});
	
	inputDetect.keyup(function(e) {
		if(e.keyCode != 13) {
			// Composing a message
			if($(this).val() && (getDB('chatstate', xid) != 'on')) {
				// We change the state detect input
				setDB('chatstate', xid, 'on');
				
				// We send the friend a "composing" chatstate
				chatStateSend('composing', xid, hash, 'chat');
			}
			
			// Stopped composing a message
			else if(!$(this).val() && (getDB('chatstate', xid) == 'on')) {
				// We change the state detect input
				setDB('chatstate', xid, 'off');
				
				// We send the friend an "active" chatstate
				chatStateSend('active', xid, hash, 'chat');
			}
		}
	});
	
	inputDetect.change(function() {
		// Reset the composing database entry
		setDB('chatstate', xid, 'off');
	});
	
	inputDetect.focus(function() {
		// We clean the current notifications
		chanCleanNotify(hash);
		
		// Nothing in the input, user is active
		if(!inputDetect.val())
			chatStateSend('active', xid, hash, 'chat');
		
		// Something was written, user started writing again
		else
			chatStateSend('composing', xid, hash, 'chat');
	});
	
	inputDetect.blur(function() {
		// Nothing in the input, user is inactive
		if(!inputDetect.val())
			chatStateSend('inactive', xid, hash, 'chat');
		
		// Something was written, user paused
		else
			chatStateSend('paused', xid, hash, 'chat');
	});
}
