<?php

/*

Jappix - An open social platform
This is the hosts configuration reader

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

// Get the protocol we use
if(isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on')) {
    $protocol = 'https';
} else {
    $protocol = 'http';
}

// Get the HTTP host
$default_host = 'jappix.com';
$http_host = $default_host;

if($_SERVER['HTTP_HOST']) {
    $http_host_split = str_replace('www.', '', $_SERVER['HTTP_HOST']);
    $http_host_split = preg_replace('/:[0-9]+$/i', '', $http_host_split);

    if($http_host_split) {
        $http_host = $http_host_split;
    }
}

// Define the default hosts configuration values
$hosts_conf = array(
    'main'            => $http_host,
    'muc'             => 'muc.'.$http_host,
    'pubsub'          => 'pubsub.'.$http_host,
    'vjud'            => 'vjud.'.$http_host,
    'anonymous'       => 'anonymous.'.$http_host,
    'stun'            => 'stun.'.$default_host,
    'turn'            => '',
    'turn_username'   => '',
    'turn_password'   => '',
    'bosh'            => 'http://'.$http_host.':5280/http-bind',
    'bosh_main'       => '',
    'bosh_mini'       => '',
    'websocket'       => '',
    'static'          => '',
    'upload'          => '',
    'bosh_proxy'      => 'off'
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
        if(isset($hosts_conf[$hosts_value]) && (string)$hosts_child) {
            $hosts_conf[$hosts_value] = str_replace('{PROTOCOL}', $protocol, (string)$hosts_child);
        }
    }
}

// Filter hosts (remove multiple '/' at the end)
$filter_host_regex = '/(\/+)?$/';

if($hosts_conf['upload']) {
    $hosts_conf['upload'] = preg_replace($filter_host_regex, '', $hosts_conf['upload']);
}

if($hosts_conf['static']) {
    $hosts_conf['static'] = preg_replace($filter_host_regex, '', $hosts_conf['static']);
}

// Finally, define the hosts configuration globals
define('HOST_MAIN', $hosts_conf['main']);
define('HOST_MUC', $hosts_conf['muc']);
define('HOST_PUBSUB', $hosts_conf['pubsub']);
define('HOST_VJUD', $hosts_conf['vjud']);
define('HOST_ANONYMOUS', $hosts_conf['anonymous']);
define('HOST_STUN', $hosts_conf['stun']);
define('HOST_TURN', $hosts_conf['turn']);
define('HOST_TURN_USERNAME', $hosts_conf['turn_username']);
define('HOST_TURN_PASSWORD', $hosts_conf['turn_password']);
define('HOST_BOSH', $hosts_conf['bosh']);
define('HOST_BOSH_MAIN', $hosts_conf['bosh_main']);
define('HOST_BOSH_MINI', $hosts_conf['bosh_mini']);
define('HOST_WEBSOCKET', $hosts_conf['websocket']);
define('HOST_STATIC', $hosts_conf['static']);
define('HOST_UPLOAD', $hosts_conf['upload']);
define('BOSH_PROXY', $hosts_conf['bosh_proxy']);

?>
