/*

Jappix - An open social platform
These are the favorites JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Favorites = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the favorites popup
     * @public
     * @return {undefined}
     */
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Manage favorite rooms") + '</div>' +

            '<div class="content">' +
                '<div class="switch-fav">' +
                    '<div class="room-switcher room-list">' +
                        '<div class="icon list-icon talk-images"></div>' +

                        Common._e("Change favorites") +
                    '</div>' +

                    '<div class="room-switcher room-search">' +
                        '<div class="icon search-icon talk-images"></div>' +

                        Common._e("Search a room") +
                    '</div>' +
                '</div>' +

                '<div class="static-fav">' +
                    '<div class="favorites-edit favorites-content">' +
                        '<div class="head fedit-head static-fav-head">' +
                            '<div class="head-text fedit-head-text">' + Common._e("Select a favorite") + '</div>' +

                            '<select name="fedit-head-select" class="head-select fedit-head-select"></select>' +
                        '</div>' +

                        '<div class="results fedit-results static-fav-results">' +
                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Name") + '</label>' +

                                '<input class="fedit-title" type="text" required="" />' +
                            '</div>' +

                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Nickname") + '</label>' +

                                '<input class="fedit-nick" type="text" value="' + Name.getNick() + '" required="" />' +
                            '</div>' +

                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Room") + '</label>' +

                                '<input class="fedit-chan" type="text" required="" />' +
                            '</div>' +

                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Server") + '</label>' +

                                '<input class="fedit-server" type="text" value="' + HOST_MUC + '" required="" />' +
                            '</div>' +

                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Password") + '</label>' +

                                '<input class="fedit-password" type="password" />' +
                            '</div>' +

                            '<div class="fedit-line">' +
                                '<label>' + Common._e("Automatic") + '</label>' +

                                '<input type="checkbox" class="fedit-autojoin" />' +
                            '</div>' +

                            '<div class="fedit-actions">' +
                                '<a href="#" class="fedit-terminate fedit-add add one-button talk-images">' + Common._e("Add") + '</a>' +
                                '<a href="#" class="fedit-terminate fedit-edit one-button talk-images">' + Common._e("Edit") + '</a>' +
                                '<a href="#" class="fedit-terminate fedit-remove remove one-button talk-images">' + Common._e("Remove") + '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="favorites-search favorites-content">' +
                        '<div class="head fsearch-head static-fav-head">' +
                            '<div class="head-text fsearch-head-text">' + Common._e("Search a room on") + '</div>' +

                            '<input type="text" class="head-input fsearch-head-server" value="' + HOST_MUC + '" />' +
                        '</div>' +

                        '<div class="results fsearch-results static-fav-results">' +
                            '<p class="fsearch-noresults">' + Common._e("No room found on this server.") + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish">' + Common._e("Close") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('favorites', html);

            // Load the favorites
            self.load();

            // Associate the events
            self.instance();
        } catch(e) {
            Console.error('Favorites.open', e);
        }

    };


    /**
     * Resets the favorites elements
     * @public
     * @return {undefined}
     */
    self.reset = function() {

        try {
            var path_sel = $('#favorites');

            path_sel.find('.wait');
            path_sel.find('.fedit-terminate').hide();
            path_sel.find('.fedit-add').show();

            path_sel.find('.fsearch-oneresult').remove();
            path_sel.find('input').val('');
            path_sel.find('.please-complete').removeClass('please-complete');

            path_sel.find('.fedit-nick').val(Name.getNick());
            path_sel.find('.fsearch-head-server').val(HOST_MUC);
            path_sel.find('.fedit-server').val(HOST_MUC);

            path_sel.find('.fedit-autojoin').removeAttr('checked');
        } catch(e) {
            Console.error('Favorites.reset', e);
        }

    };


    /**
     * Quits the favorites popup
     * @public
     * @return {boolean}
     */
    self.quit = function() {

        try {
            // Destroy the popup
            Popup.destroy('favorites');
        } catch(e) {
            Console.error('Favorites.quit', e);
        } finally {
            return false;
        }

    };


    /**
     * Adds a room to the favorites
     * @public
     * @param {string} room_xid
     * @param {string} room_name
     * @return {boolean}
     */
    self.addThis = function(room_xid, room_name) {

        try {
            // Button path
            var button_sel = $('#favorites .fsearch-results div[data-xid="' + escape(room_xid) + '"] a.one-button');

            // Add a remove button instead of the add one
            button_sel.filter('.add').replaceWith(
                '<a href="#" class="one-button remove talk-images">' + Common._e("Remove") + '</a>'
            );

            // Click event
            button_sel.filter('.remove').click(function() {
                return self.removeThis(room_xid, room_name);
            });

            // Hide the add button in the (opened?) groupchat
            $('#' + hex_md5(room_xid) + ' .tools-add').hide();

            // Add the database entry
            self.display(
                room_xid,
                Common.explodeThis(' (', room_name, 0), Name.getNick(), '0', ''
            );

            // Publish the favorites
            self.publish();
        } catch(e) {
            Console.error('Favorites.addThis', e);
        } finally {
            return false;
        }

    };


    /**
     * Removes a room from the favorites
     * @public
     * @param {string} room_xid
     * @param {string} room_name
     * @return {boolean}
     */
    self.removeThis = function(room_xid, room_name) {

        try {
            // Button path
            var button_sel = $('#favorites .fsearch-results div[data-xid="' + escape(room_xid) + '"] a.one-button');

            // Add a remove button instead of the add one
            button_sel.filter('.remove').replaceWith('<a href="#" class="one-button add talk-images">' + Common._e("Add") + '</a>');

            // Click event
            button_sel.filter('.add').click(function() {
                return self.addThis(room_xid, room_name);
            });

            // Show the add button in the (opened?) groupchat
            $('#' + hex_md5(room_xid) + ' .tools-add').show();

            // Remove the favorite
            self.remove(room_xid, true);

            // Publish the favorites
            self.publish();
        } catch(e) {
            Console.error('Favorites.removeThis', e);
        } finally {
            return false;
        }

    };


    /**
     * Edits a favorite
     * @public
     * @return {undefined}
     */
    self.edit = function() {

        try {
            // Path to favorites
            var favorites_sel = $('#favorites');

            // Reset the favorites
            self.reset();

            // Show the edit/remove button, hide the others
            favorites_sel.find('.fedit-terminate').hide();
            favorites_sel.find('.fedit-edit').show();
            favorites_sel.find('.fedit-remove').show();

            // We retrieve the values
            var xid = favorites_sel.find('.fedit-head-select').val();
            var data_sel = $(Common.XMLFromString(
                DataStore.getDB(Connection.desktop_hash, 'favorites', xid)
            ));

            // If this is not the default room
            if(xid != 'none') {
                // We apply the values
                favorites_sel.find('.fedit-title').val(data_sel.find('name').text());
                favorites_sel.find('.fedit-nick').val(data_sel.find('nick').text());
                favorites_sel.find('.fedit-chan').val(Common.getXIDNick(xid));
                favorites_sel.find('.fedit-server').val(Common.getXIDHost(xid));
                favorites_sel.find('.fedit-password').val(data_sel.find('password').text());

                if(data_sel.find('autojoin').text() == 'true') {
                    favorites_sel.find('.fedit-autojoin').attr('checked', true);
                }
            }
        } catch(e) {
            Console.error('Favorites.edit', e);
        }

    };


    /**
     * Terminate a favorite editing
     * @public
     * @param {string} type
     * @return {boolean}
     */
    self.terminateThis = function(type) {

        try {
            // Path to favorites
            var favorites_sel = $('#favorites');

            // We get the values of the current edited groupchat
            var old_xid = favorites_sel.find('.fedit-head-select').val();

            var title = favorites_sel.find('.fedit-title').val();
            var nick = favorites_sel.find('.fedit-nick').val();
            var room = favorites_sel.find('.fedit-chan').val();
            var server = favorites_sel.find('.fedit-server').val();
            var xid = room + '@' + server;
            var password = favorites_sel.find('.fedit-password').val();
            var autojoin = 'false';

            if(favorites_sel.find('.fedit-autojoin').filter(':checked').size()) {
                autojoin = 'true';
            }

            // We check the missing values and send this if okay
            if((type == 'add') || (type == 'edit')) {
                if(title && nick && room && server) {
                    // Remove the edited room
                    if(type == 'edit') {
                        self.remove(old_xid, true);
                    }

                    // Display the favorites
                    self.display(xid, title, nick, autojoin, password);

                    // Reset the inputs
                    self.reset();
                } else {
                    favorites_sel.find('input[required]').each(function() {
                        var select = $(this);

                        if(!select.val()) {
                            $(document).oneTime(10, function() {
                                select.addClass('please-complete').focus();
                            });
                        } else {
                            select.removeClass('please-complete');
                        }
                    });
                }
            } else if(type == 'remove') {
                self.remove(old_xid, true);

                // Reset the inputs
                self.reset();
            }

            // Publish the new favorites
            self.publish();

            Console.info('Action on this bookmark: ' + room + '@' + server + ' / ' + type);
        } catch(e) {
            Console.error('Favorites.terminateThis', e);
        } finally {
            return false;
        }

    };


    /**
     * Removes a favorite
     * @public
     * @param {string} xid
     * @param {boolean} database
     * @return {undefined}
     */
    self.remove = function(xid, database) {

        try {
            // We remove the target favorite everywhere needed
            $('.buddy-conf-groupchat-select option[value="' + xid + '"]').remove();
            $('.fedit-head-select option[value="' + xid + '"]').remove();

            // Must remove it from database?
            if(database) {
                DataStore.removeDB(Connection.desktop_hash, 'favorites', xid);
            }
        } catch(e) {
            Console.error('Favorites.remove', e);
        }

    };


    /**
     * Sends a favorite to the XMPP server
     * @public
     * @return {undefined}
     */
    self.publish = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            var query = iq.setQuery(NS_PRIVATE);
            var storage = query.appendChild(iq.buildNode('storage', {
                'xmlns': NS_BOOKMARKS
            }));

            // We generate the XML
            var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'favorites_(.+)');

            for(var i = 0; i < DataStore.storageDB.length; i++) {
                // Get the pointer values
                var current = DataStore.storageDB.key(i);

                // If the pointer is on a stored favorite
                if(current.match(db_regex)) {
                    var data_sel = $(Common.XMLFromString(
                        DataStore.storageDB.getItem(current)
                    ));

                    var xid = data_sel.find('xid').text();
                    var rName = data_sel.find('name').text();
                    var nick = data_sel.find('nick').text();
                    var password = data_sel.find('password').text();
                    var autojoin = data_sel.find('autojoin').text();

                    // We create the node for this groupchat
                    var item = storage.appendChild(
                        iq.buildNode('conference', {
                            'name': rName,
                            'jid': xid,
                            'autojoin': autojoin,
                            xmlns: NS_BOOKMARKS
                        })
                    );

                    item.appendChild(iq.buildNode('nick', {
                        xmlns: NS_BOOKMARKS
                    }, nick));

                    if(password) {
                        item.appendChild(iq.buildNode('password', {
                            xmlns: NS_BOOKMARKS
                        }, password));
                    }

                    Console.info('Bookmark sent: ' + xid);
                }
            }

            con.send(iq);
        } catch(e) {
            Console.error('Favorites.publish', e);
        }

    };


    /**
     * Gets a list of the MUC items on a given server
     * @public
     * @return {undefined}
     */
    self.getGCList = function() {

        try {
            var path_sel = $('#favorites');
            var groupchat_server = $('.fsearch-head-server').val();

            // We reset some things
            path_sel.find('.fsearch-oneresult').remove();
            path_sel.find('.fsearch-noresults').hide();
            path_sel.find('.wait').show();

            var iq = new JSJaCIQ();
            iq.setType('get');
            iq.setTo(groupchat_server);

            iq.setQuery(NS_DISCO_ITEMS);

            con.send(iq, self.handleGCList);
        } catch(e) {
            Console.error('Favorites.getGCList', e);
        }

    };


    /**
     * Handles the MUC items list
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleGCList = function(iq) {

        try {
            var path_sel = $('#favorites');
            var from = Common.fullXID(Common.getStanzaFrom(iq));

            if(!iq || (iq.getType() != 'result')) {
                Board.openThisError(3);

                path_sel.find('.wait').hide();

                Console.error('Error while retrieving the rooms: ' + from);
            }

            else {
                var handleXML = iq.getQuery();

                if($(handleXML).find('item').size()) {
                    // Initialize the HTML code
                    var html = '';

                    $(handleXML).find('item').each(function() {
                        var this_sel = $(this);

                        var room_xid = this_sel.attr('jid');
                        var room_name = this_sel.attr('name');

                        if(room_xid && room_name) {
                            // Escaped values
                            var escaped_xid = Utils.encodeOnclick(room_xid);
                            var escaped_name = Utils.encodeOnclick(room_name);

                            // Initialize the room HTML
                            html += '<div class="oneresult fsearch-oneresult" data-xid="' + escape(room_xid) + '">' +
                                    '<div class="room-name">' + room_name.htmlEnc() + '</div>' +
                                    '<a href="#" class="one-button join talk-images" onclick="return Favorites.join(\'' + escaped_xid + '\');">' + Common._e("Join") + '</a>';

                            // This room is yet a favorite
                            if(DataStore.existDB(Connection.desktop_hash, 'favorites', room_xid)) {
                                html += '<a href="#" ' +
                                           'class="one-button remove talk-images" ' +
                                           'onclick="return Favorites.removeThis(\'' + escaped_xid + '\', \'' + escaped_name + '\');"' +
                                        '>' +
                                            Common._e("Remove") +
                                        '</a>';
                            } else {
                                html += '<a href="#" ' +
                                           'class="one-button add talk-images" ' +
                                           'onclick="return Favorites.addThis(\'' + escaped_xid + '\', \'' + escaped_name + '\');"' +
                                        '>' +
                                            Common._e("Add") +
                                        '</a>';
                            }

                            // Close the room HTML
                            html += '</div>';
                        }
                    });

                    // Append this code to the popup
                    path_sel.find('.fsearch-results').append(html);
                } else {
                    path_sel.find('.fsearch-noresults').show();
                }

                Console.info('Rooms retrieved: ' + from);
            }

            path_sel.find('.wait').hide();
        } catch(e) {
            Console.error('Favorites.handleGCList', e);
        }

    };


    /**
     * Joins a groupchat from favorites
     * @public
     * @param {string} room
     * @return {boolean}
     */
    self.join = function(room) {

        try {
            self.quit();

            Chat.checkCreate(
                room,
                'groupchat',
                '',
                '',
                Common.getXIDNick(room)
            );
        } catch(e) {
            Console.error('Favorites.join', e);
        } finally {
            return false;
        }

    };


    /**
     * Displays a given favorite
     * @public
     * @param {string} xid
     * @param {string} name
     * @param {string} nick
     * @param {boolean} autojoin
     * @param {string} password
     * @return {undefined}
     */
    self.display = function(xid, name, nick, autojoin, password) {

        try {
            // Generate the HTML code
            var html = '<option value="' + Common.encodeQuotes(xid) + '">' + name.htmlEnc() + '</option>';

            // Remove the existing favorite
            self.remove(xid, false);

            // We complete the select forms
            $('#roster .gc-join-first-option, #favorites .fedit-head-select-first-option').after(html);

            // We store the informations
            var value = '<groupchat>' +
                            '<xid>' + xid.htmlEnc() + '</xid>' +
                            '<name>' + name.htmlEnc() + '</name>' +
                            '<nick>' + nick.htmlEnc() + '</nick>' +
                            '<autojoin>' + autojoin.htmlEnc() + '</autojoin>' +
                            '<password>' + password.htmlEnc() + '</password>' +
                        '</groupchat>';

            DataStore.setDB(Connection.desktop_hash, 'favorites', xid, value);
        } catch(e) {
            Console.error('Favorites.display', e);
        }

    };


    /**
     * Loads the favorites for the popup
     * @public
     * @return {undefined}
     */
    self.load = function() {

        try {
            // Initialize the HTML code
            var html = '';

            // Read the database
            var db_regex = new RegExp(('^' + Connection.desktop_hash + '_') + 'favorites_(.+)');

            for(var i = 0; i < DataStore.storageDB.length; i++) {
                // Get the pointer values
                var current = DataStore.storageDB.key(i);

                // If the pointer is on a stored favorite
                if(current.match(db_regex)) {
                    var data = Common.XMLFromString(DataStore.storageDB.getItem(current));

                    // Add the current favorite to the HTML code
                    html += '<option value="' + Common.encodeQuotes($(data).find('xid').text()) + '">' +
                                $(data).find('name').text().htmlEnc() +
                            '</option>';
                }
            }

            // Generate specific HTML code
            var favorites_bubble = '<option value="none" class="gc-join-first-option" selected="">' +
                                        Common._e("Select a favorite") +
                                   '</option>' + html;

            var favorites_popup = '<option value="none" class="fedit-head-select-first-option" selected="">' +
                                        Common._e("Select a favorite") +
                                  '</option>' + html;

            // Append the HTML code
            $('#roster .buddy-conf-groupchat-select').html(favorites_bubble);
            $('#favorites .fedit-head-select').html(favorites_popup);
        } catch(e) {
            Console.error('Favorites.load', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            var favorites_sel = $('#favorites');

            // Keyboard events
            favorites_sel.find('.fsearch-head-server').keyup(function(e) {
                if(e.keyCode == 13) {
                    var this_sel = $(this);

                    // No value?
                    if(!this_sel.val()) {
                        this_sel.val(HOST_MUC);
                    }

                    // Get the list
                    self.getGCList();
                }
            });

            favorites_sel.find('.fedit-line input').keyup(function(e) {
                if(e.keyCode == 13) {
                    // Edit a favorite
                    if(favorites_sel.find('.fedit-edit').is(':visible')) {
                        self.terminateThis('edit');
                    } else {
                        self.terminateThis('add');
                    }
                }
            });

            // Change events
            $('.fedit-head-select').change(self.edit);

            // Click events
            favorites_sel.find('.room-switcher').click(function() {
                favorites_sel.find('.favorites-content').hide();
                self.reset();
            });

            favorites_sel.find('.room-list').click(function() {
                favorites_sel.find('.favorites-edit').show();
            });

            favorites_sel.find('.room-search').click(function() {
                favorites_sel.find('.favorites-search').show();
                self.getGCList();
            });

            favorites_sel.find('.fedit-add').click(function() {
                return self.terminateThis('add');
            });

            favorites_sel.find('.fedit-edit').click(function() {
                return self.terminateThis('edit');
            });

            favorites_sel.find('.fedit-remove').click(function() {
                return self.terminateThis('remove');
            });

            favorites_sel.find('.bottom .finish').click(function() {
                return self.quit();
            });
        } catch(e) {
            Console.error('Favorites.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();