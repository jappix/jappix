/*

Jappix - An open social platform
These are the integratebox JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Opens the integratebox popup
function openIntegrateBox() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Media viewer") + '</div>' + 
	
	'<div class="content"></div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish" onclick="return closeIntegrateBox();">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('integratebox', html);
}

// Closes the integratebox popup
function closeIntegrateBox() {
	// Destroy the popup
	destroyPopup('integratebox');
	
	return false;
}

// Generates the integratebox HTML code
function codeIntegrateBox(serv, url) {
	var code = '';
	
	// Switch to get the good DOM code
	switch(serv) {
		case 'youtube':
			code = '<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/' + url + '&amp;autoplay=1"></param><embed src="http://www.youtube.com/v/' + url + '&amp;autoplay=1" type="application/x-shockwave-flash" width="640" height="385"></embed></object>';
			
			break;
		
		case 'dailymotion':
			code = '<object width="640" height="385"><param name="movie" value="http://www.dailymotion.com/swf/video/' + url + '&amp;autoplay=1"></param><param name="allowFullScreen" value="false"></param><embed type="application/x-shockwave-flash" src="http://www.dailymotion.com/swf/video/' + url + '&amp;autoplay=1" width="640" height="385" allowfullscreen="true" allowscriptaccess="always"></embed></object>';
			
			break;
		
		case 'vimeo':
			code = '<object width="640" height="385"><param name="allowfullscreen" value="true" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=' + url + '&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1&amp;autoplay=1" /><embed src="http://vimeo.com/moogaloop.swf?clip_id=' + url + '&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1&amp;autoplay=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="640" height="385"></embed></object>';
			
			break;
		
		case 'theora':
		case 'video':
			code = '<video width="640" height="385" src="' + url + '" controls autoplay></video>';
			
			break;
		
		case 'vorbis':
		case 'audio':
			code = '<audio src="' + url + '" controls autoplay></audio>';
			
			break;
		
		case 'image':
			code = '<a href="' + url + '" target="_blank"><img alt="" src="' + url + '" /></a>';
		
			break;
	}
	
	return code;
}

// Applies a given integratebox element
function applyIntegrateBox(url, serv) {
	// Reset the integratebox (security)
	closeIntegrateBox();
	
	// Apply the HTML code
	var dom_code = codeIntegrateBox(serv, url);
	
	// Any code: apply it!
	if(dom_code) {
		// We show the integratebox
		openIntegrateBox();
		
		// We add the code to the DOM
		$('#integratebox .content').prepend('<div class="one-media">' + dom_code + '</div>');
		
		// Image waiting icon
		if(serv == 'image') {
			var waitItem = $('#integratebox .wait');
			
			// Show it while it is loading
			waitItem.show();
			
			// Hide it when it is loaded
			$('#integratebox img').load(function() {
				waitItem.hide();
			});
		}
	}
	
	// Nothing: return true to be able to open the URL in a new tab
	else
		return true;
	
	return false;
}
