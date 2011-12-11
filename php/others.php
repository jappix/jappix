<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix others stuffs html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

?>
	<!-- BEGIN GENERAL-WAIT -->
	<div id="general-wait" class="hidable">
		<div class="general-wait-content">
			<div class="wait-medium"></div>
		</div>
	</div>
	<!-- END GENERAL-WAIT -->
	
	<!-- BEGIN AUDIO -->
		<div id="audio">
		</div>
	<!-- END AUDIO -->
	
	<!-- BEGIN DATA -->
	<div id="data">		
		<div class="hosts">
			<input class="host-main" type="hidden" value="<?php echo HOST_MAIN; ?>" />
			<input class="host-muc" type="hidden" value="<?php echo HOST_MUC; ?>" />
			<input class="host-anonymous" type="hidden" value="<?php echo HOST_ANONYMOUS; ?>" />
		</div>
		
		<div class="translate">
			<input class="translation-12" type="hidden" value="<?php _e("unknown"); ?>" />
			<input class="translation-14" type="hidden" value="<?php _e("Available"); ?>" />
			<input class="translation-15" type="hidden" value="<?php _e("Talkative"); ?>" />
			<input class="translation-16" type="hidden" value="<?php _e("Away"); ?>" />
			<input class="translation-17" type="hidden" value="<?php _e("Not available"); ?>" />
			<input class="translation-18" type="hidden" value="<?php _e("Busy"); ?>" />
			<input class="translation-19" type="hidden" value="<?php _e("Unavailable"); ?>" />
			<input class="translation-28" type="hidden" value="<?php _e("Add this room to my favorites"); ?>" />
			<input class="translation-32" type="hidden" value="<?php _e("Delete"); ?>" />
			<input class="translation-33" type="hidden" value="<?php _e("Reply"); ?>" />
			<input class="translation-34" type="hidden" value="<?php _e("Hide"); ?>" />
			<input class="translation-35" type="hidden" value="<?php _e("Forbidden"); ?>" />
			<input class="translation-36" type="hidden" value="<?php _e("Error"); ?>" />
			<input class="translation-37" type="hidden" value="<?php _e("Me"); ?>" />
			<input class="translation-40" type="hidden" value="<?php _e("Remove"); ?>" />
			<input class="translation-41" type="hidden" value="<?php _e("Rename"); ?>" />
			<input class="translation-42" type="hidden" value="<?php _e("I would like to add you in my buddy list."); ?>" />
			<input class="translation-43" type="hidden" value="<?php _e("Requesting this service..."); ?>" />
			<input class="translation-44" type="hidden" value="<?php _e("Service offline or broken"); ?>" />
			<input class="translation-45" type="hidden" value="<?php _e("joined the chat room."); ?>" />
			<input class="translation-46" type="hidden" value="<?php _e("just left the chat room."); ?>" />
			<input class="translation-52" type="hidden" value="<?php _e("would like to add you as a friend."); ?>" />
			<input class="translation-53" type="hidden" value="<?php _e("Yes"); ?>" />
			<input class="translation-54" type="hidden" value="<?php _e("No"); ?>" />
			<input class="translation-55" type="hidden" value="<?php _e("would like you to join this chatroom:"); ?>" />
			<input class="translation-56" type="hidden" value="<?php _e("Do you accept?"); ?>" />
			<input class="translation-57" type="hidden" value="<?php _e("would like to get an authorization."); ?>" />
			<input class="translation-58" type="hidden" value="<?php _e("Submit"); ?>" />
			<input class="translation-59" type="hidden" value="<?php _e("Cancel"); ?>" />
			<input class="translation-60" type="hidden" value="<?php _e("See his/her position on the globe"); ?>" />
			<input class="translation-61" type="hidden" value="<?php _e("anonymous mode"); ?>" />
			<input class="translation-62" type="hidden" value="<?php _e("Password"); ?>" />
			<input class="translation-63" type="hidden" value="<?php _e("Nick"); ?>" />
			<input class="translation-64" type="hidden" value="<?php _e("Others"); ?>" />
			<input class="translation-65" type="hidden" value="<?php _e("Group"); ?>" />
			<input class="translation-66" type="hidden" value="<?php _e("Authorize"); ?>" />
			<input class="translation-67" type="hidden" value="<?php _e("Close"); ?>" />
			<input class="translation-68" type="hidden" value="<?php _e("View the profile of this user"); ?>" />
			<input class="translation-69" type="hidden" value="<?php _e("Repeat this notice"); ?>" />
			<input class="translation-71" type="hidden" value="<?php _e("Channel of"); ?>" />
			<input class="translation-72" type="hidden" value="<?php _e("Previous"); ?>" />
			<input class="translation-73" type="hidden" value="<?php _e("Remove this notice"); ?>" />
			<input class="translation-74" type="hidden" value="<?php _e("Authorization failed"); ?>" />
			<input class="translation-75" type="hidden" value="<?php _e("Registration failed, please choose a different username"); ?>" />
			<input class="translation-76" type="hidden" value="<?php _e("Service unavailable"); ?>" />
			<input class="translation-77" type="hidden" value="<?php _e("Internal server error, try later"); ?>" />
			<input class="translation-78" type="hidden" value="<?php _e("More notices..."); ?>" />
			<input class="translation-79" type="hidden" value="<?php _e("Browse"); ?>" />
			<input class="translation-80" type="hidden" value="<?php _e("Command"); ?>" />
			<input class="translation-81" type="hidden" value="<?php _e("Subscribe"); ?>" />
			<input class="translation-82" type="hidden" value="<?php _e("Join"); ?>" />
			<input class="translation-83" type="hidden" value="<?php _e("Search"); ?>" />
			<input class="translation-84" type="hidden" value="<?php _e("View his/her channel"); ?>" />
			<input class="translation-85" type="hidden" value="<?php _e("My channel"); ?>" />
			<input class="translation-86" type="hidden" value="<?php _e("Your form has been sent successfully."); ?>" />
			<input class="translation-87" type="hidden" value="<?php _e("Gateways"); ?>" />
			<input class="translation-88" type="hidden" value="<?php _e("E-mail"); ?>" />
			
			
			
			<input class="translation-89" type="hidden" value="<?php _e("Your friend is writing a message..."); ?>" />
			<input class="translation-90" type="hidden" value="<?php _e("Your friend stopped writing a message."); ?>" />
			<input class="translation-91" type="hidden" value="<?php _e("Your friend is doing something else."); ?>" />
			<input class="translation-92" type="hidden" value="<?php _e("Your friend closed the chat."); ?>" />
			<input class="translation-93" type="hidden" value="<?php _e("Smiley insertion"); ?>" />
			<input class="translation-94" type="hidden" value="<?php _e("Save the chat"); ?>" />
			<input class="translation-95" type="hidden" value="<?php _e("Click on the following link to get the chat log, and wait. Then click again to get the file."); ?>" />
			<input class="translation-96" type="hidden" value="<?php _e("Generate the file!"); ?>" />
			<input class="translation-97" type="hidden" value="<?php _e("Download the file!"); ?>" />
			<input class="translation-98" type="hidden" value="<?php _e("Clean the current chat..."); ?>" />
			<input class="translation-99" type="hidden" value="<?php _e("Display user profile..."); ?>" />
			<input class="translation-100" type="hidden" value="<?php _e("Add this contact to your friends..."); ?>" />
			<input class="translation-101" type="hidden" value="<?php _e("Close the chat"); ?>" />
			<input class="translation-102" type="hidden" value="<?php _e("Moderators"); ?>" />
			<input class="translation-103" type="hidden" value="<?php _e("Participants"); ?>" />
			<input class="translation-104" type="hidden" value="<?php _e("Visitors"); ?>" />
			<input class="translation-105" type="hidden" value="<?php _e("Administration panel for this room..."); ?>" />
			<input class="translation-106" type="hidden" value="<?php _e("Subject"); ?>" />
			<input class="translation-107" type="hidden" value="<?php _e("no subject defined for this room."); ?>" />
		</div>
		
		<div class="system">
			<input class="version" type="hidden" value="<?php echo $version; ?>" />
			<input class="http-base" type="hidden" value="<?php echo HTTP_BASE; ?>" />
		</div>
		
		<div class="titles">
			<input class="home" type="hidden" value="<?php _e("Jappix &bull; An Open μSocial Network"); ?>" />
		</div>
		
		<?php if(anonymousMode()) { ?>
			<div class="anonymous">
				<input class="room" type="hidden" value="<?php echo $_GET['r']; ?>" />
				<input class="nick" type="hidden" value="<?php echo $_GET['n']; ?>" />
			</div>
		<?php } ?>
	</div>
	<!-- END DATA -->
