/*

Jappix - An open social platform
These are the notification JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Notification = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Resets the notifications alert if no one remaining
     * @public
     * @return {undefined}
     */
    self.closeEmpty = function() {

        try {
            if(!$('.one-notification').size()) {
                Bubble.close();
            }
        } catch(e) {
            Console.error('Notification.closeEmpty', e);
        }

    };


    /**
     * Checks if there are pending notifications
     * @public
     * @return {undefined}
     */
    self.check = function() {

        try {
            // Define the selectors
            var notif = '#top-content .notifications';
            var nothing = '.notifications-content .nothing';
            var empty = '.notifications-content .empty';

            // Get the notifications number
            var number = $('.one-notification').size();

            // Remove the red notify bubble
            $(notif + ' .notify').remove();

            // Any notification?
            if(number) {
                $(notif).prepend('<div class="notify one-counter" data-counter="' + number + '">' + number + '</div>');
                $(nothing).hide();
                $(empty).show();
            } else {
                $(empty).hide();
                $(nothing).show();

                // Purge the social inbox node
                self.purge();
            }

            // Update the page title
            Interface.updateTitle();
        } catch(e) {
            Console.error('Notification.check', e);
        }

    };


    /**
     * Creates a new notification
     * @public
     * @param {string} type
     * @param {string} from
     * @param {string} data
     * @param {string} body
     * @param {string} id
     * @param {boolean} inverse
     * @return {undefined}
     */
    self.create = function(type, from, data, body, id, inverse) {

        try {
            if(!type || !from) {
                return;
            }

            // Generate an ID hash
            if(!id) {
                id = hex_md5(type + from);
            }

            // Generate the text to be displayed
            var text, action, code;
            var yes_path = 'href="#"';

            // User things
            from = Common.bareXID(from);
            var hash = hex_md5(from);

            switch(type) {
                case 'subscribe':
                    // Get the name to display
                    var display_name = data[1];

                    if(!display_name)
                        display_name = data[0];

                    text = '<b>' + display_name.htmlEnc() + '</b> ' + Common._e("would like to add you as a friend.") + ' ' + Common._e("Do you accept?");

                    break;

                case 'invite_room':
                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common._e("would like you to join this chatroom:") + ' <em>' + data[0].htmlEnc() + '</em> ' + Common._e("Do you accept?");

                    break;

                case 'request':
                    text = '<b>' + from.htmlEnc() + '</b> ' + Common._e("would like to get authorization.") + ' ' + Common._e("Do you accept?");

                    break;

                case 'send':
                    yes_path = 'href="' + Common.encodeQuotes(data[1]) + '" target="_blank"';

                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common.printf(Common._e("would like to send you a file: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>') + ' ' + Common._e("Do you accept?");

                    break;

                case 'send_pending':
                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common.printf(Common._e("has received a file exchange request: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'send_accept':
                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common.printf(Common._e("has accepted to receive your file: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'send_reject':
                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common.printf(Common._e("has rejected to receive your file: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'send_fail':
                    text = '<b>' + Name.getBuddy(from).htmlEnc() + '</b> ' + Common.printf(Common._e("could not receive your file: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'rosterx':
                    text = Common.printf(Common._e("Do you want to see the friends %s suggests you?").htmlEnc(), '<b>' + Name.getBuddy(from).htmlEnc() + '</b>');

                    break;

                case 'comment':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("commented an item you follow: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'like':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("liked your post: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'quote':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("quoted you somewhere: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'wall':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("published on your wall: “%s”.").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'photo':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("tagged you in a photo (%s).").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'video':
                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common.printf(Common._e("tagged you in a video (%s).").htmlEnc(), '<em>' + Utils.truncate(body, 25).htmlEnc() + '</em>');

                    break;

                case 'me_profile_new_success':
                    yes_path = 'href="' + Common.encodeQuotes(data[1]) + '" target="_blank"';

                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common._e("validated your account. Your public profile will be available in a few moments.").htmlEnc();

                    break;

                case 'me_profile_remove_success':
                    yes_path = 'href="' + Common.encodeQuotes(data[1]) + '" target="_blank"';

                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common._e("has removed your public profile after your request. We will miss you!").htmlEnc();

                    break;

                case 'me_profile_update_success':
                    yes_path = 'href="' + Common.encodeQuotes(data[1]) + '" target="_blank"';

                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common._e("has saved your new public profile settings. They will be applied in a few moments.").htmlEnc();

                    break;

                case 'me_profile_check_error':
                    yes_path = 'href="' + Common.encodeQuotes(data[1]) + '" target="_blank"';

                    text = '<b>' + data[0].htmlEnc() + '</b> ' + Common._e("could not validate your account to create or update your public profile. Check your credentials.").htmlEnc();

                    break;

                default:
                    break;
            }

            // No text?
            if(!text) {
                return;
            }

            // Action links?
            switch(type) {
                // Hide/Show actions
                case 'send_pending':
                case 'send_accept':
                case 'send_reject':
                case 'send_fail':
                case 'comment':
                case 'like':
                case 'quote':
                case 'wall':
                case 'photo':
                case 'video':
                    action = '<a href="#" class="no">' + Common._e("Hide") + '</a>';

                    // Any parent link?
                    if((type == 'comment') && data[2]) {
                        action = '<a href="#" class="yes">' + Common._e("Show") + '</a>' + action;
                    }

                    break;

                // Jappix Me actions
                case 'me_profile_new_success':
                case 'me_profile_remove_success':
                case 'me_profile_update_success':
                case 'me_profile_check_error':
                    action = '<a ' + yes_path + ' class="yes">' + Common._e("Open") + '</a><a href="#" class="no">' + Common._e("Hide") + '</a>';

                    break;

                // Default actions
                default:
                    action = '<a ' + yes_path + ' class="yes">' + Common._e("Yes") + '</a><a href="#" class="no">' + Common._e("No") + '</a>';
            }

            if(text) {
                // We display the notification
                if(!Common.exists('.notifications-content .' + id)) {
                    // We create the html markup depending of the notification type
                    code = '<div class="one-notification ' + id + ' ' + hash + '" title="' + Common.encodeQuotes(body) + ' - ' + Common._e("This notification is only informative, maybe the data it links to have been removed.") + '" data-type="' + Common.encodeQuotes(type) + '">' +
                            '<div class="avatar-container">' +
                                '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                            '</div>' +

                            '<p class="notification-text">' + text + '</p>' +
                            '<p class="notification-actions">' +
                                '<span class="talk-images" />' +
                                action +
                            '</p>' +
                           '</div>';

                    // Add the HTML code
                    if(inverse) {
                        $('.notifications-content .nothing').before(code);
                    } else {
                        $('.notifications-content .empty').after(code);
                    }

                    // Play a sound to alert the user
                    Audio.play('notification');

                    // The yes click function
                    $('.' + id + ' a.yes').click(function() {
                        self.action(type, data, 'yes', id);

                        if(($(this).attr('href') == '#') && ($(this).attr('target') != '_blank')) {
                            return false;
                        }
                    });

                    // The no click function
                    $('.' + id + ' a.no').click(function() {
                        return self.action(type, data, 'no', id);
                    });

                    // Get the user avatar
                    Avatar.get(from, 'cache', 'true', 'forget');
                }
            }

            // We tell the user he has a new pending notification
            self.check();

            Console.info('New notification: ' + from);
        } catch(e) {
            Console.error('Notification.new', e);
        }

    };


    /**
     * Performs an action on a given notification
     * @public
     * @param {string} type
     * @param {string} data
     * @param {string} value
     * @param {string} id
     * @return {boolean}
     */
    self.action = function(type, data, value, id) {

        try {
            // We launch a function depending of the type
            if((type == 'subscribe') && (value == 'yes')) {
                Presence.acceptSubscribe(data[0], data[1]);
            } else if((type == 'subscribe') && (value == 'no')) {
                Presence.sendSubscribe(data[0], 'unsubscribed');
            } else if((type == 'invite_room') && (value == 'yes')) {
                Chat.checkCreate(data[0], 'groupchat');
            } else if(type == 'request') {
                HTTPReply.go(value, data[0]);
            }

            if((type == 'send') && (value == 'yes')) {
                OOB.reply(data[0], data[3], 'accept', data[2], data[4]);
            } else if((type == 'send') && (value == 'no')) {
                OOB.reply(data[0], data[3], 'reject', data[2], data[4]);
            } else if((type == 'rosterx') && (value == 'yes')) {
                RosterX.open(data[0]);
            } else if((type == 'comment') || (type == 'like') || (type == 'quote') || (type == 'wall') || (type == 'photo') || (type == 'video')) {
                if(value == 'yes') {
                    // Get the microblog item
                    Microblog.fromInfos(data[2]);

                    // Append the marker
                    $('#channel .top.individual').append('<input type="hidden" name="comments" value="' + Common.encodeQuotes(data[1]) + '" />');
                }

                self.remove(data[3]);
            }

            // We remove the notification
            $('.notifications-content .' + id).remove();

            // We check if there's any other pending notification
            self.closeEmpty();
            self.check();
        } catch(e) {
            Console.error('Notification.action', e);
        } finally {
            return false;
        }

    };


    /**
     * Clear the social notifications
     * @public
     * @return {undefined}
     */
    self.clear = function() {

        try {
            // Remove notifications
            $('.one-notification').remove();

            // Refresh
            self.closeEmpty();
            self.check();
        } catch(e) {
            Console.error('Notification.clear', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets the pending social notifications
     * @public
     * @return {undefined}
     */
    self.get = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');

            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            pubsub.appendChild(iq.buildNode('items', {'node': NS_URN_INBOX, 'xmlns': NS_PUBSUB}));

            con.send(iq, self.handle);

            Console.log('Getting social notifications...');
        } catch(e) {
            Console.error('Notification.get', e);
        }

    };


    /**
     * Handles the social notifications
     * @public
     * @param {object} stanza
     * @return {undefined}
     */
    self.handle = function(stanza) {

        try {
            // Any error?
            if((stanza.getType() == 'error') && $(stanza.getNode()).find('item-not-found').size()) {
                // The node may not exist, create it!
                Pubsub.setup('', NS_URN_INBOX, '1', '1000000', 'whitelist', 'open', true);

                Console.warn('Error while getting social notifications, trying to reconfigure the Pubsub node!');
            }

            // Selector
            var items = $(stanza.getNode()).find('item');

            // Should we inverse?
            var inverse = true;

            if(items.size() == 1) {
                inverse = false;
            }

            // Parse notifications
            items.each(function() {
                var this_sel = $(this);

                // Parse the current item
                var current_item = this_sel.attr('id');
                var current_type = this_sel.find('link[rel="via"]:first').attr('title');
                var current_href = this_sel.find('link[rel="via"]:first').attr('href');
                var current_parent_href = this_sel.find('link[rel="related"]:first').attr('href');
                var current_xid = Common.explodeThis(':', this_sel.find('author uri').text(), 1);
                var current_name = this_sel.find('author name').text();
                var current_text = this_sel.find('content[type="text"]:first').text();
                var current_bname = Name.getBuddy(current_xid);
                var current_id = hex_md5(current_type + current_xid + current_href + current_text);

                // Choose the good name!
                if(!current_name || (current_bname != Common.getXIDNick(current_xid))) {
                    current_name = current_bname;
                }

                // Create it!
                self.create(current_type, current_xid, [current_name, current_href, current_parent_href, current_item], current_text, current_id, inverse);
            });

            Console.info(items.size() + ' social notification(s) got!');
        } catch(e) {
            Console.error('Notification.handle', e);
        }

    };


    /**
     * Sends a social notification
     * @public
     * @param {string} xid
     * @param {string} type
     * @param {string} href
     * @param {string} text
     * @param {object} parent
     * @return {undefined}
     */
    self.send = function(xid, type, href, text, parent) {

        try {
            // Notification ID
            var id = hex_md5(xid + text + DateUtils.getTimeStamp());

            // IQ
            var iq = new JSJaCIQ();
            iq.setType('set');
            iq.setTo(xid);

            // ATOM content
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_URN_INBOX, 'xmlns': NS_PUBSUB}));
            var item = publish.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));
            var entry = item.appendChild(iq.buildNode('entry', {'xmlns': NS_ATOM}));

            // Notification author (us)
            var author = entry.appendChild(iq.buildNode('author', {'xmlns': NS_ATOM}));
            author.appendChild(iq.buildNode('name', {'xmlns': NS_ATOM}, Name.get()));
            author.appendChild(iq.buildNode('uri', {'xmlns': NS_ATOM}, 'xmpp:' + Common.getXID()));

            // Notification content
            entry.appendChild(iq.buildNode('published', {'xmlns': NS_ATOM}, DateUtils.getXMPPTime('utc')));
            entry.appendChild(iq.buildNode('content', {'type': 'text', 'xmlns': NS_ATOM}, text));
            entry.appendChild(iq.buildNode('link', {'rel': 'via', 'title': type, 'href': href, 'xmlns': NS_ATOM}));

            // Any parent item?
            if(parent && parent[0] && parent[1] && parent[2]) {
                // Generate the parent XMPP URI
                var parent_href = 'xmpp:' + parent[0] + '?;node=' + encodeURIComponent(parent[1]) + ';item=' + encodeURIComponent(parent[2]);

                entry.appendChild(iq.buildNode('link', {'rel': 'related', 'href': parent_href, 'xmlns': NS_ATOM}));
            }

            con.send(iq);

            Console.log('Sending a social notification to ' + xid + ' (type: ' + type + ')...');
        } catch(e) {
            Console.error('Notification.send', e);
        }

    };


    /**
     * Removes a social notification
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.remove = function(id) {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var retract = pubsub.appendChild(iq.buildNode('retract', {'node': NS_URN_INBOX, 'xmlns': NS_PUBSUB}));
            retract.appendChild(iq.buildNode('item', {'id': id, 'xmlns': NS_PUBSUB}));

            con.send(iq);
        } catch(e) {
            Console.error('Notification.remove', e);
        }

    };


    /**
     * Purge the social notifications
     * @public
     * @param {type} name
     * @return {boolean}
     */
    self.purge = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
            pubsub.appendChild(iq.buildNode('purge', {'node': NS_URN_INBOX, 'xmlns': NS_PUBSUB_OWNER}));

            con.send(iq);
        } catch(e) {
            Console.error('Notification.purge', e);
        } finally {
            return false;
        }

    };


    /**
     * Adapt the notifications bubble max-height
     * @public
     * @return {undefined}
     */
    self.adapt = function() {

        try {
            // Process the new height
            var max_height = $('#right-content').height() - 22;

            // New height too small
            if(max_height < 250) {
                max_height = 250;
            }

            // Apply the new height
            $('.notifications-content .tools-content-subitem').css('max-height', max_height);
        } catch(e) {
            Console.error('Notification.adapt', e);
        }

    };


    /**
     * Plugin instance launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Adapt the notifications height
            self.adapt();
        } catch(e) {
            Console.error('Notification.instance', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            // Adapt the notifications height
            $(window).resize(self.adapt);
        } catch(e) {
            Console.error('Notification.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Notification.launch();