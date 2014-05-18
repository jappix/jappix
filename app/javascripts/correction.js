/*

Jappix - An open social platform
Implementation of XEP-0308: Last Message Correction

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Correction = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * @private
     * @param {string} xid
     * @return {boolean}
     */
    self._hasSupport = function(xid) {

        var support = false;

        try {
            if($('#' + hex_md5(xid) + ' .message-area[data-correction]').size()) {
                support = true;
            }
        } catch(e) {
            Console.error('Correction._hasSupport', e);
        } finally {
            return support;
        }

    };


    /**
     * @private
     * @param {string} xid
     * @return {string}
     */
    self._getLastID = function(xid) {

        var last_id = null;

        try {
            if(self._hasSupport(xid) === true) {
                // Check last message from ourselves
                last_id = $('#' + hex_md5(xid) + ' .content .one-line.user-message[data-mode="me"]:last').attr('data-id') || null;
            }
        } catch(e) {
            Console.error('Correction._getLastID', e);
        } finally {
            return last_id;
        }

    };


    /**
     * @private
     * @param {string} xid
     * @return {string}
     */
    self._getCurrentID = function(xid) {

        var current_id = null;

        try {
            if(self._hasSupport(xid) === true) {
                // Check the ID of the message being edited (if any)
                current_id = $('#' + hex_md5(xid) + ' .message-area').attr('data-correction-current') || null;
            }
        } catch(e) {
            Console.error('Correction._getCurrentID', e);
        } finally {
            return current_id;
        }

    };


    /**
     * @private
     * @param {string} xid
     * @return {object}
     */
    self._getLastMessage = function(xid) {

        var last_message_val = null;
        var last_message_sel = null;

        try {
            if(self._hasSupport(xid) === true) {
                // Check last message from ourselves
                last_message_sel = $('#' + hex_md5(xid) + ' .content .one-line.user-message[data-mode="me"]:last');
                last_message_val = last_message_sel.find('.message-content').text() || null;

                if(!last_message_val === null) {
                    last_message_sel = null;
                }
            }
        } catch(e) {
            Console.error('Correction._getLastMessage', e);
        } finally {
            return {
                'value': last_message_val,
                'selector': last_message_sel
            };
        }

    };


    /**
     * @private
     * @param {string} xid
     * @param {object} message_sel
     * @return {undefined}
     */
    self._bindInterface = function(xid, message_sel) {

        try {
            // Add message area elements
            var compose_sel = $('#' + hex_md5(xid) + ' .compose');
            compose_sel.addClass('correction-active');
            compose_sel.prepend(
                '<div class="correction-toolbox">' + 
                    '<span class="correction-editing">' + Common._e("Editing") + '</span>' + 
                    '<a class="correction-cancel" href="#">' + Common._e("Cancel") + '</a>' + 
                '</div>'
            );

            // Add message correction marker
            message_sel.addClass('correction-active');
            message_sel.append(
                '<span class="correction-label">' + 
                    Common._e("Being edited") + 
                '</span>'
            );
        } catch(e) {
            Console.error('Correction._bindInterface', e);
        }

    };


    /**
     * @private
     * @param {string} xid
     * @param {object} message_sel
     * @return {undefined}
     */
    self._unbindInterface = function(xid, message_sel) {

        try {
            // Remove message area elements
            var compose_sel = $('#' + hex_md5(xid) + ' .compose');
            compose_sel.removeClass('correction-active');
            compose_sel.find('.correction-toolbox').remove();

            // Remove message correction marker
            message_sel.removeClass('correction-active');
            message_sel.find('correction-label').remove();
        } catch(e) {
            Console.error('Correction._unbindInterface', e);
        }

    };


    /**
     * @private
     * @param {string} xid
     * @param {string} message_id
     * @param {string} message_body
     * @return {undefined}
     */
    self._sendStanza = function(xid, message_id, message_body) {

        try {
            var message = new JSJaCMessage();
            message.setTo(xid);

            message.setBody(message_body);

            if(message_id !== null) {
                message.appendNode('replace', {
                    'xmlns': NS_URN_CORRECT,
                    'id': message_id
                });
            }

            con.send(message);
        } catch(e) {
            Console.error('Correction._sendStanza', e);
        }

    };


    /**
     * Enter correction mode (for last message)
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.enter = function(xid) {

        try {
            Console.debug('Correction.enter', 'Requested to enter the correction mode with: ' + xid);

            if(self._hasSupport(xid) === true && self.isIn(xid) === false) {
                var last_message = self._getLastMessage(xid);

                if(last_message.value && last_message.selector) {
                    Console.info('Correction.enter', 'Valid last message found for correction mode with: ' + xid);

                    $('#' + hex_md5(xid) + ' .message-area').val(last_message.value);

                    self._bindInterface(
                        xid,
                        last_message.selector
                    );
                }
            }
        } catch(e) {
            Console.error('Correction.enter', e);
        }

    };


    /**
     * Leave correction mode
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.leave = function(xid) {

        try {
            if(self.isIn(xid) === true) {
                var active_message_sel = $('#' + hex_md5(xid) + ' .content .one-line.user-message.correction-active');

                if(active_message_sel.size()) {
                    self._unbindInterface(xid, active_message_sel);
                }
            }
        } catch(e) {
            Console.error('Correction.leave', e);
        }

    };


    /**
     * Push corrected message
     * @public
     * @param {string} xid
     * @param {string} replacement
     * @return {undefined}
     */
    self.push = function(xid, replacement) {

        try {
            if(self._hasSupport(xid) === true) {
                if(self._getLastMessage(xid) != replacement) {
                    var replace_id = self._getLastID(xid);

                    Console.info('Correction.push', 'Pushing replacement message for: ' + xid + ' "' + replacement + '" with ID: ' + (replace_id || 'none'));

                    self._sendStanza(
                        xid,
                        replace_id,
                        replacement
                    );
                }
            }
        } catch(e) {
            Console.error('Correction.push', e);
        }

    };


    /**
     * Send corrected message
     * @public
     * @param {string} original_id
     * @param {string} xid
     * @return {undefined}
     */
    self.send = function(original_id, xid) {

        try {
            // TODO
        } catch(e) {
            Console.error('Correction.send', e);
        }

    };


    /**
     * Returns whether we are in correction mode or not
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isIn = function(xid) {

        var is_in = false;

        try {
            is_in = $('#' + hex_md5(xid) + ' .compose').hasClass('correction-active');
        } catch(e) {
            Console.error('Correction.isIn', e);
        } finally {
            return is_in;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
