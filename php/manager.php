<?php

/*

Jappix - An open social platform
This is the Jappix manager tool

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 28/10/10

*/

// Session manager
$id = 0;
$login_fired = false;
$logout_fired = false;
$user_remember = '';
$user = '';
$password = '';
$user_meta = T_("unknown");
$user_name = '';
$share_folder = 'share';
$music_folder = 'music';
$add_button = false;
$remove_button = false;
$save_button = false;
$upload_button = false;
$check_updates = false;

// Start the session
session_start();

// Force the updates check?
if(isset($_GET['p']) && ($_GET['p'] == 'check'))
	$check_updates = true;

// Login form is sent
if(isset($_POST['login'])) {
	// Form sent pointer
	$login_fired = true;
	
	// Extract the user name
	if(isset($_POST['user_name']) && !empty($_POST['user_name']))
		$user = $_POST['user_name'];
	
	if($user && (isset($_POST['user_password']) && !empty($_POST['user_password']))) {
		// Get the password values
		$password = genStrongHash($_POST['user_password']);
		
		// Write the session
		$_SESSION['jappix_user'] = $user;
		$_SESSION['jappix_password'] = $password;
	}
}

// Session is set
else if((isset($_SESSION['jappix_user']) && !empty($_SESSION['jappix_user'])) && (isset($_SESSION['jappix_password']) && !empty($_SESSION['jappix_password']))) {
	// Form sent pointer
	$login_fired = true;
	
	// Get the session values
	$user = $_SESSION['jappix_user'];
	$password = $_SESSION['jappix_password'];
}

// Validate the current session
if($login_fired && isAdmin($user, $password))
	$id = 1;

// Any special page requested (and authorized)?
if(($id != 0) && isset($_GET['a']) && !empty($_GET['a'])) {
	// Extract the page name
	$page_requested = $_GET['a'];
	
	switch($page_requested) {
		// Logout request
		case 'logout':
			// Remove the session
			unset($_SESSION['jappix_user']);
			unset($_SESSION['jappix_password']);
			
			// Set a logout marker
			$logout_fired = true;
			
			// Page ID
			$id = 0;
			
			break;
		
		// Configuration request
		case 'configuration':
			// Allowed buttons
			$save_button = true;
			
			// Page ID
			$id = 2;
			
			break;
		
		// Hosts request
		case 'hosts':
			// Allowed buttons
			$save_button = true;
			
			// Page ID
			$id = 3;
			
			break;
		
		// Storage request
		case 'storage':
			// Allowed buttons
			$upload_button = true;
			$remove_button = true;
			
			// Page ID
			$id = 4;
			
			break;
		
		// Design request
		case 'design':
			// Allowed buttons
			$save_button = true;
			$upload_button = true;
			$remove_button = true;
			
			// Page ID
			$id = 5;
			
			break;
		
		// Users request
		case 'users':
			// Allowed buttons
			$add_button = true;
			$remove_button = true;
			
			// Page ID
			$id = 6;
			
			break;
		
		// Updates request
		case 'updates':
			// Page ID
			$id = 7;
			
			break;
		
		// Default page when authorized (statistics)
		default:
			// Page ID
			$id = 1;
	}
}

// Page server-readable names
$identifiers = array(
	'login',
	'statistics',
	'configuration',
	'hosts',
	'storage',
	'design',
	'users',
	'updates'
);

// Page human-readable names
$names = array(
	T_("Manager access"),
	T_("Statistics"),
	T_("Configuration"),
	T_("Hosts"),
	T_("Storage"),
	T_("Design"),
	T_("Users"),
	T_("Updates")
);

// Any user for the meta?
if($user && ($id != 0))
	$user_meta = $user;

// Define current page identifier & name
$page_identifier = $identifiers[$id];
$page_name = $names[$id];

// Define the current page form action
if($id == 0)
	$form_action = keepGet('(m|a|p)', false);
else
	$form_action = keepGet('(m|p)', false);

?>
<!DOCTYPE html>
<html>

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title><?php _e("Jappix manager"); ?> &bull; <?php echo($page_name); ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	<link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=main.css~manager.css~images.css" type="text/css" media="all" />
	<!--[if lt IE 9]><link rel="stylesheet" href="<?php echo HOST_STATIC; ?>/php/get.php?h=<?php echo $hash; ?>&amp;t=css&amp;f=ie.css" type="text/css" media="all" /><![endif]-->
</head>

<body class="body-images">
	<form id="manager" enctype="multipart/form-data" method="post" action="./?m=manager<?php echo $form_action; ?>">
		<div id="manager-top">
			<div class="logo manager-images"><?php _e("Manager"); ?></div>
			
			<div class="meta">
				<span><?php echo(htmlspecialchars($user_meta)); ?></span>
				
				<?php if($id != 0) { ?>
					<a class="logout manager-images" href="./?a=logout<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Disconnect"); ?></a>
				<?php } ?>
				
				<a class="close manager-images" href="./<?php echo keepGet('(m|a|p|b|s)', true); ?>"><?php _e("Close"); ?></a>
			</div>
			
			<div class="clear"></div>
		</div>
		
		<?php if($id != 0) { ?>
			<div id="manager-tabs">
				<a<?php currentTab('statistics', $page_identifier); ?> href="./?a=statistics<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Statistics"); ?></a>
				<a<?php currentTab('configuration', $page_identifier); ?> href="./?a=configuration<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Configuration"); ?></a>
				<a<?php currentTab('hosts', $page_identifier); ?> href="./?a=hosts<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Hosts"); ?></a>
				<a<?php currentTab('storage', $page_identifier); ?> href="./?a=storage<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Storage"); ?></a>
				<a<?php currentTab('design', $page_identifier); ?> href="./?a=design<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Design"); ?></a>
				<a<?php currentTab('users', $page_identifier); ?> href="./?a=users<?php echo keepGet('(a|p|bv)', false); ?>"><?php _e("Users"); ?></a>
				<a<?php currentTab('updates', $page_identifier); ?> class="last" href="./?a=updates<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("Updates"); ?></a>
			</div>
		<?php } ?>
		
		<div id="manager-content">
			<?php
			
			if(($id != 0) && newUpdates($check_updates)) { ?>
				<a class="info bottomspace neutral" href="./?a=updates<?php echo keepGet('(a|p|b|s)', false); ?>"><?php _e("A new Jappix version is available! Watch out what is new and launch the update!"); ?></a>
			<?php }
			
			// Authorized and statistics page requested
			if($id == 1) { ?>
				<h3 class="statistics manager-images"><?php _e("Statistics"); ?></h3>
				
				<p><?php _e("Basic statistics are processed by Jappix about some important things, you can find them below."); ?></p>
				
				<h4><?php _e("Access statistics"); ?></h4>
				
				<?php
				
				// Read the visits values
				$visits = getVisits();
				
				?>
				
				<ul class="stats">
					<li class="total"><b><?php _e("Total"); ?></b> <?php echo $visits['total']; ?></li>
					<li><b><?php _e("Daily"); ?></b> <?php echo $visits['daily']; ?></li>
					<li><b><?php _e("Weekly"); ?></b> <?php echo $visits['weekly']; ?></li>
					<li><b><?php _e("Monthly"); ?></b> <?php echo $visits['monthly']; ?></li>
					<li><b><?php _e("Yearly"); ?></b> <?php echo $visits['yearly']; ?></li>
				</ul>
				
				<object class="stats" type="image/svg+xml" data="./php/stats-svg.php?l=<?php echo $locale; ?>&amp;g=access"></object>
				
				<?php
				
				// Get the share stats
				$share_stats = shareStats();
				
				// Any share stats to display?
				if(count($share_stats)) { ?>
					<h4><?php _e("Share statistics"); ?></h4>
					
					<ol class="stats">
						<?php
						
						// Display the users who have the largest share folder
						$share_users = largestShare($share_stats, 8);
						
						foreach($share_users as $current_user => $current_value)
							echo('<li><b><a href="xmpp:'.$current_user.'">'.$current_user.'</a></b> '.formatBytes($current_value).'</li>');
						
						?>
					</ol>
					
					<object class="stats" type="image/svg+xml" data="./php/stats-svg.php?l=<?php echo $locale; ?>&amp;g=share"></object>
				<?php } ?>
				
				<h4><?php _e("Other statistics"); ?></h4>
				
				<ul class="stats">
					<li class="total"><b><?php _e("Total"); ?></b> <?php echo formatBytes(sizeDir(PHP_BASE.'/store/')); ?></li>
					
					<?php
					
					// Append the human-readable array values
					$others_stats = otherStats();
					
					foreach($others_stats as $others_name => $others_value)
						echo('<li><b>'.$others_name.'</b> '.formatBytes($others_value).'</li>');
					
					?>
				</ul>
				
				<object class="stats" type="image/svg+xml" data="./php/stats-svg.php?l=<?php echo $locale; ?>&amp;g=others"></object>
			<?php }
			
			// Authorized and configuration page requested
			else if($id == 2) { ?>
				<h3 class="configuration manager-images"><?php _e("Configuration"); ?></h3>
				
				<p><?php _e("Change your Jappix node configuration with this tool."); ?></p>
				
				<p><?php _e("Note that if you don't specify a value which is compulsory, it will be automatically completed with the default one."); ?></p>
				
				<?php
				
				// Define the main configuration variables
				include(PHP_BASE.'/php/vars-main.php');
				
				// Read the main configuration POST
				if(isset($_POST['save'])) {
					include(PHP_BASE.'/php/post-main.php');
					
					// Show a success alert
					?>
						<p class="info smallspace success"><?php _e("The requested change has been successfully done!"); ?></p>
					<?php
				}
				
				// Include the main configuration form
				include(PHP_BASE.'/php/form-main.php');
			}
			
			// Authorized and hosts page requested
			else if($id == 3) { ?>
				<h3 class="hosts manager-images"><?php _e("Hosts"); ?></h3>
				
				<p><?php _e("Change the XMPP hosts that this Jappix node serve with this tool."); ?></p>
				
				<p><?php _e("Maybe you don't know what a BOSH server is? In fact, this is a relay between a Jappix client and a XMPP server, which is necessary because of technical limitations."); ?></p>
				
				<p><?php _e("Note that if you don't specify a value which is compulsory, it will be automatically completed with the default one."); ?></p>
				
				<?php
				
				// Define the hosts configuration variables
				include(PHP_BASE.'/php/vars-hosts.php');
				
				// Read the hosts configuration POST
				if(isset($_POST['save'])) {
					include(PHP_BASE.'/php/post-hosts.php');
					
					// Show a success alert
					?>
						<p class="info smallspace success"><?php _e("The requested change has been successfully done!"); ?></p>
					<?php
				}
				
				// Include the hosts configuration form
				include(PHP_BASE.'/php/form-hosts.php');
			}
			
			// Authorized and storage page requested
			else if($id == 4) { ?>
				<h3 class="storage manager-images"><?php _e("Storage"); ?></h3>
				
				<p><?php _e("All this Jappix node stored files can be managed with this tool: please select a sub-folder and start editing its content!"); ?></p>
				
				<?php
				
					// Music upload?
					if(isset($_POST['upload'])) {
						// Get the file name
						$name_music = $_FILES['music_file']['name'];
						
						// Bad extension?
						if(!preg_match('/^(.+)(\.(og(g|a)|mp3|wav))$/i', $name_music)) { ?>
							<p class="info smallspace fail"><?php _e("This is not a valid music file, please encode in Ogg Vorbis, MP3 or WAV!"); ?></p>
						<?php }
						
						// Valid file
						else {
							// Get the temporary name
							$temp_music = $_FILES['music_file']['tmp_name'];
							
							// Any special name submitted?
							if(isset($_POST['music_title']) && !empty($_POST['music_title'])) {
								// Get the file extension
								$ext_music = getFileExt($name_music);
								
								// New name
								$name_music = '';
								
								// Add the artist name?
								if(isset($_POST['music_artist']) && !empty($_POST['music_artist']))
									$name_music .= $_POST['music_artist'].' - ';
								
								// Add the music title
								$name_music .= $_POST['music_title'];
								
								// Add the album name?
								if(isset($_POST['music_album']) && !empty($_POST['music_album']))
									$name_music .= ' ['.$_POST['music_album'].']';
								
								// Add the extension
								$name_music .= '.'.$ext_music;
							}
							
							// An error occured?
							if(!isSafe($name_music) || $_FILES['music_file']['error'] || !move_uploaded_file($temp_music, PHP_BASE.'/store/music/'.$name_music)) { ?>
								<p class="info smallspace fail"><?php _e("I could not receive the music file, please retry!"); ?></p>
							<?php }
							
							// The file has been sent
							else { ?>
								<p class="info smallspace success"><?php _e("Your music file was successfully added!"); ?></p>
							<?php }
						}
					}
					
					// File deletion?
					else if(isset($_POST['remove'])) {
						// Initialize the match
						$elements_removed = false;
						$elements_remove = array();
						
						// Try to get the elements to remove
						foreach($_POST as $post_key => $post_value) {
							// Is a safe file?
							if(preg_match('/^element_(.+)$/i', $post_key) && isSafe($post_value)) {
								// Update the marker
								$elements_removed = true;
								
								// Get the real path
								$post_element = PHP_BASE.'/store/'.$post_value;
								
								// Remove the current element
								if(is_dir($post_element))
									removeDir($post_element);
								else if(file_exists($post_element))
									unlink($post_element);
							}
						}
						
						if($elements_removed) { ?>
							<p class="info smallspace success"><?php _e("The selected elements have been successfully removed."); ?></p>
						<?php }
						
						else { ?>
							<p class="info smallspace fail"><?php _e("You must select elements to remove!"); ?></p>
						<?php }
					}
					
					// Purge requested
					if(isset($_GET['p']) && preg_match('/^((everything)|(cache)|(logs)|(updates))$/', $_GET['p'])) {
						purgeFolder($_GET['p']);
					
					?>
						<p class="info smallspace success"><?php _e("The storage folder you wanted to clean is now empty!"); ?></p>
					<?php }
					
					// Folder view?
					if(isset($_GET['b']) && isset($_GET['s'])) {
						if($_GET['b'] == 'share')
							$share_folder = urldecode($_GET['s']);
						else if($_GET['b'] == 'music')
							$music_folder = urldecode($_GET['s']);
					}
				?>
				
				<h4><?php _e("Maintenance"); ?></h4>
				
				<p><?php _e("Keep your Jappix node fresh and fast, clean the storage folders regularly!"); ?></p>
				
				<ul>
					<li class="total"><a href="./?p=everything<?php echo keepGet('p', false); ?>"><?php _e("Clean everything"); ?></a></li>
					<li><a href="./?p=cache<?php echo keepGet('p', false); ?>"><?php _e("Purge cache"); ?></a></li>
					<li><a href="./?p=logs<?php echo keepGet('p', false); ?>"><?php _e("Purge logs"); ?></a></li>
					<li><a href="./?p=updates<?php echo keepGet('p', false); ?>"><?php _e("Purge updates"); ?></a></li>
				</ul>
				
				<h4><?php _e("Share"); ?></h4>
				
				<p><?php _e("Stay tuned in what your users store on your server and remove undesired content with this tool."); ?></p>
				
				<fieldset>
					<legend><?php _e("Browse"); ?></legend>
					
					<div class="browse">
						<?php
						
						// List the share files
						browseFolder($share_folder, 'share');
						
						?>
					</div>
				</fieldset>
				
				<h4><?php _e("Music"); ?></h4>
				
				<p><?php _e("Upload your music (Ogg Vorbis, MP3 or WAV) to be able to listen it into the Jappix application!"); ?></p>
				
				<p><?php printf(T_("The file you want to upload must be smaller than %s."), formatBytes(uploadMaxSize()).''); ?></p>
				
				<fieldset>
					<legend><?php _e("New"); ?></legend>
					
					<label for="music_title"><?php _e("Title"); ?></label><input id="music_title" type="text" name="music_title" />
					
					<label for="music_artist"><?php _e("Artist"); ?></label><input id="music_artist" type="text" name="music_artist" />
					
					<label for="music_album"><?php _e("Album"); ?></label><input id="music_album" type="text" name="music_album" />
					
					<label for="music_file"><?php _e("File"); ?></label><input id="music_file" type="file" name="music_file" />
					
					<input type="hidden" name="MAX_FILE_SIZE" value="<?php echo(uploadMaxSize().''); ?>">
				</fieldset>
				
				<fieldset>
					<legend><?php _e("Browse"); ?></legend>
					
					<div class="browse">
						<?php
						
						// List the music files
						browseFolder($music_folder, 'music');
						
						?>
					</div>
				</fieldset>
			<?php }
			
			// Authorized and design page requested
			else if($id == 5) { ?>
				<h3 class="design manager-images"><?php _e("Design"); ?></h3>
				
				<p><?php _e("Jappix is fully customisable: you can change its design right here."); ?></p>
				
				<?php
				
					// Define initial form values
					$notice_none = ' checked="checked"';
					$notice_simple = '';
					$notice_advanced = '';
					$notice_text = '';
					
					// Handle the save POST
					if(isset($_POST['save'])) {
						// Handle it for background
						// TODO
						
						// Handle it for notice
						if(isset($_POST['notice_type']))
							$notice_type = $_POST['notice_type'];
						else
							$notice_type = 'default';
						
						$notice_text = '';
						
						if(isset($_POST['notice_text']))
							$notice_text = $_POST['notice_text'];
						
						// Write the notice configuration
						writeNotice($notice_type, $notice_text);
						
						// Show a success notice
						
						?>
						
						<p class="info smallspace success"><?php _e("Your design preferences have been successfully saved!"); ?></p>
					<?php }
					
					// Read the notice configuration
					$notice_conf = readNotice();
					$notice_text = $notice_conf['notice'];
					
					switch($notice_conf['type']) {
						// Simple notice input
						case 'simple':
							$notice_simple = ' checked="checked"';
							$notice_none = '';
							
							break;
						
						// Advanced notice input
						case 'advanced':
							$notice_advanced = ' checked="checked"';
							$notice_none = '';
							
							break;
					}
				
				?>
				
				<h4><?php _e("Background"); ?></h4>
				
				<p><?php _e("Change your Jappix node background with this tool. You can either set a custom color or an uploaded image. Let your creativity flow!"); ?></p>
				
				<label class="master" for="background_default"><?php _e("Use default background"); ?></label><input id="background_default" type="radio" name="background_type" value="default" />
				
				<label class="master" for="background_image"><?php _e("Use your own image"); ?></label><input id="background_image" type="radio" name="background_type" value="image" />
				
				<div class="sub">
					<p><?php printf(T_("The file you want to upload must be smaller than %s."), formatBytes(uploadMaxSize()).''); ?></p>
				</div>
				
				<label class="master" for="background_color"><?php _e("Use your own color"); ?></label><input id="background_color" type="radio" name="background_type" value="color" />
				
				<div class="sub">
					<p><?php _e("Type the hexadecimal color value you want to use as a background."); ?></p>
				</div>
				
				<h4><?php _e("Notice"); ?></h4>
				
				<p><?php _e("Define a homepage notice for all your users, such as a warn, an important message or an advert with this tool."); ?></p>
				
				<label class="master" for="notice_none"><?php _e("None"); ?></label><input id="notice_none" type="radio" name="notice_type" value="none"<?php echo($notice_none); ?> />
				
				<label class="master" for="notice_simple"><?php _e("Simple notice"); ?></label><input id="notice_simple" type="radio" name="notice_type" value="simple"<?php echo($notice_simple); ?> />
				
				<div class="sub">
					<p><?php _e("This notice only needs simple text to be displayed, but no code is allowed!"); ?></p>
				</div>
				
				<label class="master" for="notice_advanced"><?php _e("Advanced notice"); ?></label><input id="notice_advanced" type="radio" name="notice_type" value="advanced"<?php echo($notice_advanced); ?> />
				
				<div class="sub">
					<p><?php _e("You can customize your notice with embedded HTML code, JS code and CSS, but you need to code the style."); ?></p>
				</div>
				
				<div class="clear"></div>
				
				<textarea class="notice-text" name="notice_text" rows="8" cols="60"><?php echo(htmlentities($notice_text)); ?></textarea>
			<?php }
			
			// Authorized and updates page requested
			else if($id == 6) { ?>
				<h3 class="users manager-images"><?php _e("Users"); ?></h3>
				
				<p><?php _e("You can define more than one administrator for this Jappix node. You can also change a password with this tool."); ?></p>
				
				<?php
				
				// Add an user?
				if(isset($_POST['add'])) {
					// Include the users POST handler
					include(PHP_BASE.'/php/post-users.php');
					
					if($valid_user) { ?>
						<p class="info smallspace success"><?php _e("The user has been successfully added!"); ?></p>
					<?php }
					
					else { ?>
						<p class="info smallspace fail"><?php _e("Ups, you missed something or the two passwords do not match!"); ?></p>
				<?php }
				}
				
				// Remove an user?
				else if(isset($_POST['remove'])) {
					// Initialize the match
					$users_removed = false;
					$users_remove = array();
					
					// Try to get the users to remove
					foreach($_POST as $post_key => $post_value) {
						// Is it an admin user?
						if(preg_match('/^admin_(.+)$/i', $post_key)) {
							// Update the marker
							$users_removed = true;
							
							// Push the value to the global array
							array_push($users_remove, $post_value);
						}
					}
					
					// Somebody has been removed
					if($users_removed) {
					
						// Remove the users!
						manageUsers('remove', $users_remove);
					
					?>
						<p class="info smallspace success"><?php _e("The chosen users have been successfully removed."); ?></p>
					<?php }
					
					// Nobody has been removed
					else { ?>
						<p class="info smallspace fail"><?php _e("You must select one or more users to be removed!"); ?></p>
				<?php }
				} ?>
				
				<h4><?php _e("Add"); ?></h4>
				
				<p><?php _e("Add a new user with this tool, or change a password (type an existing username). Please submit a strong password!"); ?></p>
				
				<?php
				
				// Include the user add form
				include(PHP_BASE.'/php/form-users.php');
				
				?>
				
				<h4><?php _e("Manage"); ?></h4>
				
				<p><?php _e("Remove users with this tool. Note that you cannot remove an user if he is the only one remaining."); ?></p>
				
				<div class="browse">
					<?php
					
					// List the users
					browseUsers();
					
					?>
				</div>
			<?php }
			
			// Authorized and updates page requested
			else if($id == 7) { ?>
				<h3 class="updates manager-images"><?php _e("Updates"); ?></h3>
				
				<p><?php _e("Update your Jappix node with this tool, or check if a new one is available. Informations about the latest version are also displayed (in english)."); ?></p>
				
				<?php
				
				// New updates available?
				if(newUpdates($check_updates)) {
					// Get the update informations
					$update_infos = updateInformations();
					
					// We can launch the update!
					if(isset($_GET['p']) && ($_GET['p'] == 'update')) { ?>
						<h4><?php _e("Update in progress"); ?></h4>
						
						<?php if(processUpdate($update_infos['url'])) { ?>
							<p class="info smallspace success"><?php _e("The Jappix update is finished: you are now running the latest version. Have fun!"); ?></p>
						<?php } else { ?>
							<p class="info smallspace fail"><?php _e("The update has failed! Please try again later..."); ?></p>
						<?php }
					}
					
					// We just show a notice
					else {
				?>
						<h4><?php _e("Available updates"); ?></h4>
						
						<a class="info smallspace fail" href="./?p=update<?php echo keepGet('(p|b|s)', false); ?>"><?php printf(T_("Your version is out to date. Update it now to %s by clicking here!"), '<em>'.$update_infos['id'].'</em>'); ?></a>
						
						<h4><?php _e("What's new?"); ?></h4>
						
						<div><?php echo $update_infos['description']; ?></div>
				<?php }
				
				// No new update
				} else { ?>
					<h4><?php _e("Available updates"); ?></h4>
					
					<a class="info smallspace success" href="./?p=check<?php echo keepGet('(p|b|s)', false); ?>"><?php _e("Your version seems to be up to date, but you can check updates manually by clicking here."); ?></a>
				<?php } ?>
			<?php }
			
			// Not authorized, show the login form
			else { ?>
				<h3 class="login manager-images"><?php _e("Manager access"); ?></h3>
				
				<p><?php _e("This is a restricted area: only the authorized users can manage this Jappix node."); ?></p>
				<p><?php _e("Please login to access the administration panel, thanks to the form below."); ?></p>
				<p><?php _e("To improve the security, the sessions are limited in time and when your browser will be closed, you will be logged out."); ?></p>
				
				<fieldset>
					<legend><?php _e("Credentials"); ?></legend>
					
					<label for="user_name"><?php _e("User"); ?></label><input id="user_name" type="text" name="user_name" value="<?php echo(htmlspecialchars($user)); ?>" />
					
					<label for="user_password"><?php _e("Password"); ?></label><input id="user_password" type="password" name="user_password" />
				</fieldset>
				
				<?php
				
				// Disconnected
				if($logout_fired) { ?>
					<p class="info bigspace success"><?php _e("You have been successfully logged out. Goodbye!"); ?></p>
				<?php }
				
				// Login error
				else if($login_fired) { ?>
					<p class="info bigspace fail"><?php _e("Ups, I cannot recognize you as a valid administrator. Check your credentials!"); ?></p>
				<?php
				
					// Remove the session
					unset($_SESSION['jappix_user']);
					unset($_SESSION['jappix_password']);
				
				}
			} ?>
			
			<div class="clear"></div>
		</div>
		
		<div id="manager-buttons">
			<?php if($id == 0) { ?>
				<input type="submit" name="login" value="<?php _e("Here we go!"); ?>" />
			<?php } else { ?>
				<?php } if($add_button) { ?>
					<input type="submit" name="add" value="<?php _e("Add"); ?>" />
				<?php } if($save_button) { ?>
					<input type="submit" name="save" value="<?php _e("Save"); ?>" />
				<?php } if($upload_button) { ?>
					<input type="submit" name="upload" value="<?php _e("Upload"); ?>" />
				<?php } if($remove_button) { ?>
					<input type="submit" name="remove" value="<?php _e("Remove"); ?>" />
			<?php } ?>
			
			<div class="clear"></div>
		</div>
		
	</form>
</body>

</html>

<!-- Jappix manager <?php echo $version; ?> - An open social platform -->
