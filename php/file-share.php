<?php

/*

Jappix - An open social platform
This is the Jappix file share (upload handler) script

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, regilero, Cyril "Kyriog" Glapa
Last revision: 11/04/12

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
if(isStatic() || isUpload())
	exit;

// Set a special XML header
header('Content-Type: text/xml; charset=utf-8');

// Everything is okay
if((isset($_FILES['file']) && !empty($_FILES['file'])) && (isset($_POST['location']) && !empty($_POST['location']))) {
	// Get the file name
	$tmp_filename = $_FILES['file']['tmp_name'];
	$filename = $_FILES['file']['name'];
	$md5 = md5_file($tmp_filename);
	$xml = new DOMDocument();
	
	// Get the file mime type
	$finfo = new finfo(FILEINFO_MIME_TYPE);
	$mimetype = $finfo->file($tmp_filename);
	
	// Get the location
	if(HOST_UPLOAD)
		$location = HOST_UPLOAD;
	else
		$location = $_POST['location'];
	
	// Some little vars
	$content_dir = JAPPIX_BASE.'/store/share';
	$file_path = $content_dir.'/'.$md5;
	$security_file = $content_dir.'/index.html';
	$thumb_xml = '';
	
	if(!is_file($file_path)) {
		// Generate XML file
		$xml_file = $xml->createElement('file');
		$xml_file->appendChild($xml->createElement('name',$filename));
		$xml_file->appendChild($xml->createElement('type',$mimetype));
		$xml_file->appendChild($xml->createElement('keys'));
		$xml->appendChild($xml_file);
		
		// File upload error?
		if(!is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $file_path)) {
			exit(
			'<jappix xmlns=\'jappix:file:post\'>
				<error>move-error</error>
			</jappix>'
			);
		}
	}
	
	else
		$xml->load($file_path.'.xml');
	
	$key = substr(uniqid(), -rand(4,5));
	$keys = $xml->getElementsByTagName('keys')->item(0);
	
	// Check if the key is already present in the xml file
	$key_found = false;
	
	foreach($keys->childNodes as $current_key) {
		if($current_key->nodeValue == $key) {
			$key_found = true;
			break;
		}
	}
	
	// Add key to xml file only if it's not already present
	if(!$key_found)
		$keys->appendChild($xml->createElement('key',$key));
	
	$xml->save($file_path.'.xml');
	
	// Create (or re-create) the security file
	if(!file_exists($security_file))	
		file_put_contents($security_file, securityHTML(), LOCK_EX);
	
	// Resize and compress if this is a JPEG file
	switch($mimetype) {
		case 'image/gif':
			$ext = 'gif';
			break;
		
		case 'image/jpeg':
			$ext = 'jpg';
			break;
		
		case 'image/png':
			$ext = 'png';
			break;
		
		default:
			$ext = null;
	}
	
	// Get the file extension if could not get it through MIME
	if(!$ext)
		$ext = getFileExt($file_path);
	
	if(($ext == 'gif') || ($ext == 'jpg') || ($ext == 'png')) {
		// Resize the image
		resizeImage($file_path, $ext, 1024, 1024);
		
		// Copy the image
		$thumb = $file_path.'_thumb.'.$ext;
		copy($file_path, $thumb);
		
		// Create the thumbnail
		if(resizeImage($thumb, $ext, 140, 105))
			$thumb_xml = '<thumb>'.htmlspecialchars($location.'store/share/'.$md5.'_thumb.'.$ext).'</thumb>';
	}
	
	// Return the path to the file
	exit(
	'<jappix xmlns=\'jappix:file:post\'>
		<href>'.htmlspecialchars($location.'?m=download&file='.$md5.'&key='.$key.'&ext=.'.$ext).'</href>
		<title>'.htmlspecialchars($filename).'</title>
		<type>'.htmlspecialchars($mimetype).'</type>
		<length>'.htmlspecialchars(filesize($file_path)).'</length>
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