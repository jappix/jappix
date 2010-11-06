<?php

/*

Jappix - An open social platform
This is the hosts configuration reader

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

// Get the protocol we use
if(isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on'))
	$protocol = 'https';
else
	$protocol = 'http';

// Define the default hosts configuration values
$hosts_conf = array(
	      	'main'		=> 'jappix.com',
	      	'muc'		=> 'muc.jappix.com',
	      	'vjud'		=> 'vjud.jappix.com',
	      	'anonymous'	=> 'anonymous.jappix.com',
	      	'bosh'		=> 'http://bind.jappix.com/',
	      	'static'	=> '.'
	      );

// Define a default values array
$hosts_default = $hosts_conf;

// Read the hosts configuration file
$hosts_data = readXML('conf', 'hosts');

// Read the hosts configuration file
if($hosts_data) {
	// Initialize the hosts configuration XML data
	$hosts_xml = new SimpleXMLElement($hosts_data);
	
	// Loop the hosts configuration elements
	foreach($hosts_xml->children() as $hosts_child) {
		$hosts_value = $hosts_child->getName();
		
		// Only push this to the array if it exists
		if(isset($hosts_conf[$hosts_value]) && $hosts_child)
			$hosts_conf[$hosts_value] = str_replace('{PROTOCOL}', $protocol, $hosts_child);
	}
}

// Finally, define the hosts configuration globals
define('HOST_MAIN', $hosts_conf['main']);
define('HOST_MUC', $hosts_conf['muc']);
define('HOST_VJUD', $hosts_conf['vjud']);
define('HOST_ANONYMOUS', $hosts_conf['anonymous']);
define('HOST_BOSH', $hosts_conf['bosh']);
define('HOST_STATIC', $hosts_conf['static']);

?>
