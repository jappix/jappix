<?php

/*

Jappix - An Open μSocial Platform
This is the file get script

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 01/07/10

*/

// We get the needed files
require_once('../conf/main.php');
require_once('../conf/hosts.php');
require_once('./jsmin.php');
require_once('./functions.php');

// If we run developer mode, disable any caching
if(isDeveloper()) {
	header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
	header('Cache-Control: no-store, no-cache, must-revalidate');
	header('Cache-Control: post-check=0, pre-check=0', false);
	header('Pragma: no-cache');
}

// Else, we put a far away cache date (1 year)
else {
	hideErrors();
	$expires = 60*60*24*365;
	header('Pragma: public');
	header('Cache-Control: maxage='.$expires);
	header('Expires: '.gmdate('D, d M Y H:i:s', time()+$expires).' GMT');
}

// We get the sent data
$type = $_GET['t'];
$file = $_GET['f'];
$hash = $_GET['h'];

// We check if this is not a hacking query
$hacking = preg_match('/\.\.\//', $file);

// We check if the data has been submitted
if(isset($type) && isset($file) && isset($hash) && ($type == 'css' || $type == 'img' || $type == 'js' || $type == 'snd') && !$hacking) {
	// We define the file path
	$path = '../'.$type.'/'.$file;
	$cache_hash = md5($type.$file.$hash);
	$position = strpos($file, '~');
	
	// If this is a groupfile
	if($position != false && ($type == 'js' || $type == 'css')) {
		// We set special MIMEs that PHP cannot read correctly
		if($type == 'css')
			header('Content-Type: text/css; charset=utf-8');
		else if($type == 'js')
			header('Content-Type: application/javascript; charset=utf-8');
		
		// We GZIP the output content
		gzipThis();
		
		// If there's a cache file, read it
		if(hasCache($cache_hash) && !isDeveloper())
			echo readCache($cache_hash);
		
		// Else, we generate the cache
		else {
			$dir = '../'.$type.'/';
			groupFile($file, $dir, $type, HOST_STATIC, $cache_hash, isDeveloper());
		}
	}
	
	// If this is a single file
	else if(file_exists($path)) {
		// We open the file
		$mime = strtolower(preg_replace('/(^)(.+)(\.)(.+)($)/i', '$4', $file));
		$read = file_get_contents($path);
		
		// We set up a known MIME type
		if($type == 'css')
			header('Content-Type: text/css; charset=utf-8');
		else if($type == 'js')
			header('Content-Type: application/javascript; charset=utf-8');
		else if($mime == 'png')
			header('Content-Type: image/png');
		else if($mime == 'gif')
			header('Content-Type: image/gif');
		else if($mime == 'jpg' || $mime == 'jpeg')
			header('Content-Type: image/jpeg');
		else if($mime == 'oga' || $mime == 'ogg')
			header('Content-Type: audio/ogg');
		
		// Try to catch the file MIME type (can cause 500 errors!)
		else {
			// Get the MIME
			$cmime = mime_content_type($path);
			
			// Output the MIME
			header('Content-Type: '.$cmime);
		}
		
		// We GZIP the text file and display its filtered content
		if($type == 'css' || $type == 'js') {
			// GZip the output content
			gzipThis();
			
			// If there's a cache file, read it
			if(hasCache($cache_hash) && !isDeveloper())
				echo readCache($cache_hash);
			
			// Else, we generate the cache
			else {
				$pathered = setPath($read, HOST_STATIC, $type);
				$dir = '../'.$type.'/';
				
				if($type == 'css' && !isDeveloper())
					$output = compressCSS($pathered);
				else if($type == 'css' && isDeveloper())
					$output = $pathered;
				else if($type == 'js' && !isDeveloper())
					$output = JSMin::minify($pathered);
				else if($type == 'js' && isDeveloper())
					$output = $pathered;
				
				// Display the output content
				echo $output;
				
				// Generate the cache
				genCache($output, isDeveloper(), $cache_hash);
			}
		}
		
		// We display the binary file content
		else
			echo $read;
	}
	
	// The file was not found
	else {
		header("HTTP/1.0 404 Not Found");
		echo 'HTTP/1.0 404 Not Found';
	}
}

// The request is not correct
else {
	header("HTTP/1.0 400 Bad Request");
	echo 'HTTP/1.0 400 Bad Request';
}

?>
