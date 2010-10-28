/*

Jappix - An Open μSocial Platform
These are the avatar JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// We request the vCard of each buddy to get their avatars
function getAvatar(jid, mode, photo) {
	/* REF: http://xmpp.org/extensions/xep-0153.html */
	
	// Initialize
	var forced = getPersistent('avatar-forced', jid);
	
	// No avatar in presence
	if(!photo && !forced) {
		var hash = hex_md5(jid);
		resetAvatar(jid, hash);
	}
	
	// Try to catch the avatar
	else {
		// Define some stuffs
		var type = getPersistent('avatar-type', jid);
		var binval = getPersistent('avatar-binval', jid);
		var checksum = getPersistent('avatar-checksum', jid);
		var updated = false;
		
		// Process the checksum of the avatar
		if((checksum == photo) || (photo == 'forgot') || forced)
			updated = true;
		
		// If the avatar is yet stored and a new retrieving is not needed
		if(mode == 'cache' && type && binval && checksum && updated) {
			var hash = hex_md5(jid);
			displayAvatar(hash, type, binval);
		}
		
		// Else if the request has not yet been fired, we get it
		else if((!getDB('avatar', jid) && !updated) || (mode == 'cache' && !updated) || (mode == 'force')) {
			// Put an indicator in our database to avoid multiple useless vCard request
			setDB('avatar', jid, true);
			
			// Get the latest avatar
			var iq = new JSJaCIQ();
			iq.setID(genID());
			iq.setType('get');
			iq.setTo(jid);
			iq.appendNode('vCard', {'xmlns': NS_VCARD});
			con.send(iq, handleAvatar);
		}
	}
}

// We parse the XML of the vCard
function handleAvatar(iq) {
	var handleXML = iq.getNode();
	var handleFrom = iq.getFrom();
	var hash = hex_md5(handleFrom);
	var find = $(handleXML).find('vCard');
	var aChecksum = '';
	
	// vCard not empty?
	if(find.text()) {
		// We get the avatar
		var aType = find.find('TYPE:first').text();
		var aBinval = find.find('BINVAL:first').text();
		
		// No or not enough data
		if(!aType || !aBinval) {
			aType = 'none';
			aBinval = 'none';
		}
		
		// Process the checksum
		else
			aChecksum = hex_sha1(Base64.decode(aBinval));
		
		// We display the user avatar
		displayAvatar(hash, aType, aBinval);
		
		// Store the avatar
		setPersistent('avatar-type', handleFrom, aType);
		setPersistent('avatar-binval', handleFrom, aBinval);
		setPersistent('avatar-checksum', handleFrom, aChecksum);
	}
	
	// vCard's empty
	else
		resetAvatar(handleFrom);
	
	// This is me?
	if(handleFrom == getJID()) {
		// First presence?
		if(!getDB('checksum', 1))
			firstPresence(aChecksum);
		
		// Update our DB for later presence stanzas
		setDB('checksum', 1, aChecksum);
	}
}

function resetAvatar(jid, hash) {
	// Store the empty avatar
	setPersistent('avatar-type', jid, 'none');
	setPersistent('avatar-binval', jid, 'none');
	setPersistent('avatar-checksum', jid, 'none');
	
	// Display the empty avatar
	displayAvatar(hash, 'none', 'none');
}

// And finally, if the buddy have an avatar, we replace the default one
function displayAvatar(hash, type, binval) {
	// Define the path to replace
	var replacement = hash + " .avatar-container";
	var code = '<div class="avatar-container"><img class="avatar removable" src="';
	
	// If the avatar exists
	if(type != 'none' && binval != 'none')
		code += 'data:' + type + ';base64,' + binval;
	else
		code += './img/others/default-avatar.png';
	
	code += '" alt="" /></div>';
	
	// Replace with the new avatar (in the roster and in the chat)
	$('.' + replacement + ', #' + replacement).replaceWith(code);
}
