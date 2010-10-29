<?php

/*

Jappix - An open social platform
This is the Jappix head html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 29/10/10

*/

?>
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
