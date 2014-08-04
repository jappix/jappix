/*

Jappix - An open social platform
These are the discovery JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Discovery = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the discovery popup
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Service discovery") + '</div>' +

            '<div class="content">' +
                '<div class="discovery-head">' +
                    '<div class="disco-server-text">' + Common._e("Server to query") + '</div>' +

                    '<input name="disco-server-input" class="disco-server-input" value="' + Common.encodeQuotes(HOST_MAIN) + '" />' +
                '</div>' +

                '<div class="results discovery-results">' +
                    '<div class="disco-category disco-account">' +
                        '<p class="disco-category-title">' + Common._e("Accounts") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-auth">' +
                        '<p class="disco-category-title">' + Common._e("Authentications") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-automation">' +
                        '<p class="disco-category-title">' + Common._e("Automation") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-client">' +
                        '<p class="disco-category-title">' + Common._e("Clients") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-collaboration">' +
                        '<p class="disco-category-title">' + Common._e("Collaboration") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-component">' +
                        '<p class="disco-category-title">' + Common._e("Components") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-conference">' +
                        '<p class="disco-category-title">' + Common._e("Rooms") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-directory">' +
                        '<p class="disco-category-title">' + Common._e("Directories") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-gateway">' +
                        '<p class="disco-category-title">' + Common._e("Gateways") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-headline">' +
                        '<p class="disco-category-title">' + Common._e("News") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-hierarchy">' +
                        '<p class="disco-category-title">' + Common._e("Hierarchy") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-proxy">' +
                        '<p class="disco-category-title">' + Common._e("Proxies") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-pubsub">' +
                        '<p class="disco-category-title">' + Common._e("Publication/Subscription") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-server">' +
                        '<p class="disco-category-title">' + Common._e("Server") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-store">' +
                        '<p class="disco-category-title">' + Common._e("Storage") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-others">' +
                        '<p class="disco-category-title">' + Common._e("Others") + '</p>' +
                    '</div>' +

                    '<div class="disco-category disco-wait">' +
                        '<p class="disco-category-title">' + Common._e("Loading") + '</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish">' + Common._e("Close") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('discovery', html);

            // Associate the events
            self.instance();

            // We request a disco to the default server
            self.start();
        } catch(e) {
            Console.error('Discovery.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Quits the discovery popup
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('discovery');
        } catch(e) {
            Console.error('Discovery.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Launches a discovery
     * @public
     * @return {boolean}
     */
    self.start = function() {

        /* REF: http://xmpp.org/extensions/xep-0030.html */

        try {
            // We get the server to query
            var discoServer = $('#discovery .disco-server-input').val();

            // We launch the items query
            DataForm.go(discoServer, 'browse', '', '', 'discovery');

            Console.log('Service discovery launched: ' + discoServer);
        } catch(e) {
            Console.error('Discovery.start', e);
        } finally {
            return false;
        }

    };


    /**
     * Cleans the discovery results
     * @public
     * @return {boolean}
     */
    self.clean = function() {

        try {
            // We remove the results
            $('#discovery .discovery-oneresult, #discovery .oneinstructions, #discovery .onetitle, #discovery .no-results').remove();

            // We clean the user info
            $('#discovery .disco-server-info').text('');

            // We hide the wait icon, the no result alert and the results
            $('#discovery .wait, #discovery .disco-category').hide();
        } catch(e) {
            Console.error('Discovery.clean', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Click event
            $('#discovery .bottom .finish').click(self.close);

            // Keyboard event
            $('#discovery .disco-server-input').keyup(function(e) {
                if(e.keyCode == 13) {
                    // No value?
                    if(!$(this).val()) {
                        $(this).val(HOST_MAIN);
                    }

                    // Start the discovery
                    self.start();

                    return false;
                }
            });
        } catch(e) {
            Console.error('Discovery.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();