/*

Jappix - An open social platform
These are the Jappix Me tool functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Me = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the Me tools
     * @public
     * @return {undefined}
     */
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Public profile") + '</div>' +

            '<div class="content">' +
                '<a class="me-images logo" href="https://me.jappix.com/" target="_blank"></a>' +

                '<div class="infos">' +
                    '<p class="infos-title">' + Common._e("Your profile anywhere on the Web.") + '</p>' +
                    '<p>' + Common.printf(Common._e("%s is a Jappix.com service which makes your XMPP profile public. It is easier to share it. No XMPP account is required to view your social channel, your current position and your contact details."), '<a href="https://me.jappix.com/" target="_blank">Jappix Me</a>') + '</p>' +
                    '<p>' + Common._e("Furthermore, every picture you post in your social channel is added to a beautiful picture timeline. You can now view the pictures you shared year by year.") + '</p>' +
                    '<p>' + Common._e("You can also use your XMPP avatar as a single avatar for every website, blog and forum you use. When you change it on XMPP, the new avatar appears everywhere. What a genius improvement!") + '</p>' +
                '</div>' +

                '<a class="go one-button" href="https://me.jappix.com/new" target="_blank">' + Common._e("Yay, let's create your public profile!") + '</a>' +
            '</div>' +

            '<div class="bottom">' +
                '<a href="#" class="finish">' + Common._e("Close") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('me', html);

            // Associate the events
            self.instance();

            Console.log('Public profile tool opened.');
        } catch(e) {
            Console.error('Me.open', e);
        }

    };


    /**
     * Closes the Me tools
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('me');

            // We finished
            Welcome.is_done = false;
        } catch(e) {
            Console.error('Me.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            var me_sel = $('#me');

            // Click events
            me_sel.find('.content a.go').click(function() {
                self.close();
            });

            me_sel.find('.bottom .finish').click(self.close);
        } catch(e) {
            Console.error('Me.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();