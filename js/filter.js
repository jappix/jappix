/*

Jappix - An open social platform
These are the filtering JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda
Contact: http://project.jappix.com/contact
Last revision: 01/11/10

*/

// Generates a given emoticon HTML code
function emoteImage(image, text, after) {
	return ' <span class="emoticon emoticon-' + image + ' smileys-images" data-text="' + text + '"></span> ' + after;
}

// Filters a given message
function filterThisMessage(neutralMessage, nick, html_encode) {
	var filteredMessage = neutralMessage;
	
	// We encode the HTML special chars
	if(html_encode)
		filteredMessage = filteredMessage.htmlEnc();
	
	// /me command
	filteredMessage = filteredMessage.replace(/((^)|((.+)(>)))(\/me )([^<]+)/, nick + ' $7')
	
	// We replace the smilies text into images
	.replace(/(:-@)($|\s|<)/gi, emoteImage('angry', '$1', '$2'))
	.replace(/(:-\[)($|\s|<)/gi, emoteImage('bat', '$1', '$2'))
	.replace(/(\(B\))($|\s|<)/g, emoteImage('beer', '$1', '$2'))
	.replace(/((:-?D)|(XD))($|\s|<)/gi, emoteImage('biggrin', '$1', '$4'))
	.replace(/(:-\$)($|\s|<)/gi, emoteImage('blush', '$1', '$2'))
	.replace(/(\(Z\))($|\s|<)/g, emoteImage('boy', '$1', '$2'))
	.replace(/(\(W\))($|\s|<)/g, emoteImage('brflower', '$1', '$2'))			
	.replace(/((&lt;\/3)|(\(U\)))($|\s|<)/g, emoteImage('brheart', '$1', '$4'))			
	.replace(/(\(C\))($|\s|<)/g, emoteImage('coffee', '$1', '$2'))			
	.replace(/((8-\))|(\(H\)))($|\s|<)/g, emoteImage('coolglasses', '$1', '$4'))
	.replace(/(:'-\()($|\s|<)/gi, emoteImage('cry', '$1', '$2'))
	.replace(/(\(%\))($|\s|<)/g, emoteImage('cuffs', '$1', '$2'))
	.replace(/(\]:-&gt;)($|\s|<)/gi, emoteImage('devil', '$1', '$2'))			
	.replace(/(\(D\))($|\s|<)/g, emoteImage('drink', '$1', '$2'))
	.replace(/(@}-&gt;--)($|\s|<)/gi, emoteImage('flower', '$1', '$2'))
	.replace(/((:-\/)|(:S))($|\s|<)/gi, emoteImage('frowning', '$1', '$4'))
	.replace(/(\(X\))($|\s|<)/g, emoteImage('girl', '$1', '$2'))
	.replace(/((&lt;3)|(\(L\)))($|\s|<)/g, emoteImage('heart', '$1', '$4'))
	.replace(/(\(}\))($|\s|<)/g, emoteImage('hugleft', '$1', '$2'))			
	.replace(/(\({\))($|\s|<)/g, emoteImage('hugright', '$1', '$2'))
	.replace(/(:-{})($|\s|<)/gi, emoteImage('kiss', '$1', '$2'))
	.replace(/(\(I\))($|\s|<)/g, emoteImage('lamp', '$1', '$2'))
	.replace(/(:3)($|\s|<)/gi, emoteImage('lion', '$1', '$2'))
	.replace(/(\(E\))($|\s|<)/g, emoteImage('mail', '$1', '$2'))
	.replace(/(\(S\))($|\s|<)/g, emoteImage('moon', '$1', '$2'))
	.replace(/(\(8\))($|\s|<)/g, emoteImage('music', '$1', '$2'))
	.replace(/((=-?O)|(:-?O))($|\s|<)/gi, emoteImage('oh', '$1', '$4'))
	.replace(/(\(T\))($|\s|<)/g, emoteImage('phone', '$1', '$2'))
	.replace(/(\(P\))($|\s|<)/g, emoteImage('photo', '$1', '$2'))
	.replace(/(:-!)($|\s|<)/gi, emoteImage('puke', '$1', '$2'))
	.replace(/(\(@\))($|\s|<)/g, emoteImage('pussy', '$1', '$2'))
	.replace(/(\(R\))($|\s|<)/g, emoteImage('rainbow', '$1', '$2'))
	.replace(/(:-?\))($|\s|<)/gi, emoteImage('smile', '$1', '$2'))
	.replace(/(\(\*\))($|\s|<)/g, emoteImage('star', '$1', '$2'))
	.replace(/(:-?\|)($|\s|<)/gi, emoteImage('stare', '$1', '$2'))
	.replace(/(\(N\))($|\s|<)/g, emoteImage('thumbdown', '$1', '$2'))
	.replace(/(\(Y\))($|\s|<)/g, emoteImage('thumbup', '$1', '$2'))
	.replace(/(:-?P)($|\s|<)/gi, emoteImage('tongue', '$1', '$2'))
	.replace(/(:-?\()($|\s|<)/gi, emoteImage('unhappy', '$1', '$2'))
	.replace(/(;-?\))($|\s|<)/gi, emoteImage('wink', '$1', '$2'))
	
	// Text in bold
	.replace(/(^|\s|>)((\*)([^<>'"]+)(\*))($|\s|<)/gi, '$1<b>$2</b>$6')
	
	// Italic text
	.replace(/(^|\s|>)((\/)([^<>'"]+)(\/))($|\s|<)/gi, '$1<i>$2</i>$6')
	
	// Underlined text
	.replace(/(^|\s|>)((_)([^<>'"]+)(_))($|\s|<)/gi, '$1<span style="text-decoration: underline;">$2</span>$6');
	
	// This is not yet a xHTML message (to avoid generating a link over another one)
	if(html_encode) {
		// Mail address
		filteredMessage = filteredMessage.replace(/(\s|<br \/>|^)(([a-zA-Z0-9\._-]+)@([a-zA-Z0-9\._-]+)\.([a-zA-Z0-9\._-]+))(\s|$)/gi, '$1<a href="xmpp:$2" onclick="return checkChatCreate(\'$2\', \'chat\');">$2</a> <a href="mailto:$2" target="_blank">[✉]</a>$6')
		
		// YouTube video box
		.replace(/(\w{3,5})(:)(\S+)((\.youtube\.com\/watch(\?v|\?\S+v|\#\!v|\#\!\S+v)\=)|(youtu\.be\/))(\S+)((&amp;\S)|(&\S)|\s|$)/gim, '<a onclick="return applyIntegrateBox(\'$8\', \'youtube\');" href="$&" target="_blank">$&</a> ')
		
		// Dailymotion video box
		.replace(/(\w{3,5})(:)(\S+)\.dailymotion\.com\/video\/([\w\-]+)((\#[\w\-]+)|\s|$)/gim, '<a onclick="return applyIntegrateBox(\'$4\', \'dailymotion\');" href="$&" target="_blank">$&</a> ')
		
		// Vimeo video box
		.replace(/(\w{3,5})(:)(\S+)(vimeo|www\.vimeo)\.com\/([\w\-]+)/gim, '<a onclick="return applyIntegrateBox(\'$5\', \'vimeo\');" href="$&" target="_blank">$&</a> ')
		
		// Theora video box
		.replace(/(\w{3,5})(:)(\S+)(\.)(ogv|ogg)/gim, '<a onclick="return applyIntegrateBox(\'$&\', \'theora\');" href="$&" target="_blank">$&</a>')
		
		// Vorbis audio box
		.replace(/(\w{3,5})(:)(\S+)(\.oga)/gim, '<a onclick="return applyIntegrateBox(\'$&\', \'vorbis\');">$&</a>')
		
		// Image box
		.replace(/(\w{3,5})(:)(\S+)(\.)(jpg|jpeg|png|gif|tif|bmp)/gim, '<a onclick="return applyIntegrateBox(\'$&\', \'image\');" href="$&" target="_blank">$&</a>')
		
		// Simple link
		.replace(/(\s|<br \/>|^)((\w{3,5})(:)([^<>'"\s]+))/gim, '$1<a href="$2" target="_blank">$2</a>');
	}
	
	return filteredMessage;
}

// Filters a xHTML message to be displayed in Jappix
function filterThisXHTML(code) {
	// Allowed elements array
	var elements = new Array(
				 'a',
				 'abbr',
			         'acronym',
			         'address',
			         'blockquote',
				 'body',
				 'br',
				 'cite',
			         'code',
			         'dd',
			         'dfn',
			         'div',
			         'dt',
			         'em',
			         'h1',
			         'h2',
			         'h3',
			         'h4',
			         'h5',
			         'h6',
			         'head',
			         'html',
			         'img',
			         'kbd',
			         'li',
			         'ol',
			         'p',
			         'pre',
			         'q',
			         'samp',
			         'span',
			         'strong',
			         'title',
			         'ul',
			         'var'
			        );
	
	// Allowed attributes array
	var attributes = new Array(
				   'accesskey',
				   'alt',
				   'charset',
				   'cite',
				   'class',
				   'height',
				   'href',
				   'hreflang',
				   'id',
				   'longdesc',
				   'profile',
				   'rel',
				   'rev',
				   'src',
				   'style',
				   'tabindex',
				   'title',
				   'type',
				   'uri',
				   'version',
				   'width',
				   'xml:lang',
				   'xmlns'
				  );
	
	// Remove forbidden elements
	$(code).find('*').each(function() {
		// This element is not authorized
		if(elements.indexOf((this).nodeName) == -1)
			$(this).remove();
	});
	
	// Remove forbidden attributes
	$(code).find('*').each(function() {
		// Put a pointer on this element (jQuery way & normal way)
		var cSelector = $(this);
		var cElement = (this);
		
		// Loop the attributes of the current element
		$(cElement.attributes).each(function(index) {
			// Read the current attribute
			var cAttr = cElement.attributes[index];
			var cName = cAttr.name;
			var cVal = cAttr.value;
			
			// This attribute is not authorized, or contains JS code
			if((attributes.indexOf(cName) == -1) || (cVal.match(/(^|"|')javascript:/)))
				cSelector.removeAttr(cName);
		});
	});
	
	// Filter some other elements
	$(code).find('p:first').css('display', 'inline');
	$(code).find('a').attr('target', '_blank');
	
	return $(code).find('html body').html();
}
