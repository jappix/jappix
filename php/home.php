<?php

/*

Jappix - An open social platform
This is the Jappix home html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 01/11/10

*/

?>
	<!-- BEGIN HOMEPAGE -->
	<div id="home" class="showable">
		<div class="main">
			<div class="left">
				<div class="home-images logo"></div>
				<p class="upper"><?php _e("Communicate with the entire world!"); ?></p>
				<p class="secondary"><?php _e("Jappix is a non-profit social platform, that you can access wherever you are, whenever you want and communicate with whovever you want."); ?></p>
				<p class="secondary"><?php _e("It allows you to get in touch with the millions of users who currently use the XMPP network like you do with Jappix. Join the community and stay free!"); ?></p>
			</div>
			
			<div class="right">
				<h1 class="top default"><?php _e("Hi there!"); ?></h1>
				<h1 class="top sub loginer anonymouser registerer">&laquo; <a class="previous" onclick="switchHome('default');"><?php _e("Previous"); ?></a></h1>
				
				<!-- The default homepage div -->
					<div class="default homediv">
						<p><?php printf(T_("Welcome on %1s, « %2s »."), htmlspecialchars(SERVICE_NAME), htmlspecialchars(SERVICE_DESC)); ?></p>
						
						<p><?php _e("Login to your existing XMPP account or create a new one for free!"); ?></p>
						
						<a class="button login buttons-images">
							<span class="home-images"></span>
							<p><?php _e("Login"); ?></p>
						</a>
						
						<a class="button register buttons-images">
							<span class="home-images"></span>
							<p><?php _e("Register"); ?></p>
						</a>
						
						<p class="notice"><?php echo str_replace("PostPro", "<a href='http://www.post-pro.fr/'>PostPro</a>", T_("Jappix is an open-source project from PostPro, a non-profit organization which provides us a great help.")); ?></p>
					</div>
				
				<!-- The login homepage div -->
					<div class="loginer homediv">
						<p><?php printf(T_("Login to your existing XMPP account. You can also use the %s to join a groupchat."), '<a onclick="return switchHome(\'anonymouser\');">'.T_("anonymous mode").'</a>'); ?></p>
						
						<form action="#" method="post" onsubmit="return doLogin();">
							<fieldset>
								<legend><?php _e("Required"); ?></legend>
								
								<label for="lnick"><?php _e("Address"); ?></label>
								<input type="text" class="nick resetable" id="lnick" /><span class="jid">@</span><input type="text" class="server resetable" id="lserver" value="<?php echo HOST_MAIN; ?>" <?php lockHost(); ?>/>
								<label for="lpassword"><?php _e("Password"); ?></label>
								<input type="password" class="password resetable" id="lpassword" />
								<label for="lremember"><?php _e("Remember me"); ?></label>
								<input type="checkbox" class="remember" id="lremember" />
							</fieldset>
							
							<a class="advanced home-images showable" onclick="return showAdvanced();"><?php _e("Advanced"); ?></a>
							
							<fieldset class="hidable advanced">
								<legend><?php _e("Advanced"); ?></legend>
								
								<label for="lresource"><?php _e("Resource"); ?></label>
								<input type="text" class="resource resetable" id="lresource" value="<?php echo JAPPIX_RESOURCE; ?>" />
								<label for="lpriority"><?php _e("Priority"); ?></label>
								<select class="priority resetable" id="lpriority">
									<option value="1"><?php _e("Low"); ?></option>
									<option value="10"><?php _e("Medium"); ?></option>
									<option value="100"><?php _e("High"); ?></option>
								</select>
							</fieldset>
							
							<input type="submit" value="<?php _e('Here we go!'); ?>" />
						</form>
					</div>
				
				<!-- The anonymous homepage div -->
					<div class="anonymouser homediv">
						<p><?php printf(T_("Enter the groupchat you want to join and the nick you want to have. You can also go back to the %s."), "<a onclick=\"return switchHome('loginer');\">".T_("login page")."</a>"); ?></p>
						
						<form action="#" method="post" onsubmit="return doAnonymous();">
							<fieldset>
								<legend><?php _e("Required"); ?></legend>
								
								<label><?php _e("Room"); ?></label>
								<input type="text" class="room resetable"<?php disableInput(ANONYMOUS) ?> />
								
								<label><?php _e("Nickname"); ?></label>
								<input type="text" class="nick resetable"<?php disableInput(ANONYMOUS) ?> />
							</fieldset>
							
							<input type="submit" value="<?php _e('Here we go!'); ?>"<?php disableInput(ANONYMOUS) ?> />
						</form>
						
						<div class="info report hidable">
							<?php _e("Share this link with your friends:"); ?>
							<span></span>
						</div>
					</div>
				
				<!-- The register homepage div -->
					<div class="registerer homediv">
						<p><?php _e("Register a new XMPP account to join your friends on your own social cloud. That's simple!"); ?></p>
						
						<form action="#" method="post" onsubmit="return doRegister();">
							<fieldset>
								<legend><?php _e("Required"); ?></legend>
								
								<label for="rnick"><?php _e("Address"); ?></label>
								<input type="text" class="nick resetable" id="rnick" /><span class="jid">@</span><input type="text" class="server resetable" id="rserver" value="<?php echo HOST_MAIN; ?>" <?php lockHost(); ?>/>
								<label for="rpassword"><?php _e("Password"); ?></label>
								<input type="password" class="password resetable" id="rpassword" />
								<label for="spassword"><?php _e("Confirm"); ?></label><input type="password" class="spassword resetable" id="spassword" />
							</fieldset>
							
							<input type="submit" value="<?php _e('Here we go!'); ?>" />
						</form>
						
						<div class="info success hidable">
							<?php _e("You have been registered, here is your XMPP address:"); ?> <b></b>
						</div>
					</div>
				
				<div class="navigation">
					<a class="home-images mobile" href="./?m=mobile<?php echo keepGet('m', false); ?>"><?php _e("Mobile"); ?></a>
					<a class="home-images manager" href="./?m=manager<?php echo keepGet('m', false); ?>"><?php _e("Manager"); ?></a>
					<a class="home-images project" href="http://project.jappix.com"><?php _e("Project"); ?></a>
					<?php if(sslCheck()) echo sslLink(); ?>
				</div>
			</div>
		</div>
		
		<div class="locale">
			<span class="current"><?php echo getLanguageName($locale); ?></span>
			
			<span class="list">
				<?php echo languageSwitcher($locale, false); ?>
			</span>
		</div>
		
		<?php
		
			// Add the notice
			$conf_notice = readNotice();
			$type_notice = $conf_notice['type'];
			$text_notice = $conf_notice['notice'];
			
			// Simple notice
			if(($type_notice == 'simple') || ($type_notice == 'advanced')) {
				// We must encode special HTML characters
				if($type_notice == 'simple')
					$text_notice = '<span class="title home-images">'.T_("Notice").'</span><span class="text">'.htmlentities($text_notice).'</span>';
				
				// Echo the notice
				echo('<div class="notice '.$type_notice.'">'.$text_notice.'</div>');
			}
		
		?>
	</div>
	<!-- END HOMEPAGE -->
