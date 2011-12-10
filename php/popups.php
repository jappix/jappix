<?php

/*

Jappix - An Open μSocial Platform
This is the Jappix popups html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 03/06/10

*/

?>
	<!-- BEGIN VCARD POPUP -->
	<div id="vcard" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("My profile"); ?></p>
				</div>
				
				<div class="tab">
					<a class="lap1 tab-active" onclick="switchVCard(1);"><?php _e("Identity"); ?></a>
					<a class="lap2" onclick="switchVCard(2);"><?php _e("Avatar"); ?></a>
					<a class="lap3" onclick="switchVCard(3);"><?php _e("Others"); ?></a>
				</div>
				
				<div class="content">
					<div id="lap1" class="one-lap">
						<div class="forms">
							<fieldset>
								<legend><?php _e("Civility"); ?></legend>
								<label for="FN"><?php _e("Complete name"); ?></label>
								<input type="text" id="FN" class="resetable vcard-item" /><br />
								<label for="NICKNAME"><?php _e("Nick"); ?></label>
								<input type="text" id="NICKNAME" class="resetable vcard-item" /><br />
								<label for="N-GIVEN"><?php _e("Given name"); ?></label>
								<input type="text" id="N-GIVEN" class="resetable vcard-item" /><br />
								<label for="N-FAMILY"><?php _e("Family name"); ?></label>
								<input type="text" id="N-FAMILY" class="resetable vcard-item" /><br />
								<label for="BDAY"><?php _e("Birth"); ?></label>
								<input type="text" id="BDAY" class="resetable vcard-item" />
							</fieldset>
							
							<fieldset>
								<legend><?php _e("Contact"); ?></legend>
								<label for="EMAIL-USERID"><?php _e("E-mail"); ?></label>
								<input type="text" id="EMAIL-USERID" class="resetable vcard-item" /><br />
								<label for="TEL-NUMBER"><?php _e("Phone"); ?></label>
								<input type="text" id="TEL-NUMBER" class="resetable vcard-item" /><br />
								<label for="URL"><?php _e("Website"); ?></label>
								<input type="text" id="URL" class="resetable vcard-item" />
							</fieldset>
						</div>
					</div>
					
					<div id="lap2" class="one-lap">
						<div class="forms">
							<fieldset>
								<legend><?php _e("Picture of you"); ?></legend>
								<input type="hidden" id="PHOTO-TYPE" class="resetable vcard-item" />
								<input type="hidden" id="PHOTO-BINVAL" class="resetable vcard-item" />
								<input style="margin-left: 15px;" type="file" name="vCardAvatar" id="vCardAvatar" class="resetable" onchange="sendThisAvatar()" />
							</fieldset>
							
							<fieldset>
								<legend><?php _e("Actual picture"); ?></legend>
								<div class="avatar-container"></div>
								<div class="avatar-delete hidable" onclick="deleteAvatar();"><p><?php _e("Delete"); ?></p></div>
								<div class="no-avatar">
									<p><?php _e("What a pity! You have no avatar defined in your identity card!"); ?></p>
								</div>
							</fieldset>
							
							<div class="avatar-ok avatar-info removable"><p><?php _e("Here it is! A new beautiful avatar!"); ?></p></div>
							<div class="avatar-error avatar-info removable"><p><?php _e("Not supported image file or bad size."); ?></p></div>
						</div>
					</div>
					
					<div id="lap3" class="one-lap">
						<div class="forms">
							<fieldset>
								<legend><?php _e("Postal address"); ?></legend>
								<label for="ADR-STREET"><?php _e("Street"); ?></label>
								<input type="text" id="ADR-STREET" class="resetable vcard-item" /><br />
								<label for="ADR-LOCALITY"><?php _e("City"); ?></label>
								<input type="text" id="ADR-LOCALITY" class="resetable vcard-item" /><br />
								<label for="ADR-PCODE"><?php _e("Postal code"); ?></label>
								<input type="text" id="ADR-PCODE" class="resetable vcard-item" /><br />
								<label for="ADR-CTRY"><?php _e("Country"); ?></label>
								<input type="text" id="ADR-CTRY" class="resetable vcard-item" /><br />
							</fieldset>
							
							<fieldset>
								<legend><?php _e("Biography"); ?></legend>
								<textarea id="DESC" rows="8" cols="60" class="resetable vcard-item"></textarea>
							</fieldset>
						</div>
					</div>
					
					<div class="infos">
						<div class="infos-content">
							<p><b><?php _e("Important notice"); ?>:</b></p>
							<p><?php _e("Be careful of the informations you write into your profile, because if you put sensitive personal data in it.. it could be accessible from everyone (even someone you don't want to)."); ?></p>
							<p><?php _e("Everything is not private on XMPP, here's one of those things, your public profile (vCard)."); ?></p>
							<p><?php _e("It's strongly recommended to send an avatar (25Kio maximum), like a picture of yourself, because that makes you easily recognizable from your friends."); ?></p>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return sendVCard();"><?php _e("Save"); ?></div>
					<div class="finish" onclick="return cancelVCard();"><?php _e("Cancel"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END VCARD POPUP -->
	
	<!-- BEGIN OPTIONS POPUP -->
	<div id="options" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("I edit my options"); ?></p>
				</div>
				
				<div class="tab">
					<a class="conf1 tab-active" onclick="switchOptions(1);"><?php _e("General"); ?></a>
					<a class="conf2" onclick="switchOptions(2);"><?php _e("Channel"); ?></a>
					<a class="conf3" onclick="switchOptions(3);"><?php _e("Account"); ?></a>
				</div>
				
				<div class="content">
					<div id="conf1" class="one-conf">
						<div class="forms">
							<fieldset>
								<legend><?php _e("Audio"); ?></legend>
								<label for="sounds"><?php _e("Sounds"); ?></label>
								<select id="sounds" name="sounds" class="sounds resetable">
									<option value="on"><?php _e("Active"); ?></option>
									<option value="off"><?php _e("Inactive"); ?></option>
								</select>
							</fieldset>
							
							<fieldset>
								<legend><?php _e("Geolocation"); ?></legend>
								<label for="geolocation"><?php _e("Geolocation"); ?></label>
								<select id="geolocation" name="geolocation" class="geolocation resetable">
									<option value="on"><?php _e("Share"); ?></option>
									<option value="off"><?php _e("Hide"); ?></option>
								</select>
							</fieldset>
						</div>
					</div>
					
					<div id="conf2" class="one-conf">
						<div class="forms">
							<fieldset>
								<legend><?php _e("Channel"); ?></legend>
								<label><?php _e("Empty"); ?></label>
								<a class="linked empty-channel"><?php _e("Empty my channel"); ?></a>
								<label><?php _e("Persistent"); ?></label>
								<select id="persistent" name="persistent" class="persistent resetable">
									<option value="1"><?php _e("Active"); ?></option>
									<option value="0"><?php _e("Inactive"); ?></option>
								</select>
								<label><?php _e("Maximum notices"); ?></label>
								<select id="maxnotices" name="maxnotices" class="maxnotices resetable">
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
									<?php _e("Password"); ?>: <input type="password" class="check-empty resetable" />
								</div>
								
								<a class="sub-ask-bottom" onclick="deleteMyMicroblog();"><?php _e("Empty"); ?> &raquo;</a>
							</div>
						</div>
					</div>
					
					<div id="conf3" class="one-conf">
						<div class="forms">
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
									<p><?php _e("Old"); ?>: <input type="password" class="old resetable" />
									<?php _e("New (2 times)"); ?>: <input type="password" class="new1 resetable" />
									<input type="password" class="new2 resetable" /></p>
								</div>
								
								<a class="sub-ask-bottom" onclick="sendNewPassword();"><?php _e("Continue"); ?> &raquo;</a>
							</div>
							
							<div class="sub-ask sub-ask-delete sub-ask-element hidable">
								<div class="sub-ask-top">
									<div class="sub-ask-title"><?php _e("Delete my account"); ?></div>
									<a class="sub-ask-close">X</a>
								</div>
								
								<div class="sub-ask-content">
									<?php _e("Password"); ?>: <input type="password" class="check-password resetable" />
								</div>
								
								<a class="sub-ask-bottom" onclick="deleteMyAccount();"><?php _e("Delete"); ?> &raquo;</a>
							</div>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="finish" onclick="return saveOptions();"><?php _e("Save"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END OPTIONS POPUP -->
	
	<!-- BEGIN FAVORITES -->
	<div id="favorites" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("Manage my favorites rooms"); ?></p>
				</div>
				
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
								<div class="head-text fedit-head-text"><?php _e("Select a favorite"); ?>:</div>
								<select name="fedit-head-select" class="head-select fedit-head-select resetable">
									<option value="none" class="fedit-head-select-first-option">Sélectionnez un salon</option>
								</select>
							</div>
							
							<div class="results fedit-results static-fav-results">
								<div class="fedit-line">
									<div class="fedit-text"><?php _e("Title"); ?>:</div>
									<input class="fedit-input fedit-title fedit-required" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php _e("Name"); ?>:</div>
									<input class="fedit-input fedit-nick fedit-required" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php _e("Room"); ?>:</div>
									<input class="fedit-input fedit-chan fedit-required" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php _e("Server"); ?>:</div>
									<input class="fedit-input fedit-server fedit-required" type="text" value="<?php echo HOST_MUC; ?>" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php _e("Password"); ?>:</div>
									<input class="fedit-input fedit-password" type="password" />
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
								<div class="head-text fsearch-head-text"><?php _e("Search a room on"); ?>:</div>
								<input type="text" class="head-input fsearch-head-server" value="<?php echo HOST_MUC; ?>" />
							</div>
							
							<div class="results fsearch-results static-fav-results">
								<p class="fsearch-noresults"><?php _e("No room found on this server."); ?></p>
							</div>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return quitFavorites();"><?php _e("Close"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END FAVORITES -->
	
	<!-- BEGIN DISCOVERY -->
	<div id="discovery" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("Service discovery"); ?></p>
				</div>
				
				<div class="content">
					<div class="discovery-head">
						<div class="disco-server-text"><?php _e("Server to query"); ?></div>
						<input name="disco-server-input" class="disco-server-input resetable" value="<?php echo HOST_MAIN; ?>" />
					</div>
					
					<div class="results discovery-results">
						<p class="discovery-noresults"><?php _e("Sorry, but the server didn't return any result!"); ?></p>
						
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

				<div class="discovery-forms">
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return quitDiscovery();"><?php _e("Close"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END DISCOVERY -->
	
	<!-- BEGIN MESSAGES -->
	<div id="inbox" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("My inbox"); ?></p>
				</div>
				
				<div class="content">
					<div class="head messages-head">
						<div class="head-text messages-head-text"><?php _e("Available actions"); ?></div>
						<div class="head-actions messages-head-actions">
							<a onclick="deleteAllMessages();" class="a-delete-messages"><?php _e("Clean"); ?></a>
							<a onclick="newMessage();" class="a-new-message"><?php _e("New"); ?></a>
							<a onclick="showMessages();" class="a-show-messages"><?php _e("Received"); ?></a>
						</div>
					</div>
					
					<div class="messages-results">
						<p class="messages-noresults showable"><?php _e("No message stored in your inbox."); ?></p>
						<div class="inbox"></div>
					</div>
					
					<div class="messages-new">
						<div class="messages-new-to messages-new-block">
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
					<div class="finish" onclick="return messagesClose();"><?php _e("Close"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END MESSAGES -->
	
	<!-- BEGIN MUC-ADMIN -->
	<div id="muc-admin" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("MUC administration"); ?></p>
				</div>
				
				<div class="content">
					<div class="head muc-admin-head">
						<div class="head-text muc-admin-head-text"><?php _e("You administrate this room"); ?>:</div>
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
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return saveMucAdmin();"><?php _e("Save"); ?></div>
					<div class="finish" onclick="return cancelMucAdmin();"><?php _e("Cancel"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END MUC-ADMIN -->
	
	<!-- BEGIN INTEGRATEBOX -->
	<div id="integratebox" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("Media viewer"); ?></p>
				</div>
				
				<div class="content">
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return closeIntegrateBox();"><?php _e("Close"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END INTEGRATEBOX -->
	
	<!-- BEGIN USERINFOS -->
	<div id="userinfos" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php _e("User infos"); ?></p>
				</div>
				
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
							<h3 id="BUDDY-JID" class="reset-info"><?php _e("unknown"); ?></h3>
							
							<input id="BUDDY-PHOTO-BINVAL" type="hidden" class="resetable" />
							<input id="BUDDY-PHOTO-TYPE" type="hidden" class="resetable" />
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
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return closeUserInfos();"><?php _e("Close"); ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END USERINFOS -->
