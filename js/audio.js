/*

Jappix - An open social platform
These are the audio JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 10/04/12

*/

// Plays the given sound ID
function soundPlay(num) {
	try {
		// Not supported!
		if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9))
			return false;
		
		// If the sounds are enabled
		if(getDB('options', 'sounds') == '1') {
			// If the audio elements aren't yet in the DOM
			if(!exists('#audio')) {
				$('body').append(
					'<div id="audio">' + 
						'<audio id="new-chat" preload="auto">' + 
							'<source src="./snd/new-chat.mp3" />' + 
							'<source src="./snd/new-chat.oga" />' + 
						'</audio>' + 
						
						'<audio id="receive-message" preload="auto">' + 
							'<source src="./snd/receive-message.mp3" />' + 
							'<source src="./snd/receive-message.oga" />' + 
						'</audio>' + 
						
						'<audio id="notification" preload="auto">' + 
							'<source src="./snd/notification.mp3" />' + 
							'<source src="./snd/notification.oga" />' + 
						'</audio>' + 
					'</div>'
				);
			}
			
			// We play the target sound
			var playThis = document.getElementById('audio').getElementsByTagName('audio')[num];
			// playThis.load();
			// load() method breaks Safari audio playing
			playThis.play();
		}
	}
	
	catch(e) {}
	
	finally {
		return false;
	}
}
