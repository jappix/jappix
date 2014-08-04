/*

Jappix - An open social platform
These are the storage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Storage = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


      /**
     * Gets the storage items of the user
     * @public
     * @param {string} type
     * @return {undefined}
     */
    self.get = function(type) {

        /* REF: http://xmpp.org/extensions/xep-0049.html */

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');

            var iqQuery = iq.setQuery(NS_PRIVATE);
            iqQuery.appendChild(iq.buildNode('storage', {'xmlns': type}));

            con.send(iq, self.handle);
        } catch(e) {
            Console.error('Storage.get', e);
        }

    };


    /**
     * Handles the storage items
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handle = function(iq) {

        try {
            var handleXML = iq.getQuery();
            var handleFrom = Common.fullXID(Common.getStanzaFrom(iq));

            // Define some vars
            var options = $(handleXML).find('storage[xmlns="' + NS_OPTIONS + '"]');
            var inbox = $(handleXML).find('storage[xmlns="' + NS_INBOX + '"]');
            var bookmarks = $(handleXML).find('storage[xmlns="' + NS_BOOKMARKS + '"]');
            var rosternotes = $(handleXML).find('storage[xmlns="' + NS_ROSTERNOTES + '"]');

            // No options and node not yet configured
            if(options.size() && !options.find('option').size() && (iq.getType() != 'error')) {
                Welcome.open();
            }

            // Parse the options xml
            options.find('option').each(function() {
                var this_sel = $(this);

                // We retrieve the informations
                var type = this_sel.attr('type');
                var value = this_sel.text();

                // We display the storage
                DataStore.setDB(Connection.desktop_hash, 'options', type, value);

                // If this is the buddy list show status
                if((type == 'roster-showall') && (value == '1')) {
                    Interface.showAllBuddies('storage');
                }
            });

            // Parse the inbox xml
            inbox.find('message').each(function() {
                var this_sel = $(this);

                Inbox.storeMessage(
                    this_sel.attr('from'),
                    this_sel.attr('subject'),
                    this_sel.text(),
                    this_sel.attr('status'),
                    this_sel.attr('id'),
                    this_sel.attr('date'),
                    [
                        this_sel.attr('file_title'),
                        this_sel.attr('file_href'),
                        this_sel.attr('file_type'),
                        this_sel.attr('file_length')
                    ]
                );
            });

            // Parse the bookmarks xml
            bookmarks.find('conference').each(function() {
                var this_sel = $(this);

                // We retrieve the informations
                var xid = this_sel.attr('jid');
                var name = this_sel.attr('name');
                var autojoin = this_sel.attr('autojoin');
                var password = this_sel.find('password').text();
                var nick = this_sel.find('nick').text();

                // Filter autojoin (compatibility)
                autojoin = ((autojoin == 'true') || (autojoin == '1')) ? 'true' : 'false';

                // We display the storage
                Favorites.display(xid, name, nick, autojoin, password);

                // Join the chat if autojoin is enabled
                if(autojoin == 'true') {
                    Chat.checkCreate(xid, 'groupchat', nick, password, name);
                }
            });

            // Parse the roster notes xml
            rosternotes.find('note').each(function() {
                var this_sel = $(this);

                DataStore.setDB(
                    Connection.desktop_hash,
                    'rosternotes',
                    this_sel.attr('jid'),
                    this_sel.text()
                );
            });

            // Options received
            if(options.size()) {
                Console.log('Options received.');

                // Now, get the inbox
                self.get(NS_INBOX);

                // Geolocate the user
                PEP.geolocate();

                $('.options-hidable').show();
            }

            // Inbox received
            else if(inbox.size()) {
                Console.log('Inbox received.');

                // Send the first presence!
                Presence.sendFirst(DataStore.getDB(Connection.desktop_hash, 'checksum', 1));

                // Check we have new messages (play a sound if any unread messages)
                if(Inbox.checkMessages()) {
                    Audio.play('notification');
                }

                $('.inbox-hidable').show();
            }

            // Bookmarks received
            else if(bookmarks.size()) {
                // Join the groupchats the admin defined (if any)
                Groupchat.joinConf();

                Console.log('Bookmarks received.');
            }

            // Roster notes received (for logger)
            else if(rosternotes.size()) {
                Console.log('Roster notes received.');
            }
        } catch(e) {
            Console.error('Storage.handle', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();