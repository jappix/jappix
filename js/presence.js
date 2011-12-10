/*

Jappix - An Open μSocial Platform
These are the presence JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function firstPresence(checksum) {
	// We tell the world that we are online
	sendPresence('', '', '', '', checksum);
	
	// We set the life number of the DOM
	setDB('domlife', 1, getDOMLife());
	
	// We store our presence
	setDB('presence-show', 1, '');
	setDB('presence-status', 1, '');
}

function handlePresence(aJSJaCPacket) {
	// We define everything needed here
	var presenceFromJID = aJSJaCPacket.getFromJID() + '';
	var presenceFromJIDHash = hex_md5(presenceFromJID);
	var presenceNode = aJSJaCPacket.getNode();
	var splitPresenceFromJID = presenceFromJID.split('/');
	var jidHash = hex_md5(splitPresenceFromJID[0]);
	var jidNoRes = splitPresenceFromJID[0];
	
	// We get the presence content
	var priority = aJSJaCPacket.getPriority();
	if(!priority)
		priority = 0;
	
	var show = aJSJaCPacket.getShow();
	if(show == null)
		show = '';
	
	var type = aJSJaCPacket.getType();
	if(type == null)
		type = '';
	
	var status = aJSJaCPacket.getStatus();
	
	var checksum = $(presenceNode).find('x[xmlns=' + NS_VCARD_P + '] photo').text();
	
	// We let Jappix know if the presence comes from a groupchat
	if(exists('#' + jidHash + ' .list')) {
		var affiliation = $(aJSJaCPacket.getNode()).find('item').attr('affiliation');
		var role = $(aJSJaCPacket.getNode()).find('item').attr('role');
		var iNick = $(aJSJaCPacket.getNode()).find('item').attr('nick');
		var sNick = presenceFromJID.split("/");
		var nick = sNick[1];
		var messageTime = getCompleteTime();
		
		// If one user is quitting
		if(type && type == 'unavailable') {
			// If we've been banned from the room
			if(affiliation == 'outcast' && nick == getNick() && !iNick) {
				quitThisChat(jidNoRes, jidHash, 'groupchat');
				openThisInfo(9);
			}
			
			// If we've been kicked from the room
			else if(affiliation == 'none' && nick == getNick() && !iNick) {
				quitThisChat(jidNoRes, jidHash, 'groupchat');
				openThisInfo(10);
			}
			
			// Else, that's a room user that has left
			else {
				// We remove the user from the list
				$('#' + jidHash + ' .' + presenceFromJIDHash).remove();
				
				// We tell the user that someone left the room
				$("#" + jidHash + " .content " + ".thisFalseDivIsForJQuery").before('<p class="one-line system-message"><em>(' + messageTime + ') </em>' + nick + ' ' + _e(46) + '</p>');
			}
		}
		
		// If one user is joining
		else
			displayMucPresence(presenceFromJID, jidHash, presenceFromJIDHash, show, status, affiliation, role, jidHash, messageTime, nick, checksum);
		
		// Scroll to the last presence message
		autoScroll(jidHash);
	}
	
	// Else, that comes from a buddy that is in our roster
	else {
		if(type == 'subscribe')
			newNotification('subscribe', jidNoRes, jidNoRes, status);
		else if(type == 'unsubscribe')
			handleUnsubscribe(jidNoRes);
		
		else {
			// Offline presence
			if(type == 'unavailable')
				removeDB('presence', presenceFromJID);
			
			// Other presence (available, error, subscribe...)
			else {
				var xml = '<presence jid="' + presenceFromJID + '"><priority>' + priority + '</priority><show>' + show + '</show><type>' + type + '</type><status>' + status + '</status><avatar>' + checksum + '</avatar></presence>';
			
				setDB('presence', presenceFromJID, xml);
			}
			
			// We manage the presence
			presenceFunnel(jidNoRes, jidHash);
		}
	}
}

function displayMucPresence(from, roomHash, hash, show, status, affiliation, role, jidHash, messageTime, nick, checksum) {
	var thisUser = '#chat-engine #' + roomHash + ' .list .' + hash;
	var chatterNickSplit = from.split('/');
	var chatterNick = chatterNickSplit[1];
	
	if(!exists(thisUser) && status != 'offline') {
		// Set the user in the MUC list
		$('#chat-engine #' + roomHash + ' .list .' + role + ' .title').after(
			'<div class="user ' + hash + '" onclick="openUserInfos(\'' + from + '\');">' + 
				'<div class="name talk-images available">' + chatterNick + '</div>' + 
				'<div class="avatar-container">' + 
					'<img class="avatar removable" src="./img/others/default-avatar.png" alt="" />' + 
				'</div>' + 
				'<input class="userJid-' + chatterNick + '"  type="hidden" value="' + from + '" />' + 
			'</div>'
		);
		
		// We tell the user that someone entered the room
		$('#' + jidHash + ' .content ' + '.thisFalseDivIsForJQuery').before('<p class="one-line system-message"><em>(' + messageTime + ') </em>' + nick + ' ' + _e(45) + '</p>');
		
		// Get the user avatar
		if(checksum)
			getAvatar(from, 'cache', checksum);
	}
	
	if(status == 'offline')
		$(thisUser).remove();
	
	// Set the good status show icon
	if(!show)
		show = 'available';
	
	$(thisUser + ' .name').attr('class', 'name talk-images ' + show);
	
	// Set the good status text
	var uTitle;
	
	if(!status)
		uTitle = chatterNick;
	else
		uTitle = chatterNick + ' - ' + status.htmlEnc();
	
	$(thisUser).attr('title', uTitle);
}

function displayPresence(value, type, show, status, hash, jid, checksum) {
	// WE DISPLAY THE PRESENCE IN THE ROSTER
		var path = '#buddy-list .' + hash;
		var biStatus;
		
		// The buddy presence behind his name
		$(path + ' .name .buddy-presence').replaceWith('<p class="buddy-presence talk-images ' + type + '">' + value + '</p>');
		
		// The buddy presence in the buddy infos
		if(status)
			biStatus = status;
		else
			biStatus = value;
		
		$(path + ' .bi-status').replaceWith('<p class="bi-status talk-images status-' + type + '" title="' + status + '">' + biStatus + '</p>');
		
		// When the buddy disconnect himself, we hide him
		if(type == 'unavailable' || type == 'error') {
			if(!$('#buddy-list').hasClass('show-all-buddies'))
				$("#buddy-list .content ." + hash).addClass('hidden-buddy');
			else
				$("#buddy-list .content ." + hash).addClass('unavailable-buddy');
		}
		
		// If the buddy is online
		else {
			// We play a sound to tell the user someone is online
			if($('#buddy-list .content .' + hash).hasClass('hidden-buddy'))
				soundPlay(0);
			
			// When the buddy is online, we show it
			$("#buddy-list .content ." + hash).removeClass('hidden-buddy unavailable-buddy');
			
			// Get the online buddy avatar if not yet ordered to retrieve (security)
			getAvatar(jid, 'cache', checksum);
		}
	
	// WE DISPLAY THE PRESENCE IN THE CHAT
		if(exists("#" + hash)) {
			// We get the status message
			if(!status)
				status = '';
			
			// We show the presence value
			$("#" + hash + " .bc-infos").replaceWith(
				'<p class="bc-infos ' + type + '" title="' + status + '">' + value + '</p>'
			);
		}
	
	// WE DISPLAY THE PRESENCE IN THE SWITCHER
		if(exists('#chat-switch .' + hash))
			$('#chat-switch .' + hash + ' .icon').removeClass('available away busy unavailable').addClass(type);
	
	// WE UPDATE OUR GROUPS
		updateGroups();
}

function presenceIA(type, show, status, hash, jid, checksum) {
	// Is there a status defined ?
	if(!status && type == 'unavailable')
		status = _e(19);
	
	else if(!status) {
		switch(show) {
			case 'chat':
				status = _e(15);
				break;
			
			case 'away':
				status = _e(16);
				break;
			
			case 'xa':
				status = _e(18);
				break;
			
			case 'dnd':
				status = _e(17);
				break;
			
			default:
				status = _e(14);
				break;
		}
	}
	
	// Then we can handle the events
	if(type == 'error')
		displayPresence(_e(36), 'error', show, status, hash, jid, checksum);
	else if(type == 'unavailable')
		displayPresence(_e(19), 'unavailable', show, status, hash, jid, checksum);
	else {
		switch(show) {
			case 'chat':
				displayPresence(_e(15), 'available', show, status, hash, jid, checksum);
				break;
			
			case 'away':
				displayPresence(_e(16), 'away', show, status, hash, jid, checksum);
				break;
			
			case 'xa':
				displayPresence(_e(17), 'busy', show, status, hash, jid, checksum);
				break;
			
			case 'dnd':
				displayPresence(_e(18), 'busy', show, status, hash, jid, checksum);
				break;
			
			default:
				displayPresence(_e(14), 'available', show, status, hash, jid, checksum);
				break;
		}
	}
}

function highestPriority(jid) {
	var maximum = -1;
	var selector, priority, type, highest;
	
	// Calculate the total number of active resources this user has
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored presence
		if(splitted[0] == 'presence') {
			// Get the current JID
			var now = splitted[1].split('/')[0];
			
			// If the current JID equals the asked JID
			if(now == jid) {
				var xml = sessionStorage.getItem(current);
				var priority = $(xml).find('priority').text();
				
				// Higher priority
				if(priority >= maximum) {
					maximum = priority;
					highest = xml;
				}
			}
		}
	}
	
	// The user might be offline if no highest
	if(!highest)
		highest = '<presence><type>unavailable</type></presence>';
	
	return highest;
}

function getHighestResource(jid) {
	var xml = $(highestPriority(jid));
	var highest = xml.attr('jid');
	var type = xml.find('type').text();
	
	// If the use is online, we can return its highest resource
	if(!type || type == 'available' || type == 'null')
		return highest;
	else
		return false;
}

function presenceFunnel(jid, hash) {
	// Get the highest priority presence value
	var xml = $(highestPriority(jid));
	var type = xml.find('type').text();
	var show = xml.find('show').text();
	var status = xml.find('status').text();
	var checksum = xml.find('avatar').text();
	
	// Display the presence with that stored value
	if (!type && !show)
		presenceIA('', 'available', status, hash, jid, checksum);
	else
		presenceIA(type, show, status, hash, jid, checksum);
}

function sendPresence(to, type, show, status, checksum, password, handle) {
	// Get some stuffs
	var priority = getDB('priority', 1);
	
	if(!checksum)
		checksum = getDB('checksum', 1);
	
	// New presence
	var presence = new JSJaCPresence();
	
	// Avoid "null" if nothing stored
	if(!checksum)
		checksum = '';
	
	// Presence headers
	if(to)
		presence.setTo(to);
	if(type)
		presence.setType(type);
	if(show)
		presence.setShow(show);
	if(status)
		presence.setStatus(status);
	
	presence.setPriority(priority);
	presence.setID(genID());
	
	// CAPS (entity capabilities)
	presence.appendNode('c', {'xmlns': NS_CAPS, 'hash': 'sha-1', 'node': 'http://www.jappix.com/', 'ver': processCaps()});
	
	// vcard-temp:x:update node
	var x = presence.appendNode('x', {'xmlns': NS_VCARD_P});
	x.appendChild(presence.buildNode('photo', {'xmlns': NS_VCARD_P}, checksum));
	
	// Password
	if(password) {
		var xMUC = presence.appendNode('x', {'xmlns': NS_MUC});
		xMUC.appendChild(presence.buildNode('password', {'xmlns': NS_MUC}, password));
	}
	
	// If away, send a last activity time
	if(show == 'away' || show == 'xa')
		presence.appendNode(presence.buildNode('query', {
			'xmlns': NS_LAST,
			'seconds': getLastActivity()
		}));
	
	// Else, reset the last activity storage
	else
		setDB('domlife', 1, getDOMLife());
	
	// Send the presence packet
	if(handle)
		con.send(presence, handle);
	else
		con.send(presence);
}

// The function to send the presence
function presenceSend(checksum) {
	// We get the values of the inputs
	var show = $('.change-presence').val();
	var status = $('.textPresence').val();
	
	// Send the presence
	sendPresence('', '', show, status, checksum);
	
	// We set the good icon
	presenceIcon(show);
	
	// We hide the form
	$("#my-infos-text-first").fadeOut('fast');
	
	// We change the title of the presence element
	$('#my-infos .f-presence').attr('title', status);
	
	// We store our presence
	setDB('presence-show', 1, show);
	setDB('presence-status', 1, status);
	
	// We send the presence to our active MUC
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored message
		if(splitted[0] == 'muc') {
			var to = splitted[1] + '/' + sessionStorage.getItem(current);
			
			sendPresence(to, '', show, status);
		}
	}
}

/*

NOTICE: THESE FUNCTIONS ARE A BIT HEAVY, WE NEED SOME HELP ABOUT HOW DETECTING IF THE USER IS AWAY

function autoIdle() {
	if(con.connected()) {
		// Get the last time the user put his mouse hover the document
		var last = getDB('autoidle', 1);
		var current = getDOMLife();
		
		// The user is really inactive and has set another presence than extended away
		if(((current - last) >= 600) && ($('.change-presence').val() != 'xa') && getDB('infoidle', 1) == 'false') {
			// Then tell our database we use an auto presence
			setDB('infoidle', 1, true);
			
			// Change the presence input
			$('.change-presence').val('xa');
			$('.textPresence').val('');
			
			// Then send the xa presence
			presenceSend();
		}
	}
}

// On document bind
$(document).mouseup(function() {
	if(con.connected()) {
		// If we were idle, restore our old presence
		if(getDB('infoidle', 1) == 'true') {
			// Get the values
			var show = getDB('presence-show', 1);
			var status = getDB('presence-status', 1);
			
			// Change the presence input
			$('.change-presence').val(show);
			$('.textPresence').val(status);
			
			// Then restore the old presence
			presenceSend();
		}
		
		setDB('autoidle', 1, getDOMLife());
		setDB('infoidle', 1, false);
	}
});

// Apply the autoIdle function every 10 seconds
$(document).everyTime('300s', autoIdle);

*/
