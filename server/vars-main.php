<?php

/*

Jappix - An open social platform
These are the main configuration variables

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

// Define the vars with the main configuration constants
$service_name = htmlspecialchars(SERVICE_NAME);
$service_desc = htmlspecialchars(SERVICE_DESC);
$owner_name = htmlspecialchars(OWNER_NAME);
$owner_website = htmlspecialchars(OWNER_WEBSITE);
$legal = htmlspecialchars(LEGAL);
$language = htmlspecialchars(LANGUAGE);
$jappix_resource = htmlspecialchars(JAPPIX_RESOURCE);
$lock_host = htmlspecialchars(LOCK_HOST);
$anonymous_mode = htmlspecialchars(ANONYMOUS);
$http_auth = htmlspecialchars(HTTP_AUTH);
$registration = htmlspecialchars(REGISTRATION);
$manager_link = htmlspecialchars(MANAGER_LINK);
$groupchats_join = htmlspecialchars(GROUPCHATS_JOIN);
$groupchats_suggest = htmlspecialchars(GROUPCHATS_SUGGEST);
$encryption = htmlspecialchars(ENCRYPTION);
$https_storage = htmlspecialchars(HTTPS_STORAGE);
$https_force = htmlspecialchars(HTTPS_FORCE);
$compression = htmlspecialchars(COMPRESSION);
$caching = htmlspecialchars(CACHING);
$analytics_track = htmlspecialchars(ANALYTICS_TRACK);
$analytics_url = htmlspecialchars(ANALYTICS_URL);
$analytics_id = htmlspecialchars(ANALYTICS_ID);
$ads_enable = htmlspecialchars(ADS_ENABLE);
$ads_standard = htmlspecialchars(ADS_STANDARD);
$gads_client = htmlspecialchars(GADS_CLIENT);
$gads_slot = htmlspecialchars(GADS_SLOT);
$multi_files = htmlspecialchars(MULTI_FILES);
$developer = htmlspecialchars(DEVELOPER);
$statistics = htmlspecialchars(STATISTICS);
$register_api = htmlspecialchars(REGISTER_API);
$xmppd_ctl = htmlspecialchars(XMPPD_CTL);
$xmppd = htmlspecialchars(XMPPD);

?>
