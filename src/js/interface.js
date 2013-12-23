/*

Jappix - An open social platform
These are the interface JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Interface = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    var CHAT_FOCUS_HASH = null;


	/**
     * Changes the title of the document
     * @public
     * @param {string} title
     * @return {undefined}
     */
    self.pageTitle = function(title) {

        try {
            // Anonymous mode?
            var head_name = getName();
            
            if(isAnonymous())
                head_name = ANONYMOUS_ROOM + ' (' + _e("anonymous mode") + ')';
            
            // We change the title to give essential informations
            switch(title) {
                case 'home':
                    document.title = SERVICE_NAME + ' • ' + SERVICE_DESC;
                    
                    break;
                
                case 'talk':
                    document.title = SERVICE_NAME + ' • ' + head_name;
                    
                    break;
                
                case 'new':
                    document.title = '[' + pendingEvents() + '] ' + SERVICE_NAME + ' • ' + head_name;
                    
                    break;
                
                case 'wait':
                    document.title = SERVICE_NAME + ' • ' + _e("Please wait...");
                    
                    break;
            }
        } catch(e) {
            Console.error('Interface.pageTitle', e);
        }

    };


    /**
     * Creates a general-wait item
     * @public
     * @return {boolean}
     */
    self.showGeneralWait = function() {

        try {
            // Item exists?
            if(exists('#general-wait'))
                return false;
            
            // Generate the HTML code
            var html = 
            '<div id="general-wait" class="removable">' + 
                '<div class="general-wait-content wait-big"></div>' + 
            '</div>';
            
            // Append the HTML code
            $('body').append(html);
            
            return true;
        } catch(e) {
            Console.error('Interface.showGeneralWait', e);
        }

    };


    /**
     * Removes the general-wait item
     * @public
     * @return {undefined}
     */
    self.removeGeneralWait = function() {

        try {
            $('#general-wait').remove();
        } catch(e) {
            Console.error('Interface.removeGeneralWait', e);
        }

    };


    /**
     * Generates a file upload valid form content
     * @public
     * @return {undefined}
     */
    self.generateFileShare = function() {

        try {
            return  '<input type="hidden" name="MAX_FILE_SIZE" value="' + encodeQuotes(JAPPIX_MAX_FILE_SIZE) + '">' + 
                    '<input type="hidden" name="user" value="' + encodeQuotes(getXID()) + '" />' + 
                    '<input type="hidden" name="location" value="' + encodeQuotes(generateURL(JAPPIX_LOCATION)) + '" />' + 
                    '<input type="hidden" name="id" value="' + (new Date()).getTime() + '" />' + 
                    '<input type="file" name="file" required="" />' + 
                    '<input type="submit" value="' + _e("Send") + '" />';
        } catch(e) {
            Console.error('Interface.generateFileShare', e);
        }

    };


    /**
     * Switches to the given chan
     * @public
     * @param {string} id
     * @return {boolean}
     */
    self.switchChan = function(id) {

        try {
            if(exists('#' + id)) {
                // We show the page-engine content
                $('.page-engine-chan').hide();
                $('#' + id).show();
                
                // We edit the tab switcher
                $('#page-switch .switcher').removeClass('activechan').addClass('chan');
                $('#page-switch .' + id).addClass('activechan').removeClass('chan');
                
                // Scroll down to the last message
                if(id != 'channel')
                    autoScroll(id);
                
                // Manage input focus
                inputFocus();
            }
        } catch(e) {
            Console.error('Interface.switchChan', e);
        } finally {
            return false;
        }

    };


	/**
     * Loads the complete chat switcher
     * @public
     * @return {undefined}
     */
    self.loadChatSwitch = function() {

        try {
            // Path
            var more_content = '#page-switch .more-content';
            
            // Yet displayed?
            if(exists(more_content))
                return closeBubbles();
            
            // Add the bubble
            showBubble(more_content);
            
            // Append the content
            $('#page-switch .more').append(
                '<div class="more-content bubble removable">' + 
                    $('#page-switch .chans').html() + 
                '</div>'
            );
        } catch(e) {
            Console.error('Interface.loadChatSwitch', e);
        } finally {
            return false;
        }

    };


    /**
     * Puts the selected smiley in the good page-engine input
     * @public
     * @param {string} smiley
     * @param {string} hash
     * @return {boolean}
     */
    self.insertSmiley = function(smiley, hash) {

        try {
            // We define the variables
            var selector = $('#' + hash + ' .message-area');
            var oValue = selector.val();
            
            // Any old value?
            if(oValue && !oValue.match(/^(.+)(\s)+$/))
                oValue += ' ';
            
            var nValue = oValue + smiley + ' ';
            
            // Put the new value and focus on it
            $(document).oneTime(10, function() {
                selector.val(nValue).focus();
            });
        } catch(e) {
            Console.error('Interface.insertSmiley', e);
        }

    };


    /**
     * Deletes all the associated elements of the chat we want to remove
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.deleteThisChat = function(hash) {

        try {
            $('#' + hash + ', #page-switch .' + hash).remove();
        } catch(e) {
            Console.error('Interface.deleteThisChat', e);
        }

    };


    /**
     * Closes the given chat
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @return {boolean}
     */
    self.quitThisChat = function(xid, hash, type) {

        try {
            if(type == 'groupchat') {
                // Send our unavailable presence
                sendPresence(xid + '/' + getMUCNick(hash), 'unavailable');
                
                // Remove all presence database entries for this groupchat
                var db_regex = new RegExp(('^' + DESKTOP_HASH + '_') + 'presence' + ('_(.+)'));

                for(var i = 0; i < storageDB.length; i++) {
                    // Get the pointer values
                    var current = storageDB.key(i);

                    if(current.match(db_regex)) {
                        var cXID = RegExp.$1;
                        
                        // If the pointer is on a presence from this groupchat
                        if(bareXID(cXID) == xid) {
                            // Generate the hash for the current XID
                            var cHash = hex_md5(cXID);
                            
                            // Disable the message textarea
                            $('#' + cHash + ' .message-area').attr('disabled', true);
                            
                            // Remove the presence for this XID
                            removeDB(DESKTOP_HASH, 'presence-stanza', cXID);
                            removeDB(DESKTOP_HASH, 'presence-resources', cXID);
                            presenceFunnel(cXID, cHash);
                        }
                    }
                }
            } else {
                chatStateSend('gone', xid, hash);
            }

            // Clear MAM storage for this chat
            if(xid in MAM_MAP_STATES) {
                delete MAM_MAP_STATES[xid];
            }
            
            // Get the chat ID which is before
            var previous = $('#' + hash).prev().attr('id');
            
            // Remove the chat
            deleteThisChat(hash);
            
            // Reset the switcher
            if(!exists('#page-switch .switcher.activechan')) {
                switchChan(previous);
            }
            
            // Reset the notifications
            chanCleanNotify(hash);
        } catch(e) {
            Console.error('Interface.quitThisChat', e);
        } finally {
            return false;
        }

    };


    /**
     * Generates the chat logs
     * @public
     * @param {string} xid
     * @param {string} hash
     * @return {boolean}
     */
    self.generateChatLog = function(xid, hash) {

        try {
            // Get the main values
            var path = '#' + hash + ' .';
            var content = $(path + 'content').clone().contents();
            var avatar = $(path + 'top .avatar-container:first').html();
            var nick = $(path + 'top .bc-name').text();
            var date = getXMPPTime('local');
            var type = $('#' + hash).attr('data-type');
            var direction = $('html').attr('dir') || 'ltr';
            
            // Filter the content smileys
            $(content).find('img.emoticon').each(function() {
                $(this).replaceWith($(this).attr('alt'));
            });
            
            // Remove the useless attributes
            $(content).removeAttr('data-type').removeAttr('data-stamp');
            
            // Remove the content avatars
            $(content).find('.avatar-container').remove();
            
            // Remove the content click events
            $(content).find('a').removeAttr('onclick');
            
            // Extract the content HTML code
            content = $(content).parent().html();
            
            // No avatar?
            if(!avatar || !avatar.match(/data:/))
                avatar = 'none';
            
            // POST the values to the server
            $.post('./php/generate-chat.php', { 'content': content, 'xid': xid, 'nick': nick, 'avatar': avatar, 'date': date, 'type': type, 'direction': direction }, function(data) {
                // Handled!
                $(path + 'tooltip-waitlog').replaceWith('<a class="tooltip-actionlog" href="./php/download-chat.php?id=' + data + '" target="_blank">' + _e("Download file!") + '</a>');
            });
        } catch(e) {
            Console.error('Interface.generateChatLog', e);
        } finally {
            return false;
        }

    };


	/**
     * Notifies the user from a new incoming message
     * @public
     * @param {string} hash
     * @param {string} type
     * @return {undefined}
     */
    self.messageNotify = function(hash, type) {

        try {
            // Initialize the vars
            var chat_switch = '#page-switch .';
            var tested = chat_switch + hash;
            var active = $(tested).hasClass('activechan');
            
            // We notify the user if he has not the focus on the chat
            if(!active || !isFocused() || (CHAT_FOCUS_HASH != hash)) {
                if(!active) {
                    if(type == 'personal')
                        $(tested + ', ' + chat_switch + 'more-button').addClass('chan-newmessage');
                    else if(type == 'unread')
                        $(tested).addClass('chan-unread');
                }
                
                // Count the number of pending messages
                var pending = 1;
                
                if(exists('#' + hash + '[data-counter]'))
                    pending = parseInt($('#' + hash).attr('data-counter')) + 1;
                
                $('#' + hash).attr('data-counter', pending);
            }
            
            // Update the page title
            updateTitle();
        } catch(e) {
            Console.error('Interface.messageNotify', e);
        }

    };


    /**
     * Returns the number of pending events
     * @public
     * @return {number}
     */
    self.pendingEvents = function() {

        try {
            // Count the number of notifications
            var number = 0;
            
            $('.one-counter[data-counter]').each(function() {
                number = number + parseInt($(this).attr('data-counter'));
            });
            
            return number;
        } catch(e) {
            Console.error('Interface.pendingEvents', e);
        }

    };


    /**
     * Updates the page title
     * @public
     * @return {undefined}
     */
    self.updateTitle = function() {

        try {
            // Any pending events?
            if(exists('.one-counter[data-counter]'))
                pageTitle('new');
            else
                pageTitle('talk');
        } catch(e) {
            Console.error('Interface.updateTitle', e);
        }

    };


    /**
     * Cleans the given chat notifications
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.chanCleanNotify = function(hash) {

        try {
            // We remove the class that tell the user of a new message
            var chat_switch = '#page-switch .';
            $(chat_switch + hash).removeClass('chan-newmessage chan-unread');
            
            // We reset the global notifications if no more unread messages
            if(!$(chat_switch + 'chans .chan-newmessage').size())
                $(chat_switch + 'more-button').removeClass('chan-newmessage');
            
            // We reset the chat counter
            $('#' + hash).removeAttr('data-counter');
            
            // Update the page title
            updateTitle();
        } catch(e) {
            Console.error('Interface.chanCleanNotify', e);
        }

    };


    /**
     * Scrolls to the last chat message
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.autoScroll = function() {

        try {
            // Avoid a JS error
            if(exists('#' + hash)) {
                var container = document.getElementById('chat-content-' + hash);
                
                // Scroll down!
                container.scrollTop = container.scrollHeight;
            }
        } catch(e) {
            Console.error('Interface.autoScroll', e);
        }

    };


	/**
     * Shows all the buddies in the buddy-list
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.showAllBuddies = function(from) {

        try {
            // Put a marker
            BLIST_ALL = true;
            
            // We switch the two modes
            $('.buddy-conf-more-display-unavailable').hide();
            $('.buddy-conf-more-display-available').show();
            
            // Security: reset all the groups toggle event
            $('#buddy-list .group-buddies').show();
            $('#buddy-list .group span').text('-');
            
            // We show the disconnected buddies
            $('.hidden-buddy').show();
            
            // We show all the groups
            $('#buddy-list .one-group').show();
            
            if(SEARCH_FILTERED)
                funnelFilterBuddySearch();
            
            // Store this in the options
            if((from == 'roster') && loadedOptions()) {
                setDB(DESKTOP_HASH, 'options', 'roster-showall', '1');
                storeOptions();
            }
        } catch(e) {
            Console.error('Interface.showAllBuddies', e);
        }

    };


    /**
     * Shows only the online buddies in the buddy-list
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.showOnlineBuddies = function(from) {

        try {
            // Remove the marker
            BLIST_ALL = false;
            
            // We switch the two modes
            $('.buddy-conf-more-display-available').hide();
            $('.buddy-conf-more-display-unavailable').show();
            
            // Security: reset all the groups toggle event
            $('#buddy-list .group-buddies').show();
            $('#buddy-list .group span').text('-');
            
            // We hide the disconnected buddies
            $('.hidden-buddy').hide();
            
            // We check the groups to hide
            updateGroups();
            
            if(SEARCH_FILTERED)
                funnelFilterBuddySearch();
            
            // Store this in the options
            if((from == 'roster') && loadedOptions()) {
                setDB(DESKTOP_HASH, 'options', 'roster-showall', '0');
                storeOptions();
            }
        } catch(e) {
            Console.error('Interface.showOnlineBuddies', e);
        }

    };


    /**
     * Focuses on the right input
     * @public
     * @return {undefined}
     */
    self.inputFocus = function() {

        try {
            // No popup shown
            if(!exists('.popup')) {
                $(document).oneTime(10, function() {
                    $('.focusable:visible:first').focus();
                });
            }
        } catch(e) {
            Console.error('Interface.inputFocus', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            $(document).ready(function() {
                // Focus on the first visible input
                $(window).focus(inputFocus);
            });
        } catch(e) {
            Console.error('Interface.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

// Launch this plugin!
$(document).ready(launchInterface);
