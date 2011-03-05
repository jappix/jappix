<?php

/*

Jappix - An open social platform
This is the Jappix microblog file attaching script

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Last revision: 05/03/11

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

// Not allowed for a static node
if(isStatic())
	exit;

// Set a special XML header
header('Content-Type: text/xml; charset=utf-8');

// Everything is okay
if((isset($_FILES['file']) && !empty($_FILES['file'])) && (isset($_POST['user']) && !empty($_POST['user'])) && (isset($_POST['location']) && !empty($_POST['location']))) {
	// Get the user name
	$user = $_POST['user'];
	
	// Get the file name
	$tmp_filename = $_FILES['file']['tmp_name'];
	$filename = $_FILES['file']['name'];
	
	// Get the location
	$location = $_POST['location'];
	
	// Forbidden file?
	if(!isSafe($filename)) {
		exit(
'<jappix xmlns=\'jappix:file:post\'>
	<error>fobidden-type</error>
</jappix>'
		);
	}
	
	// Get the file new name
	$ext = getFileExt($filename);
	$new_name = preg_replace('/(^)(.+)(\.)(.+)($)/i', '$2', $filename);
	
	// Define some vars
	$content_dir = '../store/share/'.$user;
	$security_file = $content_dir.'/index.html';
	$name = sha1(time().$filename);
	$path = $content_dir.'/'.$name.'.'.$ext;
	$thumb_xml = '';
	
	// Create the user directory
	if(!is_dir($content_dir)) {
		mkdir($content_dir, 0777, true);
		chmod($content_dir, 0777);
	}
	
	// Create (or re-create) the security file
	if(!file_exists($security_file))	
		file_put_contents($security_file, securityHTML());
	
	// File upload error?
	if(!is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $path)) {
		exit(
'<jappix xmlns=\'jappix:file:post\'>
	<error>move-error</error>
</jappix>'
		);
	}
	
	// Resize and compress if this is a JPEG file
	if(($ext == 'jpg') || ($ext == 'jpeg')) {
		// Resize the image
		resizeImage($path, 1024, 1024);
		
		// Copy the image
		$thumb = $content_dir.'/'.$name.'_thumb.'.$ext;
		copy($path, $thumb);
		
		// Create the thumbnail
		if(resizeImage($thumb, 150, 115))
			$thumb_xml = '<thumb>'.htmlspecialchars($location.'store/share/'.$user.'/'.$name.'_thumb.'.$ext).'</thumb>';
	}
	
	// File type?
	$file_type = getFileType($ext);
	
	// Return the path to the file
	exit(
'<jappix xmlns=\'jappix:file:post\'>
	<url>'.htmlspecialchars($location.'store/share/'.$user.'/'.$name.'.'.$ext).'</url>
	<name>'.htmlspecialchars($new_name).'</name>
	<type>'.htmlspecialchars($file_type).'</type>
	<ext>'.htmlspecialchars($ext).'</ext>
	'.$thumb_xml.'
</jappix>'
	);
}

// Bad request error!
exit(
'<jappix xmlns=\'jappix:file:post\'>
	<error>bad-request</error>
</jappix>'
);

?>
