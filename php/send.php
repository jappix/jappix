<?php

/*

Jappix - An open social platform
This is the Jappix Out of Band file send script

-------------------------------------------------

License: AGPL
Author: Vanaryon
Last revision: 14/01/12

*/

// PHP base
define('JAPPIX_BASE', '..');

// Get the needed files
require_once('./functions.php');
require_once('./read-main.php');
require_once('./read-hosts.php');

// Optimize the page rendering
hideErrors();
compressThis();

// Not allowed for a special node
if(isStatic())
	exit;

// Action on an existing file
if(isset($_GET['id']) && !empty($_GET['id'])) {
	$file_id = $_GET['id'];
	$file_path = JAPPIX_BASE.'/store/send/'.$file_id;
	
	// Get file name
	if(isset($_GET['name']) && !empty($_GET['name']))
		$file_name = $_GET['name'];
	else
		$file_name = $file_id;
	
	// Hack?
	if(!isSafe($file_id)) {
		header('Status: 406 Not Acceptable', true, 406);
		exit('HTTP/1.1 406 Not Acceptable');
	}
	
	// File does not exist
	if(!file_exists($file_path)) {
		header('Status: 404 Not Found', true, 404);
		exit('HTTP/1.1 404 Not Found');
	}
	
	// Remove a file
	if(isset($_GET['action']) && ($_GET['action'] == 'remove')) {
		header('Status: 204 No Content', true, 204);
		unlink($file_path);
	}
	
	// Receive a file
	header("Content-disposition: attachment; filename=\"$file_name\"");
	header("Content-Type: application/force-download");
	header("Content-Length: ".filesize($file_path));
	header("Pragma: no-cache");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0, public");
	header("Expires: 0");
	readfile($file_path);
	unlink($file_path);
}

// Send a file
else if((isset($_FILES['file']) && !empty($_FILES['file'])) && (isset($_POST['id']) && !empty($_POST['id'])) && (isset($_POST['location']) && !empty($_POST['location']))) {
	header('Content-Type: text/xml; charset=utf-8');
	
	// Get the file name
	$tmp_filename = $_FILES['file']['tmp_name'];
	$filename = $_FILES['file']['name'];
	
	// Get the location
	if(HOST_UPLOAD)
		$location = HOST_UPLOAD;
	else
		$location = $_POST['location'];
	
	// Get the file new name
	$ext = getFileExt($filename);
	$new_name = preg_replace('/(^)(.+)(\.)(.+)($)/i', '$2', $filename);
	
	// Define some vars
	$name = sha1(time().$filename);
	$path = JAPPIX_BASE.'/store/send/'.$name.'.'.$ext;
	
	// Forbidden file?
	if(!isSafe($filename) || !isSafe($name.'.'.$ext)) {
		exit(
'<jappix xmlns=\'jappix:file:send\'>
	<error>forbidden-type</error>
	<id>'.htmlspecialchars($_POST['id']).'</id>
</jappix>'
		);
	}
	
	// File upload error?
	if(!is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $path)) {
		exit(
'<jappix xmlns=\'jappix:file:send\'>
	<error>move-error</error>
	<id>'.htmlspecialchars($_POST['id']).'</id>
</jappix>'
		);
	}
	
	// Return the path to the file
	exit(
'<jappix xmlns=\'jappix:file:send\'>
	<url>'.htmlspecialchars($location.'php/send.php?id='.urlencode($name).'.'.urlencode($ext).'&name='.urlencode($filename)).'</url>
	<desc>'.htmlspecialchars($new_name).'</desc>
	<id>'.htmlspecialchars($_POST['id']).'</id>
</jappix>'
	);
}

// Error?
else {
	header('Status: 400 Bad Request', true, 400);
	exit('HTTP/1.1 400 Bad Request');
}

?>
