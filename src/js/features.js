/*

Jappix - An open social platform
This is the server features JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Features = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Gets the features of a server
     * @public
     * @return {undefined}
     */
    self.get = function() {

        /* REF: http://xmpp.org/extensions/xep-0030.html */

        try {
            // Get the main values
            var to = Utils.getServer();
            var caps = con.server_caps;
            var xml = null;
            
            // Try to get the stored data
            if(caps)
                xml = Common.XMLFromString(
                    DataStore.getPersistent('global', 'caps', caps)
                );
            
            // Any stored data?
            if(xml) {
                self.handle(xml);
                
                Console.log('Read server CAPS from cache.');
            }
            
            // Not stored (or no CAPS)!
            else {
                var iq = new JSJaCIQ();
                
                iq.setTo(to);
                iq.setType('get');
                iq.setQuery(NS_DISCO_INFO);
                
                con.send(iq, Caps.handleDiscoInfos);
                
                Console.log('Read server CAPS from network.');
            }
        } catch(e) {
            Console.error('Features.get', e);
        }

    };


    /**
     * Handles the features of a server
     * @public
     * @param {string} xml
     * @return {boolean}
     */
    self.handle = function(xml) {

        try {
            // Selector
            var selector = $(xml);
            
            // Markers
            var pep = false;
            var pubsub = false;
            var pubsub_cn = false;
            var mam = false;
            var commands = false;
            
            // Scan the features
            if(selector.find('identity[category="pubsub"][type="pep"]').size())
                pep = true;
            if(selector.find('feature[var="' + NS_PUBSUB + '"]').size())
                pubsub = true;
            if(selector.find('feature[var="' + NS_PUBSUB_CN + '"]').size())
                pubsub_cn = true;
            if(selector.find('feature[var="' + NS_URN_MAM + '"]').size())
                mam = true;
            if(selector.find('feature[var="' + NS_COMMANDS + '"]').size())
                commands = true;
            
            // Enable the pep elements if available
            if(pep) {
                // Update our database
                self.enable('pep');
                
                // Get the PEP nodes to initiate
                Microblog.getInit();
                PEP.getInitGeoloc();
                
                // Get the notifications
                Notification.get();
                
                // Geolocate the user
                PEP.geolocate();
                
                // Enable microblogging send tools
                Microblog.wait('sync');
                $('.postit.attach').css('display', 'block');
                
                Console.info('XMPP server supports PEP.');
            }
            
            // Disable microblogging send tools (no PEP!)
            else {
                Microblog.wait('unsync');
                
                Console.warn('XMPP server does not support PEP.');
            }
            
            // Enable the pubsub features if available
            if(pubsub)
                self.enable(NS_PUBSUB);

            // Enable the pubsub config-node features if available
            if(pubsub_cn)
                self.enable(NS_PUBSUB_CN);
            
            // Enable the message MAM management features if available
            if(mam)
                self.enable(NS_URN_MAM);
            
            // Enable the commands features if available
            if(commands)
                self.enable(NS_COMMANDS);
            
            // Hide the private life fieldset if nothing to show
            if(!pep && !mam)
                $('#options fieldset.privacy').hide();
            
            // Apply the features
            self.apply('talk');
            
            // Process the buddy-list height
            if(pep)
                Roster.adapt();
        } catch(e) {
            Console.error('Features.handle', e);
        } finally {
            return false;
        }

    };


    /**
     * The function to apply the features to an element
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.apply = function(id) {

        try {
            // Path to the elements
            var path = '#' + id + ' .';
            
            // PEP features
            if(self.enabledPEP()) {
                $(path + 'pep-hidable').show();
            }
            
            // PubSub features
            if(self.enabledPubSub()) {
                $(path + 'pubsub-hidable').show();
            }

            // PubSub Config-Node features
            if(self.enabledPubSubCN()) {
                $(path + 'pubsub-hidable-cn').show();
            }
            
            // MAM features
            if(self.enabledMAM()) {
                $(path + 'mam-hidable').show();
            }
            
            // Commands features
            if(self.enabledCommands()) {
                $(path + 'commands-hidable').show();
            }
            
            // XMPP links (browser feature)
            if(navigator.registerProtocolHandler) {
                $(path + 'xmpplinks-hidable').show();
            }
        } catch(e) {
            Console.error('Features.apply', e);
        }

    };


    /**
     * Enables a feature
     * @public
     * @param {string} feature
     * @return {undefined}
     */
    self.enable = function(feature) {

        try {
            DataStore.setDB(DESKTOP_HASH, 'feature', feature, 'true');
        } catch(e) {
            Console.error('Features.enable', e);
        }

    };


    /**
     * Checks if a feature is enabled
     * @public
     * @param {string} feature
     * @return {boolean}
     */
    self.isEnabled = function(feature) {

        try {
            return DataStore.getDB(DESKTOP_HASH, 'feature', feature) === 'true';
        } catch(e) {
            Console.error('Features.isEnabled', e);
        }

    };


	/**
     * Returns the XMPP server PEP support
     * @public
     * @return {boolean}
     */
    self.enabledPEP = function() {

        try {
            return self.isEnabled('pep');
        } catch(e) {
            Console.error('Features.enabledPEP', e);
        }

    };


    /**
     * Returns the XMPP server PubSub support
     * @public
     * @return {boolean}
     */
    self.enabledPubSub = function() {

        try {
            return self.isEnabled(NS_PUBSUB);
        } catch(e) {
            Console.error('Features.enabledPubSub', e);
        }

    };


    /**
     * Returns the XMPP server PubSub Config-Node support
     * @public
     * @return {boolean}
     */
    self.enabledPubSubCN = function() {

        try {
            return self.isEnabled(NS_PUBSUB_CN);
        } catch(e) {
            Console.error('Features.enabledPubSubCN', e);
        }

    };


    /**
     * Returns the XMPP server MAM support
     * @public
     * @return {boolean}
     */
    self.enabledMAM = function() {

        try {
            return self.isEnabled(NS_URN_MAM);
        } catch(e) {
            Console.error('Features.enabledMAM', e);
        }

    };


    /**
     * Returns the XMPP server commands support
     * @public
     * @return {boolean}
     */
    self.enabledCommands = function() {

        try {
            return self.isEnabled(NS_COMMANDS);
        } catch(e) {
            Console.error('Features.enabledCommands', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();