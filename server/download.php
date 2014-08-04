<?php

/*

Jappix - An open social platform
This is the PHP script used to download a chat log

WARNING: THIS FILE IS DEPRECATED!
(ONLY THERE FOR BACKWARD COMPATIBILITY, SINCE FILE-SHARE.PHP NO LONGER REQUIRE IT)

-------------------------------------------------

License: AGPL
Author: Cyril "Kyriog" Glapa

*/

// Check submitted vars
if(!isset($_GET['file'])) {
    exit(T_("You haven't provided any file to download"));
}
if(!isset($_GET['key'])) {
    exit(T_("You cannot download a file if you don't provide a key"));
}

// Initialize
$file_path = JAPPIX_BASE.'/store/share/'.$_GET['file'];
$xml_path = $file_path.'.xml';

if(!is_file($xml_path) || !is_file($file_path)) {
    exit(T_("Woah this file isn't found, please double check"));
}

// Load XML information for this file
$xml = new SimpleXMLElement($xml_path, 0, true);
$keys = $xml->keys->key;
$key_found = false;

foreach($keys as $key) {
    if($key == $_GET['key']) {
        $key_found = true;

        break;
    }
}

// Not allowed?
if(!$key_found) {
    exit(T_("The key you provided does not have the permission to download this file"));
}

// Generate header data
$expires  = 31536000;
$filename = $xml->name;
$mimetype = $xml->type;

// Cache headers
header('Pragma: public');
header('Cache-Control: maxage='.$expires);
header('Expires: '.gmdate('D, d M Y H:i:s', (time() + $expires)).' GMT');

// Content headers
header('Content-Type: '.$mimetype);
header('Content-Disposition: attachment; filename="'.htmlspecialchars($filename).'"');
header('Content-Length: '.filesize($file_path));

// Output data
exit(file_get_contents($file_path));

?>
