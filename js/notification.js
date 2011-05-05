/*

Jappix - An open social platform
These are the notification JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 05/05/11

*/

// Resets the notifications alert if no one remaining
function closeEmptyNotifications() {
	if(!$('.one-notification').size())
		closeBubbles();
}

// Checks if there are pending notifications
function checkNotifications() {
	// Define the selectors
	var notif = '#top-content .notifications';
	var nothing = '.notifications-content .nothing';
	
	// Get the notifications number
	var number = $('.one-notification').size();
	
	// Remove the red notify bubble
	$(notif + ' .notify').remove();
	
	// Any notification?
	if(number) {
		$(notif).prepend('<div class="notify one-counter" data-counter="' + number + '">' + number + '</div>');
		$(nothing).hide();
	}
	
	// No notification!
	else
		$(nothing).show();
	
	// Update the page title
	updateTitle();
}

// Creates a new notification
function newNotification(type, from, data, body) {
	if(!type || !from)
		return;
	
	// Generate an ID hash
	var id = hex_md5(type + from);
	
	// Generate the text to be displayed
	var text, action, code;
	
	// User things
	from = bareXID(from);
	var hash = hex_md5(from);
	
	switch(type) {
		case 'subscribe':
			// Get the name to display
			var display_name = data[1];
			
			if(!display_name)
				display_name = data[0];
			
			text = display_name.htmlEnc() + ' ' + _e("would like to add you as a friend.") + ' ' + _e("Do you accept?");
			
			break;
		
		case 'invite/room':
			text = getBuddyName(from).htmlEnc() + ' ' + _e("would like you to join this chatroom:") + ' ' + data[0] + ' ' + _e("Do you accept?");
			
			break;
		
		case 'request':
			text = from + ' ' + _e("would like to get authorization.") + ' ' + _e("Do you accept?");
			
			break;
		
		case 'rosterx':
			text = printf(_e("Do you want to see the friends %s suggests you?"), getBuddyName(from).htmlEnc());
			
			break;
		
		default:
			break;
	}
	
	action = '<a href="#" class="yes">' + _e("Yes") + '</a><a href="#" class="no">' + _e("No") + '</a>';
	
	if(text) {
		// We display the notification
		if(!exists('.notifications-content .' + id)) {
			// We create the html markup depending of the notification type
			code = '<div class="one-notification ' + id + ' ' + hash + '" title="' + encodeQuotes(body) + '">' + 
					'<div class="avatar-container">' + 
						'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
					'</div>' + 
					
					'<p class="notification-text">' + text + '</p>' + 
					'<p class="notification-actions">' + action + '</p>' + 
			       '</div>';
			
			// Add the HTML code
			$('.notifications-content .tools-content-subitem').prepend(code);
			
			// Play a sound to alert the user
			soundPlay(2);
			
			// The yes click function
			$('.' + id + ' a.yes').click(function() {
				return actionNotification(type, data, 'yes', id);
			});
			
			// The no click function
			$('.' + id + ' a.no').click(function() {
				return actionNotification(type, data, 'no', id);
			});
			
			// Get the user avatar
			getAvatar(from, 'cache', 'true', 'forget');
		}
	}
	
	// We tell the user he has a new pending notification
	checkNotifications();
	
	logThis('New notification: ' + from, 3);
}

// Performs an action on a given notification
function actionNotification(type, data, value, id) {
	// We launch a function depending of the type
	if((type == 'subscribe') && (value == 'yes'))
		acceptSubscribe(data[0], data[1]);
	
	else if((type == 'subscribe') && (value == 'no'))
		sendSubscribe(data[0], 'unsubscribed');
	
	else if((type == 'invite/room') && (value == 'yes'))
		checkChatCreate(data[0], 'groupchat');
	
	else if(type == 'request')
		requestReply(value, data[0]);
	
	else if((type == 'rosterx') && (value == 'yes'))
		openRosterX(data[0]);
	
	// We remove the notification
	$('.notifications-content .' + id).remove();
	
	// We check if there's any other pending notification
	closeEmptyNotifications();
	checkNotifications();
	
	return false;
}

// Gets the pending social notifications
function getNotifications() {
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('items', {'node': NS_URN_NOTIFY, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleNotifications);
	
	logThis('Getting social notifications...');
}

// Handles the social notifications
function handleNotifications(iq) {
	// Any error?
	if(iq.getType() == 'error')
		logThis('An error occured while getting social notifications!', 2);
	
	// Selector
	var items = $(iq.getNode()).find('item');
	
	// Parse notifications
	items.each(function() {
		// TODO
		// newNotification(type, from, data, body);
	});
	
	logThis(items.size() + ' social notification(s) got!', 3);
}

// Sends a social notification
function sendNotification(xid, type, href, text) {
	// Notification ID
	var id = hex_md5(xid + data + getTimeStamp());
	
	// IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	iq.setTo(xid);
	
	// ATOM content
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_URN_NOTIFY, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	var entry = item.appendChild(iq.buildNode('entry', {'xmlns': NS_ATOM}));
	
	// Notification author (us)
	var Source = entry.appendChild(iq.buildNode('source', {'xmlns': NS_ATOM}));
	var author = Source.appendChild(iq.buildNode('author', {'xmlns': NS_ATOM}));
	author.appendChild(iq.buildNode('name', {'xmlns': NS_ATOM}, getName()));
	author.appendChild(iq.buildNode('uri', {'xmlns': NS_ATOM}, 'xmpp:' + getXID()));
	
	// Notification content
	entry.appendChild(iq.buildNode('content', {'type': 'text', 'xmlns': NS_ATOM}, text));
	entry.appendChild(iq.buildNode('link', {'rel': 'via', 'title': type, 'href': href, 'xmlns': NS_ATOM}));
	entry.appendChild(iq.buildNode('published', {'xmlns': NS_ATOM}, getXMPPTime('utc')));
	
	con.send(iq);
	
	logThis('Sending a social notification to ' + xid + ' (type: ' + type + ')...');
}

// Removes a social notification
function removeNotification(id) {
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var retract = pubsub.appendChild(iq.buildNode('retract', {'node': NS_URN_NOTIFY, 'xmlns': NS_PUBSUB}));
	retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	
	con.send(iq);
}
