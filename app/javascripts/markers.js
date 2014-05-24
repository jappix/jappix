/*

Jappix - An open social platform
Implementation of XEP-0333: Chat Markers

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Markers = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Constants */
    self.MARK_TYPE_MARKABLE      = 'markable';
    self.MARK_TYPE_RECEIVED      = 'received';
    self.MARK_TYPE_DISPLAYED     = 'displayed';
    self.MARK_TYPE_ACKNOWLEDGED  = 'acknowledged';

    self.MARK_TYPES = {};
    self.MARK_TYPES[self.MARK_TYPE_MARKABLE]      = 1;
    self.MARK_TYPES[self.MARK_TYPE_RECEIVED]      = 1;
    self.MARK_TYPES[self.MARK_TYPE_DISPLAYED]     = 1;
    self.MARK_TYPES[self.MARK_TYPE_ACKNOWLEDGED]  = 1;


    /**
     * Return whether entity supports message markers
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.hasSupport = function(xid) {

        var has_support = false;

        try {
            has_support = true ? $('#' + hex_md5(xid)).attr('data-markers') == 'true' : false;
        } catch(e) {
            Console.error('Markers.hasSupport', e);
        } finally {
            return has_support;
        }

    };


    /**
     * Return whether request message is marked or not
     * @public
     * @param {object} message
     * @return {boolean}
     */
    self.hasRequestMarker = function(message) {

        var has_request_marker = false;

        try {
            has_request_marker = ($(message).find('markable[xmlns="' + NS_URN_MARKERS + '"]').size() ? true : false);
        } catch(e) {
            Console.error('Markers.hasRequestMarker', e);
        } finally {
            return has_request_marker;
        }

    };


    /**
     * Return whether response message is marked or not
     * @public
     * @param {object} message
     * @return {boolean}
     */
    self.hasResponseMarker = function(message) {

        var has_response_marker = false;

        try {
            var marker_sel = $(message).find('[xmlns="' + NS_URN_MARKERS + '"]');

            if(marker_sel.size()) {
                var mark_type = marker_sel.prop('tagName').toLowerCase();

                switch(mark_type) {
                    case self.MARK_TYPE_RECEIVED:
                    case self.MARK_TYPE_DISPLAYED:
                    case self.MARK_TYPE_ACKNOWLEDGED:
                        has_response_marker = true;
                        break;
                }
            }
        } catch(e) {
            Console.error('Markers.hasResponseMarker', e);
        } finally {
            return has_response_marker;
        }

    };


    /**
     * Mark a message
     * @public
     * @param {object} message
     * @return {undefined}
     */
    self.mark = function(message) {

        try {
            message.appendNode('markable', {
                'xmlns': NS_URN_MARKERS
            });
        } catch(e) {
            Console.error('Markers.mark', e);
        }

    };


    /**
     * Change received message status (once received or read)
     * @public
     * @param {string} mark_type
     * @param {object} message_id
     * @return {undefined}
     */
    self.change = function(to, mark_type, message_id) {

        try {
            if(!(mark_type in self.MARK_TYPES)) {
                throw 'Marker type (' + mark_type + ') not supported, aborting.';
            }

            var message = new JSJaCMessage();
            message.setTo(to);

            message.appendNode(mark_type, {
                'xmlns': NS_URN_MARKERS,
                'id': message_id
            });

            con.send(message);

            Console.debug('Markers.change', 'Changed marker to: ' + mark_type + ' for message with ID: ' + message_id + ' from: ' + to);
        } catch(e) {
            Console.error('Markers.change', e);
        }

    };


    /**
     * Handles a marked message
     * @public
     * @param {object} message
     * @return {undefined}
     */
    self.handle = function(from, message) {

        try {
            var xid = Common.bareXID(from);
            var marker_sel = $(message).find('[xmlns="' + NS_URN_MARKERS + '"]');

            if(marker_sel.size()) {
                var mark_type = marker_sel.prop('tagName').toLowerCase();
                var mark_message_id = marker_sel.attr('id');
                var mark_valid = false;

                // Filter allowed markers
                switch(mark_type) {
                    case self.MARK_TYPE_RECEIVED:
                    case self.MARK_TYPE_DISPLAYED:
                    case self.MARK_TYPE_ACKNOWLEDGED:
                        mark_valid = true;
                        break;
                }

                if(mark_valid === false) {
                    Console.warn('Markers.handle', 'Dropping unexpected chat marker (' + mark_type + ') from: ' + from);
                    return false;
                }

                // Find marked message target
                var message_sel = $('#' + hex_md5(xid) + ' .content .one-line[data-mode="me"]:last').filter(function() {
                    return ($(this).attr('data-id') + '') === (mark_message_id + '');
                });

                if(!message_sel.size()) {
                    Console.warn('Markers.handle', 'Dropping chat marker (' + mark_type + ') for inexisting message ID (' + mark_message_id + ') from: ' + from);
                    return false;
                }

                Console.debug('Markers.handle', 'Received chat marker (' + mark_type + ') from: ' + from);

                self._display(xid, message_sel, mark_type);

                return true;
            }

            return false;
        } catch(e) {
            Console.error('Markers.handle', e);
            return false;
        }

    };


    /**
     * Displays a marker
     * @private
     * @param {string} xid
     * @param {object} message_sel
     * @param {string} mark_type
     * @return {boolean}
     */
    self._display = function(xid, message_sel, mark_type) {

        try {
            // Get marker state translation
            var marker_sel = message_sel.find('.message-marker');
            var mark_message = null;
            var css_classes = 'talk-images message-marker-read';
            var marker_category = null;

            switch(mark_type) {
                case self.MARK_TYPE_RECEIVED:
                    marker_category = 'delivered';

                    marker_sel.removeClass(css_classes);
                    marker_sel.text(
                                Common._e("Delivered")
                              );
                    break;

                case self.MARK_TYPE_DISPLAYED:
                case self.MARK_TYPE_ACKNOWLEDGED:
                    marker_category = 'read';

                    marker_sel.addClass(css_classes);
                    marker_sel.text(
                                Common._e("Read")
                              );
                    break;

                default:
                    return false;
            }

            if(marker_category !== null) {
                marker_sel.attr('data-category', marker_category);
            }

            // Toggle marker visibility
            message_sel.parents('.content').find('.one-line .message-marker').filter(function() {
                // Leave older "read" checkpoint on screen
                if(marker_category == 'delivered') {
                    return $(this).attr('data-category') == marker_category;
                }

                return true;
            }).hide();
            marker_sel.show();

            return true;
        } catch(e) {
            Console.error('Markers._display', e);
            return false;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();