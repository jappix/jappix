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


    /* Constants */
    self.INVITE_MAX_DELAY = 60;


    /* Variables */
    self._session = null;
    self._caller_xid = null;


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
            } else if(call_tool_sel.is('.streaming')) {
                self._show_interface();

                Console.info('Opened Muji box');
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

                // Safety options (optional)
                password_protect: true,

                // Custom handlers (optional)
                room_message_in: function(muji, stanza) {
                    var from = muji.utils.stanza_from(stanza);
                    var username = muji.utils.extract_username(from);
                    var body = stanza.getBody();
                    var muji_sel = $('#muji');

                    var mode = (username === $('#muji').attr('data-username')) ? 'me' : 'him';

                    if(username && body && muji_sel.size()) {
                        var avatar_html = '';

                        if(mode === 'him') {
                            avatar_html =
                            '<div class="message_avatar avatar-container">' +
                                '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                            '</div>';
                        }

                        muji_sel.find('.chatroom .chatroom_view').append(
                            '<div class="room_message ' + mode + ' ' + hex_md5(from) + '">' +
                                avatar_html +

                                '<div class="message_content">' +
                                    '<span class="message_bubble">' + body.htmlEnc() + '</span>' +
                                    '<span class="message_author">' + username.htmlEnc() + '</span>' +
                                '</div>' +

                                '<div class="clear"></div>' +
                            '</div>'
                        );

                        if($('#muji').is(':visible')) {
                            self._message_scroll();
                        } else {
                            self._message_notify();
                        }

                        Console.log('Muji._args > room_message_in', 'Displayed Muji message from: ' + username);
                    }

                    Console.log('Muji._args', 'room_message_in');
                },

                room_message_out: function(muji, stanza) {
                    Console.log('Muji._args', 'room_message_out');
                },

                room_presence_in: function(muji, stanza) {
                    Console.log('Muji._args', 'room_presence_in');
                },

                room_presence_out: function(muji, stanza) {
                    Console.log('Muji._args', 'room_presence_out');
                },

                session_prepare_pending: function(muji, stanza) {
                    // Temporary username
                    $('#muji').attr('data-username', muji.get_username());

                    // Notify user about preparing call
                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'preparing',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_prepare_pending');
                },

                session_prepare_success: function(muji, stanza) {
                    // Final username
                    $('#muji').attr('data-username', muji.get_username());

                    Console.log('Muji._args', 'session_prepare_success');
                },

                session_prepare_error: function(muji, stanza) {
                    self._reset();

                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'error',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_prepare_error');
                },

                session_initiate_pending: function(muji) {
                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'waiting',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_initiate_pending');
                },

                session_initiate_success: function(muji, stanza) {
                    Call._unnotify();

                    // Start call! Go Go Go!
                    Call.start_session(muji.get_media());
                    self._show_interface();
                    Call.start_counter();

                    Console.log('Muji._args', 'session_initiate_success');
                },

                session_initiate_error: function(muji, stanza) {
                    self._reset();

                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'error',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_initiate_error');
                },

                session_leave_pending: function(muji) {
                    self._reset();

                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'ending',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_leave_pending');
                },

                session_leave_success: function(muji, stanza) {
                    self._reset();

                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'ended',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_leave_success');
                },

                session_leave_error: function(muji, stanza) {
                    self._reset();

                    if(typeof muji.parent != 'undefined') {
                        muji = muji.parent;
                    }

                    Call.notify(
                        JSJAC_JINGLE_SESSION_MUJI,
                        muji.get_to(),
                        'ended',
                        muji.get_media(),
                        self.get_caller_xid()
                    );

                    Console.log('Muji._args', 'session_leave_error');
                },

                participant_prepare: function(muji, stanza) {
                    Console.log('Muji._args', 'participant_prepare');
                },

                participant_initiate: function(muji, stanza) {
                    Console.log('Muji._args', 'participant_initiate');
                },

                participant_leave: function(muji, stanza) {
                    Console.log('Muji._args', 'participant_leave');
                },

                participant_session_initiate_pending: function(muji, session) {
                    Console.log('Muji._args', 'participant_session_initiate_pending');
                },

                participant_session_initiate_success: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_initiate_success');
                },

                participant_session_initiate_error: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_initiate_error');
                },

                participant_session_initiate_request: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_initiate_request');
                },

                participant_session_accept_pending: function(muji, session) {
                    Console.log('Muji._args', 'participant_session_accept_pending');
                },

                participant_session_accept_success: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_accept_success');
                },

                participant_session_accept_error: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_accept_error');
                },

                participant_session_accept_request: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_accept_request');
                },

                participant_session_info_pending: function(muji, session) {
                    Console.log('Muji._args', 'participant_session_info_pending');
                },

                participant_session_info_success: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_info_success');
                },

                participant_session_info_error: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_info_error');
                },

                participant_session_info_request: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_info_request');
                },

                participant_session_terminate_pending: function(muji, session) {
                    Console.log('Muji._args', 'participant_session_terminate_pending');
                },

                participant_session_terminate_success: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_terminate_success');
                },

                participant_session_terminate_error: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_terminate_error');
                },

                participant_session_terminate_request: function(muji, session, stanza) {
                    Console.log('Muji._args', 'participant_session_terminate_request');
                },

                add_remote_view: function(muji, username, media) {
                    Console.log('Muji._args', 'add_remote_view');

                    var muji_sel = $('#muji');
                    var nobody_sel = muji_sel.find('.empty_message');
                    var remote_container_sel = $('#muji .remote_container');
                    var remote_video_shaper_sel = remote_container_sel.find('.remote_video_shaper');

                    var view_sel = null;
                    var container_sel = remote_video_shaper_sel.filter(function() {
                        return ($(this).attr('data-username') + '') === (username + '');
                    });

                    var count_participants = remote_video_shaper_sel.filter(':has(video)').size();

                    // Not already in view?
                    if(!container_sel.size()) {
                        // Select first empty view
                        var first_empty_view_sel = remote_video_shaper_sel.filter(':not(:has(video)):first');

                        if(first_empty_view_sel.size()) {
                            container_sel = first_empty_view_sel;

                            // Remote poster
                            var remote_poster = './images/placeholders/jingle_video_remote.png';

                            if(media === 'audio') {
                                remote_poster = './images/placeholders/jingle_audio_remote.png';
                            }

                            // Append view
                            view_sel = $('<video src="" alt="" poster="' + remote_poster + '"></video>');

                            container_sel.attr('data-username', username);
                            view_sel.appendTo(container_sel);

                            // Append username label
                            container_sel.append(
                                '<span class="label_username">' + username.htmlEnc() + '</span>'
                            );

                            // Update counter
                            muji_sel.attr(
                                'data-count',
                                ++count_participants
                            );
                        } else {
                            // Room is full...
                            muji_sel.find('.chatroom_participants .participants_full:hidden').show();
                        }
                    }

                    nobody_sel.hide();
                    Muji._update_count_participants(count_participants);
                    Muji._update_invite_participants();

                    // IMPORTANT: return view selector
                    return (view_sel !== null) ? view_sel[0] : view_sel;
                },

                remove_remote_view: function(muji, username) {
                    Console.log('Muji._args', 'remove_remote_view');

                    var muji_sel = $('#muji');
                    var nobody_sel = muji_sel.find('.empty_message');
                    var remote_container_sel = $('#muji .remote_container');
                    var remote_video_shaper_sel = remote_container_sel.find('.remote_video_shaper');

                    var container_sel = remote_video_shaper_sel.filter(function() {
                        return ($(this).attr('data-username') + '') === (username + '');
                    });

                    var count_participants = remote_video_shaper_sel.filter(':has(video)').size();

                    // Exists in view?
                    if(container_sel.size()) {
                        var view_sel = container_sel.find('video');

                        // Remove video
                        view_sel.stop(true).fadeOut(250, function() {
                            container_sel.empty();

                            // Update counter
                            muji_sel.attr(
                                'data-count',
                                --count_participants
                            );

                            // Nobody left in the room?
                            if(!remote_video_shaper_sel.find('video').size()) {
                                nobody_sel.show();
                                muji_sel.removeAttr('data-count');
                            }

                            // Update participants counter
                            muji_sel.find('.chatroom_participants .participants_full:visible').hide();
                            Muji._update_count_participants(count_participants);
                            Muji._update_invite_participants();
                        });

                        // IMPORTANT: return view selector
                        if(view_sel.size()) {
                            return view_sel[0];
                        }
                    }

                    return null;
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
     * @param args_invite
     * @return {boolean}
     */
    self._new = function(room, mode, stanza, args_invite) {

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
                room,
                hash,
                media,
                muji_sel.find('.local_video video')[0]
            );

            if(typeof args_invite == 'object') {
                if(args_invite.password) {
                    args.password = args_invite.password;
                }

                args.media = (args_invite.media == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_VIDEO
                                                                             : JSJAC_JINGLE_MEDIA_AUDIO;

                self._session = new JSJaCJingle.session(JSJAC_JINGLE_SESSION_MUJI, args);
                self._caller_xid = Common.bareXID(args_invite.from);

                Console.debug('Receive Muji call: ' + room);
            } else {
                self._session = new JSJaCJingle.session(JSJAC_JINGLE_SESSION_MUJI, args);
                self._caller_xid = Common.getXID();

                self._session.join();

                Console.debug('Create Muji call: ' + room);
            }

            Console.debug('Join Muji conference: ' + room);

            status = true;
        } catch(e) {
            Console.error('Muji._new', e);
        } finally {
            return status;
        }

    };


    /**
     * Updates the participants counter value
     * @private
     * @param {number} count_participants
     * @return {undefined}
     */
    self._update_count_participants = function(count_participants) {

        try {
            count_participants = (count_participants || 0);

            var participants_counter_sel = $('#muji .chatroom_participants .participants_counter');

            if(count_participants === 1) {
                participants_counter_sel.text(
                    Common.printf(Common._e("%s participant"), count_participants)
                );
            } else {
                participants_counter_sel.text(
                    Common.printf(Common._e("%s participants"), count_participants)
                );
            }
        } catch(e) {
            Console.error('Muji._update_count_participants', e);
        }

    };


    /**
     * Updates the participants invite tool
     * @private
     * @return {undefined}
     */
    self._update_invite_participants = function() {

        try {
            var chatroom_participants_sel = $('#muji .chatroom_participants');

            var participants_invite_sel = chatroom_participants_sel.find('.participants_invite');
            var participants_invite_box_sel = chatroom_participants_sel.find('.participants_invite_box');

            if(self.is_full()) {
                if(participants_invite_box_sel.is(':visible')) {
                    participants_invite_box_sel.stop(true);
                    participants_invite_sel.click();
                }

                participants_invite_sel.filter(':visible').hide();
            } else {
                participants_invite_sel.filter(':hidden').show();
            }
        } catch(e) {
            Console.error('Muji._update_invite_participants', e);
        }

    };


    /**
     * Resets the participants invite filter
     * @private
     * @return {undefined}
     */
    self._reset_participants_invite_filter = function() {

        try {
            // Selectors
            var chatroom_sel = $('#muji .chatroom');
            var invite_form_sel = chatroom_sel.find('form.participants_invite_form');
            var invite_search_sel = chatroom_sel.find('.participants_invite_search');

            // Apply
            invite_form_sel.find('input.invite_xid').val('');

            invite_search_sel.empty();
        } catch(e) {
            Console.error('Muji._reset_participants_invite_filter', e);
        }

    };


    /**
     * Engages the participants invite filter
     * @private
     * @param {string} value
     * @return {undefined}
     */
    self._engage_participants_invite_filter = function(value) {

        try {
            // Selectors
            var chatroom_sel = $('#muji .chatroom');
            var invite_input_sel = chatroom_sel.find('form.participants_invite_form input.invite_xid');
            var invite_search_sel = chatroom_sel.find('.participants_invite_search');

            // Reset UI
            invite_search_sel.empty();

            // Proceed search
            var results_arr = Search.processBuddy(value);
            var results_html = '';
            var bold_regex = new RegExp('((^)|( ))' + value, 'gi');

            // Exclude already selected buddies
            var exclude_obj = self._list_participants_invite_list();

            if(results_arr && results_arr.length) {
                var i, j,
                    cur_xid, cur_full_xid, cur_hash, cur_support, cur_name, cur_title,
                    cur_name_bolded, cur_support_class;

                for(i = 0; i < results_arr.length; i++) {
                    // Generate result data
                    cur_xid = results_arr[i];

                    if(exclude_obj[cur_xid] !== 1) {
                        cur_hash = hex_md5(cur_xid);
                        cur_name = Name.getBuddy(cur_xid);

                        // Get target's full XID
                        cur_full_xid = Caps.getFeatureResource(cur_xid, NS_MUJI);
                        cur_support = null;

                        if(cur_full_xid) {
                            if(Caps.getFeatureResource(cur_xid, NS_JINGLE_APPS_RTP_VIDEO)) {
                                cur_support = 'video';
                            } else {
                                cur_support = 'audio';
                            }
                        }

                        // Generate a hint title & a class
                        if(cur_support) {
                            cur_title = Common.printf(Common._e("%s is able to receive group calls."), cur_name);
                            cur_support_class = 'participant_search_has_' + cur_support;
                        } else {
                            cur_title = Common.printf(Common._e("%s may not support group calls."), cur_name);
                            cur_support_class = 'participant_search_unsupported';
                        }

                        // Bold matches in name
                        cur_name_bolded = cur_name.htmlEnc().replace(bold_regex, '<b>$&</b>');

                        // Generate result HTML
                        results_html +=
                        '<a class="participant_search_one ' + cur_support_class + ' ' + cur_hash + '" href="#" title="' + Common.encodeQuotes(cur_title) + '" data-xid="' + Common.encodeQuotes(cur_full_xid || cur_xid) + '" data-support="' + Common.encodeQuotes(cur_support) + '">' +
                            '<span class="avatar-container">' +
                                '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                            '</span>' +

                            '<span class="details">' +
                                '<span class="name">' + cur_name_bolded + '</span>' +
                                '<span class="feature call-images"></span>' +
                            '</span>' +
                        '</a>';
                    }
                }

                // Add to DOM
                invite_search_sel.append(results_html);

                var search_one_sel = invite_search_sel.find('a.participant_search_one');
                search_one_sel.filter(':first').addClass('hover');

                // Apply avatars
                for(j = 0; j < results_arr.length; j++) {
                    Avatar.get(results_arr[j], 'cache', 'true', 'forget');
                }

                // Apply events
                search_one_sel.click(function() {
                    var this_sel = $(this);

                    self._add_participants_invite_list(
                        this_sel.attr('data-xid'),
                        this_sel.text(),
                        this_sel.attr('data-support')
                    );

                    self._reset_participants_invite_filter();
                    invite_input_sel.focus();
                });

                search_one_sel.hover(function() {
                    search_one_sel.filter('.hover').removeClass('hover');
                    $(this).addClass('hover');
                }, function() {
                    $(this).removeClass('hover');
                });
            }
        } catch(e) {
            Console.error('Muji._engage_participants_invite_filter', e);
        }

    };


    /**
     * Sends participant actual Muji invite
     * @private
     * @param {string|object} xid
     * @return {undefined}
     */
    self._send_participants_invite_list = function(xid) {

        try {
            if(self.in_call()) {
                self._session.invite(xid);
            }
        } catch(e) {
            Console.error('Muji._send_participants_invite_list', e);
        }

    };


    /**
     * Adds a participant to the invite list
     * @private
     * @param {string} xid
     * @param {string} name
     * @param {string} support
     * @return {undefined}
     */
    self._add_participants_invite_list = function(xid, name, support) {

        try {
            // Selectors
            var chatroom_sel = $('#muji .chatroom');
            var invite_form_sel = chatroom_sel.find('form.participants_invite_form');
            var invite_list_sel = chatroom_sel.find('.participants_invite_list');

            var pre_invite_one_sel = invite_list_sel.find('.invite_one').filter(function() {
                return (xid === $(this).attr('data-xid')) && true;
            });

            if(pre_invite_one_sel.size()) {
                throw 'Already existing for: ' + xid;
            }

            var title;
            var _class = [];

            switch(support) {
                case 'audio':
                case 'video':
                    title = Common.printf(Common._e("%s is able to receive group calls."), name); break;

                default:
                    title = Common.printf(Common._e("%s may not support group calls."), name);
                    _class.push('invite_unsupported');
            }

            // Append element
            var invite_one_sel = $('<span class="invite_one ' + _class.join(' ') + '" data-xid="' + Common.encodeQuotes(xid) + '" title="' + title + '">' + name.htmlEnc() + '<a class="invite_one_remove call-images" href="#"></a></span>');
            invite_one_sel.appendTo(invite_list_sel);

            // Events
            invite_one_sel.find('a.invite_one_remove').click(function() {
                self._remove_participants_invite_list(invite_one_sel);
            });

            if(invite_list_sel.find('.invite_one').size() >= 1) {
                invite_form_sel.find('.invite_validate').show();
                invite_list_sel.filter(':hidden').show();
            }
        } catch(e) {
            Console.error('Muji._add_participants_invite_list', e);
        }

    };


    /**
     * Removes a participant from the invite list
     * @private
     * @param {object} participant_sel
     * @return {undefined}
     */
    self._remove_participants_invite_list = function(participant_sel) {

        try {
            // Selectors
            var chatroom_sel = $('#muji .chatroom');
            var invite_form_sel = chatroom_sel.find('form.participants_invite_form');
            var invite_list_sel = chatroom_sel.find('.participants_invite_list');

            participant_sel.remove();

            if(invite_list_sel.find('.invite_one').size() === 0) {
                invite_form_sel.find('.invite_validate').hide();
                invite_list_sel.filter(':visible').hide();
            }

            invite_form_sel.find('input.invite_xid').focus();
        } catch(e) {
            Console.error('Muji._remove_participants_invite_list', e);
        }

    };


    /**
     * Hovers either the next or previous participant
     * @private
     * @param {string} direction
     * @return {undefined}
     */
    self._hover_participants_invite_list = function(direction) {

        try {
            // Up/down: navigate through results
            var chatroom_sel = $('#muji .chatroom');
            var participants_invite_search_sel = chatroom_sel.find('.participants_invite_search');
            var participant_search_one_sel = chatroom_sel.find('.participant_search_one');

            if(participant_search_one_sel.size()) {
                var hover_index = participant_search_one_sel.index($('.hover'));

                // Up (decrement) or down (increment)?
                if(direction === 'up') {
                    hover_index--;
                } else {
                    hover_index++;
                }

                if(!hover_index) {
                    hover_index = 0;
                }

                // Nobody before/after?
                if(participant_search_one_sel.eq(hover_index).size() === 0) {
                    if(direction === 'up') {
                        hover_index = participant_search_one_sel.filter(':last').index();
                    } else {
                        hover_index = 0;
                    }
                }

                // Hover the previous/next user
                participant_search_one_sel.removeClass('hover');
                participant_search_one_sel.eq(hover_index).addClass('hover');

                // Scroll to the hovered user (if out of limits)
                participants_invite_search_sel.scrollTo(
                    participant_search_one_sel.filter('.hover:first'), 0, { margin: true }
                );
            }
        } catch(e) {
            Console.error('Muji._hover_participants_invite_list', e);
        }

    };


    /**
     * Lists the participants in the invite list
     * @private
     * @return {object}
     */
    self._list_participants_invite_list = function() {

        var participants_obj = {};

        try {
            $('#muji .chatroom .participants_invite_list .invite_one').each(function() {
                participants_obj[$(this).attr('data-xid')] = 1;
            });
        } catch(e) {
            Console.error('Muji._list_participants_invite_list', e);
        } finally {
            return participants_obj;
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
     * Scrolls down to last received message
     * @private
     * @return {undefined}
     */
    self._message_scroll = function() {

        try {
            var chatroom_view_sel = $('#muji .chatroom .chatroom_view');

            // Scroll down to message
            if(chatroom_view_sel.size() && chatroom_view_sel.is(':visible')) {
                chatroom_view_sel[0].scrollTop = chatroom_view_sel[0].scrollHeight;
            }
        } catch(e) {
            Console.error('Muji._message_scroll', e);
        }

    };


    /**
     * Notifies that a new message has been received
     * @private
     * @return {undefined}
     */
    self._message_notify = function() {

        try {
            // Selectors
            var tools_call_sel = $('#top-content .tools.call');
            var notify_sel = tools_call_sel.find('.notify');

            if(!notify_sel.size()) {
                notify_sel = $(
                    '<div class="notify one-counter" data-counter="0">0</div>'
                );

                notify_sel.appendTo(tools_call_sel);
            }

            // Count & update
            var count_notifications = parseInt((notify_sel.attr('data-counter') || 0), 10);
            count_notifications++;

            notify_sel.text(count_notifications);
            notify_sel.attr('data-counter', count_notifications);

            // Update general interface
            Interface.updateTitle();
        } catch(e) {
            Console.error('Muji._message_notify', e);
        }

    };


    /**
     * Removes displayed message notifications
     * @private
     * @return {undefined}
     */
    self._message_unnotify = function() {

        try {
            $('#top-content .tools.call .notify').remove();

            // Update general interface
            Interface.updateTitle();
        } catch(e) {
            Console.error('Muji._message_unnotify', e);
        }

    };


    /**
     * Receive a Muji call
     * @public
     * @param {object} args
     * @param {object} stanza
     * @return {boolean}
     */
    self.receive = function(args, stanza) {

        try {
            if(!Call.is_ongoing()) {
                // Outdated invite?
                var invite_delay = DateUtils.readMessageDelay(stanza.getNode(), true);
                var date_now = DateUtils.getTimeStamp();

                if(invite_delay &&
                   (date_now - DateUtils.extractStamp(invite_delay)) >= self.INVITE_MAX_DELAY) {
                    Console.warn('Muji.receive', 'Discarded outdated invite from: ' + Common.getStanzaFrom(stanza));
                    return;
                }

                // Create call session
                self._new(
                    args.jid,
                    (args.media || JSJAC_JINGLE_MEDIA_VIDEO),
                    stanza,
                    args
                );

                // Notify user
                Call.notify(
                    JSJAC_JINGLE_SESSION_MUJI,
                    args.jid,
                    ('call_' + (args.media || 'video')),
                    args.media,
                    Common.bareXID(args.from)
                );

                Audio.play('incoming-call', true);
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

            // Clean notifications
            self._message_unnotify();

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
     * @param {boolean} abort
     * @return {boolean}
     */
    self.stop = function(abort) {

        try {
            // Reset interface
            self._reset();

            // Stop Muji session
            if(self._session !== null) {
                if(abort === true) {
                    self._session.abort();
                    self._session.get_session_leave_error(self._session, null);
                } else {
                    self._session.leave();
                }

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
     * Checks whether room given is Muji room or not
     * @public
     * @param {string} room
     * @return {boolean}
     */
    self.is_room = function(room) {

        is_room = false;

        try {
            if(self.in_call() && self._session.get_to()) {
                is_room = (room === self._session.get_to());
            }
        } catch(e) {
            Console.error('Muji.is_room', e);
        } finally {
            return is_room;
        }

    };


    /**
     * Checks whether room is full or not (over-capacity)
     * @public
     * @return {boolean}
     */
    self.is_full = function() {

        is_full = false;

        try {
            if($('#muji .chatroom_participants .participants_full').is(':visible')) {
                is_full = true;
            }
        } catch(e) {
            Console.error('Muji.is_full', e);
        } finally {
            return is_full;
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
     * Returns the caller XID
     * @public
     * @return {string}
     */
    self.get_caller_xid = function() {

        try {
            return self._caller_xid || Common.getXID();
        } catch(e) {
            Console.error('Muji.get_caller_xid', e);
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
                                self._session.join();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self.stop(true);
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
                                self._session.join();
                                Audio.stop('incoming-call');
                            }
                        },

                        'decline': {
                            'text': Common._e("Decline"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self.stop(true);
                                Audio.stop('incoming-call');
                            }
                        }
                    }
                },

                'preparing': {
                    'text': Common._e("Preparing group call..."),

                    'buttons': {
                        'cancel': {
                            'text': Common._e("Cancel"),
                            'color': 'red',
                            'cb': function(xid, mode) {
                                self.stop(true);
                            }
                        }
                    }
                },

                'waiting': {
                    'text': Common._e("Preparing group call..."),

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

            // Local poster
            var local_poster = './images/placeholders/jingle_video_local.png';

            if(mode === 'audio') {
                local_poster = './images/placeholders/jingle_audio_local.png';
            }

            // Create DOM
            $('body').append(
                '<div id="muji" class="videochat_box lock removable ' + hex_md5(room) + '" data-room="' + Common.encodeQuotes(room) + '" data-mode="' + Common.encodeQuotes(mode) + '">' +
                    '<div class="videochat_items">' +
                        '<div class="videoroom">' +
                            '<div class="topbar">' +
                                '<div class="controls">' +
                                    '<a href="#" class="leave control-button" data-type="leave"><span class="icon call-images"></span>' + Common._e("Leave") + '</a>' +
                                    '<a href="#" class="mute control-button" data-type="mute"><span class="icon call-images"></span>' + Common._e("Mute") + '</a>' +
                                    '<a href="#" class="unmute control-button" data-type="unmute"><span class="icon call-images"></span>' + Common._e("Unmute") + '</a>' +
                                '</div>' +

                                '<div class="elapsed">00:00:00</div>' +

                                '<div class="actions">' +
                                    '<a href="#" class="close action-button call-images" data-type="close"></a>' +
                                '</div>' +
                            '</div>' +

                            '<div class="local_video">' +
                                '<video src="" alt="" poster="' + local_poster + '"></video>' +
                            '</div>' +

                            '<div class="remote_container">' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                                '<div class="remote_video_shaper remote_video"></div>' +
                            '</div>' +

                            '<div class="empty_message">' +
                                '<span class="text">' + Common._e("Nobody there. Invite some people!") + '</span>' +
                            '</div>' +
                        '</div>' +

                        '<div class="chatroom">' +
                            '<div class="chatroom_participants">' +
                                '<div class="participants_default_view">' +
                                    '<div class="participants_default_details">' +
                                        '<span class="participants_counter">' + Common.printf(Common._e("%s participants"), 0) + '</span>' +
                                        '<span class="participants_full">' + Common._e("(full)") + '</span>' +
                                    '</div>' +

                                    '<a class="participants_invite call-images" href="#" title="' + Common._e("Invite people...") + '"></a>' +
                                '</div>' +

                                '<div class="participants_invite_box">' +
                                    '<div class="participants_invite_list"></div>' +

                                    '<form class="participants_invite_form" action="#" method="post">' +
                                        '<div class="invite_input_container">' +
                                            '<input class="invite_xid input-reset" name="xid" type="text" placeholder="' + Common._e("Enter people names...") + '" autocomplete="off" />' +
                                        '</div>' +

                                        '<a class="invite_validate" href="#">' +
                                            '<span class="invite_validate_icon call-images"></span>' +
                                        '</a>' +
                                    '</form>' +

                                    '<div class="participants_invite_search"></div>' +
                                '</div>' +
                            '</div>' +

                            '<div class="chatroom_view"></div>' +

                            '<form class="chatroom_form" action="#" method="post">' +
                                '<span class="message_icon call-images"></span>' +
                                '<span class="message_separator"></span>' +

                                '<div class="message_input_container">' +
                                    '<input class="message_input input-reset" name="message" type="text" placeholder="' + Common._e("Send a message...") + '" autocomplete="off" />' +
                                '</div>' +
                            '</form>' +
                        '</div>' +
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

            self._message_scroll();
            self._message_unnotify();
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
            // Common selectors
            var muji_chatroom = $('#muji .chatroom');
            var chatroom_form = muji_chatroom.find('form.chatroom_form');
            var chatroom_participants = muji_chatroom.find('.chatroom_participants');
            var participants_invite = chatroom_participants.find('.participants_default_view .participants_invite');
            var participants_invite_box = chatroom_participants.find('.participants_invite_box');
            var participants_invite_list = participants_invite_box.find('.participants_invite_list');
            var participants_invite_form = participants_invite_box.find('.participants_invite_form');
            var participants_invite_input = participants_invite_form.find('input[name="xid"]');
            var participants_invite_validate = participants_invite_form.find('.invite_validate');
            var participants_invite_search = participants_invite_box.find('.participants_invite_search');

            // Apply events
            Call.events_interface(
                self,
                $('#muji'),
                $('#muji .videoroom')
            );

            // People invite event
            participants_invite.click(function() {
                try {
                    if(!participants_invite_box.is(':animated')) {
                        if(participants_invite_box.is(':hidden')) {
                            participants_invite_box.stop(true).slideDown(250, function() {
                                participants_invite_input.focus();
                            });
                        } else {
                            participants_invite_input.blur();
                            participants_invite_box.stop(true).slideUp(250, function() {
                                // Reset everything
                                participants_invite_list.empty().hide();
                                participants_invite_validate.hide();
                                participants_invite_input.val('');
                                self._reset_participants_invite_filter();
                            });
                        }
                    }
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                } finally {
                    return false;
                }
            });

            // Invite input key events
            participants_invite_input.keydown(function(e) {
                try {
                    if(e.keyCode == 9) {
                        self._hover_participants_invite_list('down');

                        return false;
                    }
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                }
            });

            participants_invite_input.keyup(function(e) {
                try {
                    var this_sel = $(this);

                    if(e.keyCode == 27) {
                        // Escape: close interface
                        if(!this_sel.val().trim()) {
                            participants_invite.click();
                        } else {
                            self._reset_participants_invite_filter();
                        }

                        return false;
                    } else if(e.keyCode == 9) {
                        // Tabulate: skip there (see keydown above)
                        return false;
                    } else if(e.keyCode == 38 || e.keyCode == 40) {
                        var direction = (e.keyCode == 38) ? 'up' : 'down';
                        self._hover_participants_invite_list(direction);

                        return false;
                    } else {
                        // Other keys: assume something has been typed
                        self._engage_participants_invite_filter(
                            this_sel.val()
                        );
                    }
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                }
            });

            // Input auto-focus
            chatroom_form.click(function() {
                chatroom_form.find('input[name="message"]').focus();
            });

            // Invite form send event
            participants_invite_form.submit(function() {
                try {
                    if(participants_invite_search.find('.participant_search_one.hover').size()) {
                        // Add the hovered user
                        var participant_search_one_hover_sel = participants_invite_search.find('.participant_search_one.hover:first');

                        if(participant_search_one_hover_sel.size() >= 1) {
                            participant_search_one_hover_sel.click();

                            return false;
                        }
                    } else {
                        var invite_arr = Object.keys(self._list_participants_invite_list());

                        if(invite_arr && invite_arr.length) {
                            self._send_participants_invite_list(invite_arr);
                        }

                        participants_invite.click();
                    }
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                } finally {
                    return false;
                }
            });

            // Invite form validate event
            participants_invite_validate.click(function() {
                try {
                    participants_invite_form.submit();
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                } finally {
                    return false;
                }
            });

            // Message send event
            chatroom_form.submit(function() {
                try {
                    if(self._session === null) {
                        throw 'Muji session unavailable';
                    }

                    var input_sel = $(this).find('input[name="message"]');
                    var body = input_sel.val();

                    if(body) {
                        self._session.send_message(body);
                        input_sel.val('');
                    }
                } catch(_e) {
                    Console.error('Muji._show_interface[event]', _e);
                } finally {
                    return false;
                }
            });
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