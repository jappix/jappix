/*

Jappix - An open social platform
These are the Muji helpers & launchers

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Muji = (function() {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self._session = null;


    /**
     * Opens the Muji interface (depending on the state)
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            var call_tool_sel = $('#top-content .tools.call');

            if(call_tool_sel.is('.active')) {
                Console.info('Opened call notification drawer');
            } else if(call_tool_sel.is('.streaming.video')) {
                // Videoroom?
                self._show_interface();

                Console.info('Opened Muji videoroom');
            } else {
                Console.warn('Could not open any Muji tool (race condition on state)');
            }
        } catch(e) {
            Console.error('Muji.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Returns the Muji session arguments (used to configure it)
     * @private
     * @param connection
     * @param xid
     * @param hash
     * @param local_view
     * @return {object}
     */
    self._args = function(connection, xid, hash, media, local_view) {

        args = {};

        try {
            // Network configuration
            var ice_servers = Call.generate_ice_servers();

            // Muji arguments
            args = {
                // Configuration (required)
                connection: connection,
                to: xid,
                media: media,
                local_view: local_view,
                stun: ice_servers.stun,
                turn: ice_servers.turn,
                resolution: 'sd',
                debug: Call._consoleAdapter,

                // Custom handlers (optional)
                room_message_in: function(muji, stanza) {
                    console.log('room_message_in');
                },

                room_message_out: function(muji, stanza) {
                    console.log('room_message_out');
                },

                room_presence_in: function(muji, stanza) {
                    console.log('room_presence_in');
                },

                room_presence_out: function(muji, stanza) {
                    console.log('room_presence_out');
                },
                
                session_prepare_pending: function(muji, stanza) {
                    console.log('session_prepare_pending');
                },
                
                session_prepare_success: function(muji, stanza) {
                    console.log('session_prepare_success');
                },
                
                session_prepare_error: function(muji, stanza) {
                    console.log('session_prepare_error');
                },
                
                session_initiate_pending: function(muji) {
                    console.log('session_initiate_pending');
                },
                
                session_initiate_success: function(muji, stanza) {
                    console.log('session_initiate_success');
                },
                
                session_initiate_error: function(muji, stanza) {
                    console.log('session_initiate_error');
                },
                
                session_leave_pending: function(muji) {
                    console.log('session_leave_pending');
                },
                
                session_leave_success: function(muji, stanza) {
                    console.log('session_leave_success');
                },
                
                session_leave_error: function(muji, stanza) {
                    console.log('session_leave_error');
                },
                
                participant_prepare: function(muji, stanza) {
                    console.log('participant_prepare');
                },
                
                participant_initiate: function(muji, stanza) {
                    console.log('participant_initiate');
                },
                
                participant_leave: function(muji, stanza) {
                    console.log('participant_leave');
                },
                
                participant_session_initiate_pending: function(muji, session) {
                    console.log('participant_session_initiate_pending');
                },
                
                participant_session_initiate_success: function(muji, session, stanza) {
                    console.log('participant_session_initiate_success');
                },
                
                participant_session_initiate_error: function(muji, session, stanza) {
                    console.log('participant_session_initiate_error');
                },
                
                participant_session_initiate_request: function(muji, session, stanza) {
                    console.log('participant_session_initiate_request');
                },
                
                participant_session_accept_pending: function(muji, session) {
                    console.log('participant_session_accept_pending');
                },
                
                participant_session_accept_success: function(muji, session, stanza) {
                    console.log('participant_session_accept_success');
                },
                
                participant_session_accept_error: function(muji, session, stanza) {
                    console.log('participant_session_accept_error');
                },
                
                participant_session_accept_request: function(muji, session, stanza) {
                    console.log('participant_session_accept_request');
                },
                
                participant_session_info_pending: function(muji, session) {
                    console.log('participant_session_info_pending');
                },
                
                participant_session_info_success: function(muji, session, stanza) {
                    console.log('participant_session_info_success');
                },
                
                participant_session_info_error: function(muji, session, stanza) {
                    console.log('participant_session_info_error');
                },
                
                participant_session_info_request: function(muji, session, stanza) {
                    console.log('participant_session_info_request');
                },
                
                participant_session_terminate_pending: function(muji, session) {
                    console.log('participant_session_terminate_pending');
                },
                
                participant_session_terminate_success: function(muji, session, stanza) {
                    console.log('participant_session_terminate_success');
                },
                
                participant_session_terminate_error: function(muji, session, stanza) {
                    console.log('participant_session_terminate_error');
                },
                
                participant_session_terminate_request: function(muji, session, stanza) {
                    console.log('participant_session_terminate_request');
                },
                
                add_remote_view: function(muji, username, media) {
                    console.log('add_remote_view');
                },
                
                remove_remote_view: function(muji, username) {
                    console.log('remove_remote_view');
                }
            };
        } catch(e) {
            Console.error('Muji._args', e);
        } finally {
            return args;
        }

    };


    /**
     * Launch a new Muji session with given buddy
     * @private
     * @param room
     * @param mode
     * @param stanza
     * @return {boolean}
     */
    self._new = function(room, mode, stanza) {

        var status = false;

        try {
            if(!room) {
                throw 'No room to be joined given!';
            }

            var hash = hex_md5(room);

            // Create interface for video containers
            $('body').addClass('in_muji_call');
            var muji_sel = self._create_interface(room, mode);

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
                hash,
                media,
                muji_sel.find('.local_video video')[0]
            );

            self._session = new JSJaCJingle.session(JSJAC_JINGLE_SESSION_MUJI, args);
            self._session.join();

            Console.debug('Join Muji conference: ' + full_xid);

            status = true;
        } catch(e) {
            Console.error('Muji._new', e);
        } finally {
            return status;
        }

    };


    /**
     * Adapts the Muji view to the window size
     * @private
     * @return {undefined}
     */
    self._adapt = function() {

        try {
            if(self.in_call() && Common.exists('#muji')) {
                Call.adapt_local(
                    $('#muji .local_video')
                );

                Call.adapt_remote(
                    $('#muji .videoroom')
                );
            }
        } catch(e) {
            Console.error('Muji._adapt', e);
        }

    };


    /**
     * Receive a Muji call
     * @public
     * @param {string} room
     * @param {object} stanza
     * @return {boolean}
     */
    self.receive = function(room, stanza) {

        try {
            if(!Call.is_ongoing()) {
                self._new(room, null, stanza);
            }
        } catch(e) {
            Console.error('Muji.receive', e);
        } finally {
            return false;
        }

    };


    /**
     * Start a Muji call
     * @public
     * @param {string} room
     * @param {string} mode
     * @return {boolean}
     */
    self.start = function(room, mode) {

        try {
            if(!Call.is_ongoing()) {
                self._new(room, mode);
            }
        } catch(e) {
            Console.error('Muji.start', e);
        } finally {
            return false;
        }

    };


     /**
     * Reset current Muji call
     * @public
     * @return {boolean}
     */
    self._reset = function() {

        try {
            // Trash interface
            Call.stop_counter();
            Call.stop_session();
            self._destroy_interface();
            $('body').removeClass('in_muji_call');

            // Hack: stop audio in case it is still ringing
            Audio.stop('incoming-call');
            Audio.stop('outgoing-call');
        } catch(e) {
            Console.error('Muji._reset', e);
        } finally {
            return false;
        }

    };


    /**
     * Stops current Muji call
     * @public
     * @return {boolean}
     */
    self.stop = function() {

        try {
            // Reset interface
            self._reset();

            // Stop Muji session
            if(self._session !== null) {
                self._session.leave();

                Console.debug('Stopping current Muji call...');
            } else {
                Console.warn('No Muji call to be terminated!');
            }
        } catch(e) {
            Console.error('Muji.stop', e);
        } finally {
            return false;
        }

    };


    /**
     * Mutes current Muji call
     * @public
     * @return {undefined}
     */
    self.mute = function() {

        try {
            Call.mute(
                $('#muji .videoroom .topbar .controls a')
            );
        } catch(e) {
            Console.error('Muji.mute', e);
        }

    };


    /**
     * Unmutes current Muji call
     * @public
     * @return {undefined}
     */
    self.unmute = function() {

        try {
            Call.unmute(
                $('#muji .videoroom .topbar .controls a')
            );
        } catch(e) {
            Console.error('Muji.mute', e);
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
              (self._session.get_status() === JSJAC_JINGLE_MUJI_STATUS_PREPARING   || 
               self._session.get_status() === JSJAC_JINGLE_MUJI_STATUS_PREPARED    || 
               self._session.get_status() === JSJAC_JINGLE_MUJI_STATUS_INITIATING  || 
               self._session.get_status() === JSJAC_JINGLE_MUJI_STATUS_INITIATED   ||
               self._session.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING)) {
                in_call = true;
            }
        } catch(e) {
            Console.error('Muji.in_call', e);
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
    self.is_same_sid = function(muji) {

        try {
            return Call.is_same_sid(self._session, muji);
        } catch(e) {
            Console.error('Muji.is_same_sid', e);
        }

    };


    /**
     * Returns if current Muji call is audio
     * @public
     * @return {boolean}
     */
    self.is_audio = function() {

        try {
            return Call.is_audio(self._session);
        } catch(e) {
            Console.error('Muji.is_audio', e);
        }

    };


    /**
     * Returns if current Muji call is video
     * @public
     * @return {boolean}
     */
    self.is_video = function() {

        try {
            return Call.is_video(self._session);
        } catch(e) {
            Console.error('Muji.is_video', e);
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
                    'text': Common._e("Incoming group call"),

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
                                self._session.leave();
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'call_video': {
                    'text': Common._e("Incoming group call"),

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
                                self._session.leave();
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'initiating': {
                    'text': Common._e("Initiating group call"),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._session.leave();
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
                                self._session.leave();
                            }
                        }
                    }
                },

                'connecting': {
                    'text': Common._e("Connecting to group call..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self._session.leave();
                            }
                        }
                    }
                },

                'error': {
                    'text': Common._e("Group call error"),

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
                    'text': Common._e("Ending group call...")
                },

                'ended': {
                    'text': Common._e("Group call ended"),

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
            Console.error('Muji._notify_map', e);

            return {};
        }

    };


    /**
     * Create the Muji interface
     * @public
     * @param {string} room
     * @param {string} mode
     * @return {object}
     */
    self._create_interface = function(room, mode) {

        try {
            // Jingle interface already exists?
            if(Common.exists('#muji')) {
                throw 'Muji interface already exist!';
            }

            // Create DOM
            $('body').append(
                '<div id="muji" class="lock removable ' + hex_md5(room) + '" data-room="' + Common.encodeQuotes(room) + '" data-mode="' + Common.encodeQuotes(mode) + '">' + 
                    '<div class="videoroom">' + 
                        '<div class="topbar">' + 
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

                        '<div class="remote_container"></div>' + 

                        '<div class="branding jingle-images"></div>' + 
                    '</div>' + 

                    '<div class="chatroom">' + 
                        '<p>TODO</p>' + 
                    '</div>' + 
                '</div>'
            );

            // Apply events
            self._events_interface();

            // Apply user avatar
            Avatar.get(xid, 'cache', 'true', 'forget');
        } catch(e) {
            Console.error('Muji._create_interface', e);
        } finally {
            return $('#muji');
        }

    };


    /**
     * Destroy the Muji interface
     * @public
     * @return {undefined}
     */
    self._destroy_interface = function() {

        try {
            Call.destroy_interface(
                $('#muji')
            );
        } catch(e) {
            Console.error('Muji._destroy_interface', e);
        }

    };


    /**
     * Show the Muji interface
     * @private
     * @return {boolean}
     */
    self._show_interface = function() {

        try {
            Call.show_interface(
                self,
                $('#muji'),
                $('#muji .videoroom')
            );
        } catch(e) {
            Console.error('Muji._show_interface', e);
        } finally {
            return false;
        }

    };


    /**
     * Hide the Muji interface
     * @private
     * @return {boolean}
     */
    self._hide_interface = function() {

        try {
            Call.hide_interface(
                $('#muji'),
                $('#muji .videoroom')
            );
        } catch(e) {
            Console.error('Muji._hide_interface', e);
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
                $('#muji'),
                $('#muji .videoroom')
            );
        } catch(e) {
            Console.error('Muji._events_interface', e);
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
            Console.error('Muji.launch', e);
        }
    
    };


    /**
     * Return class scope
     */
    return self;

})();

Muji.launch();