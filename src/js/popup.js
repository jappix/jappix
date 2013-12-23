/*

Jappix - An open social platform
These are the popup JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Popup = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Creates a popup code
     * @public
     * @param {string} id
     * @param {string} content
     * @return {boolean}
     */
    self.createPopup = function(id, content) {

        try {
            // Popup exists?
            if(exists('#' + id))
                return false;
            
            // Popop on top of another one?
            var top_of = exists('div.lock:has(div.popup)');
            
            // Append the popup code
            $('body').append(
                '<div id="' + id + '" class="lock removable">' + 
                    '<div class="popup">' + 
                        content + 
                    '</div>' + 
                '</div>'
            );
            
            // Avoids darker popup background (if on top of another popup)
            if(top_of)
                $('#' + id).css('background', 'transparent');
            
            // Attach popup events
            launchPopup(id);
            
            return true;
        } catch(e) {
            Console.error('Popup.create', e);
        }

    };


    /**
     * Destroys a popup code
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.destroyPopup = function(id) {

        try {
            // Stop the popup timers
            $('#' + id + ' *').stopTime();
            
            // Remove the popup
            $('#' + id).remove();
            
            // Manage input focus
            inputFocus();
        } catch(e) {
            Console.error('Popup.destroy', e);
        }

    };


    /**
     * Attaches popup events
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.launchPopup = function(id) {

        try {
            // Click events
            $('#' + id).click(function(evt) {
                // Click on lock background?
                if($(evt.target).is('.lock:not(.unavoidable)')) {
                    // Destroy the popup
                    destroyPopup(id);
                    
                    return false;
                }
            });
        } catch(e) {
            Console.error('Popup.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();