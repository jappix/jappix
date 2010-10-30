<?php

/*

Jappix - An open social platform
This is the Jappix talk html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

?>
	<!-- BEGIN TALKPAGE -->
	<div id="talk" class="hidable">
		<div id="top-content">
			<!-- the tools we need to configure our account and logout -->
				<div class="tools tools-all">
					<a onclick="messagesOpen();" class="messages-hidable hidable"><?php _e("Messages"); ?> <span class="inbox-notify hidable"></span></a>
					<a onclick="openVCard();"><?php _e("Profile"); ?></a>
					<a onclick="optionsOpen();" class="options-hidable hidable"><?php _e("Options"); ?></a>
					<a onclick="normalQuit();"><?php _e("Disconnect"); ?></a>
				</div>
			
			<!-- the music search and listen tool -->
				<div class="tools-all ibubble">
					<div class="tools music" onclick="openMusic();">♫</div>
					
					<div class="music-content tools-content bubble hidable">
						<div class="tools-content-subarrow talk-images"></div>
						
						<div class="tools-content-subitem">
							<div class="player">
								<a class="stop talk-images hidable" onclick="actionMusic('stop');"></a>
							</div>
							
							<div class="list">
								<p class="no-results"><?php _e("No result!"); ?></p>
							</div>
							
							<div class="search">
								<input type="text" class="resetable" />
							</div>
						</div>
					</div>
				</div>
			
			<!-- the notifications tool -->
				<div class="tools-all ibubble">
					<div class="tools notifications" onclick="showBubble('.notifications-content');">✱</div>
					
					<div class="notifications-content tools-content bubble hidable">
						<div class="tools-content-subarrow talk-images"></div>
						
						<div class="tools-content-subitem">
							<p class="nothing"><?php _e("No notifications."); ?></p>
						</div>
					</div>
				</div>
		</div>
		
		<div id="main-content">
			<!-- the left sidebar with buddies and my-infos -->
				<div id="left-content">
					<div id="buddy-list">
						<div class="content"></div>
						
						<div class="filter">
							<input type="text" value="<?php _e("Filter"); ?>" placeholder="<?php _e("Filter"); ?>" />
							<a>x</a>
						</div>
						
						<div class="foot ibubble">
							<div class="buddy-list-icon">
								<a class="add talk-images" title="<?php _e("Add a friend"); ?>"></a>
								
								<div id="buddy-conf-add" class="buddy-conf-item bubble hidable">
									<div class="buddy-conf-subarrow talk-images"></div>
									
									<div class="buddy-conf-subitem">
										<p class="buddy-conf-p" style="margin-bottom: 0;"><?php _e("Add a friend"); ?></p>
										<input type="text" class="buddy-conf-input add-contact-jid resetable" />
									</div>
								</div>
							</div>
							
							<div class="buddy-list-icon">
								<a class="join talk-images" title="<?php _e("Join a chat"); ?>"></a>
								
								<div id="buddy-conf-join" class="buddy-conf-item bubble hidable">
									<div class="buddy-conf-subarrow talk-images"></div>
									
									<div class="buddy-conf-subitem search">
										<p class="buddy-conf-p" style="margin-bottom: 0;"><?php _e("Join a chat"); ?></p>
										<input type="text" class="buddy-conf-input join-jid resetable" />
										<select name="join-type" class="buddy-conf-select buddy-conf-join-select resetable">
											<option value="chat"><?php _e("Chat"); ?></option>
											<option value="groupchat"><?php _e("Groupchat"); ?></option>
										</select>
									</div>
								</div>
							</div>
							
							<div class="buddy-list-icon">
								<a class="groupchat talk-images" title="<?php _e("Your groupchats"); ?>"></a>
								
								<div id="buddy-conf-groupchat" class="buddy-conf-item bubble hidable">
									<div class="buddy-conf-subarrow talk-images"></div>
									
									<div class="buddy-conf-subitem">
										<p class="buddy-conf-p"><?php _e("Your groupchats"); ?></p>
										
										<select name="groupchat-join" class="buddy-conf-select buddy-conf-groupchat-select resetable">
											<option value="none" class="gc-join-first-option"><?php _e("Select a favorite"); ?></option>
										</select>
										
										<p class="buddy-conf-text">
											&rarr; <a class="buddy-conf-groupchat-edit"><?php _e("Manage your favorite groupchats"); ?></a>
										</p>
									</div>
								</div>
							</div>
							
							<div class="buddy-list-icon">
								<a class="more talk-images" title="<?php _e("More stuff"); ?>"></a>
								
								<div id="buddy-conf-more" class="buddy-conf-item bubble hidable">
									<div class="buddy-conf-subarrow talk-images"></div>
									
									<div class="buddy-conf-subitem">
										<p class="buddy-conf-p"><?php _e("More stuff"); ?></p>
										
										<p class="buddy-conf-text">
											&rarr; <a class="buddy-conf-more-display-unavailable showable"><?php _e("Show all friends"); ?></a>
											<a class="buddy-conf-more-display-available hidable"><?php _e("Only show connected friends"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a class="buddy-conf-more-map"><?php _e("Map of friends"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a class="buddy-conf-more-collections"><?php _e("Your collections"); ?></a>
										</p>
										
										<p class="buddy-conf-text archives-hidable showable">
											&rarr; <a class="buddy-conf-more-archives"><?php _e("Message archives"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a class="buddy-conf-more-service-disco"><?php _e("Service discovery"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="http://project.jappix.com/about" target="_blank"><?php _e("About Jappix"); ?></a>
										</p>
									</div>
								</div>
							</div>
							
							<div class="buddy-list-icon alone">
								<a class="involve talk-images" title="<?php _e("Get involved!"); ?>"></a>
								
								<div id="buddy-conf-involve" class="buddy-conf-item bubble hidable">
									<div class="buddy-conf-subarrow talk-images"></div>
									
									<div class="buddy-conf-subitem">
										<p class="buddy-conf-p"><?php _e("Get involved!"); ?></p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="http://codingteam.net/project/jappix/browse" target="_blank"><?php _e("Write code"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="http://codingteam.net/project/jappix/i18n" target="_blank"><?php _e("Translate"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="http://codingteam.net/project/jappix/bugs/add" target="_blank"><?php _e("Report a bug"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="http://codingteam.net/project/jappix/doc" target="_blank"><?php _e("Write documentation"); ?></a>
										</p>
										
										<p class="buddy-conf-text">
											&rarr; <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&amp;business=contact%40post-pro.fr&amp;item_name=Jappix%20Donation&amp;no_shipping=1&amp;no_note=1&amp;tax=0&amp;currency_code=EUR&amp;bn=PP%2dDonationsBF&amp;charset=UTF%2d8" target="_blank"><?php _e("Donate"); ?></a>
										</p>
									</div>
								</div>
							</div>
							
							<div style="clear: both;"></div>
						</div>
					</div>
					
					<div id="my-infos">
						<div class="content">
							<div class="element f-presence">
								<div class="icon talk-images status-available"></div>
								
								<select name="statut" class="change-presence resetable" disabled="disabled">
									<option value="available"><?php _e("Available"); ?></option>
									<option value="chat"><?php _e("Talkative"); ?></option>
									<option value="away"><?php _e("Away"); ?></option>
									<option value="xa"><?php _e("Not available"); ?></option>
									<option value="dnd"><?php _e("Busy"); ?></option>
								</select>
								
								<div id="my-infos-text-first" class="my-infos-text-item hidable">
									<div class="my-infos-text-subarrow talk-images"></div>
									
									<div class="my-infos-text-subitem">
										<p class="my-infos-text-p"><?php _e("A short message?"); ?></p>
										<input type="text" class="my-infos-text-input textPresence" />
									</div>
								</div>
							</div>
							
							<div class="element f-mood pep-hidable hidable">
								<div class="icon talk-images mood-four"></div>
								
								<select name="mood" class="change-mood resetable">
									<option value="none"><?php _e("None"); ?></option>
									<option value="afraid"><?php _e("Afraid"); ?></option>
									<option value="amazed"><?php _e("Amazed"); ?></option>
									<option value="amorous"><?php _e("Amorous"); ?></option>
									<option value="angry"><?php _e("Angry"); ?></option>
									<option value="annoyed"><?php _e("Annoyed"); ?></option>
									<option value="anxious"><?php _e("Anxious"); ?></option>
									<option value="aroused"><?php _e("Aroused"); ?></option>
									<option value="ashamed"><?php _e("Ashamed"); ?></option>
									<option value="bored"><?php _e("Bored"); ?></option>
									<option value="brave"><?php _e("Brave"); ?></option>
									<option value="calm"><?php _e("Calm"); ?></option>
									<option value="cautious"><?php _e("Cautious"); ?></option>
									<option value="cold"><?php _e("Cold"); ?></option>
									<option value="confident"><?php _e("Confident"); ?></option>
									<option value="confused"><?php _e("Confused"); ?></option>
									<option value="contemplative"><?php _e("Contemplative"); ?></option>
									<option value="contented"><?php _e("Contented"); ?></option>
									<option value="cranky"><?php _e("Cranky"); ?></option>
									<option value="crazy"><?php _e("Crazy"); ?></option>
									<option value="creative"><?php _e("Creative"); ?></option>
									<option value="curious"><?php _e("Curious"); ?></option>
									<option value="dejected"><?php _e("Dejected"); ?></option>
									<option value="depressed"><?php _e("Depressed"); ?></option>
									<option value="disappointed"><?php _e("Disappointed"); ?></option>
									<option value="disgusted"><?php _e("Disgusted"); ?></option>
									<option value="dismayed"><?php _e("Dismayed"); ?></option>
									<option value="distracted"><?php _e("Distracted"); ?></option>
									<option value="embarrassed"><?php _e("Embarrassed"); ?></option>
									<option value="envious"><?php _e("Envious"); ?></option>
									<option value="excited"><?php _e("Excited"); ?></option>
									<option value="flirtatious"><?php _e("Flirtatious"); ?></option>
									<option value="frustrated"><?php _e("Frustrated"); ?></option>
									<option value="grateful"><?php _e("Grateful"); ?></option>
									<option value="grieving"><?php _e("Grieving"); ?></option>
									<option value="grumpy"><?php _e("Grumpy"); ?></option>
									<option value="guilty"><?php _e("Guilty"); ?></option>
									<option value="happy"><?php _e("Happy"); ?></option>
									<option value="hopeful"><?php _e("Hopeful"); ?></option>
									<option value="hot"><?php _e("Hot"); ?></option>
									<option value="humbled"><?php _e("Humbled"); ?></option>
									<option value="humiliated"><?php _e("Humiliated"); ?></option>
									<option value="hungry"><?php _e("Hungry"); ?></option>
									<option value="hurt"><?php _e("Hurt"); ?></option>
									<option value="impressed"><?php _e("Impressed"); ?></option>
									<option value="in_awe"><?php _e("In awe"); ?></option>
									<option value="in_love"><?php _e("In love"); ?></option>
									<option value="indignant"><?php _e("Indignant"); ?></option>
									<option value="interested"><?php _e("Interested"); ?></option>
									<option value="intoxicated"><?php _e("Intoxicated"); ?></option>
									<option value="invincible"><?php _e("Invincible"); ?></option>
									<option value="jealous"><?php _e("Jealous"); ?></option>
									<option value="lonely"><?php _e("Lonely"); ?></option>
									<option value="lost"><?php _e("Lost"); ?></option>
									<option value="lucky"><?php _e("Lucky"); ?></option>
									<option value="mean"><?php _e("Mean"); ?></option>
									<option value="moody"><?php _e("Moody"); ?></option>
									<option value="nervous"><?php _e("Nervous"); ?></option>
									<option value="neutral"><?php _e("Neutral"); ?></option>
									<option value="offended"><?php _e("Offended"); ?></option>
									<option value="outraged"><?php _e("Outraged"); ?></option>
									<option value="playful"><?php _e("Playful"); ?></option>
									<option value="proud"><?php _e("Proud"); ?></option>
									<option value="relaxed"><?php _e("Relaxed"); ?></option>
									<option value="relieved"><?php _e("Relieved"); ?></option>
									<option value="remorseful"><?php _e("Remorseful"); ?></option>
									<option value="restless"><?php _e("Restless"); ?></option>
									<option value="sad"><?php _e("Sad"); ?></option>
									<option value="sarcastic"><?php _e("Sarcastic"); ?></option>
									<option value="satisfied"><?php _e("Satisfied"); ?></option>
									<option value="serious"><?php _e("Serious"); ?></option>
									<option value="shocked"><?php _e("Shocked"); ?></option>
									<option value="shy"><?php _e("Shy"); ?></option>
									<option value="sick"><?php _e("Sick"); ?></option>
									<option value="sleepy"><?php _e("Sleepy"); ?></option>
									<option value="spontaneous"><?php _e("Spontaneous"); ?></option>
									<option value="stressed"><?php _e("Stressed"); ?></option>
									<option value="strong"><?php _e("Strong"); ?></option>
									<option value="surprised"><?php _e("Surprised"); ?></option>
									<option value="thankful"><?php _e("Thankful"); ?></option>
									<option value="thirsty"><?php _e("Thirsty"); ?></option>
									<option value="tired"><?php _e("Tired"); ?></option>
									<option value="undefined"><?php _e("Undefined"); ?></option>
									<option value="weak"><?php _e("Weak"); ?></option>
									<option value="worried"><?php _e("Worried"); ?></option>
								</select>
								
								<div id="my-infos-text-second" class="my-infos-text-item hidable">
									<div class="my-infos-text-subarrow talk-images"></div>
									
									<div class="my-infos-text-subitem">
										<p class="my-infos-text-p"><?php _e("How are you?"); ?></p>
										<input type="text" class="my-infos-text-input textMood" />
									</div>
								</div>
							</div>
							
							<div class="element f-activity pep-hidable hidable">
								<div class="icon talk-images activity-exercising"></div>
								
								<select name="activity" class="change-activity resetable">
									<option value="none"><?php _e("None"); ?></option>
									
									<optgroup label="<?php _e("Chores"); ?>">
										<option value="doing_chores/buying_groceries"><?php _e("Groceries"); ?></option>
										<option value="doing_chores/cleaning"><?php _e("Cleaning"); ?></option>
										<option value="doing_chores/cooking"><?php _e("Cooking"); ?></option>
										<option value="doing_chores/doing_maintenance"><?php _e("Maintenance"); ?></option>
										<option value="doing_chores/doing_the_dishes"><?php _e("Dishes"); ?></option>
										<option value="doing_chores/doing_the_laundry"><?php _e("Laundry"); ?></option>
										<option value="doing_chores/gardening"><?php _e("Gardening"); ?></option>
										<option value="doing_chores/running_an_errand"><?php _e("Errand"); ?></option>
										<option value="doing_chores/walking_the_dog"><?php _e("Dog"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Drinking"); ?>">
										<option value="drinking/having_a_beer"><?php _e("Beer"); ?></option>
										<option value="drinking/having_coffee"><?php _e("Coffee"); ?></option>
										<option value="drinking/having_tea"><?php _e("Tea"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Eating"); ?>">
										<option value="eating/having_a_snack"><?php _e("Snack"); ?></option>
										<option value="eating/having_a_breakfast"><?php _e("Breakfast"); ?></option>
										<option value="eating/having_dinner"><?php _e("Dinner"); ?></option>
										<option value="eating/having_lunch"><?php _e("Lunch"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Exercising"); ?>">
										<option value="exercising/cycling"><?php _e("Cycling"); ?></option>
										<option value="exercising/dancing"><?php _e("Dancing"); ?></option>
										<option value="exercising/hiking"><?php _e("Hiking"); ?></option>
										<option value="exercising/jogging"><?php _e("Jogging"); ?></option>
										<option value="exercising/playing_sports"><?php _e("Sport"); ?></option>
										<option value="exercising/playing_sports"><?php _e("Running"); ?></option>
										<option value="exercising/skiing"><?php _e("Skiing"); ?></option>
										<option value="exercising/swimming"><?php _e("Swimming"); ?></option>
										<option value="exercising/working_out"><?php _e("Working out"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Grooming"); ?>">
										<option value="grooming/at_the_spa"><?php _e("Spa"); ?></option>
										<option value="grooming/brushing_teeth"><?php _e("Teeth"); ?></option>
										<option value="grooming/getting_a_haircut"><?php _e("Haircut"); ?></option>
										<option value="grooming/shaving"><?php _e("Shaving"); ?></option>
										<option value="grooming/taking_a_bath"><?php _e("Bath"); ?></option>
										<option value="grooming/taking_a_shower"><?php _e("Shower"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Appointment"); ?>">
										<option value="having_appointment"><?php _e("Appointment"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Inactive"); ?>">
										<option value="inactive/day_off"><?php _e("Day off"); ?></option>
										<option value="inactive/hanging_out"><?php _e("Hanging out"); ?></option>
										<option value="inactive/hiding"><?php _e("Hiding"); ?></option>
										<option value="inactive/on_vacation"><?php _e("Vacation"); ?></option>
										<option value="inactive/praying"><?php _e("Praying"); ?></option>
										<option value="inactive/scheduled_holiday"><?php _e("Holiday"); ?></option>
										<option value="inactive/sleeping"><?php _e("Sleeping"); ?></option>
										<option value="inactive/thinking"><?php _e("Thinking"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Relaxing"); ?>">
										<option value="relaxing/fishing"><?php _e("Fishing"); ?></option>
										<option value="relaxing/gaming"><?php _e("Gaming"); ?></option>
										<option value="relaxing/going_out"><?php _e("Going out"); ?></option>
										<option value="relaxing/partying"><?php _e("Partying"); ?></option>
										<option value="relaxing/reading"><?php _e("Reading"); ?></option>
										<option value="relaxing/rehearsing"><?php _e("Rehearsing"); ?></option>
										<option value="relaxing/shopping"><?php _e("Shopping"); ?></option>
										<option value="relaxing/smoking"><?php _e("Smoking"); ?></option>
										<option value="relaxing/socializing"><?php _e("Socializing"); ?></option>
										<option value="relaxing/sunbathing"><?php _e("Sunbathing"); ?></option>
										<option value="relaxing/watching_tv"><?php _e("TV"); ?></option>
										<option value="relaxing/watching_a_movie"><?php _e("Movie"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Talking"); ?>">
										<option value="talking/in_real_life"><?php _e("Real life"); ?></option>
										<option value="talking/on_the_phone"><?php _e("Phone"); ?></option>
										<option value="talking/on_video_phone"><?php _e("Video phone"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Traveling"); ?>">
										<option value="traveling/commuting"><?php _e("Commuting"); ?></option>
										<option value="traveling/cycling"><?php _e("Cycling"); ?></option>
										<option value="traveling/driving"><?php _e("Driving"); ?></option>
										<option value="traveling/in_a_car"><?php _e("In a car"); ?></option>
										<option value="traveling/on_a_bus"><?php _e("On a bus"); ?></option>
										<option value="traveling/on_a_plane"><?php _e("On a plane"); ?></option>
										<option value="traveling/on_a_train"><?php _e("On a train"); ?></option>
										<option value="traveling/on_a_trip"><?php _e("On a trip"); ?></option>
										<option value="traveling/walking"><?php _e("Walking"); ?></option>
									</optgroup>
									
									<optgroup label="<?php _e("Working"); ?>">
										<option value="working/coding"><?php _e("Coding"); ?></option>
										<option value="working/in_a_meeting"><?php _e("Meeting"); ?></option>
										<option value="working/studying"><?php _e("Studying"); ?></option>
										<option value="working/writing"><?php _e("Writing"); ?></option>
									</optgroup>
								</select>
								
								<div id="my-infos-text-third" class="my-infos-text-item hidable">
									<div class="my-infos-text-subarrow talk-images"></div>
									
									<div class="my-infos-text-subitem">
										<p class="my-infos-text-p"><?php _e("What are you doing?"); ?></p>
										<input type="text" class="my-infos-text-input textActivity" />
									</div>
								</div>
							</div>
							
							<div class="element f-geoloc hidable">
								<div class="icon talk-images location-world"></div>
								
								<a href="http://www.openstreetmap.org/" target="_blank"><?php _e("Where are you?"); ?></a>
							</div>
						</div>
					</div>
				</div>
			
			<!-- the right content with all the things we need to chat -->
				<div id="right-content">
					<div id="chat-switch">
						<div class="chans">
							<div class="channel switcher activechan" onclick="switchChan('channel');">
								<div class="icon talk-images"></div>
							
								<div class="name"><?php _e("Channel"); ?></div>
							</div>
						</div>
						
						<div class="more ibubble">
							<div class="more-button" onclick="showBubble('#chat-switch .more-content');" title="<?php _e("All tabs"); ?>">▾</div>
							<div class="more-content bubble hidable">
								<div class="channel switcher activechan" onclick="switchChan('channel');">
									<div class="icon talk-images"></div>
									
									<div class="name"><?php _e("Channel"); ?></div>
								</div>
							</div>
						</div>
					</div>
					
					<div id="chat-engine">
						<div id="channel" class="showable chat-engine-chan">
							<div class="showable channel-header mixed">
								<div class="avatar-container"></div>
								
								<div class="update">
									<p><?php _e("What's up with you?"); ?></p>
									
									<form action="#" method="post" onsubmit="return sendMicroblog(this);">
										<div class="microblog-body">
											<input class="resetable" type="text" name="microblog_body" maxlength="140" disabled="disabled" />
										</div>
										
										<div class="one-microblog-icon ibubble">
											<a onclick="showBubble('#attach');" title="<?php _e("Attach a file"); ?>" class="postit attach talk-images showable"></a>
											<a onclick="unattachMicroblog();" title="<?php _e("Unattach the file"); ?>" class="postit unattach talk-images hidable"></a>
											
											<div id="attach" class="bubble hidable">
												<div class="attach-subarrow talk-images"></div>
												
												<div class="attach-subitem">
													<p class="attach-p"><?php _e("Attach a file"); ?></p>
													<input type="file" class="resetable" id="microblog-attach" onchange="attachMicroblog()" />
												</div>
											</div>
										</div>
									</form>
								</div>
							</div>
							
							<div class="showable channel-content mixed"></div>
							
							<div class="channel-footer">
								<div class="sync hidable talk-images"><?php _e("You are synchronized with your network."); ?></div>
								
								<div class="unsync hidable talk-images"><?php _e("Cannot send anything: you can only receive notices!"); ?></div>
								
								<div class="fetch showable wait-small"><?php _e("Fetching the social channel..."); ?></div>
							</div>
						</div>
					</div>
				</div>
		</div>
	</div>
	<!-- END TALKPAGE -->
