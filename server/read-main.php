<?php

/*

Jappix - An open social platform
This is the main configuration reader

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

// Define the default main configuration values
$main_conf = array(
    'name'                  => 'Jappix',
    'desc'                  => 'a free social network',
    'owner_name'            => '',
    'owner_website'         => '',
    'legal'                 => '',
    'language'              => 'all',
    'resource'              => 'Jappix',
    'lock'                  => 'on',
    'anonymous'             => 'on',
    'http_auth'             => 'off',
    'registration'          => 'on',
    'manager_link'          => 'on',
    'groupchats_join'       => '',
    'groupchats_suggest'    => 'on',
    'encryption'            => 'on',
    'https_storage'         => 'off',
    'https_force'           => 'off',
    'compression'           => 'off',
    'caching'               => 'on',
    'analytics_track'       => 'off',
    'analytics_url'         => '',
    'analytics_id'          => '',
    'ads_enable'            => 'off',
    'ads_standard'          => '',
    'gads_client'           => '',
    'gads_slot'             => '',
    'multi_files'           => 'off',
    'developer'             => 'off',
    'statistics'            => 'on',
    'register_api'          => 'off',
    'xmppd_ctl'             => '/usr/sbin/ejabberdctl',
    'xmppd'                 => 'ejabberd'
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
        if(isset($main_conf[$main_value]) && (string)$main_child) {
            $main_conf[$main_value] = (string)$main_child;
        }
    }
}

// Finally, define the main configuration globals
define('SERVICE_NAME', $main_conf['name']);
define('SERVICE_DESC', $main_conf['desc']);
define('OWNER_NAME', $main_conf['owner_name']);
define('OWNER_WEBSITE', $main_conf['owner_website']);
define('LEGAL', $main_conf['legal']);
define('LANGUAGE', $main_conf['language']);
define('JAPPIX_RESOURCE', $main_conf['resource']);
define('LOCK_HOST', $main_conf['lock']);
define('ANONYMOUS', $main_conf['anonymous']);
define('HTTP_AUTH', $main_conf['http_auth']);
define('REGISTRATION', $main_conf['registration']);
define('MANAGER_LINK', $main_conf['manager_link']);
define('GROUPCHATS_JOIN', $main_conf['groupchats_join']);
define('GROUPCHATS_SUGGEST', $main_conf['groupchats_suggest']);
define('ENCRYPTION', $main_conf['encryption']);
define('HTTPS_STORAGE', $main_conf['https_storage']);
define('HTTPS_FORCE', $main_conf['https_force']);
define('COMPRESSION', $main_conf['compression']);
define('CACHING', $main_conf['caching']);
define('ANALYTICS_TRACK', $main_conf['analytics_track']);
define('ANALYTICS_URL', $main_conf['analytics_url']);
define('ANALYTICS_ID', $main_conf['analytics_id']);
define('ADS_ENABLE', $main_conf['ads_enable']);
define('ADS_STANDARD', $main_conf['ads_standard']);
define('GADS_CLIENT', $main_conf['gads_client']);
define('GADS_SLOT', $main_conf['gads_slot']);
define('MULTI_FILES', $main_conf['multi_files']);
define('DEVELOPER', $main_conf['developer']);
define('STATISTICS', $main_conf['statistics']);
define('REGISTER_API', $main_conf['register_api']);
define('XMPPD_CTL', $main_conf['xmppd_ctl']);
define('XMPPD', $main_conf['xmppd']);

?>
