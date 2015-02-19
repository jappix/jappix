/*

Jappix - An open social platform
These are the groupchat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda, Eric

*/

// Bundle
var Groupchat = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.join_suggest = [];


    /**
     * Apply generate events
     * @private
     * @param {object} input_sel
     * @param {string} hash
     * @param {string} room
     * @return {undefined}
     */
    self._createEvents = function(input_sel, hash, room) {

        try {
            self._createEventsInput(input_sel, hash);
            self._createEventsKey(input_sel, hash, room);
        } catch(e) {
            Console.error('Groupchat._createEvents', e);
        }

    };


    /**
     * Apply generate events (input)
     * @private
     * @param {object} input_sel
     * @param {string} hash
     * @return {undefined}
     */
    self._createEventsInput = function(input_sel, hash) {

        try {
            // Focus event
            input_sel.focus(function() {
                // Clean notifications for this chat
                Interface.chanCleanNotify(hash);

                // Store focus on this chat!
                Interface.chat_focus_hash = hash;
            });

            // Blur event
            input_sel.blur(function() {
                // Reset storage about focus on this chat!
                if(Interface.chat_focus_hash == hash) {
                    Interface.chat_focus_hash = null;
                }

                // Reset autocompletion
                Autocompletion.reset(hash);
            });
        } catch(e) {
            Console.error('Groupchat._createEventsInput', e);
        }

    };


    /**
     * Apply generate events (key)
     * @private
     * @param {object} input_sel
     * @param {string} hash
     * @param {string} room
     * @return {undefined}
     */
    self._createEventsKey = function(input_sel, hash, room) {

        try {
            // Lock to the input
            input_sel.keydown(function(e) {
                // Enter key
                if(e.keyCode == 13) {
                    // If shift key (without any others modifiers) was pressed, add a new line
                    if(e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                        input_sel.val(input_sel.val() + '\n');
                    } else {
                        if(Correction.isIn(room) === true) {
                                var corrected_value = input_sel.val().trim();

                                if(corrected_value) {
                                    // Send the corrected message
                                    Correction.send(room, 'groupchat', corrected_value);
                                }

                                Correction.leave(room);
                        } else {
                            // Send the message
                            Message.send(hash, 'groupchat');

                            // Reset the composing database entry
                            DataStore.setDB(Connection.desktop_hash, 'chatstate', room, 'off');
                        }
                    }

                    return false;
                }

                // Remove chars (leave correction)
                else if(e.keyCode == 8) {
                    // Leave correction mode? (another way, by flushing input value progressively)
                    if(Correction.isIn(room) === true && !input_sel.val()) {
                        Correction.leave(room);
                    }
                }

                // Tabulation key (without any modifiers)
                else if(!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && e.keyCode == 9) {
                    Autocompletion.create(hash);

                    return false;
                }

                // Reset the autocompleter
                else {
                    Autocompletion.reset(hash);
                }
            });

            input_sel.keyup(function(e) {
                if(e.keyCode == 27) {
                    // Escape key
                    input_sel.val('');

                    // Leave correction mode? (simple escape way)
                    if(Correction.isIn(room) === true) {
                        Correction.leave(room);
                    }
                } else {
                    Correction.detect(room, input_sel);
                }
            });
        } catch(e) {
            Console.error('Groupchat._createEventsKey', e);
        }

    };


    /**
     * Apply suggest check events
     * @private
     * @return {undefined}
     */
    self._suggestCheckEvents = function() {

        try {
            // Click events
            $('#suggest .content a.one').click(function() {
                var this_sel = $(this);

                // Add/remove the active class
                this_sel.toggleClass('active');

                // We require at least one room to be chosen
                if(Common.exists('#suggest .content a.one.active')) {
                    $('#suggest a.next').removeClass('disabled');
                } else {
                    $('#suggest a.next').addClass('disabled');
                }

                return false;
            });

            $('#suggest a.next').click(function() {
                var this_sel = $(this);

                // Disabled?
                if(this_sel.hasClass('disabled')) {
                    return false;
                }

                // Store groupchats to join?
                if(this_sel.is('.continue')) {
                    $('#suggest .content a.one.active').each(function() {
                        self.join_suggest.push(
                            $(this).attr('data-xid')
                        );
                    });
                }

                // Switch to talk UI
                $('#suggest').remove();
                Connection.triggerConnected();

                return false;
            });
        } catch(e) {
            Console.error('Groupchat._suggestCheckEvents', e);
        }

    };


    /**
     * Displays the MUC admin elements
     * @public
     * @param {string} affiliation
     * @param {string} id
     * @param {string} xid
     * @param {number} statuscode
     * @return {undefined}
     */
    self.openAdmin = function(affiliation, id, xid, statuscode) {

        try {
            // We must be in the "login" mode
            if(Utils.isAnonymous()) {
                return;
            }

            // We check if the user is a room owner or administrator to give him privileges
            if(affiliation == 'owner' || affiliation == 'admin') {
                $('#' + id + ' .tools-mucadmin').show();
            }

            // We check if the room hasn't been yet created
            if(statuscode == 201) {
                Board.openThisInfo(4);
            }

            // We add the click event
            $('#' + id + ' .tools-mucadmin').click(function() {
                MUCAdmin.open(xid, affiliation);
            });
        } catch(e) {
            Console.error('Groupchat.openAdmin', e);
        }

    };


    /**
     * Initializes a connection with a MUC groupchat
     * @public
     * @param {string} room
     * @param {string} nickname
     * @param {string} password
     * @return {boolean}
     */
    self.getMUC = function(room, nickname, password) {

        try {
            // Room hash
            var hash = hex_md5(room);

            // Reset the elements
            $('#' + hash + ' .muc-ask').remove();
            $('#' + hash + ' .compose').show();

            // No nickname?
            if(!nickname) {
                // Get some values
                if(!Utils.isAnonymous()) {
                    nickname = Name.getNick();
                } else {
                    nickname = ANONYMOUS_NICK;
                }

                // If the nickname could not be retrieved, ask it
                if(!nickname) {
                    self.generateMUCAsk('nickname', room, hash, nickname, password);
                }
            }

            // Got our nickname?
            if(nickname) {
                // Get our general presence
                var show = DataStore.getDB(Connection.desktop_hash, 'presence-show', 1);
                var status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status');

                // Set my nick
                $('#' + hash).attr('data-nick', escape(nickname));

                // Send the appropriate presence
                Presence.send(room + '/' + nickname, '', show, status, '', true, password, self.handleMUC);
            }
        } catch(e) {
            Console.error('Groupchat.getMUC', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the MUC main elements
     * @public
     * @param {object} presence
     * @return {undefined}
     */
    self.handleMUC = function(presence) {

        try {
            // We get the xml content
            var xml = presence.getNode();
            var from = Common.fullXID(Common.getStanzaFrom(presence));
            var room = Common.bareXID(from);
            var nickname = Common.thisResource(from);
            var hash = hex_md5(room);
            var id = presence.getID();

            // No ID: must fix M-Link bug
            if(id === null) {
                id = 1;
                presence.setID(id);
            }

            Console.info('First MUC presence: ' + from);

            // Catch the errors
            if(!Errors.handle(xml)) {
                // Define some stuffs
                var muc_user = $(xml).find('x[xmlns="' + NS_MUC_USER + '"]');
                var affiliation = muc_user.find('item').attr('affiliation');
                var statuscode = parseInt(muc_user.find('status').attr('code'));

                // Handle my presence
                Presence.handle(presence);

                // Configure the new room
                if(affiliation == 'owner' || affiliation == 'admin') {
                    self._initialConfiguration(id, room);
                }

                // Check if I am a room owner
                self.openAdmin(affiliation, hash, room, statuscode);

                // Tell the MUC we can notify the incoming presences
                $(document).oneTime('15s', function() {
                    $('#' + hash).attr('data-initial', 'true');
                });

                // Enable the chatting input
                $(document).oneTime(10, function() {
                    $('#' + hash + ' .message-area').removeAttr('disabled').focus();
                });
            }

            // A password is required
            else if($(xml).find('error[type="auth"] not-authorized').size()) {
                self.generateMUCAsk('password', room, hash, nickname);
            }

            // There's a nickname conflict
            else if($(xml).find('error[type="cancel"] conflict').size()) {
                self.generateMUCAsk('nickname', room, hash);
            }
        } catch(e) {
            Console.error('Groupchat.handleMUC', e);
        }

    };


    /**
     * Generates a correct MUC asker
     * @public
     * @param {string} type
     * @param {string} room
     * @param {string} hash
     * @param {string} nickname
     * @param {string} password
     * @return {undefined}
     */
    self.generateMUCAsk = function(type, room, hash, nickname, password) {

        try {
            // Generate the path to the elements
            var path_to = '#' + hash + ' .muc-ask';

            // Define the label text
            var label_text, input_type;

            switch(type) {
                case 'nickname':
                    label_text = Common._e("Nickname");
                    input_type = 'text';
                    break;

                case 'password':
                    label_text = Common._e("Password");
                    input_type = 'password';
                    break;
            }

            // Create the HTML markup
            $('#' + hash + ' .compose').hide();

            $('#' + hash).append(
                '<div class="muc-ask text">' +
                    '<label>' + label_text + '</label>' +
                    '<input class="focusable" type="' + input_type + '" />' +
                '</div>'
            );

            // When a key is pressed in the input
            $(path_to + ' input').keyup(function(e) {
                var value_input = $(this).val();

                // Enter key pressed
                if(e.keyCode == 13) {
                    // $.trim() fixes #304
                    if(type == 'nickname' && $.trim(value_input)) {
                        nickname = $.trim(value_input);
                        return self.getMUC(room, nickname, password);
                    }

                    if(type == 'password' && value_input) {
                        password = value_input;
                        return self.getMUC(room, nickname, password);
                    }
                }
            });

            // Focus on the input
            $(document).oneTime(10, function() {
                $(path_to + ' input').focus();
            });
        } catch(e) {
            Console.error('Groupchat.generateMUCAsk', e);
        }

    };


    /**
     * Creates a new groupchat
     * @public
     * @param {string} hash
     * @param {string} room
     * @param {string} chan
     * @param {string} nickname
     * @param {string} password
     * @return {undefined}
     */
    self.create = function(hash, room, chan, nickname, password) {

        /* REF: http://xmpp.org/extensions/xep-0045.html */

        try {
            Console.info('New groupchat: ' + room);

            // Create the chat content
            Chat.generate('groupchat', hash, room, chan);

            // Create the chat switcher
            Chat.generateSwitch('groupchat', hash, room, chan);

            // The icons-hover functions
            Tooltip.icons(room, hash);

            // Click event on the add tool
            $('#' + hash + ' .tools-add').click(function() {
                // Hide the icon (to tell the user all is okay)
                $(this).hide();

                // Add the groupchat to the user favorites
                Favorites.addThis(room, chan);
            });

            // Must show the add button?
            if(!DataStore.existDB(Connection.desktop_hash, 'favorites', room)) {
                $('#' + hash + ' .tools-add').show();
            }

            // The event handlers
            var input_sel = $('#' + hash + ' .message-area');
            self._createEvents(input_sel, hash, room);

            // Chatstate events
            ChatState.events(input_sel, room, hash, 'groupchat');

            // Get the current muc informations and content
            self.getMUC(room, nickname, password);
        } catch(e) {
            Console.error('Groupchat.create', e);
        }

    };


    /**
     * Generates a groupchat to join array
     * @public
     * @return {object}
     */
    self.arrayJoin = function() {

        try {
            // Values array
            var muc_arr = [GROUPCHATS_JOIN];
            var new_arr = [];

            // Try to split it
            if(GROUPCHATS_JOIN.indexOf(',') != -1) {
                muc_arr = GROUPCHATS_JOIN.split(',');
            }

            for(var i in muc_arr) {
                // Get the current value
                var muc_current = $.trim(muc_arr[i]);

                // No current value?
                if(!muc_current) {
                    continue;
                }

                // Filter the current value
                muc_current = Common.generateXID(muc_current, 'groupchat');

                // Add the current value
                if(!Utils.existArrayValue(new_arr, muc_current)) {
                    new_arr.push(muc_current);
                }
            }

            return new_arr;
        } catch(e) {
            Console.error('Groupchat.arrayJoin', e);
        }

    };


    /**
     * Joins the defined groupchats
     * @public
     * @return {undefined}
     */
    self.joinConf = function() {

        try {
            // Nothing to join?
            if(!self.join_suggest) {
                return;
            }

            // Join the chats
            if(self.join_suggest.length) {
                for(var g in self.join_suggest) {
                    Chat.checkCreate(self.join_suggest[g], 'groupchat');
                }
            }
        } catch(e) {
            Console.error('Groupchat.joinConf', e);
        }

    };


    /**
     * Checks suggest utility
     * @public
     * @return {undefined}
     */
    self.suggestCheck = function() {

        try {
            var groupchat_arr = self.arrayJoin();

            // Must suggest the user?
            if((GROUPCHATS_SUGGEST == 'on') && groupchat_arr.length) {
                if(Common.exists('#suggest')) {
                    return;
                }

                // Create HTML code
                var html = '<div id="suggest" class="removable">';
                    html += '<div class="title">' + Common._e("Suggested chatrooms") + '</div>';

                    html += '<div class="content">';
                        for(var g in groupchat_arr) {
                            html += '<a class="one" href="#" data-xid="' + Common.encodeQuotes(groupchat_arr[g]) + '">';
                                html += '<span class="icon talk-images"></span>';
                                html += '<span class="name">' + Utils.capitaliseFirstLetter(Common.getXIDNick(groupchat_arr[g]).htmlEnc()) + '</span>';
                                html += '<span class="state talk-images"></span>';
                                html += '<span class="clear"></span>';
                            html += '</a>';
                        }
                    html += '</div>';

                    html += '<div class="bottom">';
                        html += '<a class="next continue disabled" href="#">' + Common._e("Continue") + '</a>';
                        html += '<a class="next skip" href="#">' + Common._e("Skip") + '</a>';
                    html += '</div>';
                html += '</div>';

                // Append HTML code
                $('body').append(html);

                // Attach events
                self._suggestCheckEvents();
            } else {
                self.join_suggest = groupchat_arr;

                Connection.triggerConnected();
            }
        } catch(e) {
            Console.error('Groupchat.suggestCheck', e);
        }

    };


    /**
     * Bans a user from given room
     * @public
     * @param {string} room_xid
     * @param {string} ban_xid
     * @param {string} reason
     * @return {object}
     */
    self.banUser = function(room_xid, ban_xid, reason) {

        try {
            // We check if the user exists
            if(!ban_xid) {
                Board.openThisInfo(6);

                Console.warn('Could not ban user with XID: ' + ban_xid + ' from room: ' + room_xid);
            } else {
                // We generate the ban IQ
                var iq = new JSJaCIQ();
                iq.setTo(room_xid);
                iq.setType('set');

                var iqQuery = iq.setQuery(NS_MUC_ADMIN);
                var item = iqQuery.appendChild(iq.buildNode('item', {
                    'affiliation': 'outcast',
                    'jid': ban_xid,
                    'xmlns': NS_MUC_ADMIN
                }));

                if(reason) {
                    item.appendChild(iq.buildNode('reason', {
                        'xmlns': NS_MUC_ADMIN
                    }, reason));
                }

                con.send(iq, Errors.handleReply);

                Console.log('Banned user with XID: ' + ban_xid + ' from room: ' + room_xid);
            }
        } catch(e) {
            Console.error('Groupchat.banUser', e);
        }

    };


    /**
     * Kicks a user from given room
     * @public
     * @param {string} room_xid
     * @param {string} kick_xid
     * @param {string} nick
     * @param {string} reason
     * @return {object}
     */
    self.kickUser = function(room_xid, kick_xid, nick, reason) {

        try {
            // We check if the user exists
            if(!room_xid) {
                Board.openThisInfo(6);

                Console.warning('Could not kick user "' + nick + '" from room: ' + room_xid);
            } else {
                // We generate the kick IQ
                var iq = new JSJaCIQ();
                iq.setTo(room_xid);
                iq.setType('set');

                var iqQuery = iq.setQuery(NS_MUC_ADMIN);
                var item = iqQuery.appendChild(iq.buildNode('item', {
                    'nick': nick,
                    'role': 'none',
                    'xmlns': NS_MUC_ADMIN
                }));

                if(reason) {
                    item.appendChild(iq.buildNode('reason', {
                        'xmlns': NS_MUC_ADMIN
                    }, reason));
                }

                con.send(iq, Errors.handleReply);

                Console.info('Kicked user "' + nick + '" from room: ' + room_xid);
            }
        } catch(e) {
            Console.error('Groupchat.kickUser', e);
        }

    };


    /**
     * Promotes an user as groupchat moderator
     * @public
     * @param {string} muc_xid
     * @param {string} user_xid
     * @return {object}
     */
    self.promoteModerator = function(muc_xid, user_xid) {

        try {
            MUCAdmin.setAffiliation(muc_xid, user_xid, 'admin');
        } catch(e) {
            Console.error('Groupchat.promoteModerator', e);
        }

    };


    /**
     * Demotes an user as being groupchat moderator
     * @public
     * @param {string} muc_xid
     * @param {string} user_xid
     * @return {object}
     */
    self.demoteModerator = function(muc_xid, user_xid) {

        try {
            MUCAdmin.setAffiliation(muc_xid, user_xid, 'none');
        } catch(e) {
            Console.error('Groupchat.demoteModerator', e);
        }

    };


    /**
     * Returns user affiliation in groupchat
     * @public
     * @param {string} muc_xid
     * @param {string} nick
     * @return {object}
     */
    self.affiliationUser = function(muc_xid, nick) {

        try {
            // Initial data
            var affiliations = ['none', 'member', 'admin', 'owner'];
            var affiliation = {
                code: 0,
                name: affiliations[0]
            };

            // Get user data
            var user_sel = $('#' + hex_md5(muc_xid) + ' .list .user[data-nick="' + escape(nick) + '"]');

            if(user_sel.size()) {
                var user_affiliation = user_sel.attr('data-affiliation');

                if(user_affiliation && Utils.existArrayValue(affiliations, user_affiliation)) {
                    affiliation.code = Utils.indexArrayValue(affiliations, user_affiliation);
                    affiliation.name = user_affiliation;
                }
            }

            return affiliation;
        } catch(e) {
            Console.error('Groupchat.affiliationUser', e);
        }

    };


    /**
     * Returns our affiliation in groupchat
     * @public
     * @param {string} muc_xid
     * @return {object}
     */
    self.affiliationMe = function(muc_xid) {

        try {
            // Get my nick
            var my_nick = unescape($('#' + hex_md5(muc_xid)).attr('data-nick') || '');

            // Return my affiliation
            return self.affiliationUser(muc_xid, my_nick);
        } catch(e) {
            Console.error('Groupchat.affiliationMe', e);
        }

    };

    /**
     * Sends initial configuration of the room
     * @private
     * @param {string} pid
     * @param {string} xid
     * @return {undefined}
     */
    self._initialConfiguration = function(pid, xid) {

        try {
            var iq = new JSJaCIQ();

            iq.setTo(xid);
            iq.setType('set');
            iq.setID('first-muc-config-' + pid);

            var iqQuery = iq.setQuery(NS_MUC_OWNER);

            // Configure room with nil(null) fields
            var iqX = iqQuery.appendChild(iq.buildNode('x', {
                'xmlns': NS_XDATA,
                'type': 'submit'
            }));

            // Build a new field node
            var iqField = iqX.appendChild(iq.buildNode('field', {
                'var': 'FORM_TYPE',
                'type': 'hidden',
                'xmlns': NS_XDATA
            }));

            iqField.appendChild(iq.buildNode('value', {
                'xmlns': NS_XDATA
            }, NS_MUC_CONFIG));

            con.send(iq);

            Console.info('Groupchat._initialConfiguration', 'Sent initial room configuration: ' + xid);
        } catch(e) {
            Console.error('Groupchat._initialConfiguration', e);
        }
    };



    /**
     * Return class scope
     */
    return self;

})();
