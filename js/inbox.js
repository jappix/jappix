/*

Jappix - An open social platform
These are the inbox JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 04/12/10

*/

// Opens the inbox popup
function openInbox() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Your inbox") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="head inbox-head">' + 
			'<div class="head-text inbox-head-text">' + _e("Available actions") + '</div>' + 
			
			'<div class="head-actions inbox-head-actions">' + 
				'<a class="a-delete-messages">' + _e("Clean") + '</a>' + 
				'<a class="a-new-message">' + _e("New") + '</a>' + 
				'<a class="a-show-messages">' + _e("Received") + '</a>' + 
			'</div>' + 
		'</div>' + 
		
		'<div class="inbox-results">' + 
			'<p class="inbox-noresults">' + _e("Your inbox is empty.") + '</p>' + 
			
			'<div class="inbox"></div>' + 
		'</div>' + 
		
		'<div class="inbox-new">' + 
			'<div class="inbox-new-to inbox-new-block search">' + 
				'<p class="inbox-new-text">' + _e("To") + '</p>' + 
				
				'<input name="inbox-new-to-input" class="inbox-new-input inbox-new-to-input" type="text" required="" />' + 
			'</div>' + 
			
			'<div class="inbox-new-topic inbox-new-block">' + 
				'<p class="inbox-new-text">' + _e("Subject") + '</p>' + 
				
				'<input name="inbox-new-subject-input" class="inbox-new-input inbox-new-subject-input" type="text" required="" />' + 
			'</div>' + 
			
			'<div class="inbox-new-body inbox-new-block">' + 
				'<p class="inbox-new-text">' + _e("Content") + '</p>' + 
				
				'<textarea class="inbox-new-textarea" rows="8" cols="60" required=""></textarea>' + 
			'</div>' + 
			
			'<div class="inbox-new-send inbox-new-block">' + 
				'<a>' + _e("Send message") + '</a>' + 
			'</div>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<a class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('inbox', html);
	
	// Associate the events
	launchInbox();
	
	// Load the messages
	loadInbox();
	
	return false;
}

// Closes the inbox popup
function closeInbox() {
	// Destroy the popup
	destroyPopup('inbox');
}

// Stores the inbox
function storeInbox() {
	var iq = new JSJaCIQ();
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_INBOX}));
	
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored message
		if(explodeThis('_', current, 0) == 'inbox') {
			var value = $(sessionStorage.getItem(current));
			var messageID = value.find('id').text();
			var messageFrom = value.find('from').text().revertHtmlEnc();
			var messageSubject = value.find('subject').text().revertHtmlEnc();
			var messageStatus = value.find('status').text();
			var messageContent = value.find('content').html().revertHtmlEnc();
			var messageDate = value.find('date').text().revertHtmlEnc();
			
			storage.appendChild(iq.buildNode('message', {'id': messageID, 'from': messageFrom, 'subject': messageSubject, 'status': messageStatus, 'date': messageDate, 'xmlns': NS_INBOX}, messageContent));
		}
	}
	
	con.send(iq);
}

// Creates a new normal message
function newInboxMessage() {
	// Init
	var mPath = '#inbox .';
	
	// Reset the previous buddy search
	resetBuddySearch('#inbox .inbox-new-to');
	
	// We switch the divs
	$(mPath + 'inbox-results, #inbox .a-new-message, #inbox .a-delete-messages').hide();
	$(mPath + 'inbox-new, #inbox .a-show-messages').show();
	
	// We focus on the first input
	$(mPath + 'inbox-new-to-input').focus();
	
	// We reset some stuffs
	cleanNewInboxMessage();
}

// Cleans the inbox
function cleanNewInboxMessage() {
	// Init
	var mPath = '#inbox .';
	
	// We reset the forms
	$(mPath + 'inbox-new input, ' + mPath + 'inbox-new textarea').val('').removeClass('please-complete');
	
	// We close an eventual opened message
	$(mPath + 'message-content').remove();
	$(mPath + 'one-message').removeClass('message-reading');
}

// Sends a normal message
function sendInboxMessage(to, subject, body) {
	// We send the message
	var mess = new JSJaCMessage();
	
	mess.setTo(to);
	mess.setSubject(subject);
	mess.setBody(body);
	mess.setType('normal');
	
	con.send(mess, handleErrorReply);
}

// Performs the normal message sender checks
function checkInboxMessage() {
	// We get some informations
	var mPath = '#inbox ';
	var to = $(mPath + '.inbox-new-to-input').val();
	var body = $(mPath + '.inbox-new-textarea').val();
	var subject = $(mPath + '.inbox-new-subject-input').val();
	
	if(to && body && subject) {
		// New array of XID
		var xid;
		
		// Only one value
		if(!to.match(/, /))
			xid = new Array(to);
		
		// More than one XID
		else
			xid = to.split(', ');
		
		for(i in xid) {
			var current = xid[i];
			
			if(current) {
				// Edit the XID if needed
				current = generateXID(current, 'chat');
				
				// We send the message
				sendInboxMessage(current, subject, body);
				
				// We clean the inputs
				cleanNewInboxMessage();
				
				logThis('Inbox message sent: ' + current, 3);
			}
		}
		
		// Close the inbox
		closeInbox();
	}
	
	else {
		$(mPath + 'input[type=text], ' + mPath + 'textarea').each(function() {
			if(!$(this).val())
				$(this).addClass('please-complete');
			else
				$(this).removeClass('please-complete');	
		});
	}
}

// Shows the inbox messages
function showInboxMessages() {
	// Init
	var mPath = '#inbox .';
	
	// We switch the divs
	$(mPath + 'inbox-new').hide();
	$(mPath + 'inbox-results').show();
	
	// We show a new link in the menu
	$(mPath + 'a-show-messages').hide();
	$(mPath + 'a-delete-messages').show();
	$(mPath + 'a-new-message').show();
	
	// We reset some stuffs
	cleanNewInboxMessage();
}

// Displays a normal message
function displayInboxMessage(from, subject, content, status, id, date) {
	// Generate some paths
	var inbox = '#inbox .';
	var one_message = inbox + 'one-message.' + id;
	
	// Message yet displayed!
	if(exists(one_message))
		return false;
	
	// Get the buddy name
	var name = getBuddyName(from).htmlEnc();
	
	// We generate the html code
	var nContent = '<div class="one-message message-' + status + ' ' + id + ' ' + hex_md5(from) + '">' + 
				'<div class="message-head">' + 
					'<div class="avatar-container">' + 
						'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
					'</div>' + 
					
					'<div class="message-jid">' + name + '</div>' + 
					'<div class="message-subject">' + subject.htmlEnc() + '</div>' + 
					
					'<div class="message-truncated">' + truncate(noLines(content), 90).htmlEnc() + '</div>' + 
				'</div>' + 
			'</div>';
	
	// Display the message
	$(inbox + 'inbox-results .inbox').prepend(nContent);
	
	// Click events
	$(one_message + ' .message-head').click(function() {
		if(!exists(one_message + ' .message-content'))
			revealInboxMessage(id, from, subject, content, name, date, status);
		else
			hideInboxMessage(id);
	});
	
	// Get the user avatar
	getAvatar(from, 'cache', 'true', 'forget');
	
	return true;
}

// Stores an inbox message
function storeInboxMessage(from, subject, content, status, id, date) {
	// Generate the XML data
	var xml = '<message><id>' + id.htmlEnc() + '</id><date>' + date.htmlEnc() + '</date><from>' + from.htmlEnc() + '</from><subject>' + subject.htmlEnc() + '</subject><status>' + status.htmlEnc() + '</status><content>' + content.htmlEnc() + '</content></message>';
	
	setDB('inbox', id, xml);
}

// Removes a given normal message
function deleteInboxMessage(id) {
	// Remove the message from the inbox
	$('#inbox .one-message.' + id).remove();
	
	// Remove the message from the database
	removeDB('inbox', id);
	
	// Check the unread messages
	checkInboxMessages();
	
	// Store the new inbox
	storeInbox();
}

// Removes all the inbox messages
function purgeInbox() {
	// Remove all the messages from the database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored message
		if(explodeThis('_', current, 0) == 'inbox')
			removeDB('inbox', explodeThis('_', current, 1));
	}
	
	// Store the new inbox
	storeInbox();
	
	// Remove all the messages from the inbox
	$('#inbox .one-message').remove();
	
	// Reload the inbox
	loadInbox();
}

// Checks if there are new messages to be notified
function checkInboxMessages() {
	// Selectors
	var inbox_link = '#top-content a.inbox-hidable';
	var no_results = '#inbox .inbox-noresults';
	
	// Marker
	var has_messages = false;
	
	// Read the number of unread messages
	var unread = 0;
	
	// Read the local inbox database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Database pointer
		var current = sessionStorage.key(i);
		
		// Check inbox messages
		if(explodeThis('_', current, 0) == 'inbox') {
			// Read the current status
			var status = $(sessionStorage.getItem(current)).find('status').text();
			
			// Found an unread message
			if(status == 'unread')
				unread++;
			
			// Update the marker
			has_messages = true;
		}
	}
	
	// No message?
	if(!has_messages)
		$(no_results).show();
	else
		$(no_results).hide();
	
	// Reset notifications
	$(inbox_link + ' .notify').remove();
	
	// Any unread message?
	if(unread) {
		// Notify the user
		$(inbox_link).prepend('<div class="notify one-counter" data-counter="' + unread + '">' + unread + '</div>');
		
		// Update the title
		updateTitle();
		
		return true;
	}
	
	// Anyway, update the title
	updateTitle();
	
	return false;
}

// Reveal a normal message content
function revealInboxMessage(id, from, subject, content, name, date, status) {
	// Message path
	var all_message = '#inbox .one-message';
	var all_content = one_message + ' .message-content';
	var one_message = all_message + '.' + id;
	var one_content = one_message + ' .message-content';
	
	// We reset all the other messages
	$(all_content).remove();
	$(all_message).removeClass('message-reading');
	
	// We show the message
	var html = 
			'<div class="message-content">' + 
				'<div class="message-body">' + filterThisMessage(content, name, true) + '</div>' + 
				
				'<div class="message-meta">' + 
					'<span class="date">' + parseDate(date) + '</span>' + 
					
					'<a class="reply one-button talk-images">' + _e("Reply") + '</a>' + 
					'<a class="remove one-button talk-images">' + _e("Delete") + '</a>' + 
					
					'<div class="clear"></div>' + 
				'</div>' + 
			'</div>';
	
	$(one_message).append(html).addClass('message-reading');
	
	// Click events
	$(one_content + ' a.reply').click(function() {
		replyInboxMessage(id, from, subject, content);
	});
	
	$(one_content + ' a.remove').click(function() {
		deleteInboxMessage(id);
	});
	
	// Unread message
	if(status == 'unread') {
		// Update our database
		var xml = getDB('inbox', id).replace(/<status>unread<\/status>/i,'<status>read</status>');
		setDB('inbox', id, xml);
		
		// Remove the unread class
		$(one_message).removeClass('message-unread');
		
		// Send it to the server!
		storeInbox();
	}
	
	// Check the unread messages
	checkInboxMessages();
}

// Hides a normal message content
function hideInboxMessage(id) {
	// Define the paths
	var inbox = '#inbox .';
	var one_message = inbox + 'one-message.' + id;
	
	// Reset this message
	$(one_message).removeClass('message-reading');
	$(one_message + ' .message-content').remove();
}

// Replies to a given normal message
function replyInboxMessage(id, from, subject, body) {
	// We switch to the writing div
	newInboxMessage();
	
	// Inbox path
	var inbox = '#inbox .';
	
	// Generate the body
	var body = truncate(body, 120) + '\n' + '----' + '\n';
	
	// We apply the generated values to the form
	$(inbox + 'inbox-new-to-input').val(from);
	$(inbox + 'inbox-new-subject-input').val(subject);
	$(inbox + 'inbox-new-textarea').val(body).focus();
}

// Loads the inbox messages
function loadInbox() {
	// Read the local database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored message
		if(explodeThis('_', current, 0) == 'inbox') {
			// Get the current value
			var value = $(sessionStorage.getItem(current));
			
			// Display the current message
			displayInboxMessage(
						value.find('from').text().revertHtmlEnc(),
						value.find('subject').text().revertHtmlEnc(),
						value.find('content').html().revertHtmlEnc(),
						value.find('status').text(),
						value.find('id').text(),
						value.find('date').text().revertHtmlEnc()
					   );
		}
	}
	
	// Check new messages
	checkInboxMessages();
}

// Plugin launcher
function launchInbox() {
	// Define the pats
	var inbox = '#inbox .';
	
	// Define the buddy search vars
	var destination = inbox + 'inbox-new-to';
	var dHovered = destination + ' ul li.hovered:first';
	
	// Send the message when enter pressend
	$(inbox + 'inbox-new input').keyup(function(e) {
		if(e.keyCode == 13) {
			if(exists(dHovered))
				addBuddySearch(destination, $(dHovered).attr('data-xid'));
			else
				checkInboxMessage();
		}
	});
	
	// Buddy search
	$(inbox + 'inbox-new-to-input').keyup(function(e) {
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
	
	// Click events
	$(inbox + 'a-delete-messages').click(purgeInbox);
	$(inbox + 'a-new-message').click(newInboxMessage);
	$(inbox + 'a-show-messages').click(showInboxMessages);
	$(inbox + 'inbox-new-send a').click(checkInboxMessage);
	
	$(inbox + 'bottom .finish').click(function() {
		return closeInbox();
	});
}
