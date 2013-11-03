/*

Jappix - An open social platform
These are the chat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Eric, Maranda
Last revision: 16/08/13

*/

// Correctly opens a new chat
function checkChatCreate(xid, type, nickname, password, title) {
	// No XID?
	if(!xid)
		return false;
	
	// We generate some stuffs
	var hash = hex_md5(xid);
	var name;
	
	// Gets the name of the user/title of the room
	if(title)
		name = title;
	
	else {
		// Private groupchat chat
		if(type == 'private')
			name = thisResource(xid);
		
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
				var fData = $(XMLFromString(getDB(DESKTOP_HASH, 'favorites', xid)));
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
	var specialAttributes, specialAvatar, specialName, specialCode, specialLink, specialDisabled, specialStyle, specialMAM;
	
	// Groupchat special code
	if(type == 'groupchat') {
		specialAttributes = ' data-type="groupchat"';
		specialAvatar = '';
		specialName = '<p class="bc-infos"><b>' + _e("Subject") + '</b> <span class="muc-topic">' + _e("no subject defined for this room.") + '</span></p>';
		specialCode = '<div class="content groupchat-content" id="chat-content-' + id + '"></div><div class="list"><div class="moderator role"><p class="title">' + _e("Moderators") + '</p></div><div class="participant role"><p class="title">' + _e("Participants") + '</p></div><div class="visitor role"><p class="title">' + _e("Visitors") + '</p></div><div class="none role"><p class="title">' + _e("Others") + '</p></div></div>';
		specialLink = '<a href="#" class="tools-mucadmin tools-tooltip talk-images chat-tools-content" title="' + _e("Administration panel for this room") + '"></a>';
		specialStyle = '';
		
		// Is this a gateway?
		if(xid.match(/%/))
			specialDisabled = '';
		else
			specialDisabled = ' disabled=""';
	}
	
	// Chat (or other things?!) special code
	else {
		specialMAM = '<div class="wait-mam wait-small"></div>';
		specialAttributes = ' data-type="chat"';
		specialAvatar = '<div class="avatar-container"><img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" /></div>';
		specialName = '<div class="bc-pep"></div><p class="bc-infos"><span class="unavailable show talk-images"></span></p>';
		specialCode = '<div class="content" id="chat-content-' + id + '">' + specialMAM + '</div>';
		specialLink = '<a href="#" class="tools-jingle-audio tools-tooltip talk-images chat-tools-content" title="' + _e("Call (audio only)") + '"></a>'
		            + '<a href="#" class="tools-jingle-video tools-tooltip talk-images chat-tools-content" title="' + _e("Call (video)") + '"></a>'
		            + '<a href="#" class="tools-infos tools-tooltip talk-images chat-tools-content" title="' + _e("Show user profile") + '"></a>';
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
		
		specialLink += '<a href="#" class="tools-add tools-tooltip talk-images chat-tools-content" title="' + addTitle + '"></a>';
	}
	
	// IE DOM parsing bug fix
	var specialStylePicker = '<div class="chat-tools-content chat-tools-style"' + specialStyle + '>' + 
					'<a href="#" class="tools-style tools-tooltip talk-images"></a>' + 
				 '</div>';
	
	if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9))
		specialStylePicker = '';
	
	// Append the chat HTML code
	$('#page-engine').append(
		'<div id="' + id + '" class="page-engine-chan chat one-counter"' + specialAttributes + ' data-xid="' + escaped_xid + '">' + 
			'<div class="top ' + id + '">' + 
				specialAvatar + 
				
				'<div class="name">' + 
					'<p class="bc-name bc-name-nick">' + nick.htmlEnc() + '</p>' + 
					specialName + 
				'</div>' + 
			'</div>' + 
			
			specialCode + 
			
			'<div class="text">' + 
				'<div class="footer">' + 
					'<div class="chat-tools-content chat-tools-smileys">' + 
						'<a href="#" class="tools-smileys tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					specialStylePicker + 
					
					'<div class="chat-tools-content chat-tools-file">' + 
						'<a href="#" class="tools-file tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					'<div class="chat-tools-content chat-tools-save">' + 
						'<a href="#" class="tools-save tools-tooltip talk-images"></a>' + 
					'</div>' + 
					
					'<a href="#" class="tools-clear tools-tooltip talk-images chat-tools-content" title="' + _e("Clean current chat") + '"></a>' + 
					
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

	// Click event: call (audio)
	$(path + 'tools-jingle-audio').click(function() {
		Jingle.start(xid, 'audio');
	});

	// Click event: call (video)
	$(path + 'tools-jingle-video').click(function() {
		Jingle.start(xid, 'video');
	});
	
	// Click event: user-infos
	$(path + 'tools-infos').click(function() {
		openUserInfos(xid);
	});
}

// Generates the chat switch elements
function generateSwitch(type, id, xid, nick) {
	// Path to the element
	var chat_switch = '#page-switch .';
	
	// Special code
	var specialClass = ' unavailable';
	var show_close = true;
	
	// Groupchat
	if(type == 'groupchat') {
		specialClass = ' groupchat-default';
		
		if(isAnonymous() && (xid == generateXID(ANONYMOUS_ROOM, 'groupchat')))
			show_close = false;
	}
	
	// Generate the HTML code
	var html = '<div class="' + id + ' switcher chan" onclick="return switchChan(\'' + encodeOnclick(id) + '\')">' + 
			'<div class="icon talk-images' + specialClass + '"></div>' + 
			
			'<div class="name">' + nick.htmlEnc() + '</div>';
	
	// Show the close button if not MUC and not anonymous
	if(show_close)
		html += '<div class="exit" title="' + _e("Close this tab") + '" onclick="return quitThisChat(\'' + encodeOnclick(xid) + '\', \'' + encodeOnclick(id) + '\', \'' + encodeOnclick(type) + '\');">x</div>';
	
	// Close the HTML
	html += '</div>';
	
	// Append the HTML code
	$(chat_switch + 'chans, ' + chat_switch + 'more-content').append(html);
}

// Cleans given the chat lines
function cleanChat(chat) {
	// Remove the messages
	$('#page-engine #' + chat + ' .content .one-group').remove();
	
	// Clear the history database
	removePersistent(getXID(), 'history', chat);
	
	// Focus again
	$(document).oneTime(10, function() {
		$('#page-engine #' + chat + ' .text .message-area').focus();
	});
}

// Creates a new chat
function chatCreate(hash, xid, nick, type) {
	Console.info('New chat: ' + xid);
	
	// Create the chat content
	generateChat(type, hash, xid, nick);
	
	// Create the chat switcher
	generateSwitch(type, hash, xid, nick);
	
	// If the user is not in our buddy-list
	if(type == 'chat') {
		// MAM? Get archives from there!
		if(enabledMAM()) {
			getArchivesMAM({
				'with': xid
			}, {
				'max': MAM_REQ_MAX,
				'before': ''
			});
		} else {
			// Restore the chat history
			var chat_history = getPersistent(getXID(), 'history', hash);
			
			if(chat_history) {
				// Generate hashs
				var my_hash = hex_md5(getXID());
				var friend_hash = hex_md5(xid);
				
				// Add chat history HTML
				$('#' + hash + ' .content').append(chat_history);
				
				// Filter old groups & messages
				$('#' + hash + ' .one-group[data-type="user-message"]').addClass('from-history').attr('data-type', 'old-message');
				$('#' + hash + ' .user-message').removeClass('user-message').addClass('old-message');
				
				// Regenerate user names
				$('#' + hash + ' .one-group.' + my_hash + ' b.name').text(getBuddyName(getXID()));
				$('#' + hash + ' .one-group.' + friend_hash + ' b.name').text(getBuddyName(xid));
				
				// Regenerate group dates
				$('#' + hash + ' .one-group').each(function() {
					var current_stamp = parseInt($(this).attr('data-stamp'));
					$(this).find('span.date').text(relativeDate(current_stamp));
				});
				
				// Regenerate avatars
				if(exists('#' + hash + ' .one-group.' + my_hash + ' .avatar-container'))
					getAvatar(getXID(), 'cache', 'true', 'forget');
				if(exists('#' + hash + ' .one-group.' + friend_hash + ' .avatar-container'))
					getAvatar(xid, 'cache', 'true', 'forget');
			}
		}

		// Add button
		if(!exists('#buddy-list .buddy[data-xid="' + escape(xid) + '"]'))
			$('#' + hash + ' .tools-add').click(function() {
				// Hide the icon (to tell the user all is okay)
				$(this).hide();
				
				// Send the subscribe request
				addThisContact(xid, nick);
			}).show();
	}
	
	// We catch the user's informations (like this avatar, vcard, and so on...)
	getUserInfos(hash, xid, nick, type);
	
	// The icons-hover functions
	tooltipIcons(xid, hash);
	
	// The event handlers
	var inputDetect = $('#page-engine #' + hash + ' .message-area');
	
	inputDetect.focus(function() {
		// Clean notifications for this chat
		chanCleanNotify(hash);
		
		// Store focus on this chat!
		CHAT_FOCUS_HASH = hash;
	});
	
	inputDetect.blur(function() {
		// Reset storage about focus on this chat!
		if(CHAT_FOCUS_HASH == hash)
			CHAT_FOCUS_HASH = null;
	});
	
	inputDetect.keypress(function(e) {
		// Enter key
		if(e.keyCode == 13) {
			// Add a new line
			if(e.shiftKey || e.ctrlKey) {
				inputDetect.val(inputDetect.val() + '\n');
			} else {
				// Send the message
				sendMessage(hash, 'chat');
				
				// Reset the composing database entry
				setDB(DESKTOP_HASH, 'chatstate', xid, 'off');
			}
			
			return false;
		}
	});

	// Scroll in chat content
	$('#page-engine #' + hash + ' .content').scroll(function() {
		var self = this;

		if(enabledMAM() && !(xid in MAM_MAP_PENDING)) {
			var has_state = xid in MAM_MAP_STATES;
			var rsm_count = has_state ? MAM_MAP_STATES[xid]['rsm']['count'] : 1;
			var rsm_before = has_state ? MAM_MAP_STATES[xid]['rsm']['first'] : '';

			// Request more archives?
			if(rsm_count > 0 && $(this).scrollTop() < MAM_SCROLL_THRESHOLD) {
				var was_scroll_top = $(self).scrollTop() <= 32;
				var wait_mam = $('#' + hash).find('.wait-mam');
				wait_mam.show();

				getArchivesMAM({
					'with': xid
				}, {
					'max': MAM_REQ_MAX,
					'before': rsm_before
				}, function() {
					var wait_mam_height = was_scroll_top ? 0 : wait_mam.height();
					wait_mam.hide();

					// Restore scroll?
					if($(self).scrollTop() < MAM_SCROLL_THRESHOLD) {
						var sel_mam_chunk = $(self).find('.mam-chunk:first');

						var cont_padding_top = parseInt($(self).css('padding-top').replace(/[^-\d\.]/g, ''));
						var cont_one_group_margin_bottom = parseInt(sel_mam_chunk.find('.one-group:last').css('margin-bottom').replace(/[^-\d\.]/g, ''));
						var cont_mam_chunk_height = sel_mam_chunk.height();

						$(self).scrollTop(wait_mam_height + cont_padding_top + cont_one_group_margin_bottom + cont_mam_chunk_height);
					}
				});
			}
		}
	});
	
	// Chatstate events
	eventsChatState(inputDetect, xid, hash, 'chat');
}