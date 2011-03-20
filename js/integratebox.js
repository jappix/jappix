/*

Jappix - An open social platform
These are the integratebox JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 03/03/11

*/

// Opens the integratebox popup
function openIntegrateBox() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Media viewer") + '</div>' + 
	
	'<div class="content"></div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a href="#" class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('integratebox', html);
	
	// Associate the events
	launchIntegratebox();
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
	
	// Protocol to use
	var protocol = 'http';
	
	if(window.location.href && (window.location.href).match(/^https/i))
		protocol = 'https';
	
	// Legacy browser
	var legacy = false;
	
	if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9))
		legacy = true;
	
	// Switch to get the good DOM code
	switch(serv) {
		case 'youtube':
			if(legacy)
				code = '<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/' + url + '&amp;autoplay=1"></param><embed src="http://www.youtube.com/v/' + url + '&amp;autoplay=1" type="application/x-shockwave-flash" width="640" height="385"></embed></object>';
			else
				code = '<object width="640" height="385" data="' + protocol + '://www.youtube.com/embed/' + url + '?autoplay=1" type="text/html"><a href="http://www.youtube.com/watch?v=' + url + '">http://www.youtube.com/watch?v=' + url + '</a></object>';
			
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
function applyIntegrateBox(url, service) {
	// Apply the HTML code
	var dom_code = codeIntegrateBox(service, url);
	
	// Any code: apply it!
	if(dom_code) {
		// We show the integratebox
		openIntegrateBox();
		
		// We add the code to the DOM
		$('#integratebox .content').prepend('<div class="one-media">' + dom_code + '</div>');
		
		// Image waiting icon
		if(service == 'image') {
			var waitItem = $('#integratebox .wait');
			
			// Show it while it is loading
			waitItem.show();
			
			// Hide it when it is loaded
			$('#integratebox img').load(function() {
				waitItem.hide();
			});
		}
		
		return false;
	}
	
	// Nothing: return true to be able to open the URL in a new tab
	return true;
}

// Filters a string to apply the integratebox links
function filterIntegrateBox(string) {
	// Encapsulates the string into two <div /> elements
	string = $('<div><div>' + string + '</div></div>').contents();
	
	// Loop the <a /> elements
	$(string).find('a').each(function() {
		// Initialize this element
		var href = $(this).attr('href');
		var to, url, service, event;
		
		// XMPP ID
		if(href.match(/^xmpp:(.+)/i))
			to = RegExp.$1;
		
		// YouTube video box
		else if(href.match(/(\w{3,5})(:)(\S+)((\.youtube\.com\/watch(\?v|\?\S+v|\#\!v|\#\!\S+v)\=)|(youtu\.be\/))([^& ]+)((&amp;\S)|(&\S)|\s|$)/gim)) {
			url = RegExp.$8;
			service = 'youtube';
		}
		
		// Dailymotion video box
		else if(href.match(/(\w{3,5})(:)(\S+)\.dailymotion\.com\/video\/([\w\-]+)((\#[\w\-]+)|\s|$)/gim)) {
			url = RegExp.$4;
			service = 'dailymotion';
		}
		
		// Vimeo video box
		else if(href.match(/((\w{3,5})(:)(\S+)(vimeo|www\.vimeo)\.com\/([\w\-]+))/gim)) {
			url = RegExp.$1;
			service = 'vimeo';
		}
		
		// Theora video box
		else if(href.match(/((\w{3,5})(:)(\S+)(\.)(ogv|ogg))/gim)) {
			url = RegExp.$1;
			service = 'theora';
		}
		
		// Vorbis audio box
		else if(href.match(/((\w{3,5})(:)(\S+)(\.oga))/gim)) {
			url = RegExp.$1;
			service = 'vorbis';
		}
		
		// Image box
		else if(href.match(/((\w{3,5})(:)(\S+)(\.)(jpg|jpeg|png|gif|tif|bmp))/gim)) {
			url = RegExp.$1;
			service = 'image';
		}
		
		// Define the good event
		if(to)
			event = 'checkChatCreate(\'' + encodeOnclick(to) + '\', \'chat\')';
		else if(url && service)
			event = 'applyIntegrateBox(\'' + encodeOnclick(url) + '\', \'' + encodeOnclick(service) + '\')';
		
		// Any click event to apply?
		if(event)
			$(this).attr('onclick', 'return ' + event + ';');
	});
	
	// Regenerate the HTML code (include string into a div to be readable)
	string = $(string).html();
	
	return string;
}

// Plugin launcher
function launchIntegratebox() {
	// Click event
	$('#integratebox .bottom .finish').click(function() {
		return closeIntegrateBox();
	});
}
