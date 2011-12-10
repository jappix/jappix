/*

Jappix - An Open μSocial Platform
These are the storage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function getStorage(type) {
	/* REF: http://xmpp.org/extensions/xep-0049.html */
	
	var iq = new JSJaCIQ();
	iq.setID(genID());
	iq.setType('get');
	var iqQuery = iq.setQuery(NS_PRIVATE);
	iqQuery.appendChild(iq.buildNode('storage', {'xmlns': type}));
	con.send(iq, handleStorage);
}

// We got it ! Now it's time to parse this XML sheet
function handleStorage(iq) {
	var handleXML = iq.getQuery();
	var handleFrom = iq.getFrom();
	
	// Define some vars
	var options = $(handleXML).find('storage[xmlns=' + NS_OPTIONS + ']');
	var messages = $(handleXML).find('storage[xmlns=' + NS_MESSAGES + ']');
	var bookmarks = $(handleXML).find('storage[xmlns=' + NS_BOOKMARKS + ']');
	var rosternotes = $(handleXML).find('storage[xmlns=' + NS_ROSTERNOTES + ']');
	var microblog_configure = getPersistent('microblog-configure', handleFrom);
	
	// No options and node not yet configured
	if(options.length && !options.text() && !microblog_configure) {
		// Put an indicator
		setPersistent('microblog-configure', handleFrom, true);
		
		// Setup our microblog
		setupMicroblog();
	}
	
	// Parse the options xml
	options.each(function() {
		$(this).find('option').each(function() {
			// We retrieve the informations
			var type = $(this).attr('type');
			var value = $(this).text();
			
			// We display the storage
			displayOptions(type, value);
		});
		
		// Special things for microblog options
		var persist = $(this).find('option[type=persistent]').text();
		var maxnotices = $(this).find('option[type=maxnotices]').text();
		
		if(persist == 0)
			persist = 0;
		else
			persist = 1;
		
		if(!maxnotices)
			maxnotices = 10000;
	});
	
	// Parse the messages xml
	messages.each(function() {
		$(this).find('message').each(function() {
			// We retrieve the informations
			var from = $(this).attr('from');
			var subject = $(this).attr('subject');
			var content = $(this).text();
			var status = $(this).attr('status');
			var id = $(this).attr('id');
			var date = $(this).find('date');
			
			// We display the message
			displayMessage(from, subject, content, status, id, 'old', date)
		});
	});
	
	// Parse the bookmarks xml
	bookmarks.each(function() {
		$(this).find('conference').each(function() {
			// We retrieve the informations
			var jid = $(this).attr('jid');
			var gcName = $(this).attr('name');
			var nick = $(this).find('nick').text();
			var hash = hex_md5(jid);
			
			// We display the storage
			displayFavorites(jid, gcName, nick, hash);
		});
	});
	
	// Parse the roster notes xml
	rosternotes.each(function() {
		$(this).find('note').each(function() {
			// We retrieve the informations
			var jid = $(this).attr('jid');
			var value = $(this).text();
			
			// We display the storage
			setDB('rosternotes', jid, value);
		});
	});
}
