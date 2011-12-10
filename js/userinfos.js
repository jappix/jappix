/*

Jappix - An Open μSocial Platform
These are the user-infos JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function openUserInfos(jid) {
	// Not anonymous?
	if(!isAnonymous()) {
		// We show the needed elements
		$("#userinfos, #userinfos .wait, #userinfos .info1").show();
	
		// We retrieve the user's vcard
		retrieveUserInfos(jid);
	}
}

function retrieveUserInfos(jid) {
	// We setup the waiting indicator
	$('#userinfos .content').addClass('vcard version time');
	
	// We put the user's JID
	$('#userinfos #BUDDY-JID').text(jid);
	
	// We get the vCard
	getVCard(jid, 'buddy');
	
	// Get the highest resource for this JID
	var cJID = getHighestResource(jid);
	
	// If the user is logged in
	if(cJID) {
		// We request the user's system infos
		getVersion(cJID);
	
		// We request the user's local time
		getLocalTime(cJID);
	}
	
	// We request all the user's comments
	displayBuddyComments(jid);
}

function getVersion(jid) {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setTo(jid);
	iq.setQuery(NS_VERSION);
	con.send(iq, versionUserInfos);
}

function getLocalTime(jid) {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setTo(jid);
	iq.appendNode('time', {'xmlns': NS_URN_TIME});
	con.send(iq, localTimeUserInfos);
}

function vCardBuddyInfos() {
	$('#userinfos .content').removeClass('vcard');
	wUserInfos();
}

function displayBuddyComments(jid) {
	// We get the value in the database
	var value = getDB('rosternotes', jid);
	
	// Display the value
	if(value)
		$('#userinfos #BUDDY-COMMENTS').val(value);
}

function versionUserInfos(iq) {
	if (iq && iq.getType() == 'result') {
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
			$('#userinfos #BUDDY-CLIENT').text(name);
		if(os)
			$('#userinfos #BUDDY-SYSTEM').text(os);
	}
	
	$('#userinfos .content').removeClass('version');
	wUserInfos();
}

function localTimeUserInfos(iq) {
	if (iq && iq.getType() == 'result') {
		// Get the values
		var xml = iq.getNode();
		var tzo = $(xml).find('tzo').text();
		var utc = $(xml).find('utc').text();
		
		// If values, display them
		if(tzo)
			tzo = '(' + tzo + ')';
		else
			tzo = '';
		
		if(utc) {
			// First split the local date
			utc = utc.replace(/T/g,' - ').replace(/Z/g,' ');
			
			// Then display it
			$('#userinfos #BUDDY-TIME').text(utc + tzo);
		}
	}
	
	$('#userinfos .content').removeClass('time');
	wUserInfos();
}

function wUserInfos() {
	if(!$('#userinfos .content').hasClass('vcard version time'))
		$('#userinfos .wait').hide();
}

function sendBuddyComments() {
	// Update the current value
	var value = $('#userinfos #BUDDY-COMMENTS').val();
	var jid = $('#userinfos #BUDDY-JID').text();
	
	// Update the database
	setDB('rosternotes', jid, value);
	
	// Send the new buddy storage values
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_ROSTERNOTES}));
	
	// We regenerate the XML
	for(var i = 0; i < sessionStorage.length; i++) {
		// Get the pointer values
		var current = sessionStorage.key(i);
		var splitted = current.split('_');
		
		// If the pointer is on a stored rosternote
		if(splitted[0] == 'rosternotes') {
			var jid = splitted[1];
			var value = sessionStorage.getItem(current);
			
			if(jid && value)
				storage.appendChild(iq.buildNode('note', {'jid': jid, 'xmlns': NS_ROSTERNOTES})).appendChild(iq.getDoc().createTextNode(value));
		}
	}
	
	con.send(iq);
}

function switchUInfos(id) {
	$("#userinfos .content .one-info").hide();
	$("#userinfos .content .info" + id).show();
	$("#userinfos .tab a").removeClass("tab-active");
	$("#userinfos .tab .tab" + id).addClass("tab-active");
}

function closeUserInfos() {
	// Hide the popup
	$('#userinfos').hide();
	
	// Send the buddy comments
	sendBuddyComments();
	
	// Reset the popup
	switchUInfos(1);
	$('#userinfos .removable').remove();
	$('#userinfos .resetable').val('');
	$('#userinfos .reset-info').text(_e(12));
	$('#userinfos .wait').show();
	$('#userinfos .content').addClass('vcard version time');
}
