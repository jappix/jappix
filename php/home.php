<?php

/*

Jappix - An open social platform
This is the Jappix home html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/11/10

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
				
				<div class="navigation">
					<?php
					
						// Keep get var
						$keep_get = keepGet('m', false);
					
					?>
					<a class="home-images mobile" href="./?m=mobile<?php echo $keep_get; ?>"><?php _e("Mobile"); ?></a>
					<a class="home-images manager" href="./?m=manager<?php echo $keep_get; ?>"><?php _e("Manager"); ?></a>
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
