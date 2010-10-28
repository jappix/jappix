<?php

/*

Jappix - An open social platform
This is the main configuration POST handler (install & manager)

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 27/10/10

*/

// Service name
if(isset($_POST['service_name']) && !empty($_POST['service_name']))
	$service_name = htmlspecialchars($_POST['service_name']);
else
	$service_name = htmlspecialchars($main_default['name']);

// Service description
if(isset($_POST['service_desc']) && !empty($_POST['service_desc']))
	$service_desc = htmlspecialchars($_POST['service_desc']);
else
	$service_desc = htmlspecialchars($main_default['desc']);

// Jappix resource
if(isset($_POST['jappix_resource']) && !empty($_POST['jappix_resource']))
	$jappix_resource = htmlspecialchars($_POST['jappix_resource']);
else
	$jappix_resource = htmlspecialchars($main_default['resource']);

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

// HTTPS store
if(isset($_POST['https_storage']) && !empty($_POST['https_storage']))
	$https_storage = 'on';
else
	$https_storage = 'off';

// Encryption
if(isset($_POST['encryption']) && !empty($_POST['encryption']))
	$encryption = 'on';
else
	$encryption = 'off';

// Compression
if(isset($_POST['compression']) && !empty($_POST['compression']))
	$compression = 'on';
else
	$compression = 'off';

// Developer mode
if(isset($_POST['developer']) && ($_POST['developer'] == 'on'))
	$developer = 'on';
else
	$developer = 'off';

// Generate the configuration XML content
$conf_xml = 
	'<name>'.$service_name.'</name>
	<desc>'.$service_desc.'</desc>
	<resource>'.$jappix_resource.'</resource>
	<lock>'.$lock_host.'</lock>
	<anonymous>'.$anonymous_mode.'</anonymous>
	<https_storage>'.$https_storage.'</https_storage>
	<encryption>'.$encryption.'</encryption>
	<compression>'.$compression.'</compression>
	<developer>'.$developer.'</developer>'
;

// Write the main configuration
writeXML('conf', 'main', $conf_xml);
