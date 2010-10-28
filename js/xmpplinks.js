/*

Jappix - An open social platform
These are the XMPP links handling JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/08/10

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

// Gets the current URL HTTP GET vars (like ?x=user@domain)
function getVar(name) {
	get_string = document.location.search;         
	return_value = '';
	
	do {
		name_index = get_string.indexOf(name + '=');
		
		if(name_index != -1) {
			get_string = get_string.substr(name_index + name.length + 1, get_string.length - name_index);
			
			end_of_value = get_string.indexOf('&');
			if(end_of_value != -1)                
				value = get_string.substr(0, end_of_value);                
			else                
				value = get_string;                
			
			if(return_value == '' || value == '')
				return_value += value;
			else
				return_value += ', ' + value;
		}
	}
	
	while(name_index != -1)
		space = return_value.indexOf('+');
	
	while(space != -1) { 
		return_value = return_value.substr(0, space) + ' ' + 
		return_value.substr(space + 1, return_value.length);
		
		space = return_value.indexOf('+');
	}
	
	return(return_value);        
}
