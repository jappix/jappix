/*

Jappix - An open social platform
These are the privacy JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 09/02/11

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
				'<select></select>' + 
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
		
		'<div class="privacy-first">' + 
			'<label><input type="radio" name="type" value="allow" />' + _e("Allow") + '</label>' + 
			'<label><input type="radio" name="type" value="deny" />' + _e("Deny") + '</label>' + 
		'</div>' + 
		
		'<div class="privacy-second">' + 
			'<label><input type="radio" name="order" value="xid" />' + _e("Address") + '<input type="text" name="xid" /></label>' + 
			'<label><input type="radio" name="order" value="group" />' + _e("Group") + '<select name="group">' + groupsToHtmlPrivacy() + '</select></label>' + 
			'<label><input type="radio" name="order" value="subscription" />' + _e("Subscription") + 
				'<select name="subscription">' + 
					'<option value="none">' + _e("None") + '</option>' + 
					'<option value="both">' + _e("Both") + '</option>' + 
					'<option value="from">' + _e("From") + '</option>' + 
					'<option value="to">' + _e("To") + '</option>' + 
				'</select>' + 
			'</label>' + 
			'<label><input type="radio" name="order" value="everybody" />' + _e("Everybody") + '</label>' + 
		'</div>' + 
		
		'<div class="privacy-third">' + 
			'<label><input type="checkbox" name="send-messages" />' + _e("Send messages") + '</label>' + 
			'<label><input type="checkbox" name="send-queries" />' + _e("Send queries") + '</label>' + 
			'<label><input type="checkbox" name="see-status" />' + _e("See my status") + '</label>' + 
			'<label><input type="checkbox" name="send-status" />' + _e("Send his/her status") + '</label>' + 
			'<label><input type="checkbox" name="everything" />' + _e("Everything") + '</label>' + 
		'</div>' + 
		
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
	
	return false;
}

// Quits the privacy popup
function closePrivacy() {
	// Destroy the popup
	destroyPopup('privacy');
	
	return false;
}

// Does something for privacy on a given XID
function updatePrivacy(xid, action) {	
	// TODO
	
	// Update the marker
	setDB('privacy', xid, action);
}

// Gets privacy lists
function getPrivacy(lists) {
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	// Privacy query
	var iqQuery = iq.setQuery(NS_PRIVACY);
	
	// Lists
	if(lists && lists.length) {
		for(i in lists)
			iqQuery.appendChild(iq.buildNode('list', {'xmlns': NS_PRIVACY, 'name': lists[i]}));
	}
	
	con.send(iq, handlePrivacy);
	
	logThis('Getting privacy list(s): ' + lists);
}

// Handles privacy lists
function handlePrivacy(iq) {
	// Apply a "received" marker
	setDB('privacy-marker', 'active', 'true');
	$('.privacy-hidable').show();
	
	var iqQuery = iq.getQuery();
	
	// Store markers for each item
	$(iqQuery).find('item').each(function() {
		if($(this).attr('type') == 'jid')
			setDB('privacy', $(this).attr('value'), $(this).attr('action'));
	});
	
	// TODO: support for all kind of "type" attributes: groups and so on
	
	logThis('Got privacy list(s).', 3);
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

// Plugin launcher
function launchPrivacy() {
	// Click events
	$('#privacy .bottom .finish').click(closePrivacy);
	
	// Placeholder events
	$('#privacy input[placeholder]').placeholder();
}
