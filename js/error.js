/*

Jappix - An Open μSocial Platform
These are the error JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function handleErrorReply(packet) {
	// Just to handle the errors
	var node = packet.getNode();
	handleError(node);
}

function handleError(packet) {
	/* REF: http://xmpp.org/extensions/xep-0086.html */
	
	// Initialize
	var type, code, reason, condition, dCode;
	var node = $(packet);
	
	// Second level error node
	if(node.find('error').attr('code')) {
		type = node.attr('type');
		dCode = node.attr('code');
		code = node.find('error').attr('code');
		reason = node.find('error text').text();
		condition = packet.getElementsByTagName('error').item(0).childNodes.item(0).nodeName.replace(/-/g, ' ');
	}
	
	// First level error node
	else if(node.attr('code')) {
		type = 'error';
		code = node.attr('code');
		
		// Specific error reason
		switch(code) {
			case '401':
				reason = _e(74);
				break;
			
			case '409':
				reason = _e(75);
				break;
			
			case '503':
				reason = _e(76);
				break;
			
			case '500':
				reason = _e(77);
				break;
			
			default:
				reason = node.find('text').text();
				break;
		}
	}
	
	// If this is an error packet
	if(type == 'error' && !dCode) {
		// If we got enough info to display the error
		if(reason || code) {
			// We define the elements we work with
			var ePath = '#error .error-3 .';
			var eCode = ePath + 'code';
			var eUCode = ePath + 'urcode';
			var eReason = ePath + 'reason';
			var eUReason = ePath + 'ureason';
			var eCondition = ePath + 'condition';
			
			// We reset the error panel
			$(eCode + ', ' + eReason).text('');
			$(eUCode + ', ' + eUReason).hide();
			
			// We display the error elements
			if(code)
				$(eCode).text(code);
			else
				$(eUCode).show();
			if(reason)
				$(eReason).text(reason);
			else
				$(eUReason).show();
			if(condition)
				$(eCondition).text('(' + condition + ')');
			else
				$(eCondition).hide();
			
			// We reveal the error
			openThisError(3);
		}
		
		// If we do not have any code
		else  {
			quit();
			openThisError(1);
		}
		
		return true;
	}
	
	// If this is a failure packet
	else if(dCode) {
		quit();
		openThisError(1);
		
		return true;
	}
	
	// There's no error
	else
		return false;
}
