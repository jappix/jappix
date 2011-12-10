/*

Jappix - An open social platform
These are the popup JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 20/02/11

*/

// Creates a popup code
function createPopup(id, content) {
	// Popup exists?
	if(exists('#' + id))
		return false;
	
	// Append the popup code
	$('body').append(
		'<div id="' + id + '" class="lock removable">' + 
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
	
	// Manage input focus
	inputFocus();
}
