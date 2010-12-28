<?php

/*

Jappix - An open social platform
This is the hosts configuration form (install & manager)

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 28/12/10

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

?>
<fieldset>
	<legend><?php _e("General"); ?></legend>
	
	<label for="host_main"><?php _e("Main host"); ?></label><input id="host_main" type="text" name="host_main" value="<?php echo $host_main; ?>" pattern="[^@/]+" required="" />
	
	<label for="host_muc"><?php _e("Groupchat host"); ?></label><input id="host_muc" type="text" name="host_muc" value="<?php echo $host_muc; ?>" pattern="[^@/]+" />
</fieldset>

<fieldset>
	<legend><?php _e("Advanced"); ?></legend>
	
	<label for="host_anonymous"><?php _e("Anonymous host"); ?></label><input id="host_anonymous" type="text" name="host_anonymous" value="<?php echo $host_anonymous; ?>" pattern="[^@/]+" />
	
	<label for="host_vjud"><?php _e("Directory host"); ?></label><input id="host_vjud" type="text" name="host_vjud" value="<?php echo $host_vjud; ?>" pattern="[^@/]+" />
	
	<label for="host_bosh"><?php _e("BOSH host"); ?></label><input id="host_bosh" type="url" name="host_bosh" value="<?php echo $host_bosh; ?>" required="" />
	
	<input type="hidden" name="host_static" value="<?php echo $host_static; ?>" />
</fieldset>
