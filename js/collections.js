/*

Jappix - An open social platform
These are the collections functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Opens the collections tools
function openCollections() {
	// Popup HTML content
	var html =
	'<div class="top">' + _e("Collections") + '</div>' + 
	
	'<div class="content"></div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish" onclick="return closeCollections();">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('collections', html);
}

// Closes the collections tools
function closeCollections() {
	// Destroy the popup
	destroyPopup('collections');
}

// Retrieve the collections of an entity
function retrieveCollections(xid) {
	openCollections();
	getCollections(xid);
}

// Gets the collections of an entity
function getCollections(xid) {
	// TODO
}
