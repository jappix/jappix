/*

Jappix - An open social platform
These are the XMPP links handling JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 23/11/10

*/

// Does an action with the provided XMPP link
function xmppLink(link) {
	/* REF: http://xmpp.org/registrar/querytypes.html */
	
	// Remove the "xmpp:" string
	link = link.replace(/^xmpp(:|%3A)(.+)/gi, '$2');
	
	// Unescape the encoded URL
	link = unescape(link);
	
	// The XMPP URI has no "?"
	if(link.indexOf('?') == -1)
		checkChatCreate(link, 'chat');
	
	// Parse the URI
	else {
		var xid = explodeThis('?', link, 0);
		var action = explodeThis('?', link, 1);
		
		switch(action) {
			case 'join':
				checkChatCreate(xid, 'groupchat');
				break;
			
			case 'vcard':
				openUserInfos(xid);
				break;
			
			case 'subscribe':
				addThisContact(xid);
				break;
			
			case 'unsubscribe':
				sendRoster(xid, 'remove');
				break;
			
			default:
				checkChatCreate(xid, 'chat');
				break;
		}
	}
}

// Gets the link parameters
var link_vars = (function() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	
	for(var i = 0; i < hashes.length; i++) {
		var hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = decodeURIComponent(hash[1]);
	}
	
	return vars;
})();
