/*

Jappix - An open social platform
These are the buddy name related JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Name = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Gets an user name for buddy add tool
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.getAddUser = function(xid) {

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');
            iq.setTo(xid);

            iq.appendNode('vCard', {'xmlns': NS_VCARD});

            con.send(iq, self.handleAddUser);
        } catch(e) {
            Console.error('Name.getAddUser', e);
        }

    };


    /**
     * Handles an user name for buddy add tool
     * @public
     * @param {object} iq
     * @return {boolean}
     */
    self.handleAddUser = function(iq) {

        try {
            // Was it an obsolete request?
            if(!Common.exists('.add-contact-name-get[data-for="' + escape(Common.bareXID(Common.getStanzaFrom(iq))) + '"]')) {
                return false;
            }

            // Reset the waiting item
            $('.add-contact-name-get').hide().removeAttr('data-for');

            // Get the names
            if(iq.getType() == 'result') {
                var full_name = self.generateBuddy(iq)[0];

                if(full_name) {
                    $('.add-contact-name').val(full_name);
                }
            }
        } catch(e) {
            Console.error('Name.handleAddUser', e);
        } finally {
            return false;
        }

    };


    /**
     * Generates the good buddy name from a vCard IQ reply
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.generateBuddy = function(iq) {

        try {
            // Get the IQ content
            var vcard_sel = $(iq.getNode()).find('vCard');

            // Get the full name & the nickname
            var pFull = vcard_sel.find('FN:first').text();
            var pNick = vcard_sel.find('NICKNAME:first').text();

            // No full name?
            if(!pFull) {
                // Get the given name
                var pN = vcard_sel.find('N:first');
                var pGiven = pN.find('GIVEN:first').text();

                if(pGiven) {
                    pFull = pGiven;

                    // Get the family name (optional)
                    var pFamily = pN.find('FAMILY:first').text();

                    if(pFamily) {
                        pFull += ' ' + pFamily;
                    }
                }
            }

            return [pFull, pNick];
        } catch(e) {
            Console.error('Name.generateBuddy', e);
        }

    };


    /**
     * Returns the given XID buddy name
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.getBuddy = function(xid) {

        try {
            // Initialize
            var cname, bname;

            // If the buddy is an anonymous account we use the resource
            // if not empty
            if (self.buddyIsAnonymous(xid) && Common.thisResource(xid)) {
              bname = Common.thisResource(xid);
            } else {

              // Cut the XID resource
              xid = Common.bareXID(xid);

              // This is me?
              if(Utils.isAnonymous() && !xid) {
                  bname = Common._e("You");
              } else if(xid == Common.getXID()) {
                  bname = self.get();
              }

              // Not me!
              else {
                  cname = $('#roster .buddy[data-xid="' + escape(xid) + '"]:first .buddy-name').html();

                  // Complete name exists?
                  if(cname) {
                      bname = cname.revertHtmlEnc();
                  } else {
                      bname = Common.getXIDNick(xid);
                  }
              }
            }

            return bname;
        } catch(e) {
            Console.error('Name.getBuddy', e);
        }

    };


    /**
     * Gets the nickname of the user
     * @public
     * @return {string}
     */
    self.getNick = function() {

        try {
            // Try to read the user nickname
            var nick = DataStore.getDB(Connection.desktop_hash, 'profile', 'nick');

            // No nick?
            if(!nick) {
                nick = con.username;
            }

            return nick;
        } catch(e) {
            Console.error('Name.getNick', e);
        }

    };


    /**
     * Gets the full name of the user
     * @public
     * @return {string}
     */
    self.get = function() {

        try {
            // Try to read the user name
            var name = DataStore.getDB(Connection.desktop_hash, 'profile', 'name');

            // No name? Use the nickname instead
            if(!name) {
                name = self.getNick();
            }

            return name;
        } catch(e) {
            Console.error('Name.get', e);
        }

    };


    /**
     * Gets the MUC nickname of the user
     * @public
     * @param {string} id
     * @return {string}
     */
    self.getMUCNick = function(id) {

        try {
            return unescape($('#' + id).attr('data-nick'));
        } catch(e) {
            Console.error('Name.getMUCNick', e);
        }

    };

    /*
     * Checks if the XID is from an anonymous account
     * @public
     * @param {string} xid
     */
    self.buddyIsAnonymous = function(xid) {
      return /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)@/ig.test(xid);
    };


    /**
     * Return class scope
     */
    return self;

})();
