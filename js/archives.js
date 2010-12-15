/*

Jappix - An open social platform
These are the archives functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 15/12/10

*/

// Opens the archive tools
function openArchives() {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Message archives") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="filter">' + 
			'<select class="friend" multiple=""></select>' + 
			
			'<div class="date"></div>' + 
		'</div>' + 
		
		'<div class="current">' + 
			'[AVATAR]' + 
			'[NAME]' + 
			'[DATE]' + 
		'</div>' + 
		
		'<div class="logs"></div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish">' + _e("Close") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('archives', html);
	
	// Associate the events
	launchArchives();
	
	// Get all the buddies in our roster
	var buddies = getAllBuddies();
	
	for(i in buddies) {
		var current = buddies[i];
		
		// Create a new DOM element
		$('#archives .friend select').append('<option value="' + current + '">' + getBuddyName(current).htmlEnc() + '</option>');
	}
}

// Closes the archive tools
function closeArchives() {
	// Destroy the popup
	destroyPopup('archives');
	
	return false;
}

// Gets the archives for a buddy
function getArchives(xid) {
	// Show the waiting icon
	$('#archives .wait').show();
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	var list = iq.appendNode('list', {'xmlns': NS_URN_ARCHIVE, 'with': xid});
	var set = list.appendChild(iq.buildNode('set', {'xmlns': NS_RSM}));
	set.appendChild(iq.buildNode('max', {'xmlns': NS_RSM}, 30));
	
	con.send(iq, handleArchives);
}

// Handles the archives for a buddy
function handleArchives(iq) {
	// Hide the waiting icon
	$('#archives .wait').hide();
	
	// Any error?
	if(handleErrorReply(iq))
		return false;
	
	// Get the results
	var selector = $(iq.getNode()).find('list');
}

// Gets the archiving configuration
function getConfigArchives() {
	// Lock the archiving options
	$('#archiving').attr('checked', false).attr('disabled', true);
	
	// Get the archiving configuration
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	iq.appendNode('pref', {'xmlns': NS_URN_ARCHIVE});
	
	con.send(iq, handleGetConfigArchives);
}

// Handles the archiving configuration
function handleGetConfigArchives(iq) {
	// Reset the options stuffs
	waitOptions('archives');
	
	// Unlock the archiving options
	$('#archiving').removeAttr('disabled');
	
	// End if not a result
	if(!iq || (iq.getType() != 'result'))
		return;
	
	// Extract the preferences from the IQ
	var enabled = $(iq.getNode()).find('pref auto').attr('save');
	
	// Define the input enabling/disabling vars
	var checked = true;
	
	if(enabled != 'true')
		checked = false;
	
	// Apply the values
	$('#archiving').attr('checked', checked);
}

// Configures the archiving on the server
function configArchives(enabled) {
	// Configure the auto element
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	iq.appendNode('auto', {'xmlns': NS_URN_ARCHIVE, 'save': enabled});
	
	con.send(iq, handleConfigArchives);
	
	// Configure the default element
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var pref = iq.appendNode('pref', {'xmlns': NS_URN_ARCHIVE});
	pref.appendChild(iq.appendNode('default', {'xmlns': NS_URN_ARCHIVE, 'otr': 'concede', 'save': 'body'}));
	
	con.send(iq);
	
	// Configure the method element
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var mType = new Array('auto', 'local', 'manual');
	var mUse = new Array('prefer', 'concede', 'concede');
	
	var pref = iq.appendNode('pref', {'xmlns': NS_URN_ARCHIVE});
	
	for(i in mType)
		pref.appendChild(iq.appendNode('method', {'xmlns': NS_URN_ARCHIVE, 'type': mType[i], 'use': mUse[i]}));
	
	con.send(iq);
	
	// Logger
	logThis('Configuring archives...', 3);
}

// Handles the archives configuration
function handleConfigArchives(iq) {
	if(!iq || (iq.getType() != 'result'))
		logThis('Archives not configured.', 2);
	else
		logThis('Archives configured.', 3);
}

// Plugin launcher
function launchArchives() {
	// Datepicker
	$('#archives .filter .date').DatePicker({
		flat: true,
		date: '2008-07-31',
		current: '2008-07-31',
		calendars: 1,
		starts: 1
	});
	
	// Click event
	$('#archives .bottom .finish').click(function() {
		return closeArchives();
	});
	
	// Change event
	$('#archives .filter .friend select').change(function() {
		getArchives($(this).val());
	});
}
