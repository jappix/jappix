/*

Jappix - An open social platform
These are the IQ JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var IQ = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Handles OOB request
     * @private
     * @param {string} iqType
     * @param {string} iqID
     * @param {object} iqNode
     * @return {undefined}
     */
    self._handleOOBRequest = function(iqFrom, iqID, iqNode) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0066.html */

            OOB.handle(iqFrom, iqID, 'iq', iqNode);

            Console.log('Received IQ OOB request: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleOOBRequest', e);
        }

    };


    /**
     * Handles OOB reply
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @param {string} iqType
     * @param {string} iqID
     * @param {object} iqNode
     * @return {undefined}
     */
    self._handleOOBReply = function(iqResponse, iqFrom, iqType, iqID, iqNode) {

        try {
            // Get the values
            var oob_url = DataStore.getDB(Connection.desktop_hash, 'send/url', iqID);
            var oob_desc = DataStore.getDB(Connection.desktop_hash, 'send/desc', iqID);
            var notif_id = hex_md5(oob_url + oob_desc + iqType + iqFrom + iqID);

            if($(iqNode).find('error').size()) {
                // Error?
                if($(iqNode).find('error not-acceptable').size()) {
                    // Rejected?
                    Notification.create('send_reject', iqFrom, [iqFrom, oob_url, 'iq', iqID, iqNode], oob_desc, notif_id);
                } else {
                    // Failed?
                    Notification.create('send_fail', iqFrom, [iqFrom, oob_url, 'iq', iqID, iqNode], oob_desc, notif_id);
                }

                // Remove the file
                $.get(oob_url + '&action=remove');
            } else if(iqType == 'result') {
                // Success?
                Notification.create('send_accept', iqFrom, [iqFrom, oob_url, 'iq', iqID, iqNode], oob_desc, notif_id);
            }
        } catch(e) {
            Console.error('IQ._handleOOBReply', e);
        }

    };


    /**
     * Handles Software Version
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleSoftwareVersion = function(iqResponse, iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0092.html */

            iqQuery = iqResponse.setQuery(NS_VERSION);

            iqQuery.appendChild(iqResponse.buildNode('name', {'xmlns': NS_VERSION}, Caps.disco_infos.identity.name));
            iqQuery.appendChild(iqResponse.buildNode('version', {'xmlns': NS_VERSION}, JAPPIX_VERSION));
            iqQuery.appendChild(iqResponse.buildNode('os', {'xmlns': NS_VERSION}, BrowserDetect.OS));

            con.send(iqResponse);

            Console.log('Received software version query: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleSoftwareVersion', e);
        }

    };


    /**
     * Handles Last Activity
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleLastActivity = function(iqResponse, iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0012.html */

            iqQuery = iqResponse.setQuery(NS_LAST);
            iqQuery.setAttribute('seconds', DateUtils.getLastActivity());

            con.send(iqResponse);

            Console.log('Received last activity query: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleLastActivity', e);
        }

    };


    /**
     * Handles Privacy Lists
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @param {string} iqQuery
     * @return {undefined}
     */
    self._handlePrivacyLists = function(iqResponse, iqFrom, iqQuery) {

        try {
            // REF : http://xmpp.org/extensions/xep-0016.html

            // Roster push
            con.send(iqResponse);

            // Get the lists
            $(iqQuery).find('list').each(function() {
                Privacy.get($(this).attr('name'));
            });

            Console.log('Received privacy lists push: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handlePrivacyLists', e);
        }

    };


    /**
     * Handles Roster Push
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @param {string} iqQuery
     * @return {undefined}
     */
    self._handleRosterPush = function(iqResponse, iqFrom, iqQuery) {

        try {
            // REF : http://xmpp.org/extensions/xep-0092.html

            // Roster push
            con.send(iqResponse);

            // Get the values
            $(iqQuery).find('item').each(function() {
                Roster.parse($(this), 'presence');
            });

            Console.log('Received roster push: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleRosterPush', e);
        }

    };


    /**
     * Handles Roster Item Exchange
     * @private
     * @param {object} iqNode
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleRosterItemExchange = function(iqNode, iqFrom) {

        try {
            // Open a new notification
            Notification.create('rosterx', iqFrom, [iqNode], '');

            Console.log('Roster Item Exchange from: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleRosterItemExchange', e);
        }

    };


    /**
     * Handles Disco Info
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleDiscoInfo = function(iqResponse, iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0030.html */

            iqQuery = iqResponse.setQuery(NS_DISCO_INFO);

            // We set the name of the client
            iqQuery.appendChild(iqResponse.buildNode('identity', {
                'category': Caps.disco_infos.identity.category,
                'type': Caps.disco_infos.identity.type,
                'name': Caps.disco_infos.identity.name,
                'xmlns': NS_DISCO_INFO
            }));

            // We set all the supported features
            var disco_infos = Caps.myDiscoInfos();

            $.each(disco_infos, function(i, disco_info) {
                iqQuery.appendChild(iqResponse.buildNode('feature', {'var': disco_info, 'xmlns': NS_DISCO_INFO}));
            });

            con.send(iqResponse);

            Console.log('Received disco#infos query: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleDiscoInfo', e);
        }

    };


    /**
     * Handles User Time
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleUserTime = function(iqResponse, iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0202.html */

            var iqTime = iqResponse.appendNode('time', {
                'xmlns': NS_URN_TIME
            });

            iqTime.appendChild(iqResponse.buildNode('tzo', {
                'xmlns': NS_URN_TIME
            }, DateUtils.getTZO()));

            iqTime.appendChild(iqResponse.buildNode('utc', {
                'xmlns': NS_URN_TIME
            }, DateUtils.getXMPPTime('utc')));

            con.send(iqResponse);

            Console.log('Received local time query: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleUserTime', e);
        }

    };


    /**
     * Handles Ping
     * @private
     * @param {object} iqResponse
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handlePing = function(iqResponse, iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0199.html */

            con.send(iqResponse);

            Console.log('Received a ping: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handlePing', e);
        }

    };


    /**
     * Handles Jingle
     * @private
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._handleJingle = function(iqFrom) {

        try {
            /* REF: http://xmpp.org/extensions/xep-0166.html */

            // Handled via JSJaCJingle.route() (see above)

            Console.log('Received a Jingle packet: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._handleJingle', e);
        }

    };


    /**
     * Raises a not implemented error
     * @private
     * @param {object} iqResponse
     * @param {object} iqNode
     * @param {string} iqFrom
     * @return {undefined}
     */
    self._raiseNotImplemented = function(iqResponse, iqNode, iqFrom) {

        try {
            // Change IQ type
            iqResponse.setType('error');

            // Append stanza content
            for(var c = 0; c < iqNode.childNodes.length; c++) {
                iqResponse.getNode().appendChild(iqNode.childNodes.item(c).cloneNode(true));
            }

            // Append error content
            var iqError = iqResponse.appendNode('error', {'xmlns': NS_CLIENT, 'code': '501', 'type': 'cancel'});
            iqError.appendChild(iqResponse.buildNode('feature-not-implemented', {'xmlns': NS_STANZAS}));
            iqError.appendChild(iqResponse.buildNode('text', {'xmlns': NS_STANZAS}, Common._e("The feature requested is not implemented by the recipient or server and therefore cannot be processed.")));

            con.send(iqResponse);

            Console.log('Received an unsupported IQ query from: ' + iqFrom);
        } catch(e) {
            Console.error('IQ._raiseNotImplemented', e);
        }

    };


    /**
     * Handles an incoming IQ packet
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handle = function(iq) {

        try {
            // Gets the IQ content
            var iqNode = iq.getNode();
            var iqFrom = Common.fullXID(Common.getStanzaFrom(iq));
            var iqID = iq.getID();
            var iqQueryXMLNS = iq.getQueryXMLNS();
            var iqQuery = iq.getQuery();
            var iqType = iq.getType();

            // Build the response
            var iqResponse = new JSJaCIQ();

            iqResponse.setID(iqID);
            iqResponse.setTo(iqFrom);
            iqResponse.setType('result');

            // OOB request
            if((iqQueryXMLNS == NS_IQOOB) && (iqType == 'set')) {
                self._handleOOBRequest(iqFrom, iqID, iqNode);
            }

            // OOB reply
            else if(DataStore.getDB(Connection.desktop_hash, 'send/url', iqID)) {
                self._handleOOBReply(iqResponse, iqFrom, iqType, iqID, iqNode);
            }

            // Software version query
            else if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
                self._handleSoftwareVersion(iqResponse, iqFrom);
            }

            // Last activity query
            else if((iqQueryXMLNS == NS_LAST) && (iqType == 'get')) {
                self._handleLastActivity(iqResponse, iqFrom);
            }

            // Privacy lists push
            else if((iqQueryXMLNS == NS_PRIVACY) && (iqType == 'set') && Common.isSafeStanza(iq)) {
                self._handlePrivacyLists(iqResponse, iqFrom, iqQuery);
            }

            // Roster push
            else if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set') && Common.isSafeStanza(iq)) {
                self._handleRosterPush(iqResponse, iqFrom, iqQuery);
            }

            // Roster Item Exchange query
            else if($(iqNode).find('x[xmlns="' + NS_ROSTERX + '"]').size()) {
                self._handleRosterItemExchange(iqNode, iqFrom);
            }

            // Disco info query
            else if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
                self._handleDiscoInfo(iqResponse, iqFrom);
            }

            // User time query
            else if($(iqNode).find('time').size() && (iqType == 'get')) {
                self._handleUserTime(iqResponse, iqFrom);
            }

            // Ping
            else if($(iqNode).find('ping').size() && (iqType == 'get')) {
                self._handlePing(iqResponse, iqFrom);
            }

            // Jingle
            else if($(iqNode).find('jingle').size()) {
                self._handleJingle(iqFrom);
            }

            // Not implemented
            else if(!$(iqNode).find('error').size() && ((iqType == 'get') || (iqType == 'set'))) {
                self._raiseNotImplemented(iqResponse, iqNode, iqFrom);
            }
        } catch(e) {
            Console.error('IQ.handle', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();