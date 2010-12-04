/*

Jappix - An open social platform
These are the map of friends functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 04/12/10

*/

// Opens the map tools
function openMap() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Map of friends") + '</div>' + 
	
	'<div class="content"></div>' + 
	
	'<div class="bottom">' + 
		'<a class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('map', html);
	
	// Associate the events
	launchMap();
}

// Closes the map tools
function closeMap() {
	// Destroy the popup
	destroyPopup('map');
	
	return false;
}

// Plugin launcher
function launchMap() {
	// Click events
	$('#map .bottom .finish').click(function() {
		return closeMap();
	});
}
