/*

Jappix - An open social platform
These are the privacy JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 25/12/10

*/

// Opens the privacy popup
function openPrivacy() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Privacy") + '</div>' + 
	
	'<div class="content"></div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish save disabled">' + _e("Save") + '</a>' + 
		'<a class="finish cancel">' + _e("Cancel") + '</a>' + 
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

// Saves the privacy settings
function savePrivacy() {
	// TODO
	
	return closePrivacy();
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
	
	logThis('Got privacy list(s).', 3);
}

// Plugin launcher
function launchPrivacy() {
	// Click events
	$('#privacy .bottom .finish').click(function() {
		if($(this).is('.cancel'))
			return closePrivacy();
		if($(this).is('.save') && !$(this).hasClass('disabled'))
			return savePrivacy();
	});
}
