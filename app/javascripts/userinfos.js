/*

Jappix - An open social platform
These are the user-infos JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var UserInfos = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the user-infos popup
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.open = function(xid) {

        try {
            // Can show shortcuts?
            var shortcuts = '';

            if(xid != Common.getXID()) {
                shortcuts = '<div class="shortcuts">' +
                            '<a href="#" class="message talk-images" title="' + Common._e("Send him/her a message") + '" onclick="UserInfos.close(); return Inbox.composeMessage(\'' + Utils.encodeOnclick(xid) + '\');"></a>' +
                            '<a href="#" class="chat talk-images" title="' + Common._e("Start a chat with him/her") + '" onclick="UserInfos.close(); return Chat.checkCreate(\'' + Utils.encodeOnclick(xid) + '\', \'chat\');"></a>' +
                            '<a href="#" class="command talk-images" title="' + Common._e("Command") + '" onclick="UserInfos.close(); return AdHoc.retrieve(\'' + Utils.encodeOnclick(xid) + '\');"></a>' +
                             '</div>';
            }

            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("User profile") + '</div>' +

            '<div class="tab">' +
                '<a href="#" class="tab-active" data-key="1">' + Common._e("General") + '</a>' +
                '<a href="#" data-key="2">' + Common._e("Advanced") + '</a>' +
                '<a href="#" data-key="3">' + Common._e("Comments") + '</a>' +
            '</div>' +

            '<div class="content">' +
                '<div class="lap-active one-lap info1">' +
                    '<div class="main-infos">' +
                        '<div class="avatar-container">' +
                            '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                        '</div>' +

                        '<h1 id="BUDDY-FN" class="reset-info">' + Common._e("unknown") + '</h1>' +
                        '<h2 class="buddy-xid" class="reset-info">' + Common._e("unknown") + '</h2>' +
                        '<h3 class="buddy-last" class="reset-info">' + Common._e("unknown") + '</h3>' +

                        shortcuts +
                    '</div>' +

                    '<div class="block-infos">' +
                        '<div class="one-line"><b class="line-label">' + Common._e("Date of birth") + '</b><span id="BUDDY-BDAY" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("E-mail") + '</b><span id="BUDDY-EMAIL-USERID" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("Phone") + '</b><span id="BUDDY-TEL-NUMBER" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("Website") + '</b><span id="BUDDY-URL" class="reset-info">' + Common._e("unknown") + '</span></div>' +
                    '</div>' +

                    '<div class="block-infos">' +
                        '<div class="one-line"><b class="line-label">' + Common._e("Client") + '</b><span id="BUDDY-CLIENT" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("System") + '</b><span id="BUDDY-SYSTEM" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("Local time") + '</b><span id="BUDDY-TIME" class="reset-info">' + Common._e("unknown") + '</span></div>' +
                    '</div>' +
                '</div>' +

                '<div class="one-lap info2">' +
                    '<div class="block-infos">' +
                        '<div class="one-line"><b class="line-label">' + Common._e("Street") + '</b><span id="BUDDY-ADR-STREET" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("City") + '</b><span id="BUDDY-ADR-LOCALITY" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("Postal code") + '</b><span id="BUDDY-ADR-PCODE" class="reset-info">' + Common._e("unknown") + '</span></div>' +

                        '<div class="one-line"><b class="line-label">' + Common._e("Country") + '</b><span id="BUDDY-ADR-CTRY" class="reset-info">' + Common._e("unknown") + '</span></div>' +
                    '</div>' +

                    '<div class="block-infos">' +
                        '<div class="one-line"><b class="line-label">' + Common._e("Biography") + '</b><span id="BUDDY-DESC" class="reset-info">' + Common._e("unknown") + '</span></div>' +
                    '</div>' +
                '</div>' +

                '<div class="one-lap info3">' +
                    '<textarea class="rosternotes" rows="8" cols="60"></textarea>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish">' + Common._e("Close") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('userinfos', html);

            // Associate the events
            UserInfos.instance();

            // We retrieve the user's vcard
            self.retrieve(xid);
        } catch(e) {
            Console.error('UserInfos.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Closes the user-infos popup
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Send the buddy comments
            self.sendBuddyComments();

            // Destroy the popup
            Popup.destroy('userinfos');
        } catch(e) {
            Console.error('UserInfos.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets the user-infos
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.retrieve = function(xid) {

        try {
            // We setup the waiting indicator
            markers = 'vcard last';

            // We put the user's XID
            $('#userinfos .buddy-xid').text(xid);

            // We get the vCard
            vCard.get(xid, 'buddy');

            // Get the highest resource for this XID
            var cXID = Presence.highestPriority(xid);
            var pXID = xid;

            // If the user is logged in
            if(cXID) {
                // Change the XID
                pXID = cXID;

                // We request the user's system infos
                self.query(cXID, 'version');

                // We request the user's local time
                self.query(cXID, 'time');

                // Add these to the markers
                markers += ' version time';
            }

            // We request the user's last activity
            self.query(pXID, 'last');

            // Add the markers
            $('#userinfos .content').addClass(markers);

            // We request all the user's comments
            self.displayBuddyComments(xid);
        } catch(e) {
            Console.error('UserInfos.retrieve', e);
        }

    };


    /**
     * Builds the asked user-infos query
     * @public
     * @param {string} xid
     * @param {string} mode
     * @return {undefined}
     */
    self.query = function(xid, mode) {

        try {
            // Generate a session ID
            var id = genID();
            $('#userinfos').attr('data-' + mode, id);

            // New IQ
            var iq = new JSJaCIQ();

            iq.setID(id);
            iq.setType('get');
            iq.setTo(xid);

            // Last activity query
            if(mode == 'last') {
                iq.setQuery(NS_LAST);
                con.send(iq, self.lastActivityUserInfos);
            }

            // Time query
            else if(mode == 'time') {
                iq.appendNode('time', {'xmlns': NS_URN_TIME});
                con.send(iq, self.localTime);
            }

            // Version query
            else if(mode == 'version') {
                iq.setQuery(NS_VERSION);
                con.send(iq, self.version);
            }
        } catch(e) {
            Console.error('UserInfos.query', e);
        }

    };


    /**
     * Checks if the waiting item can be hidden
     * @public
     * @return {undefined}
     */
    self.vCard = function() {

        try {
            $('#userinfos .content').removeClass('vcard');
            self.wait();
        } catch(e) {
            Console.error('UserInfos.vCard', e);
        }

    };


    /**
     * Displays the buddy comments
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.displayBuddyComments = function(xid) {

        try {
            var value = DataStore.getDB(Connection.desktop_hash, 'rosternotes', xid);

            if(value) {
                $('#userinfos .rosternotes').val(value);
            }
        } catch(e) {
            Console.error('UserInfos.displayBuddyComments', e);
        }

    };


    /**
     * Displays the user's last activity result
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.lastActivity = function(iq) {

        try {
            // Extract the request ID
            var id = iq.getID();
            var path = '#userinfos[data-last="' + id + '"]';

            // End if session does not exist
            if(!Common.exists(path)) {
                return;
            }

            if(iq && (iq.getType() == 'result')) {
                // Get the values
                var from = Common.fullXID(Common.getStanzaFrom(iq));
                var seconds = $(iq.getNode()).find('query').attr('seconds');

                // Any seconds?
                if(seconds !== undefined) {
                    // Initialize the parsing
                    var last;
                    seconds = parseInt(seconds);

                    // Active user
                    if(seconds <= 60) {
                        last = Common._e("User currently active");
                    }

                    // Inactive user
                    else {
                        // Parse the date
                        var date_now = new Date();
                        var time_now = date_now.getTime();
                        var date_last = new Date(date_now - (seconds * 1000));
                        var date = date_last.toLocaleString();

                        // Offline user
                        if(from.indexOf('/') == -1) {
                            last = Common.printf(Common._e("Last seen: %s"), date);
                        }

                        // Online user
                        else {
                            last = Common.printf(Common._e("Inactive since: %s"), date);
                        }
                    }

                    // Append this text
                    $('#userinfos .buddy-last').text(last);
                }

                Console.log('Last activity received: ' + from);
            }

            $('#userinfos .content').removeClass('last');
            self.wait();
        } catch(e) {
            Console.error('UserInfos.lastActivity', e);
        }

    };


    /**
     * Displays the user's software version result
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.version = function(iq) {

        try {
            // Extract the request ID
            var id = iq.getID();
            var path = '#userinfos[data-version="' + id + '"]';

            // End if session does not exist
            if(!Common.exists(path)) {
                return;
            }

            // Extract the reply data
            if(iq && (iq.getType() == 'result')) {
                // Get the values
                var xml = iq.getQuery();
                var name = $(xml).find('name').text();
                var version = $(xml).find('version').text();
                var os = $(xml).find('os').text();

                // Put the values together
                if(name && version) {
                    name = name + ' ' + version;
                }

                // Display the values
                if(name) {
                    $(path + ' #BUDDY-CLIENT').text(name);
                }

                if(os) {
                    $(path + ' #BUDDY-SYSTEM').text(os);
                }

                Console.log('Software version received: ' + Common.fullXID(Common.getStanzaFrom(iq)));
            }

            $('#userinfos .content').removeClass('version');
            self.wait();
        } catch(e) {
            Console.error('UserInfos.version', e);
        }

    };


    /**
     * Displays the user's local time result
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.localTime = function(iq) {

        try {
            // Extract the request ID
            var id = iq.getID();
            var path = '#userinfos[data-time="' + id + '"]';

            // End if session does not exist
            if(!Common.exists(path)) {
                return;
            }

            if(iq && (iq.getType() == 'result')) {
                // Get the values
                var xml = iq.getNode();
                var tzo = $(xml).find('tzo').text();
                var utc = $(xml).find('utc').text();

                // Any UTC?
                if(utc) {
                    // Add the TZO if there's no one
                    if(tzo && utc.match(/^(.+)Z$/)) {
                        utc = RegExp.$1 + tzo;
                    }

                    // Get the local date string
                    var local_string = Date.hrTime(utc);

                    // Then display it
                    $(path + ' #BUDDY-TIME').text(local_string);
                }

                Console.log('Local time received: ' + Common.fullXID(Common.getStanzaFrom(iq)));
            }

            $('#userinfos .content').removeClass('time');
            self.wait();
        } catch(e) {
            Console.error('UserInfos.localTime', e);
        }

    };


    /**
     * Hides the waiting image if needed
     * @public
     * @return {undefined}
     */
    self.wait = function() {

        try {
            var selector = $('#userinfos .content');

            if(!selector.hasClass('vcard') && !selector.hasClass('last') && !selector.hasClass('version') && !selector.hasClass('time')) {
                $('#userinfos .wait').hide();
            }
        } catch(e) {
            Console.error('UserInfos.wait', e);
        }

    };


    /**
     * Sends the buddy comments
     * @public
     * @return {boolean}
     */
    self.sendBuddyComments = function() {

        try {
            // Update the current value
            var value = $('#userinfos .rosternotes').val();
            var xid = $('#userinfos .buddy-xid').text();

            // Necessary to update?
            var old_value = DataStore.getDB(Connection.desktop_hash, 'rosternotes', xid);

            if((old_value == value) || (!old_value && !value)) {
                return false;
            }

            // Update the database
            DataStore.setDB(Connection.desktop_hash, 'rosternotes', xid, value);

            // Send the new buddy storage values
            var iq = new JSJaCIQ();
            iq.setType('set');
            var query = iq.setQuery(NS_PRIVATE);
            var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_ROSTERNOTES}));

            // We regenerate the XML
            var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'rosternotes' + ('_(.+)'));

            for(var i = 0; i < DataStore.storageDB.length; i++) {
                // Get the pointer values
                var current = DataStore.storageDB.key(i);

                // If the pointer is on a stored rosternote
                if(current.match(db_regex)) {
                    var cur_xid = RegExp.$1;
                    var cur_value = DataStore.storageDB.getItem(current);

                    if(cur_xid && cur_value) {
                        storage.appendChild(iq.buildNode('note', {'jid': cur_xid, 'xmlns': NS_ROSTERNOTES}, cur_value));
                    }
                }
            }

            con.send(iq);

            return false;
        } catch(e) {
            Console.error('UserInfos.sendBuddyComments', e);
        }

    };


    /**
     * Switches the user-infos tabs
     * @public
     * @param {string} id
     * @return {boolean}
     */
    self.switchTab = function(id) {

        try {
            var userinfos_sel = $('#userinfos');
            var content_sel = userinfos_sel.find('.content');
            var tab_link_sel = userinfos_sel.find('.tab a');

            content_sel.find('.one-lap').hide();
            content_sel.find('.info' + id).show();

            tab_link_sel.removeClass('tab-active');
            tab_link_sel.filter('[data-key="' + id + '"]').addClass('tab-active');
        } catch(e) {
            Console.error('UserInfos.switchTab', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets the user's informations when creating a new chat
     * @public
     * @param {string} hash
     * @param {string} xid
     * @param {string} nick
     * @param {string} type
     * @return {undefined}
     */
    self.get = function(hash, xid, nick, type) {

        try {
            // This is a normal chat
            if(type != 'private') {
                // Display the buddy name
                if(nick) {
                    $('#' + hash + ' .top .name .bc-name').text(nick);
                    $('#page-switch .' + hash + ' .name').text(nick);
                }

                // Get the buddy PEP informations
                PEP.displayAll(xid);
            }

            // Display the buddy presence
            Presence.funnel(xid, hash);
        } catch(e) {
            Console.error('UserInfos.get', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Click events
            $('#userinfos .tab a').click(function() {
                var this_sel = $(this);

                // Yet active?
                if(this_sel.hasClass('tab-active')) {
                    return false;
                }

                // Switch to the good tab
                var key = parseInt(this_sel.attr('data-key'));

                return self.switchTab(key);
            });

            $('#userinfos .bottom .finish').click(function() {
                return self.close();
            });
        } catch(e) {
            Console.error('UserInfos.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();