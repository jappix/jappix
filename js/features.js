/*

Jappix - An open social platform
This is the server features JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 11/11/10

*/

// Gets the features of a server
function getFeatures() {
	/* REF: http://xmpp.org/extensions/xep-0030.html */
	
	// Get the main values
	var to = getServer();
	var caps = con.server_caps;
	var xml = null;
	
	// Try to get the stored data
	if(caps)
		xml = getPersistent('caps', caps);
	
	// Any stored data?
	if(xml) {
		handleFeatures(xml);
		
		logThis('Read server CAPS from cache.');
	}
	
	// Not stored (or no CAPS)!
	else {
		var iq = new JSJaCIQ();
		
		iq.setTo(to);
		iq.setType('get');
		iq.setQuery(NS_DISCO_INFO);
		
		con.send(iq, handleDiscoInfos);
		
		logThis('Read server CAPS from network.');
	}
}

// Handles the features of a server
function handleFeatures(xml) {
	// Markers
	var pep = false;
	var pubsub = false;
	var archive = false;
	var archive_auto = false;
	var archive_pref = false;
	
	// Scan the features
	if($(xml).find('identity[category=pubsub]').attr('type') == 'pep')
		pep = true;
	if($(xml).find('feature[var=' + NS_PUBSUB + ']').size())
		pubsub = true;
	if($(xml).find('feature[var=' + NS_URN_ARCHIVE + ']').size())
		archive = true;
	if($(xml).find('feature[var=' + NS_URN_AR_AUTO + ']').size())
		archive_auto = true;
	if($(xml).find('feature[var=' + NS_URN_AR_PREF + ']').size())
		archive_pref = true;
	
	// Active the pep elements if available
	if(pep) {
		// Update our database
		enableFeature('pep');
		
		// Geolocate the user
		geolocate();
		
		// Enable microblogging send tools
		waitMicroblog('sync');
		
		logThis('XMPP server supports PEP.');
	}
	
	// Disable microblogging send tools (no PEP!)
	else {
		waitMicroblog('unsync');
		
		logThis('XMPP server does not support PEP.');
	}
	
	// Active the pubsub features if available
	if(pubsub)
		enableFeature(NS_PUBSUB);
	
	// Active the archiving features if available
	if(archive) {
		enableFeature(NS_URN_ARCHIVE);
		
		// Active the archiving sub-features if available
		if(archive_pref)
			enableFeature(NS_URN_AR_PREF);
		if(archive_auto)
			enableFeature(NS_URN_AR_AUTO);
	}
	
	// Hide the private life fieldset if nothing to show
	if(!pep && !archive_pref)
		$('#options fieldset.privacy').hide();
	
	// Apply the features
	applyFeatures('talk');
	
	// Process the buddy-list height
	if(pep)
		adaptRoster();
	
	return false;
}

// The function to apply the features to an element
function applyFeatures(id) {
	// Path to the elements
	var path = '#' + id + ' .';
	
	// PEP features
	if(enabledPEP())
		$(path + 'pep-hidable').show();
	
	// PubSub features
	if(enabledPubSub())
		$(path + 'pubsub-hidable').show();
	
	// Archives features
	if(enabledArchives()) {
		$(path + 'archives-hidable:not(.pref)').show();
		
		// Sub-feature: archives preferences
		if(enabledArchives('pref') && enabledArchives('auto'))
			$(path + 'archives-hidable.pref').show();
	}
}
