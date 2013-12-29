/*

Jappix - An open social platform
These are the Message Carbons JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Carbons = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Configures Message Carbons options
     * @public
     * @param {string} type
     * @return {undefined}
     */
    self._configure = function(type) {

        try {
            if(!(type in {'enable': 1, 'disable': 1})) {
                Console.error('Carbons._configure', 'Invalid type (must be either "enable" or "disable")'); return;
            }

            var iq = new JSJaCIQ();
            iq.setType('set');
            
            iq.appendNode(type, {'xmlns': NS_URN_CARBONS});
            
            con.send(iq, self._handleConfigure);
        } catch(e) {
            Console.error('Carbons._configure', e);
        }

    };


    /**
     * Configures Message Carbons options
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self._handleConfigure = function(iq) {

        try {
            if(iq.getType() === 'result') {
                Console.log('Message Carbons successfully configured');
            } else {
                Console.error('Message Carbons could not be configured');
            }
        } catch(e) {
            Console.error('Carbons._handleConfigure', e);
        }

    };


    /**
     * Enables Message Carbons for this session
     * @public
     * @return {undefined}
     */
    self.enable = function() {

        try {
            self._configure('enable');
        } catch(e) {
            Console.error('Carbons.enable', e);
        }

    };


    /**
     * Disables Message Carbons for this session
     * @public
     * @return {undefined}
     */
    self.disable = function() {

        try {
            self._configure('disable');
        } catch(e) {
            Console.error('Carbons.disable', e);
        }

    };


    /**
     * Returns whether the server has Carbons support or not
     * @public
     * @return {boolean}
     */
    self.has = function() {

        try {
            return Features.enabledCarbons();
        } catch(e) {
            Console.error('Carbons.has', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();