<?php

/*

Jappix - An open social platform
This is the hosts configuration POST handler (install & manager)

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

// Main host
if(isset($_POST['host_main']) && !empty($_POST['host_main'])) {
    $host_main = stripslashes(htmlspecialchars($_POST['host_main']));
} else {
    $host_main = stripslashes(htmlspecialchars($hosts_default['main']));
}

// Groupchat host
if(isset($_POST['host_muc']) && !empty($_POST['host_muc'])) {
    $host_muc = stripslashes(htmlspecialchars($_POST['host_muc']));
} else {
    $host_muc = stripslashes(htmlspecialchars($hosts_default['muc']));
}

// Pubsub host
if(isset($_POST['host_pubsub']) && !empty($_POST['host_pubsub'])) {
    $host_pubsub = stripslashes(htmlspecialchars($_POST['host_pubsub']));
} else {
    $host_pubsub = stripslashes(htmlspecialchars($hosts_default['pubsub']));
}

// Directory host
if(isset($_POST['host_vjud']) && !empty($_POST['host_vjud'])) {
    $host_vjud = stripslashes(htmlspecialchars($_POST['host_vjud']));
} else {
    $host_vjud = stripslashes(htmlspecialchars($hosts_default['vjud']));
}

// Anonymous host
if(isset($_POST['host_anonymous']) && !empty($_POST['host_anonymous'])) {
    $host_anonymous = stripslashes(htmlspecialchars($_POST['host_anonymous']));
} else {
    $host_anonymous = stripslashes(htmlspecialchars($hosts_default['anonymous']));
}

// STUN host
if(isset($_POST['host_stun']) && !empty($_POST['host_stun'])) {
    $host_stun = stripslashes(htmlspecialchars($_POST['host_stun']));
} else {
    $host_stun = stripslashes(htmlspecialchars($hosts_default['stun']));
}

// TURN host
if(isset($_POST['host_turn']) && !empty($_POST['host_turn'])) {
    $host_turn = stripslashes(htmlspecialchars($_POST['host_turn']));
} else {
    $host_turn = stripslashes(htmlspecialchars($hosts_default['turn']));
}

// TURN host username
if(isset($_POST['host_turn_username']) && !empty($_POST['host_turn_username'])) {
    $host_turn_username = stripslashes(htmlspecialchars($_POST['host_turn_username']));
} else {
    $host_turn_username = stripslashes(htmlspecialchars($hosts_default['turn_username']));
}

// TURN host password
if(isset($_POST['host_turn_password']) && !empty($_POST['host_turn_password'])) {
    $host_turn_password = stripslashes(htmlspecialchars($_POST['host_turn_password']));
} else {
    $host_turn_password = stripslashes(htmlspecialchars($hosts_default['turn_password']));
}

// BOSH host
if(isset($_POST['host_bosh']) && !empty($_POST['host_bosh'])) {
    $host_bosh = stripslashes(htmlspecialchars($_POST['host_bosh']));
} else {
    $host_bosh = stripslashes(htmlspecialchars($hosts_default['bosh']));
}

// Main BOSH host
if(isset($_POST['host_bosh_main']) && !empty($_POST['host_bosh_main'])) {
    $host_bosh_main = stripslashes(htmlspecialchars($_POST['host_bosh_main']));
} else {
    $host_bosh_main = stripslashes(htmlspecialchars($hosts_default['bosh_main']));
}

// Mini BOSH host
if(isset($_POST['host_bosh_mini']) && !empty($_POST['host_bosh_mini'])) {
    $host_bosh_mini = stripslashes(htmlspecialchars($_POST['host_bosh_mini']));
} else {
    $host_bosh_mini = stripslashes(htmlspecialchars($hosts_default['bosh_mini']));
}

// WebSocket host
if(isset($_POST['host_websocket']) && !empty($_POST['host_websocket'])) {
    $host_websocket = stripslashes(htmlspecialchars($_POST['host_websocket']));
} else {
    $host_websocket = stripslashes(htmlspecialchars($hosts_default['websocket']));
}

// Static host
if(isset($_POST['host_static']) && !empty($_POST['host_static'])) {
    $host_static = stripslashes(htmlspecialchars($_POST['host_static']));
} else {
    $host_static = stripslashes(htmlspecialchars($hosts_default['static']));
}

// Upload host
if(isset($_POST['host_upload']) && !empty($_POST['host_upload'])) {
    $host_upload = stripslashes(htmlspecialchars($_POST['host_upload']));
} else {
    $host_upload = stripslashes(htmlspecialchars($hosts_default['upload']));
}

// BOSH proxy
if(isset($_POST['bosh_proxy']) && !empty($_POST['bosh_proxy'])) {
    $bosh_proxy = 'on';
} else {
    $bosh_proxy = 'off';
}

// Generate the hosts XML content
$hosts_xml =
    '<main>'.$host_main.'</main>
    <muc>'.$host_muc.'</muc>
    <pubsub>'.$host_pubsub.'</pubsub>
    <vjud>'.$host_vjud.'</vjud>
    <anonymous>'.$host_anonymous.'</anonymous>
    <stun>'.$host_stun.'</stun>
    <turn>'.$host_turn.'</turn>
    <turn_username>'.$host_turn_username.'</turn_username>
    <turn_password>'.$host_turn_password.'</turn_password>
    <bosh>'.$host_bosh.'</bosh>
    <bosh_main>'.$host_bosh_main.'</bosh_main>
    <bosh_mini>'.$host_bosh_mini.'</bosh_mini>
    <websocket>'.$host_websocket.'</websocket>
    <static>'.$host_static.'</static>
    <upload>'.$host_upload.'</upload>
    <bosh_proxy>'.$bosh_proxy.'</bosh_proxy>'
;

// Write the main configuration
writeXML('conf', 'hosts', $hosts_xml);
