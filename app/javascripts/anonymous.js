/*

Jappix - An open social platform
These are the anonymous mode JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, LinkMauve

*/

// Bundle
var Anonymous = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Registers connection handlers
     * @private
     * @param {object} con
     * @return {undefined}
     */
    self._registerHandlers = function(con) {

        try {
            con.registerHandler('message', Message.handle);
            con.registerHandler('presence', Presence.handle);
            con.registerHandler('iq', IQ.handle);
            con.registerHandler('onconnect', self.connected);
            con.registerHandler('onerror', Errors.handle);
            con.registerHandler('ondisconnect', self.disconnected);
        } catch(e) {
            Console.error('Anonymous._registerHandlers', e);
        }

    };


    /**
     * Connected to an anonymous session
     * @public
     * @return {undefined}
     */
    self.connected = function() {

        try {
            Console.info('Jappix (anonymous) is now connected.');

            // Connected marker
            Connection.connected = true;
            Connection.current_session = true;
            Connection.reconnect_try = 0;
            Connection.reconnect_timer = 0;

            // Not resumed?
            if(!Connection.resume) {
                // Create the app
                Talk.create();

                // Send our first presence
                Presence.sendFirst('');

                // Set last activity stamp
                DateUtils.last_activity = DateUtils.getTimeStamp();

                // Create the new groupchat
                Chat.checkCreate(Common.generateXID(ANONYMOUS_ROOM, 'groupchat'), 'groupchat');

                // Remove some nasty elements for the anonymous mode
                $('.tools-mucadmin, .tools-add').remove();
            }

            // Resumed
            else {
                // Send again our presence
                Presence.sendActions();

                // Change the title
                Interface.updateTitle();
            }

            // Remove the waiting icon
            Interface.removeGeneralWait();
        } catch(e) {
            Console.error('Anonymous.connected', e);
        }

    };


    /**
     * Disconnected from an anonymous session
     * @public
     * @return {undefined}
     */
    self.disconnected = function() {

        try {
            Console.info('Jappix (anonymous) is now disconnected.');
        } catch(e) {
            Console.error('Anonymous.disconnected', e);
        }

    };


    /**
     * Logins to a anonymous account
     * @public
     * @param {string} server
     * @return {boolean}
     */
    self.login = function(server) {

        try {
            if(Common.hasWebSocket()) {
                // WebSocket supported & configured
                con = new JSJaCWebSocketConnection({
                    httpbase: HOST_WEBSOCKET
                });
            } else {
                var httpbase = (HOST_BOSH_MAIN || HOST_BOSH);

                // Check BOSH origin
                BOSH_SAME_ORIGIN = Origin.isSame(httpbase);

                // We create the new http-binding connection
                con = new JSJaCHttpBindingConnection({
                    httpbase: httpbase
                });
            }

            // And we handle everything that happen
            self._registerHandlers(con);

            // We set the anonymous connection parameters
            oArgs = {};
            oArgs.domain = server;
            oArgs.authtype = 'saslanon';
            oArgs.resource = JAPPIX_RESOURCE + ' Anonymous (' + (new Date()).getTime() + ')';
            oArgs.secure = true;
            oArgs.xmllang = XML_LANG;

            // We connect !
            con.connect(oArgs);

            // Change the page title
            Interface.title('wait');
        } catch(e) {
            Console.error('Anonymous.login', e);

            // Reset Jappix
            self.disconnected();

            // Open an unknown error
            Board.openThisError(2);
        } finally {
            return false;
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            $(document).ready(function() {
                Console.info('Anonymous mode detected, connecting...');

                // We add the login wait div
                Interface.showGeneralWait();

                // Get the vars
                if(XMPPLinks.links_var.r) {
                    ANONYMOUS_ROOM = XMPPLinks.links_var.r;
                }

                if(XMPPLinks.links_var.n) {
                    ANONYMOUS_NICK = XMPPLinks.links_var.n;
                }

                // Fire the login action
                self.login(HOST_ANONYMOUS);
            });
        } catch(e) {
            Console.error('Anonymous.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Anonymous.launch();