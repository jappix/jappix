<?php

/*

Jappix - An Open μSocial Platform
This is the PHP script used to download a chat log

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/03/10

*/

// REQUIRE THE NEEDED FILES
	require_once('../conf/main.php');
	require_once('./functions.php');
	
	if(!isDeveloper())
		hideErrors();

// WE SEND THE HTML FILE TO BE DOWNLOADED
	if(isset($_GET['id'])) {
		// WE DEFINE THE VARIABLES
			$content_dir = '../store/logs/';
			$filename = $_GET['id'];
			$filepath = $content_dir.$filename.'.html';
		
		// WE SEND THE FILE TO THE USER
			header("Content-disposition: attachment; filename=\"$filename.html\"");
			header("Content-Type: application/force-download");
			header("Content-Transfer-Encoding: text/html\n");
			header("Content-Length: ".filesize($filepath));
			header("Pragma: no-cache");
			header("Cache-Control: must-revalidate, post-check=0, pre-check=0, public");
			header("Expires: 0");
			readfile($filepath);
		
		// WE DELETE THE FRESHLY CREATED FILE
			unlink($filepath);
	}
?>
