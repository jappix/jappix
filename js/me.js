/*

Jappix - An open social platform
These are the Jappix Me tool functions for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Last revision: 16/01/12

*/

// Opens the Me tools
function openMe() {	
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Public profile") + '</div>' + 
	
	'<div class="content">' + 
		'<a class="me-images logo" href="https://me.jappix.com/" target="_blank"></a>' + 
		
		'<div class="infos">' + 
			'<p class="infos-title">' + _e("Your profile anywhere on the Web.") + '</p>' + 
			'<p>' + printf(_e("%s is a Jappix.com service which makes your XMPP profile public. It is easier to share it. No XMPP account is required to view your social channel, your current position and your contact details."), '<a href="https://me.jappix.com/" target="_blank">Jappix Me</a>') + '</p>' + 
			'<p>' + _e("Furthermore, every picture you post in your social channel is added to a beautiful picture timeline. You can now view the pictures you shared year by year.") + '</p>' + 
			'<p>' + _e("You can also use your XMPP avatar as a single avatar for every website, blog and forum you use. When you change it on XMPP, the new avatar appears everywhere. What a genious improvement!") + '</p>' + 
		'</div>' + 
		
		'<a class="go one-button" href="https://me.jappix.com/new" target="_blank">' + _e("Yay, let's create my public profile!") + '</a>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<a href="#" class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('me', html);
	
	// Associate the events
	launchMe();
	
	logThis('Public profile tool opened.');
}

// Closes the Me tools
function closeMe() {
	// Destroy the popup
	destroyPopup('me');
	
	return false;
}

// Plugin launcher
function launchMe() {
	// Click events
	$('#me .content a.go').click(function() {
		closeMe();
	});
	
	$('#me .bottom .finish').click(closeMe);
}