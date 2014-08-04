/*

Jappix - An open social platform
These are the http-reply JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var HTTPReply = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Replies to a HTTP request
     * @public
     * @param {string} value
     * @param {object} xml
     * @return {undefined}
     */
    self.go = function(value, xml) {

        try {
            // We parse the xml content
            var from = Common.fullXID(Common.getStanzaFrom(xml));
            var confirm = $(xml.getNode()).find('confirm');
            var xmlns = confirm.attr('xmlns');
            var id = confirm.attr('id');
            var method = confirm.attr('method');
            var url = confirm.attr('url');

            // We generate the reply message
            var aMsg = new JSJaCMessage();
            aMsg.setTo(from);

            // If "no"
            if(value == 'no') {
                aMsg.setType('error');
                aMsg.appendNode('error', {
                    'code': '401',
                    'type': 'auth'
                });
            }

            // We set the confirm node
            aMsg.appendNode('confirm', {
                'xmlns': xmlns,
                'url': url,
                'id': id,
                'method': method
            });

            // We send the message
            con.send(aMsg, Errors.handleReply);

            Console.info('Replying HTTP auth request: ' + from);
        } catch(e) {
            Console.error('HTTPReply.go', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();