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
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Commands") + '</div>' +

            '<div class="content">' +
                '<div class="adhoc-head"></div>' +

                '<div class="results adhoc-results"></div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish">' + Common._e("Close") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('adhoc', html);

            // Associate the events
            self.launch();
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
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('adhoc');
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
    self.retrieve = function(xid) {

        try {
            // Open the popup
            self.open();

            // Add a XID marker
            $('#adhoc .adhoc-head').html('<b>' + Name.getBuddy(xid).htmlEnc() + '</b> (' + xid.htmlEnc() + ')');

            // Get the highest entity resource
            var highest = Presence.highestPriority(xid);

            if(highest)
                xid = highest;

            // Start a new adhoc command
            DataForm.go(xid, 'command', '', '', 'adhoc');
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
    self.server = function(server) {

        try {
            // Open the popup
            self.open();

            // Add a XID marker
            $('#adhoc .adhoc-head').html('<b>' + server.htmlEnc() + '</b>');

            // Start a new adhoc command
            DataForm.go(server, 'command', '', '', 'adhoc');
        } catch(e) {
            Console.error('AdHoc.server', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            // Click event
            $('#adhoc .bottom .finish').click(self.close);
        } catch(e) {
            Console.error('AdHoc.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();