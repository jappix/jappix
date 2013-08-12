/*

Jappix - An open social platform
Implementation of XEP-0313: Message Archive Management

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 04/08/13

*/


/* -- MAM Constants -- */
const MAM_REQ_MAX = 25;

const MAM_PREF_DEFAULTS = {
	'always' : 1,
	'never'  : 1,
	'roster' : 1
};


/* -- MAM Variables -- */
var MAM_MAP_REQS = {};
var MAM_MAP_STATES = {};


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

	var req_id = genID();

	if(args['with']) {
		MAM_MAP_REQS[req_id] = args['with'];
	}

	var iq = new JSJaCIQ();
	iq.setType('get');
	iq.setID(req_id);

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
		var res_id = iq.getID();
		var res_with;

		if(res_id && res_id in MAM_MAP_REQS) {
			res_with = MAM_MAP_REQS[res_id];
		}

		if(res_with) {
			var res_sel = $(iq.getQuery());
			var res_rsm_sel = res_sel.find('set[xmlns="' + NS_RSM + '"]');

			// Store that data
			MAM_MAP_STATES[res_with] = {
				'date': {
					'start': res_sel.find('start').eq(0).text(),
					'end': res_sel.find('end').eq(0).text()
				},

				'rsm': {
					'first': res_rsm_sel.find('first').eq(0).text(),
					'last': res_rsm_sel.find('last').eq(0).text(),
					'count': res_rsm_sel.find('count').eq(0).text()
				}
			}

			logThis('Got archives from: ' + res_with, 3);
		} else {
			logThis('Could not associate archive response with a known JID.', 2);
		}
	} else {
		logThis('Error handing archives (MAM).', 1);
	}
}