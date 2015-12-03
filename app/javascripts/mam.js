/*

Jappix - An open social platform
Implementation of XEP-0313: Message Archive Management

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var MAM = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Constants */
    self.REQ_MAX = 50;
    self.SCROLL_THRESHOLD = 200;

    self.PREF_DEFAULTS = {
        'always' : 1,
        'never'  : 1,
        'roster' : 1
    };


    /* Variables */
    self.map_reqs = {};
    self.map_pending = {};
    self.map_states = {};
    self.map_messages = {};
    self.msg_queue = {};


    /**
     * Gets the MAM configuration
     * @public
     * @return {undefined}
     */
    self.getConfig = function() {

        try {
            // Lock the archiving options
            $('#archiving').attr('disabled', true);

            // Get the archiving configuration
            var iq = new JSJaCIQ();
            iq.setType('get');

            iq.appendNode('prefs', { 'xmlns': NS_URN_MAM });

            con.send(iq, self.handleConfig);
        } catch(e) {
            Console.error('MAM.getConfig', e);
        }

    };


    /**
     * Handles the MAM configuration
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleConfig = function(iq) {

        try {
            if(iq.getType() != 'error') {
                // Read packet
                var cur_default = $(iq.getNode()).find('prefs').attr('default') || 'never';

                if(!(cur_default in self.PREF_DEFAULTS)) {
                    cur_default = 'never';
                }

                // Apply value to options
                $('#archiving').val(cur_default);
            }

            // Unlock the archiving option
            $('#archiving').removeAttr('disabled');

            // All done.
            Options.wait('mam');
        } catch(e) {
            Console.error('MAM.handleConfig', e);
        }

    };


    /**
     * Sets the MAM configuration
     * @public
     * @param {string} pref_default
     * @return {undefined}
     */
    self.setConfig = function(pref_default) {

        try {
            // Check parameters
            if(!(pref_default in self.PREF_DEFAULTS)) {
                pref_default = 'never';
            }

            // Send new configuration
            var iq = new JSJaCIQ();
            iq.setType('set');

            iq.appendNode('prefs', { 'xmlns': NS_URN_MAM, 'default': pref_default });

            con.send(iq);
        } catch(e) {
            Console.error('MAM.setConfig', e);
        }

    };


    /**
     * Removes all (or given) MAM archives
     * @public
     * @param {object} args
     * @return {undefined}
     */
    self.purgeArchives = function(args) {

        try {
            if(typeof args != 'object') {
                args = {};
            }

            var iq = new JSJaCIQ();
            iq.setType('set');

            var purge = iq.appendNode('purge', { 'xmlns': NS_METRONOME_MAM_PURGE });

            for(var c in args) {
                if(args[c])  purge.appendChild(iq.buildNode(c, {'xmlns': NS_METRONOME_MAM_PURGE}, args[c]));
            }

            con.send(iq, function(iq) {
                if(iq.getType() == 'result') {
                    Console.info('Archives purged (MAM).');
                } else {
                    Console.error('Error purging archives (MAM).');
                }
            });
        } catch(e) {
            Console.error('MAM.purgeArchives', e);
        }

    };


    /**
     * Gets the MAM configuration
     * @public
     * @param {object} args
     * @param {object} rsm_args
     * @param {function} callback
     * @return {undefined}
     */
    self.getArchives = function(args, rsm_args, callback) {

        try {
            if(typeof args != 'object') {
                args = {};
            }

            var req_id = genID();

            if(args['with']) {
                self.map_pending[args['with']] = 1;
                self.map_reqs[req_id] = args['with'];
            }

            var iq = new JSJaCIQ();
            iq.setType('get');
            iq.setID(req_id);

            var query = iq.setQuery(NS_URN_MAM);

            for(var c in args) {
                if(args[c] !== null)  query.appendChild(iq.buildNode(c, {'xmlns': NS_URN_MAM}, args[c]));
            }

            if(rsm_args && typeof rsm_args == 'object') {
                var rsm_set = query.appendChild(iq.buildNode('set', {'xmlns': NS_RSM}));

                for(var r in rsm_args) {
                    if(rsm_args[r] !== null)  rsm_set.appendChild(iq.buildNode(r, {'xmlns': NS_RSM}, rsm_args[r]));
                }
            }

            con.send(iq, function(res_iq) {
                self.handleArchives(res_iq, callback);
            });
        } catch(e) {
            Console.error('MAM.getArchives', e);
        }

    };


    /**
     * Handles the MAM configuration
     * @public
     * @param {object} iq
     * @param {function} callback
     * @return {undefined}
     */
    self.handleArchives = function(iq, callback) {

        try {
            var res_id = iq.getID();
            var res_with;

            if(res_id && res_id in self.map_reqs) {
                res_with = self.map_reqs[res_id];
            }

            if(iq.getType() != 'error') {
                if(res_with) {
                    var res_sel = $(iq.getQuery());
                    var res_rsm_sel = res_sel.find('set[xmlns="' + NS_RSM + '"]');

                    // Store that data
                    self.map_states[res_with] = {
                        'date': {
                            'start': res_sel.find('start').eq(0).text(),
                            'end': res_sel.find('end').eq(0).text()
                        },

                        'rsm': {
                            'first': res_rsm_sel.find('first').eq(0).text(),
                            'last': res_rsm_sel.find('last').eq(0).text(),
                            'count': parseInt(res_rsm_sel.find('count').eq(0).text() || 0)
                        }
                    };

                    // Generate stamps for easy operations
                    var start_stamp = DateUtils.extractStamp(Date.jab2date(self.map_states[res_with].date.start));
                    var start_end = DateUtils.extractStamp(Date.jab2date(self.map_states[res_with].date.end));

                    // Create MAM messages target
                    var target_html = '<div class="mam-chunk" data-start="' + Common.encodeQuotes(start_stamp) + '" data-end="' + Common.encodeQuotes(start_end) + '"></div>';

                    var target_content_sel = $('#' + hex_md5(res_with) + ' .content');
                    var target_wait_sel = target_content_sel.find('.wait-mam');

                    if(target_wait_sel.size()) {
                        target_wait_sel.after(target_html);
                    } else {
                        target_content_sel.prepend(target_html);
                    }

                    // Any enqueued message to display?
                    if(typeof self.msg_queue[res_with] == 'object') {
                        for(var i in self.msg_queue[res_with]) {
                            (self.msg_queue[res_with][i])();
                        }

                        delete self.msg_queue[res_with];
                    }

                    // Remove XID from pending list
                    if(res_with in self.map_pending) {
                        delete self.map_pending[res_with];
                    }

                    Console.info('Got archives from: ' + res_with);
                } else {
                    Console.warn('Could not associate archive response with a known JID.');
                }
            } else {
                Console.error('Error handing archives (MAM).');
            }

            // Execute callback?
            if(typeof callback == 'function') {
                callback(iq);
            }
        } catch(e) {
            Console.error('MAM.handleArchives', e);
        }

    };


    /**
     * Handles a MAM-forwarded message stanza
     * @public
     * @param {object} fwd_stanza
     * @param {object} c_delay
     * @return {undefined}
     */
    self.handleMessage = function(fwd_stanza, c_delay) {

        try {
            // Build message node
            var c_message = fwd_stanza.find('message');

            if(c_message[0]) {
                // Re-build a proper JSJaC message stanza
                var message = JSJaCPacket.wrapNode(c_message[0]);
                var message_node = message.getNode();

                // Check message type
                var type = message.getType() || 'chat';

                if(type == 'chat') {
                    // Display function
                    var c_display_fn;
                    var c_display_msg_bool = false;

                    // Read message data
                    var xid = Common.bareXID(Common.getStanzaFrom(message));
                    var id = message.getID();
                    var from_xid = xid;
                    var b_name = Name.getBuddy(xid);
                    var mode = (xid == Common.getXID()) ? 'me': 'him';

                    // Refactor chat XID (in case we were the sender of the archived message)
                    if(mode == 'me') {
                        xid = Common.bareXID(message.getTo());
                    }

                    var hash = hex_md5(xid);
                    var body = message.getBody();

                    // Content message?
                    if(body) {
                        // Read delay (required since we deal w/ a past message!)
                        var time, stamp;
                        var delay = c_delay.attr('stamp');

                        if(delay) {
                            time = DateUtils.relative(delay);
                            stamp = DateUtils.extractStamp(Date.jab2date(delay));
                        }

                        // Last-minute checks before display
                        if(time && stamp) {
                            var mam_chunk_path = '#' + hash + ' .mam-chunk';

                            // Markable message?
                            var is_markable = Markers.hasRequestMarker(message_node);

                            // No chat auto-scroll?
                            var no_scroll = Common.exists(mam_chunk_path);

                            // Select the custom target
                            var c_target_sel = function() {
                                return $(mam_chunk_path).filter(function() {
                                    return $(this).attr('data-start') <= stamp && $(this).attr('data-end') >= stamp;
                                }).filter(':first');
                            };

                            // Display the message in that target
                            c_display_fn = function() {
                                // Display message
                                Message.display(
                                    type,
                                    from_xid,
                                    hash,
                                    b_name.htmlEnc(),
                                    body,
                                    time,
                                    stamp,
                                    'old-message',
                                    true,
                                    null,
                                    mode,
                                    id + '-mam',
                                    c_target_sel(),
                                    no_scroll,
                                    undefined,
                                    undefined,
                                    undefined,
                                    is_markable
                                );

                                self.map_messages[id] = 1;
                            };

                            c_display_msg_bool = c_target_sel().size() ? true : false;

                            // Hack: do not display the message in case we would duplicate it w/ current session messages
                            //       only used when initiating a new chat, avoids collisions
                            if(!(xid in self.map_states) && $('#' + hash).find('.one-line.user-message:last').text() == body) {
                                return;
                            }
                        }
                    } else if(Markers.hasResponseMarker(message_node)) {
                        // Marked message? (by other party)
                        if(mode == 'him') {
                            var marked_message_id = Markers.getMessageID(message_node);

                            c_display_fn = function() {
                                var is_mam_marker = true;

                                Markers.handle(
                                    from_xid,
                                    message_node,
                                    is_mam_marker
                                );
                            };

                            c_display_msg_bool = (self.map_messages[marked_message_id] === 1) ? true : false;
                        }
                    }

                    // Display message?
                    if(typeof c_display_fn == 'function') {
                        if(c_display_msg_bool === true) {
                            // Display message now
                            c_display_fn();
                        } else {
                            // Delay display (we may not have received the MAM reply ATM)
                            if(typeof self.msg_queue[xid] != 'object') {
                                self.msg_queue[xid] = [];
                            }

                            self.msg_queue[xid].push(c_display_fn);
                        }
                    }
                }
            }
        } catch(e) {
            Console.error('MAM.handleMessage', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
