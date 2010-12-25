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
