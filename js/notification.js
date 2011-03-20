/*

Jappix - An open social platform
These are the notification JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 03/03/11

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
	var id = hex_md5(type + data[0] + from + getCompleteTime());
	
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
