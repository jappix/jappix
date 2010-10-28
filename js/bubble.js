/*

Jappix - An open social platform
These are the bubble JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 16/08/10

*/

// Closes all the opened bubbles
function closeBubbles() {
	$('.bubble:visible').hide();
	
	$('#talk').die('click');
}

// Click function when a bubble is opened
function showBubble(selector) {
	// This bubble is yet displayed? So abort!
	if($(selector).is(':visible')) {
		closeBubbles();
		return;
	}
	
	// First close all opened bubbles
	closeBubbles();
	
	// Show the requested bubble
	$(selector).show();
	
	// Creates a new click event to close the bubble
	$('#talk').live('click', function(evt) {
		var target = evt.target;
		
		// If this is a click away from a bubble
		if(!$(target).parents('.ibubble').size())
			closeBubbles();
	});
}
