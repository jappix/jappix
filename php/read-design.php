<?php

/*

Jappix - An open social platform
This is the design configuration reader

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 31/10/10

*/

// Get the available backgrounds
$backgrounds = getBackgrounds();
$backgrounds_number = count($backgrounds);

// Read the background configuration
$background = readBackground();

// Backgrounds are missing?
if(!$backgrounds_number && ($background['type'] == 'image'))
	$background['type'] = 'default';

switch($background['type']) {
	// Simple notice input
	case 'image':
		$background_image = ' checked="checked"';
		$background_default = '';
		
		break;
	
	// Advanced notice input
	case 'color':
		$background_color = ' checked="checked"';
		$background_default = '';
		
		break;
}

switch($background['image_repeat']) {
	// No repeat
	case 'no-repeat':
		$background_image_repeat_no = ' selected="selected"';
		$background_image_repeat_x = '';
		
		break;
		
	// Repeat
	case 'repeat':
		$background_image_repeat_all = ' selected="selected"';
		$background_image_repeat_x = '';
		
		break;
	
	// Y repeat
	case 'repeat-y':
		$background_image_repeat_y = ' selected="selected"';
		$background_image_repeat_x = '';
		
		break;
}

switch($background['image_horizontal']) {
	// Left position
	case 'left':
		$background_image_horizontal_left = ' selected="selected"';
		$background_image_horizontal_center = '';
		
		break;
	
	// Right position
	case 'right':
		$background_image_horizontal_right = ' selected="selected"';
		$background_image_horizontal_center = '';
		
		break;
}

switch($background['image_vertical']) {
	// Left position
	case 'top':
		$background_image_vertical_top = ' selected="selected"';
		$background_image_vertical_center = '';
		
		break;
	
	// Right position
	case 'bottom':
		$background_image_vertical_bottom = ' selected="selected"';
		$background_image_vertical_center = '';
		
		break;
}

if($background['image_adapt'] == 'on')
	$background_image_adapt = ' checked="checked"';

// Read the notice configuration
$notice_conf = readNotice();
$notice_text = $notice_conf['notice'];

switch($notice_conf['type']) {
	// Simple notice input
	case 'simple':
		$notice_simple = ' checked="checked"';
		$notice_none = '';
		
		break;
	
	// Advanced notice input
	case 'advanced':
		$notice_advanced = ' checked="checked"';
		$notice_none = '';
		
		break;
}

?>
