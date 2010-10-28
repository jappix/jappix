/*

Jappix - An open social platform
These are the storage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 18/09/10

*/

// Gets the storage items of the user
function getStorage(type) {
	/* REF: http://xmpp.org/extensions/xep-0049.html */
	
	var iq = new JSJaCIQ();
	iq.setType('get');
	
	var iqQuery = iq.setQuery(NS_PRIVATE);
	iqQuery.appendChild(iq.buildNode('storage', {'xmlns': type}));
	
	con.send(iq, handleStorage);
}

// Handles the storage items
function handleStorage(iq) {
	var handleXML = iq.getQuery();
	var handleFrom = getStanzaFrom(iq);
	
	// Define some vars
	var options = $(handleXML).find('storage[xmlns=' + NS_OPTIONS + ']');
	var messages = $(handleXML).find('storage[xmlns=' + NS_MESSAGES + ']');
	var bookmarks = $(handleXML).find('storage[xmlns=' + NS_BOOKMARKS + ']');
	var rosternotes = $(handleXML).find('storage[xmlns=' + NS_ROSTERNOTES + ']');
	
	// No options and node not yet configured
	if(options.size() && !options.find('option').size())
		openWelcome();
	
	// Parse the options xml
	options.find('option').each(function() {
		// We retrieve the informations
		var type = $(this).attr('type');
		var value = $(this).text();
		
		// We display the storage
		setDB('options', type, value);
		
		// If this is the buddy list show status
		if((type == 'roster-showall') && (value == '1'))
			showAllBuddies();
	});
	
	// Parse the messages xml
	messages.find('message').each(function() {
		// We retrieve the informations
		var from = $(this).attr('from');
		var subject = $(this).attr('subject');
		var content = $(this).text();
		var status = $(this).attr('status');
		var id = $(this).attr('id');
		var date = $(this).attr('date');
		
		// We display the message
		displayInboxMessage(from, subject, content, status, id, 'old', date)
	});
	
	// Parse the bookmarks xml
	bookmarks.find('conference').each(function() {
		// We retrieve the informations
		var xid = $(this).attr('jid');
		var name = $(this).attr('name');
		var autojoin = $(this).attr('autojoin');
		var password = $(this).find('password').text();
		var nick = $(this).find('nick').text();
		var hash = hex_md5(xid);
		
		// We display the storage
		displayFavorites(xid, name, nick, hash, autojoin, password);
		
		// Join the chat if autojoin is enabled
		if(autojoin == '1')
			checkChatCreate(xid, 'groupchat', nick, password, name);
	});
	
	// Parse the roster notes xml
	rosternotes.find('note').each(function() {
		// We retrieve the informations
		var xid = $(this).attr('jid');
		var value = $(this).text();
		
		// We display the storage
		setDB('rosternotes', xid, value);
	});
	
	// Options received
	if(options.size()) {
		logThis('Options received.');
		
		$('.options-hidable').show();
	}
	
	// Messages received
	else if(messages.size()) {
		logThis('Messages received.');
		
		$('.messages-hidable').show();
	}
	
	// Bookmarks received (for logger)
	else if(bookmarks.size())
		logThis('Bookmarks received.');
	
	// Roster notes received (for logger)
	else if(rosternotes.size())
		logThis('Roster notes received.');
}
