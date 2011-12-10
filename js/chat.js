/*

Jappix - An Open μSocial Platform
These are the chat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function switcherScroll() {
	if($('#chat-switch .switcher').length > 9)
		$('#chat-switch .channels').addClass('chan-scroll');
	else
		$('#chat-switch .channels').removeClass('chan-scroll');
}

function checkChatCreate(sendToJID, typeOfChat) {
	// Can open a new chat
	if(!isAnonymous() || typeOfChat == 'groupchat') {
		// We generate some stuffs
		var sendToJIDDIVHashable = sendToJID + '';
		var sendToJIDDIVHash = hex_md5(sendToJIDDIVHashable);
		var noHashSendToJIDDIV = sendToJID;
		
		// Gets the nickname of the user
		var splittingJID = noHashSendToJIDDIV + '';
		var messageToNick = splittingJID;
		
		if(messageToNick.indexOf('@') != -1)
			messageToNick = splittingJID.split('@')[0];
		
		// Check if the target div exists, so that the script will not create a new one !
		var DIVtoJIDHash = '#' + sendToJIDDIVHash;
		
		if(!exists(DIVtoJIDHash)) {
			// We check the type of the chat to open
			if(typeOfChat == 'chat')
				chatCreate(sendToJIDDIVHash, noHashSendToJIDDIV, messageToNick);
			else if(typeOfChat == 'groupchat')
				groupchatCreate(sendToJIDDIVHash, noHashSendToJIDDIV, messageToNick);
		}
		
		switchChan(sendToJIDDIVHash);
	}
}

function generateChat(type, id, jid, nick) {
	// Special code
	var specialName, specialClass, specialCode, specialLink;
	
	if(type == 'groupchat') {
		specialName = '<p class="bc-infos"><b>' + _e(106) + '</b> <span class="muc-topic">' + _e(107) + '</span></p>';
		specialClass = ' tools-muc-close';
		specialCode = '<div class="content groupchat-content" id="chatContentFor' + id + '"><div class="thisFalseDivIsForJQuery"></div></div><div class="list"><div class="moderator"><p class="title">' + _e(102) + '</p></div><div class="participant"><p class="title">' + _e(103) + '</p></div><div class="visitor"><p class="title">' + _e(104) + '</p></div><div class="none"><p class="title">' + _e(64) + '</p></div></div>';
		specialLink = '<div class="chat-tools-content"><a class="tools-mucadmin tools-tooltip talk-images" title="' + _e(105) + '"></a></div>';
	}
	
	else {
		specialName = '<div class="bc-pep"></div><p class="bc-infos"></p>';
		specialClass = '';
		specialCode = '<div class="content" id="chatContentFor' + id + '"><div class="thisFalseDivIsForJQuery"></div></div><div class="chatstate"><div class="composing one-chatstate">' + _e(89) + '</div><div class="paused one-chatstate">' + _e(90) + '</div><div class="inactive one-chatstate">' + _e(91) + '</div><div class="gone one-chatstate">' + _e(92) + '</div></div>';
		specialLink = '<div class="chat-tools-content"><a class="tools-infos tools-tooltip talk-images" title="' + _e(99) + '" onclick="openUserInfos(\'' + jid + '\');"></a></div><div class="chat-tools-content"><a class="tools-add tools-tooltip talk-images" title="' + _e(100) + '"></a></div>';
	}
	
	$('#chat-engine').prepend(
		'<div id="' + id + '" class="chat-engine-chan removable">' + 
			'<div class="top">' + 
				'<div class="avatar-container"></div>' + 
				
				'<div class="name">' + 
					'<p class="bc-name bc-name-nick">' + nick + '</p>' + 
					specialName + 
				'</div>' + 
			'</div>' + 
			
			specialCode + 
			
			'<div class="text">' + 
				'<div class="tools">' + 
					'<div class="left">' + 
						'<div class="chat-tools-content">' + 
							'<a class="tools-smileys tools-tooltip talk-images"></a>' + 
							
							'<div class="tooltip bubble-smileys">' + 
								'<div class="tooltip-subitem">' + 
									'<p class="tooltip-right-top tooltip-insert-smiley">' + _e(93) + '</p>' + 
									smileyLinks(id) + 
								'</div>' + 
								
								'<div class="tooltip-subarrow talk-images"></div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="chat-tools-content">' + 
							'<a class="tools-save tools-tooltip talk-images"></a>' + 
							
							'<div class="tooltip bubble-save">' + 
								'<div class="tooltip-subitem">' + 
									'<p class="tooltip-right-top">' + _e(94) + '</p>' + 
									'<p style="margin-bottom: 8px;">' + _e(95) + '</p>' + 
									'<a class="tooltip-right-dchat" onclick="downloadChat(\'' + jid + '\');">' + _e(96) + '</a>' + 
									'<a class="tooltip-right-fchat" target="_blank">' + _e(97) + '</a>' + 
								'</div>' + 
								
								'<div class="tooltip-subarrow talk-images"></div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="chat-tools-content">' + 
							'<a class="tools-clear tools-tooltip talk-images" title="' + _e(98) + '" onclick="cleanChat(\'' + id + '\');"></a>' + 
						'</div>' + 
						
						specialLink + 
					'</div>' + 
					
					'<div class="right">' + 
						'<a class="tools-close' + specialClass + ' tools-tooltip talk-images" title="' + _e(101) + '" onclick="quitThisChat(\'' + jid + '\', \'' + id + '\', \'' + type + '\');"></a>' + 
					'</div>' + 
				'</div>' + 
				
				'<form name="sendForm" onsubmit="return sendMessage(this, \'' + type + '\');" action="#">' + 
					'<input type="hidden" name="sendTo" class="send-to" value="' + jid + '" />' + 
					'<input type="text" name="msg" class="message-area" />' + 
				'</form>' + 
			'</div>' + 
		'</div>'
	);
}

function generateSwitch(type, id, jid, nick) {
	// Special code
	var specialClass;
	
	if(type == 'groupchat')
		specialClass = ' groupchat-default';
	else
		specialClass = ' unavailable';
	
	$('#chat-switch .channels').prepend(
		'<div class="' + id + ' removable switcher chan">' + 
			'<div class="icon talk-images' + specialClass + '"></div>' + 
			
			'<div class="name" onclick="switchChan(\'' + id + '\');">' + 
				'<a>' + nick + '</a>' + 
			'</div>' + 
			
			'<div class="exit" onclick="quitThisChat(\'' + jid + '\', \'' + id + '\', \'' + type + '\');">x</div>' + 
		'</div>'
	);
}

function cleanChat(chat) {
	$('#chat-engine #' + chat + ' .content .one-line').remove();
	$('#chat-engine #' + chat + ' .text .message-area').focus();
}

function chatCreate(friendJID, noHashfriendJID, friendName) {
	// Create the chat content
	generateChat('chat', friendJID, noHashfriendJID, friendName);
	
	// Create the chat switcher
	generateSwitch('chat', friendJID, noHashfriendJID, friendName);
	
	// If the user is not in our buddy-list
	if(!exists('#buddy-list .' + friendJID)) {
		// We add a click event on the add button
		$('#' + friendJID + ' .tools-add').click(function() {
			addThisContact(noHashfriendJID);
		})
		
		// We show the add button
		.show();
	}
	
	// We catch the user's informations (like this avatar, vcard, and so on...)
	getUserInfos(friendJID, noHashfriendJID);
	
	// The icons-click functions
	tooltipIcons(friendJID);
	
	// We check if a scrollbar's needed for the switcher
	switcherScroll();
	
	// The composing notification needed stuffs
	var inputDetect = $('#chat-engine #' + friendJID + ' .message-area');
	
	inputDetect.keypress(function() {
		if(getDB('chatstate', friendJID) != 'on') {
			// We change the state detect input
			setDB('chatstate', friendJID, 'on');
			
			// We send the friend a "composing" chatstate
			chatStateSend('composing', noHashfriendJID, friendJID);
		}
	});
	
	inputDetect.change(function() {
		// Reset the composing database entry
		setDB('chatstate', friendJID, 'off');
	});
	
	inputDetect.focus(function() {
		// We clean the current notifications
		chanCleanNotify(friendJID);
		
		// Nothing in the input, user is active
		if(!inputDetect.val())
			chatStateSend('active', noHashfriendJID, friendJID);
		
		// Something was written, user started writing again
		else
			chatStateSend('composing', noHashfriendJID, friendJID);
	});
	
	inputDetect.blur(function() {
		// Nothing in the input, user is inactive
		if(!inputDetect.val())
			chatStateSend('inactive', noHashfriendJID, friendJID);
		
		// Something was written, user paused
		else
			chatStateSend('paused', noHashfriendJID, friendJID);
	});
}

function displayMucAdmin(affiliation, id, jid, statuscode) {
	// We check if the user is the room admin to give him privileges
	if(affiliation == 'owner') {
		$("#" + id + " .tools-topic").show();
		$("#" + id + " .tools-mucadmin").show();
	}
	
	// We check if the room hasn't been yet created
	if(statuscode == '201')
		openThisInfo(5);
	
	// We add the click event
	$("#" + id + " .tools-mucadmin").click(function() {
		openMucAdmin(jid);
	});
}

function getMUC(room, form) {
	var nickname;
	
	// Anonymous mode?
	if(isAnonymous()) {
		// Get some values
		nickname = $('#data .anonymous .nick').val();
		hash = hex_md5(room);
		
		// If the nickname was not submitted
		if(!form && !nickname) {
			$('#' + hash).append(
				'<form class="muc-nickname text" onsubmit="return getMUC(\'' + room + '\', this);" name="muc-nickname">' + 
					'<p>' + _e(63) + '</p>' + 
					'<input type="text" name="nick" />' + 
				'</form>'
			);
			
			$('#' + hash + ' .muc-nickname input').focus();
		}
		
		// The nickname has been submitted
		else if(form && !nickname) {
			nickname = form.nick.value;
			$('#' + hash + ' .muc-nickname').remove();
			$('#' + hash + ' .message-area').focus();
		}
	}
	
	// Sent the room password?
	else if(form) {
		// Get the needed values
		var password = form.pwd.value;
		var cut = cutResource(room);
		var hash = hex_md5(cut);
		
		// Remove the password element
		$('#' + hash + ' .muc-password').remove();
		
		// Focus on the messages input
		$('#' + hash + ' .message-area').focus();
	}
	
	if(!isAnonymous() && !nickname)
		nickname = getNick();
	
	if(!isAnonymous() || nickname) {
		// Get our general presence
		var show = getDB('presence-show', 1);
		var status = getDB('presence-status', 1);
		
		// Send the appropriate presence
		sendPresence(room + '/' + nickname, '', show, status, '', password, handleMUC);
	}
	
	return false;
}

function handleMUC(aPresence) {
	// We get the xml content
	var xml = aPresence.getNode();
	var from = '' + aPresence.getFromJID() + '';
	var room = cutResource(from);
	var roomHash = hex_md5(room);
	var hash = hex_md5(from);
	
	// Catch the errors
	if(!handleError(xml)) {
		// Define some stuffs
		var affiliation = $(xml).find('item').attr('affiliation');
                var statuscode = $(xml).find('status').attr('code');
		
		// Handle my presence
		handlePresence(aPresence);
		
		// Check if I am a room owner
		displayMucAdmin(affiliation, roomHash, room, statuscode);
	}
	
	// A password is required
	else if($(xml).find('error[type=auth] not-authorized').attr('xmlns')) {
		$('#' + roomHash).append(
			'<form class="muc-password text" onsubmit="return getMUC(\'' + from + '\', this);" name="muc-password">' + 
				'<p>' + _e(62) + '</p>' + 
				'<input type="password" name="pwd" />' + 
			'</form>'
		);
		
		$('#' + roomHash + ' .muc-password input').focus();
	}
}

function generateColour(jid) {
	var colors = Array(
			'939042',
			'549d5e',
			'dcb241',
			'dea712',
			'805072',
			'51858f',
			'ae4b3b',
			'476a3b',
			'3b636a',
			'7da219'
			 );
	
	var number = 0;
	
	for(var i = 0; i < jid.length; i++)
		number += jid.charCodeAt(i);
	
	var color = '#' + colors[number%(colors.length)];
	
	return color;
}

function autocompletion(hash) {
	/* MUC nick autocompletion when pressing TAB
	  (idea from Louiz: http://louiz.org/) */
	
	// Generate a selector
	var selector = $('#' + hash + ' .user .name');
	
	// We get the number of participants
	var size = selector.length;
	
	// We random a number
	var i = Math.floor(Math.random() * size);
	
	// We get the nickname
	var nick = selector.eq(i).text();
	
	// We quote the nick
	quoteMyNick(hash, nick);
}

function groupchatCreate(hash, room, chan) {
	/* REF: http://xmpp.org/extensions/xep-0045.html */
	
	// Create the chat content
	generateChat('groupchat', hash, room, chan);
	
	// Create the chat switcher
	generateSwitch('groupchat', hash, room, chan);
	
	// The icons-click functions
	tooltipIcons(hash);
	
	// We check if a scrollbar's needed for the switcher
	switcherScroll();
	
	// Focus event
	$('#' + hash + ' .message-area').focus(function() {
		chanCleanNotify(hash);
	})
	
	// Lock to the input
	.keypress(function(e) {
		if(e.keyCode == 9) {
			autocompletion(hash);
			return false;
		}
	});
	
	// Get the current muc informations and content
	getMUC(room, '');
	
	// Put an indicator to handle the change of our presence
	setDB('muc', room, getNick());
}
