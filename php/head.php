<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix head html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 16/06/10

*/

?>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title><?php _e("Jappix &bull; An Open μSocial Network"); ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	
	<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=main.css~<?php echo putTheme(); ?>~home.css~others.css~tools.css~buddylist.css~myinfos.css~chatengine.css~channel.css~chatswitch.css~smileys.css~popup.css~vcard.css~options.css~favorites.css~discovery.css~inbox.css~mucadmin.css~integratebox.css~userinfos.css" type="text/css" media="all" />
	<!--[if lt IE 9]><link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=ie.css" type="text/css" media="all" /><![endif]-->
	<script type="text/javascript" src="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=js&amp;f=jquery.js~jquery.timers.js~jsjac.js~base64.js~constants.js~datastore.js~audio.js~board.js~chat.js~smileys.js~avatar.js~mucadmin.js~connection.js~discovery.js~error.js~favorites.js~features.js~interface.js~iq.js~message.js~chatstate.js~filter.js~inbox.js~microblog.js~music.js~notification.js~httpauth.js~options.js~others.js~integratebox.js~pep.js~presence.js~roster.js~storage.js~utilities.js~vcard.js~userinfos.js"></script>
	
	<?php if(anonymousMode()) { ?>
		<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=anonymous.css" type="text/css" media="all" />
		<script type="text/javascript" src="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=js&amp;f=anonymous.js"></script>
	<?php } ?>
</head>
