/*

Jappix - An open social platform
These are the Out of Band Data JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 27/08/11

*/

// Sends an OOB request to someone
function sendOOB(xid, type, url, desc) {
	alert('[DEBUG ALERT]\n\nTo: ' + xid + '\nType: ' + type + '\nURL: ' + url + '\nDesc: ' + desc);
}

// Wait event for OOB upload
function waitUploadOOB() {
	// Append the wait icon
	$('#page-engine .chat-tools-file:not(.mini) .tooltip-subitem *').hide();
	$('#page-engine .chat-tools-file:not(.mini) .tooltip-subitem').append('<div class="wait wait-medium"></div>');
	
	// Lock the bubble
	$('#page-engine .chat-tools-file:not(.mini)').addClass('mini');
}

// Success event for OOB upload
function handleUploadOOB(responseXML) {
	// Data selector
	var dData = $(responseXML).find('jappix');
	var fID = dData.find('id').text();
	
	// Not available?
	if($('#page-engine .chat-tools-file' + oob_has).is(':hidden'))
		return;
	
	// Get the OOB values
	var oob_has = ':has(#oob-upload input[value=' + fID + '])';
	var xid = $('#page-engine .page-engine-chan' + oob_has).attr('data-xid');
	var oob_type = $('#page-engine .chat-tools-file' + oob_has).attr('data-oob');
	
	// Reset the file send tool
	$('#page-engine .chat-tools-file' + oob_has).removeClass('mini');
	$('#page-engine .bubble-file' + oob_has).remove();
	
	// Process the returned data
	if(dData.find('error').size()) {
		openThisError(4);
		
		logThis('Error while sending the file: ' + dData.find('error').text(), 1);
	}
	
	else {
		// Get the file values
		var fURL = dData.find('url').text();
		var fDesc = dData.find('desc').text();
		
		// Send the OOB request
		sendOOB(xid, oob_type, fURL, fDesc);
		
		logThis('File request sent.', 3);
	}
}
