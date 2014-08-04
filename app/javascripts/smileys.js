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


    /* Constants */
    self.emote_list = {
        'biggrin':      ':-D',
        'devil':        ']:->',
        'coolglasses':  '8-)',
        'tongue':       ':-P',
        'smile':        ':-)',
        'wink':         ';-)',
        'blush':        ':-$',
        'stare':        ':-|',
        'frowning':     ':-/',
        'oh':           '=-O',
        'unhappy':      ':-(',
        'cry':          ':\'-(',
        'angry':        ':-@',
        'puke':         ':-!',
        'hugright':     '({)',
        'hugleft':      '(})',
        'lion':         ':3',
        'pussy':        '(@)',
        'bat':          ':-[',
        'kiss':         ':-{}',
        'heart':        '<3',
        'brheart':      '</3',
        'flower':       '@}->--',
        'brflower':     '(W)',
        'thumbup':      '(Y)',
        'thumbdown':    '(N)',
        'lamp':         '(I)',
        'coffee':       '(C)',
        'drink':        '(D)',
        'beer':         '(B)',
        'boy':          '(Z)',
        'girl':         '(X)',
        'photo':        '(P)',
        'phone':        '(T)',
        'music':        '(8)',
        'cuffs':        '(%)',
        'mail':         '(E)',
        'rainbow':      '(R)',
        'star':         '(*)',
        'moon':         '(S)'
    };


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
     * @return {string}
     */
    self.links = function(hash) {

        try {
            var links = '';

            for(var cur_emote in self.emote_list) {
                links += self.emoteLink(
                    self.emote_list[cur_emote],
                    cur_emote,
                    hash
                );
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