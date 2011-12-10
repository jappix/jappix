<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix PHP application launcher

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 10/07/10

*/

// WE GET THE CONFIGURATION
require_once('./conf/main.php');
require_once('./conf/hosts.php');

// WE GET THE FUNCTION FILES
require_once('./php/functions.php');
require_once('./php/gettext.php');
require_once('./php/mobile-detect.php');
$mobile = new Mobile_Detect();

// WE OPTIMIZE THE PAGE RENDERING
if(!isDeveloper()) {
	hideErrors();
	gzipThis();
	
	$expires = 60*60*24*14;
	header('Pragma: public');
	header('Cache-Control: maxage='.$expires);
	header('Expires: '.gmdate('D, d M Y H:i:s', time()+$expires).' GMT');
}

// WE INCLUDE THE GOOD LANGUAGE FILE
$locale = checkLanguage();
T_setlocale(LC_MESSAGES, $locale);
$domain = 'main';
T_bindtextdomain($domain, './lang');
T_bind_textdomain_codeset($domain, 'UTF-8');
T_textdomain($domain);

// WE GENERATE SOME VARIABLES
$version = getVersion('./VERSION');
$hash = genHash($version);

// WE GET THE APPLICATION FILE
$force_mode = $_GET['m'];

// Get the good application file, depending on what the detector returns and the cookies
if(isset($force_mode))
	setcookie('jappix_mode', $force_mode, (time() + 31536000));

// Include the mobile application file if requested
if((($mobile -> isMobile() && $force_mode != 'desktop') || $force_mode == 'mobile'))
	include('./php/mobile.php');

// Else if a cookie exists and no mode was forced, try to read the cookie
else if(isset($_COOKIE['jappix_mode']) && !isset($force_mode)) {
	$check_cookie = $_COOKIE['jappix_mode'];
	
	// Mobile cookie submitted?
	if($check_cookie == 'mobile')
		include('./php/mobile.php');
	else
		include('./php/app.php');
}

// No cookie? Not mobile? Include the full application file
else
	include('./php/app.php');

?>
