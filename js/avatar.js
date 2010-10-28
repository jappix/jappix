/*

Jappix - An open social platform
These are the avatar JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 12/10/10

*/

// Requests the avatar of a given user
function getAvatar(xid, mode, enabled, photo) {
	/* REF: http://xmpp.org/extensions/xep-0153.html */
	
	// Initialize: XML data is in one SQL entry, because some browser are sloooow with SQL requests
	var xml = getPersistent('avatar', xid);
	var forced = $(xml).find('forced').text();
	
	// No avatar in presence
	if(!photo && !forced && (enabled == 'true')) {
		resetAvatar(xid, hex_md5(xid));
		
		logThis('No avatar for: ' + xid);
	}
	
	// Try to catch the avatar
	else {
		// Define some stuffs
		var type = $(xml).find('type').text();
		var binval = $(xml).find('binval').text();
		var checksum = $(xml).find('checksum').text();
		var updated = false;
		
		// Process the checksum of the avatar
		if((checksum == photo) || (photo == 'forget') || forced)
			updated = true;
		
		// If the avatar is yet stored and a new retrieving is not needed
		if(mode == 'cache' && type && binval && checksum && updated) {
			displayAvatar(hex_md5(xid), type, binval);
			
			logThis('Read avatar from cache: ' + xid);
		}
		
		// Else if the request has not yet been fired, we get it
		else if(((!getDB('avatar', xid) && !updated) || (mode == 'cache' && !updated) || (mode == 'force') || (photo = 'forget')) && (enabled != 'false')) {
			// Put an indicator in our database to avoid multiple useless vCard request
			setDB('avatar', xid, true);
			
			logThis('Get avatar from server: ' + xid);
			
			// Get the latest avatar
			var iq = new JSJaCIQ();
			iq.setType('get');
			iq.setTo(xid);
			
			iq.appendNode('vCard', {'xmlns': NS_VCARD});
			
			con.send(iq, handleAvatar);
		}
	}
}

// Handles the avatar
function handleAvatar(iq) {
	// Extract the XML values
	var handleXML = iq.getNode();
	var handleFrom = getStanzaFrom(iq);
	var hash = hex_md5(handleFrom);
	var find = $(handleXML).find('vCard');
	var aChecksum = 'none';
	var oChecksum = false;
	
	// This is me?
	if(handleFrom == getXID())
		oChecksum = getDB('checksum', 1);
	
	// vCard not empty?
	if(find.size()) {
		// We get the avatar
		var aType = find.find('TYPE:first').text();
		var aBinval = find.find('BINVAL:first').text();
		
		// No binval?
		if(!aBinval) {
			aType = 'none';
			aBinval = 'none';
		}
		
		// Enough data
		else {
			// No type?
			if(!aType)
				aType = 'image/png';
			
			// Process the checksum
			else
				aChecksum = hex_sha1(Base64.decode(aBinval));
		}
		
		// We display the user avatar
		displayAvatar(hash, aType, aBinval);
		
		// Store the avatar
		setPersistent('avatar', handleFrom, '<avatar><type>' + aType + '</type><binval>' + aBinval + '</binval><checksum>' + aChecksum + '</checksum><forced>false</forced></avatar>');
		
		logThis('Avatar retrieved from server: ' + handleFrom);
	}
	
	// vCard is empty
	else
		resetAvatar(handleFrom);
	
	// We got a new checksum for us?
	if((oChecksum != false) && (oChecksum != aChecksum)) {
		// Define a proper checksum
		var pChecksum = aChecksum;
		
		if(pChecksum == 'none')
			pChecksum = '';
		
		// Send the stanza
		if(FIRST_PRESENCE_SENT)
			presenceSend(pChecksum);
		else
			firstPresence(pChecksum);
		
		// Update our temp. checksum
		setDB('checksum', 1, pChecksum);
	}
}

// Reset the avatar of an user
function resetAvatar(xid, hash) {
	// Store the empty avatar
	setPersistent('avatar', xid, '<avatar><type>none</type><binval>none</binval><checksum>none</checksum><forced>false</forced></avatar>');
	
	// Display the empty avatar
	displayAvatar(hash, 'none', 'none');
}

// Displays the avatar of an user
function displayAvatar(hash, type, binval) {
	// Define the path to replace
	var replacement = hash + ' .avatar-container';
	var code = '<div class="avatar-container"><img class="avatar removable" src="';
	
	// If the avatar exists
	if((type != 'none') && (binval != 'none'))
		code += 'data:' + type + ';base64,' + binval;
	else
		code += './img/others/default-avatar.png';
	
	code += '" alt="" /></div>';
	
	// Replace with the new avatar (in the roster and in the chat)
	$('.' + replacement + ', #' + replacement).replaceWith(code);
}
