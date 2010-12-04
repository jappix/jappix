/*

Jappix - An open social platform
These are the talkpage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 04/12/10

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
						'<input type="text" value="' + _e("Filter") +  '" placeholder="' + _e("Filter") +  '" />' + 
						'<a>x</a>' + 
					'</div>' + 
					
					'<div class="foot ibubble">' + 
						'<div class="buddy-list-icon">' + 
							'<a class="add talk-images" title="' + _e("Add a friend") +  '"></a>' + 
							
							'<div id="buddy-conf-add" class="buddy-conf-item bubble hidable">' + 
								'<div class="buddy-conf-subarrow talk-images"></div>' + 
								
								'<div class="buddy-conf-subitem">' + 
									'<p class="buddy-conf-p" style="margin-bottom: 0;">' + _e("Add a friend") +  '</p>' + 
									'<input type="text" class="buddy-conf-input add-contact-jid" required="" />' + 
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
									
									'<p class="buddy-conf-text">' + 
										'- <a class="buddy-conf-more-map">' + _e("Map of friends") +  '</a>' + 
									'</p>' + 
									
									'<p class="buddy-conf-text">' + 
										'- <a class="buddy-conf-more-collections">' + _e("Your collections") +  '</a>' + 
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
						'<div class="element f-presence">' + 
							'<div class="icon talk-images status-available"></div>' + 
							
							'<select name="statut" class="change-presence" disabled="disabled">' + 
								'<option value="available">' + _e("Available") +  '</option>' + 
								'<option value="chat">' + _e("Talkative") +  '</option>' + 
								'<option value="away">' + _e("Away") +  '</option>' + 
								'<option value="xa">' + _e("Not available") +  '</option>' + 
								'<option value="dnd">' + _e("Busy") +  '</option>' + 
							'</select>' + 
							
							'<div id="my-infos-text-first" class="my-infos-text-item">' + 
								'<div class="my-infos-text-subarrow talk-images"></div>' + 
								
								'<div class="my-infos-text-subitem">' + 
									'<p class="my-infos-text-p">' + _e("A short message?") +  '</p>' + 
									'<input type="text" class="my-infos-text-input textPresence" />' + 
								'</div>' + 
							'</div>' + 
						'</div>';
						
						if(!anonymous) html += 
						'<div class="element f-mood pep-hidable">' + 
							'<div class="icon talk-images mood-four"></div>' + 
							
							'<select name="mood" class="change-mood">' + 
								'<option value="none">' + _e("None") +  '</option>' + 
								'<option value="afraid">' + _e("Afraid") +  '</option>' + 
								'<option value="amazed">' + _e("Amazed") +  '</option>' + 
								'<option value="amorous">' + _e("Amorous") +  '</option>' + 
								'<option value="angry">' + _e("Angry") +  '</option>' + 
								'<option value="annoyed">' + _e("Annoyed") +  '</option>' + 
								'<option value="anxious">' + _e("Anxious") +  '</option>' + 
								'<option value="aroused">' + _e("Aroused") +  '</option>' + 
								'<option value="ashamed">' + _e("Ashamed") +  '</option>' + 
								'<option value="bored">' + _e("Bored") +  '</option>' + 
								'<option value="brave">' + _e("Brave") +  '</option>' + 
								'<option value="calm">' + _e("Calm") +  '</option>' + 
								'<option value="cautious">' + _e("Cautious") +  '</option>' + 
								'<option value="cold">' + _e("Cold") +  '</option>' + 
								'<option value="confident">' + _e("Confident") +  '</option>' + 
								'<option value="confused">' + _e("Confused") +  '</option>' + 
								'<option value="contemplative">' + _e("Contemplative") +  '</option>' + 
								'<option value="contented">' + _e("Contented") +  '</option>' + 
								'<option value="cranky">' + _e("Cranky") +  '</option>' + 
								'<option value="crazy">' + _e("Crazy") +  '</option>' + 
								'<option value="creative">' + _e("Creative") +  '</option>' + 
								'<option value="curious">' + _e("Curious") +  '</option>' + 
								'<option value="dejected">' + _e("Dejected") +  '</option>' + 
								'<option value="depressed">' + _e("Depressed") +  '</option>' + 
								'<option value="disappointed">' + _e("Disappointed") +  '</option>' + 
								'<option value="disgusted">' + _e("Disgusted") +  '</option>' + 
								'<option value="dismayed">' + _e("Dismayed") +  '</option>' + 
								'<option value="distracted">' + _e("Distracted") +  '</option>' + 
								'<option value="embarrassed">' + _e("Embarrassed") +  '</option>' + 
								'<option value="envious">' + _e("Envious") +  '</option>' + 
								'<option value="excited">' + _e("Excited") +  '</option>' + 
								'<option value="flirtatious">' + _e("Flirtatious") +  '</option>' + 
								'<option value="frustrated">' + _e("Frustrated") +  '</option>' + 
								'<option value="grateful">' + _e("Grateful") +  '</option>' + 
								'<option value="grieving">' + _e("Grieving") +  '</option>' + 
								'<option value="grumpy">' + _e("Grumpy") +  '</option>' + 
								'<option value="guilty">' + _e("Guilty") +  '</option>' + 
								'<option value="happy">' + _e("Happy") +  '</option>' + 
								'<option value="hopeful">' + _e("Hopeful") +  '</option>' + 
								'<option value="hot">' + _e("Hot") +  '</option>' + 
								'<option value="humbled">' + _e("Humbled") +  '</option>' + 
								'<option value="humiliated">' + _e("Humiliated") +  '</option>' + 
								'<option value="hungry">' + _e("Hungry") +  '</option>' + 
								'<option value="hurt">' + _e("Hurt") +  '</option>' + 
								'<option value="impressed">' + _e("Impressed") +  '</option>' + 
								'<option value="in_awe">' + _e("In awe") +  '</option>' + 
								'<option value="in_love">' + _e("In love") +  '</option>' + 
								'<option value="indignant">' + _e("Indignant") +  '</option>' + 
								'<option value="interested">' + _e("Interested") +  '</option>' + 
								'<option value="intoxicated">' + _e("Intoxicated") +  '</option>' + 
								'<option value="invincible">' + _e("Invincible") +  '</option>' + 
								'<option value="jealous">' + _e("Jealous") +  '</option>' + 
								'<option value="lonely">' + _e("Lonely") +  '</option>' + 
								'<option value="lost">' + _e("Lost") +  '</option>' + 
								'<option value="lucky">' + _e("Lucky") +  '</option>' + 
								'<option value="mean">' + _e("Mean") +  '</option>' + 
								'<option value="moody">' + _e("Moody") +  '</option>' + 
								'<option value="nervous">' + _e("Nervous") +  '</option>' + 
								'<option value="neutral">' + _e("Neutral") +  '</option>' + 
								'<option value="offended">' + _e("Offended") +  '</option>' + 
								'<option value="outraged">' + _e("Outraged") +  '</option>' + 
								'<option value="playful">' + _e("Playful") +  '</option>' + 
								'<option value="proud">' + _e("Proud") +  '</option>' + 
								'<option value="relaxed">' + _e("Relaxed") +  '</option>' + 
								'<option value="relieved">' + _e("Relieved") +  '</option>' + 
								'<option value="remorseful">' + _e("Remorseful") +  '</option>' + 
								'<option value="restless">' + _e("Restless") +  '</option>' + 
								'<option value="sad">' + _e("Sad") +  '</option>' + 
								'<option value="sarcastic">' + _e("Sarcastic") +  '</option>' + 
								'<option value="satisfied">' + _e("Satisfied") +  '</option>' + 
								'<option value="serious">' + _e("Serious") +  '</option>' + 
								'<option value="shocked">' + _e("Shocked") +  '</option>' + 
								'<option value="shy">' + _e("Shy") +  '</option>' + 
								'<option value="sick">' + _e("Sick") +  '</option>' + 
								'<option value="sleepy">' + _e("Sleepy") +  '</option>' + 
								'<option value="spontaneous">' + _e("Spontaneous") +  '</option>' + 
								'<option value="stressed">' + _e("Stressed") +  '</option>' + 
								'<option value="strong">' + _e("Strong") +  '</option>' + 
								'<option value="surprised">' + _e("Surprised") +  '</option>' + 
								'<option value="thankful">' + _e("Thankful") +  '</option>' + 
								'<option value="thirsty">' + _e("Thirsty") +  '</option>' + 
								'<option value="tired">' + _e("Tired") +  '</option>' + 
								'<option value="undefined">' + _e("Undefined") +  '</option>' + 
								'<option value="weak">' + _e("Weak") +  '</option>' + 
								'<option value="worried">' + _e("Worried") +  '</option>' + 
							'</select>' + 
							
							'<div id="my-infos-text-second" class="my-infos-text-item">' + 
								'<div class="my-infos-text-subarrow talk-images"></div>' + 
								
								'<div class="my-infos-text-subitem">' + 
									'<p class="my-infos-text-p">' + _e("How are you?") +  '</p>' + 
									'<input type="text" class="my-infos-text-input textMood" />' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="element f-activity pep-hidable">' + 
							'<div class="icon talk-images activity-exercising"></div>' + 
							
							'<select name="activity" class="change-activity">' + 
								'<option value="none">' + _e("None") +  '</option>' + 
								
								'<optgroup label="' + _e("Chores") +  '">' + 
									'<option value="doing_chores/buying_groceries">' + _e("Groceries") +  '</option>' + 
									'<option value="doing_chores/cleaning">' + _e("Cleaning") +  '</option>' + 
									'<option value="doing_chores/cooking">' + _e("Cooking") +  '</option>' + 
									'<option value="doing_chores/doing_maintenance">' + _e("Maintenance") +  '</option>' + 
									'<option value="doing_chores/doing_the_dishes">' + _e("Dishes") +  '</option>' + 
									'<option value="doing_chores/doing_the_laundry">' + _e("Laundry") +  '</option>' + 
									'<option value="doing_chores/gardening">' + _e("Gardening") +  '</option>' + 
									'<option value="doing_chores/running_an_errand">' + _e("Errand") +  '</option>' + 
									'<option value="doing_chores/walking_the_dog">' + _e("Dog") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Drinking") +  '">' + 
									'<option value="drinking/having_a_beer">' + _e("Beer") +  '</option>' + 
									'<option value="drinking/having_coffee">' + _e("Coffee") +  '</option>' + 
									'<option value="drinking/having_tea">' + _e("Tea") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Eating") +  '">' + 
									'<option value="eating/having_a_snack">' + _e("Snack") +  '</option>' + 
									'<option value="eating/having_a_breakfast">' + _e("Breakfast") +  '</option>' + 
									'<option value="eating/having_dinner">' + _e("Dinner") +  '</option>' + 
									'<option value="eating/having_lunch">' + _e("Lunch") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Exercising") +  '">' + 
									'<option value="exercising/cycling">' + _e("Cycling") +  '</option>' + 
									'<option value="exercising/dancing">' + _e("Dancing") +  '</option>' + 
									'<option value="exercising/hiking">' + _e("Hiking") +  '</option>' + 
									'<option value="exercising/jogging">' + _e("Jogging") +  '</option>' + 
									'<option value="exercising/playing_sports">' + _e("Sport") +  '</option>' + 
									'<option value="exercising/playing_sports">' + _e("Running") +  '</option>' + 
									'<option value="exercising/skiing">' + _e("Skiing") +  '</option>' + 
									'<option value="exercising/swimming">' + _e("Swimming") +  '</option>' + 
									'<option value="exercising/working_out">' + _e("Working out") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Grooming") +  '">' + 
									'<option value="grooming/at_the_spa">' + _e("Spa") +  '</option>' + 
									'<option value="grooming/brushing_teeth">' + _e("Teeth") +  '</option>' + 
									'<option value="grooming/getting_a_haircut">' + _e("Haircut") +  '</option>' + 
									'<option value="grooming/shaving">' + _e("Shaving") +  '</option>' + 
									'<option value="grooming/taking_a_bath">' + _e("Bath") +  '</option>' + 
									'<option value="grooming/taking_a_shower">' + _e("Shower") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Appointment") +  '">' + 
									'<option value="having_appointment">' + _e("Appointment") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Inactive") +  '">' + 
									'<option value="inactive/day_off">' + _e("Day off") +  '</option>' + 
									'<option value="inactive/hanging_out">' + _e("Hanging out") +  '</option>' + 
									'<option value="inactive/hiding">' + _e("Hiding") +  '</option>' + 
									'<option value="inactive/on_vacation">' + _e("Vacation") +  '</option>' + 
									'<option value="inactive/praying">' + _e("Praying") +  '</option>' + 
									'<option value="inactive/scheduled_holiday">' + _e("Holiday") +  '</option>' + 
									'<option value="inactive/sleeping">' + _e("Sleeping") +  '</option>' + 
									'<option value="inactive/thinking">' + _e("Thinking") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Relaxing") +  '">' + 
									'<option value="relaxing/fishing">' + _e("Fishing") +  '</option>' + 
									'<option value="relaxing/gaming">' + _e("Gaming") +  '</option>' + 
									'<option value="relaxing/going_out">' + _e("Going out") +  '</option>' + 
									'<option value="relaxing/partying">' + _e("Partying") +  '</option>' + 
									'<option value="relaxing/reading">' + _e("Reading") +  '</option>' + 
									'<option value="relaxing/rehearsing">' + _e("Rehearsing") +  '</option>' + 
									'<option value="relaxing/shopping">' + _e("Shopping") +  '</option>' + 
									'<option value="relaxing/smoking">' + _e("Smoking") +  '</option>' + 
									'<option value="relaxing/socializing">' + _e("Socializing") +  '</option>' + 
									'<option value="relaxing/sunbathing">' + _e("Sunbathing") +  '</option>' + 
									'<option value="relaxing/watching_tv">' + _e("TV") +  '</option>' + 
									'<option value="relaxing/watching_a_movie">' + _e("Movie") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Talking") +  '">' + 
									'<option value="talking/in_real_life">' + _e("Real life") +  '</option>' + 
									'<option value="talking/on_the_phone">' + _e("Phone") +  '</option>' + 
									'<option value="talking/on_video_phone">' + _e("Video phone") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Traveling") +  '">' + 
									'<option value="traveling/commuting">' + _e("Commuting") +  '</option>' + 
									'<option value="traveling/cycling">' + _e("Cycling") +  '</option>' + 
									'<option value="traveling/driving">' + _e("Driving") +  '</option>' + 
									'<option value="traveling/in_a_car">' + _e("In a car") +  '</option>' + 
									'<option value="traveling/on_a_bus">' + _e("On a bus") +  '</option>' + 
									'<option value="traveling/on_a_plane">' + _e("On a plane") +  '</option>' + 
									'<option value="traveling/on_a_train">' + _e("On a train") +  '</option>' + 
									'<option value="traveling/on_a_trip">' + _e("On a trip") +  '</option>' + 
									'<option value="traveling/walking">' + _e("Walking") +  '</option>' + 
								'</optgroup>' + 
								
								'<optgroup label="' + _e("Working") +  '">' + 
									'<option value="working/coding">' + _e("Coding") +  '</option>' + 
									'<option value="working/in_a_meeting">' + _e("Meeting") +  '</option>' + 
									'<option value="working/studying">' + _e("Studying") +  '</option>' + 
									'<option value="working/writing">' + _e("Writing") +  '</option>' + 
								'</optgroup>' + 
							'</select>' + 
							
							'<div id="my-infos-text-third" class="my-infos-text-item">' + 
								'<div class="my-infos-text-subarrow talk-images"></div>' + 
								
								'<div class="my-infos-text-subitem">' + 
									'<p class="my-infos-text-p">' + _e("What are you doing?") +  '</p>' + 
									'<input type="text" class="my-infos-text-input textActivity" />' + 
								'</div>' + 
							'</div>' + 
						'</div>' + 
						
						'<div class="element f-geoloc">' + 
							'<div class="icon talk-images location-world"></div>' + 
							
							'<a href="http://www.openstreetmap.org/" target="_blank">' + _e("Where are you?") +  '</a>' + 
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
											'<input type="hidden" name="MAX_FILE_SIZE" value="' + JAPPIX_MAX_FILE_SIZE + '">' + 
											'<input type="hidden" name="user" value="' + getXID() + '" />' + 
											'<input type="hidden" name="location" value="' + generateURL(JAPPIX_LOCATION) + '" />' + 
											'<input type="file" name="file" required="" />' + 
											'<input type="submit" value="' + _e("Send") + '" />' + 
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
	AVATAR_PENDING = new Array();
	
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
