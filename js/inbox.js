/*

Jappix - An open social platform
These are the inbox JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 09/10/10

Dependencies: search.js

*/

// Opens the inbox popup
function messagesOpen() {
	$('#inbox').show();
}

// Stores the inbox
function messagesStore() {
	var hash = hex_md5(getXID());
	
	var iq = new JSJaCIQ();
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_MESSAGES}));
	
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored message
		if(explodeThis('_', current, 0) == 'messages') {
			var value = $(sessionStorage.getItem(current));
			var messageID = value.find('id').text();
			var messageFrom = value.find('from').text();
			var messageSubject = value.find('subject').html().revertHtmlEnc();
			var messageStatus = value.find('status').text();
			var messageContent = value.find('content').html().revertHtmlEnc();
			var messageDate = value.find('date').text();
			
			storage.appendChild(iq.buildNode('message', {'id': messageID, 'from': messageFrom, 'subject': messageSubject, 'status': messageStatus, 'date': messageDate, 'xmlns': NS_MESSAGES}, messageContent));
		}
	}
	
	con.send(iq);
}

// Closes the inbox popup
function messagesClose() {
	$('#inbox').hide();
	
	// We reset the divs
	showMessages();
	
	// We send to the database the new inbox
	messagesStore();
}

// Creates a new normal message
function newMessage() {
	// Init
	var mPath = '#inbox .';
	
	// Reset the previous buddy search
	resetBuddySearch('#inbox .messages-new-to');
	
	// We switch the divs
	$(mPath + 'messages-results, #inbox .a-new-message, #inbox .a-delete-messages').hide();
	$(mPath + 'messages-new, #inbox .a-show-messages').show();
	
	// We focus on the first input
	$(mPath + 'messages-new-to-input').focus();
	
	// We reset some stuffs
	cleanNewMessage();
}

// Cleans the inbox
function cleanNewMessage() {
	// Init
	var mPath = '#inbox .';
	
	// We reset the forms
	$(mPath + 'messages-new input, ' + mPath + 'messages-new textarea').val('').removeClass('please-complete');
	
	// We close an eventual opened message
	$(mPath + 'one-message-body').hide();
	$(mPath + 'one-message').removeClass('message-reading');
}

// Sends a normal message
function normalMessageSender(to, subject, body) {
	// We send the message
	var mess = new JSJaCMessage();
	
	mess.setTo(to);
	mess.setSubject(subject);
	mess.setBody(body);
	mess.setType('normal');
	
	con.send(mess, handleErrorReply);
}

// Performs the normal message sender checks
function sendThisMessage() {
	// We get some informations
	var mPath = '#inbox .';
	var to = $(mPath + 'messages-new-to-input').val();
	var body = $(mPath + 'messages-new-textarea').val();
	var subject = $(mPath + 'messages-new-subject-input').val();
	
	if(to && body && subject) {
		// New array of XID
		var xid;
		
		// Only one value
		if(!to.match(/, /))
			xid = new Array(to);
		
		// More than one XID
		else
			xid = to.split(', ');
		
		for(var i = 0; i < xid.length; i++) {
			var current = xid[i];
			
			if(current) {
				// Edit the XID if needed
				current = generateXID(current, 'chat');
				
				// We send the message
				normalMessageSender(current, subject, body);
				
				// We clean the inputs
				cleanNewMessage();
				
				logThis('Inbox message sent: ' + current);
			}
		}
		
		// Close the inbox
		messagesClose();
	}
	
	else {
		$(mPath + 'resetable').each(function() {
			if(!$(this).val())
				$(this).addClass('please-complete');
			else
				$(this).removeClass('please-complete');	
		});
	}
}

// Shows the inbox messages
function showMessages() {
	// Init
	var mPath = '#inbox .';
	
	// We switch the divs
	$(mPath + 'messages-new').hide();
	$(mPath + 'messages-results').show();
	
	// We show a new link in the menu
	$(mPath + 'a-show-messages').hide();
	$(mPath + 'a-delete-messages').show();
	$(mPath + 'a-new-message').show();
	
	// We reset some stuffs
	cleanNewMessage();
}

// Displays a normal message
function displayInboxMessage(from, subject, content, status, id, type, date) {
	// We generate the html code
	var nContent = '<div class="one-message message-' + status + ' ' + id + ' removable">' + 
				'<div class="message-jid" onclick="revealMessage(\'' + id + '\');">' + getBuddyName(from).htmlEnc() + '</div>' + 
				'<div class="message-subject" onclick="revealMessage(\'' + id + '\');">' + subject.htmlEnc() + '</div>' + 
				'<a onclick="deleteThisMessage(\'' + id + '\');" class="message-remove">' + _e("Delete") + '</a>' + 
			'</div>' + 
			
			'<div class="one-message-body one-message-body' + id + ' removable">' + 
				'<div class="message-body">' + content.htmlEnc() + '</div>' + 
				'<div class="message-meta">' + 
					'<a onclick="hideThisMessage(\'' + id + '\');">' + _e("Hide") + '</a>' + 
					'<a onclick="replyToThisMessage(\'' + id + '\');">' + _e("Reply") + '</a>' + 
				'</div>' + 
			'</div>';
	
	// We set the message to the index
	var iSelector = $('#inbox .messages-results .inbox');
	
	// Display the messages
	iSelector.prepend(nContent);
	
	// We tell the user with an icon that he has a message
	checkNewMessages();
	
	// We send to the database the new inbox
	var xml = '<message><id>' + id + '</id><date>' + date + '</date><from>' + from + '</from><subject>' + subject + '</subject><status>' + status + '</status><content>' + content + '</content></message>';
	setDB('messages', id, xml);
	
	if(type == 'fresh')
		messagesStore();
}

// Removes a given normal message
function deleteThisMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	$(mPath + id).remove();
	$(mPath + 'one-message-body' + id).remove();
	removeDB('messages', id);
	
	checkNewMessages();
}

// Removes all the inbox messages
function deleteAllMessages() {
	// Init
	var mPath = '#inbox .';
	
	$(mPath + 'one-message').remove();
	$(mPath + 'one-message-body').remove();
	
	// Remove all the messages from the database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored message
		if(explodeThis('_', current, 0) == 'messages')
			removeDB('messages', explodeThis('_', current, 1));
	}
	
	checkNewMessages();
}

// Checks if there are new messages to be notified
function checkNewMessages() {
	// Initialize
	var mPath = '#inbox .';
	var mSize = $(mPath + 'message-unread').size();
	var mTools = $('#top-content .inbox-notify');
	var mNo = $(mPath + 'messages-noresults');
	
	// If there's no more unread messages
	if(mSize)
		mTools.text('(' + mSize + ')').show();
	else
		mTools.hide();
	
	// If there's no more messages, we show a message
	if(exists(mPath + 'one-message'))
		mNo.hide();
	else
		mNo.show();
}

// Reveal a normal message content
function revealMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	// We reset all the other messages
	$(mPath + 'one-message-body').hide();
	$(mPath + 'one-message').removeClass('message-reading');
	
	// We update the database
	var oldValue = getDB('messages', id);
	var newValue = oldValue.replace(/<status>unread/g,'<status>read');
	setDB('messages', id, newValue);
	
	// We show the message
	$(mPath + 'one-message-body' + id).show();
	$(mPath + id).removeClass('message-unread');
	$(mPath + id).addClass('message-reading');
	checkNewMessages();
}

// Hides a normal message content
function hideThisMessage(id) {
	var mPath = '#inbox .';
	
	$(mPath + 'one-message-body' + id).hide();
	$(mPath + id).removeClass('message-reading');
}

// Replies to a given normal message
function replyToThisMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	// We generate the values
	var stored = getDB('messages', id);
	var nFrom = $(stored).find('from').text();
	var nSubject = 'Re: ' + $(stored).find('subject').html().revertHtmlEnc();
	var nContent = $(stored).find('content').html().revertHtmlEnc() + '\n' + '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' + '\n';
	
	// We switch to the writing div
	newMessage();
	
	// We apply the generated values to the form
	$(mPath + 'messages-new-to-input').val(nFrom);
	$(mPath + 'messages-new-subject-input').val(nSubject);
	$(mPath + 'messages-new-textarea').val(nContent);
	
	// We focus on the textarea
	$(mPath + 'messages-new-textarea').focus();
}

// Launch this plugin!
$(document).ready(function() {
	// Define the buddy search vars
	var destination = '#inbox .messages-new-to';
	var dHovered = destination + ' ul li.hovered:first';
	
	// Send the message when enter pressend
	$('#inbox .messages-new input').keyup(function(e) {
		if(e.keyCode == 13) {
			if(exists(dHovered))
				addBuddySearch(destination, $(dHovered).attr('data-xid'));
			else
				sendThisMessage();
		}
	});
	
	// Buddy search
	$('#inbox .messages-new-to-input').keyup(function(e) {
		if(e.keyCode != 13) {
			// New buddy search
			if((e.keyCode != 40) && (e.keyCode != 38))
				createBuddySearch(destination);
			
			// Navigating with keyboard in the results
			arrowsBuddySearch(e, destination);
		}
	})
	
	// Buddy search lost focus
	.blur(function() {
		if(!$(destination + ' ul').attr('mouse-hover'))
			resetBuddySearch(destination);
	})
	
	// Buddy search got focus
	.focus(function() {
		var value = $(this).val();
		
		// Add a comma at the end
		if(value && !value.match(/(^)(.+)((,)(\s))($)/))
			$(this).val(value + ', ');
	});
});
