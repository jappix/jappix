/*

Jappix - An open social platform
These are the error functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Errors = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Shows the given error output
     * @public
     * @param {string} condition
     * @param {string} reason
     * @param {string} type
     * @return {undefined}
     */
    self.show = function(condition, reason, type) {

        try {
            // Enough data to output the error
            if(condition || reason) {
                // Initialize the error text
                var eText = '';

                // Any error condition
                if(condition) {
                    eText += condition;
                }

                // Any error type
                if(type && eText) {
                    eText += ' (' + type + ')';
                }

                // Any error reason
                if(reason) {
                    if(eText) {
                        eText += ' - ';
                    }

                    eText += reason;
                }

                // We reveal the error
                Board.openThisError(1);

                // Create the error text
                $('#board .one-board.error[data-id="1"] span').text(eText);
            }

            // Not enough data to output the error: output a generic board
            else {
                Board.openThisError(2);
            }
        } catch(e) {
            Console.error('Errors.show', e);
        }

    };


    /**
     * Handles the error from a packet and return true if any error
     * @public
     * @param {object} packet
     * @return {boolean}
     */
    self.handle = function(packet) {

        /* REF: http://xmpp.org/extensions/xep-0086.html */

        try {
            // Initialize
            var type, code, reason, condition;
            var node = $(packet);

            // First level error (connection error)
            if(node.is('error')) {
                // Get the value
                code = node.attr('code');

                // Specific error reason
                switch(code) {
                    case '401':
                        reason = Common._e("Authorization failed");
                        break;

                    case '409':
                        reason = Common._e("Registration failed, please choose a different username");
                        break;

                    case '503':
                        reason = Common._e("Service unavailable");
                        break;

                    case '500':
                        reason = Common._e("Internal server error, try later");
                        break;

                    default:
                        reason = node.find('text').text();
                        break;
                }

                // Remove the general wait item (security)
                Interface.removeGeneralWait();

                // Show reconnect pane
                if(Connection.current_session && Connection.connected) {
                    // Anonymous?
                    if(Utils.isAnonymous()) {
                        Connection.createReconnect('anonymous');
                    } else {
                        Connection.createReconnect('normal');
                    }
                }

                // Show the homepage (security)
                else if(!Connection.current_session || !Connection.connected) {
                    $('#home').show();
                    Interface.title('home');
                }

                // Still connected? (security)
                if(Common.isConnected()) {
                    con.disconnect();
                }

                Console.error('First level error received.');
            }

            // Second level error (another error)
            else if(node.find('error').size()) {
                type = node.find('error').attr('type');
                reason = node.find('error text').text();
                condition = packet.getElementsByTagName('error').item(0).childNodes.item(0).nodeName.replace(/-/g, ' ');

                Console.error('Second level error received.');
            } else {
                return false;
            }

            // Show the error board
            self.show(condition, reason, type);

            // Return there's an error
            return true;
        } catch(e) {
            Console.error('Errors.handle', e);
        }

    };


    /**
     * Handles the error reply of a packet
     * @public
     * @param {object} packet
     * @return {boolean}
     */
    self.handleReply = function(packet) {

        try {
            return self.handle(packet.getNode());
        } catch(e) {
            Console.error('Errors.handleReply', e);
        }

    };


    /**
     * Handles the error reply for a message
     * @public
     * @param {object} packet
     * @return {boolean}
     */
    self.handleMessage = function(packet) {

        try {
            if(!self.handleReply(packet)) {
                Message.handle(packet);
            }
        } catch(e) {
            Console.error('Errors.handleMessage', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();