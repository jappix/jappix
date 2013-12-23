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

    
	// Gets an user name for buddy add tool
	function getAddUserName(xid) {
		var iq = new JSJaCIQ();
		iq.setType('get');
		iq.setTo(xid);
		
		iq.appendNode('vCard', {'xmlns': NS_VCARD});
		
		con.send(iq, handleAddUserName);
	}

	// Handles an user name for buddy add tool
	function handleAddUserName(iq) {
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
		
		return false;
	}

	// Generates the good buddy name from a vCard IQ reply
	function generateBuddyName(iq) {
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
	}

	// Returns the given XID buddy name
	function getBuddyName(xid) {
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
	}

	// Gets the nickname of the user
	function getNick() {
		try {
			// Try to read the user nickname
			var nick = getDB(DESKTOP_HASH, 'profile', 'nick');
			
			// No nick?
			if(!nick)
				nick = con.username;
			
			return nick;
		} catch(e) {}
	}

	// Gets the full name of the user
	function getName() {
		// Try to read the user name
		var name = getDB(DESKTOP_HASH, 'profile', 'name');
		
		// No name? Use the nickname instead!
		if(!name)
			name = getNick();
		
		return name;
	}

	// Gets the MUC nickname of the user
	function getMUCNick(id) {
		return unescape($('#' + id).attr('data-nick'));
	}







	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


	/**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * XXXXXX
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.xxxx = function() {

        try {
            // CODE
        } catch(e) {
            Console.error('YYYYY.xxxx', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();