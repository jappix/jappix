/*

Jappix - An Open μSocial Platform
These are the music JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function openMusic() {
	// We hide other opened bubbles
	$(".bubble").fadeOut('fast');
	
	$('.music-content').fadeIn('fast');
	$('.music-content input').focus();
}

function closeMusic() {
	$('.music-content').fadeOut('fast');
}

function parseMusic(xml) {
	if($(xml).find('data').text()) {
		$(xml).find('track').each(function() {
			var id = $(this).find('id').text();
			var name = $(this).find('name').text();
			var name = name.replace(/'/g,"’");
			var name = name.replace(/"/g,"”");
			var duration = $(this).find('duration').text();
			var url = $(this).find('url').text();
			
			$('.music-content .list-content').append(
				'<a class="song removable" id="' + id + '" onclick="addMusic(\'' + id + '\',  \'' + name + '\', \'' + duration + '\', \'' + url + '\');">‣ ' + name + '</a>'
			);
		});
	}
	
	else
		$('.music-content .no-results').show();
}

function searchMusic() {
	// We get the input string
	var string = $('.music-content input').val();
	var input = '.music-content input';
	
	// We lock the search input
	$(input).attr('disabled', true);
	
	// We reset the results
	$('.music-content .list-content a').remove();
	$('.music-content .no-results').hide();
	
	$.get('http://api.jamendo.com/get2/name+id+duration+url/track/xml/?searchquery=' + string + '&order=searchweight_desc', function(data) {
		parseMusic(data);
		
		// We clean the search input and unlock it
		$(input).val('').attr('disabled', false);
	});
}

function actionMusic(action) {
	var playThis = document.getElementsByTagName("audio")[0];
	var pathTo = $('#top-content .music');
	
	// User play a song
	if(action == 'play') {
		playThis.load();
		playThis.play();
		playThis.addEventListener('ended', function() { actionMusic('stop'); }, true);  
	}
	
	// User stop the song or the song came to its end
	else if(action == 'stop') {
		playThis.pause();
		pathTo.removeClass('actived');
		$('.music-content .list a').removeClass('playing');
		publishMusic('', '', '');
	}
	
	// User disconnected without stopping music
	else if(action == 'abord') {
		// If a music is playing
		if(pathTo.hasClass('actived')) {
			publishMusic('', '', '');
			pathTo.removeClass('actived');
		}
	}
}

function publishMusic(title, duration, uri) {
	// We share the tune on PEP if enabled
	if(enabledPEP()) {
		/* REF: http://xmpp.org/extensions/xep-0118.html */
		
		var iq = new JSJaCIQ();
		iq.setID(genID());
		iq.setType('set');
		iq.setFrom(getJID());
		
		var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
		var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_TUNE, 'xmlns': NS_PUBSUB}));
		var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
		var tune = item.appendChild(iq.buildNode('tune', {'xmlns': NS_TUNE}));
		
		if(title || duration || uri) {
			if(title)
				tune.appendChild(iq.buildNode('title', {'xmlns': NS_TUNE}, title));
			if(duration)
				tune.appendChild(iq.buildNode('length', {'xmlns': NS_TUNE}, duration));
			if(uri)
				tune.appendChild(iq.buildNode('uri', {'xmlns': NS_TUNE}, uri));
		}
		
		con.send(iq);
	}
}

function addMusic(id, title, duration, uri) {
	// We create a new audio tag if it does not exist
	if(!exists('.music-audio'))
		$('.music-content .player').prepend('<audio class="music-audio removable" type="audio/ogg" />');
	
	// We apply the new id to the player
	$('.music-audio').attr('src','http://api.jamendo.com/get2/stream/track/redirect/?id=' + id + '&streamencoding=ogg2');
	
	// We play the target sound
	actionMusic('play');
	
	// We set the actived class
	$('#top-content .music').addClass('actived');
	
	// We set a current played track indicator
	$('.music-content .list a').removeClass('playing');
	$('.music-content a#' + id).addClass('playing');
	
	// We publish what we listen
	publishMusic(title, duration, uri)
}

$(document).ready(function() {
	$('.music-content input').keyup(function(e) {
		// Enter : send
		if(e.keyCode == 13)
			searchMusic();
		
		// Escape : quit
		if(e.keyCode == 27)
			closeMusic();
	});
});
