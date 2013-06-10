/*

Jappix - An open social platform
These are the http-auth JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Kload
Last revision: 16/04/12

*/

// Does the user login
var CURRENT_SESSION = false;

// Login to a HTTP session
function doHttpLogin(lNick, lPass, lServer, lPriority) {
	try {
		
		// We add the login wait div
		showGeneralWait();
		
		// We define the http binding parameters
		oArgs = new Object();
		
		if(HOST_BOSH_MAIN)
			oArgs.httpbase = HOST_BOSH_MAIN;
		else
			oArgs.httpbase = HOST_BOSH;
		
		// Check BOSH origin
		BOSH_SAME_ORIGIN = isSameOrigin(oArgs.httpbase);
		
		// We create the new http-binding connection
		con = new JSJaCHttpBindingConnection(oArgs);
		
		// And we handle everything that happen
		setupCon(con);
		
		// Generate a resource
		var random_resource = getDB('session', 'resource');
		
		if(!random_resource)
			random_resource = JAPPIX_RESOURCE + ' (' + (new Date()).getTime() + ')';
		
		// Generate a priority
		lPriority = lPriority ? lPriority : 10;

		// We retrieve what the user typed in the login inputs
		oArgs = new Object();
		oArgs.domain = trim(lServer);
		oArgs.username = trim(lNick);
		oArgs.resource = random_resource;
		oArgs.pass = lPass;
		oArgs.secure = true;
		oArgs.xmllang = XML_LANG;
		
		// Store the resource (for reconnection)
		setDB('session', 'resource', random_resource);
		
		// Generate a session XML to be stored
		session_xml = '<session><stored>true</stored><domain>' + lServer.htmlEnc() + '</domain><username>' + lNick.htmlEnc() + '</username><resource>' + random_resource + '</resource><password>' + lPass.htmlEnc() + '</password><priority>' + (lPriority + '').htmlEnc() + '</priority></session>';
		
		// Save the session parameters (for reconnect if network issue)
		CURRENT_SESSION = session_xml;
		
		// We store the infos of the user into the data-base
		setDB('priority', 1, 10);
		
		// We connect !
		con.connect(oArgs);
		
		// Change the page title
		pageTitle('wait');
		
		logThis('Jappix is connecting...', 3);
	}
	
	catch(e) {
		// Logs errors
		logThis('Error while logging in: ' + e, 1);
		
		// Reset Jappix
		destroyTalkPage();
		
		// Open an unknown error
		openThisError(2);
	}
	
	finally {
		return false;
	}
}