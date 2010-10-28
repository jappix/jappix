/*

Jappix - An Open μSocial Platform
These are the filtering JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 17/07/10

*/

function emoteImage(image) {
	return ' <img class="emoticon emoticon-' + image + ' talk-images" src="" alt="" /> ';
}

function filterThisMessage(neutralMessage, nick) {
	var filteredMessage = neutralMessage
	
	// We encode the html special chars
	.htmlEnc()
	
	// We replace the shortcuts
	.replace(/^\/me /,'*' + nick + ' ')
	
	// We replace the smilies text into images
	.replace(/(\s|^):-@(\s|$)/gi, emoteImage('angry'))
	.replace(/(\s|^):-\[(\s|$)/gi, emoteImage('bat'))
	.replace(/(\s|^)\(B\)(\s|$)/gi, emoteImage('beer'))
	.replace(/(\s|^):-D(\s|$)/gi, emoteImage('biggrin'))
	.replace(/(\s|^):D(\s|$)/gi, emoteImage('biggrin'))
	.replace(/(\s|^)XD(\s|$)/gi, emoteImage('biggrin'))
	.replace(/(\s|^):-\$(\s|$)/gi, emoteImage('blush'))
	.replace(/(\s|^)\(Z\)(\s|$)/gi, emoteImage('boy'))
	.replace(/(\s|^)\(W\)(\s|$)/gi, emoteImage('brflower'))			
	.replace(/(\s|^)&lt;\/3(\s|$)/gi, emoteImage('brheart'))			
	.replace(/(\s|^)\(C\)(\s|$)/gi, emoteImage('coffee'))			
	.replace(/(\s|^)8-\)(\s|$)/gi, emoteImage('coolglasses'))
	.replace(/(\s|^):'-\((\s|$)/gi, emoteImage('cry'))
	.replace(/(\s|^)\(%\)(\s|$)/gi, emoteImage('cuffs'))
	.replace(/(\s|^)\]:-&gt;(\s|$)/gi, emoteImage('devil'))			
	.replace(/(\s|^)\(D\)(\s|$)/gi, emoteImage('drink'))
	.replace(/(\s|^)@}-&gt;--(\s|$)/gi, emoteImage('flower'))
	.replace(/(\s|^):-\/(\s|$)/gi, emoteImage('frowning'))	
	.replace(/(\s|^):S(\s|$)/gi, emoteImage('frowning'))
	.replace(/(\s|^)\(X\)(\s|$)/gi, emoteImage('girl'))
	.replace(/(\s|^)&lt;3(\s|$)/gi, emoteImage('heart'))
	.replace(/(\s|^)\(}\)(\s|$)/gi, emoteImage('hugleft'))			
	.replace(/(\s|^)\({\)(\s|$)/gi, emoteImage('hugright'))			
	.replace(/(\s|^):-{}(\s|$)/gi, emoteImage('kiss'))
	.replace(/(\s|^)\(I\)(\s|$)/gi, emoteImage('lamp'))
	.replace(/(\s|^):3(\s|$)/gi, emoteImage('lion'))
	.replace(/(\s|^)\(E\)(\s|$)/gi, emoteImage('mail'))
	.replace(/(\s|^)\(S\)(\s|$)/gi, emoteImage('moon'))
	.replace(/(\s|^)\(8\)(\s|$)/gi, emoteImage('music'))
	.replace(/(\s|^)=-O(\s|$)/gi, emoteImage('oh'))
	.replace(/(\s|^)\(T\)(\s|$)/gi, emoteImage('phone'))
	.replace(/(\s|^)\(P\)(\s|$)/gi, emoteImage('photo'))
	.replace(/(\s|^):-!(\s|$)/gi, emoteImage('puke'))
	.replace(/(\s|^)\(@\)(\s|$)/gi, emoteImage('pussy'))
	.replace(/(\s|^)\(R\)(\s|$)/gi, emoteImage('rainbow'))			
	.replace(/(\s|^):-\)(\s|$)/gi, emoteImage('smile'))
	.replace(/(\s|^):\)(\s|$)/gi, emoteImage('smile'))
	.replace(/(\s|^)\(\*\)(\s|$)/gi, emoteImage('star'))
	.replace(/(\s|^):-\|(\s|$)/gi, emoteImage('stare'))
	.replace(/(\s|^)\(N\)(\s|$)/gi, emoteImage('thumbdown'))			
	.replace(/(\s|^)\(Y\)(\s|$)/gi, emoteImage('thumbup'))			
	.replace(/(\s|^):-P(\s|$)/gi, emoteImage('tongue'))
	.replace(/(\s|^):P(\s|$)/gi, emoteImage('tongue'))
	.replace(/(\s|^):-\((\s|$)/gi, emoteImage('unhappy'))			
	.replace(/(\s|^):\((\s|$)/gi, emoteImage('unhappy'))
	.replace(/(\s|^);-\)(\s|$)/gi, emoteImage('wink'))
	.replace(/(\s|^);\)(\s|$)/gi, emoteImage('wink'))
	
	// Text in bold
	.replace(/(\s|^)\*(.+)\*(\s|$)/gi, '$1<b>*$2*</b>$3')
	
	// Mail address
	.replace(/(\s|^)(([a-zA-Z0-9\._-]+)@([a-zA-Z0-9\._-]+)\.([a-zA-Z0-9\._-]+))(\s|$)/gi, ' <a onclick="checkChatCreate(\'$2\', \'chat\');">$2</a> <a href="mailto:$2" target="_blank">[✉]</a> ')
	
	// YouTube video box
	.replace(/[\S]+(\b|$)youtube\.com\/watch(\?v|\?.+v|\#\!v|\#\!.+v)\=(\S+)((&amp;\S)|\s|$)/gim, ' <a onclick="return applyIntegrateBox(\'$3\', \'youtube\');">[⌘ YouTube]</a> ')
	
	// Dailymotion video box
	.replace(/[\S]+(\b|$)dailymotion\.com\/video\/([\w\-]+)((\#[\w\-]+)|\s|$)/gim, ' <a onclick="return applyIntegrateBox(\'$2\', \'dailymotion\');">[⌘ Dailymotion]</a> ')
	
	// Vimeo video box
	.replace(/[\S]+(\b|$)(vimeo|www\.vimeo)\.com\/([\w\-]+)/gim, ' <a onclick="return applyIntegrateBox(\'$3\', \'vimeo\');">[⌘ Vimeo]</a> ')
	
	// Theora video box
	.replace(/(http|https|ftp|file):\/\/(.+)\.(ogv|ogg)/gim, ' <a onclick="return applyIntegrateBox(\'$1://$2.$3\', \'theora\');">[⌘ Theora]</a> ')
	
	// Vorbis audio box
	.replace(/(http|https|ftp|file):\/\/(.+)\.oga/gim, ' <a onclick="return applyIntegrateBox(\'$1://$2.oga\', \'vorbis\');">[⌘ Vorbis]</a> ')
	
	// Image box
	.replace(/(http|https|ftp|file):\/\/(.+)\.(jpg|jpeg|png|gif|tiff|bmp)/gim, ' <a onclick="return applyIntegrateBox(\'$1://$2.$3\', \'image\');">[⌘ Image]</a> ')
	
	// Simple link
	.replace(/(\s|^)((ftp|http|https|file|ssh|irc|xmpp|apt):\/\/[\S]+)(\s|$)/gim, ' <a href="$2" target="_blank">$2</a> ')
	
	return filteredMessage;
}
