<?php

/*

Jappix - An open social platform
This is the Jappix others stuffs html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 27/10/10

*/

?>
	<!-- BEGIN GENERAL-WAIT -->
	<div id="general-wait" class="hidable">
		<div class="general-wait-content wait-big"></div>
	</div>
	<!-- END GENERAL-WAIT -->
	
	<!-- BEGIN DATA -->
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
	<!-- END DATA -->
