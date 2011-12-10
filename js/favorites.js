/*

Jappix - An Open μSocial Platform
These are the favorites JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function openFavorites() {
	$("#favorites").show();
	switchFavorites();
}

$(document).ready(function() {
	// If the user sent the server name
	$("#favorites .fsearch-head-server").keyup(function(e) {
		if(e.keyCode == 13)
			getServerGCList();
	});

	$(".fedit-head-select").change(function() {
		editFavorite();
	});
});

function resetFavorites() {
	$("#favorites .wait").hide();
	$("#favorites .fsearch-oneresult").remove();
	$("#favorites .fedit-input").val("");
	$("#favorites .please-complete").removeClass("please-complete");
	$("#favorites .fsearch-head-server, .fedit-server").val(getHost("muc"));
	$(".fedit-terminate").hide();
	$(".fedit-add").show();
}

function quitFavorites() {
	// We hide the popup
	$("#favorites").hide();
	
	// We reset some stuffs
	resetFavorites();
	$("#favorites .favorites-content").hide();
	$("#favorites .favorites-edit").show();
}

function switchFavorites() {
	$("#favorites .room-switcher").click(function() {
		$("#favorites .favorites-content").hide();
		resetFavorites();
	});
	
	$("#favorites .room-list").click(function() {
		$("#favorites .favorites-edit").show();
	});
	
	$("#favorites .room-search").click(function() {
		$("#favorites .favorites-search").show();
		getServerGCList();
	});
}

function addThisRoomToFav(roomJID, roomName) {
	// Reset
	resetFavorites();
	
	// We switch to the other part
	$("#favorites .favorites-content").hide();
	$("#favorites .favorites-edit").show();
	$("#favorites .fedit-add").show();
	
	// We define the values
	var separated = roomJID.split("@");
	var chan = separated[0];
	var server = separated[1];
	var nick = getNick();
	var separatedName = roomName.split(" (");
	var newName = separatedName[0];
	
	// We set the good values to the inputs
	$("#favorites .fedit-title").val(newName);
	$("#favorites .fedit-chan").val(chan);
	$("#favorites .fedit-server").val(server);
	$("#favorites .fedit-nick").val(nick);
	$("#favorites .fedit-password").val('');
}

function editFavorite() {
	// Show the edit/remove button, hide the others
	$(".fedit-terminate").hide();
	$(".fedit-edit").show();
	$(".fedit-remove").show();
	
	// We retrieve the values
	var jid = $("#favorites .fedit-head-select").val();
	var data = getDB('favorites', jid);
	
	// If this is not the default room
	if(jid != 'none') {
		// We parse the values
		var jidSplit = jid.split("@");
		var chan = jidSplit[0];
		var server = jidSplit[1];
		var rName = $(data).find('name').text();
		var nick = $(data).find('nick').text();
		var pass = $(data).find('password').text();
	
		// We apply the values
		$(".fedit-title").val(rName);
		$(".fedit-nick").val(nick);
		$(".fedit-chan").val(chan);
		$(".fedit-server").val(server);
		$(".fedit-password").val(pass);
	}
	
	else
		resetFavorites();
}

function addFavorite() {
	// We reset the inputs
	$(".fedit-title, .fedit-nick, .fedit-chan, .fedit-server, .fedit-password").val("");
	
	// Show the add button, hide the others
	$(".fedit-terminate").hide();
	$(".fedit-add").show();
}

function terminateThisFavorite(type) {
	// Get the input values
	var title = $(".fedit-title").val();
	var nick = $(".fedit-nick").val();
	var room = $(".fedit-chan").val();
	var server = $(".fedit-server").val();
	
	// We check the missing values and send this if okay
	if(type == 'add' || type == 'edit') {
		if(title && nick && room && server)
			favoritePublish(type);
		
		else {
			$('.fedit-required').each(function() {
				if(!$(this).val())
					$(this).addClass('please-complete');
				else
					$(this).removeClass('please-complete');	
			});
		}
	}
	
	else if(type == 'remove')
		favoritePublish(type);
}

function removeThisFavorite(jid, hash) {
	// We remove the target favorite everywhere needed
	$(".buddy-conf-groupchat-select ." + hash).remove();
	$(".fedit-head-select ." + hash).remove();
	removeDB('favorites', jid);
}

function favoritePublish(type) {
	// We reset some things
	$('.please-complete').removeClass('please-complete');
	
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_BOOKMARKS}));
	
	// We get the values of the current edited groupchat
	var title = $(".fedit-title").val();
	var nick = $(".fedit-nick").val();
	var room = $(".fedit-chan").val();
	var server = $(".fedit-server").val();
	var jid = room + '@' + server;
	var hash = hex_md5(jid);
	var password = $(".fedit-password").val();
	
	// We check what's the type of the query
	if(type == 'add')
		displayFavorites(jid, title, nick, hash);
	
	else if(type == 'edit') {
		// We delete the edited room
		removeThisFavorite(jid, hash);
		
		// We add the room everywhere needed
		displayFavorites(jid, title, nick, hash);
	}
	
	else if(type == 'remove')
		removeThisFavorite(jid, hash);
	
	// We regenerate the XML
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored favorite
		if(splitted[0] == 'favorites') {
			var data = sessionStorage.getItem(current);
			var jid = $(data).find('jid').text();
			var rName = $(data).find('name').text();
			var nick = $(data).find('nick').text();
			var pass = $(data).find('password').text();
		
			// We create the node for this groupchat
			var item = storage.appendChild(iq.buildNode('conference', {'name': rName, 'jid':jid, 'autojoin':'0', xmlns: NS_BOOKMARKS}));
			item.appendChild(iq.buildNode('nick', {xmlns: NS_BOOKMARKS}, nick));
		
			if (pass)
				item.appendChild(iq.buildNode('password', {xmlns: NS_BOOKMARKS}, pass));
		}
	}
	
	con.send(iq);
	
	// We reset the inputs if a room has been added or removed
	resetFavorites();
}

function getServerGCList() {
	var gcServer = $(".fsearch-head-server").val();
	
	// We reset some things
	$("#favorites .fsearch-oneresult").remove();
	$("#favorites .fsearch-noresults").hide();
	$("#favorites .wait").show();
	
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setTo(gcServer);
	iq.setQuery(NS_DISCO_ITEMS);
	con.send(iq, getGCList);
}

function getGCList(iq) {
	if (!iq || iq.getType() != 'result') {
		openThisError(2);
		$("#favorites .wait").hide();
	}
	
	else {
		var handleXML = iq.getQuery();
		
		if($(handleXML).find('item').attr('jid') != undefined) {
			$(handleXML).find('item').each(function() {
				var roomJID = $(this).attr('jid');
				var roomName = $(this).attr('name');
			
				$("#favorites .fsearch-results").prepend(
					'<div class="oneresult fsearch-oneresult">' + 
						'<div class="room-name" onclick="gcJoinFavorites(\'' + roomJID + '\');">' + roomName + '</div>' + 
						'<div class="add-this-room talk-images" title="' + _e(28) + '" onclick="addThisRoomToFav(\'' + roomJID + '\', \'' + roomName + '\');"></div>' + 
					'</div>');
			});
		}
		
		else
			$("#favorites .fsearch-noresults").show();
	}
	
	$("#favorites .wait").hide();
}

function gcJoinFavorites(room) {
	quitFavorites();
	checkChatCreate(room, 'groupchat');
}

function joinFromFavorite() {
	// When the user want to join a groupchat from his favorites
	$('.buddy-conf-groupchat-select').change(function() {
		// We hide the bubble
		$('#buddy-conf-groupchat').fadeOut('fast');
		
		// We do what we've to do
		var groupchat = $(this).val();
		checkChatCreate(groupchat, 'groupchat');
		
		// We reset the select value
		$(".buddy-conf-groupchat-select").val("none");
	});
}

function displayFavorites(jid, gcName, nick, hash) {
	var optionSet = '<option value="' + jid + '" class="' + hash + ' removable">' + gcName + '</option>';
	
	// We complete the select forms
	$(".gc-join-first-option").after(optionSet);
	$(".fedit-head-select-first-option").after(optionSet);
	
	// We store the informations
	var value = '<groupchat><jid>' + jid + '</jid><name>' + gcName + '</name><nick>' + nick + '</nick></groupchat>';
	setDB('favorites', jid, value);
	
	// We show the default room
	$(".buddy-conf-groupchat-select").val("none");
}
