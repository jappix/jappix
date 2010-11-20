<?php

/*

Jappix - An open social platform
This is the Jappix microblog file attaching script

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 20/11/10

*/

// Get the needed files
define('PHP_BASE', '..');
require_once('./functions.php');
require_once('./read-main.php');

// Optimize the page rendering
hideErrors();
compressThis();

// Set a special XML header
header('content-type: text/xml; charset=utf-8');

// Everything is okay
if((isset($_FILES['file']) && !empty($_FILES['file'])) && (isset($_POST['user']) && !empty($_POST['user']))) {
	// Get the user name
	$user = $_POST['user'];
	
	// Get the file name
	$tmp_filename = $_FILES['file']['tmp_name'];
	$filename = $_FILES['file']['name'];
	
	// Get the file new name
	$ext = getFileExt($filename);
	$new_name = preg_replace('/(^)(.+)(\.)(.+)($)/i', '$2', $filename);
	
	// Define some vars
	$content_dir = '../store/share/'.$user;
	$security_file = $content_dir.'/index.html';
	$name = sha1(time().$filename).'.'.$ext;
	$path = $content_dir.'/'.$name;
	
	// Create the user directory
	if(!is_dir($content_dir)) {
		mkdir($content_dir, 0777, true);
		chmod($content_dir, 0777);
	}
	
	// Create (or re-create) the security file
	if(!file_exists($security_file))	
		file_put_contents($security_file, securityHTML());
	
	// File upload error?
	if(!isSafe($filename) || !is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $path)) {
		exit(
'<jappix xmlns=\'jappix:file:post\'>
	<error>move-error</error>
</jappix>'
		);
	}
	
	// Resize and compress if this is a JPEG file and if GD is available
	if((($ext == 'jpg') || ($ext == 'jpeg')) && function_exists('gd_info')) {
		// Initialize GD
		$img_resize = imagecreatefromjpeg($path);
		$img_size = getimagesize($path);
		$img_width = $img_size[0];
		$img_height = $img_size[1];
		
		// Necessary to change the image width
		if($img_width > 1024 && ($img_width > $img_height)) {
			// Process the new sizes
			$new_width = 1024;
			$img_process = (($new_width * 100) / $img_width);
			$new_height = (($img_height * $img_process) / 100);
		}
		
		// Necessary to change the image height
		else if($img_height > 1024 && ($img_width < $img_height)) {
			// Process the new sizes
			$new_height = 1024;
			$img_process = (($new_height * 100) / $img_height);
			$new_width = (($img_width * $img_process) / 100);
		}
		
		// Else, just use the old sizes
		else {
			$new_width = $img_width;
			$new_height = $img_height;
		}
		
		// Create the new image
		$new_img = imagecreatetruecolor($new_width , $new_height) or die ('');
		imagecopyresampled($new_img, $img_resize, 0, 0, 0, 0, $new_width, $new_height, $img_size[0], $img_size[1]);
		
		// Destroy the old data
		imagedestroy($img_resize);
		unlink($path);
		
		// Write the new image
		imagejpeg($new_img, $path, 85);
	}
	
	// File type?
	$file_type = getFileType($ext);
	
	// Return the path to the file
	exit(
'<jappix xmlns=\'jappix:file:post\'>
	<url>'.htmlspecialchars('store/share/'.$user.'/'.$name).'</url>
	<name>'.htmlspecialchars($new_name).'</name>
	<type>'.htmlspecialchars($file_type).'</type>
	<ext>'.htmlspecialchars($ext).'</ext>
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
