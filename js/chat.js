/*

Jappix - An open social platform
These are the chat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/11/10

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
			name = getBuddyName(cutResource(xid));
		
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
	// Filter the XID for special chars
	xid = escapeOnEvent(xid);
	
	// Special code
	var specialAttributes, specialAvatar, specialName, specialCode, specialLink, specialDisabled, specialStyle;
	
	// Groupchat special code
	if(type == 'groupchat') {
		specialAttributes = ' data-type="groupchat" data-xid="' + xid + '"';
		specialAvatar = '';
		specialName = '<p class="bc-infos"><b>' + _e("Subject") + '</b> <span class="muc-topic">' + _e("no subject defined for this room.") + '</span></p>';
		specialCode = '<div class="content groupchat-content" id="chatContentFor' + id + '"></div><div class="list"><div class="moderator role"><p class="title">' + _e("Moderators") + '</p></div><div class="participant role"><p class="title">' + _e("Participants") + '</p></div><div class="visitor role"><p class="title">' + _e("Visitors") + '</p></div><div class="none role"><p class="title">' + _e("Others") + '</p></div></div>';
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
		specialAvatar = '<div class="avatar-container"><img class="avatar removable" src="' + './img/others/default-avatar.png' + '" alt="" /></div>';
		specialName = '<div class="bc-pep"></div><p class="bc-infos"></p>';
		specialCode = '<div class="content" id="chatContentFor' + id + '"></div>' + 
			      '<div class="chatstate">' + 
			      		'<div class="active one-chatstate">' + _e("Your friend is paying attention to the conversation.") + '</div>' + 
			      		'<div class="composing one-chatstate">' + _e("Your friend is writing a message...") + '</div>' + 
			      		'<div class="paused one-chatstate">' + _e("Your friend stopped writing a message.") + '</div>' + 
			      		'<div class="inactive one-chatstate">' + _e("Your friend is doing something else.") + '</div>' + 
			      		'<div class="gone one-chatstate">' + _e("Your friend closed the chat.") + '</div>' + 
			      '</div>';
		
		specialLink = '<a class="tools-infos tools-tooltip talk-images chat-tools-content" title="' + _e("Show user profile") + '" onclick="openUserInfos(\'' + xid + '\');"></a>';
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
	
	$('#chat-engine').append(
		'<div id="' + id + '" class="chat-engine-chan removable"' + specialAttributes + ' data-xid="' + xid + '">' + 
			'<div class="top">' + 
				specialAvatar + 
				
				'<div class="name">' + 
					'<p class="bc-name bc-name-nick">' + nick + '</p>' + 
					specialName + 
				'</div>' + 
			'</div>' + 
			
			specialCode + 
			
			'<div class="text">' + 
				'<div class="tools">' + 
					'<div class="chat-tools-content first">' + 
						'<a class="tools-smileys tools-tooltip talk-images"></a>' + 
						
						'<div class="tooltip bubble-smileys">' + 
							'<div class="tooltip-subitem">' + 
								'<p class="tooltip-right-top tooltip-insert-smiley">' + _e("Smiley insertion") + '</p>' + 
								smileyLinks(id) + 
							'</div>' + 
							
							'<div class="tooltip-subarrow talk-images"></div>' + 
						'</div>' + 
					'</div>' + 
					
					'<div class="chat-tools-content"' + specialStyle + '>' + 
						'<a class="tools-style tools-tooltip talk-images"></a>' + 
						
						'<div class="tooltip bubble-style">' + 
							'<div class="tooltip-subitem">' + 
								'<p class="tooltip-right-top">' + _e("Change style") + '</p>' + 
								'<label class="bold">' + _e("Text in bold") + '</label><input type="checkbox" class="bold" />' + 
								'<label class="italic">' + _e("Text in italic") + '</label><input type="checkbox" class="italic" />' + 
								'<label class="underline">' + _e("Underlined text") + '</label><input type="checkbox" class="underline" />' + 
								'<a class="color" style="background-color: #b10808; clear: both;" data-color="b10808"></a>' + 
								'<a class="color" style="background-color: #e5860c;" data-color="e5860c"></a>' + 
								'<a class="color" style="background-color: #f0f30e;" data-color="f0f30e"></a>' + 
								'<a class="color" style="background-color: #009a04;" data-color="009a04"></a>' + 
								'<a class="color" style="background-color: #0ba9a0;" data-color="0ba9a0"></a>' + 
								'<a class="color" style="background-color: #04228f;" data-color="04228f"></a>' + 
								'<a class="color" style="background-color: #9d0ab7;" data-color="9d0ab7"></a>' + 
								'<a class="color" style="background-color: #8a8a8a;" data-color="8a8a8a"></a>' + 
							'</div>' + 
							
							'<div class="tooltip-subarrow talk-images"></div>' + 
						'</div>' + 
					'</div>' + 
					
					'<div class="chat-tools-content">' + 
						'<a class="tools-save tools-tooltip talk-images"></a>' + 
						
						'<div class="tooltip bubble-save">' + 
							'<div class="tooltip-subitem">' + 
								'<p class="tooltip-right-top">' + _e("Save chat") + '</p>' + 
								'<p style="margin-bottom: 8px;">' + _e("Click on the following link to get the chat log, and wait. Then click again to get the file.") + '</p>' + 
								'<a class="tooltip-right-dchat" onclick="downloadChat(\'' + xid + '\');">' + _e("Generate file!") + '</a>' + 
								'<a class="tooltip-right-fchat" target="_blank">' + _e("Download file!") + '</a>' + 
							'</div>' + 
							
							'<div class="tooltip-subarrow talk-images"></div>' + 
						'</div>' + 
					'</div>' + 
					
					'<a class="tools-clear tools-tooltip talk-images chat-tools-content" title="' + _e("Clean current chat") + '" onclick="cleanChat(\'' + id + '\');"></a>' + 
					
					specialLink + 
				'</div>' + 
				
				'<textarea class="message-area" ' + specialDisabled + ' data-to="' + xid + '" /></textarea>' + 
			'</div>' + 
		'</div>'
	);
	
	// Click events
	var path = '#' + id + ' .';
	var generate_chat = $(path + 'tooltip-right-dchat');
	var download_chat = $(path + 'tooltip-right-fchat');
	
	generate_chat.click(function() {
		downloadChat(xid);
	});
	
	download_chat.click(function() {
		generate_chat.show();
		download_chat.hide();
	});
}

// Generates the chat switch elements
function generateSwitch(type, id, xid, nick) {
	// Special code
	var specialClass = ' unavailable';
	var show_close = true;
	
	if(type == 'groupchat') {
		specialClass = ' groupchat-default';
		
		if(isAnonymous())
			show_close = false;
	}
	
	// Generate the HTML code
	var html = '<div class="' + id + ' removable switcher chan" onclick="switchChan(\'' + id + '\');">' + 
			'<div class="icon talk-images' + specialClass + '"></div>' + 
			
			'<div class="name">' + nick + '</div>';
	
	// Show the close button if not MUC and not anonymous
	if(show_close)
		html += '<div class="exit" onclick="quitThisChat(\'' + escapeOnEvent(xid) + '\', \'' + id + '\', \'' + type + '\');" title="' + _e("Close this tab") + '">x</div>';
	
	// Close the HTML
	html += '</div>';
	
	// Append the HTML code
	$('#chat-switch .chans, #chat-switch .more-content').append(html);
}

// Cleans given the chat lines
function cleanChat(chat) {
	$('#chat-engine #' + chat + ' .content .one-line').remove();
	$('#chat-engine #' + chat + ' .text .message-area').focus();
}

// Creates a new chat
function chatCreate(hash, xid, nick, type) {
	logThis('New chat: ' + xid);
	
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
	tooltipIcons(hash);
	
	// The event handlers
	var inputDetect = $('#chat-engine #' + hash + ' .message-area');
	
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
