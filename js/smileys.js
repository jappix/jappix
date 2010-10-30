/*

Jappix - An open social platform
These are the smileys JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

// Generates the correct HTML code for an emoticon insertion tool
function emoteLink(smiley, image, hash) {
	return '<div onclick="insertSmiley(\'' + smiley + '\', \'' + hash + '\');" class="emoticon emoticon-' + image + ' smileys-images"></div>';
}

// Emoticon links arrays
function smileyLinks(hash) {
	var links = '';
	
	var sArray = new Array(
		':-D',
		']:->',
		'8-)',
		':-P',
		':-)',
		';-)',
		':-$',
		':-|',
		':-/',
		'=-O',
		':-(',
		':\\\'-(',
		':-@',
		':-!',
		'({)',
		'(})',
		':3',
		'(@)',
		':-[',
		':-{}',
		'<3',
		'</3',
		'@}->--',
		'(W)',
		'(Y)',
		'(N)',
		'(I)',
		'(C)',
		'(D)',
		'(B)',
		'(Z)',
		'(X)',
		'(P)',
		'(8)',
		'(T)',
		'(%)',
		'(E)',
		'(R)',
		'(*)',
		'(S)'
	);
	
	var cArray = new Array(
		'biggrin',
		'devil',
		'coolglasses',
		'tongue',
		'smile',
		'wink',
		'blush',
		'stare',
		'frowning',
		'oh',
		'unhappy',
		'cry',
		'angry',
		'puke',
		'hugright',
		'hugleft',
		'lion',
		'pussy',
		'bat',
		'kiss',
		'heart',
		'brheart',
		'flower',
		'brflower',
		'thumbup',
		'thumbdown',
		'lamp',
		'coffee',
		'drink',
		'beer',
		'boy',
		'girl',
		'phone',
		'photo',
		'music',
		'cuffs',
		'mail',
		'rainbow',
		'star',
		'moon'
	);
	
	for(var i=0; i<sArray.length; i++)
		links += emoteLink(sArray[i], cArray[i], hash);
	
	return links;
}
