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
    self.getAddUserName = function(xid) {

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');
            iq.setTo(xid);
            
            iq.appendNode('vCard', {'xmlns': NS_VCARD});
            
            con.send(iq, handleAddUserName);
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
    self.handleAddUserName = function(iq) {

        try {
            // Was it an obsolete request?
            if(!exists('.add-contact-name-get[data-for="' + escape(bareXID(getStanzaFrom(iq))) + '"]'))
                return false;
            
            // Reset the waiting item
            $('.add-contact-name-get').hide().removeAttr('data-for');
            
            // Get the names
            if(iq.getType() == 'result') {
                var full_name = generateBuddyName(iq)[0];
                
                if(full_name)
                    $('.add-contact-name').val(full_name);
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
    self.generateBuddyName = function(iq) {

        try {
            // Get the IQ content
            var xml = $(iq.getNode()).find('vCard');
            
            // Get the full name & the nickname
            var pFull = xml.find('FN:first').text();
            var pNick = xml.find('NICKNAME:first').text();
            
            // No full name?
            if(!pFull) {
                // Get the given name
                var pN = xml.find('N:first');
                var pGiven = pN.find('GIVEN:first').text();
                
                if(pGiven) {
                    pFull = pGiven;
                    
                    // Get the family name (optional)
                    var pFamily = pN.find('FAMILY:first').text();
                    
                    if(pFamily)
                        pFull += ' ' + pFamily;
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
    self.getBuddyName = function(xid) {

        try {
            // Initialize
            var cname, bname;
            
            // Cut the XID resource
            xid = bareXID(xid);
            
            // This is me?
            if(isAnonymous() && !xid)
                bname = _e("You");
            else if(xid == getXID())
                bname = getName();
            
            // Not me!
            else {
                cname = $('#buddy-list .buddy[data-xid="' + escape(xid) + '"]:first .buddy-name').html();
                
                // If the complete name exists
                if(cname)
                    bname = cname.revertHtmlEnc();
                
                // Else, we just get the nickname of the buddy
                else
                    bname = getXIDNick(xid);
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
            var nick = getDB(DESKTOP_HASH, 'profile', 'nick');
            
            // No nick?
            if(!nick)
                nick = con.username;
            
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
    self.getName = function() {

        try {
            // Try to read the user name
            var name = getDB(DESKTOP_HASH, 'profile', 'name');
            
            // No name? Use the nickname instead!
            if(!name)
                name = getNick();
            
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


    /**
     * Return class scope
     */
    return self;

})();