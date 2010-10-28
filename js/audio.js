/*

Jappix - An open social platform
These are the audio JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 20/10/10

*/

// Plays the given sound ID
function soundPlay(num) {
	// If the sounds are enabled
	if(getDB('options', 'sounds') == '1') {
		// If the audio elements aren't yet in the DOM
		if(!exists('#audio')) {
			$('body').append(
				'<div id="audio">' + 
					'<audio id="new-chat" src="./snd/new-chat.oga" type="audio/ogg" />' + 
					'<audio id="receive-message" src="./snd/receive-message.oga" type="audio/ogg" />' + 
					'<audio id="notification" src="./snd/notification.oga" type="audio/ogg" />' + 
				'</div>'
			);
		}
		
		// We play the target sound
		var playThis = document.getElementById('audio').getElementsByTagName('audio')[num];
		playThis.load();
		playThis.play();
	}
}
