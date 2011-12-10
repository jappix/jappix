/*

Jappix - An Open μSocial Platform
These are the features JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function handleFeatures(iq) {
	var node = iq.getQuery();
	
	// Active the pep elements if available
	if($(node).find('identity[category=pubsub]').attr('type') == 'pep') {
		// Update our database
		setDB('feature', 'pep', true);
		
		// Show the PEP elements
		$('#my-infos .f-mood, #my-infos .f-activity').show();
		
		// Geolocate the user
		geolocate();
		
		// Enable microblogging send tools
		waitMicroblog('sync');
	}
	
	// Disable microblogging send tools (no PEP!)
	else
		waitMicroblog('unsync');
	
	return false;
}

function getFeatures() {
	/* REF: http://xmpp.org/extensions/xep-0030.html */
	
	var iq = new JSJaCIQ();
	iq.setFrom(getJID());
	iq.setTo(getServer());
	iq.setID(genID());
	iq.setType('get');
	var iqQuery = iq.setQuery(NS_DISCO_INFO);
	
	con.send(iq, handleFeatures);
}
