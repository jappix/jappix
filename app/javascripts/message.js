/*

Jappix - An open social platform
These are the messages JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda

*/

// Bundle
var Message = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Handles MAM forwared messages
     * @private
     * @param {object} c_mam
     * @return {boolean}
     */
    self._handleMAM = function(c_mam) {

        try {
            var c_mam_sel = $(c_mam);
            var c_mam_delay = c_mam_sel.find('delay[xmlns="' + NS_URN_DELAY + '"]');
            var c_mam_forward = c_mam_sel.find('forwarded[xmlns="' + NS_URN_FORWARD + '"]');

            if(c_mam_forward.size()) {
                MAM.handleMessage(c_mam_forward, c_mam_delay);
            }
        } catch(e) {
            Console.error('Message._handleMAM', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles chatstate messages
     * @private
     * @param {string} from
     * @param {string} hash
     * @param {string} type
     * @param {object} node
     * @return {undefined}
     */
    self._handleChatstate = function(from, hash, type, node) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0085.html */

            var node_sel = $(node);

            // Re-process the hash?
            var chatstate_hash = (type == 'groupchat') ? hex_md5(from) : hash;

            // Do something depending of the received state
            if(node_sel.find('active').size()) {
                ChatState.display('active', chatstate_hash, type);

                // Tell Jappix the entity supports chatstates
                $('#' + chatstate_hash + ' .message-area').attr('data-chatstates', 'true');

                Console.log('Active chatstate received from: ' + from);
            } else if(node_sel.find('composing').size()) {
                ChatState.display('composing', chatstate_hash, type);

                Console.log('Composing chatstate received from: ' + from);
            } else if(node_sel.find('paused').size()) {
                ChatState.display('paused', chatstate_hash, type);

                Console.log('Paused chatstate received from: ' + from);
            } else if(node_sel.find('inactive').size()){
                ChatState.display('inactive', chatstate_hash, type);

                Console.log('Inactive chatstate received from: ' + from);
            } else if(node_sel.find('gone').size()){
                ChatState.display('gone', chatstate_hash, type);

                Console.log('Gone chatstate received from: ' + from);
            }
        } catch(e) {
            Console.error('Message._doThat', e);
        }

    };


    /**
     * Handles Jappix App messages
     * @private
     * @param {string} xid
     * @param {string} body
     * @param {object} node
     * @return {boolean}
     */
    self._handleJappixApp = function(xid, body, node) {

        var is_exit = false;

        try {
            var node_sel = $(node);

            // Get notification data
            var jappix_app_node = node_sel.find('app[xmlns="jappix:app"]');
            var jappix_app_name = jappix_app_node.find('name');

            var jappix_app_name_id = jappix_app_name.attr('id');
            var jappix_app_name_value = jappix_app_name.text();

            // Jappix Me notification?
            if(jappix_app_name_id == 'me') {
                // Get more notification data
                var jappix_app_data = jappix_app_node.find('data[xmlns="jappix:app:me"]');
                var jappix_app_data_action = jappix_app_data.find('action');
                var jappix_app_data_url = jappix_app_data.find('url');

                var jappix_app_data_action_type = jappix_app_data_action.attr('type');
                var jappix_app_data_action_success = jappix_app_data_action.attr('success');
                var jappix_app_data_action_job = jappix_app_data_action.attr('job');
                var jappix_app_data_url_value = jappix_app_data_url.text();

                // Validate data
                if(jappix_app_data_action_type && jappix_app_data_action_success && jappix_app_data_action_job) {
                    // Filter success
                    jappix_app_data_action_success = parseInt(jappix_app_data_action_success) == 1 ? 'success' : 'error';

                    // Generate notification namespace
                    var jappix_me_notification_ns = jappix_app_name_id + '_' + jappix_app_data_action_type + '_' + jappix_app_data_action_job + '_' + jappix_app_data_action_success;

                    // Open a new notification
                    Notification.create(jappix_me_notification_ns, xid, [jappix_app_name_value, jappix_app_data_url_value], body);

                    Console.log('Jappix Me notification from: ' + xid + ' with namespace: ' + jappix_me_notification_ns);

                    is_exit = true;
                }
            }
        } catch(e) {
            Console.error('Message._handleJappixApp', e);
        } finally {
            return is_exit;
        }

    };


    /**
     * Handles invite messages
     * @private
     * @param {string} body
     * @param {object} node
     * @return {boolean}
     */
    self._handleInvite = function(body, node) {

        try {
            var node_sel = $(node);

            // We get the needed values
            var iFrom = node_sel.find('x[xmlns="' + NS_MUC_USER + '"] invite').attr('from');
            var iRoom = node_sel.find('x[xmlns="' + NS_XCONFERENCE + '"]').attr('jid') || from;

            // We display the notification
            Notification.create('invite_room', iFrom, [iRoom], body);

            Console.log('Invite Request from: ' + iFrom + ' to join: ' + iRoom);
        } catch(e) {
            Console.error('Message._handleInvite', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles request messages
     * @private
     * @param {string} xid
     * @param {object} message
     * @param {string} body
     * @return {boolean}
     */
    self._handleRequest = function(xid, message, body) {

        try {
            // Open a new notification
            Notification.create('request', xid, [message], body);

            Console.log('HTTP Request from: ' + xid);
        } catch(e) {
            Console.error('Message._handleRequest', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles OOB messages
     * @private
     * @param {string} from
     * @param {string} xid
     * @param {string} id
     * @param {object} node
     * @return {boolean}
     */
    self._handleOOB = function(from, xid, id, node) {

        try {
            OOB.handle(from, id, 'x', node);

            Console.log('Message OOB request from: ' + xid);
        } catch(e) {
            Console.error('Message._handleOOB', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles Roster Item Exchange messages
     * @private
     * @param {string} xid
     * @param {object} message
     * @param {string} body
     * @return {boolean}
     */
    self._handleRosterItemExchange = function(xid, message, body) {

        try {
            // Open a new notification
            Notification.create('rosterx', xid, [message], body);

            Console.log('Roster Item Exchange from: ' + xid);
        } catch(e) {
            Console.error('Message._handleRosterItemExchange', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles attention messages
     * @private
     * @param {string} xid
     * @param {string} body
     * @return {boolean}
     */
    self._handleAttention = function(xid, body) {

        try {
            Attention.receive(xid, body);
        } catch(e) {
            Console.error('Message._handleAttention', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles normal messages
     * @private
     * @param {string} xid
     * @param {string} subject
     * @param {string} body
     * @param {string} delay
     * @return {boolean}
     */
    self._handleNormal = function(xid, subject, body, delay) {

        try {
            var message_date = delay || DateUtils.getXMPPTime('utc');
            var message_id = hex_md5(xid + subject + message_date);

            // Store the received message
            Inbox.storeMessage(xid, subject, body, 'unread', message_id, message_date);

            // Display the inbox message
            if(Common.exists('#inbox')) {
                Inbox.displayMessage(xid, subject, body, 'unread', message_id, message_date);
            }

            // Check we have new messages (play a sound if any unread messages)
            if(Inbox.checkMessages()) {
                Audio.play('notification');
            }

            // Send it to the server
            Inbox.store();
        } catch(e) {
            Console.error('Message._handleNormal', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles Pubsub event messages
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {object} message
     * @param {object} node
     * @return {boolean}
     */
    self._handlePubsub = function(xid, hash, message, node) {

        try {
            // We get the needed values
            var items_sel = $(node).find('event items');
            var node_attr = items_sel.attr('node');
            var text;

            // Turn around the different result cases
            if(node_attr) {
                switch(node_attr) {
                    // Mood
                    case NS_MOOD:
                        // Retrieve the values
                        var mood = items_sel.find('mood');
                        var value = '';
                        text = '';

                        // There's something
                        if(mood.children().size()) {
                            value = node.getElementsByTagName('mood').item(0).childNodes.item(0).nodeName || '';
                            text = mood.find('text').text();
                        }

                        // Store the PEP event (and display it)
                        PEP.store(xid, 'mood', value, text);

                        break;

                    // Activity
                    case NS_ACTIVITY:
                        // Retrieve the values
                        var activity_sel = items_sel.find('activity');
                        text = '';

                        // There's something
                        if(activity_sel.children().size()) {
                            value = node.getElementsByTagName('activity').item(0).childNodes.item(0).nodeName || '';
                            text = activity_sel.find('text').text();
                        }

                        // Store the PEP event (and display it)
                        PEP.store(xid, 'activity', value, text);

                        break;

                    // Tune
                    case NS_TUNE:
                        // Retrieve the values
                        var tune_sel = items_sel.find('tune');
                        var artist = tune_sel.find('artist').text();
                        var source = tune_sel.find('source').text();
                        var title = tune_sel.find('title').text();
                        var uri = tune_sel.find('uri').text();

                        // Store the PEP event (and display it)
                        PEP.store(xid, 'tune', artist, title, source, uri);

                        break;

                    // Geolocation
                    case NS_GEOLOC:
                        // Retrieve the values
                        var geoloc_sel = items_sel.find('geoloc');
                        var lat = geoloc_sel.find('lat').text();
                        var lon = geoloc_sel.find('lon').text();

                        // Any extra-values?
                        var locality = geoloc_sel.find('locality').text();
                        var region = geoloc_sel.find('region').text();
                        var country = geoloc_sel.find('country').text();
                        var human = PEP.humanPosition(locality, region, country);

                        // Store the PEP event (and display it)
                        PEP.store(xid, 'geoloc', lat, lon, human);

                        break;

                    // Microblog
                    case NS_URN_MBLOG:
                        Microblog.display(message, xid, hash, 'mixed', 'push');

                        break;

                    // Inbox
                    case NS_URN_INBOX:
                        // Do not handle friend's notifications
                        if(xid == Common.getXID()) {
                            Notification.handle(message);
                        }

                        break;
                }
            }
        } catch(e) {
            Console.error('Message._handlePubsub', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles room topic messages
     * @private
     * @param {string} type
     * @param {string} from
     * @param {string} hash
     * @param {string} subject
     * @param {string} resource
     * @param {string} time
     * @param {string} stamp
     * @return {undefined}
     */
    self._handleRoomTopic = function(type, from, hash, subject, resource, time, stamp) {

        try {
            // Filter the vars
            var filter_subject = subject.replace(/\n+/g, ' ');
            var filteredSubject = Filter.message(filter_subject, resource, true);
            var filteredName = resource.htmlEnc();

            // Display the new subject at the top
            $('#' + hash + ' .top .name .bc-infos .muc-topic').replaceWith(
                '<span class="muc-topic" title="' + filter_subject + '">' + filteredSubject + '</span>'
            );

            // Display the new subject as a system message
            if(resource) {
                var topic_body = filteredName + ' ' + Common._e("changed the subject to:") + ' ' + Filter.message(subject, resource, true);
                self.display(type, from, hash, filteredName, topic_body, time, stamp, 'system-message', false);
            }
        } catch(e) {
            Console.error('Message._handleRoomTopic', e);
        }

    };


    /**
     * Handles groupchat messages
     * @private
     * @param {string} from
     * @param {string} hash
     * @param {string} type
     * @param {string} resource
     * @param {string} id
     * @param {string} body
     * @param {string} raw_body
     * @param {string} time
     * @param {number} stamp
     * @param {boolean} html_escape
     * @param {string} delay
     * @param {object} message_edit
     * @param {boolean} is_storable
     * @return {undefined}
     */
    self._handleGroupchat = function(from, hash, type, resource, id, body, raw_body, time, stamp, html_escape, delay, message_edit, is_storable) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0045.html */

            // Message type
            var message_type = 'user-message';

            if(delay && resource) {
                // Old message
                message_type = 'old-message';
            } else if(!resource) {
                // System message
                message_type = 'system-message';
            }

            var nickQuote = '';

            // If this is not an old message
            if(message_type == 'user-message') {
                var myNick = Name.getMUCNick(hash);

                // If an user quoted our nick (with some checks)
                var regex = new RegExp('((^)|( )|(@))' + Common.escapeRegex(myNick) + '(($)|(:)|(,)|( ))', 'gi');

                if(body.match(regex) && (myNick != resource) && (message_type == 'user-message')) {
                    nickQuote = ' my-nick';
                }

                // We notify the user if there's a new personal message
                if(nickQuote) {
                    Interface.messageNotify(hash, 'personal');
                    Board.quick(from, 'groupchat', raw_body, resource);
                    Audio.play('receive-message');
                }

                // We notify the user there's a new unread MUC message
                else {
                    Interface.messageNotify(hash, 'unread');

                    // Play sound to all users in the MUC, except user who sent the message.
                    if(myNick != resource) {
                        Audio.play('receive-message');
                    }
                }
            }

            // Display the received message
            self.display(
                type,
                from,
                hash,
                resource.htmlEnc(),
                body,
                time,
                stamp,
                message_type,
                html_escape,
                nickQuote,
                undefined,
                id,
                undefined,
                undefined,
                message_edit.is_edited,
                message_edit.next_count,
                is_storable
            );
        } catch(e) {
            Console.error('Message._handleGroupchat', e);
        }

    };


    /**
     * Handles chat messages
     * @private
     * @param {string} from
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {string} resource
     * @param {string} id
     * @param {string} body
     * @param {string} raw_body
     * @param {string} time
     * @param {number} stamp
     * @param {boolean} html_escape
     * @param {object} message_edit
     * @param {boolean} is_storable
     * @param {boolean} is_markable
     * @param {boolean} is_groupchat_user
     * @param {object} message
     * @return {undefined}
     */
    self._handleChat = function(from, xid, hash, type, resource, id, body, raw_body, time, stamp, html_escape, message_edit, is_storable, is_markable, is_groupchat_user, message) {

        try {
            // Gets the nickname of the user
            var fromName = resource;
            var chatType = 'chat';

            // Must send a receipt notification?
            if(Receipts.has(message) && (id !== null)) {
                Receipts.sendReceived(type, from, id);
            }

            // It does not come from a groupchat user, get the full name
            if(!is_groupchat_user) {
              if (!Name.buddyIsAnonymous(xid)) {
                fromName = Name.getBuddy(xid);
              }
            } else {
                chatType = 'private';
            }

            // If the chat isn't yet opened, open it !
            if(!Common.exists('#' + hash)) {
                // We create a new chat
                Chat.create(hash, xid, fromName, chatType);

                // We tell the user that a new chat has started
                Audio.play('new-chat');
            } else {
                Audio.play('receive-message');
            }

            // Display the received message
            var message_sel = self.display(
                type,
                xid,
                hash,
                fromName.htmlEnc(),
                body,
                time,
                stamp,
                'user-message',
                html_escape,
                '',
                'him',
                id,
                undefined,
                undefined,
                message_edit.is_edited,
                message_edit.next_count,
                is_storable,
                is_markable
            );

            // We notify the user
            Interface.messageNotify(hash, 'personal');
            Board.quick(xid, 'chat', raw_body, fromName);

            // Mark the message
            if(is_markable === true && Markers.hasSupport(xid)) {
                var mark_type = Markers.MARK_TYPE_RECEIVED;

                if(Interface.hasChanFocus(hash) === true) {
                    mark_type = Markers.MARK_TYPE_DISPLAYED;
                }

                Markers.change(from, mark_type, id, message_sel);
            }
        } catch(e) {
            Console.error('Message._handleChat', e);
        }

    };


    /**
     * Sends an help message
     * @private
     * @param {string} type
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self._sendHelp = function(type, xid, hash) {

        try {
            // Help text
            var help_text = '<p class="help" xmlns="http://www.w3.org/1999/xhtml">';
            help_text += '<b>' + Common._e("Available shortcuts:") + '</b>';

            // Shortcuts array
            var shortcuts = [];

            // Common shortcuts
            shortcuts.push(Common.printf(Common._e("%s removes the chat logs"), '<em>/clear</em>'));
            shortcuts.push(Common.printf(Common._e("%s joins a groupchat"), '<em>/join jid</em>'));
            shortcuts.push(Common.printf(Common._e("%s closes the chat"), '<em>/part</em>'));
            shortcuts.push(Common.printf(Common._e("%s shows the user profile"), '<em>/whois jid</em>'));

            // Groupchat shortcuts
            if(type == 'groupchat') {
                shortcuts.push(Common.printf(Common._e("%s sends a message to the room"), '<em>/say message</em>'));
                shortcuts.push(Common.printf(Common._e("%s changes your nickname"), '<em>/nick nickname</em>'));
                shortcuts.push(Common.printf(Common._e("%s sends a message to someone in the room"), '<em>/msg nickname message</em>'));
                shortcuts.push(Common.printf(Common._e("%s changes the room topic"), '<em>/topic subject</em>'));
                shortcuts.push(Common.printf(Common._e("%s kicks a user of the room"), '<em>/kick [reason:] nickname</em>'));
                shortcuts.push(Common.printf(Common._e("%s bans a user of the room"), '<em>/ban [reason:] nickname</em>'));
                shortcuts.push(Common.printf(Common._e("%s invites someone to join the room"), '<em>/invite jid message</em>'));
            }

            // Generate the code from the array
            shortcuts = shortcuts.sort();

            for(var s in shortcuts) {
                help_text += shortcuts[s] + '<br />';
            }

            help_text += '</p>';

            // Display the message
            self.display(type, xid, hash, 'help', help_text, DateUtils.getCompleteTime(), DateUtils.getTimeStamp(), 'system-message', false);

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendHelp', e);
        }

    };


    /**
     * Sends a clear message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self._sendClear = function(xid, hash) {

        try {
            Chat.clean(hex_md5(xid));

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendClear', e);
        }

    };


    /**
     * Sends a join message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} e_1
     * @param {string} e_2
     * @return {undefined}
     */
    self._sendJoin = function(xid, hash, e_1, e_2) {

        try {
            // Join
            var room_gen = Common.generateXID(e_1, 'groupchat');
            var pass = e_2;

            Chat.checkCreate(room_gen, 'groupchat');

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendJoin', e);
        }

    };


    /**
     * Sends a part message
     * @private
     * @param {string} xid
     * @param {string} type
     * @return {undefined}
     */
    self._sendPart = function(xid, type) {

        try {
            Interface.quitThisChat(xid, hex_md5(xid), type);
        } catch(e) {
            Console.error('Message._sendPart', e);
        }

    };


    /**
     * Sends a WHOIS message
     * @private
     * @param {string} type
     * @param {string} xid
     * @param {string} hash
     * @param {string} e_3
     * @return {undefined}
     */
    self._sendWHOIS = function(type, xid, hash, e_3) {

        try {
            var whois_xid = RegExp.$3;

            // Groupchat WHOIS
            if(type == 'groupchat') {
                nXID = Utils.getMUCUserXID(xid, whois_xid);

                if(!nXID) {
                    Board.openThisInfo(6);
                } else {
                    UserInfos.open(nXID);
                }
            }

            // Chat or private WHOIS
            else {
                if(!whois_xid) {
                    UserInfos.open(xid);
                } else {
                    UserInfos.open(whois_xid);
                }
            }

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendWHOIS', e);
        }

    };


    /**
     * Sends an attention message
     * @private
     * @param {string} xid
     * @param {string} e_2
     * @return {undefined}
     */
    self._sendAttention = function(xid, e_2) {

        try {
            Attention.send(
                xid,
                $.trim(e_2)
            );
        } catch(e) {
            Console.error('Message._sendAttention', e);
        }

    };


    /**
     * Sends a chat message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} id
     * @param {string} body
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendChat = function(xid, hash, id, body, message_packet) {

        try {
            message_packet.setType('chat');

            // Generates the correct message depending of the choosen style
            var genMsg = self.generate(message_packet, body, hash);
            var html_escape = (genMsg !== 'XHTML');

            // Receipt request
            var receipt_request = Receipts.request(hash);

            if(receipt_request) {
                message_packet.appendNode('request', {
                    'xmlns': NS_URN_RECEIPTS
                });
            }

            // Chatstate
            message_packet.appendNode('active', {
                'xmlns': NS_CHATSTATES
            });

            // Markable message?
            var has_markers = Markers.hasSupport(xid);

            if(has_markers === true) {
                Markers.mark(message_packet);
            }

            // Send it!
            con.send(message_packet, Errors.handleReply);

            // Filter the xHTML message (for us!)
            if(!html_escape) {
                body = Filter.xhtml(message_packet.getNode());
            }

            // Finally we display the message we just sent
            var my_xid = Common.getXID();

            var message_sel = self.display(
                'chat',
                my_xid,
                hash,
                Name.getBuddy(my_xid).htmlEnc(),
                body,
                DateUtils.getCompleteTime(),
                DateUtils.getTimeStamp(),
                'user-message',
                html_escape,
                '',
                'me',
                id
            );

            if(has_markers === true) {
                message_sel.addClass('is-sending');
                message_sel.find('.message-marker').text(
                    Common._e("Sending...")
                ).show();
            }

            // Receipt timer
            if(receipt_request) {
                Receipts.checkReceived(hash, id);
            }
        } catch(e) {
            Console.error('Message._sendChat', e);
        }

    };


    /**
     * Sends a groupchat say message
     * @private
     * @param {string} hash
     * @param {string} body
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchatSat = function(hash, body, message_packet) {

        try {
            body = body.replace(/^\/say (.+)/, '$1');

            message_packet.setType('groupchat');
            self.generate(message_packet, body, hash);

            con.send(message_packet, Errors.handleReply);
        } catch(e) {
            Console.error('Message._sendGroupchatSat', e);
        }

    };


    /**
     * Sends a groupchat nick message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} nick
     * @param {string} body
     * @return {undefined}
     */
    self._sendGroupchatNick = function(xid, hash, e_1, body) {

        try {
            var nick = $.trim(e_1);

            // Does not exist yet?
            if(nick && !Utils.getMUCUserXID(xid, nick)) {
                // Send a new presence
                Presence.send(
                    (xid + '/' + nick),
                    '',
                    Presence.getUserShow(),
                    Presence.getUserStatus(),
                    '',
                    false,
                    false,
                    Errors.handleReply
                );

                // Change the stored nickname
                $('#' + hex_md5(xid)).attr('data-nick', escape(nick));

                // Reset chatstate
                ChatState.send('active', xid, hash);
            }
        } catch(e) {
            Console.error('Message._sendGroupchatNick', e);
        }

    };


    /**
     * Sends a groupchat msg message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} e_1
     * @param {string} e_2
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchatMsg = function(xid, hash, e_1, e_2, message_packet) {

        try {
            var msg_nick = e_1;
            var msg_body = e_2;
            var nick_xid = Utils.getMUCUserXID(xid, msg_nick);

            // We check if the user exists
            if(!nick_xid) {
                Board.openThisInfo(6);
            } else if(msg_body) {
                message_packet.setType('chat');
                message_packet.setTo(nick_xid);
                self.generate(message_packet, msg_body, hash);

                con.send(message_packet, Errors.handleReply);
            }
        } catch(e) {
            Console.error('Message._sendGroupchatMsg', e);
        }

    };


    /**
     * Sends a groupchat XXX message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} body
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchatTopic = function(xid, hash, body, message_packet) {

        try {
            var topic = body.replace(/^\/topic (.+)/, '$1');

            message_packet.setType('groupchat');
            message_packet.setSubject(topic);

            con.send(message_packet, Errors.handleMessage);

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendGroupchatTopic', e);
        }

    };


    /**
     * Sends a groupchat XXX message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} body
     * @param {string} e_1
     * @param {string} e_2
     * @return {undefined}
     */
    self._sendGroupchatBan = function(xid, hash, body, e_1, e_2) {

        try {
            var ban_nick = $.trim(e_1);
            var ban_reason = '';

            // We check if the user exists, if not it may be because a reason is given
            // we do not check it at first because the nickname could contain ':'
            var ban_xid = Utils.getMUCUserRealXID(xid, ban_nick);

            if(!ban_xid && (body.match(/^\/ban ([^:]+)[:]*(.*)/))) {
                ban_reason = $.trim(e_1);
                ban_nick = $.trim(e_2);

                if(ban_nick.length === 0) {
                    ban_nick = ban_reason;
                    ban_reason = '';
                }

                ban_xid = Utils.getMUCUserXID(xid, ban_nick);
            }

            Groupchat.banUser(xid, ban_xid, ban_reason);

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendGroupchatBan', e);
        }

    };


    /**
     * Sends a groupchat XXX message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} body
     * @param {string} e_1
     * @param {string} e_2
     * @return {undefined}
     */
    self._sendGroupchatKick = function(xid, hash, body, e_1, e_2) {

        try {
            var kick_nick = $.trim(e_1);
            var kick_reason =  '';

            // We check if the user exists, if not it may be because a reason is given
            // we do not check it at first because the nickname could contain ':'
            var kick_xid = Utils.getMUCUserRealXID(xid, kick_nick);

            if(!kick_xid && (body.match(/^\/kick ([^:]+)[:]*(.*)/))) {
                kick_reason = $.trim(e_1);
                kick_nick = $.trim(e_2);

                if(kick_nick.length === 0) {
                    kick_nick = kick_reason;
                    kick_reason = '';
                }

                kick_xid = Utils.getMUCUserXID(xid, kick_nick);
            }

            Groupchat.kickUser(xid, kick_xid, kick_nick, kick_reason);

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendGroupchatKick', e);
        }

    };


    /**
     * Sends a groupchat XXX message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} e_1
     * @param {string} e_2
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchatInvite = function(xid, hash, e_1, e_2, message_packet) {

        try {
            var i_xid = e_1;
            var invite_reason = e_2;

            var x = message_packet.appendNode('x', {
                'xmlns': NS_MUC_USER
            });

            var node = x.appendChild(message_packet.buildNode('invite', {
                'to': i_xid,
                'xmlns': NS_MUC_USER
            }));

            if(invite_reason) {
                node.appendChild(message_packet.buildNode('reason', {
                    'xmlns': NS_MUC_USER
                }, invite_reason));
            }

            con.send(message_packet, Errors.handleReply);

            // Reset chatstate
            ChatState.send('active', xid, hash);
        } catch(e) {
            Console.error('Message._sendGroupchatInvite', e);
        }

    };


    /**
     * Sends a groupchat XXX message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {string} body
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchatMessage = function(xid, hash, type, body, message_packet) {

        try {
            message_packet.setType('groupchat');

            // Chatstate
            message_packet.appendNode('active', {
                'xmlns': NS_CHATSTATES
            });

            self.generate(message_packet, body, hash);

            con.send(message_packet, Errors.handleMessage);

            Console.info('Message sent to: ' + xid + ' / ' + type);
        } catch(e) {
            Console.error('Message._sendGroupchatMessage', e);
        }

    };


    /**
     * Sends a groupchat message
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {string} body
     * @param {object} message_packet
     * @return {undefined}
     */
    self._sendGroupchat = function(xid, hash, type, body, message_packet) {

        try {
            // /say shortcut
            if(body.match(/^\/say (.+)/)) {
                self._sendGroupchatSat(
                    hash,
                    body,
                    message_packet
                );
            }

            // /nick shortcut
            else if(body.match(/^\/nick (.+)/)) {
                self._sendGroupchatNick(
                    xid,
                    hash,
                    RegExp.$1,
                    body
                );
            }

            // /msg shortcut
            else if(body.match(/^\/msg (\S+)\s+(.+)/)) {
                self._sendGroupchatMsg(
                    xid,
                    hash,
                    RegExp.$1,
                    RegExp.$2,
                    message_packet
                );
            }

            // /topic shortcut
            else if(body.match(/^\/topic (.+)/)) {
                self._sendGroupchatTopic(
                    xid,
                    hash,
                    body,
                    message_packet
                );
            }

            // /ban shortcut
            else if(body.match(/^\/ban (.*)/)) {
                self._sendGroupchatBan(
                    xid,
                    hash,
                    body,
                    RegExp.$1,
                    RegExp.$2
                );
            }

            // /kick shortcut
            else if(body.match(/^\/kick (.*)/)) {
                self._sendGroupchatKick(
                    xid,
                    hash,
                    body,
                    RegExp.$1,
                    RegExp.$2
                );
            }

            // /invite shortcut
            else if(body.match(/^\/invite (\S+)\s*(.*)/)) {
                self._sendGroupchatInvite(
                    xid,
                    hash,
                    RegExp.$1,
                    RegExp.$2,
                    message_packet
                );
            }

            // No shortcut, this is a message
            else {
                self._sendGroupchatMessage(
                    xid,
                    hash,
                    type,
                    body,
                    message_packet
                );
            }
        } catch(e) {
            Console.error('Message._sendGroupchat', e);
        }

    };


    /**
     * Handles the incoming message packets
     * @public
     * @param {object} message
     * @return {boolean}
     */
    self.handle = function(message) {

        try {
            // Error packet? Stop!
            if(Errors.handleReply(message)) {
                return;
            }

            // Carbon-forwarded message?
            if(message.getChild('sent', NS_URN_CARBONS)) {
                Carbons.handleSent(message); return;
            }
            if(message.getChild('received', NS_URN_CARBONS)) {
                Carbons.handleReceived(message); return;
            }

            // MAM-forwarded message?
            var c_mam = message.getChild('result', NS_URN_MAM);

            if(c_mam) {
                return self._handleMAM(c_mam);
            }

            // We get the message items
            var from = Common.fullXID(Common.getStanzaFrom(message));
            var id = message.getID();
            var type = message.getType();
            var body = $.trim(message.getBody());
            var node = message.getNode();
            var subject = $.trim(message.getSubject());

            // Keep raw message body
            var raw_body = body;

            // We generate some values
            var xid = Common.bareXID(from);
            var resource = Common.thisResource(from);
            var hash = hex_md5(xid);
            var xHTML_sel = $(node).find('html body');
            var xHTML = xHTML_sel.size();
            var is_groupchat_user = false;

            // Check for non-empty body
            var has_body = (((xHTML && Filter.has_xhtml_body(xHTML_sel)) || body) && true);

            // This message comes from a Muji room (ignore)
            if(Muji.is_room(xid)) {
                return false;
            }

            // This message comes from a groupchat user
            if(Utils.isPrivate(xid) && ((type == 'chat') || !type) && resource) {
                is_groupchat_user = true;
                xid = from;
                hash = hex_md5(xid);
            }

            // Get message date
            var time, stamp;
            var delay = DateUtils.readMessageDelay(node);

            // Any delay?
            if(delay) {
                time = DateUtils.relative(delay);
                stamp = DateUtils.extractStamp(Date.jab2date(delay));
            } else {
                time = DateUtils.getCompleteTime();
                stamp = DateUtils.extractStamp(new Date());
            }

            // Received message
            if(Receipts.hasReceived(message)) {
                return Receipts.messageReceived(hash, id);
            }

            // Chatstate message
            if(node && !delay &&
                ((((type == 'chat') || !type) && !Common.exists('#page-switch .' + hash + ' .unavailable')) || (type == 'groupchat'))) {
                self._handleChatstate(from, hash, type, node);
            }

            // Jappix App message
            if(message.getChild('app', 'jappix:app')) {
                if(self._handleJappixApp(xid, body, node) === true) {
                    return false;
                }
            }

            // Invite message
            if($(node).find('x[xmlns="' + NS_MUC_USER + '"] invite').size()) {
                return self._handleInvite(body, node);
            }

            // Request message
            if(message.getChild('confirm', NS_HTTP_AUTH)) {
                return self._handleRequest(xid, message, body);
            }

            // OOB message
            if(message.getChild('x', NS_XOOB)) {
                return self._handleOOB(from, xid, id, node);
            }

            // Roster Item Exchange message
            if(message.getChild('x', NS_ROSTERX)) {
                return self._handleRosterItemExchange(xid, message, body);
            }

            // Attention message
            if(message.getChild('attention', NS_URN_ATTENTION)) {
                return self._handleAttention(xid, body);
            }

            // Normal message
            if((type == 'normal') && body) {
                return self._handleNormal(xid, subject, body, delay);
            }

            // PubSub event
            if($(node).find('event').attr('xmlns') == NS_PUBSUB_EVENT) {
                return self._handlePubsub(xid, hash, message, node);
            }

            // If this is a room topic message
            if(subject && (type == 'groupchat')) {
                self._handleRoomTopic(type, from, hash, subject, resource, time, stamp);
            }

            // If the message has a content
            if(has_body === true) {
                var filteredMessage;
                var html_escape = true;

                // IE bug fix
                if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                    xHTML = 0;
                }

                // If this is a xHTML message
                if(xHTML) {
                    html_escape = false;

                    // Filter the xHTML message
                    body = Filter.xhtml(node);
                }

                // Catch message edit (XEP-0308)
                var message_edit = Correction.catch(message, hash, type);

                // Storable message?
                var is_storable = message.getChild('no-permanent-storage', NS_URN_HINTS) ? false : true;

                // Groupchat message
                if(type == 'groupchat') {
                    self._handleGroupchat(
                        from,
                        hash,
                        type,
                        resource,
                        id,
                        body,
                        raw_body,
                        time,
                        stamp,
                        html_escape,
                        delay,
                        message_edit,
                        is_storable
                    );
                } else {
                    // Markable message?
                    var is_markable = Markers.hasRequestMarker(node);

                    self._handleChat(
                        from,
                        xid,
                        hash,
                        type,
                        resource,
                        id,
                        body,
                        raw_body,
                        time,
                        stamp,
                        html_escape,
                        message_edit,
                        is_storable,
                        is_markable,
                        is_groupchat_user,
                        message
                    );
                }
            }

            // Message marker?
            if(Markers.hasResponseMarker(node)) {
                return Markers.handle(from, node, false, is_groupchat_user);
            }

            return false;
        } catch(e) {
            Console.error('Message.handle', e);
        }

    };


    /**
     * Sends a given message
     * @public
     * @param {string} hash
     * @param {string} type
     * @return {boolean}
     */
    self.send = function(hash, type) {

        try {
            // Get the values
            var message_area = $('#' + hash + ' .message-area');
            var body = $.trim(message_area.val());
            var xid = unescape(message_area.attr('data-to'));
            var nXID;

            // If the user didn't entered any message, stop
            if(!body || !xid) {
                return false;
            }

            // We send the message through the XMPP network
            var message_packet = new JSJaCMessage();
            message_packet.setTo(xid);

            // Set an ID
            var id = genID();
            message_packet.setID(id);

            // /help shortcut
            if(body.match(/^\/help\s*(.*)/)) {
                self._sendHelp(type, xid, hash);
            }

            // /clear shortcut
            else if(body.match(/^\/clear/)) {
                self._sendClear(xid, hash);
            }

            // /join shortcut
            else if(body.match(/^\/join (\S+)\s*(.*)/)) {
                self._sendJoin(xid, hash, RegExp.$1, RegExp.$2);
            }

            // /part shortcut
            else if(body.match(/^\/part\s*(.*)/) &&
                (!Utils.isAnonymous() || (Utils.isAnonymous() &&
                (xid != Common.generateXID(ANONYMOUS_ROOM, 'groupchat'))))) {
                self._sendPart(xid, type);
            }

            // /whois shortcut
            else if(body.match(/^\/whois(( (\S+))|($))/)) {
                self._sendWHOIS(type, xid, hash, RegExp.$3);
            }

            // /attention shortcut
            else if(body.match(/^\/attention( (.*))?/) && type == 'chat') {
                self._sendAttention(xid, RegExp.$2);
            }

            // Chat message type
            else if(type == 'chat') {
                self._sendChat(
                    xid,
                    hash,
                    id,
                    body,
                    message_packet
                );
            }

            // Groupchat message type
            else if(type == 'groupchat') {
                self._sendGroupchat(
                    xid,
                    hash,
                    type,
                    body,
                    message_packet
                );
            }

            // We reset the message input
            $('#' + hash + ' .message-area').val('');
        } catch(e) {
            Console.error('Message.send', e);
        } finally {
            return false;
        }

    };


    /**
     * Generates the correct message area style
     * @public
     * @param {string} hash
     * @return {string}
     */
    self.generateStyle = function() {

        try {
            // Initialize the vars
            var styles = '#' + hash + ' div.bubble-style';
            var font = styles + ' a.font-current';
            var fontsize = styles + ' a.fontsize-current';
            var checkbox = styles + ' input[type="checkbox"]';
            var color = '#' + hash + ' .message-area[data-color]';
            var style = '';

            // Get the font value
            $(font).filter('[data-font]').each(function() {
                style += 'font-family: ' + $(this).attr('data-font') + ';';
            });

            // Get the font value
            $(fontsize).filter('[data-value]').each(function() {
                style += 'font-size: ' + $(this).attr('data-value') + 'px;';
            });

            // Loop the input values
            $(checkbox).filter(':checked').each(function() {
                // If there is a previous element
                if(style) {
                    style += ' ';
                }

                // Get the current style
                switch($(this).attr('class')) {
                    case 'bold':
                        style += 'font-weight: bold;';
                        break;

                    case 'italic':
                        style += 'font-style: italic;';
                        break;

                    case 'underline':
                        style += 'text-decoration: underline;';
                        break;
                }
            });

            // Get the color value
            $(color).each(function() {
                style += 'color: #' + $(this).attr('data-color');
            });

            return style;
        } catch(e) {
            Console.error('Message.generateStyle', e);
        }

    };


    /**
     * Read messages from local archive
     * @public
     * @param {string} hash
     * @return {string}
     */
    self.readLocalArchive = function(hash) {

        try {
            return DataStore.getPersistent(Common.getXID(), 'history', hash);
        } catch(e) {
            Console.error('Message.readLocalArchive', e);
        }

    };


    /**
     * Stores message in local archive
     * @public
     * @param {string} hash
     * @param {string} store_html
     * @return {undefined}
     */
    self.storeLocalArchive = function(hash, store_html) {

        try {
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'localarchives') != '0') {
                DataStore.setPersistent(Common.getXID(), 'history', hash, store_html);
            }
        } catch(e) {
            Console.error('Message.storeLocalArchive', e);
        }

    };


    /**
     * Removes messages from local archive
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.removeLocalArchive = function(hash) {

        try {
            DataStore.removePersistent(Common.getXID(), 'history', hash);
        } catch(e) {
            Console.error('Message.removeLocalArchive', e);
        }

    };


    /**
     * Flushes local messages archive
     * @public
     * @return {undefined}
     */
    self.flushLocalArchive = function() {

        try {
            var flush_count = 0;
            var db_regex = new RegExp(('^' + Common.getXID() + '_') + ('history_'));

            for(var i = 0; i < JappixDataStore.storagePersistent.length; i++) {
                var db_current = JappixDataStore.storagePersistent.key(i);

                if(db_regex.exec(db_current)) {
                    JappixDataStore.storagePersistent.removeItem(db_current);
                    flush_count++;
                }
            }

            Console.info('Flushed ' + flush_count + ' archives in total.');
        } catch(e) {
            Console.error('Message.flushLocalArchive', e);
        }

    };


    /**
     * Generates the correct message code
     * @public
     * @param {object} message_packet
     * @param {string} body
     * @param {string} hash
     * @return {string}
     */
    self.generate = function(message_packet, body, hash) {

        try {
            // Create the classical body
            message_packet.setBody(body);

            // Get the style
            var style = $('#' + hash + ' .message-area').attr('style');

            // A message style is choosen
            if(style) {
                // Explode the message body new lines (to create one <p /> element by line)
                var new_lines = new Array(body);

                if(body.match(/\n/)) {
                    new_lines = body.split('\n');
                }

                // Create the XML elements
                var html_node = message_packet.appendNode('html', {
                    'xmlns': NS_XHTML_IM
                });

                var body_node = html_node.appendChild(message_packet.buildNode('body', {
                    'xmlns': NS_XHTML
                }));

                // Use the exploded body array to create one element per entry
                for(var i in new_lines) {
                    // Current line
                    var cLine = new_lines[i];

                    // Blank line, we put a <br />
                    if(cLine.match(/(^)(\s+)($)/) || !cLine) {
                        body_node.appendChild(message_packet.buildNode('br', {'xmlns': NS_XHTML}));
                    }

                    // Line with content, we put a <p />
                    else {
                        // HTML encode the line
                        cLine = cLine.htmlEnc();

                        // Filter the links
                        cLine = Links.apply(cLine, 'xhtml-im', style);

                        // Append the filtered line
                        $(body_node).append($('<p style="' + style + '">' + cLine + '</p>'));
                    }
                }

                return 'XHTML';
            }

            return 'PLAIN';
        } catch(e) {
            Console.error('Message.generate', e);
        }

    };


    /**
     * Displays a given message in a chat tab
     * @public
     * @param {string} type
     * @param {string} xid
     * @param {string} hash
     * @param {string} name
     * @param {string} body
     * @param {string} time
     * @param {string} stamp
     * @param {string} message_type
     * @param {boolean} html_escape
     * @param {string} nick_quote
     * @param {string} mode
     * @param {string} id
     * @param {object} c_target_sel
     * @param {boolean} no_scroll
     * @param {boolean} is_edited
     * @param {number} edit_count
     * @param {boolean} is_storable
     * @param {boolean} is_markable
     * @return {object}
     */
    self.display = function(type, xid, hash, name, body, time, stamp, message_type, html_escape, nick_quote, mode, id, c_target_sel, no_scroll, is_edited, edit_count, is_storable, is_markable) {

        var message_sel = null;

        try {
            // Target
            if(typeof c_target_sel === 'undefined') {
                c_target_sel = $('#' + hash + ' .content');
            }

            // Auto-calculate mode for groupchat?
            if(type == 'groupchat' && !mode) {
                var own_groupchat_nickname = $('#' + hash).attr('data-nick') || '';
                own_groupchat_nickname = unescape(own_groupchat_nickname);

                if(name == own_groupchat_nickname) {
                    mode = 'me';
                } else {
                    mode = 'him';
                }
            }

            // Generate some stuffs
            var has_avatar = false;
            var xid_hash = '';

            if(!nick_quote) {
                nick_quote = '';
            }

            if(message_type != 'system-message') {
                has_avatar = true;
                xid_hash = hex_md5(xid);
            }

            // Can scroll?
            var cont_scroll = document.getElementById('chat-content-' + hash);
            var can_scroll = false;

            if((!cont_scroll.scrollTop || ((cont_scroll.clientHeight + cont_scroll.scrollTop) == cont_scroll.scrollHeight)) && no_scroll !== true) {
                can_scroll = true;
            }

            // Any ID?
            var data_id = '';

            if(id) {
                data_id = ' data-id="' + id + '"';
            }

            // Edited state?
            var data_edited = '';
            var data_edit_count = '';

            if(is_edited === true) {
                data_edited = ' data-edited="true"';
                data_edit_count = ' data-edit-count="' + (edit_count || 0) + '"';
            }

            // Markable state?
            var data_markable = (is_markable === true) ? ' data-markable="true"' : '';

            // Filter the message
            var filteredMessage = Filter.message(body, name, html_escape);

            // Display the received message in the room
            var message_code = '<div class="one-line ' + message_type + nick_quote + '" data-stamp="' + stamp + '" data-mode="' + mode + '"' + data_id + data_edited + data_markable + data_edit_count + '><div class="message-content">';

            // Name color attribute
            if(type == 'groupchat') {
                attribute = ' style="color: ' + Common.generateColor(name) + ';" class="name';
            } else {
                attribute = ' class="name';

                if(mode) {
                    attribute += ' ' + mode;
                }
            }

            // Close the class attribute
            if(message_type == 'system-message') {
                attribute += ' hidden"';
            } else {
                attribute += '"';
            }

            // Filter the previous displayed message
            var last = c_target_sel.find('.one-group:not(.from-history):last');
            var last_name = last.find('b.name').attr('data-xid');
            var last_type = last.attr('data-type');
            var last_stamp = parseInt(last.attr('data-stamp'));
            var grouped = false;

            // We can group it with another previous message
            if((last_name == xid) && (message_type == last_type) && ((stamp - last_stamp) <= 1800)) {
                grouped = true;
            }

            // Is it a /me command?
            if(body.match(/(^|>)(\/me )([^<]+)/)) {
                filteredMessage = '<i>' + filteredMessage + '</i>';
            }

            message_code += filteredMessage + '</div>';

            // Message correction containers
            if(message_type == 'user-message') {
                // Message edit properties
                message_code += '<a class="correction-edit" href="#">' + Common._e("Edit") + '</a>';

                if(is_edited === true) {
                    var edit_text = Common._e("Edited");

                    if(edit_count > 1) {
                        edit_text = Common._e(Common.printf("Edited (%s)", edit_count));
                    }

                    message_code += '<span class="corrected-info">' + edit_text + '</span>';
                }
            }

            // Message marker container
            if(type == 'chat') {
                message_code += '<span class="message-marker"></span>';
            }

            message_code += '</div>';

            // Must group it?
            if(!grouped) {
                // Generate message headers
                var message_head = '';

                // Any avatar to add?
                if(has_avatar) {
                    message_head += '<div class="avatar-container"><img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" /></div>';
                }

                // Add the date & the name
                message_head += '<span class="date">' + time + '</span><b data-xid="' + Common.encodeQuotes(xid) + '" ' + attribute + '>' + name + '</b>';

                // Generate message code
                message_code = '<div class="one-group ' + xid_hash + '" data-type="' + message_type + '" data-stamp="' + stamp + '">' + message_head + message_code + '</div>';
            }

            // Write the code in the DOM
            if(grouped) {
                c_target_sel.find('.one-group:last').append(message_code);
            } else {
                c_target_sel.append(message_code);
            }

            message_sel = c_target_sel.find('.one-line:last');

            // Store the last MAM.REQ_MAX message groups
            if(!Features.enabledMAM() && (type == 'chat') && (message_type == 'user-message')) {
                // Filter the DOM
                var dom_filter = $('#' + hash + ' .content').clone().contents();
                var default_avatar = ('./images/others/default-avatar.png').replace(/&amp;/g, '&'); // Fixes #252

                $(dom_filter).find('.system-message').parent().remove();
                $(dom_filter).find('.avatar-container img.avatar').attr('src', default_avatar);
                $(dom_filter).find('.one-line').parent().slice(0, $(dom_filter).find('.one-line').parent().size() - MAM.REQ_MAX).remove();

                var store_html = $(dom_filter).parent().html();

                // Store the data
                if(store_html && is_storable !== false) {
                    self.storeLocalArchive(hash, store_html);
                }

                if(is_storable === false) {
                    Console.info('Message.display', 'Won\'t store message since it\'s labeled as not storable (' + xid + ')');
                }
            }

            // Must get the avatar?
            if(has_avatar && xid && !grouped) {
                Avatar.get(xid, 'cache', 'true', 'forget');
            }

            // Scroll to this message
            if(can_scroll) {
                Interface.autoScroll(hash);
            }

            // Add click events
            var xid_to = $('#' + hash).attr('data-xid');

            if(xid_to) {
                xid_to = unescape(xid_to);

                $('#' + hash + ' .content .one-line:last .correction-edit').click(function() {
                    Correction.enter(xid_to);
                    return false;
                });
            }
        } catch(e) {
            Console.error('Message.display', e);
        } finally {
            return message_sel;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
