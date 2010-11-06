/*

Jappix - An open social platform
These are the popup JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Creates a popup code
function createPopup(id, content) {
	// Popup exists?
	if(exists('#' + id))
		return false;
	
	// Append the popup code
	$('body').prepend(
		'<div id="' + id + '" class="lock hidable">' + 
			'<div class="popup">' + 
				content + 
			'</div>' + 
		'</div>'
	);
	
	return true;
}

// Destroys a popup code
function destroyPopup(id) {
	$('#' + id).remove();
}
