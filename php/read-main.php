<?php

/*

Jappix - An open social platform
This is the main configuration reader

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 27/10/10

*/

// Read the main configuration file
$main_data = readXML('conf', 'main');

// Define the default main configuration values
$main_default = array();
$main_default['name'] = 'Jappix';
$main_default['desc'] = 'a free social network';
$main_default['resource'] = 'Jappix';
$main_default['lock'] = 'off';
$main_default['anonymous'] = 'on';
$main_default['https_storage'] = 'off';
$main_default['encryption'] = 'on';
$main_default['compression'] = 'on';
$main_default['developer'] = 'off';

// Define the user main configuration values
$main_conf = array();

// Read the main configuration file
if($main_data) {
	// Initialize the main configuration XML data
	$main_xml = new SimpleXMLElement($main_data);
	
	// Loop the main configuration elements
	foreach($main_xml->children() as $main_child)
		$main_conf[$main_child->getName()] = $main_child;
}

// Checks no value is missing in the user main configuration
foreach($main_default as $main_name => $main_value) {
	// Checks current item exists
	if(!isset($main_conf[$main_name]) || empty($main_conf[$main_name]))
		$main_conf[$main_name] = $main_default[$main_name];
}

// Finally, define the main configuration globals
define('SERVICE_NAME', $main_conf['name']);
define('SERVICE_DESC', $main_conf['desc']);
define('JAPPIX_RESOURCE', $main_conf['resource']);
define('LOCK_HOST', $main_conf['lock']);
define('ANONYMOUS', $main_conf['anonymous']);
define('HTTPS_STORAGE', $main_conf['https_storage']);
define('ENCRYPTION', $main_conf['encryption']);
define('COMPRESSION', $main_conf['compression']);
define('DEVELOPER', $main_conf['developer']);

?>
