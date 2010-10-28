/*

Jappix - An open social platform
These are the collections functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 22/08/10

*/

// Opens the collections tools
function openCollections() {
	$('#collections').show();
}

// Closes the collections tools
function closeCollections() {
	$('#collections').hide();
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
