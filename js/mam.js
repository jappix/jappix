/*

Jappix - An open social platform
Implementation of XEP-0313: Message Archive Management

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 04/08/13

*/


/* -- MAM Variables -- */
const MAM_PREF_DEFAULTS = {
	'always' : 1,
	'never'  : 1,
	'roster' : 1
};


/* -- MAM Configuration -- */

// Gets the MAM configuration
function getConfigMAM() {
	// Lock the archiving options
	$('#archiving').attr('disabled', true);
	
	// Get the archiving configuration
	var iq = new JSJaCIQ();
	iq.setType('get');

	iq.appendNode('prefs', { 'xmlns': NS_URN_MAM });

	con.send(iq, handleConfigMAM);
}

// Handles the MAM configuration
function handleConfigMAM(iq) {
	if(iq.getType() != 'error') {
		// Read packet
		var cur_default = $(iq.getNode()).find('prefs[xmlns="' + NS_URN_MAM + '"]').attr('default') || 'never';

		if(!(cur_default in MAM_PREF_DEFAULTS)) {
			cur_default = 'never';
		}

		// Apply value to options
		$('#archiving').val(cur_default);
	}

	// Unlock the archiving option
	$('#archiving').removeAttr('disabled');

	// All done.
	waitOptions('mam');
}

// Sets the MAM configuration
function setConfigMAM(pref_default) {
	// Check parameters
	if(!(pref_default in MAM_PREF_DEFAULTS)) {
		pref_default = 'never';
	}

	// Send new configuration
	var iq = new JSJaCIQ();
	iq.setType('set');

	iq.appendNode('prefs', { 'xmlns': NS_URN_MAM, 'default': pref_default });

	con.send(iq);
}


/* -- MAM Retrieval -- */

// Gets the MAM configuration
function getArchivesMAM(args, max) {
	if(typeof args != 'object') {
		args = {};
	}

	var iq = new JSJaCIQ();
	iq.setType('get');

	var query = iq.setQuery(NS_URN_MAM);

	for(c in args) {
		if(args[c])  query.appendChild(iq.buildNode(c, {'xmlns': NS_URN_MAM}, args[c]));
	}

	if(max && typeof max == 'number') {
		var rsm_set = query.appendChild(iq.buildNode('set', {'xmlns': NS_RSM}));
		rsm_set.appendChild(iq.buildNode('max', {'xmlns': NS_RSM}, max));
	}

	con.send(iq, handleArchivesMAM);
}

// Handles the MAM configuration
function handleArchivesMAM(iq) {
	if(iq.getType() != 'error') {
		var node = iq.getNode();

		// TODO: need to map the sent ID to track response JID
	} else {
		logThis('Error handing archives (MAM).', 1);
	}
}