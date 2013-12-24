/*

Jappix - An open social platform
These are the XMPP links handling JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var XMPPLinks = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Does an action with the provided XMPP link
     * @public
     * @param {string} link
     * @return {boolean}
     */
    self.xmppLink = function(link) {

        /* REF: http://xmpp.org/registrar/querytypes.html */

        try {
            // Remove the "xmpp:" string
            link = Common.explodeThis(':', link, 1);
            
            // The XMPP URI has no "?"
            if(link.indexOf('?') == -1)
                Chat.checkCreate(link, 'chat');
            
            // Parse the URI
            else {
                var xid = Common.explodeThis('?', link, 0);
                var action = Common.explodeThis('?', link, 1);
                
                switch(action) {
                    // Groupchat
                    case 'join':
                        Chat.checkCreate(xid, 'groupchat');
                        
                        break;
                    
                    // Profile
                    case 'vcard':
                        openUserInfos(xid);
                        
                        break;
                    
                    // Subscription
                    case 'subscribe':
                        addThisContact(xid);
                        
                        break;
                    
                    // Unsubscription
                    case 'unsubscribe':
                        sendRoster(xid, 'remove');
                        
                        break;
                    
                    // Private chat
                    default:
                        Chat.checkCreate(xid, 'chat');
                        
                        break;
                }
            }
        } catch(e) {
            Console.error('XMPPLinks.do', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets the links vars (get parameters in URL)
     */
    var LINK_VARS = (function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        
        for(var i = 0; i < hashes.length; i++) {
            var hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = $.trim(decodeURIComponent(hash[1]));
        }
        
        return vars;
    })();


    /**
     * Return class scope
     */
    return self;

})();