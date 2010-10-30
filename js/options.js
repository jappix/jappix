/*

Jappix - An open social platform
These are the options JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

// Switches between the options tabs
function switchOptions(id) {
	$('#options .one-conf').hide();
	$('#options #conf' + id).show();
	$('#options .tab a').removeClass('tab-active');
	$('#options .tab .tab' + id).addClass('tab-active');
}

// Opens the options popup
function optionsOpen() {
	// Reset the options popup
	closeOptions();
	
	var enabled_archives_pref = enabledArchives('pref');
	var enabled_pubsub = enabledPubSub();
	var enabled_pep = enabledPEP();
	var sWait = $('#options .content');
	
	// Show the waiting items if necessary
	if(enabled_archives_pref || (enabled_pep && enabled_pubsub)) {
		$('#options .wait').show();
		$('#options .finish:first').addClass('disabled');
	}
	
	// We get the archiving configuration
	if(enabled_archives_pref) {
		sWait.addClass('archives');
		getConfigArchives();
	}
	
	// We get the microblog configuration
	if(enabled_pubsub && enabled_pep) {
		sWait.addClass('microblog');
		getConfigMicroblog();
	}
	
	// We show the "privacy" form if something is visible into it
	if(enabled_archives_pref || enabled_pep)
		$('#options fieldset.hidable:first').show();
	
	// We get the values of the forms for the sounds
	if(getDB('options', 'sounds') == '0')
		$('#sounds').attr('checked', false);
	else
		$('#sounds').attr('checked', true);
	
	// We get the values of the forms for the geolocation
	if(getDB('options', 'geolocation') == '1')
		$('#geolocation').attr('checked', true);
	else
		$('#geolocation').attr('checked', false);
	
	// We get the values of the forms for the roster show all
	if(getDB('options', 'roster-showall') == '1')
		$('#showall').attr('checked', true);
	else
		$('#showall').attr('checked', false);
	
	// Show the options
	$('#options').show();
}

// Closes the options popup
function closeOptions() {
	// We hide the divs
	$('#options, #options .sub-ask').hide();
	
	// Reset the elements
	$('#options input.resetable').val('');
	$('#options .content').removeClass('microblog').removeClass('archives');
	$('#archiving, #persistent, #maxnotices').removeAttr('disabled');
	
	// Reset the switcher
	switchOptions(1);
	
	// We reset the inputs
	$('#options input').removeClass('please-complete');
}

// Manages the options wait item
function waitOptions(id) {
	var sOptions = $('#options .content');
	
	// Remove the current item class
	sOptions.removeClass(id);
	
	// Hide the waiting items if all was received
	if(!sOptions.hasClass('microblog') && !sOptions.hasClass('archives')) {
		$('#options .wait').hide();
		$('#options .finish:first').removeClass('disabled');
	}
}

// Sends the options to the XMPP server
function storeOptions() {
	// Get the values
	var sounds = getDB('options', 'sounds');
	var geolocation = getDB('options', 'geolocation');
	var showall = getDB('options', 'roster-showall');
	
	// Create an array to be looped
	var oType = new Array('sounds', 'geolocation', 'roster-showall');
	var oContent = new Array(sounds, geolocation, showall);
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setType('set');
	
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_OPTIONS}));
	
	// Loop the array
	for(var i = 0; i < oType.length; i++)
		storage.appendChild(iq.buildNode('option', {'type': oType[i], 'xmlns': NS_OPTIONS}, oContent[i]));
	
	con.send(iq, handleStoreOptions);
	
	logThis('Storing options...');
}

// Handles the option storing
function handleStoreOptions(iq) {
	if(!iq || (iq.getType() != 'result'))
		logThis('Options not stored.');
	else
		logThis('Options stored.');
}

// Saves the user options
function saveOptions() {
	// Not yet retrieved?
	if($('#options .finish:first').hasClass('disabled'))
		return;
	
	// Close the options
	closeOptions();
	
	// We apply the sounds
	var sounds = '0';
	
	if($('#sounds').is(':checked'))
		sounds = '1';
	
	setDB('options', 'sounds', sounds);
	
	// We apply the geolocation
	if($('#geolocation').is(':checked')) {
		setDB('options', 'geolocation', '1');
		
		// We geolocate the user on the go
		geolocate();
	}
	
	else {
		setDB('options', 'geolocation', '0');
		
		// We delete the geolocation informations in pubsub
		sendPosition('', '', '');
	}
	
	// We apply the roster show all
	if($('#showall').is(':checked')) {
		setDB('options', 'roster-showall', '1');
		showAllBuddies('options');
	}
	
	else {
		setDB('options', 'roster-showall', '0');
		showOnlineBuddies('options');
	}
	
	// We apply the message archiving
	if(enabledArchives('pref')) {
		var aEnabled = false;
		
		if($('#archiving').is(':checked'))
			aEnabled = true;
		
		configArchives(aEnabled);
	}
	
	// We apply the microblog configuration
	var persist = '0';
	var maximum = $('#maxnotices').val();
	
	if($('#persistent').is(':checked'))
		persist = '1';
	
	if(enabledPEP() && enabledPubSub())
		configMicroblog(persist, maximum);
	
	// We send the options to the database
	storeOptions();
}

// Handles the password changing
function handlePwdChange(iq) {
	// If no errors
	if(!handleErrorReply(iq)) {
		clearLastSession();
		quit();
		openThisInfo(1);
		
		logThis('Password changed.');
	}
	
	else
		logThis('Password not changed.');
}

// Sends the new account password
function sendNewPassword() {
	/* REF: http://xmpp.org/extensions/xep-0077.html#usecases-changepw */
	
	var password0 = $('#options .old').val();
	var password1 = $('#options .new1').val();
	var password2 = $('#options .new2').val();
	
	if ((password1 == password2) && (password0 == getPassword())) {
		// We send the IQ
		var iq = new JSJaCIQ();
		
		iq.setTo(getServer());
		iq.setType('set');
		
		var iqQuery = iq.setQuery(NS_REGISTER);
		
		iqQuery.appendChild(iq.buildNode('username', {'xmlns': NS_REGISTER}, getNick()));
		iqQuery.appendChild(iq.buildNode('password', {'xmlns': NS_REGISTER}, password1));
		
		con.send(iq, handlePwdChange);
		
		logThis('Password change sent.');
	}
	
	else {
		$('.sub-ask-pass input').each(function() {
			if(!$(this).val())
				$(this).addClass('please-complete');
			else
				$(this).removeClass('please-complete');	
		});
		
		if(password0 != getPassword())
			$('#options .old').addClass('please-complete');
		if(password1 != password2)
			$('#options .new1, #options .new2').addClass('please-complete');
	}
}

// Handles the account deletion request
function handleAccDeletion(iq) {
	// If no errors
	if(!handleErrorReply(iq)) {
		clearLastSession();
		resetJappix();
		openThisInfo(2);
		logout();
		
		logThis('Account deleted.');
	}
	
	else
		logThis('Account not deleted.');
}

// Purge the user's microblog items
function purgeMyMicroblog() {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-purge */
	
	var password = $('#options .check-empty').val();
	
	if(password == getPassword()) {
		// Send the IQ to remove the item (and get eventual error callback)
		var iq = new JSJaCIQ();
		iq.setType('set');
		
		var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
		pubsub.appendChild(iq.buildNode('purge', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));
		
		con.send(iq, handleMicroblogPurge);
		
		// Hide the tool
		$('#options .sub-ask').hide();
		
		logThis('Microblog purge sent.');
	}
	
	else {
		var selector = $('#options .check-empty');
		
		if(password != getPassword())
			selector.addClass('please-complete');
		else
			selector.removeClass('please-complete');
	}
}

// Handles the microblog purge
function handleMicroblogPurge(iq) {
	// If no errors
	if(!handleErrorReply(iq)) {
		// Remove the microblog items
		$('.one-update.' + hex_md5(getXID())).remove();
		
		logThis('Microblog purged.');
	}
	
	else
		logThis('Microblog not purged.');
}

// Deletes the user's account
function deleteMyAccount() {
	/* REF: http://xmpp.org/extensions/xep-0077.html#usecases-cancel */
	
	var password = $('#options .check-password').val();
	
	if(password == getPassword()) {
		// We send the IQ
		var iq = new JSJaCIQ();
		iq.setType('set');
		
		var iqQuery = iq.setQuery(NS_REGISTER);
		iqQuery.appendChild(iq.buildNode('remove', {'xmlns': NS_REGISTER}));
		
		con.send(iq, handleAccDeletion);
		
		logThis('Delete account sent.');
	}
	
	else {
		var selector = $('#options .check-password');
		
		if(password != getPassword())
			selector.addClass('please-complete');
		else
			selector.removeClass('please-complete');
	}
}

// Launch this plugin!
$(document).ready(function() {
	// The click events on the links
	$('#options .linked').click(function() {
		$('#options .sub-ask').hide();
	});
	
	$('#options .xmpp-links').click(xmppLinksHandler);
	
	$('#options .empty-channel').click(function() {
		var selector = '#options .sub-ask-empty';
		
		$(selector).show();
		$(selector + ' input').focus();
	});
	
	$('#options .change-password').click(function() {
		var selector = '#options .sub-ask-pass';
		
		$(selector).show();
		$(selector + ' input:first').focus();
	});
	
	$('#options .delete-account').click(function() {
		var selector = '#options .sub-ask-delete';
		
		$(selector).show();
		$(selector + ' input').focus();
	});
	
	$('#options .sub-ask-close').click(function() {
		$('#options .sub-ask').hide();
	});
	
	// The keyup events
	$('#options .sub-ask input').keyup(function(e) {
		if(e.keyCode == 13) {
			// Microblog purge
			if($(this).is('.purge-microblog'))
				purgeMyMicroblog();
			
			// Password change
			else if($(this).is('.password-change'))
				sendNewPassword();
			
			// Account deletion
			else if($(this).is('.delete-account'))
				deleteMyAccount();
		}
	});
});
