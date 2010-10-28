/*

Jappix - An open social platform
These are the chatstate JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 05/09/10

*/

// Sends a given chatstate to a given entity
function chatStateSend(state, xid, hash, type) {
	// If the friend client supports chatstates and is online
	if($('#' + hash + ' .message-area').hasClass('chatstates') && !exists('#chat-switch .' + hash + ' .unavailable')) {
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
	// We reset the previous state
	$('#' + hash + ' .one-chatstate').hide();
	
	// We change the buddy name color in the chat-switch
	$('#chat-switch .' + hash + ' .name').attr('class', 'name ' + state);
	
	// We display the chatstate in the chat
	$('#' + hash + ' .' + state + ', #' + hash + ' .chatstate').show();
}
