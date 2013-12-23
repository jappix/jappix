/*

Jappix - An open social platform
These are the Ad-Hoc JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var AdHoc = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the adhoc popup
     * @public
     * @return {boolean}
     */
    self.openAdHoc = function() {

        try {
            // Popup HTML content
            var html = 
            '<div class="top">' + _e("Commands") + '</div>' + 
            
            '<div class="content">' + 
                '<div class="adhoc-head"></div>' + 
                
                '<div class="results adhoc-results"></div>' + 
            '</div>' + 
            
            '<div class="bottom">' + 
                '<div class="wait wait-medium"></div>' + 
                
                '<a href="#" class="finish">' + _e("Close") + '</a>' + 
            '</div>';
            
            // Create the popup
            createPopup('adhoc', html);
            
            // Associate the events
            launchAdHoc();
        } catch(e) {
            Console.error('AdHoc.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Closes the adhoc popup
     * @public
     * @return {boolean}
     */
    self.closeAdHoc = function() {

        try {
            // Destroy the popup
            destroyPopup('adhoc');
        } catch(e) {
            Console.error('AdHoc.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Retrieves an entity adhoc command
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.retrieveAdHoc = function(xid) {

        try {
            // Open the popup
            openAdHoc();
            
            // Add a XID marker
            $('#adhoc .adhoc-head').html('<b>' + getBuddyName(xid).htmlEnc() + '</b> (' + xid.htmlEnc() + ')');
            
            // Get the highest entity resource
            var highest = highestPriority(xid);
            
            if(highest)
                xid = highest;
            
            // Start a new adhoc command
            dataForm(xid, 'command', '', '', 'adhoc');
        } catch(e) {
            Console.error('AdHoc.retrieve', e);
        } finally {
            return false;
        }

    };


    /**
     * Starts an adhoc command on the user server
     * @public
     * @param {string} server
     * @return {undefined}
     */
    self.serverAdHoc = function(server) {

        try {
            // Open the popup
            openAdHoc();
            
            // Add a XID marker
            $('#adhoc .adhoc-head').html('<b>' + server.htmlEnc() + '</b>');
            
            // Start a new adhoc command
            dataForm(server, 'command', '', '', 'adhoc');
        } catch(e) {
            Console.error('AdHoc.server', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launchAdHoc = function() {

        try {
            // Click event
            $('#adhoc .bottom .finish').click(closeAdHoc);
        } catch(e) {
            Console.error('AdHoc.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();