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

    
	// Gets the features of a server
	function getFeatures() {
		/* REF: http://xmpp.org/extensions/xep-0030.html */
		
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
	}

	// Handles the features of a server
	function handleFeatures(xml) {
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
		
		return false;
	}

	// The function to apply the features to an element
	function applyFeatures(id) {
		// Path to the elements
		var path = '#' + id + ' .';
		
		// PEP features
		if(enabledPEP())
			$(path + 'pep-hidable').show();
		
		// PubSub features
		if(enabledPubSub())
			$(path + 'pubsub-hidable').show();

		// PubSub Config-Node features
		if(enabledPubSubCN())
			$(path + 'pubsub-hidable-cn').show();
		
		// MAM features
		if(enabledMAM())
			$(path + 'mam-hidable').show();
		
		// Commands features
		if(enabledCommands())
			$(path + 'commands-hidable').show();
		
		// XMPP links (browser feature)
		if(navigator.registerProtocolHandler)
			$(path + 'xmpplinks-hidable').show();
	}

	// Enables a feature
	function enableFeature(feature) {
		setDB(DESKTOP_HASH, 'feature', feature, 'true');
	}

	// Checks if a feature is enabled
	function enabledFeature(feature) {
		if(getDB(DESKTOP_HASH, 'feature', feature) == 'true')
			return true;
		else
			return false;
	}

	// Returns the XMPP server PEP support
	function enabledPEP() {
		return enabledFeature('pep');
	}

	// Returns the XMPP server PubSub support
	function enabledPubSub() {
		return enabledFeature(NS_PUBSUB);
	}

	// Returns the XMPP server PubSub Config-Node support
	function enabledPubSubCN() {
		return enabledFeature(NS_PUBSUB_CN);
	}

	// Returns the XMPP server MAM support
	function enabledMAM() {
		return enabledFeature(NS_URN_MAM);
	}

	// Returns the XMPP server commands support
	function enabledCommands() {
		return enabledFeature(NS_COMMANDS);
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
     * Return class scope
     */
    return self;

})();