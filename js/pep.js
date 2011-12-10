/*

Jappix - An Open μSocial Platform
These are the PEP JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// The PEP store function
function storePEP(jid, type, value1, value2, value3) {
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
		setDB('pep-' + type, jid, xml);
	}
	
	else
		removeDB('pep-' + type, jid);
	
	// Display the PEP event
	displayPEP(jid, type);
}

function displayPEP(jid, type) {
	// Read the target input for values
	var value = getDB('pep-' + type, jid);
	var dText;
	var aLink = ''
	
	// If the PEP element exists
	if(type) {
		// Get the user hash
		var hash = hex_md5(jid);
		
		// Parse the XML for mood and activity
		if(type == 'mood' || type == 'activity') {
			var fText, fValue;
			
			if(value) {
				var pepValue = $(value).find('value').text();
				var pepText = $(value).find('text').text();
				
				// Apply the good values
				if(type == 'mood')
					fValue = moodIcon(pepValue);
				else if(type == 'activity')
					fValue = activityIcon(cutResource(pepValue));
				if(!pepText)
					fText = _e(12);
				else
					fText = pepText;
			}
			
			else {
				if(type == 'mood')
					fValue = moodIcon('undefined');
				else if(type == 'activity')
					fValue = activityIcon('exercising');
				
				fText = _e(12);
			}
		}
		
		else if(type == 'tune') {
			var fValue = 'tune-note';
			var fText;
			
			if(value) {
				// Parse the tune XML
				var tArtist = $(value).find('artist').text();
				var tTitle = $(value).find('title').text();
				var tAlbum = $(value).find('album').text();
				var fArtist, fTitle, fSource;
				
				// Apply the good values
				if(!tArtist && !tAlbum && !tTitle)
					fText = _e(12);
				
				else {
					if(!tArtist)
						fArtist = _e(12);
					else
						fArtist = tArtist;
					if(!tTitle)
						fTitle = _e(12);
					else
						fTitle = tTitle;
					if(!tAlbum)
						fAlbum = _e(12);
					else
						fAlbum = tAlbum;
				}
				
				// Generate the text to be displayed
				fText =  fArtist + ' - ' + fTitle + ' (' + fAlbum + ')';
			}
			
			else
				fText = _e(12);
		}
		
		else if(type == 'geoloc') {
			var fValue = 'location-world';
			var fText;
			
			if(value) {
				// Parse the geoloc XML
				var tLat = $(value).find('lat').text();
				var tLon = $(value).find('lon').text();
				
				// Generate the text to be displayed
				if(tLat && tLon) {
					aLink = ' href="http://www.openstreetmap.org/?mlat=' + tLat + '&amp;mlon=' + tLon + '&amp;zoom=14" target="_blank"';
					fText = '<a' + aLink + '>' + _e(60) + '</a>';
				}
				else
					fText = _e(12);
			}
			
			else
				fText = _e(12);
		}
		
		if(type != 'geoloc')
			dText = fText;
		else
			dText = '';
		
		// Apply the text to the buddy infos
		if(exists('.' + hash)) {
			var content = '<p class="bi-' + type + ' talk-images ' + fValue + '" title="' + dText + '">' + fText + '</p>';
			$('#buddy-list .' + hash + ' .bi-' + type).replaceWith(content);
		}
		
		// Apply the text to the buddy chat
		if(exists('#' + hash)) {
			// We remove the old PEP item
			$('#' + hash + ' a.bi-' + type).remove();
			
			// If the new PEP item is not null, create a new one
			if(fText != _e(12))
				$('#' + hash + ' .bc-pep').prepend(
					'<a' + aLink + ' class="bi-' + type + ' talk-images ' + fValue + '" title="' + dText + '"></a>'
				);
		}
		
		// If this is the PEP values of the logged in user
		if(jid == getJID()) {
			// Define some vars
			var miTarget = '#my-infos .f-' + type;
			
			// Change the title of the target element
			$(miTarget).attr('title', dText);
			
			// Change the icon/value of the target element
			if(type == 'mood' || type == 'activity') {
				$('#my-infos .icon-' + type).hide();
				$('#my-infos .' + fValue).show();
				$('#my-infos .change-' + type).val(pepValue);
			}
		}
	}
}

// The PEP check function
function enabledPEP() {
	if(getDB('feature', 'pep'))
		return true;
	else
		return false;
}

// The icon-values linking functions
function presenceIcon(value) {
	$("#my-infos .icon-status").hide();
	$("#my-infos .status-" + value).show();
}

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

// The function to send the mood
function sendMood(value, text) {
	/* REF: http://xmpp.org/extensions/xep-0107.html */
	
	// We propagate the mood on the xmpp network
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	iq.setFrom(getJID());
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_MOOD, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var mood = item.appendChild(iq.buildNode('mood', {'xmlns': NS_MOOD}));
	
	if(value != 'none') {
		var content = mood.appendChild(iq.buildNode(value, {'xmlns': NS_MOOD}));
		var text = mood.appendChild(iq.buildNode('text', {'xmlns': NS_MOOD}, text));
	}
	
	else
		item.setAttribute('id','0');
	
	// And finally we send the mood that is set
	con.send(iq);
	
	// We set the good icon
	$("#my-infos .icon-mood").hide();
	$("#my-infos ." + moodIcon(value)).show();
	
	// We close everything opened
	$("#my-infos-text-second").fadeOut('fast');
}

// The function which send the activity
function sendActivity(value, text) {
	// We retrieve all the needed values
	var splitValueActivity = value.split("/");
	var valueActivityMainType = splitValueActivity[0];
	var valueActivitySubType = splitValueActivity[1];
	
	// We propagate the mood on the xmpp network
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	iq.setFrom(getJID());
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_ACTIVITY, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var activity = item.appendChild(iq.buildNode('activity', {'xmlns': NS_ACTIVITY}));
	
	if(value != 'none') {
		var mainType = activity.appendChild(iq.buildNode(valueActivityMainType, {'xmlns': NS_ACTIVITY}));
		var subType = mainType.appendChild(iq.buildNode(valueActivitySubType, {'xmlns': NS_ACTIVITY}));
		var text = activity.appendChild(iq.buildNode('text', {'xmlns': NS_ACTIVITY}, text));
	}
	
	else
		item.setAttribute('id','0');
	
	// And finally we send the mood that is set
	con.send(iq);
	
	// We set the good icon
	$("#my-infos .icon-activity").hide();
	$("#my-infos ." + activityIcon(valueActivityMainType)).show();
	
	// We close everything opened
	$("#my-infos-text-third").fadeOut('fast');
}

function sendPosition(vLat, vLon, vAlt) {
	/* REF: http://xmpp.org/extensions/xep-0080.html */
	
	// We propagate the position on pubsub
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	iq.setFrom(getJID());
	
	// We create the XML document
	var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
	var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_GEOLOC, 'xmlns': NS_PUBSUB}));
	var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
	var geoloc = item.appendChild(iq.buildNode('geoloc', {'xmlns': NS_GEOLOC}));
	
	if(vLat || vLon || vAlt) {
		if(vLat)
			var lat = geoloc.appendChild(iq.buildNode('lat', {'xmlns': NS_GEOLOC}, vLat));
		if(vLon)
			var lon = geoloc.appendChild(iq.buildNode('lon', {'xmlns': NS_GEOLOC}, vLon));
		if(vAlt)
			var alt = geoloc.appendChild(iq.buildNode('alt', {'xmlns': NS_GEOLOC}, vAlt));
	}
	
	// And finally we send the XML
	con.send(iq);
	
	// Then, we display the user position link
	if(vLat && vLon) {
		$('#my-infos .f-geoloc a').attr('href','http://www.openstreetmap.org/?mlat=' + vLat + '&amp;mlon=' + vLon + '&amp;zoom=14');
		$('#my-infos .f-geoloc').show();
	}
	
	else {
		$('#my-infos .f-geoloc a').attr('href','http://www.openstreetmap.org/');
		$('#my-infos .f-geoloc').hide();
	}
}

function getPosition(position) {
	var vLat = '' + position.coords.latitude + '';
	var vLon = '' + position.coords.longitude + '';
	var vAlt = '' + position.coords.altitude + '';
	sendPosition(vLat, vLon, vAlt);
}

function geolocate() {
	// We wait a bit...
	$(document).oneTime('4s', function() {
		// We publish the user location if allowed (maximum cache age of 1 hour)
		if(getDB('options', 'geolocation') == 'on' && enabledPEP() && navigator.geolocation)
			navigator.geolocation.getCurrentPosition(getPosition, {maximumAge: 3600000});
	});
}

// The value send functions
$(document).ready(function() {
	// Safer : we hide the others elements yet opened
	$("#my-infos .myInfosSelect").change(function() {
		$(".bubble").fadeOut('fast');
	});
		
	// When a key is pressed...
	$(".textPresence").keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13)
			presenceSend();
		
		// Escape : quit
		if(e.keyCode == 27)
			presenceSend();
	});
	
	// If the user click on the quit button
	$("#my-infos-text-first .my-infos-text-close").click(presenceSend);
	
	// When the user wants to change his presence...
	$(".change-presence").change(function() {
		// We add a beautiful effect
		$("#my-infos-text-first").fadeIn('fast');
		
		// We put the focus on the aimed input
		$("#my-infos-text-first .textPresence").focus();
		
		// Then we reset the presence input
		$(".textPresence").val("");
	});
	
	// We detect if the user pressed a key
	$("#my-infos-text-second").keyup(function(e) {
		// We catch the inputs values
		var valueMood = $(".change-mood").val();
		var valueTextMood = $(".textMood").val();
		
		// Enter : send
		if(e.keyCode == 13)
			sendMood(valueMood, valueTextMood);
		// Escape : quit
		if(e.keyCode == 27)
			sendMood(valueMood, valueTextMood);
	});
	
	// If the user click on the quit button
	$("#my-infos-text-second .my-infos-text-close").click(function() {
		// We catch the inputs values
		var valueMood = $(".change-mood").val();
		var valueTextMood = $(".textMood").val();
		
		// We send the mood
		sendMood(valueMood, valueTextMood);
	});
	
	// When the user wants to change his mood
	$(".change-mood").change(function() {
		/* REF: http://xmpp.org/extensions/xep-0107.html */
		
		// We reset the input to avoid problems
		$(".textMood").val("");
		
		// We catch the input value
		var valueMood = $(".change-mood").val();
		
		if(valueMood != "none") {
			// We add a beautiful effect
			$("#my-infos-text-second").fadeIn('fast');
		
			// We put the focus on the aimed input
			$("#my-infos-text-second .textMood").focus();
		}
		
		// If no mood has been defined
		if(valueMood == "none")
			sendMood(valueMood, '');
	});
	
	// We detect if the user pressed a key
	$(".textActivity").keyup(function(e) {
		var valueActivity = $(".change-activity").val();
		var valueTextActivity = $(".textActivity").val();
		
		// Enter : send
		if(e.keyCode == 13)
			sendActivity(valueActivity, valueTextActivity);
		// Escape : quit
		if(e.keyCode == 27)
			sendActivity(valueActivity, valueTextActivity);
	});
	
	// If the user click on the quit button
	$("#my-infos-text-third .my-infos-text-close").click(sendActivity);
	
	// When the user wants to change his activity
	$(".change-activity").change(function() {
		/* REF: http://xmpp.org/extensions/xep-0108.html */
		
		// We reset the input to avoid problems
		$(".textActivity").val("");
		
		// We get the input values
		var valueActivity = $(".change-activity").val();
		
		if(valueActivity != "none") {
			// We add a beautiful effect
			$("#my-infos-text-third").fadeIn('fast');
		
			// We put the focus on the aimed input
			$("#my-infos-text-third .textActivity").focus();
		}
		
		// If no activity has been defined
		if(valueActivity == "none")
			sendActivity(valueActivity, '');
	});
});
