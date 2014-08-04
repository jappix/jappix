/*

Jappix - An open social platform
These are the avatar JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Avatar = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.pending = [];


    /**
     * Requests the avatar of a given user
     * @public
     * @param {string} xid
     * @param {string} mode
     * @param {boolean} enabled
     * @param {boolean} photo
     * @return {boolean}
     */
    self.get = function(xid, mode, enabled, photo) {

        /* REF: http://xmpp.org/extensions/xep-0153.html */

        try {
            // No need to get the avatar, another process is yet running
            if(Utils.existArrayValue(self.pending, xid)) {
                return false;
            }

            // Initialize: XML data is in one SQL entry, because some browser are sloooow with SQL requests
            var xml = Common.XMLFromString(
                DataStore.getPersistent('global', 'avatar', xid)
            );
            var forced = false;

            // Retrieving forced?
            if($(xml).find('forced').text() == 'true') {
                forced = true;
            }

            // No avatar in presence
            if(!photo && !forced && enabled == 'true') {
                // Pending marker
                self.pending.push(xid);

                // Reset the avatar
                self.reset(xid, hex_md5(xid));

                Console.warn('No avatar for: ' + xid);
            }

            // Try to catch the avatar
            else {
                // Define some stuffs
                var type = $(xml).find('type').text();
                var binval = $(xml).find('binval').text();
                var checksum = $(xml).find('checksum').text();
                var updated = false;

                // Process the checksum of the avatar
                if(checksum == photo || photo == 'forget' || forced) {
                    updated = true;
                }

                // If the avatar is yet stored and a new retrieving is not needed
                if(mode == 'cache' && type && binval && checksum && updated) {
                    // Pending marker
                    self.pending.push(xid);

                    // Display the cache avatar
                    self.display(xid, hex_md5(xid), type, binval);

                    Console.info('Read avatar from cache: ' + xid);
                }

                // Else if the request has not yet been fired, we get it
                else if((!updated || mode == 'force' || photo == 'forget') && enabled != 'false') {
                    // Pending marker
                    self.pending.push(xid);

                    // Get the latest avatar
                    var iq = new JSJaCIQ();
                    iq.setType('get');
                    iq.setTo(xid);

                    iq.appendNode('vCard', {'xmlns': NS_VCARD});

                    con.send(iq, self.handle);

                    Console.info('Get avatar from server: ' + xid);
                }
            }

            return true;
        } catch(e) {
            Console.error('Avatar.get', e);
        }

    };


    /**
     * Handles the avatar
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handle = function(iq) {

        try {
            // Extract the XML values
            var handleXML = iq.getNode();
            var handleFrom = Common.fullXID(Common.getStanzaFrom(iq));

            // Is this me? Remove the resource!
            if(Common.bareXID(handleFrom) == Common.getXID()) {
                handleFrom = Common.bareXID(handleFrom);
            }

            // Get some other values
            var hash = hex_md5(handleFrom);
            var find = $(handleXML).find('vCard');
            var aChecksum = 'none';
            var oChecksum = null;

            // Read our own checksum
            if(handleFrom == Common.getXID()) {
                oChecksum = DataStore.getDB(Connection.desktop_hash, 'checksum', 1);

                // Avoid the "null" value
                if(!oChecksum) {
                    oChecksum = '';
                }
            }

            // vCard not empty?
            if(find.size()) {
                // We get our profile details
                if(handleFrom == Common.getXID()) {
                    // Get the names
                    var names = Name.generateBuddy(iq);
                    var phone_number = find.find('TEL:has(NUMBER):first NUMBER:first').text();

                    // Write the values to the database
                    DataStore.setDB(Connection.desktop_hash, 'profile', 'name', names[0]);
                    DataStore.setDB(Connection.desktop_hash, 'profile', 'nick', names[1]);
                    DataStore.setDB(Connection.desktop_hash, 'profile', 'phone', phone_number);
                }

                // We get the avatar
                var aType = find.find('TYPE:first').text();
                var aBinval = find.find('BINVAL:first').text();

                // No binval?
                if(!aBinval) {
                    aType = 'none';
                    aBinval = 'none';
                }

                // Enough data
                else {
                    // No type?
                    if(!aType) {
                        aType = 'image/png';
                    } else {
                        aChecksum = hex_sha1(Base64.decode(aBinval));
                    }
                }

                // We display the user avatar
                self.display(handleFrom, hash, aType, aBinval);

                // Store the avatar
                DataStore.setPersistent('global', 'avatar', handleFrom, '<avatar><type>' + aType + '</type><binval>' + aBinval + '</binval><checksum>' + aChecksum + '</checksum><forced>false</forced></avatar>');

                Console.info('Avatar retrieved from server: ' + handleFrom);
            }

            // vCard is empty
            else {
                self.reset(handleFrom);
            }

            // We got a new checksum for us?
            if(((oChecksum !== null) && (oChecksum != aChecksum)) || !Presence.first_sent) {
                // Define a proper checksum
                var pChecksum = aChecksum;

                if(pChecksum == 'none') {
                    pChecksum = '';
                }

                // Update our temp. checksum
                DataStore.setDB(Connection.desktop_hash, 'checksum', 1, pChecksum);

                // Send the stanza
                if(!Presence.first_sent) {
                    Storage.get(NS_OPTIONS);
                } else if(DataStore.hasPersistent()) {
                    Presence.sendActions(pChecksum);
                }
            }
        } catch(e) {
            Console.error('Avatar.handle', e);
        }

    };


    /**
     * Reset the avatar of an user
     * @public
     * @param {string} xid
     * @param {string} hash
     * @return {undefined}
     */
    self.reset = function(xid, hash) {

        try {
            // Store the empty avatar
            DataStore.setPersistent('global', 'avatar', xid, '<avatar><type>none</type><binval>none</binval><checksum>none</checksum><forced>false</forced></avatar>');

            // Display the empty avatar
            self.display(xid, hash, 'none', 'none');
        } catch(e) {
            Console.error('Avatar.reset', e);
        }

    };


    /**
     * Displays the avatar of an user
     * @public
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {string} binval
     * @return {undefined}
     */
    self.display = function(xid, hash, type, binval) {

        try {
            // Initialize the vars
            var container = hash + ' .avatar-container';
            var code = '<img class="avatar" src="';

            // If the avatar exists
            if((type != 'none') && (binval != 'none')) {
                code += 'data:' + type + ';base64,' + binval;
            } else {
                code += './images/others/default-avatar.png';
            }

            code += '" alt="" />';

            // Replace with the new avatar (in the roster and in the chat)
            $('.' + container).html(code);

            // We can remove the pending marker
            Utils.removeArrayValue(self.pending, xid);
        } catch(e) {
            Console.error('Avatar.display', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();