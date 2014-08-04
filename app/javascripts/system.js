/*

Jappix - An open social platform
These are the system JS script for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Authors: Valérian Saliou, olivierm, regilero, Maranda

*/

// Bundle
var System = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Gets the current app location
     * @public
     * @return {string}
     */
    self.location = function() {

        try {
            var url = window.location.href;

            // If the URL has variables, remove them
            if(url.indexOf('?') != -1) {
                url = url.split('?')[0];
            }

            if(url.indexOf('#') != -1) {
                url = url.split('#')[0];
            }

            // No "/" at the end
            if(!url.match(/(.+)\/$/)) {
                url += '/';
            }

            return url;
        } catch(e) {
            Console.error('System.location', e);
        }

    };


    /**
     * Checks if we are in developer mode
     * @public
     * @return {boolean}
     */
    self.isDeveloper = function() {

        try {
            return (DEVELOPER === 'on');
        } catch(e) {
            Console.error('System.isDeveloper', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

var JappixSystem = System;