/*

Jappix - An open social platform
These are the albums JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 29/12/10

*/

// Opens the albums tools
function openAlbums(xid) {
	// Albums HTML content
	var html = 
	'<div id="albums" class="page-engine-chan">' + 
		'<div class="top ' + hex_md5(xid) + '">' + 
			'<div class="avatar-container">' + 
				'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
			'</div>' + 
			
			'<div class="update">' + 
				'<h2>' + printf(_e("Albums of %s"), getBuddyName(xid).htmlEnc()) + '</h2>' + 
			'</div>' + 
		'</div>' + 
		
		'<div class="content"></div>' + 
		
		'<div class="footer"></div>' + 
	'</div>';
	
	// Create the HTML code
	$('#page-engine').append(html);
	
	// Switcher
	generateSwitch('albums', 'albums', xid, _e("Albums"));
	
	// Switch to the albums
	switchChan('albums');
	
	// Get the avatar
	getAvatar(xid, 'cache', 'true', 'forget');
	
	return false;
}

// Closes the albums tools
function closeAlbums() {
	// Get the ID of the previous element
	var previous = $('#albums').prev().attr('id');
	
	// Destroy the albums content
	deleteThisChat('albums');
	
	// Switch to the nearest tab
	switchChan(previous);
}

// Retrieves one albums
function retrieveAlbums(xid) {
	
}
