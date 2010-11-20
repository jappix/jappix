/*

Jappix - An open social platform
These are the vCard JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 20/11/10

*/

// Opens the vCard popup
function openVCard() {
	// Popup HTML content
	var html =
	'<div class="top">' + _e("Your profile") + '</div>' + 
	
	'<div class="tab">' + 
		'<a class="tab-active" data-key="1">' + _e("Identity") + '</a>' + 
		'<a data-key="2">' + _e("Profile image") + '</a>' + 
		'<a data-key="3">' + _e("Others") + '</a>' + 
	'</div>' + 
	
	'<div class="content">' + 
		'<div id="lap1" class="lap-active one-lap forms">' + 
			'<fieldset>' + 
				'<legend>' + _e("Personal") + '</legend>' + 
				
				'<label for="USER-FN">' + _e("Complete name") + '</label>' + 
				'<input type="text" id="USER-FN" class="vcard-item" />' + 
				
				'<label for="USER-NICKNAME">' + _e("Nickname") + '</label>' + 
				'<input type="text" id="USER-NICKNAME" class="vcard-item" />' + 
				
				'<label for="USER-N-GIVEN">' + _e("First name") + '</label>' + 
				'<input type="text" id="USER-N-GIVEN" class="vcard-item" />' + 
				
				'<label for="USER-N-FAMILY">' + _e("Last name") + '</label>' + 
				'<input type="text" id="USER-N-FAMILY" class="vcard-item" />' + 
				
				'<label for="USER-BDAY">' + _e("Date of birth") + '</label>' + 
				'<input type="text" id="USER-BDAY" class="vcard-item" />' + 
			'</fieldset>' + 
			
			'<fieldset>' + 
				'<legend>' + _e("Contact") + '</legend>' + 
				
				'<label for="USER-EMAIL-USERID">' + _e("E-mail") + '</label>' + 
				'<input type="text" id="USER-EMAIL-USERID" class="vcard-item" />' + 
				
				'<label for="USER-TEL-NUMBER">' + _e("Phone") + '</label>' + 
				'<input type="text" id="USER-TEL-NUMBER" class="vcard-item" />' + 
				
				'<label for="USER-URL">' + _e("Website") + '</label>' + 
				'<input type="text" id="USER-URL" class="vcard-item" />' + 
			'</fieldset>' + 
		'</div>' + 
		
		'<div id="lap2" class="one-lap forms">' + 
			'<fieldset>' + 
				'<legend>' + _e("New") + '</legend>' + 
				
				'<input type="hidden" id="USER-PHOTO-TYPE" class="vcard-item" />' + 
				'<input type="hidden" id="USER-PHOTO-BINVAL" class="vcard-item" />' + 
				
				'<form id="vcard-avatar" action="#" method="post">' + 
					'<input style="margin-left: 15px;" type="file" id="vcard-avatar-file" />' + 
					'<input type="submit" value="' + _e("Send") + '" />' + 
				'</form>' + 
			'</fieldset>' + 
			
			'<fieldset>' + 
				'<legend>' + _e("Current") + '</legend>' + 
				
				'<div class="avatar-container"></div>' + 
				
				'<a class="one-button avatar-delete talk-images">' + _e("Delete") + '</a>' + 
				'<div class="no-avatar">' + _e("What a pity! You have no profile image defined in your identity card!") + '</div>' + 
			'</fieldset>' + 
			
			'<div class="avatar-ok avatar-info">' + _e("Here it is! A new beautiful profile image!") + '</div>' + 
			
			'<div class="avatar-error avatar-info">' + _e("The image file is not supported or has a bad size.") + '</div>' + 
		'</div>' + 
		
		'<div id="lap3" class="one-lap forms">' + 
			'<fieldset>' + 
				'<legend>' + _e("Address") + '</legend>' + 
				
				'<label for="USER-ADR-STREET">' + _e("Street") + '</label>' + 
				'<input type="text" id="USER-ADR-STREET" class="vcard-item" />' + 
				
				'<label for="USER-ADR-LOCALITY">' + _e("City") + '</label>' + 
				'<input type="text" id="USER-ADR-LOCALITY" class="vcard-item" />' + 
				
				'<label for="USER-ADR-PCODE">' + _e("Postal code") + '</label>' + 
				'<input type="text" id="USER-ADR-PCODE" class="vcard-item" />' + 
				
				'<label for="USER-ADR-CTRY">' + _e("Country") + '</label>' + 
				'<input type="text" id="USER-ADR-CTRY" class="vcard-item" />' + 
			'</fieldset>' + 
			
			'<fieldset>' + 
				'<legend>' + _e("Biography") + '</legend>' + 
				
				'<textarea id="USER-DESC" rows="8" cols="60" class="vcard-item"></textarea>' + 
			'</fieldset>' + 
		'</div>' + 
		
		'<div class="infos">' + 
			'<p class="infos-title">' + _e("Important notice") + '</p>' + 
			
			'<p>' + _e("Be careful of the information you write into your profile, because it could be accessed by everyone (even someone you don't want to).") + '</p>' + 
			'<p>' + _e("Not everything is private on XMPP; this is one of those things, your public profile (vCard).") + '</p>' + 
			'<p>' + _e("It is strongly recommended to upload a profile image (25Kio maximum), like a picture of yourself, because that makes you easily recognizable by your friends.") + '</p>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish save disabled">' + _e("Save") + '</a>' + 
		'<a class="finish cancel">' + _e("Cancel") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('vcard', html);
	
	// Associate the events
	launchVCard();
	
	// We get the VCard informations
	getVCard(getXID(), 'user');
}

// Closes the vCard popup
function closeVCard() {
	// Destroy the popup
	destroyPopup('vcard');
	
	return false;
}

// Switches the vCard popup tabs
function switchVCard(id) {
	$('#vcard .one-lap').removeClass('lap-active');
	$('#vcard #lap' + id).addClass('lap-active');
	$('#vcard .tab a').removeClass('tab-active');
	$('#vcard .tab a[data-key=' + id + ']').addClass('tab-active');
	
	return false;
}

// Encodes the user's avatar in base64
function sendThisAvatar() {
	// Reset the avatar info
	$('#vcard .avatar-info').hide().stopTime();
	
	// Get the input file
	var fInput = document.getElementById('vcard-avatar-file');
	var fFile = fInput.files[0];
	
	// If there's a file
	if(fFile && functionExists(FileReader)) {
		if(!fFile.type.match(/image\/[jpg|jpeg|png|gif]/) || (fFile.size > 25000)) {
			$('#vcard .avatar-error').show();
			
			// Timer
			$('#vcard .avatar-info').oneTime('10s', function() {
				$(this).hide();
			});
		}
		
		else {
			var fReader = new FileReader();
			
			fReader.onload = function(e) {
				// We get the needed values
				var fResult = e.target.result;
				var fReplaced = fResult.replace(/data\:(.+)/gim, '$1');
				var fSplitted = fReplaced.split(';base64,');
				
				// We remove everything that isn't useful right here
				$('#vcard .no-avatar').hide();
				$('#vcard .avatar').remove();
				
				// We display the delete button
				$('#vcard .avatar-delete').show();
				
				// We tell the user it's okay
				$('#vcard .avatar-ok').show();
				
				// Timer
				$('#vcard .avatar-info').oneTime('10s', function() {
					$(this).hide();
				});
				
				// We put the base64 values in a hidden input to be sent
				$('#USER-PHOTO-TYPE').val(fSplitted[0]);
				$('#USER-PHOTO-BINVAL').val(fSplitted[1]);
				
				// We display the avatar !
				$('#vcard .avatar-container').replaceWith('<div class="avatar-container"><img class="avatar" src="data:' + fSplitted[0] + ';base64,' + fSplitted[1] + '" alt="" /></div>');
			}
			
			fReader.readAsDataURL(fFile);
		}
	}
	
	else
		openThisInfo(7);
	
	// Reset the file input
	$('#vcard-avatar-file').val('');
	
	return false;
}

// Deletes the encoded avatar of an user
function deleteAvatar() {
	// We remove the avatar displayed elements
	$('#vcard .avatar-info').stopTime();
	$('#vcard .avatar-info, #vcard .avatar-error, #vcard .avatar-ok, #vcard .avatar-delete').hide();
	$('#vcard .avatar').remove();
	
	// We reset the input value
	$('#USER-PHOTO-TYPE, #USER-PHOTO-BINVAL').val('');
	
	// We show the avatar-uploading request
	$('#vcard .no-avatar').show();
	
	return false;
}

// Creates a special vCard input
function createInputVCard(id, type) {
	// Generate the new ID
	id = 'USER-' + id;
	
	// Can append the content
	if((type == 'user') && !exists('#vcard #' + id))
		$('#vcard .content').append('<input id="' + id + '" class="vcard-item" type="hidden" />');
}

// Gets the vCard of a XID
function getVCard(to, type) {
	// Generate a special ID
	var id = genID();
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setID(id);
	iq.setType('get');
	iq.appendNode('vCard', {'xmlns': NS_VCARD});
	
	// Send the IQ to the good user
	if(type == 'user') {
		// Show the wait icon
		$('#vcard .wait').show();
		
		// Apply the session ID
		$('#vcard').attr('data-vcard', id);
		
		// Send the IQ
		con.send(iq, handeUVCard);
	}
	
	else {
		// Show the wait icon
		$('#userinfos .wait').show();
		
		// Apply the session ID
		$('#userinfos').attr('data-vcard', id);
		
		// Send the IQ
		iq.setTo(to);
		con.send(iq, handeBVCard);
	}
}

// Handles the current connected user's vCard
function handeUVCard(iq) {
	handleVCard(iq, 'user');
}

// Handles an external buddy vCard
function handeBVCard(iq) {
	handleVCard(iq, 'buddy');
}

// Handles a vCard stanza
function handleVCard(iq, type) {
	// Extract the data
	var iqID = iq.getID();
	var iqFrom = fullXID(getStanzaFrom(iq));
	var iqNode = iq.getNode();
	
	// Define some paths
	var path_vCard = '#vcard[data-vcard=' + iqID + ']';
	var path_userInfos = '#userinfos[data-vcard=' + iqID + ']';
	
	// End if the session does not exist
	if(((type == 'user') && !exists(path_vCard)) || ((type == 'buddy') && !exists(path_userInfos)))
		return;
	
	// We retrieve main values
	$(iqNode).find('vCard').children().each(function() {
		// Read the current parent node name
		var tokenname = (this).nodeName.toUpperCase();
		
		// Node with a parent
		if($(this).children().size()) {
			$(this).children().each(function() {
				// Get the node values
				var currentID = tokenname + '-' + (this).nodeName.toUpperCase();
				var currentText = $(this).text();
				
				// Create an input if it does not exist
				createInputVCard(currentID, type);
				
				// Userinfos viewer popup
				if((type == 'buddy') && currentText) {
					if(currentID == 'EMAIL-USERID')
						$(path_userInfos + ' #BUDDY-' + currentID).html('<a href="mailto:' + currentText.htmlEnc() + '" target="_blank">' + currentText.htmlEnc() + '</a>');
					else
						$(path_userInfos + ' #BUDDY-' + currentID).text(currentText.htmlEnc());
				}
				
				// Profile editor popup
				else if(type == 'user')
					$(path_vCard + ' #USER-' + currentID).val(currentText);
			});
		}
		
		// Node without any parent
		else {
			// Get the node values
			var currentText = $(this).text();
			
			// Create an input if it does not exist
			createInputVCard(tokenname, type);
			
			// Userinfos viewer popup
			if((type == 'buddy') && currentText) {
				// URL modification
				if(tokenname == 'URL') {
					// No http:// or https:// prefix, we should add it
					if(!currentText.match(/^https?:\/\/(.+)/))
						currentText = 'http://' + currentText;
					
					currentText = '<a href="' + currentText + '" target="_blank">' + currentText.htmlEnc() + '</a>';
				}
				
				// Description modification
				else if(tokenname == 'DESC')
					currentText = filterThisMessage(currentText, getBuddyName(iqFrom).htmlEnc(), true);
				
				// Other stuffs
				else
					currentText = currentText.htmlEnc();
				
				$(path_userInfos + ' #BUDDY-' + tokenname).html(currentText);
			}
			
			// Profile editor popup
			else if(type == 'user')
				$(path_vCard + ' #USER-' + tokenname).val(currentText);
		}
	});
	
	// Update the stored avatar
	if(type == 'buddy') {
		// Get the avatar XML
		var xml = getPersistent('avatar', iqFrom);
		
		// If there were no stored avatar previously
		if($(xml).find('type').text() == 'none') {
			xml = xml.replace(/<forced>false<\/forced>/gi, '<forced>true</forced>');
			setPersistent('avatar', iqFrom, xml);
		}
		
		// Handle the user avatar
		handleAvatar(iq);
	}
	
	// The avatar values targets
	var aBinval, aType, aContainer;
	
	if(type == 'user') {
		aBinval = $('#USER-PHOTO-BINVAL').val();
		aType = $('#USER-PHOTO-TYPE').val();
		aContainer = path_vCard + ' .avatar-container';
	}
	
	else {
		aBinval = $(iqNode).find('BINVAL:first').text();
		aType = $(iqNode).find('TYPE:first').text();
		aContainer = path_userInfos + ' .avatar-container';
	}
	
	// We display the avatar if retrieved
	if(aBinval) {
		// No type?
		if(!aType)
			aType = 'image/png';
		
		if(type == 'user') {
			// We move all the things that we don't need in that case
			$(path_vCard + ' .no-avatar').hide();
			$(path_vCard + ' .avatar-delete').show();
			$(path_vCard + ' .avatar').remove();
		}
		
		// We display the avatar we have just received
		$(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="data:' + aType + ';base64,' + aBinval + '" alt="" /></div>');
	}
	
	else if(type == 'buddy')
		$(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" /></div>');
	
	// Do someting depending of the type
	if(type == 'user') {
		$(path_vCard + ' .wait').hide();
		$(path_vCard + ' .finish:first').removeClass('disabled');
	}
	
	else
		vCardBuddyInfos();
	
	logThis('vCard received: ' + iqFrom);
}

// Sends the vCard of the user
function sendVCard() {
	// Not yet retrieved?
	if($('#vcard .finish:first').hasClass('disabled'))
		return false;
	
	// Initialize the IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var vCard = iq.appendNode('vCard', {'xmlns': NS_VCARD});
	
	// We send the identity part of the form
	$('#vcard .vcard-item').each(function() {
		var itemID = $(this).attr('id').replace(/^USER-(.+)/, '$1');
		var itemVal = $(this).val();
		
		if(itemVal && itemID) {
			if(itemID.indexOf('-') != -1) {
				var tagname = explodeThis('-', itemID, 0);
				var aNode;
				
				if(vCard.getElementsByTagName(tagname).length > 0)
					aNode = vCard.getElementsByTagName(tagname).item(0);
				else
					aNode = vCard.appendChild(iq.buildNode(tagname, {'xmlns': NS_VCARD}));
				
				aNode.appendChild(iq.buildNode(explodeThis('-', itemID, 1), {'xmlns': NS_VCARD}, itemVal));
			}
			
			else
				vCard.appendChild(iq.buildNode(itemID, {'xmlns': NS_VCARD}, itemVal));
		}
	});
	
	// Send the IQ
	con.send(iq);
	
	// Send the user nickname & avatar over PEP
	if(enabledPEP()) {
		// Values array
		var read = new Array(
			$('#USER-NICKNAME').val(),
			$('#USER-PHOTO-BINVAL').val(),
			$('#USER-PHOTO-TYPE').val()
		);
		
		// Nodes array
		var node = new Array(
			NS_NICK,
			NS_URN_ADATA,
			NS_URN_AMETA
		);
		
		// Generate the XML
		for(i in read) {
			if((i == 0) || (i == 1 && read[i]) || (i == 2)) {
				var iq = new JSJaCIQ();
				iq.setType('set');
				
				var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
				var publish = pubsub.appendChild(iq.buildNode('publish', {'node': node[i], 'xmlns': NS_PUBSUB}));
				var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
				
				if((i == 0) && read[i])
					item.appendChild(iq.buildNode('nick', {'xmlns': NS_NICK}, read[i]));
				
				else if(i == 1)
					item.appendChild(iq.buildNode('data', {'xmlns': NS_URN_ADATA}, read[i]));
				
				else if(i == 2) {
					var metadata = item.appendChild(iq.buildNode('metadata', {'xmlns': NS_URN_AMETA}));
				
					if(read[i])
						metadata.appendChild(iq.buildNode('info', {'type': read[i], 'xmlns': NS_URN_AMETA}));
				}
				
				con.send(iq);
			}
		}
	}
	
	// Close the vCard stuffs
	closeVCard();
	
	// Get our new avatar
	getAvatar(getXID(), 'force', 'true', 'forget');
	
	logThis('vCard sent.');
	
	return false;
}

// Plugin launcher
function launchVCard() {
	// Focus on the first input
	$('#vcard input:first').focus();
	
	// Keyboard events
	$('#vcard input').keyup(function(e) {
		// Enter pressed: send the vCard
		if(e.keyCode == 13)
			return sendVCard();
	});
	
	// Click events
	$('#vcard .tab a').click(function() {
		// Yet active?
		if($(this).hasClass('tab-active'))
			return false;
		
		// Switch to the good tab
		var key = parseInt($(this).attr('data-key'));
		
		return switchVCard(key);
	});
	
	$('#vcard .avatar-delete').click(function() {
		return deleteAvatar();
	});
	
	$('#vcard .bottom .finish').click(function() {
		if($(this).is('.cancel'))
			return closeVCard();
		if($(this).is('.save'))
			return sendVCard();
	});
	
	// Change events
	$('#vcard-avatar-file').change(function() {
		if($(this).val())
			return sendThisAvatar();
		
		return false;
	});
	
	// Submit events
	$('#vcard-avatar').submit(function() {
		if($('#vcard-avatar-file').val())
			return sendThisAvatar();
		
		return false;
	});
}
