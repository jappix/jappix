/*

Jappix - An Open μSocial Platform
These are the messages JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function messageNotify(hash, type) {
	// If this is not the anonymous mode
	if(!isAnonymous()) {
		// We tell the user with a sound
		if(type != 'unread')
			soundPlay(3);
	
		// We notify the user if he has not the focus on the chat
		var tested = '#chat-switch .channels .' + hash;
		if (!$(tested).hasClass('activechan') || !document.hasFocus()) {
			if(type == 'personnal') {
				$(tested).addClass('chan-newmessage');
				pageTitle('new');
			}
		
			else
				$(tested).addClass('chan-unread');
		}
	}
}

function chanCleanNotify(hash) {
	if(!isAnonymous()) {
		// We remove the class that tell the user of a new message
		$('#chat-switch .' + hash).removeClass('chan-newmessage chan-unread');
		
		// We set the classical title if no more unread messages
		if($('.chan-newmessage').length == 0)
			pageTitle('talk');
	}
}

function handleMessage(aJSJaCPacket) {
	// We get the message items
	var messageFromJID = aJSJaCPacket.getFromJID();
	var messageType = aJSJaCPacket.getType();
	var messageBody = aJSJaCPacket.getBody();
	var messageNode = aJSJaCPacket.getNode();
	var messageSubject = aJSJaCPacket.getSubject();
	var messageTime = getCompleteTime();
	
	if(!handleError(messageNode)) {
		// For the groupchats
		var messageFromXHashable = '' + messageFromJID + '';
		var messageFromXSplitted = messageFromXHashable.split("/");
		var messageFromRoom = messageFromXSplitted[0];
		var messageFromNick = messageFromXSplitted[1];
		var fromMUCHash = hex_md5(messageFromRoom);
		var messageStamp = $(messageNode).find('x').attr('stamp');
		var xHTML = $(messageNode).find('html body').length;
		
		// We remove the ressource of the user
		var messageFromJIDNoRessource = cutResource(messageFromXHashable);
		
		// We generate the hash
		var messageFromJIDHashable = '' + messageFromJIDNoRessource + '';
		var fromJIDHash = hex_md5(messageFromJIDHashable);
		var noHashfriendJID = messageFromJIDNoRessource;
		
		// Chatstate message
		if(messageNode && !$(messageNode).find('error').attr('code')) {
			/* REF: http://xmpp.org/extensions/xep-0085.html */
			
			if($(messageNode).find('active').attr('xmlns')) {
				$('#' + fromJIDHash + ' .message-area').addClass('chatstates');
				displayChatState('active', fromJIDHash);
			}
			
			else if($(messageNode).find('composing').attr('xmlns') != undefined)
				displayChatState('composing', fromJIDHash);
			else if($(messageNode).find('paused').attr('xmlns') != undefined)
				displayChatState('paused', fromJIDHash);
			else if($(messageNode).find('inactive').attr('xmlns') != undefined)
				displayChatState('inactive', fromJIDHash);
			else if($(messageNode).find('gone').attr('xmlns') != undefined)
				displayChatState('gone', fromJIDHash);
		}
		
		// If this is a room topic message
		if(messageSubject) {
			var filteredSubject = filterThisMessage(messageSubject, messageFromNick);
			
			$("#" + fromMUCHash + " .top .name .bc-infos .muc-topic").replaceWith('<span class="muc-topic" title="' + messageSubject.htmlEnc() + '">' + filteredSubject + '</span>');
		}
		
		// If the has a content
		if(xHTML || messageBody) {
			var filteredMessage, notXHTML;
			
			// If this is a XHTML message
			if(xHTML) {
				notXHTML = false;
				$(messageNode).find('a').attr('target', '_blank');
				filteredMessage = $(messageNode).find('html body').html();
			}
			
			// Else, it's a PLAIN message
			else
				notXHTML = true;
			
			if(messageType == 'chat') {
				// Gets the nickname of the user
				var splittingJID = noHashfriendJID + '';
				var messageFromName = getBuddyName(splittingJID);
				
				if(notXHTML)
					filteredMessage = filterThisMessage(messageBody, messageFromName);
				
				// If the chat isn't yet opened, open it !
				if(!exists('#' + fromJIDHash)) {
					// We create a new chat
					chatCreate(fromJIDHash, noHashfriendJID, messageFromName);
					
					// We tell the user that a new chat has started
					soundPlay(2);
				}
				
				// Display the received message
				$("#" + fromJIDHash + " .content " + ".thisFalseDivIsForJQuery").before('<p class="one-line user-message"><em>(' + messageTime + ') </em><b class="him">' + messageFromName + ' : </b> ' + filteredMessage + '</p>');
				
				// We notify the user
				messageNotify(fromJIDHash, 'personnal');
				
				// Scroll to the last message
				autoScroll(fromJIDHash);
			}
			
			else if(messageType == 'groupchat') {
				/* REF: http://xmpp.org/extensions/xep-0045.html */
				
				// We get the message time
				if(messageStamp != undefined) {
					var messageT = messageStamp.split("T");
					messageT = messageT[1];
					var messageType = 'old-message';
				}
				
				else {
					var messageT = messageTime;
					var messageType = 'user-message';
				}
				
				var nickQuote = '';
				var myNick = getNick();
				
				// If an user quoted our nick (with some checks)
				var regex = new RegExp(myNick, 'gi');
				if(messageBody.match(regex) && myNick != messageFromNick && messageType == 'user-message' && !isAnonymous())
					nickQuote = ' my-nick';
				
				// We notify the user if there's a new personnal message
				if(nickQuote)
					messageNotify(fromJIDHash, 'personnal');
				
				// We notify the user there's a new unread muc message
					messageNotify(fromJIDHash, 'unread');
				
				// Generate the colout of the nickname
				var color = generateColour(messageFromNick);
				
				// Filter the message
				if(notXHTML)
					filteredMessage = filterThisMessage(messageBody, messageFromNick);
				
				function displayMUCMessage(type) {
					// Display the received message in the room
					$("#" + fromMUCHash + " .content " + ".thisFalseDivIsForJQuery").before('<p class="one-line ' + type + nickQuote + '"><em>(' + messageT + ') </em><b style="color: ' + color + ';">' + messageFromNick + ' : </b> ' + filteredMessage + '</p>');
					
					// Scroll to the last message
					autoScroll(fromMUCHash);
				}
				
				if(messageFromNick == undefined) {
					messageFromNick = 'server';
					displayMUCMessage('system-message');
				}
				
				else
					displayMUCMessage(messageType);
			}
		}
		
		// If this is an invite message
		if(aJSJaCPacket.getChild('x', NS_MUC_USER)) {
			// We get the needed values
			var iFrom = $(messageNode).find('x invite').attr('from');
			var iRoom = $(messageNode).find('x[xmlns=' + NS_XCONFERENCE + ']').attr('jid');
			
			// Old invite method?
			if(!iRoom)
				iRoom = messageFromJID;
			
			// We display the notification
			newNotification('invite/room', iFrom, iRoom, messageBody);
		}
		
		// If this is a request message
		else if(aJSJaCPacket.getChild('confirm', NS_HTTP_AUTH))
			newNotification('request', messageFromJIDHashable, aJSJaCPacket, messageBody);
		
		// Normal messages
		else if(messageType == 'normal' && messageBody) {
			var messageSubject = aJSJaCPacket.getSubject();
			var dateOfTheMessage = getCompleteTime();
			var messageID = hex_md5(messageFromJIDNoRessource + messageSubject + dateOfTheMessage);
			var messageDate = getXMPPTime();
			
			// We display the received message
			displayMessage(messageFromJIDNoRessource, messageSubject, messageBody, 'unread', messageID, 'fresh', messageDate);
		}
		
		// Headline messages
		if(messageType == 'headline' || $(messageNode).find('event').attr('xmlns') == NS_PUBSUB_EVENT) {
			// We get the needed values
			var iParse = $(messageNode).find('event items');
			var iNode = iParse.attr('node');
			
			// Turn around the different result cases
			if(iNode) {
				if(iNode == NS_MOOD) {
					// Retrieve the values
					var iMood = iParse.find('mood');
					var fValue = messageNode.getElementsByTagName('mood').item(0).childNodes.item(0).nodeName;
					var tText = iMood.find('text').text().htmlEnc();
					
					// Store the PEP event (and display it)
					storePEP(noHashfriendJID, 'mood', fValue, tText);
				}
				
				else if(iNode == NS_ACTIVITY) {
					// Retrieve the values
					var iActivity = iParse.find('activity');
					var fValue = messageNode.getElementsByTagName('activity').item(0).childNodes.item(0).nodeName;
					var sValue = messageNode.getElementsByTagName(fValue).item(0).childNodes.item(0).nodeName;
					
					if(sValue)
						fValue = fValue + '/' + sValue;
					
					var tText = iActivity.find('text').text().htmlEnc();
					
					// Store the PEP event (and display it)
					storePEP(noHashfriendJID, 'activity', fValue, tText);
				}
				
				else if(iNode == NS_TUNE) {
					// Retrieve the values
					var iTune = iParse.find('tune');
					var tArtist = iTune.find('artist').text().htmlEnc();
					var tSource = iTune.find('source').text().htmlEnc();
					var tTitle = iTune.find('title').text().htmlEnc();
					
					// Store the PEP event (and display it)
					storePEP(noHashfriendJID, 'tune', tArtist, tTitle, tSource);
				}
				
				else if(iNode == NS_GEOLOC) {
					// Retrieve the values
					var iGeoloc = iParse.find('geoloc');
					var tLat = iGeoloc.find('lat').text().htmlEnc();
					var tLon = iGeoloc.find('lon').text().htmlEnc();
					
					// Store the PEP event (and display it)
					storePEP(noHashfriendJID, 'geoloc', tLat, tLon);
				}
				
				else if(iNode == NS_URN_MBLOG)
					displayMicroblog(aJSJaCPacket, noHashfriendJID, fromJIDHash, 'mixed');
			}
		}
	}
}

function sendMessage(aForm, type) {
	// If the user didn't entered any message, stop
	if (!aForm.msg.value || !aForm.sendTo.value)
		return false;
	
	try {
		// We send the message through the XMPP network
		var aMsg = new JSJaCMessage();
		var body = aForm.msg.value;
		var jid = aForm.sendTo.value;
		aMsg.setID(genID());
		aMsg.setTo(jid);
		
		// Chat message type
		if(type == 'chat') {
			aMsg.setType('chat');
			aMsg.setBody(body);
			aMsg.appendNode('active', {'xmlns': NS_CHATSTATES});
			con.send(aMsg, handleErrorReply);
			
			// We play a send sound
			soundPlay(4);
		}
		
		// Groupchat message type
		else if(type == 'groupchat') {
			// /say shortcut
			if (body.match(/^\/say (.+)/)) {
				body = body.replace(/^\/say (.+)/, '$1');
				aMsg.setType('groupchat');
				aMsg.setBody(body);
				con.send(aMsg, handleErrorReply);
			}
			
			// /clear shortcut
			else if (body.match(/^\/clear/)) {
				var hash = hex_md5(jid);
				cleanChat(hash);
			}
			
			// /nick shortcut
			else if (body.match(/^\/nick (.+)/)) {
				var nick = body.replace(/^\/nick (.+)/, '$1');
				var aPresence = new JSJaCPresence();
				aPresence.setID(genID());
				aPresence.setTo(jid + '/' + nick);
				con.send(aPresence, handleErrorReply);
			}
			
			// /topic shortcut
			else if (body.match(/^\/topic (.+)/)) {
				var topic = body.replace(/^\/topic (.+)/, '$1');
				aMsg.setType('groupchat');
				aMsg.setSubject(topic);
				con.send(aMsg, handleErrorReply);
			}
			
			// /ban shortcut
			else if (body.match(/^\/ban (\S+)\s*(.*)/)) {
				var nick = RegExp.$1;
				var reason = RegExp.$2;
				var hash = hex_md5(jid);
				var nJid = $('#' + hash + ' .userJid-' + nick).val();
				
				// We check if the user to ban exists
				if (!nJid)
					openThisInfo(7);
				
				else {
					// We generate the ban IQ
					var iq = new JSJaCIQ();
					iq.setID(genID());
					iq.setTo(jid);
					iq.setType('set');
					
					var iqQuery = iq.setQuery(NS_MUC_ADMIN);
					var item = iqQuery.appendChild(iq.buildNode('item', {'affiliation': 'outcast', 'jid': nJid, 'xmlns': NS_MUC_ADMIN}));
					
					if(reason)
						item.appendChild(iq.buildNode('reason', {'xmlns': NS_MUC_ADMIN}, reason));
					
					con.send(iq, handleErrorReply);
				}
			}
			
			// /kick shortcut
			else if (body.match(/^\/kick (\S+)\s*(.*)/)) {
				var nick = RegExp.$1;
				var reason = RegExp.$2;
				var hash = hex_md5(jid);
				var nJid = $('#' + hash + ' .userJid-' + nick).val();
				
				// We check if the user to kick exists
				if (nJid == undefined)
					openThisInfo(7);
				
				else {
					// We generate the kick IQ
					var iq = new JSJaCIQ();
					iq.setID(genID());
					iq.setTo(jid);
					iq.setType('set');
					
					var iqQuery = iq.setQuery(NS_MUC_ADMIN);
					var item = iqQuery.appendChild(iq.buildNode('item', {'nick': nick, 'role': 'none', 'xmlns': NS_MUC_ADMIN}));
					
					if(reason)
						item.appendChild(iq.buildNode('reason', {'xmlns': NS_MUC_ADMIN}, reason));
					
					con.send(iq, handleErrorReply);
				}
			}
			
			// /invite shortcut
			else if (body.match(/^\/invite (\S+)\s*(.*)/)) {
				var jid = RegExp.$1;
				var reason = RegExp.$2;
				
				var x = aMsg.appendNode('x', {'xmlns': NS_MUC_USER});
				var aNode = x.appendChild(aMsg.buildNode('invite', {'to': jid, 'xmlns': NS_MUC_USER}));
				
				if (reason)
					aNode.appendChild(aMsg.buildNode('reason', {'xmlns': NS_MUC_USER}, reason));
				
				con.send(aMsg, handleErrorReply);
			}
			
			// /join shortcut
			else if (body.match(/^\/join (\S+)\s*(.*)/)) {
				// Join
				var room = RegExp.$1;
				var pass = RegExp.$2;
				checkChatCreate(room, 'groupchat');
			}
			
			// /msg shortcut
			else if (body.match(/^\/msg (\S+)\s*(.*)/)) {
				var nick = RegExp.$1;
				var body = RegExp.$2;
				var hash = hex_md5(jid);
				var nJid = $('#' + hash + ' .userJid-' + nick).val();
				
				// We check if the user to kick exists
				if (!nJid)
					openThisInfo(7);
				
				// If the private message is not empty
				else if(body) {
					aMsg.setType('chat');
					aMsg.setTo(jid);
					aMsg.setBody(body);
					con.send(aMsg, handleErrorReply);
				}
			}
			
			// /part shortcut
			else if (body.match(/^\/part\s*(.*)/)) {
				var hash = hex_md5(jid);
				quitThisChat(jid, hash, 'groupchat');
			}
			
			// No shortcut, this is a message
			else {
				aMsg.setType('groupchat');
				aMsg.setBody(body);
				con.send(aMsg, handleMessage);
			}
		}
		
		// We define where to display it and some other stuffs
		var dateOfTheMessage = getCompleteTime();
		var writeOnDivHash = hex_md5("" + aForm.sendTo.value + "");
		var writeOnDiv = "#" + writeOnDivHash + " .content .thisFalseDivIsForJQuery";
		
		// We filter the sent message for the display
		var filteredMessage = filterThisMessage(aForm.msg.value, getNick());
		
		if(type != 'groupchat') {
			// Finally we display the message we juste sent
			$(writeOnDiv).before('<p class="one-line user-message"><em>(' + dateOfTheMessage + ') </em><b class="me">' + _e(37) + ' : </b> ' + filteredMessage + '</p>');
		}
		
		// Scroll to the last message
		autoScroll(writeOnDivHash);
		
		// We reset the message input
		aForm.msg.value = '';
		
		return false;
	}
	
	finally {
		return false;
	}
}
