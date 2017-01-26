/*

Jappix - An open social platform
These are the Message Carbons JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Carbons = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Configures Message Carbons options
     * @private
     * @param {string} type
     * @return {undefined}
     */
    self._configure = function(type) {

        try {
            if(!(type in {'enable': 1, 'disable': 1})) {
                Console.error('Carbons._configure', 'Invalid type (must be either "enable" or "disable")'); return;
            }

            var iq = new JSJaCIQ();
            iq.setType('set');

            iq.appendNode(type, {'xmlns': NS_URN_CARBONS});

            con.send(iq, function(iq) {
                self._handleConfigure(iq, type);
            });
        } catch(e) {
            Console.error('Carbons._configure', e);
        }

    };


    /**
     * Configures Message Carbons options
     * @private
     * @param {object} iq
     * @param {string} type
     * @return {undefined}
     */
    self._handleConfigure = function(iq, type) {

        try {
            if(iq.getType() === 'result') {
                Console.log('Message Carbons successfully configured (type: ' + type + ')');
            } else {
                Console.error('Message Carbons could not be configured (type: ' + type + ')');
            }
        } catch(e) {
            Console.error('Carbons._handleConfigure', e);
        }

    };


    /**
     * Enables Message Carbons for this session
     * @public
     * @return {undefined}
     */
    self.enable = function() {

        try {
            self._configure('enable');
        } catch(e) {
            Console.error('Carbons.enable', e);
        }

    };


    /**
     * Disables Message Carbons for this session
     * @public
     * @return {undefined}
     */
    self.disable = function() {

        try {
            self._configure('disable');
        } catch(e) {
            Console.error('Carbons.disable', e);
        }

    };


    /**
     * Returns whether the server has Carbons support or not
     * @public
     * @return {boolean}
     */
    self.has = function() {

        try {
            return Features.enabledCarbons();
        } catch(e) {
            Console.error('Carbons.has', e);
        }

    };


    /**
     * Returns the forwarded message stanza
     * @public
     * @param {object} message
     * @return {object}
     */
    self._getForwarded = function(message) {

        try {
            // Check message is forwarded from our local user
            if(Common.bareXID(Common.getStanzaFrom(message)) == Common.getXID()) {
                var forwarded_message = $(message.getNode()).find('forwarded[xmlns="' + NS_URN_FORWARD + '"]:first message:first');

                if(forwarded_message[0]) {
                    return JSJaCPacket.wrapNode(forwarded_message[0]);
                }
            }

            return null;
        } catch(e) {
            Console.error('Carbons._getForwarded', e);
        }

    };


    /**
     * Handles a forwarded sent message
     * @public
     * @param {object} message
     * @return {undefined}
     */
    self.handleSent = function(message) {

        try {
            var forwarded_message = self._getForwarded(message);

            if(forwarded_message !== null) {
                var to = Common.bareXID(forwarded_message.getTo());
                var hash = hex_md5(to);
                var type = forwarded_message.getType();

                // Display sent message
                if(type === 'chat' || !type) {
                    // Chat opened? (no need to display sent messages if chat does not exist there...)
                    if(Chat.exists(hash)) {
                        // Get more data
                        var id = forwarded_message.getID();
                        var body = $.trim(forwarded_message.getBody());
                        var my_xid = Common.getXID();

                        // Generate the message body
                        var html_escape = (Message.generate(forwarded_message, body, hash) !== 'XHTML');
                        if(!html_escape) {
                            body = Filter.xhtml(forwarded_message.getNode());
                        }

                        if(body) {
                            // Display the message (finally!)
                            Message.display(
                                'chat',
                                my_xid,
                                hash,
                                Name.getBuddy(my_xid).htmlEnc(),
                                body,
                                DateUtils.getCompleteTime(),
                                DateUtils.getTimeStamp(),
                                'user-message',
                                html_escape,
                                '',
                                'me',
                                id
                            );

                            Console.debug('Got a sent message from another resource to: ' + (to || 'none'));
                        } else {
                            Console.debug('Got a sent message from another resource to: ' + (to || 'none') + ', was ignored because body empty');
                        }

                        // Handle chat markers change
                        Markers.handleCarbonChange(forwarded_message);
                    } else {
                        Console.debug('Got a sent message from another resource to: ' + (to || 'none') + ', was ignored because chat not open');
                    }
                } else {
                    Console.warning('Got a sent message from another resource to: ' + (to || 'none') + ', was ignored because of type: ' + type);
                }
            }
        } catch(e) {
            Console.error('Carbons.handleSent', e);
        }

    };


    /**
     * Handles a forwarded received message
     * @public
     * @param {object} message
     * @return {undefined}
     */
    self.handleReceived = function(message) {

        try {
            var forwarded_message = self._getForwarded(message);

            if(forwarded_message !== null) {
                Console.debug('Got a received message from another resource from: ' + (forwarded_message.getFrom() || 'none'));

                Message.handle(forwarded_message);
            }
        } catch(e) {
            Console.error('Carbons.handleReceived', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
