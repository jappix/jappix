<?php

/*

Jappix - An open social platform
This is the Jappix PHP application launcher

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 27/10/10

*/

// Get the function files
require_once('./php/functions.php');

// Get the configuration
define('PHP_BASE', '.');
require_once('./php/read-main.php');
require_once('./php/read-hosts.php');

// Get some extra-libs
require_once('./php/gettext.php');
require_once('./php/mobile-detect.php');
$mobile = new Mobile_Detect();

// Optimize the page rendering
hideErrors();
gzipThis();

// Include the good language file
$locale = checkLanguage();
includeTranslation($locale, 'main', '.');

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
}

// Not forced, any cookie stored?
else if(isset($_COOKIE['jappix_mode'])) {
	if($_COOKIE['jappix_mode'] == 'mobile')
		$include_app = 'mobile';
}

// No cookie, is this a mobile app?
else if($mobile -> isMobile())
	$include_app = 'mobile';

// Include it!
include('./php/'.$include_app.'.php');

// Save this visit (for the stats)
if(($include_app == 'desktop') || ($include_app == 'mobile'))
	writeVisit();

?>
