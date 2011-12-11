<?php

/*

Jappix - The instant messaging. Reinvented.
This is the PHP script used to reach the good video services

-------------------------------------------------

Licence : GNU/GPL
Author : Vanaryon
Contact : mailing-list[at]jappix[dot]com
Last revision : 13/04/10

*/

// WE GET THE VIDEO ID
	if(isset($_GET['id'])) {
		$id = $_GET['id'];
	}

	else {
		$id = 'undefined';
	}

// WE GET THE VIDEO SERVICE PROVIDER
	if(isset($_GET['service'])) {
		$service = $_GET['service'];
	
		switch($service) {
			case 'youtube':
				$code = '<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/'.$id.'"></param><embed src="http://www.youtube.com/v/'.$id.'" type="application/x-shockwave-flash" width="640" height="385"></embed></object>';
				break;
			case 'dailymotion':
				$code = '<object width="640" height="385"><param name="movie" value="http://www.dailymotion.com/swf/video/'.$id.'"></param><param name="allowFullScreen" value="false"></param><embed type="application/x-shockwave-flash" src="http://www.dailymotion.com/swf/video/'.$id.'" width="640" height="385" allowfullscreen="true" allowscriptaccess="always"></embed></object>';
				break;
			case 'vimeo':
				$code = '<object width="640" height="385"><param name="allowfullscreen" value="true" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id='.$id.'&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" /><embed src="http://vimeo.com/moogaloop.swf?clip_id='.$id.'&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="640" height="385"></embed></object>';
				break;
			default:
				$code = 'undefined';
				break;
		}
	}

// WE DISPLAY THE HTML MARKUP
	echo $code;

?>
