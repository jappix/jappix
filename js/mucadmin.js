/*

Jappix - An Open μSocial Platform
These are the muc-admin JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function fillMucAdmin(field, type, label, value, node) {
	var hash = hex_md5(type);
	var input;
	
	// We check the checkboxes with boolean values
	if(type == 'boolean') {
		var checked;
		
		if(value == '1')
			checked = 'checked';
		else
			checked = '';
		
		input = '<input id="' + hash + '" name="' + field + '" type="checkbox" class="muc-admin-i muc-checkbox removable" ' + checked + ' />';
	}
	
	// We check if the value comes from a radio input
	else if(type == 'list-single') {
		input = '<select id="' + hash + '" name="' + field + '" class="muc-admin-i removable">';
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
		
		input = '<input id="' + hash + '" name="' + field + '" type="' + iType + '" class="muc-admin-i removable" value="' + value + '" />';
	}
	
	$('.muc-admin-conf .last-element').before('<label for="' + hash + '" class="removable">' + label + '</label>' + input);
}

function removeInputMucAdmin(hash) {
	var path = '#muc-admin .aut-group .' + hash;
	
	// We first hide the container of the input
	$(path).hide();
	
	// Then, we add a special class to the input
	$(path + ' input').addClass('aut-dustbin');
}

function addInputMucAdmin(jid, affiliation) {
	var hash = hex_md5(jid + affiliation);
	
	$("#muc-admin .aut-" + affiliation + " .aut-add").after(
		'<div class="one-aut removable ' + hash + '">' + 
			'<input id="aut-' + affiliation + '" name="' + affiliation + '" type="text" class="muc-admin-i" value="' + jid + '" />' + 
			'<a class="aut-remove">[-]</a>' + 
		'</div>'
	);
	
	$('#muc-admin .' + hash + ' .aut-remove').click(function() {
		removeInputMucAdmin(hash);
	});
}

function handleMucAdmin(iq) {
	var handleXML = iq.getQuery();
	
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
	}
	
	// If we got the authorizations results
	else if($(handleXML).find('item').attr('jid')) {
		$(handleXML).find('item').each(function() {
			// We parse the received xml
			var jid = $(this).attr('jid');
			var affiliation = $(this).attr('affiliation');
			
			// We create one input for one jid
			addInputMucAdmin(jid, affiliation);
		});
	}
	
	// We hide the wait icon
	$("#muc-admin .wait").hide();
}

function queryMucAdmin(jid, type) {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setTo(jid);
	iq.setType('get');
	
	if(type == 'options')
		iq.setQuery(NS_MUC_OWNER);
	
	else {
		var iqQuery = iq.setQuery(NS_MUC_ADMIN);
		iqQuery.appendChild(iq.buildNode('item', {'affiliation': type, 'xmlns': NS_MUC_ADMIN}));
	}
	
	con.send(iq, handleMucAdmin);
}

function resetMucAdmin() {
	// We hide the room name
	$("#muc-admin .muc-admin-head-jid").text('');
	
	// We reset the inputs that has to be reseted
	$("#muc-admin .resetable").val("");
	
	// We delete the removable items
	$("#muc-admin .removable").remove();
	
	// We show the wait icon
	$("#muc-admin .wait").show();
}

function openMucAdmin(jid) {
	// We reset the muc admin values
	resetMucAdmin();
	
	// We show the popup
	$("#muc-admin").show();
	
	// We show the room name
	$("#muc-admin .muc-admin-head-jid").text(jid);
	
	// We query the room to edit
	queryMucAdmin(jid, 'options');
	
	// We get the affiliated user's privileges
	queryMucAdmin(jid, 'member');
	queryMucAdmin(jid, 'owner');
	queryMucAdmin(jid, 'admin');
	queryMucAdmin(jid, 'outcast');
}

function sendMucAdminTopic(jid) {
	// We get the new topic
	var topic = $('.muc-admin-topic textarea').val();
	
	// We send the new topic if not blank
	if(topic) {
		var m = new JSJaCMessage();
		m.setID(genID());
		m.setTo(jid);
		m.setType('groupchat');
		m.setSubject(topic);
		con.send(m);
	}
}

function sendMucAdminIQ(jid, rights, form) {
	// We set the iq headers
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setTo(jid);
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
		var types = ['member', 'owner', 'admin', 'outcast'];
		
		for(var i=0; i<=3; i++) {
			// We get the current type
			var tType = types[i];
			
			// We loop for all the elements
			$('.muc-admin-aut .aut-' + tType + ' input').each(function() {
				// We get the needed values
				var value = $(this).val();
				
				// If there's a value
				if(value)
					var item = iqQuery.appendChild(iq.buildNode('item', {'jid': value, 'xmlns': xmlns}));
				
				// It the user had removed the jid
				if($(this).hasClass('aut-dustbin') && value)
					item.setAttribute('affiliation', 'none');
				
				// If the value is not blank and okay
				else if(value)
					item.setAttribute('affiliation', tType);
			});
		}
	}
	
	// We send the iq !
	con.send(iq);
}

function handleDestroyMucAdminIQ(iq) {
	if (!iq || iq.getType() != 'result')
		handleError(iq.getNode());
	
	else {
		// We close the groupchat
		var room = $("#muc-admin .muc-admin-head-jid").text();
		var hash = hex_md5(room);
		quitThisChat(room, hash, 'groupchat');
		
		// We close the muc admin popup
		quitMucAdmin();
		
		// We tell the user that all is okay
		openThisInfo(6);
	}
	
	// We hide the wait icon
	$("#muc-admin .wait").hide();
}

function destroyMucAdminIQ(jid) {
	// We ask the server to delete the room
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setTo(jid);
	iq.setType('set');
	var iqQuery = iq.setQuery(NS_MUC_OWNER);
	iqQuery.appendChild(iq.buildNode('destroy', {'xmlns': NS_MUC_OWNER}));
	con.send(iq, handleDestroyMucAdminIQ);
}

function destroyMucAdmin() {
	// We get the jid of the current room
	var jid = $("#muc-admin .muc-admin-head-jid").text();
	
	// We show the wait icon
	$("#muc-admin .wait").show();
	
	// We send the iq
	destroyMucAdminIQ(jid);
}

function sendMucAdmin() {
	// We get the jid of the current room
	var jid = $("#muc-admin .muc-admin-head-jid").text();
	
	// We change the room topic
	sendMucAdminTopic(jid);
	
	// We send the needed queries
	sendMucAdminIQ(jid, 'owner', 'form');
	sendMucAdminIQ(jid, 'admin', 'aut');
}

function quitMucAdmin() {
	$("#muc-admin").hide();
	
	// We reset the current values
	resetMucAdmin();
}

function saveMucAdmin() {
	// We send the new options
	sendMucAdmin();
	
	// And we quit the popup
	quitMucAdmin();
}

function cancelMucAdmin() {
	quitMucAdmin();
}
