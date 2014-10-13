/*

Jappix - An open social platform
These are the call common management functions

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Call = (function() {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self._start_stamp = 0;
    self.call_auto_accept = {
        'from' : null,
        'sid'  : null
    };


    /**
     * Provides an adapter to the JSJaCJingle console implementation which is different
     * @private
     * @return {object}
     */
    self._consoleAdapter = (function() {

        /**
         * Alias of this
         * @private
         */
        var _console = {};


        /**
         * Console logging interface (adapted)
         * @public
         * @param {string} message
         * @param {number} loglevel
         * @return {undefined}
         */
        _console.log = function(message, loglevel) {

            try {
                if(!message) {
                    throw 'No message passed to console adapter!';
                }

                switch(loglevel) {
                    case 0:
                        Console.warn(message); break;
                    case 1:
                        Console.error(message); break;
                    case 2:
                        Console.info(message); break;
                    case 4:
                        Console.debug(message); break;
                    default:
                        Console.log(message);
                }
            } catch(e) {
                Console.error('Call._consoleAdapter.log', e);
            }

        };


        /**
         * Return sub-class scope
         */
        return _console;

    })();


    /**
     * Initializes Jingle router
     * @public
     * @return {undefined}
     */
    self.init = function() {

        try {
            // Listen for incoming Jingle/Muji packet
            JSJaCJingle.listen({
                connection: con,
                debug: self._consoleAdapter,

                // TODO: setting a fallback fucks up some calls...
                // fallback: './server/jingle.php',

                single_initiate: function(stanza) {
                    try {
                        // Already in a call?
                        if(self.is_ongoing()) {
                            // Try to restore SID there
                            var stanza_id = stanza.getID();
                            var sid = null;

                            if(stanza_id) {
                                var stanza_id_split = stanza_id.split('_');
                                sid = stanza_id_split[1];
                            }

                            // Build a temporary Jingle session
                            var jingle_close = new JSJaCJingle.session(
                                JSJAC_JINGLE_SESSION_SINGLE,
                                {
                                    to: stanza.getFrom(),
                                    debug: JSJaCJingleStorage.get_debug()
                                }
                            );

                            if(sid) {
                                jingle_close._set_sid(sid);
                            }

                            jingle_close.terminate(JSJAC_JINGLE_REASON_BUSY);

                            Console.warn('session_initiate_success', 'Dropped incoming call because already in a call.');

                            return;
                        }

                        var xid  = Common.fullXID(Common.getStanzaFrom(stanza));

                        Console.info('Incoming call from: ' + xid);

                        // Session values
                        Jingle.receive(xid, stanza);
                    } catch(e) {
                        Console.error('Call.init[single_initiate]', e);
                    }
                },

                single_propose: function(stanza, proposed_medias) {
                    try {
                        var stanza_from = stanza.getFrom() || null;
                        var call_id = JSJaCJingleBroadcast.get_call_id(stanza);

                        // Request for Jingle session to be accepted
                        if(stanza_from && call_id) {
                            var call_media_main = 'audio';

                            if(JSJAC_JINGLE_MEDIA_VIDEO in proposed_medias) {
                                call_media_main = 'video';
                            }

                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
                                Common.bareXID(stanza_from),
                                ('broadcast_' + call_media_main),
                                call_media_main,
                                null,

                                {
                                    full_xid: stanza_from,
                                    call_id: call_id,
                                    medias: proposed_medias
                                }
                            );

                            Audio.play('incoming-call', true);

                            // Save initiator (security: don't save SID until it's accepted)
                            self.call_auto_accept.from = stanza_from;
                            self.call_auto_accept.sid  = null;
                        }
                    } catch(e) {
                        Console.error('Call.init[single_propose]', e);
                    }
                },

                single_retract: function(stanza) {
                    try {
                        var stanza_from = stanza.getFrom() || null;
                        var call_id = JSJaCJingleBroadcast.get_call_id(stanza);
                        var call_medias = JSJaCJingleBroadcast.get_call_medias(call_id);

                        // Call retracted (from initiator)
                        if(self.call_auto_accept.from == stanza_from) {
                            Audio.stop('incoming-call');

                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
                                Common.bareXID(stanza_from),
                                'remote_canceled'
                            );
                        }
                    } catch(e) {
                        Console.error('Call.init[single_retract]', e);
                    }
                },

                single_accept: function(stanza) {
                    try {
                        var stanza_from = stanza.getFrom() || null;
                        var call_id = JSJaCJingleBroadcast.get_call_id(stanza);

                        // Another resource accepted the call
                        if(self.call_auto_accept.sid == call_id  &&
                           stanza_from && Common.getFullXID() != stanza_from) {
                            self._unnotify();
                            Audio.stop('incoming-call');
                        }
                    } catch(e) {
                        Console.error('Call.init[single_accept]', e);
                    }
                },

                single_reject: function(stanza) {
                    try {
                        var stanza_from = stanza.getFrom() || null;
                        var call_id = JSJaCJingleBroadcast.get_call_id(stanza);

                        // Another resource rejected the call
                        if(self.call_auto_accept.sid == call_id  &&
                           stanza_from && Common.getFullXID() != stanza_from) {
                            self._unnotify();
                            Audio.stop('incoming-call');
                        }
                    } catch(e) {
                        Console.error('Call.init[single_reject]', e);
                    }
                },

                single_proceed: function(stanza) {
                    try {
                        // Read broadcast parameters
                        var call_to = stanza.getFrom() || null;
                        var call_id = JSJaCJingleBroadcast.get_call_id(stanza);
                        var call_medias = JSJaCJingleBroadcast.get_call_medias(call_id);

                        // Check medias to include
                        var has_media_video = false;

                        for(var i = 0; i < call_medias.length; i++) {
                            if(call_medias[i] === JSJAC_JINGLE_MEDIA_VIDEO) {
                                has_media_video = true;
                                break;
                            }
                        }

                        var call_media_picked = has_media_video ? JSJAC_JINGLE_MEDIA_VIDEO : JSJAC_JINGLE_MEDIA_AUDIO;

                        // Follow up Jingle call
                        Jingle.follow_up(call_to, call_media_picked, call_id);
                    } catch(e) {
                        Console.error('Call.init[single_proceed]', e);
                    }
                },

                // Receive a multiparty (Muji) call
                muji_invite: function(stanza, args) {
                    try {
                        if(!self.is_ongoing()) {
                            // Session values
                            Muji.receive(args, stanza);
                        }
                    } catch(e) {
                        Console.error('Call.init[muji_invite]', e);
                    }
                }
            });

            // Enable Jingle/Muji UI elements if plugin could start
            if(JSJAC_JINGLE_AVAILABLE) {
                $('.jingle-hidable, .muji-hidable').show();
            }
        } catch(e) {
            Console.error('Call.init', e);
        }

    };


    /**
     * Opens the call interface
     * @public
     * @return {undefined}
     */
    self.open = function() {

        try {
            if(Jingle.in_call()) {
                Jingle.open();
            } else if(Muji.in_call()) {
                Muji.open();
            }
        } catch(e) {
            Console.error('Call.open', e);
        }

    };


    /**
     * Stops current call
     * @public
     * @param {boolean} abort
     * @return {boolean}
     */
    self.stop = function(abort) {

        try {
            Jingle.stop(abort);
            Muji.stop(abort);
        } catch(e) {
            Console.error('Call.stop', e);
        } finally {
            return false;
        }

    };


    /**
     * Mutes current call
     * @public
     * @param {object} session
     * @param {object} controls
     * @return {undefined}
     */
    self.mute = function(session, controls) {

        try {
            if(session) {
                // Toggle interface buttons
                controls.filter('.mute').hide();
                controls.filter('.unmute').show();

                // Actually mute audio stream
                if(session.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) === false) {
                    session.mute(JSJAC_JINGLE_MEDIA_AUDIO);
                }
            }
        } catch(e) {
            Console.error('Call.mute', e);
        }

    };


    /**
     * Unmutes current call
     * @public
     * @param {object} session
     * @param {object} controls
     * @return {undefined}
     */
    self.unmute = function(session, controls) {

        try {
            if(session) {
                controls.filter('.unmute').hide();
                controls.filter('.mute').show();

                if(session.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) === true) {
                    session.unmute(JSJAC_JINGLE_MEDIA_AUDIO);
                }
            }
        } catch(e) {
            Console.error('Call.mute', e);
        }

    };


    /**
     * Checks whether user is in call or not
     * @public
     * @return {boolean}
     */
    self.is_ongoing = function() {

        is_ongoing = false;

        try {
            is_ongoing = (Jingle.in_call() === true || Muji.in_call() === true);
        } catch(e) {
            Console.error('Call.is_ongoing', e);
        } finally {
            return is_ongoing;
        }

    };


    /**
     * Checks if the given call SID is the same as the current call's one
     * @public
     * @param {object} session
     * @param {object} compare_session
     * @return {boolean}
     */
    self.is_same_sid = function(session, compare_session) {

        is_same = false;

        try {
            if(compare_session && session  &&
               compare_session.get_sid() === session.get_sid()) {
                is_same = true;
            }
        } catch(e) {
            Console.error('Call.is_same_sid', e);
        } finally {
            return is_same;
        }

    };


    /**
     * Returns if current call is audio
     * @public
     * @param {object} session
     * @return {boolean}
     */
    self.is_audio = function(session) {

        audio = false;

        try {
            if(session && session.get_media() === JSJAC_JINGLE_MEDIA_AUDIO) {
                audio = true;
            }
        } catch(e) {
            Console.error('Call.is_audio', e);
        } finally {
            return audio;
        }

    };


    /**
     * Returns if current call is video
     * @public
     * @param {object} session
     * @return {boolean}
     */
    self.is_video = function(session) {

        video = false;

        try {
            if(session && session.get_media() === JSJAC_JINGLE_MEDIA_VIDEO) {
                video = true;
            }
        } catch(e) {
            Console.error('Call.is_video', e);
        } finally {
            return video;
        }

    };


    /**
     * Set the Muji session as started
     * @public
     * @param {string} mode
     * @return {boolean}
     */
    self.start_session = function(mode) {

        try {
            if(!(mode in JSJAC_JINGLE_MEDIAS)) {
                throw 'Unknown mode: ' + (mode || 'none');
            }

            var call_tool_sel = $('#top-content .tools.call');

            call_tool_sel.removeClass('audio video active');
            call_tool_sel.addClass('streaming').addClass(mode);

            Console.info('Call session successfully started, mode: ' + (mode || 'none'));
        } catch(e) {
            Console.error('Call.start_session', e);
        } finally {
            return false;
        }

    };


    /**
     * Set the Jingle session as stopped
     * @public
     * @param {string} mode
     * @return {boolean}
     */
    self.stop_session = function() {

        try {
            $('#top-content .tools.call').removeClass('audio video active streaming');

            Console.info('Call session successfully stopped');
        } catch(e) {
            Console.error('Call.stop_session', e);
        } finally {
            return false;
        }

    };


    /**
     * Generates ICE servers configuration
     * @public
     * @return {object}
     */
    self.generate_ice_servers = function() {

        ice_servers = {
            stun: [],
            turn: []
        };

        try {
            if(HOST_STUN) {
                ice_servers.stun.push({
                    'host': HOST_STUN
                });
            }

            if(HOST_TURN) {
                ice_servers.turn.push({
                    'host': HOST_TURN,
                    'username': HOST_TURN_USERNAME,
                    'credential': HOST_TURN_PASSWORD
                });
            }
        } catch(e) {
            Console.error('Call.generate_ice_servers', e);
        } finally {
            return is_ongoing;
        }

    };


    /**
     * Returns the notification map (based on call type)
     * @private
     * @param {string} call_type
     * @return {object}
     */
    self._get_notify_map = function(call_type) {

        var map = {};

        try {
            switch(call_type) {
                case JSJAC_JINGLE_SESSION_SINGLE:
                    map = Jingle._notify_map(); break;
                case JSJAC_JINGLE_SESSION_MUJI:
                    map = Muji._notify_map(); break;
                default:
                    return;
            }
        } catch(e) {
            Console.error('Call._get_notify_map', e);
        } finally {
            return map;
        }

    };


    /**
     * Notify for something related to calls
     * @public
     * @param {string} call_type
     * @param {string} xid
     * @param {string} type
     * @param {string} mode
     * @param {object} [options_arr]
     * @return {boolean}
     */
    self.notify = function(call_type, xid, type, mode, sender_xid, options_arr) {

        try {
            sender_xid = sender_xid || xid;

            // Notification data map
            var map = self._get_notify_map(call_type);

            if(!(type in map)) {
                throw 'Notification type not recognized!';
            }

            // Selectors
            var call_tools_all_sel = $('#top-content .tools-all:has(.tools.call)');
            var call_tool_sel = call_tools_all_sel.find('.tools.call');
            var call_content_sel = call_tools_all_sel.find('.call-content');
            var call_subitem_sel = call_content_sel.find('.tools-content-subitem');

            // Generate proper full name
            var fullname;

            if(call_type === JSJAC_JINGLE_SESSION_MUJI && sender_xid === Common.getXID()) {
                fullname = Common._e("Conference call");
            } else {
                fullname = Name.getBuddy(sender_xid).htmlEnc();
            }

            // Generate buttons code
            var buttons_html = '';
            var i = 0;

            if(typeof map[type].buttons === 'object') {
                $.each(map[type].buttons, function(button, attrs) {
                    buttons_html += '<a class="reply-button ' + button + ' ' + attrs.color + ' ' + (!(i++) ? 'first' : '') + '" data-action="' + button + '">' + attrs.text + '</a>';
                });
            }

            // Append notification to DOM
            call_subitem_sel.html(
                '<div class="call-notify notify-' + type + ' ' + hex_md5(sender_xid) + '" data-type="' + type + '" data-xid="' + Common.encodeQuotes(xid) + '">' +
                    '<div class="avatar-pane">' +
                        '<div class="avatar-container">' +
                            '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                        '</div>' +

                        '<span class="icon call-images"></span>' +
                    '</div>' +

                    '<div class="notification-content">' +
                        '<span class="fullname">' + fullname + '</span>' +
                        '<span class="text">' + map[type].text + '</span>' +

                        '<div class="reply-buttons">' + buttons_html + '</div>' +
                    '</div>' +
                '</div>'
            );

            // Apply user avatar
            Avatar.get(sender_xid, 'cache', 'true', 'forget');

            // Apply button events
            if(typeof map[type].buttons === 'object') {
                $.each(map[type].buttons, function(button, attrs) {
                    call_tools_all_sel.find('a.reply-button[data-action="' + button + '"]').click(function() {
                        try {
                            // Remove notification
                            self._unnotify();

                            // Execute callback, if any
                            if(typeof attrs.cb === 'function') {
                                attrs.cb(xid, mode, options_arr);
                            }

                            Console.info('Closed call notification drawer');
                        } catch(e) {
                            Console.error('Call.notify[async]', e);
                        } finally {
                            return false;
                        }
                    });
                });
            }

            // Enable notification box!
            call_tool_sel.addClass('active');

            // Open notification box!
            call_content_sel.show();
        } catch(e) {
            Console.error('Call.notify', e);
        } finally {
            return false;
        }

    };


    /**
     * Remove notification
     * @private
     * @return {boolean}
     */
    self._unnotify = function() {

        try {
            // Selectors
            var call_tools_all_sel = $('#top-content .tools-all:has(.tools.call)');
            var call_tool_sel = call_tools_all_sel.find('.tools.call');
            var call_content_sel = call_tools_all_sel.find('.call-content');
            var call_subitem_sel = call_content_sel.find('.tools-content-subitem');

            // Close & disable notification box
            call_content_sel.hide();
            call_subitem_sel.empty();
            call_tool_sel.removeClass('active');

            // Stop all sounds
            Audio.stop('incoming-call');
            Audio.stop('outgoing-call');
        } catch(e) {
            Console.error('Call._unnotify', e);
        } finally {
            return false;
        }

    };


    /**
     * Processes the video elements size
     * @private
     * @param {object} screen
     * @param {object} video
     * @return {object}
     */
    self._process_size = function(screen, video) {

        try {
            if(!(typeof screen === 'object' && typeof video === 'object')) {
                throw 'Invalid object passed, aborting!';
            }

            // Get the intrinsic size of the video
            var video_w = video[0].videoWidth  || video.width();
            var video_h = video[0].videoHeight || video.height();

            // Get the screen size of the video
            var screen_w = screen.width();
            var screen_h = screen.height();

            // Process resize ratios (2 cases)
            var r_1 = screen_h / video_h;
            var r_2 = screen_w / video_w;

            // Process resized video sizes
            var video_w_1 = video_w * r_1;
            var video_h_1 = video_h * r_1;

            var video_w_2 = video_w * r_2;
            var video_h_2 = video_h * r_2;

            // DOM view modifiers
            var dom_width  = 'auto';
            var dom_height = 'auto';
            var dom_left   = 0;
            var dom_top    = 0;

            // Landscape/Portrait/Equal container?
            if(video_w > video_h || (video_h == video_w && screen_w < screen_h)) {
                // Not sufficient?
                if(video_w_1 < screen_w) {
                    dom_width = screen_w + 'px';
                    dom_top   = -1 * (video_h_2 - screen_h) / 2;
                } else {
                    dom_height = screen_h + 'px';
                    dom_left   = -1 * (video_w_1 - screen_w) / 2;
                }
            } else if(video_h > video_w || (video_h == video_w && screen_w > screen_h)) {
                // Not sufficient?
                if(video_h_1 < screen_h) {
                    dom_height = screen_h + 'px';
                    dom_left   = -1 * (video_w_1 - screen_w) / 2;
                } else {
                    dom_width = screen_w + 'px';
                    dom_top   = -1 * (video_h_2 - screen_h) / 2;
                }
            } else if(screen_w == screen_h) {
                dom_width  = screen_w + 'px';
                dom_height = screen_h + 'px';
            }

            return {
                width  : dom_width,
                height : dom_height,
                left   : dom_left,
                top    : dom_top
            };
        } catch(e) {
            Console.error('Call._process_size', e);
        }

    };


    /**
     * Adapts the local video view
     * @public
     * @param {object} local_sel
     * @return {undefined}
     */
    self.adapt_local = function(local_sel) {

        try {
            var local_video_sel = local_sel.find('video');

            // Process new sizes
            var sizes = Call._process_size(
                local_sel,
                local_video_sel
            );

            // Apply new sizes
            local_video_sel.css({
                'height': sizes.height,
                'width': sizes.width,
                'margin-top': sizes.top,
                'margin-left': sizes.left
            });
        } catch(e) {
            Console.error('Call.adapt_local', e);
        }

    };


    /**
     * Adapts the remote video view
     * @public
     * @param {object} videobox_sel
     * @return {undefined}
     */
    self.adapt_remote = function(videobox_sel) {

        try {
            var remote_video_sel, sizes;

            videobox_sel.find('.remote_video').each(function() {
                remote_video_sel = $(this).find('video');

                if(remote_video_sel.size()) {
                    // Process new sizes
                    sizes = Call._process_size(
                        $(this),
                        remote_video_sel
                    );

                    // Apply new sizes
                    remote_video_sel.css({
                        'height': sizes.height,
                        'width': sizes.width,
                        'margin-top': sizes.top,
                        'margin-left': sizes.left
                    });
                }
            });
        } catch(e) {
            Console.error('Call.adapt_remote', e);
        }

    };


    /**
     * Start call elpsed time counter
     * @public
     * @return {boolean}
     */
    self.start_counter = function() {

        try {
            // Initialize counter
            self.stop_counter();
            self._start_stamp = DateUtils.getTimeStamp();
            self._fire_clock();

            // Fire it every second
            $('#top-content .tools.call .counter').everyTime('1s', self._fire_clock);

            Console.info('Call counter started');
        } catch(e) {
            Console.error('Call.start_counter', e);
        } finally {
            return false;
        }

    };


    /**
     * Stop call elpsed time counter
     * @public
     * @return {boolean}
     */
    self.stop_counter = function() {

        try {
            // Reset stamp storage
            self._start_stamp = 0;

            // Reset counter
            var counter_sel = $('#top-content .tools.call .counter');
            var default_count = counter_sel.attr('data-default');

            counter_sel.stopTime();

            $('#top-content .tools.call .counter').text(default_count);
            $('#jingle, #muji').find('.elapsed').text(default_count);

            Console.info('Call counter stopped');
        } catch(e) {
            Console.error('Call.stop_counter', e);
        } finally {
            return false;
        }

    };


    /**
     * Fires the counter clock (once more)
     * @private
     * @return {undefined}
     */
    self._fire_clock = function() {

        try {
            // Process updated time
            var count = DateUtils.difference(
                DateUtils.getTimeStamp(),
                self._start_stamp
            );

            if(count.getHours()) {
                count = count.toString('H:mm:ss');
            } else {
                count = count.toString('mm:ss');
            }

            // Display updated counter
            $('#top-content .tools.call .counter').text(count);
            $('#jingle, #muji').find('.elapsed').text(count);
        } catch(e) {
            Console.error('Call._fire_clock', e);
        }

    };


    /**
     * Destroy the call interface
     * @public
     * @return {undefined}
     */
    self.destroy_interface = function(container_sel) {

        try {
            container_sel.stopTime();
            container_sel.find('*').stopTime();

            container_sel.remove();
        } catch(e) {
            Console.error('Call.destroy_interface', e);
        }

    };


    /**
     * Show the call interface
     * @public
     * @param {object} manager
     * @param {object} call_sel
     * @param {object} video_container_sel
     * @return {boolean}
     */
    self.show_interface = function(manager, call_sel, video_container_sel) {

        try {
            if(manager.in_call()) {
                call_sel.filter(':hidden').show();

                // Launch back some events
                video_container_sel.mousemove();
            }
        } catch(e) {
            Console.error('Call.show_interface', e);
        } finally {
            return false;
        }

    };


    /**
     * Hide the call interface
     * @public
     * @param {object} call_sel
     * @param {object} video_container_sel
     * @return {boolean}
     */
    self.hide_interface = function(call_sel, video_container_sel) {

        try {
            call_sel.filter(':visible').hide();

            // Reset some events
            video_container_sel.find('.topbar').stopTime().hide();
        } catch(e) {
            Console.error('Call.hide_interface', e);
        } finally {
            return false;
        }

    };


    /**
     * Attaches interface events
     * @public
     * @param {object} manager
     * @param {object} call_sel
     * @param {object} video_container_sel
     * @return {undefined}
     */
    self.events_interface = function(manager, call_sel, video_container_sel) {

        try {
            call_sel.everyTime(50, function() {
                manager._adapt();
            });

            // Close interface on click on semi-transparent background
            call_sel.click(function(evt) {
                try {
                    // Click on lock background?
                    if($(evt.target).is('.lock')) {
                        return manager._hide_interface();
                    }
                } catch(e) {
                    Console.error('Call.events_interface[async]', e);
                }
            });

            // Click on a control or action button
            call_sel.find('.topbar').find('.controls a, .actions a').click(function() {
                try {
                    switch($(this).data('type')) {
                        case 'close':
                            manager._hide_interface(); break;
                        case 'stop':
                        case 'leave':
                            manager.stop(); break;
                        case 'mute':
                            manager.mute(); break;
                        case 'unmute':
                            manager.unmute(); break;
                    }
                } catch(e) {
                    Console.error('Call.events_interface[async]', e);
                } finally {
                    return false;
                }
            });

            // Auto Hide/Show interface topbar
            video_container_sel.mousemove(function() {
                try {
                    var topbar_sel = $(this).find('.topbar');

                    if(topbar_sel.is(':hidden')) {
                        topbar_sel.stop(true).fadeIn(250);
                    }

                    topbar_sel.stopTime();
                    topbar_sel.oneTime('5s', function() {
                        topbar_sel.stop(true).fadeOut(250);
                    });
                } catch(e) {
                    Console.error('Call.events_interface[async]', e);
                }
            });
        } catch(e) {
            Console.error('Call.events_interface', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
