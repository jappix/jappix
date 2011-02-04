/*

Jappix - An open social platform
These are the Roster Item Exchange JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 04/02/11

*/

// Opens the welcome tools
function openRosterX(data) {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Suggested friends") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="rosterx-head">' + 
			'<a class="uncheck">' + _e("Check all") + '</a>' + 
			'<a class="check">' + _e("Uncheck all") + '</a>' + 
		'</div>' + 
		
		'<div class="results"></div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<a class="finish">' + _e("Finish") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('rosterx', html);
	
	// Associate the events
	launchRosterX();
	
	// Parse the data
	parseRosterX(data);
	
	logThis('Roster Item Exchange popup opened.');
}

// Closes the welcome tools
function closeRosterX() {
	// Save the settings
	saveRosterX();
	
	// Destroy the popup
	destroyPopup('rosterx');
	
	return false;
}

// Parses a rosterx query
function parseRosterX(data) {
	// Main selector
	var x = $(data).find('x[xmlns=' + NS_ROSTERX + ']:first');
	
	// Parse data
	x.find('item').each(function() {
		displayRosterX($(this).attr('jid'), $(this).attr('name'), $(this).find('group').text(), $(this).attr('action'));
	});
}

// Displays a rosterx item
function displayRosterX(xid, nick, group, action) {
	// End if no XID
	if(!xid)
		return false;
	
	// Set up a default action if no one
	if(!action)
		action = 'add';
	
	// Override "undefined" for nickname
	if(!nick)
		nick = '';
	
	// Display it
	$('#rosterx .results').append(
		'<label class="one-line">' + 
			'<input type="checkbox" />' + 
			'<span class="action ' + action + '"></span>' + 
			'<span class="name">' + nick.htmlEnc() + '</span>' + 
			'<span class="xid">' + xid.htmlEnc() + '</span>' + 
			'<span class="group">' + group.htmlEnc() + '</span>' + 
		'</label>'
	);
}

// Saves the rosterx settings
function saveRosterX() {
	
}

// Plugin launcher
function launchRosterX() {
	$('#rosterx .bottom .finish').click(closeRosterX);
}
