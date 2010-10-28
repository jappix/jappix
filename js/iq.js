/*

Jappix - An Open μSocial Platform
These are the IQ JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function handleIQ(iq) {
	// Define some variables
	var iqContent = iq.getDoc();
	var iqFrom = iq.getFrom();
	var iqID = iq.getID();
	var iqQueryXMLNS = iq.getQueryXMLNS();
	var iqQuery = iq.getQuery();
	var iqType = iq.getType();
	var iqTo = getJID() + '/' + con.resource;
	
	// If this is a software version query
	if(iqQueryXMLNS == NS_VERSION && iqType == 'get') {
		/* REF: http://xmpp.org/extensions/xep-0092.html */
		
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setFrom(iqTo);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		var iqQuery = iqResponse.setQuery(NS_VERSION);
		iqQuery.appendChild(iq.buildNode('name', {'xmlns': NS_VERSION}, 'Jappix'));
		iqQuery.appendChild(iq.buildNode('version', {'xmlns': NS_VERSION}, getSystem('version')));
		iqQuery.appendChild(iq.buildNode('os', {'xmlns': NS_VERSION}, osDetect() + ' (' + navigator.appCodeName + ')'));
		
		con.send(iqResponse);
	}
	
	// If this is a last activity query
	if(iqQueryXMLNS == NS_LAST && iqType == 'get') {
		/* REF: http://xmpp.org/extensions/xep-0012.html */
		
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setFrom(iqTo);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		var iqQuery = iqResponse.setQuery(NS_LAST);
		iqQuery.setAttribute('seconds', getLastActivity());
		
		con.send(iqResponse);
	}
	
	// If this is a roster query
	else if(iqQueryXMLNS == NS_ROSTER && iqType == 'set') {
		// REF : http://xmpp.org/extensions/xep-0092.html
		
		//Roster push
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		con.send(iqResponse);
		
		// Get the values
		var selector = $(iqQuery).find('item');
		var jid = selector.attr('jid');
		var subscription = selector.attr('subscription');
		var nick = selector.attr('name');
		var group = selector.find('group:first').text();
		var hash = hex_md5(jid);
		
		// No nick
		if(!nick) {
			if(jid.indexOf('@') != -1)
				nick = nick.split('@')[0];
			else
				nick = jid;
		}
		
		// Display the roster
		displayRoster(jid, hash, nick, subscription, group, 'presence');
	}
	
	// If this is an info query
	else if(iqQueryXMLNS == NS_DISCO_INFO && iqType == 'get') {
		/* REF: http://xmpp.org/extensions/xep-0030.html */
		
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setFrom(iqTo);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		var iqQuery = iqResponse.setQuery(NS_DISCO_INFO);
		
		// We set the name of the client
		iqQuery.appendChild(iq.buildNode('identity', {
			'category': 'client',
			'type': 'web',
			'name': 'Jappix',
			'xmlns': NS_DISCO_INFO
		}));
		
		// We set all the supported features
		var fArray = getDiscoInfos();
		
		for(var i = 0; i < fArray.length; i++)
			iqQuery.appendChild(iq.buildNode('feature', {'var': fArray[i], 'xmlns': NS_DISCO_INFO}));
		
		con.send(iqResponse);
	}
	
	// If this is a user time query
	else if($(iqContent).find('time').attr('xmlns') == NS_URN_TIME && iqType == 'get') {
		/* REF: http://xmpp.org/extensions/xep-0202.html */
		
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setFrom(iqTo);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		var iqTime = iqResponse.appendNode('time', {'xmlns': NS_URN_TIME});
		iqTime.appendChild(iq.buildNode('tzo', {'xmlns': NS_URN_TIME}, '-00:00'));
		iqTime.appendChild(iq.buildNode('utc', {'xmlns': NS_URN_TIME}, getXMPPTime()));
		
		con.send(iqResponse);
	}
	
	// If this is a ping
	else if($(iqContent).find('ping').attr('xmlns') == NS_URN_PING && iqType == 'get') {
		/* REF: http://xmpp.org/extensions/xep-0199.html */
		
		var iqResponse = new JSJaCIQ();
		iqResponse.setID(iqID);
		iqResponse.setFrom(iqTo);
		iqResponse.setTo(iqFrom);
		iqResponse.setType('result');
		
		con.send(iqResponse);
	}
}
