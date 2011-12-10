<?php

/*

Jappix - An Open μSocial Platform
This is the main configuration file of Jappix

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 14/07/10

*/

	// SERVICE NAME
	define('SERVICE_NAME', 'Jappix');
	
	// SERVICE DESCRIPTION
	define('SERVICE_DESC', 'a free distributed social network');
	
	// JAPPIX RESOURCE
	define('JAPPIX_RESOURCE', 'Jappix');
	
	// BINDING HTTP-BASE (generally : bosh/http-bind/bind)
	define('HTTP_BASE', 'bind');
	
	// SECURED HTTP CONNECTIONS WITH SSL (on/off)
	define('SSL', 'off');
	
	// LOCK TO THE DEFINED HOST (on/off)
	define('LOCK_HOST', 'off');
	
	// ALL PAGES COMPRESSED WITH GZIP (on/off)
	define('GZIP', 'on');
	
	// ANONYMOUS MUC CONNECTIONS ALLOWED (on/off)
	define('ANONYMOUS_ENABLED', 'off');
	
	// DISABLE THE CACHING WITH THE DEVELOPER MODE (on/off)
	define('DEVELOPER_MODE', 'off');

?>
