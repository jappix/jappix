/*

Jappix - An open social platform
These are the popup JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 10/04/12

*/

// Creates a popup code
function createPopup(id, content) {
	// Popup exists?
	if(exists('#' + id))
		return false;
	
	// Popop on top of another one?
	var top_of = exists('div.lock:has(div.popup)');
	
	// Append the popup code
	$('body').append(
		'<div id="' + id + '" class="lock removable">' + 
			'<div class="popup">' + 
				content + 
			'</div>' + 
		'</div>'
	);
	
	// Avoids darker popup background (if on top of another popup)
	if(top_of)
		$('#' + id).css('background', 'transparent');
	
	return true;
}

// Destroys a popup code
function destroyPopup(id) {
	// Stop the popup timers
	$('#' + id + ' *').stopTime();
	
	// Remove the popup
	$('#' + id).remove();
	
	// Manage input focus
	inputFocus();
}
