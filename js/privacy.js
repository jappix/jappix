/*

Jappix - An open social platform
These are the privacy JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 13/02/11

*/

// Opens the privacy popup
function openPrivacy() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Privacy") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="privacy-head">' + 
			'<div class="list-left">' + 
				'<span>' + _e("Choose") + '</span>' + 
				'<select>' + 
					'<option value="none" selected="">' + _e("None") +  '</option>' + 
				'</select>' + 
				'<a class="list-remove one-button talk-images" title="' + _e("Remove") + '"></a>' + 
			'</div>' + 
			
			'<div class="list-center"></div>' + 
			
			'<div class="list-right">' + 
				'<span>' + _e("Add") + '</span>' + 
				'<input type="text" placeholder="' + _e("List name") + '" />' + 
				'<a class="list-add one-button talk-images" title="' + _e("Add") + '"></a>' + 
			'</div>' + 
		'</div>' + 
		
		'<p class="privacy-current">' + _e("You are not viewing any list at the moment.") + '</p>' + 
		
		'<form>' + 
			'<div class="privacy-first">' + 
				'<label><input type="radio" name="type" value="allow" disabled="" />' + _e("Allow") + '</label>' + 
				'<label><input type="radio" name="type" value="deny" disabled="" />' + _e("Deny") + '</label>' + 
			'</div>' + 
			
			'<div class="privacy-second">' + 
				'<label><input type="radio" name="order" value="xid" disabled="" />' + _e("Address") + '<input type="text" name="xid" disabled="" /></label>' + 
				'<label><input type="radio" name="order" value="group" disabled="" />' + _e("Group") + '<select name="group" disabled="">' + groupsToHtmlPrivacy() + '</select></label>' + 
				'<label><input type="radio" name="order" value="subscription" disabled="" />' + _e("Subscription") + 
					'<select name="subscription" disabled="">' + 
						'<option value="none">' + _e("None") + '</option>' + 
						'<option value="both">' + _e("Both") + '</option>' + 
						'<option value="from">' + _e("From") + '</option>' + 
						'<option value="to">' + _e("To") + '</option>' + 
					'</select>' + 
				'</label>' + 
				'<label><input type="radio" name="order" value="everybody" disabled="" />' + _e("Everybody") + '</label>' + 
			'</div>' + 
			
			'<div class="privacy-third">' + 
				'<label><input type="checkbox" name="send-messages" disabled="" />' + _e("Send messages") + '</label>' + 
				'<label><input type="checkbox" name="send-queries" disabled="" />' + _e("Send queries") + '</label>' + 
				'<label><input type="checkbox" name="see-status" disabled="" />' + _e("See my status") + '</label>' + 
				'<label><input type="checkbox" name="send-status" disabled="" />' + _e("Send his/her status") + '</label>' + 
				'<label><input type="checkbox" name="everything" disabled="" />' + _e("Everything") + '</label>' + 
			'</div>' + 
		'</form>' + 
		
		'<div class="infos">' + 
			'<p class="infos-title">' + _e("Manage your private life with this tool!") + '</p>' + 
			'<p>' + _e("You can create rules to block access to your account for an undesired user, or manage who can see what.") + '</p>' + 
			'<p>' + _e("You must first add a new rule, then select the rule type, and define the actions to do.") + '</p>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('privacy', html);
	
	// Associate the events
	launchPrivacy();
	
	// Get the available privacy lists
	listPrivacy();
	
	return false;
}

// Quits the privacy popup
function closePrivacy() {
	// Destroy the popup
	destroyPopup('privacy');
	
	return false;
}

// Gets available privacy lists
function listPrivacy() {
	// Build query
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	iq.setQuery(NS_PRIVACY);
	
	con.send(iq, handleListPrivacy);
	
	logThis('Getting available privacy list(s)...');
}

// Handles available privacy lists
function handleListPrivacy(iq) {
	// Get IQ query content
	var iqQuery = iq.getQuery();
	
	// Save the content
	setDB('privacy-lists', 'available', xmlToString(iqQuery));
	
	// Any block list?
	if($(iqQuery).find('list[name=block]').size()) {
		// Not the default one?
		if(!$(iqQuery).find('default[name=block]').size())
			changePrivacy('block', 'default');
		else
			setDB('privacy-marker', 'default', 'block');
		
		// Not the active one?
		if(!$(iqQuery).find('active[name=block]').size())
			changePrivacy('block', 'active');
		else
			setDB('privacy-marker', 'active', 'block');
		
		// Get the block list rules
		getPrivacy('block');
	}
	
	logThis('Got available privacy list(s).', 3);
}

// Gets privacy lists
function getPrivacy(list) {
	// Build query
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	// Privacy query
	var iqQuery = iq.setQuery(NS_PRIVACY);
	iqQuery.appendChild(iq.buildNode('list', {'xmlns': NS_PRIVACY, 'name': list}));
	
	con.send(iq, handleGetPrivacy);
	
	logThis('Getting privacy list(s): ' + list);
}

// Handles privacy lists
function handleGetPrivacy(iq) {
	// Apply a "received" marker
	setDB('privacy-marker', 'available', 'true');
	$('.privacy-hidable').show();
	
	// Store the data for each list
	$(iq.getQuery()).find('list').each(function() {
		// Read list name
		var list_name = $(this).attr('name');
		
		// Store list content
		setDB('privacy', list_name, xmlToString(this));
		
		// Is this a block list?
		if(list_name == 'block') {
			// Reset buddies
			$('#buddy-list .buddy').removeClass('blocked');
			
			// XID types
			$(this).find('item[action=deny][type=jid]').each(function() {
				$('#buddy-list .buddy[data-xid=' + $(this).attr('value') + ']').addClass('blocked');
			});
			
			// Group types
			$(this).find('item[action=deny][type=group]').each(function() {
				$('#buddy-list .group' + hex_md5($(this).attr('value')) + ' .buddy').addClass('blocked');
			});
		}
	});
	
	logThis('Got privacy list(s).', 3);
}

// Sets a privacy list
function setPrivacy(list, types, values, actions, orders, presence_in, presence_out, msg, iq_p) {
	// Build query
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	// Privacy query
	var iqQuery = iq.setQuery(NS_PRIVACY);
	var iqList = iqQuery.appendChild(iq.buildNode('list', {'xmlns': NS_PRIVACY, 'name': list}));
	
	// Build the item node
	for(var i = 0; i < types.length; i++) {
		// Item element
		var iqItem = iqList.appendChild(iq.buildNode('item', {
									'xmlns': NS_PRIVACY,
									'type': types[i],
									'value': values[i],
									'action': actions[i],
									'order': orders[i]
								     }
							    ));
		
		// Child elements
		if(presence_in[i])
			iqItem.appendChild(iq.buildNode('presence-in', {'xmlns': NS_PRIVACY}));
		if(presence_out[i])
			iqItem.appendChild(iq.buildNode('presence-out', {'xmlns': NS_PRIVACY}));
		if(msg[i])
			iqItem.appendChild(iq.buildNode('message', {'xmlns': NS_PRIVACY}));
		if(iq_p[i])
			iqItem.appendChild(iq.buildNode('iq', {'xmlns': NS_PRIVACY}));
	}
	
	con.send(iq);
	
	logThis('Sending privacy list: ' + list);
}

// Push a privacy list item to a list
function pushPrivacy(list, type, value, action, order, presence_in, presence_out, msg, iq_p) {
	// Read the stored elements (to add them)
	var stored = getDB('privacy', list);
	
	// Serialize them to an array
	$(stored).find('item').each(function() {
		// Attributes
		var c_type = $(this).attr('type');
		var c_value = $(this).attr('value');
		var c_action = $(this).attr('action');
		var c_order = $(this).attr('order');
		
		// Don not push it twice!
		if(c_value != value[0]) {
			if(!c_type)
				c_type = '';
			if(!c_value)
				c_value = '';
			if(!c_action)
				c_action = '';
			if(!c_order)
				c_order = '';
			
			type.push(c_type);
			value.push(c_value);
			action.push(c_action);
			order.push(c_order);
			
			// Child elements
			if($(this).find('presence-in').size())
				presence_in.push(true);
			else
				presence_in.push(false);
			
			if($(this).find('presence-out').size())
				presence_out.push(true);
			else
				presence_out.push(false);
			
			if($(this).find('message').size())
				msg.push(true);
			else
				msg.push(false);
			
			if($(this).find('iq').size())
				iq_p.push(true);
			else
				iq_p.push(false);
		}
	});
	
	// Send it!
	setPrivacy(list, type, value, action, order, presence_in, presence_out, msg, iq_p);
}

// Change a privacy list status
function changePrivacy(list, status) {
	// Yet sent?
	if(getDB('privacy-marker', status) == list)
		return;
	
	// Write a marker
	setDB('privacy-marker', status, list);
	
	// Build query
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	// Privacy query
	var iqQuery = iq.setQuery(NS_PRIVACY);
	iqQuery.appendChild(iq.buildNode(status, {'xmlns': NS_PRIVACY, 'name': list}));
	
	con.send(iq);
	
	logThis('Changing privacy list status: ' + list + ' to: ' + status);
}

// Checks the privacy status (action) of a value
function statusPrivacy(list, value) {
	return $(getDB('privacy', list)).find('item[value=' + value + ']').attr('action');
}

// Converts the groups array into a <option /> string
function groupsToHtmlPrivacy() {
	var groups = getAllGroups();
	var html = '';
	
	// Generate HTML
	for(i in groups) {
		html += '<option value="' + encodeQuotes(groups[i]) +'">' + groups[i].htmlEnc() + '</option>';
	}
	
	return html;
}

// Clears the privacy list form
function clearFormPrivacy() {
	// Uncheck checkboxes & radio inputs
	$('#privacy form input[type=checkbox], #privacy form input[type=radio]').removeAttr('checked');
	
	// Reset select
	$('#privacy form select option').removeAttr('selected');
	$('#privacy form select option:first').attr('selected', true);
	
	// Reset text input
	$('#privacy form input[type=text]').val('');
}

// Disables the privacy list form
function disableFormPrivacy() {
	$('#privacy form input, #privacy form select').attr('disabled', true);
}

// Enables the privacy list form
function enableFormPrivacy(rank) {
	$('#privacy .privacy-' + rank + ' input, #privacy .privacy-' + rank + ' select').removeAttr('disabled');
}

// Plugin launcher
function launchPrivacy() {
	// Click events
	$('#privacy .bottom .finish').click(closePrivacy);
	
	// Placeholder events
	$('#privacy input[placeholder]').placeholder();
	
	// Form events
	$('#privacy .privacy-head .list-left select').change(function() {
		// Reset the form
		clearFormPrivacy();
		disableFormPrivacy();
		
		// Retrieve the list data
		if($(this).val() != 'none')
			getPrivacy([$(this).val()]);
		
		// Switch to the first form item
		// enableFormPrivacy('first');
		
		// TODO: use this only when add a list, here load data from DB!
		// TODO: save when display another list or add a new one!
	});
	
	$('#privacy .privacy-first input').change(function() {
		enableFormPrivacy('second');
	});
	
	$('#privacy .privacy-second input').change(function() {
		enableFormPrivacy('third');
	});
	
	// Parse it!
	// TODO
	/* $(iq.getQuery()).find('list').each(function() {
		var list_name = $(this).attr('name');
		
		if(list_name)
			$('#privacy .privacy-head .list-left select').append('<option value="' + encodeQuotes(list_name) + '">' + list_name.htmlEnc() + '</option>');
	}); */
}
