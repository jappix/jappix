<?php

/*

Jappix - An open social platform
This is the Jappix Mobile PHP/HTML code

-------------------------------------------------

License: AGPL
Authors: Vanaryon, Camaran
Last revision: 31/08/12

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE'))
	exit;

?>

<!DOCTYPE html>
<?php htmlTag($locale); ?>

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<meta content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" name="viewport" />
	<title><?php echo htmlspecialchars(SERVICE_NAME); ?> (<?php _e("Jappix Mobile"); ?>) &bull; <?php echo htmlspecialchars(SERVICE_DESC); ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	<?php echoGetFiles($hash, '', 'css', 'mobile.xml', ''); echo "\n"; ?>
	<?php echoGetFiles($hash, $locale, 'js', 'mobile.xml', ''); echo "\n"; ?>
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
				<input class="xid mobile-images" type="text" name="xid" required="" />
				<input class="password mobile-images" type="password" id="pwd" name="pwd" required="" />
				<?php if(REGISTRATION != 'off') { ?>
				<label><input class="register" type="checkbox" id="reg" name="reg" /><?php _e("Register"); ?></label>
				<?php } ?>
				<input type="submit" name="ok" value="<?php _e("Here we go!"); ?>" />
			</form>
		</div>

		<a class="smartphone" href="http://jappix.mobi/">
			<span class="title"><?php _e("Jappix for your phone"); ?> »</span>
			<span class="desc"><?php _e("A single phone app for messages, channels, profiles and much more!"); ?></span>
		</a>

		<a href="./?m=desktop<?php echo keepGet('m', false); ?>"><?php _e("Desktop"); ?></a>
		<?php if(hasLegal()) { ?>- <a href="<?php echo htmlspecialchars(LEGAL); ?>"><?php _e("Legal"); ?></a><?php } ?>
	</div>
</body>

</html>

<!-- Jappix Mobile <?php echo $version; ?> - An open social platform -->