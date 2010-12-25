/*

Jappix - An open social platform
These are the receipts JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 25/12/10

*/

// Checks if we can send a receipt request
function receiptRequest(hash) {
	// Entity have support for receipt?
	if($('#' + hash + ' .message-area').attr('data-receipts') == 'true')
		return true;
	
	return false;
}

// Checks if there is a receipt request
function hasReceipt(packet) {
	// Any receipt request?
	if(packet.getChild('request', NS_URN_RECEIPTS))
		return true;
	
	return false;
}

// Checks if there is a received reply
function hasReceived(packet) {
	// Any received reply?
	if(packet.getChild('received', NS_URN_RECEIPTS))
		return true;
	
	return false;
}

// Sends a received notification
function sendReceived(type, to, id) {
	var aMsg = new JSJaCMessage();
	aMsg.setTo(to);
	aMsg.setID(id);
	
	// Any type?
	if(type)
		aMsg.setType(type);
	
	// Append the received node
	aMsg.appendNode('received', {'xmlns': NS_URN_RECEIPTS, 'id': id});
	
	con.send(aMsg);
	
	logThis('Sent received to: ' + to);
}

// Tells the message has been received
function messageReceived(hash, id) {
	var path = $('#' + hash + ' .one-line[data-id=' + id + ']');
	
	// Add a received marker
	path.attr('data-received', 'true');
	
	// Select the last buddy name
	var buddy_name;
	
	if(path.find('b.name.me').size())
		buddy_name = path.find('b.name.me');
	else
		buddy_name = path.prev('.one-line:has(b.name.me)');
	
	// TODO: sort messages by group
	// TODO: remove the lost marker if all the group messages are okay
	// TODO: update generate-chat.php CSS
	
	// Remove the group marker
	buddy_name.removeClass('talk-images')
		  .removeAttr('data-lost')
		  .removeAttr('title');
	
	return false;
}

// Checks if the message has been received
function checkReceived(hash, id) {
	// Paths
	var path = $('#' + hash);
	var last_name = path.find('b.name.me:last');
	
	path.find('.one-line[data-id=' + id + ']').oneTime('5s', function() {
		// Not received?
		if($(this).attr('data-received') != 'true') {
			// Add a "lost" marker
			last_name.addClass('talk-images')
				 .attr('data-lost', 'true')
				 .attr('title', _e("Your friend seems not to have received your message(s)!"));
		}
	});
}
