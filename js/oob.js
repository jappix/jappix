/*

Jappix - An open social platform
These are the Out of Band Data JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 26/08/11

*/

// Uploads an OOB file
function uploadOOB() {
	// File upload vars
	var oob_upload_options = {
		dataType:	'xml',
		beforeSubmit:	waitUploadOOB,
		success:	handleUploadOOB
	};
	
	// Upload form submit event
	$('#oob_upload').submit(function() {
		if($('#oob_upload input[type=file]').val())
			$(this).ajaxSubmit(oob_upload_options);
		
		return false;
	});
	
	// Upload input change event
	$('#oob_upload input[type=file]').change(function() {
		if($(this).val())
			$('#oob_upload').ajaxSubmit(oob_upload_options);
		
		return false;
	});
}

// Wait event for OOB upload
function waitUploadOOB() {
	// Append the wait icon TODO
	// $('#oob_upload input[type=submit]').after('<div class="wait wait-medium"></div>');
	
	// Lock the bubble
	$('#oob_upload').removeClass('bubble');
	
	// Hide the bubble
	$('#page-engine .bubble-file').hide();
}

// Success event for OOB upload
function handleUploadOOB(responseXML) {
	$('#page-engine .bubble-file').remove();
	
	return;
	
	// Data selector
	var dData = $(responseXML).find('jappix');
	
	// Process the returned data
	if(dData.find('error').size()) {
		openThisError(4);
		
		// Unlock the bubble?
		if(!exists('#attach .one-file')) {
			$('#oob_upload').addClass('bubble').hide();
			
			// Show the bubble again!
			showBubble('#oob_upload');
		}
		
		logThis('Error while attaching the file: ' + dData.find('error').text(), 1);
	}
	
	else {
		// Do not allow this bubble to be hidden
		$('#oob_upload').removeClass('bubble');
		
		// Get the file values
		var fName = dData.find('title').text();
		var fType = dData.find('type').text();
		var fLength = dData.find('length').text();
		var fURL = dData.find('href').text();
		var fThumb = dData.find('thumb').text();
		
		// Generate a file ID
		var fID = hex_md5(fURL);
		
		// Add this file
		$('#oob_upload .attach-subitem').append(
			'<div class="one-file" data-type="' + encodeQuotes(fType) + '" data-length="' + encodeQuotes(fLength) + '" data-thumb="' + encodeQuotes(fThumb) + '" data-id="' + fID + '">' + 
				'<a class="remove talk-images" href="#" title="' + encodeQuotes(_e("Unattach the file")) + '"></a>' + 
				'<a class="link" href="' + encodeQuotes(fURL) + '" target="_blank">' + fName.htmlEnc() + '</a>' + 
			'</div>'
		);
		
		// Click event
		$('#oob_upload .one-file[data-id=' + fID + '] a.remove').click(function() {
			return unattachMicroblog(fID);
		});
		
		logThis('File attached.', 3);
	}
	
	// Reset the attach bubble
	$('#oob_upload input[type=file]').val('');
	$('#oob_upload .wait').remove();
	
	// Focus on the text input
	$(document).oneTime(10, function() {
		$('#channel .top input[name=microblog_body]').focus();
	});
}
