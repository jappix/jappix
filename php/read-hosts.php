<?php

/*

Jappix - An open social platform
This is the hosts configuration reader

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 27/10/10

*/

// Get the protocol we use
if($_SERVER['HTTPS'])
	$protocol = 'https';
else
	$protocol = 'http';

// Read the hosts configuration file
$hosts_data = readXML('conf', 'hosts');

// Define the default hosts configuration values
$hosts_default = array();
$hosts_default['main'] = 'jappix.com';
$hosts_default['muc'] = 'muc.jappix.com';
$hosts_default['vjud'] = 'vjud.jappix.com';
$hosts_default['anonymous'] = 'anonymous.jappix.com';
$hosts_default['bosh'] = 'http://bind.jappix.com/';
$hosts_default['static'] = '.';

// Define the user hosts configuration values
$hosts_conf = array();

// Read the hosts configuration file
if($hosts_data) {
	// Initialize the hosts configuration XML data
	$hosts_xml = new SimpleXMLElement($hosts_data);
	
	// Loop the hosts configuration elements
	foreach($hosts_xml->children() as $hosts_child)
		$hosts_conf[$hosts_child->getName()] = $hosts_child;
}

// Checks no value is missing in the user hosts configuration
foreach($hosts_default as $hosts_name => $hosts_value) {
	// Checks current item exists
	if(!isset($hosts_conf[$hosts_name]) || empty($hosts_conf[$hosts_name]))
		$hosts_conf[$hosts_name] = $hosts_default[$hosts_name];
	
	// Replace the {PROTOCOL} element (if any)
	$hosts_conf[$hosts_name] = str_replace('{PROTOCOL}', $protocol, $hosts_conf[$hosts_name]);
}

// Finally, define the hosts configuration globals
define('HOST_MAIN', $hosts_conf['main']);
define('HOST_MUC', $hosts_conf['muc']);
define('HOST_VJUD', $hosts_conf['vjud']);
define('HOST_ANONYMOUS', $hosts_conf['anonymous']);
define('HOST_BOSH', $hosts_conf['bosh']);
define('HOST_STATIC', $hosts_conf['static']);

?>
