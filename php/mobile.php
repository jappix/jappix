<?php

/*

Jappix - An open social platform
This is the Jappix Mobile lightweight PHP code

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 29/10/10

*/

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
	<title><?php _e("Jappix Mobile"); ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;g=mobile.xml" type="text/css" media="all" />
	<script type="text/javascript" src="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;l=<?php echo $locale; ?>&amp;t=js&amp;g=mobile.xml"></script>
</head>

<body>
	<div id="home">
		<div class="header">
			<div class="mobile-images"></div>
		</div>
		
		<noscript>
			<div class="notification" id="noscript">
				<?php _e("Please enable JavaScript"); ?>
			</div>
		</noscript>
		
		<div class="notification" id="error">
			<?php _e("Error"); ?>
		</div>
		
		<div class="notification" id="info">
			<?php _e("Please wait..."); ?>
		</div>
		
		<div class="login">
			<?php _e("Login"); ?>
			
			<form action="#" method="post" onsubmit="return doLogin(this);">
				<input class="xid mobile-images" type="text" name="xid" />
				<input class="password mobile-images" type="password" id="pwd" name="pwd" />
				<input type="submit" name="ok" value="<?php _e("Here we go!"); ?>" />
			</form>
		</div>
		
		<a href="./?m=desktop<?php echo keepGet('m', false); ?>"><?php _e("Desktop"); ?></a>
	</div>
	
	<div id="talk">
		<div class="header">
			<button onclick="doLogout();"><?php _e("Disconnect"); ?></button>
		</div>
		
		<div id="roster">
		</div>
	</div>
	
	<div id="chat">
		<div class="header">
			<button onclick="returnToRoster();"><?php _e("Previous"); ?></button>
		</div>
		
		<div id="chans">
		</div>
	</div>
</body>

</html>

<!-- Jappix Mobile <?php echo $version; ?> - An open social platform -->
