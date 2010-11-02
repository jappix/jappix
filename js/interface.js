/*

Jappix - An open social platform
These are the interface JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 02/11/10

*/

// Switches to the given chan
function switchChan(id) {
	if(exists('#' + id)) {
		// We show the chat-engine content
		$('.chat-engine-chan').hide();
		$('#' + id).show();
		
		// We edit the tab switcher
		$('#chat-switch .switcher').removeClass('activechan').addClass('chan');
		$('#chat-switch .' + id).addClass('activechan').removeClass('chan');
		
		// We scroll down to the last message
		if(id != 'channel')
			autoScroll(id);
		
		// We put the focus on the target chat input
		$('#chat-engine #' + id + ' .text .message-area').focus();
	}
}

// Applies the chat-engine tooltips hover event
function hoverTooltip(id, type) {
	$('#' + id + ' .tools-' + type + ', #' + id + ' .bubble-' + type).hover(function() {
		$('#' + id + ' .bubble-' + type).show();
	}, function() {
		$('#' + id + ' .bubble-' + type).hide();
	});
}

// Applies the hoverTooltip function to the needed things
function tooltipIcons(id) {
	// Apply the hover event on each bubble icon
	hoverTooltip(id, 'smileys');
	hoverTooltip(id, 'style');
	hoverTooltip(id, 'save');
	
	// Apply the click event on each style color
	var id_path = '#' + id;
	var message_area = id_path + ' .message-area';
	var bubble_style = id_path + ' .bubble-style ';
	var checkboxes = bubble_style + 'input:checkbox';
	var colors = bubble_style + 'a.color';
	
	$(colors).click(function() {
		// The clicked color is yet selected
		if($(this).hasClass('selected'))
			$(this).removeClass('selected');
		
		else {
			$(colors).removeClass('selected');
			$(this).addClass('selected');
		}
	});
	
	// Update the textarea style when it is changed
	$(checkboxes + ', ' + colors).click(function() {
		var style = generateStyle(id);
		
		// Any style to apply?
		if(style)
			$(message_area).attr('style', style);
		else
			$(message_area).removeAttr('style');
	});
}

// Puts the selected smiley in the good chat-engine input
function insertSmiley(smiley, hash) {
	// We define the variables
	var selector = $('#' + hash + ' .message-area');
	var oValue = selector.val();
	var nValue = oValue + ' ' + smiley + ' ';
	
	// Put the new value and focus on it
	selector.val(nValue).focus();
}

// Deletes all the associated elements of the chat we want to remove
function deleteThisChat(hash) {
	$('#' + hash + ', #chat-switch .' + hash).remove();
}

// Closes the given chat
function quitThisChat(xid, hash, type) {
	if(type == 'groupchat') {
		// Send our unavailable presence
		sendPresence(xid + '/' + getMUCNick(hash), 'unavailable');
		
		// Remove all presence database entries for this groupchat
		for(var i = 0; i < sessionStorage.length; i++) {
			// Get the pointer values
			var current = sessionStorage.key(i);
			var cXID = explodeThis('_', current, 1);
			
			// If the pointer is on a presence from this groupchat
			if((explodeThis('_', current, 0) == 'presence') && (cutResource(cXID) == xid)) {
				// Generate the hash for the current XID
				var cHash = hex_md5(cXID);
				
				// Disable the message textarea
				$('#' + cHash + ' .message-area').attr('disabled', true);
				
				// Remove the presence for this XID
				removeDB('presence', cXID);
				presenceFunnel(cXID, cHash);
			}
		}
	}
	
	else
		chatStateSend('gone', xid, hash, 'chat');
	
	// Get the chat ID which is before
	var previous = $('#' + hash).prev().attr('id');
	
	// Remove the chat
	deleteThisChat(hash);
	
	// Reset the switcher
	switchChan(previous);
	
	// Reset the notifications
	chanCleanNotify(hash);
}

// Download the chat logs
function downloadChat(xid) {
	// Get the main values
	var hash = hex_md5(xid);
	var path = '#' + hash + ' ';
	var content = $(path + '#chatContentFor' + hash).clone().contents();
	var avatar = $(path + '.top .avatar-container:first').html();
	var nick = $(path + '.top .bc-name').text();
	var date = getXMPPTime('local');
	
	// Filter the content smileys
	$(content).find('span.emoticon').each(function() {
		$(this).replaceWith($(this).attr('data-text'));
	});
	
	// Remove the content click events
	$(content).find('a').removeAttr('onclick');
	
	// Extract the content HTML code
	content = $(content).parent().html();
	
	// No avatar?
	if(!avatar || !avatar.match(/data:/))
		avatar = 'none';
	
	// POST the values to the server
	$.post('./php/generate-chat.php', { content: content, xid: xid, nick: nick, avatar: avatar, date: date }, function(data) {
		$(path + '.tooltip-right-dchat').hide();
		$(path + '.tooltip-right-fchat').attr('href', './php/download-chat.php?id=' + data).show();
	});
}

// Notifies the user from a new incoming message
function messageNotify(hash, type) {
	// We notify the user if he has not the focus on the chat
	var chat_switch = '#chat-switch .';
	var tested = $(chat_switch + hash);
	
	if(!tested.hasClass('activechan') || !document.hasFocus()) {
		if(type == 'personnal') {
			$(chat_switch + hash + ', ' + chat_switch + 'more-button').addClass('chan-newmessage');
			pageTitle('new');
		}
		
		else
			tested.addClass('chan-unread');
	}
}

// Cleans the given chat notifications
function chanCleanNotify(hash) {
	// We remove the class that tell the user of a new message
	var chat_switch = '#chat-switch .';
	$(chat_switch + hash).removeClass('chan-newmessage chan-unread');
	
	// We reset the global notifications if no more unread messages
	if(!$(chat_switch + 'chans .chan-newmessage').size()) {
		$(chat_switch + 'more-button').removeClass('chan-newmessage');
		pageTitle('talk');
	}
}

// Scrolls to the last chat message
function autoScroll(hash) {
	if(exists('#' + hash)) {
		var objDiv = document.getElementById('chatContentFor' + hash);
		
		objDiv.scrollTop = objDiv.scrollHeight;
	}
}

// Shows all the buddies in the buddy-list
function showAllBuddies(from) {
	// Put a marker
	BLIST_ALL = true;
	
	// We switch the two modes
	$('.buddy-conf-more-display-unavailable').hide();
	$('.buddy-conf-more-display-available').show();
	
	// Security: reset all the groups toggle event
	$('#buddy-list .group-buddies').show();
	$('#buddy-list .group span').text('-');
	
	// We show the disconnected buddies
	$('.hidden-buddy').show();
	
	// We show all the groups
	$('#buddy-list .one-group').show();
	
	if(SEARCH_FILTERED)
		funnelFilterBuddySearch();
	
	// Store this in the options
	if(from == 'roster') {
		setDB('options', 'roster-showall', '1');
		storeOptions();
	}
}

// Shows only the online buddies in the buddy-list
function showOnlineBuddies(from) {
	// Remove the marker
	BLIST_ALL = false;
	
	// We switch the two modes
	$('.buddy-conf-more-display-available').hide();
	$('.buddy-conf-more-display-unavailable').show();
	
	// Security: reset all the groups toggle event
	$('#buddy-list .group-buddies').show();
	$('#buddy-list .group span').text('-');
	
	// We hide the disconnected buddies
	$('.hidden-buddy').hide();
	
	// We check the groups to hide
	updateGroups();
	
	if(SEARCH_FILTERED)
		funnelFilterBuddySearch();
	
	// Store this in the options
	if(from == 'roster') {
		setDB('options', 'roster-showall', '0');
		storeOptions();
	}
}
