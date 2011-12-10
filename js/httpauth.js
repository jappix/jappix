/*

Jappix - An Open μSocial Platform
These are the http-auth JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function requestReply(value, xml) {
	// We parse the xml content
	var from = xml.getFrom();
	var confirm = $(xml.getNode()).find('confirm');
	var xmlns = confirm.attr('xmlns');
	var id = confirm.attr('id');
	var method = confirm.attr('method');
	var url = confirm.attr('url');
	
	// We generate the reply message
	var aMsg = new JSJaCMessage();
	aMsg.setID(genID());
	aMsg.setTo(from);
	aMsg.setFrom(getJID());
	
	// If "no"
	if(value == 'no') {
		aMsg.setType('error');
		aMsg.appendNode('error', {'code': '401', 'type': 'auth'});
	}
	
	// We set the confirm node
	aMsg.appendNode('confirm', {'xmlns': xmlns, 'url': url, 'id': id, 'method': method});
	
	// We send the message
	con.send(aMsg, handleErrorReply);
}
