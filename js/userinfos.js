/*

Jappix - An open social platform
These are the user-infos JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Opens the user-infos popup
function openUserInfos(xid) {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("User profile") + '</div>' + 
	
	'<div class="tab">' + 
		'<a class="tab1 tab-active" onclick="switchUInfos(1);">' + _e("General") + '</a>' + 
		'<a class="tab2" onclick="switchUInfos(2);">' + _e("Advanced") + '</a>' + 
		'<a class="tab3" onclick="switchUInfos(3);">' + _e("Comments") + '</a>' + 
	'</div>' + 
	
	'<div class="content">' + 
		'<div class="one-info info1" style="display: block;">' + 
			'<div class="main-infos">' + 
				'<div class="avatar-container">' + 
					'<img class="avatar removable" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
				'</div>' + 
				
				'<h1 id="BUDDY-FN" class="reset-info">' + _e("unknown") + '</h1>' + 
				'<h2 id="BUDDY-NICKNAME" class="reset-info">' + _e("unknown") + '</h2>' + 
				'<h3 id="BUDDY-XID" class="reset-info">' + _e("unknown") + '</h3>' + 
			'</div>' + 
			
			'<div class="block-infos">' + 
				'<div class="one-line"><b>' + _e("Date of birth") + '</b><span id="BUDDY-BDAY" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("E-mail") + '</b><span id="BUDDY-EMAIL-USERID" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("Phone") + '</b><span id="BUDDY-TEL-NUMBER" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("Website") + '</b><span id="BUDDY-URL" class="reset-info">' + _e("unknown") + '</span></div>' + 
			'</div>' + 
			
			'<div class="block-infos">' + 
				'<div class="one-line"><b>' + _e("Client") + '</b><span id="BUDDY-CLIENT" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("System") + '</b><span id="BUDDY-SYSTEM" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("Local time") + '</b><span id="BUDDY-TIME" class="reset-info">' + _e("unknown") + '</span></div>' + 
			'</div>' + 
		'</div>' + 
		
		'<div class="one-info info2">' + 
			'<div class="block-infos">' + 
				'<div class="one-line"><b>' + _e("Street") + '</b><span id="BUDDY-ADR-STREET" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("City") + '</b><span id="BUDDY-ADR-LOCALITY" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("Postal code") + '</b><span id="BUDDY-ADR-PCODE" class="reset-info">' + _e("unknown") + '</span></div>' + 
				
				'<div class="one-line"><b>' + _e("Country") + '</b><span id="BUDDY-ADR-CTRY" class="reset-info">' + _e("unknown") + '</span></div>' + 
			'</div>' + 
			
			'<div class="block-infos">' + 
				'<div class="one-line"><b>' + _e("Biography") + '</b><span id="BUDDY-DESC" class="reset-info">' + _e("unknown") + '</span></div>' + 
			'</div>' + 
		'</div>' + 
		
		'<div class="one-info info3">' + 
			'<textarea id="BUDDY-COMMENTS" rows="8" cols="60" class="resetable"></textarea>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish" onclick="return closeUserInfos();">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('userinfos', html);
	
	// We retrieve the user's vcard
	retrieveUserInfos(xid);
}

// Gets the user-infos
function retrieveUserInfos(xid) {
	// Show the wait icon
	$('#userinfos .wait').show();
	
	// We setup the waiting indicator
	markers = 'vcard';
	
	// We put the user's XID
	$('#userinfos #BUDDY-XID').text(xid);
	
	// We get the vCard
	getVCard(xid, 'buddy');
	
	// Get the highest resource for this XID
	var cXID = getHighestResource(xid);
	
	// If the user is logged in
	if(cXID) {
		// We request the user's system infos
		getVersion(cXID);
		
		// We request the user's local time
		getLocalTime(cXID);
		
		// Add these to the markers
		markers += ' version time';
	}
	
	// Add the markers
	$('#userinfos .content').addClass(markers);
	
	// We request all the user's comments
	displayBuddyComments(xid);
}

// Gets the version of the user's XMPP client
function getVersion(xid) {
	// Generate a session ID
	var id = genID();
	$('#userinfos').attr('data-version', id);
	
	// New IQ
	var iq = new JSJaCIQ();
	
	iq.setID(id);
	iq.setType('get');
	iq.setTo(xid);
	iq.setQuery(NS_VERSION);
	
	con.send(iq, versionUserInfos);
}

// Gets the local time of the user's
function getLocalTime(xid) {
	// Generate a session ID
	var id = genID();
	$('#userinfos').attr('data-time', id);
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setID(id);
	iq.setType('get');
	iq.setTo(xid);
	iq.appendNode('time', {'xmlns': NS_URN_TIME});
	con.send(iq, localTimeUserInfos);
}

// Checks if the waiting item can be hidden
function vCardBuddyInfos() {
	$('#userinfos .content').removeClass('vcard');
	wUserInfos();
}

// Displays the buddy comments
function displayBuddyComments(xid) {
	// We get the value in the database
	var value = getDB('rosternotes', xid);
	
	// Display the value
	if(value)
		$('#userinfos #BUDDY-COMMENTS').val(value);
}

// Displays the user's software version result
function versionUserInfos(iq) {
	// Extract the request ID
	var id = iq.getID();
	var path = '#userinfos[data-version=' + id + ']';
	
	// End if session does not exist
	if(!exists(path))
		return;
	
	// Extract the reply data
	if(iq && (iq.getType() == 'result')) {
		// Get the values
		var xml = iq.getQuery();
		var name = $(xml).find('name').text();
		var version = $(xml).find('version').text();
		var os = $(xml).find('os').text();
		
		// Put the values together
		if(name && version)
			name = name + ' ' + version;
		
		// Display the values
		if(name)
			$(path + ' #BUDDY-CLIENT').text(name);
		if(os)
			$(path + ' #BUDDY-SYSTEM').text(os);
		
		logThis('Software version received: ' + getStanzaFrom(iq));
	}
	
	$('#userinfos .content').removeClass('version');
	wUserInfos();
}

// Displays the user's local time result
function localTimeUserInfos(iq) {
	// Extract the request ID
	var id = iq.getID();
	var path = '#userinfos[data-time=' + id + ']';
	
	// End if session does not exist
	if(!exists(path))
		return;
	
	if(iq && (iq.getType() == 'result')) {
		// Get the values
		var xml = iq.getNode();
		var tzo = $(xml).find('tzo').text();
		var utc = $(xml).find('utc').text();
		
		// Any UTC?
		if(utc) {
			// Add the TZO if there's no one
			if(tzo && utc.match(/^(.+)Z$/))
				utc = RegExp.$1 + tzo;
			
			// Get the local date string
			var local_string = Date.hrTime(utc);
			
			// Then display it
			$(path + ' #BUDDY-TIME').text(local_string);
		}
		
		logThis('Local time received: ' + getStanzaFrom(iq));
	}
	
	$('#userinfos .content').removeClass('time');
	wUserInfos();
}

// Hides the waiting image if needed
function wUserInfos() {
	var selector = $('#userinfos .content');
	
	if(!selector.hasClass('vcard') && !selector.hasClass('version') && !selector.hasClass('time'))
		$('#userinfos .wait').hide();
}

// Sends the buddy comments
function sendBuddyComments() {
	// Update the current value
	var value = $('#userinfos #BUDDY-COMMENTS').val();
	var xid = $('#userinfos #BUDDY-XID').text();
	
	// Necessary to update?
	if(getDB('rosternotes', xid) == value)
		return;
	
	// Update the database
	setDB('rosternotes', xid, value);
	
	// Send the new buddy storage values
	var iq = new JSJaCIQ();
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_ROSTERNOTES}));
	
	// We regenerate the XML
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		
		// If the pointer is on a stored rosternote
		if(explodeThis('_', current, 0) == 'rosternotes') {
			var xid = explodeThis('_', current, 1);
			var value = sessionStorage.getItem(current);
			
			if(xid && value)
				storage.appendChild(iq.buildNode('note', {'jid': xid, 'xmlns': NS_ROSTERNOTES})).appendChild(iq.getDoc().createTextNode(value));
		}
	}
	
	con.send(iq);
}

// Switches the user-infos tabs
function switchUInfos(id) {
	$('#userinfos .content .one-info').hide();
	$('#userinfos .content .info' + id).show();
	$('#userinfos .tab a').removeClass('tab-active');
	$('#userinfos .tab .tab' + id).addClass('tab-active');
}

// Closes the user-infos popup
function closeUserInfos() {
	// Send the buddy comments
	sendBuddyComments();
	
	// Destroy the popup
	destroyPopup('userinfos');
}

// Gets the user's informations when creating a new chat
function getUserInfos(hash, xid, nick, type) {
	// This is a normal chat
	if(type != 'private') {
		// Display the buddy name
		if(nick) {
			$('#' + hash + ' .top .name .bc-name').text(nick);
			$('#chat-switch .' + hash + ' .name').text(nick);
		}
		
		// Get the buddy PEP informations
		displayAllPEP(xid);
	}
	
	// Display the buddy presence
	presenceFunnel(xid, hash);
}
