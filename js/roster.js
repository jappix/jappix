/*

Jappix - An open social platform
These are the roster JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 05/12/10

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
		for(i in dGroup) {
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
						'<div class="' + groupHash + ' one-group" data-group="' + escape(cGroup) + '">' + 
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
							
							// Remove the group opened buddy-info
							closeBubbles();
						}
						
						// We must show the buddies
						else {
							group_toggle.removeClass('plus').addClass('minus');
							group.show();
						}
						
						return false;
					});
				}
				
				// Initialize the HTML code
				var name_code = '<p class="buddy-name">' + dName.htmlEnc() + '</p>';
				var presence_code = '<p class="buddy-presence talk-images unavailable">' + _e("Unavailable") + '</p>';
				
				var html = '<div class="hidden-buddy buddy ibubble ' + dXIDHash + gateway + '" data-xid="' + dXID + '">' + 
						'<div class="buddy-click">';
				
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
		
		// Click event on this buddy
		$('#buddy-list .' + dXIDHash + ' .buddy-click').click(function() {
			return checkChatCreate(dXID, 'chat');
		});
		
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
			// Send the item
			sendRoster(xid, '', $(rename).val(), thisBuddyGroups(xid));
			
			// Remove the buddy editor
			closeBubbles();
			
			return false;
		}
	});
	
	$(group).keyup(function(e) {
		if(e.keyCode == 13) {
			// Empty input?
			if(!$(this).val()) {
				// Send the item
				sendRoster(xid, '', $(rename).val(), thisBuddyGroups(xid));
				
				// Remove the buddy editor
				closeBubbles();
				
				return false;
			}
			
			// Get the values
			var this_value = $(this).val();
			var escaped_value = escape(this_value);
			
			// Check if the group yet exists
			var group_exists = false;
			
			$(bm_choose + ' label span').each(function() {
				if($(this).text() == this_value)
					group_exists = true;
			});
			
			// Create a new checked checkbox
			if(!group_exists)
				$(bm_choose).prepend('<label><input type="checkbox" data-group="' + escaped_value + '" /><span>' + this_value.htmlEnc() + '</span></label>');
			
			// Check the checkbox
			$(bm_choose + ' input[data-group=' + escaped_value + ']').attr('checked', true);
			
			// Reset the value of this input
			$(this).val('');
			
			return false;
		}
	});
	
	// Click events
	$(manage_infos + ' p.bm-authorize a.to').click(function() {
		closeBubbles();
		sendSubscribe(xid, 'subscribed');
		
		return false;
	});
	
	$(manage_infos + ' p.bm-authorize a.from').click(function() {
		closeBubbles();
		sendSubscribe(xid, 'subscribe');
		
		return false;
	});
	
	$(manage_infos + ' p.bm-remove a.remove').click(function() {
		closeBubbles();
		sendRoster(xid, 'remove');
		
		return false;
	});
	
	$(manage_infos + ' p.bm-remove a.prohibit').click(function() {
		closeBubbles();
		sendSubscribe(xid, 'unsubscribed');
		
		return false;
	});
	
	/* $(manage_infos + ' p.bm-remove a.block').click(function() {
		// TODO
		
		return false;
	}); */
	
	$(manage_infos + ' a.save').click(function() {
		// Send the item
		sendRoster(xid, '', $(rename).val(), thisBuddyGroups(xid));
		
		// Remove the buddy editor
		closeBubbles();
		
		return false;
	});
}

// Applies the buddy editing hover events
function applyBuddyHover(xid, hash, nick, subscription, groups, group_hash) {
	// Generate the values
	var bPath = '#buddy-list .' + group_hash + ' .buddy[data-xid=' + xid + ']';
	var iPath = bPath + ' .buddy-infos';
	
	// Apply the hover event
	$(bPath).hover(function() {
		// Another bubble exist
		if(exists('#buddy-list .buddy-infos'))
			return false;
		
		$(bPath).oneTime(200, function() {
			// Another bubble exist
			if(exists('#buddy-list .buddy-infos'))
				return false;
			
			// Add this bubble!
			showBubble(iPath);
			
			// Create the buddy infos DOM element
			$(bPath).append(
				'<div class="buddy-infos bubble removable">' + 
					'<div class="buddy-infos-subarrow talk-images"></div>' + 
					'<div class="buddy-infos-subitem">' + 
						'<div class="pep-infos">' + 
							'<p class="bi-status talk-images status-unavailable">' + _e("unknown") + '</p>' + 
							'<p class="bi-mood talk-images mood-four">' + _e("unknown") + '</p>' + 
							'<p class="bi-activity talk-images activity-exercising">' + _e("unknown") + '</p>' + 
							'<p class="bi-tune talk-images tune-note">' + _e("unknown") + '</p>' + 
							'<p class="bi-geoloc talk-images location-world">' + _e("unknown") + '</p>' + 
							'<p class="bi-view talk-images view-individual"><a class="profile">' + _e("Profile") + '</a> / <a class="channel">' + _e("Channel") + '</a></p>' + 
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
				closeBubbles();
				
				// Profile
				if($(this).is('.profile'))
					openUserInfos(xid);
				
				// Channel
				else if($(this).is('.channel'))
					fromInfosMicroblog(xid, hash);
				
				return false;
			});
			
			$(bPath + ' .bi-edit a').click(function() {
				buddyEdit(xid, nick, subscription, groups);
				
				return false;
			});
		});
	}, function() {
		if(!exists(iPath + ' .manage-infos'))
			closeBubbles();
		
		$(bPath).stopTime();
	});
}

// Generates an array of the current groups of a buddy
function thisBuddyGroups(xid) {
	var path = '#buddy-list .buddy[data-xid=' + xid + '] ';
	var array = new Array();
	
	// Each checked checkboxes
	$(path + 'div.bm-choose input[type=checkbox]:checked').each(function() {
		array.push(unescape($(this).attr('data-group')));
	});
	
	// Entered input value (and not yet in the array)
	var value = $(path + 'p.bm-group input').val();
	
	if(value && !existArrayValue(array, value))
		array.push(value);
	
	return array;
}

// Adds a given contact to our roster
function addThisContact(xid, name) {
	logThis('Add this contact: ' + xid + ', as ' + name, 3);
	
	// Cut the resource of this XID
	xid = bareXID(xid);
	
	// If the form is complete
	if(xid) {
		// We send the subscription
		sendSubscribe(xid, 'subscribe');
		sendRoster(xid, '', name);
		
		// We hide the bubble
		closeBubbles();
	}
}

// Gets an array of all the groups in the roster
function getAllGroups() {
	var groups = new Array();
	
	$('#buddy-list .one-group').each(function() {
		var current = unescape($(this).attr('data-group'));
		
		if((current != _e("Unclassified")) && (current != _e("Gateways")))
			groups.push(current);
	});
	
	return groups.sort();
}

// Edits buddy informations
function buddyEdit(xid, nick, subscription, groups) {
	logThis('Buddy edit: ' + xid, 3);
	
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
	// html += ' / <a class="block">' + _e("Block") + '</a>';
	
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
	
	for(a in all_groups) {
		// Current group
		var all_groups_current = all_groups[a];
		
		// Is the current group checked?
		var checked = '';
		
		if(existArrayValue(groups, all_groups_current))
			checked = ' checked="true"';
		
		// Add the current group HTML
		all_groups_dom += '<label><input type="checkbox" data-group="' + escape(all_groups_current) + '"' + checked + ' /><span>' + all_groups_current.htmlEnc() + '</span></label>';
	}
	
	// Prepend this in the DOM
	var bm_choose = path + 'manage-infos div.bm-choose';
	
	$(bm_choose).prepend(all_groups_dom);
	
	// Apply the editing input events
	applyBuddyInput(xid);
}

// Updates the roster items
function sendRoster(xid, subscription, name, group) {
	// We send the new buddy name
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': xid}));
	
	// Any subscription?
	if(subscription)
		item.setAttribute('subscription', subscription);
	
	// Any name?
	if(name)
		item.setAttribute('name', name);
	
	// Any group?
	if(group && group.length) {
		for(i in group)
			item.appendChild(iq.buildNode('group', {'xmlns': NS_ROSTER}, group[i]));
	}
	
	con.send(iq);
	
	logThis('Roster item sent: ' + xid, 3);
}

// Adapts the roster height, depending of the window size
function adaptRoster() {
	// Process the new height
	var new_height = $('#left-content').height() - $('#my-infos').height() - 101;
	
	// New height too small
	if(new_height < 207)
		new_height = 207;
	
	// Apply the new height
	$('#buddy-list .content').css('height', new_height);
}

// Gets all the buddies in our roster
function getAllBuddies() {
	var buddies = new Array();
	
	$('#buddy-list .buddy').each(function() {
		var xid = $(this).attr('data-xid');
		
		if(xid)
			buddies.push(xid);
	});
	
	return buddies;
}

// Gets the user gateways
function getGateways() {
	// New array
	var gateways = new Array();
	var buddies = getAllBuddies();
	
	// Get the gateways
	for(c in buddies) {
		if(isGateway(buddies[c]))
			gateways.push(buddies[c]);
	}
	
	return gateways;
}

// Define a global var for buddy list all buddies displayed
var BLIST_ALL = false;

// Plugin launcher
function launchRoster() {
	// Filtering tool
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
		
		return false;
	});
	
	// When the user click on the add button, show the contact adding tool
	$('#buddy-list .foot .add').click(function() {
		// Reset the stuffs
		$('.add-contact-name-get').hide().removeAttr('data-for');
		$('.add-contact-name').val('');
		$('.add-contact-gateway').val('none');
		
		// Remove the gateways
		$('.add-contact-gateway option:not([value=none])').remove();
		
		// Add the gateways
		var gateways = getGateways();
		
		// Any gateway?
		if(gateways.length) {
			// Append the gateways
			for(i in gateways)
				$('.add-contact-gateway').append('<option value="' + escape(gateways[i]) + '">' + gateways[i].htmlEnc() +  '</option>');
			
			// Show the gateway selector
			$('.add-contact-gateway').parent().show();
		}
		
		// No gateway?
		else
			$('.add-contact-gateway').parent().hide();
		
		// We show the requested div
		showBubble('#buddy-conf-add');
		
		// We reset the input and focus on it
		$('.add-contact-jid').removeClass('please-complete').val('').focus();
		
		return false;
	});
	
	// Blur event on the add contact input
	$('.add-contact-jid').blur(function() {
		// Read the value
		var value = $(this).val();
		
		// Try to catch the buddy name
		if(value && !$('.add-contact-name').val() && ($('.add-contact-gateway').val() == 'none')) {
			// User XID
			var xid = generateXID(value, 'chat');
			
			// Notice for the user
			$('.add-contact-name-get').attr('data-for', escape(xid)).show();
			
			// Request the user vCard
			getAddUserName(xid);
		}
	});
	
	// When a key is pressed...
	$('#buddy-conf-add input, #buddy-conf-add select').keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13) {
			// Get the values
			var xid = $('.add-contact-jid').val();
			var name = $('.add-contact-name').val();
			var gateway = unescape($('.add-contact-gateway').val());
			
			// Generate the XID to add
			if((gateway != 'none') && xid)
				xid = xid.replace(/@/g, '%') + '@' + gateway;
			else
				xid = generateXID(xid, 'chat');
			
			// Submit the form
			if(xid && (xid != getXID()))
				addThisContact(xid, name);
			else
				$('.add-contact-jid').addClass('please-complete').focus();
			
			return false;
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
		$('#buddy-conf-join .join-jid').removeClass('please-complete').val('').focus();
		$('#buddy-conf-join .join-type').val('chat');
		
		return false;
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
					// Generate a correct XID
					xid = generateXID(xid, type);
					
					// Not me
					if(xid != getXID()) {
						// Update some things
						$('.join-jid').removeClass('please-complete');
						closeBubbles();
						
						// Create a new chat
						checkChatCreate(xid, type);
					}
					
					else
						$('.join-jid').addClass('please-complete');
				}
				
				else
					$('.join-jid').addClass('please-complete');
			}
			
			return false;
		}
		
		// Escape: quit
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
		
		return false;
	});
	
	// When the user wants to edit his groupchat favorites
	$('.buddy-conf-groupchat-edit').click(function() {
		openFavorites();
		closeBubbles();
		
		return false;
	});
	
	// When the user click on the more button, show the more menu
	$('#buddy-list .foot .more').click(function() {
		// We show the target bubble
		showBubble('#buddy-conf-more');
		
		return false;
	});
	
	// When the user click on the involve button, show the involve menu
	$('#buddy-list .foot .involve').click(function() {
		// We show the target bubble
		showBubble('#buddy-conf-involve');
		
		return false;
	});
	
	// When the user clicks on a link that fire the close bubble event
	$('#buddy-conf-more .buddy-conf-text a, #buddy-conf-involve .buddy-conf-text a').click(function() {
		closeBubbles();
		
		return false;
	});
	
	// When the user wants to display all his buddies
	$('.buddy-conf-more-display-unavailable').click(function() {
		showAllBuddies('roster');
		
		return false;
	});
	
	// When the user wants to display only online buddies
	$('.buddy-conf-more-display-available').click(function() {
		showOnlineBuddies('roster');
		
		return false;
	});
	
	// When the user click on the archives link
	$('.buddy-conf-more-archives').click(function() {
		openArchives();
		
		return false;
	});
	
	// When the user click on the service discovery link
	$('.buddy-conf-more-service-disco').click(function() {
		openDiscovery();
		
		return false;
	});
}

// Window resize event handler
$(window).resize(adaptRoster);
