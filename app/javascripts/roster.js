/*

Jappix - An open social platform
These are the roster JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Roster = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.blist_all = false;


    /**
     * Gets the roster items
     * @public
     * @return {undefined}
     */
    self.get = function() {

        try {
            var iq = new JSJaCIQ();

            iq.setType('get');
            iq.setQuery(NS_ROSTER);

            con.send(iq, self.handle);
        } catch(e) {
            Console.error('Roster.get', e);
        }

    };


    /**
     * Handles the roster items
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handle = function(iq) {

        try {
            // Parse the roster xml
            $(iq.getQuery()).find('item').each(function() {
                // Get user data
                var this_sel = $(this);
                var user_xid = this_sel.attr('jid');
                var user_subscription = this_sel.attr('subscription');

                // Parse roster data & display user
                self.parse(this_sel, 'load');

                // Request user microblog (populates channel)
                if(user_xid && ((user_subscription == 'both') || (user_subscription == 'to'))) {
                    // Openfire has an issue, forget about it!
                    if(Features.getServerName() != 'openfire') {
                        Microblog.request(user_xid, 1, null, Microblog.handleRoster);
                    }
                }
            });

            // Update our avatar (if changed), and send our presence
            Avatar.get(Common.getXID(), 'force', 'true', 'forget');

            Console.log('Roster received.');
        } catch(e) {
            Console.error('Roster.handle', e);
        }

    };


    /**
     * Parses the group XML and display the roster
     * @public
     * @param {string} current
     * @param {string} mode
     * @return {undefined}
     */
    self.parse = function(current, mode) {

        try {
            // Get the values
            xid = current.attr('jid');
            dName = current.attr('name');
            subscription = current.attr('subscription');
            xidHash = hex_md5(xid);

            // Create an array containing the groups
            var groups = [];

            current.find('group').each(function() {
                var group_text = $(this).text();

                if(group_text) {
                    groups.push(group_text);
                }
            });

            // No group?
            if(!groups.length) {
                groups.push(Common._e("Unclassified"));
            }

            // If no name is defined, we get the default nick of the buddy
            if(!dName) {
                dName = Common.getXIDNick(xid);
            }

            self.display(xid, xidHash, dName, subscription, groups, mode);
        } catch(e) {
            Console.error('Roster.parse', e);
        }

    };


    /**
     * Updates the roster groups
     * @public
     * @return {undefined}
     */
    self.updateGroups = function() {

        try {
            $('#roster .one-group').each(function() {
                var this_sel = $(this);

                // Current values
                var check = this_sel.find('.buddy').size();
                var hidden = this_sel.find('.buddy:not(.hidden-buddy:hidden)').size();

                // Special case: the filtering tool
                if(Search.search_filtered) {
                    hidden = this_sel.find('.buddy:visible').size();
                }

                // If the group is empty
                if(!check) {
                    this_sel.remove();
                }

                // If the group contains no online buddy (and is not just hidden)
                if(!hidden && this_sel.find('a.group').hasClass('minus')) {
                    this_sel.hide();
                } else {
                    this_sel.show();
                }
            });
        } catch(e) {
            Console.error('Roster.updateGroups', e);
        }

    };


    /**
     * Displays a defined roster item
     * @public
     * @param {string} dXID
     * @param {string} dXIDHash
     * @param {string} dName
     * @param {string} dSubscription
     * @param {string} dGroup
     * @param {string} dMode
     * @return {undefined}
     */
    self.display = function(dXID, dXIDHash, dName, dSubscription, dGroup, dMode) {

        try {
            // First remove the buddy
            $('#roster .' + dXIDHash).remove();

            // Define some things around the groups
            var is_gateway = Common.isGateway(dXID);
            var gateway = '';

            if(is_gateway) {
                gateway = ' gateway';
                dGroup = new Array(Common._e("Gateways"));
            }

            // Remove request
            if(dSubscription == 'remove') {
                // Flush presence
                Presence.flush(dXID);
                Presence.funnel(dXID, dXIDHash);

                // Empty social channel
                $('#channel .mixed .one-update.update_' + dXIDHash).remove();
            }

            // Other request
            else {
                // Is this buddy blocked?
                var privacy_class = '';
                var privacy_state = Privacy.status('block', dXID);

                if(privacy_state == 'deny') {
                    privacy_class = ' blocked';
                }

                // For each group this buddy has
                $.each(dGroup, function(i, cGroup) {
                    if(cGroup) {
                        // Process some vars
                        var groupHash = 'group' + hex_md5(cGroup);
                        var groupContent = '#roster .' + groupHash;
                        var groupBuddies = groupContent + ' .group-buddies';

                        // Is this group blocked?
                        if((Privacy.status('block', cGroup) == 'deny') && (privacy_state != 'allow')) {
                            privacy_class = ' blocked';
                        }

                        // Group not yet displayed
                        if(!Common.exists(groupContent)) {
                            // Define some things
                            var groupCont = '#roster .content';
                            var groupToggle = groupCont + ' .' + groupHash + ' a.group';

                            // Create the HTML markup of the group
                            $(groupCont).prepend(
                                '<div class="' + groupHash + ' one-group" data-group="' + escape(cGroup) + '">' +
                                    '<a href="#" class="group talk-images minus">' + cGroup.htmlEnc() + '</a>' +
                                    '<div class="group-buddies"></div>' +
                                '</div>'
                            );

                            // Create the click event which will hide and show the content
                            $(groupToggle).click(function() {
                                var group = $(groupBuddies);
                                var group_toggle = $(groupContent + ' a.group');

                                // We must hide the buddies
                                if(group_toggle.hasClass('minus')) {
                                    group.hide();
                                    group_toggle.removeClass('minus').addClass('plus');

                                    // Remove the group opened buddy-info
                                    Bubble.close();
                                }

                                // We must show the buddies
                                else {
                                    group_toggle.removeClass('plus').addClass('minus');
                                    group.show();
                                }

                                return false;
                            });
                        }

                        // Initialize the HTML code
                        var name_code = '<p class="buddy-name">' + dName.htmlEnc() + '</p>';
                        var presence_code = '<p class="buddy-presence talk-images unavailable">' + Common._e("Unavailable") + '</p>';

                        var html = '<div class="hidden-buddy buddy ibubble ' + dXIDHash + gateway + privacy_class + '" data-xid="' + escape(dXID) + '">' +
                                '<div class="buddy-click">';

                        // Display avatar if not gateway
                        if(!is_gateway) {
                            html += '<div class="avatar-container">' +
                                    '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                                '</div>';
                        }

                        html += '<div class="name">';

                        // Special gateway code
                        if(is_gateway) {
                            html += presence_code +
                                name_code;
                        } else {
                            html += name_code +
                                presence_code;
                        }

                        html += '</div></div></div>';

                        // Create the DOM element for this buddy
                        $(groupBuddies).append(html);

                        // Apply the hover event
                        self.applyBuddyHover(dXID, dXIDHash, dName, dSubscription, dGroup, groupHash);
                    }
                });

                // Click event on this buddy
                $('#roster .' + dXIDHash + ' .buddy-click').click(function() {
                    return Chat.checkCreate(dXID, 'chat');
                });

                // We get the user presence if necessary
                if(dMode == 'presence') {
                    Presence.funnel(dXID, dXIDHash);
                }

                // If the buddy must be shown
                if(self.blist_all) {
                    $('#roster .' + dXIDHash).show();
                }
            }

            // We update our groups
            if(!Search.search_filtered) {
                self.updateGroups();
            } else {
                Search.funnelFilterBuddy();
            }
        } catch(e) {
            Console.error('Roster.display', e);
        }

    };


    /**
     * Applies the buddy editing input events
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.applyBuddyInput = function(xid) {

        try {
            // Initialize
            var path = '#roster .buddy[data-xid="' + escape(xid) + '"]';
            var rename = path + ' .bm-rename input';
            var group = path + ' .bm-group input';
            var manage_infos = path + ' .manage-infos';
            var bm_choose = manage_infos + ' div.bm-choose';

            // Keyup events
            $(rename).keyup(function(e) {
                if(e.keyCode == 13) {
                    // Send the item
                    self.send(xid, '', $.trim($(rename).val()), self.thisBuddyGroups(xid));

                    // Remove the buddy editor
                    Bubble.close();

                    return false;
                }
            });

            $(group).keyup(function(e) {
                if(e.keyCode == 13) {
                    // Empty input?
                    if(!$.trim($(this).val())) {
                        // Send the item
                        self.send(xid, '', $.trim($(rename).val()), self.thisBuddyGroups(xid));

                        // Remove the buddy editor
                        Bubble.close();

                        return false;
                    }

                    // Get the values
                    var this_value = $.trim($(this).val());
                    var escaped_value = escape(this_value);

                    // Check if the group yet exists
                    var group_exists = false;

                    $(bm_choose + ' label span').each(function() {
                        if($(this).text() == this_value)
                            group_exists = true;
                    });

                    // Create a new checked checkbox
                    if(!group_exists) {
                        $(bm_choose).prepend('<label><input type="checkbox" data-group="' + escaped_value + '" /><span>' + this_value.htmlEnc() + '</span></label>');
                    }

                    // Check the checkbox
                    $(bm_choose + ' input[data-group="' + escaped_value + '"]').attr('checked', true);

                    // Reset the value of this input
                    $(this).val('');

                    return false;
                }
            });

            // Click events
            $(manage_infos + ' p.bm-authorize a.to').click(function() {
                Bubble.close();
                Presence.sendSubscribe(xid, 'subscribed');

                return false;
            });

            $(manage_infos + ' p.bm-authorize a.from').click(function() {
                Bubble.close();
                Presence.sendSubscribe(xid, 'subscribe');

                return false;
            });

            $(manage_infos + ' p.bm-authorize a.unblock').click(function() {
                Bubble.close();

                // Update privacy settings
                Privacy.push('block', ['jid'], [xid], ['allow'], [false], [true], [true], [true], '', 'roster');
                $(path).removeClass('blocked');

                // Enable the "block" list
                Privacy.change('block', 'active');
                Privacy.change('block', 'default');

                // Send an available presence
                Presence.send(xid, 'available', Presence.getUserShow(), getUserStatus());

                return false;
            });

            $(manage_infos + ' p.bm-remove a.remove').click(function() {
                Bubble.close();

                // First unregister if gateway
                if(Common.isGateway(xid)) {
                    self.unregisterGateway(xid);
                }

                // Then send roster removal query
                self.send(xid, 'remove');

                return false;
            });

            $(manage_infos + ' p.bm-remove a.prohibit').click(function() {
                Bubble.close();
                Presence.sendSubscribe(xid, 'unsubscribed');

                return false;
            });

            $(manage_infos + ' p.bm-remove a.block').click(function() {
                Bubble.close();

                // Update privacy settings
                Privacy.push('block', ['jid'], [xid], ['deny'], [false], [true], [true], [true], '', 'roster');
                $(path).addClass('blocked');

                // Enable the "block" list
                Privacy.change('block', 'active');
                Privacy.change('block', 'default');

                // Send an unavailable presence
                Presence.send(xid, 'unavailable');

                // Remove the user presence
                var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'presence' + ('_(.+)'));

                for(var i = 0; i < DataStore.storageDB.length; i++) {
                    // Get the pointer values
                    var current = DataStore.storageDB.key(i);

                    // If the pointer is on a stored presence
                    if(current.match(db_regex)) {
                        if(Common.bareXID(RegExp.$1) == xid) {
                            DataStore.storageDB.removeItem(current);
                        }
                    }
                }

                // Manage his new presence
                Presence.funnel(xid, hex_md5(xid));

                return false;
            });

            $(manage_infos + ' a.save').click(function() {
                // Send the item
                self.send(xid, '', $.trim($(rename).val()), self.thisBuddyGroups(xid));

                // Remove the buddy editor
                Bubble.close();

                return false;
            });
        } catch(e) {
            Console.error('Roster.applyBuddyInput', e);
        }

    };


    /**
     * Applies the buddy editing hover events
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} nick
     * @param {string} subscription
     * @param {object} groups
     * @param {string} group_hash
     * @return {undefined}
     */
    self.applyBuddyHover = function(xid, hash, nick, subscription, groups, group_hash) {

        try {
            // Generate the values
            var bPath = '#roster .' + group_hash + ' .buddy[data-xid="' + escape(xid) + '"]';
            var iPath = bPath + ' .buddy-infos';

            // Apply the hover event
            $(bPath).hover(function() {
                // Another bubble exist
                if(Common.exists('#roster .buddy-infos')) {
                    return false;
                }

                $(bPath).oneTime(200, function() {
                    // Another bubble exist
                    if(Common.exists('#roster .buddy-infos')) {
                        return false;
                    }

                    // Add this bubble!
                    Bubble.show(iPath);

                    // Create the buddy infos DOM element
                    $(bPath).append(
                        '<div class="buddy-infos bubble removable">' +
                            '<div class="buddy-infos-subarrow talk-images"></div>' +

                            '<div class="buddy-infos-subitem">' +
                                '<div class="pep-infos">' +
                                    '<p class="bi-status talk-images unavailable">' + Common._e("unknown") + '</p>' +
                                    '<p class="bi-mood talk-images mood-four">' + Common._e("unknown") + '</p>' +
                                    '<p class="bi-activity talk-images activity-exercising">' + Common._e("unknown") + '</p>' +
                                    '<p class="bi-tune talk-images tune-note">' + Common._e("unknown") + '</p>' +
                                    '<p class="bi-geoloc talk-images location-world">' + Common._e("unknown") + '</p>' +
                                    '<p class="bi-jingle talk-images call-jingle"><a href="#" class="audio">' + Common._e("Audio Call") + '</a><span class="separator"> / </span><a href="#" class="video">' + Common._e("Video Call") + '</a>' +
                                    '<p class="bi-view talk-images view-individual"><a href="#" class="profile">' + Common._e("Profile") + '</a> / <a href="#" class="channel">' + Common._e("Channel") + '</a> / <a href="#" class="commands">' + Common._e("Commands") + '</a></p>' +
                                    '<p class="bi-edit talk-images edit-buddy"><a href="#">' + Common._e("Edit") + '</a></p>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );

                    // Sets the good position
                    self.buddyInfosPosition(xid, group_hash);

                    // Get the presence
                    Presence.funnel(xid, hash);

                    // Get the PEP infos
                    PEP.displayAll(xid);

                    // Click events
                    $(bPath + ' .bi-view a').click(function() {
                        var this_sel = $(this);

                        // Renitialize the buddy infos
                        Bubble.close();

                        // Profile
                        if(this_sel.is('.profile')) {
                            UserInfos.open(xid);
                        }

                        // Channel
                        else if(this_sel.is('.channel')) {
                            Microblog.fromInfos(xid, hash);
                        }

                        // Command
                        else if(this_sel.is('.commands')) {
                            AdHoc.retrieve(xid);
                        }

                        return false;
                    });

                    // Jingle events
                    $(bPath + ' .bi-jingle a').click(function() {
                        var this_sel = $(this);

                        // Renitialize the buddy infos
                        Bubble.close();

                        // Audio call?
                        if(this_sel.is('.audio')) {
                            Jingle.start(xid, 'audio');
                        }

                        // Video call?
                        else if(this_sel.is('.video')) {
                            Jingle.start(xid, 'video');
                        }

                        return false;
                    });

                    $(bPath + ' .bi-edit a').click(function() {
                        self.buddyEdit(xid, nick, subscription, groups);

                        return false;
                    });
                });
            }, function() {
                if(!Common.exists(iPath + ' .manage-infos')) {
                    Bubble.close();
                }

                $(bPath).stopTime();
            });
        } catch(e) {
            Console.error('Roster.applyBuddyHover', e);
        }

    };


    /**
     * Sets the good buddy-infos position
     * @public
     * @param {string} xid
     * @param {string} group_hash
     * @return {undefined}
     */
    self.buddyInfosPosition = function(xid, group_hash) {

        try {
            // Paths
            var group = '#roster .' + group_hash;
            var buddy = group + ' .buddy[data-xid="' + escape(xid) + '"]';
            var buddy_infos = buddy + ' .buddy-infos';

            // Get the offset to define
            var offset = 3;

            if(Common.isGateway(xid)) {
                offset = -8;
            }

            // Process the position
            var v_position = $(buddy).position().top + offset;
            var h_position = $(buddy).width() - 10;

            // Apply the top position
            $(buddy_infos).css('top', v_position);

            // Apply the left/right position
            if($('html').attr('dir') == 'rtl') {
                $(buddy_infos).css('right', h_position);
            } else {
                $(buddy_infos).css('left', h_position);
            }
        } catch(e) {
            Console.error('Roster.buddyInfosPosition', e);
        }

    };


    /**
     * Generates an array of the current groups of a buddy
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.thisBuddyGroups = function(xid) {

        try {
            var path = '#roster .buddy[data-xid="' + escape(xid) + '"] ';
            var array = [];

            // Each checked checkboxes
            $(path + 'div.bm-choose input[type="checkbox"]').filter(':checked').each(function() {
                array.push(
                    unescape($(this).attr('data-group'))
                );
            });

            // Entered input value (and not yet in the array)
            var value = $.trim($(path + 'p.bm-group input').val());

            if(value && !Utils.existArrayValue(array, value)) {
                array.push(value);
            }

            return array;
        } catch(e) {
            Console.error('Roster.thisBuddyGroups', e);
        }

    };


    /**
     * Adds a given contact to our roster
     * @public
     * @param {string} xid
     * @param {string} name
     * @return {undefined}
     */
    self.addThisContact = function(xid, name) {

        try {
            Console.info('Add this contact: ' + xid + ', as ' + name);

            // Cut the resource of this XID
            xid = Common.bareXID(xid);

            // If the form is complete
            if(xid) {
                // We send the subscription
                Presence.sendSubscribe(xid, 'subscribe');
                self.send(xid, '', name);

                // We hide the bubble
                Bubble.close();
            }
        } catch(e) {
            Console.error('Roster.addThisContact', e);
        }

    };


    /**
     * Gets an array of all the groups in the roster
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.getAllGroups = function() {

        try {
            var groups = [];

            $('#roster .one-group').each(function() {
                var current = unescape(
                    $(this).attr('data-group')
                );

                if((current != Common._e("Unclassified")) && (current != Common._e("Gateways"))) {
                    groups.push(current);
                }
            });

            return groups.sort();
        } catch(e) {
            Console.error('Roster.getAllGroups', e);
        }

    };


    /**
     * Edits buddy informations
     * @public
     * @param {string} xid
     * @param {string} nick
     * @param {string} subscription
     * @param {object} groups
     * @return {undefined}
     */
    self.buddyEdit = function(xid, nick, subscription, groups) {

        try {
            Console.info('Buddy edit: ' + xid);

            // Initialize
            var path = '#roster .buddy[data-xid="' + escape(xid) + '"] .';
            var html = '<div class="manage-infos">';

            // Get the privacy state
            var privacy_state = Privacy.status('block', xid);
            var privacy_active = DataStore.getDB(Connection.desktop_hash, 'privacy-marker', 'available');

            // Get the group privacy state
            for(var g in groups) {
                if((Privacy.status('block', groups[g]) == 'deny') && (privacy_state != 'allow')) {
                    privacy_state = 'deny';
                }
            }

            // The subscription with this buddy is not full
            if((subscription != 'both') || ((privacy_state == 'deny') && privacy_active)) {
                var authorize_links = '';
                html += '<p class="bm-authorize talk-images">';

                // Link to allow to see our status
                if((subscription == 'to') || (subscription == 'none')) {
                    authorize_links += '<a href="#" class="to">' + Common._e("Authorize") + '</a>';
                }

                // Link to ask to see his/her status
                if((subscription == 'from') || (subscription == 'none')) {
                    if(authorize_links) {
                        authorize_links += ' / ';
                    }

                    authorize_links += '<a href="#" class="from">' + Common._e("Ask for authorization") + '</a>';
                }

                // Link to unblock this buddy
                if((privacy_state == 'deny') && privacy_active) {
                    if(authorize_links) {
                        authorize_links += ' / ';
                    }

                    html += '<a href="#" class="unblock">' + Common._e("Unblock") + '</a>';
                }

                html += authorize_links + '</p>';
            }

            // Complete the HTML code
            var remove_links = '';
            html += '<p class="bm-remove talk-images">';
            remove_links = '<a href="#" class="remove">' + Common._e("Remove") + '</a>';

            // This buddy is allowed to see our presence, we can show a "prohibit" link
            if((subscription == 'both') || (subscription == 'from')) {
                remove_links += ' / <a href="#" class="prohibit">' + Common._e("Prohibit") + '</a>';
            }

            // Complete the HTML code
            if((privacy_state != 'deny') && privacy_active) {
                if(remove_links) {
                    remove_links += ' / ';
                }

                remove_links += '<a href="#" class="block">' + Common._e("Block") + '</a>';
            }

            // Complete the HTML code
            html += remove_links +
                '</p>' +
                '<p class="bm-rename talk-images"><label>' + Common._e("Rename") + '</label> <input type="text" value="' + Common.encodeQuotes(nick) + '" /></p>';

            // Only show group tool if not a gateway
            if(!Common.isGateway(xid)) {
                html += '<p class="bm-group talk-images"><label>' + Common._e("Groups") + '</label> <input type="text" /></p>' +
                    '<div class="bm-choose">' +
                        '<div></div>' +
                    '</div>';
            }

            // Close the DOM element
            html += '<a href="#" class="save">' + Common._e("Save") + '</a>' +
                '</div>';

            // We update the DOM elements
            $(path + 'pep-infos').replaceWith(html);

            // Gets all the existing groups
            var all_groups = self.getAllGroups();
            var all_groups_dom = '';

            for(var a in all_groups) {
                // Current group
                var all_groups_current = all_groups[a];

                // Is the current group checked?
                var checked = '';

                if(Utils.existArrayValue(groups, all_groups_current)) {
                    checked = ' checked="true"';
                }

                // Add the current group HTML
                all_groups_dom += '<label><input type="checkbox" data-group="' + escape(all_groups_current) + '"' + checked + ' /><span>' + all_groups_current.htmlEnc() + '</span></label>';
            }

            // Prepend this in the DOM
            var bm_choose = path + 'manage-infos div.bm-choose';

            $(bm_choose).prepend(all_groups_dom);

            // Apply the editing input events
            self.applyBuddyInput(xid);
        } catch(e) {
            Console.error('Roster.buddyEdit', e);
        }

    };


    /**
     * Unregisters from a given gateway
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.unregisterGateway = function(xid) {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');
            iq.setTo(xid);

            var query = iq.setQuery(NS_REGISTER);
            query.appendChild(iq.buildNode('remove', {'xmlns': NS_REGISTER}));

            con.send(iq);
        } catch(e) {
            Console.error('Roster.unregisterGateway', e);
        }

    };


    /**
     * Updates the roster items
     * @public
     * @param {string} xid
     * @param {string} subscription
     * @param {string} name
     * @param {string} group
     * @return {undefined}
     */
    self.send = function(xid, subscription, name, group) {

        try {
            // We send the new buddy name
            var iq = new JSJaCIQ();
            iq.setType('set');

            var iqQuery = iq.setQuery(NS_ROSTER);
            var item = iqQuery.appendChild(iq.buildNode('item', {'xmlns': NS_ROSTER, 'jid': xid}));

            // Any subscription?
            if(subscription) {
                item.setAttribute('subscription', subscription);
            }

            // Any name?
            if(name) {
                item.setAttribute('name', name);
            }

            // Any group?
            if(group && group.length) {
                for(var i in group) {
                    item.appendChild(iq.buildNode('group', {'xmlns': NS_ROSTER}, group[i]));
                }
            }

            con.send(iq);

            Console.info('Roster item sent: ' + xid);
        } catch(e) {
            Console.error('Roster.send', e);
        }

    };


    /**
     * Adapts the roster height, depending of the window size
     * @public
     * @return {undefined}
     */
    self.adapt = function() {

        try {
            // Process the new height
            var new_height = $('#left-content').height() - $('#my-infos').height() - 97;

            // New height too small
            if(new_height < 211) {
                new_height = 211;
            }

            // Apply the new height
            $('#roster .content').css('height', new_height);
        } catch(e) {
            Console.error('Roster.adapt', e);
        }

    };


    /**
     * Gets all the buddies in our roster
     * @public
     * @return {object}
     */
    self.getAllBuddies = function() {

        try {
            var buddies = [];

            $('#roster .buddy').each(function() {
                var xid = unescape($(this).attr('data-xid'));

                if(xid) {
                    buddies.push(xid);
                }
            });

            return buddies;
        } catch(e) {
            Console.error('Roster.getAllBuddies', e);
        }

    };


    /**
     * Returns whether given XID is in buddy list or not
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isFriend = function(xid) {

        try {
            return Common.exists('#roster .buddy[data-xid="' + escape(xid) + '"]');
        } catch(e) {
            Console.error('Roster.isFriend', e);
        }

    };


    /**
     * Gets the user gateways
     * @public
     * @return {object}
     */
    self.getGateways = function() {

        try {
            // New array
            var gateways = [];
            var buddies = self.getAllBuddies();

            // Get the gateways
            for(var c in buddies) {
                if(Common.isGateway(buddies[c])) {
                    gateways.push(buddies[c]);
                }
            }

            return gateways;
        } catch(e) {
            Console.error('Roster.getGateways', e);
        }

    };


    /**
     * Instanciate the roster
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Filtering tool
            var iFilter = $('#roster .filter input');
            var aFilter = $('#roster .filter a');

            iFilter.placeholder()

            .blur(function() {
                // Nothing is entered, put the placeholder instead
                if(!$.trim($(this).val())) {
                    aFilter.hide();
                } else {
                    aFilter.show();
                }
            })

            .keyup(function(e) {
                Search.funnelFilterBuddy(e.keyCode);
            });

            aFilter.click(function() {
                // Reset the input
                $(this).hide();
                iFilter.val('');
                iFilter.placeholder();

                // Security: show all the groups, empty or not
                $('#roster .one-group').show();

                // Reset the filtering tool
                Search.resetFilterBuddy();

                return false;
            });

            // When the user click on the add button, show the contact adding tool
            $('#roster .foot .add').click(function() {
                // Yet displayed?
                if(Common.exists('#buddy-conf-add')) {
                    return Bubble.close();
                }

                // Add the bubble
                Bubble.show('#buddy-conf-add');

                // Append the content
                $('#roster .roster-add').append(
                    '<div id="buddy-conf-add" class="buddy-conf-item bubble removable">' +
                        '<div class="buddy-conf-subarrow talk-images"></div>' +

                        '<div class="buddy-conf-subitem">' +
                            '<p class="buddy-conf-p">' + Common._e("Add a friend") +  '</p>' +

                            '<label><span>' + Common._e("Address") +  '</span><input type="text" class="buddy-conf-input add-contact-jid" required="" /></label>' +
                            '<label><span>' + Common._e("Name") +  '</span><input type="text" class="buddy-conf-input add-contact-name" /></label>' +
                            '<label>' +
                                '<span>' + Common._e("Gateway") +  '</span>' +
                                '<select class="buddy-conf-select add-contact-gateway">' +
                                    '<option value="none" selected="">' + Common._e("None") +  '</option>' +
                                '</select>' +
                            '</label>' +
                            '<span class="add-contact-name-get">' + Common._e("Getting the name...") + '</span>' +

                            '<p class="buddy-conf-text">' +
                                '<a href="#" class="buddy-conf-add-search">' + Common._e("Search a friend") +  '</a>' +
                            '</p>' +
                        '</div>' +
                    '</div>'
                );

                // Add the gateways
                var gateways = self.getGateways();

                // Any gateway?
                if(gateways.length) {
                    // Append the gateways
                    for(var i in gateways) {
                        $('.add-contact-gateway').append('<option value="' + escape(gateways[i]) + '">' + gateways[i].htmlEnc() +  '</option>');
                    }

                    // Show the gateway selector
                    $('.add-contact-gateway').parent().show();
                } else {
                    $('.add-contact-gateway').parent().hide();
                }

                // Blur event on the add contact input
                $('.add-contact-jid').blur(function() {
                    // Read the value
                    var value = $.trim($(this).val());

                    // Try to catch the buddy name
                    if(value && !$.trim($('.add-contact-name').val()) && ($('.add-contact-gateway').val() == 'none')) {
                        // User XID
                        var xid = Common.generateXID(value, 'chat');

                        // Notice for the user
                        $('.add-contact-name-get').attr('data-for', escape(xid)).show();

                        // Request the user vCard
                        Name.getAddUser(xid);
                    }
                });

                // When a key is pressed...
                $('#buddy-conf-add input, #buddy-conf-add select').keyup(function(e) {
                    // Enter : continue
                    if(e.keyCode == 13) {
                        // Get the values
                        var xid = $.trim($('.add-contact-jid').val());
                        var name = $.trim($('.add-contact-name').val());
                        var gateway = unescape($('.add-contact-gateway').val());

                        // Generate the XID to add
                        if((gateway != 'none') && xid) {
                            xid = xid.replace(/@/g, '%') + '@' + gateway;
                        } else {
                            xid = Common.generateXID(xid, 'chat');
                        }

                        // Submit the form
                        if(xid && Common.getXIDNick(xid) && (xid != Common.getXID())) {
                            self.addThisContact(xid, name);
                        } else {
                            $(document).oneTime(10, function() {
                                $('.add-contact-jid').addClass('please-complete').focus();
                            });
                        }

                        return false;
                    }

                    // Escape : quit
                    if(e.keyCode == 27) {
                        Bubble.close();
                    }
                });

                // Click event on search link
                $('.buddy-conf-add-search').click(function() {
                    Bubble.close();
                    return Directory.open();
                });

                // Focus on the input
                $(document).oneTime(10, function() {
                    $('.add-contact-jid').focus();
                });

                return false;
            });

            // When the user click on the join button, show the chat joining tool
            $('#roster .foot .join').click(function() {
                // Yet displayed?
                if(Common.exists('#buddy-conf-join')) {
                    return Bubble.close();
                }

                // Add the bubble
                Bubble.show('#buddy-conf-join');

                // Append the content
                $('#roster .roster-join').append(
                    '<div id="buddy-conf-join" class="buddy-conf-item bubble removable">' +
                        '<div class="buddy-conf-subarrow talk-images"></div>' +

                        '<div class="buddy-conf-subitem search">' +
                            '<p class="buddy-conf-p" style="margin-bottom: 0;">' + Common._e("Join a chat") +  '</p>' +

                            '<input type="text" class="buddy-conf-input join-jid" required="" />' +
                            '<select class="buddy-conf-select buddy-conf-join-select join-type">' +
                                '<option value="chat" selected="">' + Common._e("Chat") +  '</option>' +
                                '<option value="groupchat">' + Common._e("Groupchat") +  '</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>'
                );

                // Input vars
                var destination = '#buddy-conf-join .search';
                var dHovered = destination + ' ul li.hovered:first';

                // When a key is pressed...
                $('#buddy-conf-join input, #buddy-conf-join select').keyup(function(e) {
                    // Enter: continue
                    if(e.keyCode == 13) {
                        // Select something from the search
                        if(Common.exists(dHovered)) {
                            Search.addBuddy(destination, $(dHovered).attr('data-xid'));
                        } else {
                            var xid = $.trim($('.join-jid').val());
                            var type = $('.buddy-conf-join-select').val();

                            if(xid && type) {
                                // Generate a correct XID
                                xid = Common.generateXID(xid, type);

                                // Not me
                                if(xid != Common.getXID()) {
                                    // Update some things
                                    $('.join-jid').removeClass('please-complete');
                                    Bubble.close();

                                    // Create a new chat
                                    Chat.checkCreate(xid, type);
                                } else {
                                    $('.join-jid').addClass('please-complete');
                                }
                            } else {
                                $('.join-jid').addClass('please-complete');
                            }
                        }

                        return false;
                    }

                    // Escape: quit
                    else if(e.keyCode == 27)
                        Bubble.close();

                    // Buddy search?
                    else if($('.buddy-conf-join-select').val() == 'chat') {
                        // New buddy search
                        if((e.keyCode != 40) && (e.keyCode != 38)) {
                            Search.createBuddy(destination);
                        }

                        // Navigating with keyboard in the results
                        Search.arrowsBuddy(e, destination);
                    }
                });

                // Buddy search lost focus
                $('#buddy-conf-join input').blur(function() {
                    if(!$(destination + ' ul').attr('mouse-hover'))
                        Search.resetBuddy(destination);
                });

                // Re-focus on the text input
                $('#buddy-conf-join select').change(function() {
                    $(document).oneTime(10, function() {
                        $('#buddy-conf-join input').focus();
                    });
                });

                // We focus on the input
                $(document).oneTime(10, function() {
                    $('#buddy-conf-join .join-jid').focus();
                });

                return false;
            });

            // When the user click on the groupchat button, show the groupchat menu
            $('#roster .foot .groupchat').click(function() {
                // Yet displayed?
                if(Common.exists('#buddy-conf-groupchat')) {
                    return Bubble.close();
                }

                // Add the bubble
                Bubble.show('#buddy-conf-groupchat');

                // Append the content
                $('#roster .roster-groupchat').append(
                    '<div id="buddy-conf-groupchat" class="buddy-conf-item bubble removable">' +
                        '<div class="buddy-conf-subarrow talk-images"></div>' +

                        '<div class="buddy-conf-subitem">' +
                            '<p class="buddy-conf-p">' + Common._e("Your groupchats") +  '</p>' +

                            '<select name="groupchat-join" class="buddy-conf-select buddy-conf-groupchat-select"></select>' +

                            '<p class="buddy-conf-text">' +
                                '- <a href="#" class="buddy-conf-groupchat-edit">' + Common._e("Manage your favorite groupchats") +  '</a>' +
                            '</p>' +
                        '</div>' +
                    '</div>'
                );

                // When the user wants to edit his groupchat favorites
                $('.buddy-conf-groupchat-edit').click(function() {
                    Favorites.open();
                    Bubble.close();

                    return false;
                });

                // Change event
                $('.buddy-conf-groupchat-select').change(function() {
                    var groupchat = $.trim($(this).val());

                    if(groupchat != 'none') {
                        // We hide the bubble
                        Bubble.close();

                        // Create the chat
                        Chat.checkCreate(groupchat, 'groupchat');

                        // We reset the select value
                        $(this).val('none');
                    }
                });

                // Load the favorites
                Favorites.load();

                return false;
            });

            // When the user click on the muji button, show the muji menu
            $('#roster .foot .muji').click(function() {
                // Yet displayed?
                if(Common.exists('#buddy-conf-muji') || Call.is_ongoing()) {
                    return Bubble.close();
                }

                // Add the bubble
                Bubble.show('#buddy-conf-muji');

                // Append the content
                $('#roster .roster-muji').append(
                    '<div id="buddy-conf-muji" class="buddy-conf-item bubble removable">' +
                        '<div class="buddy-conf-subarrow talk-images"></div>' +

                        '<div class="buddy-conf-subitem">' +
                            '<p class="buddy-conf-p">' + Common._e("Launch a group call") +  '</p>' +

                            '<p class="buddy-conf-text">' +
                                '- <a href="#" class="buddy-conf-muji-conference" data-media="audio">' + Common._e("Audio conference") +  '</a>' +
                            '</p>' +

                            '<p class="buddy-conf-text">' +
                                '- <a href="#" class="buddy-conf-muji-conference" data-media="video">' + Common._e("Video conference") +  '</a>' +
                            '</p>' +
                        '</div>' +
                    '</div>'
                );

                // When the user wants to launch
                $('.buddy-conf-muji-conference').click(function() {
                    var media = $(this).attr('data-media');

                    var room_name = hex_md5(media + DateUtils.getTimeStamp() + Math.random());
                    var room = Common.generateXID(room_name, 'groupchat');

                    if(media && room && room_name) {
                        Muji.start(room, media);
                    }

                    Bubble.close();

                    return false;
                });

                return false;
            });

            // When the user click on the more button, show the more menu
            $('#roster .foot .more').click(function() {
                // Yet displayed?
                if(Common.exists('#buddy-conf-more')) {
                    return Bubble.close();
                }

                // Add the bubble
                Bubble.show('#buddy-conf-more');

                // Append the content
                $('#roster .roster-more').append(
                    '<div id="buddy-conf-more" class="buddy-conf-item bubble removable">' +
                        '<div class="buddy-conf-subarrow talk-images"></div>' +

                        '<div class="buddy-conf-subitem">' +
                            '<p class="buddy-conf-p">' + Common._e("More stuff") +  '</p>' +

                            '<p class="buddy-conf-text">' +
                                '- <a href="#" class="buddy-conf-more-display-unavailable">' + Common._e("Show all friends") +  '</a>' +
                                '<a href="#" class="buddy-conf-more-display-available">' + Common._e("Only show connected friends") +  '</a>' +
                            '</p>' +

                            '<p class="buddy-conf-text privacy-hidable">' +
                                '- <a href="#" class="buddy-conf-more-privacy">' + Common._e("Privacy") +  '</a>' +
                            '</p>' +

                            '<p class="buddy-conf-text">' +
                                '- <a href="#" class="buddy-conf-more-service-disco">' + Common._e("Service discovery") +  '</a>' +
                            '</p>' +

                            '<p class="buddy-conf-text commands-hidable"">' +
                                '- <a href="#" class="buddy-conf-more-commands">' + Common._e("Commands") +  '</a>' +
                            '</p>' +
                        '</div>' +
                    '</div>'
                );

                // Close bubble when link clicked
                $('#buddy-conf-more a').click(function() {
                    Bubble.close();
                });

                // When the user wants to display all his buddies
                $('.buddy-conf-more-display-unavailable').click(function() {
                    Interface.showAllBuddies('roster');

                    return false;
                });

                // When the user wants to display only online buddies
                $('.buddy-conf-more-display-available').click(function() {
                    Interface.showOnlineBuddies('roster');

                    return false;
                });

                // When the user click on the privacy link
                $('.buddy-conf-more-privacy').click(Privacy.open);

                // When the user click on the service discovery link
                $('.buddy-conf-more-service-disco').click(Discovery.open);

                // When the user click on the command link
                $('.buddy-conf-more-commands').click(function() {
                    AdHoc.server(con.domain);

                    return false;
                });

                // Manage the displayed links
                if(self.blist_all) {
                    $('.buddy-conf-more-display-unavailable').hide();
                    $('.buddy-conf-more-display-available').show();
                }

                if(Features.enabledCommands()) {
                    $('.buddy-conf-more-commands').parent().show();
                }

                if(DataStore.getDB(Connection.desktop_hash, 'privacy-marker', 'available')) {
                    $('.buddy-conf-more-privacy').parent().show();
                }

                return false;
            });

            // When the user scrolls the buddy list
            $('#roster .content').scroll(function() {
                // Close the opened buddy infos bubble
                Bubble.close();
            });
        } catch(e) {
            Console.error('Roster.instance', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            // Window resize event handler
            $(window).resize(self.adapt);
        } catch(e) {
            Console.error('Roster.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Roster.launch();