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
    self.chat_focus_hash = null;


    /**
     * Changes the title of the document
     * @public
     * @param {string} new_title
     * @return {undefined}
     */
    self.title = function(title_type) {

        try {
            // Anonymous mode?
            var head_name = Name.get();

            if(Utils.isAnonymous()) {
                head_name = ANONYMOUS_ROOM + ' (' + Common._e("anonymous mode") + ')';
            }

            // We change the title to give essential informations
            switch(title_type) {
                case 'home':
                    document.title = SERVICE_NAME + ' • ' + SERVICE_DESC;
                    break;

                case 'talk':
                    document.title = SERVICE_NAME + ' • ' + head_name;
                    break;

                case 'new':
                    document.title = '[' + self.pendingEvents() + '] ' + SERVICE_NAME + ' • ' + head_name;
                    break;

                case 'wait':
                    document.title = SERVICE_NAME + ' • ' + Common._e("Please wait...");
                    break;
            }
        } catch(e) {
            Console.error('Interface.title', e);
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
            if(Common.exists('#general-wait')) {
                return false;
            }

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
            return  '<input type="hidden" name="MAX_FILE_SIZE" value="' + Common.encodeQuotes(JAPPIX_MAX_FILE_SIZE) + '">' +
                    '<input type="hidden" name="user" value="' + Common.encodeQuotes(Common.getXID()) + '" />' +
                    '<input type="hidden" name="location" value="' + Common.encodeQuotes(Utils.generateURL(JAPPIX_LOCATION)) + '" />' +
                    '<input type="hidden" name="id" value="' + (new Date()).getTime() + '" />' +
                    '<input type="file" name="file" required="" />' +
                    '<input type="submit" value="' + Common._e("Send") + '" />';
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
            if(Common.exists('#' + id)) {
                // We show the page-engine content
                $('.page-engine-chan').hide();
                $('#' + id).show();

                // We edit the tab switcher
                $('#page-switch .switcher').removeClass('activechan').addClass('chan');
                $('#page-switch .' + id).addClass('activechan').removeClass('chan');

                // Scroll down to the last message
                if(id != 'channel') {
                    self.autoScroll(id);
                }

                // Manage input focus
                self.inputFocus();
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
            if(Common.exists(more_content)) {
                return Bubble.close();
            }

            // Add the bubble
            Bubble.show(more_content);

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
     * Loads the groupchat joiner
     * @public
     * @return {undefined}
     */
    self.loadJoinGroupchat = function() {

        try {
            // Path
            var join_content = '#page-switch .join-content';
            var join_sel = $('#page-switch .join');

            // Yet displayed?
            if(Common.exists(join_content))
                return Bubble.close();

            // Add the bubble
            Bubble.show(join_content);

            // Append the content
            join_sel.append(
                '<div class="join-content bubble removable">' +
                    '<input type="text" class="join-groupchat-xid" required="" placeholder="' + Common._e("Groupchat name") + '" />' +
                '</div>'
            );

            var input_sel = join_sel.find('input.join-groupchat-xid');

            input_sel.keyup(function(e) {
                // Enter: continue
                if(e.keyCode == 13) {
                    var this_sel = $(this);
                    var xid = $.trim(this_sel.val());

                    if(xid) {
                        // Generate a correct XID
                        xid = Common.generateXID(xid, 'groupchat');

                        Bubble.close();
                        Chat.checkCreate(xid, 'groupchat');
                    } else {
                        this_sel.addClass('please-complete');
                    }

                    return false;
                }
            });

            $(document).oneTime(10, function() {
                input_sel.focus();
            });
        } catch(e) {
            Console.error('Interface.loadJoinGroupchat', e);
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
            if(oValue && !oValue.match(/^(.+)(\s)+$/)) {
                oValue += ' ';
            }

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
                Presence.send(xid + '/' + Name.getMUCNick(hash), 'unavailable');

                // Remove all presence database entries for this groupchat
                var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'presence' + ('_(.+)'));

                for(var i = 0; i < DataStore.storageDB.length; i++) {
                    // Get the pointer values
                    var current = DataStore.storageDB.key(i);

                    if(current.match(db_regex)) {
                        var cXID = RegExp.$1;

                        // If the pointer is on a presence from this groupchat
                        if(Common.bareXID(cXID) == xid) {
                            // Generate the hash for the current XID
                            var cHash = hex_md5(cXID);

                            // Disable the message textarea
                            $('#' + cHash + ' .message-area').attr('disabled', true);

                            // Remove the presence for this XID
                            DataStore.removeDB(Connection.desktop_hash, 'presence-stanza', cXID);
                            DataStore.removeDB(Connection.desktop_hash, 'presence-resources', cXID);
                            Presence.funnel(cXID, cHash);
                        }
                    }
                }
            } else {
                ChatState.send('gone', xid, hash);
            }

            // Clear MAM storage for this chat
            if(xid in MAM.map_states) {
                delete MAM.map_states[xid];
            }

            // Get the chat ID which is before
            var previous = $('#' + hash).prev().attr('id');

            // Remove the chat
            self.deleteThisChat(hash);

            // Reset the switcher
            if(!Common.exists('#page-switch .switcher.activechan')) {
                self.switchChan(previous);
            }

            // Reset the notifications
            self.chanCleanNotify(hash);
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
            var date = DateUtils.getXMPPTime('local');
            var type = $('#' + hash).attr('data-type');
            var direction = $('html').attr('dir') || 'ltr';

            var content_sel = $(content);

            // Filter the content smileys
            content_sel.find('img.emoticon').each(function() {
                $(this).replaceWith($(this).attr('alt'));
            });

            // Remove the useless attributes
            content_sel.removeAttr('data-type').removeAttr('data-stamp');

            // Remove the content avatars
            content_sel.find('.avatar-container').remove();

            // Remove the content info
            content_sel.find('.correction-edit, .message-marker, .corrected-info, .correction-label').remove();

            // Remove the content click events
            content_sel.find('a').removeAttr('onclick');

            // Extract the content HTML code
            content = content_sel.parent().html();

            // No avatar?
            if(!avatar || !avatar.match(/data:/)) {
                avatar = 'none';
            }

            // POST the values to the server
            $.post('./server/generate-chat.php', {
                'content': content,
                'xid': xid,
                'nick': nick,
                'avatar': avatar,
                'date': date,
                'type': type,
                'direction': direction
            }, function(data) {
                // Handled!
                $(path + 'tooltip-waitlog').replaceWith(
                    '<a class="tooltip-actionlog" href="./server/download-chat.php?id=' + data + '" target="_blank">' + Common._e("Download file!") + '</a>'
                );
            });
        } catch(e) {
            Console.error('Interface.generateChatLog', e);
        } finally {
            return false;
        }

    };


    /**
     * Returns whether chan has focus or not
     * @public
     * @param {string} hash
     * @return {boolean}
     */
    self.hasChanFocus = function(hash) {

        var has_focus = true;

        try {
            if(!$('#page-switch .' + hash).hasClass('activechan')  ||
                !Common.isFocused()                                ||
                (self.chat_focus_hash != hash)) {
                has_focus = false;
            }
        } catch(e) {
            Console.error('Interface.hasChanFocus', e);
        } finally {
            return has_focus;
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
            if(self.hasChanFocus(hash) === false) {
                if(!active) {
                    if(type == 'personal') {
                        $(tested + ', ' + chat_switch + 'more-button').addClass('chan-newmessage');
                    } else if(type == 'unread') {
                        $(tested).addClass('chan-unread');
                    }
                }

                // Count the number of pending messages
                var pending = 1;

                if(Common.exists('#' + hash + '[data-counter]')) {
                    pending = parseInt($('#' + hash).attr('data-counter')) + 1;
                }

                $('#' + hash).attr('data-counter', pending);
            }

            // Update the page title
            self.updateTitle();
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
            if(Common.exists('.one-counter[data-counter]')) {
                self.title('new');
            } else {
                self.title('talk');
            }
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
            if(!$(chat_switch + 'chans .chan-newmessage').size()) {
                $(chat_switch + 'more-button').removeClass('chan-newmessage');
            }

            // We reset the chat counter
            $('#' + hash).removeAttr('data-counter');

            // Update the page title
            self.updateTitle();
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
    self.autoScroll = function(hash) {

        try {
            // Avoid a JS error
            if(Common.exists('#' + hash)) {
                var container = document.getElementById('chat-content-' + hash);

                // Scroll down!
                container.scrollTop = container.scrollHeight;
            }
        } catch(e) {
            Console.error('Interface.autoScroll', e);
        }

    };


    /**
     * Shows all the buddies in the roster
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.showAllBuddies = function(from) {

        try {
            // Put a marker
            Roster.blist_all = true;

            // We switch the two modes
            $('.buddy-conf-more-display-unavailable').hide();
            $('.buddy-conf-more-display-available').show();

            // Security: reset all the groups toggle event
            $('#roster .group-buddies').show();
            $('#roster .group span').text('-');

            // We show the disconnected buddies
            $('.hidden-buddy').show();

            // We show all the groups
            $('#roster .one-group').show();

            if(Search.search_filtered) {
                Search.funnelFilterBuddy();
            }

            // Store this in the options
            if((from == 'roster') && Options.loaded()) {
                DataStore.setDB(Connection.desktop_hash, 'options', 'roster-showall', '1');
                Options.store();
            }
        } catch(e) {
            Console.error('Interface.showAllBuddies', e);
        }

    };


    /**
     * Shows only the online buddies in the roster
     * @public
     * @param {string} from
     * @return {undefined}
     */
    self.showOnlineBuddies = function(from) {

        try {
            // Remove the marker
            Roster.blist_all = false;

            // We switch the two modes
            $('.buddy-conf-more-display-available').hide();
            $('.buddy-conf-more-display-unavailable').show();

            // Security: reset all the groups toggle event
            $('#roster .group-buddies').show();
            $('#roster .group span').text('-');

            // We hide the disconnected buddies
            $('.hidden-buddy').hide();

            // We check the groups to hide
            Roster.updateGroups();

            if(Search.search_filtered) {
                Search.funnelFilterBuddy();
            }

            // Store this in the options
            if((from == 'roster') && Options.loaded()) {
                DataStore.setDB(Connection.desktop_hash, 'options', 'roster-showall', '0');
                Options.store();
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
            if(!Common.exists('.popup')) {
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
                $(window).focus(self.inputFocus);

                // Re-focus to visible chat/groupchat input if typing when input blurred
                $(document).keypress(function(evt) {
                    try {
                        // Don't trigger if not connected or popup opened
                        if(Common.isConnected() && !Common.exists('div.lock')) {
                            // Cannot work if an input/textarea is already focused or chat is not opened
                            var target_input_sel = $('.page-engine-chan .message-area:visible');

                            if(!target_input_sel.size() || $('input, textarea').is(':focus')) {
                                return;
                            }

                            // Get key value
                            var key_value = $.trim(String.fromCharCode(evt.which));

                            // Re-focus on opened chat?
                            if(key_value) {
                                // Get input values
                                value_input = target_input_sel.val();

                                // Append pressed key value
                                target_input_sel.val(value_input + key_value);
                                target_input_sel.focus();

                                // Put cursor at the end of input
                                target_input_sel[0].selectionStart = target_input_sel[0].selectionEnd = value_input.length + 1;
                            }
                        }
                    } catch(e) {
                        Console.error('Interface.launch[autofocus]', e);
                    }
                });
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

Interface.launch();