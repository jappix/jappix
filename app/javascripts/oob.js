/*

Jappix - An open social platform
These are the Out of Band Data JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var OOB = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Sends an OOB request to someone
     * @public
     * @param {string} to
     * @param {string} type
     * @param {string} url
     * @param {string} desc
     * @return {undefined}
     */
    self.send = function(to, type, url, desc) {

        try {
            // IQ stanza?
            if(type == 'iq') {
                // Get some values
                var id = hex_md5(genID() + to + url + desc);
                to = Caps.getFeatureResource(to, NS_IQOOB);

                // IQs cannot be sent to offline users
                if(!to) {
                    return;
                }

                // Register the ID
                DataStore.setDB(Connection.desktop_hash, 'send/url', id, url);
                DataStore.setDB(Connection.desktop_hash, 'send/desc', id, desc);

                var aIQ = new JSJaCIQ();
                aIQ.setTo(Common.fullXID(to));
                aIQ.setType('set');
                aIQ.setID(id);

                // Append the query content
                var aQuery = aIQ.setQuery(NS_IQOOB);
                aQuery.appendChild(aIQ.buildNode('url', {'xmlns': NS_IQOOB}, url));
                aQuery.appendChild(aIQ.buildNode('desc', {'xmlns': NS_IQOOB}, desc));

                con.send(aIQ);
            }

            // Message stanza?
            else {
                var aMsg = new JSJaCMessage();
                aMsg.setTo(Common.bareXID(to));

                // Append the content
                aMsg.setBody(desc);
                var aX = aMsg.appendNode('x', {'xmlns': NS_XOOB});
                aX.appendChild(aMsg.buildNode('url', {'xmlns': NS_XOOB}, url));

                con.send(aMsg);
            }

            Console.log('Sent OOB request to: ' + to + ' (' + desc + ')');
        } catch(e) {
            Console.error('OOB.send', e);
        }

    };


    /**
     * Handles an OOB request
     * @public
     * @param {string} from
     * @param {string} id
     * @param {string} type
     * @param {string} node
     * @return {undefined}
     */
    self.handle = function(from, id, type, node) {

        try {
            var xid = '', url = '', desc = '';

            if(type == 'iq') {
                // IQ stanza
                xid = Common.fullXID(from);
                url = $(node).find('url').text();
                desc = $(node).find('desc').text();
            } else {
                // Message stanza
                xid = Common.bareXID(from);
                url = $(node).find('url').text();
                desc = $(node).find('body').text();
            }

            // No desc?
            if(!desc) {
                desc = url;
            }

            // Open a new notification
            if(type && xid && url && desc) {
                Notification.create('send', xid, [xid, url, type, id, node], desc, hex_md5(xid + url + desc + id));
            }
        } catch(e) {
            Console.error('OOB.handle', e);
        }

    };


    /**
     * Replies to an OOB request
     * @public
     * @param {string} to
     * @param {string} id
     * @param {string} choice
     * @param {string} type
     * @param {object} node
     * @return {undefined}
     */
    self.reply = function(to, id, choice, type, node) {

        try {
            // Not IQ type?
            if(type != 'iq') {
                return;
            }

            // New IQ
            var aIQ = new JSJaCIQ();
            aIQ.setTo(to);
            aIQ.setID(id);

            // OOB request accepted
            if(choice == 'accept') {
                aIQ.setType('result');

                Console.info('Accepted file request from: ' + to);
            }

            // OOB request rejected
            else {
                aIQ.setType('error');

                // Append stanza content
                for(var i = 0; i < node.childNodes.length; i++) {
                    aIQ.getNode().appendChild(node.childNodes.item(i).cloneNode(true));
                }

                // Append error content
                var aError = aIQ.appendNode('error', {
                    'xmlns': NS_CLIENT,
                    'code': '406',
                    'type': 'modify'
                });

                aError.appendChild(aIQ.buildNode('not-acceptable', {'xmlns': NS_STANZAS}));

                Console.info('Rejected file request from: ' + to);
            }

            con.send(aIQ);
        } catch(e) {
            Console.error('OOB.reply', e);
        }

    };


    /**
     * Wait event for OOB upload
     * @public
     * @return {undefined}
     */
    self.waitUpload = function() {

        try {
            // Append the wait icon
            var chat_tools_file_sel = page_engine_sel.find('.chat-tools-file:not(.mini)');
            var subitem_sel = chat_tools_file_sel.find('.tooltip-subitem');

            subitem_sel.find('*').hide();
            subitem_sel.append(
                '<div class="wait wait-medium"></div>'
            );

            // Lock the bubble
            chat_tools_file_sel.addClass('mini');
        } catch(e) {
            Console.error('OOB.waitUpload', e);
        }

    };


    /**
     * Success event for OOB upload
     * @public
     * @param {string} responseXML
     * @return {undefined}
     */
    self.handleUpload = function(responseXML) {

        try {
            var page_engine_sel = $('#page-engine');

            // Data selector
            var dData = $(responseXML).find('jappix');

            // Get the values
            var fID = dData.find('id').text();
            var fURL = dData.find('url').text();
            var fDesc = dData.find('desc').text();

            // Get the OOB values
            var oob_has;

            // No ID provided?
            if(!fID) {
                oob_has = ':has(.wait)';
            } else {
                oob_has = ':has(#oob-upload input[value="' + fID + '"])';
            }

            var xid = page_engine_sel.find('.page-engine-chan' + oob_has).attr('data-xid');
            var oob_type = page_engine_sel.find('.chat-tools-file' + oob_has).attr('data-oob');

            // Reset the file send tool
            page_engine_sel.find('.chat-tools-file' + oob_has).removeClass('mini');
            page_engine_sel.find('.bubble-file' + oob_has).remove();

            // Not available?
            if(page_engine_sel.find('.chat-tools-file' + oob_has).is(':hidden') && (oob_type == 'iq')) {
                Board.openThisError(4);

                // Remove the file we sent
                if(fURL) {
                    $.get(fURL + '&action=remove');
                }
            }

            // Everything okay?
            else if(fURL && fDesc && !dData.find('error').size()) {
                // Send the OOB request
                self.send(xid, oob_type, fURL, fDesc);

                // Notify the sender
                Notification.create('send_pending', xid, [xid, fURL, oob_type, '', ''], fDesc, hex_md5(fURL + fDesc + fID));

                Console.info('File request sent.');
            } else {
                Board.openThisError(4);

                Console.error('Error while sending the file', dData.find('error').text());
            }
        } catch(e) {
            Console.error('OOB.handleUpload', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();