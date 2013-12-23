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
    self.getFeatures = function() {

        /* REF: http://xmpp.org/extensions/xep-0030.html */

        try {
            // Get the main values
            var to = getServer();
            var caps = con.server_caps;
            var xml = null;
            
            // Try to get the stored data
            if(caps)
                xml = XMLFromString(getPersistent('global', 'caps', caps));
            
            // Any stored data?
            if(xml) {
                handleFeatures(xml);
                
                Console.log('Read server CAPS from cache.');
            }
            
            // Not stored (or no CAPS)!
            else {
                var iq = new JSJaCIQ();
                
                iq.setTo(to);
                iq.setType('get');
                iq.setQuery(NS_DISCO_INFO);
                
                con.send(iq, handleDiscoInfos);
                
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
    self.handleFeatures = function(xml) {

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
                enableFeature('pep');
                
                // Get the PEP nodes to initiate
                getInitMicroblog();
                getInitGeoloc();
                
                // Get the notifications
                getNotifications();
                
                // Geolocate the user
                geolocate();
                
                // Enable microblogging send tools
                waitMicroblog('sync');
                $('.postit.attach').css('display', 'block');
                
                Console.info('XMPP server supports PEP.');
            }
            
            // Disable microblogging send tools (no PEP!)
            else {
                waitMicroblog('unsync');
                
                Console.warn('XMPP server does not support PEP.');
            }
            
            // Enable the pubsub features if available
            if(pubsub)
                enableFeature(NS_PUBSUB);

            // Enable the pubsub config-node features if available
            if(pubsub_cn)
                enableFeature(NS_PUBSUB_CN);
            
            // Enable the message MAM management features if available
            if(mam)
                enableFeature(NS_URN_MAM);
            
            // Enable the commands features if available
            if(commands)
                enableFeature(NS_COMMANDS);
            
            // Hide the private life fieldset if nothing to show
            if(!pep && !mam)
                $('#options fieldset.privacy').hide();
            
            // Apply the features
            applyFeatures('talk');
            
            // Process the buddy-list height
            if(pep)
                adaptRoster();
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
    self.applyFeatures = function(id) {

        try {
            // Path to the elements
            var path = '#' + id + ' .';
            
            // PEP features
            if(enabledPEP()) {
                $(path + 'pep-hidable').show();
            }
            
            // PubSub features
            if(enabledPubSub()) {
                $(path + 'pubsub-hidable').show();
            }

            // PubSub Config-Node features
            if(enabledPubSubCN()) {
                $(path + 'pubsub-hidable-cn').show();
            }
            
            // MAM features
            if(enabledMAM()) {
                $(path + 'mam-hidable').show();
            }
            
            // Commands features
            if(enabledCommands()) {
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
    self.enableFeature = function(feature) {

        try {
            setDB(DESKTOP_HASH, 'feature', feature, 'true');
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
    self.enabledFeature = function(feature) {

        try {
            return getDB(DESKTOP_HASH, 'feature', feature) === 'true';
        } catch(e) {
            Console.error('Features.enabled', e);
        }

    };


	/**
     * Returns the XMPP server PEP support
     * @public
     * @return {boolean}
     */
    self.enabledPEP = function() {

        try {
            return enabledFeature('pep');
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
            return enabledFeature(NS_PUBSUB);
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
            return enabledFeature(NS_PUBSUB_CN);
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
            return enabledFeature(NS_URN_MAM);
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
            return enabledFeature(NS_COMMANDS);
        } catch(e) {
            Console.error('Features.enabledCommands', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();