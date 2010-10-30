<?php

/*

Jappix - An open social platform
This is the Jappix notification board HTML markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

?>
	<!-- BEGIN ERROR BANNER -->
	<div id="error" onclick="closeThisError();">			
			<p class="board" data-id="1"><?php _e("Jappix has been interrupted by a network issue, a bug or bad login (check that you entered the right credentials), sorry for the inconvenience."); ?></p>
			<p class="board" data-id="2"><?php _e("The element list on this server could not be obtained!"); ?></p>
			<p class="board" data-id="3"><b><?php _e("Error"); ?></b> &raquo; <span></span></p>
			<p class="board" data-id="4"><?php _e("An error occured while attaching your file: maybe it is too big (6Mio maximum) or forbidden!"); ?></p>
	</div>
	<!-- END ERROR BANNER -->
	
	<!-- BEGIN INFO BANNER -->
	<div id="info" onclick="closeThisInfo();">
		<!-- options infos -->
			<p class="board" data-id="1"><?php _e("Your password has been changed, now you can connect to your account with your new login data."); ?></p>
			<p class="board" data-id="2"><?php _e("Your XMPP account has been removed, bye!"); ?></p>
		
		<!-- session infos -->
			<p class="board" data-id="3"><?php _e("You have been logged out of your XMPP account, have a nice day!"); ?></p>
		
		<!-- groupchat infos -->
			<p class="board" data-id="4"><?php _e("The room you joined seems not to exist. You should create it!"); ?></p>
			<p class="board" data-id="5"><?php _e("The groupchat has been removed, now someone else will be able to recreate it."); ?></p>
			<p class="board" data-id="6"><?php _e("The user that you want to reach is not present in the room."); ?></p>
		
		<!-- browser infos -->
			<p class="board" data-id="7"><?php _e("Your browser does not support this functionality, please try Mozilla Firefox."); ?></p>
		
		<!-- no javascript infos -->
			<noscript>
				<p class="board info-board" style="display: block;"><?php _e("JavaScript is missing in your web browser, so that you will not be able to launch Jappix! Please fix this."); ?></p>
			</noscript>
		
		<!-- internet explorer infos -->
			<!--[if lt IE 9]><p class="board" style="display: block;"><?php _e("Your web browser is obsolete and will not work correctly with Jappix, please try Mozilla Firefox."); ?></p><![endif]-->
	</div>
	<!-- END INFO BANNER -->
