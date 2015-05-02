<?php

/*

Jappix - An open social platform
This is the main configuration POST handler (install & manager)

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
    exit;

// Service name
if(isset($_POST['service_name']) && !empty($_POST['service_name'])) {
    $service_name = stripslashes(htmlspecialchars($_POST['service_name']));
} else {
    $service_name = stripslashes(htmlspecialchars($main_default['name']));
}

// Service description
if(isset($_POST['service_desc']) && !empty($_POST['service_desc'])) {
    $service_desc = stripslashes(htmlspecialchars($_POST['service_desc']));
} else {
    $service_desc = stripslashes(htmlspecialchars($main_default['desc']));
}

// Owner name
if(isset($_POST['owner_name']) && !empty($_POST['owner_name'])) {
    $owner_name = stripslashes(htmlspecialchars($_POST['owner_name']));
} else {
    $owner_name = stripslashes(htmlspecialchars($main_default['owner_name']));
}

// Owner website
if(isset($_POST['owner_website']) && !empty($_POST['owner_website'])) {
    $owner_website = stripslashes(htmlspecialchars($_POST['owner_website']));
} else {
    $owner_website = stripslashes(htmlspecialchars($main_default['owner_website']));
}

// Legal disclaimer
if(isset($_POST['legal']) && !empty($_POST['legal'])) {
    $legal = stripslashes(htmlspecialchars($_POST['legal']));
} else {
    $legal = stripslashes(htmlspecialchars($main_default['legal']));
}

// Language
if(isset($_POST['language']) && !empty($_POST['language'])) {
    $language = stripslashes(htmlspecialchars($_POST['language']));
} else {
    $language = stripslashes(htmlspecialchars($main_default['language']));
}

// Jappix resource
if(isset($_POST['jappix_resource']) && !empty($_POST['jappix_resource'])) {
    $jappix_resource = stripslashes(htmlspecialchars($_POST['jappix_resource']));
} else {
    $jappix_resource = stripslashes(htmlspecialchars($main_default['resource']));
}

// Lock host
if(isset($_POST['lock_host']) && !empty($_POST['lock_host'])) {
    $lock_host = 'on';
} else {
    $lock_host = 'off';
}

// Anonymous mode
if(isset($_POST['anonymous_mode']) && !empty($_POST['anonymous_mode'])) {
    $anonymous_mode = 'on';
} else {
    $anonymous_mode = 'off';
}

// HTTP authentication
if(isset($_POST['http_auth']) && !empty($_POST['http_auth'])) {
    $http_auth = 'on';
} else {
    $http_auth = 'off';
}

// Registration
if(isset($_POST['registration']) && !empty($_POST['registration'])) {
    $registration = 'on';
} else {
    $registration = 'off';
}

// Manager link
if(isset($_POST['manager_link']) && !empty($_POST['manager_link'])) {
    $manager_link = 'on';
} else {
    $manager_link = 'off';
}

// Groupchats to join
if(isset($_POST['groupchats_join']) && !empty($_POST['groupchats_join'])) {
    $groupchats_join = stripslashes(htmlspecialchars(trim($_POST['groupchats_join'])));
} else {
    $groupchats_join = stripslashes(htmlspecialchars($main_default['groupchats_join']));
}

// Suggested groupchats
if(isset($_POST['groupchats_suggest']) && !empty($_POST['groupchats_suggest'])) {
    $groupchats_suggest = 'on';
} else {
    $groupchats_suggest = 'off';
}

// Encryption
if(isset($_POST['encryption']) && !empty($_POST['encryption'])) {
    $encryption = 'on';
} else {
    $encryption = 'off';
}

// HTTPS storage
if(isset($_POST['https_storage']) && !empty($_POST['https_storage'])) {
    $https_storage = 'on';
} else {
    $https_storage = 'off';
}

// Force HTTPS
if(isset($_POST['https_force']) && !empty($_POST['https_force'])) {
    $https_force = 'on';
} else {
    $https_force = 'off';
}

// Compression
if(isset($_POST['compression']) && !empty($_POST['compression'])) {
    $compression = 'on';
} else {
    $compression = 'off';
}

// Caching
if(isset($_POST['caching']) && !empty($_POST['caching'])) {
    $caching = 'on';
} else {
    $caching = 'off';
}

// Statistics
if(isset($_POST['statistics']) && !empty($_POST['statistics'])) {
    $statistics = 'on';
} else {
    $statistics = 'off';
}

// Analytics tracking
if(isset($_POST['analytics_track']) && !empty($_POST['analytics_track'])) {
    $analytics_track = 'on';
} else {
    $analytics_track = 'off';
}

// Analytics Piwik URL
if(isset($_POST['analytics_url']) && !empty($_POST['analytics_url'])) {
    $analytics_url = stripslashes(htmlspecialchars(trim($_POST['analytics_url'])));
} else {
    $analytics_url = stripslashes(htmlspecialchars($main_default['analytics_url']));
}

// Analytics Piwik tracking ID
if(isset($_POST['analytics_id']) && !empty($_POST['analytics_id'])) {
    $analytics_id = stripslashes(htmlspecialchars(trim($_POST['analytics_id'])));
} else {
    $analytics_id = stripslashes(htmlspecialchars($main_default['analytics_id']));
}

// Advertising enable
if(isset($_POST['ads_enable']) && !empty($_POST['ads_enable'])) {
    $ads_enable = 'on';
} else {
    $ads_enable = 'off';
}

// Advertising (standard)
if(isset($_POST['ads_standard']) && !empty($_POST['ads_standard'])) {
    $ads_standard = stripslashes(htmlspecialchars(trim($_POST['ads_standard'])));
} else {
    $ads_standard = stripslashes(htmlspecialchars($main_default['ads_standard']));
}

// Google AdSense Client ID
if(isset($_POST['gads_client']) && !empty($_POST['gads_client'])) {
    $gads_client = stripslashes(htmlspecialchars(trim($_POST['gads_client'])));
} else {
    $gads_client = stripslashes(htmlspecialchars($main_default['gads_client']));
}

// Google AdSense Slot
if(isset($_POST['gads_slot']) && !empty($_POST['gads_slot'])) {
    $gads_slot = stripslashes(htmlspecialchars(trim($_POST['gads_slot'])));
} else {
    $gads_slot = stripslashes(htmlspecialchars($main_default['gads_slot']));
}

// Multiple resources
if(isset($_POST['multi_files']) && ($_POST['multi_files'] == 'on')) {
    $multi_files = 'on';
} else {
    $multi_files = 'off';
}

// Developer mode
if(isset($_POST['developer']) && ($_POST['developer'] == 'on')) {
    $developer = 'on';
} else {
    $developer = 'off';
}

// Register API
if(isset($_POST['register_api']) && ($_POST['register_api'] == 'on')) {
    $register_api = 'on';
} else {
    $register_api = 'off';
}

// XMPP Daemon Control Command
if(isset($_POST['xmppd_ctl']) && !empty($_POST['xmppd_ctl'])) {
    $xmppd_ctl = stripslashes(htmlspecialchars($_POST['xmppd_ctl']));
} else {
    $xmppd_ctl = stripslashes(htmlspecialchars($main_default['xmppd_ctl']));
}

// XMPP Daemon
if(isset($_POST['xmppd']) && !empty($_POST['xmppd'])) {
    $xmppd = stripslashes(htmlspecialchars($_POST['xmppd']));
} else {
    $xmppd = stripslashes(htmlspecialchars($main_default['xmppd']));
}

// Generate the configuration XML content
$conf_xml =
    '<name>'.$service_name.'</name>
    <desc>'.$service_desc.'</desc>
    <owner_name>'.$owner_name.'</owner_name>
    <owner_website>'.$owner_website.'</owner_website>
    <legal>'.$legal.'</legal>
    <language>'.$language.'</language>
    <resource>'.$jappix_resource.'</resource>
    <lock>'.$lock_host.'</lock>
    <anonymous>'.$anonymous_mode.'</anonymous>
    <http_auth>'.$http_auth.'</http_auth>
    <registration>'.$registration.'</registration>
    <manager_link>'.$manager_link.'</manager_link>
    <groupchats_join>'.$groupchats_join.'</groupchats_join>
    <groupchats_suggest>'.$groupchats_suggest.'</groupchats_suggest>
    <encryption>'.$encryption.'</encryption>
    <https_storage>'.$https_storage.'</https_storage>
    <https_force>'.$https_force.'</https_force>
    <compression>'.$compression.'</compression>
    <caching>'.$caching.'</caching>
    <analytics_track>'.$analytics_track.'</analytics_track>
    <analytics_url>'.$analytics_url.'</analytics_url>
    <analytics_id>'.$analytics_id.'</analytics_id>
    <ads_enable>'.$ads_enable.'</ads_enable>
    <ads_standard>'.$ads_standard.'</ads_standard>
    <gads_client>'.$gads_client.'</gads_client>
    <gads_slot>'.$gads_slot.'</gads_slot>
    <multi_files>'.$multi_files.'</multi_files>
    <developer>'.$developer.'</developer>
    <statistics>'.$statistics.'</statistics>
    <register_api>'.$register_api.'</register_api>
    <xmppd_ctl>'.$xmppd_ctl.'</xmppd_ctl>
    <xmppd>'.$xmppd.'</xmppd>'
;

// Write the main configuration
writeXML('conf', 'main', $conf_xml);
