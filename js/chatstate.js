/*

Jappix - An Open μSocial Platform
These are the chatstate JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function chatStateSend(state, jid, hash, type) {
	// If the friend client supports chatstates and is online
	if($('#' + hash + ' .message-area').hasClass('chatstates') && !exists('#chat-switch .' + hash + ' .unavailable')) {
		// New message stanza
		var aMsg = new JSJaCMessage();
		aMsg.setTo(jid);
		aMsg.setID(genID());
		aMsg.setFrom(getJID());
		aMsg.setType('chat');
		
		// Append the chatstate node
		aMsg.appendNode(state, {'xmlns': NS_CHATSTATES});
		
		// Send this!
		con.send(aMsg);
	}
}

function displayChatState(state, hash) {
	// We reset the previous state
	$('#' + hash + ' .one-chatstate').hide();
	
	// We change the buddy name colour in the chat-switch
	$('#chat-switch .' + hash + ' .name a').attr('class', state);
	
	// We display the state in the chat
	if(state == 'active')
		$('#' + hash + ' .chatstate').hide();
	
	else
		$('#' + hash + ' .' + state + ', #' + hash + ' .chatstate').show();
}
