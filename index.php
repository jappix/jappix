<?php

/*

Jappix - The instant messaging. Reinvented.
This is the Jappix PHP application launcher

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

Licence : AGPL
Author : Valérian Saliou
Contact : mailing-list[at]jappix[dot]com
Last revision : 13/04/10

*/

// WE GET THE CONFIGURATION
require_once('./conf/main.php');
require_once('./conf/hosts.php');

// WE GET THE FUNCTIONS FILE
include('./php/functions.php');

// WE INCLUDE THE GOOD LANGUAGE FILE
$language = checkLanguage();
include('./lang/'.$language.'.php');

// WE GET THE APPLICATION FILE
$browser = checkBrowser();
if($browser)
	include('./php/app.php');
else
	include('./php/browser-error.php');

?>
