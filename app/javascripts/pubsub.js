/*

Jappix - An open social platform
These are the Pubsub JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Pubsub = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Setups a Pubsub node
     * @public
     * @param {string} entity
     * @param {object} node
     * @param {boolean} persist
     * @param {number} maximum
     * @param {string} access
     * @param {string} publish
     * @param {boolean} create
     * @return {undefined}
     */
    self.setup = function(entity, node, persist, maximum, access, publish, create) {

        /* REF: http://xmpp.org/extensions/xep-0060.html#owner-create-and-configure */

        try {
            // Create the PubSub node
            var iq = new JSJaCIQ();
            iq.setType('set');

            // Any external entity?
            if(entity) {
                iq.setTo(entity);
            }

            // Create it?
            var pubsub;

            if(create) {
                pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
                pubsub.appendChild(iq.buildNode('create', {'xmlns': NS_PUBSUB, 'node': node}));
            } else {
                pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
            }

            // Configure it!
            var configure = pubsub.appendChild(iq.buildNode('configure', {'node': node, 'xmlns': NS_PUBSUB}));
            var x = configure.appendChild(iq.buildNode('x', {'xmlns': NS_XDATA, 'type': 'submit'}));

            var field1 = x.appendChild(iq.buildNode('field', {'var': 'FORM_TYPE', 'type': 'hidden', 'xmlns': NS_XDATA}));
            field1.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, NS_PUBSUB_NC));

            // Persist items?
            if(persist) {
                var field2 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#persist_items', 'xmlns': NS_XDATA}));
                field2.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, persist));
            }

            // Maximum items?
            if(maximum) {
                var field3 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#max_items', 'xmlns': NS_XDATA}));
                field3.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, maximum));
            }

            // Access rights?
            if(access) {
                var field4 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#access_model', 'xmlns': NS_XDATA}));
                field4.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, access));
            }

            // Publish rights?
            if(publish) {
                var field5 = x.appendChild(iq.buildNode('field', {'var': 'pubsub#publish_model', 'xmlns': NS_XDATA}));
                field5.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, publish));
            }

            con.send(iq);
        } catch(e) {
            Console.error('Pubsub.setup', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();