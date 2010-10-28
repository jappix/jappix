/*

Jappix - An Open μSocial Platform
These are the vCard JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function openVCard() {
	// We reset the VCard manager
	closeVCard();
	
	// We display the VCard containers
	$("#vcard").show();

	// We remove things that could keep being displayed
	$('#vcard .avatar-info').hide();
	
	// We get the VCard informations
	getVCard(getJID(), 'user');
}

function switchVCard(id) {
	$("#vcard .one-lap").hide();
	$("#vcard #lap" + id).show();
	$("#vcard .tab a").removeClass("tab-active");
	$("#vcard .tab .lap" + id).addClass("tab-active");
}

// BEGIN AVATAR BASE64 ENCODER FORM FUNCTIONS
	function sendThisAvatar() {
		$('#vcard .avatar-info').hide();
		var fInput = document.getElementById("vCardAvatar");
		var fFile = fInput.files[0];
		
		if(fFile && functionExists(FileReader)) {
			if(!fFile.type.match(/image\/[jpg|jpeg|png|gif]/) || fFile.size > 25000)
				$('#vcard .avatar-error').fadeIn();
			
			else {
				var fReader = new FileReader();
				
				fReader.onload = function(e) {
					// We get the needed values
					var fResult = e.target.result;
					var fReplaced = fResult.replace(/data\:(.+)/gim,'$1');
					var fSplitted = fReplaced.split(';base64,');
					
					// We remove everything that isn't useful right here
					$('#vcard .forms .no-avatar').hide();
					$('#vcard .forms .avatar').remove();
					
					// We display the delete button
					$("#vcard .forms .avatar-delete").show();
					
					// We tell the user it's okay
					$('#vcard .avatar-ok').fadeIn();
					
					// We put the base64 values in a hidden input to be sent
					$("#PHOTO-TYPE").val(fSplitted[0]);
					$("#PHOTO-BINVAL").val(fSplitted[1]);
					
					// We display the avatar !
					$("#vcard .forms .avatar-container").replaceWith('<div class="avatar-container"><img class="avatar removable" src="data:' + fSplitted[0] + ';base64,' + fSplitted[1] + '" alt="" /></div>');
				}
				
				fReader.readAsDataURL(fFile);
			}
		}
		
		else
			openThisInfo(11);
	}
// END AVATAR BASE64 ENCODER FORM FUNCTIONS

function getVCard(to, type) {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setTo(to);
	iq.setFrom(getJID());
	iq.appendNode('vCard', {'xmlns': NS_VCARD});
	
	if(type == 'user')
		con.send(iq, handeUVCard);
	else
		con.send(iq, handeBVCard);
}

function handeUVCard(iq) {
	handleVCard(iq, 'user');
}

function handeBVCard(iq) {
	handleVCard(iq, 'buddy');
}

function handleVCard(iq, type) {
	var iqNode = iq.getNode();
	var iqFrom = iq.getFrom();
	
	// We retrieve main values
	if(iqNode.getElementsByTagName('vCard').item(0)) {
		for(var i=0; i<iqNode.getElementsByTagName('vCard').item(0).childNodes.length; i++) {
			var token = iqNode.getElementsByTagName('vCard').item(0).childNodes.item(i);
			var tokenname = token.nodeName;
			
			// Node with a parent
			if(token.firstChild && token.firstChild.nodeType != 3)
				for(var j=0; j<token.childNodes.length; j++) {
					var currentID = tokenname + '-' + token.childNodes.item(j).nodeName;
					var currentText = $(token.childNodes.item(j)).text();
					
					if(type == 'buddy' && (currentID == 'PHOTO-BINVAL' || currentID == 'PHOTO-TYPE'))
						$('#userinfos #BUDDY-' + currentID).val(currentText);
					
					else if(type == 'buddy' && currentID == 'EMAIL-USERID')
						$('#userinfos #BUDDY-' + currentID).html('<a href="mailto:' + currentText.htmlEnc() + '" target="_blank">' + currentText.htmlEnc() + '</a>');
					
					else if(type == 'buddy')
						$('#userinfos #BUDDY-' + currentID).text(currentText.htmlEnc());
					
					else
						$('#vcard #' + currentID).val(currentText);
				}
			
			// Node without any parent
			else
				if(typeof($('#vcard #' + tokenname)) != 'undefined' && token.firstChild) {
					var currentText = $(token).text();
					
					if(type == 'buddy' && tokenname == 'URL')
						$('#userinfos #BUDDY-' + tokenname).html('<a href="' + currentText.htmlEnc() + '" target="_blank">' + currentText.htmlEnc() + '</a>');
					
					else if(type == 'buddy')
						$('#userinfos #BUDDY-' + tokenname).html(currentText.htmlEnc());
					
					else
						$('#vcard #' + tokenname).val(currentText);
				}
		}
	}
	
	// Update the stored avatar
	if(type == 'buddy') {
		// If there were no stored avatar previously
		if(getPersistent('avatar-type', iqFrom) == 'none')
			setPersistent('avatar-forced', iqFrom, true);
		
		// Handle the user avatar
		handleAvatar(iq);
	}
	
	// The avatar values targets
	var aBTarget, aTTarget;
	
	if(type == 'user') {
		aBTarget = '#PHOTO-BINVAL';
		aTTarget = '#PHOTO-TYPE';
		aContainer = '#vcard .avatar-container';
	}
	
	else {
		aBTarget = '#BUDDY-PHOTO-BINVAL';
		aTTarget = '#BUDDY-PHOTO-TYPE';
		aContainer = '#userinfos .avatar-container';
	}
	
	// We get a special stored value : the avatar base64 code
	var aBinval = $(aBTarget).val();
	var aType = $(aTTarget).val();
	
	// We display the avatar if retrieved
	if(aBinval && aType) {
		if(type == 'user') {
			// We move all the things that we don't need in that case
			$('#lap2 .forms .no-avatar').hide();
			$("#lap2 .forms .avatar-delete").show();
			$("#lap2 .avatar").remove();
		}
		
		// We display the avatar we have just received
		$(aContainer).replaceWith('<div class="avatar-container"><img class="avatar removable" src="data:' + aType + ';base64,' + aBinval + '" alt="" /></div>');
	}
	
	else if(type == 'buddy')
		$(aContainer).replaceWith('<div class="avatar-container"><img class="avatar removable" src="./img/others/default-avatar.png" alt="" /></div>');
	
	// Do someting depending of the type
	if(type == 'user')
		$("#vcard .wait").hide();
	else
		vCardBuddyInfos();
}

function deleteAvatar() {
	// We remove the avatar displayed elements
	$('.avatar-info, .avatar-error, .avatar-ok, .avatar-delete').hide();
	$('#lap2 .forms .avatar').remove();
	
	// We reset the input value
	$('#PHOTO-TYPE, #PHOTO-BINVAL').val('');
	
	// We show the avatar-uploading request
	$('#lap2 .no-avatar').show();
}

function sendVCard() {
	// WE DEFINE THE THINGS THAT ARE NEEDED TO SEND A VCARD-TEMP IQ
		var iq = new JSJaCIQ();
		iq.setID(genID());
		iq.setType('set');
		var vCard = iq.appendNode('vCard', {'xmlns': NS_VCARD});
	
	// AND WE RETRIEVE THE NEEDED DATA TO CONVERT IN INTO AN XML STRING
		// We send the identity part of the form
		$('#vcard .vcard-item').each(function() {
			var itemID = $(this).attr('id');
			var itemVal = $(this).val();
			
			if(itemVal && itemID) {
				if(itemID.indexOf('-') != -1) {
					var tagname = itemID.substring(0,itemID.indexOf('-'));
					var aNode;
					
					if (vCard.getElementsByTagName(tagname).length > 0)
						aNode = vCard.getElementsByTagName(tagname).item(0);
					
					else
						aNode = vCard.appendChild(iq.buildNode(tagname, {'xmlns': NS_VCARD}));
					
					aNode.appendChild(iq.buildNode(itemID.substring(itemID.indexOf('-')+1), {'xmlns': NS_VCARD}, itemVal));
				}
				
				else
					vCard.appendChild(iq.buildNode(itemID, {'xmlns': NS_VCARD}, itemVal));
			}
		});
	
	// WE SEND THE VCARD-TEMP IQ
		con.send(iq);
	
	// UPDATE OUR PRESENCE PHOTO HASH IF NEEDED
		// Get the first values
		var jid = getJID();
		var oldChecksum = getPersistent('avatar-checksum', jid);
		
		// Initialize
		var newBinval = $('#PHOTO-BINVAL').val();
		var newChecksum, dbChecksum;
		
		// Get an empty old checksum instead of "none" if needed
		if(oldChecksum == 'none')
			oldChecksum = '';
		
		// Get an empty new checksum instead of "none" if needed
		if(!newBinval)
			newChecksum = '';
		else
			newChecksum = hex_sha1(Base64.decode(newBinval));
		
		// Update our session database
		setDB('checksum', 1, newChecksum);
		
		// Update our presence if needed
		if(oldChecksum != newChecksum)
			presenceSend(newChecksum);
	
	// WE SEND THE USER NICKNAME AND AVATAR ON PUBSUB
		if(enabledPEP()) {
			// Values array
			var read = new Array(
				$('#NICKNAME').val(),
				$('#PHOTO-BINVAL').val(),
				$('#PHOTO-TYPE').val()
			);
			
			// Nodes array
			var node = new Array(
				NS_NICK,
				NS_URN_ADATA,
				NS_URN_AMETA
			);
			
			// Generate the XML
			for(var i = 0; i < read.length; i++) {
				if((i == 0) || (i == 1 && read[i]) || (i == 2)) {
					var iq = new JSJaCIQ();
					iq.setID(genID());
					iq.setType('set');
					
					var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
					var publish = pubsub.appendChild(iq.buildNode('publish', {'node': node[i], 'xmlns': NS_PUBSUB}));
					var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
					
					if(i == 0 && read[i])
						var nick = item.appendChild(iq.buildNode('nick', {'xmlns': NS_NICK}, read[i]));
					
					else if(i == 1)
						var data = item.appendChild(iq.buildNode('data', {'xmlns': NS_URN_ADATA}, read[i]));
					
					else if(i == 2) {
						var metadata = item.appendChild(iq.buildNode('metadata', {'xmlns': NS_URN_AMETA}));
					
						if(read[i])
							metadata.appendChild(iq.buildNode('info', {'type': read[i], 'xmlns': NS_URN_AMETA}));
					}
					
					con.send(iq);
				}
			}
		}
	
	// WE CLOSE THE VCARD THINGS
		closeVCard();
	
	// WE GET OUR NEW AVATAR
		getAvatar(jid, 'force', 'forgot');
}

function cancelVCard() {
	closeVCard();
}

function closeVCard() {
	// WE HIDE THE FORM
	$("#vcard").hide();
	
	// WE RESET SOME STUFFS
	$("#vcard .wait").show();
	$("#vcard .resetable").val('');
	deleteAvatar();
	
	// WE SHOW AGAIN THE FIRST LAP
	switchVCard(1);
}
