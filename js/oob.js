/*

Jappix - An open social platform
These are the Out of Band Data JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Last revision: 27/08/11

*/

// Sends an OOB request to someone
function sendOOB(to, type, url, desc) {
	// IQ stanza?
	if(type == 'iq') {
		// Get some values
		var id = hex_md5(genID() + to + url + desc);
		to = getHighestResource(to);
		
		// IQs cannot be sent to offline users
		if(!to)
			return;
		
		// Register the ID
		setDB('send/url', id, url);
		setDB('send/desc', id, desc);
		
		var aIQ = new JSJaCIQ();
		aIQ.setTo(fullXID(to));
		aIQ.setType('set');
		aIQ.setID(id);
		
		// Append the query content
		var aQuery = aIQ.setQuery(NS_IQOOB);
		aQuery.appendChild(aIQ.buildNode('url', {'xmlns': NS_IQOOB}, url));
		aQuery.appendChild(aIQ.buildNode('desc', {'xmlns': NS_IQOOB}, desc));
		
		con.send(aIQ);
	}
	
	// Message stanza?
	else {
		var aMsg = new JSJaCMessage();
		aMsg.setTo(bareXID(to));
		
		// Append the content
		aMsg.setBody(desc);
		var aX = aMsg.appendNode('x', {'xmlns': NS_XOOB});
		aX.appendChild(aMsg.buildNode('url', {'xmlns': NS_XOOB}, url));
		
		con.send(aMsg);
	}
	
	logThis('Sent OOB request to: ' + to + ' (' + desc + ')');
}

// Handles an OOB request
function handleOOB(from, id, type, node) {
	var xid = url = desc = '';
	
	// IQ stanza?
	if(type == 'iq') {
		xid = fullXID(from);
		url = $(node).find('url').text();
		desc = $(node).find('desc').text();
	}
	
	// Message stanza?
	else {
		xid = bareXID(from);
		url = $(node).find('url').text();
		desc = $(node).find('body').text();
	}
	
	// No desc?
	if(!desc)
		desc = url;
	
	// Open a new notification
	if(type && xid && url && desc)
		newNotification('send', xid, [xid, url, type, id, node], desc, hex_md5(xid + url + desc + id));
}

// Replies to an OOB request
function replyOOB(to, id, choice, type, node) {
	// Not IQ type?
	if(type != 'iq')
		return;
	
	// New IQ
	var aIQ = new JSJaCIQ();
	aIQ.setTo(to);
	aIQ.setID(id);
	
	// OOB request accepted
	if(choice == 'accept') {
		aIQ.setType('result');
		
		logThis('Accepted file request from: ' + to, 3);
	}
	
	// OOB request rejected
	else {
		aIQ.setType('error');
		
		// Append stanza content
		for(var i = 0; i < node.childNodes.length; i++)
			aIQ.getNode().appendChild(node.childNodes.item(i).cloneNode(true));
		
		// Append error content
		var aError = aIQ.appendNode('error', {'xmlns': NS_CLIENT, 'code': '406', 'type': 'modify'});
		aError.appendChild(aIQ.buildNode('not-acceptable', {'xmlns': NS_STANZAS}));
		
		logThis('Rejected file request from: ' + to, 3);
	}
	
	con.send(aIQ);
}

// Wait event for OOB upload
function waitUploadOOB() {
	// Append the wait icon
	$('#page-engine .chat-tools-file:not(.mini) .tooltip-subitem *').hide();
	$('#page-engine .chat-tools-file:not(.mini) .tooltip-subitem').append('<div class="wait wait-medium"></div>');
	
	// Lock the bubble
	$('#page-engine .chat-tools-file:not(.mini)').addClass('mini');
}

// Success event for OOB upload
function handleUploadOOB(responseXML) {
	// Data selector
	var dData = $(responseXML).find('jappix');
	
	// Get the values
	var fID = dData.find('id').text();
	var fURL = dData.find('url').text();
	var fDesc = dData.find('desc').text();
	
	// Get the OOB values
	var oob_has;
	
	// No ID provided?
	if(!fID)
		oob_has = ':has(.wait)';
	else
		oob_has = ':has(#oob-upload input[value=' + fID + '])';
	
	var xid = $('#page-engine .page-engine-chan' + oob_has).attr('data-xid');
	var oob_type = $('#page-engine .chat-tools-file' + oob_has).attr('data-oob');
	
	// Reset the file send tool
	$('#page-engine .chat-tools-file' + oob_has).removeClass('mini');
	$('#page-engine .bubble-file' + oob_has).remove();
	
	// Not available?
	if($('#page-engine .chat-tools-file' + oob_has).is(':hidden') && (oob_type == 'iq')) {
		openThisError(4);
		
		// Remove the file we sent
		if(fURL)
			$.get(fURL + '&action=remove');
	}
	
	// Everything okay?
	else if(fURL && fDesc && !dData.find('error').size()) {
		// Send the OOB request
		sendOOB(xid, oob_type, fURL, fDesc);
		
		// Notify the sender
		newNotification('send_pending', xid, [xid, fURL, oob_type, '', ''], fDesc, hex_md5(fURL + fDesc + fID));
		
		logThis('File request sent.', 3);
	}
	
	// Upload error?
	else {
		openThisError(4);
		
		logThis('Error while sending the file: ' + dData.find('error').text(), 1);
	}
}
