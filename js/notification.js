/*

Jappix - An open social platform
These are the notification JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 09/10/10

*/

// Resets the notifications alert if no one remaining
function closeEmptyNotifications() {
	if($('.one-notification').length == 0)
		closeBubbles();
}

// Checks if there are pending notifications
function checkNotifications() {
	var notif = $('#top-content .notifications');
	var nothing = $('.notifications-content .nothing');
	
	if($('.one-notification').size()) {
		notif.addClass('actived');
		nothing.hide();
	}
	
	else {
		notif.removeClass('actived');
		nothing.show();
	}
}

// Creates a new notification
function newNotification(type, from, xid, body) {
	if(!type || !from)
		return;
	
	logThis('New notification: ' + from);
	
	// We generate an id hash
	var id = hex_md5(type + xid + from + getCompleteTime());
	
	// We generate the text to be displayed
	var text, action, code;
	
	// We grab the buddy XID without any resource
	from = cutResource(from);
	
	switch(type) {
		case 'subscribe':
			text = xid + ' ' + _e("would like to add you as a friend.") + ' ' + _e("Do you accept?");
			
			break;
		
		case 'invite/room':
			text = getBuddyName(from).htmlEnc() + ' ' + _e("would like you to join this chatroom:") + ' ' + xid + ' ' + _e("Do you accept?");
			break;
		
		case 'request':
			text = from + ' ' + _e("would like to get authorization.") + ' ' + _e("Do you accept?");
			break;
		
		default:
			break;
	}
	
	action = '<a class="yes">' + _e("Yes") + '</a><a class="no">' + _e("No") + '</a>';
	
	if(text) {
		// We create the html markup depending of the notification type
		code = '<div class="one-notification ' + id + ' removable" title="' + body + '">';
		code += '<p class="notification-text">' + text + '</p>';
		code += '<p class="notification-actions">' + action + '</p>';
		code += '</div>';
		
		// We display the notification
		if(!exists('.notifications-content .' + id)) {
			$('.notifications-content .tools-content-subitem').prepend(code);
			soundPlay(2);
			
			// The yes onclick function
			$('.' + id + ' a.yes').click(function() {
				actionNotification(type, xid, 'yes', id);
			});
			
			// The no onclick function
			$('.' + id + ' a.no').click(function() {
				actionNotification(type, xid, 'no', id);
			});
		}
	}
	
	// We tell the user he has a new pending notification
	checkNotifications();
}

// Performs an action on a given notification
function actionNotification(type, data, value, id) {
	// We launch a function depending of the type
	if(type == 'subscribe' && value == 'yes')
		acceptSubscribe(data);
	
	else if(type == 'subscribe' && value == 'no')
		sendSubscribe(data, 'unsubscribed');
	
	else if(type == 'invite/room' && value == 'yes')
		checkChatCreate(data, 'groupchat');
	
	else if(type == 'request')
		requestReply(value, data);
	
	// We remove the notification
	$('.notifications-content .' + id).remove();
	
	// We check if there's any other pending notification
	closeEmptyNotifications();
	checkNotifications();
}
