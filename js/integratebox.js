/*

Jappix - An open social platform
These are the integratebox JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 01/08/10

*/

// Opens the integratebox popup
function openIntegrateBox() {
	$('#integratebox').show();
}

// Closes the integratebox popup
function closeIntegrateBox() {
	$('#integratebox').hide();
	
	// We reset the integratebox
	$('#integratebox .one-media').remove();
	
	return false;
}

// Applies a given integratebox element
function applyIntegrateBox(url, serv) {
	// We remove the old media (security)
	$('#integratebox .one-media').remove();
	
	// Show the waiting item
	var waitItem = $('#integratebox .wait');
	waitItem.show();
	
	// We show the integratebox
	openIntegrateBox();
	
	// We request the html code
	$.get('./php/media-embed.php', { id: url, service: serv },
		function(data) {
			// We display the new item
			$('#integratebox .content').prepend('<div class="one-media">' + data + '</div>');
			
			// Hide the waiting item depending on the service
			if(serv == 'image')
				$('#integratebox img').load(function() {
					waitItem.hide();
				});
			
			else
				waitItem.hide();
		});
	
	return false;
}
