<?php

/*

Jappix - An open social platform
This is the Jappix music search script

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 18/12/10

*/

// PHP base
define('PHP_BASE', '..');

// Get the needed files
require_once('./functions.php');
require_once('./read-main.php');

// Hide PHP errors
hideErrors();

// If valid data was sent
if((isset($_GET['searchquery']) && !empty($_GET['searchquery'])) && (isset($_GET['location']) && !empty($_GET['location']))) {
	// Set a XML header
	header('content-type: text/xml; charset=utf-8');
	
	// Get the values
	$searchquery = $_GET['searchquery'];
	$location = $_GET['location'];
	
	// Initialize
	$xml = '<data>';
	$searchquery = strtolower($searchquery);
	
	// Escape the regex special characters
	$searchquery = escapeRegex($searchquery);
	
	// Search in the directory
	$repertory = '../store/music/';
	$scan = scandir($repertory);
	
	foreach($scan as $current) {
		// This file match our query!
		if(is_file($repertory.$current) && $current && preg_match('/(^|\s|\[)('.$searchquery.')(.+)?(\.(og(g|a)|mp3|wav))$/i', strtolower($current))) {
			// Get the basic informations
			$title = preg_replace('/^(.+)(\.)(og(g|a)|mp3|wav)$/i', '$1', $current);
			$url = $location.'store/music/'.$current;
			$ext = getFileExt($current);
			$id = md5($url);
			
			// Get the MIME type
			if($ext == 'mp3')
				$type = 'audio/mpeg';
			else if($ext == 'wav')
				$type = 'audio/x-wav';
			else
				$type = 'audio/ogg';
			
			// Get the advanced informations
			$locked_title = $title;
			$artist = '';
			$source = '';
			
			$title_regex = '/^(([^-]+) - )?([^\[]+)( \[(.+))?$/i';
			$artist_regex = '/^(.+) - (.+)$/i';
			$source_regex = '/^(.+) \[(.+)\]$/i';
			
			if(preg_match($title_regex, $locked_title))
				$title = preg_replace($title_regex, '$3', $locked_title);
			
			if(preg_match($artist_regex, $locked_title))
				$artist = preg_replace($artist_regex, '$1', $locked_title);
			
			if(preg_match($source_regex, $locked_title))
				$source = preg_replace($source_regex, '$2', $locked_title);
			
			// Generate the XML
			$xml .= '<data><track><name>'.htmlspecialchars($title).'</name><artist>'.htmlspecialchars($artist).'</artist><source>'.htmlspecialchars($source).'</source><id>'.htmlspecialchars($id).'</id><url>'.htmlspecialchars($url).'</url><type>'.$type.'</type></track></data>';
		}
   	}
	
	// End
	$xml .= '</data>';
	
	// Return the path to the file
	exit($xml);
}

?>
