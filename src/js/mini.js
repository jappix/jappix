/*

Jappix - An open social platform
These are the Jappix Mini JS scripts for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, hunterjm, Camaran, regilero, Kloadut, Maranda

*/

// Jappix Mini globals
var MINI_DISCONNECT				= false;
var MINI_AUTOCONNECT			= false;
var MINI_SHOWPANE				= false;
var MINI_INITIALIZED			= false;
var MINI_ROSTER_INIT			= false;
var MINI_ROSTER_NOGROUP         = 'jm_nogroup'
var MINI_ANONYMOUS				= false;
var MINI_ANIMATE				= false;
var MINI_RANDNICK				= false;
var MINI_GROUPCHAT_PRESENCE		= false;
var MINI_DISABLE_MOBILE			= false;
var MINI_NICKNAME				= '';
var MINI_TITLE					= null;
var MINI_DOMAIN					= null;
var MINI_USER					= null;
var MINI_PASSWORD				= null;
var MINI_HASH					= null;
var MINI_ACTIVE					= null;
var MINI_RECONNECT				= 0;
var MINI_RECONNECT_MAX			= 100;
var MINI_RECONNECT_INTERVAL     = 1;
var MINI_QUEUE					= [];
var MINI_CHATS					= [];
var MINI_GROUPCHATS				= [];
var MINI_SUGGEST_CHATS			= [];
var MINI_SUGGEST_GROUPCHATS		= [];
var MINI_SUGGEST_PASSWORDS		= [];
var MINI_PASSWORDS				= [];
var MINI_PRIORITY				= 1;
var MINI_RESOURCE				= JAPPIX_RESOURCE + ' Mini';
var MINI_ERROR_LINK				= 'https://mini.jappix.com/issues';


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
    self.setupConMini = function(con) {

        try {
            con.registerHandler('message', handleMessageMini);
            con.registerHandler('presence', handlePresenceMini);
            con.registerHandler('iq', handleIQMini);
            con.registerHandler('onerror', handleErrorMini);
            con.registerHandler('onconnect', connectedMini);
        } catch(e) {
            Console.error('JappixMini.setupCon', e);
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
    self.connectMini = function(domain, user, password) {

        try {
            // We define the http binding parameters
            oArgs = new Object();
            
            if(HOST_BOSH_MINI)
                oArgs.httpbase = HOST_BOSH_MINI;
            else
                oArgs.httpbase = HOST_BOSH;
            
            // Check BOSH origin
            BOSH_SAME_ORIGIN = isSameOrigin(oArgs.httpbase);
            
            // We create the new http-binding connection
            con = new JSJaCHttpBindingConnection(oArgs);
            
            // And we handle everything that happen
            setupConMini(con);
            
            // Generate a resource
            var random_resource = getDB(MINI_HASH, 'jappix-mini', 'resource');
            
            if(!random_resource)
                random_resource = MINI_RESOURCE + ' (' + (new Date()).getTime() + ')';
            
            // We retrieve what the user typed in the login inputs
            oArgs = new Object();
            oArgs.secure = true;
            oArgs.xmllang = XML_LANG;
            oArgs.resource = random_resource;
            oArgs.domain = domain;
            
            // Store the resource (for reconnection)
            setDB(MINI_HASH, 'jappix-mini', 'resource', random_resource);
            
            // Anonymous login?
            if(MINI_ANONYMOUS) {
                // Anonymous mode disabled?
                if(!allowedAnonymous()) {
                    Console.warn('Not allowed to use anonymous mode.');
                    
                    // Notify this error
                    notifyErrorMini();
                    
                    return false;
                }
                
                // Bad domain?
                else if(lockHost() && (domain != HOST_ANONYMOUS)) {
                    Console.warn('Not allowed to connect to this anonymous domain: ' + domain);
                    
                    // Notify this error
                    notifyErrorMini();
                    
                    return false;
                }
                
                oArgs.authtype = 'saslanon';
            }
            
            // Normal login
            else {
                // Bad domain?
                if(lockHost() && (domain != HOST_MAIN)) {
                    Console.warn('Not allowed to connect to this main domain: ' + domain);
                    
                    // Notify this error
                    notifyErrorMini();
                    
                    return false;
                }
                
                // No nickname?
                if(!MINI_NICKNAME)
                    MINI_NICKNAME = user;
                
                oArgs.username = user;
                oArgs.pass = password;
            }
            
            // We connect !
            con.connect(oArgs);
            
            Console.info('Jappix Mini is connecting...');
        } catch(e) {
            Console.error('JappixMini.connect', e);

            // Reset Jappix Mini
            disconnectedMini();
        } finally {
            return false;
        }

    };


    /**
     * When the user is connected
     * @public
     * @return {undefined}
     */
    self.connectedMini = function() {

        try {
            // Do not get the roster if anonymous
            if(!MINI_RECONNECT) {
                // Update the roster
                jQuery('#jappix_mini a.jm_pane.jm_button span.jm_counter').text('0');

                if(MINI_ANONYMOUS)
                    initializeMini();
                else
                    getRosterMini();

                Console.info('Jappix Mini is now connected.');
            } else {
                reconnectedMini();

                Console.info('Jappix Mini is now reconnected.');
            }

            // Reset reconnect var
            MINI_RECONNECT = 0;
            removeDB(MINI_HASH, 'jappix-mini', 'reconnect');

            // Execute enqueued events
            dequeueMini();
        } catch(e) {
            Console.error('JappixMini.connected', e);
        }

    };


    /**
     * When the user is reconnected
     * @public
     * @return {undefined}
     */
    self.reconnectedMini = function() {

        try {
            var last_presence = getDB(MINI_HASH, 'jappix-mini', 'presence-last') || 'available';

            // Flush presence storage
            flushStorageMini('presence');

            // Empty groupchat messages
            jQuery('#jappix_mini div.jm_conversation.jm_type_groupchat div.jm_received-messages div.jm_group').remove();

            // Re-send all presences
            jQuery('#jappix_mini div.jm_status_picker a[data-status="' + encodeQuotes(last_presence) + '"]').click();
        } catch(e) {
            Console.error('JappixMini.reconnected', e);
        }

    };


    /**
     * When the user disconnects
     * @public
     * @return {undefined}
     */
    self.saveSessionMini = function() {

        try {
            // Not initialized?
            if(!MINI_INITIALIZED)
                return;
            
            // Save the actual Jappix Mini DOM
            setDB(MINI_HASH, 'jappix-mini', 'dom', jQuery('#jappix_mini').html());
            setDB(MINI_HASH, 'jappix-mini', 'nickname', MINI_NICKNAME);
            
            // Save the scrollbar position
            var scroll_position = '';
            var scroll_hash = jQuery('#jappix_mini div.jm_conversation:has(a.jm_pane.jm_clicked)').attr('data-hash');
            
            if(scroll_hash)
                scroll_position = document.getElementById('received-' + scroll_hash).scrollTop + '';
            
            setDB(MINI_HASH, 'jappix-mini', 'scroll', scroll_position);
            
            // Suspend connection
            if(isConnected()) {
                con.suspend(false);
            } else {
                setDB(MINI_HASH, 'jappix-mini', 'reconnect', ((MINI_RECONNECT == 0) ? 0 : (MINI_RECONNECT - 1)));
                serializeQueueMini();
            }
            
            Console.info('Jappix Mini session save tool launched.');
        } catch(e) {
            Console.error('JappixMini.saveSession', e);
        }

    };


	/**
     * Flushes Jappix Mini storage database
     * @public
     * @param {string} r_override
     * @return {undefined}
     */
    self.flushStorageMini = function(r_override) {

        try {
            var i,
            db_regex, db_current;

            db_regex = new RegExp(('^' + MINI_HASH + '_') + 'jappix\-mini' + (r_override ? ('_' + r_override) : ''));

            for(i = 0; i < storageDB.length; i++) {
                db_current = storageDB.key(i);

                if(db_regex.exec(db_current))
                    storageDB.removeItem(db_current);
            }

            Console.log('Jappix Mini DB has been successfully flushed (' + (r_override ? 'partly' : 'completely') + ').');
        } catch(e) {
            Console.error('JappixMini.flushStorage', e);
        }

    };


    /**
     * Disconnects the connected user
     * @public
     * @return {boolean}
     */
    self.disconnectMini = function() {

        try {
            // No connection?
            if(!isConnected())
                return false;
            
            Console.info('Jappix Mini is disconnecting...');
            
            // Change markers
            MINI_DISCONNECT = true;
            MINI_INITIALIZED = false;

            // Flush storage
            flushStorageMini();
            
            // Add disconnection handler
            con.registerHandler('ondisconnect', function() {
                disconnectedMini();
            });
            
            // Disconnect the user
            con.disconnect();
            
            return false;
        } catch(e) {
            Console.error('JappixMini.disconnect', e);
        }

    };


    /**
     * When the user is disconnected
     * @public
     * @return {boolean}
     */
    self.disconnectedMini = function() {

        try {
            // Connection error?
            if(!MINI_DISCONNECT || MINI_INITIALIZED) {
                // Reset reconnect timer
                jQuery('#jappix_mini').stopTime();
                
                // Try to reconnect after a while
                if(MINI_INITIALIZED && (MINI_RECONNECT++ < MINI_RECONNECT_MAX)) {
                    // Set timer
                    jQuery('#jappix_mini').oneTime(MINI_RECONNECT_INTERVAL * 1000, function() {
                        Console.debug('Trying to reconnect... (attempt: ' + MINI_RECONNECT + ' / ' + MINI_RECONNECT_MAX + ')');

                        // Silently reconnect user
                        connectMini(MINI_DOMAIN, MINI_USER, MINI_PASSWORD);
                    });

                    Console.info('Jappix Mini is encountering connectivity issues.');
                } else {
                    // Remove the stored items
                    flushStorageMini();

                    // Notify this error
                    notifyErrorMini();

                    // Reset markers
                    MINI_DISCONNECT = false;
                    MINI_INITIALIZED = false;

                    Console.info('Jappix Mini is giving up. Server seems to be down.');
                }
            }
            
            // Normal disconnection?
            else {
                launchMini(false, MINI_SHOWPANE, MINI_DOMAIN, MINI_USER, MINI_PASSWORD);

                // Reset markers
                MINI_DISCONNECT = false;
                MINI_INITIALIZED = false;

                Console.info('Jappix Mini is now disconnected.');
            }
        } catch(e) {
            Console.error('JappixMini.disconnected', e);
        }

    };


    /**
     * Handles the incoming errors
     * @public
     * @param {object} err
     * @return {undefined}
     */
    self.handleErrorMini = function(err) {

        try {
            // First level error (connection error)
            if(jQuery(err).is('error')) {
                // Notify this error
                disconnectedMini();
                
                Console.error('First level error received.');
            }
        } catch(e) {
            Console.error('JappixMini.handleError', e);
        }

    };


    /**
     * Handles the incoming messages
     * @public
     * @param {object} msg
     * @return {undefined}
     */
    self.handleMessageMini = function(msg) {

        try {
            var type = msg.getType();
            
            // This is a message Jappix can handle
            if((type == 'chat') || (type == 'normal') || (type == 'groupchat') || !type) {
                // Get the packet data
                var node = msg.getNode();
                var subject = trim(msg.getSubject());
                var body = subject ? subject : trim(msg.getBody());
                
                // Get the sender data
                var from = fullXID(getStanzaFrom(msg));
                var xid = bareXID(from);
                var hash = hex_md5(xid);
                
                // Any attached message body?
                if(body) {
                    // Get more sender data
                    var use_xid = xid;
                    var nick = thisResource(from);
                    
                    // Read the delay
                    var delay = readMessageDelay(node);
                    var d_stamp;
                    
                    // Manage this delay
                    if(delay) {
                        time = relativeDate(delay);
                        d_stamp = Date.jab2date(delay);
                    }
                    
                    else {
                        time = getCompleteTime();
                        d_stamp = new Date();
                    }
                    
                    // Get the stamp
                    var stamp = extractStamp(d_stamp);
                    
                    // Is this a groupchat private message?
                    if(exists('#jappix_mini #chat-' + hash + '[data-type="groupchat"]')) {
                        // Regenerate some stuffs
                        if((type == 'chat') || (type == 'normal') || !type) {
                            xid = from;
                            hash = hex_md5(xid);
                        }
                        
                        // XID to use for a groupchat
                        else
                            use_xid = from;
                    }
                    
                    // Message type
                    var message_type = 'user-message';
                    
                    // Grouphat values
                    if(type == 'groupchat') {
                        // Old message
                        if(msg.getChild('delay', NS_URN_DELAY) || msg.getChild('x', NS_DELAY))
                            message_type = 'old-message';
                        
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
                                nick = getXIDNick(xid);
                                
                                if(msgnick) {
                                    // If there is a nickname in the message which differs from the jid-extracted nick then tell it to the user
                                    if(nick != msgnick)
                                         nick = msgnick + ' (' + nick + ')';
                                }
                                
                                // Push that unknown guy in a temporary roster entry
                                var unknown_entry = jQuery('<a class="jm_unknown jm_offline" href="#"></a>').attr('data-nick', nick).attr('data-xid', xid);
                                unknown_entry.appendTo('#jappix_mini div.jm_roster div.jm_buddies');
                             }
                        }
                    }
                    
                    // Define the target div
                    var target = '#jappix_mini #chat-' + hash;
                    
                    // Create the chat if it does not exist
                    if(!exists(target) && (type != 'groupchat'))
                        chatMini(type, xid, nick, hash);
                    
                    // Display the message
                    displayMessageMini(type, body, use_xid, nick, hash, time, stamp, message_type);
                    
                    // Notify the user if not focused & the message is not a groupchat old one
                    if((!jQuery(target + ' a.jm_chat-tab').hasClass('jm_clicked') || !isFocused() || (MINI_ACTIVE != hash)) && (message_type == 'user-message')) {
                        // Play a sound
                        if(type != 'groupchat')
                            soundPlayMini();
                        
                        // Show a notification bubble
                        notifyMessageMini(hash);
                    }
                    
                    Console.log('Message received from: ' + from);
                }
                
                // Chatstate groupchat filter
                if(exists('#jappix_mini #chat-' + hash + '[data-type="groupchat"]')) {
                    xid = from;
                    hash = hex_md5(xid);
                }
                
                // Reset current chatstate
                resetChatstateMini(xid, hash, type);
                
                // Apply new chatstate (if supported)
                if(jQuery(node).find('active[xmlns="' + NS_CHATSTATES + '"]').size() || jQuery(node).find('composing[xmlns="' + NS_CHATSTATES + '"]').size()) {
                    // Set marker to tell other user supports chatstates
                    jQuery('#jappix_mini #chat-' + hash + ' input.jm_send-messages').attr('data-chatstates', 'true');
                    
                    // Composing?
                    if(jQuery(node).find('composing[xmlns="' + NS_CHATSTATES + '"]').size())
                        displayChatstateMini('composing', xid, hash, type);
                }
            }
        } catch(e) {
            Console.error('JappixMini.handleMessage', e);
        }

    };


	/**
     * Handles the incoming IQs
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleIQMini = function(iq) {

        try {
            // Define some variables
            var iqFrom = fullXID(getStanzaFrom(iq));
            var iqID = iq.getID();
            var iqQueryXMLNS = iq.getQueryXMLNS();
            var iqType = iq.getType();
            var iqNode = iq.getNode();
            
            // Build the response
            var iqResponse = new JSJaCIQ();
            
            iqResponse.setID(iqID);
            iqResponse.setTo(iqFrom);
            iqResponse.setType('result');
            
            // Software version query
            if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0092.html */
                
                var iqQuery = iqResponse.setQuery(NS_VERSION);
                
                iqQuery.appendChild(iq.buildNode('name', {'xmlns': NS_VERSION}, 'Jappix Mini'));
                iqQuery.appendChild(iq.buildNode('version', {'xmlns': NS_VERSION}, JAPPIX_VERSION));
                iqQuery.appendChild(iq.buildNode('os', {'xmlns': NS_VERSION}, navigator.platform));
                
                con.send(iqResponse);
                
                Console.log('Received software version query: ' + iqFrom);
            }
            
            // Roster push
            else if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set')) {
                // Display the friend
                handleRosterMini(iq);
                
                con.send(iqResponse);
                
                Console.log('Received a roster push.');
            }
            
            // Disco info query
            else if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0030.html */
                
                var iqQuery = iqResponse.setQuery(NS_DISCO_INFO);
                
                // We set the name of the client
                iqQuery.appendChild(iq.appendNode('identity', {
                    'category': 'client',
                    'type': 'web',
                    'name': 'Jappix Mini',
                    'xmlns': NS_DISCO_INFO
                }));
                
                // We set all the supported features
                var fArray = new Array(
                    NS_DISCO_INFO,
                    NS_VERSION,
                    NS_ROSTER,
                    NS_MUC,
                    NS_VERSION,
                    NS_URN_TIME
                );
                
                for(i in fArray)
                    iqQuery.appendChild(iq.buildNode('feature', {'var': fArray[i], 'xmlns': NS_DISCO_INFO}));
                
                con.send(iqResponse);
                
                Console.log('Received a disco#infos query.');
            }
            
            // User time query
            else if(jQuery(iqNode).find('time').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0202.html */
                
                var iqTime = iqResponse.appendNode('time', {'xmlns': NS_URN_TIME});
                iqTime.appendChild(iq.buildNode('tzo', {'xmlns': NS_URN_TIME}, getDateTZO()));
                iqTime.appendChild(iq.buildNode('utc', {'xmlns': NS_URN_TIME}, getXMPPTime('utc')));
                
                con.send(iqResponse);
                
                Console.log('Received local time query: ' + iqFrom);
            }
            
            // Ping
            else if(jQuery(iqNode).find('ping').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0199.html */
                
                con.send(iqResponse);
                
                Console.log('Received a ping: ' + iqFrom);
            }
            
            // Not implemented
            else if(!jQuery(iqNode).find('error').size() && ((iqType == 'get') || (iqType == 'set'))) {
                // Append stanza content
                for(var i = 0; i < iqNode.childNodes.length; i++)
                    iqResponse.getNode().appendChild(iqNode.childNodes.item(i).cloneNode(true));
                
                // Append error content
                var iqError = iqResponse.appendNode('error', {'xmlns': NS_CLIENT, 'code': '501', 'type': 'cancel'});
                iqError.appendChild(iq.buildNode('feature-not-implemented', {'xmlns': NS_STANZAS}));
                iqError.appendChild(iq.buildNode('text', {'xmlns': NS_STANZAS}, _e("The feature requested is not implemented by the recipient or server and therefore cannot be processed.")));
                
                con.send(iqResponse);
                
                Console.log('Received an unsupported IQ query from: ' + iqFrom);
            }
        } catch(e) {
            Console.error('JappixMini.handleIQ', e);
        }

    };


    /**
     * Handles the incoming presences
     * @public
     * @param {object} pr
     * @return {undefined}
     */
    self.handlePresenceMini = function(pr) {

        try {
            // Get the values
            var xml           = pr.getNode();
            var from          = fullXID(getStanzaFrom(pr));
            var xid           = bareXID(from);
            var resource      = thisResource(from);
            var resources_obj = {};

            // Is this a groupchat?
            if(exists('#jappix_mini div.jm_conversation[data-type="groupchat"][data-xid="' + encodeQuotes(xid) + '"]'))
                xid = from;

            // Store presence stanza
            setDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + from, pr.xml());
            resources_obj = addResourcePresenceMini(xid, resource);

            // Re-process presence storage for this buddy
            processPresenceMini(xid, resource, resources_obj);

            // Display that presence
            displayPresenceMini(xid);

            Console.log('Presence received from: ' + from);
        } catch(e) {
            Console.error('JappixMini.handlePresence', e);
        }

    };


    /**
     * Reads a stored presence
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.readPresenceMini = function(from) {

        try {
            var pr = getDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + from);

            if(!pr)  pr = '<presence type="unavailable"></presence>';

            return XMLFromString(pr);
        } catch(e) {
            Console.error('JappixMini.readPresence', e);
        }

    };


    /**
     * Lists presence resources for an user
     * @public
     * @param {string} xid
     * @return {object}
     */
    self.resourcesPresenceMini = function(xid) {

        var resources_obj = {};

        try {
            var resources_db  = getDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid);

            if(resources_db) {
                resources_obj = jQuery.evalJSON(resources_db);
            }
        } catch(e) {
            Console.error('JappixMini.resourcesPresence', e);
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
    self.addResourcePresenceMini = function(xid, resource) {

        try {
            var resources_obj = resourcesPresenceMini(xid);

            resources_obj[resource] = 1;
            setDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid, jQuery.toJSON(resources_obj));

            return resources_obj;
        } catch(e) {
            Console.error('JappixMini.addResourcePresence', e);

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
    self.removeResourcePresenceMini = function(xid, resource) {

        try {
            var resources_obj = resourcesPresenceMini(xid);

            delete resources_obj[resource];
            setDB(MINI_HASH, 'jappix-mini', 'presence-resources-' + xid, jQuery.toJSON(resources_obj));

            return resources_obj;
        } catch(e) {
            Console.error('JappixMini.removeResourcePresence', e);

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
    self.processPresenceMini = function(xid, resource, resources_obj) {

        try {
            if(!xid) {
                Console.warn('processPresenceMini > No XID value');
                return;
            }

            // Initialize vars
            var cur_resource, cur_from, cur_pr,
                cur_xml, cur_priority,
                from_highest, from_highest;

            from_highest = null;
            max_priority = null;

            // Groupchat presence? (no priority here)
            if(xid.indexOf('/') !== -1) {
                from_highest = xid;

                Console.log('Processed presence for groupchat user: ' + xid);
            } else {
                if(!priorityPresenceMini(xid)) {
                    from_highest = xid + '/' + resource;

                    Console.log('Processed initial presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                } else {
                    for(cur_resource in resources_obj) {
                        // Read presence data
                        cur_from = xid + '/' + cur_resource;
                        cur_pr   = getDB(MINI_HASH, 'jappix-mini', 'presence-stanza-' + cur_from);

                        if(cur_pr) {
                            // Parse presence data
                            cur_xml      = XMLFromString(cur_pr);
                            cur_priority = jQuery(cur_xml).find('priority').text();
                            cur_priority = !isNaN(cur_priority) ? parseInt(cur_priority) : 0;
                            
                            // Higher priority?
                            if((cur_priority >= max_priority) || (max_priority == null)) {
                                max_priority = cur_priority;
                                from_highest = cur_from;
                            }
                        }
                    }

                    Console.log('Processed presence for regular user: ' + xid + ' (highest priority for: ' + (from_highest || 'none') + ')');
                }
            }

            if(from_highest) {
                setDB(MINI_HASH, 'jappix-mini', 'presence-priority-' + xid, from_highest);
            } else {
                removeDB(MINI_HASH, 'jappix-mini', 'presence-priority-' + xid);
            }
        } catch(e) {
            Console.error('JappixMini.processPresence', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('JappixMini.xxxx', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

var launchMini = JappixMini.launch;
