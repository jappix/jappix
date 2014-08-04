/*

Jappix - An open social platform
These are the connection JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda

*/

// Bundle
var Connection = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.current_session = false;
    self.desktop_hash = null;
    self.connected = false;
    self.reconnect_try = 0;
    self.reconnect_timer = 0;
    self.resume = false;


    /**
     * Do registration on Register API
     * @private
     * @param {string} username
     * @param {string} domain
     * @param {string} pass
     * @param {string} captcha
     * @return {boolean}
     */
    self._doRegisterAPI = function(username, domain, pass, captcha) {

        var is_success = false;

        try {
            // Show the waiting image
            Interface.showGeneralWait();

            // Change the page title
            Interface.title('wait');

            // Send request
            $.post('./server/register.php', {username: username, domain: domain, password: pass, captcha: captcha}, function(data) {
                // Error registering
                Interface.removeGeneralWait();
                Interface.title('home');

                // In all case, update CAPTCHA
                $('#home img.captcha_img').attr('src', './server/captcha.php?id=' + genID());
                $('#home input.captcha').val('');

                // Registration okay
                if($(data).find('query status').text() == '1') {
                    is_success = true;
                    self.handleRegistered();
                } else {
                    // Show error message
                    var error_message = '';

                    switch($(data).find('query message').text()) {
                        case 'CAPTCHA Not Matching':
                            error_message = Common._e("The security code you entered is invalid. Please retry with another one.");

                            $('#home input.captcha').focus();

                            break;

                        case 'Username Unavailable':
                            error_message = Common._e("The username you picked is not available. Please try another one.");

                            $('#home input.nick').focus();

                            break;

                        default:
                            error_message = Common._e("There was an error registering your account. Please retry.");

                            break;
                    }

                    if(error_message) {
                        Errors.show('', error_message, '');
                    }
                }
            });
        } catch(e) {
            Console.error('Connection._doRegisterAPI', e);
        } finally {
            return is_success;
        }

    };


    /**
     * Do registration throug in-band stream
     * @private
     * @param {string} username
     * @param {string} domain
     * @param {string} pass
     * @return {boolean}
     */
    self._doRegisterInBand = function(username, domain, pass) {

        var is_success = true;

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

            // We setup the connection !
            con.registerHandler('onconnect', self.handleRegistered);
            con.registerHandler('onerror', Errors.handle);

            con.connect({
                'domain': $.trim(domain),
                'username': $.trim(username),
                'resource': JAPPIX_RESOURCE + ' Register (' + (new Date()).getTime() + ')',
                'pass': pass,
                'register': true,
                'secure': true,
                'xmllang': XML_LANG
            });

            // Show the waiting image
            Interface.showGeneralWait();

            // Change the page title
            Interface.title('wait');
        } catch(e) {
            Console.error('Connection._doRegisterInBand', e);
            is_success = false;
        } finally {
            return is_success;
        }

    };


    /**
     * Attaches reconnect events
     * @private
     * @param {string} mode
     * @return {undefined}
     */
    self._eventsReconnect = function(mode) {

        try {
            // Click events
            if(mode == 'normal') {
                $('#reconnect a.finish.cancel').click(function() {
                    return self.cancelReconnect();
                });
            }

            $('#reconnect a.finish.reconnect').click(function() {
                return self.acceptReconnect(mode);
            });
        } catch(e) {
            Console.error('Connection._eventsReconnect', e);
        }

    };


    /**
     * Schedules the next auto reconnect
     * @private
     * @param {string} mode
     * @return {undefined}
     */
    self._scheduleReconnect = function(mode) {

        try {
            // Try to reconnect automatically after a while
            if(self.reconnect_try < 5) {
                self.reconnect_timer = 5 + (5 * self.reconnect_try);
            } else {
                self.reconnect_timer = 120;
            }

            // Change the try number
            self.reconnect_try++;

            // Fire the event!
            $('#reconnect a.finish.reconnect').everyTime('1s', function() {
                // We can reconnect!
                if(self.reconnect_timer === 0) {
                    return self.acceptReconnect(mode);
                }

                // Button text
                if(self.reconnect_timer <= 10) {
                    $(this).text(Common._e("Reconnect") + ' (' + self.reconnect_timer + ')');
                }

                // Remove 1 second
                self.reconnect_timer--;
            });
        } catch(e) {
            Console.error('Connection._scheduleReconnect', e);
        }

    };


    /**
     * Does the user login
     * @public
     * @param {string} lNick
     * @param {string} lServer
     * @param {string} lPass
     * @param {string} lResource
     * @param {number} lPriority
     * @param {boolean} lRemember
     * @param {object} loginOpts
     * @return {boolean}
     */
    self.doLogin = function(lNick, lServer, lPass, lResource, lPriority, lRemember, loginOpts) {

        try {
            // get optionnal conn handlers
            extend_obj = loginOpts || {};

            // We remove the not completed class to avoid problems
            $('#home .loginer input').removeClass('please-complete');

            // We add the login wait div
            Interface.showGeneralWait();

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
            self.setupCon(con, extend_obj);

            // Generate a resource
            var random_resource = DataStore.getDB(self.desktop_hash, 'session', 'resource');

            if(!random_resource) {
                random_resource = lResource + ' (' + (new Date()).getTime() + ')';
            }

            var con_args = {
                'domain': lServer.trim(),
                'username': lNick.trim(),
                'resource': random_resource,
                'pass': lPass,
                'secure': true,
                'xmllang': XML_LANG
            };

            self.desktop_hash = 'jd.' + hex_md5(con_args.username + '@' + con_args.domain);

            // Store the resource (for reconnection)
            DataStore.setDB(self.desktop_hash, 'session', 'resource', random_resource);

            // Store session XML in temporary database
            self.storeSession(lNick, lServer, lPass, lResource, lPriority, lRemember);

            // We store the infos of the user into the data-base
            DataStore.setDB(self.desktop_hash, 'priority', 1, lPriority);

            // We connect !
            con.connect(con_args);

            // Change the page title
            Interface.title('wait');

            Console.info('Jappix is connecting...');
        } catch(e) {
            Console.error('Connection.doLogin', e);

            // Reset Jappix
            Talk.destroy();

            // Open an unknown error
            Board.openThisError(2);
        } finally {
            return false;
        }

    };


    /**
     * Handles the user registration
     * @public
     * @return {undefined}
     */
    self.handleRegistered = function() {

        try {
            Console.info('A new account has been registered.');

            // We remove the waiting image
            Interface.removeGeneralWait();

            // Reset the title
            Interface.title('home');

            // We show the success information
            $('#home .registerer .success').fadeIn('fast');

            // We quit the session
            if(Common.isConnected()) {
                self.logout();
            }
        } catch(e) {
            Console.error('Connection.handleRegistered', e);
        }

    };


    /**
     * Does the user registration
     * @public
     * @param {string} username
     * @param {string} domain
     * @param {string} pass
     * @param {string} captcha
     * @return {boolean}
     */
    self.doRegister = function(username, domain, pass, captcha) {

        try {
            Console.info('Trying to register an account...');

            // We change the registered information text
            $('#home .homediv.registerer').append(
                '<div class="info success">' +
                    Common._e("You have been registered, here is your XMPP address:") +
                    ' <b>' + username.htmlEnc() + '@' + domain.htmlEnc() + '</b> - ' +
                    '<a href="#">' + Common._e("Login") + '</a>' +
                '</div>'
            );

            // Login link
            $('#home .homediv.registerer .success a').click(function() {
                return self.doLogin(username, domain, pass, '', '10', false);
            });

            if((REGISTER_API == 'on') && (domain == HOST_MAIN) && captcha) {
                self._doRegisterAPI(username, domain, pass, captcha);
            } else {
                self._doRegisterInBand(username, domain, pass);
            }
        } catch(e) {
            Console.error('Connection.doRegister', e);
        } finally {
            return false;
        }

    };


    /**
     * Does the user anonymous login
     * @public
     * @return {boolean}
     */
    self.doAnonymous = function() {

        try {
            Console.info('Trying to login anonymously...');

            var path_sel = $('#home .anonymouser');
            var room = path_sel.find('.room').val();
            var nick = path_sel.find('.nick').val();

            // Form correctly completed?
            if(room && nick) {
                // We remove the not completed class to avoid problems
                $('#home .anonymouser input').removeClass('please-complete');

                // Redirect the user to the anonymous room
                window.location.href = JAPPIX_LOCATION + '?r=' + room + '&n=' + nick;
            } else {
                path_sel.find('input[type="text"]').each(function() {
                    var this_sel = $(this);

                    if(!this_sel.val()) {
                        $(document).oneTime(10, function() {
                            this_sel.addClass('please-complete').focus();
                        });
                    } else {
                        this_sel.removeClass('please-complete');
                    }
                });
            }
        } catch(e) {
            Console.error('Connection.doAnonymous', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the user connected event
     * @public
     * @return {undefined}
     */
    self.handleConnected = function() {

        try {
            Console.info('Jappix is now connected.');

            // Connection markers
            self.connected = true;
            self.reconnect_try = 0;
            self.reconnect_timer = 0;

            // We hide the home page
            $('#home').hide();

            // Any suggest to do before triggering connected event?
            Groupchat.suggestCheck();

            // Remove the waiting item
            Interface.removeGeneralWait();

            // Init call
            Call.init();
        } catch(e) {
            Console.error('Connection.handleConnected', e);
        }

    };


    /**
     * Triggers the connected state
     * @public
     * @return {undefined}
     */
    self.triggerConnected = function() {

        try {
            // Not resumed?
            if(!self.resume) {
                // Remember the session?
                if(DataStore.getDB(self.desktop_hash, 'remember', 'session')) {
                    DataStore.setPersistent('global', 'session', 1, self.current_session);
                }

                // We show the chatting app.
                Talk.create();

                // We reset the homepage
                Home.change('default');

                // We get all the other things
                self.getEverything();

                // Set last activity stamp
                DateUtils.last_activity = DateUtils.getTimeStamp();
            }

            // Resumed
            else {
                // Send our presence
                Presence.sendActions();

                // Change the title
                Interface.updateTitle();
            }
        } catch(e) {
            Console.error('Connection.triggerConnected', e);
        }

    };


    /**
     * Handles the user disconnected event
     * @public
     * @return {undefined}
     */
    self.handleDisconnected = function() {

        try {
            Console.info('Jappix is now disconnected.');

            // Abort ongoing call (if any)
            Call.stop(true);

            // Normal disconnection
            if(!self.current_session && !self.connected) {
                Talk.destroy();
                self.desktop_hash = null;
            }
        } catch(e) {
            Console.error('Connection.handleDisconnected', e);
        }

    };


    /**
     * Setups the normal connection
     * @public
     * @param {object} con
     * @param {object} extend_obj
     * @return {undefined}
     */
    self.setupCon = function(con, extend_obj) {

        try {
            var connection_handlers = {
                'message':       Message.handle,
                'presence':      Presence.handle,
                'iq':            IQ.handle,
                'onconnect':     self.handleConnected,
                'onerror':       Errors.handle,
                'ondisconnect':  self.handleDisconnected
            };

            for(var cur_handler in connection_handlers) {
                con.registerHandler(
                    cur_handler,
                    connection_handlers[cur_handler]
                );
            }

            // Extended handlers
            extend_obj = extend_obj || {};

            jQuery.each(extend_obj, function(keywd,funct) {
                con.registerHandler(keywd, funct);
            });
        } catch(e) {
            Console.error('Connection.setupCon', e);
        }

    };


    /**
     * Logouts from the server
     * @public
     * @return {boolean}
     */
    self.logout = function() {

        logout_done = false;

        try {
            if(Common.isConnected()) {
                Console.info('Jappix is disconnecting...');

                // Disconnect from the XMPP server
                con.disconnect();

                logout_done = true;
            }
        } catch(e) {
            Console.error('Connection.logout', e);
        } finally {
            return logout_done;
        }

    };


    /**
     * Terminates the user session
     * @public
     * @return {undefined}
     */
    self.terminate = function() {

        try {
            if(Common.isConnected()) {
                // Clear temporary session storage
                self.resetConMarkers();

                // Show the waiting item (useful if BOSH is sloooow)
                Interface.showGeneralWait();

                // Change the page title
                Interface.title('wait');

                // Disconnect from the XMPP server
                self.logout();
            }
        } catch(e) {
            Console.error('Connection.terminate', e);
        }

    };


    /**
     * Quits a session
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.quit = function() {

        try {
            if(!Common.isConnected()) {
                return;
            }

            // We show the waiting image
            Interface.showGeneralWait();

            // Change the page title
            Interface.title('wait');

            // We disconnect from the XMPP server
            self.logout();
        } catch(e) {
            Console.error('Connection.quit', e);
        }

    };


    /**
     * Creates the reconnect pane
     * @public
     * @param {string} mode
     * @return {undefined}
     */
    self.createReconnect = function(mode) {

        try {
            Console.error('This is not a normal disconnection, show the reconnect pane...');

            // Reconnect pane not yet displayed?
            if(!Common.exists('#reconnect')) {
                // Blur the focused input/textarea/select
                $('input, select, textarea').blur();

                // Create the HTML code
                var html = '<div id="reconnect" class="lock">' +
                           '<div class="pane">' +
                              Common._e("Due to a network issue, you were disconnected. What do you want to do now?");

                // Can we cancel reconnection?
                if(mode == 'normal') {
                    html += '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>';
                }

                html += '<a href="#" class="finish reconnect">' + Common._e("Reconnect") + '</a>' +
                        '</div></div>';

                // Append the code
                $('body').append(html);

                // Attach events
                self._eventsReconnect(mode);

                // Schedule next reconnect
                self._scheduleReconnect(mode);

                // Page title
                Interface.updateTitle();
            }
        } catch(e) {
            Console.error('Connection.createReconnect', e);
        }

    };


    /**
     * Reconnects the user if he was disconnected (network issue)
     * @public
     * @param {string} mode
     * @return {boolean}
     */
    self.acceptReconnect = function(mode) {

        try {
            Console.info('Trying to reconnect the user...');

            // Resume marker
            self.resume = true;

            // Show waiting item
            Interface.showGeneralWait();

            // Reset some various stuffs
            var groupchats = '#page-engine .page-engine-chan[data-type="groupchat"]';
            var groupchats_sel = $(groupchats);

            groupchats_sel.find('.list .role').hide();
            groupchats_sel.find('.one-group, ' + groupchats + ' .list .user').remove();
            groupchats_sel.attr('data-initial', 'false');

            // Stop the timer
            $('#reconnect a.finish.reconnect').stopTime();

            // Remove the reconnect pane
            $('#reconnect').remove();

            // Try to login again
            if(mode == 'normal') {
                self.loginFromSession(Common.XMLFromString(self.current_session));
            } else if(mode == 'anonymous') {
                Anonymous.login(HOST_ANONYMOUS);
            }
        } catch(e) {
            Console.error('Connection.acceptReconnect', e);
        } finally {
            return false;
        }

    };


    /**
     * Cancel the reconnection of user account (network issue)
     * @public
     * @return {boolean}
     */
    self.cancelReconnect = function() {

        try {
            Console.info('User has canceled automatic reconnection...');

            // Stop the timer
            $('#reconnect a.finish.reconnect').stopTime();

            // Remove the reconnect pane
            $('#reconnect').remove();

            // Destroy the talk page
            Talk.destroy();

            // Renitialize the previous session parameters
            self.resetConMarkers();
        } catch(e) {
            Console.error('Connection.cancelReconnect', e);
        } finally {
            return false;
        }

    };


    /**
     * Clears session reminder database
     * @public
     * @return {undefined}
     */
    self.clearLastSession = function() {

        try {
            // Clear temporary storage
            self.resetConMarkers();

            // Clear persistent storage
            if($(Common.XMLFromString(DataStore.getPersistent('global', 'session', 1))).find('stored').text() == 'true') {
                DataStore.removePersistent('global', 'session', 1);
            }
        } catch(e) {
            Console.error('Connection.clearLastSession', e);
        }

    };


    /**
     * Resets the connection markers
     * @public
     * @return {undefined}
     */
    self.resetConMarkers = function() {

        try {
            self.current_session = false;
            self.connected = false;
            self.resume = false;
            self.reconnect_try = 0;
            self.reconnect_timer = 0;
        } catch(e) {
            Console.error('Connection.resetConMarkers', e);
        }

    };


    /**
     * Logins from a saved session
     * @public
     * @param {string} data
     * @return {undefined}
     */
    self.loginFromSession = function(data) {

        try {
            // Select the data
            var session = $(data);

            // Fire the login event
            self.doLogin(
                session.find('username').text(),
                session.find('domain').text(),
                session.find('password').text(),
                session.find('resource').text(),
                session.find('priority').text(),
                false
            );
        } catch(e) {
            Console.error('Connection.loginFromSession', e);
        }

    };


    /**
     * Quits a session normally
     * @public
     * @return {boolean}
     */
    self.normalQuit = function() {

        try {
            // Reset our database
            self.clearLastSession();

            // We quit the current session
            self.quit();

            // We show an info
            Board.openThisInfo(3);
        } catch(e) {
            Console.error('Connection.normalQuit', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets all the users stuff
     * @public
     * @return {undefined}
     */
    self.getEverything = function() {

        try {
            Features.get();
            Roster.get();
            Privacy.list();
            Storage.get(NS_ROSTERNOTES);
        } catch(e) {
            Console.error('Connection.getEverything', e);
        }

    };


    /**
     * Generates session data to store
     * @public
     * @param {string} lNick
     * @param {string} lServer
     * @param {string} lPass
     * @param {string} lResource
     * @param {number} lPriority
     * @param {boolean} lRemember
     * @return {undefined}
     */
    self.storeSession = function(lNick, lServer, lPass, lResource, lPriority, lRemember) {

        try {
            // Generate a session XML to be stored
            session_xml = '<session>' +
                              '<stored>true</stored>' +
                              '<domain>' + lServer.htmlEnc() + '</domain>' +
                              '<username>' + lNick.htmlEnc() + '</username>' +
                              '<resource>' + lResource.htmlEnc() + '</resource>' +
                              '<password>' + lPass.htmlEnc() + '</password>' +
                              '<priority>' + lPriority.htmlEnc() + '</priority>' +
                          '</session>';

            // Save the session parameters (for reconnect if network issue)
            self.current_session = session_xml;

            // Remember me?
            if(lRemember) {
                DataStore.setDB(self.desktop_hash, 'remember', 'session', 1);
            }

            return session_xml;
        } catch(e) {
            Console.error('Connection.storeSession', e);
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
                // Logouts when Jappix is closed
                $(window).bind('beforeunload', Connection.terminate);

                // Nothing to do when anonymous!
                if(Utils.isAnonymous()) {
                    return;
                }

                // Connection params submitted in URL?
                if(XMPPLinks.links_var.u && XMPPLinks.links_var.q) {
                    // Generate login data
                    var login_xid = Common.bareXID(Common.generateXID(XMPPLinks.links_var.u, 'chat'));
                    var login_nick = Common.getXIDNick(login_xid);
                    var login_server = Common.getXIDHost(login_xid);
                    var login_pwd = XMPPLinks.links_var.q;
                    var login_resource = JAPPIX_RESOURCE + ' (' + (new Date()).getTime() + ')';
                    var login_priority = '10';
                    var login_remember = 1;

                    // Must store session?
                    if(XMPPLinks.links_var.h && (XMPPLinks.links_var.h === '1')) {
                        // Store session
                        var session_xml = self.storeSession(
                            login_nick,
                            login_server,
                            login_pwd,
                            login_resource,
                            login_priority,
                            true
                        );

                        DataStore.setPersistent('global', 'session', 1, session_xml);

                        // Redirect to a clean URL
                        document.location.href = './';
                    } else {
                        // Hide the homepage
                        $('#home').hide();

                        // Show the waiting icon
                        Interface.showGeneralWait();

                        // Proceed login
                        self.doLogin(login_nick, login_server, login_pwd, login_resource, login_priority, login_remember);
                    }

                    return;
                }

                // Try to resume a stored session, if not anonymous
                var session = Common.XMLFromString(
                    DataStore.getPersistent('global', 'session', 1)
                );

                if($(session).find('stored').text() == 'true') {
                    // Hide the homepage
                    $('#home').hide();

                    // Show the waiting icon
                    Interface.showGeneralWait();

                    // Login!
                    self.loginFromSession(session);

                    Console.info('Saved session found, resuming it...');
                } else if((parent.location.hash != '#OK') && XMPPLinks.links_var.x) {
                    Home.change('loginer');

                    Console.info('A XMPP link is set, switch to login page.');
                }
            });
        } catch(e) {
            Console.error('Connection.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Connection.launch();