<?php

/*

Jappix - An Open μSocial Platform
This is the PHP script used to reach the good media services

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 13/04/10

*/

// REQUIRE THE NEEDED FILES
	require_once('../conf/main.php');
	require_once('./functions.php');
	
	if(!isDeveloper())
		hideErrors();

// WE GET THE MEDIA ID
	if(isset($_GET['id'])) {
		$id = $_GET['id'];
	}

	else {
		$id = 'undefined';
	}

// WE GET THE MEDIA SERVICE PROVIDER
	if(isset($_GET['service'])) {
		$service = $_GET['service'];
	
		switch($service) {
			case 'youtube':
				$code = '<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/'.$id.'&amp;autoplay=1"></param><embed src="http://www.youtube.com/v/'.$id.'&amp;autoplay=1" type="application/x-shockwave-flash" width="640" height="385"></embed></object>';
				break;
			case 'dailymotion':
				$code = '<object width="640" height="385"><param name="movie" value="http://www.dailymotion.com/swf/video/'.$id.'&amp;autoplay=1"></param><param name="allowFullScreen" value="false"></param><embed type="application/x-shockwave-flash" src="http://www.dailymotion.com/swf/video/'.$id.'&amp;autoplay=1" width="640" height="385" allowfullscreen="true" allowscriptaccess="always"></embed></object>';
				break;
			case 'vimeo':
				$code = '<object width="640" height="385"><param name="allowfullscreen" value="true" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id='.$id.'&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1&amp;autoplay=1" /><embed src="http://vimeo.com/moogaloop.swf?clip_id='.$id.'&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1&amp;autoplay=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="640" height="385"></embed></object>';
				break;
			case 'theora':
			case 'video':
				$code = $code = '<video width="640" height="385" src="'.$id.'" controls autoplay></video>';
				break;
			case 'vorbis':
			case 'audio':
				$code = $code = '<audio src="'.$id.'" controls autoplay></audio>';
				break;
			case 'image':
				$code = $code = '<a href="'.$id.'" target="_blank"><img alt="Image" src="'.$id.'" /></a>';
				break;
			default:
				$code = 'undefined';
				break;
		}
	}

// WE DISPLAY THE HTML MARKUP
	echo $code;

?>
