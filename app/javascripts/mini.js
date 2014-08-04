/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, hunterjm, Camaran, regilero, Kloadut, Maranda

*/

// Jappix Mini globals
var MINI_DISCONNECT             = false;
var MINI_AUTOCONNECT            = false;
var MINI_SHOWPANE               = false;
var MINI_INITIALIZED            = false;
var MINI_ROSTER_INIT            = false;
var MINI_ROSTER_NOGROUP         = 'jm_nogroup';
var MINI_ANONYMOUS              = false;
var MINI_ANIMATE                = false;
var MINI_RANDNICK               = false;
var MINI_GROUPCHAT_PRESENCE     = false;
var MINI_DISABLE_MOBILE         = false;
var MINI_NICKNAME               = '';
var MINI_TITLE                  = null;
var MINI_DOMAIN                 = null;
var MINI_USER                   = null;
var MINI_PASSWORD               = null;
var MINI_HASH                   = null;
var MINI_ACTIVE                 = null;
var MINI_RECONNECT              = 0;
var MINI_RECONNECT_MAX          = 100;
var MINI_RECONNECT_INTERVAL     = 1;
var MINI_PIXEL_STREAM_DURATION  = 300;
var MINI_PIXEL_STREAM_INTERVAL  = 7200;
var MINI_QUEUE                  = [];
var MINI_CHATS                  = [];
var MINI_GROUPCHATS             = [];
var MINI_SUGGEST_CHATS          = [];
var MINI_SUGGEST_GROUPCHATS     = [];
var MINI_SUGGEST_PASSWORDS      = [];
var MINI_PASSWORDS              = [];
var MINI_PRIORITY               = 1;
var MINI_RESOURCE               = JAPPIX_RESOURCE + ' Mini';
var MINI_ERROR_LINK             = 'https://mini.jappix.com/issues';


// Bundle
var JappixMini = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Setups connection handlers
     * @public
     * @param {object} con
     * @return {undefined}
     */
    self.setupCon = function(con) {

        try {
            con.registerHandler('message', self.handleMessage);
            con.registerHandler('presence', self.handlePresence);
            con.registerHandler('iq', self.handleIQ);
            con.registerHandler('onerror', self.handleError);
            con.registerHandler('onconnect', self.connected);
        } catch(e) {
            JappixConsole.error('JappixMini.setupCon', e);
        }

    };


    /**
     * Connects the user with the given logins
     * @public
     * @param {type} domain
     * @param {type} user
     * @param {type} password
     * @return {boolean}
     */
    self.connect = function(domain, user, password) {

        try {
            oArgs = {};

            // Check BOSH origin
            BOSH_SAME_ORIGIN = Origin.isSame(oArgs.httpbase);

            // We create the new http-binding connection
            con = new JSJaCHttpBindingConnection({
                httpbase: (HOST_BOSH_MINI || HOST_BOSH)
            });

            // And we handle everything that happen
            self.setupCon(con);

            // fixes #339
            var store_resource = (BrowserDetect.browser != 'Explorer');
            var random_resource = null;

            if(store_resource) {
                // Randomize resource?
                random_resource = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'resource');
            }

            if(!random_resource) {
                random_resource = MINI_RESOURCE + ' (' + (new Date()).getTime() + ')';
            }

            // We retrieve what the user typed in the login inputs
            oArgs = {};
            oArgs.secure = true;
            oArgs.xmllang = XML_LANG;
            oArgs.resource = random_resource;
            oArgs.domain = domain;

            // Store the resource (for reconnection)
            if(store_resource) {
                JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'resource', random_resource);
            }

            // Anonymous login?
            if(MINI_ANONYMOUS) {
                // Anonymous mode disabled?
                if(!JappixCommon.allowedAnonymous()) {
                    JappixConsole.warn('Not allowed to use anonymous mode.');

                    // Notify this error
                    self.notifyError();

                    return false;
                }

                // Bad domain?
                else if(JappixCommon.lockHost() && (domain != HOST_ANONYMOUS)) {
                    JappixConsole.warn('Not allowed to connect to this anonymous domain: ' + domain);

                    // Notify this error
                    self.notifyError();

                    return false;
                }

                oArgs.authtype = 'saslanon';
            }

            // Normal login
            else {
                // Bad domain?
                if(JappixCommon.lockHost() && (domain != HOST_MAIN)) {
                    JappixConsole.warn('Not allowed to connect to this main domain: ' + domain);

                    // Notify this error
                    self.notifyError();

                    return false;
                }

                // No nickname?
                if(!MINI_NICKNAME) {
                    MINI_NICKNAME = user;
                }

                oArgs.username = user;
                oArgs.pass = password;
            }

            // We connect !
            con.connect(oArgs);

            JappixConsole.info('Jappix Mini is connecting...');
        } catch(e) {
            JappixConsole.error('JappixMini.connect', e);

            // Reset Jappix Mini
            self.disconnected();
        } finally {
            return false;
        }

    };


    /**
     * When the user is connected
     * @public
     * @return {undefined}
     */
    self.connected = function() {

        try {
            // Do not get the roster if anonymous
            if(!MINI_RECONNECT) {
                // Update the roster
                jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text('0');

                if(MINI_ANONYMOUS) {
                    self.initialize();
                } else {
                    self.getRoster();
                }

                JappixConsole.info('Jappix Mini is now connected.');
            } else {
                self.reconnected();

                JappixConsole.info('Jappix Mini is now reconnected.');
            }

            // Reset reconnect var
            MINI_RECONNECT = 0;
            JappixDataStore.removeDB(MINI_HASH, 'jappix-mini', 'reconnect');

            // Execute enqueued events
            self.dequeue();
        } catch(e) {
            JappixConsole.error('JappixMini.connected', e);
        }

    };


    /**
     * When the user is reconnected
     * @public
     * @return {undefined}
     */
    self.reconnected = function() {

        try {
            var last_presence = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'presence-last') || 'available';

            // Flush presence storage
            self.flushStorage('presence');

            // Empty groupchat messages
            jQuery('#jappix_mini div.jm_conversation.jm_type_groupchat div.jm_received-messages div.jm_group').remove();

            // Re-send all presences
            jQuery('#jappix_mini div.jm_status_picker a[data-status="' + JappixCommon.encodeQuotes(last_presence) + '"]').click();
        } catch(e) {
            JappixConsole.error('JappixMini.reconnected', e);
        }

    };


    /**
     * When the user disconnects
     * @public
     * @return {undefined}
     */
    self.saveSession = function() {

        try {
            // Not initialized?
            if(!MINI_INITIALIZED) {
                return;
            }

            // Reset Jappix Mini DOM before saving it
            self.resetPixStream();

            // Save the actual Jappix Mini DOM
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'dom', jQuery('#jappix_mini').html());
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'nickname', MINI_NICKNAME);

            // Save the scrollbar position
            var scroll_position = '';
            var scroll_hash = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');

            if(scroll_hash) {
                scroll_position = document.getElementById('received-' + scroll_hash).scrollTop + '';
            }

            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'scroll', scroll_position);

            // Suspend connection
            if(JappixCommon.isConnected()) {
                con.suspend(false);
            } else {
                JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'reconnect', ((MINI_RECONNECT === 0) ? 0 : (MINI_RECONNECT - 1)));
                self.serializeQueue();
            }

            JappixConsole.info('Jappix Mini session save tool launched.');
        } catch(e) {
            JappixConsole.error('JappixMini.saveSession', e);
        }

    };


    /**
     * Flushes Jappix Mini storage database
     * @public
     * @param {string} r_override
     * @return {undefined}
     */
    self.flushStorage = function(r_override) {

        try {
            var i,
            db_regex, db_current;

            db_regex = new RegExp(('^' + MINI_HASH + '_') + 'jappix-mini' + (r_override ? ('_' + r_override) : ''));

            for(i = 0; i < JappixDataStore.storageDB.length; i++) {
                db_current = JappixDataStore.storageDB.key(i);

                if(db_regex.exec(db_current)) {
                    JappixDataStore.storageDB.removeItem(db_current);
                }
            }

            JappixConsole.log('Jappix Mini DB has been successfully flushed (' + (r_override ? 'partly' : 'completely') + ').');
        } catch(e) {
            JappixConsole.error('JappixMini.flushStorage', e);
        }

    };


    /**
     * Disconnects the connected user
     * @public
     * @return {boolean}
     */
    self.disconnect = function() {

        try {
            // No connection?
            if(!JappixCommon.isConnected()) {
                return false;
            }

            JappixConsole.info('Jappix Mini is disconnecting...');

            // Change markers
            MINI_DISCONNECT = true;
            MINI_INITIALIZED = false;

            // Flush storage
            self.flushStorage();

            // Add disconnection handler
            con.registerHandler('ondisconnect', function() {
                self.disconnected();
            });

            // Disconnect the user
            con.disconnect();

            return false;
        } catch(e) {
            JappixConsole.error('JappixMini.disconnect', e);
        }

    };


    /**
     * When the user is disconnected
     * @public
     * @return {boolean}
     */
    self.disconnected = function() {

        try {
            // Connection error?
            if(!MINI_DISCONNECT || MINI_INITIALIZED) {
                // Reset reconnect timer
                jQuery('#jappix_mini').stopTime();

                // Try to reconnect after a while
                if(MINI_INITIALIZED && (MINI_RECONNECT++ < MINI_RECONNECT_MAX)) {
                    // Set timer
                    jQuery('#jappix_mini').oneTime(MINI_RECONNECT_INTERVAL * 1000, function() {
                        JappixConsole.debug('Trying to reconnect... (attempt: ' + MINI_RECONNECT + ' / ' + MINI_RECONNECT_MAX + ')');

                        // Silently reconnect user
                        self.connect(MINI_DOMAIN, MINI_USER, MINI_PASSWORD);
                    });

                    JappixConsole.info('Jappix Mini is encountering connectivity issues.');
                } else {
                    // Remove the stored items
                    self.flushStorage();

                    // Notify this error
                    self.notifyError();

                    // Reset markers
                    MINI_DISCONNECT = false;
                    MINI_INITIALIZED = false;

                    JappixConsole.info('Jappix Mini is giving up. Server seems to be down.');
                }
            }

            // Normal disconnection?
            else {
                launchMini(false, MINI_SHOWPANE, MINI_DOMAIN, MINI_USER, MINI_PASSWORD);

                // Reset markers
                MINI_DISCONNECT = false;
                MINI_INITIALIZED = false;

                JappixConsole.info('Jappix Mini is now disconnected.');
            }
        } catch(e) {
            JappixConsole.error('JappixMini.disconnected', e);
        }

    };


    /**
     * Handles the incoming errors
     * @public
     * @param {object} err
     * @return {undefined}
     */
    self.handleError = function(err) {

        try {
            // First level error (connection error)
            if(jQuery(err).is('error')) {
                // Notify this error
                self.disconnected();

                JappixConsole.error('First level error received.');
            }
        } catch(e) {
            JappixConsole.error('JappixMini.handleError', e);
        }

    };


    /**
     * Handles the incoming messages
     * @public
     * @param {object} msg
     * @return {undefined}
     */
    self.handleMessage = function(msg) {

        try {
            var type = msg.getType();

            // This is a message Jappix can handle
            if((type == 'chat') || (type == 'normal') || (type == 'groupchat') || !type) {
                // Get the packet data
                var node = msg.getNode();
                var subject = jQuery.trim(msg.getSubject());
                var body = subject ? subject : jQuery.trim(msg.getBody());

                // Get the sender data
                var from = JappixCommon.fullXID(JappixCommon.getStanzaFrom(msg));
                var xid = JappixCommon.bareXID(from);
                var hash = hex_md5(xid);

                // Any attached message body?
                if(body) {
                    // Get more sender data
                    var use_xid = xid;
                    var nick = JappixCommon.thisResource(from);

                    // Read the delay
                    var delay = JappixDateUtils.readMessageDelay(node);
                    var d_stamp;

                    // Manage this delay
                    if(delay) {
                        time = JappixDateUtils.relative(delay);
                        d_stamp = Date.jab2date(delay);
                    }

                    else {
                        time = JappixDateUtils.getCompleteTime();
                        d_stamp = new Date();
                    }

                    // Get the stamp
                    var stamp = JappixDateUtils.extractStamp(d_stamp);

                    // Is this a groupchat private message?
                    if(JappixCommon.exists('#jappix_mini #chat-' + hash + '[data-type="groupchat"]')) {
                        // Regenerate some stuffs
                        if((type == 'chat') || (type == 'normal') || !type) {
                            xid = from;
                            hash = hex_md5(xid);
                        }

                        // XID to use for a groupchat
                        else {
                            use_xid = from;
                        }
                    }

                    // Message type
                    var message_type = 'user-message';

                    // Grouphat values
                    if(type == 'groupchat') {
                        // Old message
                        if(msg.getChild('delay', NS_URN_DELAY) || msg.getChild('x', NS_DELAY)) {
                            message_type = 'old-message';
                        }

                        // System message?
                        if(!nick || subject) {
                            nick = '';
                            message_type = 'system-message';
                        }
                    }

                    // Chat values
                    else {
                        nick = jQuery('#jappix_mini a#friend-' + hash).text().revertHtmlEnc();

                        // No nickname?
                        if(!nick) {
                            // If the roster does not give us any nick the user may have send us a nickname to use with his first message
                            // @see http://xmpp.org/extensions/xep-0172.html
                            var unknown_entry = jQuery('#jappix_mini a.jm_unknown[data-xid="' + xid + '"]');

                            if(unknown_entry.size() > 0) {
                                nick =  unknown_entry.attr('data-nick');
                            } else {
                                var msgnick = msg.getNick();
                                nick = JappixCommon.getXIDNick(xid);

                                if(msgnick) {
                                    // If there is a nickname in the message which differs from the jid-extracted nick then tell it to the user
                                    if(nick != msgnick)
                                         nick = msgnick + ' (' + nick + ')';
                                }

                                // Push that unknown guy in a temporary roster entry
                                unknown_entry = jQuery('<a class="jm_unknown jm_offline" href="#"></a>').attr('data-nick', nick).attr('data-xid', xid);
                                unknown_entry.appendTo('#jappix_mini div.jm_roster div.jm_buddies');
                             }
                        }
                    }

                    // Define the target div
                    var target = '#jappix_mini #chat-' + hash;

                    // Create the chat if it does not exist
                    if(!JappixCommon.exists(target) && (type != 'groupchat')) {
                        self.chat(type, xid, nick, hash);
                    }

                    // Display the message
                    self.displayMessage(type, body, use_xid, nick, hash, time, stamp, message_type);

                    // Notify the user if not focused & the message is not a groupchat old one
                    if((!jQuery(target + ' a.jm_chat-tab').hasClass('jm_clicked') || !JappixCommon.isFocused() || (MINI_ACTIVE != hash)) && (message_type == 'user-message')) {
                        // Play a sound
                        if(type != 'groupchat') {
                            self.soundPlay();
                        }

                        // Show a notification bubble
                        self.notifyMessage(hash);
                    }

                    JappixConsole.log('Message received from: ' + from);
                }

                // Chatstate groupchat filter
                if(JappixCommon.exists('#jappix_mini #chat-' + hash + '[data-type="groupchat"]')) {
                    xid = from;
                    hash = hex_md5(xid);
                }

                // Reset current chatstate
                self.resetChatstate(xid, hash, type);

                // Apply new chatstate (if supported)
                if(jQuery(node).find('active[xmlns="' + NS_CHATSTATES + '"]').size() || jQuery(node).find('composing[xmlns="' + NS_CHATSTATES + '"]').size()) {
                    // Set marker to tell other user supports chatstates
                    jQuery('#jappix_mini #chat-' + hash + ' input.jm_send-messages').attr('data-chatstates', 'true');

                    // Composing?
                    if(jQuery(node).find('composing[xmlns="' + NS_CHATSTATES + '"]').size()) {
                        self.displayChatstate('composing', xid, hash, type);
                    }
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.handleMessage', e);
        }

    };


    /**
     * Handles the incoming IQs
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleIQ = function(iq) {

        try {
            // Define some variables
            var iqFrom = JappixCommon.fullXID(JappixCommon.getStanzaFrom(iq));
            var iqID = iq.getID();
            var iqQueryXMLNS = iq.getQueryXMLNS();
            var iqType = iq.getType();
            var iqNode = iq.getNode();
            var iqQuery;

            // Build the response
            var iqResponse = new JSJaCIQ();

            iqResponse.setID(iqID);
            iqResponse.setTo(iqFrom);
            iqResponse.setType('result');

            // Software version query
            if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0092.html */

                iqQuery = iqResponse.setQuery(NS_VERSION);

                iqQuery.appendChild(iq.buildNode('name', {'xmlns': NS_VERSION}, 'Jappix Mini'));
                iqQuery.appendChild(iq.buildNode('version', {'xmlns': NS_VERSION}, JAPPIX_VERSION));
                iqQuery.appendChild(iq.buildNode('os', {'xmlns': NS_VERSION}, navigator.platform));

                con.send(iqResponse);

                JappixConsole.log('Received software version query: ' + iqFrom);
            }

            // Roster push
            else if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set')) {
                // Display the friend
                self.handleRoster(iq);

                con.send(iqResponse);

                JappixConsole.log('Received a roster push.');
            }

            // Disco info query
            else if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0030.html */

                iqQuery = iqResponse.setQuery(NS_DISCO_INFO);

                // We set the name of the client
                iqQuery.appendChild(iq.appendNode('identity', {
                    'category': 'client',
                    'type': 'web',
                    'name': 'Jappix Mini',
                    'xmlns': NS_DISCO_INFO
                }));

                // We set all the supported features
                var fArray = [
                    NS_DISCO_INFO,
                    NS_VERSION,
                    NS_ROSTER,
                    NS_MUC,
                    NS_VERSION,
                    NS_URN_TIME
                ];

                for(var i in fArray) {
                    iqQuery.appendChild(iq.buildNode('feature', {'var': fArray[i], 'xmlns': NS_DISCO_INFO}));
                }

                con.send(iqResponse);

                JappixConsole.log('Received a disco#infos query.');
            }

            // User time query
            else if(jQuery(iqNode).find('time').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0202.html */

                var iqTime = iqResponse.appendNode('time', {'xmlns': NS_URN_TIME});
                iqTime.appendChild(iq.buildNode('tzo', {'xmlns': NS_URN_TIME}, JappixDateUtils.getTZO()));
                iqTime.appendChild(iq.buildNode('utc', {'xmlns': NS_URN_TIME}, JappixDateUtils.getXMPPTime('utc')));

                con.send(iqResponse);

                JappixConsole.log('Received local time query: ' + iqFrom);
            }

            // Ping
            else if(jQuery(iqNode).find('ping').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0199.html */

                con.send(iqResponse);

                JappixConsole.log('Received a ping: ' + iqFrom);
            }

            // Not implemented
            else if(!jQuery(iqNode).find('error').size() && ((iqType == 'get') || (iqType == 'set'))) {
                // Append stanza content
                for(var c = 0; c < iqNode.childNodes.length; c++) {
                    iqResponse.getNode().appendChild(iqNode.childNodes.item(c).cloneNode(true));
                }

                // Append error content
                var iqError = iqResponse.appendNode('error', {'xmlns': NS_CLIENT, 'code': '501', 'type': 'cancel'});
                iqError.appendChild(iq.buildNode('feature-not-implemented', {'xmlns': NS_STANZAS}));
                iqError.appendChild(iq.buildNode('text', {'xmlns': NS_STANZAS}, JappixCommon._e("The feature requested is not implemented by the recipient or server and therefore cannot be processed.")));

                con.send(iqResponse);

                JappixConsole.log('Received an unsupported IQ query from: ' + iqFrom);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.handleIQ', e);
        }

    };


    /**
     * Handles the incoming presences
     * @public
     * @param {object} pr
     * @return {undefined}
     */
    self.handlePresence = function(pr) {

        try {
            // Get the values
            var xml           = pr.getNode();
            var from          = JappixCommon.fullXID(JappixCommon.getStanzaFrom(pr));
            var xid           = JappixCommon.bareXID(from);
            var resource      = JappixCommon.thisResource(from);
            var resources_obj = {};

            // Is this a groupchat?
            if(JappixCommon.exists('#jappix_mini div.jm_conversation[data-type="groupchat"][data-xid="' + JappixCommon.escapeQuotes(xid) + '"]')) {
                xid = from;
            }

            // Store presence stanza
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + from, pr.xml());
            resources_obj = self.addResourcePresence(xid, resource);

            // Re-process presence storage for this buddy
            self.processPresence(xid, resource, resources_obj);

            // Display that presence
            self.displayPresence(xid);

            JappixConsole.log('Presence received from: ' + from);
        } catch(e) {
            JappixConsole.error('JappixMini.handlePresence', e);
        }

    };


    /**
     * Reads a stored presence
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.readPresence = function(from) {

        try {
            var pr = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + from);

            if(!pr) {
                pr = '<presence type="unavailable"></presence>';
            }

            return JappixCommon.XMLFromString(pr);
        } catch(e) {
            JappixConsole.error('JappixMini.readPresence', e);
        }

    };


    /**
     * Lists presence resources for an user
     * @public
     * @param {string} xid
     * @return {object}
     */
    self.resourcesPresence = function(xid) {

        var resources_obj = {};

        try {
            var resources_db  = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid);

            if(resources_db) {
                resources_obj = jQuery.evalJSON(resources_db);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.resourcesPresence', e);
        } finally {
            return resources_obj;
        }

    };


    /**
     * Adds a given presence resource for an user
     * @public
     * @param {string} xid
     * @param {string} resource
     * @return {object}
     */
    self.addResourcePresence = function(xid, resource) {

        try {
            var resources_obj = self.resourcesPresence(xid);

            resources_obj[resource] = 1;
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid, jQuery.toJSON(resources_obj));

            return resources_obj;
        } catch(e) {
            JappixConsole.error('JappixMini.addResourcePresence', e);

            return null;
        }

    };


    /**
     * Removes a given presence resource for an user
     * @public
     * @param {string} xid
     * @param {string} resource
     * @return {object}
     */
    self.removeResourcePresence = function(xid, resource) {

        try {
            var resources_obj = self.resourcesPresence(xid);

            delete resources_obj[resource];
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid, jQuery.toJSON(resources_obj));

            return resources_obj;
        } catch(e) {
            JappixConsole.error('JappixMini.removeResourcePresence', e);

            return null;
        }

    };


    /**
     * Process presence storage for a given contact
     * @public
     * @param {string} xid
     * @param {string} resource
     * @param {object} resources_obj
     * @return {undefined}
     */
    self.processPresence = function(xid, resource, resources_obj) {

        try {
            if(!xid) {
                JappixConsole.warn('No XID value for precense processing.');
                return;
            }

            // Initialize vars
            var cur_resource, cur_from, cur_pr,
                cur_xml, cur_priority,
                from_highest;

            from_highest = null;
            max_priority = null;

            // Groupchat presence? (no priority here)
            if(xid.indexOf('/') !== -1) {
                from_highest = xid;

                JappixConsole.log('Processed presence for groupchat user: ' + xid);
            } else {
                if(!self.priorityPresence(xid)) {
                    from_highest = xid + '/' + resource;

                    JappixConsole.log('Processed initial presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                } else {
                    for(cur_resource in resources_obj) {
                        // Read presence data
                        cur_from = xid + '/' + cur_resource;
                        cur_pr   = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + cur_from);

                        if(cur_pr) {
                            // Parse presence data
                            cur_xml      = JappixCommon.XMLFromString(cur_pr);
                            cur_priority = jQuery(cur_xml).find('priority').text();
                            cur_priority = !isNaN(cur_priority) ? parseInt(cur_priority) : 0;

                            // Higher priority?
                            if((cur_priority >= max_priority) || (max_priority === null)) {
                                max_priority = cur_priority;
                                from_highest = cur_from;
                            }
                        }
                    }

                    JappixConsole.log('Processed presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                }
            }

            if(from_highest) {
                JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'presence-priority-' + xid, from_highest);
            } else {
                JappixDataStore.removeDB(MINI_HASH, 'jappix-mini', 'presence-priority-' + xid);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.processPresence', e);
        }

    };


    /**
     * Returns highest presence priority
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.priorityPresence = function(xid) {

        try {
            return JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'presence-priority-' + xid) || '';
        } catch(e) {
            JappixConsole.error('JappixMini.priorityPresence', e);

            return null;
        }

    };


    /**
     * Displays a Jappix Mini presence
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.displayPresence = function(xid) {

        try {
            // Get the values
            var from     = self.priorityPresence(xid);
            var xml      = self.readPresence(from);
            var pr       = jQuery(xml).find('presence');
            var resource = JappixCommon.thisResource(from);
            var bare_xid = JappixCommon.bareXID(xid);
            var hash     = hex_md5(bare_xid);
            var type     = pr.attr('type');
            var show     = pr.find('show').text();

            // Manage the received presence values
            if((type == 'error') || (type == 'unavailable')) {
                show = 'unavailable';
            } else {
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
            }

            // Is this a groupchat presence?
            var groupchat_path = '#jappix_mini #chat-' + hash + '[data-type="groupchat"]';
            var is_groupchat = false;

            if(JappixCommon.exists(groupchat_path)) {
                // Groupchat exists
                is_groupchat = true;

                // Groupchat buddy presence (not me)
                if(resource != JappixCommon.unescapeQuotes(jQuery(groupchat_path).attr('data-nick'))) {
                    // Regenerate some stuffs
                    var groupchat = xid;
                    var groupchat_hash = hash;
                    xid = from;
                    hash = hex_md5(xid);

                    // Process this groupchat user presence
                    var log_message;

                    if(show == 'unavailable') {
                        // Remove from roster view
                        self.removeBuddy(hash, groupchat);

                        // Generate log message
                        log_message = JappixCommon.printf(JappixCommon._e("%s left"), resource.htmlEnc());
                    } else {
                        // Add to roster view
                        self.addBuddy(xid, hash, resource, groupchat);

                        // Generate log message
                        log_message = JappixCommon.printf(JappixCommon._e("%s joined"), resource.htmlEnc());
                    }

                    // Log message in chat view
                    if(MINI_GROUPCHAT_PRESENCE && log_message && (jQuery(groupchat_path).attr('data-init') == 'true')) {
                        self.displayMessage('groupchat', log_message, xid, '', groupchat_hash, JappixDateUtils.getCompleteTime(), JappixDateUtils.getTimeStamp(), 'system-message');
                    }
                }
            }

            // Friend path
            var chat = '#jappix_mini #chat-' + hash;
            var friend = '#jappix_mini a#friend-' + hash;
            var send_input = chat + ' input.jm_send-messages';

            // Is this friend online?
            if(show == 'unavailable') {
                // Offline marker
                jQuery(friend).addClass('jm_offline').removeClass('jm_online jm_hover');

                // Hide the friend just to be safe since the search uses .hide() and .show() which can override the CSS display attribute
                jQuery(friend).hide();

                // Disable the chat tools
                if(is_groupchat) {
                    jQuery(chat).addClass('jm_disabled').attr('data-init', 'false');
                    jQuery(send_input).blur().attr('disabled', true).attr('data-value', JappixCommon._e("Unavailable")).val(JappixCommon._e("Unavailable"));
                }
            } else {
                // Online marker
                jQuery(friend).removeClass('jm_offline').addClass('jm_online');

                // Check against search string
                var search = jQuery('#jappix_mini div.jm_roster div.jm_search input.jm_searchbox').val();
                var regex = new RegExp('((^)|( ))' + JappixCommon.escapeRegex(search), 'gi');
                var nick = JappixCommon.unescapeQuotes(jQuery(friend).data('nick'));

                if(search && !nick.match(regex)) {
                    jQuery(friend).hide();
                } else {
                    jQuery(friend).show();
                }

                // Enable the chat input
                if(is_groupchat) {
                    jQuery(chat).removeClass('jm_disabled');
                    jQuery(send_input).removeAttr('disabled').val('');
                }
            }

            // Change the show presence of this buddy
            jQuery(friend + ' span.jm_presence, ' + chat + ' span.jm_presence').attr('class', 'jm_presence jm_images jm_' + show);

            // Update the presence counter
            self.updateRoster();

            // Update groups visibility
            self.updateGroups();

            JappixConsole.log('Presence displayed for user: ' + xid);
        } catch(e) {
            JappixConsole.error('JappixMini.displayPresence', e);
        }

    };


    /**
     * Handles the MUC main elements
     * @public
     * @param {object} pr
     * @return {undefined}
     */
    self.handleMUC = function(pr) {

        try {
            // We get the xml content
            var xml = pr.getNode();
            var from = JappixCommon.fullXID(JappixCommon.getStanzaFrom(pr));
            var room = JappixCommon.bareXID(from);
            var hash = hex_md5(room);
            var resource = JappixCommon.thisResource(from);

            // Is it a valid server presence?
            var valid = false;

            if(!resource || (resource == JappixCommon.unescapeQuotes(jQuery('#jappix_mini #chat-' + hash + '[data-type="groupchat"]').attr('data-nick')))) {
                valid = true;
            }

            // Password required?
            if(valid && jQuery(xml).find('error[type="auth"] not-authorized').size()) {
                // Create a new prompt
                self.openPrompt(JappixCommon.printf(JappixCommon._e("This room (%s) is protected with a password."), room));

                // When prompt submitted
                jQuery('#jappix_popup div.jm_prompt form').submit(function() {
                    try {
                        // Read the value
                        var password = self.closePrompt();

                        // Any submitted chat to join?
                        if(password) {
                            // Send the password
                            self.presence('', '', '', '', from, password, true, self.handleMUC);

                            // Focus on the pane again
                            self.switchPane('chat-' + hash, hash);
                        }
                    }

                    catch(e) {}

                    finally {
                        return false;
                    }
                });

                return;
            }

            // Nickname conflict?
            else if(valid && jQuery(xml).find('error[type="cancel"] conflict').size()) {
                // New nickname
                var nickname = resource + '_';

                // Send the new presence
                self.presence('', '', '', '', room + '/' + nickname, '', true, self.handleMUC);

                // Update the nickname marker
                jQuery('#jappix_mini #chat-' + hash).attr('data-nick', JappixCommon.escapeQuotes(nickname));
            }

            // Handle normal presence
            else {
                // Start the initial timer
                jQuery('#jappix_mini #chat-' + hash).oneTime('10s', function() {
                    jQuery(this).attr('data-init', 'true');
                });

                // Trigger presence handler
                self.handlePresence(pr);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.handleMUC', e);
        }

    };


    /**
     * Updates the user presence
     * @public
     * @param {string} type
     * @param {string} show
     * @param {number} priority
     * @param {string} status
     * @param {string} to
     * @param {string} password
     * @param {boolean} limit_history
     * @param {function} handler
     * @return {undefined}
     */
    self.presence = function(type, show, priority, status, to, password, limit_history, handler) {

        try {
            var pr = new JSJaCPresence();

            // Add the attributes
            if(to)
                pr.setTo(to);
            if(type)
                pr.setType(type);
            if(show)
                pr.setShow(show);
            if(status)
                pr.setStatus(status);

            if(priority) {
                pr.setPriority(priority);
            } else if(MINI_PRIORITY && !to) {
                pr.setPriority(MINI_PRIORITY);
            }

            // Special presence elements
            if(password || limit_history) {
                var x = pr.appendNode('x', {'xmlns': NS_MUC});

                // Any password?
                if(password) {
                    x.appendChild(pr.buildNode('password', {'xmlns': NS_MUC}, password));
                }

                // Any history limit?
                if(limit_history) {
                    x.appendChild(pr.buildNode('history', {'maxstanzas': 10, 'seconds': 86400, 'xmlns': NS_MUC}));
                }
            }

            // Send the packet
            if(handler) {
                con.send(pr, handler);
            } else {
                con.send(pr);
            }

            JappixConsole.info('Presence sent (to: ' + (to || 'none') + ', show: ' + (show || 'none') + ', type: ' + (type || 'none') + ')');
        } catch(e) {
            JappixConsole.error('JappixMini.presence', e);
        }

    };


    /**
     * Sends a given message
     * @public
     * @param {object} aForm
     * @return {boolean}
     */
    self.sendMessage = function(aForm) {

        try {
            var body = jQuery.trim(aForm.body.value);
            var xid = aForm.xid.value;
            var type = aForm.type.value;
            var hash = hex_md5(xid);

            if(body && xid) {
                // Send the message
                var aMsg = new JSJaCMessage();

                // If the roster does not give us any nick the user may have send us a nickname to use with his first message
                // @see http://xmpp.org/extensions/xep-0172.html
                var known_roster_entry = jQuery('#jappix_mini a.jm_friend[data-xid="' + JappixCommon.escapeQuotes(xid) + '"]');

                if(known_roster_entry.size() === 0) {
                    var subscription = known_roster_entry.attr('data-sub');

                    // The other may not know my nickname if we do not have both a roster entry, or if he doesn't have one
                    if(('both' != subscription) && ('from' != subscription)) {
                        aMsg.setNick(MINI_NICKNAME);
                    }
                }

                // Message data
                aMsg.setTo(xid);
                aMsg.setType(type);
                aMsg.setBody(body);

                // Chatstate
                aMsg.appendNode('active', {'xmlns': NS_CHATSTATES});

                // Send it!
                self.enqueue(aMsg);

                // Clear the input
                aForm.body.value = '';

                // Display the message we sent
                if(type != 'groupchat') {
                    self.displayMessage(type, body, JappixCommon.getXID(), 'me', hash, JappixDateUtils.getCompleteTime(), JappixDateUtils.getTimeStamp(), 'user-message');
                }

                JappixConsole.log('Message (' + type + ') sent to: ' + xid);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.sendMessage', e);
        } finally {
            return false;
        }

    };


    /**
     * Enqueues a stanza (to be sent over the network)
     * @public
     * @param {object} stanza
     * @return {undefined}
     */
    self.enqueue = function(stanza) {

        try {
            // Send stanza over the network or enqueue it?
            if(JappixCommon.isConnected()) {
                con.send(stanza);
            } else {
                MINI_QUEUE.push(
                    stanza.xml()
                );

                JappixConsole.log('Enqueued an event (to be sent when connectivity is back).');
            }
        } catch(e) {
            JappixConsole.error('JappixMini.enqueue', e);
        }

    };


    /**
     * Dequeues stanzas and send them over the network
     * @public
     * @return {undefined}
     */
    self.dequeue = function() {

        try {
            var stanza_str, stanza_childs,
            stanza;

            // Execute deferred tasks
            while(MINI_QUEUE.length) {
                stanza_str = MINI_QUEUE.shift();
                stanza_childs = JappixCommon.XMLFromString(stanza_str).childNodes;

                if(stanza_childs && stanza_childs[0]) {
                    stanza = JSJaCPacket.wrapNode(stanza_childs[0]);
                    con.send(stanza);
                }

                JappixConsole.log('Dequeued a stanza.');
            }
        } catch(e) {
            JappixConsole.error('JappixMini.dequeue', e);
        }

    };


    /**
     * Serializes and store the queue storage
     * @public
     * @return {undefined}
     */
    self.serializeQueue = function() {

        try {
            JappixDataStore.setDB(MINI_HASH, 'jappix-mini', 'queue', jQuery.toJSON(MINI_QUEUE));
        } catch(e) {
            JappixConsole.error('JappixMini.serializeQueue', e);
        }

    };


    /**
     * Unserializes and update the queue storage
     * @public
     * @return {undefined}
     */
    self.unserializeQueue = function() {

        try {
            var start_body, end_body,
            start_args, end_args;

            var s_queue = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'queue');
            JappixDataStore.removeDB(MINI_HASH, 'jappix-mini', 'queue');

            if(s_queue) {
                MINI_QUEUE = jQuery.evalJSON(s_queue);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.unserialize', e);
        }

    };


    /**
     * Generates the asked smiley image
     * @public
     * @param {string} image
     * @param {string} text
     * @return {string}
     */
    self.smiley = function(image, text) {

        try {
            return ' <img class="jm_smiley jm_smiley-' + image + ' jm_images" alt="' + JappixCommon.encodeQuotes(text) + '" src="' + JAPPIX_STATIC + 'images/others/blank.gif' + '" /> ';
        } catch(e) {
            JappixConsole.error('JappixMini.smiley', e);

            return null;
        }

    };


    /**
     * Notifies incoming chat messages
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.notifyMessage = function(hash) {

        try {
            // Define the paths
            var tab = '#jappix_mini #chat-' + hash + ' a.jm_chat-tab';
            var notify = tab + ' span.jm_notify';
            var notify_middle = notify + ' span.jm_notify_middle';

            // Notification box not yet added?
            if(!JappixCommon.exists(notify)) {
                jQuery(tab).append(
                    '<span class="jm_notify">' +
                        '<span class="jm_notify_left jm_images"></span>' +
                        '<span class="jm_notify_middle">0</span>' +
                        '<span class="jm_notify_right jm_images"></span>' +
                    '</span>'
                );
            }

            // Increment the notification number
            var number = parseInt(jQuery(notify_middle).text());
            jQuery(notify_middle).text(number + 1);

            // Update the notification counters
            self.notifyCounters();
        } catch(e) {
            JappixConsole.error('JappixMini.notifyMessage', e);
        }

    };


    /**
     * Notifies the user from a session error
     * @public
     * @return {undefined}
     */
    self.notifyError = function() {

        try {
            // Replace the Jappix Mini DOM content
            jQuery('#jappix_mini').html(
                '<div class="jm_starter">' +
                    '<a class="jm_pane jm_button jm_images" href="' + MINI_ERROR_LINK + '" target="_blank" title="' + JappixCommon._e("Click here to solve the error") + '">' +
                        '<span class="jm_counter jm_error jm_images">' + JappixCommon._e("Error") + '</span>' +
                    '</a>' +
                '</div>'
            );
        } catch(e) {
            JappixConsole.error('JappixMini.notifyError', e);
        }

    };


    /**
     * Updates the global counter with the new notifications
     * @public
     * @return {undefined}
     */
    self.notifyCounters = function() {

        try {
            // Count the number of notifications
            var number = 0;

            jQuery('#jappix_mini span.jm_notify span.jm_notify_middle').each(function() {
                number = number + parseInt(jQuery(this).text());
            });

            // Update the notification link counters
            jQuery('#jappix_mini a.jm_switch').removeClass('jm_notifnav');

            if(number) {
                // Left?
                if(jQuery('#jappix_mini div.jm_conversation:visible:first').prevAll().find('span.jm_notify').size())
                    jQuery('#jappix_mini a.jm_switch.jm_left').addClass('jm_notifnav');

                // Right?
                if(jQuery('#jappix_mini div.jm_conversation:visible:last').nextAll().find('span.jm_notify').size())
                    jQuery('#jappix_mini a.jm_switch.jm_right').addClass('jm_notifnav');
            }

            // No saved title? Abort!
            if(MINI_TITLE === null) {
                return;
            }

            // Page title code
            var title = MINI_TITLE;

            // No new stuffs? Reset the title!
            if(number) {
                title = '[' + number + '] ' + title;
            }

            // Apply the title
            document.title = title;
        } catch(e) {
            JappixConsole.error('JappixMini.notifyCounters', e);
        }

    };


    /**
     * Clears the notifications
     * @public
     * @param {string} hash
     * @return {boolean}
     */
    self.clearNotifications = function(hash) {

        try {
            // Not focused?
            if(!JappixCommon.isFocused()) {
                return false;
            }

            // Remove the notifications counter
            jQuery('#jappix_mini #chat-' + hash + ' span.jm_notify').remove();

            // Update the global counters
            self.notifyCounters();

            return true;
        } catch(e) {
            JappixConsole.error('JappixMini.clearNotifications', e);

            return false;
        }

    };


    /**
     * Updates the roster counter
     * @public
     * @return {undefined}
     */
    self.updateRoster = function() {

        try {
            // Update online counter
            jQuery('#jappix_mini a.jm_button span.jm_counter').text(jQuery('#jappix_mini a.jm_online').size());
        } catch(e) {
            JappixConsole.error('JappixMini.updateRoster', e);
        }

    };


    /**
     * Updates the visibility of roster groups
     * @public
     * @return {undefined}
     */
    self.updateGroups = function() {

        try {
            jQuery('.jm_grouped_roster').filter(':not(:has(.jm_friend.jm_online:visible))').hide();
        } catch(e) {
            JappixConsole.error('JappixMini.updateGroups', e);
        }

    };


    /**
     * Updates the chat overflow
     * @public
     * @return {undefined}
     */
    self.updateOverflow = function() {

        try {
            // Process overflow
            var number_visible = parseInt((jQuery(window).width() - 380) / 140);
            var number_visible_dom = jQuery('#jappix_mini div.jm_conversation:visible').size();

            if(number_visible <= 0) {
                number_visible = 1;
            }

            // Need to reprocess?
            if(number_visible != number_visible_dom) {
                // Show hidden chats
                jQuery('#jappix_mini div.jm_conversation:hidden').show();

                // Get total number of chats
                var number_total = jQuery('#jappix_mini div.jm_conversation').size();

                // Must add the overflow switcher?
                if(number_visible < number_total) {
                    // Create the overflow handler?
                    if(!jQuery('#jappix_mini a.jm_switch').size()) {
                        // Add the navigation links
                        jQuery('#jappix_mini div.jm_conversations').before(
                            '<a class="jm_switch jm_left jm_pane jm_images" href="#">' +
                                '<span class="jm_navigation jm_images"></span>' +
                            '</a>'
                        );

                        jQuery('#jappix_mini div.jm_conversations').after(
                            '<a class="jm_switch jm_right jm_pane jm_images" href="#">' +
                                '<span class="jm_navigation jm_images"></span>' +
                            '</a>'
                        );

                        // Add the click events
                        self.overflowEvents();
                    }

                    // Show first visible chats
                    var first_visible = jQuery('#jappix_mini div.jm_conversation:visible:first').index();
                    var index_visible = number_visible - first_visible - 1;

                    jQuery('#jappix_mini div.jm_conversation:visible:gt(' + index_visible + ')').hide();

                    // Close the opened chat
                    if(jQuery('#jappix_mini div.jm_conversation:hidden a.jm_pane.jm_clicked').size()) {
                        self.switchPane();
                    }

                    // Update navigation buttons
                    jQuery('#jappix_mini a.jm_switch').removeClass('jm_nonav');

                    if(!jQuery('#jappix_mini div.jm_conversation:visible:first').prev().size()) {
                        jQuery('#jappix_mini a.jm_switch.jm_left').addClass('jm_nonav');
                    }

                    if(!jQuery('#jappix_mini div.jm_conversation:visible:last').next().size()) {
                        jQuery('#jappix_mini a.jm_switch.jm_right').addClass('jm_nonav');
                    }
                }

                // Must remove the overflow switcher?
                else {
                    jQuery('#jappix_mini a.jm_switch').remove();
                    jQuery('#jappix_mini div.jm_conversation:hidden').show();
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.updateOverflow', e);
        }

    };


    /**
     * Click events on the chat overflow
     * @public
     * @return {undefined}
     */
    self.overflowEvents = function() {

        try {
            jQuery('#jappix_mini a.jm_switch').click(function() {
                var this_sel = jQuery(this);

                // Nothing to do?
                if(this_sel.hasClass('jm_nonav')) {
                    return false;
                }

                var hide_this = '';
                var show_this = '';

                // Go left?
                if(this_sel.is('.jm_left')) {
                    show_this = jQuery('#jappix_mini div.jm_conversation:visible:first').prev();

                    if(show_this.size()) {
                        hide_this = jQuery('#jappix_mini div.jm_conversation:visible:last');
                    }
                }

                // Go right?
                else {
                    show_this = jQuery('#jappix_mini div.jm_conversation:visible:last').next();

                    if(show_this.size()) {
                        hide_this = jQuery('#jappix_mini div.jm_conversation:visible:first');
                    }
                }

                // Update overflow content
                if(show_this && show_this.size()) {
                    // Hide
                    if(hide_this && hide_this.size()) {
                        hide_this.hide();

                        // Close the opened chat
                        if(hide_this.find('a.jm_pane').hasClass('jm_clicked')) {
                            self.switchPane();
                        }
                    }

                    // Show
                    show_this.show();

                    // Update navigation buttons
                    jQuery('#jappix_mini a.jm_switch').removeClass('jm_nonav');

                    if((this_sel.is('.jm_right') && !show_this.next().size()) || (this_sel.is('.jm_left') && !show_this.prev().size())) {
                        this_sel.addClass('jm_nonav');
                    }

                    // Update notification counters
                    self.notifyCounters();
                }

                return false;
            });
        } catch(e) {
            JappixConsole.error('JappixMini.overflowEvents', e);
        }

    };


    /**
     * Creates the Jappix Mini DOM content
     * @public
     * @param {string} domain
     * @param {string} user
     * @param {string} password
     * @return {undefined}
     */
    self.create = function(domain, user, password) {

        try {
            // Try to restore the DOM
            var dom = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'dom');
            var suspended = false;
            var resumed = false;

            // Reset DOM storage (free memory)
            JappixDataStore.removeDB(MINI_HASH, 'jappix-mini', 'dom');

            // Invalid stored DOM?
            if(dom && isNaN(jQuery(dom).find('a.jm_pane.jm_button span.jm_counter').text())) {
                dom = null;
            }

            // Old DOM? (saved session)
            if(dom) {
                // Attempt to resume connection
                con = new JSJaCHttpBindingConnection();

                self.setupCon(con);
                resumed = con.resume();

                // Read the old nickname
                MINI_NICKNAME = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'nickname');

                // Marker
                suspended = true;
                MINI_ROSTER_INIT = true;
            }

            // New DOM?
            else {
                dom = '<div class="jm_position">' +
                        '<div class="jm_conversations"></div>' +

                        '<div class="jm_starter">' +
                            '<div class="jm_roster">' +
                                '<div class="jm_actions">' +
                                    '<a class="jm_logo jm_images" href="https://mini.jappix.com/" target="_blank"></a>' +
                                    '<a class="jm_one-action jm_join jm_images" title="' + JappixCommon._e("Join a chat") + '" href="#"></a>' +
                                    '<a class="jm_one-action jm_status" title="' + JappixCommon._e("Status") + '" href="#">' +
                                        '<span class="jm_presence jm_images jm_available"></span>' +
                                    '</a>' +

                                    '<div class="jm_status_picker">' +
                                        '<a href="#" data-status="available">' +
                                            '<span class="jm_presence jm_images jm_available"></span>' +
                                            '<span class="jm_show_text">' + JappixCommon._e("Available") + '</span>' +
                                        '</a>' +

                                        '<a href="#" data-status="away">' +
                                            '<span class="jm_presence jm_images jm_away"></span>' +
                                            '<span class="jm_show_text">' + JappixCommon._e("Away") + '</span>' +
                                        '</a>' +

                                        '<a href="#" data-status="dnd">' +
                                            '<span class="jm_presence jm_images jm_dnd"></span>' +
                                            '<span class="jm_show_text">' + JappixCommon._e("Busy") + '</span>' +
                                        '</a>' +

                                        '<a href="#" data-status="unavailable">' +
                                            '<span class="jm_presence jm_images jm_unavailable"></span>' +
                                            '<span class="jm_show_text">' + JappixCommon._e("Offline") + '</span>' +
                                        '</a>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="jm_buddies"></div>' +
                                '<div class="jm_search">' +
                                    '<input type="text" class="jm_searchbox jm_images" placeholder="' + JappixCommon._e("Filter") + '" data-value="" />' +
                                '</div>' +
                            '</div>' +

                            '<a class="jm_pane jm_button jm_images" href="#">' +
                                '<span class="jm_counter jm_images">' + JappixCommon._e("Please wait...") + '</span>' +
                            '</a>' +
                        '</div>' +
                      '</div>';
            }

            // Create the DOM
            jQuery('body').append('<div id="jappix_mini" style="display: none;" dir="' + (JappixCommon.isRTL() ? 'rtl' : 'ltr') + '">' + dom + '</div>');

            // Hide the roster picker panels
            jQuery('#jappix_mini a.jm_status.active, #jappix_mini a.jm_join.active').removeClass('active');
            jQuery('#jappix_mini div.jm_status_picker').hide();
            jQuery('#jappix_mini div.jm_chan_suggest').remove();

            // Chat navigation overflow events
            self.overflowEvents();

            // Delay to fix DOM lag bug (CSS file not yet loaded)
            jQuery('#jappix_mini').everyTime(100, function() {
                var this_sel = jQuery(this);

                if(this_sel.is(':visible')) {
                    JappixConsole.info('CSS loaded asynchronously.');

                    this_sel.stopTime();

                    // Re-process chat overflow
                    self.updateOverflow();

                    // Adapt roster height
                    self.adaptRoster();

                    // Update current pixel streams
                    self.updatePixStream();
                }
            });

            // Auto-check if ads should be added
            if(ADS_ENABLE === 'on' && GADS_CLIENT && GADS_SLOT) {
                jQuery('#jappix_mini div.jm_conversations').everyTime('60s', function() {
                    JappixConsole.debug('JappixMini.create[timer]', 'Auto-updating ads...');

                    self.updatePixStream();

                    JappixConsole.debug('JappixMini.create[timer]', 'Done auto-updating ads.');
                });
            }

            // CSS refresh (Safari display bug when restoring old DOM)
            jQuery('#jappix_mini div.jm_starter').css('float', 'right');
            jQuery('#jappix_mini div.jm_conversations, #jappix_mini div.jm_conversation, #jappix_mini a.jm_switch').css('float', 'left');

            // The click events
            jQuery('#jappix_mini a.jm_button').click(function() {
                // Using a try/catch override IE issues
                try {
                    // Presence counter
                    var counter = '#jappix_mini a.jm_pane.jm_button span.jm_counter';

                    // Cannot open the roster?
                    if(jQuery(counter).text() == JappixCommon._e("Please wait...")) {
                        return false;
                    }

                    // Not yet connected?
                    if(jQuery(counter).text() == JappixCommon._e("Chat")) {
                        // Remove the animated bubble
                        jQuery('#jappix_mini div.jm_starter span.jm_animate').remove();

                        // Add a waiting marker
                        jQuery(counter).text(JappixCommon._e("Please wait..."));

                        // Launch the connection!
                        self.connect(domain, user, password);

                        return false;
                    }

                    // Normal actions
                    if(!jQuery(this).hasClass('jm_clicked')) {
                        self.showRoster();
                    } else {
                        self.hideRoster();
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            jQuery('#jappix_mini a.jm_status').click(function() {
                // Using a try/catch override IE issues
                try {
                    var this_sel = jQuery(this);
                    var is_active = this_sel.hasClass('active');

                    jQuery('#jappix_mini div.jm_actions a').blur().removeClass('active');

                    if(is_active) {
                        jQuery('#jappix_mini div.jm_status_picker').hide();
                    } else {
                        jQuery('#jappix_mini div.jm_chan_suggest').remove();
                        jQuery('#jappix_mini div.jm_status_picker').show();
                        this_sel.addClass('active');
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            jQuery('#jappix_mini div.jm_status_picker a').click(function() {
                // Using a try/catch override IE issues
                try {
                    var this_sel = jQuery(this);

                    // Generate an array of presence change XIDs
                    var pr_xid = [''];

                    jQuery('#jappix_mini div.jm_conversation[data-type="groupchat"]').each(function() {
                        var this_sub_sel = jQuery(this);
                        pr_xid.push(JappixCommon.unescapeQuotes(this_sub_sel.attr('data-xid')) + '/' + JappixCommon.unescapeQuotes(this_sub_sel.attr('data-nick')));
                    });

                    // Loop on XIDs
                    var new_status = this_sel.data('status');

                    jQuery.each(pr_xid, function(key, value) {
                        switch(new_status) {
                            case 'available':
                                self.presence('', '', '', '', value);
                                break;

                            case 'away':
                                self.presence('', 'away', '', '', value);
                                break;

                            case 'dnd':
                                self.presence('', 'dnd', '', '', value);
                                break;

                            case 'unavailable':
                                self.disconnect();
                                break;

                            default:
                                self.presence('', '', '', '', value);
                                break;
                        }
                    });

                    // Switch the status
                    if(new_status != 'unavailable') {
                        jQuery('#jappix_mini a.jm_status span').removeClass('jm_available jm_away jm_dnd jm_unavailable')
                                                               .addClass('jm_' + this_sel.data('status'));

                        jQuery('#jappix_mini div.jm_status_picker').hide();
                        jQuery('#jappix_mini a.jm_status').blur().removeClass('active');
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            jQuery('#jappix_mini div.jm_actions a.jm_join').click(function() {
                // Using a try/catch override IE issues
                try {
                    var this_sel = jQuery(this);

                    // Any suggested chat/groupchat?
                    if((MINI_SUGGEST_CHATS && MINI_SUGGEST_CHATS.length) || (MINI_SUGGEST_GROUPCHATS && MINI_SUGGEST_GROUPCHATS.length)) {
                        var is_active = this_sel.hasClass('active');
                        jQuery('#jappix_mini div.jm_actions a').blur().removeClass('active');

                        if(is_active) {
                            jQuery('#jappix_mini div.jm_chan_suggest').remove();
                        } else {
                            // Button style
                            jQuery('#jappix_mini div.jm_status_picker').hide();
                            this_sel.addClass('active');

                            // Generate selector code
                            var chans_html = '';

                            // Generate the groupchat links HTML
                            for(var i = 0; i < MINI_SUGGEST_GROUPCHATS.length; i++) {
                                // Empty value?
                                if(!MINI_SUGGEST_GROUPCHATS[i]) {
                                    continue;
                                }

                                // Using a try/catch override IE issues
                                try {
                                    var chat_room = JappixCommon.bareXID(JappixCommon.generateXID(MINI_SUGGEST_GROUPCHATS[i], 'groupchat'));
                                    var chat_pwd = MINI_SUGGEST_PASSWORDS[i] || '';

                                    chans_html +=
                                    '<a class="jm_suggest_groupchat" href="#" data-xid="' + JappixCommon.escapeQuotes(chat_room) + '" data-pwd="' + JappixCommon.escapeQuotes(chat_pwd) + '">' +
                                        '<span class="jm_chan_icon jm_images"></span>' +
                                        '<span class="jm_chan_name">' + JappixCommon.getXIDNick(chat_room).htmlEnc() + '</span>' +
                                    '</a>';
                                }

                                catch(e) {}
                            }

                            // Any separation space to add?
                            if(chans_html) {
                                chans_html += '<div class="jm_space"></div>';
                            }

                            // Generate the chat links HTML
                            for(var j = 0; j < MINI_SUGGEST_CHATS.length; j++) {
                                // Empty value?
                                if(!MINI_SUGGEST_CHATS[j]) {
                                    continue;
                                }

                                // Using a try/catch override IE issues
                                try {
                                    // Read current chat values
                                    var chat_xid = JappixCommon.bareXID(JappixCommon.generateXID(MINI_SUGGEST_CHATS[j], 'chat'));
                                    var chat_hash = hex_md5(chat_xid);
                                    var chat_nick = jQuery('#jappix_mini a#friend-' + chat_hash).attr('data-nick');

                                    // Get current chat nickname
                                    if(!chat_nick) {
                                        chat_nick = JappixCommon.getXIDNick(chat_xid);
                                    } else {
                                        chat_nick = JappixCommon.unescapeQuotes(chat_nick);
                                    }

                                    // Generate HTML for current chat
                                    chans_html +=
                                    '<a class="jm_suggest_chat" href="#" data-xid="' + JappixCommon.escapeQuotes(chat_xid) + '">' +
                                        '<span class="jm_chan_icon jm_images"></span>' +
                                        '<span class="jm_chan_name">' + JappixCommon.getXIDNick(chat_nick).htmlEnc() + '</span>' +
                                    '</a>';
                                }

                                catch(e) {}
                            }

                            // Any separation space to add?
                            if(chans_html) {
                                chans_html += '<div class="jm_space"></div>';
                            }

                            // Append selector code
                            jQuery('#jappix_mini div.jm_actions').append(
                                '<div class="jm_chan_suggest">' +
                                    chans_html +

                                    '<a class="jm_suggest_prompt" href="#">' +
                                        '<span class="jm_chan_icon"></span>' +
                                        '<span class="jm_chan_name">' + JappixCommon._e("Other") + '</span>' +
                                    '</a>' +
                                '</div>'
                            );

                            // Click events
                            jQuery('#jappix_mini div.jm_chan_suggest a').click(function() {
                                // Using a try/catch override IE issues
                                try {
                                    var this_sub_sel = jQuery(this);

                                    // Chat?
                                    if(this_sub_sel.is('.jm_suggest_chat')) {
                                        var current_chat = JappixCommon.unescapeQuotes(this_sub_sel.attr('data-xid'));

                                        self.chat('chat', current_chat, this_sub_sel.find('span.jm_chan_name').text(), hex_md5(current_chat));
                                    }

                                    // Groupchat?
                                    else if(this_sub_sel.is('.jm_suggest_groupchat')) {
                                        var current_groupchat = JappixCommon.unescapeQuotes(this_sub_sel.attr('data-xid'));
                                        var current_password = this_sub_sel.attr('data-pwd') || null;

                                        if(current_password)
                                            current_password = JappixCommon.unescapeQuotes(current_password);

                                        self.chat('groupchat', current_groupchat, this_sub_sel.find('span.jm_chan_name').text(), hex_md5(current_groupchat), current_password);
                                    }

                                    // Default prompt?
                                    else {
                                        self.groupchatPrompt();
                                    }
                                }

                                catch(e) {}

                                finally {
                                    return false;
                                }
                            });

                            // Adapt chan suggest height
                            self.adaptRoster();
                        }
                    }

                    // Default action
                    else {
                        self.groupchatPrompt();
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            // Updates the roster with only searched terms
            jQuery('#jappix_mini div.jm_roster div.jm_search input.jm_searchbox').keyup(function(e) {
                var this_sel = jQuery(this);

                // Avoid buddy navigation to be reseted
                if((e.keyCode == 38) || (e.keyCode == 40)) {
                    return;
                }

                // Escape key pressed?
                if(e.keyCode == 27) {
                    this_sel.val('');
                }

                // Save current value
                this_sel.attr('data-value', this_sel.val());

                // Don't filter at each key up (faster for computer)
                var _this = this;

                JappixCommon.typewatch()(function() {
                    // Using a try/catch to override IE issues
                    try {
                        // Get values
                        var search = jQuery(_this).val();
                        var regex = new RegExp('((^)|( ))' + JappixCommon.escapeRegex(search), 'gi');

                        // Reset results
                        jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
                        jQuery('#jappix_mini div.jm_roster div.jm_grouped').show();

                        // If there is no search, we don't need to loop over buddies
                        if(!search) {
                            jQuery('#jappix_mini div.jm_roster div.jm_buddies a.jm_online').show();

                            // Update groups visibility
                            self.updateGroups();

                            return;
                        }

                        // Filter buddies
                        jQuery('#jappix_mini div.jm_roster div.jm_buddies a.jm_online').each(function() {
                            var this_sub_sel = jQuery(this);
                            var nick = JappixCommon.unescapeQuotes(this_sub_sel.data('nick'));

                            if(nick.match(regex)) {
                                this_sub_sel.show();
                            } else {
                                this_sub_sel.hide();
                            }
                        });

                        // Filter groups
                        jQuery('#jappix_mini div.jm_roster div.jm_grouped').each(function() {
                            var this_sub_sel = jQuery(this);

                            if(!this_sub_sel.find('a.jm_online:visible').size()) {
                                this_sub_sel.hide();
                            }
                        });

                        // Focus on the first buddy
                        jQuery('#jappix_mini div.jm_roster div.jm_buddies a.jm_online:visible:first').addClass('jm_hover');
                    }

                    catch(e) {}

                    finally {
                        return false;
                    }
                }, 500);
            });

            // Roster navigation
            jQuery(document).keydown(function(e) {
                // Cannot work if roster is not opened
                if(jQuery('#jappix_mini div.jm_roster').is(':hidden')) {
                    return;
                }

                // Up/Down keys
                if((e.keyCode == 38) || (e.keyCode == 40)) {
                    // Hover the last/first buddy
                    if(!jQuery('#jappix_mini a.jm_online.jm_hover').size()) {
                        if(e.keyCode == 38) {
                            jQuery('#jappix_mini a.jm_online:visible:last').addClass('jm_hover');
                        } else {
                            jQuery('#jappix_mini a.jm_online:visible:first').addClass('jm_hover');
                        }
                    }

                    // Hover the previous/next buddy
                    else if(jQuery('#jappix_mini a.jm_online:visible').size() > 1) {
                        var hover_index = jQuery('#jappix_mini a.jm_online:visible').index(jQuery('a.jm_hover'));

                        // Up (decrement) or down (increment)?
                        if(e.keyCode == 38) {
                            hover_index--;
                        } else {
                            hover_index++;
                        }

                        if(!hover_index) {
                            hover_index = 0;
                        }

                        // No buddy before/after?
                        if(!jQuery('#jappix_mini a.jm_online:visible').eq(hover_index).size()) {
                            if(e.keyCode == 38) {
                                hover_index = jQuery('#jappix_mini a.jm_online:visible:last').index();
                            } else {
                                hover_index = 0;
                            }
                        }

                        // Hover the previous/next buddy
                        jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
                        jQuery('#jappix_mini a.jm_online:visible').eq(hover_index).addClass('jm_hover');
                    }

                    // Scroll to the hovered buddy (if out of limits)
                    jQuery('#jappix_mini div.jm_roster div.jm_buddies').scrollTo(jQuery('#jappix_mini a.jm_online.jm_hover'), 0, {margin: true});

                    return false;
                }

                // Enter key
                if((e.keyCode == 13) && jQuery('#jappix_mini a.jm_friend.jm_hover').size()) {
                    jQuery('#jappix_mini a.jm_friend.jm_hover').click();

                    return false;
                }
            });

            // Chat type re-focus
            jQuery(document).keypress(function(evt) {
                // Cannot work if an input/textarea is already focused or chat is not opened
                var path = '#jappix_mini div.jm_conversation div.jm_chat-content';

                if(jQuery('input, textarea').is(':focus') || !jQuery(path).is(':visible')) {
                    return;
                }

                // May cause some compatibility issues
                try {
                    // Get key value
                    var key_value = jQuery.trim(String.fromCharCode(evt.which));

                    // Re-focus on opened chat?
                    if(key_value) {
                        // Path to chat input
                        var path_input = path + ' input.jm_send-messages';

                        // Use a timer to override the DOM lag issue
                        jQuery(document).oneTime(10, function() {
                            // Get input values
                            select_input = jQuery(path_input);
                            value_input = select_input.val();

                            // Append pressed key value
                            select_input.val(value_input + key_value);
                            select_input.focus();

                            // Put cursor at the end of input
                            select_input[0].selectionStart = select_input[0].selectionEnd = value_input.length + 1;
                        });
                    }
                } catch(e) {}
            });

            // Hides the roster when clicking away of Jappix Mini
            jQuery(document).click(function(evt) {
                if(!jQuery(evt.target).parents('#jappix_mini').size() && !JappixCommon.exists('#jappix_popup')) {
                    self.hideRoster();
                }
            });

            // Hides all panes double clicking away of Jappix Mini
            jQuery(document).dblclick(function(evt) {
                if(!jQuery(evt.target).parents('#jappix_mini').size() && !JappixCommon.exists('#jappix_popup')) {
                    self.switchPane();
                }
            });

            // Suspended session resumed?
            if(suspended) {
                // Initialized marker
                MINI_INITIALIZED = true;

                // Not resumed? (need to reconnect)
                if(!resumed) {
                    // Restore previous reconnect counter
                    var reconnect = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'reconnect');

                    if(!isNaN(reconnect)) {
                        MINI_RECONNECT = parseInt(reconnect);
                    }

                    // Restore queued functions
                    self.unserializeQueue();

                    // Simulate a network error to get the same silent reconnect effect
                    self.disconnected();
                }

                // Restore chat input values
                jQuery('#jappix_mini div.jm_conversation input.jm_send-messages').each(function() {
                    var this_sub_sel = jQuery(this);
                    var chat_value = this_sub_sel.attr('data-value');

                    if(chat_value) {
                        this_sub_sel.val(chat_value);
                    }
                });

                // Restore roster filter value
                var search_box = jQuery('#jappix_mini div.jm_roster div.jm_search input.jm_searchbox');
                var filter_value = search_box.attr('data-value');

                if(filter_value) {
                    search_box.val(filter_value).keyup();
                }

                // Restore buddy events
                self.eventsBuddy('#jappix_mini a.jm_friend');

                // Restore chat click events
                jQuery('#jappix_mini div.jm_conversation').each(function() {
                    var this_sub_sel = jQuery(this);
                    self.chatEvents(this_sub_sel.attr('data-type'), JappixCommon.unescapeQuotes(this_sub_sel.attr('data-xid')), this_sub_sel.attr('data-hash'));
                });

                // Restore init marker on all groupchats
                jQuery('#jappix_mini div.jm_conversation[data-type="groupchat"]').attr('data-init', 'true');

                // Scroll down to the last message
                var scroll_hash = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');
                var scroll_position = JappixDataStore.getDB(MINI_HASH, 'jappix-mini', 'scroll');

                // Any scroll position?
                if(scroll_position) {
                    scroll_position = parseInt(scroll_position);
                }

                if(scroll_hash) {
                    // Use a timer to override the DOM lag issue
                    jQuery(document).oneTime(200, function() {
                        self.messageScroll(scroll_hash, scroll_position);
                    });
                }

                // Update notification counters
                self.notifyCounters();
            }

            // Can auto-connect?
            else if(MINI_AUTOCONNECT) {
                self.connect(domain, user, password);
            }

            // Cannot auto-connect?
            else {
                // Chat text
                jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text(JappixCommon._e("Chat"));

                // Must animate?
                if(MINI_ANIMATE) {
                    // Add content
                    jQuery('#jappix_mini div.jm_starter').prepend(
                        '<span class="jm_animate jm_images_animate"></span>'
                    );
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.create', e);
        }

    };


    /**
     * Buddy events
     * @public
     * @param {string} path
     * @return {undefined}
     */
    self.eventsBuddy = function(path) {

        try {
            var selector = jQuery(path);

            // Restore buddy click events
            selector.click(function() {
                // Using a try/catch override IE issues
                try {
                    var this_sel = jQuery(this);
                    self.chat('chat', JappixCommon.unescapeQuotes(this_sel.attr('data-xid')), JappixCommon.unescapeQuotes(this_sel.attr('data-nick')), this_sel.attr('data-hash'));
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            // Restore buddy hover events
            selector.hover(function() {
                jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
                jQuery(this).addClass('jm_hover');
            }, function() {
                jQuery(this).removeClass('jm_hover');
            });

            // Restore buddy mousedown events
            selector.mousedown(function() {
                jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
                jQuery(this).addClass('jm_hover');
            });

            // Restore buddy focus events
            selector.focus(function() {
                jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
                jQuery(this).addClass('jm_hover');
            });

            // Restore buddy blur events
            selector.blur(function() {
                jQuery(this).removeClass('jm_hover');
            });
        } catch(e) {
            JappixConsole.error('JappixMini.eventsBuddy', e);
        }

    };


    /**
     * Displays a given message
     * @public
     * @param {string} type
     * @param {string} body
     * @param {string} xid
     * @param {string} nick
     * @param {string} hash
     * @param {string} time
     * @param {string} stamp
     * @param {string} message_type
     * @return {undefined}
     */
    self.displayMessage = function(type, body, xid, nick, hash, time, stamp, message_type) {

        try {
            // Generate path
            var path = '#chat-' + hash;

            // Can scroll?
            var cont_scroll = document.getElementById('received-' + hash);
            var can_scroll = false;

            if(!cont_scroll.scrollTop || ((cont_scroll.clientHeight + cont_scroll.scrollTop) == cont_scroll.scrollHeight)) {
                can_scroll = true;
            }

            // Remove the previous message border if needed
            var last = jQuery(path + ' div.jm_group:last');
            var last_stamp = parseInt(last.attr('data-stamp'));
            var last_b = jQuery(path + ' b:last');
            var last_xid = last_b.attr('data-xid');
            var last_type = last.attr('data-type');
            var grouped = false;
            var header = '';

            if((last_xid == xid) && (message_type == last_type) && ((stamp - last_stamp) <= 1800)) {
                grouped = true;
            } else {
                // Write the message date
                if(nick)
                    header += '<span class="jm_date">' + time + '</span>';

                // Write the buddy name at the top of the message group
                if(type == 'groupchat')
                    header += '<b class="jm_name" style="color: ' + JappixCommon.generateColor(nick) + ';" data-xid="' + JappixCommon.encodeQuotes(xid) + '">' + nick.htmlEnc() + '</b>';
                else if(nick == 'me')
                    header += '<b class="jm_name jm_me" data-xid="' + JappixCommon.encodeQuotes(xid) + '">' + JappixCommon._e("You") + '</b>';
                else
                    header += '<b class="jm_name jm_him" data-xid="' + JappixCommon.encodeQuotes(xid) + '">' + nick.htmlEnc() + '</b>';
            }

            // Apply the /me command
            var me_command = false;

            if(body.match(/^\/me /i)) {
                body = body.replace(/^\/me /i, nick + ' ');

                // Marker
                me_command = true;
            }

            // HTML-encode the message
            body = body.htmlEnc();

            // Apply the smileys
            body = body.replace(/(;-?\))(\s|$)/gi, self.smiley('wink', '$1'))
                       .replace(/(:-?3)(\s|$)/gi, self.smiley('waii', '$1'))
                       .replace(/(:-?\()(\s|$)/gi, self.smiley('unhappy', '$1'))
                       .replace(/(:-?P)(\s|$)/gi, self.smiley('tongue', '$1'))
                       .replace(/(:-?O)(\s|$)/gi, self.smiley('surprised', '$1'))
                       .replace(/(:-?\))(\s|$)/gi, self.smiley('smile', '$1'))
                       .replace(/(\^_?\^)(\s|$)/gi, self.smiley('happy', '$1'))
                       .replace(/(:-?D)(\s|$)/gi, self.smiley('grin', '$1'));

            // Format the text
            body = body.replace(/(^|\s|>|\()((\*)([^<>'"\*]+)(\*))($|\s|<|\))/gi, '$1<b>$2</b>$6')
                       .replace(/(^|\s|>|\()((\/)([^<>'"\/]+)(\/))($|\s|<|\))/gi, '$1<em>$2</em>$6')
                       .replace(/(^|\s|>|\()((_)([^<>'"_]+)(_))($|\s|<|\))/gi, '$1<span style="text-decoration: underline;">$2</span>$6');

            // Filter the links
            body = JappixLinks.apply(body, 'mini');

            // Generate the message code
            if(me_command) {
                body = '<em>' + body + '</em>';
            }

            body = '<p>' + body + '</p>';

            // Create the message
            if(grouped) {
                jQuery('#jappix_mini #chat-' + hash + ' div.jm_received-messages div.jm_group:last').append(body);
            } else {
                jQuery('#jappix_mini #chat-' + hash + ' div.jm_chatstate_typing').before('<div class="jm_group jm_' + message_type + '" data-type="' + message_type + '" data-stamp="' + stamp + '">' + header + body + '</div>');
            }

            // Scroll to this message
            if(can_scroll) {
                self.messageScroll(hash);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.displayMessage', e);
        }

    };


    /**
     * Switches to a given point
     * @public
     * @param {string} element
     * @param {string} hash
     * @return {undefined}
     */
    self.switchPane = function(element, hash) {

        try {
            // Hide every item
            self.hideRoster();
            jQuery('#jappix_mini a.jm_pane').removeClass('jm_clicked');
            jQuery('#jappix_mini div.jm_chat-content').hide();

            // Show the asked element
            if(element && (element != 'roster')) {
                var current = '#jappix_mini #' + element;

                // Navigate to this chat
                if(jQuery(current).size() && jQuery(current).is(':hidden')) {
                    var click_nav = '';

                    // Before or after?
                    if(jQuery('#jappix_mini div.jm_conversation:visible:first').prevAll().is('#' + element))
                        click_nav = jQuery('#jappix_mini a.jm_switch.jm_left');
                    else
                        click_nav = jQuery('#jappix_mini a.jm_switch.jm_right');

                    // Click previous or next
                    if(click_nav) {
                        while(jQuery(current).is(':hidden') && !click_nav.hasClass('jm_nonav'))
                            click_nav.click();
                    }
                }

                // Show it
                jQuery(current + ' a.jm_pane').addClass('jm_clicked');
                jQuery(current + ' div.jm_chat-content').show();

                // Use a timer to override the DOM lag issue
                jQuery(document).oneTime(10, function() {
                    jQuery(current + ' input.jm_send-messages').focus();
                });

                // Scroll to the last message & adapt chat
                if(hash) {
                    self.messageScroll(hash);
                    self.updatePixStream(hash);
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.switchPane', e);
        }

    };


    /**
     * Scrolls to the last chat message
     * @public
     * @param {string} hash
     * @param {string} position
     * @return {undefined}
     */
    self.messageScroll = function(hash, position) {

        try {
            var id = document.getElementById('received-' + hash);

            // No defined position?
            if(!position) {
                position = id.scrollHeight;
            }

            id.scrollTop = position;
        } catch(e) {
            JappixConsole.error('JappixMini.messageScroll', e);
        }

    };


    /**
     * Prompts the user with a given text
     * @public
     * @param {string} text
     * @param {string} value
     * @return {undefined}
     */
    self.openPrompt = function(text, value) {

        try {
            // Initialize
            var prompt = '#jappix_popup div.jm_prompt';
            var input = prompt + ' form input';
            var value_input = input + '[type="text"]';

            // Remove the existing prompt
            self.closePrompt();

            // Add the prompt
            jQuery('body').append(
                '<div id="jappix_popup" dir="' + (JappixCommon.isRTL() ? 'rtl' : 'ltr') + '">' +
                    '<div class="jm_prompt">' +
                        '<form>' +
                            text +
                            '<input class="jm_text" type="text" value="" />' +
                            '<input class="jm_submit" type="submit" value="' + JappixCommon._e("Submit") + '" />' +
                            '<input class="jm_submit" type="reset" value="' + JappixCommon._e("Cancel") + '" />' +
                            '<div class="jm_clear"></div>' +
                        '</form>' +
                    '</div>' +
                '</div>'
            );

            // Vertical center
            var vert_pos = '-' + ((jQuery(prompt).height() / 2) + 10) + 'px';
            jQuery(prompt).css('margin-top', vert_pos);

            // Apply the value?
            if(value) {
                jQuery(value_input).val(value);
            }

            // Focus on the input
            jQuery(document).oneTime(10, function() {
                jQuery(value_input).focus();
            });

            // Cancel event
            jQuery(input + '[type="reset"]').click(function() {
                try {
                    self.closePrompt();
                }

                catch(e) {}

                finally {
                    return false;
                }
            });
        } catch(e) {
            JappixConsole.error('JappixMini.openPrompt', e);
        }

    };


    /**
     * Returns the prompt value
     * @public
     * @return {string}
     */
    self.closePrompt = function() {

        try {
            // Read the value
            var value = jQuery('#jappix_popup div.jm_prompt form input').val();

            // Remove the popup
            jQuery('#jappix_popup').remove();

            return value;
        } catch(e) {
            JappixConsole.error('JappixMini.closePrompt', e);
        }

    };


    /**
     * Opens the new groupchat prompt
     * @public
     * @return {undefined}
     */
    self.groupchatPrompt = function() {

        try {
            // Create a new prompt
            self.openPrompt(JappixCommon._e("Please enter the group chat address to join."));

            // When prompt submitted
            jQuery('#jappix_popup div.jm_prompt form').submit(function() {
                try {
                    // Read the value
                    var join_this = self.closePrompt();

                    // Any submitted chat to join?
                    if(join_this) {
                        // Get the chat room to join
                        chat_room = JappixCommon.bareXID(JappixCommon.generateXID(join_this, 'groupchat'));

                        // Create a new groupchat
                        self.chat('groupchat', chat_room, JappixCommon.getXIDNick(chat_room), hex_md5(chat_room));
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });
        } catch(e) {
            JappixConsole.error('JappixMini.groupchatPrompt', e);
        }

    };


    /**
     * Manages and creates a chat
     * @public
     * @param {string} type
     * @param {string} xid
     * @param {string} nick
     * @param {string} hash
     * @param {string} pwd
     * @param {boolean} show_pane
     * @return {boolean}
     */
    self.chat = function(type, xid, nick, hash, pwd, show_pane) {

        try {
            var current = '#jappix_mini #chat-' + hash;
            var nickname = null;

            // Not yet added?
            if(!JappixCommon.exists(current)) {
                // Groupchat nickname
                if(type == 'groupchat') {
                    // Random nickname?
                    if(!MINI_NICKNAME && MINI_RANDNICK)
                        MINI_NICKNAME = self.randomNick();

                    nickname = MINI_NICKNAME;

                    // No nickname?
                    if(!nickname) {
                        // Create a new prompt
                        self.openPrompt(JappixCommon.printf(JappixCommon._e("Please enter your nickname to join %s."), xid));

                        // When prompt submitted
                        jQuery('#jappix_popup div.jm_prompt form').submit(function() {
                            try {
                                // Read the value
                                var nickname = self.closePrompt();

                                // Update the stored one
                                if(nickname) {
                                    MINI_NICKNAME = nickname;
                                }

                                // Launch it again!
                                self.chat(type, xid, nick, hash, pwd);
                            }

                            catch(e) {}

                            finally {
                                return false;
                            }
                        });

                        return;
                    }
                }

                // Create the HTML markup
                var html = '<div class="jm_conversation jm_type_' + type + '" id="chat-' + hash + '" data-xid="' + JappixCommon.escapeQuotes(xid) + '" data-type="' + type + '" data-nick="' + JappixCommon.escapeQuotes(nick) + '" data-hash="' + hash + '" data-origin="' + JappixCommon.escapeQuotes(JappixCommon.cutResource(xid)) + '">' +
                        '<div class="jm_chat-content">' +
                            '<div class="jm_actions">' +
                                '<span class="jm_nick">' + nick + '</span>';

                // Check if the chat/groupchat exists
                var groupchat_exists = false;
                var chat_exists = false;

                if((type == 'groupchat') && MINI_GROUPCHATS && MINI_GROUPCHATS.length) {
                    for(var g in MINI_GROUPCHATS) {
                        if(xid == JappixCommon.bareXID(JappixCommon.generateXID(MINI_GROUPCHATS[g], 'groupchat'))) {
                            groupchat_exists = true;

                            break;
                        }
                    }
                }

                if((type == 'chat') && MINI_CHATS && MINI_CHATS.length) {
                    for(var c in MINI_CHATS) {
                        if(xid == JappixCommon.bareXID(JappixCommon.generateXID(MINI_CHATS[c], 'chat'))) {
                            chat_exists = true;

                            break;
                        }
                    }
                }

                // Any close button to display?
                if(((type == 'groupchat') && !groupchat_exists) || ((type == 'chat') && !chat_exists) || ((type != 'groupchat') && (type != 'chat'))) {
                    html += '<a class="jm_one-action jm_close jm_images" title="' + JappixCommon._e("Close") + '" href="#"></a>';
                }

                html +=
                    '</div>' +
                        '<div class="jm_pix_stream"></div>' +

                        '<div class="jm_received-messages" id="received-' + hash + '">' +
                            '<div class="jm_chatstate_typing">' + JappixCommon.printf(JappixCommon._e("%s is typing..."), nick.htmlEnc()) + '</div>' +
                        '</div>' +

                        '<form action="#" method="post">' +
                            '<input type="text" class="jm_send-messages" name="body" autocomplete="off" placeholder="' + JappixCommon._e("Chat") + '" data-value="" />' +
                            '<input type="hidden" name="xid" value="' + xid + '" />' +
                            '<input type="hidden" name="type" value="' + type + '" />' +
                        '</form>' +
                    '</div>' +

                    '<a class="jm_pane jm_chat-tab jm_images" href="#">' +
                        '<span class="jm_name">' + nick.htmlEnc() + '</span>' +
                    '</a>' +
                '</div>';

                jQuery('#jappix_mini div.jm_conversations').prepend(html);

                // Get the presence of this friend
                if(type != 'groupchat') {
                    var selector = jQuery('#jappix_mini a#friend-' + hash + ' span.jm_presence');

                    // Default presence
                    var show = 'available';

                    // Read the presence
                    if(selector.hasClass('jm_unavailable') || !selector.size()) {
                        show = 'unavailable';
                    } else if(selector.hasClass('jm_chat')) {
                        show = 'chat';
                    } else if(selector.hasClass('jm_away')) {
                        show = 'away';
                    } else if(selector.hasClass('jm_xa')) {
                        show = 'xa';
                    } else if(selector.hasClass('jm_dnd')) {
                        show = 'dnd';
                    }

                    // Create the presence marker
                    jQuery(current + ' a.jm_chat-tab').prepend('<span class="jm_presence jm_images jm_' + show + '"></span>');
                }

                // The chat events
                self.chatEvents(type, xid, hash);

                // Join the groupchat
                if(type == 'groupchat') {
                    // Add nickname & init values
                    jQuery(current).attr('data-nick', JappixCommon.escapeQuotes(nickname))
                                   .attr('data-init', 'false');

                    // Send the first groupchat presence
                    self.presence('', '', '', '', xid + '/' + nickname, pwd, true, self.handleMUC);
                }
            }

            // Focus on our pane
            if(show_pane !== false) {
                jQuery(document).oneTime(10, function() {
                    self.switchPane('chat-' + hash, hash);
                });
            }

            // Update chat overflow
            self.updateOverflow();
        } catch(e) {
            JappixConsole.error('JappixMini.chat', e);
        } finally {
            return false;
        }

    };


    /**
     * Events on the chat tool
     * @public
     * @param {string} type
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self.chatEvents = function(type, xid, hash) {

        try {
            var current_sel = jQuery('#jappix_mini #chat-' + hash);

            // Submit the form
            current_sel.find('form').submit(function() {
                return self.sendMessage(this);
            });

            // Click on the tab
            current_sel.find('a.jm_chat-tab').click(function() {
                // Using a try/catch override IE issues
                try {
                    // Not yet opened: open it!
                    if(!jQuery(this).hasClass('jm_clicked')) {
                        // Show it!
                        self.switchPane('chat-' + hash, hash);

                        // Clear the eventual notifications
                        self.clearNotifications(hash);
                    } else {
                        self.switchPane();
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            // Click on the close button
            current_sel.find('div.jm_actions').click(function(evt) {
                // Using a try/catch override IE issues
                try {
                    // Close button?
                    if(jQuery(evt.target).is('a.jm_close')) {
                        // Gone chatstate
                        if(type != 'groupchat') {
                            self.sendChatstate('gone', xid, hash);
                        }

                        current_sel.stopTime().remove();

                        // Quit the groupchat?
                        if(type == 'groupchat') {
                            // Send an unavailable presence
                            self.presence('unavailable', '', '', '', xid + '/' + JappixCommon.unescapeQuotes(current_sel.attr('data-nick')));

                            // Remove this groupchat!
                            self.removeGroupchat(xid);
                        }

                        // Update chat overflow
                        self.updateOverflow();
                    } else {
                        // Minimize current chat
                        current_sel.find('a.jm_chat-tab.jm_clicked').click();
                    }
                }

                catch(e) {}

                finally {
                    return false;
                }
            });

            // Focus on the chat input
            current_sel.find('input.jm_send-messages').focus(function() {
                self.clearNotifications(hash);
            })

            // Change on the chat input
            .keyup(function() {
                var this_sel = jQuery(this);
                this_sel.attr('data-value', this_sel.val());
            })

            // Chat tabulate or escape press
            .keydown(function(e) {
                // Tabulate?
                if(e.keyCode == 9) {
                    self.switchChat();

                    return false;
                }

                // Escape?
                if(e.keyCode == 27) {
                    if(current_sel.find('a.jm_close').size()) {
                        // Open next/previous chat
                        if(current_sel.next('div.jm_conversation').size()) {
                            current_sel.next('div.jm_conversation').find('a.jm_pane').click();
                        } else if(current_sel.prev('div.jm_conversation').size()) {
                            current_sel.prev('div.jm_conversation').find('a.jm_pane').click();
                        }

                        // Close current chat
                        current_sel.find('a.jm_close').click();
                    }

                    return false;
                }
            });

            // Focus/Blur events
            jQuery('#jappix_mini #chat-' + hash + ' input.jm_send-messages').focus(function() {
                // Store active chat
                MINI_ACTIVE = hash;
            })

            .blur(function() {
                // Reset active chat
                if(MINI_ACTIVE == hash) {
                    MINI_ACTIVE = null;
                }
            });

            // Chatstate events
            self.eventsChatstate(xid, hash, type);
        } catch(e) {
            JappixConsole.error('JappixMini.chatEvents', e);
        }

    };


    /**
     * Opens the next chat
     * @public
     * @return {undefined}
     */
    self.switchChat = function() {

        try {
            if(jQuery('#jappix_mini div.jm_conversation').size() <= 1) {
                return;
            }

            // Get the current chat index
            var chat_index = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').index();
            chat_index++;

            if(!chat_index) {
                chat_index = 0;
            }

            // No chat after?
            if(!jQuery('#jappix_mini div.jm_conversation').eq(chat_index).size()) {
                chat_index = 0;
            }

            // Avoid disabled chats
            while(jQuery('#jappix_mini div.jm_conversation').eq(chat_index).hasClass('jm_disabled')) {
                chat_index++;
            }

            // Show the next chat
            var chat_hash = jQuery('#jappix_mini div.jm_conversation').eq(chat_index).attr('data-hash');

            if(chat_hash) {
                self.switchPane('chat-' + chat_hash, chat_hash);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.switchChat', e);
        }

    };


    /**
     * Shows the roster
     * @public
     * @return {undefined}
     */
    self.showRoster = function() {

        try {
            self.switchPane('roster');
            jQuery('#jappix_mini div.jm_roster').show();
            jQuery('#jappix_mini a.jm_button').addClass('jm_clicked');

            // Update groups visibility
            self.updateGroups();

            jQuery(document).oneTime(10, function() {
                jQuery('#jappix_mini div.jm_roster div.jm_search input.jm_searchbox').focus();
            });
        } catch(e) {
            JappixConsole.error('JappixMini.showRoster', e);
        }

    };


    /**
     * Hides the roster
     * @public
     * @return {undefined}
     */
    self.hideRoster = function() {

        try {
            // Close the roster pickers
            jQuery('#jappix_mini a.jm_status.active, #jappix_mini a.jm_join.active').click();

            // Hide the roster box
            jQuery('#jappix_mini div.jm_roster').hide();
            jQuery('#jappix_mini a.jm_button').removeClass('jm_clicked');

            // Clear the search box and show all online contacts
            jQuery('#jappix_mini div.jm_roster div.jm_search input.jm_searchbox').val('').attr('data-value', '');
            jQuery('#jappix_mini div.jm_roster div.jm_grouped').show();
            jQuery('#jappix_mini div.jm_roster div.jm_buddies a.jm_online').show();
            jQuery('#jappix_mini a.jm_friend.jm_hover').removeClass('jm_hover');
        } catch(e) {
            JappixConsole.error('JappixMini.hideRoster', e);
        }

    };


    /**
     * Removes a groupchat from DOM
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.removeGroupchat = function(xid) {

        try {
            // Remove the groupchat private chats & the groupchat buddies from the roster
            jQuery('#jappix_mini div.jm_conversation[data-origin="' + JappixCommon.escapeQuotes(JappixCommon.cutResource(xid)) + '"], #jappix_mini div.jm_roster div.jm_grouped[data-xid="' + JappixCommon.escapeQuotes(xid) + '"]').remove();

            // Update the presence counter
            self.updateRoster();
        } catch(e) {
            JappixConsole.error('JappixMini.removeGroupchat', e);
        }

    };


    /**
     * Initializes Jappix Mini
     * @public
     * @return {undefined}
     */
    self.initialize = function() {

        try {
            // Update the marker
            MINI_INITIALIZED = true;

            // Send the initial presence
            self.presence();

            // Join the groupchats (first)
            for(var i = 0; i < MINI_GROUPCHATS.length; i++) {
                // Empty value?
                if(!MINI_GROUPCHATS[i]) {
                    continue;
                }

                // Using a try/catch override IE issues
                try {
                    // Current chat room
                    var chat_room = JappixCommon.bareXID(JappixCommon.generateXID(MINI_GROUPCHATS[i], 'groupchat'));

                    // Open the current chat
                    self.chat('groupchat', chat_room, JappixCommon.getXIDNick(chat_room), hex_md5(chat_room), MINI_PASSWORDS[i], MINI_SHOWPANE);
                }

                catch(e) {}
            }

            // Join the chats (then)
            for(var j = 0; j < MINI_CHATS.length; j++) {
                // Empty value?
                if(!MINI_CHATS[j]) {
                    continue;
                }

                // Using a try/catch override IE issues
                try {
                    // Current chat user
                    var chat_xid = JappixCommon.bareXID(JappixCommon.generateXID(MINI_CHATS[j], 'chat'));
                    var chat_hash = hex_md5(chat_xid);
                    var chat_nick = jQuery('#jappix_mini a#friend-' + chat_hash).attr('data-nick');

                    if(!chat_nick) {
                        chat_nick = JappixCommon.getXIDNick(chat_xid);
                    } else {
                        chat_nick = JappixCommon.unescapeQuotes(chat_nick);
                    }

                    // Open the current chat
                    self.chat('chat', chat_xid, chat_nick, chat_hash);
                }

                catch(e) {}
            }

            // Must show the roster?
            if(!MINI_AUTOCONNECT && !MINI_GROUPCHATS.length && !MINI_CHATS.length) {
                jQuery(document).oneTime(10, function() {
                    self.showRoster();
                });
            }
        } catch(e) {
            JappixConsole.error('JappixMini.initialize', e);
        }

    };


    /**
     * Displays a list of roster buddy
     * @public
     * @param {object} buddy_arr
     * @return {boolean}
     */
    self.addListBuddy = function(buddy_arr) {

        try {
            var c, b,
            nick, hash, xid, subscription;

            var buddy_str = '';

            // Loop on groups
            for(c in buddy_arr) {
                buddy_arr[c] = buddy_arr[c].sort();

                // Group: start
                if(c != MINI_ROSTER_NOGROUP) {
                    buddy_str += '<div class="jm_grouped jm_grouped_roster" data-name="' + JappixCommon.escapeQuotes(c) + '">';
                    buddy_str += '<div class="jm_name">' + c.htmlEnc() + '</div>';
                }

                // Loop on buddies
                for(b in buddy_arr[c]) {
                    // Current buddy data
                    buddy_str += self.codeAddBuddy(
                        buddy_arr[c][b][0],
                        buddy_arr[c][b][1],
                        buddy_arr[c][b][2],
                        buddy_arr[c][b][3],
                        false
                    );
                }

                // Group: end
                if(c != MINI_ROSTER_NOGROUP) {
                    buddy_str += '</div>';
                }
            }

            // Append code
            jQuery('#jappix_mini div.jm_roster div.jm_buddies').html(buddy_str);

            // Events on these buddies
            self.eventsBuddy('#jappix_mini a.jm_friend');

            return true;
        } catch(e) {
            JappixConsole.error('JappixMini.addListBuddy', e);

            return false;
        }

    };


    /**
     * Displays a roster buddy
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} nick
     * @param {string} groupchat
     * @param {string} subscription
     * @param {string} group
     * @return {boolean}
     */
    self.addBuddy = function(xid, hash, nick, groupchat, subscription, group) {

        try {
            var bare_xid = JappixCommon.bareXID(xid);

            // Element
            var element = '#jappix_mini a#friend-' + hash;

            // Yet added?
            if(JappixCommon.exists(element)) {
                jQuery(element).remove();
            }

            // Generate the path
            var path = '#jappix_mini div.jm_roster div.jm_buddies';

            // Generate the groupchat group path
            if(groupchat) {
                path = '#jappix_mini div.jm_roster div.jm_grouped_groupchat[data-xid="' + JappixCommon.escapeQuotes(bare_xid) + '"]';

                // Must add a groupchat group?
                if(!JappixCommon.exists(path)) {
                    jQuery('#jappix_mini div.jm_roster div.jm_buddies').append(
                        '<div class="jm_grouped jm_grouped_groupchat" data-xid="' + JappixCommon.escapeQuotes(bare_xid) + '">' +
                            '<div class="jm_name">' + JappixCommon.getXIDNick(groupchat).htmlEnc() + '</div>' +
                        '</div>'
                    );
                }
            } else if(group) {
                path = '#jappix_mini div.jm_roster div.jm_grouped_roster[data-name="' + JappixCommon.escapeQuotes(group) + '"]';

                // Must add a roster group?
                if(!JappixCommon.exists(path)) {
                    jQuery('#jappix_mini div.jm_roster div.jm_buddies').append(
                        '<div class="jm_grouped jm_grouped_roster" data-name="' + JappixCommon.escapeQuotes(group) + '">' +
                            '<div class="jm_name">' + group.htmlEnc() + '</div>' +
                        '</div>'
                    );
                }
            }

            // Append this buddy content
            var code = self.codeAddBuddy(
                nick,
                hash,
                xid,
                subscription
            );

            if(groupchat || group) {
                jQuery(path).append(code);
            } else {
                jQuery(path).prepend(code);
            }

            // Need to hide this buddy?
            if(jQuery('#jappix_mini div.jm_actions a.jm_toggle_view.jm_toggled').size()) {
                jQuery(element).filter('.jm_offline').hide();
            }

            // Events on this buddy
            self.eventsBuddy(element);

            return true;
        } catch(e) {
            JappixConsole.error('JappixMini.addBuddy', e);

            return false;
        }

    };


    /**
     * Returns the code for a single buddy to add
     * @public
     * @param {string} nick
     * @param {string} hash
     * @param {string} xid
     * @param {string} subscription
     * @return {string}
     */
    self.codeAddBuddy = function(nick, hash, xid, subscription) {

        var buddy_str = '';

        try {
            // Buddy: start
            buddy_str += '<a class="jm_friend jm_offline jm_friend-' + hash;
              buddy_str += '" id="friend-' + hash;
              buddy_str += '" title="' + JappixCommon.encodeQuotes(xid) + '"';
              buddy_str += '" data-xid="' + JappixCommon.escapeQuotes(xid) + '"';
              buddy_str += '" data-nick="' + JappixCommon.escapeQuotes(nick) + '"';
              buddy_str += '" data-hash="' + hash + '"';
              buddy_str += ' ' + (subscription ? ' data-sub="' + subscription + '" ' : '');
            buddy_str += '>';

            // Buddy: inner
            buddy_str += '<span class="jm_presence jm_images jm_unavailable"></span>';
            buddy_str += nick.htmlEnc();
            buddy_str += '<span class="jm_jingle_icon jm_images"></span>';

            // Buddy: end
            buddy_str += '</a>';
        } catch(e) {
            JappixConsole.error('JappixMini.codeAddBuddy', e);
        } finally {
            return buddy_str;
        }

    };


    /**
     * Removes a roster buddy
     * @public
     * @param {string} hash
     * @param {string} groupchat
     * @return {undefined}
     */
    self.removeBuddy = function(hash, groupchat) {

        try {
            // Remove the buddy from the roster
            jQuery('#jappix_mini a#friend-' + hash).remove();

            // Empty group?
            var group = '#jappix_mini div.jm_roster div.jm_grouped_groupchat[data-xid="' + JappixCommon.escapeQuotes(groupchat) + '"]';

            if(groupchat && !jQuery(group + ' a.jm_friend').size()) {
                jQuery(group).remove();
            }

            return true;
        } catch(e) {
            JappixConsole.error('JappixMini.removeBuddy', e);

            return false;
        }

    };


    /**
     * Gets the user's roster
     * @public
     * @return {undefined}
     */
    self.getRoster = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');
            iq.setQuery(NS_ROSTER);
            con.send(iq, self.handleRoster);

            JappixConsole.info('Getting roster...');
        } catch(e) {
            JappixConsole.error('JappixMini.getRoster', e);
        }

    };


    /**
     * Handles the user's roster
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleRoster = function(iq) {

        try {
            var buddies, pointer,
            cur_buddy, cur_groups, cur_group,
            current, xid, subscription,
            nick, hash, j, c;

            // Added to sort buddies by name
            buddies = {};
            pointer = {};

            // Parse the roster
            jQuery(iq.getQuery()).find('item').each(function() {
                var this_sub_sel = jQuery(this);

                // Get the values
                current = this_sub_sel;
                xid = current.attr('jid');
                subscription = current.attr('subscription');

                // Not a gateway
                if(!JappixCommon.isGateway(xid)) {
                    // Read current values
                    nick = current.attr('name');
                    hash = hex_md5(xid);

                    // No name defined?
                    if(!nick)  nick = JappixCommon.getXIDNick(xid);

                    // Populate buddy array
                    cur_buddy = [];

                    cur_buddy[0] = nick;
                    cur_buddy[1] = hash;
                    cur_buddy[2] = xid;
                    cur_buddy[3] = subscription;

                    // Append to groups this buddy belongs to
                    cur_groups = {};

                    if(this_sub_sel.find('group').size()) {
                        this_sub_sel.find('group').each(function() {
                            cur_group = jQuery(this).text();

                            if(cur_group) {
                                cur_groups[cur_group] = 1;
                            }
                        });
                    } else {
                        cur_groups[MINI_ROSTER_NOGROUP] = 1;
                    }

                    for(var cur_group in cur_groups) {
                        // Prepare multidimentional array
                        if(typeof pointer[cur_group] != 'number') {
                            pointer[cur_group] = 0;
                        }

                        if(typeof buddies[cur_group] != 'object') {
                            buddies[cur_group] = [];
                        }

                        // Push buddy data
                        buddies[cur_group][(pointer[cur_group])++] = cur_buddy;
                    }
                }
            });

            // No buddies? (ATM)
            if(!MINI_ROSTER_INIT) {
                MINI_ROSTER_INIT = true;

                self.addListBuddy(buddies);
            } else {
                for(c in buddies) {
                    for(j = 0; j < buddies[c].length; j++) {
                        if(!buddies[c][j]) {
                            continue;
                        }

                        // Current buddy information
                        nick = buddies[c][j][0];
                        hash = buddies[c][j][1];
                        xid = buddies[c][j][2];
                        subscription = buddies[c][j][3];

                        // Apply current buddy action
                        if(subscription == 'remove') {
                            self.removeBuddy(hash);
                        } else {
                            self.addBuddy(xid, hash, nick, null, subscription, (c != MINI_ROSTER_NOGROUP ? c : null));
                        }
                    }
                }
            }

            // Not yet initialized
            if(!MINI_INITIALIZED) {
                self.initialize();
            }

            JappixConsole.info('Roster got.');
        } catch(e) {
            JappixConsole.error('JappixMini.handleRoster', e);
        }

    };


    /**
     * Adapts the roster height to the window
     * @public
     * @return {undefined}
     */
    self.adaptRoster = function() {

        try {
            // Adapt buddy list height
            var roster_height = jQuery(window).height() - 85;
            jQuery('#jappix_mini div.jm_roster div.jm_buddies').css('max-height', roster_height);

            // Adapt chan suggest height
            var suggest_height = jQuery('#jappix_mini div.jm_roster').height() - 46;
            jQuery('#jappix_mini div.jm_chan_suggest').css('max-height', suggest_height);
        } catch(e) {
            JappixConsole.error('JappixMini.adaptRoster', e);
        }

    };


    /**
     * Generates a random nickname
     * @public
     * @return {string}
     */
    self.randomNick = function() {

        try {
            // First nickname block
            var first_arr = [
                'Just',
                'Bob',
                'Jar',
                'Pedr',
                'Yod',
                'Maz',
                'Vez',
                'Car',
                'Erw',
                'Tiet',
                'Iot',
                'Wal',
                'Bez',
                'Pop',
                'Klop',
                'Zaz',
                'Yoy',
                'Raz'
            ];

            // Second nickname block
            var second_arr = [
                'io',
                'ice',
                'a',
                'u',
                'o',
                'ou',
                'oi',
                'ana',
                'oro',
                'izi',
                'ozo',
                'aza',
                'ato',
                'ito',
                'ofa',
                'oki',
                'ima',
                'omi'
            ];

            // Last nickname block
            var last_arr = [
                't',
                'z',
                'r',
                'n',
                'tt',
                'zz',
                'pp',
                'j',
                'k',
                'v',
                'c',
                'x',
                'ti',
                'to',
                'ta',
                'ra',
                'ro',
                'ri'
            ];

            // Select random values from the arrays
            var rand_nick = JappixCommon.randomArrayValue(first_arr)  +
                            JappixCommon.randomArrayValue(second_arr) +
                            JappixCommon.randomArrayValue(last_arr);

            return rand_nick;
        } catch(e) {
            JappixConsole.error('JappixMini.randomNick', e);
        }

    };


    /**
     * Sends a given chatstate to a given entity
     * @public
     * @param {string} state
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self.sendChatstate = function(state, xid, hash) {

        try {
            var user_type = jQuery('#jappix_mini #chat-' + hash).attr('data-type');
            var user_storage = jQuery('#jappix_mini #chat-' + hash + ' input.jm_send-messages');

            // If the friend client supports chatstates and is online
            if((user_type == 'groupchat') || ((user_type == 'chat') && user_storage.attr('data-chatstates') && !JappixCommon.exists('#jappix_mini a#friend-' + hash + '.jm_offline'))) {
                // Already sent?
                if(user_storage.attr('data-chatstate') == state) {
                    return;
                }

                // Store the state
                user_storage.attr('data-chatstate', state);

                // Send the state
                var aMsg = new JSJaCMessage();
                aMsg.setTo(xid);
                aMsg.setType(user_type);

                aMsg.appendNode(state, {'xmlns': NS_CHATSTATES});

                con.send(aMsg);

                JappixConsole.log('Sent ' + state + ' chatstate to ' + xid);
            }
        } catch(e) {
            JappixConsole.error('JappixMini.sendChatstate', e);
        }

    };


    /**
     * Displays a given chatstate in a given chat
     * @public
     * @param {string} state
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.displayChatstate = function(state, xid, hash, type) {

        try {
            // Groupchat not supported
            if(type == 'groupchat') {
                return;
            }

            // Composing?
            if(state == 'composing') {
                jQuery('#jappix_mini #chat-' + hash + ' div.jm_chatstate_typing').css('visibility', 'visible');
            } else {
                self.resetChatstate(xid, hash, type);
            }

            JappixConsole.log('Received ' + state + ' chatstate from ' + xid);
        } catch(e) {
            JappixConsole.error('JappixMini.displayChatstate', e);
        }

    };


    /**
     * Resets the chatstate switcher marker
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.resetChatstate = function(xid, hash, type) {

        try {
            // Groupchat not supported
            if(type == 'groupchat') {
                return;
            }

            jQuery('#jappix_mini #chat-' + hash + ' div.jm_chatstate_typing').css('visibility', 'hidden');
        } catch(e) {
            JappixConsole.error('JappixMini.resetChatstate', e);
        }

    };


    /**
     * Adds the chatstate events
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.eventsChatstate = function(xid, hash, type) {

        try {
            // Groupchat not supported
            if(type == 'groupchat') {
                return;
            }

            jQuery('#jappix_mini #chat-' + hash + ' input.jm_send-messages').keyup(function(e) {
                var this_sel = jQuery(this);

                if(e.keyCode != 13) {
                    // Composing a message
                    if(this_sel.val() && (this_sel.attr('data-composing') != 'on')) {
                        // We change the state detect input
                        this_sel.attr('data-composing', 'on');

                        // We send the friend a "composing" chatstate
                        self.sendChatstate('composing', xid, hash);
                    }

                    // Stopped composing a message
                    else if(!this_sel.val() && (this_sel.attr('data-composing') == 'on')) {
                        // We change the state detect input
                        this_sel.attr('data-composing', 'off');

                        // We send the friend an "active" chatstate
                        self.sendChatstate('active', xid, hash);
                    }
                }
            })

            .change(function() {
                // Reset the composing database entry
                jQuery(this).attr('data-composing', 'off');
            })

            .focus(function() {
                var this_sel = jQuery(this);

                // Not needed
                if(this_sel.is(':disabled')) {
                    return;
                }

                // Nothing in the input, user is active
                if(!this_sel.val()) {
                    self.sendChatstate('active', xid, hash);
                } else {
                    self.sendChatstate('composing', xid, hash);
                }
            })

            .blur(function() {
                var this_sel = jQuery(this);

                // Not needed
                if(this_sel.is(':disabled')) {
                    return;
                }

                // Nothing in the input, user is inactive
                if(!this_sel.val()) {
                    self.sendChatstate('inactive', xid, hash);
                } else {
                    self.sendChatstate('paused', xid, hash);
                }
            });
        } catch(e) {
            JappixConsole.error('JappixMini.eventsChatstate', e);
        }

    };


    /**
     * Plays a sound
     * @public
     * @return {boolean}
     */
    self.soundPlay = function() {

        try {
            // Not supported!
            if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                return false;
            }

            // Append the sound container
            if(!JappixCommon.exists('#jappix_mini #jm_audio')) {
                jQuery('#jappix_mini').append(
                    '<div id="jm_audio">' +
                        '<audio preload="auto">' +
                            '<source src="' + JAPPIX_STATIC + 'sounds/receive-message.mp3" />' +
                            '<source src="' + JAPPIX_STATIC + 'sounds/receive-message.oga" />' +
                        '</audio>' +
                    '</div>'
                );
            }

            // Play the sound
            var audio_select = document.getElementById('jm_audio').getElementsByTagName('audio')[0];

            // Avoids Safari bug (2011 and less versions)
            try {
                audio_select.load();
            } finally {
                audio_select.play();
            }
        } catch(e) {
            JappixConsole.error('JappixMini.soundPlay', e);
        } finally {
            return false;
        }

    };


    /**
     * Adapts chat size
     * @public
     * @param {string} conversation_path
     * @return {undefined}
     */
    self.adaptChat = function(conversation_path) {

        try {
            var conversation_sel = jQuery('#jappix_mini div.jm_conversation');

            if(conversation_path) {
                conversation_sel = conversation_sel.filter(conversation_path);
            }

            if(conversation_sel.size()) {
                // Reset before doing anything else...
                conversation_sel.find('div.jm_received-messages').css({
                    'max-height': 'none',
                    'margin-top': 0
                });

                // Update sizes of chat
                var pix_stream_sel = conversation_sel.find('div.jm_pix_stream');
                var received_messages_sel = conversation_sel.find('div.jm_received-messages');
                var pix_stream_height = pix_stream_sel.height();

                if(pix_stream_sel.find('*').size() && pix_stream_height > 0) {
                    received_messages_sel.css({
                        'margin-top': pix_stream_height,
                        'max-height': (received_messages_sel.height() - pix_stream_sel.height())
                    });
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.adaptChat', e);
        }

    };


    /**
     * Updates given pixel stream
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.updatePixStream = function(hash) {

        try {
            // Feature supported? (we rely on local storage)
            if(window.localStorage !== undefined) {
                // Select chat(s)
                var conversation_path = '#chat-' + hash;
                var conversation_sel = jQuery('#jappix_mini div.jm_conversation');
                var conversation_all_sel = conversation_sel;

                if(hash) {
                    conversation_sel = conversation_sel.filter(conversation_path);
                } else {
                    conversation_sel = conversation_sel.filter(':has(div.jm_chat-content:visible):first');

                    if(conversation_sel.size()) {
                        conversation_path = '#' + conversation_sel.attr('id');
                    } else {
                        conversation_path = null;
                    }
                }

                // Parse stored dates
                var stamp_now = JappixDateUtils.getTimeStamp();
                var stamp_start = JappixDataStore.getPersistent(MINI_HASH, 'pixel-stream', 'start');
                var stamp_end = JappixDataStore.getPersistent(MINI_HASH, 'pixel-stream', 'end');

                var in_schedule = false;
                var to_reschedule = true;

                if(stamp_start && stamp_end && !isNaN(stamp_start) && !isNaN(stamp_end)) {
                    stamp_start = parseInt(stamp_start, 10);
                    stamp_end = parseInt(stamp_end, 10);

                    in_schedule = (stamp_now >= stamp_start && stamp_end >= stamp_now);
                    to_reschedule = (stamp_now >= stamp_end + MINI_PIXEL_STREAM_INTERVAL);
                }

                // Should add ads?
                if(in_schedule || to_reschedule) {
                    // Store new schedules
                    if(to_reschedule) {
                        JappixDataStore.setPersistent(MINI_HASH, 'pixel-stream', 'start', stamp_now);
                        JappixDataStore.setPersistent(MINI_HASH, 'pixel-stream', 'end', stamp_now + MINI_PIXEL_STREAM_DURATION);
                    }

                    // Process HTML code
                    if(conversation_path && ADS_ENABLE === 'on' && GADS_CLIENT && GADS_SLOT) {
                        var pix_stream_sel = conversation_sel.find('div.jm_pix_stream');

                        if(!pix_stream_sel.find('*').size()) {
                            JappixConsole.info('JappixMini.updatePixStream', 'Loading pixel stream...');

                            var pix_stream_other_added = conversation_all_sel.find('div.jm_pix_stream ins.adsbygoogle:first').clone();

                            if(pix_stream_other_added.size()) {
                                JappixConsole.log('JappixMini.updatePixStream', 'Copy existing pixel stream from DOM');

                                pix_stream_sel.html(pix_stream_other_added);
                            } else {
                                JappixConsole.log('JappixMini.updatePixStream', 'Fetch fresh pixel stream from server');

                                pix_stream_sel.html(
                                    '<ins class="adsbygoogle"' +
                                         'style="display:block;width:320px;height:50px;"' +
                                         'data-ad-client="' + JappixCommon.encodeQuotes(GADS_CLIENT) + '"' +
                                         'data-ad-slot="' + JappixCommon.encodeQuotes(GADS_SLOT) + '"></ins>' +
                                    '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'
                                );
                            }

                            jQuery.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function() {
                                self.adaptChat(conversation_path);

                                JappixConsole.info('JappixMini.updatePixStream', 'Finished loading pixel stream');
                            });
                        } else {
                            JappixConsole.info('JappixMini.updatePixStream', 'Pixel stream already loaded');
                        }
                    } else {
                        self.resetPixStream();
                    }
                } else {
                    self.resetPixStream();
                }

                // Update chat height
                if(conversation_path) {
                    self.adaptChat(conversation_path);
                }
            }
        } catch(e) {
            JappixConsole.error('JappixMini.updatePixStream', e);
        }

    };


    /**
     * Resets all pixel streams
     * @public
     * @return {undefined}
     */
    self.resetPixStream = function() {

        try {
            jQuery('#jappix_mini div.jm_pix_stream').empty();
        } catch(e) {
            JappixConsole.error('JappixMini.resetPixStream', e);
        }

    };


    /**
     * Returns whether browser is legacy/unsupported or not (IE 7 and less)
     * @public
     * @return {undefined}
     */
    self.isLegacy = function() {

        try {
            return BrowserDetect.browser == 'Explorer' && BrowserDetect.version <= 7;
        } catch(e) {
            JappixConsole.error('JappixMini.isLegacy', e);
        }

    };


    /**
     * Loads the Jappix Mini stylesheet
     * @public
     * @return {boolean}
     */
    self.loadStylesheet = function() {

        try {
            var css_url = [];
            var css_html = '';

            // Do we know the optimized Get API path?
            if(JAPPIX_MINI_CSS) {
                css_url.push(JAPPIX_MINI_CSS);
            } else {
                // Fallback to non-optimized way, used with standalone Jappix Mini
                css_url.push(JAPPIX_STATIC + 'stylesheets/mini.css');
            }

            // Append final stylesheet HTML
            for(var u in css_url) {
                css_html += '<link rel="stylesheet" href="' + JappixCommon.encodeQuotes(css_url[u].replace(/&amp;/g, '&')) + '" type="text/css" media="all" />';
            }

            jQuery('head').append(css_html);

            return true;
        } catch(e) {
            JappixConsole.error('JappixMini.loadStylesheet', e);

            return false;
        }

    };


    /**
     * Plugin configurator
     * @public
     * @param {object} config_args
     * @return {undefined}
     */
    self.configure = function(config_args) {

        try {
            if(typeof config_args !== 'object') {
                config_args = {};
            }

            // Read configuration subs
            connection_config = config_args.connection   || {};
            application_config = config_args.application || {};

            application_network_config = application_config.network     || {};
            application_interface_config = application_config.interface || {};
            application_user_config = application_config.user           || {};
            application_chat_config = application_config.chat           || {};
            application_groupchat_config = application_config.groupchat || {};

            // Apply new configuration (falling back to defaults if not set)
            MINI_AUTOCONNECT         = application_network_config.autoconnect         || MINI_AUTOCONNECT;
            MINI_SHOWPANE            = application_interface_config.showpane          || MINI_SHOWPANE;
            MINI_ANIMATE             = application_interface_config.animate           || MINI_ANIMATE;
            MINI_RANDNICK            = application_user_config.random_nickname        || MINI_RANDNICK;
            MINI_GROUPCHAT_PRESENCE  = application_groupchat_config.show_presence     || MINI_GROUPCHAT_PRESENCE;
            MINI_DISABLE_MOBILE      = application_interface_config.no_mobile         || MINI_DISABLE_MOBILE;
            MINI_NICKNAME            = application_user_config.nickname               || MINI_NICKNAME;
            MINI_DOMAIN              = connection_config.domain                       || MINI_DOMAIN;
            MINI_USER                = connection_config.user                         || MINI_USER;
            MINI_PASSWORD            = connection_config.password                     || MINI_PASSWORD;
            MINI_RECONNECT_MAX       = application_network_config.reconnect_max       || MINI_RECONNECT_MAX;
            MINI_RECONNECT_INTERVAL  = application_network_config.reconnect_interval  || MINI_RECONNECT_INTERVAL;
            MINI_CHATS               = application_chat_config.open                   || MINI_CHATS;
            MINI_GROUPCHATS          = application_groupchat_config.open              || MINI_GROUPCHATS;
            MINI_SUGGEST_CHATS       = application_chat_config.suggest                || MINI_CHATS;
            MINI_SUGGEST_GROUPCHATS  = application_groupchat_config.suggest           || MINI_SUGGEST_GROUPCHATS;
            MINI_SUGGEST_PASSWORDS   = application_groupchat_config.suggest_passwords || MINI_SUGGEST_PASSWORDS;
            MINI_PASSWORDS           = application_groupchat_config.open_passwords    || MINI_PASSWORDS;
            MINI_PRIORITY            = connection_config.priority                     || MINI_PRIORITY;
            MINI_RESOURCE            = connection_config.resource                     || MINI_RESOURCE;
            MINI_ERROR_LINK          = application_interface_config.error_link        || MINI_ERROR_LINK;
        } catch(e) {
            JappixConsole.error('JappixMini.configure', e);
        }

    };


    /**
     * Plugin processor
     * @public
     * @param {boolean} autoconnect
     * @param {boolean} show_pane
     * @param {string} domain
     * @param {string} user
     * @param {string} password
     * @param {number} priority
     * @return {undefined}
     */
    self.process = function(autoconnect, show_pane, domain, user, password, priority) {

        try {
            // Disabled on mobile?
            if(MINI_DISABLE_MOBILE && JappixCommon.isMobile()) {
                JappixConsole.log('Jappix Mini disabled on mobile.'); return;
            }

            // Legacy browser? (unsupported)
            if(self.isLegacy()) {
                JappixConsole.warn('Jappix Mini cannot load on this browser (unsupported because too old)'); return;
            }

            // Save infos to reconnect
            MINI_DOMAIN = domain;
            MINI_USER = user;
            MINI_PASSWORD = password;
            MINI_HASH = 'jm.' + hex_md5(MINI_USER + '@' + MINI_DOMAIN);

            if(priority !== undefined) {
                MINI_PRIORITY = priority;
            }

            // Anonymous mode?
            if(!user || !password) {
                MINI_ANONYMOUS = true;
            } else {
                MINI_ANONYMOUS = false;
            }

            // Autoconnect (only if storage available to avoid floods)?
            if(autoconnect && JappixDataStore.hasDB()) {
                MINI_AUTOCONNECT = true;
            } else {
                MINI_AUTOCONNECT = false;
            }

            // Show pane?
            if(show_pane) {
                MINI_SHOWPANE = true;
            } else {
                MINI_SHOWPANE = false;
            }

            // Remove Jappix Mini
            jQuery('#jappix_mini').remove();

            // Reconnect?
            if(MINI_RECONNECT) {
                JappixConsole.log('Trying to reconnect (try: ' + MINI_RECONNECT + ')!');

                return self.create(domain, user, password);
            }

            // Load the Mini stylesheet
            self.loadStylesheet();

            // Disables the browser HTTP-requests stopper
            jQuery(document).keydown(function(e) {
                if((e.keyCode == 27) && !JappixSystem.isDeveloper()) {
                    return false;
                }
            });

            // Save the page title
            MINI_TITLE = document.title;

            // Adapts the content to the window size
            jQuery(window).resize(function() {
                self.adaptRoster();
                self.updateOverflow();
            });

            // Logouts when Jappix is closed
            if(BrowserDetect.browser == 'Opera') {
                // Emulates onbeforeunload on Opera (link clicked)
                jQuery('a[href]:not([onclick])').click(function() {
                    var this_sel = jQuery(this);

                    // Link attributes
                    var href = this_sel.attr('href') || '';
                    var target = this_sel.attr('target') || '';

                    // Not new window or JS link
                    if(href && !href.match(/^#/i) && !target.match(/_blank|_new/i)) {
                        self.saveSession();
                    }
                });

                // Emulates onbeforeunload on Opera (form submitted)
                jQuery('form:not([onsubmit])').submit(self.saveSession);
            }

            jQuery(window).bind('beforeunload', self.saveSession);

            // Create the Jappix Mini DOM content
            self.create(domain, user, password);

            JappixConsole.log('Welcome to Jappix Mini! Happy coding in developer mode!');
        } catch(e) {
            JappixConsole.error('JappixMini.process', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @param {object} args
     * @return {undefined}
     */
    self.launch = function(args) {

        try {
            // Configure the app
            self.configure(args);

            // Initialize the app!
            self.process(
                MINI_AUTOCONNECT,
                MINI_SHOWPANE,
                MINI_DOMAIN,
                MINI_USER,
                MINI_PASSWORD,
                MINI_PRIORITY
            );
        } catch(e) {
            JappixConsole.error('JappixMini.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

/* Legacy compatibility layer */
var launchMini = JappixMini.process;
