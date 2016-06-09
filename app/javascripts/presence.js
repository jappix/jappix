/*

Jappix - An open social platform
These are the presence JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Presence = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.first_sent = false;
    self.auto_idle = false;


    /**
     * Handles groupchat presence
     * @private
     * @param {string} from
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} xid_hash
     * @param {string} resource
     * @param {object} node_sel
     * @param {object} presence
     * @param {number} priority
     * @param {boolean} has_photo
     * @param {string} checksum
     * @param {string} caps
     * @return {undefined}
     */
    self._handleGroupchat = function(from, xid, hash, type, show, status, xid_hash, resource, node_sel, presence, priority, has_photo, checksum, caps) {

        try {
            var resources_obj, xml;

            var x_muc = node_sel.find('x[xmlns="' + NS_MUC_USER + '"]:first');
            var item_sel = x_muc.find('item');

            var affiliation = item_sel.attr('affiliation');
            var role = item_sel.attr('role');
            var reason = item_sel.find('reason').text();
            var iXID = item_sel.attr('jid');
            var iNick = item_sel.attr('nick');

            var nick = resource;
            var message_time = DateUtils.getCompleteTime();
            var not_initial = !Common.exists('#' + xid_hash + '[data-initial="true"]');

            // Read the status code
            var status_code = [];

            x_muc.find('status').each(function() {
                status_code.push(parseInt($(this).attr('code')));
            });

            if(type && (type == 'unavailable')) {
                // User quitting
                self.displayMUC(
                    from,
                    xid_hash,
                    hash,
                    type,
                    show,
                    status,
                    affiliation,
                    role,
                    reason,
                    status_code,
                    iXID,
                    iNick,
                    message_time,
                    nick,
                    not_initial
                );

                DataStore.removeDB(Connection.desktop_hash, 'presence-stanza', from);
                resources_obj = self.removeResource(xid, resource);
            } else {
                // User joining

                // Fixes M-Link first presence bug (missing ID!)
                if(nick == Name.getMUCNick(xid_hash) &&
                    presence.getID() === null &&
                    !Common.exists('#page-engine #' + xid_hash + ' .list .' + hash)) {
                    Groupchat.handleMUC(presence);

                    Console.warn('Passed M-Link MUC first presence handling.');
                } else {
                    self.displayMUC(
                        from,
                        xid_hash,
                        hash,
                        type,
                        show,
                        status,
                        affiliation,
                        role,
                        reason,
                        status_code,
                        iXID,
                        iNick,
                        message_time,
                        nick,
                        not_initial
                    );

                    xml = '<presence from="' + Common.encodeQuotes(from) + '">' +
                              '<priority>' + priority.htmlEnc() + '</priority>' +
                              '<show>' + show.htmlEnc() + '</show>' +
                              '<type>' + type.htmlEnc() + '</type>' +
                              '<status>' + status.htmlEnc() + '</status>' +
                              '<avatar>' + has_photo.htmlEnc() + '</avatar>' +
                              '<checksum>' + checksum.htmlEnc() + '</checksum>' +
                              '<caps>' + caps.htmlEnc() + '</caps>' +
                          '</presence>';

                    DataStore.setDB(Connection.desktop_hash, 'presence-stanza', from, xml);
                    resources_obj = self.addResource(xid, resource);
                }
            }

            // Manage the presence
            self.processPriority(from, resource, resources_obj);
            self.funnel(from, hash);
        } catch(e) {
            Console.error('Groupchat._handleGroupchat', e);
        }

    };


    /**
     * Handles user presence
     * @private
     * @param {string} from
     * @param {string} xid
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} xid_hash
     * @param {string} resource
     * @param {object} node_sel
     * @param {number} priority
     * @param {boolean} has_photo
     * @param {string} checksum
     * @param {string} caps
     * @return {undefined}
     */
    self._handleUser = function(from, xid, type, show, status, xid_hash, resource, node_sel, priority, has_photo, checksum, caps) {

        try {
            var resources_obj, xml;

            // Subscribed/Unsubscribed stanzas
            if((type == 'subscribed') || (type == 'unsubscribed')) {
                return;
            }

            // Subscribe stanza
            else if(type == 'subscribe') {
                // This is a buddy we can safely authorize, because we added him to our roster
                if(Common.exists('#roster .buddy[data-xid="' + escape(xid) + '"]')) {
                    self.acceptSubscribe(xid);
                }

                // We do not know this entity, we'd be better ask the user
                else {
                    // Get the nickname
                    var nickname = node_sel.find('nick[xmlns="' + NS_NICK + '"]:first').text();

                    // New notification
                    Notification.create('subscribe', xid, [xid, nickname], status);
                }
            }

            // Unsubscribe stanza
            else if(type == 'unsubscribe') {
                Roster.send(xid, 'remove');
            }

            // Other stanzas
            else {
                // Unavailable/error presence
                if(type == 'unavailable') {
                    DataStore.removeDB(Connection.desktop_hash, 'presence-stanza', from);
                    resources_obj = self.removeResource(xid, resource);
                } else {
                    xml = '<presence from="' + Common.encodeQuotes(from) + '">' +
                                '<priority>' + priority.htmlEnc() + '</priority>' +
                                '<show>' + show.htmlEnc() + '</show>' +
                                '<type>' + type.htmlEnc() + '</type>' +
                                '<status>' + status.htmlEnc() + '</status>' +
                                '<avatar>' + has_photo.htmlEnc() + '</avatar>' +
                                '<checksum>' + checksum.htmlEnc() + '</checksum>' +
                                '<caps>' + caps.htmlEnc() + '</caps>' +
                          '</presence>';

                    DataStore.setDB(Connection.desktop_hash, 'presence-stanza', from, xml);
                    resources_obj = self.addResource(xid, resource);
                }

                // We manage the presence
                self.processPriority(xid, resource, resources_obj);
                self.funnel(xid, xid_hash);

                // We display the presence in the current chat
                if(Common.exists('#' + xid_hash)) {
                    var dStatus = self.filterStatus(xid, status, false);

                    if(dStatus) {
                        dStatus = ' (' + dStatus + ')';
                    }

                    // Generate the presence-in-chat code
                    var dName = Name.getBuddy(from).htmlEnc();
                    var dBody = dName + ' (' + from + ') ' + Common._e("is now") + ' ' + self.humanShow(show, type) + dStatus;

                    // Check whether it has been previously displayed
                    var can_display = ($('#' + xid_hash + ' .one-line.system-message:last').html() != dBody);

                    if(can_display) {
                        Message.display(
                            'chat',
                            xid,
                            xid_hash,
                            dName,
                            dBody,
                            DateUtils.getCompleteTime(),
                            DateUtils.getTimeStamp(),
                            'system-message',
                            false
                        );
                    }
                }
            }

            // Get disco#infos for this presence (related to Caps)
            Caps.getDiscoInfos(from, caps);
        } catch(e) {
            Console.error('Groupchat._handleUser', e);
        }

    };


    /**
     * Attaches picker events
     * @private
     * @param {string} name
     * @param {object} element_text_sel
     * @param {function} send_fn
     * @return {boolean}
     */
    self._eventsPicker = function(element_picker_sel) {

        try {
            // Disabled?
            if(element_picker_sel.hasClass('disabled')) {
                return false;
            }

            // Initialize some vars
            var path = '#my-infos .f-presence div.bubble';
            var show_val = self.getUserShow();

            var shows_obj = {
                'xa': Common._e("Not available"),
                'away': Common._e("Away"),
                'available': Common._e("Available")
            };

            var can_append = !Common.exists(path);

            // Add this bubble!
            Bubble.show(path);

            if(!can_append) {
                return false;
            }

            // Generate the HTML code
            var html = '<div class="bubble removable">';

            for(var cur_show_name in shows_obj) {
                // Yet in use: no need to display it!
                if(cur_show_name == show_val) {
                    continue;
                }

                html += '<a href="#" class="talk-images" data-value="' + cur_show_name + '" title="' + shows_obj[cur_show_name] + '"></a>';
            }

            html += '</div>';

            // Append the HTML code
            $('#my-infos .f-presence').append(html);

            // Click event
            $(path + ' a').click(function() {
                // Update the presence show marker
                $('#my-infos .f-presence a.picker').attr(
                    'data-value',
                    $(this).attr('data-value')
                );

                // Close the bubble
                Bubble.close();

                // Focus on the status input
                $(document).oneTime(10, function() {
                    $('#presence-status').focus();
                });

                return false;
            });
        } catch(e) {
            Console.error('Groupchat._eventsPicker', e);
        } finally {
            return false;
        }

    };


    /**
     * Sends the user first presence
     * @public
     * @param {string} checksum
     * @return {undefined}
     */
    self.sendFirst = function(checksum) {

        try {
            Console.info('First presence sent.');

            var presence_status_sel = $('#presence-status');

            // Jappix is now ready: change the title
            Interface.title('talk');

            // Anonymous check
            var is_anonymous = Utils.isAnonymous();

            // Update our marker
            self.first_sent = true;

            // Try to use the last status message
            var status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status') || '';

            // We tell the world that we are online
            if(!is_anonymous) {
                self.send('', '', '', status, checksum);
            }

            // Any status to apply?
            if(status) {
                presence_status_sel.val(status);
            }

            // Enable the presence picker
            presence_status_sel.removeAttr('disabled');
            $('#my-infos .f-presence a.picker').removeClass('disabled');

            // We set the last activity stamp
            DateUtils.presence_last_activity = DateUtils.getTimeStamp();

            // We store our presence
            DataStore.setDB(Connection.desktop_hash, 'presence-show', 1, 'available');

            // Not anonymous
            if(!is_anonymous) {
                // We get the stored bookmarks (because of the photo hash and some other stuffs, we must get it later)
                Storage.get(NS_BOOKMARKS);

                // We open a new chat if a XMPP link was submitted
                if((parent.location.hash != '#OK') && XMPPLinks.links_var.x) {
                    // A link is submitted in the URL
                    XMPPLinks.go(XMPPLinks.links_var.x);

                    // Set a OK status
                    parent.location.hash = 'OK';
                }
            }
        } catch(e) {
            Console.error('Presence.sendFirst', e);
        }

    };


    /**
     * Handles incoming presence packets
     * @public
     * @param {object} presence
     * @return {undefined}
     */
    self.handle = function(presence) {

        try {
            // We define everything needed here
            var from = Common.fullXID(Common.getStanzaFrom(presence));
            var hash = hex_md5(from);
            var node_sel = $(presence.getNode());
            var xid = Common.bareXID(from);
            var xid_hash = hex_md5(xid);
            var resource = Common.thisResource(from);

            // We get the type content
            var type = presence.getType() || '';

            // We get the priority content
            var priority = presence.getPriority() + '';
            if(!priority || (type == 'error')) {
                priority = '0';
            }

            // We get the show content
            var show = presence.getShow();
            if(!show || (type == 'error')) {
                show = '';
            }

            // We get the status content
            var status = presence.getStatus();
            if(!status || (type == 'error')) {
                status = '';
            }

            // We get the photo content
            var photo = node_sel.find('x[xmlns="' + NS_VCARD_P + '"]:first photo');
            var checksum = photo.text();
            var has_photo = (photo.size() && (type != 'error')) ? 'true' : 'false';

            // We get the CAPS content
            var caps = node_sel.find('c[xmlns="' + NS_CAPS + '"]:first').attr('ver');
            if(!caps || (type == 'error')) {
                caps = '';
            }

            // This presence comes from another resource of my account with a difference avatar checksum
            if(xid == Common.getXID() &&
                has_photo == 'true' &&
                checksum != DataStore.getDB(Connection.desktop_hash, 'checksum', 1)) {
                Avatar.get(Common.getXID(), 'force', 'true', 'forget');
            }

            if(Utils.isPrivate(xid)) {
                // Groupchat presence
                self._handleGroupchat(
                    from,
                    xid,
                    hash,
                    type,
                    show,
                    status,
                    xid_hash,
                    resource,
                    node_sel,
                    presence,
                    priority,
                    has_photo,
                    checksum,
                    caps
                );
            } else {
                // User or gateway presence
                self._handleUser(
                    from,
                    xid,
                    type,
                    show,
                    status,
                    xid_hash,
                    resource,
                    node_sel,
                    priority,
                    has_photo,
                    checksum,
                    caps
                );
            }

            Console.log('Presence received (type: ' + (type || 'available') + ', show: ' + (show || 'none') + ') from ' + from);
        } catch(e) {
            Console.error('Presence.handle', e);
        }

    };


    /**
     * Displays a MUC presence
     * @public
     * @param {string} from
     * @param {string} roomHash
     * @param {string} hash
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} affiliation
     * @param {string} role
     * @param {string} reason
     * @param {string} status_code
     * @param {string} iXID
     * @param {string} iNick
     * @param {string} message_time
     * @param {string} nick
     * @param {boolean} initial
     * @return {undefined}
     */
    self.displayMUC = function(from, roomHash, hash, type, show, status, affiliation, role, reason, status_code, iXID, iNick, message_time, nick, initial) {

        try {
            // Generate the values
            var room_xid = Common.bareXID(from);
            var thisUser = '#page-engine #' + roomHash + ' .list .' + hash;
            var thisPrivate = $('#' + hash + ' .message-area');
            var nick_html = nick.htmlEnc();
            var real_xid = '';
            var write = nick_html + ' ';
            var notify = false;

            // Reset data?
            if(!role) {
                role = 'participant';
            }
            if(!affiliation) {
                affiliation = 'none';
            }

            // Must update the role?
            if(Common.exists(thisUser) && (($(thisUser).attr('data-role') != role) || ($(thisUser).attr('data-affiliation') != affiliation))) {
                $(thisUser).remove();
            }

            // Any XID submitted?
            if(iXID) {
                real_xid = ' data-realxid="' + iXID + '"';
                iXID = Common.bareXID(iXID);
                write += ' (<a onclick="return Chat.checkCreate(\'' + Utils.encodeOnclick(iXID) + '\', \'chat\');" href="xmpp:' + Utils.encodeOnclick(iXID) + '">' + iXID + '</a>) ';
            }

            // User does not exists yet
            if(!Common.exists(thisUser) && (!type || (type == 'available'))) {
                var myself = '';

                // Is it me?
                if(nick == Name.getMUCNick(roomHash)) {
                    // Enable the room
                    $('#' + roomHash + ' .message-area').removeAttr('disabled');

                    // Marker
                    myself = ' myself';
                }

                // Set the user in the MUC list
                $('#' + roomHash + ' .list .' + role + ' .title').after(
                    '<div class="user ' + hash + myself + '" data-xid="' + Common.encodeQuotes(from) + '" data-nick="' + escape(nick) + '"' + real_xid + ' data-role="' + Common.encodeQuotes(role) + '" data-affiliation="' + Common.encodeQuotes(affiliation) + '">' +
                        '<div class="user-details">' +
                            '<div class="name talk-images available">' + nick_html + '</div>' +

                            '<div class="avatar-container">' +
                                '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                            '</div>' +

                            '<div class="clear"></div>' +
                        '</div>' +

                        '<div class="user-actions">' +
                            '<span class="action promote">' +
                                '<a href="#" class="talk-images" title="' + Common._e("Promote as moderator") + '"></a>' +
                            '</span>' +

                            '<span class="action demote">' +
                                '<a href="#" class="talk-images" title="' + Common._e("Remove moderator status") + '"></a>' +
                            '</span>' +

                            '<span class="action add">' +
                                '<a href="#" class="talk-images" title="' + Common._e("Add to my contacts") + '"></a>' +
                            '</span>' +

                            '<span class="action kick">' +
                                '<a href="#" class="talk-images" title="' + Common._e("Kick from room") + '"></a>' +
                            '</span>' +

                            '<div class="clear"></div>' +
                        '</div>' +
                    '</div>'
                );

                // Click event
                if(nick != Name.getMUCNick(roomHash)) {
                    $(thisUser).hover(function() {
                        if(iXID && Groupchat.affiliationMe(room_xid).code >= 2) {
                            var user_actions_sel = $(this).find('.user-actions');
                            var user_actions_btn_sel = user_actions_sel.find('.action');

                            // Update buttons
                            var i;
                            var hide_btns = [];

                            var user_affiliation = Groupchat.affiliationUser(room_xid, nick);

                            if(user_affiliation.name == 'owner') {
                                hide_btns.push(
                                    'promote',
                                    'demote',
                                    'kick'
                                );
                            } else if(user_affiliation.name === 'admin') {
                                hide_btns.push(
                                    'promote',
                                    'kick'
                                );
                            } else {
                                hide_btns.push(
                                    'demote'
                                );
                            }

                            if(Roster.isFriend(iXID)) {
                                hide_btns.push(
                                    'add'
                                );
                            }

                            // Go Go Go!!
                            for(i in hide_btns) {
                                user_actions_btn_sel.filter('.' + hide_btns[i]).hide();
                            }

                            // Slide down?
                            if(hide_btns.length < user_actions_btn_sel.size()) {
                                user_actions_sel.stop(true).slideDown(250);
                            }
                        }
                    }, function() {
                        var user_actions_sel = $(this).find('.user-actions');

                        if(user_actions_sel.is(':visible')) {
                            user_actions_sel.stop(true).slideUp(200, function() {
                                user_actions_sel.find('.action').show();
                            });
                        }
                    });

                    $(thisUser).find('.user-details').on('click', function() {
                        Chat.checkCreate(from, 'private');
                    });

                    $(thisUser).find('.user-actions .action a').on('click', function() {
                        var this_parent_sel = $(this).parent();

                        if(this_parent_sel.is('.promote')) {
                            Groupchat.promoteModerator(room_xid, iXID);
                        } else if(this_parent_sel.is('.demote')) {
                            Groupchat.demoteModerator(room_xid, iXID);
                        } else if(this_parent_sel.is('.add')) {
                            this_parent_sel.hide();
                            Roster.addThisContact(iXID, nick);
                        } else if(this_parent_sel.is('.kick')) {
                            Groupchat.kickUser(room_xid, (iXID || from), nick);
                        }

                        return false;
                    });
                }

                // We tell the user that someone entered the room
                if(!initial && DataStore.getDB(Connection.desktop_hash, 'options', 'groupchatpresence') !== '0') {
                    notify = true;
                    write += Common._e("joined the chat room");

                    // Any status?
                    if(status) {
                        write += ' (' + Filter.message(status, nick_html, true) + ')';
                    } else {
                        write += ' (' + Common._e("no status") + ')';
                    }
                }

                // Enable the private chat input
                thisPrivate.removeAttr('disabled');
            }

            else if((type == 'unavailable') || (type == 'error')) {
                // Is it me?
                if(nick == Name.getMUCNick(roomHash)) {
                    $(thisUser).remove();

                    // Disable the groupchat input
                    $('#' + roomHash + ' .message-area').attr('disabled', true);

                    // Remove all the groupchat users
                    $('#' + roomHash + ' .list .user').remove();
                }

                // Someone has been kicked or banned?
                if(Utils.existArrayValue(status_code, 301) || Utils.existArrayValue(status_code, 307)) {
                    $(thisUser).remove();
                    notify = true;

                    // Kicked?
                    if(Utils.existArrayValue(status_code, 307)) {
                        write += Common._e("has been kicked");
                    }

                    // Banned?
                    if(Utils.existArrayValue(status_code, 301)) {
                        write += Common._e("has been banned");
                    }

                    // Any reason?
                    if(reason) {
                        write += ' (' + Filter.message(reason, nick_html, true) + ')';
                    } else {
                        write += ' (' + Common._e("no reason") + ')';
                    }
                }

                // Nickname change?
                else if(Utils.existArrayValue(status_code, 303) && iNick) {
                    notify = true;
                    write += Common.printf(Common._e("changed his/her nickname to %s"), iNick.htmlEnc());

                    // New values
                    var new_xid = Common.cutResource(from) + '/' + iNick;
                    var new_hash = hex_md5(new_xid);
                    var new_class = 'user ' + new_hash;

                    if($(thisUser).hasClass('myself')) {
                        new_class += ' myself';
                    }

                    // Die the click event
                    $(thisUser).off('click');

                    // Change to the new nickname
                    $(thisUser).attr('data-nick', escape(iNick))
                               .attr('data-xid', new_xid)
                               .find('.name').text(iNick);

                    // Change the user class
                    $(thisUser).attr('class', new_class);

                    // New click event
                    $('#page-engine #' + roomHash + ' .list .' + new_hash).on('click', function() {
                        Chat.checkCreate(new_xid, 'private');
                    });
                }

                // We tell the user that someone left the room
                else if(!initial && DataStore.getDB(Connection.desktop_hash, 'options', 'groupchatpresence') !== '0') {
                    $(thisUser).remove();
                    notify = true;
                    write += Common._e("left the chat room");

                    // Any status?
                    if(status) {
                        write += ' (' + Filter.message(status, nick_html, true) + ')';
                    } else {
                        write += ' (' + Common._e("no status") + ')';
                    }
                }

                // Disable the private chat input
                thisPrivate.attr('disabled', true);
            }

            // Must notify something
            if(notify) {
                Message.display('groupchat', from, roomHash, nick_html, write, message_time, DateUtils.getTimeStamp(), 'system-message', false);
            }

            // Set the good status show icon
            switch(show) {
                case 'chat':
                case 'away':
                case 'xa':
                case 'dnd':
                    break;

                default:
                    show = 'available';
                    break;
            }

            $(thisUser + ' .name').attr('class', 'name talk-images ' + show);

            // Set the good status text
            var uTitle = nick;

            // Any XID to add?
            if(iXID) {
                uTitle += ' (' + iXID + ')';
            }

            // Any status to add?
            if(status) {
                uTitle += ' - ' + status;
            }

            $(thisUser).attr('title', uTitle);

            // Show or hide the role category, depending of its content
            $('#' + roomHash + ' .list .role').each(function() {
                var this_sel = $(this);

                if(this_sel.find('.user').size()) {
                    this_sel.show();
                } else {
                    this_sel.hide();
                }
            });
        } catch(e) {
            Console.error('Presence.displayMUC', e);
        }

    };


    /**
     * Filters a given status
     * @public
     * @param {string} xid
     * @param {string} status
     * @param {boolean} cut
     * @return {string}
     */
    self.filterStatus = function(xid, status, cut) {

        try {
            var dStatus = '';

            if(!status) {
                status = '';
            } else {
                if(cut) {
                    dStatus = Utils.truncate(status, 50);
                } else {
                    dStatus = status;
                }

                dStatus = Filter.message(dStatus, Name.getBuddy(xid).htmlEnc(), true);
            }

            return dStatus;
        } catch(e) {
            Console.error('Presence.filterStatus', e);
        }

    };


    /**
     * Displays a user's presence
     * @public
     * @param {string} value
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} hash
     * @param {string} xid
     * @param {string} avatar
     * @param {string} checksum
     * @param {string} caps
     * @return {undefined}
     */
    self.display = function(value, type, show, status, hash, xid, avatar, checksum, caps) {

        try {
            // Display the presence in the roster
            var path = '#roster .' + hash;
            var buddy = $('#roster .content .' + hash);
            var dStatus = self.filterStatus(xid, status, false);
            var tStatus = Common.encodeQuotes(status);
            var biStatus;

            // The buddy presence behind his name
            $(path + ' .name .buddy-presence').replaceWith('<p class="buddy-presence talk-images ' + type + '">' + value + '</p>');

            // The buddy presence in the buddy infos
            if(dStatus) {
                biStatus = dStatus;
            } else {
                biStatus = value;
            }

            $(path + ' .bi-status').replaceWith('<p class="bi-status talk-images ' + type + '" title="' + tStatus + '">' + biStatus + '</p>');

            // When the buddy disconnect himself, we hide him
            if((type == 'unavailable') || (type == 'error')) {
                // Set a special class to the buddy
                buddy.addClass('hidden-buddy');

                // No filtering is launched?
                if(!Search.search_filtered) {
                    buddy.hide();
                }

                // All the buddies are shown?
                if(Roster.blist_all) {
                    buddy.show();
                }

                // Chat stuffs
                if(Common.exists('#' + hash)) {
                    // Remove the chatstate stuffs
                    ChatState.reset(hash);
                    $('#' + hash + ' .chatstate').remove();
                    $('#' + hash + ' .message-area').removeAttr('data-chatstates');

                    // Get the buddy avatar (only if a chat is opened)
                    Avatar.get(xid, 'cache', 'true', 'forget');
                }
            }

            // If the buddy is online
            else {
                // When the buddy is online, we show it
                buddy.removeClass('hidden-buddy');

                // No filtering is launched?
                if(!Search.search_filtered) {
                    buddy.show();
                }

                // Get the online buddy avatar if not a gateway
                Avatar.get(xid, 'cache', avatar, checksum);
            }

            // Display the presence in the chat
            if(Common.exists('#' + hash)) {
                // We generate a well formed status message
                if(dStatus) {
                    // No need to write the same status two times
                    if(dStatus == value) {
                        dStatus = '';
                    } else {
                        dStatus = ' (' + dStatus + ')';
                    }
                }

                // We show the presence value
                $('#' + hash + ' .bc-infos').replaceWith('<p class="bc-infos" title="' + tStatus + '"><span class="' + type + ' show talk-images">' + value + '</span>' + dStatus + '</p>');

                // Process the new status position
                self.adaptChat(hash);
            }

            // Display the presence in the switcher
            if(Common.exists('#page-switch .' + hash)) {
                $('#page-switch .' + hash + ' .icon').removeClass('available unavailable error away busy').addClass(type);
            }

            // Update roster groups
            if(!Search.search_filtered) {
                Roster.updateGroups();
            } else {
                Search.funnelFilterBuddy();
            }

            // Get the disco#infos for this user
            var highest = self.highestPriority(xid);

            if(highest) {
                Caps.getDiscoInfos(highest, caps);
            } else {
                Caps.displayDiscoInfos(xid, '');
            }
        } catch(e) {
            Console.error('Presence.display', e);
        }

    };


    /**
     * Process the chat presence position
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.adaptChat = function(hash) {

        try {
            // Get values
            var pep_numb = $('#' + hash + ' .bc-pep').find('a').size();

            // Process the left/right position
            var presence_h = 12;

            if(pep_numb) {
                presence_h = (pep_numb * 20) + 18;
            }

            // Apply the left/right position
            var presence_h_tag = ($('html').attr('dir') == 'rtl') ? 'left' : 'right';
            $('#' + hash + ' p.bc-infos').css(presence_h_tag, presence_h);
        } catch(e) {
            Console.error('Presence.adaptChat', e);
        }

    };


    /**
     * Convert the presence "show" element into a human-readable output
     * @public
     * @param {string} show
     * @param {string} type
     * @return {undefined}
     */
    self.humanShow = function(show, type) {

        try {
            if(type == 'unavailable') {
                show = Common._e("Unavailable");
            } else if(type == 'error') {
                show = Common._e("Error");
            } else {
                switch(show) {
                    case 'chat':
                        show = Common._e("Talkative");
                        break;

                    case 'away':
                        show = Common._e("Away");
                        break;

                    case 'xa':
                        show = Common._e("Not available");
                        break;

                    case 'dnd':
                        show = Common._e("Busy");
                        break;

                    default:
                        show = Common._e("Available");
                        break;
                }
            }

            return show;
        } catch(e) {
            Console.error('Presence.humanShow', e);
        }

    };


    /**
     * Makes the presence data go in the right way
     * @public
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} hash
     * @param {string} xid
     * @param {string} avatar
     * @param {string} checksum
     * @param {string} caps
     * @return {undefined}
     */
    self.IA = function(type, show, status, hash, xid, avatar, checksum, caps) {

        try {
            // Any status defined?
            status = status || self.humanShow(show, type);

            // Handle events
            if(type == 'error') {
                self.display(Common._e("Error"), 'error', show, status, hash, xid, avatar, checksum, caps);
            } else if(type == 'unavailable') {
                self.display(Common._e("Unavailable"), 'unavailable', show, status, hash, xid, avatar, checksum, caps);
            } else {
                switch(show) {
                    case 'chat':
                        self.display(Common._e("Talkative"), 'available', show, status, hash, xid, avatar, checksum, caps);
                        break;

                    case 'away':
                        self.display(Common._e("Away"), 'away', show, status, hash, xid, avatar, checksum, caps);
                        break;

                    case 'xa':
                        self.display(Common._e("Not available"), 'busy', show, status, hash, xid, avatar, checksum, caps);
                        break;

                    case 'dnd':
                        self.display(Common._e("Busy"), 'busy', show, status, hash, xid, avatar, checksum, caps);
                        break;

                    default:
                        self.display(Common._e("Available"), 'available', show, status, hash, xid, avatar, checksum, caps);
                        break;
                }
            }
        } catch(e) {
            Console.error('Presence.IA', e);
        }

    };


    /**
     * Flush the presence data for a given user
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.flush = function(xid) {

        try {
            var flushed_marker = false;
            var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'presence' + ('_(.+)'));

            for(var i = 0; i < DataStore.storageDB.length; i++) {
                // Get the pointer values
                var current = DataStore.storageDB.key(i);

                // If the pointer is on a stored presence
                if(current.match(db_regex)) {
                    // Get the current XID
                    var now_full = RegExp.$1;
                    var now_bare = Common.bareXID(now_full);

                    // If the current XID equals the asked XID
                    if(now_bare == xid) {
                        if(DataStore.removeDB(Connection.desktop_hash, 'presence-stanza', now_full)) {
                            Console.info('Presence data flushed for: ' + now_full);

                            flushed_marker = true;
                            i--;
                        }
                    }
                }
            }

            return flushed_marker;
        } catch(e) {
            Console.error('Presence.flush', e);
        }

    };


    /**
     * Process the highest resource priority for an user
     * @public
     * @param {string} xid
     * @param {string} resource
     * @param {object} resources_obj
     * @return {undefined}
     */
    self.processPriority = function(xid, resource, resources_obj) {

        try {
            if(!xid) {
                Console.warn('No XID value');
                return;
            }

            // Initialize vars
            var cur_resource, cur_from, cur_pr,
                cur_xml, cur_priority,
                from_highest;

            from_highest = null;
            max_priority = null;

            // Groupchat or gateway presence? (no priority here)
            if(xid.indexOf('/') !== -1 || Common.isGateway(xid)) {
                from_highest = xid;

                Console.log('Processed presence for groupchat user: ' + xid);
            } else {
                if(!self.highestPriority(xid)) {
                    from_highest = xid;

                    if(resource) {
                        from_highest += '/' + resource;
                    }

                    Console.log('Processed initial presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                } else {
                    var fn_parse_resource = function(cur_resource) {
                        // Read presence data
                        cur_from = xid;

                        if(cur_resource) {
                            cur_from += '/' + cur_resource;
                        }

                        cur_pr   = DataStore.getDB(Connection.desktop_hash, 'presence-stanza', cur_from);

                        if(cur_pr) {
                            // Parse presence data
                            cur_xml      = Common.XMLFromString(cur_pr);
                            cur_priority = $(cur_xml).find('priority').text();
                            cur_priority = !isNaN(cur_priority) ? parseInt(cur_priority) : 0;

                            // Higher priority?
                            if((cur_priority >= max_priority) || (max_priority === null)) {
                                max_priority = cur_priority;
                                from_highest = cur_from;
                            }
                        }
                    };

                    // Parse bare presences (used by gateway contacts, mostly)
                    if(resources_obj.bare === 1) {
                        fn_parse_resource(null);
                    }

                    // Parse resources
                    for(cur_resource in resources_obj.list) {
                        fn_parse_resource(cur_resource);
                    }

                    Console.log('Processed presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                }
            }

            if(from_highest) {
                DataStore.setDB(Connection.desktop_hash, 'presence-priority', xid, from_highest);
            } else {
                DataStore.removeDB(Connection.desktop_hash, 'presence-priority', xid);
            }
        } catch(e) {
            Console.error('Presence.processPriority', e);
        }

    };


    /**
     * Returns the highest presence priority XID for an user
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.highestPriority = function(xid) {

        try {
            return DataStore.getDB(Connection.desktop_hash, 'presence-priority', xid) || '';
        } catch(e) {
            Console.error('Presence.highestPriority', e);
        }

    };


    /**
     * Gets the presence stanza for given full XID
     * @public
     * @param {string} xid_full
     * @return {object}
     */
    self.readStanza = function(xid_full) {

        try {
            var pr = DataStore.getDB(Connection.desktop_hash, 'presence-stanza', xid_full);

            if(!pr) {
                pr = '<presence><type>unavailable</type></presence>';
            }

            return Common.XMLFromString(pr);
        } catch(e) {
            Console.error('Presence.readStanza', e);
        }

    };


    /**
     * Gets the resource from a XID which has the highest priority
     * @public
     * @param {string} xid
     * @return {object}
     */
    self.highestPriorityStanza = function(xid) {

        try {
            return self.readStanza(
                self.highestPriority(xid)
            );
        } catch(e) {
            Console.error('Presence.highestPriorityStanza', e);
        }

    };


    /**
     * Lists presence resources for an user
     * @public
     * @param {string} xid
     * @return {object}
     */
    self.resources = function(xid) {

        try {
            var resources_obj = {
                'bare': 0,
                'list': {}
            };

            var resources_db  = DataStore.getDB(Connection.desktop_hash, 'presence-resources', xid);

            if(resources_db) {
                resources_obj = $.evalJSON(resources_db);
            }

            return resources_obj;
        } catch(e) {
            Console.error('Presence.resources', e);
        }

    };


    /**
     * Adds a given presence resource for an user
     * @public
     * @param {string} xid
     * @param {string} resource
     * @return {object}
     */
    self.addResource = function(xid, resource) {

        var resources_obj = null;

        try {
            resources_obj = self.resources(xid);

            if(resource) {
                resources_obj.list[resource] = 1;
            } else {
                resources_obj.bare = 1;
            }

            DataStore.setDB(Connection.desktop_hash, 'presence-resources', xid, $.toJSON(resources_obj));
        } catch(e) {
            Console.error('Presence.addResource', e);
        } finally {
            return resources_obj;
        }

    };


    /**
     * Removes a given presence resource for an user
     * @public
     * @param {string} xid
     * @param {string} resource
     * @return {object}
     */
    self.removeResource = function(xid, resource) {

        var resources_obj = null;

        try {
            resources_obj = self.resources(xid);

            if(resource) {
                delete resources_obj.list[resource];
            } else {
                resources_obj.bare = 0;
            }

            DataStore.setDB(Connection.desktop_hash, 'presence-resources', xid, $.toJSON(resources_obj));
        } catch(e) {
            Console.error('Presence.removeResource', e);
        } finally {
            return resources_obj;
        }

    };


    /**
     * Makes something easy to process for the presence IA
     * @public
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self.funnel = function(xid, hash) {

        try {
            // Get the highest priority presence value
            var presence_node = $(self.highestPriorityStanza(xid));

            var type = presence_node.find('type').text();
            var show = presence_node.find('show').text();
            var status = presence_node.find('status').text();
            var avatar = presence_node.find('avatar').text();
            var checksum = presence_node.find('checksum').text();
            var caps = presence_node.find('caps').text();

            // Display the presence with that stored value
            if(!type && !show) {
                self.IA('', 'available', status, hash, xid, avatar, checksum, caps);
            } else {
                self.IA(type, show, status, hash, xid, avatar, checksum, caps);
            }
        } catch(e) {
            Console.error('Presence.funnel', e);
        }

    };


    /**
     * Sends a defined presence packet
     * @public
     * @param {string} to
     * @param {string} type
     * @param {string} show
     * @param {string} status
     * @param {string} checksum
     * @param {number} limit_history
     * @param {string} password
     * @param {function} handle
     * @return {undefined}
     */
    self.send = function(to, type, show, status, checksum, limit_history, password, handle) {

        try {
            // Get some stuffs
            var priority = '0';

            if(show != 'away' && show != 'xa') {
                priority = DataStore.getDB(Connection.desktop_hash, 'priority', 1) || '1';
            }

            checksum = checksum || DataStore.getDB(Connection.desktop_hash, 'checksum', 1);

            if(show == 'available') {
                show = '';
            }

            if(type == 'available') {
                type = '';
            }

            // New presence
            var presence = new JSJaCPresence();

            // Avoid "null" or "none" if nothing stored
            if(!checksum || (checksum == 'none')) {
                checksum = '';
            }

            // Presence headers
            if(to)
                presence.setTo(to);
            if(type)
                presence.setType(type);
            if(show)
                presence.setShow(show);
            if(status)
                presence.setStatus(status);

            presence.setPriority(priority);

            // CAPS (entity capabilities)
            presence.appendNode('c', {
                'xmlns': NS_CAPS,
                'hash': 'sha-1',
                'node': 'https://jappix.com/',
                'ver': Caps.mine()
            });

            // Nickname
            var nickname = Name.get();

            if(nickname && !limit_history) {
                presence.appendNode('nick', {
                    'xmlns': NS_NICK
                }, nickname);
            }

            // vcard-temp:x:update node
            var x = presence.appendNode('x', {
                'xmlns': NS_VCARD_P
            });

            x.appendChild(presence.buildNode('photo', {
                'xmlns': NS_VCARD_P
            }, checksum));

            // MUC X data
            if(limit_history || password) {
                var xMUC = presence.appendNode('x', {
                    'xmlns': NS_MUC
                });

                // Max messages age (for MUC)
                if(limit_history) {
                    xMUC.appendChild(presence.buildNode('history', {
                        'maxstanzas': 20,
                        'seconds': 86400,
                        'xmlns': NS_MUC
                    }));
                }

                // Room password
                if(password) {
                    xMUC.appendChild(presence.buildNode('password', {
                        'xmlns': NS_MUC
                    }, password));
                }
            }

            // Reachability details
            if(type != 'unavailable') {
                var reach_regex = new RegExp('[^+0-9]', 'g');
                var reach_phone = DataStore.getDB(Connection.desktop_hash, 'profile', 'phone') || '';
                reach_phone = reach_phone.replace(reach_regex, '');

                if(reach_phone) {
                    /* REF: http://www.xmpp.org/extensions/xep-0152.html */
                    var reach_node = presence.appendNode(presence.buildNode('reach', {
                        'xmlns': NS_URN_REACH
                    }));

                    reach_node.appendChild(
                        presence.buildNode('addr', {
                            'uri': 'tel:' + reach_phone,
                            'xmlns': NS_URN_REACH
                        })
                    );
                }
            }

            // If away, send a last activity time
            if((show == 'away') || (show == 'xa')) {
                /* REF: http://xmpp.org/extensions/xep-0256.html */
                presence.appendNode(presence.buildNode('query', {
                    'xmlns': NS_LAST,
                    'seconds': DateUtils.getPresenceLast()
                }));

                /* REF: http://xmpp.org/extensions/xep-0319.html */
                presence.appendNode(presence.buildNode('idle', {
                    'xmlns': NS_URN_IDLE,
                    'since': DateUtils.getLastActivityDate()
                }));
            } else {
                DateUtils.presence_last_activity = DateUtils.getTimeStamp();
            }

            // Send presence packet
            if(typeof handle == 'function') {
                con.send(presence, handle);
            } else {
                con.send(presence);
            }

            Console.info('Presence sent: ' + (type || 'available'));
        } catch(e) {
            Console.error('Presence.send', e);
        }

    };


    /**
     * Performs all the actions to get the presence data
     * @public
     * @param {string} checksum
     * @param {boolean} autoidle
     * @return {undefined}
     */
    self.sendActions = function(checksum, autoidle) {

        try {
            // We get the values of the inputs
            var show = self.getUserShow();
            var status = self.getUserStatus();

            // Send the presence
            if(!Utils.isAnonymous()) {
                self.send('', '', show, status, checksum);
            }

            // We set the good icon
            self.icon(show);

            // We store our presence
            if(!autoidle)
                DataStore.setDB(Connection.desktop_hash, 'presence-show', 1, show);

            // We send the presence to our active MUC
            $('.page-engine-chan[data-type="groupchat"]').each(function() {
                var tmp_nick = $(this).attr('data-nick');

                if(!tmp_nick) {
                    return;
                }

                var room = unescape($(this).attr('data-xid'));
                var nick = unescape(tmp_nick);

                // Must re-initialize?
                if(Connection.resume) {
                    Groupchat.getMUC(room, nick);
                }

                // Not disabled?
                else if(!$(this).find('.message-area').attr('disabled')) {
                    self.send(room + '/' + nick, '', show, status, '', true);
                }
            });
        } catch(e) {
            Console.error('Presence.quickSend', e);
        }

    };


    /**
     * Changes the presence icon
     * @public
     * @param {string} value
     * @return {undefined}
     */
    self.icon = function(value) {

        try {
            $('#my-infos .f-presence a.picker').attr('data-value', value);
        } catch(e) {
            Console.error('Presence.icon', e);
        }

    };


    /**
     * Sends a subscribe stanza
     * @public
     * @param {string} to
     * @param {string} type
     * @return {undefined}
     */
    self.sendSubscribe = function(to, type) {

        try {
            var status = '';

            // Subscribe request?
            if(type == 'subscribe') {
                status = Common.printf(Common._e("Hi, I am %s, I would like to add you as my friend."), Name.get());
            }

            self.send(to, type, '', status);
        } catch(e) {
            Console.error('Presence.sendSubscribe', e);
        }

    };


    /**
     * Accepts the subscription from another entity
     * @public
     * @param {string} xid
     * @param {string} name
     * @return {undefined}
     */
    self.acceptSubscribe = function(xid, name) {

        try {
            // We update our chat
            $('#' + hex_md5(xid) + ' .tools-add').hide();

            // We send a subsribed presence (to confirm)
            self.sendSubscribe(xid, 'subscribed');

            // We send a subscription request (subscribe both sides)
            self.sendSubscribe(xid, 'subscribe');

            // Specify the buddy name (if any)
            if(name) {
                Roster.send(xid, '', name);
            }
        } catch(e) {
            Console.error('Presence.acceptSubscribe', e);
        }

    };


    /**
     * Sends automatic away presence
     * @public
     * @return {undefined}
     */
    self.autoIdle = function() {

        try {
            // Not connected?
            if(!Common.isConnected()) {
                return;
            }

            // Stop if an xa presence was set manually
            var last_presence = self.getUserShow();

            if(!self.auto_idle && ((last_presence == 'away') || (last_presence == 'xa'))) {
                return;
            }

            var idle_presence;
            var activity_limit;

            // Can we extend to auto extended away mode (20 minutes)?
            if(self.auto_idle && (last_presence == 'away')) {
                idle_presence = 'xa';
                activity_limit = 1200;
            } else {
                idle_presence = 'away';
                activity_limit = 600;
            }

            // The user is really inactive and has set another presence than extended away
            if(((!self.auto_idle && (last_presence != 'away')) || (self.auto_idle && (last_presence == 'away'))) && (DateUtils.getLastActivity() >= activity_limit)) {
                // Then tell we use an auto presence
                self.auto_idle = true;

                // Get the old status message
                var status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status') || '';

                // Change the presence input
                $('#my-infos .f-presence a.picker').attr('data-value', idle_presence);
                $('#presence-status').val(status);

                // Then send the xa presence
                self.sendActions('', true);

                Console.info('Auto-idle presence sent: ' + idle_presence);
            }
        } catch(e) {
            Console.error('Presence.autoIdle', e);
        }

    };


    /**
     * Restores the old presence on a document bind
     * @public
     * @return {undefined}
     */
    self.eventIdle = function() {

        try {
            // If we were idle, restore our old presence
            if(self.auto_idle) {
                var presence_status_sel = $('#presence-status');

                // Get the values
                var show = DataStore.getDB(Connection.desktop_hash, 'presence-show', 1);
                var status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status');

                // Change the presence input
                $('#my-infos .f-presence a.picker').attr('data-value', show);
                presence_status_sel.val(status);
                presence_status_sel.placeholder();

                // Then restore the old presence
                self.sendActions('', true);

                Console.info('Presence restored: ' + (show || 'available'));
            }

            // Apply some values
            self.auto_idle = false;
            DateUtils.last_activity = DateUtils.getTimeStamp();
        } catch(e) {
            Console.error('Presence.eventIdle', e);
        }

    };


    /**
     * Lives the auto idle functions
     * @public
     * @return {undefined}
     */
    self.liveIdle = function() {

        try {
            // Apply the autoIdle function every minute
            self.auto_idle = false;
            $('#my-infos .f-presence').everyTime('30s', self.autoIdle);

            // On body bind (click & key event)
            $('body').on('mousedown', self.eventIdle)
                     .on('mousemove', self.eventIdle)
                     .on('keydown', self.eventIdle);
        } catch(e) {
            Console.error('Presence.liveIdle', e);
        }

    };


    /**
     * Kills the auto idle functions
     * @public
     * @return {undefined}
     */
    self.dieIdle = function() {

        try {
            // Remove the event detector
            $('body').off('mousedown', self.eventIdle)
                     .off('mousemove', self.eventIdle)
                     .off('keydown', self.eventIdle);
        } catch(e) {
            Console.error('Presence.dieIdle', e);
        }

    };


    /**
     * Gets the user presence show
     * @public
     * @return {string}
     */
    self.getUserShow = function() {

        try {
            return $('#my-infos .f-presence a.picker').attr('data-value');
        } catch(e) {
            Console.error('Presence.getUserShow', e);
        }

    };


    /**
     * Gets the user presence status
     * @public
     * @return {string}
     */
    self.getUserStatus = function() {

        try {
            return $('#presence-status').val();
        } catch(e) {
            Console.error('Presence.getUserStatus', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Click event for user presence show
            $('#my-infos .f-presence a.picker').click(function() {
                return self._eventsPicker(
                    $(this)
                );
            });

            // Submit events for user presence status
            var presence_status_sel = $('#presence-status');

            presence_status_sel.placeholder();

            presence_status_sel.keyup(function(e) {
                if(e.keyCode == 13) {
                    $(this).blur();

                    return false;
                }
            });

            presence_status_sel.blur(function() {
                // Read the parameters
                var show = self.getUserShow();
                var status = self.getUserStatus();

                // Read the old parameters
                var old_show = DataStore.getDB(Connection.desktop_hash, 'presence-show', 1);
                var old_status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status');

                // Must send the presence?
                if((show != old_show) || (status != old_status)) {
                    // Update the local stored status
                    DataStore.setDB(Connection.desktop_hash, 'options', 'presence-status', status);

                    // Update the server stored status
                    if(status != old_status) {
                        Options.store();
                    }

                    // Send the presence
                    self.sendActions();
                }
            });

            // Input focus handler
            presence_status_sel.focus(function() {
                Bubble.close();
            });
        } catch(e) {
            Console.error('Presence.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
