/*

Jappix - An Open μSocial Platform
These are the microblog JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function displayMicroblog(packet, from, hash, mode) {
	// Get some values
	var iParse = $(packet.getNode()).find('items item');
	
	iParse.each(function() {
		// Initialize
		var tTitle, tTime, tDate, tBody, tName, tID, tHash, tClick, tIndividual, tFile, tFURL, tFName, tFType, tFExt, tFTClass, tFEClick;
		
		// Get the values
		tDate = $(this).find('published').text();
		tBody = $(this).find('body').text();
		tFile = $(this).find('file:first');
		tFName = tFile.attr('name');
		tFURL = tFile.attr('url');
		tFType = tFile.attr('type');
		tFExt = tFile.attr('ext');
		tID = $(this).attr('id');
		tName = getBuddyName(from);
		tHash = 'update-' + hex_md5(tName + tDate + tID);
		
		// Get the time and date
		if(tDate) {
			tDate = tDate.split('Z')[0];
			tDate = tDate.split('T');
			tTime = tDate[0] + ' (' + tDate[1] + ')';
		}
		
		else
			tTime = '';
		
		// Set the good buddy name click event
		if(mode == 'mixed')
			tClick = 'getMicroblog(\'' + from + '\', \'' + hash + '\');';
		else if(from != getJID())
			tClick = 'checkChatCreate(\'' + from + '\', \'chat\');';
		
		// Retrieve the message body
		if(tBody)
			tTitle = tBody;
		else
			tTitle = $(this).find('title:last').text();
		
		// Encode the received message
		tTitle = tTitle.htmlEnc();
		
		// Apply links to message body
		tTitle = tTitle.replace(/(\s|^)((ftp|http|https|file|ssh|irc|xmpp|apt):\/\/[\S]+)(\s|$)/gim, '$1<a href="$2" target="_blank">$2</a>$4');
		
		// Display the received message
		var html = '<div class="one-update removable ' + hash + ' ' + tHash + '">' + 
				'<div class="avatar-container">' + 
					'<img class="avatar removable" src="./img/others/default-avatar.png" alt="" />' + 
				'</div>' + 
				
				'<div class="body">' + 
					'<p><b title="' + from + '" onclick="' + tClick + '">' + tName + '</b> <span>' + tTitle + '</span></p>' + 
					'<p class="infos">' + tTime + '</p>';
		
		// We can set an icon
		if(tFType && (tFType == 'image' || tFType == 'video' || tFType == 'audio' || tFType == 'document' || tFType == 'package'))
			tFTClass = tFType;
		else
			tFTClass = 'other';
		
		// Supported image/video/sound
		if(tFExt && (tFExt == 'jpg' || tFExt == 'jpeg' || tFExt == 'png' || tFExt == 'gif' || tFExt == 'ogg' || tFExt == 'oga' || tFExt == 'ogv'))
			tFEClick = 'onclick="return applyIntegrateBox(\'' + tFURL + '\', \'' + tFType + '\');" ';
		else
			tFEClick = '';
		
		if(tFName && tFURL)
			html += '<p class="file"><a class="talk-images ' + tFTClass + '" ' + tFEClick + 'href="' + tFURL + '" target="_blank">' + tFName + '</a></p>';
		
		// It's my own notice, we can remove it!
		if(from == getJID())
			html += '<a onclick="removeMicroblog(\'' + tID + '\', \'' + tHash + '\');" title="' + _e(73) + '" class="mbtool remove">✘</a>';
		
		// Notice from another user
		else {
			// User profile
			html += '<a title="' + _e(68) + '" class="mbtool profile" onclick="openUserInfos(\'' + from + '\');">☻</a>';
			
			// If PEP is enabled
			if(enabledPEP())
				html += '<a title="' + _e(69) + '" class="mbtool repost">♻</a>';
		}
		
		html += '</div></div>';
		
		// Mixed mode
		if(mode == 'mixed' && !exists('.mixed .' + tHash))
			$('.channel-content.mixed').prepend(html);
		
		// Individual mode
		tIndividual = '.channel-content.individual.microblog-' + hash;
		
		if(exists(tIndividual) && !exists('.individual .' + tHash)) {
			if(mode == 'mixed')
				$(tIndividual).prepend(html);
			else
				$(tIndividual + ' a.more').css('visibility', 'visible').before(html);
		}
		
		// Apply the click events
		$('.' + tHash + ' a.repost').click(function() {
			// Repeat the item
			publishMicroblog('♺ ' + tTitle, tFName, tFURL, tFType, tFExt);
		});
	});
	
	// Display the avatar of this buddy
	getAvatar(from, 'cache', 'forgot');
}

function removeMicroblog(id, hash) {
	// Remove the item from our DOM
	$('.' + hash).remove();
	
	// Send the IQ to remove the item (and get eventual error callback)
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var retract = pubsub.appendChild(iq.buildNode('retract', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB}));
	retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleErrorReply);
}

function handleMicroblog(iq) {
	// Define the selector path
	var selector = '.channel-header.individual input[name=';
	
	// Get the JID of the current buddy
	var jid = $(selector + 'jid]').val();
	
	// Is this request alive?
	if(iq.getFrom() == jid) {
		var hash = hex_md5(jid);
	
		// Update the items counter
		var oldCounter = $(selector + 'counter]').val();
		$(selector + 'counter]').val(parseInt(oldCounter) + 20);
	
		// Display the microblog
		displayMicroblog(iq, jid, hash, 'individual');
	
		// Hide the waiting icon
		if(enabledPEP())
			waitMicroblog('sync');
		else
			waitMicroblog('unsync');
	}
}

function resetMicroblog() {
	// Remove the individual channel
	$('#channel .individual').remove();
	
	// Show the mixed channel
	$('#channel .mixed').show();
	
	// Hide the waiting icon
	if(enabledPEP())
		waitMicroblog('sync');
	else
		waitMicroblog('unsync');
}

function getMicroblog(jid, hash) {
	// Fire the wait event
	waitMicroblog('fetch');
	
	// Remove the previous individual channel
	if(!exists('#channel .individual')) {
		$('#channel .individual').remove();
		
		// Hide the mixed channel
		$('#channel .mixed').hide();
		
		// Get the channel title depending on the JID
		var cTitle;
		
		if(jid == getJID())
			cTitle = _e(85);
		else
			cTitle = _e(71) + ' ' + getBuddyName(jid);
		
		// Create a new individual channel
		$('.channel-content.mixed').after(
				'<div class="removable channel-content individual microblog-' + hash + '">' + 
					'<a class="more" onclick="getMicroblog(\'' + jid + '\', \'' + hash + '\');">' + _e(78) + '</a>' + 
				'</div>'
						 )
					   
					   .before(
				'<div class="removable channel-header individual ' + hash + '">' + 
					'<div class="avatar-container"></div>' + 
					'<div class="update">' + 
						'<h2>' + cTitle + '</h2>' + 
						'<a onclick="resetMicroblog();">« ' + _e(72) + '</a>' + 
					'</div>' + 
					'<input type="hidden" name="jid" value="' + jid + '" />' + 
					'<input type="hidden" name="counter" value="' + 20 + '" />' + 
				'</div>'
						 );
		
		// Display the user avatar
		getAvatar(jid, 'cache', 'forgot');
	}
	
	// Get the number of items to retrieve
	var items = $('.channel-header.individual input[name=counter]').val();
	
	// Ask the server the user's microblog 
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setTo(jid);
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('items', {'node': NS_URN_MBLOG, 'max_items': items, 'xmlns': NS_PUBSUB}));
	con.send(iq, handleMicroblog);
}

function waitMicroblog(type) {
	// First hide all the infos elements
	$('.channel-footer div').hide();
	
	// Display the good one
	$('.channel-footer div.' + type).show();
	
	// Depending on the type, disable/enable certain tools
	var selector = $('.channel-header input[name=body]');
	
	if(type == 'unsync')
		selector.attr('disabled', true);
	else if(type == 'sync')
		selector.attr('disabled', false).focus();
}

function handleSetupMicroblog(iq) {
	// Microblog is created, we can configure it
	configMicroblog(1, 10000);
}

function setupMicroblog() {
	// Creates the urn:xmpp:microblog:0 node
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('create', {'xmlns': NS_PUBSUB, 'node': NS_URN_MBLOG}));
	
	con.send(iq, handleSetupMicroblog);
}

function configMicroblog(persist, maximum) {
	// New IQ
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	
	// Create the main XML nodes/childs
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
	var configure = pubsub.appendChild(iq.buildNode('configure', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));
	var x = configure.appendChild(iq.buildNode('x', {'xmlns': NS_XDATA, 'type': 'submit'}));
	var field1 = x.appendChild(iq.buildNode('field', {'var': 'FORM_TYPE', 'type': 'hidden', 'xmlns': NS_XDATA}));
	field1.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, NS_PUBSUB_NC));
	var field2 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#persist_items', 'xmlns': NS_XDATA}));
	field2.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, persist));
	var field3 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#max_items', 'xmlns': NS_XDATA}));
	field3.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, maximum));
	
	// Send the IQ
	con.send(iq);
}

function handleMyMicroblog(packet) {
	// Reset the entire form
	$('.channel-header input[name=body]').attr('disabled', false).val('');
	unattachMicroblog();
	
	// Check for errors
	handleError(packet.getNode());
}

function sendMicroblog(aForm) {
	// Avoid nasty errors
	try {
		// Get the form values
		var body = aForm.body.value;
		var attachedname = aForm.attachedname.value;
		var attachedtype = aForm.attachedtype.value;
		var attachedext = aForm.attachedext.value;
		var attachedurl = aForm.attachedurl.value;
		
		// Sufficient parameters
		if(body) {
			// Disable our input
			$('.channel-header input[name=body]').attr('disabled', true);
		
			// Send the message on the XMPP network
			publishMicroblog(body, attachedname, attachedurl, attachedtype, attachedext);
		}
	}
	
	// Return false (security)
	finally {
		return false;
	}
}

function publishMicroblog(body, attachedname, attachedurl, attachedtype, attachedext) {
	/* REF: http://xmpp.org/extensions/xep-0277.html */
	
	// Generate some values
	var time = getXMPPTime();
	var id = hex_md5(body + time);
	var nick = getNick();
	var jid = getJID();
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	iq.setTo(jid);
	
	// Create the main XML nodes/childs
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	var entry = item.appendChild(iq.buildNode('entry', {'xmlns': NS_ATOM}));
	
	// Create the XML source childs
	var Source = entry.appendChild(iq.buildNode('source', {'xmlns': NS_ATOM}));
	Source.appendChild(iq.buildNode('title', {'xmlns': NS_ATOM}, 'Microblog (' + nick + ')'));
	Source.appendChild(iq.buildNode('updated', {'xmlns': NS_ATOM}, time));
	
	var author = Source.appendChild(iq.buildNode('author', {'xmlns': NS_ATOM}));
	author.appendChild(iq.buildNode('nick', {'xmlns': NS_ATOM}, nick));
	
	// Create the XML entry childs
	entry.appendChild(iq.buildNode('title', {'xmlns': NS_ATOM}, body));
	entry.appendChild(iq.buildNode('body', {'xmlns': NS_ATOM}, body));
	entry.appendChild(iq.buildNode('published', {'xmlns': NS_ATOM}, time));
	entry.appendChild(iq.buildNode('updated', {'xmlns': NS_ATOM}, time));
	entry.appendChild(iq.buildNode('link', {
			'rel': 'alternate',
			'href': 'xmpp:' + jid + '?;node=urn%3Axmpp%3Atmp%3Amicroblog;item=' + id,
			'xmlns': NS_ATOM
	}));
	
	// Create the attached file node
	if(attachedname && attachedurl)
		entry.appendChild(iq.buildNode('file', {'xmlns': NS_ATOM, 'name': attachedname, 'url': attachedurl, 'type': attachedtype, 'ext': attachedext}));
	
	// Send the IQ
	con.send(iq, handleMyMicroblog);
}

function attachMicroblog() {
	// Get some values
	var fInput = document.getElementById("microblog-attach");
	var fFile = fInput.files[0];
	
	// The file is defined
	if(fFile && functionExists(FileReader)) {
		// Maximum file size of 6Mio
		if(fFile.size > 6000000)
			openThisError(4);
		
		// All is okay, we can upload it
		else {
			// Disable the input
			$('#microblog-attach').attr('disabled', true);
			
			// Initialize the file reader
			var fReader = new FileReader();
			
			fReader.onload = function(e) {
				var fResult = e.target.result.split(',')[1];
				var fName = fFile.fileName;
				
				// Send the file to the server
				$.post('./php/microblog-attach.php', { user: getJID(), filename: fName, data: fResult }, function(data) {
					// Enable the input
					$('#microblog-attach').attr('disabled', false);
					
					// Process the returned data
					if(!data)
						openThisError(4);
					
					else {
						// Hide our bubble
						$('.bubble').hide();
						
						// Get the values
						var dData = $(data).find('jappix');
						var dURL = dData.find('url').text();
						var dName = dData.find('name').text();
						var dType = dData.find('type').text();
						var dExt = dData.find('ext').text();
						
						// Set values to the form
						$('input[name=attachedname]').val(dName);
						$('input[name=attachedtype]').val(dType);
						$('input[name=attachedext]').val(dExt);
						$('input[name=attachedurl]').val(window.location + dURL);
						
						// Hide the attach link, show the unattach one
						$('.postit.attach').hide();
						$('.postit.unattach').css('display', 'block');
					}
				});
				
				// Reset the upload input
				$('#attach input').val('');
			}
			
			fReader.readAsDataURL(fFile);
		}
	}
	
	else
		openThisInfo(11);
}

function unattachMicroblog() {
	// Reset the attached file input values
	$('input[name=attachedname], input[name=attachedurl], input[name=attachedext], input[name=attachedtype]').val('');
	
	// Hide the unattach link, show the attach one
	$('.postit.unattach').hide();
	$('.postit.attach').show();
}

function bubbleMicroblog(bubble, action) {
	// Initialize
	var selector = $('#' + bubble);
	
	// Do something depending on the specified action
	if(action == 'show') {
		$('.bubble').hide();
		selector.fadeIn('fast');
	}
	
	else
		selector.fadeOut('fast');
}

function fromInfosMicroblog(jid, hash) {
	// Renitialize the channel
	resetMicroblog();
	
	// Switch to the channel
	switchChan('channel');
	
	// Get the microblog
	getMicroblog(jid, hash);
}
