/*

Jappix - An open social platform
These are the Jappix Mobile lightweight JS script

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Mobile = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Proceeds connection
     * @public
     * @param {object} aForm
     * @return {undefined}
     */
    self.doLogin = function(aForm) {

        try {
            // Reset the panels
            self.resetPanel();

            // Get the values
            var xid = aForm.xid.value;
            var username, domain;

            // A domain is specified
            if(xid.indexOf('@') != -1) {
                username = self.getXIDNick(xid);
                domain = self.getXIDHost(xid);

                // Domain is locked and not the same
                if((LOCK_HOST == 'on') && (domain != HOST_MAIN)) {
                    self.showThis('error');

                    return false;
                }
            } else {
                // No "@" in the XID, we should add the default domain
                username = xid;
                domain = HOST_MAIN;
            }

            var pwd = aForm.pwd.value;
            var reg = false;

            if(aForm.reg) {
                reg = aForm.reg.checked;
            }

            // Enough parameters
            if(username && domain && pwd) {
                // Show the info notification
                self.showThis('info');

                if(HOST_WEBSOCKET && typeof window.WebSocket != 'undefined') {
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
                con.registerHandler('message', self.handleMessage);
                con.registerHandler('presence', self.handlePresence);
                con.registerHandler('iq', self.handleIQ);
                con.registerHandler('onconnect', self.handleConnected);
                con.registerHandler('onerror', self.handleError);
                con.registerHandler('ondisconnect', self.handleDisconnected);

                // We retrieve what the user typed in the login inputs
                oArgs = {};
                oArgs.username = username;
                oArgs.domain = domain;
                oArgs.resource = JAPPIX_RESOURCE + ' Mobile (' + (new Date()).getTime() + ')';
                oArgs.pass = pwd;
                oArgs.secure = true;
                oArgs.xmllang = XML_LANG;

                // Register?
                if(reg) {
                    oArgs.register = true;
                }

                // We connect !
                con.connect(oArgs);
            }

            // Not enough parameters
            else {
                self.showThis('error');
            }
        } catch(e) {
            Console.error('Mobile.doLogin', e);

            // An error happened
            self.resetPanel('error');
        } finally {
            return false;
        }

    };


    /**
     * Proceeds disconnection
     * @public
     * @return {undefined}
     */
    self.doLogout = function() {

        try {
            con.disconnect();
        } catch(e) {
            Console.error('Mobile.doLogout', e);
        }

    };


    /**
     * Proceeds client initialization
     * @public
     * @return {undefined}
     */
    self.doInitialize = function() {

        try {
            if(typeof HTTP_AUTH === 'object' &&
                HTTP_AUTH.user && HTTP_AUTH.password && HTTP_AUTH.host) {
                var form_sel = document.forms['login-form'];

                form_sel.elements.xid.value = (HTTP_AUTH.user + '@' + HTTP_AUTH.host);
                form_sel.elements.pwd.value = HTTP_AUTH.password;

                self.doLogin(form_sel);
            }
        } catch(e) {
            Console.error('Mobile.doInitialize', e);
        }

    };


    /**
     * Shows target element
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.showThis = function(id) {

        try {
            var element = document.getElementById(id);

            if(element) {
                element.style.display = 'block';
            }
        } catch(e) {
            Console.error('Mobile.showThis', e);
        }

    };


    /**
     * Hides target element
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.hideThis = function(id) {

        try {
            var element = document.getElementById(id);

            if(element) {
                element.style.display = 'none';
            }
        } catch(e) {
            Console.error('Mobile.hideThis', e);
        }

    };


    /**
     * Resets notification panel
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.resetPanel = function(id) {

        try {
            // Hide the opened panels
            self.hideThis('info');
            self.hideThis('error');

            //Show the target panel
            if(id) {
                self.showThis(id);
            }
        } catch(e) {
            Console.error('Mobile.resetPanel', e);
        }

    };


    /**
     * Resets DOM to its initial state
     * @public
     * @return {undefined}
     */
    self.resetDOM = function() {

        try {
            // Reset the "secret" input values
            document.getElementById('pwd').value = '';

            // Remove the useless DOM elements
            var body = document.getElementsByTagName('body')[0];
            body.removeChild(document.getElementById('talk'));
            body.removeChild(document.getElementById('chat'));
        } catch(e) {
            Console.error('Mobile.resetDOM', e);
        }

    };


    /**
     * Returns whether target item exists or not
     * @public
     * @param {type} id
     * @return {boolean}
     */
    self.exists = function(id) {

        does_exist = false;

        try {
            if(document.getElementById(id)) {
                does_exist = true;
            }
        } catch(e) {
            Console.error('Mobile.exists', e);
        } finally {
            return does_exist;
        }

    };


    /**
     * Returns translated string (placeholder function for Get API)
     * @public
     * @param {string} string
     * @return {string}
     */
    self._e = function(string) {

        try {
            return string;
        } catch(e) {
            Console.error('Mobile._e', e);
        }

    };


    /**
     * Escapes a string for onclick usage
     * @public
     * @param {string} str
     * @return {string}
     */
    self.encodeOnclick = function(str) {

        try {
            return str.replace(/'/g, '\\$&').replace(/"/g, '&quot;');
        } catch(e) {
            Console.error('Mobile.encodeOnclick', e);
        }

    };


    /**
     * Handles message stanza
     * @public
     * @param {object} msg
     * @return {undefined}
     */
    self.handleMessage = function(msg) {

        try {
            var type = msg.getType();

            if(type == 'chat' || type == 'normal') {
                // Get the body
                var body = msg.getBody();

                if(body) {
                    // Get the values
                    var xid = self.cutResource(msg.getFrom());
                    var hash = hex_md5(xid);
                    var nick = self.getNick(xid, hash);

                    // No nickname?
                    if(!nick) {
                        nick = xid;
                    }

                    // Create the chat if it does not exist
                    self.chat(xid, nick);

                    // Display the message
                    self.displayMessage(xid, body, nick, hash);
                }
            }
        } catch(e) {
            Console.error('Mobile.handleMessage', e);
        }

    };


    /**
     * Handles presence stanza
     * @public
     * @param {object} pre
     * @return {undefined}
     */
    self.handlePresence = function(pre) {

        try {
            // Define the variables
            var xid = self.cutResource(pre.getFrom());
            var hash = hex_md5(xid);
            var type = pre.getType();
            var show = pre.getShow();

            // Online buddy
            if(!type) {
                // Display the correct presence
                switch(show) {
                    case 'chat':
                        self.displayPresence(hash, show);
                        break;

                    case 'away':
                        self.displayPresence(hash, show);
                        break;

                    case 'xa':
                        self.displayPresence(hash, show);
                        break;

                    case 'dnd':
                        self.displayPresence(hash, show);
                        break;

                    default:
                        self.displayPresence(hash, 'available');
                        break;
                }
            }
        } catch(e) {
            Console.error('Mobile.handlePresence', e);
        }

    };


    /**
     * Handles IQ stanza
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleIQ = function(iq) {

        try {
            // Get the content
            var iqFrom = iq.getFrom();
            var iqID = iq.getID();
            var iqQueryXMLNS = iq.getQueryXMLNS();
            var iqType = iq.getType();
            var iqQuery;

            // Create the response
            var iqResponse = new JSJaCIQ();

            if((iqType == 'get') && ((iqQueryXMLNS == NS_DISCO_INFO) || (iqQueryXMLNS == NS_VERSION))) {
                iqResponse.setID(iqID);
                iqResponse.setTo(iqFrom);
                iqResponse.setType('result');
            }

            // Disco#infos query
            if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0030.html */

                iqQuery = iqResponse.setQuery(NS_DISCO_INFO);

                // We set the name of the client
                iqQuery.appendChild(iq.appendNode('identity', {
                    'category': 'client',
                    'type': 'mobile',
                    'name': 'Jappix Mobile'
                }));

                // We set all the supported features
                var fArray = new Array(
                    NS_DISCO_INFO,
                    NS_VERSION
                );

                for(var i in fArray) {
                    iqQuery.appendChild(iq.buildNode('feature', {'var': fArray[i]}));
                }

                con.send(iqResponse);
            }

            // Software version query
            else if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0092.html */

                iqQuery = iqResponse.setQuery(NS_VERSION);

                iqQuery.appendChild(iq.buildNode('name', 'Jappix Mobile'));
                iqQuery.appendChild(iq.buildNode('version', JAPPIX_VERSION));
                iqQuery.appendChild(iq.buildNode('os', BrowserDetect.OS));

                con.send(iqResponse);
            }
        } catch(e) {
            Console.error('Mobile.handleIQ', e);
        }

    };


    /**
     * Handles connected state
     * @public
     * @return {undefined}
     */
    self.handleConnected = function() {

        try {
            // Reset the elements
            self.hideThis('home');
            self.resetPanel();

            // Create the talk page
            document.getElementsByTagName('body')[0].innerHTML +=
            '<div id="talk">' +
                '<div class="header">' +
                    '<div class="mobile-images"></div>' +
                    '<button onclick="Mobile.doLogout();">' + self._e("Disconnect") + '</button>' +
                '</div>' +

                '<div id="roster"></div>' +
            '</div>' +

            '<div id="chat">' +
                '<div class="header">' +
                    '<div class="mobile-images"></div>' +
                    '<button onclick="Mobile.returnToRoster();">' + self._e("Previous") + '</button>' +
                '</div>' +

                '<div id="chans"></div>' +
            '</div>';

            // Get the roster items
            self.getRoster();
        } catch(e) {
            Console.error('Mobile.handleConnected', e);
        }

    };


    /**
     * Handles error stanza
     * @public
     * @param {object} error
     * @return {undefined}
     */
    self.handleError = function(error) {

        try {
            self.resetPanel('error');
        } catch(e) {
            Console.error('Mobile.handleError', e);
        }

    };


    /**
     * Handles disconnected state
     * @public
     * @return {undefined}
     */
    self.handleDisconnected = function() {

        try {
            // Reset the elements
            self.resetDOM();

            // Show the home page
            self.showThis('home');
        } catch(e) {
            Console.error('Mobile.handleDisconnected', e);
        }

    };


    /**
     * Handles roster response
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleRoster = function(iq) {

        try {
            // Error: send presence anyway
            if(!iq || (iq.getType() != 'result'))
                return self.sendPresence('', 'available', 1);

            // Define some pre-vars
            var current, xid, nick, oneBuddy, oneID, hash, cur_buddy;
            var roster_buddies = [];

            var roster = document.getElementById('roster');

            // Get roster items
            var iqNode = iq.getNode();
            var bItems = iqNode.getElementsByTagName('item');

            // Display each elements from the roster
            for(var i = 0; i < bItems.length; i++) {
                // Get the values
                current = iqNode.getElementsByTagName('item').item(i);
                xid = current.getAttribute('jid').htmlEnc();
                nick = current.getAttribute('name');
                hash = hex_md5(xid);

                // No defined nick?
                if(!nick) {
                    nick = self.getDirectNick(xid);
                }

                roster_buddies.push({
                    'xid': xid,
                    'hash': hash,
                    'nick': nick
                });
            }

            // Sort the values
            self.sortRoster(roster_buddies);

            // Display the values
            for(var j = 0; j < roster_buddies.length; j++) {
                cur_buddy = roster_buddies[j];

                self.displayRoster(
                    roster,
                    cur_buddy.xid,
                    cur_buddy.hash,
                    cur_buddy.nick
                );
            }

            // Start handling buddies presence
            self.sendPresence('', 'available', 1);
        } catch(e) {
            Console.error('Mobile.handleRoster', e);
        }

    };


    /**
     * Sends message w/ provided data
     * @public
     * @param {object} aForm
     * @return {boolean}
     */
    self.sendMessage = function(aForm) {

        try {
            var body = aForm.body.value;
            var xid = aForm.xid.value;
            var hash = hex_md5(xid);

            if(body && xid) {
                // Send the message
                var aMsg = new JSJaCMessage();
                aMsg.setTo(xid);
                aMsg.setType('chat');
                aMsg.setBody(body);
                con.send(aMsg);

                // Clear our input
                aForm.body.value = '';

                // Display the message we sent
                self.displayMessage(xid, body, 'me', hash);
            }
        } catch(e) {
            Console.error('Mobile.sendMessage', e);
        } finally {
            return false;
        }

    };


    /**
     * Sends presence w/ provided data
     * @public
     * @param {string} type
     * @param {string} show
     * @param {number} priority
     * @param {string} status
     * @return {undefined}
     */
    self.sendPresence = function(type, show, priority, status) {

        try {
            var presence = new JSJaCPresence();

            if(type)
                presence.setType(type);
            if(show)
                presence.setShow(show);
            if(priority)
                presence.setPriority(priority);
            if(status)
                presence.setStatus(status);

            con.send(presence);
        } catch(e) {
            Console.error('Mobile.sendPresence', e);
        }

    };


    /**
     * Requests the user roster
     * @public
     * @return {undefined}
     */
    self.getRoster = function() {

        try {
            iq = new JSJaCIQ();
            iq.setType('get');
            iq.setQuery(NS_ROSTER);

            con.send(iq, self.handleRoster);
        } catch(e) {
            Console.error('Mobile.getRoster', e);
        }

    };


    /**
     * Gets user nick (the dumb way)
     * @public
     * @param {string} xid
     * @return {string}
     */
    self.getDirectNick = function(xid) {

        try {
            return self.explodeThis('@', xid, 0);
        } catch(e) {
            Console.error('Mobile.getDirectNick', e);
        }

    };


    /**
     * Gets user nick (the smarter way)
     * @public
     * @param {string} xid
     * @param {string} hash
     * @return {string}
     */
    self.getNick = function(xid, hash) {

        try {
            var path = 'buddy-' + hash;

            if(self.exists(path)) {
                return document.getElementById(path).innerHTML;
            } else {
                self.getDirectNick(xid);
            }
        } catch(e) {
            Console.error('Mobile.getNick', e);
        }

    };


    /**
     * Explodes a string w/ given character
     * @public
     * @param {string} toEx
     * @param {string} toStr
     * @param {number} i
     * @return {string}
     */
    self.explodeThis = function(toEx, toStr, i) {

        try {
            // Get the index of our char to explode
            var index = toStr.indexOf(toEx);

            // We split if necessary the string
            if(index !== -1) {
                if(i === 0) {
                    toStr = toStr.substr(0, index);
                } else {
                    toStr = toStr.substr(index + 1);
                }
            }

            // We return the value
            return toStr;
        } catch(e) {
            Console.error('Mobile.explodeThis', e);
        }

    };


    /**
     * Removes the resource part from a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.cutResource = function(aXID) {

        try {
            return self.explodeThis('/', aXID, 0);
        } catch(e) {
            Console.error('Mobile.cutResource', e);
        }

    };


    /**
     * Gets the nick part of a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.getXIDNick = function(aXID) {

        try {
            return self.explodeThis('@', aXID, 0);
        } catch(e) {
            Console.error('Mobile.getXIDNick', e);
        }

    };


    /**
     * Gets the host part of a XID
     * @public
     * @param {string} aXID
     * @return {string}
     */
    self.getXIDHost = function(aXID) {

        try {
            return self.explodeThis('@', aXID, 1);
        } catch(e) {
            Console.error('Mobile.getXIDHost', e);
        }

    };


    /**
     * Filters message for display
     * @public
     * @param {string} msg
     * @return {string}
     */
    self.filter = function(msg) {

        try {
            // Encode in HTML
            msg = msg.htmlEnc();

            // Highlighted text
            msg = msg.replace(/(\s|^)\*(.+)\*(\s|$)/gi,'$1<em>$2</em>$3');

            // Links
            msg = Links.apply(msg, 'mini');

            return msg;
        } catch(e) {
            Console.error('Mobile.filter', e);
        }

    };


    /**
     * Displays message into chat view
     * @public
     * @param {string} xid
     * @param {string} body
     * @param {string} nick
     * @param {string} hash
     * @return {undefined}
     */
    self.displayMessage = function(xid, body, nick, hash) {

        try {
            // Get the path
            var path = 'content-' + hash;

            // Display the message
            html = '<span><b';

            if(nick == 'me') {
                html += ' class="me">' + self._e("You");
            } else {
                html += ' class="him">' + nick;
            }

            html += '</b> ' + self.filter(body) + '</span>';

            document.getElementById(path).innerHTML += html;

            // Scroll to the last element
            document.getElementById(path).lastChild.scrollIntoView();
        } catch(e) {
            Console.error('Mobile.displayMessage', e);
        }

    };


    /**
     * Displays a roster buddy
     * @public
     * @param {object} roster
     * @param {string} xid
     * @param {string} hash
     * @param {string} nick
     * @return {undefined}
     */
    self.displayRoster = function(roster, xid, hash, nick) {

        try {
            oneBuddy = document.createElement('a');
            oneID = 'buddy-' + hash;

            oneBuddy.setAttribute('href', '#');
            oneBuddy.setAttribute('id', oneID);
            oneBuddy.setAttribute('class', 'one-buddy');
            oneBuddy.setAttribute('onclick', 'return Mobile.chat(\'' + self.encodeOnclick(xid) + '\', \'' + self.encodeOnclick(nick) + '\');');
            oneBuddy.innerHTML = nick.htmlEnc();

            roster.appendChild(oneBuddy);
        } catch(e) {
            Console.error('Mobile.displayRoster', e);
        }

    };


    /**
     * Sorts the roster buddies by nickname
     * @public
     * @param {object} roster_buddies
     * @return {object}
     */
    self.sortRoster = function(roster_buddies) {

        try {
            var one_nick, two_nick;

            roster_buddies.sort(function(one, two) {
                one_nick = (one.nick + '').toLowerCase();
                two_nick = (two.nick + '').toLowerCase();

                return one_nick < two_nick ? -1 : (one_nick > two_nick ? 1 : 0);
            });
        } catch(e) {
            Console.error('Mobile.sortRoster', e);
        } finally {
            return roster_buddies;
        }

    };


    /**
     * Goes back to roster view
     * @public
     * @return {undefined}
     */
    self.returnToRoster = function() {

        try {
            // Hide the chats
            self.hideThis('chat');

            // Show the roster
            self.showThis('talk');
        } catch(e) {
            Console.error('Mobile.returnToRoster', e);
        }

    };


    /**
     * Switches view to target chat
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.chatSwitch = function(hash) {

        try {
            // Hide the roster page
            self.hideThis('talk');

            // Hide the other chats
            var divs = document.getElementsByTagName('div');

            for(var i = 0; i < divs.length; i++) {
                if(divs.item(i).getAttribute('class') == 'one-chat') {
                    divs.item(i).style.display = 'none';
                }
            }

            // Show the chat
            self.showThis('chat');
            self.showThis(hash);
        } catch(e) {
            Console.error('Mobile.chatSwitch', e);
        }

    };


    /**
     * Creates given chat
     * @public
     * @param {string} xid
     * @param {string} nick
     * @param {string} hash
     * @return {undefined}
     */
    self.createChat = function(xid, nick, hash) {

        try {
            // Define the variables
            var chat = document.getElementById('chans');
            var oneChat = document.createElement('div');

            // Apply the DOM modification
            oneChat.setAttribute('id', 'chat-' + hash);
            oneChat.setAttribute('class', 'one-chat');
            oneChat.innerHTML = '<p>' + nick + '</p><div id="content-' + hash + '"></div><form action="#" method="post" onsubmit="return Mobile.sendMessage(this);"><input type="text" name="body" /><input type="hidden" name="xid" value="' + xid + '" /><input type="submit" class="submit" value="OK" /></form>';
            chat.appendChild(oneChat);
        } catch(e) {
            Console.error('Mobile.createChat', e);
        }

    };


    /**
     * Launches a chat
     * @public
     * @param {string} xid
     * @param {string} nick
     * @return {boolean}
     */
    self.chat = function(xid, nick) {

        try {
            var hash = hex_md5(xid);

            // If the chat was not yet opened
            if(!self.exists('chat-' + hash)) {
                // No nick?
                if(!nick) {
                    nick = self.getNick(xid, hash);
                }

                // Create the chat
                self.createChat(xid, nick, hash);
            }

            // Switch to the chat
            self.chatSwitch('chat-' + hash);
        } catch(e) {
            Console.error('Mobile.chat', e);
        } finally {
            return false;
        }

    };


    /**
     * Displays given presence
     * @public
     * @param {string} hash
     * @param {string} show
     * @return {undefined}
     */
    self.displayPresence = function(hash, show) {

        try {
            var element = document.getElementById('buddy-' + hash);

            if(element) {
                element.setAttribute('class', 'one-buddy ' + show);
            }
        } catch(e) {
            Console.error('Mobile.displayPresence', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            onbeforeunload = self.doLogout;
            onload = self.doInitialize;
        } catch(e) {
            Console.error('Mobile.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Mobile.launch();