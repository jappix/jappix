<?php

/*

Jappix - An open social platform
These are the hosts configuration variables

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

// Define the vars with the hosts configuration constants
$host_main = htmlspecialchars(HOST_MAIN);
$host_muc = htmlspecialchars(HOST_MUC);
$host_pubsub = htmlspecialchars(HOST_PUBSUB);
$host_vjud = htmlspecialchars(HOST_VJUD);
$host_anonymous = htmlspecialchars(HOST_ANONYMOUS);
$host_stun = htmlspecialchars(HOST_STUN);
$host_turn = htmlspecialchars(HOST_TURN);
$host_turn_username = htmlspecialchars(HOST_TURN_USERNAME);
$host_turn_password = htmlspecialchars(HOST_TURN_PASSWORD);
$host_bosh = htmlspecialchars(HOST_BOSH);
$host_bosh_main = htmlspecialchars(HOST_BOSH_MAIN);
$host_bosh_mini = htmlspecialchars(HOST_BOSH_MINI);
$host_websocket = htmlspecialchars(HOST_WEBSOCKET);
$host_static = htmlspecialchars(HOST_STATIC);
$host_upload = htmlspecialchars(HOST_UPLOAD);
$bosh_proxy = htmlspecialchars(BOSH_PROXY);

?>
