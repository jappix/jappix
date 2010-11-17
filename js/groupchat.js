/*

Jappix - An open social platform
These are the groupchat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/11/10

*/

// Displays the MUC admin elements
function displayMucAdmin(affiliation, id, xid, statuscode) {
	// We must be in the "login" mode
	if(isAnonymous())
		return;
	
	// We check if the user is the room admin to give him privileges
	if(affiliation == 'owner')
		$('#' + id + ' .tools-mucadmin').show();
	
	// We check if the room hasn't been yet created
	if(statuscode == '201')
		openThisInfo(4);
	
	// We add the click event
	$('#' + id + ' .tools-mucadmin').click(function() {
		openMucAdmin(xid);
	});
}

// Initializes a connexion with a MUC groupchat
function getMUC(room, nickname, password) {
	// Room hash
	var hash = hex_md5(room);
	
	// Reset the elements
	$('#' + hash + ' .muc-ask').remove();
	$('#' + hash + ' .compose').show();
	
	// No nickname?
	if(!nickname) {
		// Get some values
		if(!isAnonymous())
			nickname = getNick();
		else
			nickname = ANONYMOUS_NICK;
		
		// If the nickname could not be retrieved, ask it
		if(!nickname)
			generateMUCAsk('nickname', room, hash, nickname, password);
	}
	
	// Got our nickname?
	if(nickname) {
		// Get our general presence
		var show = getDB('presence-show', 1);
		var status = getDB('presence-status', 1);
	
		// Set my nick
		$('#' + hash).attr('data-nick', nickname);
	
		// Send the appropriate presence
		sendPresence(room + '/' + nickname, '', show, status, '', password, handleMUC);
	}
	
	return false;
}

// Handles the MUC main elements
function handleMUC(presence) {
	// We get the xml content
	var xml = presence.getNode();
	var from = fullXID(getStanzaFrom(presence));
	var room = bareXID(from);
	var nickname = thisResource(from);
	var hash = hex_md5(room);
	
	// No ID: must fix M-Link bug
	if(presence.getID() == null)
		presence.setID(1);
	
	logThis('First MUC presence: ' + from, 3);
	
	// Catch the errors
	if(!handleError(xml)) {
		// Define some stuffs
		var affiliation = $(xml).find('item').attr('affiliation');
                var statuscode = $(xml).find('status').attr('code');
		
		// Handle my presence
		handlePresence(presence);
		
		// Check if I am a room owner
		displayMucAdmin(affiliation, hash, room, statuscode);
		
		// Tell the MUC we can notify the incoming presences
		$('#' + hash).attr('data-initial', 'true');
		
		// Enable the chatting input
		$('#' + hash + ' .message-area').removeAttr('disabled').focus();
	}
	
	// A password is required
	else if($(xml).find('error[type=auth] not-authorized').size())
		generateMUCAsk('password', room, hash, nickname);
	
	// There's a nickname conflict
	else if($(xml).find('error[type=cancel] conflict').size())
		generateMUCAsk('nickname', room, hash);
}

// Generates a correct MUC asker
function generateMUCAsk(type, room, hash, nickname, password) {
	// Generate the path to the elements
	var path_to = '#' + hash + ' .muc-ask';
	
	// Define the label text
	var label_text;
	
	switch(type) {
		case 'nickname':
			label_text = _e("Nickname");
			break;
		
		case 'password':
			label_text = _e("Password");
			break;
	}
	
	// Create the HTML markup
	$('#' + hash + ' .compose').hide();
	
	$('#' + hash).append(
		'<div class="muc-ask text">' + 
			'<label>' + label_text + '</label>' + 
			'<input class="focusable" type="text" />' + 
		'</div>'
	);
	
	// When a key is pressed in the input
	$(path_to + ' input').keyup(function(e) {
		var value_input = $(this).val();
		
		// Enter key pressed
		if((e.keyCode == 13) && value_input) {
			if(type == 'nickname')
				nickname = value_input;
			else if(type == 'password')
				password = value_input;
			
			return getMUC(room, nickname, password);
		}
	})
	
	// Focus on the input
	.focus();
}

// Generates the colors for a given user XID
function generateColor(xid) {
	var colors = Array(
			'ac0000',
			'a66200',
			'007703',
			'00705f',
			'00236b',
			'4e005c'
			 );
	
	var number = 0;
	
	for(var i = 0; i < xid.length; i++)
		number += xid.charCodeAt(i);
	
	var color = '#' + colors[number%(colors.length)];
	
	return color;
}

// Creates a new groupchat
function groupchatCreate(hash, room, chan, nickname, password) {
	/* REF: http://xmpp.org/extensions/xep-0045.html */
	
	logThis('New groupchat: ' + room, 3);
	
	// Create the chat content
	generateChat('groupchat', hash, room, chan);
	
	// Create the chat switcher
	generateSwitch('groupchat', hash, room, chan);
	
	// The icons-hover functions
	tooltipIcons(room, hash);
	
	// We add a click event on the add button
	if(!existDB('favorites', room)) {
		$('#' + hash + ' .tools-add').click(function() {
			// Hide the icon (to tell the user all is okay)
			$(this).hide();
			
			// Add the groupchat to the user favorites
			addThisFavorite(room, chan);
		}).show();
	}
	
	// Focus event
	$('#' + hash + ' .message-area').focus(function() {
		chanCleanNotify(hash);
	})
	
	// Blur event
	.blur(function() {
		resetAutocompletion(hash);
	})
	
	// Lock to the input
	.keypress(function(e) {
		// Enter key
		if(e.keyCode == 13) {
			sendMessage(hash, 'groupchat');
			
			return false;
		}
		
		// Tabulation key
		else if(e.keyCode == 9) {
			createAutocompletion(hash);
			
			return false;
		}
		
		// Reset the autocompleter
		else
			resetAutocompletion(hash);
	});
	
	// Get the current muc informations and content
	getMUC(room, nickname, password);
}
