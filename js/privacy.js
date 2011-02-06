/*

Jappix - An open social platform
These are the privacy JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/02/11

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
			'<label><input type="radio" name="type" value="visible" />' + _e("Visible") + '</label>' + 
			'<label><input type="radio" name="type" value="invisible" />' + _e("Invisible") + '</label>' + 
		'</div>' + 
		
		'<div class="privacy-second">' + 
			
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
	var iqQuery = iq.getQuery();
	
	// Store markers for each item
	$(iqQuery).find('item').each(function() {
		if($(this).attr('type') == 'jid')
			setDB('privacy', $(this).attr('value'), $(this).attr('action'));
	});
	
	// TODO: support for all kind of "type" attributes: groups and so on
	
	logThis('Got privacy list(s).', 3);
}

// Plugin launcher
function launchPrivacy() {
	// Click events
	$('#privacy .bottom .finish').click(closePrivacy);
	
	// Placeholder events
	$('#privacy input[placeholder]').placeholder();
}
