/*

Jappix - An Open μSocial Platform
These are the audio JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function soundPlay(num) {
	dataRead = getDB('options', 'sounds');
	
	// If the sounds are enabled
	if(dataRead == 'on') {
		// If the audio elements aren't yet in the DOM
		if(!exists('#audio audio')) {
			$('#audio').prepend(
				'<audio id="buddy-connect" src="./snd/buddy-connect.oga" type="audio/ogg" />' + 
				'<audio id="buddy-disconnect" src="./snd/buddy-disconnect.oga" type="audio/ogg" />' + 
				'<audio id="new-chat" src="./snd/new-chat.oga" type="audio/ogg" />' + 
				'<audio id="receive-message" src="./snd/receive-message.oga" type="audio/ogg" />' + 
				'<audio id="send-message" src="./snd/send-message.oga" type="audio/ogg" />' + 
				'<audio id="notification" src="./snd/notification.oga" type="audio/ogg" />'
			);
		}
		
		// We define the audio element number
		if(exists('.music-audio'))
			num = num + 1;
		
		// We play the target sound
		var playThis = document.getElementsByTagName('audio')[num];
		playThis.load();
		playThis.play();
	}
}
