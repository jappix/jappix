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
     * Handles the incoming message packets
     * @public
     * @param {object} message
     * @return {boolean}
     */
    self.handle = function(message) {

        try {
            // Error packet? Stop!
            if(Errors.handleReply(message))
                return;
            
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
                var c_mam_sel = $(c_mam);
                var c_mam_delay = c_mam_sel.find('delay[xmlns="' + NS_URN_DELAY + '"]');
                var c_mam_forward = c_mam_sel.find('forwarded[xmlns="' + NS_URN_FORWARD + '"]');

                if(c_mam_forward.size()) {
                    MAM.handleMessage(c_mam_forward, c_mam_delay);
                }

                return;
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
            var xHTML = $(node).find('html body').size();
            var GCUser = false;
            
            // This message comes from a groupchat user
            if(Utils.isPrivate(xid) && ((type == 'chat') || !type) && resource) {
                GCUser = true;
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
            if(Receipts.hasReceived(message))
                return Receipts.messageReceived(hash, id);
            
            // Chatstate message
            if(node && !delay && ((((type == 'chat') || !type) && !Common.exists('#page-switch .' + hash + ' .unavailable')) || (type == 'groupchat'))) {
                /* REF: http://xmpp.org/extensions/xep-0085.html */
                
                // Re-process the hash
                var chatstate_hash = hash;
                
                if(type == 'groupchat')
                    chatstate_hash = hex_md5(from);
                
                // Do something depending of the received state
                if($(node).find('active').size()) {
                    ChatState.display('active', chatstate_hash, type);
                    
                    // Tell Jappix the entity supports chatstates
                    $('#' + chatstate_hash + ' .message-area').attr('data-chatstates', 'true');
                    
                    Console.log('Active chatstate received from: ' + from);
                }
                
                else if($(node).find('composing').size()) {
                    ChatState.display('composing', chatstate_hash, type);

                    Console.log('Composing chatstate received from: ' + from);
                }
                
                else if($(node).find('paused').size()) {
                    ChatState.display('paused', chatstate_hash, type);

                    Console.log('Paused chatstate received from: ' + from);
                }
                
                else if($(node).find('inactive').size()){
                    ChatState.display('inactive', chatstate_hash, type);

                    Console.log('Inactive chatstate received from: ' + from);
                }
                
                else if($(node).find('gone').size()){
                    ChatState.display('gone', chatstate_hash, type);

                    Console.log('Gone chatstate received from: ' + from);
                }
            }
            
            // Jappix App message
            if(message.getChild('app', 'jappix:app')) {
                // Get notification data
                var jappix_app_node = $(node).find('app[xmlns="jappix:app"]');
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
                        
                        return false;
                    }
                }
            }

            // Invite message
            if($(node).find('x[xmlns="' + NS_MUC_USER + '"] invite').size()) {
                // We get the needed values
                var iFrom = $(node).find('x[xmlns="' + NS_MUC_USER + '"] invite').attr('from');
                var iRoom = $(node).find('x[xmlns="' + NS_XCONFERENCE + '"]').attr('jid');
                
                // Old invite method?
                if(!iRoom)
                    iRoom = from;
                
                // We display the notification
                Notification.create('invite_room', iFrom, [iRoom], body);
                
                Console.log('Invite Request from: ' + iFrom + ' to join: ' + iRoom);
                
                return false;
            }
            
            // Request message
            if(message.getChild('confirm', NS_HTTP_AUTH)) {
                // Open a new notification
                Notification.create('request', xid, [message], body);
                
                Console.log('HTTP Request from: ' + xid);
                
                return false;
            }
            
            // OOB message
            if(message.getChild('x', NS_XOOB)) {
                OOB.handle(from, id, 'x', node);
                
                Console.log('Message OOB request from: ' + xid);
                
                return false;
            }
            
            // Roster Item Exchange message
            if(message.getChild('x', NS_ROSTERX)) {
                // Open a new notification
                Notification.create('rosterx', xid, [message], body);
                
                Console.log('Roster Item Exchange from: ' + xid);
                
                return false;
            }
            
            // Normal message
            if((type == 'normal') && body) {
                // Message date
                var messageDate = delay;
                
                // No message date?
                if(!messageDate)
                    messageDate = DateUtils.getXMPPTime('utc');
                
                // Message ID
                var messageID = hex_md5(xid + subject + messageDate);
                
                // We store the received message
                Inbox.storeMessage(xid, subject, body, 'unread', messageID, messageDate);
                
                // Display the inbox message
                if(Common.exists('#inbox'))
                    Inbox.displayMessage(xid, subject, body, 'unread', messageID, messageDate);
                
                // Check we have new messages (play a sound if any unread messages)
                if(Inbox.checkMessages())
                    Audio.play('notification');
                
                // Send it to the server
                Inbox.store();
                
                return false;
            }
            
            // PubSub event
            if($(node).find('event').attr('xmlns') == NS_PUBSUB_EVENT) {
                // We get the needed values
                var iParse = $(node).find('event items');
                var iNode = iParse.attr('node');
                var tText;
                
                // Turn around the different result cases
                if(iNode) {
                    switch(iNode) {
                        // Mood
                        case NS_MOOD:
                            // Retrieve the values
                            var iMood = iParse.find('mood');
                            var fValue = '';
                            tText = '';
                            
                            // There's something
                            if(iMood.children().size()) {
                                // Read the value
                                fValue = node.getElementsByTagName('mood').item(0).childNodes.item(0).nodeName;
                                
                                // Read the text
                                tText = iMood.find('text').text();
                                
                                // Avoid errors
                                if(!fValue)
                                    fValue = '';
                            }
                            
                            // Store the PEP event (and display it)
                            PEP.store(xid, 'mood', fValue, tText);
                            
                            break;
                        
                        // Activity
                        case NS_ACTIVITY:
                            // Retrieve the values
                            var iActivity = iParse.find('activity');
                            var sValue = '';
                            tText = '';
                            
                            // There's something
                            if(iActivity.children().size()) {
                                // Read the value
                                fValue = node.getElementsByTagName('activity').item(0).childNodes.item(0).nodeName;
                                
                                // Read the text
                                tText = iActivity.find('text').text();
                                
                                // Avoid errors
                                if(!fValue)
                                    fValue = '';
                            }
                            
                            // Store the PEP event (and display it)
                            PEP.store(xid, 'activity', fValue, tText);
                            
                            break;
                        
                        // Tune
                        case NS_TUNE:
                            // Retrieve the values
                            var iTune = iParse.find('tune');
                            var tArtist = iTune.find('artist').text();
                            var tSource = iTune.find('source').text();
                            var tTitle = iTune.find('title').text();
                            var tURI = iTune.find('uri').text();
                            
                            // Store the PEP event (and display it)
                            PEP.store(xid, 'tune', tArtist, tTitle, tSource, tURI);
                            
                            break;
                        
                        // Geolocation
                        case NS_GEOLOC:
                            // Retrieve the values
                            var iGeoloc = iParse.find('geoloc');
                            var tLat = iGeoloc.find('lat').text();
                            var tLon = iGeoloc.find('lon').text();
                            
                            // Any extra-values?
                            var tLocality = iGeoloc.find('locality').text();
                            var tRegion = iGeoloc.find('region').text();
                            var tCountry = iGeoloc.find('country').text();
                            var tHuman = PEP.humanPosition(tLocality, tRegion, tCountry);
                            
                            // Store the PEP event (and display it)
                            PEP.store(xid, 'geoloc', tLat, tLon, tHuman);
                            
                            break;
                        
                        // Microblog
                        case NS_URN_MBLOG:
                            Microblog.display(message, xid, hash, 'mixed', 'push');
                            
                            break;
                        
                        // Inbox
                        case NS_URN_INBOX:
                            // Do not handle friend's notifications
                            if(xid == Common.getXID())
                                Notification.handle(message);
                            
                            break;
                    }
                }
                
                return false;
            }
            
            // If this is a room topic message
            if(subject && (type == 'groupchat')) {
                // Filter the vars
                var filter_subject = subject.replace(/\n+/g, ' ');
                var filteredSubject = Filter.message(filter_subject, resource, true);
                var filteredName = resource.htmlEnc();
                
                // Display the new subject at the top
                $('#' + hash + ' .top .name .bc-infos .muc-topic').replaceWith('<span class="muc-topic" title="' + filter_subject + '">' + filteredSubject + '</span>');
                
                // Display the new subject as a system message
                if(resource) {
                    var topic_body = filteredName + ' ' + Common._e("changed the subject to:") + ' ' + Filter.message(subject, resource, true);
                    self.display(type, from, hash, filteredName, topic_body, time, stamp, 'system-message', false);
                }
            }
            
            // If the message has a content
            if(xHTML || body) {
                var filteredMessage;
                var html_escape = true;
                
                // IE bug fix
                if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                    xHTML = 0;
                }
                
                //If this is a xHTML message
                if(xHTML) {
                    html_escape = false;
                    
                    // Filter the xHTML message
                    body = Filter.xhtml(node);
                }
                
                // Groupchat message
                if(type == 'groupchat') {
                    /* REF: http://xmpp.org/extensions/xep-0045.html */
                    
                    // We generate the message type and time
                    var message_type = 'user-message';
                    
                    // This is an old message
                    if(delay && resource) {
                        message_type = 'old-message';
                    }
                    
                    // This is a system message
                    else if(!resource) {
                        message_type = 'system-message';
                    }
                    
                    var nickQuote = '';
                    
                    // If this is not an old message
                    if(message_type == 'user-message') {
                        var myNick = Name.getMUCNick(hash);
                        
                        // If an user quoted our nick (with some checks)
                        var regex = new RegExp('((^)|( )|(@))' + Common.escapeRegex(myNick) + '(($)|(:)|(,)|( ))', 'gi');
                        
                        if(body.match(regex) && (myNick != resource) && (message_type == 'user-message'))
                            nickQuote = ' my-nick';
                        
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
                    self.display(type, from, hash, resource.htmlEnc(), body, time, stamp, message_type, html_escape, nickQuote);
                }
                
                // Chat message
                else {
                    // Gets the nickname of the user
                    var fromName = resource;
                    var chatType = 'chat';
                    
                    // Must send a receipt notification?
                    if(Receipts.has(message) && (id !== null))
                        Receipts.sendReceived(type, from, id);
                    
                    // It does not come from a groupchat user, get the full name
                    if(!GCUser) {
                        fromName = Name.getBuddy(xid);
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
                    self.display(type, xid, hash, fromName.htmlEnc(), body, time, stamp, 'user-message', html_escape, '', 'him');
                    
                    // We notify the user
                    Interface.messageNotify(hash, 'personal');
                    Board.quick(xid, 'chat', raw_body, fromName);
                }
                
                return false;
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
            if(!body || !xid)
                return false;
        
            // We send the message through the XMPP network
            var aMsg = new JSJaCMessage();
            aMsg.setTo(xid);
            
            // Set an ID
            var id = genID();
            aMsg.setID(id);
            
            // /help shortcut
            if(body.match(/^\/help\s*(.*)/)) {
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
                
                for(var s in shortcuts)
                    help_text += shortcuts[s] + '<br />';
                
                help_text += '</p>';
                
                // Display the message
                self.display(type, xid, hash, 'help', help_text, DateUtils.getCompleteTime(), DateUtils.getTimeStamp(), 'system-message', false);
                
                // Reset chatstate
                ChatState.send('active', xid, hash);
            }
            
            // /clear shortcut
            else if(body.match(/^\/clear/)) {
                Chat.clean(hex_md5(xid));
                
                // Reset chatstate
                ChatState.send('active', xid, hash);
            }
            
            // /join shortcut
            else if(body.match(/^\/join (\S+)\s*(.*)/)) {
                // Join
                var room = Common.generateXID(RegExp.$1, 'groupchat');
                var pass = RegExp.$2;
                
                Chat.checkCreate(room, 'groupchat');
                
                // Reset chatstate
                ChatState.send('active', xid, hash);
            }
            
            // /part shortcut
            else if(body.match(/^\/part\s*(.*)/) && (!Utils.isAnonymous() || (Utils.isAnonymous() && (xid != Common.generateXID(ANONYMOUS_ROOM, 'groupchat')))))
                Interface.quitThisChat(xid, hex_md5(xid), type);
            
            // /whois shortcut
            else if(body.match(/^\/whois(( (\S+))|($))/)) {
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
            }
            
            // Chat message type
            else if(type == 'chat') {
                aMsg.setType('chat');
                
                // Generates the correct message depending of the choosen style
                var genMsg = self.generate(aMsg, body, hash);
                var html_escape = (genMsg !== 'XHTML');
                
                // Receipt request
                var receipt_request = Receipts.request(hash);
                
                if(receipt_request)
                    aMsg.appendNode('request', {'xmlns': NS_URN_RECEIPTS});
                
                // Chatstate
                aMsg.appendNode('active', {'xmlns': NS_CHATSTATES});
                
                // Send it!
                con.send(aMsg, Errors.handleReply);
                
                // Filter the xHTML message (for us!)
                if(!html_escape) {
                    body = Filter.xhtml(aMsg.getNode());
                }
                
                // Finally we display the message we just sent
                var my_xid = Common.getXID();
                
                self.display('chat', my_xid, hash, Name.getBuddy(my_xid).htmlEnc(), body, DateUtils.getCompleteTime(), DateUtils.getTimeStamp(), 'user-message', html_escape, '', 'me', id);
                
                // Receipt timer
                if(receipt_request) {
                    Receipts.checkReceived(hash, id);
                }
            }
            
            // Groupchat message type
            else if(type == 'groupchat') {
                // /say shortcut
                if(body.match(/^\/say (.+)/)) {
                    body = body.replace(/^\/say (.+)/, '$1');
                    
                    aMsg.setType('groupchat');
                    self.generate(aMsg, body, hash);
                    
                    con.send(aMsg, Errors.handleReply);
                }
                
                // /nick shortcut
                else if(body.match(/^\/nick (.+)/)) {
                    var nick = body.replace(/^\/nick (.+)/, '$1');
                    
                    // Does not exist yet?
                    if(!Utils.getMUCUserXID(xid, nick)) {
                        // Send a new presence
                        Presence.send(xid + '/' + nick, '', Presence.getUserShow(), self.getUserStatus(), '', false, false, Errors.handleReply);
                        
                        // Change the stored nickname
                        $('#' + hex_md5(xid)).attr('data-nick', escape(nick));
                        
                        // Reset chatstate
                        ChatState.send('active', xid, hash);
                    }
                }
                
                // /msg shortcut
                else if(body.match(/^\/msg (\S+)\s+(.+)/)) {
                    var msg_nick = RegExp.$1;
                    var msg_body = RegExp.$2;
                    nXID = Utils.getMUCUserXID(xid, msg_nick);
                    
                    // We check if the user exists
                    if(!nXID)
                        Board.openThisInfo(6);
                    
                    // If the private message is not empty
                    else if(msg_body) {
                        aMsg.setType('chat');
                        aMsg.setTo(nXID);
                        self.generate(aMsg, msg_body, hash);
                        
                        con.send(aMsg, Errors.handleReply);
                    }
                }
                
                // /topic shortcut
                else if(body.match(/^\/topic (.+)/)) {
                    var topic = body.replace(/^\/topic (.+)/, '$1');
                    
                    aMsg.setType('groupchat');
                    aMsg.setSubject(topic);
                    
                    con.send(aMsg, Errors.handleMessage);
                    
                    // Reset chatstate
                    ChatState.send('active', xid, hash);
                }
                
                // /ban shortcut
                else if(body.match(/^\/ban (.*)/)) {
                    var ban_nick = $.trim(RegExp.$1);
                    var ban_reason = '';
                    
                    // We check if the user exists, if not it may be because a reason is given
                    // we do not check it at first because the nickname could contain ':'
                    var ban_xid = Utils.getMUCUserRealXID(xid, ban_nick);

                    if(!ban_xid && (body.match(/^\/ban ([^:]+)[:]*(.*)/))) {
                        ban_reason = $.trim(RegExp.$1);
                        ban_nick = $.trim(RegExp.$2);

                        if(ban_nick.length === 0) {
                            ban_nick = ban_reason;
                            ban_reason = '';
                        }

                        ban_xid = Utils.getMUCUserXID(xid, ban_nick);
                    }
                    
                    Groupchat.banUser(xid, ban_xid, ban_reason);
                    
                    // Reset chatstate
                    ChatState.send('active', xid, hash);
                }
                
                // /kick shortcut
                else if(body.match(/^\/kick (.*)/)) {
                    var kick_nick = $.trim(RegExp.$1);
                    var kick_reason =  '';

                    // We check if the user exists, if not it may be because a reason is given
                    // we do not check it at first because the nickname could contain ':'
                    var kick_xid = Utils.getMUCUserRealXID(xid, kick_nick);

                    if(!kick_xid && (body.match(/^\/kick ([^:]+)[:]*(.*)/))) {
                        kick_reason = $.trim(RegExp.$1);
                        kick_nick = $.trim(RegExp.$2);

                        if(kick_nick.length === 0) {
                            kick_nick = kick_reason;
                            kick_reason = '';
                        }

                        kick_xid = Utils.getMUCUserXID(xid, kick_nick);
                    }
                    
                    Groupchat.kickUser(xid, kick_xid, kick_nick, kick_reason);
                    
                    // Reset chatstate
                    ChatState.send('active', xid, hash);
                }
                
                // /invite shortcut
                else if(body.match(/^\/invite (\S+)\s*(.*)/)) {
                    var i_xid = RegExp.$1;
                    var invite_reason = RegExp.$2;

                    var x = aMsg.appendNode('x', {'xmlns': NS_MUC_USER});
                    var aNode = x.appendChild(aMsg.buildNode('invite', {'to': i_xid, 'xmlns': NS_MUC_USER}));
                    
                    if(invite_reason) {
                        aNode.appendChild(aMsg.buildNode('reason', {'xmlns': NS_MUC_USER}, invite_reason));
                    }
                    
                    con.send(aMsg, Errors.handleReply);
                    
                    // Reset chatstate
                    ChatState.send('active', xid, hash);
                }
                
                // No shortcut, this is a message
                else {
                    aMsg.setType('groupchat');
                    
                    // Chatstate
                    aMsg.appendNode('active', {'xmlns': NS_CHATSTATES});
                    
                    self.generate(aMsg, body, hash);
                    
                    con.send(aMsg, Errors.handleMessage);
                    
                    Console.info('Message sent to: ' + xid + ' / ' + type);
                }
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
                if(style)
                    style += ' ';
                
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
     * @param {object} aMsg
     * @param {string} body
     * @param {string} hash
     * @return {string}
     */
    self.generate = function(aMsg, body, hash) {

        try {
            // Create the classical body
            aMsg.setBody(body);
            
            // Get the style
            var style = $('#' + hash + ' .message-area').attr('style');
            
            // A message style is choosen
            if(style) {
                // Explode the message body new lines (to create one <p /> element by line)
                var new_lines = new Array(body);
                
                if(body.match(/\n/))
                    new_lines = body.split('\n');
                
                // Create the XML elements
                var aHtml = aMsg.appendNode('html', {'xmlns': NS_XHTML_IM});
                var aBody = aHtml.appendChild(aMsg.buildNode('body', {'xmlns': NS_XHTML}));
                
                // Use the exploded body array to create one element per entry
                for(var i in new_lines) {
                    // Current line
                    var cLine = new_lines[i];
                    
                    // Blank line, we put a <br />
                    if(cLine.match(/(^)(\s+)($)/) || !cLine)
                        aBody.appendChild(aMsg.buildNode('br', {'xmlns': NS_XHTML}));
                    
                    // Line with content, we put a <p />
                    else {
                        // HTML encode the line
                        cLine = cLine.htmlEnc();
                        
                        // Filter the links
                        cLine = Links.apply(cLine, 'xhtml-im', style);
                        
                        // Append the filtered line
                        $(aBody).append($('<p style="' + style + '">' + cLine + '</p>'));
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
     * @return {undefined}
     */
    self.display = function(type, xid, hash, name, body, time, stamp, message_type, html_escape, nick_quote, mode, id, c_target_sel, no_scroll) {

        try {
            // Target
            if(typeof c_target_sel === 'undefined') {
                c_target_sel = $('#' + hash + ' .content');
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
            
            // Filter the message
            var filteredMessage = Filter.message(body, name, html_escape);

            // Display the received message in the room
            var messageCode = '<div class="one-line ' + message_type + nick_quote + '" data-stamp="' + stamp + '"' + data_id + '>';
            
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
            
            messageCode += filteredMessage + '</div>';
            
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
                messageCode = '<div class="one-group ' + xid_hash + '" data-type="' + message_type + '" data-stamp="' + stamp + '">' + message_head + messageCode + '</div>';
            }

            // Write the code in the DOM
            if(grouped) {
                c_target_sel.find('.one-group:last').append(messageCode);
            } else {
                c_target_sel.append(messageCode);
            }

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
                if(store_html) {
                    self.storeLocalArchive(hash, store_html);
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
        } catch(e) {
            Console.error('Message.display', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();