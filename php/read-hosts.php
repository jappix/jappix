<?php

/*

Jappix - An open social platform
This is the hosts configuration reader

-------------------------------------------------

License: AGPL
Author: Vanaryon
Last revision: 29/05/11

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

// Get the protocol we use
if(isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on'))
	$protocol = 'https';
else
	$protocol = 'http';

// Get the HTTP host
$http_host = 'jappix.com';

if($_SERVER['HTTP_HOST']) {
	$http_host_split = str_replace('www.', '', $_SERVER['HTTP_HOST']);
	$http_host_split = preg_replace('/:[0-9]+$/i', '', $http_host_split);
	
	if($http_host_split)
		$http_host = $http_host_split;
}

// Define the default hosts configuration values
$hosts_conf = array(
	      	'main'		=> $http_host,
	      	'muc'		=> 'muc.'.$http_host,
	      	'pubsub'	=> 'pubsub.'.$http_host,
	      	'vjud'		=> 'vjud.'.$http_host,
	      	'anonymous'	=> 'anonymous.'.$http_host,
	      	'bosh'		=> 'http://'.$http_host.':5280/http-bind',
	      	'bosh_main'	=> '',
	      	'bosh_mini'	=> '',
	      	'static'	=> '',
	      	'upload'	=> ''
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
define('HOST_PUBSUB', $hosts_conf['pubsub']);
define('HOST_VJUD', $hosts_conf['vjud']);
define('HOST_ANONYMOUS', $hosts_conf['anonymous']);
define('HOST_BOSH', $hosts_conf['bosh']);
define('HOST_BOSH_MAIN', $hosts_conf['bosh_main']);
define('HOST_BOSH_MINI', $hosts_conf['bosh_mini']);
define('HOST_STATIC', $hosts_conf['static']);
define('HOST_UPLOAD', $hosts_conf['upload']);

?>
