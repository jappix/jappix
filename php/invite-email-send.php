<?php

/*

Jappix - The instant messaging. Reinvented.
This is the PHP script used to send invite emails

-------------------------------------------------

Licence : GNU/GPL
Author : Vanaryon
Contact : mailing-list[at]jappix[dot]com
Last revision : 27/03/10

*/

// WE SEND THE EMAIL
	// WE DEFINE THE VARIABLES FOR THE MAIL-SEND
		$to = $_POST['email-to'];
		$from = "From: ".$_POST['email-from']." <noreply@jappix.com>\n";
		$from .= "MIME-version: 1.0\n";
		$from .= "Content-type: text/html; charset= iso-8859-1\n";
		$jid = $_POST['email-jid'];
		$lang = $_POST['email-lang'];
		
		// THE TRANSLATION
		include('../lang/'.$lang.'.php');
		
		// THE FRENCH MAIL
		$body = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 TRANSITIONAL//EN">
			<HTML>
			<HEAD>
			  <META HTTP-EQUIV="Content-Type" CONTENT="text/html; CHARSET=UTF-8">
			</HEAD>
			<BODY>
			'.$LANG['589'].'<BR>
			<BR>
			'.$LANG['590'].'
			<BR>
			'.$LANG['591'].'<BR>
			<BR>
			'.$LANG['592'].'<BR>
			<BR>
			'.$LANG['593'].'<BR>
			<BR>
			'.$LANG['594'].' <B>'.$jid.'</B> !<BR>
			<BR>
			-----------------------------------------------------------------------------------------------------<BR>
			<FONT SIZE="1">'.$LANG['595'].'</FONT><BR>
			<FONT SIZE="1">'.$LANG['596'].'</FONT><BR>
			<B><I><FONT SIZE="2">Jappix</FONT></I></B><I><FONT SIZE="2">. In free software we trust.</FONT></I><BR>
			<BR>
			</BODY>
			</HTML>';
			
		$topic = $LANG['597'];
	
	// WE SEND THE MAIL
		if(isset($to) && isset($from) && isset($topic) && isset($body)) {
			if(mail($to, $topic, $body, $from)) {
				echo('0'); // The mail has been correctly send
			}
			
			else {
				echo('1'); // Something didn't work
			}
		}
		
		else {
			echo('1'); // A value is missing
		}
?>
