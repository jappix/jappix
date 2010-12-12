/*

Jappix - An open social platform
These are the talkpage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 11/12/10

*/

// Creates the talkpage events
function eventsTalkPage() {
	// Launch all associated plugins
	launchMicroblog();
	launchRoster();
	launchPresence();
	launchPEP();
	launchFavorites('talk');
	launchMusic();
}

// Creates the talkpage code
function createTalkPage() {
	// Talkpage exists?
	if(exists('#talk'))
		return false;
	
	// Anonymous detector
	var anonymous = isAnonymous();
	
	// Generate the HTML code
	var html = 
	'<div id="talk" class="removable">' + 
		'<div id="top-content">' + 
			'<div class="tools tools-logo talk-images"></div>' + 
			
			'<div class="tools tools-all">';
				
				if(!anonymous) html += 
				'<a onclick="return openInbox();" class="inbox-hidable">' + _e("Messages") +  '</a>' + 
				'<a onclick="return openVCard();">' + _e("Profile") +  '</a>' + 
				'<a onclick="return optionsOpen();" class="options-hidable">' + _e("Options") +  '</a>' + 
				'<a onclick="return normalQuit();">' + _e("Disconnect") +  '</a>';
				
				else html +=
				'<a href="./">' + _e("Disconnect") +  '</a>';
			
			html +=
			'</div>';
			
			if(!anonymous) html += 
			'<div class="tools-all ibubble">' + 
				'<div class="tools music talk-images" onclick="return openMusic();"></div>' + 
				
				'<div class="music-content tools-content bubble hidable">' + 
					'<div class="tools-content-subarrow talk-images"></div>' + 
					
					'<div class="tools-content-subitem">' + 
						'<div class="player">' + 
							'<a class="stop talk-images" onclick="return actionMusic(\'stop\');"></a>' + 
						'</div>' + 
						
						'<div class="list">' + 
							'<p class="no-results">' + _e("No result!") +  '</p>' + 
						'</div>' + 
						
						'<div class="search">' + 
							'<input type="text" />' + 
						'</div>' + 
					'</div>' + 
				'</div>' + 
			'</div>' + 
			
			'<div class="tools-all ibubble">' + 
				'<div class="tools notifications talk-images" onclick="return showBubble(\'.notifications-content\');"></div>' + 
				
				'<div class="notifications-content tools-content bubble hidable">' + 
					'<div class="tools-content-subarrow talk-images"></div>' + 
					
					'<div class="tools-content-subitem">' + 
						'<p class="nothing">' + _e("No notifications.") +  '</p>' + 
					'</div>' + 
				'</div>' + 
			'</div>';
		
		html +=
		'</div>' + 
		
		'<div id="main-content">' + 
			'<div id="left-content">';
				if(!anonymous) html += 
				'<div id="buddy-list">' + 
					'<div class="content"></div>' + 
					
					'<div class="filter">' + 
						'<input type="text" placeholder="' + _e("Filter") +  '" />' + 
						'<a>x</a>' + 
					'</div>' + 
					
					'<div class="foot ibubble">' + 
						'<div class="buddy-list-icon">' + 
							'<a class="add talk-images" title="' + _e("Add a friend") +  '"></a>' + 
							
							'<div id="buddy-conf-add" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem">' + 
									'<p class="buddy-conf-p">' + _e("Add a friend") +  '</p>' + 
									'<label><span>' + _e("Address") +  '</span><input type="text" class="buddy-conf-input add-contact-jid" required="" /></label>' + 
									'<label><span>' + _e("Name") +  '</span><input type="text" class="buddy-conf-input add-contact-name" /></label>' +  
									'<label>' + 
										'<span>' + _e("Gateway") +  '</span>' + 
										'<select class="buddy-conf-select add-contact-gateway">' + 
											'<option value="none" selected="">' + _e("None") +  '</option>' + 
										'</select>' + 
									'</label>' +  
									'<span class="add-contact-name-get">' + _e("Getting the name...") + '</span>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="buddy-list-icon">' + 
							'<a class="join talk-images" title="' + _e("Join a chat") +  '"></a>' + 
							
							'<div id="buddy-conf-join" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem search">' + 
									'<p class="buddy-conf-p" style="margin-bottom: 0;">' + _e("Join a chat") +  '</p>' + 
									'<input type="text" class="buddy-conf-input join-jid" required="" />' + 
									'<select class="buddy-conf-select buddy-conf-join-select join-type">' + 
										'<option value="chat">' + _e("Chat") +  '</option>' + 
										'<option value="groupchat">' + _e("Groupchat") +  '</option>' + 
									'</select>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="buddy-list-icon">' + 
							'<a class="groupchat talk-images" title="' + _e("Your groupchats") +  '"></a>' + 
							
							'<div id="buddy-conf-groupchat" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem">' + 
									'<p class="buddy-conf-p">' + _e("Your groupchats") +  '</p>' + 
									
									'<select name="groupchat-join" class="buddy-conf-select buddy-conf-groupchat-select">' + 
										'<option value="none" class="gc-join-first-option" selected="selected">' + _e("Select a favorite") +  '</option>' + 
									'</select>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a class="buddy-conf-groupchat-edit">' + _e("Manage your favorite groupchats") +  '</a>' + 
									'</p>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="buddy-list-icon">' + 
							'<a class="more talk-images" title="' + _e("More stuff") +  '"></a>' + 
							
							'<div id="buddy-conf-more" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem">' + 
									'<p class="buddy-conf-p">' + _e("More stuff") +  '</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a class="buddy-conf-more-display-unavailable">' + _e("Show all friends") +  '</a>' + 
										'<a class="buddy-conf-more-display-available">' + _e("Only show connected friends") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text archives-hidable">' + 
										'- <a class="buddy-conf-more-archives">' + _e("Message archives") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a class="buddy-conf-more-service-disco">' + _e("Service discovery") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://project.jappix.com/about" target="_blank">' + _e("About Jappix") +  '</a>' + 
									'</p>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="buddy-list-icon alone">' + 
							'<a class="involve talk-images" title="' + _e("Get involved!") +  '"></a>' + 
							
							'<div id="buddy-conf-involve" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem">' + 
									'<p class="buddy-conf-p">' + _e("Get involved!") +  '</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://codingteam.net/project/jappix/browse" target="_blank">' + _e("Write code") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://codingteam.net/project/jappix/i18n" target="_blank">' + _e("Translate") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://codingteam.net/project/jappix/bugs/add" target="_blank">' + _e("Report a bug") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://codingteam.net/project/jappix/doc" target="_blank">' + _e("Write documentation") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a href="http://project.jappix.com/donate" target="_blank">' + _e("Donate") +  '</a>' + 
									'</p>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div style="clear: both;"></div>' + 
					'</div>' + 
				'</div>';
				
				html +=
				'<div id="my-infos">' + 
					'<div class="content">' + 
						'<div class="element f-presence ibubble">' + 
							'<a class="icon picker disabled" data-value="available">' + 
								'<span class="talk-images"></span>' + 
							'</a>' + 
							
							'<input id="presence-status" type="text" placeholder="' + _e("Status") + '" disabled="" />' + 
						'</div>';
						
						if(!anonymous) html += 
						'<div class="element f-mood pep-hidable ibubble">' + 
							'<a class="icon picker disabled" data-value="happy">' + 
								'<span class="talk-images"></span>' + 
							'</a>' + 
							
							'<input id="mood-text" type="text" placeholder="' + _e("Mood") + '" disabled="" />' + 
						'</div>' + 
						
						'<div class="element f-activity pep-hidable ibubble">' + 
							'<a class="icon picker disabled" data-value="exercising">' + 
								'<span class="talk-images activity-exercising"></span>' + 
							'</a>' + 
							
							'<input id="activity-text" type="text" placeholder="' + _e("Activity") + '" disabled="" />' + 
						'</div>';
					
					html +=
					'</div>' + 
				'</div>' + 
			'</div>' + 
			
			'<div id="right-content">' + 
				'<div id="page-switch">' + 
					'<div class="chans">';
						if(!anonymous) html += 
						'<div class="channel switcher activechan" onclick="return switchChan(\'channel\');">' + 
							'<div class="icon talk-images"></div>' + 
						
							'<div class="name">' + _e("Channel") +  '</div>' + 
						'</div>';
					
					html +=
					'</div>' + 
					
					'<div class="more ibubble">' + 
						'<div class="more-button talk-images" onclick="return showBubble(\'#page-switch .more-content\');" title="' + _e("All tabs") +  '"></div>' + 
						
						'<div class="more-content bubble hidable">';
							if(!anonymous) html += 
							'<div class="channel switcher activechan" onclick="return switchChan(\'channel\');">' + 
								'<div class="icon talk-images"></div>' + 
								
								'<div class="name">' + _e("Channel") +  '</div>' + 
							'</div>';
						
						html +=
						'</div>' + 
					'</div>' + 
				'</div>' + 
				
				'<div id="page-engine">';
					if(!anonymous) html += 
					'<div id="channel" class="page-engine-chan" style="display: block;">' + 
						'<div class="top mixed ' + hex_md5(getXID()) + '">' + 
							'<div class="avatar-container">' + 
								'<img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" />' + 
							'</div>' + 
							
							'<div class="update">' + 
								'<p>' + _e("What\'s up with you?") +  '</p>' + 
								
								'<div class="microblog-body">' + 
									'<input class="focusable" type="text" name="microblog_body" maxlength="140" disabled="disabled" />' + 
								'</div>' + 
								
								'<div class="one-microblog-icon ibubble">' + 
									'<a onclick="return showBubble(\'#attach\');" title="' + _e("Attach a file") +  '" class="postit attach talk-images"></a>' + 
									'<a onclick="return unattachMicroblog();" class="postit unattach talk-images"></a>' + 
									
									'<form id="attach" class="bubble hidable" action="./php/file-share.php" method="post" enctype="multipart/form-data">' + 
										'<div class="attach-subarrow talk-images"></div>' + 
										
										'<div class="attach-subitem">' + 
											'<p class="attach-p">' + _e("Attach a file") +  '</p>' + 
											generateFileShare() + 
										'</div>' + 
									'</form>' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="content mixed"></div>' + 
						
						'<div class="footer">' + 
							'<div class="sync talk-images">' + _e("You are synchronized with your network.") +  '</div>' + 
							
							'<div class="unsync talk-images">' + _e("Cannot send anything: you can only receive notices!") +  '</div>' + 
							
							'<div class="fetch wait-small">' + _e("Fetching the social channel...") +  '</div>' + 
						'</div>' + 
					'</div>';
				
				html +=
				'</div>' + 
			'</div>' + 
		'</div>' + 
	'</div>';
	
	// Create the HTML code
	$('body').prepend(html);
	
	// Adapt the buddy-list size
	adaptRoster();
	
	// Create JS events
	eventsTalkPage();
	
	// Start the auto idle functions
	liveIdle();
	
	return true;
}

// Destroys the talkpage code
function destroyTalkPage() {
	// Reset our database
	resetDB();
	
	// Reset some vars
	STANZA_ID = 1;
	BLIST_ALL = false;
	FIRST_PRESENCE_SENT = false;
	SEARCH_FILTERED = false;
	AVATAR_PENDING = [];
	
	// Kill all timers, exept the board ones
	$('*:not(#board .one-board)').stopTime();
	
	// Kill the auto idle functions
	dieIdle();
	
	// We renitalise the html markup as its initiale look
	$('.removable').remove();
	pageTitle('home');
	
	// Finally we show the homepage
	$('#home').show();
}
