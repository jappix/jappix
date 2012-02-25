<?php

/*

Jappix - An open social platform
This is the PHP script used to download a chat log

-------------------------------------------------

License: AGPL
Author: Cyril "Kyriog" Glapa
Last revision: 25/12/2012

*/

if(!isset($_GET['file']))
  exit('You don\'t provide any file to download!');
if(!isset($_GET['key']))
  exit('You cannot download a file if you don\'t provide a key');

$file_path = JAPPIX_BASE.'/store/share/'.$_GET['file'];
$xml_path = $file_path.'.xml';
if(!is_file($xml_path) || !is_file($file_path))
  exit('Woah this file isn\'t found, please double check');

$xml = new SimpleXMLElement($xml_path,0,true);

$keys = $xml->keys->key;
$key_found = false;
foreach($keys as $key) {
  if($key == $_GET['key']) {
    $key_found = true;
    break;
  }
}

if(!$key_found)
  exit('The key that you provide aren\'t granted for downloading this file');

$filename = $xml->name;
$mimetype = $xml->type;

header('Content-Type: '.$mimetype);
header('Content-Disposition: attachment; filename="'.htmlspecialchars($filename).'"');
header('Content-Length: '.filesize($file_path));
echo file_get_contents($file_path);
?>
