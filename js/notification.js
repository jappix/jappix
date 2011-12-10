/*

Jappix - An Open μSocial Platform
These are the notification JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function openNotifications() {
	// We open the notification bubble
	$(".bubble").fadeOut('fast');
	$('.notifications-content').fadeIn('fast');
}

function closeNotifications() {
	$('.notifications-content').fadeOut('fast');
}

function closeEmptyNotifications() {
	if($('.one-notification').length == 0)
		closeNotifications();
}

function checkNotifications() {
	var notif = '#top-content .notifications';
	var nothing = '.notifications-content .nothing';
	
	if($('.one-notification').length > 0) {
		$(notif).addClass('actived');
		$(nothing).hide();
	}
	
	else {
		$(notif).removeClass('actived');
		$(nothing).show();
	}
}

function newNotification(type, from, jid, body) {
	// We generate an id hash
	var id = hex_md5(type + jid + from + getCompleteTime());
	
	// We generate the text to be displayed
	var text, action, code;
	
	// We grab the buddy jid without any resource
	from = cutResource(from);
	
	switch(type) {
		case 'subscribe':
			text = jid + ' ' + _e(52) + ' ' + _e(56);
			
			break;
		
		case 'invite/room':
			text = getBuddyName(from) + ' ' + _e(55) + ' ' + jid + ' ' + _e(56);
			break;
		
		case 'request':
			text = from + ' ' + _e(57) + ' ' + _e(56);
			break;
		
		default:
			break;
	}
	
	action = '<a class="yes">' + _e(53) + '</a><a class="no">' + _e(54) + '</a>';
	
	if(text) {
		// We create the html markup depending of the notification type
		code = '<div class="one-notification ' + id + ' removable" title="' + body + '">';
		code += '<p class="notification-text">' + text + '</p>';
		code += '<p class="notification-actions">' + action + '</p>';
		code += '</div>';
		
		// We display the notification
		if(!exists('.notifications-content .' + id)) {
			$('.notifications-content .middle').prepend(code);
			soundPlay(5);
			
			// The yes onclick function
			$('.' + id + ' a.yes').click(function() {
				actionNotification(type, jid, 'yes', id);
			});
			
			// The no onclick function
			$('.' + id + ' a.no').click(function() {
				actionNotification(type, jid, 'no', id);
			});
		}
	}
	
	// We tell the user he has a new pending notification
	checkNotifications();
}

function actionNotification(type, data, value, id) {
	// We launch a function depending of the type
	if(type == 'subscribe' && value == 'yes')
		acceptSubscribe(data);
	else if(type == 'subscribe' && value == 'no')
		removeSubscribe(data);
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
