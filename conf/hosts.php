<?php

/*

Jappix - An Open μSocial Platform
This is the hosts configuration file of Jappix

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 14/07/10

*/

	// THE STATIC FILES HOST (same server: . or external one like http://static.jappix.com)
	define('HOST_STATIC', '.');
	
	// THE MAIN XMPP HOST (your XMPP server host, like jappix.com)
	define('HOST_MAIN', 'jappix.com');
	
	// THE MUC XMPP HOST (your MUC server host, like muc.jappix.com)
	define('HOST_MUC', 'muc.jappix.com');
	
	// THE ANONYMOUS XMPP HOST (enable it on your server and in main.php before)
	define('HOST_ANONYMOUS', 'anonymous.jappix.com');

?>
