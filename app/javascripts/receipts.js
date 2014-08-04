/*

Jappix - An open social platform
These are the receipts JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Receipts = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Checks if we can send a receipt request
     * @public
     * @param {string} hash
     * @return {boolean}
     */
    self.request = function(hash) {

        has_support = false;

        try {
            // Entity have support for receipt?
            if($('#' + hash + ' .message-area').attr('data-receipts') == 'true') {
                has_support = true;
            }
        } catch(e) {
            Console.error('Receipts.request', e);
        } finally {
            return has_support;
        }

    };


    /**
     * Checks if there is a receipt request
     * @public
     * @param {object} packet
     * @return {boolean}
     */
    self.has = function(packet) {

        has_receipt = false;

        try {
            // Any receipt request?
            if(packet.getChild('request', NS_URN_RECEIPTS)) {
                has_receipt = true;
            }
        } catch(e) {
            Console.error('Receipts.has', e);
        } finally {
            return has_receipt;
        }

    };


    /**
     * Checks if there is a received reply
     * @public
     * @param {object} packet
     * @return {boolean}
     */
    self.hasReceived = function(packet) {

        has_received = false;

        try {
            // Any received reply?
            if(packet.getChild('received', NS_URN_RECEIPTS)) {
                has_received = true;
            }
        } catch(e) {
            Console.error('Receipts.received', e);
        } finally {
            return has_received;
        }

    };


    /**
     * Sends a received notification
     * @public
     * @param {string} type
     * @param {string} to
     * @param {string} id
     * @return {undefined}
     */
    self.sendReceived = function(type, to, id) {

        try {
            var aMsg = new JSJaCMessage();
            aMsg.setTo(to);
            aMsg.setID(id);

            // Any type?
            if(type) {
                aMsg.setType(type);
            }

            // Append the received node
            aMsg.appendNode('received', {'xmlns': NS_URN_RECEIPTS, 'id': id});

            con.send(aMsg);

            Console.log('Sent received to: ' + to);
        } catch(e) {
            Console.error('Receipts.sendReceived', e);
        }

    };


    /**
     * Tells the message has been received
     * @public
     * @param {string} hash
     * @param {string} id
     * @return {boolean}
     */
    self.messageReceived = function(hash, id) {

        try {
            // Line selector
            var path = $('#' + hash + ' .one-line[data-id="' + id + '"]');

            // Add a received marker
            path.attr('data-received', 'true')
                .removeAttr('data-lost');

            // Group selector
            var group = path.parent();

            // Remove the group marker
            if(!group.find('.one-line[data-lost]').size()) {
                group.find('b.name').removeClass('talk-images')
                                    .removeAttr('title');
            }
        } catch(e) {
            Console.error('Receipts.messageReceived', e);
        } finally {
            return false;
        }

    };


    /**
     * Checks if the message has been received
     * @public
     * @param {string} hash
     * @param {string} id
     * @return {undefined}
     */
    self.checkReceived = function(hash, id) {

        try {
            // Fire a check 10 seconds later
            $('#' + hash + ' .one-line[data-id="' + id + '"]').oneTime('10s', function() {
                var this_sel = $(this);

                // Not received?
                if(this_sel.attr('data-received') != 'true') {
                    // Add a "lost" marker
                    this_sel.attr('data-lost', 'true');

                    // Add a warn on the buddy-name
                    this_sel.parent().find('b.name').addClass('talk-images')
                                                    .attr(
                                                        'title',
                                                        Common._e("Your friend seems not to have received your message(s)!")
                                                    );
                }
            });
        } catch(e) {
            Console.error('Receipts.checkReceived', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();