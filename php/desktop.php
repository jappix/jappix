<?php

/*

Jappix - An open social platform
This is the Jappix desktop html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/11/10

*/

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title><?php echo htmlspecialchars(SERVICE_NAME); ?> &bull; <?php _e("An open social network"); ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	
	<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;g=desktop.xml" type="text/css" media="all" />
	<!--[if lt IE 9]><link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=ie.css" type="text/css" media="all" /><![endif]-->
	<script type="text/javascript" src="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;l=<?php echo $locale; ?>&amp;t=js&amp;g=desktop.xml"></script>
	
	<?php if(anonymousMode()) { ?>
		<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;g=anonymous.xml" type="text/css" media="all" />
		<script type="text/javascript" src="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;l=<?php echo $locale; ?>&amp;t=js&amp;g=anonymous.xml"></script>
	<?php } ?>
</head>

<body class="body-images">

<?php

// Homepage?
if(!anonymousMode()) { ?>
	<!-- BEGIN HOMEPAGE -->
	<div id="home">
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
<?php } ?>

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

<!-- BEGIN DATE -->
<div id="data">
	<?php if(anonymousMode()) {
		$ano_room = '';
		$ano_nick = '';
		
		if(isset($_GET['r']) && !empty($_GET['r']))
			$ano_room = $_GET['r'];
		
		if(isset($_GET['n']) && !empty($_GET['n']))
			$ano_nick = $_GET['n'];
	?>
	
		<div class="anonymous" data-room="<?php echo $ano_room; ?>" data-nick="<?php echo $ano_nick; ?>"></div>
	
	<?php } ?>
</div>
<!-- END DATE -->

</body>

</html>

<!-- Jappix <?php echo $version; ?> - An open social platform -->
