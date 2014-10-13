/*

Jappix - An open social platform
These are the chat JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Eric, Maranda

*/

// Bundle
var Chat = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Apply generate events
     * @private
     * @param {string} path
     * @param {string} id
     * @param {string} xid
     * @return {undefined}
     */
    self._generateEvents = function(path, id, xid) {

        try {
            // Click event: chat cleaner
            $(path + 'tools-clear').click(function() {
                self.clean(id);
            });

            // Click event: call (audio)
            $(path + 'tools-jingle-audio').click(function() {
                Jingle.start(xid, 'audio');
            });

            // Click event: call (video)
            $(path + 'tools-jingle-video').click(function() {
                Jingle.start(xid, 'video');
            });

            // Click event: user-infos
            $(path + 'tools-infos').click(function() {
                UserInfos.open(xid);
            });
        } catch(e) {
            Console.error('Chat._generateEvents', e);
        }

    };


    /**
     * Apply generate events
     * @private
     * @param {object} input_sel
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self._createEvents = function(input_sel, xid, hash) {

        try {
            self._createEventsInput(input_sel, hash);
            self._createEventsKey(input_sel, xid, hash);
            self._createEventsMouse(xid, hash);
        } catch(e) {
            Console.error('Chat._createEvents', e);
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
            input_sel.focus(function() {
                // Clean notifications for this chat
                Interface.chanCleanNotify(hash);

                // Store focus on this chat!
                Interface.chat_focus_hash = hash;
            });

            input_sel.blur(function() {
                // Reset storage about focus on this chat!
                if(Interface.chat_focus_hash == hash) {
                    Interface.chat_focus_hash = null;
                }
            });
        } catch(e) {
            Console.error('Chat._createEventsInput', e);
        }

    };


    /**
     * Apply generate events (key)
     * @private
     * @param {object} input_sel
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self._createEventsKey = function(input_sel, xid, hash) {

        try {
            input_sel.keydown(function(e) {
                if(e.keyCode == 13) {
                    // Enter key
                    if(e.shiftKey || e.ctrlKey) {
                        // Add a new line
                        input_sel.val(input_sel.val() + '\n');
                    } else {
                        if(Correction.isIn(xid) === true) {
                            var corrected_value = input_sel.val().trim();

                            if(corrected_value) {
                                // Send the corrected message
                                Correction.send(xid, 'chat', corrected_value);
                            }

                            Correction.leave(xid);
                        } else {
                            // Send the message
                            Message.send(hash, 'chat');
                        }

                        // Reset the composing database entry
                        DataStore.setDB(Connection.desktop_hash, 'chatstate', xid, 'off');
                    }

                    return false;
                } else if(e.keyCode == 8) {
                    // Leave correction mode? (another way, by flushing input value progressively)
                    if(Correction.isIn(xid) === true && !input_sel.val()) {
                        Correction.leave(xid);
                    }
                }
            });

            input_sel.keyup(function(e) {
                if(e.keyCode == 27) {
                    // Escape key
                    input_sel.val('');

                    // Leave correction mode? (simple escape way)
                    if(Correction.isIn(xid) === true) {
                        Correction.leave(xid);
                    }
                } else {
                    Correction.detect(xid, input_sel);
                }
            });
        } catch(e) {
            Console.error('Chat._createEventsKey', e);
        }

    };


    /**
     * Apply generate events (mouse)
     * @private
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self._createEventsMouse = function(xid, hash) {

        try {
            // Scroll in chat content
            $('#page-engine #' + hash + ' .content').scroll(function() {
                var self = this;

                if(Features.enabledMAM() && !(xid in MAM.map_pending)) {
                    var has_state = xid in MAM.map_states;
                    var rsm_count = has_state ? MAM.map_states[xid].rsm.count : 1;
                    var rsm_before = has_state ? MAM.map_states[xid].rsm.first : '';

                    // Request more archives?
                    if(rsm_count > 0 && $(this).scrollTop() < MAM.SCROLL_THRESHOLD) {
                        var was_scroll_top = $(self).scrollTop() <= 32;
                        var wait_mam = $('#' + hash).find('.wait-mam');
                        wait_mam.show();

                        MAM.getArchives({
                            'with': xid
                        }, {
                            'max': MAM.REQ_MAX,
                            'before': rsm_before
                        }, function() {
                            var wait_mam_height = was_scroll_top ? 0 : wait_mam.height();
                            wait_mam.hide();

                            // Restore scroll?
                            if($(self).scrollTop() < MAM.SCROLL_THRESHOLD) {
                                var sel_mam_chunk = $(self).find('.mam-chunk:first');

                                var cont_padding_top = parseInt($(self).css('padding-top').replace(/[^-\d\.]/g, ''));
                                var cont_one_group_margin_bottom = parseInt(sel_mam_chunk.find('.one-group:last').css('margin-bottom').replace(/[^-\d\.]/g, ''));
                                var cont_mam_chunk_height = sel_mam_chunk.height();

                                $(self).scrollTop(wait_mam_height + cont_padding_top + cont_one_group_margin_bottom + cont_mam_chunk_height);
                            }
                        });
                    }
                }
            });
        } catch(e) {
            Console.error('Chat._createEventsMouse', e);
        }

    };


    /**
     * Apply generate events
     * @private
     * @param {string} type
     * @param {string} id
     * @param {string} xid
     * @return {object}
     */
    self._generateChatCode = function(type, id, xid) {

        var code_args = {};

        try {
            // Groupchat special code
            if(type == 'groupchat') {
                code_args.attributes = ' data-type="groupchat" data-correction="true"';
                code_args.avatar = '';
                code_args.name = '<p class="bc-infos"><b>' + Common._e("Subject") + '</b> <span class="muc-topic">' + Common._e("no subject defined for this room.") + '</span></p>';
                code_args.code = '<div class="content groupchat-content" id="chat-content-' + id + '"></div>' +
                                 '<div class="list"><div class="moderator role"><p class="title">' + Common._e("Moderators") + '</p></div>' +
                                 '<div class="participant role"><p class="title">' + Common._e("Participants") + '</p></div>' +
                                 '<div class="visitor role"><p class="title">' + Common._e("Visitors") + '</p></div>' +
                                 '<div class="none role"><p class="title">' + Common._e("Others") + '</p></div></div>';
                code_args.link = '<a href="#" class="tools-mucadmin tools-tooltip talk-images chat-tools-content" title="' + Common._e("Administration panel for this room") + '"></a>';
                code_args.style = '';

                // Is this a gateway?
                if(xid.match(/%/)) {
                    code_args.disabled = '';
                } else {
                    code_args.disabled = ' disabled=""';
                }
            } else {
                code_args.mam = '<div class="wait-mam wait-small"></div>';
                code_args.attributes = ' data-type="chat"';
                code_args.avatar = '<div class="avatar-container"><img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" /></div>';
                code_args.name = '<div class="bc-pep"></div><p class="bc-infos"><span class="unavailable show talk-images"></span></p>';
                code_args.code = '<div class="content" id="chat-content-' + id + '">' + code_args.mam + '</div>';
                code_args.link = '<a href="#" class="tools-jingle-audio tools-tooltip talk-images chat-tools-content" title="' + Common._e("Call (audio only)") + '"></a>' +
                                 '<a href="#" class="tools-jingle-video tools-tooltip talk-images chat-tools-content" title="' + Common._e("Call (video)") + '"></a>' +
                                 '<a href="#" class="tools-infos tools-tooltip talk-images chat-tools-content" title="' + Common._e("Show user profile") + '"></a>';
                code_args.style = ' style="display: none;"';
                code_args.disabled = '';
            }

            // Not a groupchat private chat, we can use the buddy add icon
            if((type == 'chat') || (type == 'groupchat')) {
                var title;

                if(type == 'chat') {
                    title = Common._e("Add this contact to your friends");
                } else {
                    title = Common._e("Add this groupchat to your favorites");
                }

                code_args.link += '<a href="#" class="tools-add tools-tooltip talk-images chat-tools-content" title="' + title + '"></a>';
            }

            // IE DOM parsing bug fix
            code_args.style_picker = '<div class="chat-tools-content chat-tools-style"' + code_args.style + '>' +
                                            '<a href="#" class="tools-style tools-tooltip talk-images"></a>' +
                                         '</div>';

            if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                code_args.style_picker = '';
            }
        } catch(e) {
            Console.error('Chat._generateChatCode', e);
        } finally {
            return code_args;
        }

    };


    /**
     * Correctly opens a new chat
     * @public
     * @param {string} xid
     * @param {string} type
     * @param {string} nickname
     * @param {string} password
     * @param {string} title
     * @return {boolean}
     */
    self.checkCreate = function(xid, type, nickname, password, title) {

        try {
            // No XID?
            if(!xid) {
                return false;
            }

            // We generate some stuffs
            var hash = hex_md5(xid);
            var name;

            // Gets the name of the user/title of the room
            if(title) {
                name = title;
            } else {
                // Private groupchat chat
                if(type == 'private') {
                    name = Common.thisResource(xid);
                }

                // XMPP-ID
                else if(xid.indexOf('@') != -1) {
                    name = Name.getBuddy(xid);
                }

                // Gateway
                else {
                    name = xid;
                }
            }

            // If the target div does not exist
            if(!Common.exists('#' + hash)) {
                // We check the type of the chat to open
                if((type == 'chat') || (type == 'private')) {
                    self.create(hash, xid, name, type);
                } else if(type == 'groupchat') {
                    // Try to read the room stored configuration
                    if(!Utils.isAnonymous() && (!nickname || !password || !title)) {
                        // Catch the room data
                        var fData = $(Common.XMLFromString(DataStore.getDB(Connection.desktop_hash, 'favorites', xid)));
                        var fNick = fData.find('nick').text();
                        var fPwd = fData.find('password').text();
                        var fName = fData.find('name').text();

                        // Apply the room data
                        if(!nickname && fNick)
                            nickname = fNick;
                        if(!password && fPwd)
                            password = fPwd;
                        if(!title && fName)
                            name = fName;
                    }

                    Groupchat.create(hash, xid, name, nickname, password);
                }
            }

            // Switch to the newly-created chat
            Interface.switchChan(hash);
        } catch(e) {
            Console.error('Chat.checkCreate', e);
        } finally {
            return false;
        }

    };


    /**
     * Generates the chat DOM elements
     * @public
     * @param {string} type
     * @param {string} id
     * @param {string} xid
     * @param {string} nick
     * @return {undefined}
     */
    self.generate = function(type, id, xid, nick) {

        try {
            // Generate some stuffs
            var path = '#' + id + ' .';
            var escaped_xid = escape(xid);

            // Special code
            var chat_args = self._generateChatCode(type, id, xid);

            // Append the chat HTML code
            $('#page-engine').append(
                '<div id="' + id + '" class="page-engine-chan chat one-counter"' + chat_args.attributes + ' data-xid="' + escaped_xid + '">' +
                    '<div class="top ' + id + '">' +
                        chat_args.avatar +

                        '<div class="name">' +
                            '<p class="bc-name bc-name-nick">' + nick.htmlEnc() + '</p>' +
                            chat_args.name +
                        '</div>' +
                    '</div>' +

                    chat_args.code +

                    '<div class="text">' +
                        '<div class="footer">' +
                            '<div class="chat-tools-content chat-tools-smileys">' +
                                '<a href="#" class="tools-smileys tools-tooltip talk-images"></a>' +
                            '</div>' +

                            chat_args.style_picker +

                            '<div class="chat-tools-content chat-tools-file">' +
                                '<a href="#" class="tools-file tools-tooltip talk-images"></a>' +
                            '</div>' +

                            '<div class="chat-tools-content chat-tools-save">' +
                                '<a href="#" class="tools-save tools-tooltip talk-images"></a>' +
                            '</div>' +

                            '<a href="#" class="tools-clear tools-tooltip talk-images chat-tools-content" title="' + Common._e("Clean current chat") + '"></a>' +

                            chat_args.link +
                        '</div>' +

                        '<div class="compose">' +
                            '<textarea class="message-area focusable" ' + chat_args.disabled + ' data-to="' + escaped_xid + '" /></textarea>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            self._generateEvents(path, id, xid);
        } catch(e) {
            Console.error('Chat.generate', e);
        }

    };


    /**
     * Generates the chat switch elements
     * @public
     * @param {string} type
     * @param {string} id
     * @param {string} xid
     * @param {string} nick
     * @return {undefined}
     */
    self.generateSwitch = function(type, id, xid, nick) {

        try {
            // Path to the element
            var chat_switch = '#page-switch .';

            // Special code
            var special_class = ' unavailable';
            var show_close = true;

            // Groupchat
            if(type == 'groupchat') {
                special_class = ' groupchat-default';

                if(Utils.isAnonymous() && (xid == Common.generateXID(ANONYMOUS_ROOM, 'groupchat'))) {
                    show_close = false;
                }
            }

            // Generate the HTML code
            var html = '<div class="' + id + ' switcher chan" onclick="return Interface.switchChan(\'' + Utils.encodeOnclick(id) + '\')">' +
                       '<div class="icon talk-images' + special_class + '"></div>' +

                       '<div class="name">' + nick.htmlEnc() + '</div>';

            // Show the close button if not MUC and not anonymous
            if(show_close) {
                html += '<div class="exit" ' +
                              'title="' + Common._e("Close this tab") + '" ' +
                              'onclick="return Interface.quitThisChat(\'' + Utils.encodeOnclick(xid) + '\', \'' + Utils.encodeOnclick(id) + '\', \'' + Utils.encodeOnclick(type) + '\');">' +
                                'x' +
                        '</div>';
            }

            // Close the HTML
            html += '</div>';

            // Append the HTML code
            $(chat_switch + 'chans, ' + chat_switch + 'more-content').append(html);
        } catch(e) {
            Console.error('Chat.generateSwitch', e);
        }

    };


    /**
     * Cleans given the chat lines
     * @public
     * @param {string} chat
     * @return {undefined}
     */
    self.clean = function(chat) {

        try {
            // Remove the messages
            $('#page-engine #' + chat + ' .content .one-group').remove();

            // Clear the history database
            Message.removeLocalArchive(chat);

            // Focus again
            $(document).oneTime(10, function() {
                $('#page-engine #' + chat + ' .text .message-area').focus();
            });
        } catch(e) {
            Console.error('Chat.clean', e);
        }

    };


    /**
     * Returns whether chat exists or not
     * @public
     * @param {string} hash
     * @return {boolean}
     */
    self.exists = function(hash) {

        exists = false;

        try {
            if(hash) {
                exists = Common.exists('#' + hash + '.page-engine-chan[data-type="chat"]');
            }
        } catch(e) {
            Console.error('Chat.exists', e);
        } finally {
            return exists;
        }

    };


    /**
     * Creates a new chat
     * @public
     * @param {string} hash
     * @param {string} xid
     * @param {string} nick
     * @param {string} type
     * @return {undefined}
     */
    self.create = function(hash, xid, nick, type) {

        try {
            Console.info('New chat: ' + xid);

            // Create the chat content
            self.generate(type, hash, xid, nick);

            // Create the chat switcher
            self.generateSwitch(type, hash, xid, nick);

            // Is this a chat?
            if(type == 'chat') {
                // MAM? Get archives from there!
                if(Features.enabledMAM()) {
                    MAM.getArchives({
                        'with': xid
                    }, {
                        'max': MAM.REQ_MAX,
                        'before': ''
                    });
                } else {
                    // Restore the chat history
                    var chat_history = Message.readLocalArchive(hash);

                    if(chat_history) {
                        // Generate hashs
                        var my_hash = hex_md5(Common.getXID());
                        var friend_hash = hex_md5(xid);

                        // Add chat history HTML
                        var path_sel = $('#' + hash);

                        path_sel.find('.content').append(chat_history);

                        // Filter old groups & messages
                        var one_group_sel = path_sel.find('.one-group');
                        one_group_sel.filter('[data-type="user-message"]').addClass('from-history').attr('data-type', 'old-message');
                        path_sel.find('.user-message').removeClass('user-message').addClass('old-message');

                        // Regenerate user names
                        one_group_sel.filter('.' + my_hash + ' b.name').text(
                            Name.getBuddy(Common.getXID())
                        );

                        one_group_sel.filter('.' + friend_hash + ' b.name').text(
                            Name.getBuddy(xid)
                        );

                        // Regenerate group dates
                        one_group_sel.each(function() {
                            var current_stamp = parseInt($(this).attr('data-stamp'), 10);
                            $(this).find('span.date').text(DateUtils.relative(current_stamp));
                        });

                        // Regenerate avatars
                        if(Common.exists('#' + hash + ' .one-group.' + my_hash + ' .avatar-container')) {
                            Avatar.get(Common.getXID(), 'cache', 'true', 'forget');
                        }

                        if(Common.exists('#' + hash + ' .one-group.' + friend_hash + ' .avatar-container')) {
                            Avatar.get(xid, 'cache', 'true', 'forget');
                        }
                    }
                }

                // Add button
                if(!Roster.isFriend(xid)) {
                    $('#' + hash + ' .tools-add').click(function() {
                        // Hide the icon (to tell the user all is okay)
                        $(this).hide();

                        // Send the subscribe request
                        Roster.addThisContact(xid, nick);
                    }).show();
                }
            }

            // We catch the user's informations (like this avatar, vcard, and so on...)
            UserInfos.get(hash, xid, nick, type);

            // The icons-hover functions
            Tooltip.icons(xid, hash);

            // The event handlers
            var input_sel = $('#page-engine #' + hash + ' .message-area');
            self._createEvents(input_sel, xid, hash);

            // Input events
            ChatState.events(input_sel, xid, hash, 'chat');
            Markers.events(input_sel, xid, hash, 'chat');
        } catch(e) {
            Console.error('Chat.create', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
