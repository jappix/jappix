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


    /**
     * Opens the Jingle interface (depending on the state)
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            var jingle_tool_sel = $('#top-content .tools.jingle');

            if(jingle_tool_sel.is('.active')) {
                // Show the Jingle bubble
                Bubble.show('.jingle-content');

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
    self._args = function(connection, xid, hash, local_view, remote_view) {

        args = {};

        try {
            var stun = {};
            stun[HOST_STUN] = {};

            args = {
                // Configuration (required)
                connection: connection,
                to: xid,
                local_view: local_view,
                remote_view: remote_view,
                stun: stun,
                debug: Console,

                // Custom handlers (optional)
                session_initiate_pending: function(jingle) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'initiating'
                    );

                    Console.log('Jingle._args', 'session_initiate_pending');
                },

                session_initiate_success: function(jingle, stanza) {
                    // Already in a call?
                    if(self.in_call()) {
                        jingle.terminate(JSJAC_JINGLE_REASON_BUSY);

                        Console.warn('session_initiate_success', 'Dropped incoming call (already in a call)');
                    } else {
                        // Incoming call?
                        if(self.is_responder()) {
                            self.notify(
                                Common.bareXID(jingle.get_to()),
                                'call_video'
                            );
                        } else {
                            self.notify(
                                Common.bareXID(jingle.get_from()),
                                'waiting'
                            );
                        }
                    }
                    
                    Console.log('Jingle._args', 'session_initiate_success');
                },

                session_initiate_error: function(jingle, stanza) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'error'
                    );

                    Console.log('Jingle._args', 'session_initiate_error');
                },

                session_initiate_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_initiate_request');
                },

                session_accept_pending: function(jingle) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'connecting'
                    );

                    Console.log('Jingle._args', 'session_accept_pending');
                },

                session_accept_success: function(jingle, stanza) {
                    var xid  = Common.bareXID(jingle.get_to());
                    var hash = hex_md5(xid);
                    var mode = 'video';

                    self.unnotify();

                    // Notify the other party that it's ringing there?
                    if(jingle.is_responder()) {
                        jingle.info(JSJAC_JINGLE_SESSION_INFO_RINGING);
                    }

                    Console.log('Jingle._args', 'session_accept_success');
                },

                session_accept_error: function(jingle, stanza) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'declined'
                    );

                    Console.log('Jingle._args', 'session_accept_error');
                },

                session_accept_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_accept_request');
                },

                session_info_success: function(jingle, stanza) {
                    // Start counter
                    self._startCounter();

                    // Show interface
                    self.showInterface();

                    Console.log('Jingle._args', 'session_info_success');
                },

                session_info_error: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_error');
                },

                session_info_request: function(jingle, stanza) {
                    Console.log('Jingle._args', 'session_info_request');
                },

                session_terminate_pending: function(jingle) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'local_ended'
                    );

                    Console.log('Jingle._args', 'session_terminate_pending');
                },

                session_terminate_success: function(jingle, stanza) {
                    // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        self.notify(
                            Common.bareXID(jingle.get_to()),
                            'local_ended'
                        );

                        self.destroyInterface();
                    } else {
                        Console.warn('session_terminate_success', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_success');
                },

                session_terminate_error: function(jingle, stanza) {
                     // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        self.notify(
                            Common.bareXID(jingle.get_to()),
                            'error'
                        );

                        self.destroyInterface();
                    } else {
                        Console.warn('session_terminate_error', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('Jingle._args', 'session_terminate_error');
                },

                session_terminate_request: function(jingle, stanza) {
                    self.notify(
                        Common.bareXID(jingle.get_to()),
                        'remote_ended'
                    );

                    self.destroyInterface();

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
                throw 'No XID to be called given!'
            }

            var bare_xid    = Common.bareXID(xid);
            var full_xid    = null;
            var bare_hash   = hex_md5(bare_xid);

            // Caller mode?
            if(!is_callee) {
                full_xid = Presence.highestPriority(xid);

                if(!full_xid) {
                    throw 'Could not get user full XID to be called!'
                }
            }

            // Create interface for video containers
            var jingle_sel = self.createInterface();

            // Start the Jingle negotiation
            var args = self._args(
                                   con,
                                   full_xid,
                                   bare_hash,
                                   jingle_sel.find('.local_video')[0],
                                   jingle_sel.find('.remote_video')[0]
                                 );

            self._jingle_current = new JSJaCJingle(args);

            if(is_callee) {
                Audio.play(3, true);
                self._jingle_current.handle(stanza);
            } else {
                self._jingle_current.initiate();
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
            if(self.in_call() && exists('#jingle')) {
                self._adaptLocal();
                self._adaptRemote();
            }
        } catch(e) {
            Console.error('Jingle._adapt', e);
        }

    };


    /**
     * Initializes Jingle
     * @public
     * @return {undefined}
     */
    self.init = function() {

        try {
            // JSJaCJingle.js custom init configuration
            JSJAC_JINGLE_STORE_CONNECTION = con;
            JSJAC_JINGLE_STORE_DEBUG      = Console;
            JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {
                try {
                    // Already in a call?
                    if(self.in_call()) {
                        (new JSJaCJingle({ to: stanza.getFrom(), debug: JSJAC_JINGLE_STORE_DEBUG })).terminate(JSJAC_JINGLE_REASON_BUSY);

                        Console.warn('session_initiate_success', 'Dropped incoming call because already in a call.');

                        return;
                    }

                    var xid  = Common.fullXID(Common.getStanzaFrom(stanza));

                    Console.info('Incoming call from: ' + xid);

                    // Session values
                    self.start(xid, 'video');
                } catch(e) {
                    Console.error('JSJAC_JINGLE_STORE_INITIATE', e);
                }
            };
        } catch(e) {
            Console.error('Jingle.init', e);
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
     * Stops current Jingle call
     * @public
     * @return {boolean}
     */
    self.stop = function() {

        try {
            if(self._jingle_current) {
                Console.debug('Stopping current Jingle call...');

                self._jingle_current.terminate();
            } else {
                Console.warn('No Jingle call to be stopped!');
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
                if(self._jingle_current.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) === true) {
                    $('#jingle a.mute').removeClass('off').addClass('on');
                    self._jingle_current.unmute(JSJAC_JINGLE_MEDIA_AUDIO);
                } else {
                    $('#jingle a.mute').removeClass('on').addClass('off');
                    self._jingle_current.mute(JSJAC_JINGLE_MEDIA_AUDIO);
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
            in_call = self._jingle_current && true;
        } catch(e) {
            Console.error('Jingle.in_call', e);
        } finally {
            return in_call;
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
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.accept();
                                }

                                Audio.stop(3);
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.terminate(JSJAC_JINGLE_REASON_DECLINE);
                                }

                                Audio.stop(3);
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
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.accept();
                                }

                                Audio.stop(3);
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.terminate(JSJAC_JINGLE_REASON_DECLINE);
                                }

                                Audio.stop(3);
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
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                                }
                            }
                        }
                    }
                },

                'waiting': {
                    'text': Common._e("Waiting for approval"),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                                }
                            }
                        }
                    }
                },

                'declined': {
                    'text': Common._e("Declined the call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue'
                        }
                    }
                },

                'connecting': {
                    'text': Common._e("Connecting to call"),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid) {
                                if(self.in_call()) {
                                    self._jingle_current.terminate(JSJAC_JINGLE_REASON_CANCEL);
                                }
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
                            'cb': function(xid) {
                                alert('retry');
                            }
                        },

                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red'
                        }
                    }
                },

                'local_ended': {
                    'text': Common._e("Call ended"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue'
                        }
                    }
                },

                'remote_ended': {
                    'text': Common._e("Ended the call"),

                    'buttons': {
                        'okay': {
                            'text': Common._e("Okay"),
                            'color': 'blue'
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
     * @return {boolean}
     */
    self.notify = function(xid, type) {

        try {
            var map = self._notify_map();

            if(!(type in map)) {
                throw 'Notification type not recognized!'
            }

            var jingle_tools_all_sel = $('#top-content .tools-all:has(.tools.jingle)');
            var jingle_tool_sel = jingle_tools_all_sel.find('.tools.jingle');
            var jingle_subitem_sel = jingle_tools_all_sel.find('.jingle-content .tools-content-subitem');

            var buttons_html = '';
            var i = 0;

            if(typeof map[type].buttons === 'object') {
                $.each(map[type].buttons, function(button, attrs) {
                    buttons_html += '<a class="reply-button ' + button + ' ' + attrs.color + ' ' + (!i++ ? 'first' : '') + '" data-action="' + button + '">' + attrs.text + '</a>';
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
                                attrs.cb(xid);
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
            var jingle_subitem_sel = jingle_tools_all_sel.find('.jingle-content .tools-content-subitem');

            // Close & disable notification box
            Bubble.close();
            jingle_subitem_sel.empty();
            jingle_tool_sel.removeClass('active');
        } catch(e) {
            Console.error('Jingle.unnotify', e);
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
            // TODO
        } catch(e) {
            Console.error('Jingle._startCounter', e);
        } finally {
            return false;
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
                self.showInterface();
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

                        '<video class="local_video" src="" alt="" poster="' + './images/placeholders/jingle_video_local.png' + '"></video>' + 
                        '<video class="remote_video" src="" alt=""></video>' + 

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
            $('#jingle:hidden').show();

            // Launch back some events
            $('#jingle .videobox').mousemove();
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

            jingle_sel.everyTime(100, function() {
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