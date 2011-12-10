<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix home html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Vanaryon
Contact: http://project.jappix.com/contact
Last revision: 03/06/10

*/

?>
	<!-- BEGIN HOMEPAGE -->
	<div id="home" class="showable">
		<div class="locale">
			<span><?php echo getLanguageName($locale); ?></span>
			
			<ul>
				<?php languageSwitcher($locale); ?>
			</ul>
		</div>
		
		<div class="main">
			<div class="left">
				<div class="home-images logo"></div>
				<p class="upper"><?php _e("Communicate with the entire world!"); ?></p>
				<p class="secondary"><?php _e("Jappix is a non-profit micro social network, that you can access wherever you are, whenever you want and communicate with whovever you want."); ?></p>
				<p class="secondary"><?php _e("It allows you to get in touch with the millions of users who currently use the XMPP network like you do with Jappix. Join the community and stay free!"); ?></p>
			</div>
			
			<div class="right">
				<h1 class="top default"><?php _e("Hi there!"); ?></h1>
				<h1 class="top sub loginer registerer">&laquo; <a class="previous" onclick="switchHome('default');"><?php _e("Previous"); ?></a></h1>
				
				<!-- The default homepage div -->
					<div class="default homediv">
						<p><?php echo str_replace("%1s", SERVICE_NAME, str_replace("%2s", SERVICE_DESC, T_("Welcome on %1s, « %2s »."))); ?></p>
						<p><?php _e("Log in to your existing XMPP account or create a new one, with the following buttons"); ?>:</p>
				
						<div class="button login buttons-images" onclick="switchHome('loginer');">
							<div class="home-images"></div>
							<p><?php _e("Login"); ?></p>
						</div>
				
						<div class="button register buttons-images" onclick="switchHome('registerer');">
							<div class="home-images"></div>
							<p><?php _e("Register"); ?></p>
						</div>
				
						<p class="notice"><?php _e("Jappix is an open-source project from the <a href='http://www.post-pro.fr/'>PostPro</a> non-profit organisation, which provides us money for the project and so on."); ?></p>
					</div>
				
				<!-- The login homepage div -->
					<div class="loginer homediv">
						<p><?php _e("Please complete this form to login to your XMPP, Facebook or Google Talk account through Jappix"); ?>:</p>
						
						<form action="#" method="post" onsubmit="return doLogin();">
							<fieldset>
								<legend><?php _e("General"); ?></legend>
								<label for="lnick"><?php _e("XMPP ID"); ?></label>
								<input type="text" class="nick resetable" id="lnick" /><span class="jid">@</span><input type="text" class="server resetable" value="<?php echo HOST_MAIN; ?>" <?php lockHost(); ?>/><br />
								<label for="lpassword"><?php _e("Password"); ?></label>
								<input type="password" class="password resetable" id="lpassword" />
								<label for="lremember"><?php _e("Remember me"); ?></label>
								<input type="checkbox" class="remember" id="lremember" />
							</fieldset>
							
							<a class="advanced showable" onclick="showAdvanced();"><?php _e("Advanced"); ?> ▾</a>
							
							<fieldset class="hidable advanced">
								<legend><?php _e("Advanced"); ?></legend>
								<label for="lresource"><?php _e("Resource"); ?></label>
								<input type="text" class="resource resetable" id="lresource" value="<?php echo JAPPIX_RESOURCE; ?>" /><br />
								<input type="hidden" class="dresource" value="<?php echo JAPPIX_RESOURCE; ?>" />
								<label for="lpriority"><?php _e("Priority"); ?></label>
								<select class="priority resetable" id="lpriority">
									<option value="1"><?php _e("Low"); ?></option>
									<option value="10"><?php _e("Medium"); ?></option>
									<option value="100"><?php _e("High"); ?></option>
								</select>
							</fieldset>
							
							<input type="submit" class="submit" value="<?php _e('Here we go!'); ?>" />
						</form>
					</div>
				
				<!-- The register homepage div -->
					<div class="registerer homediv">
						<p><?php _e("If you want to register on a XMPP server to get your own XMPP ID, complete the form below with the needed informations"); ?>:</p>
						
						<form action="#" method="post" onsubmit="return doRegister();">
							<fieldset>
								<legend><?php _e("Required"); ?></legend>
								<label for="rnick"><?php _e("XMPP ID"); ?></label>
								<input type="text" class="nick resetable" id="rnick" /><span class="jid">@</span><input type="text" class="server resetable" value="<?php echo HOST_MAIN; ?>" <?php lockHost(); ?>/><br />
								<label for="rpassword"><?php _e("Password"); ?></label>
								<input type="password" class="password resetable" id="rpassword" />
								<label for="spassword"><?php _e("Confirm"); ?></label><input type="password" class="spassword resetable" id="spassword" />
							</fieldset>
							
							<input type="submit" class="submit" value="<?php _e('Here we go!'); ?>" />
						</form>
						
						<div class="success hidable">
							<?php _e("You've successfully been registered, here's your XMPP ID"); ?>: <b></b>
						</div>
					</div>
				
				<div class="navigation">
					<?php if(sslCheck()) echo sslLink(); ?>
					<a class="home-images download" href="http://project.jappix.com"><?php _e("Download"); ?></a>
					<a class="home-images developers" href="http://codingteam.net/project/jappix"><?php _e("Developers"); ?></a>
					<a class="home-images mobile" href="./?m=mobile<?php echo keepGet('m'); ?>"><?php _e("Mobile"); ?></a>
				</div>
			</div>
		</div>
	</div>
	<!-- END HOMEPAGE -->
