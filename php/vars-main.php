<?php

/*

Jappix - An open social platform
These are the main configuration variables

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda
Last revision: 31/01/13

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

// Define the vars with the main configuration constants
$service_name = htmlspecialchars(SERVICE_NAME);
$service_desc = htmlspecialchars(SERVICE_DESC);
$owner_name = htmlspecialchars(OWNER_NAME);
$owner_website = htmlspecialchars(OWNER_WEBSITE);
$legal = htmlspecialchars(LEGAL);
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
$multi_files = htmlspecialchars(MULTI_FILES);
$developer = htmlspecialchars(DEVELOPER);
$statistics = htmlspecialchars(STATISTICS);
$register_api = htmlspecialchars(REGISTER_API);
$xmppd_ctl = htmlspecialchars(XMPPD_CTL);
$xmppd = htmlspecialchars(XMPPD);

?>