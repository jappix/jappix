<?php

/*

Jappix - The instant messaging. Reinvented.
These are the functions to checks things for Jappix

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

Licence : AGPL
Author : Vanaryon
Contact : mailing-list[at]jappix[dot]com
Last revision : 13/04/10

*/

function checkLanguage() {
	// We get the language of the browser
	$nav_lang = explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE']);
	$nav_lang = strtolower(substr(chop($nav_lang[0]),0,2));
	$lang_file = './lang/'.$nav_lang.'.php';

	// We include the good language file if it's available
	if (file_exists($lang_file)) {
		$lang = $nav_lang;
	}

	// If Jappix doen't know that language, we include the english translation
	else {
		$lang = 'en';
	}
	
	return $lang;
}

function checkBrowser() {
	// We get the user agent
	$brw_ua = strtolower($_SERVER['HTTP_USER_AGENT']);
	
	// We detect if the browser is not supported
	if(preg_match('/msie/', $brw_ua))
		$brw = false; // Internet Explorer (KO)
	else
		$brw = true; // Another browser (OK)
	
	return $brw;
}

?>
