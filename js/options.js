/*

Jappix - An Open μSocial Platform
These are the options JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function switchOptions(id) {
	$("#options .one-conf").hide();
	$("#options #conf" + id).show();
	$("#options .tab a").removeClass("tab-active");
	$("#options .tab .conf" + id).addClass("tab-active");
}

// When the user open his options
function optionsOpen() {
	// Reset the options popup
	closeOptions();
	
	// We get the values of the forms for the sounds
	if(getDB('options', 'sounds') == 'off')
		$("#sounds").val('off');
	else
		$("#sounds").val('on');
	
	// We get the values of the forms for the geolocation
	if(getDB('options', 'geolocation') == 'on')
		$("#geolocation").val('on');
	else
		$("#geolocation").val('off');
	
	// We get the values of the forms for the persistent
	if(getDB('options', 'persistent') == '0')
		$("#persistent").val('0');
	else
		$("#persistent").val('1');
	
	// We get the values of the forms for the maxnotices
	var dbMaxnotices = getDB('options', 'maxnotices');
	
	if(dbMaxnotices)
		$("#maxnotices").val(dbMaxnotices);
	else
		$("#maxnotices").val('10000');
	
	$("#options").show();
}

function closeOptions() {
	// We hide the divs
	$('#options, #options .sub-ask').hide();
	
	// Reset the inputs
	$('#options input.resetable').val('');
	
	// Reset the switcher
	switchOptions(1);
	
	// We reset the inputs
	$('#options input').removeClass('please-complete');
}

function displayOptions(type, value) {
	setDB('options', type, value);
}

function storeOptions() {
	// Get the values
	var sounds = getDB('options', 'sounds');
	var geolocation = getDB('options', 'geolocation');
	var persistent = getDB('options', 'persistent');
	var maxnotices = getDB('options', 'maxnotices');
	
	// New IQ
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var query = iq.setQuery(NS_PRIVATE);
	var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_OPTIONS}));
	
	// Sounds
	storage.appendChild(iq.buildNode('option', {'type': 'sounds', 'xmlns': NS_OPTIONS}, sounds));
	
	// Geolocation
	storage.appendChild(iq.buildNode('option', {'type': 'geolocation', 'xmlns': NS_OPTIONS}, geolocation));
	
	// Channel
	storage.appendChild(iq.buildNode('option', {'type': 'persistent', 'xmlns': NS_OPTIONS}, persistent));
	storage.appendChild(iq.buildNode('option', {'type': 'maxnotices', 'xmlns': NS_OPTIONS}, maxnotices));
	
	con.send(iq);
}

function saveOptions() {
	// Close the options
	closeOptions();
	
	// We apply the sounds
	setDB('options', 'sounds', $("#sounds").val());
	
	// We apply the geolocation
	if ($('#geolocation').val() == 'on') {
		setDB('options', 'geolocation', 'on');
		
		// We geolocate the user on the go
		geolocate();
	}
	
	else {
		setDB('options', 'geolocation', 'off');
		
		// We delete the geolocation informations in pubsub
		sendPosition('', '', '');
	}
	
	// We apply the microblog
	var persist = $('#persistent').val();
	var maximum = $('#maxnotices').val();
	
	setDB('options', 'persistent', persist);
	setDB('options', 'maxnotices', maximum);
	
	configMicroblog(persist, maximum);
	
	// We send the options to the database
	storeOptions();
}

function handlePwdChange(iq) {
	// If no errors
	if(!handleError(iq.getNode())) {
		clearLastSession();
		quit();
		openThisInfo(1);
	}
}

function sendNewPassword() {
	/* REF: http://xmpp.org/extensions/xep-0077.html#usecases-changepw */
	
	var userPassHash = hex_md5(getPassword());
	var password0 = $('#options .old').val();
	var password1 = $('#options .new1').val();
	var password2 = $('#options .new2').val();
	
	if (password1 == password2 && hex_md5(password0) == userPassHash) {
		// We send the IQ
		var iq = new JSJaCIQ();
		
		iq.setID(genID());
		iq.setTo(getServer());
		iq.setType('set');
		var iqQuery = iq.setQuery(NS_REGISTER);
		iqQuery.appendChild(iq.buildNode('username', {'xmlns': NS_REGISTER}, getNick()));
		iqQuery.appendChild(iq.buildNode('password', {'xmlns': NS_REGISTER}, password1));
		
		con.send(iq, handlePwdChange);
	}
	
	else {
		$('.sub-ask-pass input').each(function() {
			if(!$(this).val())
				$(this).addClass('please-complete');
			else
				$(this).removeClass('please-complete');	
		});
		
		if (hex_md5(password0) != userPassHash)
			$("#options .old").addClass("please-complete");
		if (password1 != password2)
			$("#options .new1, #options .new2").addClass("please-complete");
	}
}

function handleAccDeletion(iq) {
	// If no errors
	if(!handleError(iq.getNode())) {
		clearLastSession();
		quit();
		openThisInfo(2);
	}
}

function deleteMyMicroblog() {
	/* REF: http://xmpp.org/extensions/xep-0060.html#owner-delete */
	
	var userPassHash = hex_md5(getPassword());
	var password = $('#options .check-empty').val();
	
	if(hex_md5(password) == userPassHash) {
		// Remove the item from our DOM
		$('.one-update.' + hex_md5(getJID())).remove();
		
		// Send the IQ to remove the item (and get eventual error callback)
		var iq = new JSJaCIQ();
		iq.setID(genID());
		iq.setType('set');
		
		var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
		pubsub.appendChild(iq.buildNode('purge', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));
		
		con.send(iq, handleErrorReply);
		
		// Hide the tool
		$("#options .sub-ask").fadeOut('fast');
	}
	
	else {
		var selector = $('#options .check-empty');
		
		if(hex_md5(password) != userPassHash)
			selector.addClass('please-complete');
		else
			selector.removeClass('please-complete');
	}
}

function deleteMyAccount() {
	/* REF: http://xmpp.org/extensions/xep-0077.html#usecases-cancel */
	
	var userPassHash = hex_md5(getPassword());
	var password = $('#options .check-password').val();
	
	if(hex_md5(password) == userPassHash) {
		// We send the IQ
		var iq = new JSJaCIQ();
		iq.setID(genID());
		iq.setType('set');
		iq.setFrom(getJID());
		var iqQuery = iq.setQuery(NS_REGISTER);
		iqQuery.appendChild(iq.buildNode('remove', {'xmlns': NS_REGISTER}));
		con.send(iq, handleAccDeletion);
	}
	
	else {
		var selector = $('#options .check-password');
		
		if(hex_md5(password) != userPassHash)
			selector.addClass('please-complete');
		else
			selector.removeClass('please-complete');
	}
}

$(document).ready(function() {
	$("#options .linked").click(function() {
		$("#options .sub-ask").hide();
	});
	
	$("#options .empty-channel").click(function() {
		$("#options .sub-ask-empty").fadeIn('fast');
	});
	
	$("#options .change-password").click(function() {
		$("#options .sub-ask-pass").fadeIn('fast');
	});
	
	$("#options .delete-account").click(function() {
		$("#options .sub-ask-delete").fadeIn('fast');
	});
	
	$("#options .sub-ask-close").click(function() {
		$("#options .sub-ask").fadeOut('fast');
	});
});
