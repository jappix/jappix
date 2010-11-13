/*

Jappix - An open social platform
These are the presence JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 11/11/10

*/

// Sends the user first presence
var FIRST_PRESENCE_SENT = false;

function firstPresence(checksum) {
	logThis('First presence sent.', 3);
	
	// Anonymous check
	var is_anonymous = isAnonymous();
	
	// Update our marker
	FIRST_PRESENCE_SENT = true;
	
	// Try to use the last status message
	var status = '';
	
	if(!is_anonymous)
		status = getPersistent('old-status', getXID());
	
	if(!status)
		status = '';
	
	// We tell the world that we are online
	sendPresence('', '', '', status, checksum);
	
	// Change the title of the presence input
	$('#my-infos .f-presence').attr('title', status);
	
	// We set the last activity stamp
	PRESENCE_LAST_ACTIVITY = getTimeStamp();
	
	// We store our presence
	setDB('presence-show', 1, '');
	setDB('presence-status', 1, status);
	
	// Finally, enable the presence selector
	$('#my-infos .f-presence select').removeAttr('disabled');
	
	// We get the stored bookmarks (because of the photo hash and some other stuffs, we must get it later)
	if(!is_anonymous)
		getStorage(NS_BOOKMARKS);
}

// Handles incoming presence packets
function handlePresence(presence) {
	// We define everything needed here
	var from = presence.getFrom();
	var hash = hex_md5(from);
	var node = presence.getNode();
	var xid = cutResource(from);
	var xidHash = hex_md5(xid);
	
	// We get the priority content
	var priority = presence.getPriority();
	if(!priority)
		priority = 0;
	
	// We get the show content
	var show = presence.getShow();
	if(!show)
		show = '';
	
	// We get the type content
	var type = presence.getType();
	if(!type)
		type = '';
	
	// We get the status content
	var status = presence.getStatus();
	if(!status)
		status = '';
	
	// We get the photo content
	var photo = $(node).find('x[xmlns=' + NS_VCARD_P + '] photo');
	var checksum = photo.text();
	var hasPhoto = photo.size();
	
	if(hasPhoto)
		hasPhoto = 'true';
	else
		hasPhoto = 'false';
	
	// We get the CAPS content
	var caps = $(node).find('c[xmlns=' + NS_CAPS + ']').attr('ver');
	if(!caps)
		caps = '';
	
	// This presence comes from another resource of my account with a difference avatar checksum
	if((xid == getXID()) && (hasPhoto == 'true') && (checksum != getDB('checksum', 1)))
		getAvatar(getXID(), 'force', 'true', 'forget');
	
	// This presence comes from a groupchat
	if(isPrivate(xid)) {
		var x_muc = $(node).find('x[xmlns=' + NS_MUC_USER + ']');
		var item = x_muc.find('item');
		var affiliation = item.attr('affiliation');
		var role = item.attr('role');
		var reason = item.find('reason').text();
		var iXID = item.attr('jid');
		var status_code = x_muc.find('status').attr('code');
		var nick = thisResource(from);
		var messageTime = getCompleteTime();
		var notInitial = true;
		
		// If this is an initial presence (when user join the room)
		if(exists('#' + xidHash + '[data-initial=true]'))
			notInitial = false;
		
		// If one user is quitting
		if(type && (type == 'unavailable')) {
			displayMucPresence(from, xidHash, hash, type, show, status, affiliation, role, reason, status_code, iXID, messageTime, nick, notInitial);
			
			removeDB('presence', from);
		}
		
		// If one user is joining
		else {
			displayMucPresence(from, xidHash, hash, type, show, status, affiliation, role, reason, status_code, iXID, messageTime, nick, notInitial);
			
			var xml = '<presence from="' + from + '"><priority>' + priority + '</priority><show>' + show + '</show><type>' + type + '</type><status>' + status + '</status><avatar>' + hasPhoto + '</avatar><checksum>' + checksum + '</checksum><caps>' + caps + '</caps></presence>';
			
			setDB('presence', from, xml);
		}
		
		// Scroll to the last presence message
		autoScroll(xidHash);
		
		// Manage the presence
		presenceFunnel(from, hash);
	}
	
	// This presence comes from an user or a gateway
	else {
		// Subscribed & Unubscribed stanzas
		if((type == 'subscribed') || (type == 'unsubscribed'))
			return;
		
		// Subscribe stanza
		else if(type == 'subscribe') {
			// This is a buddy we can safely authorize, because we added him to our roster
			if(exists('#buddy-list .buddy[data-xid=' + xid + ']'))
				acceptSubscribe(xid);
			
			// We do not this entity, we'd be better ask the user
			else
				newNotification('subscribe', xid, xid, status);
		}
		
		// Unsubscribe stanza
		else if(type == 'unsubscribe')
			sendRoster(xid, 'remove');
		
		// Other stanzas
		else {
			// Offline presence
			if(type == 'unavailable')
				removeDB('presence', from);
			
			// Other presence (available, error, subscribe...)
			else {
				var xml = '<presence from="' + from + '"><priority>' + priority + '</priority><show>' + show + '</show><type>' + type + '</type><status>' + status + '</status><avatar>' + hasPhoto + '</avatar><checksum>' + checksum + '</checksum><caps>' + caps + '</caps></presence>';
				
				setDB('presence', from, xml);
			}
			
			// We manage the presence
			presenceFunnel(xid, xidHash);
			
			// We display the presence in the current chat
			if(exists('#' + xidHash)) {
				var dStatus = filterStatus(xid, status, false);
				
				if(dStatus)
					dStatus = ' (' + dStatus + ')';
				
				$('#' + xidHash + ' .content').append('<div class="one-line system-message"><em>(' + getCompleteTime() + ') </em>' + getBuddyName(from).htmlEnc() + ' (' + from + ') ' + _e("is now") + ' ' + humanShow(show, type) + dStatus + '</div>');
			}
		}
	}
	
	// For logger
	if(!type)
		type = 'available';
	
	logThis('Presence received: ' + type + ', from ' + from);
}

// Displays a MUC presence
function displayMucPresence(from, roomHash, hash, type, show, status, affiliation, role, reason, status_code, iXID, messageTime, nick, initial) {
	// Generate the values
	var thisUser = '#page-engine #' + roomHash + ' .list .' + hash;
	var thisPrivate = $('#' + hash + ' .message-area');
	var write = '<div class="one-line system-message"><em>(' + messageTime + ') </em>' + nick.htmlEnc() + ' ';
	var real_xid = '';
	var notify = false;
	
	// Any XID submitted?
	if(iXID) {
		real_xid = ' data-realxid="' + iXID + '"';
		iXID = cutResource(iXID);
		write += ' (<a onclick="return checkChatCreate(\'' + iXID + '\', \'chat\');" href="xmpp:' + iXID + '">' + iXID + '</a>) ';
	}
	
	// User does not exists yet
	if(!exists(thisUser) && (!type || (type == 'available'))) {
		// Set the user in the MUC list
		$('#' + roomHash + ' .list .' + role + ' .title').after(
			'<div class="user ' + hash + '" data-xid="' + from + '" data-nick="' + nick.htmlEnc() + '"' + real_xid + '>' + 
				'<div class="name talk-images available">' + nick.htmlEnc() + '</div>' + 
				
				'<div class="avatar-container">' + 
					'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
				'</div>' + 
			'</div>'
		);
		
		// Click event
		$('#' + roomHash + ' .user.' + hash).click(function() {
			if(nick != getMUCNick(roomHash))
				checkChatCreate(from, 'private');
		});
		
		// We tell the user that someone entered the room
		if(!initial) {
			notify = true;
			write += _e("joined the chat room");
			
			// Any status?
			if(status)
				write += ' (' + filterThisMessage(status, nick.htmlEnc(), true) + ')';
			else
				write += ' (' + _e("no status") + ')';
		}
		
		// Enable the private chat input
		thisPrivate.removeAttr('disabled');
	}
	
	else if((type == 'unavailable') || (type == 'error')) {
		$(thisUser).remove();
		
		// Is it me?
		if(nick == getMUCNick(roomHash)) {
			// Disable the groupchat input
			$('#' + roomHash + ' .message-area').attr('disabled', true);
			
			// Remove all the groupchat users
			$('#' + roomHash + ' .list .user').remove();
		}
		
		// Someone has been kicked or banned?
		if((status_code == '301') || (status_code == '307')) {
			notify = true;
			
			// Kicked?
			if(status_code == '307')
				write += _e("has been kicked");
			
			// Banned?
			if(status_code == '301')
				write += _e("has been banned");
			
			// Any reason?
			if(reason)
				write += ' (' + filterThisMessage(reason, nick.htmlEnc(), true) + ')';
			else
				write += ' (' + _e("no reason") + ')';
		}
		
		// We tell the user that someone left the room
		else if(!initial) {
			notify = true;
			write += _e("left the chat room");
			
			// Any status?
			if(status)
				write += ' (' + filterThisMessage(status, nick.htmlEnc(), true) + ')';
			else
				write += ' (' + _e("no status") + ')';
		}
		
		// Disable the private chat input
		thisPrivate.attr('disabled', true);
	}
	
	write += '</div>';
	
	if(notify)
		$('#' + roomHash + ' .content').append(write);
	
	// Set the good status show icon
	// The switch is a security to clients like Poezio which send "None" show content :)
	switch(show) {
		case 'chat':
		case 'away':
		case 'xa':
		case 'dnd':
			break;
		
		default:
			show = 'available';
			break;
	}
	
	$(thisUser + ' .name').attr('class', 'name talk-images ' + show);
	
	// Set the good status text
	var uTitle = nick;
	
	// Any XID to add?
	if(iXID)
		uTitle += ' (' + iXID + ')';
	
	// Any status to add?
	if(status)
		uTitle += ' - ' + status;
	
	$(thisUser).attr('title', uTitle);
	
	// Show or hide the role category, depending of its content
	$('#' + roomHash + ' .list .role').each(function() {
		if($(this).find('.user').size())
			$(this).show();
		else
			$(this).hide();
	});
}

// Filters a given status
function filterStatus(xid, status, cut) {
	var dStatus = '';
	
	if(!status)
		status = '';
	
	else {
		if(cut)
			dStatus = truncate(status, 50);
		else
			dStatus = status;
		
		dStatus = filterThisMessage(dStatus, getBuddyName(xid).htmlEnc(), true);
	}
	
	return dStatus;
}

// Displays a user's presence
function displayPresence(value, type, show, status, hash, xid, avatar, checksum, caps) {
	// Display the presence in the roster
	var path = '#buddy-list .' + hash;
	var buddy = $('#buddy-list .content .' + hash);
	var dStatus = filterStatus(xid, status, true);
	var biStatus;
	
	// The buddy presence behind his name
	$(path + ' .name .buddy-presence').replaceWith('<p class="buddy-presence talk-images ' + type + '">' + value + '</p>');
	
	// The buddy presence in the buddy infos
	if(dStatus)
		biStatus = dStatus;
	else
		biStatus = value;
	
	$(path + ' .bi-status').replaceWith('<p class="bi-status talk-images status-' + type + '" title="' + status + '">' + biStatus + '</p>');
	
	// When the buddy disconnect himself, we hide him
	if((type == 'unavailable') || (type == 'error')) {
		// Set a special class to the buddy
		buddy.addClass('hidden-buddy');
		
		// No filtering is launched?
		if(!SEARCH_FILTERED)
			buddy.hide();
		
		// All the buddies are shown?
		if(BLIST_ALL)
			buddy.show();
		
		// Get the buddy avatar (only if a chat is opened)
		if(exists('#' + hash))
			getAvatar(xid, 'cache', 'true', 'forget');
	}
	
	// If the buddy is online
	else {
		// When the buddy is online, we show it
		buddy.removeClass('hidden-buddy');
		
		// No filtering is launched?
		if(!SEARCH_FILTERED)
			buddy.show();
		
		// Get the online buddy avatar if not a gateway
		getAvatar(xid, 'cache', avatar, checksum);
	}
	
	// Display the presence in the chat
	if(exists('#' + hash)) {
		// We generate a well formed status message
		if(dStatus) {
			// No need to write the same status two times
			if(dStatus == value)
				dStatus = '';
			else
				dStatus = ' (' + dStatus + ')';
		}
		
		// We show the presence value
		$('#' + hash + ' .bc-infos').replaceWith('<p class="bc-infos ' + type + '" title="' + status + '">' + value + dStatus + '</p>');
		
		// Get the disco#infos for this user
		var highest = getHighestResource(xid);
		
		if(highest)
			getDiscoInfos(highest, caps);
		else
			displayDiscoInfos(xid, '');
	}
	
	// Display the presence in the switcher
	if(exists('#page-switch .' + hash))
		$('#page-switch .' + hash + ' .icon').removeClass('available unavailable error away busy').addClass(type);
	
	// Update roster groups
	if(!SEARCH_FILTERED)
		updateGroups();
	else
		funnelFilterBuddySearch();
}

// Convert the presence "show" element into a human-readable output
function humanShow(show, type) {
	if(type == 'unavailable')
		show = _e("Unavailable");
	
	else if(type == 'error')
		show = _e("Error");
	
	else {
		switch(show) {
			case 'chat':
				show = _e("Talkative");
				break;
		
			case 'away':
				show = _e("Away");
				break;
		
			case 'xa':
				show = _e("Busy");
				break;
		
			case 'dnd':
				show = _e("Not available");
				break;
		
			default:
				show = _e("Available");
				break;
		}
	}
	
	return show;
}

// Sort of "artificial intelligence" (LOL) to make the presence data go in the right way
function presenceIA(type, show, status, hash, xid, avatar, checksum, caps) {
	// Is there a status defined?
	if(!status)
		status = humanShow(show, type);
	
	// Then we can handle the events
	if(type == 'error')
		displayPresence(_e("Error"), 'error', show, status, hash, xid, avatar, checksum, caps);
	
	else if(type == 'unavailable')
		displayPresence(_e("Unavailable"), 'unavailable', show, status, hash, xid, avatar, checksum, caps);
	
	else {
		switch(show) {
			case 'chat':
				displayPresence(_e("Talkative"), 'available', show, status, hash, xid, avatar, checksum, caps);
				break;
			
			case 'away':
				displayPresence(_e("Away"), 'away', show, status, hash, xid, avatar, checksum, caps);
				break;
			
			case 'xa':
				displayPresence(_e("Not available"), 'busy', show, status, hash, xid, avatar, checksum, caps);
				break;
			
			case 'dnd':
				displayPresence(_e("Busy"), 'busy', show, status, hash, xid, avatar, checksum, caps);
				break;
			
			default:
				displayPresence(_e("Available"), 'available', show, status, hash, xid, avatar, checksum, caps);
				break;
		}
	}
}

// Gets the highest resource priority for an user
function highestPriority(xid) {
	var maximum = null;
	var selector, priority, type, highest;
	
	// This is a groupchat presence
	if(xid.match(/\//))
		highest = getDB('presence', xid);
	
	// This is a "normal" presence: get the highest priority resource
	else {
		for(var i = 0; i < sessionStorage.length; i++) {
			// Get the pointer values
			var current = sessionStorage.key(i);
			
			// If the pointer is on a stored presence
			if(explodeThis('_', current, 0) == 'presence') {
				// Get the current XID
				var now = cutResource(explodeThis('_', current, 1));
				
				// If the current XID equals the asked XID
				if(now == xid) {
					var xml = sessionStorage.getItem(current);
					var priority = parseInt($(xml).find('priority').text());
					
					// Higher priority
					if((priority >= maximum) || (maximum == null)) {
						maximum = priority;
						highest = xml;
					}
				}
			}
		}
	}
	
	// The user might be offline if no highest
	if(!highest)
		highest = '<presence><type>unavailable</type></presence>';
	
	return highest;
}

// Gets the resource from a XID which has the highest priority
function getHighestResource(xid) {
	var xml = $(highestPriority(xid));
	var highest = xml.attr('from');
	var type = xml.find('type').text();
	
	// If the use is online, we can return its highest resource
	if(!type || type == 'available' || type == 'null')
		return highest;
	else
		return false;
}

// Makes something easy to process for the presence IA
function presenceFunnel(xid, hash) {
	// Get the highest priority presence value
	var xml = $(highestPriority(xid));
	var type = xml.find('type').text();
	var show = xml.find('show').text();
	var status = xml.find('status').text();
	var avatar = xml.find('avatar').text();
	var checksum = xml.find('checksum').text();
	var caps = xml.find('caps').text();
	
	// Display the presence with that stored value
	if(!type && !show)
		presenceIA('', 'available', status, hash, xid, avatar, checksum, caps);
	else
		presenceIA(type, show, status, hash, xid, avatar, checksum, caps);
}

// Sends a defined presence packet
function sendPresence(to, type, show, status, checksum, password, handle) {
	// Get some stuffs
	var priority = getDB('priority', 1);
	
	if(!priority)
		priority = '1';
	
	if(!checksum)
		checksum = getDB('checksum', 1);
	
	// New presence
	var presence = new JSJaCPresence();
	
	// Avoid "null" or "none" if nothing stored
	if(!checksum || (checksum == 'none'))
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
	
	// CAPS (entity capabilities)
	presence.appendNode('c', {'xmlns': NS_CAPS, 'hash': 'sha-1', 'node': 'http://www.jappix.com/', 'ver': myCaps()});
	
	// vcard-temp:x:update node
	var x = presence.appendNode('x', {'xmlns': NS_VCARD_P});
	x.appendChild(presence.buildNode('photo', {'xmlns': NS_VCARD_P}, checksum));
	
	// Password
	if(password) {
		var xMUC = presence.appendNode('x', {'xmlns': NS_MUC});
		xMUC.appendChild(presence.buildNode('password', {'xmlns': NS_MUC}, password));
	}
	
	// If away, send a last activity time
	if((show == 'away') || (show == 'xa')) {
		/* REF: http://xmpp.org/extensions/xep-0256.html */
		
		presence.appendNode(presence.buildNode('query', {
			'xmlns': NS_LAST,
			'seconds': getPresenceLast()
		}));
	}
	
	// Else, set a new last activity stamp
	else
		PRESENCE_LAST_ACTIVITY = getTimeStamp();
	
	// Send the presence packet
	if(handle)
		con.send(presence, handle);
	else
		con.send(presence);
	
	if(!type)
		type = 'available';
	
	logThis('Presence sent: ' + type, 3);
}

// Performs all the actions to get the presence data
function presenceSend(checksum, autoidle) {
	// We get the values of the inputs
	var show = $('.change-presence').val();
	var status = $('.textPresence').val();
	
	// Send the presence
	sendPresence('', '', show, status, checksum);
	
	// We set the good icon
	presenceIcon(show);
	
	// We hide the form
	$('#my-infos-text-first').hide();
	
	// We change the title of the presence element
	$('#my-infos .f-presence').attr('title', status);
	
	// We store our presence
	if(!autoidle) {
		// Store our old status
		setDB('presence-show', 1, show);
		setDB('presence-status', 1, status);
		
		// Update our stored status message
		setPersistent('old-status', getXID(), status);
	}
	
	// We send the presence to our active MUC
	$('.page-engine-chan[data-type=groupchat]').each(function() {
		// Not disabled?
		if(!$(this).find('.message-area').attr('disabled'))
			sendPresence($(this).attr('data-xid') + '/' + $(this).attr('data-nick'), '', show, status);
	});
}

// Changes the presence icon
function presenceIcon(value) {
	$('#my-infos .icon-status').hide();
	$('#my-infos .f-presence .icon').attr('class', 'icon talk-images status-' + value);
}

// Sends a subscribe stanza
function sendSubscribe(to, type) {
	var status = '';
	
	if(type == 'subscribe')
		status = _e("I would like to add you as a friend.");
	
	sendPresence(to, type, '', status);
}

// Accepts the subscription from another entity
function acceptSubscribe(to) {
	// We update our chat
	$('#' + hex_md5(to) + ' .tools-add').hide();
	
	// We send a subsribed presence (to confirm)
	sendSubscribe(to, 'subscribed');
	
	// We send a subscription request (subscribe both sides)
	sendSubscribe(to, 'subscribe');
}

// Sends automatic away presence
var AUTO_IDLE = false;

function autoIdle() {
	// Stop if an away presence was set manually
	var last_presence = $('.change-presence').val();
	
	if(!AUTO_IDLE && ((last_presence == 'away') || (last_presence == 'xa')))
		return;
	
	var idle_presence;
	var activity_limit;
	
	// Can we extend to auto extended away mode?
	if(AUTO_IDLE && (last_presence == 'away')) {
		idle_presence = 'xa';
		activity_limit = 1200;
	}
	
	else {
		idle_presence = 'away';
		activity_limit = 600;
	}
	
	// The user is really inactive and has set another presence than extended away
	if(((!AUTO_IDLE && (last_presence != 'away')) || (AUTO_IDLE && (last_presence == 'away'))) && (getLastActivity() >= activity_limit)) {
		// Then tell we use an auto presence
		AUTO_IDLE = true;
		
		// Get the old status message
		var status = getDB('presence-status', 1);
		
		if(!status)
			status = '';
		
		// Change the presence input
		$('.change-presence').val(idle_presence);
		$('.textPresence').val(status);
		
		// Then send the xa presence
		presenceSend('', true);
		
		logThis('Auto-idle presence sent: ' + idle_presence, 3);
	}
}

// Restores the old presence on a document bind
function eventIdle() {
	// If we were idle, restore our old presence
	if(AUTO_IDLE) {
		// Get the values
		var show = getDB('presence-show', 1);
		var status = getDB('presence-status', 1);
		
		// Change the presence input
		$('.change-presence').val(show);
		$('.textPresence').val(status);
		
		// Then restore the old presence
		presenceSend('', true);
		
		if(!show)
			show = 'available';
		
		logThis('Presence restored: ' + show, 3);
	}
	
	// Apply some values
	AUTO_IDLE = false;
	LAST_ACTIVITY = getTimeStamp();
}

// Lives the auto idle functions
function liveIdle() {
	// Apply the autoIdle function every minute
	AUTO_IDLE = false;
	$('#my-infos .f-presence').everyTime('60s', autoIdle);
	
	// On body bind (click & key event)
	$('body').live('mousedown', eventIdle)
		 .live('mousemove', eventIdle)
		 .live('keydown', eventIdle);
}

// Kills the auto idle functions
function dieIdle() {
	// Remove the event detector
	$('body').die('mousedown', eventIdle)
		 .die('mousemove', eventIdle)
		 .die('keydown', eventIdle);
}

// Plugin launcher
function launchPresence() {
	// When a key is pressed...
	$('.textPresence').keyup(function(e) {
		// Enter : continue
		if((e.keyCode == 13) | (e.keyCode == 27)) {
			presenceSend();
			
			return false;
		}
	});
	
	// When the user wants to change his presence...
	$('.change-presence').change(function() {
		// Show the target element
		$('#my-infos-text-first').show();
		
		// We put the focus on the aimed input
		$('#my-infos-text-first .textPresence').focus();
		
		// Get the old status message
		var status = getPersistent('old-status', getXID());
		
		if(!status)
			status = '';
		
		// Then we reset the presence input
		$('.textPresence').val(status);
	});
}
