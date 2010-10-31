/*

Jappix - An open social platform
These are the others JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 31/10/10

*/

// Allows the user to switch the difference home page elements
function switchHome(div) {
	// Path to
	var home = '#home .';
	var right = home + 'right ';
	
	// We switch the div
	$(right + '.homediv, ' + right + '.top').hide();
	$(right + '.' + div).show();
	
	// We reset all the items
	$(home + 'resetable').val('').removeClass('please-complete');
	$(home + 'hidable').hide();
	$(home + 'showable').show();
	$(home + 'removable').remove();
	$(home + 'server').val(HOST_MAIN);
	$(home + 'resource').val(JAPPIX_RESOURCE);
	$(home + 'priority').val('10');
	
	// We focus on the first input if needed
	$(right + 'input:visible:first').focus();
}

// Allows the user to display the advanced login options
function showAdvanced() {
	// Hide the link
	$('#home a.advanced').hide();
	
	// Show the fieldset
	$('#home fieldset.advanced').show();
	
	return false;
}

// Changes the title of the document
function pageTitle(title) {
	// Title DOM element selector
	var select = 'head title';
	
	// Anonymous mode?
	var xid = getXID();
	
	if(isAnonymous())
		xid = getDB('anonymous', 'room') + ' (' + _e("anonymous mode") + ')';
	
	// We change the title of the page so that it will give the user's XID when he's logged in
	switch(title) {
		case 'home':
			$(select).html(SERVICE_NAME.htmlEnc() + ' &bull ' + _e("An open social network"));
			break;
		
		case 'talk':
			$(select).html('Jappix &bull; ' + xid);
			break;
		
		case 'new':
			$(select).html('[*] Jappix &bull; ' + xid);
			break;
	}
}

// Registers Jappix as the default XMPP links handler
function xmppLinksHandler() {
	navigator.registerProtocolHandler('xmpp', JAPPIX_LOCATION + '?x=%s', SERVICE_NAME);
}

// Launch this plugin!
$(document).ready(function() {
	var home = '#home .';
	var anonymouser = home + 'anonymouser ';
	
	// Allows the user to switch the home page
	$(home + 'button').click(function() {
		// Login button
		if($(this).is('.login'))
			switchHome('loginer');
		else
			switchHome('registerer');
	});
	
	// Keyup event on anonymous join's room input
	$(anonymouser + 'input.room').keyup(function() {
		var value = $(this).val();
		var report = anonymouser + '.report';
		var span = report + ' span';
		
		if(!value) {
			$(report).hide();
			$(span).text('');
		}
		
		else {
			$(report).show();
			$(span).text(JAPPIX_LOCATION + '?r=' + value);
		}
	});
});
