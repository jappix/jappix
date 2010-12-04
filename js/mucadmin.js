/*

Jappix - An open social platform
These are the muc-admin JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 04/12/10

*/

// Opens the MUC admin popup
function openMucAdmin(xid) {
	// Popup HTML content
	var html = 
	'<div class="top">' + _e("MUC administration") + '</div>' + 
	
	'<div class="content">' + 
		'<div class="head muc-admin-head">' + 
			'<div class="head-text muc-admin-head-text">' + _e("You administrate this room") + '</div>' + 
			
			'<div class="muc-admin-head-jid">' + xid + '</div>' + 
		'</div>' + 
		
		'<div class="muc-admin-results">' + 
			'<div class="muc-admin-topic">' + 
				'<fieldset>' + 
					'<legend>' + _e("Subject") + '</legend>' + 
					
					'<label for="topic-text">' + _e("Enter new subject") + '</label>' + 
					'<textarea id="topic-text" name="room-topic" rows="8" cols="60" ></textarea>' + 
				'</fieldset>' + 
			'</div>' + 
			
			'<div class="muc-admin-conf">' + 
				'<fieldset>' + 
					'<legend>' + _e("Configuration") + '</legend>' + 
					
					'<div class="last-element"></div>' + 
				'</fieldset>' + 
			'</div>' + 
			
			'<div class="muc-admin-aut">' + 
				'<fieldset>' + 
					'<legend>' + _e("Authorizations") + '</legend>' + 
					
					'<label>' + _e("Member list") + '</label>' + 
					'<div class="aut-member aut-group">' + 
						'<a class="aut-add" onclick="return addInputMucAdmin(\'\', \'member\');">' + _e("Add an input") + '</a>' + 
					'</div>' + 
					
					'<label>' + _e("Owner list") + '</label>' + 
					'<div class="aut-owner aut-group">' + 
						'<a class="aut-add" onclick="return addInputMucAdmin(\'\', \'owner\');">' + _e("Add an input") + '</a>' + 
					'</div>' + 
					
					'<label>' + _e("Administrator list") + '</label>' + 
					'<div class="aut-admin aut-group">' + 
						'<a class="aut-add" onclick="return addInputMucAdmin(\'\', \'admin\');">' + _e("Add an input") + '</a>' + 
					'</div>' + 
					
					'<label>' + _e("Outcast list") + '</label>' + 
					'<div class="aut-outcast aut-group">' + 
						'<a class="aut-add" onclick="return addInputMucAdmin(\'\', \'outcast\');">' + _e("Add an input") + '</a>' + 
					'</div>' + 
				'</fieldset>' + 
			'</div>' + 
			
			'<div class="muc-admin-others">' + 
				'<fieldset>' + 
					'<legend>' + _e("Others") + '</legend>' + 
					
					'<label>' + _e("Destroy this MUC") + '</label>' + 
					'<a onclick="return destroyMucAdmin();">' + _e("Yes, let's do it!") + '</a>' + 
				'</fieldset>' + 
			'</div>' + 
		'</div>' + 
	'</div>' + 
	
	'<div class="bottom">' + 
		'<div class="wait wait-medium"></div>' + 
		
		'<a class="finish save">' + _e("Save") + '</a>' + 
		'<a class="finish cancel">' + _e("Cancel") + '</a>' + 
	'</div>';
	
	// Create the popup
	createPopup('muc-admin', html);
	
	// Associate the events
	launchMucAdmin();
	
	// We query the room to edit
	queryMucAdmin(xid, 'options');
	
	// We get the affiliated user's privileges
	queryMucAdmin(xid, 'member');
	queryMucAdmin(xid, 'owner');
	queryMucAdmin(xid, 'admin');
	queryMucAdmin(xid, 'outcast');
}

// Closes the MUC admin popup
function closeMucAdmin() {
	// Destroy the popup
	destroyPopup('muc-admin');
	
	return false;
}

// Fills the MUC admin fields
function fillMucAdmin(field, type, label, value, node) {
	var hash = hex_md5(type);
	var input;
	
	// We check the checkboxes with boolean values
	if(type == 'boolean') {
		var checked;
		
		if(value == '1')
			checked = ' checked';
		else
			checked = '';
		
		input = '<input id="' + hash + '" name="' + field + '" type="checkbox" class="muc-admin-i muc-checkbox"' + checked + ' />';
	}
	
	// We check if the value comes from a radio input
	else if(type == 'list-single') {
		input = '<select id="' + hash + '" name="' + field + '" class="muc-admin-i">';
		var selected;
		
		$(node).find('option').each(function() {
			var nLabel = $(this).attr('label');
			var nValue = $(this).find('value').text();
			
			// If this is the selected value
			if(nValue == value)
				selected = 'selected';
			else
				selected = '';
			
			input += '<option ' + selected + ' value="' + nValue + '">' + nLabel + '</option>';
		});
		
		input += '</select>';
	}
	
	// We fill the blank inputs with the text values
	else {
		// We change the type of the input
		if(type == 'text-private')
			iType = 'password';
		else
			iType = 'text';
		
		input = '<input id="' + hash + '" name="' + field + '" type="' + iType + '" class="muc-admin-i" value="' + value + '" />';
	}
	
	$('.muc-admin-conf .last-element').before('<label for="' + hash + '">' + label + '</label>' + input);
}

// Removes a MUC admin input
function removeInputMucAdmin(hash) {
	var path = '#muc-admin .aut-group .' + hash;
	
	// We first hide the container of the input
	$(path).hide();
	
	// Then, we add a special class to the input
	$(path + ' input').addClass('aut-dustbin');
}

// Adds a MUC admin input
function addInputMucAdmin(xid, affiliation) {
	var hash = hex_md5(xid + affiliation);
	
	$('#muc-admin .aut-' + affiliation + ' .aut-add').after(
		'<div class="one-aut ' + hash + '">' + 
			'<input id="aut-' + affiliation + '" name="' + affiliation + '" type="text" class="muc-admin-i" value="' + xid + '" />' + 
			'<a class="aut-remove">[-]</a>' + 
		'</div>'
	);
	
	$('#muc-admin .' + hash + ' .aut-remove').click(function() {
		removeInputMucAdmin(hash);
	});
	
	return false;
}

// Handles the MUC admin form
function handleMucAdmin(iq) {
	var handleXML = iq.getQuery();
	var handleFrom = fullXID(getStanzaFrom(iq));
	
	// If we got the form results
	if($(handleXML).find('x').attr('xmlns')) {
		$(handleXML).find('field').each(function() {
			// We parse the received xml
			var field = $(this).attr('var');
			var type = $(this).attr('type');
			var label = $(this).attr('label');
			var value = $(this).find('value:first').text();
			var node = this;
			
			// If we have correct data to be exploited
			if(field != undefined && type != undefined && label != undefined && value != undefined )
				fillMucAdmin(field, type, label, value, node);
		});
		
		logThis('MUC admin form received: ' + handleFrom);
	}
	
	// If we got the authorizations results
	else if($(handleXML).find('item').attr('jid')) {
		$(handleXML).find('item').each(function() {
			// We parse the received xml
			var xid = $(this).attr('jid');
			var affiliation = $(this).attr('affiliation');
			
			// We create one input for one XID
			addInputMucAdmin(xid, affiliation);
		});
		
		logThis('MUC admin items received: ' + handleFrom);
	}
	
	// We hide the wait icon
	$('#muc-admin .wait').hide();
}

// Queries the MUC admin form
function queryMucAdmin(xid, type) {
	// Show the wait icon
	$('#muc-admin .wait').show();
	
	// New IQ
	var iq = new JSJaCIQ();
	
	iq.setTo(xid);
	iq.setType('get');
	
	if(type == 'options')
		iq.setQuery(NS_MUC_OWNER);
	
	else {
		var iqQuery = iq.setQuery(NS_MUC_ADMIN);
		iqQuery.appendChild(iq.buildNode('item', {'affiliation': type, 'xmlns': NS_MUC_ADMIN}));
	}
	
	con.send(iq, handleMucAdmin);
}

// Sends the new chat-room topic
function sendMucAdminTopic(xid) {
	// We get the new topic
	var topic = $('.muc-admin-topic textarea').val();
	
	// We send the new topic if not blank
	if(topic) {
		var m = new JSJaCMessage();
		m.setTo(xid);
		m.setType('groupchat');
		m.setSubject(topic);
		con.send(m);
		
		logThis('MUC admin topic sent: ' + topic, 3);
	}
}

// Sends the MUC admin form
function sendMucAdminIQ(xid, rights, form) {
	// We set the iq headers
	var iq = new JSJaCIQ();
	iq.setTo(xid);
	iq.setType('set');
	
	var xmlns = NS_MUC + '#' + rights + '';
	var iqQuery = iq.setQuery(xmlns);
	
	if(form == 'form') {
		var x = iqQuery.appendChild(iq.buildNode('x', {'type': 'submit', 'xmlns': NS_XDATA}));
		
		// We loop for all the elements
		$('.muc-admin-conf input, .muc-admin-conf select').each(function() {
			// We get the needed values
			var type = $(this).attr('name');
			
			// If the input is a checkbox
			if($(this).is(':checkbox')) {
				if($(this).is(':checked'))
					var value = '1';
				else
					var value = '0';
			}
			
			// Else, the input is a text field
			else
				var value = $(this).val();
			
			// We add a node to the xml
			var field = x.appendChild(iq.buildNode('field', {'var': type, 'xmlns': NS_XDATA}));
			field.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, value));
		});
	}
	
	else if(form == 'aut') {
		// We define the values array
		var types = new Array('member', 'owner', 'admin', 'outcast');
		
		for(i in types) {
			// We get the current type
			var tType = types[i];
			
			// We loop for all the elements
			$('.muc-admin-aut .aut-' + tType + ' input').each(function() {
				// We get the needed values
				var value = $(this).val();
				
				// If there's a value
				if(value)
					var item = iqQuery.appendChild(iq.buildNode('item', {'jid': value, 'xmlns': xmlns}));
				
				// It the user had removed the XID
				if($(this).hasClass('aut-dustbin') && value)
					item.setAttribute('affiliation', 'none');
				
				// If the value is not blank and okay
				else if(value)
					item.setAttribute('affiliation', tType);
			});
		}
	}
	
	// We send the iq !
	con.send(iq, handleErrorReply);
	
	logThis('MUC admin ' + form + ' sent: ' + xid, 3);
}

// Checks if the MUC room was destroyed
function handleDestroyMucAdminIQ(iq) {
	if(!handleErrorReply(iq)) {
		// We close the groupchat
		var room = fullXID(getStanzaFrom(iq));
		var hash = hex_md5(room);
		quitThisChat(room, hash, 'groupchat');
		
		// We close the muc admin popup
		closeMucAdmin();
		
		// We tell the user that all is okay
		openThisInfo(5);
		
		// We remove the user's favorite
		if(existDB('favorites', room))
			removeThisFavorite(room, explodeThis('@', room, 0));
		
		logThis('MUC admin destroyed: ' + room, 3);
	}
	
	// We hide the wait icon
	$('#muc-admin .wait').hide();
}

// Destroys a MUC room
function destroyMucAdminIQ(xid) {
	// We ask the server to delete the room
	var iq = new JSJaCIQ();
	
	iq.setTo(xid);
	iq.setType('set');
	var iqQuery = iq.setQuery(NS_MUC_OWNER);
	iqQuery.appendChild(iq.buildNode('destroy', {'xmlns': NS_MUC_OWNER}));
	
	con.send(iq, handleDestroyMucAdminIQ);
	
	logThis('MUC admin destroy sent: ' + xid, 3);
	
	return false;
}

// Performs the MUC room destroy functions
function destroyMucAdmin() {
	// We get the XID of the current room
	var xid = $('#muc-admin .muc-admin-head-jid').text();
	
	// We show the wait icon
	$('#muc-admin .wait').show();
	
	// We send the iq
	destroyMucAdminIQ(xid);
}

// Sends all the MUC admin stuffs
function sendMucAdmin() {
	// We get the XID of the current room
	var xid = $('#muc-admin .muc-admin-head-jid').text();
	
	// We change the room topic
	sendMucAdminTopic(xid);
	
	// We send the needed queries
	sendMucAdminIQ(xid, 'owner', 'form');
	sendMucAdminIQ(xid, 'admin', 'aut');
}

// Saves the MUC admin elements
function saveMucAdmin() {
	// We send the new options
	sendMucAdmin();
	
	// And we quit the popup
	return closeMucAdmin();
}

// Plugin launcher
function launchMucAdmin() {
	// Click events
	$('#muc-admin .bottom .finish.save').click(function() {
		return saveMucAdmin();
	});
	
	$('#muc-admin .bottom .finish.cancel').click(function() {
		return closeMucAdmin();
	});
}
