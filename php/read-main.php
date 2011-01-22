<?php

/*

Jappix - An open social platform
This is the main configuration reader

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 22/01/11

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

// Define the default main configuration values
$main_conf = array(
	     	'name'		=> 'Jappix',
	     	'desc'		=> 'a free social network',
	     	'resource'	=> 'Jappix',
	     	'lock'		=> 'off',
	     	'xdomainrequest'=> 'on',
	     	'anonymous'	=> 'on',
	     	'registration'	=> 'on',
	     	'encryption'	=> 'on',
	     	'https_storage'	=> 'off',
	     	'https_force'	=> 'off',
	     	'compression'	=> 'on',
	     	'multi_files'	=> 'off',
	     	'developer'	=> 'off'
	     );

// Define a default values array
$main_default = $main_conf;

// Read the main configuration file
$main_data = readXML('conf', 'main');

// Read the main configuration file
if($main_data) {
	// Initialize the main configuration XML data
	$main_xml = new SimpleXMLElement($main_data);
	
	// Loop the main configuration elements
	foreach($main_xml->children() as $main_child) {
		$main_value = $main_child->getName();
		
		// Only push this to the array if it exists
		if(isset($main_conf[$main_value]) && $main_child)
			$main_conf[$main_value] = $main_child;
	}
}

// Finally, define the main configuration globals
define('SERVICE_NAME', $main_conf['name']);
define('SERVICE_DESC', $main_conf['desc']);
define('JAPPIX_RESOURCE', $main_conf['resource']);
define('LOCK_HOST', $main_conf['lock']);
define('XDOMAINREQUEST', $main_conf['xdomainrequest']);
define('ANONYMOUS', $main_conf['anonymous']);
define('REGISTRATION', $main_conf['registration']);
define('ENCRYPTION', $main_conf['encryption']);
define('HTTPS_STORAGE', $main_conf['https_storage']);
define('HTTPS_FORCE', $main_conf['https_force']);
define('COMPRESSION', $main_conf['compression']);
define('MULTI_FILES', $main_conf['multi_files']);
define('DEVELOPER', $main_conf['developer']);

?>
