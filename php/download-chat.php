<?php

/*

Jappix - An open social platform
This is the PHP script used to download a chat log

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 28/12/10

*/

// PHP base
define('JAPPIX_BASE', '..');

// Get the needed files
require_once('./functions.php');
require_once('./read-main.php');

// Optimize the page rendering
hideErrors();
compressThis();

// Send the HTML file to be downloaded
if(isset($_GET['id']) && !empty($_GET['id']) && isSafe($_GET['id'])) {
	// We define the variables
	$filename = $_GET['id'];
	$content_dir = '../store/logs/';
	$filepath = $content_dir.$filename.'.html';
	
	// We set special headers
	header("Content-disposition: attachment; filename=\"$filename.html\"");
	header("Content-Type: application/force-download");
	header("Content-Transfer-Encoding: text/html\n");
	header("Content-Length: ".filesize($filepath));
	header("Pragma: no-cache");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0, public");
	header("Expires: 0");
	readfile($filepath);
	
	// We delete the stored log file
	unlink($filepath);
}

?>
