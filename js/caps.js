/*

Jappix - An open social platform
These are the CAPS JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 25/10/10

*/

// Returns an array of the Jappix disco#infos
function myDiscoInfos() {
	var fArray = new Array(
		NS_MUC,
		NS_MUC_USER,
		NS_MUC_ADMIN,
		NS_MUC_OWNER,
		NS_MUC_CONFIG,
		NS_DISCO_INFO,
		NS_DISCO_ITEMS,
		NS_PUBSUB_RI,
		NS_BOSH,
		NS_CAPS,
		NS_MOOD,
		NS_ACTIVITY,
		NS_TUNE,
		NS_GEOLOC,
		NS_NICK,
		NS_URN_ADATA,
		NS_URN_AMETA,
		NS_URN_MBLOG,
		NS_MOOD + NS_NOTIFY,
		NS_ACTIVITY + NS_NOTIFY,
		NS_TUNE + NS_NOTIFY,
		NS_GEOLOC + NS_NOTIFY,
		NS_URN_MBLOG + NS_NOTIFY,
		NS_ROSTER,
		NS_HTTP_AUTH,
		NS_CHATSTATES,
		NS_XHTML_IM,
		NS_IPV6,
		NS_LAST,
		NS_PRIVATE,
		NS_REGISTER,
		NS_SEARCH,
		NS_COMMANDS,
		NS_VERSION,
		NS_XDATA,
		NS_VCARD,
		NS_URN_TIME,
		NS_URN_PING
	);
	
	return fArray;
}

// Gets the disco#infos of an entity
function getDiscoInfos(to, caps) {
	// No CAPS
	if(!caps) {
		logThis('No CAPS: ' + to);
		
		displayDiscoInfos(to, '');
		
		return false;
	}
	
	// Get the stored disco infos
	var xml = getPersistent('caps', caps);
	
	// Yet stored
	if(xml) {
		logThis('CAPS from cache: ' + to);
		
		displayDiscoInfos(to, xml);
		
		return true;
	}
	
	logThis('CAPS from the network: ' + to);
	
	// Not stored: get the disco#infos
	var iq = new JSJaCIQ();
	
	iq.setTo(to);
	iq.setType('get');
	iq.setQuery(NS_DISCO_INFO);
	
	con.send(iq, handleDiscoInfos);
	
	return true;
}

// Handles the disco#infos of an entity
function handleDiscoInfos(iq) {
	if(!iq || (iq.getType() == 'error'))
		return;
	
	// IQ received, get some values
	var from = getStanzaFrom(iq);
	var query = iq.getQuery();
	
	// Generate the CAPS-processing values
	var identities = new Array();
	var features = new Array();
	var data_forms = new Array();
	
	// Identity values
	$(query).find('identity').each(function() {
		var pCategory = $(this).attr('category');
		var pType = $(this).attr('type');
		var pLang = $(this).attr('xml:lang');
		var pName = $(this).attr('name');
		
		if(!pCategory)
			pCategory = '';
		if(!pType)
			pType = '';
		if(!pLang)
			pLang = '';
		if(!pName)
			pName = '';
		
		identities.push(pCategory + '/' + pType + '/' + pLang + '/' + pName);
	});
	
	// Feature values
	$(query).find('feature').each(function() {
		var pVar = $(this).attr('var');
		
		// Add the current value to the array
		if(pVar)
			features.push(pVar);
	});
	
	// Data-form values
	$(query).find('x[xmlns=' + NS_XDATA + ']').each(function() {
		// Initialize some stuffs
		var pString = '';
		var sortVar = new Array();
		
		// Add the form type field
		$(this).find('field[var=FORM_TYPE] value').each(function() {
			var cText = $(this).text();
			
			if(cText)
				pString += cText + '<';
		});
		
		// Add the var attributes into an array
		$(this).find('field:not([var=FORM_TYPE])').each(function() {
			var cVar = $(this).attr('var');
			
			if(cVar)
				sortVar.push(cVar);
		});
		
		// Sort the var attributes
		sortVar = sortVar.sort();
		
		// Loop this sorted var attributes
		for(var i = 0; i < sortVar.length; i++) {
			// Initialize the value sorting
			var sortVal = new Array();
			
			// Append it to the string
			pString += sortVar[i] + '<';
			
			// Add each value to the array
			$(this).find('field[var=' + sortVar[i] + '] value').each(function() {
				var cVal = $(this).text();
				
				if(cVal)
					sortVal.push(cVal);
			});
			
			// Sort the values
			sortVal = sortVal.sort();
			
			// Append the values to the string
			for(var j = 0; j < sortVal.length; j++)
				pString += sortVal[j] + '<';
		}
		
		// Any string?
		if(pString) {
			// Remove the undesired double '<' from the string
			if(pString.match(/(.+)(<)+$/))
				pString = pString.substring(0, pString.length - 1);
			
			// Add the current string to the array
			data_forms.push(pString);
		}
	});
	
	// Process the CAPS
	var caps = processCaps(identities, features, data_forms);
	
	// Get the XML string
	var xml = xmlToString(query);
	
	// Store the disco infos
	setPersistent('caps', caps, xml);
	
	// This is our server
	if(from == getServer()) {
		// Handle the features
		handleFeatures(xml);
		
		logThis('Got our server CAPS');
	}
	
	else {
		// Display the disco infos
		displayDiscoInfos(from, xml);
		
		logThis('Got CAPS: ' + from);
	}
}

// Displays the disco#infos everywhere needed for an entity
function displayDiscoInfos(from, xml) {
	// Generate the chat path
	var xid = cutResource(from);
	
	// This comes from a private groupchat chat?
	if(isPrivate(xid))
		xid = from;
	
	hash = hex_md5(xid);
	
	// xHTML-IM indicator
	var xhtml_im = false;
	
	// Display the supported features
	$(xml).find('feature').each(function() {
		var current = $(this).attr('var');
		
		// xHTML-IM
		if(current == NS_XHTML_IM)
			xhtml_im = true;
	});
	
	// Apply xHTML-IM
	var path = $('#' + hash);
	var style = path.find('.bubble-style').parent();
	
	if(xhtml_im)
		style.show();
	
	else {
		style.hide();
		
		// Reset the markers
		path.find('.message-area').removeAttr('style');
		style.find('input[type=checkbox]').attr('checked', false);
		style.find('a.color').removeClass('selected');
	}
}

// Generates the CAPS hash
function processCaps(cIdentities, cFeatures, cDataForms) {
	// Initialize
	var cString = '';
	
	// Sort the arrays
	cIdentities = cIdentities.sort();
	cFeatures = cFeatures.sort();
	cDataForms = cDataForms.sort();
	
	// Process the sorted identity string
	for(var a = 0; a < cIdentities.length; a++)
		cString += cIdentities[a] + '<';
	
	// Process the sorted feature string
	for(var b = 0; b < cFeatures.length; b++)
		cString += cFeatures[b] + '<';
	
	// Process the sorted data-form string
	for(var c = 0; c < cDataForms.length; c++)
		cString += cDataForms[c] + '<';
	
	// Process the SHA-1 hash
	var cHash = b64_sha1(cString);
	
	return cHash;
}

// Generates the Jappix CAPS hash
function myCaps() {
	return processCaps(new Array('client/web//Jappix'), myDiscoInfos(), new Array());
}
