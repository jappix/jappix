/*

Jappix - An open social platform
These are the microblog JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 20/11/10

*/

// Displays a given microblog item
function displayMicroblog(packet, from, hash, mode) {
	// Get some values
	var iParse = $(packet.getNode()).find('items item');
	
	iParse.each(function() {
		// Initialize
		var tTitle, tFiltered, tTime, tDate, tBody, tName, tID, tHash, tIndividual, tFile, tFURL, tFName, tFType, tFExt, tFTClass, tFEClick;
		
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
		
		// Get the time
		if(tDate)
			tTime = parseDate(tDate);
		else
			tTime = '';
		
		// Retrieve the message body
		if(tBody)
			tTitle = tBody;
		else
			tTitle = $(this).find('title:last').text();
		
		// Apply links to message body
		tFiltered = filterThisMessage(tTitle, tName.htmlEnc(), true);
		
		// Display the received message
		var html = '<div class="one-update ' + hash + ' ' + tHash + '">' + 
				'<div class="avatar-container">' + 
					'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
				'</div>' + 
				
				'<div class="body">' + 
					'<p><b title="' + from + '">' + tName.htmlEnc() + '</b> <span>' + tFiltered + '</span></p>' + 
					'<p class="infos">' + tTime + '</p>';
		
		// We can set an icon
		if(tFType && ((tFType == 'image') || (tFType == 'video') || (tFType == 'audio') || (tFType == 'document') || (tFType == 'package')))
			tFTClass = tFType;
		else
			tFTClass = 'other';
		
		// Supported image/video/sound
		if(tFExt && ((tFExt == 'jpg') || (tFExt == 'jpeg') || (tFExt == 'png') || (tFExt == 'gif') || (tFExt == 'ogg') || (tFExt == 'oga') || (tFExt == 'ogv')))
			tFEClick = 'onclick="return applyIntegrateBox(\'' + tFURL + '\', \'' + tFType + '\');" ';
		else
			tFEClick = '';
		
		if(tFName && tFURL)
			html += '<p class="file"><a class="talk-images ' + tFTClass + '" ' + tFEClick + 'href="' + tFURL + '" target="_blank">' + tFName + '</a></p>';
		
		// It's my own notice, we can remove it!
		if(from == getXID())
			html += '<a onclick="removeMicroblog(\'' + tID + '\', \'' + tHash + '\');" title="' + _e("Remove this notice") + '" class="mbtool remove talk-images"></a>';
		
		// Notice from another user
		else {
			// User profile
			html += '<a title="' + _e("View profile") + '" class="mbtool profile talk-images" onclick="openUserInfos(\'' + from + '\');"></a>';
			
			// If PEP is enabled
			if(enabledPEP())
				html += '<a title="' + _e("Repeat this notice") + '" class="mbtool repost talk-images"></a>';
		}
		
		html += '</div></div>';
		
		// Mixed mode
		if((mode == 'mixed') && !exists('.mixed .' + tHash)) {
			$('#channel .content.mixed').prepend(html);
			
			// Remove the old notices to make the DOM lighter
			var oneUpdate = '#channel .content.mixed .one-update';
			
			if($(oneUpdate).size() > 40)
				$(oneUpdate + ':last').remove();
			
			// Click event on name
			$('.mixed .' + tHash + ' .body b').click(function() {
				getMicroblog(from, hash);
			});
		}
		
		// Individual mode
		tIndividual = '#channel .content.individual.microblog-' + hash;
		
		if(exists(tIndividual) && !exists('.individual .' + tHash)) {
			if(mode == 'mixed')
				$(tIndividual).prepend(html);
			else
				$(tIndividual + ' a.more').css('visibility', 'visible').before(html);
			
			// Click event on name
			$('.individual .' + tHash + ' .body b').click(function() {
				checkChatCreate(from, 'chat');
			});
		}
		
		// Apply the click events
		$('.' + tHash + ' a.repost').click(function() {
			// Repeat the item
			publishMicroblog(tName + ' - ' + tTitle, tFName, tFURL, tFType, tFExt);
		});
	});
	
	// Display the avatar of this buddy
	getAvatar(from, 'cache', 'true', 'forget');
}

// Removes a given microblog item
function removeMicroblog(id, hash) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#publisher-delete */
	
	// Remove the item from our DOM
	$('.' + hash).remove();
	
	// Send the IQ to remove the item (and get eventual error callback)
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var retract = pubsub.appendChild(iq.buildNode('retract', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB}));
	retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleErrorReply);
}

// Handles the microblog of an user
function handleMicroblog(iq) {
	// Get the from attribute of this IQ
	var from = fullXID(getStanzaFrom(iq));
	
	logThis('Microblog got: ' + from, 3);
	
	// Define the selector path
	var selector = '#channel .top.individual input[name=';
	
	// Get the XID of the current buddy
	var xid = $(selector + 'jid]').val();
	
	// Is this request alive?
	if(from == xid) {
		var hash = hex_md5(xid);
		
		// Update the items counter
		var oldCounter = $(selector + 'counter]').val();
		$(selector + 'counter]').val(parseInt(oldCounter) + 20);
		
		// Display the microblog
		displayMicroblog(iq, xid, hash, 'individual');
		
		// Hide the waiting icon
		if(enabledPEP())
			waitMicroblog('sync');
		else
			waitMicroblog('unsync');
	}
}

// Resets the microblog elements
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

// Gets the microblog of an user
function getMicroblog(xid, hash) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#subscriber-retrieve */
	
	logThis('Get the microblog: ' + xid, 3);
	
	// Fire the wait event
	waitMicroblog('fetch');
	
	// Remove the previous individual channel
	if(!exists('#channel .individual')) {
		$('#channel .individual').remove();
		
		// Hide the mixed channel
		$('#channel .mixed').hide();
		
		// Get the channel title depending on the XID
		var cTitle;
		
		if(xid == getXID())
			cTitle = _e("Your channel");
		else
			cTitle = _e("Channel of") + ' ' + getBuddyName(xid).htmlEnc();
		
		// Create a new individual channel
		$('#channel .content.mixed').after(
				'<div class="content individual microblog-' + hash + '">' + 
					'<a class="more" onclick="getMicroblog(\'' + xid + '\', \'' + hash + '\');">' + _e("More notices...") + '</a>' + 
				'</div>'
						 )
					   
					   .before(
				'<div class="top individual ' + hash + '">' + 
					'<div class="avatar-container">' + 
						'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
					'</div>' + 
					
					'<div class="update">' + 
						'<h2>' + cTitle + '</h2>' + 
						'<a onclick="resetMicroblog();">« ' + _e("Previous") + '</a>' + 
					'</div>' + 
					
					'<input type="hidden" name="jid" value="' + xid + '" />' + 
					'<input type="hidden" name="counter" value="' + 20 + '" />' + 
				'</div>'
						 );
		
		// Display the user avatar
		getAvatar(xid, 'cache', 'true', 'forget');
	}
	
	// Get the number of items to retrieve
	var items = $('#channel .top.individual input[name=counter]').val();
	
	// Ask the server the user's microblog 
	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setTo(xid);
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('items', {'node': NS_URN_MBLOG, 'max_items': items, 'xmlns': NS_PUBSUB}));
	
	con.send(iq, handleMicroblog);
}

// Show a given microblog waiting status
function waitMicroblog(type) {
	// First hide all the infos elements
	$('#channel .footer div').hide();
	
	// Display the good one
	$('#channel .footer div.' + type).show();
	
	// Depending on the type, disable/enable certain tools
	var selector = $('#channel .top input[name=microblog_body]');
	
	if(type == 'unsync')
		selector.attr('disabled', true);
	else if(type == 'sync')
		selector.removeAttr('disabled').focus();
}

// Handles the microblog setup
function handleSetupMicroblog(iq) {
	// Microblog is created, we can configure it
	if(enabledPEP() && enabledPubSub())
		configMicroblog(1, 10000);
}

// Setups a new microblog
function setupMicroblog() {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-create */
	
	// Creates the urn:xmpp:microblog:0 node
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	pubsub.appendChild(iq.buildNode('create', {'xmlns': NS_PUBSUB, 'node': NS_URN_MBLOG}));
	
	con.send(iq, handleSetupMicroblog);
}

// Gets the microblog configuration
function getConfigMicroblog() {
	// Lock the microblog options
	$('#persistent, #maxnotices').attr('disabled', true);
	
	// Get the microblog configuration
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
	pubsub.appendChild(iq.buildNode('configure', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));
	
	con.send(iq, handleGetConfigMicroblog);
}

// Handles the microblog configuration
function handleGetConfigMicroblog(iq) {
	// Reset the options stuffs
	waitOptions('microblog');
	
	// Unlock the microblog options
	$('#persistent, #maxnotices').removeAttr('disabled');
	
	// End if not a result
	if(!iq || (iq.getType() != 'result'))
		return;
	
	// Initialize the values
	var selector = $(iq.getNode());
	var persistent = '0';
	var maxnotices = '10000';
	
	// Get the values
	var xPersistent = selector.find('field[var=pubsub#persist_items] value:first').text();
	var xMaxnotices = selector.find('field[var=pubsub#max_items] value:first').text();
	
	// Any value?
	if(xPersistent)
		persistent = xPersistent;
	
	if(xMaxnotices)
		maxnotices = xMaxnotices;
	
	// Change the maxnotices value
	switch(maxnotices) {
		case '50':
		case '100':
		case '500':
		case '1000':
		case '5000':
		case '10000':
			break;
		
		default:
			maxnotices = '10000';
			break;
	}
	
	// Apply persistent value
	if(persistent == '0')
		$('#persistent').attr('checked', false);
	else
		$('#persistent').attr('checked', true);
	
	// Apply maxnotices value
	$('#maxnotices').val(maxnotices);
}

// Configures the user's microblog
function configMicroblog(persist, maximum) {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-configure */
	
	// New IQ
	var iq = new JSJaCIQ();
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

// Handles the user's microblog
function handleMyMicroblog(packet) {
	// Reset the entire form
	$('#channel .top input[name=microblog_body]').removeAttr('disabled').val('');
	unattachMicroblog();
	
	// Check for errors
	handleError(packet.getNode());
}

// Performs the microblog sender checks
function sendMicroblog() {
	logThis('Send a new microblog item', 3);
	
	// Avoid nasty errors
	try {
		// Get the values
		var selector = $('#channel .top input[name=microblog_body]');
		var body = selector.val();
		
		// Sufficient parameters
		if(body) {
			// Disable & blur our input
			selector.attr('disabled', true).blur();
			
			// Send the message on the XMPP network
			publishMicroblog(
					 body,
					 selector.attr('data-attachedname'),
					 selector.attr('data-attachedurl'),
					 selector.attr('data-attachedtype'),
					 selector.attr('data-attachedext')
			);
		}
	}
	
	// Return false (security)
	finally {
		return false;
	}
}

// Publishes a given microblog item
function publishMicroblog(body, attachedname, attachedurl, attachedtype, attachedext) {
	/* REF: http://xmpp.org/extensions/xep-0277.html */
	
	// Generate some values
	var time = getXMPPTime('utc');
	var id = hex_md5(body + time);
	var nick = getNick();
	var xid = getXID();
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	iq.setTo(xid);
	
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
			'href': 'xmpp:' + xid + '?;node=urn%3Axmpp%3Atmp%3Amicroblog;item=' + id,
			'xmlns': NS_ATOM
	}));
	
	// Create the attached file node
	if(attachedname && attachedurl)
		entry.appendChild(iq.buildNode('file', {'xmlns': NS_ATOM, 'name': attachedname, 'url': attachedurl, 'type': attachedtype, 'ext': attachedext}));
	
	// Send the IQ
	con.send(iq, handleMyMicroblog);
}

// Attaches a file to a microblog post
function attachMicroblog() {
	// File upload vars
	var attach_options = {
		dataType:	'xml',
		beforeSubmit:	waitMicroblogAttach,
		success:	handleMicroblogAttach
	};
	
	// Upload form submit event
	$('#attach').submit(function() {
		if(!exists('#attach .wait'))
			$(this).ajaxSubmit(attach_options);
		
		return false;
	});
	
	// Upload input change event
	$('#attach input[type=file]').change(function() {
		if(!exists('#attach .wait'))
			$('#attach').ajaxSubmit(attach_options);
		
		return false;
	});
}

// Unattaches a microblog file
function unattachMicroblog() {
	// Reset the attached file input values
	$('input[name=microblog_body]').removeAttr('data-attachedname').removeAttr('data-attachedtype').removeAttr('data-attachedext').removeAttr('data-attachedurl');
	
	// Hide the unattach link, show the attach one
	$('.postit.unattach').hide();
	$('.postit.attach').show();
}

// Wait event for file attaching
function waitMicroblogAttach() {
	// Append the wait icon
	$('#attach .attach-subitem').append('<div class="wait wait-medium"></div>');
}

// Success event for file attaching
function handleMicroblogAttach(responseXML) {
	// Data selector
	var dData = $(responseXML).find('jappix');
	
	// Process the returned data
	if(dData.find('error').size()) {
		openThisError(4);
		
		logThis('Error while attaching the file: ' + dData.find('error').text(), 1);
	}
	
	else {
		// Hide our bubble
		closeBubbles();
		
		// Set values to the form
		$('#channel input[name=microblog_body]').attr('data-attachedname', dData.find('name').text())
							.attr('data-attachedtype', dData.find('type').text())
							.attr('data-attachedext',  dData.find('ext').text())
							.attr('data-attachedurl',  generateURL(JAPPIX_LOCATION) + dData.find('url').text());
		
		// Hide the attach link, show the unattach one
		$('#channel .postit.attach').hide();
		$('#channel .postit.unattach').css('display', 'block');
		
		logThis('File attached.', 3);
	}
	
	// Reset the attach bubble
	$('#attach input[type=file]').val('');
	$('#attach .wait').remove();
	
	// Focus on the text input
	$('#channel .top input[name=microblog_body]').focus();
}

// Shows the microblog of an user from his infos
function fromInfosMicroblog(xid, hash) {
	// Renitialize the channel
	resetMicroblog();
	
	// Switch to the channel
	switchChan('channel');
	
	// Get the microblog
	getMicroblog(xid, hash);
}

// Plugin launcher
function launchMicroblog() {
	// Keyboard event
	$('#channel .top input[name=microblog_body]').keyup(function(e) {
		// Enter pressed: send the microblog notice
		if(e.keyCode == 13)
			return sendMicroblog();
	});
	
	// Microblog file attacher
	attachMicroblog();
}
