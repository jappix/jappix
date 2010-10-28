/*

Jappix - An Open μSocial Platform
These are the interface JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

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
		
		// We put the focus on the talk input
		var focusOn = '#chat-engine #' + id + ' .text .message-area';
		$(focusOn).focus();
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
	hoverTooltip(id, 'smileys');
	hoverTooltip(id, 'save');
}

// Puts the selected smiley in the good chat-engine input
function insertSmiley(smileyName, insertInChatHash) {
	// We replace the odd smileys
	var smileyName = smileyName.replace(/’/g,"'");
	
	// We define the variables
	var insertInChatHashPath = '#' + insertInChatHash + ' .message-area';
	var oldInputValue = $(insertInChatHashPath).val();
	var valueSoup = oldInputValue + ' ' + smileyName + ' ';
	$(insertInChatHashPath).val(valueSoup);
	
	// We put the focus on the target input
	var focusOn = '#chat-engine #' + insertInChatHash + ' .text .message-area';
	$(focusOn).focus();
}

// Deletes all the associated elements of the chat we want to remove
function deleteThisChat(hash) {
	$('#' + hash).remove();
	$('#chat-switch .' + hash).remove();
}

// Closes the given chat
function quitThisChat(jid, hash, type) {
	if(type == 'chat')
		chatStateSend('gone', jid, hash);
	
	else if(type == 'groupchat') {
		sendPresence(jid + '/' + getDB('muc', jid), 'unavailable');
		removeDB('muc', jid);
	}
	
	// Remove the chat
	deleteThisChat(hash);
	
	// We reset the switcher overflowing
	switcherScroll();
	
	// We reset the switcher
	switchChan('channel');
}

// Download the chat logs
function downloadChat(chat) {
	var hash = hex_md5(chat);
	var contentToSend = $('#chatContentFor' + hash).html();
	
	$.post('./php/chatengine-generate-chat.php', { originalchat: contentToSend, fromjid: chat }, function(data){
		$('#' + hash + ' .tooltip-right-dchat').hide();
		$('#' + hash + ' .tooltip-right-fchat').show();
		$('#' + hash + ' .tooltip-right-fchat').attr('href', './php/chatengine-download-chat.php?id=' + data);
	});
	
	$('#' + hash + ' .tooltip-right-fchat').click(function() {
		$('#' + hash + ' .tooltip-right-dchat').show();
		$('#' + hash + ' .tooltip-right-fchat').hide();
	});
}

// Scrolls to the last chat message
function autoScroll(hash) {
	if(exists("#" + hash)) {
		pathToLastMessage = 'chatContentFor' + hash;
		var objDiv = document.getElementById(pathToLastMessage);
		objDiv.scrollTop = objDiv.scrollHeight;
	}
}
