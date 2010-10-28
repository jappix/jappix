/*

Jappix - An Open μSocial Platform
These are the roster JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// We first request the roster's XML
function getRoster() {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	iq.setQuery(NS_ROSTER);
	con.send(iq, handleRoster);
}

// We got it ! Now it's time to parse this XML sheet
function handleRoster(iq) {
	// We delete the loading icon
	$('.loading-roster').hide();
	
	// Define some variables
	var handleXML = iq.getQuery();
	var vcardItemExists = $(handleXML).find('item');
	var current, jid, dName, subscription, group, jidHash, getNick, nick;
	
	// Parse the vcard xml
	if(exists(vcardItemExists)) {
		vcardItemExists.each(function() {
			current = $(this);
			jid = current.attr('jid');
			dName = current.attr('name');
			subscription = current.attr('subscription');
			group = current.find('group:first').text();
			jidHash = hex_md5(jid);
			
			// If no name is defined, we get the default nick of the buddy
			if(!dName) {
				if(jid.indexOf('@') != -1)
					dName = jid.split('@')[0];
				else
					dName = jid;
			}
			
			displayRoster(jid, jidHash, dName, subscription, group, 'load');
		});
	}
	
	// Else, we tell the user that he has no buddy
	else
		$('.no-buddy').show();
	
	// We get our own avatar
	getAvatar(getJID(), 'force', 'forgot');
}

function updateGroups() {
	// Define the needed vars
	var group = '#buddy-list .one-group';
	var buddies = group + ' .buddy';
	var tGroup = $(group).length;
	var tBuddies = $(buddies).length;
	
	for(var i=0; i<tGroup; i++) {
		var current = $($(group).eq(i));
		var check = current.find('.buddy').length;
		var hidden = current.find('.buddy:not(.hidden-buddy)').length;
		
		// If the group is empty
		if(!check)
			current.remove();
		
		// If the group contains no online buddy
		if(!hidden)
			current.hide();
		else
			current.show();
	}
}

function displayRoster(dJID, dJIDHash, dName, dSubscription, dGroup, dMode) {
	// Define some things around the groups
	var gateway = '';
	
	if(isGateway(dJID)) {
		gateway = ' gateway';
		dGroup = _e(87);
	}
	
	else if(!dGroup)
		dGroup = _e(64);
	
	var groupHash = 'group' + hex_md5(dGroup);
	var groupContent = '#buddy-list .' + groupHash;
	var groupBuddies = groupContent + ' .group-buddies';
	
	// If the group hasn't yet been displayed
	if(dSubscription == 'remove')
		$('#buddy-list .' + dJIDHash).remove();
	
	else {
		if(!exists(groupContent)) {
			// Define some things
			var groupCont = '#buddy-list .inner';
			var groupToggle = groupCont + ' .' + groupHash + ' p.group';
			
			// Create the HTML markup of the group
			$('#buddy-list .inner').prepend(
				'<div class="' + groupHash + ' one-group removable">' + 
					'<p class="group"><span>-</span> ' + dGroup + '</p>' + 
					'<div class="group-buddies"></div>' + 
				'</div>'
			);
			
			// Not yet toggle-ed !
			if(!$(groupToggle).hasClass('toggled')) {
				// Create the click event which will hide and show the content
				$(groupToggle).toggle(function() {
					$(groupBuddies).hide();
					$(groupContent + ' span').text('+');
				}, function() {
					$(groupBuddies).show();
					$(groupContent + ' span').text('-');
				});
				
				// Set the toggle class
				$(groupToggle).addClass('toggled');
			}
		}
		
		// If the buddy hasn't yet been displayed
		if(!exists('#buddy-list .' + dJIDHash)) {
			// Security : we hide the no buddy alert
			$('.no-buddy').hide();
			
			// And we create the HTML markup of the roster ! :)
			$(groupBuddies).append(
				'<div class="hidden-buddy buddy ' + dJIDHash + gateway + '">' + 
					'<div class="buddy-click" onclick="checkChatCreate(\'' + dJID + '\', \'chat\');">' + 
						'<div class="avatar-container">' + 
							'<img class="avatar" src="./img/others/default-avatar.png" alt="" />' + 
						'</div>' + 
						
						'<div class="name">' + 
							'<p class="buddy-name">' + dName + '</p>' + 
							'<p class="buddy-presence talk-images unavailable">' + _e(19) + '</p>' + 
						'</div>' + 
					'</div>' + 
					
					'<div class="buddy-infos">' + 
						'<div class="buddy-infos-subarrow talk-images"></div>' + 
						'<div class="buddy-infos-subitem">' + 
							'<div class="pep-infos">' + 
								'<p class="bi-status talk-images status-unavailable">' + _e(12) + '</p>' + 
								'<p class="bi-mood talk-images mood-four">' + _e(12) + '</p>' + 
								'<p class="bi-activity talk-images activity-exercising">' + _e(12) + '</p>' + 
								'<p class="bi-tune talk-images tune-note">' + _e(12) + '</p>' + 
								'<p class="bi-geoloc talk-images location-world">' + _e(12) + '</p>' + 
								'<p class="bi-channel talk-images channel-individual"><a onclick="fromInfosMicroblog(\'' + dJID + '\', \'' + dJIDHash + '\');">' + _e(84) + '</a></p>' + 
							'</div>' + 
							
							'<div class="manage-infos">' + 
								'<p class="bm-authorize talk-images"><a onclick="addThisContact(\'' + dJID + '\');">' + _e(66) + '</a></p>' + 
								'<p class="bm-remove talk-images"><a onclick="removeSubscribe(\'' + dJID + '\');">' + _e(40) + '</a></p>' + 
								'<p class="bm-rename talk-images"><span>' + _e(41) + '</span> <input type="text" value="' + dName + '" /></p>' + 
								'<p class="bm-group talk-images"><span>' + _e(65) + '</span> <input type="text" value="' + dGroup + '" /></p>' + 
							'</div>' + 
						'</div>' + 
					'</div>' + 
				'</div>'
			);
			
			// Apply the name/group submit event
			applyBuddyInput(dJID, dJIDHash);
			
			// Apply the hover event
			applyBuddyHover(dJIDHash);
		}
		
		// If we are unauthorized to see the presence of this user
		else if(dSubscription == 'none') {
			var target = '#buddy-list .' + dJIDHash + ' .name .';
		
			$(target + 'unavailable').addClass('error').removeClass('unavailable');
			$(target + 'error').text(_e(35));
		}
		
		// We get the user presence if necessary
		if(dMode == 'presence')
			presenceFunnel(dJID, dJIDHash);
	}
}

function applyBuddyInput(jid, hash) {
	var path = '#buddy-list .' + hash + ' .';
	var rename = path + 'bm-rename input';
	var group = path + 'bm-group input';
	
	$(rename + ', ' + group).keyup(function(e) {
		if(e.keyCode == 13) {
			var vRename = $(rename).val();
			var vGroup = $(group).val();
			
			updateRosterItem(jid, hash, vRename, vGroup);
		}
	});
}

function applyBuddyHover(hash) {
	// Generate the values
	var bPath = '#buddy-list .' + hash;
	var iPath = bPath + ' .buddy-infos';
	
	// Apply the hover event
	$(bPath).hover(function() {
		$(bPath).addClass('mouse-hover');
		$(document).oneTime(500, function() {
			if($(bPath).hasClass('mouse-hover'))
				$(iPath).fadeIn('fast');
		});
	}, function() {
		$(iPath).hide();
		$(bPath).removeClass('mouse-hover');
	});
}

function isGateway(jid) {
	if(jid.indexOf('@') != -1)
		return false;
	
	return true;
}

function sendSubscribe(to, type) {
	var aPresence = new JSJaCPresence();
	aPresence.setID(genID());
	aPresence.setType(type);
	aPresence.setTo(to);
	
	if(type == 'subscribe')
		aPresence.setStatus(_e(42));
	
	con.send(aPresence);
}

function sendRoster(jid, subscription) {
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': jid}));
	
	if(subscription)
		item.setAttribute('subscription', subscription);
	
	con.send(iq);
}

function acceptSubscribe(to) {
	// We generate the values to be used
	var hash = hex_md5(to);
	var sNick = to.split('@')[0];
	
	// We remove the buddy from our roster
	$('#buddy-list .' + hash).remove();
	
	// We update our chat
	$('#' + hash + ' .tools-add').hide();
	
	// We send a subsribed presence (to confirm)
	sendSubscribe(to, 'subscribed');
	
	// We send a subscription request (subscribe both sides)
	sendSubscribe(to, 'subscribe');
	
	// We update our roster
	displayRoster(to, hash, sNick, 'both', '', 'presence');
}

function removeSubscribe(to) {
	// We generate the values to be used
	var hash = hex_md5(to);
	
	// We send a unsubsribe presence
	sendSubscribe(to, 'unsubscribe');
	
	// We remove the buddy from our roster
	sendRoster(to, 'remove');
	$('#buddy-list .' + hash).remove();
	
	// We update our groups
	updateGroups();
	
	// We check if the roster is yet full
	if(!exists('#buddy-list .buddy'))
		$('.no-buddy').show();
}

function handleUnsubscribe(from) {
	// We do the neccessary to remove the user
	removeSubscribe(from);
}

function addThisContact(jid) {
	// If the form is complete
	if(jid) {
		// We send the subscription
		sendSubscribe(jid, 'subscribe');
		sendRoster(jid);
		
		// We hide the bubble
		$("#buddy-conf-add").fadeOut('fast');
	}
	
	// If a value is missing
	else
		$(".add-contact-jid").addClass("please-complete").focus();
}

function buddyEdit() {
	// We show/hide certain elements
	$('#buddy-list .pep-infos, #buddy-list .foot-elements').hide();
	$('#buddy-list .manage-infos, #buddy-list .foot-edit-finish').show();
}

function buddyEditFinish() {
	// We show/hide certain elements
	$('#buddy-list .foot-edit-finish, #buddy-list .manage-infos').hide();
	$('#buddy-list .foot-elements, #buddy-list .pep-infos').show();
}

function updateRosterItem(jid, hash, rename, group) {
	// We change the buddy name in the buddy list
	$('#buddy-list .' + hash + ' .buddy-name').text(rename);
	
	// We delete the buddy to get it again
	$('#buddy-list .' + hash).remove();
	
	// We send the new buddy name
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('set');
	var iqQuery = iq.setQuery(NS_ROSTER);
	var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': jid}));
	
	if(rename)
		item.setAttribute('name', rename);
	
	if(group)
		item.appendChild(iq.buildNode('group', {'xmlns': NS_ROSTER}, group));
	
	con.send(iq);
	
	// Finish the buddy editing
	buddyEditFinish();
	
	// We update our groups
	updateGroups();
}

$(document).ready(function() {
	// Safer : we hide the others elements yet opened
	$("#buddy-list .foot .buddy-list-icon").click(function() {
		$(".buddy-conf-item").fadeOut();
	});
	
	// When the user click on the add button, show the contact adding tool
	$("#buddy-list .foot .add").click(function() {
		// We hide other opened bubbles
		$(".bubble").fadeOut('fast');
		
		// We show the requested div
		$("#buddy-conf-add").fadeIn('fast');
		
		// We reset the input and focus on it
		$(".add-contact-jid").val("").focus();
	});
	
	// When a key is pressed...
	$("#buddy-conf-add").keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13) {
		// Get the values
			var jid = generateJID($('.add-contact-jid').val(), 'chat');
			
			// Submit the form
			addThisContact(jid);
		}
		
		// Escape : quit
		if(e.keyCode == 27)
			$("#buddy-conf-add").fadeOut('fast');
	});
	
	// If the user click on the quit button
	$("#buddy-conf-add .buddy-conf-close").click(function() {
		$("#buddy-conf-add").fadeOut('fast');
	});
	
	// When the user click on the edit button, show the edit menu
	$("#buddy-list .foot .edit").click(buddyEdit);
	
	// When the user click on the join button, show the chat joining tool
	$("#buddy-list .foot .join").click(function() {
		// We hide other opened bubbles
		$(".bubble").fadeOut('fast');
		
		// We show the requested div
		$("#buddy-conf-join").fadeIn('fast');
		
		// We reset the input and focus on it
		$(".join-jid").val("").focus();
	});
	
	// When a key is pressed...
	$("#buddy-conf-join").keyup(function(e) {
		// Enter : continue
		if(e.keyCode == 13) {
			var jid = $(".join-jid").val();
			var type = $(".buddy-conf-join-select").val();
			
			if(jid && type) {
				// Update some things
				$(".join-jid").removeClass("please-complete");
				$("#buddy-conf-join").fadeOut('fast');
				
				// Generate a correct JID
				jid = generateJID(jid, type);
				
				// Create a new chat
				checkChatCreate(jid, type);
			}
			
			else
				$(".join-jid").addClass("please-complete");
		}
		
		// Escape : quit
		if(e.keyCode == 27)
			$("#buddy-conf-join").fadeOut('fast');
	});
	
	// If the user click on the quit button
	$("#buddy-conf-join .buddy-conf-close").click(function() {
		$("#buddy-conf-join").fadeOut('fast');
	});
	
	// When the user click on the groupchat button, show the groupchat menu
	$("#buddy-list .foot .groupchat").click(function() {
		// We hide other opened bubbles
		$(".bubble").fadeOut('fast');
		
		// We show the requested div
		$("#buddy-conf-groupchat").fadeIn('fast');
		
		// If the user click on the quit button
		$("#buddy-conf-groupchat .buddy-conf-close").click(function() {
			$("#buddy-conf-groupchat").fadeOut('fast');
		});
	});
	
	// When the user wants to edit his groupchat favorites
	$(".buddy-conf-groupchat-edit").click(function() {
		openFavorites();
		$("#buddy-conf-groupchat").fadeOut('fast');
	});
	
	// When the user click on the more button, show the more menu
	$("#buddy-list .foot .more").click(function() {
		// We hide other opened bubbles
		$(".bubble").fadeOut('fast');
		
		// We show the target bubble
		$("#buddy-conf-more").fadeIn('fast');
		
		$("#buddy-conf-more").keyup(function(e) {
			// Escape : quit
			if(e.keyCode == 27)
				$("#buddy-conf-more").fadeOut('fast');
		});
		
		// If the user click on the quit button
		$("#buddy-conf-more .buddy-conf-close").click(function() {
			$("#buddy-conf-more").fadeOut('fast');
		});
	});
	
	// When the user click on the involve button, show the involve menu
	$("#buddy-list .foot .involve").click(function() {
		// We hide other opened bubbles
		$(".bubble").fadeOut('fast');
		
		// We show the target bubble
		$("#buddy-conf-involve").fadeIn('fast');
		
		$("#buddy-conf-involve").keyup(function(e) {
			// Escape : quit
			if(e.keyCode == 27)
				$("#buddy-conf-involve").fadeOut('fast');
		});
		
		// If the user click on the quit button
		$("#buddy-conf-involve .buddy-conf-close").click(function() {
			$("#buddy-conf-involve").fadeOut('fast');
		});
	});
	
	// When the user wants to display all his buddies
	$(".buddy-conf-more-display-unavailable").click(function() {
		// We first add a "marker" to tell other functions this thing
		$('#buddy-list').addClass('show-all-buddies');
		
		// We switch the two modes
		$(".buddy-conf-more-display-unavailable").hide();
		$(".buddy-conf-more-display-available").show();
		$("#buddy-conf-more").fadeOut('fast');
		
		// We set a false class to the disconnected buddies
		$(".hidden-buddy").addClass("unavailable-buddy");
		$(".unavailable-buddy").removeClass("hidden-buddy");
		
		// We show all the groups
		$('#buddy-list .one-group').show();
	});
	
	// When the user wants to display only online buddies
	$(".buddy-conf-more-display-available").click(function() {
		// We first add a "marker" to tell other functions this thing
		$('#buddy-list').removeClass('show-all-buddies');
		
		// We switch the two modes
		$(".buddy-conf-more-display-available").hide();
		$(".buddy-conf-more-display-unavailable").show();
		$("#buddy-conf-more").fadeOut('fast');
		
		// We set a false class to the disconnected buddies
		$(".unavailable-buddy").addClass("hidden-buddy");
		$(".hidden-buddy").removeClass("unavailable-buddy");
		
		// We check the groups to hide
		updateGroups();
	});
	
	// When the user click on the user directory link
	$(".buddy-conf-more-user-directory").click(function() {
		openDirectory();
		$("#buddy-conf-more").fadeOut('fast');
	});
	
	// When the user click on the service discovery link
	$(".buddy-conf-more-service-disco").click(function() {
		openDiscovery();
		$("#buddy-conf-more").fadeOut('fast');
	});
});
