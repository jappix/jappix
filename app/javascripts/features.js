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


    /* Constants */
    self.SERVER_NAMES = [
        'metronome',
        'prosody',
        'ejabberd',
        'jabberd',
        'openfire',
        'tigase',
        'isode'
    ];


    /* Variables */
    self.server_name = null;


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
            if(caps) {
                xml = Common.XMLFromString(
                    DataStore.getPersistent('global', 'caps', caps)
                );
            }

            // Any stored data?
            if(xml) {
                self.handle(xml);

                Console.log('Read server CAPS from cache.');
            } else {
                // Not stored (or no CAPS)!
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

            // Functions
            var check_feature_fn = function(namespace) {
                // This weird selector fixes an IE8 bug...
                return (selector.find('feature').filter(function() {
                    return ($(this).attr('var') == namespace);
                }).size() > 0 ? true : false);
            };

            // Markers
            var namespaces = [NS_PUBSUB, NS_PUBSUB_CN, NS_URN_MAM, NS_COMMANDS, NS_URN_CARBONS, NS_URN_CORRECT];

            var identity = selector.find('identity');

            var cur_feature;
            var features = {
                // This weird selector fixes the same IE8 bug as above...
                'pep': (identity.filter(function() {
                    var this_sel = $(this);
                    return (this_sel.attr('category') == 'pubsub' && this_sel.attr('type') == 'pep');
                }).size() && true)
            };

            $.each(namespaces, function(n, namespace) {
                features[namespace] = check_feature_fn(namespace);

                if(features[namespace] === true) {
                    self.enable(namespace);
                }
            });

            // Retrieve server identity
            self.server_name = self._normalizeServerName(
                identity.filter('[category="server"]').attr('name')
            );

            // Enable the pep elements if available
            if(features.pep === true) {
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
            } else {
                Microblog.wait('unsync');

                Console.warn('XMPP server does not support PEP.');
            }

            // Hide the private life fieldset if nothing to show
            if(features.pep === false && features[NS_URN_MAM] === false) {
                $('#options fieldset.privacy').hide();
            }

            // Apply the features
            self.apply('talk');

            // Process the roster height
            if(features.pep === true) {
                Roster.adapt();
            }

            // Enable Message Carbons?
            if(features[NS_URN_CARBONS] === true) {
                Carbons.enable();
            }
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
                $(path + 'mam-showable').hide();
            }

            // MAM Purge
            if(self.enabledMAMPurge()) {
                $(path + 'mam-purge-hidable').show();
            }

            // Message correction features
            if(self.enabledCorrection()) {
                $(path + 'correction-hidable').show();
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
            DataStore.setDB(Connection.desktop_hash, 'feature', feature, 'true');
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
            return DataStore.getDB(Connection.desktop_hash, 'feature', feature) === 'true';
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
     * Returns Metronome MAM Purge support
     * @public
     * @return {boolean}
     */
    self.enabledMAMPurge = function() {

        try {
            if(self.isEnabled(NS_URN_MAM)) {
                return self.isEnabled(NS_METRONOME_MAM_PURGE);
            } else {
               return false;
            }
        } catch(e) {
            Console.error('Features.enabledMAMPurge', e);
        }

    };


    /**
     * Returns the XMPP server Carbons support
     * @public
     * @return {boolean}
     */
    self.enabledCarbons = function() {

        try {
            return self.isEnabled(NS_URN_CARBONS);
        } catch(e) {
            Console.error('Features.enabledCarbons', e);
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
     * Returns the XMPP server correction support
     * @public
     * @return {boolean}
     */
    self.enabledCorrection = function() {

        try {
            return self.isEnabled(NS_URN_CORRECT);
        } catch(e) {
            Console.error('Features.enabledCorrection', e);
        }

    };


    /**
     * Normalizes the XMPP server name
     * @private
     * @return {string}
     */
    self._normalizeServerName = function(name) {

        try {
            var cur_r;

            for(var i in self.SERVER_NAMES) {
                cur_r = new RegExp(self.SERVER_NAMES[i], 'gi');

                if(cur_r.exec(name) !== null) {
                    name = self.SERVER_NAMES[i];
                    break;
                }
            }
        } catch(e) {
            Console.error('Features._normalizeServerName', e);
        } finally {
            return name;
        }

    };


    /**
     * Returns the XMPP server name
     * @public
     * @return {string}
     */
    self.getServerName = function() {

        try {
            return self.server_name;
        } catch(e) {
            Console.error('Features.getServerName', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();