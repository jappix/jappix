/*

Jappix - An open social platform
These are the smileys JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 02/10/10

*/

// Generates the correct HTML code for an emoticon insertion tool
function emoteLink(smiley, image, hash) {
	return '<div onclick="insertSmiley(\'' + smiley + '\', \'' + hash + '\');" class="emoticon emoticon-' + image + ' smileys-images"></div>';
}

// Emoticon links arrays
function smileyLinks(hash) {
	var links = '';
	
	var sArray = new Array(
		':-@',
		':-[',
		'(B)',
		':-D',
		':-$',
		'(Z)',
		'(W)',
		'</3',
		'(C)',
		'8-)',
		':\\\'-(',
		'(%)',
		']:->',
		'(D)',
		'@}->--',
		':-/',
		'(X)',
		'<3',
		'(})',
		'({)',
		':-{}',
		'(I)',
		':3',
		'(E)',
		'(S)',
		'(8)',
		'=-O',
		'(T)',
		'(P)',
		':-!',
		'(@)',
		'(R)',
		':-)',
		'(*)',
		':-|',
		'(N)',
		'(Y)',
		':-P',
		':-(',
		';-)'
	);
	
	var cArray = new Array(
		'angry',
		'bat',
		'beer',
		'biggrin',
		'blush',
		'boy',
		'brflower',
		'brheart',
		'coffee',
		'coolglasses',
		'cry',
		'cuffs',
		'devil',
		'drink',
		'flower',
		'frowning',
		'girl',
		'heart',
		'hugleft',
		'hugright',
		'kiss',
		'lamp',
		'lion',
		'mail',
		'moon',
		'music',
		'oh',
		'phone',
		'photo',
		'puke',
		'pussy',
		'rainbow',
		'smile',
		'star',
		'stare',
		'thumbdown',
		'thumbup',
		'tongue',
		'unhappy',
		'wink'
	);
	
	for(var i=0; i<sArray.length; i++)
		links += emoteLink(sArray[i], cArray[i], hash);
	
	return links;
}
