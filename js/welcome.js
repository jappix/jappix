/*

Jappix - An open social platform
These are the welcome tool functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Opens the welcome tools
function openWelcome() {
	// Blacklisted XMPP servers?
	var server = getServer();
	
	if((server == 'gmail.com') || (server == 'chat.facebook.com'))
		return;
	
	$('#welcome').show();
	
	logThis('Welcome assistant opened.');
}

// Closes the welcome tools
function closeWelcome() {
	// Path to
	var welcome = '#welcome';
	var box = $(welcome + ' a.box');
	var tab = welcome + ' .tab .';
	
	// Hide it
	$(welcome).hide();
	
	// Reset it
	switchWelcome(1);
	
	box.eq(0).addClass('enabled').attr('title', _e("Click to disable"));
	box.eq(1).addClass('enabled').attr('title', _e("Click to disable"));
	box.eq(2).removeClass('enabled').attr('title', _e("Click to enable"));
	box.eq(3).addClass('enabled').attr('title', _e("Click to disable"));
	box.eq(4).removeClass('enabled').attr('title', _e("Click to enable"));
	
	$(tab + 'tab2, ' + tab + 'tab3').addClass('tab-missing');
	$(welcome + ' .wait, ' + welcome + ' .hidable').hide();
	$(welcome + ' .finish.save').hide();
	$(welcome + ' .finish.next').show();
}

// Switches the welcome tabs
function switchWelcome(id) {
	// Path to
	var welcome = '#welcome ';
	var content = welcome + '.content .';
	var tab = welcome + '.tab ';
	var wait = $(welcome + '.wait');
	
	$(content + 'one-welcome').hide();
	$(content + 'welcome' + id).show();
	$(tab + 'a').removeClass('tab-active');
	$(tab + '.tab' + id).addClass('tab-active').removeClass('tab-missing');
	
	// Update the "save" button if all is okay
	if(!exists(tab + '.tab-missing')) {
		var finish = welcome + '.finish.';
		$(finish + 'save').show();
		$(finish + 'next').hide();
	}
	
	// If this is ID 2: vJUD search
	if(id == 2) {
		wait.show();
		dataForm(HOST_VJUD, 'search', '', '', 'welcome');
	}
	
	else
		wait.hide();
}

// Sends the welcome options
function sendWelcome(array) {
	// Sends the options
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_OPTIONS}));
	
	// Value array
	var tags = new Array('sounds', 'geolocation', '', '', 'roster-showall');
	
	// Build the XML with the array
	for(var i = 0; i < array.length; i++) {
		var value = array[i];
		var tag = tags[i];
		
		if((i != 2) && (i != 3)) {
			storage.appendChild(iq.buildNode('option', {'type': tag, 'xmlns': NS_OPTIONS}, value));
			setDB('options', tag, value);
		}
	}
	
	con.send(iq);
	
	// If geolocation is enabled
	if(array[1] == '1')
		geolocate();
}

// Saves the welcome options
function saveWelcome() {
	// Get the new options
	var array = new Array();
	
	$('#welcome a.box').each(function() {
		var current = '0';
		
		if($(this).hasClass('enabled'))
			current = '1';
		
		array.push(current);
	});
	
	// If XMPP links is enabled
	if(array[2] == '1')
		xmppLinksHandler();
	
	// If offline buddies showing is enabled
	if(array[4] == '1')
		showAllBuddies('welcome');
	
	// If archiving is supported by the server
	if(enabledArchives('pref')) {
		var aEnabled = false;
		
		// If archiving is enabled
		if(array[3] == '1')
			aEnabled = true;
		
		// Send the archives configuration
		configArchives(aEnabled);
	}
	
	// If PubSub is supported by the server
	if(enabledPEP() && enabledPubSub())
		setupMicroblog();
	
	// Send the new options
	sendWelcome(array);
	
	// Close the welcome tool
	closeWelcome();
	
	// Open the profile editor
	openVCard();
}

// Goes to the next welcome step
function nextWelcome() {
	// Check the next step to go to
	var next = 1;
	var missing = '#welcome .tab a.tab-missing';
	
	if(exists(missing))
		next = parseInt($(missing + ':first').attr('data-step'));
	
	// Switch to the next step
	switchWelcome(next);	
}

// Plugin launcher
function launchWelcome() {
	$('#welcome a.box').click(function() {
		if($(this).hasClass('enabled'))
			$(this).removeClass('enabled').attr('title', _e("Click to enable"));
		else
			$(this).addClass('enabled').attr('title', _e("Click to disable"));
	});
}

// Launch this plugin!
$(document).ready(launchWelcome);
