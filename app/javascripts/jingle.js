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
    self.__args = function(connection, xid, hash, local_view, remote_view) {

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
                    // TODO

                    Console.log('session_initiate_pending');
                },

                session_initiate_success: function(jingle, stanza) {
                    // Already in a call?
                    if(self.in_call()) {
                        jingle.terminate(JSJAC_JINGLE_REASON_BUSY);

                        Console.warn('session_initiate_success', 'Dropped incoming call (already in a call)');
                    } else {
                        // TODO
                    }
                    
                    Console.log('session_initiate_success');
                },

                session_initiate_error: function(jingle, stanza) {
                    // TODO

                    Console.log('session_initiate_error');
                },

                session_initiate_request: function(jingle, stanza) {
                    // TODO

                    Console.log('session_initiate_request');
                },

                session_accept_pending: function(jingle) {
                    // TODO

                    Console.log('session_accept_pending');
                },

                session_accept_success: function(jingle, stanza) {
                    // TODO

                    Console.log('session_accept_success');
                },

                session_accept_error: function(jingle, stanza) {
                    // TODO

                    Console.log('session_accept_error');
                },

                session_accept_request: function(jingle, stanza) {
                    Console.log('session_accept_request');
                },

                session_info_success: function(jingle, stanza) {
                    // TODO

                    Console.log('session_info_success');
                },

                session_info_error: function(jingle, stanza) {
                    Console.log('session_info_error');
                },

                session_info_request: function(jingle, stanza) {
                    Console.log('session_info_request');
                },

                session_terminate_pending: function(jingle) {
                    // TODO

                    Console.log('session_terminate_pending');
                },

                session_terminate_success: function(jingle, stanza) {
                    // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        // TODO
                    } else {
                        Console.warn('session_terminate_success', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('session_terminate_success');
                },

                session_terminate_error: function(jingle, stanza) {
                     // Ensure we this is the same call session ID (SID)
                    if(self._jingle_current.get_sid() == jingle.get_sid()) {
                        // TODO
                    } else {
                        Console.warn('session_terminate_error', 'Dropped stanza with unmatching SID');
                    }

                    Console.log('session_terminate_error');
                },

                session_terminate_request: function(jingle, stanza) {
                    // TODO

                    Console.log('session_terminate_request');
                }
            };
        } catch(e) {
            Console.error('Jingle.__args', e);
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
    self.__new = function(xid, mode, is_callee, stanza) {

        var status = false;

        try {
            if(!xid) return false;

            var jingle_sel = $('#jingle');
            var bare_xid    = Common.bareXID(xid);
            var full_xid    = null;
            var bare_hash   = hex_md5(bare_xid);

            // Caller mode?
            if(!is_callee) {
                full_xid = getHighestResource(xid);

                if(!full_xid) return false;
            }

            // TODO: create DOM containers for video/audio

            // Start the Jingle negotiation
            var args = self.__args(
                                   con,
                                   full_xid,
                                   bare_hash,
                                   jingle_sel.find('.local_video')[0],
                                   jingle_sel.find('.remote_video')[0]
                                 );

            self._jingle_current = new JSJaCJingle(args);

            if(is_callee) {
                // TODO: make it ring!
                self._jingle_current.handle(stanza);
            } else {
                self._jingle_current.initiate();
            }

            status = true;
        } catch(e) {
            Console.error('Jingle.__new', e);
        } finally {
            return status;
        }

    };


    /**
     * Adapts the Jingle view to the window size
     * @private
     * @return {undefined}
     */
    self.__adapt = function() {

        try {
            // TODO
        } catch(e) {
            Console.error('Jingle.__adapt', e);
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
     * @return {boolean}
     */
    self.start = function(xid, mode) {

        try {
            if(!self.in_call()) {
                // TODO
                alert('Call: ' + xid + ' (' + mode + ')');
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
     * Create the Jingle interface
     * @public
     * @return {undefined}
     */
    self.createInterface = function(xid, mode) {

        try {
            $('body').append(
                '<div id="jingle" class="lock removable" data-xid="" data-mode="">' + 
                    '<div class="videobox">' + 
                        '<div class="topbar">' + 
                            '<div class="avatar-container">' + 
                                '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' + 
                            '</div>' + 

                            '<div class="controls">' + 
                                '<a href="#" class="stop control-button jingle-images" data-type="stop">Stop</a>' + 
                                '<a href="#" class="mute control-button jingle-images" data-type="mute">Mute</a>' + 
                            '</div>' + 

                            '<div class="elapsed">00:00:00</div>' + 

                            '<div class="actions">' + 
                                '<a href="#" class="close action-button jingle-images" data-type="close">X</a>' + 
                            '</div>' + 
                        '</div>' + 

                        '<video class="local_video" src="" alt=""></video>' + 
                        '<video class="remote_video" src="" alt=""></video>' + 
                    '</div>' + 
                '</div>'
            );

            $('#jingle .topbar').find('.controls a, .actions a').click(function() {
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
                    Console.error('Jingle.createInterface[async]', e);
                } finally {
                    return false;
                }
            });
        } catch(e) {
            Console.error('Jingle.createInterface', e);
        }

    };

    /**
     * Show the Jingle interface
     * @public
     * @return {undefined}
     */
    self.showInterface = function() {

        try {
            $('#jingle:hidden').stop(true).show();
        } catch(e) {
            Console.error('Jingle.showInterface', e);
        }

    };

    /**
     * Hide the Jingle interface
     * @public
     * @return {undefined}
     */
    self.hideInterface = function() {

        try {
            $('#jingle:visible').stop(true).hide();
        } catch(e) {
            Console.error('Jingle.hideInterface', e);
        }

    };

    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            $(window).resize(self.__adapt());
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