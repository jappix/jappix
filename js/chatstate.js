/*

Jappix - An open social platform
These are the chatstate JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 08/12/10

*/

// Sends a given chatstate to a given entity
function chatStateSend(state, xid, hash, type) {
	// If the friend client supports chatstates and is online
	if($('#' + hash + ' .message-area').attr('data-chatstates') && !exists('#page-switch .' + hash + ' .unavailable')) {
		// New message stanza
		var aMsg = new JSJaCMessage();
		aMsg.setTo(xid);
		aMsg.setType(type);
		
		// Append the chatstate node
		aMsg.appendNode(state, {'xmlns': NS_CHATSTATES});
		
		// Send this!
		con.send(aMsg);
	}
}

// Displays a given chatstate in a given chat
function displayChatState(state, hash) {
	// We change the buddy name color in the page-switch
	$('#page-switch .' + hash + ' .name').removeClass('active')
					     .removeClass('composing')
					     .removeClass('paused')
					     .removeClass('inactive')
					     .removeClass('gone')
					     .addClass(state);
	
	// We generate the chatstate text
	var text = '';
	
	switch(state) {
		// Active
		case 'active':
			text = _e("Your friend is paying attention to the conversation.");
			
			break;
		
		// Composing
		case 'composing':
			text = _e("Your friend is writing a message...");
			
			break;
		
		// Paused
		case 'paused':
			text = _e("Your friend stopped writing a message.");
			
			break;
		
		// Inactive
		case 'inactive':
			text = _e("Your friend is doing something else.");
			
			break;
		
		// Gone
		case 'gone':
			text = _e("Your friend closed the chat.");
			
			break;
	}
	
	// We reset the previous state
	$('#' + hash + ' .chatstate').remove();
	
	// We create the chatstate
	$('#' + hash + ' .content').after('<div class="' + state + ' chatstate">' + text + '</div>');
}
