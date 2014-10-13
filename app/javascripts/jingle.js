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
    self._session = null;
    self._call_ender = null;
    self._bypass_termination_notify = false;


    /**
     * Opens the Jingle interface (depending on the state)
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            var call_tool_sel = $('#top-content .tools.call');

            if(call_tool_sel.is('.active')) {
                Console.info('Opened call notification drawer');
            } else if(call_tool_sel.is('.streaming.video')) {
                // Videobox?
                self._show_interface();

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
     * @param [sid]
     * @return {object}
     */
    self._args = function(connection, xid, hash, media, local_view, remote_view, sid) {

        args = {};

        try {
            // Network configuration
            var ice_servers = Call.generate_ice_servers();

            // Jingle arguments
            args = {
                // Configuration (required)
                connection: connection,
                to: xid,
                media: media,
                local_view: local_view,
                remote_view: remote_view,
                stun: ice_servers.stun,
                turn: ice_servers.turn,
                resolution: 'md',
                debug: Call._consoleAdapter,

                // Custom handlers (optional)
                session_initiate_pending: function(jingle) {
                    Call.notify(
                        JSJAC_JINGLE_SESSION_SINGLE,
                        Common.bareXID(jingle.get_to()),
                        'initiating',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_initiate_pending');
                },

                session_initiate_success: function(jingle, stanza) {
                    // Already in a call?
                    if(Call.is_ongoing() && !self.is_same_sid(jingle)) {
                        jingle.terminate(JSJAC_JINGLE_REASON_BUSY);

                        Console.warn('Jingle._args > session_initiate_success', 'Dropped incoming call (already in a call)');
                    } else {
                        // Incoming call?
                        if(jingle.is_responder()) {
                            // Auto-accept (we previously accepted the associated broadcast request)
                            if(Call.call_auto_accept.from == jingle.get_to() && Call.call_auto_accept.sid == jingle.get_sid()) {
                                Call.call_auto_accept.from = null;
                                Call.call_auto_accept.sid  = null;

                                // Delay acceptance (status change is delayed)
                                setTimeout(function() {
                                    jingle.accept();
                                }, 250);
                            } else {
                                Call.notify(
                                    JSJAC_JINGLE_SESSION_SINGLE,
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
                            }
                        } else {
                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
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

                    Call.notify(
                        JSJAC_JINGLE_SESSION_SINGLE,
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
                    Call.notify(
                        JSJAC_JINGLE_SESSION_SINGLE,
                        Common.bareXID(jingle.get_to()),
                        'waiting',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_accept_pending');
                },

                session_accept_success: function(jingle, stanza) {
                    Call._unnotify();

                    // Start call! Go Go Go!
                    Call.start_session(jingle.get_media());
                    self._show_interface();
                    Call.start_counter();

                    Console.log('Jingle._args', 'session_accept_success');
                },

                session_accept_error: function(jingle, stanza) {
                    self._reset();

                    Call.notify(
                        JSJAC_JINGLE_SESSION_SINGLE,
                        Common.bareXID(jingle.get_to()),
                        'declined',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_accept_error');
                },

                session_accept_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_accept_request');
                },

                session_info_pending: function(jingle) {
                    Console.log('Jingle._args', 'session_info_pending');
                },

                session_info_success: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_success');
                },

                session_info_error: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_error');
                },

                session_info_request: function(jingle, stanza) {
                    var info_name = jingle.utils.stanza_session_info(stanza);

                    switch(info_name) {
                        // Ringing?
                        case JSJAC_JINGLE_SESSION_INFO_RINGING:
                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
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

                    Call.notify(
                        JSJAC_JINGLE_SESSION_SINGLE,
                        Common.bareXID(jingle.get_to()),
                        'ending',
                        jingle.get_media()
                    );

                    Console.log('Jingle._args', 'session_terminate_pending');
                },

                session_terminate_success: function(jingle, stanza) {
                    // Ensure we this is the same call session ID (SID)
                    if(self._session.get_sid() == jingle.get_sid()) {
                        if(self._bypass_termination_notify !== true) {
                            self._reset();

                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
                                Common.bareXID(jingle.get_to()),
                                (self._call_ender === 'remote' ? 'remote_ended' : 'local_ended'),
                                jingle.get_media()
                            );
                        }

                        Console.debug('Jingle._args > session_terminate_success', 'Stopped current Jingle call');
                    } else {
                        Console.warn('Jingle._args > session_terminate_success', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_success');
                },

                session_terminate_error: function(jingle, stanza) {
                    if(typeof jingle.parent != 'undefined') {
                        jingle = jingle.parent;
                    }

                    // Ensure we this is the same call session ID (SID)
                    if(self._session.get_sid() == jingle.get_sid()) {
                        if(self._bypass_termination_notify !== true) {
                            self._reset();

                            Call.notify(
                                JSJAC_JINGLE_SESSION_SINGLE,
                                Common.bareXID(jingle.get_to()),
                                'error',
                                jingle.get_media()
                            );
                        }

                        Console.warn('Jingle._args > session_terminate_error', 'Stopped current Jingle call, but with brute force!');
                    } else {
                        Console.warn('Jingle._args > session_terminate_error', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_error');
                },

                session_terminate_request: function(jingle, stanza) {
                    var notify_type;
                    var reason = jingle.utils.stanza_terminate_reason(stanza);

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

                        Call.notify(
                            JSJAC_JINGLE_SESSION_SINGLE,
                            Common.bareXID(jingle.get_to()),
                            notify_type,
                            jingle.get_media()
                        );
                    }

                    Console.log('Jingle._args', 'session_terminate_request');
                }
            };

            if(sid && typeof sid == 'string') {
                args.sid = sid;
            }
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
     * @param [sid]
     * @return {boolean}
     */
    self._new = function(xid, mode, is_callee, stanza, sid) {

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
            var jingle_sel = self._create_interface(bare_xid, mode);

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
                jingle_sel.find('.remote_video video')[0],
                sid
            );

            self._session = new JSJaCJingle.session(JSJAC_JINGLE_SESSION_SINGLE, args);
            self._call_ender = null;
            self._bypass_termination_notify = false;

            if(is_callee) {
                self._session.handle(stanza);

                Console.debug('Receive call form: ' + full_xid);
            } else {
                self._session.initiate();

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
     * Adapts the Jingle view to the window size
     * @private
     * @return {undefined}
     */
    self._adapt = function() {

        try {
            if(self.in_call() && Common.exists('#jingle')) {
                Call.adapt_local(
                    $('#jingle .local_video')
                );

                Call.adapt_remote(
                    $('#jingle .videobox')
                );
            }
        } catch(e) {
            Console.error('Jingle._adapt', e);
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
            if(!Call.is_ongoing()) {
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
            // Remote user supports XEP-0353
            if(Caps.getFeatureResource(xid, NS_JINGLE_MESSAGE)) {
                Jingle.propose(xid, mode);
            } else {
                Jingle.initialize(xid, mode);
            }
        } catch(e) {
            Console.error('Jingle.start', e);
        } finally {
            return false;
        }

    };


    /**
     * Initializes a Jingle call
     * @public
     * @param {string} xid
     * @param {string} mode
     * @return {boolean}
     */
    self.initialize = function(xid, mode) {

        try {
            if(!Call.is_ongoing()) {
                Console.info('Jingle.initialize', 'Initiating call with: ' + xid);

                self._new(xid, mode);
            }
        } catch(e) {
            Console.error('Jingle.initialize', e);
        } finally {
            return false;
        }

    };


    /**
     * Proposes a Jingle call
     * @public
     * @param {string} xid
     * @param {string} mode
     * @return {boolean}
     */
    self.propose = function(xid, mode) {

        try {
            if(!Call.is_ongoing()) {
                Console.info('Jingle.propose', 'Proposing call to: ' + xid);

                var medias = [JSJAC_JINGLE_MEDIA_AUDIO];

                if(mode == 'video') {
                    medias.push(JSJAC_JINGLE_MEDIA_VIDEO);
                }

                var call_id = JSJaCJingleBroadcast.propose(
                    xid, medias,

                    function(id) {
                        // Timeout
                        Call.notify(
                            JSJAC_JINGLE_SESSION_SINGLE,
                            xid,
                            'broadcast_timeout',
                            mode
                        );

                        // Retract
                        JSJaCJingleBroadcast.retract(xid, id);
                    }
                );

                // Send directed presence? (for CAPS, XEP-compliant)
                if(!Common.exists('#roster .buddy[data-xid="' + escape(xid) + '"]')) {
                    Presence.send(xid);
                }

                Call.notify(
                    JSJAC_JINGLE_SESSION_SINGLE,
                    xid,
                    'broadcast_proposing',
                    mode,
                    null,

                    {
                        call_id: call_id
                    }
                );
            }
        } catch(e) {
            Console.error('Jingle.propose', e);
        } finally {
            return false;
        }

    };


    /**
     * Follows up a Jingle call (from broadcast)
     * @public
     * @param {string} xid
     * @param {string} mode
     * @param {string} sid
     * @return {boolean}
     */
    self.follow_up = function(xid, mode, sid) {

        try {
            if(!Call.is_ongoing()) {
                self._new(xid, mode, false, null, sid);
            }
        } catch(e) {
            Console.error('Jingle.follow_up', e);
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
            Call.stop_counter();
            Call.stop_session();
            self._destroy_interface();
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
     * @param {boolean} abort
     * @return {boolean}
     */
    self.stop = function(abort) {

        try {
            // Reset interface
            self._reset();

            // Stop Jingle session
            if(self._session !== null) {
                self._call_ender = 'local';

                if(abort === true) {
                    self._session.abort();
                    self._session.get_session_terminate_error(self._session, null);
                } else {
                    self._session.terminate();
                }

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
            Call.mute(
                self._session,
                $('#jingle .videobox .topbar .controls a')
            );
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
            Call.unmute(
                self._session,
                $('#jingle .videobox .topbar .controls a')
            );
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
            if(self._session &&
              (self._session.get_status() === JSJAC_JINGLE_STATUS_INITIATING  ||
               self._session.get_status() === JSJAC_JINGLE_STATUS_INITIATED   ||
               self._session.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING   ||
               self._session.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED    ||
               self._session.get_status() === JSJAC_JINGLE_STATUS_TERMINATING)) {
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

        try {
            return Call.is_same_sid(self._session, jingle);
        } catch(e) {
            Console.error('Jingle.is_same_sid', e);
        }

    };


    /**
     * Returns if current Jingle call is audio
     * @public
     * @return {boolean}
     */
    self.is_audio = function() {

        try {
            return Call.is_audio(self._session);
        } catch(e) {
            Console.error('Jingle.is_audio', e);
        }

    };


    /**
     * Returns if current Jingle call is video
     * @public
     * @return {boolean}
     */
    self.is_video = function() {

        try {
            return Call.is_video(self._session);
        } catch(e) {
            Console.error('Jingle.is_video', e);
        }

    };


    /**
     * Get the notification map
     * @private
     * @return {object}
     */
    self._notify_map = function() {

        try {
            var broadcast_media_fn = function(xid, mode, attrs) {
                JSJaCJingleBroadcast.accept(
                    attrs.full_xid, attrs.call_id, attrs.medias
                );

                // Send directed presence? (for CAPS, XEP-compliant)
                if(!Common.exists('#roster .buddy[data-xid="' + escape(xid) + '"]')) {
                    Presence.send(attrs.full_xid);
                }

                // Marker to auto-accept call later
                Call.call_auto_accept.from = attrs.full_xid;
                Call.call_auto_accept.sid  = attrs.call_id;

                var medias_arr = [];

                for(var cur_media in attrs.medias) {
                    medias_arr.push(cur_media);
                }

                Audio.stop('incoming-call');

                Call.notify(
                    JSJAC_JINGLE_SESSION_SINGLE,
                    xid,
                    'broadcast_wait',
                    medias_arr
                );

                // Schedule timeout (in case we don't receive the Jingle initialization stanza)
                setTimeout(function() {
                    if(self._session !== null                                &&
                       Call.call_auto_accept.sid == self._session.get_sid()  &&
                       self._session.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
                        // Call received
                        Call.call_auto_accept.from = null;
                        Call.call_auto_accept.sid  = null;
                    } else {
                        // Reset UI (timeout)
                        Call.notify(
                            JSJAC_JINGLE_SESSION_SINGLE,
                            xid,
                            'broadcast_error',
                            medias_arr
                        );
                    }
                }, (JSJAC_JINGLE_BROADCAST_TIMEOUT * 1000));
            };

            return {
                'call_audio': {
                    'text': Common._e("Is calling you"),

                    'buttons': {
                        'accept': {
                            'text': Common._e("Accept"),
                            'color': 'green',
                            'cb': function(xid, mode) {
                                self._session.accept();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._session.terminate(JSJAC_JINGLE_REASON_DECLINE);
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
                                self._session.accept();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._session.terminate(JSJAC_JINGLE_REASON_DECLINE);
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'broadcast_audio': {
                    'text': Common._e("Is calling you"),

                    'buttons': {
                        'accept': {
                            'text': Common._e("Accept"),
                            'color': 'green',
                            'cb': broadcast_media_fn
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode, attrs) {
                                JSJaCJingleBroadcast.reject(
                                    attrs.full_xid, attrs.call_id, attrs.medias
                                );

                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'broadcast_video': {
                    'text': Common._e("Is calling you"),

                    'buttons': {
                        'accept': {
                            'text': Common._e("Accept"),
                            'color': 'green',
                            'cb': broadcast_media_fn
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode, attrs) {
                                JSJaCJingleBroadcast.reject(
                                    attrs.full_xid, attrs.call_id, attrs.medias
                                );

                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'broadcast_wait': {
                    'text': Common._e("Waiting...")
                },

                'broadcast_proposing': {
                    'text': Common._e("Proposing call..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode, attrs) {
                                // Retract from call
                                JSJaCJingleBroadcast.retract(
                                    xid,
                                    attrs.call_id
                                );
                            }
                        }
                    }
                },

                'broadcast_timeout': {
                    'text': Common._e("No answer"),

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

                'broadcast_error': {
                    'text': Common._e("Call error"),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._reset();
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
                                self._session.terminate(JSJAC_JINGLE_REASON_CANCEL);
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
                                self._session.terminate(JSJAC_JINGLE_REASON_CANCEL);
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
                                self._session.terminate(JSJAC_JINGLE_REASON_CANCEL);
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
                                self._session.terminate(JSJAC_JINGLE_REASON_CANCEL);
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
     * Create the Jingle interface
     * @private
     * @param {string} room
     * @param {string} mode
     * @return {object}
     */
    self._create_interface = function(xid, mode) {

        try {
            // Jingle interface already exists?
            if(Common.exists('#jingle')) {
                throw 'Jingle interface already exist!';
            }

            // Create DOM
            $('body').append(
                '<div id="jingle" class="videochat_box lock removable ' + hex_md5(xid) + '" data-xid="' + Common.encodeQuotes(xid) + '" data-mode="' + Common.encodeQuotes(mode) + '">' +
                    '<div class="videobox videochat_items">' +
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
                                '<a href="#" class="stop control-button" data-type="stop"><span class="icon call-images"></span>' + Common._e("Stop") + '</a>' +
                                '<a href="#" class="mute control-button" data-type="mute"><span class="icon call-images"></span>' + Common._e("Mute") + '</a>' +
                                '<a href="#" class="unmute control-button" data-type="unmute"><span class="icon call-images"></span>' + Common._e("Unmute") + '</a>' +
                            '</div>' +

                            '<div class="elapsed">00:00:00</div>' +

                            '<div class="actions">' +
                                '<a href="#" class="close action-button call-images" data-type="close"></a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="local_video">' +
                            '<video src="" alt="" poster="' + './images/placeholders/jingle_video_local.png' + '"></video>' +
                        '</div>' +

                        '<div class="remote_video">' +
                            '<video src="" alt="" poster="' + './images/placeholders/jingle_video_remote.png' + '"></video>' +
                        '</div>' +

                        '<div class="branding call-images"></div>' +
                    '</div>' +
                '</div>'
            );

            // Apply events
            self._events_interface();

            // Apply user avatar
            Avatar.get(xid, 'cache', 'true', 'forget');
        } catch(e) {
            Console.error('Jingle._create_interface', e);
        } finally {
            return $('#jingle');
        }

    };


    /**
     * Destroy the Jingle interface
     * @private
     * @return {undefined}
     */
    self._destroy_interface = function() {

        try {
            Call.destroy_interface(
                $('#jingle')
            );
        } catch(e) {
            Console.error('Jingle._destroy_interface', e);
        }

    };


    /**
     * Show the Jingle interface
     * @private
     * @return {boolean}
     */
    self._show_interface = function() {

        try {
            if(self.is_video()) {
                Call.show_interface(
                    self,
                    $('#jingle'),
                    $('#jingle .videobox')
                );
            }
        } catch(e) {
            Console.error('Jingle._show_interface', e);
        } finally {
            return false;
        }

    };


    /**
     * Hide the Jingle interface
     * @private
     * @return {boolean}
     */
    self._hide_interface = function() {

        try {
            Call.hide_interface(
                $('#jingle'),
                $('#jingle .videobox')
            );
        } catch(e) {
            Console.error('Jingle._hide_interface', e);
        } finally {
            return false;
        }

    };


    /**
     * Attaches interface events
     * @private
     * @return {boolean}
     */
    self._events_interface = function() {

        try {
            // Apply events
            Call.events_interface(
                self,
                $('#jingle'),
                $('#jingle .videobox')
            );
        } catch(e) {
            Console.error('Jingle._events_interface', e);
        } finally {
            return false;
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
