<?php

/*

Jappix - An open social platform
This is the Jappix PHP application launcher

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 01/06/12

*/

// PHP base
define('JAPPIX_BASE', '.');

// Get the function files
require_once('./php/functions.php');

// Get the configuration
require_once('./php/read-main.php');
require_once('./php/read-hosts.php');

// Get some extra-libs
require_once('./php/gettext.php');

// Optimize the page rendering
hideErrors();
compressThis();

// Include the good language file
$locale = checkLanguage();
includeTranslation($locale, 'main');

// Get the Jappix version & its hash
$version = getVersion();
$hash = genHash($version);

// Include the good application file
$include_app = 'desktop';

// Not yet installed?
if(!isInstalled())
	$include_app = 'install';

// Anonymous?
else if(anonymousMode())
	$include_app = 'desktop';

// Not anonymous, any forced mode?
else if(isset($_GET['m']) && !empty($_GET['m'])) {
	$force_mode = $_GET['m'];
	
	// Switch between two Jappix apps
	if(($force_mode == 'desktop') || ($force_mode == 'mobile')) {
		// Write the cookie
		setcookie('jappix_mode', $force_mode, (time() + 31536000));
		
		// Define the app to include
		$include_app = $force_mode;
	}
	
	else if($force_mode == 'manager')
		$include_app = $force_mode;
	
	else if($force_mode == 'download')
		$include_app = $force_mode;
}

// Not forced, any cookie stored?
else if(isset($_COOKIE['jappix_mode'])) {
	if($_COOKIE['jappix_mode'] == 'mobile')
		$include_app = 'mobile';
}

// No cookie, is this a mobile device?
else {
	// New mobile detect
	require_once('./php/mobile-detect.php');
	$mobile = new Mobile_Detect();
	
	// Really mobile?
	if($mobile -> isMobile())
		$include_app = 'mobile';
}

// Special stuffs for Jappix apps
if(($include_app == 'desktop') || ($include_app == 'mobile')) {
	// Redirects the user to HTTPS if forced
	if(!useHttps() && httpsForce()) {
		// Apply some special headers
		header('Status: 301 Moved Permanently', true, 301);
		header('Location: https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
		
		// Kill the script!
		exit('HTTP/1.1 301 Moved Permanently');
	}
	
	// Is it a static node?
	if(isStatic())
		$include_app = 'static';
	
	// Is it an upload node?
	if(isUpload())
		$include_app = 'upload';
	
	// Save this visit (for the stats)
	if(hasStatistics())
		writeVisit();
}

// Include it!
include('./php/'.$include_app.'.php');

?>
