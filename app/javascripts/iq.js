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

            // Handle Jingle packet?
            JSJaCJingle_route(iq);
            
            // Build the response
            var iqResponse = new JSJaCIQ();
            
            iqResponse.setID(iqID);
            iqResponse.setTo(iqFrom);
            iqResponse.setType('result');
            
            // OOB request
            if((iqQueryXMLNS == NS_IQOOB) && (iqType == 'set')) {
                /* REF: http://xmpp.org/extensions/xep-0066.html */
                
                OOB.handle(iqFrom, iqID, 'iq', iqNode);
                
                Console.log('Received IQ OOB request: ' + iqFrom);
            }
            
            // OOB reply
            else if(DataStore.getDB(Connection.desktop_hash, 'send/url', iqID)) {
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
            }
            
            // Software version query
            else if((iqQueryXMLNS == NS_VERSION) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0092.html */
                
                iqQuery = iqResponse.setQuery(NS_VERSION);
                
                iqQuery.appendChild(iqResponse.buildNode('name', {'xmlns': NS_VERSION}, 'Jappix'));
                iqQuery.appendChild(iqResponse.buildNode('version', {'xmlns': NS_VERSION}, JAPPIX_VERSION));
                iqQuery.appendChild(iqResponse.buildNode('os', {'xmlns': NS_VERSION}, BrowserDetect.OS));
                
                con.send(iqResponse);
                
                Console.log('Received software version query: ' + iqFrom);
            }
            
            // Last activity query
            else if((iqQueryXMLNS == NS_LAST) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0012.html */
                
                iqQuery = iqResponse.setQuery(NS_LAST);
                iqQuery.setAttribute('seconds', DateUtils.getLastActivity());
                
                con.send(iqResponse);
                
                Console.log('Received last activity query: ' + iqFrom);
            }
            
            // Privacy lists push
            else if((iqQueryXMLNS == NS_PRIVACY) && (iqType == 'set') && Common.isSafeStanza(iq)) {
                // REF : http://xmpp.org/extensions/xep-0016.html
                
                // Roster push
                con.send(iqResponse);
                
                // Get the lists
                $(iqQuery).find('list').each(function() {
                    Privacy.get($(this).attr('name'));
                });
                
                Console.log('Received privacy lists push: ' + iqFrom);
            }
            
            // Roster push
            else if((iqQueryXMLNS == NS_ROSTER) && (iqType == 'set') && Common.isSafeStanza(iq)) {
                // REF : http://xmpp.org/extensions/xep-0092.html
                
                // Roster push
                con.send(iqResponse);
                
                // Get the values
                $(iqQuery).find('item').each(function() {
                    Roster.parse($(this), 'presence');
                });
                
                Console.log('Received roster push: ' + iqFrom);
            }
            
            // Roster Item Exchange query
            else if($(iqNode).find('x[xmlns="' + NS_ROSTERX + '"]').size()) {
                // Open a new notification
                Notification.create('rosterx', iqFrom, [iqNode], '');
                
                Console.log('Roster Item Exchange from: ' + iqFrom);
            }
            
            // Disco info query
            else if((iqQueryXMLNS == NS_DISCO_INFO) && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0030.html */
                
                iqQuery = iqResponse.setQuery(NS_DISCO_INFO);
                
                // We set the name of the client
                iqQuery.appendChild(iqResponse.buildNode('identity', {
                    'category': 'client',
                    'type': 'web',
                    'name': 'Jappix',
                    'xmlns': NS_DISCO_INFO
                }));
                
                // We set all the supported features
                var disco_infos = Caps.myDiscoInfos();
                
                $.each(disco_infos, function(i, disco_info) {
                    iqQuery.appendChild(iqResponse.buildNode('feature', {'var': disco_info, 'xmlns': NS_DISCO_INFO}));
                });
                
                con.send(iqResponse);
                
                Console.log('Received disco#infos query: ' + iqFrom);
            }
            
            // User time query
            else if($(iqNode).find('time').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0202.html */
                
                var iqTime = iqResponse.appendNode('time', {'xmlns': NS_URN_TIME});
                iqTime.appendChild(iqResponse.buildNode('tzo', {'xmlns': NS_URN_TIME}, DateUtils.getTZO()));
                iqTime.appendChild(iqResponse.buildNode('utc', {'xmlns': NS_URN_TIME}, DateUtils.getXMPPTime('utc')));
                
                con.send(iqResponse);
                
                Console.log('Received local time query: ' + iqFrom);
            }
            
            // Ping
            else if($(iqNode).find('ping').size() && (iqType == 'get')) {
                /* REF: http://xmpp.org/extensions/xep-0199.html */
                
                con.send(iqResponse);
                
                Console.log('Received a ping: ' + iqFrom);
            }

            // Jingle
            else if($(iqNode).find('jingle').size()) {
                /* REF: http://xmpp.org/extensions/xep-0166.html */
                
                // Handled via JSJaCJingle_route() (see above)
                
                Console.log('Received a Jingle packet: ' + iqFrom);
            }
            
            // Not implemented
            else if(!$(iqNode).find('error').size() && ((iqType == 'get') || (iqType == 'set'))) {
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