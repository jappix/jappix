<?php

/*

Jappix - The instant messaging. Reinvented.
This is the Jappix main app. html markup

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

Licence : AGPL
Author : Vanaryon
Contact : mailing-list[at]jappix[dot]com
Last revision : 24/03/10

*/

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
	<title><?php echo $LANG['1']; ?></title>
	<link rel="shortcut icon" href="./favicon.ico" />
	<link rel="stylesheet" href="./css/style.css" type="text/css" media="all" />
	<script type="text/javascript" src="./js/scripts.js"></script>
</head>

<body>
	<!-- BEGIN JS DETECTION -->
	<noscript>
		<div class="lock">
			<div id="nojs">
				<div class="nojs-logo"></div>
				<p><b><?php echo $LANG['2']; ?></b></p>
				<p style="margin-top: 30px;"><?php echo $LANG['3']; ?></p>
				<p>&bull; <?php echo $LANG['4']; ?></p>
				<p>&bull; <?php echo $LANG['5']; ?></p>
			</div>
		</div>
	</noscript>
	<!-- END JS DETECTION -->
	
	<!-- BEGIN ERROR BANNER -->
	<div id="error" onclick="closeThisError();">
		<!-- login errors -->
			<p class="error-p error-9 notification"><?php echo $LANG['9']; ?></p>
		
		<!-- register errors -->
			<p class="error-p error-5 notification"><?php echo $LANG['10']; ?></p>
			<p class="error-p error-10 notification"><?php echo $LANG['11']; ?></p>
			
		<!-- connection errors -->
			<p class="error-p error-6 notification"><?php echo $LANG['12']; ?></p>
			<p class="error-p error-7 notification"><?php echo $LANG['13']; ?></p>
			<p class="error-p error-8 notification"><?php echo $LANG['14']; ?></p>
			<p class="error-p error-13 notification"><?php echo $LANG['15']; ?></p>
			<p class="error-p error-17 notification"><?php echo $LANG['16']; ?></p>
			<p class="error-p error-12 notification"><?php echo $LANG['17']; ?></p>
			<p class="error-p error-18 notification"><?php echo $LANG['18']; ?></p>
			<p class="error-p error-20 notification"><?php echo $LANG['19']; ?></p>
			<p class="error-p error-17 notification"><?php echo $LANG['20']; ?></p>
			<p class="error-p error-21 notification"><?php echo $LANG['21']; ?></p>
			<p class="error-p error-14 notification"><?php echo $LANG['22']; ?></p>
			<p class="error-p error-11 notification"><?php echo $LANG['23']; ?></p>
			<p class="error-p error-22 notification"><?php echo $LANG['24']; ?></p>
			<p class="error-p error-22 notification"><?php echo $LANG['25']; ?></p>
		
		<!-- system errors -->
			<p class="error-p error-1 notification"><?php echo $LANG['26']; ?></p>
			<p class="error-p error-4 notification"><?php echo $LANG['27']; ?></p>
			<p class="error-p error-25 notification"><?php echo $LANG['614']; ?></p>
		
		<!-- favorites errors -->
			<p class="error-p error-23 notification"><?php echo $LANG['28']; ?></p>
			
		<!-- groupchat errors -->
			<p class="error-p error-26 notification"><?php echo $LANG['666']; ?></p>
		
		<!-- other errors -->
			<p class="error-p error-2 notification"><?php echo $LANG['29']; ?></p>
			<p class="error-p error-3 notification"><?php echo $LANG['30']; ?></p>
	</div>
	<!-- END ERROR BANNER -->
	
	<!-- BEGIN INFO BANNER -->
	<div id="info" onclick="closeThisInfo();">
		<!-- roster infos -->
			<p class="info-p info-11 notification"><?php echo $LANG['676']; ?></p>
		
		<!-- options infos -->
			<p class="info-p info-1 notification"><?php echo $LANG['602']; ?></p>
			<p class="info-p info-2 notification"><?php echo $LANG['603']; ?></p>
		
		<!-- groupchat infos -->
			<p class="info-p info-5 notification"><?php echo $LANG['658']; ?></p>
			<p class="info-p info-6 notification"><?php echo $LANG['665']; ?></p>
			<p class="info-p info-7 notification"><?php echo $LANG['671']; ?></p>
			<p class="info-p info-8 notification"><?php echo $LANG['673']; ?></p>
			<p class="info-p info-9 notification"><?php echo $LANG['674']; ?></p>
			<p class="info-p info-10 notification"><?php echo $LANG['675']; ?></p>
		
		<!-- session infos -->
			<p class="info-p info-3 notification"><?php echo $LANG['606']; ?></p>
			<p class="info-p info-4 notification"><?php echo $LANG['612']; ?></p>
	</div>
	<!-- END INFO BANNER -->
	
	<!-- BEGIN HOMEPAGE -->
	<div id="home" class="showable">
		<!-- the tooltip to help the user completing forms -->
			<div class="tooltip"></div>
			
		<!-- the topbar of jappix, with the logo and the login form -->
			<div id="topbar">
				<div class="logo"></div>
		
				<div class="connect">
					<div class="left"></div>

					<div class="right">
						<form id="ajax-l-form" name="loginForm" onsubmit="return doLogin(this);" action="#">
							<p class="maintitle"><?php echo $LANG['32']; ?></p>
							<p class="l-jid" style="color: #959595; font-size: 16px;"><span class="jtitle1"><?php echo $LANG['33']; ?></span><input class="jadd resetable" type="text" id='l-jid' name="l-jid" title="<?php echo $LANG['34']; ?>" /><span class="jaro">@</span><input class="jadd" type="text" id='l-server' name="l-server" title="<?php echo $LANG['35']; ?>" value="<?php echo HOST_MAIN; ?>" /></p>
							<p style="color: #959595; font-size: 16px;"><span class="jtitle2"><?php echo $LANG['36']; ?></span><input class="jpwd resetable" type="password" id='l-pass' name="l-pass" title="<?php echo $LANG['37']; ?>" /><input class="jgo submit-button" type="submit" name="l-submit" value="Go !" title="<?php echo $LANG['38']; ?>" /></p>
						</form>
					</div>
				</div>
			</div>
			
		<!-- the main content of the page -->
			<div id="contentcenter">
				<!-- the leftcontent where users can register a new account -->
					<div id="leftcontent">
						<div id="leftbar">
							<p class="maintitle"><?php echo $LANG['39']; ?></p>
						
							<form id="ajax-r-form" name="registerForm" onsubmit="return doRegister(this);" action="#">
								<div style="margin-top: 15px;">
									<div class="group"></div>

									<div class="register">
											<p style="color: #959595; font-size: 20px; margin-bottom: 5px;"><?php echo $LANG['40']; ?></p>
											<input class="register-input registerStart resetable" type="text" id="r-nick" name="r-nick" title="<?php echo $LANG['41']; ?>" />
									</div>
								</div>
				
								<div style="margin-top: 23px;">
									<div class="group"></div>

									<div class="register">
											<p style="color: #959595; font-size: 20px; margin-bottom: 5px;"><?php echo $LANG['42']; ?></p>
											<input class="register-input registerStart resetable" type="text" id="r-server" name="r-server" title="<?php echo $LANG['43']; ?>" value="<?php echo HOST_MAIN; ?>" />
									</div>
								</div>
				
								<div style="margin-top: 23px;">
									<div class="group"></div>

									<div class="register">
											<p style="color: #959595; font-size: 20px; margin-bottom: 5px;"><?php echo $LANG['44']; ?></p>
											<input class="register-input registerStart resetable" type="password" id="r-pass" name="r-pass" title="<?php echo $LANG['45']; ?>" />
									</div>
								</div>
				
								<div style="margin-top: 30px; font-size: 0.9em; border-top: 1px solid #c8c8c8;" id="ajax-r-result">
									<p style="margin-top: 20px; margin-bottom: 20px; font-size: 13px; text-align: justify;"><?php echo $LANG['46']; ?></p>
								</div>

								<div style="padding-top: 15px; font-size: 0.9em; border-top: 1px solid #c8c8c8;">
									<div style="float: right;">
										<input type="submit" id="r-submit" name="r-submit" value="Continuer &raquo;" title="<?php echo $LANG['47']; ?>" class="submit-button send" />
									</div>
								
									<div style="display: none; float: right; margin: -2px 12px 0 0" class="register-wait wait-small"></div>
								</div>
							</form>
						</div>
						
						<?php if(SSL == 'on') { ?>
							<div id="sslbar">
								<p class="sslicon"><?php echo $LANG['48']; ?></p>
								<p><?php echo $LANG['49']; ?></p>
							</div>
						<?php } ?>
					</div>
					
				<!-- the right content where the users are told what's really jappix -->
					<div id="rightcontent">
						<div id="rightmenu">
							<ul>
								<li style="margin-left: 20px;"><a class="selected whatsjappix" onclick="switchMenu('whatsjappix');"><?php echo $LANG['50']; ?></a></li>
								<li style="margin-left: 10px;"><a class="advantages" onclick="switchMenu('advantages');"><?php echo $LANG['51']; ?></a></li>
								<li style="margin-left: 10px;"><a class="yourprivatelife" onclick="switchMenu('yourprivatelife');"><?php echo $LANG['52']; ?></a></li>
								<li style="margin-left: 10px;"><a class="theproject" onclick="switchMenu('theproject');"><?php echo $LANG['53']; ?></a></li>
								<li style="margin-left: 10px;"><a class="abouth" onclick="switchMenu('abouth');"><?php echo $LANG['54']; ?></a></li>
							</ul>
						</div>

						<div id="rightbar-text">
							<div id="whatsjappix" class="rightbar-group">
								<h2><?php echo $LANG['50']; ?></h2>
								<p><?php echo $LANG['55']; ?></p>
								<div class="whatsjappix"></div>
								<p><?php echo $LANG['56']; ?></p>
								<p><?php echo $LANG['57']; ?></p>
								<p><?php echo $LANG['58']; ?></p>
								<p><?php echo $LANG['59']; ?></p>
								<p><?php echo $LANG['615']; ?></p>
								<p><?php echo $LANG['60']; ?></p>
							</div>
				
							<div id="advantages" class="rightbar-group">
								<h2><?php echo $LANG['51']; ?></h2>
								<p><?php echo $LANG['61']; ?></p>
								<div class="advantages rb-image"></div>
								<p>&bull; <?php echo $LANG['63']; ?></p>
								<p>&bull; <?php echo $LANG['65']; ?></p>
								<p>&bull; <?php echo $LANG['66']; ?></p>
							</div>

							<div id="yourprivatelife" class="rightbar-group">
								<h2><?php echo $LANG['52']; ?></h2>
								<p><?php echo $LANG['67']; ?></p>
								<div class="yourprivatelife rb-image"></div>
								<p><?php echo $LANG['68']; ?></p>
								<p><?php echo $LANG['69']; ?></p>
								<p><?php echo $LANG['71']; ?></p>
							</div>
							
							<div id="theproject" class="rightbar-group">
								<h2><?php echo $LANG['53']; ?></h2>
								<p><?php echo $LANG['72']; ?></p>
								<div class="theproject rb-image"></div>
								<p><?php echo $LANG['73']; ?></p>
								<p><?php echo $LANG['74']; ?></p>
								<p><?php echo $LANG['75']; ?></p>
								<p><?php echo $LANG['76']; ?></p>
							</div>

							<div id="abouth" class="rightbar-group">
								<h2><?php echo $LANG['54']; ?></h2>
								<p><?php echo $LANG['77']; ?></p>
								<div class="abouth rb-image"></div>
								<p><?php echo $LANG['78']; ?></p>
								<p><?php echo $LANG['79']; ?></p>
								<p><?php echo $LANG['80']; ?></p>
								<p><?php echo $LANG['81']; ?></p>
								<p><?php echo $LANG['616']; ?></p>
							</div>
						</div>
			
						<div id="rightbar-thumbs">
							<a class="prevPage browse left"></a>
							<div class="scrollable">
								<div class="items">
									<a href="./scr/img1.png" class="thumb thumbs-images e1" title="<?php echo $LANG['82']; ?>"></a>
									<a href="./scr/img2.png" class="thumb thumbs-images e2" title="<?php echo $LANG['83']; ?>"></a>
									<a href="./scr/img3.png" class="thumb thumbs-images e3" title="<?php echo $LANG['84']; ?>"></a>
									<a href="./scr/img4.png" class="thumb thumbs-images e4" title="<?php echo $LANG['85']; ?>"></a>
									<a href="./scr/img5.png" class="thumb thumbs-images e5" title="<?php echo $LANG['613']; ?>"></a>
									<a href="./scr/img6.png" class="thumb thumbs-images e6" title="<?php echo $LANG['656']; ?>"></a>
									<div class="thumb"></div>
								</div>
							</div>
							<a class="nextPage browse right"></a>
						</div>
					</div>
				
				<!-- the copyright informations and so -->
					<div id="bottombar">
						<p><?php echo $LANG['90']; ?>  &bull; <b>In free software we trust</b>.</p>
					</div>
			</div>
	</div>
	<!-- END HOMEPAGE -->
	
	<!-- BEGIN TALKPAGE -->
	<div id="talk" class="hidable">
		<div id="top-content">
			<!-- the beautiful logo of jappix -->
				<div class="logo"></div>
			
			<!-- the tools we need to configurate our account and logout -->
				<div class="tools">					
					<a title="<?php echo $LANG['510']; ?>" onclick="messagesOpen();"><?php echo $LANG['511']; ?></a> <div class="new-n-messages">✉</div> | <a title="<?php echo $LANG['91']; ?>" onclick="vcardOpen();"><?php echo $LANG['92']; ?></a> | <a title="<?php echo $LANG['93']; ?>" onclick="optionsOpen();"><?php echo $LANG['94']; ?></a> | <a title="<?php echo $LANG['95']; ?>" onclick="normalQuit();"><?php echo $LANG['96']; ?></a>
				</div>
		</div>
		
		<div id="main-content">
			<!-- the overall buddy-list configuration -->
				<div id="buddy-conf-add" class="buddy-conf-item bubble">
					<p class="buddy-conf-p" style="margin-bottom: 0;"><?php echo $LANG['98']; ?></p>
					<p class="buddy-conf-close" title="<?php echo $LANG['97']; ?>">X</p>
					<input type="text" class="buddy-conf-input textAddContactJID resetable" /> @ <input type="text" class="buddy-conf-input textAddContactServer" value="<?php echo HOST_MAIN; ?>" />
				</div>
				
				<div id="buddy-conf-groupchat" class="buddy-conf-item bubble">
					<p class="buddy-conf-p"><?php echo $LANG['103']; ?></p>
					<p class="buddy-conf-close" title="<?php echo $LANG['97']; ?>">X</p>
					
					<select name="groupchat-join" class="buddy-conf-select buddy-conf-groupchat-select resetable">
						<option value="none" class="gc-join-first-option">Sélectionnez un salon</option>
					</select>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-groupchat-edit"><?php echo $LANG['104']; ?></a>
					</p>
				</div>
				
				<div id="buddy-conf-more" class="buddy-conf-item bubble">
					<p class="buddy-conf-p"><?php echo $LANG['105']; ?></p>
					<p class="buddy-conf-close" title="<?php echo $LANG['97']; ?>">X</p>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-more-display-unavailable"><?php echo $LANG['106']; ?></a>
						<a class="buddy-conf-more-display-available"><?php echo $LANG['107']; ?></a>
					</p>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-more-user-directory"><?php echo $LANG['490']; ?></a>
					</p>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-more-service-disco"><?php echo $LANG['491']; ?></a>
					</p>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-more-help-jappix"><?php echo $LANG['108']; ?></a>
					</p>
					
					<p class="buddy-conf-text">
						&rarr;
						<a class="buddy-conf-more-about-jappix"><?php echo $LANG['109']; ?></a>
					</p>
				</div>
				
			<!-- the overall my-infos asks -->
				<div id="my-infos-text-first" class="my-infos-text-item">
					<p class="my-infos-text-p"><?php echo $LANG['110']; ?></p>
					<p class="my-infos-text-close">X</p>
					<input type="text" class="my-infos-text-input textPresence" />
				</div>
				
				<div id="my-infos-text-second" class="my-infos-text-item">
					<p class="my-infos-text-p"><?php echo $LANG['111']; ?></p>
					<p class="my-infos-text-close">X</p>
					<input type="text" class="my-infos-text-input textMood" />
				</div>
				
				<div id="my-infos-text-third" class="my-infos-text-item">
					<p class="my-infos-text-p"><?php echo $LANG['112']; ?></p>
					<p class="my-infos-text-close">X</p>
					<input type="text" class="my-infos-text-input textActivity" />
				</div>
			
			<!-- the left sidebar with buddies and my-infos -->
				<div id="left-content">
					<div id="buddy-list">
						<div class="title">
							<p><?php echo $LANG['113']; ?></p>
						</div>
						
						<div class="content">
							<div class="loadingRosterIcon showable wait-big" style="margin: 115px 0 0 67px;"></div>
							<div class="no-buddy hidable">
								<p><?php echo $LANG['114']; ?></p>
								<p style="margin-top: 10px;"><?php echo $LANG['115']; ?></p>
								<p style="margin-top: 10px;"><?php echo $LANG['116']; ?></p>
							</div>
						</div>
						
						<div class="foot">
							<div class="foot-elements">
								<div class="add buddy-list-icon" title="<?php echo $LANG['117']; ?>"></div>
								<div class="edit buddy-list-icon" title="<?php echo $LANG['118']; ?>"></div>
								<div class="groupchat buddy-list-icon" title="<?php echo $LANG['119']; ?>"></div>
								<div class="more buddy-list-icon" title="<?php echo $LANG['120']; ?>"></div>
								<div class="invite buddy-list-icon" onclick="inviteFriendOpen();" title="<?php echo $LANG['121']; ?>"></div>
							</div>
							
							<div class="foot-edit-finish">
								<a onclick="buddyEditFinish();"><?php echo $LANG['681']; ?></a>
							</div>
						</div>
					</div>
			
					<div id="my-infos">
						<div class="title">
							<p><?php echo $LANG['122']; ?></p>
						</div>
				
						<div class="content">
							<form id="ajax-t-form" method="post" action="#">
								<div class="element">
									<div class="icon">
										<div class="icon-status status-available"></div>
										<div class="icon-status status-chat"></div>
										<div class="icon-status status-away"></div>
										<div class="icon-status status-xa"></div>
										<div class="icon-status status-dnd"></div>
									</div>
									
									<div class="type">
										<select name="statut" class="changePresence myInfosSelect resetable">
											<option value="available"><?php echo $LANG['123']; ?></option>
											<option value="chat"><?php echo $LANG['124']; ?></option>
											<option value="away"><?php echo $LANG['125']; ?></option>
											<option value="xa"><?php echo $LANG['126']; ?></option>
											<option value="dnd"><?php echo $LANG['127']; ?></option>
										</select>
									</div>
								</div>
					
								<div class="element">
									<div class="icon">
										<div class="icon-mood mood-one"></div>
										<div class="icon-mood mood-two"></div>
										<div class="icon-mood mood-three"></div>
										<div class="icon-mood mood-four"></div>
										<div class="icon-mood mood-five"></div>
										<div class="icon-mood mood-six"></div>
										<div class="icon-mood mood-seven"></div>
										<div class="icon-mood mood-eight"></div>
										<div class="icon-mood mood-nine"></div>
									</div>
						
									<div class="type">
										<select name="mood" class="changeMood myInfosSelect resetable">
											<option value="none"><?php echo $LANG['128']; ?></option>
											<option value="afraid"><?php echo $LANG['129']; ?></option>
											<option value="amazed"><?php echo $LANG['130']; ?></option>
											<option value="amorous"><?php echo $LANG['131']; ?></option>
											<option value="angry"><?php echo $LANG['132']; ?></option>
											<option value="annoyed"><?php echo $LANG['133']; ?></option>
											<option value="anxious"><?php echo $LANG['134']; ?></option>
											<option value="aroused"><?php echo $LANG['135']; ?></option>
											<option value="ashamed"><?php echo $LANG['136']; ?></option>
											<option value="bored"><?php echo $LANG['137']; ?></option>
											<option value="brave"><?php echo $LANG['138']; ?></option>
											<option value="calm"><?php echo $LANG['139']; ?></option>
											<option value="cautious"><?php echo $LANG['140']; ?></option>
											<option value="cold"><?php echo $LANG['141']; ?></option>
											<option value="confident"><?php echo $LANG['142']; ?></option>
											<option value="confused"><?php echo $LANG['143']; ?></option>
											<option value="contemplative"><?php echo $LANG['144']; ?></option>
											<option value="contented"><?php echo $LANG['145']; ?></option>
											<option value="cranky"><?php echo $LANG['146']; ?></option>
											<option value="crazy"><?php echo $LANG['147']; ?></option>
											<option value="creative"><?php echo $LANG['148']; ?></option>
											<option value="curious"><?php echo $LANG['149']; ?></option>
											<option value="dejected"><?php echo $LANG['150']; ?></option>
											<option value="depressed"><?php echo $LANG['151']; ?></option>
											<option value="disappointed"><?php echo $LANG['152']; ?></option>
											<option value="disgusted"><?php echo $LANG['153']; ?></option>
											<option value="dismayed"><?php echo $LANG['154']; ?></option>
											<option value="distracted"><?php echo $LANG['155']; ?></option>
											<option value="embarrassed"><?php echo $LANG['156']; ?></option>
											<option value="envious"><?php echo $LANG['157']; ?></option>
											<option value="excited"><?php echo $LANG['158']; ?></option>
											<option value="flirtatious"><?php echo $LANG['159']; ?></option>
											<option value="frustrated"><?php echo $LANG['160']; ?></option>
											<option value="grateful"><?php echo $LANG['161']; ?></option>
											<option value="grieving"><?php echo $LANG['162']; ?></option>
											<option value="grumpy"><?php echo $LANG['163']; ?></option>
											<option value="guilty"><?php echo $LANG['164']; ?></option>
											<option value="happy"><?php echo $LANG['165']; ?></option>
											<option value="hopeful"><?php echo $LANG['166']; ?></option>
											<option value="hot"><?php echo $LANG['167']; ?></option>
											<option value="humbled"><?php echo $LANG['168']; ?></option>
											<option value="humiliated"><?php echo $LANG['169']; ?></option>
											<option value="hungry"><?php echo $LANG['170']; ?></option>
											<option value="hurt"><?php echo $LANG['171']; ?></option>
											<option value="impressed"><?php echo $LANG['172']; ?></option>
											<option value="in_awe"><?php echo $LANG['173']; ?></option>
											<option value="in_love"><?php echo $LANG['174']; ?></option>
											<option value="indignant"><?php echo $LANG['175']; ?></option>
											<option value="interested"><?php echo $LANG['176']; ?></option>
											<option value="intoxicated"><?php echo $LANG['177']; ?></option>
											<option value="invincible"><?php echo $LANG['178']; ?></option>
											<option value="jealous"><?php echo $LANG['179']; ?></option>
											<option value="lonely"><?php echo $LANG['180']; ?></option>
											<option value="lost"><?php echo $LANG['181']; ?></option>
											<option value="lucky"><?php echo $LANG['182']; ?></option>
											<option value="mean"><?php echo $LANG['183']; ?></option>
											<option value="moody"><?php echo $LANG['184']; ?></option>
											<option value="nervous"><?php echo $LANG['185']; ?></option>
											<option value="neutral"><?php echo $LANG['186']; ?></option>
											<option value="offended"><?php echo $LANG['187']; ?></option>
											<option value="outraged"><?php echo $LANG['188']; ?></option>
											<option value="playful"><?php echo $LANG['189']; ?></option>
											<option value="proud"><?php echo $LANG['190']; ?></option>
											<option value="relaxed"><?php echo $LANG['191']; ?></option>
											<option value="relieved"><?php echo $LANG['192']; ?></option>
											<option value="remorseful"><?php echo $LANG['193']; ?></option>
											<option value="restless"><?php echo $LANG['194']; ?></option>
											<option value="sad"><?php echo $LANG['195']; ?></option>
											<option value="sarcastic"><?php echo $LANG['196']; ?></option>
											<option value="satisfied"><?php echo $LANG['197']; ?></option>
											<option value="serious"><?php echo $LANG['198']; ?></option>
											<option value="shocked"><?php echo $LANG['199']; ?></option>
											<option value="shy"><?php echo $LANG['200']; ?></option>
											<option value="sick"><?php echo $LANG['201']; ?></option>
											<option value="sleepy"><?php echo $LANG['202']; ?></option>
											<option value="spontaneous"><?php echo $LANG['203']; ?></option>
											<option value="stressed"><?php echo $LANG['204']; ?></option>
											<option value="strong"><?php echo $LANG['205']; ?></option>
											<option value="surprised"><?php echo $LANG['206']; ?></option>
											<option value="thankful"><?php echo $LANG['207']; ?></option>
											<option value="thirsty"><?php echo $LANG['208']; ?></option>
											<option value="tired"><?php echo $LANG['209']; ?></option>
											<option value="undefined"><?php echo $LANG['210']; ?></option>
											<option value="weak"><?php echo $LANG['211']; ?></option>
											<option value="worried"><?php echo $LANG['212']; ?></option>
										</select>
									</div>
								</div>
					
								<div class="element">
									<div class="icon">
										<div class="icon-activity activity-chores"></div>
										<div class="icon-activity activity-drinking"></div>
										<div class="icon-activity activity-eating"></div>
										<div class="icon-activity activity-exercising"></div>
										<div class="icon-activity activity-grooming"></div>
										<div class="icon-activity activity-appointment"></div>
										<div class="icon-activity activity-inactive"></div>
										<div class="icon-activity activity-relaxing"></div>
										<div class="icon-activity activity-talking"></div>
										<div class="icon-activity activity-traveling"></div>
										<div class="icon-activity activity-working"></div>
									</div>
						
									<div class="type">
										<select name="activity" class="changeActivity myInfosSelect resetable">
											<option value="none"><?php echo $LANG['213']; ?></option>
											
											<optgroup label="Corvées">
												<option value="doing_chores/other"><?php echo $LANG['214']; ?></option>
												<option value="doing_chores/buying_groceries"><?php echo $LANG['215']; ?></option>
												<option value="doing_chores/cleaning"><?php echo $LANG['216']; ?></option>
												<option value="doing_chores/cooking"><?php echo $LANG['217']; ?></option>
												<option value="doing_chores/doing_maintenance"><?php echo $LANG['218']; ?></option>
												<option value="doing_chores/doing_the_dishes"><?php echo $LANG['219']; ?></option>
												<option value="doing_chores/doing_the_laundry"><?php echo $LANG['220']; ?></option>
												<option value="doing_chores/gardening"><?php echo $LANG['221']; ?></option>
												<option value="doing_chores/running_an_errand"><?php echo $LANG['222']; ?></option>
												<option value="doing_chores/walking_the_dog"><?php echo $LANG['223']; ?></option>
											</optgroup>
											
											<optgroup label="Boissons">
												<option value="drinking/v"><?php echo $LANG['224']; ?></option>
												<option value="drinking/having_a_beer"><?php echo $LANG['225']; ?></option>
												<option value="drinking/having_coffee"><?php echo $LANG['226']; ?></option>
												<option value="drinking/having_tea"><?php echo $LANG['227']; ?></option>
											</optgroup>
											
											<optgroup label="Nourriture">
												<option value="eating/other"><?php echo $LANG['228']; ?></option>
												<option value="eating/having_a_snack"><?php echo $LANG['229']; ?></option>
												<option value="eating/having_a_snack"><?php echo $LANG['230']; ?></option>
												<option value="eating/having_dinner"><?php echo $LANG['231']; ?></option>
												<option value="eating/having_lunch"><?php echo $LANG['232']; ?></option>
											</optgroup>
											
											<optgroup label="Exercice">
												<option value="exercising/other"><?php echo $LANG['233']; ?></option>
												<option value="exercising/cycling"><?php echo $LANG['234']; ?></option>
												<option value="exercising/dancing"><?php echo $LANG['235']; ?></option>
												<option value="exercising/hiking"><?php echo $LANG['236']; ?></option>
												<option value="exercising/jogging"><?php echo $LANG['237']; ?></option>
												<option value="exercising/playing_sports"><?php echo $LANG['238']; ?></option>
												<option value="exercising/playing_sports"><?php echo $LANG['239']; ?></option>
												<option value="exercising/skiing"><?php echo $LANG['240']; ?></option>
												<option value="exercising/swimming"><?php echo $LANG['241']; ?></option>
												<option value="exercising/working_out"><?php echo $LANG['242']; ?></option>
											</optgroup>
											
											<optgroup label="Hygiène">
												<option value="grooming/other"><?php echo $LANG['243']; ?></option>
												<option value="grooming/at_the_spa"><?php echo $LANG['244']; ?></option>
												<option value="grooming/brushing_teeth"><?php echo $LANG['245']; ?></option>
												<option value="grooming/getting_a_haircut"><?php echo $LANG['246']; ?></option>
												<option value="grooming/shaving"><?php echo $LANG['247']; ?></option>
												<option value="grooming/taking_a_bath"><?php echo $LANG['248']; ?></option>
												<option value="grooming/taking_a_shower"><?php echo $LANG['249']; ?></option>
											</optgroup>
											
											<optgroup label="Rencontre">
												<option value="having_appointment/other"><?php echo $LANG['250']; ?></option>
											</optgroup>
											
											<optgroup label="Inactivité">
												<option value="inactive/other"><?php echo $LANG['251']; ?></option>
												<option value="inactive/day_off"><?php echo $LANG['252']; ?></option>
												<option value="inactive/hanging_out"><?php echo $LANG['253']; ?></option>
												<option value="inactive/hiding"><?php echo $LANG['254']; ?></option>
												<option value="inactive/on_vacation"><?php echo $LANG['255']; ?></option>
												<option value="inactive/praying"><?php echo $LANG['256']; ?></option>
												<option value="inactive/scheduled_holiday"><?php echo $LANG['257']; ?></option>
												<option value="inactive/sleeping"><?php echo $LANG['258']; ?></option>
												<option value="inactive/thinking"><?php echo $LANG['259']; ?></option>
											</optgroup>
											
											<optgroup label="Relaxation">
												<option value="relaxing/other"><?php echo $LANG['260']; ?></option>
												<option value="relaxing/fishing"><?php echo $LANG['261']; ?></option>
												<option value="relaxing/gaming"><?php echo $LANG['262']; ?></option>
												<option value="relaxing/going_out"><?php echo $LANG['263']; ?></option>
												<option value="relaxing/partying"><?php echo $LANG['264']; ?></option>
												<option value="relaxing/reading"><?php echo $LANG['265']; ?></option>
												<option value="relaxing/rehearsing"><?php echo $LANG['266']; ?></option>
												<option value="relaxing/shopping"><?php echo $LANG['267']; ?></option>
												<option value="relaxing/smoking"><?php echo $LANG['268']; ?></option>
												<option value="relaxing/socializing"><?php echo $LANG['269']; ?></option>
												<option value="relaxing/sunbathing"><?php echo $LANG['270']; ?></option>
												<option value="relaxing/watching_tv"><?php echo $LANG['271']; ?></option>
												<option value="relaxing/watching_a_movie"><?php echo $LANG['272']; ?></option>
											</optgroup>
											
											<optgroup label="Social">
												<option value="talking/other"><?php echo $LANG['273']; ?></option>
												<option value="talking/in_real_life"><?php echo $LANG['274']; ?></option>
												<option value="talking/on_the_phone"><?php echo $LANG['275']; ?></option>
												<option value="talking/on_video_phone"><?php echo $LANG['276']; ?></option>
											</optgroup>
											
											<optgroup label="Voyage">
												<option value="traveling/other"><?php echo $LANG['277']; ?></option>
												<option value="traveling/commuting"><?php echo $LANG['278']; ?></option>
												<option value="traveling/cycling"><?php echo $LANG['279']; ?></option>
												<option value="traveling/driving"><?php echo $LANG['280']; ?></option>
												<option value="traveling/in_a_car"><?php echo $LANG['281']; ?></option>
												<option value="traveling/on_a_bus"><?php echo $LANG['282']; ?></option>
												<option value="traveling/on_a_plane"><?php echo $LANG['283']; ?></option>
												<option value="traveling/on_a_train"><?php echo $LANG['284']; ?></option>
												<option value="traveling/on_a_trip"><?php echo $LANG['285']; ?></option>
												<option value="traveling/walking"><?php echo $LANG['286']; ?></option>
											</optgroup>
											
											<optgroup label="Boulot">
												<option value="working/other"><?php echo $LANG['287']; ?></option>
												<option value="working/coding"><?php echo $LANG['288']; ?></option>
												<option value="working/in_a_meeting"><?php echo $LANG['289']; ?></option>
												<option value="working/studying"><?php echo $LANG['290']; ?></option>
												<option value="working/writing"><?php echo $LANG['291']; ?></option>
											</optgroup>
										</select>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			
			<!-- the right content with all the things we need to chat -->
				<div id="right-content">
					<div id="chat-engine">
						<div id="newchan" class="showable chat-engine-chan">
							<div class="newchan-top">
								<?php echo $LANG['292']; ?>
							</div>
							
							<div class="newchan-group">
								<div class="newchan-title">
									<?php echo $LANG['293']; ?>
								</div>
							
								<div class="newchan-chapo">
									<p><?php echo $LANG['294']; ?></p>
								</div>
							
								<div class="newchan-forms">
									<input type="text" name="sendToJID" class="newchan-pm-sendToJID resetable" /><span class="arobase">@</span><input type="text" value="<?php echo HOST_MAIN; ?>" name="sendToServer" class="newchan-pm-sendToServer" />
								</div>
							</div>
						
							<div class="newchan-group">
								<div class="newchan-title">
									<?php echo $LANG['295']; ?>
								</div>
							
								<div class="newchan-chapo">
									<p><?php echo $LANG['296']; ?></p>
								</div>
							
								<div class="newchan-forms">
									<input type="text" name="connectToRoom" class="newchan-muc-connectToRoom resetable" /><span class="arobase">@</span><input type="text" value="<?php echo HOST_MUC; ?>" name="connectToMUCServer" class="newchan-pm-connectToMUCServer" />
									<div class="official-list" title="<?php echo $LANG['512']; ?>" onclick="showOfficialMUC();"></div>
									<div id="official-muc" class="bubble">
										<p class="official-muc-p" style="margin-bottom: 0;"><?php echo $LANG['513']; ?></p>
										<p class="official-muc-close" title="<?php echo $LANG['97']; ?>" onclick="hideOfficialMUC();">X</p>
										
										<div class="official-muc-left">
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('cooking@muc.jappix.com');">Cooking</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('travels@muc.jappix.com');">Travels</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('meetings@muc.jappix.com');">Meetings</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('computing@muc.jappix.com');">Computing</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('politic@muc.jappix.com');">Politic</a>
											</p>
										</div>
										
										<div class="official-muc-right">
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('international@muc.jappix.com');">International</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('music@muc.jappix.com');">Music</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('games@muc.jappix.com');">Games</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('studies@muc.jappix.com');">Studies</a>
											</p>
											
											<p class="official-muc-text">
												&rarr;
												<a onclick="joinOfficialMUC('sport@muc.jappix.com');">Sport</a>
											</p>
										</div>
									</div>
								</div>
							</div>
						
							<div class="newchan-alert">
								<div class="newchan-alert-content">
									<p style="margin-top: 2px;"><?php echo $LANG['297']; ?></p>
									<p style="margin-top: 10px;"><?php echo $LANG['298']; ?></p>
								</div>
							</div>
						</div>
					</div>
					
					<div id="chat-switch">
						<div class="title"><?php echo $LANG['299']; ?></div>
						<div class="content">
							<div class="channels">
								<div class="thisFalseChanIsForJQuery"></div>
							</div>
							
							<div class="chan newchan switcher" onclick="switchChan('newchan');">
								<div class="icon"></div>
								<div class="name">
									<a><?php echo $LANG['300']; ?></a>
								</div>
							</div>
						</div>
					</div>
			</div>
		</div>
	</div>
	<!-- END TALKPAGE -->
	
	<!-- BEGIN VCARD POPUP -->
	<div id="vcard" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<a class="lap1" onclick="switchVCard(1);"><?php echo $LANG['301']; ?></a>
					<a class="lap2" onclick="switchVCard(2);"><?php echo $LANG['302']; ?></a>
					<a class="lap3" onclick="switchVCard(3);"><?php echo $LANG['303']; ?></a>
				</div>
				
				<div class="content">
					<div id="lap1" class="one-lap">
						<form id="vCard-identity" action="#" method="post" enctype="multipart/form-data">
							<div class="forms">
								<fieldset>
									<legend align="top"><?php echo $LANG['304']; ?></legend>
									<label for="FN"><?php echo $LANG['305']; ?></label>
									<input type="text" title="<?php echo $LANG['306']; ?>" id="FN" class="resetable" /><br />
									<label for="NICKNAME"><?php echo $LANG['307']; ?></label>
									<input type="text" title="<?php echo $LANG['308']; ?>" id="NICKNAME" class="resetable" /><br />
									<label for="N-GIVEN"><?php echo $LANG['309']; ?></label>
									<input type="text" title="<?php echo $LANG['310']; ?>" id="N-GIVEN" class="resetable" /><br />
									<label for="N-FAMILY"><?php echo $LANG['311']; ?></label>
									<input type="text" title="<?php echo $LANG['312']; ?>" id="N-FAMILY" class="resetable" /><br />
									<label for="BDAY"><?php echo $LANG['313']; ?></label>
									<input type="text" title="<?php echo $LANG['314']; ?>" id="BDAY" class="resetable" />
								</fieldset>
							
								<fieldset>
									<legend align="top"><?php echo $LANG['315']; ?></legend>
									<label for="EMAIL-USERID"><?php echo $LANG['487']; ?></label>
									<input type="text" title="<?php echo $LANG['316']; ?>" id="EMAIL-USERID" class="resetable" /><br />
									<label for="TEL-NUMBER"><?php echo $LANG['317']; ?></label>
									<input type="text" title="<?php echo $LANG['318']; ?>" id="TEL-NUMBER" class="resetable" /><br />
									<label for="URL"><?php echo $LANG['319']; ?></label>
									<input type="text" title="<?php echo $LANG['320']; ?>" id="URL" class="resetable" />
								</fieldset>
							</div>
						</form>
					</div>
						
					<div id="lap2" class="one-lap">
						<form id="vCard-avatar" action="./php/vcard-avatar-base64encode.php" method="post" enctype="multipart/form-data">
							<div class="forms">
								<fieldset>
									<legend align="top"><?php echo $LANG['321']; ?></legend>
										<input type="hidden" id="PHOTO-TYPE" class="resetable" />
										<input type="hidden" id="PHOTO-BINVAL" class="resetable" />
										<input style="margin-left: 15px;" size="20" type="file" name="vCard-avatar" class="resetable" />
										<input class="send" type="submit" name="vCard-avatar-submit" value="<?php echo $LANG['322']; ?>" />
								</fieldset>
							
								<fieldset>
									<legend align="top"><?php echo $LANG['323']; ?></legend>
									<div class="avatar-container"></div>
									<div class="avatar-delete removable" title="<?php echo $LANG['550']; ?>" onclick="deleteAvatar();"><p><?php echo $LANG['549']; ?></p></div>
									<div class="no-avatar">
										<div class="no-avatar-content">
											<p style="font-weight: bold; text-decoration: underline; margin-bottom: 5px;"><?php echo $LANG['324']; ?></p>
											<p style="margin-bottom: 2px;"><?php echo $LANG['325']; ?></p>
											<p><?php echo $LANG['326']; ?></p>
										</div>
									</div>
								</fieldset>
							
								<div class="thisFalseAvatarWaitIsForJQuery"></div>
							</div>
						</form>
					</div>
					
					<div id="lap3" class="one-lap">
						<form id="vCard-other" action="#" method="post" enctype="multipart/form-data">
							<div class="forms">
								<fieldset>
									<legend align="top"><?php echo $LANG['327']; ?></legend>
									<label for="ADR-STREET"><?php echo $LANG['328']; ?></label>
									<input type="text" title="<?php echo $LANG['329']; ?>" id="ADR-STREET" class="resetable" /><br />
									<label for="ADR-LOCALITY"><?php echo $LANG['330']; ?></label>
									<input type="text" title="<?php echo $LANG['331']; ?>" id="ADR-LOCALITY" class="resetable" /><br />
									<label for="ADR-PCODE"><?php echo $LANG['332']; ?></label>
									<input type="text" title="<?php echo $LANG['333']; ?>" id="ADR-PCODE" class="resetable" /><br />
									<label for="ADR-CTRY"><?php echo $LANG['334']; ?></label>
									<input type="text" title="<?php echo $LANG['335']; ?>" id="ADR-CTRY" class="resetable" /><br />
								</fieldset>
							
								<fieldset>
									<legend align="top"><?php echo $LANG['336']; ?></legend>
									<textarea id="DESC" rows="8" cols="60" class="resetable"></textarea>
								</fieldset>
							</div>
						</form>
					</div>
					
					<div class="infos">
						<div class="infos-content">
							<p><b><?php echo $LANG['337']; ?></b></p>
							<p><?php echo $LANG['338']; ?></p>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="finish" onclick="return sendVCard();"><?php echo $LANG['339']; ?></div>
					<div class="finish" onclick="return cancelVCard();"><?php echo $LANG['340']; ?></div>
					<div class="wait wait-small"></div>
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
					<p><?php echo $LANG['341']; ?></p>
				</div>
				
				<div class="content">
					<div class="forms">
						<fieldset>
							<legend align="top"><?php echo $LANG['342']; ?></legend>
							<label for="sounds"><?php echo $LANG['343']; ?></label>
							<select id="sounds" name="sounds" class="sounds resetable">
								<option value="sounds-on"><?php echo $LANG['344']; ?></option>
								<option value="sounds-off"><?php echo $LANG['345']; ?></option>
							</select>
						</fieldset>
						
						<fieldset>
							<legend align="top"><?php echo $LANG['584']; ?></legend>
							<label for="geolocalisation"><?php echo $LANG['585']; ?></label>
							<select id="geolocalisation" name="geolocalisation" class="geolocalisation resetable">
								<option value="geolocalisation-on"><?php echo $LANG['586']; ?></option>
								<option value="geolocalisation-off"><?php echo $LANG['587']; ?></option>
							</select>
						</fieldset>
						
						<fieldset>
							<legend align="top"><?php echo $LANG['346']; ?></legend>
							<label for="change-password"><?php echo $LANG['347']; ?></label>
							<div class="account-button change-password" id="change-password"><?php echo $LANG['348']; ?></div>
							<label for="delete-account"><?php echo $LANG['349']; ?></label>
							<div class="account-button delete-account" id="delete-account"><?php echo $LANG['350']; ?></div>
						</fieldset>
						
						<div class="sub-ask hidable">
							<div class="sub-ask-pass sub-ask-element hidable">
								<div class="sub-ask-top">
									<div class="sub-ask-title"><?php echo $LANG['352']; ?></div>
									<a class="sub-ask-close" title="Fermer cette bulle">X</a>
								</div>
							
								<div class="sub-ask-content">
									<p><?php echo $LANG['353']; ?> <input type="password" title="<?php echo $LANG['354']; ?>" class="old resetable" />
									<?php echo $LANG['355']; ?> <input type="password" title="<?php echo $LANG['356']; ?>" class="new1 resetable" />
									<input type="password" title="<?php echo $LANG['357']; ?>" class="new2 resetable" /></p>
								</div>
							
								<a class="sub-ask-bottom" onclick="sendNewPassword();"><?php echo $LANG['358']; ?> &raquo;</a>
							</div>
							
							<div class="sub-ask-delete sub-ask-element hidable">
								<div class="sub-ask-top">
									<div class="sub-ask-title"><?php echo $LANG['361']; ?></div>
									<a class="sub-ask-close" title="Fermer cette bulle">X</a>
								</div>
							
								<div class="sub-ask-content">
									<?php echo $LANG['362']; ?> <input type="password" class="check-password" title="<?php echo $LANG['363']; ?>" />
								</div>
							
								<a class="sub-ask-bottom" onclick="deleteMyAccount();"><?php echo $LANG['364']; ?> &raquo;</a>
							</div>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="finish" onclick="return saveOptions();"><?php echo $LANG['367']; ?></div>
					<div class="finish" onclick="return cancelOptions();"><?php echo $LANG['368']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END OPTIONS POPUP -->
	
	<!-- BEGIN REGISTERED POPUP -->
	<div id="registered" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="content"></div>
				<div class="bottom">
					<div class="jabber-id"></div>
					<div class="finish" onclick="registerClose();"><?php echo $LANG['369']; ?> &raquo;</div>
				</div>
			</div>
		</div>
	</div>
	<!-- END REGISTERED POPUP -->
	
	<!-- BEGIN GENERAL-WAIT POPUP -->
	<div id="general-wait" class="hidable">
		<div class="general-wait-content">
			<div class="general-wait-icon wait-small"></div>
			<div class="general-wait-text"><?php echo $LANG['370']; ?></div>
		</div>
	</div>
	<!-- END GENERAL-WAIT POPUP -->
	
	<!-- BEGIN INVITE POPUP -->
	<div id="invite" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['371']; ?></p>
				</div>
				
				<div class="content">
					<p class="first"><?php echo $LANG['372']; ?></p>
					<p class="second"><?php echo $LANG['373']; ?></p>
					<div class="forms">
						<form id="invite-email" action="./php/invite-email-send.php" method="post" enctype="multipart/form-data">
							<fieldset style="height: 126px;">
								<legend align="top"><?php echo $LANG['374']; ?></legend>
								<div class="invite-icon mail-invite-icon"></div>
								<label for="email-to"><?php echo $LANG['375']; ?></label>
								<input type="text" name="email-to" id="email-to" />
								<div class="invite-help"><?php echo $LANG['376']; ?></div>
								
								<label style="margin-left: 52px" for="email-to"><?php echo $LANG['378']; ?></label>
								<input type="text" name="email-from" id="email-from" />
								<div class="invite-help"><?php echo $LANG['379']; ?></div>
								
								<input type="hidden" name="email-jid" class="resetable" id="email-jid" />
								
								<input type="hidden" name="email-lang" id="email-lang" value="<?php echo $language; ?>" />
								
								<input type="submit" name="email-submit" id="email-submit" class="go" value="<?php echo $LANG['380']; ?>" />
							</fieldset>
						</form>
						
						<fieldset>
							<legend align="top"><?php echo $LANG['381']; ?></legend>
							<div class="invite-icon fb-invite-icon"></div>
							<a href="http://www.facebook.com/sharer.php?u=http://www.jappix.com/" style="margin-left: 30px;" title="<?php echo $LANG['382']; ?>" class="facebook-share" target="_blank"><?php echo $LANG['383']; ?></a>
							<div class="invite-help"><?php echo $LANG['384']; ?></div>
						</fieldset>
						
						<fieldset>
							<legend align="top"><?php echo $LANG['385']; ?></legend>
							<div class="invite-icon tw-invite-icon"></div>
							<a href="http://twitter.com/home?status=<?php echo $LANG['386']; ?>" style="margin-left: 30px;" title="<?php echo $LANG['387']; ?>" class="twitter-share" target="_blank"><?php echo $LANG['388']; ?></a>
							<div class="invite-help"><?php echo $LANG['389']; ?></div>
						</fieldset>
					</div>
				</div>
				
				<div class="bottom">
					<div class="mail-info mail-wait"><?php echo $LANG['390']; ?></div>
					<div class="mail-info mail-ok"><?php echo $LANG['391']; ?></div>
					<div class="mail-info mail-error"><?php echo $LANG['392']; ?></div>
					<div class="finish" onclick="return inviteFriendClose();"><?php echo $LANG['393']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END INVITE POPUP -->
	
	<!-- BEGIN DATA-STORE -->
	<div id="data-store">
		<div class="current">
			<input class="username resetable" type="hidden" />
			<input class="domain resetable" type="hidden" />
			<input class="resource resetable" type="hidden" />
			<input class="password resetable" type="hidden" />
		</div>
		
		<div class="roster">
		</div>
		
		<div class="vcard">
		</div>
		
		<div class="presence">
		</div>
		
		<div class="chatstates">
		</div>
		
		<div class="messages">
		</div>
		
		<div class="favorites">
		</div>
		
		<div class="groupchats">
		</div>
		
		<div class="options">
			<input class="sounds resetable" type="hidden" value="on" />
			<input class="geolocalisation" type="hidden" value="off" />
		</div>
		
		<div class="hosts">
			<input class="host-main" type="hidden" value="<?php echo HOST_MAIN; ?>" />
			<input class="host-muc" type="hidden" value="<?php echo HOST_MUC; ?>" />
			<input class="host-vjud" type="hidden" value="<?php echo HOST_VJUD; ?>" />
			<input class="host-pubsub" type="hidden" value="<?php echo HOST_PUBSUB; ?>" />
		</div>
		
		<div class="translate">
			<input class="translation-0" type="hidden" value="<?php echo $LANG['551']; ?>" />
			<input class="translation-1" type="hidden" value="<?php echo $LANG['552']; ?>" />
			<input class="translation-2" type="hidden" value="<?php echo $LANG['553']; ?>" />
			<input class="translation-3" type="hidden" value="<?php echo $LANG['554']; ?>" />
			<input class="translation-4" type="hidden" value="<?php echo $LANG['555']; ?>" />
			<input class="translation-5" type="hidden" value="<?php echo $LANG['556']; ?>" />
			<input class="translation-6" type="hidden" value="<?php echo $LANG['557']; ?>" />
			<input class="translation-7" type="hidden" value="<?php echo $LANG['558']; ?>" />
			<input class="translation-8" type="hidden" value="<?php echo $LANG['559']; ?>" />
			<input class="translation-9" type="hidden" value="<?php echo $LANG['560']; ?>" />
			<input class="translation-10" type="hidden" value="<?php echo $LANG['561']; ?>" />
			<input class="translation-11" type="hidden" value="<?php echo $LANG['562']; ?>" />
			<input class="translation-12" type="hidden" value="<?php echo $LANG['563']; ?>" />
			<input class="translation-13" type="hidden" value="<?php echo $LANG['564']; ?>" />
			<input class="translation-14" type="hidden" value="<?php echo $LANG['565']; ?>" />
			<input class="translation-15" type="hidden" value="<?php echo $LANG['566']; ?>" />
			<input class="translation-16" type="hidden" value="<?php echo $LANG['567']; ?>" />
			<input class="translation-17" type="hidden" value="<?php echo $LANG['568']; ?>" />
			<input class="translation-18" type="hidden" value="<?php echo $LANG['569']; ?>" />
			<input class="translation-19" type="hidden" value="<?php echo $LANG['570']; ?>" />
			<input class="translation-20" type="hidden" value="<?php echo $LANG['571']; ?>" />
			<input class="translation-21" type="hidden" value="<?php echo $LANG['572']; ?>" />
			<input class="translation-22" type="hidden" value="<?php echo $LANG['573']; ?>" />
			<input class="translation-23" type="hidden" value="<?php echo $LANG['574']; ?>" />
			<input class="translation-24" type="hidden" value="<?php echo $LANG['575']; ?>" />
			<input class="translation-25" type="hidden" value="<?php echo $LANG['576']; ?>" />
			<input class="translation-26" type="hidden" value="<?php echo $LANG['577']; ?>" />
			<input class="translation-27" type="hidden" value="<?php echo $LANG['578']; ?>" />
			<input class="translation-28" type="hidden" value="<?php echo $LANG['579']; ?>" />
			<input class="translation-29" type="hidden" value="<?php echo $LANG['394']; ?>" />
			<input class="translation-31" type="hidden" value="<?php echo $LANG['580']; ?>" />
			<input class="translation-32" type="hidden" value="<?php echo $LANG['581']; ?>" />
			<input class="translation-33" type="hidden" value="<?php echo $LANG['582']; ?>" />
			<input class="translation-34" type="hidden" value="<?php echo $LANG['605']; ?>" />
			<input class="translation-35" type="hidden" value="<?php echo $LANG['611']; ?>" />
			<input class="translation-36" type="hidden" value="<?php echo $LANG['657']; ?>" />
			<input class="translation-37" type="hidden" value="<?php echo $LANG['672']; ?>" />
			<input class="translation-38" type="hidden" value="<?php echo $LANG['677']; ?>" />
			<input class="translation-39" type="hidden" value="<?php echo $LANG['678']; ?>" />
			<input class="translation-40" type="hidden" value="<?php echo $LANG['679']; ?>" />
			<input class="translation-41" type="hidden" value="<?php echo $LANG['680']; ?>" />
		</div>
		
		<div class="system">
			<input class="version" type="hidden" value="<?php echo VERSION; ?>" />
			<input class="http-base" type="hidden" value="<?php echo HTTP_BASE; ?>" />
			<input class="close-prevent" type="hidden" value="<?php echo CLOSE_PREVENT; ?>" />
		</div>
		
		<div class="titles">
			<input class="home" type="hidden" value="<?php echo $LANG['1']; ?>" />
		</div>
	</div>
	<!-- END DATA-STORE -->
	
	<!-- BEGIN SAMPLE ELEMENTS -->
	<div id="sample-elements">
		<!-- BEGIN SAMPLE CHAT DIV -->
		<div class="sample-chat chat-engine-chan">
			<div class="top">
				<div class="avatar-container"></div>
						
				<div class="name">
					<p class="buddy-name buddy-name-nick"></p>
					<p class="buddy-infos"></p>
				</div>
			</div>
			
			<div class="fade"></div>
			
			<div class="content" id="chatContentFor">
				<div class="thisFalseDivIsForJQuery"></div>
			</div>
			
			<div class="chatstate">
				<div class="composing one-chatstate"><?php echo $LANG['598']; ?></div>
				<div class="paused one-chatstate"><?php echo $LANG['599']; ?></div>
				<div class="inactive one-chatstate"><?php echo $LANG['600']; ?></div>
				<div class="gone one-chatstate"><?php echo $LANG['601']; ?></div>
			</div>
			
			<div class="text">
				<div class="tools">
				<div class="left">
					<a class="tools-smileys tools-tooltip" title="<?php echo $LANG['401']; ?>"></a>
					<div class="tooltip bubble-smileys">
						<div class="tooltip-left">
							<div class="tooltip-smileys"></div>
						</div>
					
						<div class="tooltip-right">
							<p class="tooltip-right-top tooltip-insert-smiley"><?php echo $LANG['402']; ?></p>				
						</div>
					</div>
				
					<a class="tools-colors tools-tooltip" title="<?php echo $LANG['403']; ?>"></a>
					<div class="tooltip bubble-colors">
						<div class="tooltip-left">
							<div class="tooltip-colors"></div>
						</div>
					
						<div class="tooltip-right">
							<p class="tooltip-right-top"><?php echo $LANG['404']; ?></p>
							<p style="margin-bottom: 8px;"><?php echo $LANG['405']; ?></p>
							<p><b><?php echo $LANG['406']; ?></b></p>
						</div>
					</div>
				
					<a class="tools-save tools-tooltip" title="<?php echo $LANG['407']; ?>"></a>
					<div class="tooltip bubble-save">
						<div class="tooltip-left">
							<div class="tooltip-save"></div>
						</div>
						
						<div class="tooltip-right">
							<p class="tooltip-right-top"><?php echo $LANG['408']; ?></p>
							<p style="margin-bottom: 8px;"><?php echo $LANG['409']; ?></p>
							<a class="tooltip-right-dchat"><?php echo $LANG['410']; ?></a>
							<a class="tooltip-right-fchat" target="_blank"><?php echo $LANG['411']; ?></a>					</div>
					</div>
				
					<a class="tools-send tools-tooltip" title="<?php echo $LANG['412']; ?>"></a>
					<div class="tooltip bubble-send">
						<div class="tooltip-left">
							<div class="tooltip-file"></div>
						</div>
					
						<div class="tooltip-right">
							<p class="tooltip-right-top"><?php echo $LANG['413']; ?></p>
							<p style="margin-bottom: 8px;"><?php echo $LANG['414']; ?></p>
							<p><b><?php echo $LANG['415']; ?></b></p>
						</div>
					</div>
				
					<a class="tools-webcam tools-tooltip" title="<?php echo $LANG['416']; ?>"></a>
					<div class="tooltip bubble-webcam">
						<div class="tooltip-left"> 
							<div class="tooltip-webcam"></div>
						</div>
						
						<div class="tooltip-right">
							<p class="tooltip-right-top"><?php echo $LANG['417']; ?></p>
							<p style="margin-bottom: 8px;"><?php echo $LANG['418']; ?></p>
							<p><b><?php echo $LANG['419']; ?></b></p>
						</div>
					</div>
				
					<a class="tools-clear tools-tooltip" title="<?php echo $LANG['420']; ?>"></a>
									
					<a class="tools-infos tools-tooltip" title="<?php echo $LANG['421']; ?>"></a>
					<div class="tooltip bubble-infos">
						<div class="tooltip-left">
							<div class="tooltip-vcard"></div>
						</div>
					
						<div class="tooltip-right">
							<p class="tooltip-right-top"><?php echo $LANG['422']; ?></p>
							<div class="thisFalseVCardDivIsForJQuery"></div>
						</div>
					</div>
				</div>
				
				<div class="right">
					<a class="tools-close tools-tooltip" title="<?php echo $LANG['423']; ?>"></a>
				</div>
			</div>
			
			<form name="sendForm" onsubmit="return sendMessage(this, 'chat');" action="#">
				<input type="hidden" name="sendTo" class="send-to" />
				<input type="text" name="msg" class="message-area" />
			</form>
		</div>
		</div>
		<!-- END SAMPLE CHAT DIV -->
					
		<!-- BEGIN SAMPLE GROUPCHAT DIV -->
		<div class="sample-groupchat chat-engine-chan">
			<div class="top">
				<div class="thisFalseChanAvatarIsForJQuery"></div>
				
				<div class="name">
					<p class="buddy-name buddy-name-nick"></p>
					<p class="buddy-infos"><?php echo $LANG['424']; ?></p>
				</div>
			</div>
			
			<div class="fade fade-groupchat"></div>
			
			<div class="content groupchat-content">
				<div class="thisFalseDivIsForJQuery"></div>
			</div>
			
			<div class="list">
				<div class="moderator">
					<p class="title"><?php echo $LANG['607']; ?></p>
				</div>
				
				<div class="participant">
					<p class="title"><?php echo $LANG['608']; ?></p>
				</div>
				
				<div class="visitor">
					<p class="title"><?php echo $LANG['609']; ?></p>
				</div>
				
				<div class="none">
					<p class="title"><?php echo $LANG['610']; ?></p>
				</div>
			</div>
			
			<div class="text text-groupchat">
				<div class="tools">
					<div class="left">
						<a class="tools-smileys tools-tooltip" title="<?php echo $LANG['425']; ?>"></a>
						<div class="tooltip bubble-smileys">
							<div class="tooltip-left">
								<div class="tooltip-smileys"></div>
							</div>
							
							<div class="tooltip-right">
								<p class="tooltip-right-top tooltip-insert-smiley"><?php echo $LANG['426']; ?></p>
							</div>
						</div>
						
						<a class="tools-colors tools-tooltip" title="<?php echo $LANG['427']; ?>"></a>
						<div class="tooltip bubble-colors">
							<div class="tooltip-left">
								<div class="tooltip-colors"></div>
							</div>
						
							<div class="tooltip-right">
								<p class="tooltip-right-top"><?php echo $LANG['428']; ?></p>
								<p style="margin-bottom: 8px;"><?php echo $LANG['429']; ?></p>
								<p><b><?php echo $LANG['430']; ?></b></p>
							</div>
						</div>
					
						<a class="tools-save tools-tooltip" title="<?php echo $LANG['488']; ?>"></a>
						<div class="tooltip bubble-save">
							<div class="tooltip-left">
								<div class="tooltip-save"></div>
							</div>
							
							<div class="tooltip-right">
								<p class="tooltip-right-top"><?php echo $LANG['431']; ?></p>
								<p style="margin-bottom: 8px;"><?php echo $LANG['432']; ?></p>
								<a class="tooltip-right-dchat"><?php echo $LANG['433']; ?></a>
								<a class="tooltip-right-fchat" target="_blank"><?php echo $LANG['434']; ?></a>
							</div>
						</div>
						
						<a class="tools-clear tools-tooltip" title="<?php echo $LANG['435']; ?>"></a>
						
						<a class="tools-mucadmin tools-tooltip" title="<?php echo $LANG['654']; ?>"></a>
					</div>
					
					<div class="right">
						<a class="tools-close tools-muc-close tools-tooltip" title="<?php echo $LANG['436']; ?>"></a>
					</div>
				</div>
				
				<form name="sendForm" onsubmit="return sendMessage(this, 'groupchat');" action="#">
					<input type="hidden" name="sendTo" class="send-to" />
					<input type="text" name="msg" class="message-area" />
				</form>
			</div>
		</div>
		<!-- END SAMPLE GROUPCHAT DIV -->
		
		<!-- BEGIN SAMPLE CHAN DIV -->
		<div class="sample-chan switcher chan">
			<div class="icon"></div>
			
			<div class="name">
				<a></a>
			</div>
			
			<div class="exit">x</div>
		</div>
		<!-- END SAMPLE CHAN DIV -->
	</div>
	<!-- END SAMPLE ELEMENTS -->
	
	<!-- BEGIN ABOUT JAPPIX -->
	<div id="about" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['666']; ?></p>
				</div>
				
				<div class="content">
					<p class="title"><?php echo $LANG['437']; ?></p>
					<p><?php echo $LANG['438']; ?></p>
					<p><?php echo $LANG['439']; ?></p>
					<p><?php echo $LANG['440']; ?></p>
					<div class="logo"></div>
				</div>
				
				<div class="bottom">
					<div class="finish" onclick="return quitAbout();"><?php echo $LANG['441']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END ABOUT JAPPIX -->
	
	<!-- BEGIN HELP CENTER -->
	<div id="help" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['442']; ?></p>
				</div>
				
				<div class="content">
					<p><?php echo $LANG['443']; ?></p>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['444']; ?></b></p>
						<p><em><?php echo $LANG['445']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['446']; ?></b></p>
						<p><em><?php echo $LANG['447']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['448']; ?></b></p>
						<p><em><?php echo $LANG['449']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['450']; ?></b></p>
						<p><em><?php echo $LANG['451']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['452']; ?></b></p>
						<p><em><?php echo $LANG['453']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['454']; ?></b></p>
						<p><em><?php echo $LANG['455']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['456']; ?></b></p>
						<p><em><?php echo $LANG['457']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['458']; ?></b></p>
						<p><em><?php echo $LANG['459']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['460']; ?></b></p>
						<p><em><?php echo $LANG['461']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['462']; ?></b></p>
						<p><em><?php echo $LANG['463']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['464']; ?></b></p>
						<p><em><?php echo $LANG['465']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['466']; ?></b></p>
						<p><em><?php echo $LANG['467']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['468']; ?></b></p>
						<p><em><?php echo $LANG['469']; ?></em></p>
					</div>
					
					<div class="question">
						<p><b>&raquo; <?php echo $LANG['470']; ?></b></p>
						<p><em><?php echo $LANG['471']; ?></em></p>
					</div>
				</div>
				
				<div class="bottom">
					<div class="finish" onclick="return quitHelp();"><?php echo $LANG['472']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END HELP CENTER -->
	
	<!-- BEGIN FAVORITES -->
	<div id="favorites" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['473']; ?></p>
				</div>
				
				<div class="content">
					<div class="switch-fav">
						<div class="room-switcher room-list">
							<div class="icon list-icon"></div>
							<?php echo $LANG['474']; ?>
						</div>
						
						<div class="room-switcher room-search">
							<div class="icon search-icon"></div>
							<?php echo $LANG['475']; ?>
						</div>
					</div>
					
					<div class="static-fav">
						<div class="favorites-edit favorites-content">
							<div class="fedit-head static-fav-head">
								<div class="fedit-head-text"><?php echo $LANG['476']; ?></div>
								<select name="fedit-head-select" class="fedit-head-select resetable">
									<option value="none" class="fedit-head-select-first-option">Sélectionnez un salon</option>
								</select>
							</div>
							
							<div class="fedit-results static-fav-results">
								<div class="fedit-line">
									<div class="fedit-text"><?php echo $LANG['477']; ?></div>
									<input class="fedit-input fedit-title" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php echo $LANG['478']; ?></div>
									<input class="fedit-input fedit-nick" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php echo $LANG['479']; ?></div>
									<input class="fedit-input fedit-chan" type="text" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php echo $LANG['480']; ?></div>
									<input class="fedit-input fedit-server" type="text" value="<?php echo HOST_MUC; ?>" />
								</div>
								
								<div class="fedit-line">
									<div class="fedit-text"><?php echo $LANG['481']; ?></div>
									<input class="fedit-input fedit-password" type="password" />
								</div>
								
								<div class="fedit-actions">
									<a class="fedit-terminate fedit-add" onclick="terminateThisFavorite('add');"><?php echo $LANG['482']; ?></a>
									<a class="fedit-terminate fedit-edit" onclick="terminateThisFavorite('edit');"><?php echo $LANG['489']; ?></a>
									<a class="fedit-terminate fedit-remove" onclick="terminateThisFavorite('remove');"><?php echo $LANG['483']; ?></a>
								</div>
							</div>
						</div>
						
						<div class="favorites-search favorites-content">
							<div class="fsearch-head static-fav-head">
								<div class="fsearch-head-text"><?php echo $LANG['484']; ?></div>
								<input type="text" class="fsearch-head-server" value="<?php echo HOST_MUC; ?>" />
							</div>
							
							<div class="fsearch-results static-fav-results">
								<p class="fsearch-noresults"><?php echo $LANG['588']; ?></p>
							</div>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return quitFavorites();"><?php echo $LANG['485']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END FAVORITES -->
	
	<!-- BEGIN DIRECTORY -->
	<div id="directory" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['506']; ?></p>
				</div>
				
				<div class="content">
					<div class="directory-edit directory-content">
						<div class="dsearch-head static-fav-head">
							<div class="dsearch-head-first">
								<div class="dsearch-head-text"><?php echo $LANG['492']; ?></div>
								<input name="dsearch-head-input" class="dsearch-head-input dsearch-input resetable" value="<?php echo HOST_VJUD; ?>" />
							</div>
							
							<div class="dsearch-head-second">
								<div class="dsearch-head-text"><?php echo $LANG['508']; ?></div>
							</div>
						</div>
						
						<div class="dsearch-firstgroup">
							<div class="dsearch-form">
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['493']; ?></div>
									<input class="dsearch-input dsearch-user" type="text" />
								</div>
							
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['495']; ?></div>
									<input class="dsearch-input dsearch-name" type="text" />
								</div>
							
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['496']; ?></div>
									<input class="dsearch-input dsearch-family" type="text" />
								</div>
							
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['497']; ?></div>
									<input class="dsearch-input dsearch-country" type="text" />
								</div>
							
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['498']; ?></div>
									<input class="dsearch-input dsearch-city" type="text" />
								</div>
							
								<div class="dsearch-line">
									<div class="dsearch-text"><?php echo $LANG['499']; ?></div>
									<input class="dsearch-input dsearch-mail" type="text" />
								</div>
							
								<div class="dsearch-actions">
									<a class="dsearch-launch" onclick="searchDirectory();"><?php echo $LANG['500']; ?></a>
								</div>
							</div>
						
							<div class="infos">
								<div class="infos-content">
									<p><b><?php echo $LANG['502']; ?></b></p>
									<p><?php echo $LANG['503']; ?></p>
									<p><?php echo $LANG['504']; ?></p>
									<p><?php echo $LANG['505']; ?></p>
								</div>
							</div>
						</div>
						
						<div class="dsearch-results">
							<div class="dsearch-results-list">
								<p class="dsearch-noresults"><?php echo $LANG['509']; ?></p>
							</div>
							
							<a class="dsearch-results-again" onclick="onceAgainDirectory();"><?php echo $LANG['507']; ?></a>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return quitDirectory();"><?php echo $LANG['501']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END DIRECTORY -->
	
	<!-- BEGIN DISCOVERY -->
	<div id="discovery" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['516']; ?></p>
				</div>
				
				<div class="content">
					<div class="discovery-head">
						<div class="disco-server-text"><?php echo $LANG['521']; ?></div>
						<input name="disco-server-input" class="disco-server-input resetable" value="<?php echo HOST_MAIN; ?>" />
					</div>
					
					<div class="discovery-results">
						<p class="discovery-noresults"><?php echo $LANG['522']; ?></p>
						
						<div class="disco-category disco-account">
							<p class="disco-category-title"><?php echo $LANG['523']; ?></p>
						</div>
						
						<div class="disco-category disco-auth">
							<p class="disco-category-title"><?php echo $LANG['524']; ?></p>
						</div>
						
						<div class="disco-category disco-automation">
							<p class="disco-category-title"><?php echo $LANG['525']; ?></p>
						</div>
						
						<div class="disco-category disco-client">
							<p class="disco-category-title"><?php echo $LANG['526']; ?></p>
						</div>
						
						<div class="disco-category disco-collaboration">
							<p class="disco-category-title"><?php echo $LANG['527']; ?></p>
						</div>
						
						<div class="disco-category disco-component">
							<p class="disco-category-title"><?php echo $LANG['528']; ?></p>
						</div>
						
						<div class="disco-category disco-conference">
							<p class="disco-category-title"><?php echo $LANG['529']; ?></p>
						</div>
						
						<div class="disco-category disco-directory">
							<p class="disco-category-title"><?php echo $LANG['530']; ?></p>
						</div>
						
						<div class="disco-category disco-gateway">
							<p class="disco-category-title"><?php echo $LANG['531']; ?></p>
						</div>
						
						<div class="disco-category disco-headline">
							<p class="disco-category-title"><?php echo $LANG['532']; ?></p>
						</div>
						
						<div class="disco-category disco-hierarchy">
							<p class="disco-category-title"><?php echo $LANG['533']; ?></p>
						</div>
						
						<div class="disco-category disco-proxy">
							<p class="disco-category-title"><?php echo $LANG['534']; ?></p>
						</div>
						
						<div class="disco-category disco-pubsub">
							<p class="disco-category-title"><?php echo $LANG['535']; ?></p>
						</div>
						
						<div class="disco-category disco-server">
							<p class="disco-category-title"><?php echo $LANG['536']; ?></p>
						</div>
						
						<div class="disco-category disco-store">
							<p class="disco-category-title"><?php echo $LANG['537']; ?></p>
						</div>
						
						<div class="disco-category disco-others">
							<p class="disco-category-title"><?php echo $LANG['538']; ?></p>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return quitDiscovery();"><?php echo $LANG['517']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END DISCOVERY -->
	
	<!-- BEGIN MESSAGES -->
	<div id="messages" class="lock hidable">
		<div class="popup">
			<div class="popup-content">
				<div class="top">
					<p><?php echo $LANG['514']; ?></p>
				</div>
				
				<div class="content">
					<div class="messages-head">
						<div class="messages-head-text"><?php echo $LANG['539']; ?></div>
						<div class="messages-head-actions">
							<a onclick="deleteAllMessages();" class="a-delete-messages"><?php echo $LANG['540']; ?></a>
							<a onclick="newMessage();" class="a-new-message"><?php echo $LANG['541']; ?></a>
							<a onclick="showMessages();" class="a-show-messages"><?php echo $LANG['544']; ?></a>
						</div>
					</div>
					
					<div class="messages-results">
						<p class="messages-noresults showable"><?php echo $LANG['542']; ?></p>
						<div class="inbox"></div>
					</div>
					
					<div class="messages-new">
						<div class="messages-new-to messages-new-block">
							<p class="messages-new-text"><?php echo $LANG['545']; ?></p>
							<input name="messages-new-user-input" class="messages-new-input messages-new-user-input resetable" /><span style="float: left; margin: 0 5px 0 5px;">@</span><input name="messages-new-server-input" class="messages-new-input messages-new-server-input resetable" value="<?php echo HOST_MAIN; ?>" />
						</div>
						
						<div class="messages-new-topic messages-new-block">
							<p class="messages-new-text"><?php echo $LANG['546']; ?></p>
							<input name="messages-new-subject-input" class="messages-new-input messages-new-subject-input resetable" />
						</div>
						
						<div class="messages-new-body messages-new-block">
							<p class="messages-new-text"><?php echo $LANG['548']; ?></p>
							<textarea class="messages-new-textarea resetable" rows="8" cols="60"></textarea>
						</div>
						
						<div class="messages-new-send messages-new-block">
							<a onclick="sendThisMessage();"><?php echo $LANG['547']; ?></a>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return messagesClose();"><?php echo $LANG['515']; ?></div>
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
					<p><?php echo $LANG['518']; ?></p>
				</div>
				
				<div class="content">
					<div class="muc-admin-head">
						<div class="muc-admin-head-text"><?php echo $LANG['617']; ?></div>
						<div class="muc-admin-head-jid"></div>
					</div>
					
					<div class="muc-admin-results">
						<div class="muc-admin-topic">
							<fieldset>
								<legend align="top"><?php echo $LANG['660']; ?></legend>
								<label for="topic-text"><?php echo $LANG['661']; ?></label>
								<textarea id="topic-text" name="room-topic" class="resetable" rows="8" cols="60" ></textarea>
							</fieldset>
						</div>
						
						<div class="muc-admin-conf">
							<fieldset>
								<legend align="top"><?php echo $LANG['618']; ?></legend>
								<div class="last-element"></div>
							</fieldset>
						</div>
						
						<div class="muc-admin-aut">
							<fieldset>
								<legend align="top"><?php echo $LANG['653']; ?></legend>
								<label><?php echo $LANG['641']; ?></label>
								<div class="aut-member aut-group">
									<a class="aut-add" onclick="addInputMucAdmin('', 'member');"><?php echo $LANG['659']; ?></a>
								</div>
								<label><?php echo $LANG['642']; ?></label>
								<div class="aut-owner aut-group">
									<a class="aut-add" onclick="addInputMucAdmin('', 'owner');"><?php echo $LANG['659']; ?></a>
								</div>
								<label><?php echo $LANG['644']; ?></label>
								<div class="aut-admin aut-group">
									<a class="aut-add" onclick="addInputMucAdmin('', 'admin');"><?php echo $LANG['659']; ?></a>
								</div>
								<label><?php echo $LANG['645']; ?></label>
								<div class="aut-outcast aut-group">
									<a class="aut-add" onclick="addInputMucAdmin('', 'outcast');"><?php echo $LANG['659']; ?></a>
								</div>
							</fieldset>
						</div>
						
						<div class="muc-admin-others">
							<fieldset>
								<legend align="top"><?php echo $LANG['662']; ?></legend>
								<label for="others-destroy"><?php echo $LANG['663']; ?></label>
								<a id="others-destroy" onclick="destroyMucAdmin();"><?php echo $LANG['664']; ?></a>
							</fieldset>
						</div>
					</div>
				</div>
				
				<div class="bottom">
					<div class="wait wait-small"></div>
					<div class="finish" onclick="return saveMucAdmin();"><?php echo $LANG['520']; ?></div>
					<div class="finish" onclick="return cancelMucAdmin();"><?php echo $LANG['519']; ?></div>
				</div>
			</div>
		</div>
	</div>
	<!-- END MUC-ADMIN -->
</body>

</html>
