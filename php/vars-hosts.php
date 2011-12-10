<?php

/*

Jappix - An open social platform
These are the hosts configuration variables

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 18/12/10

*/

// Someone is trying to hack us?
if(!defined('PHP_BASE'))
	exit;

// Define the vars with the hosts configuration constants
$host_main = htmlspecialchars(HOST_MAIN);
$host_muc = htmlspecialchars(HOST_MUC);
$host_vjud = htmlspecialchars(HOST_VJUD);
$host_anonymous = htmlspecialchars(HOST_ANONYMOUS);
$host_bosh = htmlspecialchars(HOST_BOSH);
$host_static = htmlspecialchars(HOST_STATIC);

?>
