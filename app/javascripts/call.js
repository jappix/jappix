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
                                    debug: JSJAC_JINGLE_STORE_DEBUG
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

                // Receive a multiparty (Muji) call
                muji_invite: function(stanza, args) {
                    try {
                        // TODO
                        alert('RECEIVED MUJI INVITE');

                        // Session values
                        Muji.receive(xid, stanza);
                    } catch(e) {
                        Console.error('Call.init[muji_invite]', e);
                    }
                }
            });
        } catch(e) {
            Console.error('Call.init', e);
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
            is_ongoing = (Jingle.is_ongoing() === true || Muji.is_ongoing() === true);
        } catch(e) {
            Console.error('Call.is_ongoing', e);
        } finally {
            return is_ongoing;
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
     * Notify for something related to calls
     * @public
     * @param {string} call_type
     * @param {string} xid
     * @param {string} type
     * @param {string} mode
     * @return {boolean}
     */
    self.notify = function(call_type, xid, type, mode) {

        try {
            var map;

            switch(call_type) {
                case JSJAC_JINGLE_SESSION_SINGLE:
                    map = Jingle._notify_map(); break;
                case JSJAC_JINGLE_SESSION_MUJI:
                    map = Muji._notify_map(); break;
                default:
                    return;
            }

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
            jingle_tool_sel.addClass('active');

            // Open notification box!
            jingle_content_sel.show();
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
            var remote_video_sel, sizes,
                remote_sel = videobox_sel.find('.remote_video');

            remote_sel.each(function() {
                remote_video_sel = $(this).find('video');

                // Process new sizes
                sizes = Call._process_size(
                    $(this),
                    remote_video_sel[0]
                );

                // Apply new sizes
                remote_video_sel.css({
                    'height': sizes.height,
                    'width': sizes.width,
                    'margin-top': sizes.top,
                    'margin-left': sizes.left
                });
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
            self._stopCounter();
            self._start_stamp = DateUtils.getTimeStamp();
            self._fireClock();
            
            // Fire it every second
            $('#top-content .tools.call .counter').everyTime('1s', self._fireClock);

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
     * @param {object} view_count_sel
     * @return {boolean}
     */
    self.stop_counter = function(view_count_sel) {

        try {
            // Reset stamp storage
            self._start_stamp = 0;

            // Reset counter
            var counter_sel = $('#top-content .tools.call .counter');
            var default_count = counter_sel.attr('data-default');
            
            counter_sel.stopTime();

            $('#top-content .tools.call .counter').text(default_count);
            view_count_sel.find('.elapsed').text(default_count);

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
     * @param {object} view_count_sel
     * @return {undefined}
     */
    self._fire_clock = function(view_count_sel) {

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
            $('#top-content .tools.call .counter').text(default_count);
            view_count_sel.find('.elapsed').text(default_count);
        } catch(e) {
            Console.error('Call._fire_clock', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Call.launch();