<?php

/*

Jappix - An open social platform
This is the Jappix popups html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 25/10/10

*/

?>
	<!-- BEGIN VCARD POPUP -->
	<div id="vcard" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("My profile"); ?></div>
			
			<div class="tab">
				<a class="tab1 tab-active" onclick="switchVCard(1);"><?php _e("Identity"); ?></a>
				<a class="tab2" onclick="switchVCard(2);"><?php _e("Avatar"); ?></a>
				<a class="tab3" onclick="switchVCard(3);"><?php _e("Others"); ?></a>
			</div>
			
			<div class="content">
				<div id="lap1" class="one-lap forms">
					<fieldset>
						<legend><?php _e("Civility"); ?></legend>
						
						<label for="FN"><?php _e("Complete name"); ?></label>
						<input type="text" id="FN" class="resetable vcard-item" />
						
						<label for="NICKNAME"><?php _e("Nick"); ?></label>
						<input type="text" id="NICKNAME" class="resetable vcard-item" />
						
						<label for="N-GIVEN"><?php _e("Given name"); ?></label>
						<input type="text" id="N-GIVEN" class="resetable vcard-item" />
						
						<label for="N-FAMILY"><?php _e("Family name"); ?></label>
						<input type="text" id="N-FAMILY" class="resetable vcard-item" />
						
						<label for="BDAY"><?php _e("Birth"); ?></label>
						<input type="text" id="BDAY" class="resetable vcard-item" />
					</fieldset>
					
					<fieldset>
						<legend><?php _e("Contact"); ?></legend>
						
						<label for="EMAIL-USERID"><?php _e("E-mail"); ?></label>
						<input type="text" id="EMAIL-USERID" class="resetable vcard-item" />
						
						<label for="TEL-NUMBER"><?php _e("Phone"); ?></label>
						<input type="text" id="TEL-NUMBER" class="resetable vcard-item" />
						
						<label for="URL"><?php _e("Website"); ?></label>
						<input type="text" id="URL" class="resetable vcard-item" />
					</fieldset>
				</div>
				
				<div id="lap2" class="one-lap forms">
					<fieldset>
						<legend><?php _e("Picture of you"); ?></legend>
						
						<input type="hidden" id="PHOTO-TYPE" class="resetable vcard-item" />
						<input type="hidden" id="PHOTO-BINVAL" class="resetable vcard-item" />
						<input style="margin-left: 15px;" type="file" name="vCardAvatar" id="vCardAvatar" class="resetable" onchange="sendThisAvatar()" />
					</fieldset>
					
					<fieldset>
						<legend><?php _e("Actual picture"); ?></legend>
						
						<div class="avatar-container"></div>
						
						<a class="avatar-delete hidable" onclick="deleteAvatar();"><?php _e("Delete"); ?></a>
						<div class="no-avatar"><?php _e("What a pity! You have no avatar defined in your identity card!"); ?></div>
					</fieldset>
					
					<div class="avatar-ok avatar-info hidable"><?php _e("Here it is! A new beautiful avatar!"); ?></div>
					
					<div class="avatar-error avatar-info hidable"><?php _e("Not supported image file or bad size."); ?></div>
				</div>
				
				<div id="lap3" class="one-lap forms">
					<fieldset>
						<legend><?php _e("Postal address"); ?></legend>
						
						<label for="ADR-STREET"><?php _e("Street"); ?></label>
						<input type="text" id="ADR-STREET" class="resetable vcard-item" />
						
						<label for="ADR-LOCALITY"><?php _e("City"); ?></label>
						<input type="text" id="ADR-LOCALITY" class="resetable vcard-item" />
						
						<label for="ADR-PCODE"><?php _e("Postal code"); ?></label>
						<input type="text" id="ADR-PCODE" class="resetable vcard-item" />
						
						<label for="ADR-CTRY"><?php _e("Country"); ?></label>
						<input type="text" id="ADR-CTRY" class="resetable vcard-item" />
					</fieldset>
					
					<fieldset>
						<legend><?php _e("Biography"); ?></legend>
						
						<textarea id="DESC" rows="8" cols="60" class="resetable vcard-item"></textarea>
					</fieldset>
				</div>
				
				<div class="infos">
					<p class="infos-title"><?php _e("Important notice"); ?></p>
					
					<p><?php _e("Be careful of the informations you write into your profile, because if you put sensitive personal data in it.. it could be accessible from everyone (even someone you don't want to)."); ?></p>
					<p><?php _e("Everything is not private on XMPP, here's one of those things, your public profile (vCard)."); ?></p>
					<p><?php _e("It's strongly recommended to send an avatar (25Kio maximum), like a picture of yourself, because that makes you easily recognizable from your friends."); ?></p>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish disabled" onclick="return sendVCard();"><?php _e("Save"); ?></a>
				<a class="finish" onclick="return closeVCard();"><?php _e("Cancel"); ?></a>
			</div>
		</div>
	</div>
	<!-- END VCARD POPUP -->
	
	<!-- BEGIN OPTIONS POPUP -->
	<div id="options" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("I edit my options"); ?></div>
			
			<div class="tab">
				<a class="tab1 tab-active" onclick="switchOptions(1);"><?php _e("General"); ?></a>
				<a class="tab2 pubsub-hidable hidable" onclick="switchOptions(2);"><?php _e("Channel"); ?></a>
				<a class="tab3" onclick="switchOptions(3);"><?php _e("Account"); ?></a>
			</div>
			
			<div class="content">
				<div id="conf1" class="one-conf forms">
					<fieldset class="privacy hidable">
						<legend><?php _e("Privacy"); ?></legend>
						
						<label for="geolocation" class="pep-hidable hidable"><?php _e("Geolocation"); ?></label>
						<input id="geolocation" type="checkbox" class="resetable pep-hidable hidable" />
						
						<label for="archiving" class="archives-hidable pref hidable"><?php _e("Message archiving"); ?></label>
						<input id="archiving" type="checkbox" class="archives-hidable pref hidable resetable" />
					</fieldset>
					
					<fieldset>
						<legend><?php _e("Application"); ?></legend>
						
						<label for="sounds"><?php _e("Sounds"); ?></label>
						<input id="sounds" type="checkbox" class="resetable" />
						
						<label for="showall"><?php _e("Show all friends"); ?></label>
						<input id="showall" type="checkbox" class="resetable" />
						
						<label><?php _e("XMPP links"); ?></label>
						<a class="linked xmpp-links"><?php _e("Open XMPP links with Jappix"); ?></a>
					</fieldset>
				</div>
				
				<div id="conf2" class="one-conf forms">
					<fieldset>
						<legend><?php _e("Channel"); ?></legend>
						
						<label><?php _e("Empty"); ?></label>
						<a class="linked empty-channel"><?php _e("Empty my channel"); ?></a>
						
						<label><?php _e("Persistent"); ?></label>
						<input id="persistent" type="checkbox" class="resetable" />
						
						<label><?php _e("Maximum notices"); ?></label>
						<select id="maxnotices" class="resetable">
							<option value="50">50</option>
							<option value="100">100</option>
							<option value="500">500</option>
							<option value="1000">1000</option>
							<option value="5000">5000</option>
							<option value="10000">10000</option>
						</select>
					</fieldset>
					
					<div class="sub-ask sub-ask-empty sub-ask-element hidable">
						<div class="sub-ask-top">
							<div class="sub-ask-title"><?php _e("Empty my channel"); ?></div>
							<a class="sub-ask-close">X</a>
						</div>
						
						<div class="sub-ask-content">
							<label><?php _e("Password"); ?></label>
							<input type="password" class="purge-microblog check-empty resetable" />
						</div>
						
						<a class="sub-ask-bottom" onclick="purgeMyMicroblog();"><?php _e("Empty"); ?> &raquo;</a>
					</div>
				</div>
				
				<div id="conf3" class="one-conf forms">
					<fieldset>
						<legend><?php _e("Account"); ?></legend>
						
						<label><?php _e("Password"); ?></label>
						<a class="linked change-password"><?php _e("Change my password"); ?></a>
						
						<label><?php _e("Delete"); ?></label>
						<a class="linked delete-account"><?php _e("Delete my account"); ?></a>
					</fieldset>
					
					<div class="sub-ask sub-ask-pass sub-ask-element hidable">
						<div class="sub-ask-top">
							<div class="sub-ask-title"><?php _e("Change my password"); ?></div>
							<a class="sub-ask-close">X</a>
						</div>
						
						<div class="sub-ask-content">
							<label><?php _e("Old"); ?></label>
							<input type="password" class="password-change old resetable" />
							
							<label><?php _e("New (2 times)"); ?></label>
							<input type="password" class="password-change new1 resetable" />
							<input type="password" class="password-change new2 resetable" />
						</div>
						
						<a class="sub-ask-bottom" onclick="sendNewPassword();"><?php _e("Continue"); ?> &raquo;</a>
					</div>
					
					<div class="sub-ask sub-ask-delete sub-ask-element hidable">
						<div class="sub-ask-top">
							<div class="sub-ask-title"><?php _e("Delete my account"); ?></div>
							<a class="sub-ask-close">X</a>
						</div>
						
						<div class="sub-ask-content">
							<label><?php _e("Password"); ?></label>
							<input type="password" class="delete-account check-password resetable" />
						</div>
						
						<a class="sub-ask-bottom" onclick="deleteMyAccount();"><?php _e("Delete"); ?> &raquo;</a>
					</div>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return saveOptions();"><?php _e("Save"); ?></a>
				<a class="finish" onclick="return closeOptions();"><?php _e("Cancel"); ?></a>
			</div>
		</div>
	</div>
	<!-- END OPTIONS POPUP -->
	
	<!-- BEGIN FAVORITES -->
	<div id="favorites" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Manage my favorites rooms"); ?></div>
			
			<div class="content">
				<div class="switch-fav">
					<div class="room-switcher room-list">
						<div class="icon list-icon talk-images"></div>
						
						<?php _e("Change my favorites"); ?>
					</div>
					
					<div class="room-switcher room-search">
						<div class="icon search-icon talk-images"></div>
						
						<?php _e("Search a room"); ?>
					</div>
				</div>
				
				<div class="static-fav">
					<div class="favorites-edit favorites-content">
						<div class="head fedit-head static-fav-head">
							<div class="head-text fedit-head-text"><?php _e("Select a favorite"); ?></div>
							
							<select name="fedit-head-select" class="head-select fedit-head-select resetable">
								<option value="none" class="fedit-head-select-first-option"><?php _e("Select a favorite"); ?></option>
							</select>
						</div>
						
						<div class="results fedit-results static-fav-results">
							<div class="fedit-line">
								<label><?php _e("Name"); ?></label>
								
								<input class="fedit-title fedit-required" type="text" />
							</div>
							
							<div class="fedit-line">
								<label><?php _e("Nick"); ?></label>
								
								<input class="fedit-nick fedit-required" type="text" />
							</div>
							
							<div class="fedit-line">
								<label><?php _e("Room"); ?></label>
								
								<input class="fedit-chan fedit-required" type="text" />
							</div>
							
							<div class="fedit-line">
								<label><?php _e("Server"); ?></label>
								
								<input class="fedit-server fedit-required" type="text" value="<?php echo HOST_MUC; ?>" />
							</div>
							
							<div class="fedit-line">
								<label><?php _e("Password"); ?></label>
								
								<input class="fedit-password" type="password" />
							</div>
							
							<div class="fedit-line">
								<label><?php _e("Automatic"); ?></label>
								
								<input type="checkbox" class="fedit-autojoin" />
							</div>
							
							<div class="fedit-actions">
								<a class="fedit-terminate fedit-add" onclick="terminateThisFavorite('add');"><?php _e("Add"); ?></a>
								<a class="fedit-terminate fedit-edit" onclick="terminateThisFavorite('edit');"><?php _e("Edit"); ?></a>
								<a class="fedit-terminate fedit-remove" onclick="terminateThisFavorite('remove');"><?php _e("Remove"); ?></a>
							</div>
						</div>
					</div>
					
					<div class="favorites-search favorites-content">
						<div class="head fsearch-head static-fav-head">
							<div class="head-text fsearch-head-text"><?php _e("Search a room on"); ?></div>
							
							<input type="text" class="head-input fsearch-head-server" value="<?php echo HOST_MUC; ?>" />
						</div>
						
						<div class="results fsearch-results static-fav-results">
							<p class="fsearch-noresults"><?php _e("No room found on this server."); ?></p>
						</div>
					</div>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return quitFavorites();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END FAVORITES -->
	
	<!-- BEGIN DISCOVERY -->
	<div id="discovery" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Service discovery"); ?></div>
			
			<div class="content">
				<div class="discovery-head">
					<div class="disco-server-text"><?php _e("Server to query"); ?></div>
					
					<input name="disco-server-input" class="disco-server-input resetable" value="<?php echo HOST_MAIN; ?>" />
				</div>
				
				<div class="results discovery-results">
					<div class="disco-category disco-account">
						<p class="disco-category-title"><?php _e("Accounts"); ?></p>
					</div>
					
					<div class="disco-category disco-auth">
						<p class="disco-category-title"><?php _e("Authentications"); ?></p>
					</div>
					
					<div class="disco-category disco-automation">
						<p class="disco-category-title"><?php _e("Automation"); ?></p>
					</div>
					
					<div class="disco-category disco-client">
						<p class="disco-category-title"><?php _e("Clients"); ?></p>
					</div>
					
					<div class="disco-category disco-collaboration">
						<p class="disco-category-title"><?php _e("Collaboration"); ?></p>
					</div>
					
					<div class="disco-category disco-component">
						<p class="disco-category-title"><?php _e("Components"); ?></p>
					</div>
					
					<div class="disco-category disco-conference">
						<p class="disco-category-title"><?php _e("Rooms"); ?></p>
					</div>
					
					<div class="disco-category disco-directory">
						<p class="disco-category-title"><?php _e("Directories"); ?></p>
					</div>
					
					<div class="disco-category disco-gateway">
						<p class="disco-category-title"><?php _e("Gateways"); ?></p>
					</div>
					
					<div class="disco-category disco-headline">
						<p class="disco-category-title"><?php _e("News"); ?></p>
					</div>
					
					<div class="disco-category disco-hierarchy">
						<p class="disco-category-title"><?php _e("Hierarchy"); ?></p>
					</div>
					
					<div class="disco-category disco-proxy">
						<p class="disco-category-title"><?php _e("Proxies"); ?></p>
					</div>
					
					<div class="disco-category disco-pubsub">
						<p class="disco-category-title"><?php _e("Publication/Subscription"); ?></p>
					</div>
					
					<div class="disco-category disco-server">
						<p class="disco-category-title"><?php _e("Server"); ?></p>
					</div>
					
					<div class="disco-category disco-store">
						<p class="disco-category-title"><?php _e("Storage"); ?></p>
					</div>
					
					<div class="disco-category disco-others">
						<p class="disco-category-title"><?php _e("Others"); ?></p>
					</div>
					
					<div class="disco-category disco-wait">
						<p class="disco-category-title"><?php _e("Loading"); ?></p>
					</div>
				</div>
			</div>
			
			<div class="discovery-forms"></div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return quitDiscovery();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END DISCOVERY -->
	
	<!-- BEGIN MESSAGES -->
	<div id="inbox" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("My inbox"); ?></div>
			
			<div class="content">
				<div class="head messages-head">
					<div class="head-text messages-head-text"><?php _e("Available actions"); ?></div>
					
					<div class="head-actions messages-head-actions">
						<a onclick="deleteAllMessages();" class="a-delete-messages"><?php _e("Clean"); ?></a>
						<a onclick="newMessage();" class="a-new-message"><?php _e("New"); ?></a>
						<a onclick="showMessages();" class="a-show-messages"><?php _e("Received"); ?></a>
					</div>
				</div>
				
				<div class="messages-results showable">
					<p class="messages-noresults showable"><?php _e("No message stored in your inbox."); ?></p>
					
					<div class="inbox"></div>
				</div>
				
				<div class="messages-new hidable">
					<div class="messages-new-to messages-new-block search">
						<p class="messages-new-text"><?php _e("To"); ?></p>
						
						<input name="messages-new-to-input" class="messages-new-input messages-new-to-input resetable" />
					</div>
					
					<div class="messages-new-topic messages-new-block">
						<p class="messages-new-text"><?php _e("Subject"); ?></p>
						
						<input name="messages-new-subject-input" class="messages-new-input messages-new-subject-input resetable" />
					</div>
					
					<div class="messages-new-body messages-new-block">
						<p class="messages-new-text"><?php _e("Content"); ?></p>
						
						<textarea class="messages-new-textarea resetable" rows="8" cols="60"></textarea>
					</div>
					
					<div class="messages-new-send messages-new-block">
						<a onclick="sendThisMessage();"><?php _e("Send the message"); ?></a>
					</div>
				</div>
			</div>
			
			<div class="bottom">
				<a class="finish" onclick="return messagesClose();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END MESSAGES -->
	
	<!-- BEGIN USERINFOS -->
	<div id="userinfos" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("User infos"); ?></div>
			
			<div class="tab">
				<a class="tab1 tab-active" onclick="switchUInfos(1);"><?php _e("General"); ?></a>
				<a class="tab2" onclick="switchUInfos(2);"><?php _e("Advanced"); ?></a>
				<a class="tab3" onclick="switchUInfos(3);"><?php _e("Comments"); ?></a>
			</div>
			
			<div class="content">
				<div class="one-info info1" style="display: block;">
					<div class="main-infos">
						<div class="avatar-container"></div>
						
						<h1 id="BUDDY-FN" class="reset-info"><?php _e("unknown"); ?></h1>
						<h2 id="BUDDY-NICKNAME" class="reset-info"><?php _e("unknown"); ?></h2>
						<h3 id="BUDDY-XID" class="reset-info"><?php _e("unknown"); ?></h3>
					</div>
					
					<div class="block-infos">
						<div class="one-line"><b><?php _e("Birth"); ?></b><span id="BUDDY-BDAY" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("E-mail"); ?></b><span id="BUDDY-EMAIL-USERID" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("Phone"); ?></b><span id="BUDDY-TEL-NUMBER" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("Website"); ?></b><span id="BUDDY-URL" class="reset-info"><?php _e("unknown"); ?></span></div>
					</div>
					
					<div class="block-infos">
						<div class="one-line"><b><?php _e("Client"); ?></b><span id="BUDDY-CLIENT" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("System"); ?></b><span id="BUDDY-SYSTEM" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("Local time"); ?></b><span id="BUDDY-TIME" class="reset-info"><?php _e("unknown"); ?></span></div>
					</div>
				</div>
				
				<div class="one-info info2">
					<div class="block-infos">
						<div class="one-line"><b><?php _e("Street"); ?></b><span id="BUDDY-ADR-STREET" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("City"); ?></b><span id="BUDDY-ADR-LOCALITY" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("Postal code"); ?></b><span id="BUDDY-ADR-PCODE" class="reset-info"><?php _e("unknown"); ?></span></div>
						
						<div class="one-line"><b><?php _e("Country"); ?></b><span id="BUDDY-ADR-CTRY" class="reset-info"><?php _e("unknown"); ?></span></div>
					</div>
					
					<div class="block-infos">
						<div class="one-line"><b><?php _e("Biography"); ?></b><span id="BUDDY-DESC" class="reset-info"><?php _e("unknown"); ?></span></div>
					</div>
				</div>
				
				<div class="one-info info3">
					<textarea id="BUDDY-COMMENTS" rows="8" cols="60" class="resetable"></textarea>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return closeUserInfos();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END USERINFOS -->
	
	<!-- BEGIN WELCOME -->
	<div id="welcome" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Welcome!"); ?></div>
			
			<div class="tab">
				<a class="tab1 tab-active" onclick="switchWelcome(1);" data-step="1"><?php _e("Options"); ?></a>
				<a class="tab2 tab-missing" onclick="switchWelcome(2);" data-step="2"><?php _e("Friends"); ?></a>
				<a class="tab3 tab-missing" onclick="switchWelcome(3);" data-step="3"><?php _e("Profile"); ?></a>
			</div>
			
			<div class="content">
				<div class="one-welcome welcome1" style="display: block;">
					<div class="infos">
						<p class="infos-title"><?php _e("Welcome on Jappix, your own social cloud!"); ?></p>
						<p><?php _e("Before you start using it, you'll have to change some settings, search for friends and complete your profile."); ?></p>
					</div>
					
					<a class="box enabled" title="<?php _e("Click to disable"); ?>">
						<span class="option"><?php _e("Sounds"); ?></span>
						<span class="description"><?php _e("Enable the notification sounds"); ?></span>
						<span class="image sound talk-images"></span>
					</a>
					
					<a class="box enabled pep-hidable hidable" title="<?php _e("Click to disable"); ?>">
						<span class="option"><?php _e("Geolocation"); ?></span>
						<span class="description"><?php _e("Share my position on the globe"); ?></span>
						<span class="image geolocation talk-images"></span>
					</a>
					
					<a class="box" title="<?php _e("Click to enable"); ?>">
						<span class="option"><?php _e("XMPP links"); ?></span>
						<span class="description"><?php _e("Open XMPP links with Jappix"); ?></span>
						<span class="image xmpp talk-images"></span>
					</a>
					
					<a class="box enabled archives-hidable pref hidable" title="<?php _e("Click to enable"); ?>">
						<span class="option"><?php _e("Message archiving"); ?></span>
						<span class="description"><?php _e("Store a history of your chats"); ?></span>
						<span class="image archives talk-images"></span>
					</a>
					
					<a class="box" title="<?php _e("Click to enable"); ?>">
						<span class="option"><?php _e("Offline buddies"); ?></span>
						<span class="description"><?php _e("Don't hide offline buddies"); ?></span>
						<span class="image offline talk-images"></span>
					</a>
				</div>
				
				<div class="one-welcome welcome2">
					<div class="infos">
						<p class="infos-title"><?php _e("Friends"); ?></p>
						<p><?php _e("Use this tool to find your friends on the server you are using right now, or add them later."); ?></p>
					</div>
					
					<div class="results welcome-results"></div>
				</div>
				
				<div class="one-welcome welcome3">
					<div class="infos">
						<p class="infos-title"><?php _e("Profile"); ?></p>
						<p><?php _e("Great work! When you will press the save button, the profile editor will be opened."); ?></p>
						<p><?php _e("All the Jappix team thank you for your interest. Happy socializing!"); ?></p>
					</div>
					
					<div class="logo welcome-images"></div>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish next" onclick="return nextWelcome();"><?php _e("Next"); ?> »</a>
				<a class="finish save" onclick="return saveWelcome();"><?php _e("Save"); ?></a>
			</div>
		</div>
	</div>
	<!-- END WELCOME -->
	
	<!-- BEGIN MAP -->
	<div id="map" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Map of my friends"); ?></div>
			
			<div class="content"></div>
			
			<div class="bottom">
				<a class="finish" onclick="return closeMap();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END MAP -->
	
	<!-- BEGIN COLLECTIONS -->
	<div id="collections" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Collections"); ?></div>
			
			<div class="content"></div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return closeCollections();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END COLLECTIONS -->
	
	<!-- BEGIN ARCHIVES -->
	<div id="archives" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Message archives"); ?></div>
			
			<div class="content">
				<div class="filter">
					<div class="search">
						<?php _e("Search"); ?>
						<input type="text" />
					</div>
					
					<div class="friend">
						<?php _e("Buddy"); ?>
						<select multiple="multiple">
						</select>
					</div>
					
					<div class="date">
						<?php _e("Date"); ?>
						<select>
						</select>
					</div>
				</div>
				
				<div class="logs">
					
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return closeArchives();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END ARCHIVES -->
	
	<!-- BEGIN MUC-ADMIN -->
	<div id="muc-admin" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("MUC administration"); ?></div>
			
			<div class="content">
				<div class="head muc-admin-head">
					<div class="head-text muc-admin-head-text"><?php _e("You administrate this room"); ?></div>
					
					<div class="muc-admin-head-jid"></div>
				</div>
				
				<div class="muc-admin-results">
					<div class="muc-admin-topic">
						<fieldset>
							<legend><?php _e("Subject"); ?></legend>
							
							<label for="topic-text"><?php _e("Enter the new subject"); ?></label>
							<textarea id="topic-text" name="room-topic" class="resetable" rows="8" cols="60" ></textarea>
						</fieldset>
					</div>
					
					<div class="muc-admin-conf">
						<fieldset>
							<legend><?php _e("Configuration"); ?></legend>
							
							<div class="last-element"></div>
						</fieldset>
					</div>
					
					<div class="muc-admin-aut">
						<fieldset>
							<legend><?php _e("Authorizations"); ?></legend>
							
							<label><?php _e("Member list"); ?></label>
							<div class="aut-member aut-group">
								<a class="aut-add" onclick="addInputMucAdmin('', 'member');"><?php _e("Add an input"); ?></a>
							</div>
							
							<label><?php _e("Owner list"); ?></label>
							<div class="aut-owner aut-group">
								<a class="aut-add" onclick="addInputMucAdmin('', 'owner');"><?php _e("Add an input"); ?></a>
							</div>
							
							<label><?php _e("Administrator list"); ?></label>
							<div class="aut-admin aut-group">
								<a class="aut-add" onclick="addInputMucAdmin('', 'admin');"><?php _e("Add an input"); ?></a>
							</div>
							
							<label><?php _e("Outcast list"); ?></label>
							<div class="aut-outcast aut-group">
								<a class="aut-add" onclick="addInputMucAdmin('', 'outcast');"><?php _e("Add an input"); ?></a>
							</div>
						</fieldset>
					</div>
					
					<div class="muc-admin-others">
						<fieldset>
							<legend><?php _e("Others"); ?></legend>
							
							<label><?php _e("Destroy this MUC"); ?></label>
							<a onclick="destroyMucAdmin();"><?php _e("Yes, let's do it!"); ?></a>
						</fieldset>
					</div>
				</div>
			</div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return saveMucAdmin();"><?php _e("Save"); ?></a>
				<a class="finish" onclick="return cancelMucAdmin();"><?php _e("Cancel"); ?></a>
			</div>
		</div>
	</div>
	<!-- END MUC-ADMIN -->
	
	<!-- BEGIN INTEGRATEBOX -->
	<div id="integratebox" class="lock hidable">
		<div class="popup">
			<div class="top"><?php _e("Media viewer"); ?></div>
			
			<div class="content"></div>
			
			<div class="bottom">
				<div class="wait wait-medium"></div>
				
				<a class="finish" onclick="return closeIntegrateBox();"><?php _e("Close"); ?></a>
			</div>
		</div>
	</div>
	<!-- END INTEGRATEBOX -->
