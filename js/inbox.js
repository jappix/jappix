/*

Jappix - An Open μSocial Platform
These are the inbox JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function messagesOpen() {
	$("#inbox").show();
}

function messagesStore() {
	var hash = hex_md5(getJID());
	
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_MESSAGES}));
	
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored message
		if(splitted[0] == 'messages') {
			var value = sessionStorage.getItem(current);
			var messageID = $(value).find('id').text();
			var messageFrom = $(value).find('from').text();
			var messageSubject = $(value).find('subject').html().revertHtmlEnc();
			var messageStatus = $(value).find('status').text();
			var messageContent = $(value).find('content').html().revertHtmlEnc();
			var messageDate = $(value).find('date').text();
			
			storage.appendChild(iq.buildNode('message', {'id': messageID, 'from': messageFrom, 'subject': messageSubject, 'status': messageStatus, 'date': messageDate, 'xmlns': NS_MESSAGES}, messageContent));
		}
	}
	
	con.send(iq);
}

function messagesClose() {
	$("#inbox").hide();
	
	// We reset the divs
	showMessages();
	
	// We send to the database the new inbox
	messagesStore();
}

function newMessage() {
	// Init
	var mPath = '#inbox .';
	
	// We switch the divs
	$(mPath + "messages-results, #inbox .a-new-message, #inbox .a-delete-messages").hide();
	$(mPath + "messages-new, #inbox .a-show-messages").show();
	
	// We focus on the first input
	$(mPath + "messages-new-to-input").focus();
	
	// We reset some stuffs
	cleanNewMessage();
}

function cleanNewMessage() {
	// Init
	var mPath = '#inbox .';
	
	// We reset the forms
	$(mPath + "messages-new input, " + mPath + "messages-new textarea").val("").removeClass("please-complete");
	
	// We close an eventual opened message
	$(mPath + "one-message-body").hide();
	$(mPath + "one-message").removeClass("message-reading");
}

function normalMessageSender(to, from, subject, body) {
	// We send the message
	var mess = new JSJaCMessage();
	mess.setID(genID());
	mess.setTo(to);
	mess.setFrom(from);
	mess.setSubject(subject);
	mess.setBody(body);
	mess.setType('normal');
	con.send(mess, handleErrorReply);
}

function sendThisMessage() {
	// We get some informations
	var mPath = '#inbox .';
	var to = $(mPath + 'messages-new-to-input').val();
	var body = $(mPath + 'messages-new-textarea').val();
	var subject = $(mPath + 'messages-new-subject-input').val();
	
	if(to && body && subject) {
		// Edit the JID if needed
		to = generateJID(to, 'chat');
		
		// We send the message
		normalMessageSender(to, getJID(), subject, body);
		
		// We clean the inputs
		cleanNewMessage();
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

$(document).ready(function() {
	// We activate the form
	$("#inbox .messages-new input").keyup(function(e) {
		if(e.keyCode == 13)
			sendThisMessage();
	});
});

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

function displayMessage(from, subject, content, status, id, type, date) {
	// We generate the html code
	var nContent = '<div class="one-message message-' + status + ' ' + id + ' removable">' + 
				'<div class="message-jid" onclick="revealMessage(\'' + id + '\');">' + getBuddyName(from) + '</div>' + 
				'<div class="message-subject" onclick="revealMessage(\'' + id + '\');">' + subject.htmlEnc() + '</div>' + 
				'<a onclick="deleteThisMessage(\'' + id + '\');" class="message-remove">' + _e(32) + '</a>' + 
			'</div>' + 
			
			'<div class="one-message-body one-message-body' + id + ' removable">' + 
				'<div class="message-body">' + content.htmlEnc() + '</div>' + 
				'<div class="message-meta">' + 
					'<a onclick="hideThisMessage(\'' + id + '\');">' + _e(34) + '</a>' + 
					'<a onclick="replyToThisMessage(\'' + id + '\');">' + _e(33) + '</a>' + 
				'</div>' + 
			'</div>';
	
	// We set the message to the index
	var iSelector = $("#inbox .messages-results .inbox");
	
	// Display the messages
	iSelector.prepend(nContent);
	
	// We tell the user with an icon that he has a message
	checkNewMessages();
	
	// We send to the database the new inbox
	var xml = '<message><id>' + id + '</id><date>' + date + '</date><from>' + from + '</from><subject>' + subject + '</subject><status>' + status + '</status><content>' + content + '</content></message>';
	setDB('messages', id, xml);
	
	if(type == 'fresh') {
		soundPlay(5);
		messagesStore();
	}
}

function deleteThisMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	$(mPath + id).remove();
	$(mPath + "one-message-body" + id).remove();
	removeDB('messages', id);
	checkNewMessages();
}

function deleteAllMessages() {
	// Init
	var mPath = '#inbox .';
	
	$(mPath + "one-message").remove();
	$(mPath + "one-message-body").remove();
	
	// Remove all the messages from the database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored message
		if(splitted[0] == 'messages')
			removeDB(splitted[0], splitted[1]);
	}
	
	checkNewMessages();
}

function checkNewMessages() {
	// Init
	var mPath = '#inbox .';
	
	// If there's no more unread messages
	if(exists(mPath + "message-unread"))
		$("#top-content .messages-tools .tools").addClass("actived");
	else
		$("#top-content .messages-tools .tools").removeClass("actived");
	
	// If there's no more messages, we show a message
	if(exists(mPath + "one-message"))
		$(mPath + "messages-noresults").hide();
	else
		$(mPath + "messages-noresults").show();
}

function revealMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	// We reset all the other messages
	$(mPath + "one-message-body").hide();
	$(mPath + "one-message").removeClass("message-reading");
	
	// We update the database
	var oldValue = getDB('messages', id);
	var newValue = oldValue.replace(/<status>unread/g,"<status>read");
	setDB('messages', id, newValue);
	
	// We show the message
	$(mPath + "one-message-body" + id).show();
	$(mPath + id).removeClass("message-unread");
	$(mPath + id).addClass("message-reading");
	checkNewMessages();
}

function hideThisMessage(id) {
	// Init
	var mPath = '#inbox .';
	
	$(mPath + "one-message-body" + id).hide();
	$(mPath + id).removeClass("message-reading");
}

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
	$(mPath + "messages-new-to-input").val(nFrom);
	$(mPath + "messages-new-subject-input").val(nSubject);
	$(mPath + "messages-new-textarea").val(nContent);
	
	// We focus on the textarea
	$(mPath + "messages-new-textarea").focus();
}
