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
    var JOIN_SUGGEST = [];


	/**
     * Displays the MUC admin elements
     * @public
     * @param {string} affiliation
     * @param {string} id
     * @param {string} xid
     * @param {number} statuscode
     * @return {undefined}
     */
    self.displayMucAdmin = function(affiliation, id, xid, statuscode) {

        try {
            // We must be in the "login" mode
            if(isAnonymous())
                return;
            
            // We check if the user is a room owner or administrator to give him privileges
            if(affiliation == 'owner' || affiliation == 'admin')
                $('#' + id + ' .tools-mucadmin').show();
            
            // We check if the room hasn't been yet created
            if(statuscode == 201)
                openThisInfo(4);
            
            // We add the click event
            $('#' + id + ' .tools-mucadmin').click(function() {
                openMucAdmin(xid, affiliation);
            });
        } catch(e) {
            Console.error('Groupchat.displayMucAdmin', e);
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
                if(!isAnonymous())
                    nickname = getNick();
                else
                    nickname = ANONYMOUS_NICK;
                
                // If the nickname could not be retrieved, ask it
                if(!nickname)
                    generateMUCAsk('nickname', room, hash, nickname, password);
            }
            
            // Got our nickname?
            if(nickname) {
                // Get our general presence
                var show = getDB(DESKTOP_HASH, 'presence-show', 1);
                var status = getDB(DESKTOP_HASH, 'options', 'presence-status');
            
                // Set my nick
                $('#' + hash).attr('data-nick', escape(nickname));
            
                // Send the appropriate presence
                sendPresence(room + '/' + nickname, '', show, status, '', true, password, handleMUC);
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
            var from = fullXID(getStanzaFrom(presence));
            var room = bareXID(from);
            var nickname = thisResource(from);
            var hash = hex_md5(room);
            
            // No ID: must fix M-Link bug
            if(presence.getID() == null) {
                presence.setID(1);
            }
            
            Console.info('First MUC presence: ' + from);
            
            // Catch the errors
            if(!handleError(xml)) {
                // Define some stuffs
                var muc_user = $(xml).find('x[xmlns="' + NS_MUC_USER + '"]');
                var affiliation = muc_user.find('item').attr('affiliation');
                        var statuscode = parseInt(muc_user.find('status').attr('code'));
                
                // Handle my presence
                handlePresence(presence);
                
                // Check if I am a room owner
                displayMucAdmin(affiliation, hash, room, statuscode);
                
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
                generateMUCAsk('password', room, hash, nickname);
            }
            
            // There's a nickname conflict
            else if($(xml).find('error[type="cancel"] conflict').size()) {
                generateMUCAsk('nickname', room, hash);
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
            var label_text;
            
            switch(type) {
                case 'nickname':
                    label_text = _e("Nickname");
                    break;
                
                case 'password':
                    label_text = _e("Password");
                    break;
            }
            
            // Create the HTML markup
            $('#' + hash + ' .compose').hide();
            
            $('#' + hash).append(
                '<div class="muc-ask text">' + 
                    '<label>' + label_text + '</label>' + 
                    '<input class="focusable" type="text" />' + 
                '</div>'
            );
            
            // When a key is pressed in the input
            $(path_to + ' input').keyup(function(e) {
                var value_input = $(this).val();
                
                // Enter key pressed
                if(e.keyCode == 13) {
                    // trim() fixes #304
                    if(type == 'nickname' && trim(value_input)) {
                        nickname = trim(value_input);
                        return getMUC(room, nickname, password);
                    }
                    
                    if(type == 'password' && value_input) {
                        password = value_input;
                        return getMUC(room, nickname, password);
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
    self.groupchatCreate = function(hash, room, chan, nickname, password) {

        /* REF: http://xmpp.org/extensions/xep-0045.html */

        try {
            Console.info('New groupchat: ' + room);
    
            // Create the chat content
            generateChat('groupchat', hash, room, chan);
            
            // Create the chat switcher
            generateSwitch('groupchat', hash, room, chan);
            
            // The icons-hover functions
            tooltipIcons(room, hash);
            
            // Click event on the add tool
            $('#' + hash + ' .tools-add').click(function() {
                // Hide the icon (to tell the user all is okay)
                $(this).hide();
                
                // Add the groupchat to the user favorites
                addThisFavorite(room, chan);
            });
            
            // Must show the add button?
            if(!existDB('favorites', room))
                $('#' + hash + ' .tools-add').show();
            
            // The event handlers
            var inputDetect = $('#' + hash + ' .message-area');
            
            // Focus event
            inputDetect.focus(function() {
                // Clean notifications for this chat
                chanCleanNotify(hash);
                
                // Store focus on this chat!
                CHAT_FOCUS_HASH = hash;
            })
            
            // Blur event
            inputDetect.blur(function() {
                // Reset storage about focus on this chat!
                if(CHAT_FOCUS_HASH == hash)
                    CHAT_FOCUS_HASH = null;

                // Reset autocompletion
                resetAutocompletion(hash);
            })
            
            // Lock to the input
            inputDetect.keydown(function(e) {
                // Enter key
                if(e.keyCode == 13) {
                    // If shift key (without any others modifiers) was pressed, add a new line
                    if(e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey)
                        inputDetect.val(inputDetect.val() + '\n');
                    
                    // Send the message
                    else {
                        sendMessage(hash, 'groupchat');
                        
                        // Reset the composing database entry
                        setDB(DESKTOP_HASH, 'chatstate', room, 'off');
                    }
                    
                    return false;
                }
                
                // Tabulation key (without any modifiers)
                else if(!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && e.keyCode == 9) {
                    createAutocompletion(hash);
                    
                    return false;
                }
                
                // Reset the autocompleter
                else
                    resetAutocompletion(hash);
            });
            
            // Chatstate events
            eventsChatState(inputDetect, room, hash, 'groupchat');
            
            // Get the current muc informations and content
            getMUC(room, nickname, password);
        } catch(e) {
            Console.error('Groupchat.create', e);
        }

    };


	/**
     * Generates a groupchat to join array
     * @public
     * @return {object}
     */
    self.arrayJoinGroupchats = function() {

        try {
            // Values array
            var muc_arr = [GROUPCHATS_JOIN];
            var new_arr = [];
            
            // Try to split it
            if(GROUPCHATS_JOIN.indexOf(',') != -1)
                muc_arr = GROUPCHATS_JOIN.split(',');
            
            for(i in muc_arr) {
                // Get the current value
                var muc_current = trim(muc_arr[i]);
                
                // No current value?
                if(!muc_current)
                    continue;
                
                // Filter the current value
                muc_current = generateXID(muc_current, 'groupchat');
                
                // Add the current value
                if(!existArrayValue(new_arr, muc_current))
                    new_arr.push(muc_current);
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
    self.joinConfGroupchats = function() {

        try {
            // Nothing to join?
            if(!JOIN_SUGGEST)
                return;
            
            // Join the chats
            if(JOIN_SUGGEST.length) {
                for(g in JOIN_SUGGEST)
                    checkChatCreate(JOIN_SUGGEST[g], 'groupchat');
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
            var groupchat_arr = arrayJoinGroupchats();
    
            // Must suggest the user?
            if((GROUPCHATS_SUGGEST == 'on') && groupchat_arr.length) {
                if(exists('#suggest'))
                    return;
                
                // Create HTML code
                var html = '<div id="suggest">';
                    html += '<div class="title">' + _e("Suggested chatrooms") + '</div>';
                    
                    html += '<div class="content">';
                        for(g in groupchat_arr) {
                            html += '<a class="one" href="#" data-xid="' + encodeQuotes(groupchat_arr[g]) + '">';
                                html += '<span class="icon talk-images"></span>';
                                html += '<span class="name">' + capitaliseFirstLetter(getXIDNick(groupchat_arr[g]).htmlEnc()) + '</span>';
                                html += '<span class="state talk-images"></span>';
                                html += '<span class="clear"></span>';
                            html += '</a>';
                        }
                    html += '</div>';
                    
                    html += '<a class="next disabled" href="#">' + _e("Continue") + '</a>';
                html += '</div>';
                
                // Append HTML code
                $('body').append(html);
                
                // Click events
                $('#suggest .content a.one').click(function() {
                    // Add/remove the active class
                    $(this).toggleClass('active');
                    
                    // We require at least one room to be chosen
                    if(exists('#suggest .content a.one.active'))
                        $('#suggest a.next').removeClass('disabled');
                    else
                        $('#suggest a.next').addClass('disabled');
                    
                    return false;
                });
                
                $('#suggest a.next').click(function() {
                    // Disabled?
                    if($(this).hasClass('disabled'))
                        return false;
                    
                    // Store groupchats to join
                    $('#suggest .content a.one.active').each(function() {
                        JOIN_SUGGEST.push($(this).attr('data-xid'));
                    });
                    
                    // Switch to talk UI
                    $('#suggest').remove();
                    triggerConnected();
                    
                    return false;
                });
            } else {
                JOIN_SUGGEST = groupchat_arr;
                
                triggerConnected();
            }
        } catch(e) {
            Console.error('Groupchat.suggestCheck', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();