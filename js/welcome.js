/*

Jappix - An open social platform
These are the welcome tool functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 05/12/10

*/

// Opens the welcome tools
function openWelcome() {
	// Blacklisted XMPP servers?
	var server = getServer();
	
	if((server == 'gmail.com') || (server == 'googlemail.com') || (server == 'chat.facebook.com'))
		return;
	
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("Welcome!") + '</div>' + 
	
	'<div class="tab">' + 
		'<a class="tab-active" data-step="1">' + _e("Options") + '</a>' + 
		'<a class="tab-missing" data-step="2">' + _e("Friends") + '</a>' + 
		'<a class="tab-missing" data-step="3">' + _e("Profile") + '</a>' + 
	'</div>' + 
	
	'<div class="content">' + 
		'<div class="lap-active one-lap welcome1">' + 
			'<div class="infos">' + 
				'<p class="infos-title">' + _e("Welcome on Jappix, your own social cloud!") + '</p>' + 
				'<p>' + _e("Before you start using it, you will have to change some settings, search for friends and complete your profile.") + '</p>' + 
			'</div>' + 
			
			'<a class="box enabled" title="' + _e("Click to disable") + '">' + 
				'<span class="option">' + _e("Sounds") + '</span>' + 
				'<span class="description">' + _e("Enable notification sounds") + '</span>' + 
				'<span class="image sound talk-images"></span>' + 
			'</a>' + 
			
			'<a class="box enabled pep-hidable" title="' + _e("Click to disable") + '">' + 
				'<span class="option">' + _e("Geolocation") + '</span>' + 
				'<span class="description">' + _e("Share your position on the globe") + '</span>' + 
				'<span class="image geolocation talk-images"></span>' + 
			'</a>' + 
			
			'<a class="box" title="' + _e("Click to enable") + '">' + 
				'<span class="option">' + _e("XMPP links") + '</span>' + 
				'<span class="description">' + _e("Open XMPP links with Jappix") + '</span>' + 
				'<span class="image xmpp talk-images"></span>' + 
			'</a>' + 
			
			'<a class="box enabled archives-hidable pref" title="' + _e("Click to enable") + '">' + 
				'<span class="option">' + _e("Message archiving") + '</span>' + 
				'<span class="description">' + _e("Store a history of your chats") + '</span>' + 
				'<span class="image archives talk-images"></span>' + 
			'</a>' + 
			
			'<a class="box" title="' + _e("Click to enable") + '">' + 
				'<span class="option">' + _e("Offline friends") + '</span>' + 
				'<span class="description">' + _e("Don\'t hide offline friends") + '</span>' + 
				'<span class="image offline talk-images"></span>' + 
			'</a>' + 
		'</div>' + 
		
		'<div class="one-lap welcome2">' + 
			'<div class="infos">' + 
				'<p class="infos-title">' + _e("Friends") + '</p>' + 
				'<p>' + _e("Use this tool to find your friends on the server you are using right now, or add them later.") + '</p>' + 
			'</div>' + 
			
			'<div class="results welcome-results"></div>' + 
		'</div>' + 
		
		'<div class="one-lap welcome3">' + 
			'<div class="infos">' + 
				'<p class="infos-title">' + _e("Profile") + '</p>' + 
				'<p>' + _e("Great work! When you will press the save button, the profile editor will be opened.") + '</p>' + 
				'<p>' + _e("Thanks from the Jappix team for your interest. Happy socializing!") + '</p>' + 
			'</div>' + 
			
			'<div class="logo welcome-images"></div>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish next">' + _e("Next") + ' »</a>' + 
		'<a class="finish save">' + _e("Save") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('welcome', html);
	
	// Apply the features
	applyFeatures('welcome');
	
	// Associate the events
	launchWelcome();
	
	logThis('Welcome assistant opened.');
}

// Closes the welcome tools
function closeWelcome() {
	// Destroy the popup
	destroyPopup('welcome');
	
	return false;
}

// Switches the welcome tabs
function switchWelcome(id) {
	// Path to
	var welcome = '#welcome ';
	var content = welcome + '.content .';
	var tab = welcome + '.tab ';
	var wait = $(welcome + '.wait');
	
	$(content + 'one-lap').hide();
	$(content + 'welcome' + id).show();
	$(tab + 'a').removeClass('tab-active');
	$(tab + 'a[data-step=' + id + ']').addClass('tab-active').removeClass('tab-missing');
	
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
	
	return false;
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
	for(i in array) {
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
	
	return false;
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
	
	return false;
}

// Plugin launcher
function launchWelcome() {
	// Click events
	$('#welcome .tab a').click(function() {
		// Switch to the good tab
		var key = parseInt($(this).attr('data-step'));
		
		return switchWelcome(key);
	});
	
	$('#welcome a.box').click(function() {
		if($(this).hasClass('enabled'))
			$(this).removeClass('enabled').attr('title', _e("Click to enable"));
		else
			$(this).addClass('enabled').attr('title', _e("Click to disable"));
	});
	
	$('#welcome .bottom .finish').click(function() {
		if($(this).is('.next'))
			return nextWelcome();
		if($(this).is('.save'))
			return saveWelcome();
	});
}
