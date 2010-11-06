/*

Jappix - An open social platform
These are the discovery JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Launches a discovery
function launchDiscovery() {
	/* REF: http://xmpp.org/extensions/xep-0030.html */
	
	// We get the server to query
	var discoServer = $('#discovery .disco-server-input').val();
	
	// We launch the items query
	dataForm(discoServer, 'browse', '', '', 'discovery');
	
	logThis('Service discovery launched: ' + discoServer);
}

// Cleans the discovery results
function cleanDiscovery() {
	// We remove the results
	$('#discovery .discovery-oneresult, #discovery .oneinstructions, #discovery .onetitle, #discovery .no-results').remove();
	
	// We clean the user info
	$('#discovery .disco-server-info').text('');
	
	// We hide the wait icon, the no result alert and the results
	$('#discovery .wait, #discovery .disco-category').hide();
}

// Resets the discovery elements
function resetDiscovery() {
	// We clean the results
	cleanDiscovery();
	
	// We set the old server value
	$('#discovery .disco-server-input').val(HOST_MAIN);
}

// Opens the discovery popup
function openDiscovery() {
	// We reset the dicovery
	resetDiscovery();
	
	// We show the needed elements
	$('#discovery').show();
	
	// We request a disco to the default server
	launchDiscovery();
}

// Quits the discovery popup
function quitDiscovery() {
	$('#discovery').hide();
	
	resetDiscovery();
}

// Plugin launcher
function launchDiscovery() {
	// We activate the form
	$('#discovery .disco-server-input').keyup(function(e) {
		if(e.keyCode == 13) {
			launchDiscovery();
			
			return false;
		}
	});
}

// Launch this plugin!
$(document).ready(launchDiscovery);
