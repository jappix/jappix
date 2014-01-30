/*

Jappix - An open social platform
These are the filtering JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda

*/

// Bundle
var Filter = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Generates a given emoticon HTML code
     * @public
     * @param {string} image
     * @param {string} text
     * @param {string} after
     * @return {string}
     */
    self.emoteImage = function(image, text, after) {

        try {
            return ' <img class="emoticon emoticon-' + image + ' smileys-images" alt="' + Common.encodeQuotes(text) + '" src="' + './images/others/blank.gif' + '" /> ' + after;
        } catch(e) {
            Console.error('Filter.emoteImage', e);
        }

    };


    /**
     * Filters a given message
     * @public
     * @param {string} neutralMessage
     * @param {string} nick
     * @param {string} html_escape
     * @return {string}
     */
    self.message = function(neutralMessage, nick, html_escape) {

        try {
            var filteredMessage = neutralMessage;
            
            // We encode the HTML special chars
            if(html_escape)
                filteredMessage = filteredMessage.htmlEnc();
            
            // /me command
            filteredMessage = filteredMessage.replace(/((^)|((.+)(>)))(\/me )([^<]+)/, nick + ' $7')
            
            // We replace the smilies text into images
            .replace(/(:-?@)($|\s|<)/gi, self.emoteImage('angry', '$1', '$2'))
            .replace(/(:-?\[)($|\s|<)/gi, self.emoteImage('bat', '$1', '$2'))
            .replace(/(\(B\))($|\s|<)/g, self.emoteImage('beer', '$1', '$2'))
            .replace(/((:-?D)|(XD))($|\s|<)/gi, self.emoteImage('biggrin', '$1', '$4'))
            .replace(/(:-?\$)($|\s|<)/gi, self.emoteImage('blush', '$1', '$2'))
            .replace(/(\(Z\))($|\s|<)/g, self.emoteImage('boy', '$1', '$2'))
            .replace(/(\(W\))($|\s|<)/g, self.emoteImage('brflower', '$1', '$2'))            
            .replace(/((&lt;\/3)|(\(U\)))($|\s|<)/g, self.emoteImage('brheart', '$1', '$4'))         
            .replace(/(\(C\))($|\s|<)/g, self.emoteImage('coffee', '$1', '$2'))          
            .replace(/((8-\))|(\(H\)))($|\s|<)/g, self.emoteImage('coolglasses', '$1', '$4'))
            .replace(/(:'-?\()($|\s|<)/gi, self.emoteImage('cry', '$1', '$2'))
            .replace(/(\(%\))($|\s|<)/g, self.emoteImage('cuffs', '$1', '$2'))
            .replace(/(\]:-?&gt;)($|\s|<)/gi, self.emoteImage('devil', '$1', '$2'))          
            .replace(/(\(D\))($|\s|<)/g, self.emoteImage('drink', '$1', '$2'))
            .replace(/(@}-&gt;--)($|\s|<)/gi, self.emoteImage('flower', '$1', '$2'))
            .replace(/((:-?\/)|(:-?S))($|\s|<)/gi, self.emoteImage('frowning', '$1', '$4'))
            .replace(/(\(X\))($|\s|<)/g, self.emoteImage('girl', '$1', '$2'))
            .replace(/((&lt;3)|(\(L\)))($|\s|<)/g, self.emoteImage('heart', '$1', '$4'))
            .replace(/(\(}\))($|\s|<)/g, self.emoteImage('hugleft', '$1', '$2'))         
            .replace(/(\({\))($|\s|<)/g, self.emoteImage('hugright', '$1', '$2'))
            .replace(/(:-?{})($|\s|<)/gi, self.emoteImage('kiss', '$1', '$2'))
            .replace(/(\(I\))($|\s|<)/g, self.emoteImage('lamp', '$1', '$2'))
            .replace(/(:-?3)($|\s|<)/gi, self.emoteImage('lion', '$1', '$2'))
            .replace(/(\(E\))($|\s|<)/g, self.emoteImage('mail', '$1', '$2'))
            .replace(/(\(S\))($|\s|<)/g, self.emoteImage('moon', '$1', '$2'))
            .replace(/(\(8\))($|\s|<)/g, self.emoteImage('music', '$1', '$2'))
            .replace(/((=-?O)|(:-?O))($|\s|<)/gi, self.emoteImage('oh', '$1', '$4'))
            .replace(/(\(T\))($|\s|<)/g, self.emoteImage('phone', '$1', '$2'))
            .replace(/(\(P\))($|\s|<)/g, self.emoteImage('photo', '$1', '$2'))
            .replace(/(:-?!)($|\s|<)/gi, self.emoteImage('puke', '$1', '$2'))
            .replace(/(\(@\))($|\s|<)/g, self.emoteImage('pussy', '$1', '$2'))
            .replace(/(\(R\))($|\s|<)/g, self.emoteImage('rainbow', '$1', '$2'))
            .replace(/(:-?\))($|\s|<)/gi, self.emoteImage('smile', '$1', '$2'))
            .replace(/(\(\*\))($|\s|<)/g, self.emoteImage('star', '$1', '$2'))
            .replace(/(:-?\|)($|\s|<)/gi, self.emoteImage('stare', '$1', '$2'))
            .replace(/(\(N\))($|\s|<)/g, self.emoteImage('thumbdown', '$1', '$2'))
            .replace(/(\(Y\))($|\s|<)/g, self.emoteImage('thumbup', '$1', '$2'))
            .replace(/(:-?P)($|\s|<)/gi, self.emoteImage('tongue', '$1', '$2'))
            .replace(/(:-?\()($|\s|<)/gi, self.emoteImage('unhappy', '$1', '$2'))
            .replace(/(;-?\))($|\s|<)/gi, self.emoteImage('wink', '$1', '$2'))
            
            // Text in bold
            .replace(/(^|\s|>|\()((\*)([^<>'"\*]+)(\*))($|\s|<|\))/gi, '$1<b>$2</b>$6')
            
            // Italic text
            .replace(/(^|\s|>|\()((\/)([^<>'"\/]+)(\/))($|\s|<|\))/gi, '$1<em>$2</em>$6')
            
            // Underlined text
            .replace(/(^|\s|>|\()((_)([^<>'"_]+)(_))($|\s|<|\))/gi, '$1<span style="text-decoration: underline;">$2</span>$6');
            
            // Add the links
            if(html_escape) {
                filteredMessage = Links.apply(filteredMessage, 'desktop');
            }
            
            // Filter integratebox links
            filteredMessage = IntegrateBox.filter(filteredMessage);
            
            return filteredMessage;
        } catch(e) {
            Console.error('Filter.message', e);
        }

    };


    /**
     * Filters a xHTML message to be displayed in Jappix
     * @public
     * @param {string} code
     * @return {string}
     */
    self.xhtml = function(code) {

        try {
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
                          
            // Check if Filter for XHTML-IM images is enabled
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'no-xhtml-images') != '1') {
                elements.push("img");
            }
            
            // Remove forbidden elements
            $(code).find('html body *').each(function() {
                // This element is not authorized
                if(!Utils.existArrayValue(elements, (this).nodeName.toLowerCase()))
                    $(this).remove();
            });
            
            // Remove forbidden attributes
            $(code).find('html body *').each(function() {
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
                    if(!Utils.existArrayValue(attributes, cName.toLowerCase()) || ((cVal.toLowerCase()).match(/(^|"|')javascript:/)))
                        cSelector.removeAttr(cName);
                });
            });
            
            // Filter some other elements
            $(code).find('a').attr('target', '_blank');
            
            return $(code).find('html body').html();
        } catch(e) {
            Console.error('Filter.xhtml', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();