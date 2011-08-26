<?php

/*

Jappix - An open social platform
This is the PHP script used to generate a chat log

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 26/08/11

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

// Create the HTML file to be downloaded
if(isset($_POST['content']) && isset($_POST['xid']) && !empty($_POST['xid']) && isset($_POST['nick']) && !empty($_POST['nick']) && isset($_POST['avatar']) && !empty($_POST['avatar']) && isset($_POST['date']) && !empty($_POST['date']) && isset($_POST['type']) && !empty($_POST['type'])) {
	// Get the POST vars
	$original = $_POST['content'];
	$xid = $_POST['xid'];
	$nick = $_POST['nick'];
	$avatar = $_POST['avatar'];
	$date = $_POST['date'];
	$type = $_POST['type'];
	
	// Generate the XID link
	$xid_link = 'xmpp:'.$xid;
	
	if($type == 'groupchat')
		$xid_link .= '?join';
	
	// Generates the avatar code
	if($avatar != 'none')
		$avatar = '<div class="avatar-container">'.$avatar.'</div>';
	else
		$avatar = '';
	
	// Generates an human-readable date
	$date = explode('T', $date);
	$date = explode('-', $date[0]);
	$date = $date[2].'/'.$date[1].'/'.$date[0];
	
	// Generate some values
	$content_dir = '../store/logs/';
	$filename = 'chat_log-'.md5($xid.time());
	$filepath = $content_dir.$filename.'.html';
	
	// Jappix logo Base64 code
	$logo = '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';
	
	// Create the HTML code
	$new_text_inter = 
'<!DOCTYPE html>
<html>	

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>'.$nick.' ('.$xid.')</title>
	<style type="text/css">
		* {
			margin: 0;
			padding: 0;
		}
		
		body {
			background-color: #424242;
			font-family : Verdana, Arial, Helvetica, sans-serif;
			font-size: 0.8em;
			text-shadow: 0 0 5px white;
			color: white;
			margin: 8px;
			padding: 8px 12px;
		}
		
		a {
			color: white;
		}
		
		#head {
		
		}
		
		#head .avatar-container {
			text-align: center;
			float: left;
			height: 70px;
			width: 70px;
			margin-right: 18px;
		}
		
		#head .avatar {
			max-height: 70px;
			max-width: 70px;
		}
		
		#head h1 {
			font-size: 2.2em;
			margin: 0;
			text-shadow: 1px 1px 1px black;
		}
		
		#head h3 {
			font-size: 0.95em;
			margin: 0;
		}
		
		#head h5 {
			font-size: 0.9em;
			margin: 8px 0 16px 0;
		}
		
		#head h3,
		#head h5 {
			text-shadow: 0 0 1px black;
		}
		
		#head a.logo {
			position: absolute;
			top: 16px;
			right: 20px;
		}
		
		#content {
			background-color: #e8f1f3;
			color: black;
			padding: 14px 18px;
			border-radius: 4px;
			clear: both;
			-moz-border-radius: 4px;
			-webkit-border-radius: 4px;
			box-shadow: 0 0 20px #202020;
			-moz-box-shadow: 0 0 20px #202020;
			-webkit-box-shadow: 0 0 20px #202020;
		}
		
		#content a {
			color: black;
		}
		
		#content .one-group {
			border-bottom: 1px dotted #d0d0d0;
			padding-bottom: 8px;
			margin-bottom: 10px;
		}
		
		#content .one-group b.name {
			display: block;
			margin-bottom: 4px;
		}
		
		#content .one-group b.name.me {
			color: #123a5c;
		}
		
		#content .one-group b.name.him {
			color: #801e1e;
		}
		
		#content .one-group span.date {
			float: right;
			font-size: 0.9em;
		}
		
		#content .user-message {
			margin-bottom: 3px;
		}
		
		#content .system-message {
			color: #053805;
			margin-bottom: 3px;
			padding-left: 0 !important;
		}
		
		#content .system-message a {
			color: #053805;
		}
		
		.hidden {
			display: none !important;
		}
	</style>
</head>

<body>
	<div id="head">
		'.$avatar.'
		
		<h1>'.$nick.'</h1>
		<h3><a href="'.$xid_link.'">'.$xid.'</a></h3>
		<h5>'.$date.'</h5>
		
		<a class="logo" href="https://project.jappix.com/" target="_blank">
			<img src="data:image/png;base64,'.$logo.'" alt="" />
		</a>
	</div>
	
	<div id="content">
		'.$original.'
	</div>
</body>
</html>'
;
	
	$new_text = stripslashes($new_text_inter);
	
	// Write the code into a file
	file_put_contents($filepath, $new_text);
	
	// Security: remove the file and stop the script if too bit (+6MiB)
	if(filesize($filepath) > 6000000) {
		unlink($filepath);
		exit;
	}
	
	// Return to the user the generated file ID
	exit($filename);
}

?>
