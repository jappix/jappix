<?php

/*

Jappix - An open social platform
This is the main configuration POST handler (install & manager)

-------------------------------------------------

License: AGPL
Author: Vanaryon
Last revision: 01/04/12

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

// Service name
if(isset($_POST['service_name']) && !empty($_POST['service_name']))
	$service_name = stripslashes(htmlspecialchars($_POST['service_name']));
else
	$service_name = stripslashes(htmlspecialchars($main_default['name']));

// Service description
if(isset($_POST['service_desc']) && !empty($_POST['service_desc']))
	$service_desc = stripslashes(htmlspecialchars($_POST['service_desc']));
else
	$service_desc = stripslashes(htmlspecialchars($main_default['desc']));

// Owner name
if(isset($_POST['owner_name']) && !empty($_POST['owner_name']))
	$owner_name = stripslashes(htmlspecialchars($_POST['owner_name']));
else
	$owner_name = stripslashes(htmlspecialchars($main_default['owner_name']));

// Owner website
if(isset($_POST['owner_website']) && !empty($_POST['owner_website']))
	$owner_website = stripslashes(htmlspecialchars($_POST['owner_website']));
else
	$owner_website = stripslashes(htmlspecialchars($main_default['owner_website']));

// Jappix resource
if(isset($_POST['jappix_resource']) && !empty($_POST['jappix_resource']))
	$jappix_resource = stripslashes(htmlspecialchars($_POST['jappix_resource']));
else
	$jappix_resource = stripslashes(htmlspecialchars($main_default['resource']));

// Lock host
if(isset($_POST['lock_host']) && !empty($_POST['lock_host']))
	$lock_host = 'on';
else
	$lock_host = 'off';

// Anonymous mode
if(isset($_POST['anonymous_mode']) && !empty($_POST['anonymous_mode']))
	$anonymous_mode = 'on';
else
	$anonymous_mode = 'off';

// HTTP authentication
if(isset($_POST['http_auth']) && !empty($_POST['http_auth']))
	$http_auth = 'on';
else
	$http_auth = 'off';

// Registration
if(isset($_POST['registration']) && !empty($_POST['registration']))
	$registration = 'on';
else
	$registration = 'off';

// BOSH proxy
if(isset($_POST['bosh_proxy']) && !empty($_POST['bosh_proxy']))
	$bosh_proxy = 'on';
else
	$bosh_proxy = 'off';

// Manager link
if(isset($_POST['manager_link']) && !empty($_POST['manager_link']))
	$manager_link = 'on';
else
	$manager_link = 'off';

// Groupchats to join
if(isset($_POST['groupchats_join']) && !empty($_POST['groupchats_join']))
	$groupchats_join = stripslashes(htmlspecialchars(trim($_POST['groupchats_join'])));
else
	$groupchats_join = stripslashes(htmlspecialchars($main_default['groupchats_join']));

// Encryption
if(isset($_POST['encryption']) && !empty($_POST['encryption']))
	$encryption = 'on';
else
	$encryption = 'off';

// HTTPS storage
if(isset($_POST['https_storage']) && !empty($_POST['https_storage']))
	$https_storage = 'on';
else
	$https_storage = 'off';

// Force HTTPS
if(isset($_POST['https_force']) && !empty($_POST['https_force']))
	$https_force = 'on';
else
	$https_force = 'off';

// Compression
if(isset($_POST['compression']) && !empty($_POST['compression']))
	$compression = 'on';
else
	$compression = 'off';

// Compression
if(isset($_POST['statistics']) && !empty($_POST['statistics']))
	$statistics = 'on';
else
	$statistics = 'off';
	
// Multiple resources
if(isset($_POST['multi_files']) && ($_POST['multi_files'] == 'on'))
	$multi_files = 'on';
else
	$multi_files = 'off';

// Developer mode
if(isset($_POST['developer']) && ($_POST['developer'] == 'on'))
	$developer = 'on';
else
	$developer = 'off';

// Generate the configuration XML content
$conf_xml = 
	'<name>'.$service_name.'</name>
	<desc>'.$service_desc.'</desc>
	<owner_name>'.$owner_name.'</owner_name>
	<owner_website>'.$owner_website.'</owner_website>
	<resource>'.$jappix_resource.'</resource>
	<lock>'.$lock_host.'</lock>
	<anonymous>'.$anonymous_mode.'</anonymous>
	<http_auth>'.$http_auth.'</http_auth>
	<registration>'.$registration.'</registration>
	<bosh_proxy>'.$bosh_proxy.'</bosh_proxy>
	<manager_link>'.$manager_link.'</manager_link>
	<groupchats_join>'.$groupchats_join.'</groupchats_join>
	<encryption>'.$encryption.'</encryption>
	<https_storage>'.$https_storage.'</https_storage>
	<https_force>'.$https_force.'</https_force>
	<compression>'.$compression.'</compression>
	<multi_files>'.$multi_files.'</multi_files>
	<developer>'.$developer.'</developer>
	<statistics>'.$statistics.'</statistics>'
;

// Write the main configuration
writeXML('conf', 'main', $conf_xml);
