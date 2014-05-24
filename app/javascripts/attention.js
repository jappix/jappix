/*

Jappix - An open social platform
Implementation of XEP-0224: Attention

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Attention = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Displays attention message
     * @private
     * @param {string} xid
     * @param {string} body
     * @return {undefined}
     */
    self._display = function(xid, body, mode) {

        try {
            var name = Name.getBuddy(xid).htmlEnc();
            var hash = hex_md5(xid);

            // Compute some variables
            var message = Common._e(Common.printf("You requested %s's attention to the conversation", name));

            if(mode == 'him') {
                message = Common._e(Common.printf("%s requested your attention to the conversation", name));
            }

            if(body) {
                message += ' (' + body + ')';
            }

            // Display notification
            Message.display(
                'chat',
                xid,
                hash,
                name,
                message,
                DateUtils.getCompleteTime(),
                DateUtils.getTimeStamp(),
                'system-message',
                true,
                undefined,
                mode
            );

            // Add a marker to displayed message
            $('#' + hash + ' .content .one-line.system-message:last').addClass('attention-notice');
        } catch(e) {
            Console.error('Attention._display', e);
        }

    };


    /**
     * Sends attention stanza
     * @private
     * @param {string} xid
     * @param {string} body
     * @return {object}
     */
    self._stanza = function(xid, body) {

        try {
            var message = new JSJaCMessage();
            message.setType('headline');
            message.setTo(xid);

            if(body) {
                message.setBody(body);
            }

            // Attention node
            message.appendNode('attention', {
                'xmlns': NS_URN_ATTENTION
            });

            con.send(message);

            return message;
        } catch(e) {
            Console.error('Attention._stanza', e);
        }

    };


    /**
     * Returns whether last attention message exists or not
     * @private
     * @param {string} xid
     * @return {boolean}
     */
    self._lastExists = function(xid, mode) {

        var last_exists = false;

        try {
            var line_sel = $('#' + hex_md5(xid) + ' .content .one-line[data-mode="' + mode + '"]:last');
            last_exists = line_sel.is('.system-message.attention-notice') ? true : false;
        } catch(e) {
            Console.error('Attention._lastExists', e);
        } finally {
            return last_exists;
        }

    };


    /**
     * Return whether entity supports attention notifications
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.hasSupport = function(xid) {

        var has_support = false;

        try {
            has_support = true ? $('#' + hex_md5(xid)).attr('data-attention') == 'true' : false;
        } catch(e) {
            Console.error('Attention.hasSupport', e);
        } finally {
            return has_support;
        }

    };


    /**
     * Send an attention message
     * @public
     * @param {string} xid
     * @param {string} body
     * @return {undefined}
     */
    self.send = function(xid, body) {

        try {
            var mode = 'me';

            // Don't send attention message twice
            if(self._lastExists(xid, mode) === false) {
                // Send message stanza
                self._stanza(xid, body);

                // Display attention notification
                self._display(xid, body, mode);
            } else {
                Console.debug('Attention.send', 'Not sending attention message to: ' + xid + ' because already sent.');
            }
        } catch(e) {
            Console.error('Attention.send', e);
        }

    };


    /**
     * Receive an attention notification
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.receive = function(xid, body) {

        try {
            var mode = 'him';
            var hash = hex_md5(xid);

            // Don't receive attention message twice
            if((self._lastExists(xid, mode) === false) && Common.exists('#' + hash)) {
                // Display attention notification
                self._display(xid, body, mode);

                // Show a notification
                Interface.messageNotify(hash, 'personal');
                Audio.play('catch-attention');

                Board.quick(
                    xid,
                    'chat',
                    Common._e("Attention to conversation requested."),
                    Name.getBuddy(xid)
                );
            }
        } catch(e) {
            Console.error('Attention.receive', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();