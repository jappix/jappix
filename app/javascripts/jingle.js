/*

Jappix - An open social platform
These are the Jingle helpers & launchers

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Jingle = (function() {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self._jingle_current = null;
    self._start_stamp = 0;
    self._call_ender = null;
    self._bypass_termination_notify = false;


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
                Console.error('Jingle._consoleAdapter.log', e);
            }

        };


        /**
         * Return sub-class scope
         */
        return _console;

    })();


    /**
     * Opens the Jingle interface (depending on the state)
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            var jingle_tool_sel = $('#top-content .tools.jingle');

            if(jingle_tool_sel.is('.active')) {
                Console.info('Opened Jingle notification drawer');
            } else if(jingle_tool_sel.is('.streaming.video')) {
                // Videobox?
                self.showInterface();

                Console.info('Opened Jingle videobox');
            } else {
                Console.warn('Could not open any Jingle tool (race condition on state)');
            }
        } catch(e) {
            Console.error('Jingle.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Returns the Jingle session arguments (used to configure it)
     * @private
     * @param connection
     * @param xid
     * @param hash
     * @param local_view
     * @param remote_view
     * @return {object}
     */
    self._args = function(connection, xid, hash, media, local_view, remote_view) {

        args = {};

        try {
            // Network configuration
            var stun = {};
            var turn = {};

            if(HOST_STUN) {
                stun[HOST_STUN] = {};
            }

            if(HOST_TURN) {
                turn[HOST_TURN] = {
                    'username': HOST_TURN_USERNAME,
                    'credential': HOST_TURN_PASSWORD
                };
            }

            // Jingle arguments
            args = {
                // Configuration (required)
                connection: connection,
                to: xid,
                media: media,
                local_view: local_view,
                remote_view: remote_view,
                stun: stun,
                turn: turn,
                //resolution: 'hd', -> this can cause some lags
                debug: self._consoleAdapter,

                // Custom handlers (optional)
                session_initiate_pending: function(jingle) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'initiating',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_initiate_pending');
                },

                session_initiate_success: function(jingle, stanza) {
                    // Already in a call?
                    if(self.in_call() && !self.is_same_sid(jingle)) {
                        jingle.terminate(JSJAC_JINGLE_REASON_BUSY);

                        Console.warn('session_initiate_success', 'Dropped incoming call (already in a call)');
                    } else {
                        // Incoming call?
                        if(jingle.is_responder()) {
                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                ('call_' + jingle.get_media()),
                                jingle.get_media()
                            );

                            // Play ringtone
                            // Hard-fix: avoids the JSJaC packets group timer (that will delay success reply)
                            setTimeout(function() {
                                Audio.play('incoming-call', true);
                                jingle.info(JSJAC_JINGLE_SESSION_INFO_RINGING);
                            }, 250);
                        } else {
                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                'waiting',
                                jingle.get_media()
                            );

                            // Play wait ringtone
                            Audio.play('outgoing-call', true);
                        }
                    }
                    
                    Console.log('Jingle._args', 'session_initiate_success');
                },

                session_initiate_error: function(jingle, stanza) {
                    self._reset();

                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'error',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_initiate_error');
                },

                session_initiate_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_initiate_request');
                },

                session_accept_pending: function(jingle) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'waiting',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_accept_pending');
                },

                session_accept_success: function(jingle, stanza) {
                    self.unnotify();

                    // Start call! Go Go Go!
                    self._startSession(jingle.get_media());
                    self.showInterface();
                    self._startCounter();

                    Console.log('Jingle._args', 'session_accept_success');
                },

                session_accept_error: function(jingle, stanza) {
                    self._reset();

                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'declined',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_accept_error');
                },

                session_accept_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_accept_request');
                },

                session_info_success: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_success');
                },

                session_info_error: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_error');
                },

                session_info_request: function(jingle, stanza) {
                    var info_name = jingle.util_stanza_session_info(stanza);

                    switch(info_name) {
                        // Ringing?
                        case JSJAC_JINGLE_SESSION_INFO_RINGING:
                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                'ringing',
                                jingle.get_media()
                            );
                            break;
                    }

                    Console.log('Jingle._args', 'session_info_request');
                },

                session_terminate_pending: function(jingle) {
                    self._reset();

                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'ending',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_terminate_pending');
                },

                session_terminate_success: function(jingle, stanza) {
                    // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        if(self._bypass_termination_notify !== true) {
                            self._reset();

                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                (self._call_ender === 'remote' ? 'remote_ended' : 'local_ended'),
                                jingle.get_media()
                            );
                        }

                        Console.debug('Stopped current Jingle call');
                    } else {
                        Console.warn('session_terminate_success', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_success');
                },

                session_terminate_error: function(jingle, stanza) {
                     // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        if(self._bypass_termination_notify !== true) {
                            self._reset();

                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                'error',
                                jingle.get_media()
                            );
                        }

                        Console.warn('Stopped current Jingle call, but with brute force!');
                    } else {
                        Console.warn('session_terminate_error', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_error');
                },

                session_terminate_request: function(jingle, stanza) {
                    var notify_type;
                    var reason = jingle.util_stanza_terminate_reason(stanza);

                    // The remote wants to end call
                    self._call_ender = 'remote';

                    // Notify depending on the termination reason
                    switch(reason) {
                        case JSJAC_JINGLE_REASON_CANCEL:
                            notify_type = 'remote_canceled'; break;
                        case JSJAC_JINGLE_REASON_BUSY:
                            notify_type = 'busy'; break;
                        case JSJAC_JINGLE_REASON_DECLINE:
                            notify_type = 'declined'; break;
                        default:
                            notify_type = 'ending'; break;
                    }

                    self._reset();

                    // Anything to notify?
                    if(notify_type !== undefined) {
                        if(notify_type !== 'ending') {
                            self._bypass_termination_notify = true;
                        }

                        self.notify(
                            Common.bareXID(jingle.get_to()),
                            notify_type,
                            jingle.get_media()
                        );
                    }

                    Console.log('Jingle._args', 'session_terminate_request');
                }
            };
        } catch(e) {
            Console.error('Jingle._args', e);
        } finally {
            return args;
        }

    };


    /**
     * Launch a new Jingle session with given buddy
     * @private
     * @param xid
     * @param mode
     * @param is_callee
     * @param stanza
     * @return {boolean}
     */
    self._new = function(xid, mode, is_callee, stanza) {

        var status = false;

        try {
            if(!xid) {
                throw 'No XID to be called given!';
            }

            var bare_xid    = Common.bareXID(xid);
            var full_xid    = xid;
            var bare_hash   = hex_md5(bare_xid);

            // Caller mode?
            if(!is_callee && !Common.isFullXID(full_xid)) {
                var jingle_ns = (mode == 'audio') ? NS_JINGLE_APPS_RTP_AUDIO : NS_JINGLE_APPS_RTP_VIDEO;
                full_xid = Caps.getFeatureResource(bare_xid, jingle_ns);

                if(!full_xid) {
                    throw 'Could not get user full XID to be called!';
                }
            }

            // Create interface for video containers
            $('body').addClass('in_jingle_call');
            var jingle_sel = self.createInterface(bare_xid, mode);

            // Filter media
            var media = null;

            switch(mode) {
                case 'audio':
                    media = JSJAC_JINGLE_MEDIA_AUDIO; break;
                case 'video':
                    media = JSJAC_JINGLE_MEDIA_VIDEO; break;
            }

            // Start the Jingle negotiation
            var args = self._args(
                                   con,
                                   full_xid,
                                   bare_hash,
                                   media,
                                   jingle_sel.find('.local_video video')[0],
                                   jingle_sel.find('.remote_video video')[0]
                                 );

            self._jingle_current = new JSJaCJingle(args);
            self._call_ender = null;
            self._bypass_termination_notify = false;

            if(is_callee) {
                self._jingle_current.handle(stanza);

                Console.debug('Receive call form: ' + full_xid);
            } else {
                self._jingle_current.initiate();

                Console.debug('Emit call to: ' + full_xid);
            }

            status = true;
        } catch(e) {
            Console.error('Jingle._new', e);
        } finally {
            return status;
        }

    };


    /**
     * Processes the Jingle elements size
     * @private
     * @param {object} screen
     * @param {object} video
     * @return {object}
     */
    self._processSize = function(screen, video) {

        try {
            if(!(typeof screen === 'object' && typeof video === 'object')) {
                throw 'Invalid object passed, aborting!';
            }

            // Get the intrinsic size of the video
            var video_w = video.videoWidth;
            var video_h = video.videoHeight;

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
            Console.error('Jingle._processSize', e);
        }

    };


    /**
     * Adapts the local Jingle view
     * @private
     * @return {undefined}
     */
    self._adaptLocal = function() {

        try {
            var local_sel = $('#jingle .local_video');
            var local_video_sel = local_sel.find('video');

            // Process new sizes
            var sizes = self._processSize(
                local_sel,
                local_video_sel[0]
            );

            // Apply new sizes
            local_video_sel.css({
                'height': sizes.height,
                'width': sizes.width,
                'margin-top': sizes.top,
                'margin-left': sizes.left
            });
        } catch(e) {
            Console.error('Jingle._adaptLocal', e);
        }

    };


    /**
     * Adapts the remote Jingle view
     * @private
     * @return {undefined}
     */
    self._adaptRemote = function() {

        try {
            var videobox_sel = $('#jingle .videobox');
            var remote_sel = videobox_sel.find('.remote_video');
            var remote_video_sel = remote_sel.find('video');

            // Process new sizes
            var sizes = self._processSize(
                remote_sel,
                remote_video_sel[0]
            );

            // Apply new sizes
            remote_video_sel.css({
                'height': sizes.height,
                'width': sizes.width,
                'margin-top': sizes.top,
                'margin-left': sizes.left
            });
        } catch(e) {
            Console.error('Jingle._adaptRemote', e);
        }

    };


    /**
     * Adapts the Jingle view to the window size
     * @private
     * @return {undefined}
     */
    self._adapt = function() {

        try {
            if(self.in_call() && Common.exists('#jingle')) {
                self._adaptLocal();
                self._adaptRemote();
            }
        } catch(e) {
            Console.error('Jingle._adapt', e);
        }

    };


    /**
     * Initializes Jingle router
     * @public
     * @return {undefined}
     */
    self.init = function() {

        try {
            JSJaCJingle_listen({
                connection: con,
                debug: self._consoleAdapter,
                // TODO: seems like it fucks up the calls!
                //fallback: './server/jingle.php',
                
                initiate: function(stanza) {
                    try {
                        // Already in a call?
                        if(self.in_call()) {
                            // Try to restore SID there
                            var stanza_id = stanza.getID();
                            var sid = null;

                            if(stanza_id) {
                                var stanza_id_split = stanza_id.split('_');
                                sid = stanza_id_split[1];
                            }

                            // Build a temporary Jingle session
                            var jingle_close = new JSJaCJingle({
                                to: stanza.getFrom(),
                                debug: JSJAC_JINGLE_STORE_DEBUG
                            });

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
                        self.receive(xid, stanza);
                    } catch(e) {
                        Console.error('Jingle.init[initiate]', e);
                    }
                }
            });
        } catch(e) {
            Console.error('Jingle.init', e);
        }

    };


    /**
     * Receive a Jingle call
     * @public
     * @param {string} xid
     * @param {object} stanza
     * @return {boolean}
     */
    self.receive = function(xid, stanza) {

        try {
            if(!self.in_call()) {
                self._new(xid, null, true, stanza);
            }
        } catch(e) {
            Console.error('Jingle.receive', e);
        } finally {
            return false;
        }

    };


    /**
     * Start a Jingle call
     * @public
     * @param {string} xid
     * @param {string} mode
     * @return {boolean}
     */
    self.start = function(xid, mode) {

        try {
            if(!self.in_call()) {
                self._new(xid, mode);
            }
        } catch(e) {
            Console.error('Jingle.start', e);
        } finally {
            return false;
        }

    };


     /**
     * Reset current Jingle call
     * @public
     * @return {boolean}
     */
    self._reset = function() {

        try {
            // Trash interface
            self._stopCounter();
            self._stopSession();
            self.destroyInterface();
            $('body').removeClass('in_jingle_call');

            // Hack: stop audio in case it is still ringing
            Audio.stop('incoming-call');
            Audio.stop('outgoing-call');
        } catch(e) {
            Console.error('Jingle._reset', e);
        } finally {
            return false;
        }

    };


    /**
     * Stops current Jingle call
     * @public
     * @return {boolean}
     */
    self.stop = function() {

        try {
            // Reset interface
            self._reset();

            // Stop Jingle session
            if(self._jingle_current !== null) {
                self._call_ender = 'local';
                self._jingle_current.terminate();

                Console.debug('Stopping current Jingle call...');
            } else {
                Console.warn('No Jingle call to be terminated!');
            }
        } catch(e) {
            Console.error('Jingle.stop', e);
        } finally {
            return false;
        }

    };


    /**
     * Mutes current Jingle call
     * @public
     * @return {undefined}
     */
    self.mute = function() {

        try {
            if(self._jingle_current) {
                var jingle_controls = $('#jingle .videobox .topbar .controls a');

                // Toggle interface buttons
                jingle_controls.filter('.mute').hide();
                jingle_controls.filter('.unmute').show();

                // Actually mute audio stream
                if(self._jingle_current.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) === false) {
                    self._jingle_current.mute(JSJAC_JINGLE_MEDIA_AUDIO);
                }
            }
        } catch(e) {
            Console.error('Jingle.mute', e);
        }

    };


    /**
     * Unmutes current Jingle call
     * @public
     * @return {undefined}
     */
    self.unmute = function() {

        try {
            if(self._jingle_current) {
                var jingle_controls = $('#jingle .videobox .topbar .controls a');

                jingle_controls.filter('.unmute').hide();
                jingle_controls.filter('.mute').show();

                if(self._jingle_current.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) === true) {
                    self._jingle_current.unmute(JSJAC_JINGLE_MEDIA_AUDIO);
                }
            }
        } catch(e) {
            Console.error('Jingle.mute', e);
        }

    };


    /**
     * Checks whether user is in call or not
     * @public
     * @return {boolean}
     */
    self.in_call = function() {

        in_call = false;

        try {
            if(self._jingle_current && 
              (self._jingle_current.get_status() === JSJAC_JINGLE_STATUS_INITIATING  || 
               self._jingle_current.get_status() === JSJAC_JINGLE_STATUS_INITIATED   || 
               self._jingle_current.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING   || 
               self._jingle_current.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED    ||
               self._jingle_current.get_status() === JSJAC_JINGLE_STATUS_TERMINATING)) {
                in_call = true;
            }
        } catch(e) {
            Console.error('Jingle.in_call', e);
        } finally {
            return in_call;
        }

    };


    /**
     * Checks if the given call SID is the same as the current call's one
     * @public
     * @param {object}
     * @return {boolean}
     */
    self.is_same_sid = function(jingle) {

        is_same = false;

        try {
            if(jingle && self._jingle_current  && 
               jingle.get_sid() === self._jingle_current.get_sid()) {
                is_same = true;
            }
        } catch(e) {
            Console.error('Jingle.is_same_sid', e);
        } finally {
            return is_same;
        }

    };


    /**
     * Returns if current Jingle call is audio
     * @public
     * @return {boolean}
     */
    self.is_audio = function() {

        audio = false;

        try {
            if(self._jingle_current && self._jingle_current.get_media() === JSJAC_JINGLE_MEDIA_AUDIO) {
                audio = true;
            }
        } catch(e) {
            Console.error('Jingle.is_audio', e);
        } finally {
            return audio;
        }

    };


    /**
     * Returns if current Jingle call is video
     * @public
     * @return {boolean}
     */
    self.is_video = function() {

        video = false;

        try {
            if(self._jingle_current && self._jingle_current.get_media() === JSJAC_JINGLE_MEDIA_VIDEO) {
                video = true;
            }
        } catch(e) {
            Console.error('Jingle.is_video', e);
        } finally {
            return video;
        }

    };


    /**
     * Get the notification map
     * @private
     * @return {object}
     */
    self._notify_map = function() {

        try {
            return {
                'call_audio': {
                    'text': Common._e("Is calling you"),

                    'buttons': {
                        'accept': {
                            'text': Common._e("Accept"),
                            'color': 'green',
                            'cb': function(xid, mode) {
                                self._jingle_current.accept();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_DECLINE);
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'call_video': {
                    'text': Common._e("Is calling you"),

                    'buttons': {
                        'accept': {
                            'text': Common._e("Accept"),
                            'color': 'green',
                            'cb': function(xid, mode) {
                                self._jingle_current.accept();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_DECLINE);
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'initiating': {
                    'text': Common._e("Initiating call"),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                            }
                        }
                    }
                },

                'waiting': {
                    'text': Common._e("Waiting..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                            }
                        }
                    }
                },

                'ringing': {
                    'text': Common._e("Ringing..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                            }
                        }
                    }
                },

                'declined': {
                    'text': Common._e("Declined the call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'busy': {
                    'text': Common._e("Is already in a call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'connecting': {
                    'text': Common._e("Connecting to call..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                            }
                        }
                    }
                },

                'error': {
                    'text': Common._e("Call error"),

                    'buttons': {
                        'retry': {
                            'text': Common._e("Retry"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self.start(xid, mode);
                            }
                        },

                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'ending': {
                    'text': Common._e("Ending call...")
                },

                'local_ended': {
                    'text': Common._e("Call ended"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'remote_ended': {
                    'text': Common._e("Ended the call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'local_canceled': {
                    'text': Common._e("Call canceled"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                },

                'remote_canceled': {
                    'text': Common._e("Canceled the call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue',
                            'cb': function(xid, mode) {
                                self._reset();
                            }
                        }
                    }
                }
            };
        } catch(e) {
            Console.error('Jingle._notify_map', e);

            return {};
        }

    };


    /**
     * Notify for something related to Jingle
     * @public
     * @param {string} xid
     * @param {string} type
     * @param {string} mode
     * @return {boolean}
     */
    self.notify = function(xid, type, mode) {

        try {
            var map = self._notify_map();

            if(!(type in map)) {
                throw 'Notification type not recognized!';
            }

            var jingle_tools_all_sel = $('#top-content .tools-all:has(.tools.jingle)');
            var jingle_tool_sel = jingle_tools_all_sel.find('.tools.jingle');
            var jingle_content_sel = jingle_tools_all_sel.find('.jingle-content');
            var jingle_subitem_sel = jingle_content_sel.find('.tools-content-subitem');

            var buttons_html = '';
            var i = 0;

            if(typeof map[type].buttons === 'object') {
                $.each(map[type].buttons, function(button, attrs) {
                    buttons_html += '<a class="reply-button ' + button + ' ' + attrs.color + ' ' + (!(i++) ? 'first' : '') + '" data-action="' + button + '">' + attrs.text + '</a>';
                });
            }

            // Append notification to DOM
            jingle_subitem_sel.html(
                '<div class="jingle-notify notify-' + type + ' ' + hex_md5(xid) + '" data-type="' + type + '" data-xid="' + Common.encodeQuotes(xid) + '">' + 
                    '<div class="avatar-pane">' + 
                        '<div class="avatar-container">' + 
                            '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' + 
                        '</div>' + 

                        '<span class="icon jingle-images"></span>' + 
                    '</div>' + 

                    '<div class="notification-content">' + 
                        '<span class="fullname">' + Name.getBuddy(xid).htmlEnc() + '</span>' + 
                        '<span class="text">' + map[type].text + '</span>' + 

                        '<div class="reply-buttons">' + buttons_html + '</div>' + 
                    '</div>' + 
                '</div>'
            );

            // Apply user avatar
            Avatar.get(xid, 'cache', 'true', 'forget');

            // Apply button events
            if(typeof map[type].buttons === 'object') {
                $.each(map[type].buttons, function(button, attrs) {
                    jingle_tools_all_sel.find('a.reply-button[data-action="' + button + '"]').click(function() {
                        try {
                            // Remove notification
                            self.unnotify(xid);

                            // Execute callback, if any
                            if(typeof attrs.cb === 'function') {
                                attrs.cb(xid, mode);
                            }

                            Console.info('Closed Jingle notification drawer');
                        } catch(e) {
                            Console.error('Jingle.notify[async]', e);
                        } finally {
                            return false;
                        }
                    });
                });
            }

            // Enable notification box!
            jingle_tool_sel.addClass('active');

            // Open notification box!
            jingle_content_sel.show();
        } catch(e) {
            Console.error('Jingle.notify', e);
        } finally {
            return false;
        }

    };


    /**
     * Remove notification
     * @public
     * @return {boolean}
     */
    self.unnotify = function() {

        try {
            // Selectors
            var jingle_tools_all_sel = $('#top-content .tools-all:has(.tools.jingle)');
            var jingle_tool_sel = jingle_tools_all_sel.find('.tools.jingle');
            var jingle_content_sel = jingle_tools_all_sel.find('.jingle-content');
            var jingle_subitem_sel = jingle_content_sel.find('.tools-content-subitem');

            // Close & disable notification box
            jingle_content_sel.hide();
            jingle_subitem_sel.empty();
            jingle_tool_sel.removeClass('active');

            // Stop all sounds
            Audio.stop('incoming-call');
            Audio.stop('outgoing-call');
        } catch(e) {
            Console.error('Jingle.unnotify', e);
        } finally {
            return false;
        }

    };


    /**
     * Set the Jingle session as started
     * @private
     * @param {string} mode
     * @return {boolean}
     */
    self._startSession = function(mode) {

        try {
            if(!(mode in JSJAC_JINGLE_MEDIAS)) {
                throw 'Unknown mode: ' + (mode || 'none');
            }

            var jingle_tool_sel = $('#top-content .tools.jingle');

            jingle_tool_sel.removeClass('audio video active');
            jingle_tool_sel.addClass('streaming').addClass(mode);

            Console.info('Jingle session successfully started, mode: ' + (mode || 'none'));
        } catch(e) {
            Console.error('Jingle._startSession', e);
        } finally {
            return false;
        }

    };


    /**
     * Set the Jingle session as stopped
     * @private
     * @param {string} mode
     * @return {boolean}
     */
    self._stopSession = function() {

        try {
            $('#top-content .tools.jingle').removeClass('audio video active streaming');

            Console.info('Jingle session successfully stopped');
        } catch(e) {
            Console.error('Jingle._stopSession', e);
        } finally {
            return false;
        }

    };


    /**
     * Start call elpsed time counter
     * @private
     * @return {boolean}
     */
    self._startCounter = function() {

        try {
            // Initialize counter
            self._stopCounter();
            self._start_stamp = DateUtils.getTimeStamp();
            self._fireClock();
            
            // Fire it every second
            $('#top-content .tools.jingle .counter').everyTime('1s', self._fireClock);

            Console.info('Jingle counter started');
        } catch(e) {
            Console.error('Jingle._startCounter', e);
        } finally {
            return false;
        }

    };


    /**
     * Stop call elpsed time counter
     * @private
     * @return {boolean}
     */
    self._stopCounter = function() {

        try {
            // Reset stamp storage
            self._start_stamp = 0;

            // Reset counter
            var counter_sel = $('#top-content .tools.jingle .counter');
            var default_count = counter_sel.attr('data-default');
            
            counter_sel.stopTime();
            $('#top-content .tools.jingle .counter, #jingle .videobox .topbar .elapsed').text(default_count);

            Console.info('Jingle counter stopped');
        } catch(e) {
            Console.error('Jingle._stopCounter', e);
        } finally {
            return false;
        }

    };


    /**
     * Fires the counter clock (once more)
     * @private
     * @return {undefined}
     */
    self._fireClock = function() {

        try {
            // Process updated time
            var count = DateUtils.difference(DateUtils.getTimeStamp(), self._start_stamp);
            
            if(count.getHours()) {
                count = count.toString('H:mm:ss');
            } else {
                count = count.toString('mm:ss');
            }
            
            // Display updated counter
            $('#top-content .tools.jingle .counter, #jingle .videobox .topbar .elapsed').text(count);
        } catch(e) {
            Console.error('Jingle._fireClock', e);
        }

    };


    /**
     * Create the Jingle interface
     * @public
     * @return {object}
     */
    self.createInterface = function(xid, mode) {

        try {
            // Jingle interface already exists?
            if(Common.exists('#jingle')) {
                throw 'Jingle interface already exist!';
            }

            // Create DOM
            $('body').append(
                '<div id="jingle" class="lock removable ' + hex_md5(xid) + '" data-xid="' + Common.encodeQuotes(xid) + '" data-mode="' + Common.encodeQuotes(mode) + '">' + 
                    '<div class="videobox">' + 
                        '<div class="topbar">' + 
                            '<div class="card">' + 
                                '<div class="avatar-container">' + 
                                    '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' + 
                                '</div>' + 

                                '<div class="identity">' + 
                                    '<span class="name">' + Name.getBuddy(xid).htmlEnc() + '</span>' + 
                                    '<span class="xid">' + xid.htmlEnc() + '</span>' + 
                                '</div>' + 
                            '</div>' + 

                            '<div class="controls">' + 
                                '<a href="#" class="stop control-button" data-type="stop"><span class="icon jingle-images"></span>' + Common._e("Stop") + '</a>' + 
                                '<a href="#" class="mute control-button" data-type="mute"><span class="icon jingle-images"></span>' + Common._e("Mute") + '</a>' + 
                                '<a href="#" class="unmute control-button" data-type="unmute"><span class="icon jingle-images"></span>' + Common._e("Unmute") + '</a>' + 
                            '</div>' + 

                            '<div class="elapsed">00:00:00</div>' + 

                            '<div class="actions">' + 
                                '<a href="#" class="close action-button jingle-images" data-type="close"></a>' + 
                            '</div>' + 
                        '</div>' + 

                        '<div class="local_video">' + 
                            '<video src="" alt="" poster="' + './images/placeholders/jingle_video_local.png' + '"></video>' + 
                        '</div>' + 

                        '<div class="remote_video">' + 
                            '<video src="" alt=""></video>' + 
                        '</div>' + 

                        '<div class="branding jingle-images"></div>' + 
                    '</div>' + 
                '</div>'
            );

            // Apply events
            self._eventsInterface();

            // Apply user avatar
            Avatar.get(xid, 'cache', 'true', 'forget');
        } catch(e) {
            Console.error('Jingle.createInterface', e);
        } finally {
            return $('#jingle');
        }

    };


    /**
     * Destroy the Jingle interface
     * @public
     * @return {undefined}
     */
    self.destroyInterface = function() {

        try {
            var jingle_sel = $('#jingle');

            jingle_sel.stopTime();
            jingle_sel.find('*').stopTime();

            jingle_sel.remove();
        } catch(e) {
            Console.error('Jingle.destroyInterface', e);
        }

    };


    /**
     * Show the Jingle interface
     * @public
     * @return {boolean}
     */
    self.showInterface = function() {

        try {
            if(self.in_call() && self.is_video()) {
                $('#jingle:hidden').show();

                // Launch back some events
                $('#jingle .videobox').mousemove();
            }
        } catch(e) {
            Console.error('Jingle.showInterface', e);
        } finally {
            return false;
        }

    };


    /**
     * Hide the Jingle interface
     * @public
     * @return {boolean}
     */
    self.hideInterface = function() {

        try {
            $('#jingle:visible').hide();

            // Reset some events
            $('#jingle .videobox .topbar').stopTime().hide();
        } catch(e) {
            Console.error('Jingle.hideInterface', e);
        } finally {
            return false;
        }

    };


    /**
     * Attaches interface events
     * @private
     * @return {undefined}
     */
    self._eventsInterface = function() {

        try {
            var jingle_sel = $('#jingle');

            jingle_sel.everyTime(50, function() {
                self._adapt();
            });

            // Close interface on click on semi-transparent background
            jingle_sel.click(function(evt) {
                try {
                    // Click on lock background?
                    if($(evt.target).is('.lock')) {
                        return self.hideInterface();
                    }
                } catch(e) {
                    Console.error('Jingle._eventsInterface[async]', e);
                }
            });

            // Click on a control or action button
            jingle_sel.find('.topbar').find('.controls a, .actions a').click(function() {
                try {
                    switch($(this).data('type')) {
                        case 'close':
                            self.hideInterface(); break;
                        case 'stop':
                            self.stop(); break;
                        case 'mute':
                            self.mute(); break;
                        case 'unmute':
                            self.unmute(); break;
                    }
                } catch(e) {
                    Console.error('Jingle._eventsInterface[async]', e);
                } finally {
                    return false;
                }
            });

            // Auto Hide/Show interface topbar
            jingle_sel.find('.videobox').mousemove(function() {
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
                    Console.error('Jingle._eventsInterface[async]', e);
                }
            });
        } catch(e) {
            Console.error('Popup._eventsInterface', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            $(window).resize(self._adapt());
        } catch(e) {
            Console.error('Jingle.launch', e);
        }
    
    };


    /**
     * Return class scope
     */
    return self;

})();

Jingle.launch();