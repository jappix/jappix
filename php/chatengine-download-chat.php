<?php

/*

Jappix - The instant messaging. Reinvented.
This is the PHP script used to download a chat log

-------------------------------------------------

Licence : GNU/GPL
Author : Valérian Saliou
Contact : mailing-list[at]jappix[dot]com
Last revision : 03/03/10

*/

// WE SEND THE HTML FILE TO BE DOWNLOADED
	if(isset($_GET['id'])) {
		// WE DEFINE THE VARIABLES
			$content_dir = './temp/';
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
