/*

Jappix - An open social platform
These are the PEP JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 11/11/10

*/

// Stores the PEP items
function storePEP(xid, type, value1, value2, value3) {
	// Handle the correct values
	if(!value1)
		value1 = '';
	if(!value2)
		value2 = '';
	if(!value3)
		value3 = '';
	
	// If one value
	if(value1 || value2 || value3) {
		// Define the XML variable
		var xml = '<pep type="' + type + '">';
		
		// Generate the correct XML
		if(type == 'tune')
			xml += '<artist>' + value1 + '</artist><title>' + value2 + '</title><album>' + value3 + '</album>';
		else if(type == 'geoloc')
			xml += '<lat>' + value1 + '</lat><lon>' + value2 + '</lon>';
		else
			xml += '<value>' + value1 + '</value><text>' + value2 + '</text>';
		
		// End the XML node
		xml += '</pep>';
		
		// Update the input with the new value
		setDB('pep-' + type, xid, xml);
	}
	
	else
		removeDB('pep-' + type, xid);
	
	// Display the PEP event
	displayPEP(xid, type);
}

// Displays a PEP item
function displayPEP(xid, type) {
	// Read the target input for values
	var value = $(getDB('pep-' + type, xid));
	var dText;
	var aLink = ''
	
	// If the PEP element exists
	if(type) {
		// Get the user hash
		var hash = hex_md5(xid);
		
		// Initialize
		var fText, fValue;
		var dText = '';
		
		// Parse the XML for mood and activity
		if((type == 'mood') || (type == 'activity')) {
			if(value) {
				var pepValue = value.find('value').text();
				var pepText = value.find('text').text();
				
				// No value?
				if(!pepValue)
					pepValue = 'none';
				
				// Apply the good values
				if(type == 'mood')
					fValue = moodIcon(pepValue);
				else if(type == 'activity')
					fValue = activityIcon(bareXID(pepValue));
				if(!pepText)
					fText = _e("unknown");
				else
					fText = pepText;
			}
			
			else {
				if(type == 'mood')
					fValue = moodIcon('undefined');
				else if(type == 'activity')
					fValue = activityIcon('exercising');
				
				fText = _e("unknown");
			}
			
			dText = fText;
			fText = fText.htmlEnc();
		}
		
		else if(type == 'tune') {
			fValue = 'tune-note';
			
			if(value) {
				// Parse the tune XML
				var tArtist = value.find('artist').text();
				var tTitle = value.find('title').text();
				var tAlbum = value.find('album').text();
				var tURI = value.find('uri').text();
				var fArtist, fTitle, fAlbum, fURI;
				
				// Apply the good values
				if(!tArtist && !tAlbum && !tTitle) {
					fText = _e("unknown");
					dText = fText;
				}
				
				else {
					// URI element
					if(!tURI)
						fURI = 'http://www.deezer.com/fr/music/result/all/' + tArtist + ' ' + tTitle + ' ' + tAlbum;
					else
						fURI = tURI;
					
					// Artist element
					if(!tArtist)
						fArtist = _e("unknown");
					else
						fArtist = tArtist;
					
					// Title element
					if(!tTitle)
						fTitle = _e("unknown");
					else
						fTitle = tTitle;
					
					// Album element
					if(!tAlbum)
						fAlbum = _e("unknown");
					else
						fAlbum = tAlbum;
					
					// Generate the link to the title
					aLink = ' href="' + fURI + '" target="_blank"';
					
					// Generate the text to be displayed
					dText = fArtist + ' - ' + fTitle + ' (' + fAlbum + ')';
					fText =  '<a' + aLink + '>' + dText + '</a>';
				}
			}
			
			else {
				fText = _e("unknown");
				dText = fText;
			}
		}
		
		else if(type == 'geoloc') {
			fValue = 'location-world';
			
			if(value) {
				// Parse the geoloc XML
				var tLat = value.find('lat').text();
				var tLon = value.find('lon').text();
				
				// Generate the text to be displayed
				if(tLat && tLon) {
					aLink = ' href="http://www.openstreetmap.org/?mlat=' + tLat + '&amp;mlon=' + tLon + '&amp;zoom=14" target="_blank"';
					fText = '<a' + aLink + '>' + _e("See his/her position on the globe") + '</a>';
					dText = tLat + '; ' + tLon;
				}
				
				else {
					fText = _e("unknown");
					dText = fText;
				}
			}
			
			else {
				fText = _e("unknown");
				dText = fText;
			}
		}
		
		// Apply the text to the buddy infos
		var this_buddy = '#buddy-list .buddy[data-xid=' + xid + ']';
		
		if(exists(this_buddy))
			$(this_buddy + ' .bi-' + type).replaceWith('<p class="bi-' + type + ' talk-images ' + fValue + '" title="' + dText + '">' + fText + '</p>');
		
		// Apply the text to the buddy chat
		if(exists('#' + hash)) {
			// We remove the old PEP item
			$('#' + hash + ' a.bi-' + type).remove();
			
			// If the new PEP item is not null, create a new one
			if(fText != _e("unknown"))
				$('#' + hash + ' .bc-pep').prepend(
					'<a' + aLink + ' class="bi-' + type + ' talk-images ' + fValue + '" title="' + dText + '"></a>'
				);
		}
		
		// If this is the PEP values of the logged in user
		if(xid == getXID()) {
			// Define some vars
			var miTarget = '#my-infos .f-' + type;
			
			// Change the title of the target element
			$(miTarget).attr('title', dText);
			
			// Change the icon/value of the target element
			if((type == 'mood') || (type == 'activity')) {
				$('#my-infos .icon-' + type).hide();
				$('#my-infos .' + fValue).show();
				$('#my-infos .change-' + type).val(pepValue);
			}
		}
	}
}

// Changes the mood icon
function moodIcon(value) {
	// The main var
	var icon;
	
	// Switch the values
	switch(value) {
		case 'angry':
		case 'cranky':
		case 'hot':
		case 'invincible':
		case 'mean':
		case 'restless':
		case 'serious':
		case 'strong':
			icon = 'mood-one';
			break;
		
		case 'contemplative':
		case 'happy':
		case 'playful':
			icon = 'mood-two';
			break;
		
		case 'aroused':
		case 'envious':
		case 'excited':
		case 'interested':
		case 'lucky':
		case 'proud':
		case 'relieved':
		case 'satisfied':
		case 'shy':
			icon = 'mood-three';
			break;
		
		case 'calm':
		case 'cautious':
		case 'contented':
		case 'creative':
		case 'humbled':
		case 'lonely':
		case 'undefined':
		case 'none':
			icon = 'mood-four';
			break;
		
		case 'afraid':
		case 'amazed':
		case 'confused':
		case 'dismayed':
		case 'hungry':
		case 'in_awe':
		case 'indignant':
		case 'jealous':
		case 'lost':
		case 'offended':
		case 'outraged':
		case 'shocked':
		case 'surprised':
		case 'embarrassed':
		case 'impressed':
			icon = 'mood-five';
			break;
		
		case 'crazy':
		case 'distracted':
		case 'neutral':
		case 'relaxed':
		case 'thirsty':
			icon = 'mood-six';
			break;
		
		case 'amorous':
		case 'curious':
		case 'in_love':
		case 'nervous':
		case 'sarcastic':
			icon = 'mood-eight';
			break;
		
		case 'brave':
		case 'confident':
		case 'hopeful':
		case 'grateful':
		case 'spontaneous':
		case 'thankful':
			icon = 'mood-nine';
			break;
		
		default:
			icon = 'mood-seven';
			break;
	}
	
	// Return the good icon name
	return icon;
}

// Changes the activity icon
function activityIcon(value) {
	// The main var
	var icon;
	
	// Switch the values
	switch(value) {
		case 'doing_chores':
			icon = 'activity-chores';
			break;
		
		case 'drinking':
			icon = 'activity-drinking';
			break;
		
		case 'eating':
			icon = 'activity-eating';
			break;
		
		case 'grooming':
			icon = 'activity-grooming';
			break;
		
		case 'having_appointment':
			icon = 'activity-appointment';
			break;
		
		case 'inactive':
			icon = 'activity-inactive';
			break;
		
		case 'relaxing':
			icon = 'activity-relaxing';
			break;
		
		case 'talking':
			icon = 'activity-talking';
			break;
		
		case 'traveling':
			icon = 'activity-traveling';
			break;
		
		case 'working':
			icon = 'activity-working';
			break;
		default:
			icon = 'activity-exercising';
			break;
	}
	
	// Return the good icon name
	return icon;
}

// Sends the user's mood
function sendMood(value, text) {
	/* REF: http://xmpp.org/extensions/xep-0107.html */
	
	// We propagate the mood on the xmpp network
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_MOOD, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var mood = item.appendChild(iq.buildNode('mood', {'xmlns': NS_MOOD}));
	
	if(value != 'none') {
		mood.appendChild(iq.buildNode(value, {'xmlns': NS_MOOD}));
		mood.appendChild(iq.buildNode('text', {'xmlns': NS_MOOD}, text));
	}
	
	// And finally we send the mood that is set
	con.send(iq);
	
	// We set the good icon
	$('#my-infos .f-mood .icon').attr('class', 'icon talk-images ' + moodIcon(value));
	
	// We close everything opened
	$('#my-infos-text-second').hide();
	
	logThis('New mood sent: ' + value, 3);
}

// Sends the user's activity
function sendActivity(value, text) {
	// We retrieve all the needed values
	var valueActivityMainType = explodeThis('/', value, 0);
	var valueActivitySubType = explodeThis('/', value, 1);
	
	// We propagate the mood on the xmpp network
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_ACTIVITY, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var activity = item.appendChild(iq.buildNode('activity', {'xmlns': NS_ACTIVITY}));
	
	if(value != 'none') {
		var mainType = activity.appendChild(iq.buildNode(valueActivityMainType, {'xmlns': NS_ACTIVITY}));
		mainType.appendChild(iq.buildNode(valueActivitySubType, {'xmlns': NS_ACTIVITY}));
		activity.appendChild(iq.buildNode('text', {'xmlns': NS_ACTIVITY}, text));
	}
	
	// And finally we send the mood that is set
	con.send(iq);
	
	// We set the good icon
	$('#my-infos .f-activity .icon').attr('class', 'icon talk-images ' + activityIcon(valueActivityMainType));
	
	// We close everything opened
	$('#my-infos-text-third').hide();
	
	logThis('New activity sent: ' + value, 3);
}

// Sends the user's geographic position
function sendPosition(vLat, vLon, vAlt) {
	/* REF: http://xmpp.org/extensions/xep-0080.html */
	
	// We propagate the position on pubsub
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_GEOLOC, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var geoloc = item.appendChild(iq.buildNode('geoloc', {'xmlns': NS_GEOLOC}));
	
	if(vLat || vLon || vAlt) {
		if(vLat)
			geoloc.appendChild(iq.buildNode('lat', {'xmlns': NS_GEOLOC}, vLat));
		if(vLon)
			geoloc.appendChild(iq.buildNode('lon', {'xmlns': NS_GEOLOC}, vLon));
		if(vAlt)
			geoloc.appendChild(iq.buildNode('alt', {'xmlns': NS_GEOLOC}, vAlt));
	}
	
	// And finally we send the XML
	con.send(iq);
	
	// Then, we display the user position link
	if(vLat && vLon) {
		// Apply the values
		$('#my-infos .f-geoloc a').attr('href','http://www.openstreetmap.org/?mlat=' + vLat + '&amp;mlon=' + vLon + '&amp;zoom=14');
		$('#my-infos .f-geoloc').show();
		
		// Process the buddy-list height again
		adaptRoster();
		
		logThis('Geolocated.', 3);
	}
	
	else {
		// Reset the values
		$('#my-infos .f-geoloc a').attr('href','http://www.openstreetmap.org/');
		$('#my-infos .f-geoloc').hide();
		
		// Process the buddy-list height again
		adaptRoster();
		
		logThis('Not geolocated.', 2);
	}
}

// Gets the user's geographic position
function getPosition(position) {
	var vLat = '' + position.coords.latitude + '';
	var vLon = '' + position.coords.longitude + '';
	var vAlt = '' + position.coords.altitude + '';
	
	logThis('Position got: latitude > ' + vLat + ' / longitude > ' + vLon + ' / altitude > ' + vAlt);
	
	sendPosition(vLat, vLon, vAlt);
}

// Geolocates the user
function geolocate() {
	// We wait a bit...
	$('#my-infos .f-geoloc').stopTime().oneTime('4s', function() {
		// We publish the user location if allowed (maximum cache age of 1 hour)
		if((getDB('options', 'geolocation') == '1') && enabledPEP() && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(getPosition, {maximumAge: 3600000});
			
			logThis('Geolocating...', 3);
		}
		
		else if(!navigator.geolocation)
			logThis('Not geolocated: browser does not support it.', 1);
		
		else
			logThis('Not geolocated.', 2);
	});
}

// Displays all the supported PEP events for a given XID
function displayAllPEP(xid) {
	displayPEP(xid, 'mood');
	displayPEP(xid, 'activity');
	displayPEP(xid, 'tune');
	displayPEP(xid, 'geoloc');
}

// Plugin launcher
function launchPEP() {
	// We detect if the user pressed a key
	$('#my-infos-text-second').keyup(function(e) {
		// We catch the inputs values
		var valueMood = $('.change-mood').val();
		var valueTextMood = $('.textMood').val();
		
		// Enter : send
		if(e.keyCode == 13)
			sendMood(valueMood, valueTextMood);
		// Escape : quit
		if(e.keyCode == 27)
			sendMood(valueMood, valueTextMood);
	});
	
	// When the user wants to change his mood
	$('.change-mood').change(function() {
		/* REF: http://xmpp.org/extensions/xep-0107.html */
		
		// We reset the input to avoid problems
		$('.textMood').val('');
		
		// We catch the input value
		var valueMood = $('.change-mood').val();
		
		if(valueMood != 'none') {
			// Show the target element
			$('#my-infos-text-second').show();
			
			// We put the focus on the aimed input
			$('#my-infos-text-second .textMood').focus();
		}
		
		// If no mood has been defined
		else
			sendMood(valueMood, '');
	});
	
	// We detect if the user pressed a key
	$('.textActivity').keyup(function(e) {
		var valueActivity = $('.change-activity').val();
		var valueTextActivity = $('.textActivity').val();
		
		// Enter : send
		if(e.keyCode == 13)
			sendActivity(valueActivity, valueTextActivity);
		// Escape : quit
		if(e.keyCode == 27)
			sendActivity(valueActivity, valueTextActivity);
	});
	
	// When the user wants to change his activity
	$('.change-activity').change(function() {
		/* REF: http://xmpp.org/extensions/xep-0108.html */
		
		// We reset the input to avoid problems
		$('.textActivity').val('');
		
		// We get the input values
		var valueActivity = $('.change-activity').val();
		
		if(valueActivity != 'none') {
			// Show the target element
			$('#my-infos-text-third').show();
			
			// We put the focus on the aimed input
			$('#my-infos-text-third .textActivity').focus();
		}
		
		// If no activity has been defined
		else
			sendActivity(valueActivity, '');
	});
}
