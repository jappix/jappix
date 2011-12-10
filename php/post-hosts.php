<?php

/*

Jappix - An open social platform
This is the hosts configuration POST handler (install & manager)

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 18/12/10

*/

// Someone is trying to hack us?
if(!defined('PHP_BASE'))
	exit;

// Main host
if(isset($_POST['host_main']) && !empty($_POST['host_main']))
	$host_main = htmlspecialchars($_POST['host_main']);
else
	$host_main = htmlspecialchars($hosts_default['main']);

// Groupchat host
if(isset($_POST['host_muc']) && !empty($_POST['host_muc']))
	$host_muc = htmlspecialchars($_POST['host_muc']);
else
	$host_muc = htmlspecialchars($hosts_default['muc']);

// Directory host
if(isset($_POST['host_vjud']) && !empty($_POST['host_vjud']))
	$host_vjud = htmlspecialchars($_POST['host_vjud']);
else
	$host_vjud = htmlspecialchars($hosts_default['vjud']);

// Anonymous host
if(isset($_POST['host_anonymous']) && !empty($_POST['host_anonymous']))
	$host_anonymous = htmlspecialchars($_POST['host_anonymous']);
else
	$host_anonymous = htmlspecialchars($hosts_default['anonymous']);

// BOSH host
if(isset($_POST['host_bosh']) && !empty($_POST['host_bosh']))
	$host_bosh = htmlspecialchars($_POST['host_bosh']);
else
	$host_bosh = htmlspecialchars($hosts_default['bosh']);

// Static host
if(isset($_POST['host_static']) && !empty($_POST['host_static']))
	$host_static = htmlspecialchars($_POST['host_static']);
else
	$host_static = htmlspecialchars($hosts_default['static']);

// Generate the hosts XML content
$hosts_xml = 
	'<main>'.$host_main.'</main>
	<muc>'.$host_muc.'</muc>
	<vjud>'.$host_vjud.'</vjud>
	<anonymous>'.$host_anonymous.'</anonymous>
	<bosh>'.$host_bosh.'</bosh>
	<static>'.$host_static.'</static>'
;

// Write the main configuration
writeXML('conf', 'hosts', $hosts_xml);
