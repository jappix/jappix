/*

Jappix - An open social platform
Implementation of XEP-0308: Last Message Correction

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Correction = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Enter correction mode (for last message)
     * @public
     * @return {undefined}
     */
    self.enterCorrection = function(xid) {

        try {
            // TODO
        } catch(e) {
            Console.error('Correction.enterCorrection', e);
        }

    };


    /**
     * Leave correction mode
     * @public
     * @return {undefined}
     */
    self.leaveCorrection = function(xid) {

        try {
            // TODO
        } catch(e) {
            Console.error('Correction.leaveCorrection', e);
        }

    };


    /**
     * Send corrected message
     * @public
     * @return {undefined}
     */
    self.sendCorrection = function(original_id, xid) {

        try {
            // TODO
        } catch(e) {
            Console.error('Correction.sendCorrection', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();