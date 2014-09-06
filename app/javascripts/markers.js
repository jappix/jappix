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
     * Returns whether entity supports message markers
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
     * Returns whether request message is marked or not
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
     * Returns whether response message is marked or not
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
     * Returns the marked message ID
     * @public
     * @param {object} message
     * @return {boolean}
     */
    self.getMessageID = function(message) {

        var message_id = null;

        try {
            message_id = $(message).find('[xmlns="' + NS_URN_MARKERS + '"]').attr('id');
        } catch(e) {
            Console.error('Markers.getMessageID', e);
        } finally {
            return message_id;
        }

    };


    /**
     * Marks a message
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
     * Changes received message status (once received or read)
     * @public
     * @param {string} mark_type
     * @param {object} message_id
     * @return {undefined}
     */
    self.change = function(to, mark_type, message_id, message_sel) {

        try {
            if(!(mark_type in self.MARK_TYPES)) {
                throw 'Marker type (' + mark_type + ') not supported, aborting.';
            }

            // Store mark state
            message_sel.attr('data-mark', mark_type);

            var message = new JSJaCMessage();

            message.setType('chat');
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
     * Handles marker change coming from Carbons
     * @public
     * @param {string} message
     * @return {undefined}
     */
    self.handleCarbonChange = function(message) {

        try {
            // Check the marker element is existing
            var marker_sel = $(message).find('[xmlns="' + NS_URN_MARKERS + '"]');

            if(marker_sel.size()) {
                var xid = Common.bareXID(message.getTo());

                var mark_type = marker_sel.prop('tagName').toLowerCase();
                var mark_handle = false;

                // Filter allowed markers
                switch(mark_type) {
                    case self.MARK_TYPE_RECEIVED:
                    case self.MARK_TYPE_DISPLAYED:
                    case self.MARK_TYPE_ACKNOWLEDGED:
                        mark_handle = true;
                        break;
                }

                if(mark_handle === true) {
                    var mark_message_id = marker_sel.attr('id');

                    var message_sel = $('#' + hex_md5(xid) + ' .content .one-line[data-mode="him"][data-markable="true"]').filter(function() {
                        return ($(this).attr('data-id') + '') === (mark_message_id + '');
                    }).filter(':last');

                    if(!message_sel.size()) {
                        Console.warn('Markers.handleCarbonChange', 'Unknown message marker to keep in sync with Carbons for: ' + xid);
                        return false;
                    }

                    // Store mark state
                    message_sel.attr('data-mark', mark_type);

                    Console.debug('Markers.handleCarbonChange', 'Received Carbons chat marker (' + mark_type + ') from another resource for: ' + from);
                }
            }
        } catch(e) {
            Console.error('Markers.handleCarbonChange', e);
        }

    };


    /**
     * Handles a marked message
     * @public
     * @param {string} from
     * @param {object} message
     * @param {boolean} is_mam_marker
     * @return {undefined}
     */
    self.handle = function(from, message, is_mam_marker, is_groupchat_user) {

        try {
            var xid = ((is_groupchat_user !== true && Common.bareXID(from)) || from);
            var marker_sel = $(message).find('[xmlns="' + NS_URN_MARKERS + '"]');

            if(marker_sel.size()) {
                var mark_type = marker_sel.prop('tagName').toLowerCase();
                var mark_message_id = marker_sel.attr('id');

                if(is_mam_marker === true) {
                    mark_message_id += '-mam';
                }

                // Filter allowed markers
                var mark_valid = false;

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
                var message_sel = $('#' + hex_md5(xid) + ' .content .one-line[data-mode="me"]').filter(function() {
                    return ($(this).attr('data-id') + '') === (mark_message_id + '');
                }).filter(':last');

                if(!message_sel.size()) {
                    Console.warn('Markers.handle', 'Dropping chat marker (' + mark_type + ') for inexisting message ID (' + mark_message_id + ') from: ' + from);
                    return false;
                }

                Console.debug('Markers.handle', 'Received chat marker (' + mark_type + ') from: ' + from);

                // Finally display received marker
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
     * Adds the markers input events
     * @public
     * @param {object} target
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.events = function(target, xid, hash, type) {

        try {
            target.focus(function() {
                // Not needed
                if(target.is(':disabled')) {
                    return;
                }

                // Send displayed message marker?
                if(type == 'chat' && self.hasSupport(xid) === true) {
                    var last_message = $('#' + hash + ' .content .one-line.user-message[data-markable="true"]:last');

                    if(last_message.attr('data-mark') != self.MARK_TYPE_DISPLAYED) {
                        var last_message_id = last_message.attr('data-id');
                        var full_xid = Presence.highestPriority(xid) || xid;

                        if(last_message_id) {
                            self.change(
                                full_xid,
                                self.MARK_TYPE_DISPLAYED,
                                last_message_id,
                                last_message
                            );
                        }
                    }
                }
            });
        } catch(e) {
            Console.error('Markers.events', e);
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

            // Reset sending state
            message_sel.removeClass('is-sending');

            // Toggle marker visibility
            message_sel.parents('.content').find('.one-line .message-marker').filter(function() {
                var data_category = $(this).attr('data-category');

                if(data_category != 'delivered' && data_category != 'read') {
                    return false;
                }

                // Leave older "read" checkpoint on screen
                if(marker_category == 'delivered') {
                    return data_category == marker_category;
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