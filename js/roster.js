/*

Jappix - An open social platform
These are the roster JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 31/10/10

*/

// Gets the roster items
function getRoster() {
	var iq = new JSJaCIQ();
	
	iq.setType('get');
	iq.setQuery(NS_ROSTER);
	
	con.send(iq, handleRoster);
}

// Handles the roster items
function handleRoster(iq) {
	logThis('Roster received.');
	
	// Define some variables
	var handleXML = iq.getQuery();
	var current, xid, dName, subscription, group, xidHash, getNick, nick;
	
	// Parse the vcard xml
	$(handleXML).find('item').each(function() {
		parseRoster($(this), 'load');
	});
	
	// Update our avatar (if changed), and send our presence
	getAvatar(getXID(), 'force', 'true', 'forget');
}

// Parses the group XML and display the roster
function parseRoster(current, mode) {
	// Get the values
	xid = current.attr('jid');
	dName = current.attr('name');
	subscription = current.attr('subscription');
	xidHash = hex_md5(xid);
	
	// Create an array containing the groups
	var groups = new Array();
	
	current.find('group').each(function() {
		groups.push($(this).text());
	});
	
	// No group?
	if(!groups.length)
		groups.push(_e("Unclassified"));
	
	// If no name is defined, we get the default nick of the buddy
	if(!dName)
		dName = getXIDNick(xid);
	
	displayRoster(xid, xidHash, dName, subscription, groups, mode);
}

// Updates the roster groups
function updateGroups() {
	$('#buddy-list .one-group').each(function() {
		// Current values
		var check = $(this).find('.buddy').size();
		var hidden = $(this).find('.buddy:not(.hidden-buddy:hidden)').size();
		
		// Special case: the filtering tool
		if(SEARCH_FILTERED)
			hidden = $(this).find('.buddy:visible').size();
		
		// If the group is empty
		if(!check)
			$(this).remove();
		
		// If the group contains no online buddy (and is not just hidden)
		if(!hidden && $(this).find('a.group').hasClass('minus'))
			$(this).hide();
		else
			$(this).show();
	});
}

// Displays a defined roster item
function displayRoster(dXID, dXIDHash, dName, dSubscription, dGroup, dMode) {
	// First remove the buddy
	$('#buddy-list .' + dXIDHash).remove();
	
	// Define some things around the groups
	var is_gateway = isGateway(dXID);
	var gateway = '';
	
	if(is_gateway) {
		gateway = ' gateway';
		dGroup = new Array(_e("Gateways"));
	}
	
	// Remove request (empty his social channel)
	if(dSubscription == 'remove')
		$('#channel .mixed .one-update.' + dXIDHash).remove();
	
	// Other request
	else {
		// For each group this buddy has
		for(var i = 0; i < dGroup.length; i++) {
			var cGroup = dGroup[i];
			
			if(cGroup) {
				// Process some vars
				var groupHash = 'group' + hex_md5(cGroup);
				var groupContent = '#buddy-list .' + groupHash;
				var groupBuddies = groupContent + ' .group-buddies';
				
				// Group not yet displayed
				if(!exists(groupContent)) {
					// Define some things
					var groupCont = '#buddy-list .content';
					var groupToggle = groupCont + ' .' + groupHash + ' a.group';
					
					// Create the HTML markup of the group
					$(groupCont).prepend(
						'<div class="' + groupHash + ' one-group removable" data-group="' + cGroup.htmlEnc() + '">' + 
							'<a class="group talk-images minus">' + cGroup.htmlEnc() + '</a>' + 
							'<div class="group-buddies"></div>' + 
						'</div>'
					);
					
					// Create the click event which will hide and show the content
					$(groupToggle).click(function() {
						var group = $(groupBuddies);
						var group_toggle = $(groupContent + ' a.group');
						
						// We must hide the buddies
						if(group_toggle.hasClass('minus')) {
							group.hide();
							group_toggle.removeClass('minus').addClass('plus');
						}
						
						// We must show the buddies
						else {
							group_toggle.removeClass('plus').addClass('minus');
							group.show();
						}
					});
				}
				
				// Buddy not yet displayed in this group
				if(!exists(groupContent + ' .' + dXIDHash)) {
					// Initialize the HTML code
					var name_code = '<p class="buddy-name">' + dName.htmlEnc() + '</p>';
					var presence_code = '<p class="buddy-presence talk-images unavailable">' + _e("Unavailable") + '</p>';
					
					var html = '<div class="hidden-buddy buddy ' + dXIDHash + gateway + '" data-xid="' + dXID + '">' + 
							'<div class="buddy-click" onclick="checkChatCreate(\'' + dXID + '\', \'chat\');">';
					
					// Display avatar if not gateway
					if(!is_gateway)
						html += '<div class="avatar-container">' + 
								'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
							'</div>';
					
					html += '<div class="name">';
					
					// Special gateway code
					if(is_gateway)
						html += presence_code +
							name_code;
					
					else
						html += name_code + 
							presence_code;
					
					html += '</div></div></div>';
					
					// Create the DOM element for this buddy
					$(groupBuddies).append(html);
					
					// Apply the hover event
					applyBuddyHover(dXID, dXIDHash, dName, dSubscription, dGroup, groupHash);
				}
			}
		}
		
		// We get the user presence if necessary
		if(dMode == 'presence')
			presenceFunnel(dXID, dXIDHash);
		
		// If the buddy must be shown
		if(BLIST_ALL)
			$('#buddy-list .' + dXIDHash).show();
	}
	
	// We update our groups
	if(!SEARCH_FILTERED)
		updateGroups();
	else
		funnelFilterBuddySearch();
}

// Applies the buddy editing input events
function applyBuddyInput(xid) {
	// Initialize
	var path = '#buddy-list .buddy[data-xid=' + xid + '] .';
	var rename = path + 'bm-rename input';
	var group = path + 'bm-group input';
	var manage_infos = path + 'manage-infos';
	var bm_choose = manage_infos + ' div.bm-choose';
	
	// Keyup events
	$(rename).keyup(function(e) {
		if(e.keyCode == 13) {
			updateRosterItem(xid, $(rename).val(), thisBuddyGroups(xid));
			
			return false;
		}
	});
	
	$(group).keyup(function(e) {
		if(e.keyCode == 13) {
			// Empty input?
			if(!$(this).val()) {
				updateRosterItem(xid, $(rename).val(), thisBuddyGroups(xid));
				
				return false;
			}
			
			// Get the values
			var this_value = $(this).val().htmlEnc();
			
			// Check if the group yet exists
			var group_exists = false;
			
			$(bm_choose + ' label').each(function() {
				if($(this).text() == this_value)
					group_exists = true;
			});
			
			// Create a new checked checkbox
			if(!group_exists)
				$(bm_choose).prepend('<label>' + this_value + '</label><input type="checkbox" data-group="' + this_value + '" checked="true" />');
			
			// Reset the value of this input
			$(this).val('');
			
			return false;
		}
	});
	
	// Click events
	var buddy_infos = $('#buddy-list .buddy[data-xid=' + xid + '] .buddy-infos');
	
	$(manage_infos + ' p.bm-authorize a.to').click(function() {
		buddy_infos.remove();
		sendSubscribe(xid, 'subscribed');
	});
	
	$(manage_infos + ' p.bm-authorize a.from').click(function() {
		buddy_infos.remove();
		sendSubscribe(xid, 'subscribe');
	});
	
	$(manage_infos + ' p.bm-remove a.remove').click(function() {
		buddy_infos.remove();
		sendRoster(xid, 'remove');
	});
	
	$(manage_infos + ' p.bm-remove a.prohibit').click(function() {
		buddy_infos.remove();
		sendSubscribe(xid, 'unsubscribed');
	});
	
	$(manage_infos + ' p.bm-remove a.block').click(function() {
		alert('[FEATURE NOT IMPLEMENTED]');
	});
	
	$(manage_infos + ' a.save').click(function() {
		updateRosterItem(xid, $(rename).val(), thisBuddyGroups(xid));
	});
}

// Applies the buddy editing hover events
function applyBuddyHover(xid, hash, nick, subscription, groups, group_hash) {
	// Generate the values
	var bPath = '#buddy-list .' + group_hash + ' .buddy[data-xid=' + xid + ']';
	var iPath = bPath + ' .buddy-infos';
	
	// Apply the hover event
	$(bPath).hover(function() {
		if(!exists('#buddy-list .buddy .buddy-infos')) {
			$(bPath).oneTime(700, function() {
				// Create the buddy infos DOM element
				$(bPath).append(
					'<div class="buddy-infos">' + 
						'<div class="buddy-infos-subarrow talk-images"></div>' + 
						'<div class="buddy-infos-subitem">' + 
							'<div class="pep-infos">' + 
								'<p class="bi-status talk-images status-unavailable">' + _e("unknown") + '</p>' + 
								'<p class="bi-mood talk-images mood-four">' + _e("unknown") + '</p>' + 
								'<p class="bi-activity talk-images activity-exercising">' + _e("unknown") + '</p>' + 
								'<p class="bi-tune talk-images tune-note">' + _e("unknown") + '</p>' + 
								'<p class="bi-geoloc talk-images location-world">' + _e("unknown") + '</p>' + 
								'<p class="bi-view talk-images view-individual"><a class="profile">' + _e("Profile") + '</a> / <a class="channel">' + _e("Channel") + '</a> / <a class="collections">' + _e("Collections") + '</a></p>' + 
								'<p class="bi-edit talk-images edit-buddy"><a>' + _e("Edit") + '</a></p>' + 
							'</div>' + 
						'</div>' + 
					'</div>'
				);
				
				// Get the presence
				presenceFunnel(xid, hash);
				
				// Get the PEP infos
				displayAllPEP(xid);
				
				// Click events
				$(bPath + ' .bi-view a').click(function() {
					// Renitialize the buddy infos
					$('#buddy-list .buddy[data-xid=' + xid + '] .buddy-infos').remove();
					
					// Profile
					if($(this).is('.profile'))
						openUserInfos(xid);
					
					// Channel
					else if($(this).is('.channel'))
						fromInfosMicroblog(xid, hash);
					
					// Collections
					else
						retrieveCollections(xid);
				});
				
				$(bPath + ' .bi-edit a').click(function() {
					buddyEdit(xid, nick, subscription, groups);
				});
			});
		}
	}, function() {
		if(!exists(iPath + ' .manage-infos'))
			$(iPath).remove();
		
		$(bPath).stopTime();
	});
}

// Generates an array of the current groups of a buddy
function thisBuddyGroups(xid) {
	var path = '#buddy-list .buddy[data-xid=' + xid + '] ';
	var array = new Array();
	
	// Each checked checkboxes
	$(path + 'div.bm-choose input[type=checkbox]:checked').each(function() {
		array.push($(this).attr('data-group').revertHtmlEnc());
	});
	
	// Entered input value (and not yet in the array)
	var value = $(path + 'p.bm-group input').val();
	
	if(value && (array.indexOf(value) == -1))
		array.push(value);
	
	return array;
}

// Sends a defined roster item
function sendRoster(xid, subscription) {
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': xid}));
	
	if(subscription)
		item.setAttribute('subscription', subscription);
	
	con.send(iq);
}

// Adds a given contact to our roster
function addThisContact(xid) {
	logThis('Add this contact: ' + xid);
	
	// Cut the resource of this XID
	xid = cutResource(xid);
	
	// If the form is complete
	if(xid) {
		// We send the subscription
		sendSubscribe(xid, 'subscribe');
		sendRoster(xid);
		
		// We hide the bubble
		closeBubbles();
	}
}

// Gets an array of all the groups in the roster
function getAllGroups() {
	var groups = new Array();
	
	$('#buddy-list .one-group').each(function() {
		var current = $(this).attr('data-group').revertHtmlEnc();
		
		if((current != _e("Unclassified")) && (current != _e("Gateways")))
			groups.push($(this).attr('data-group'));
	});
	
	return groups.sort();
}

// Edits buddy informations
function buddyEdit(xid, nick, subscription, groups) {
	logThis('Buddy edit: ' + xid);
	
	// Initialize
	var path = '#buddy-list .buddy[data-xid=' + xid + '] .';
	var html = '<div class="manage-infos">';
	
	// The subscription with this buddy is not full
	if(subscription != 'both') {
		var links = '';
		html += '<p class="bm-authorize talk-images">';
		
		// Link to allow to see our status
		if((subscription == 'to') || (subscription == 'none'))
			links += '<a class="to">' + _e("Authorize") + '</a>';
		
		// Link to ask to see his/her status
		if((subscription == 'from') || (subscription == 'none')) {
			if(links)
				links += ' / ';
			
			links += '<a class="from">' + _e("Ask for authorization") + '</a>';
		}
		
		html += links + '</p>';
	}
	
	// Complete the HTML code
	html += '<p class="bm-remove talk-images"><a class="remove">' + _e("Remove") + '</a>';
	
	// This buddy is allowed to see our presence, we can show a "prohibit" link
	if((subscription == 'both') || (subscription == 'from'))
		html += ' / <a class="prohibit">' + _e("Prohibit") + '</a>';
	
	// Complete the HTML code
	html += ' / <a class="block">' + _e("Block") + '</a>';
	
	// Complete the HTML code
	html += '</p>' + 
		'<p class="bm-rename talk-images"><label>' + _e("Rename") + '</label> <input type="text" value="' + nick + '" /></p>';
	
	// Only show group tool if not a gateway
	if(!isGateway(xid))
		html += '<p class="bm-group talk-images"><label>' + _e("Groups") + '</label> <input type="text" /></p>' + 
			'<div class="bm-choose">' + 
				'<div></div>' + 
			'</div>';
	
	// Close the DOM element
	html += '<a class="save">' + _e("Save") + '</a>' + 
		'</div>';
	
	// We update the DOM elements
	$(path + 'pep-infos').replaceWith(html);
	
	// Gets all the existing groups
	var all_groups = getAllGroups();
	var all_groups_dom = '';
	
	for(var a = 0; a < all_groups.length; a++) {
		// Is the current group checked?
		var checked = '';
		
		if(groups.indexOf(all_groups[a]) != -1)
			checked = ' checked="true"';
		
		// Generate the group HTML
		var all_groups_current = all_groups[a].htmlEnc();
		
		// Add the current group HTML
		all_groups_dom += '<label>' + all_groups_current + '</label><input type="checkbox" data-group="' + all_groups_current + '"' + checked + ' />';
	}
	
	// Prepend this in the DOM
	var bm_choose = path + 'manage-infos div.bm-choose';
	
	$(bm_choose).prepend(all_groups_dom);
	
	// Apply the editing input events
	applyBuddyInput(xid);
}

// Updates the roster items
function updateRosterItem(xid, rename, group) {
	// Remove the buddy editor
	$('#buddy-list .buddy[data-xid=' + xid + '] .buddy-infos').remove();
	
	// We send the new buddy name
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': xid}));
	
	if(rename)
		item.setAttribute('name', rename);
	
	if(group.length)
		for(var i = 0; i < group.length; i++)
			item.appendChild(iq.buildNode('group', {'xmlns': NS_ROSTER}, group[i]));
	
	con.send(iq);
}

// Define a global var for buddy list all buddies displayed
var BLIST_ALL = false;

// Launch this plugin!
$(document).ready(function() {
	// BEGIN filtering tool
	var iFilter = $('#buddy-list .filter input');
	var aFilter = $('#buddy-list .filter a');
	var pFilter = iFilter.attr('placeholder');
	
	iFilter.focus(function() {
		// Put a blank value
		if($(this).val() == pFilter)
			$(this).val('');
	})
	
	.blur(function() {
		// Nothing is entered, put the placeholder instead
		if(!$(this).val()) {
			$(this).val(pFilter);
			aFilter.hide();
		}
		
		else if($(this).val() != pFilter)
			aFilter.show();
		
		else
			aFilter.hide();
	})
	
	.keyup(function(e) {
		funnelFilterBuddySearch(e.keyCode);
	});
	
	aFilter.click(function() {
		iFilter.val(pFilter);
		$(this).hide();
		
		// Security: show all the groups, empty or not
		$('#buddy-list .one-group').show();
		
		// Resets the filtering tool
		resetFilterBuddySearch();
	});
	// END filtering tool
	
	// BEGIN foot icons
	// When the user click on the add button, show the contact adding tool
	$('#buddy-list .foot .add').click(function() {
		// We show the requested div
		showBubble('#buddy-conf-add');
		
		// We reset the input and focus on it
		$('.add-contact-jid').removeClass('please-complete').val('').focus();
	});
	
	// When a key is pressed...
	$('#buddy-conf-add input').keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13) {
		// Get the values
			var xid = generateXID($('.add-contact-jid').val(), 'chat');
			
			// Submit the form
			if(xid && (xid != getXID()))
				addThisContact(xid);
			else
				$('.add-contact-jid').addClass('please-complete').focus();
		}
		
		// Escape : quit
		if(e.keyCode == 27)
			closeBubbles();
	});
	
	// When the user click on the join button, show the chat joining tool
	var destination = '#buddy-conf-join .search';
	var dHovered = destination + ' ul li.hovered:first';
	
	$('#buddy-list .foot .join').click(function() {
		// We reset the previous search (security)
		resetBuddySearch(destination);
		
		// We show the requested div
		showBubble('#buddy-conf-join');
		
		// We reset the input and focus on it
		$('#buddy-conf-join .join-jid').val('').focus();
	});
	
	// When a key is pressed...
	$('#buddy-conf-join input').keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13) {
			// Select something from the search
			if(exists(dHovered))
				addBuddySearch(destination, $(dHovered).attr('data-xid'));
			
			// Join something
			else {
				var xid = $('.join-jid').val();
				var type = $('.buddy-conf-join-select').val();
				
				if(xid && type) {
					// Update some things
					$('.join-jid').removeClass('please-complete');
					closeBubbles();
					
					// Generate a correct XID
					xid = generateXID(xid, type);
					
					// Create a new chat
					checkChatCreate(xid, type);
				}
				
				else
					$('.join-jid').addClass('please-complete');
			}
		}
		
		// Escape : quit
		else if(e.keyCode == 27)
			closeBubbles();
		
		// Buddy search?
		else if($('.buddy-conf-join-select').val() == 'chat') {
			// New buddy search
			if((e.keyCode != 40) && (e.keyCode != 38))
				createBuddySearch(destination);
			
			// Navigating with keyboard in the results
			arrowsBuddySearch(e, destination);
		}
	})
	
	// Buddy search lost focus
	.blur(function() {
		if(!$(destination + ' ul').attr('mouse-hover'))
			resetBuddySearch(destination);
	});
	
	// When the user click on the groupchat button, show the groupchat menu
	$('#buddy-list .foot .groupchat').click(function() {
		// We show the requested div
		showBubble('#buddy-conf-groupchat');
	});
	
	// When the user wants to edit his groupchat favorites
	$('.buddy-conf-groupchat-edit').click(function() {
		openFavorites();
		closeBubbles();
	});
	
	// When the user click on the more button, show the more menu
	$('#buddy-list .foot .more').click(function() {
		// We show the target bubble
		showBubble('#buddy-conf-more');
	});
	
	// When the user click on the involve button, show the involve menu
	$('#buddy-list .foot .involve').click(function() {
		// We show the target bubble
		showBubble('#buddy-conf-involve');
	});
	
	// When the user clicks on a link that fire the close bubble event
	$('#buddy-conf-more .buddy-conf-text a, #buddy-conf-involve .buddy-conf-text a').click(function() {
		closeBubbles();
	});
	
	// When the user wants to display all his buddies
	$('.buddy-conf-more-display-unavailable').click(function() {
		showAllBuddies('roster');
	});
	
	// When the user wants to display only online buddies
	$('.buddy-conf-more-display-available').click(function() {
		showOnlineBuddies('roster');
	});
	
	// When the user click on the map of friends link
	$('.buddy-conf-more-map').click(function() {
		openMap();
		closeBubbles();
	});
	
	// When the user click on the collections link
	$('.buddy-conf-more-collections').click(function() {
		openCollections();
	});
	
	// When the user click on the archives link
	$('.buddy-conf-more-archives').click(function() {
		openArchives();
	});
	
	// When the user click on the service discovery link
	$('.buddy-conf-more-service-disco').click(function() {
		openDiscovery();
	});
	// END foot icons
});
