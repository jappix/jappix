<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix microblog file attaching script

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

// REQUIRE THE NEEDED FILES
	require_once('../conf/main.php');
	require_once('./functions.php');
	
	if(!isDeveloper())
		hideErrors();

// GET SOME VALUES
	$user = $_POST['user'];
	$filename = $_POST['filename'];
	$ext = strtolower(preg_replace('/(^)(.+)(\.)(.+)($)/i', '$4', $filename));
	$new_name = preg_replace('/(^)(.+)(\.)(.+)($)/i', '$2', $filename);
	$data = $_POST['data'];

// IF EVERYTHING WAS SENT & CORRECT
	if(isset($user) && isset($filename) && isset($data) && !preg_match('/((.+)|(^))(php)((.+)|($))/i', $ext)) {
		// DEFINE SOME VARIABLES
			$content_dir = '../store/share/'.$user;
			$name = md5(time().$filename).'.'.$ext;
			$path = $content_dir.'/'.$name;
		
		// INITIALIZE
			if(!is_dir($content_dir)) {
				mkdir($content_dir, 0777, true);
				chmod($content_dir, 0777);
			}
		
		// PUT THE CONTENT IN THE FILE
			file_put_contents($path, base64_decode($data));
		
		// SECURITY: REMOVE THE FILE AND STOP THE SCRIPT IF TOO BIG (6Mio+)
			if(filesize($path) > 6000000) {
				unlink($path);
				exit('');
			}
		
		// RESIZE IF THE IMAGE IS A JPEG FILE (AND GD IS INSTALLED)
			if(($ext == 'jpg' || $ext == 'jpeg') && function_exists('gd_info')) {
				// Initialize GD
				$img_resize = imagecreatefromjpeg($path);
				$img_size = getimagesize($path);
				$img_width = $img_size[0];
				$img_height = $img_size[1];
				
				// Necessary to change the image sizes
				if(($img_width > 1024) || ($img_height > 1024)) {
					// Process the new sizes
					$new_width = 1024;
					$img_process = (($new_width * 100) / $img_width);
					$new_height = (($img_height * $img_process) / 100);
				}
				
				// Else, just indicate the old sizes
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
		
		// PROCESS THE FILE TYPE
			$file_type = 'others';
			
			switch($ext) {
				// Images
				case 'jpg':
				case 'jpeg':
				case 'png':
				case 'bmp':
				case 'gif':
				case 'tif':
				case 'svg':
				case 'psp':
				case 'xcf':
					$file_type = 'image';
					break;
				
				// Videos
				case 'ogv':
				case 'mkv':
				case 'avi':
				case 'mov':
				case 'mp4':
				case 'm4v':
				case 'wmv':
				case 'asf':
				case 'mpg':
				case 'mpeg':
				case 'ogm':
				case 'rmvb':
				case 'rmv':
				case 'qt':
				case 'flv':
				case 'ram':
					$file_type = 'video';
					break;
				
				// Sounds
				case 'oga':
				case 'ogg':
				case 'mka':
				case 'flac':
				case 'mp3':
				case 'wav':
				case 'm4a':
				case 'wma':
				case 'rmab':
				case 'rma':
				case 'bwf':
				case 'aiff':
				case 'caf':
				case 'cda':
				case 'atrac':
				case 'vqf':
				case 'au':
				case 'aac':
				case 'm3u':
				case 'mid':
				case 'mp2':
				case 'snd':
				case 'voc':
					$file_type = 'audio';
					break;
				
				// Documents
				case 'pdf':
				case 'odt':
				case 'ott':
				case 'sxw':
				case 'stw':
				case 'ots':
				case 'sxc':
				case 'stc':
				case 'sxi':
				case 'sti':
				case 'pot':
				case 'odp':
				case 'ods':
				case 'doc':
				case 'docx':
				case 'docm':
				case 'xls':
				case 'xlsx':
				case 'xlsm':
				case 'xlt':
				case 'ppt':
				case 'pptx':
				case 'pptm':
				case 'pps':
				case 'odg':
				case 'otp':
				case 'sxd':
				case 'std':
				case 'std':
				case 'rtf':
				case 'txt':
				case 'htm':
				case 'html':
				case 'shtml':
				case 'dhtml':
				case 'mshtml':
					$file_type = 'document';
					break;
				
				// Packages
				case 'tgz':
				case 'gz':
				case 'tar':
				case 'ar':
				case 'cbz':
				case 'jar':
				case 'tar.7z':
				case 'tar.bz2':
				case 'tar.gz':
				case 'tar.lzma':
				case 'zip':
				case 'rar':
				case 'bz':
				case 'deb':
				case 'rpm':
				case '7z':
				case 'ace':
				case 'cab':
				case 'arj':
				case 'msi':
					$file_type = 'package';
					break;
				
				// Others
				default:
					$file_type = 'other';
					break;
			}
		
		// SET A SPECIAL XML HEADER
			header('content-type: text/xml; charset=utf-8');
		
		// RETURN THE PATH TO THE FILE
			exit('<jappix xmlns=\'jappix:social:attach\'><url>store/share/'.$user.'/'.$name.'</url><name>'.$new_name.'</name><type>'.$file_type.'</type><ext>'.$ext.'</ext></jappix>');
	}

?>
