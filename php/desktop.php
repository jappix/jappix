<?php

/*

Jappix - An open social platform
This is the Jappix desktop html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 06/09/10

*/

?>
<!DOCTYPE html>
<html>

<?php include('./php/head.php');	// The head html markup ?>

<body class="body-images">

<?php

if(!anonymousMode())
	include('./php/home.php');	// The homepage html markup

include('./php/talk.php');		// The talkpage html markup

include('./php/popups.php');		// The popups html markup

include('./php/others.php');		// The other stuffs html markup

include('./php/board.php');		// The notification board html markup

?>

</body>

</html>

<!-- Jappix <?php echo $version; ?> - An open social platform -->
