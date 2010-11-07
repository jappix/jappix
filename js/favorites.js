/*

Jappix - An open social platform
These are the favorites JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 07/11/10

*/

// Opens the favorites popup
function openFavorites() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Manage favorite rooms") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="switch-fav">' + 
			'<div class="room-switcher room-list">' + 
				'<div class="icon list-icon talk-images"></div>' + 
				
				_e("Change favorites") + 
			'</div>' + 
			
			'<div class="room-switcher room-search">' + 
				'<div class="icon search-icon talk-images"></div>' + 
				
				_e("Search a room") + 
			'</div>' + 
		'</div>' + 
		
		'<div class="static-fav">' + 
			'<div class="favorites-edit favorites-content">' + 
				'<div class="head fedit-head static-fav-head">' + 
					'<div class="head-text fedit-head-text">' + _e("Select a favorite") + '</div>' + 
					
					'<select name="fedit-head-select" class="head-select fedit-head-select"></select>' + 
				'</div>' + 
				
				'<div class="results fedit-results static-fav-results">' + 
					'<div class="fedit-line">' + 
						'<label>' + _e("Name") + '</label>' + 
						
						'<input class="fedit-title fedit-required" type="text" />' + 
					'</div>' + 
					
					'<div class="fedit-line">' + 
						'<label>' + _e("Nickname") + '</label>' + 
						
						'<input class="fedit-nick fedit-required" type="text" />' + 
					'</div>' + 
					
					'<div class="fedit-line">' + 
						'<label>' + _e("Room") + '</label>' + 
						
						'<input class="fedit-chan fedit-required" type="text" />' + 
					'</div>' + 
					
					'<div class="fedit-line">' + 
						'<label>' + _e("Server") + '</label>' + 
						
						'<input class="fedit-server fedit-required" type="text" value="' + HOST_MUC + '" />' + 
					'</div>' + 
					
					'<div class="fedit-line">' + 
						'<label>' + _e("Password") + '</label>' + 
						
						'<input class="fedit-password" type="password" />' + 
					'</div>' + 
					
					'<div class="fedit-line">' + 
						'<label>' + _e("Automatic") + '</label>' + 
						
						'<input type="checkbox" class="fedit-autojoin" />' + 
					'</div>' + 
					
					'<div class="fedit-actions">' + 
						'<a class="fedit-terminate fedit-add" onclick="terminateThisFavorite(\'add\');">' + _e("Add") + '</a>' + 
						'<a class="fedit-terminate fedit-edit" onclick="terminateThisFavorite(\'edit\');">' + _e("Edit") + '</a>' + 
						'<a class="fedit-terminate fedit-remove" onclick="terminateThisFavorite(\'remove\');">' + _e("Remove") + '</a>' + 
					'</div>' + 
				'</div>' + 
			'</div>' + 
			
			'<div class="favorites-search favorites-content">' + 
				'<div class="head fsearch-head static-fav-head">' + 
					'<div class="head-text fsearch-head-text">' + _e("Search a room on") + '</div>' + 
					
					'<input type="text" class="head-input fsearch-head-server" value="' + HOST_MUC + '" />' + 
				'</div>' + 
				
				'<div class="results fsearch-results static-fav-results">' + 
					'<p class="fsearch-noresults">' + _e("No room found on this server.") + '</p>' + 
				'</div>' + 
			'</div>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish" onclick="return quitFavorites();">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('favorites', html);
	
	// Load the favorites
	loadFavorites();
	
	// Associate the events
	launchFavorites('popup');
}

// Resets the favorites elements
function resetFavorites() {
	var path = '#favorites ';
	
	$(path + '.wait, ' + path + '.fedit-terminate').hide();
	$(path + '.fedit-add').show();
	$(path + '.fsearch-oneresult').remove();
	$(path + 'input').val('');
	$(path + '.please-complete').removeClass('please-complete');
	$(path + '.fsearch-head-server, #favorites .fedit-server').val(HOST_MUC);
	$(path + '.fedit-autojoin').attr('checked', false);
}

// Quits the favorites popup
function quitFavorites() {
	// Destroy the popup
	destroyPopup('favorites');
	
	return false;
}

// Adds a room to the favorites
function addThisFavorite(roomXID, roomName) {
	// Add a remove button instead of the add one
	$('#favorites .fsearch-results div[data-xid=' + roomXID + '] a.one-button.add').replaceWith('<a class="one-button remove" onclick="removeThisFavorite(\'' + roomXID + '\', \'' + roomName + '\');">' + _e("Remove") + '</a>');
	
	// Hide the add button in the (opened?) groupchat
	$('#' + hex_md5(roomXID) + ' .tools-add').hide();
	
	// Add the database entry
	displayFavorites(roomXID, explodeThis(' (', roomName, 0), getNick(), '0', '');
	
	// Publish the favorites
	favoritePublish();
}

// Removes a room from the favorites
function removeThisFavorite(roomXID, roomName) {
	// Add a remove button instead of the add one
	$('#favorites .fsearch-results div[data-xid=' + roomXID + '] a.one-button.remove').replaceWith('<a class="one-button add" onclick="addThisFavorite(\'' + roomXID + '\', \'' + roomName + '\');">' + _e("Add") + '</a>');
	
	// Show the add button in the (opened?) groupchat
	$('#' + hex_md5(roomXID) + ' .tools-add').show();
	
	// Remove the favorite
	removeFavorite(roomXID);
	
	// Publish the favorites
	favoritePublish();
}

// Edits a favorite
function editFavorite() {
	// Reset the favorites
	resetFavorites();
	
	// Show the edit/remove button, hide the others
	$('.fedit-terminate').hide();
	$('.fedit-edit').show();
	$('.fedit-remove').show();
	
	// We retrieve the values
	var xid = $('#favorites .fedit-head-select').val();
	var data = getDB('favorites', xid);
	
	// If this is not the default room
	if(xid != 'none') {
		// We apply the values
		$('.fedit-title').val($(data).find('name').text());
		$('.fedit-nick').val($(data).find('nick').text());
		$('.fedit-chan').val(getXIDNick(xid));
		$('.fedit-server').val(getXIDHost(xid));
		$('.fedit-password').val($(data).find('password').text());
		
		if($(data).find('autojoin').text() == '1')
			$('.fedit-autojoin').attr('checked', true);
	}
	
	else
		resetFavorites();
}

// Adds a favorite
function addFavorite() {
	// We reset the inputs
	$('.fedit-title, .fedit-nick, .fedit-chan, .fedit-server, .fedit-password').val('');
	
	// Show the add button, hide the others
	$('.fedit-terminate').hide();
	$('.fedit-add').show();
}

// Terminate a favorite editing
function terminateThisFavorite(type) {
	// We reset some things
	$('.please-complete').removeClass('please-complete');
	
	// We get the values of the current edited groupchat
	var title = $('.fedit-title').val();
	var nick = $('.fedit-nick').val();
	var room = $('.fedit-chan').val();
	var server = $('.fedit-server').val();
	var xid = room + '@' + server;
	var password = $('.fedit-password').val();
	var autojoin = '0';
	
	if($('.fedit-autojoin').is(':checked'))
		autojoin = '1';
	
	// We check the missing values and send this if okay
	if((type == 'add') || (type == 'edit')) {
		if(title && nick && room && server) {
			favoritePublish();
			
			// Remove the edited room
			if(type == 'edit')
				removeFavorite(xid);
			
			// Display the favorites
			displayFavorites(xid, title, nick, autojoin, password);
			reloadFavorites();
			
			// Reset the inputs
			resetFavorites();
		}
		
		else {
			$('.fedit-required').each(function() {
				if(!$(this).val())
					$(this).addClass('please-complete');
				else
					$(this).removeClass('please-complete');	
			});
		}
	}
	
	// Must remove a favorite?
	else if(type == 'remove') {
		removeFavorite(xid);
		
		// Publish it!
		favoritePublish();
		
		// Reset the inputs
		resetFavorites();
	}
	
	logThis('Action on this bookmark: ' + room + '@' + server + ' / ' + type);
}

// Removes a favorite
function removeFavorite(xid) {
	// We remove the target favorite everywhere needed
	$('.buddy-conf-groupchat-select option[value=' + xid + ']').remove();
	$('.fedit-head-select option[value=' + xid + ']').remove();
	removeDB('favorites', xid);
}

// Sends a favorite to the XMPP server
function favoritePublish() {
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_BOOKMARKS}));
	
	// We generate the XML
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored favorite
		if(explodeThis('_', current, 0) == 'favorites') {
			var data = sessionStorage.getItem(current);
			var xid = $(data).find('xid').text();
			var rName = $(data).find('name').text();
			var nick = $(data).find('nick').text();
			var pass = $(data).find('password').text();
			var autojoin = $(data).find('autojoin').text();
			
			// We create the node for this groupchat
			var item = storage.appendChild(iq.buildNode('conference', {'name': rName, 'jid': xid, 'autojoin': autojoin, xmlns: NS_BOOKMARKS}));
			item.appendChild(iq.buildNode('nick', {xmlns: NS_BOOKMARKS}, nick));
			
			if (pass)
				item.appendChild(iq.buildNode('password', {xmlns: NS_BOOKMARKS}, pass));
			
			logThis('Bookmark sent: ' + xid);
		}
	}
	
	con.send(iq);
}

// Gets a list of the MUC items on a given server
function getGCList() {
	var path = '#favorites .';
	var gcServer = $('.fsearch-head-server').val();
	
	// We reset some things
	$(path + 'fsearch-oneresult').remove();
	$(path + 'fsearch-noresults').hide();
	$(path + 'wait').show();
	
	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setTo(gcServer);
	
	iq.setQuery(NS_DISCO_ITEMS);
	
	con.send(iq, handleGCList);
}

// Handles the MUC items list
function handleGCList(iq) {
	var path = '#favorites .';
	var from = getStanzaFrom(iq);
	
	if (!iq || iq.getType() != 'result') {
		openThisError(2);
		
		$(path + 'wait').hide();
		
		logThis('Error while retrieving the rooms: ' + from);
	}
	
	else {
		var handleXML = iq.getQuery();
		
		if($(handleXML).find('item').size()) {
			// Initialize the HTML code
			var html = '';
			
			$(handleXML).find('item').each(function() {
				var roomXID = $(this).attr('jid');
				var roomName = $(this).attr('name');
				
				if(roomXID && roomName) {
					// Initialize the room HTML
					html += '<div class="oneresult fsearch-oneresult" data-xid="' + roomXID + '">' + 
							'<div class="room-name">' + roomName + '</div>' + 
							'<a class="one-button join" onclick="return joinFavorite(\'' + roomXID + '\');">' + _e("Join") + '</a>';
					
					// This room is yet a favorite
					if(existDB('favorites', roomXID))
						html += '<a class="one-button remove" onclick="removeThisFavorite(\'' + roomXID + '\', \'' + roomName + '\');">' + _e("Remove") + '</a>';
					else
						html += '<a class="one-button add" onclick="addThisFavorite(\'' + roomXID + '\', \'' + roomName + '\');">' + _e("Add") + '</a>';
					
					// Close the room HTML
					html += '</div>';
				}
			});
			
			// Append this code to the popup
			$(path + 'fsearch-results').append(html);
		}
		
		else
			$(path + 'fsearch-noresults').show();
		
		logThis('Rooms retrieved: ' + from);
	}
	
	$(path + 'wait').hide();
}

// Joins a groupchat from favorites
function joinFavorite(room) {
	quitFavorites();
	checkChatCreate(room, 'groupchat', '', '', getXIDNick(room));
	
	return false;
}

// Displays a given favorite
function displayFavorites(xid, gcName, nick, autojoin, password) {
	var optionSet = '<option value="' + xid + '">' + gcName + '</option>';
	
	// We complete the select forms
	$('.gc-join-first-option').after(optionSet);
	
	// We store the informations
	var value = '<groupchat><xid>' + xid + '</xid><name>' + gcName + '</name><nick>' + nick + '</nick><autojoin>' + autojoin + '</autojoin><password>' + password + '</password></groupchat>';
	setDB('favorites', xid, value);
}

// Loads the favorites for the popup
function loadFavorites() {
	// Initialize the HTML code
	var html = '<option value="none" class="fedit-head-select-first-option" selected="selected">' + _e("Select a favorite") + '</option>';
	
	// Read the database
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored favorite
		if(explodeThis('_', current, 0) == 'favorites') {
			var data = sessionStorage.getItem(current);
			
			// Add the current favorite to the HTML code
			html += '<option value="' + $(data).find('xid').text() + '">' + $(data).find('name').text() + '</option>';
		}
	}
	
	// Append the HTML code
	$('#favorites .fedit-head-select').html(html);
}

// Reloads the favorites from the database
function reloadFavorites() {
	// Removes the favorites list
	$('#favorites .fedit-head-select').empty();
	
	// Load the list again!
	loadFavorites();
}

// Plugin launcher
function launchFavorites(container) {
	if(container == 'talk') {
		$('.buddy-conf-groupchat-select').change(function() {
			var groupchat = $(this).val();
			
			if(groupchat != 'none') {
				// We hide the bubble
				closeBubbles();
				
				// Create the chat
				checkChatCreate(groupchat, 'groupchat');
				
				// We reset the select value
				$(this).val('none');
			}
		});
	}
	
	else if(container == 'popup') {
		var path = '#favorites .';
		
		// Keyboard events
		$(path + 'fsearch-head-server').keyup(function(e) {
			if(e.keyCode == 13)
				getGCList();
		});
		
		// Change events
		$('.fedit-head-select').change(editFavorite);
		
		// Click events
		$(path + 'room-switcher').click(function() {
			$(path + 'favorites-content').hide();
			resetFavorites();
		});
		
		$(path + 'room-list').click(function() {
			$(path + 'favorites-edit').show();
		});
		
		$(path + 'room-search').click(function() {
			$(path + 'favorites-search').show();
			getGCList();
		});
	}
}
