<?php

/*

Jappix - An open social platform
This is the user add form (install & manager)

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 26/10/10

*/

?>

<fieldset>
	<legend><?php _e("New"); ?></legend>
	
	<label for="user_name"><?php _e("User"); ?></label><input id="user_name" type="text" name="user_name" value="<?php echo(htmlspecialchars($user_name)); ?>" maxlength="30" />
	
	<label for="user_password"><?php _e("Password"); ?></label><input id="user_password" type="password" name="user_password" maxlength="40" />
	
	<label for="user_repassword"><?php _e("Confirm"); ?></label><input id="user_repassword" type="password" name="user_repassword" maxlength="40" />
</fieldset>
