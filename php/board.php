<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix notification board HTML markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/06/10

*/

?>
	<!-- BEGIN JS DETECTION -->
	<noscript>
		<p class="info-p info-js board" style="display: block;"><?php _e("JavaScript is missing in your web browser, so that you'll not be able to launch the Jappix app ! Please fix this."); ?></p>
	</noscript>
	<!-- END JS DETECTION -->
	
	<!-- BEGIN ERROR BANNER -->
	<div id="error" onclick="closeThisError();">			
			<p class="error-p error-1 board"><?php _e("Jappix has been interrupted by a network issue, a bug or bad login (check that you entered the right credentials), sorry for the inconvenience."); ?></p>
			<p class="error-p error-2 board"><?php _e("I couldn't obtain the element list on this server!"); ?></p>
			<p class="error-p error-3 board"><b><?php _e("Error"); ?></b> &raquo; <span class="code"></span><span class="ucode" style="display: none;"><?php _e("unknown error code") ?></span>, <span class="reason"></span><span class="ureason" style="display: none;"><?php _e("unknown error reason.") ?></span> <span class="condition"></span></p>
			<p class="error-p error-4 board"><?php _e("An error occured while attaching your file: maybe it is too big (6Mio maximum) or forbidden!"); ?></p>
	</div>
	<!-- END ERROR BANNER -->
	
	<!-- BEGIN INFO BANNER -->
	<div id="info" onclick="closeThisInfo();">
		<!-- options infos -->
			<p class="info-p info-1 board"><?php _e("Your password has been changed, now you can connect to your account with your new login data."); ?></p>
			<p class="info-p info-2 board"><?php _e("Your XMPP account has been successfully removed, bye!"); ?></p>
		
		<!-- groupchat infos -->
			<p class="info-p info-5 board"><?php _e("The room you joined seems not to exist. You should create it!"); ?></p>
			<p class="info-p info-6 board"><?php _e("The groupchat has been removed, now someone else will be able to recreate it."); ?></p>
			<p class="info-p info-7 board"><?php _e("The user that you want to reach (message, punishment) is not present in the room."); ?></p>
			<p class="info-p info-9 board"><?php _e("You've been banned from a groupchat, you will be not be able to join it again, until the ban is lifted."); ?></p>
			<p class="info-p info-10 board"><?php _e("You've been kicked from a groupchat."); ?></p>
		
		<!-- session infos -->
			<p class="info-p info-3 board"><?php _e("You've been sucessfully logged out of your XMPP account, have a nice day!"); ?></p>
		
		<!-- browser infos -->
			<p class="info-p info-11 board"><?php _e("Your browser does not support this functionnality, please try with Mozilla Firefox."); ?></p>
		
		<?php if(!storeWritable()) { ?>
		<!-- system infos -->
			<p class="info-p info-13 board" style="display: block;"><?php _e("It seems that one of your storage folder is not writable by PHP, please fix this before using Jappix."); ?></p>
		<?php } ?>
		
		<!-- internet explorer infos -->
			<!--[if lt IE 9]><p class="info-p info-12 board" style="display: block;"><?php _e("Your browser is obsolete/old and will not work correctly with Jappix, you can try Mozilla Firefox."); ?></p><![endif]-->
	</div>
	<!-- END INFO BANNER -->
