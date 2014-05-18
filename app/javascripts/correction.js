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
            var text_sel = $('#' + hex_md5(xid) + ' .text');
            text_sel.addClass('correction-active');
            text_sel.prepend(
                '<div class="correction-toolbox">' + 
                    '<span class="correction-editing">' + Common._e("Editing") + '</span>' + 
                    '<a class="correction-cancel" href="#">' + Common._e("Cancel") + '</a>' + 
                '</div>'
            );

            // Add message correction marker
            message_sel.addClass('correction-active');
            message_sel.find('.correction-label').remove();
            message_sel.find('.correction-edit').hide();

            message_sel.append(
                '<span class="correction-label">' + 
                    Common._e("Being edited") + 
                '</span>'
            );

            // Bind click events
            text_sel.find('.correction-cancel').click(function() {
                self.leave(xid);
                return false;
            });
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
            var text_sel = $('#' + hex_md5(xid) + ' .text');
            text_sel.removeClass('correction-active');
            text_sel.find('.correction-toolbox, .correction-label').remove();

            if(message_sel.size()) {
                message_sel.find('.correction-edit').css('display', '');

                // Remove message correction marker
                message_sel.removeClass('correction-active');
                message_sel.find('.correction-label').remove();
            }
        } catch(e) {
            Console.error('Correction._unbindInterface', e);
        }

    };


    /**
     * @private
     * @param {string} xid
     * @param {string} message_id
     * @param {string} message_body
     * @return {string}
     */
    self._sendStanza = function(xid, message_id, message_body) {

        var args = {
            'id': null,
            'xhtml': false,
            'message': null
        };

        try {
            var hash = hex_md5(xid);
            var id = genID();
            args['id'] = id;

            var message = new JSJaCMessage();
            args['message'] = message;

            message.setType('chat');
            message.setTo(xid);
            message.setID(id);

            // Generates the correct message depending of the choosen style
            var generate_message = Message.generate(message, message_body, hash);
            args['xhtml'] = (generate_message === 'XHTML');
            
            // Receipt request
            var receipt_request = Receipts.request(hash);
            
            if(receipt_request) {
                message.appendNode('request', {'xmlns': NS_URN_RECEIPTS});
            }
            
            // Chatstate
            message.appendNode('active', {'xmlns': NS_CHATSTATES});

            if(message_id !== null) {
                message.appendNode('replace', {
                    'xmlns': NS_URN_CORRECT,
                    'id': message_id
                });
            }

            con.send(message, Errors.handleReply);
        } catch(e) {
            Console.error('Correction._sendStanza', e);
        } finally {
            return args;
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

                    var message_area_sel = $('#' + hex_md5(xid) + ' .message-area');
                    message_area_sel.val(last_message.value);

                    self._bindInterface(
                        xid,
                        last_message.selector
                    );

                    // Focus hack (to get cursor at the end of textarea)
                    message_area_sel.oneTime(10, function() {
                        message_area_sel[0].select();
                        message_area_sel[0].selectionStart = message_area_sel[0].selectionEnd;
                    });
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
                var base_sel = $('#' + hex_md5(xid));
                var active_message_sel = base_sel.find('.content .one-line.user-message.correction-active');

                self._unbindInterface(xid, active_message_sel);

                var message_area_sel = base_sel.find('.message-area');
                message_area_sel.val('');
                message_area_sel.focus();
            }
        } catch(e) {
            Console.error('Correction.leave', e);
        }

    };


    /**
     * Send corrected message
     * @public
     * @param {string} xid
     * @param {string} replacement
     * @return {undefined}
     */
    self.send = function(xid, replacement) {

        try {
            if(self._hasSupport(xid) === true) {
                if(self._getLastMessage(xid).value != replacement) {
                    var own_xid = Common.getXID();
                    var hash = hex_md5(xid);
                    var replace_id = self._getLastID(xid);

                    Console.info('Correction.send', 'Sending replacement message for: ' + xid + ' "' + replacement + '" with ID: ' + (replace_id || 'none'));

                    // Send the stanza itself
                    var stanza_args = self._sendStanza(
                        xid,
                        replace_id,
                        replacement
                    );

                    // Filter the xHTML message (for us!)
                    var replacement_formatted = replacement;

                    if(stanza_args['xhtml']) {
                        replacement_formatted = Filter.xhtml(stanza_args['message'].getNode());
                    }

                    // Remove old message
                    $('#' + hash + ' .content .one-line.user-message[data-mode="me"]').filter(function() {
                        return ($(this).attr('data-id') + '') === (replace_id + '');
                    }).remove();

                    // Display edited message
                    Message.display(
                        'chat',
                        own_xid,
                        hash,
                        Name.getBuddy(own_xid).htmlEnc(),
                        replacement_formatted,
                        DateUtils.getCompleteTime(),
                        DateUtils.getTimeStamp(),
                        'user-message',
                        !stanza_args['xhtml'],
                        '',
                        'me',
                        stanza_args['id'],
                        undefined,
                        undefined,
                        true
                    );
                }
            }
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
            is_in = $('#' + hex_md5(xid) + ' .text').hasClass('correction-active');
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
