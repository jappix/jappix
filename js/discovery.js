/*

Jappix - An Open μSocial Platform
These are the discovery JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

$(document).ready(function() {
	// We activate the form
	$("#discovery .disco-server-input").keyup(function(e) {
		if(e.keyCode == 13)
			launchDiscovery();
	});
});

function launchDiscovery() {
	/* REF: http://xmpp.org/extensions/xep-0030.html */
	
	// We get the server to query
	var discoServer = $("#discovery .disco-server-input").val();
	
	// We launch the items query
	dataForm(discoServer, 'browse');
}

function dataForm(host, type, node, action) {
	// We clean the discovery window
	cleanDiscovery();
	
	// We tell the user that a search has been launched
	$("#discovery .wait").show();
	
	// If we have enough data
	if(host && type) {
		// Generate a session ID
		var sID = 'disco-' + genID();
		$('.discovery-results').attr('class', 'results discovery-results ' + sID);
		
		// We request the service the form
		var iq = new JSJaCIQ();
		iq.setID(sID);
		iq.setTo(host);
		iq.setType('get');
		
		// We create the appropriate XML nodes
		if(type == 'browse') {
			var iqQuery = iq.setQuery(NS_DISCO_ITEMS);
			
			if(node)
				iqQuery.setAttribute('node', node);
			
			con.send(iq, handleDataFormBrowse);
		}
		
		if(type == 'command') {
			var items;
			
			if(node)
				items = iq.appendNode('command', {'node': node, 'xmlns': NS_COMMANDS});
			
			else {
				items = iq.setQuery(NS_DISCO_ITEMS);
				items.setAttribute('node', NS_COMMANDS);
			}
			
			if(action && node) {
				iq.setType('set');
				items.setAttribute('action', action);
			}
			
			con.send(iq, handleDataFormCommand);
		}
		
		if(type == 'search') {
			iq.setQuery(NS_SEARCH);
			con.send(iq, handleDataFormSearch);
		}
		
		if(type == 'subscribe') {
			iq.setQuery(NS_REGISTER);
			con.send(iq, handleDataFormSubscribe);
		}
		
		if(type == 'join') {
			quitDiscovery();
			checkChatCreate(host, 'groupchat');
		}
	}
}

function sendDataForm(type, action, id, jid, node, sessionid, status) {
	// New IS
	var iq = new JSJaCIQ();
	iq.setTo(jid);
	iq.setType('set');
	
	// Set the correct query
	var query;
	
	if(type == 'subscribe')
		iqQuery = iq.setQuery(NS_REGISTER);
	else if(type == 'search')
		iqQuery = iq.setQuery(NS_SEARCH);
	else if(type == 'command')
		iqQuery = iq.appendNode('command', {'xmlns': NS_COMMANDS, 'node': node, 'sessionid': sessionid, 'status': status, 'action': action});
	
	// Build the XML document
	if(action != 'cancel') {
		// No X node
		if(exists('input.register-special') && type == 'subscribe') {
			$('input.register-special').each(function() {
				var iName = $(this).attr('name');
				var iValue = $(this).val();
				
				iqQuery.appendChild(iq.buildNode(iName, {'xmlns': NS_REGISTER}, iValue));
			});
		}
		
		// Can create the X node
		else {
			var iqX = iqQuery.appendChild(iq.buildNode('x', {'xmlns': NS_XDATA, 'type': action}));
			
			// Each input
			$('.' + id + ' .oneresult input, .' + id + ' .oneresult textarea, .' + id + ' .oneresult select').each(function() {
				// Get the current input value
				var iVar = $(this).attr('name');
				var iType = $(this).attr('dftype');
				var iValue = $(this).val();
			
				// Build a new XML node
				var field = iqX.appendChild(iq.buildNode('field', {'var': iVar, 'type': iType, 'xmlns': NS_XDATA}));
				field.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, iValue));
			});
		}
	}
	
	// Clean the discovery window
	cleanDiscovery();
	
	// Change the ID of the current discovered item
	var iqID = 'disco-' + genID();
	$('.discovery-results').attr('class', 'results discovery-results ' + iqID);
	iq.setID(iqID);
	
	// Send the IQ
	if(type == 'subscribe')
		con.send(iq, handleDataFormSubscribe);
	else if(type == 'search')
		con.send(iq, handleDataFormSearch);
	else if(type == 'command')
		con.send(iq, handleDataFormCommand);
}

function buttonsDataForm(type, action, id, jid, node, sessionid, status) {
	// We generate the buttons code
	var buttonsCode = '<div class="oneresult discovery-oneresult discovery-formtools">';
	
	if(action == 'submit')
		buttonsCode += '<a class="submit" onclick="sendDataForm(\'' + type + '\', \'submit\', \'' + id + '\', \'' + jid + '\', \'' + node + '\', \'' + sessionid + '\', \'' + status + '\');">' + _e(58) + '</a>';
	
	if(action == 'submit' && type != 'subscribe')
		buttonsCode += '<a class="submit" onclick="sendDataForm(\'' + type + '\', \'cancel\', \'' + id + '\', \'' + jid + '\', \'' + node + '\', \'' + sessionid + '\', \'' + status + '\');">' + _e(59) + '</a>';
	
	if(action == 'back' || type == 'subscribe')
		buttonsCode += '<a class="back" onclick="openDiscovery();">' + _e(67) + '</a>';
	
	buttonsCode += '</div>';
	
	// We display the buttons code
	$('.discovery-results').append(buttonsCode);
}

function handleDataFormBrowse(iq) {
	handleError(iq);
	handleDataFormContent(iq, 'browse');
}

function handleDataFormCommand(iq) {
	handleError(iq);
	handleDataFormContent(iq, 'command');
}

function handleDataFormSubscribe(iq) {
	handleError(iq);
	handleDataFormContent(iq, 'subscribe');
}

function handleDataFormSearch(iq) {
	handleError(iq);
	handleDataFormContent(iq, 'search');
}

function handleDataFormContent(iq, type) {
	// Get the ID
	var sID = iq.getID();
	var from = iq.getFrom();
	var noResult = $("#discovery ." + sID + " .discovery-noresults");
	
	// If an error occured
	if (!iq || iq.getType() != 'result')
		noResult.show();
	
	// If we got something okay
	else {
		var handleXML = iq.getNode();
		
		if(type == 'browse') {
			if($(handleXML).find('item').attr('jid')) {
				$(handleXML).find('item').each(function() {
					// We parse the received xml
					var itemHost = $(this).attr('jid');
					var itemNode = $(this).attr('node');
					var itemName = $(this).attr('name');
					var itemHash = hex_md5(itemHost);
					
					// Special node
					if(itemNode)
						$('#discovery .' + sID).append(
							'<div class="oneresult discovery-oneresult" onclick="dataForm(\'' + itemHost + '\', \'browse\', \'' + itemNode + '\');">' + 
								'<div class="one-name">' + itemNode.htmlEnc() + '</div>' + 
							'</div>'
						);
					
					// Special item
					else if(itemName)
						$('#discovery .' + sID).append(
							'<div class="oneresult discovery-oneresult">' + 
								'<div class="one-name">' + itemName.htmlEnc() + '</div>' + 
							'</div>'
						);
					
					// Classical item
					else {
						// We display the waiting element
						$('#discovery .' + sID + ' .disco-wait .disco-category-title').after(
							'<div class="oneresult discovery-oneresult ' + itemHash + '">' + 
								'<div class="one-icon">☉</div>' + 
								'<div class="one-host">' + itemHost + '</div>' + 
								'<div class="one-type">' + _e(43) + '</div>' + 
							'</div>'
						);
						
						// We display the category
						$('#discovery .disco-wait').show();
					
						// We ask the server what's the service type
						getDataFormType(itemHost, itemNode, sID);
					}
				});
			}
			
			// Else, there are no items for this query
			else
				noResult.show();
		}
		
		else if(type == 'search' || type == 'subscribe' || (type == 'command' && $(handleXML).find('command').attr('xmlns'))) {
			// Get some values
			var xCommand = $(handleXML).find('command');
			var bNode = xCommand.attr('node');
			var bSession = xCommand.attr('sessionid');
			var bStatus = xCommand.attr('status');
			var xRegister = $(handleXML).find('query[xmlns=' + NS_REGISTER + ']').text();
			var xElement = $(handleXML).find('x');
			
			// Search done
			if(xElement.attr('type') == 'result' && type == 'search') {
				// Display the result
				$(handleXML).find('item').each(function() {
					var bJID = $(this).find('field[var=jid] value').text();
					var bName = $(this).find('field[var=fn] value').text();
					
					if(!bName)
						bName = '';
					
					$('#discovery .' + sID).append(
						'<div class="oneresult discovery-oneresult" onclick="quitDiscovery(); checkChatCreate(\'' + bJID + '\', \'chat\');">' + 
							'<div class="one-jid">' + bJID + '</div>' + 
							'<div class="one-fn">' + bName + '</div>' + 
						'</div>'
					);
				});
				
				// Previous button
				buttonsDataForm(type, 'back', sID, from, bNode, bSession, bStatus);
			}
			
			// Command to complete
			else if(xElement.attr('xmlns') || (type == 'subscribe' && xRegister)) {
				// We display the elements
				fillDataForm(handleXML, sID);
				
				// We display the buttons
				if(bStatus != 'completed')
					buttonsDataForm(type, 'submit', sID, from, bNode, bSession, bStatus);
				else
					buttonsDataForm(type, 'back', sID, from, bNode, bSession, bStatus);
			}
			
			// Command completed or subscription done
			else if((bStatus == 'completed' && type == 'command') || (!xRegister && type == 'subscribe')) {
				// Tell the user all was okay
				$('.' + sID).append('<div class="oneinstructions discovery-oneresult">' + _e(86) + '</div>');
				
				buttonsDataForm(type, 'back', sID, from);
				
				// Add the gateway to our roster if subscribed
				if(type == 'subscribe')
					addThisContact(from);
			}
			
			// Command canceled
			else if(bStatus == 'canceled' && type == 'command')
				openDiscovery();
			
			// Else, there are no items for this query
			else
				noResult.show();
			
			// Hide the wait icon
			$("#discovery .wait").hide();
		}
		
		else if(type == 'command') {
			if($(handleXML).find('item').attr('jid')) {
				// We display the elements
				$(handleXML).find('item').each(function() {
					// We parse the received xml
					var itemHost = $(this).attr('jid');
					var itemNode = $(this).attr('node');
					var itemName = $(this).attr('name');
					var itemHash = hex_md5(itemHost);
					
					// We display the waiting element
					$('#discovery .' + sID).prepend(
						'<div class="oneresult discovery-oneresult ' + itemHash + '" onclick="dataForm(\'' + itemHost + '\', \'command\', \'' + itemNode + '\', \'execute\');">' + 
							'<div class="one-name">' + itemName + '</div>' + 
							'<div class="one-next">»</div>' + 
						'</div>'
					);
				});
			}
			
			// Else, there are no items for this query
			else
				noResult.show();
		}
	}
	
	// Hide the wait icon
	$("#discovery .wait").hide();
}

function appendDataForm(selector, id, label, type) {
	selector.find(type).each(function() {
		$('.' + id).append(
			'<div class="oneresult discovery-oneresult">' + 
				'<div class="one-label"><label class="removable">' + label + '</label></div>' + 
				'<div class="one-input">' + 
					'<input name="' + type + '" type="text" class="register-special dataform-i removable" />' + 
				'</div>' + 
			'</div>'
		);
	});
}

function fillDataForm(xml, id) {
	/* REF: http://xmpp.org/extensions/xep-0004.html */
	
	var selector = $(xml);
	
	// Form title
	selector.find('title').each(function() {
		$('.' + id).append(
			'<div class="onetitle discovery-oneresult">' + $(this).text() + '</div>'
		);
	});
	
	// Form instructions
	selector.find('instructions').each(function() {
		$('.' + id).append(
			'<div class="oneinstructions discovery-oneresult">' + $(this).text() + '</div>'
		);
	});
	
	// Form username
	appendDataForm(selector, id, _e(63), 'username');
	
	// Form password
	appendDataForm(selector, id, _e(62), 'password');
	
	// Form email
	appendDataForm(selector, id, _e(88), 'email');
	
	// Form fields
	selector.find('field').each(function() {
		// We parse the received xml
		var type = $(this).attr('type');
		var label = $(this).attr('label');
		var field = $(this).attr('var');
		var value = $(this).find('value:first').text();
		
		// Compatibility fix
		if(!label)
			label = field;
		
		if(!type)
			type = '';
		
		// Generate some values
		var input;
		var hideThis = '';
		
		// Fixed field
		if(type == 'fixed')
			$('.' + id).append(
				'<div class="oneinstructions">' + value.htmlEnc() + '</div>'
			);
		
		else {
			// Hidden field
			if(type == 'hidden')
				hideThis = ' style="display: none;"';
			
			// Boolean checkbox field
			else if(type == 'boolean') {
				var checked;
				
				if(value == '1')
					checked = 'checked';
				else
					checked = '';
				
				input = '<input name="' + field + '" type="checkbox" dftype="' + type + '" class="dataform-i df-checkbox removable" ' + checked + ' />';
			}
			
			// List-multi checkboxes field
			else if(type == 'list-multi') {
				$(this).find('option').each(function() {
					var nLabel = $(this).attr('label');
					var nValue = $(this).find('value').text();
					
					if(nValue == '1')
						nChecked = 'checked';
					else
						nChecked = '';
					
					input += '<input name="' + field + '" type="checkbox" dftype="' + type + '" class="dataform-i df-checkbox removable" ' + nChecked + ' />';
				});
			}
			
			// We check if the value comes from a radio input
			else if(type == 'list-single') {
				input = '<select name="' + field + '" dftype="' + type + '" class="dataform-i removable">';
				var selected;
				
				$(this).find('option').each(function() {
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
			
			// Text-multi field
			else if(type == 'text-multi')
				input = '<textarea rows="8" cols="60" dftype="' + type + '" name="' + field + '" type="' + iType + '" class="dataform-i removable">' + value + '</textarea>';
			
			// Other stuffs that are similar
			else {
				// We change the type of the input
				if(type == 'text-private')
					iType = 'password';
				else
					iType = 'text';
				
				input = '<input name="' + field + '" dftype="' + type + '" type="' + iType + '" class="dataform-i removable" value="' + value + '" />';
			}
			
			// Append the HTML markup for this field
			$('.' + id).append(
				'<div class="oneresult discovery-oneresult"' + hideThis + '>' + 
					'<div class="one-label"><label class="removable">' + label + '</label></div>' + 
					'<div class="one-input">' + input + '</div>' + 
				'</div>'
			);
		}
	});
}

function getDataFormType(host, node, id) {
	var iq = new JSJaCIQ();
	iq.setID(genID() + '_' + id);
	iq.setTo(host);
	iq.setType('get');
	var iqQuery = iq.setQuery(NS_DISCO_INFO);
	if(node)
		iqQuery.setAttribute('node', node);
	
	con.send(iq, handleThisBrowse);
}

function handleThisBrowse(iq) {
	/* REF: http://xmpp.org/registrar/disco-categories.html */
	
	var id = iq.getID().split('_')[1];
	var from = iq.getFrom();
	var hash = hex_md5(from);
	var handleXML = iq.getQuery();
	
	// We first remove the waiting element
	$("#discovery ." + id + " .disco-wait ." + hash).remove();
	
	if($(handleXML).find('identity').attr('type')) {
		var category = $(handleXML).find('identity').attr('category');
		var type = $(handleXML).find('identity').attr('type');
		var named = $(handleXML).find('identity').attr('name');
		
		if(named)
			gName = named;
		else
			gName = '';
		
		var icon, one, two, three, four, five;
		
		// Get the features that this entity supports
		var findFeature = $(handleXML).find('feature');
		
		for(var i = 0; i < findFeature.length; i++) {
			var current = findFeature.eq(i).attr('var');
			
			switch(current) {
				case NS_DISCO_ITEMS:
					one = 1;
					break;
				
				case NS_COMMANDS:
					two = 1;
					break;
				
				case NS_REGISTER:
					three = 1;
					break;
				
				case NS_MUC:
					four = 1;
					break;
				
				case NS_SEARCH:
					five = 1;
					break;
				
				default:
					break;
			}
		}
		
		var buttons = Array(one, two, three, four, five);
		
		// We define the toolbox links depending on the supported features
		var tools = '';
		var aTools = Array('browse', 'command', 'subscribe', 'join', 'search');
		var bTools = Array(79, 80, 81, 82, 83);
		var cTools = Array('⌘', '⚒', '✎', '➲', '⚲');
		
		for(var i=0; i<buttons.length; i++)
			if(buttons[i])
				tools += '<a onclick="dataForm(\'' + from + '\', \'' + aTools[i] + '\');" title="' + _e(bTools[i]) + '">' + cTools[i] + '</a>';
		
		// As defined in the ref, we detect the type of each category to put an icon
		switch(category) {
			case 'account':
				icon = '⚖';
				break;
			case 'auth':
				icon = '⚗';
				break;
			case 'automation':
				icon = '⚡';
				break;
			case 'client':
				icon = '☘';
				break;
			case 'collaboration':
				icon = '☻';
				break;
			case 'component':
				icon = '☌';
				break;
			case 'conference':
				icon = '⚑';
				break;
			case 'directory':
				icon = '☎';
				break;
			case 'gateway':
				icon = '⚙';
				break;
			case 'headline':
				icon = '☀';
				break;
			case 'hierarchy':
				icon = '☛';
				break;
			case 'proxy':
				icon = '☔';
				break;
			case 'pubsub':
				icon = '♞';
				break;
			case 'server':
				icon = '⛂';
				break;
			case 'store':
				icon = '⛃';
				break;
			default:
				icon = '★';
				category = 'others';
				break;
		}
		
		// We display the item that we found
		$("#discovery ." + id + " .disco-" + category + " .disco-category-title").after(
			'<div class="oneresult discovery-oneresult ' + hash + '">' + 
				'<div class="one-icon">' + icon + '</div>' + 
				'<div class="one-host">' + from + '</div>' + 
				'<div class="one-type">' + gName + '</div>' + 
				'<div class="one-actions">' + tools + '</div>' + 
			'</div>'
		);
		
		// We display the category
		$("#discovery ." + id + " .disco-" + category).show();
	}
	
	else {
		$("#discovery ." + id + " .disco-others .disco-category-title").after(
			'<div class="oneresult discovery-oneresult">' + 
				'<div class="one-icon">☓</div>' + 
				'<div class="one-host">' + from + '</div>' + 
				'<div class="one-type">' + _e(44) + '</div>' + 
			'</div>'
		);
		
		// We display the category
		$("#discovery ." + id + " .disco-others").show();
	}
	
	// We hide the waiting stuffs if there's no remaining loading items
	if(!$("#discovery ." + id + " .disco-wait .discovery-oneresult").length)
		$("#discovery ." + id + " .disco-wait, #discovery .wait").hide();
}

function cleanDiscovery() {
	// We remove the results
	$("#discovery .discovery-oneresult, .oneinstructions, .onetitle").remove();
	
	// We clean the user info
	$("#discovery .disco-server-info").text('');
	
	// We hide the wait icon, the no result alert and the results
	$("#discovery .wait, #discovery .discovery-noresults, #discovery .disco-category").hide();
}

function resetDiscovery() {
	// We clean the results
	cleanDiscovery();
	
	// We set the old server value
	$("#discovery .disco-server-input").val(getHost('main'));
}

function openDiscovery() {
	// We reset the dicovery
	resetDiscovery();
	
	// We show the needed elements
	$("#discovery").show();
	
	// We request a disco to the default server
	launchDiscovery();
}

function quitDiscovery() {
	$("#discovery").hide();
	
	resetDiscovery();
}
