/*

Jappix - An Open μSocial Platform
These are the others JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// Allows the user to choose his own locale
$(document).ready(function() {
	$('#home .locale').hover(function() {
		$('#home .locale ul').show();
	}, function() {
		$('#home .locale ul').hide();
	});
});

// Allows the user to switch the difference home page elements
function switchHome(div) {
	// We switch the div
	$('#home .right .homediv, #home .right .top').hide();
	$('#home .right .' + div).show();
	
	// We reset all the items
	$('#home .resetable').val('').removeClass('please-complete');
	$('#home .hidable').hide();
	$('#home .showable').show();
	$('#home .removable').remove();
	$('#home .server').val(getHost('main'));
	$('#home .resource').val($('#home .dresource').val());
	$('#home .priority').val('10');
	
	// We focus on the first input if needed
	if(div == 'loginer')
		$('#lnick').focus();
	else if(div == 'registerer')
		$('#rnick').focus();
}

// Allows the user to display the advanced login options
function showAdvanced() {
	// Hide the link
	$('#home a.advanced').hide();
	
	// Show the fieldset
	$('#home fieldset.advanced').show();
}

// Changes the title of the document
function pageTitle(title) {
	// We change the title of the page so that it will give the user's JID when he's logged in
	switch(title) {
		case "home":
			$('title').html($('#data .titles .home').val());
			break;
		
		case "talk":
			$('title').html('Jappix &bull; ' + getJID());
			break;
		
		case "new":
			$('title').html('[✎] Jappix &bull; ' + getJID());
			break;
		
		default:
			$('title, #chat-engine .container-title').html('Jappix &bull; ' + title + ' (' + _e(61) + ')');
			break;
	}
}

// This function can be called everytime to get the user's defined name
function getBuddyName(jid) {
	// Initialize
	var cname, bname;
	
	// This is me?
	if(jid == getJID())
		bname = _e(37);
	
	// Not me...
	else {
		cname = $('#buddy-list .' + hex_md5(jid) + ' .buddy-name').text();
		
		// If the complete name exists
		if(cname)
			bname = cname;
		
		// Else, we just get the nickname of the buddy
		else
			bname = jid.split('@')[0];
	}
	
	return bname;
}

// These functions get the user's informations when creating a new chat
function getUserInfos(hash, jid) {
	// Get the buddy name
	var nick = getBuddyName(jid);
	
	// Display the buddy name
	if(nick) {
		$("#" + hash + " .top .name .bc-name").text(nick);
		$("#chat-switch ." + hash + " a").text(nick);
	}
	
	// Display the buddy presence
	presenceFunnel(jid, hash);
	
	// Get the buddy PEP informations
	displayPEP(jid, 'mood');
	displayPEP(jid, 'activity');
	displayPEP(jid, 'tune');
	displayPEP(jid, 'geoloc');
	
	// Get the avatar
	getAvatar(jid, 'cache', 'forgot');
}
