/*

Jappix - An open social platform
These are the smileys JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Smileys = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Generates the correct HTML code for an emoticon insertion tool
     * @public
     * @param {string} smiley
     * @param {string} image
     * @param {string} hash
     * @return {undefined}
     */
    self.emoteLink = function(smiley, image, hash) {

        try {
            return '<a href="#" class="emoticon emoticon-' + image + ' smileys-images" data-smiley="' + smiley + '"></a>';
        } catch(e) {
            Console.error('Smileys.emoteLink', e);
        }

    };


    /**
     * Emoticon links arrays
     * @public
     * @param {string} hash
     * @return {object}
     */
    self.links = function(hash) {

        try {
            var links = '';
            
            var sArray = [
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
                ':\'-(',
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
                '(T)',
                '(8)',
                '(%)',
                '(E)',
                '(R)',
                '(*)',
                '(S)'
            ];
            
            var cArray = [
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
                'photo',
                'phone',
                'music',
                'cuffs',
                'mail',
                'rainbow',
                'star',
                'moon'
            ];
            
            for(var i in sArray) {
                links += self.emoteLink(sArray[i], cArray[i], hash);
            }
            
            return links;
        } catch(e) {
            Console.error('Smileys.links', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();