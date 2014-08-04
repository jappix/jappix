/*

Jappix - An open social platform
These are the mucadmin JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda

*/

// Bundle
var MUCAdmin = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the MUC admin popup
     * @public
     * @param {string} xid
     * @param {string} aff
     * @return {undefined}
     */
    self.open = function(xid, aff) {

        try {
            // Popup HTML content
            var html_full =
            '<div class="top">' + Common._e("MUC administration") + '</div>' +

            '<div class="content">' +
                '<div class="head mucadmin-head">' +
                    '<div class="head-text mucadmin-head-text">' + Common._e("You administrate this room") + '</div>' +

                    '<div class="mucadmin-head-jid">' + xid + '</div>' +
                '</div>' +

                '<div class="mucadmin-forms">' +
                    '<div class="mucadmin-topic">' +
                        '<fieldset>' +
                            '<legend>' + Common._e("Subject") + '</legend>' +

                            '<label for="topic-text">' + Common._e("Enter new subject") + '</label>' +
                            '<textarea id="topic-text" name="room-topic" rows="8" cols="60" ></textarea>' +
                        '</fieldset>' +
                    '</div>' +

                    '<div class="mucadmin-conf">' +
                        '<fieldset>' +
                            '<legend>' + Common._e("Configuration") + '</legend>' +

                            '<div class="results mucadmin-results"></div>' +
                        '</fieldset>' +
                    '</div>' +

                    '<div class="mucadmin-aut">' +
                        '<fieldset>' +
                            '<legend>' + Common._e("Authorizations") + '</legend>' +

                            '<label>' + Common._e("Member list") + '</label>' +
                            '<div class="aut-member aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'member\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +

                            '<label>' + Common._e("Owner list") + '</label>' +
                            '<div class="aut-owner aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'owner\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +

                            '<label>' + Common._e("Administrator list") + '</label>' +
                            '<div class="aut-admin aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'admin\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +

                            '<label>' + Common._e("Outcast list") + '</label>' +
                            '<div class="aut-outcast aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'outcast\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +
                        '</fieldset>' +
                    '</div>' +

                    '<div class="mucadmin-others">' +
                        '<fieldset>' +
                            '<legend>' + Common._e("Others") + '</legend>' +

                            '<label>' + Common._e("Destroy this MUC") + '</label>' +
                            '<a href="#" onclick="return MUCAdmin.destroy();">' + Common._e("Yes, let's do it!") + '</a>' +
                        '</fieldset>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish save">' + Common._e("Save") + '</a>' +
                '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>' +
            '</div>';

            var html_partial =
            '<div class="top">' + Common._e("MUC administration") + '</div>' +

            '<div class="content">' +
                '<div class="head mucadmin-head">' +
                    '<div class="head-text mucadmin-head-text">' + Common._e("You administrate this room") + '</div>' +

                    '<div class="mucadmin-head-jid">' + xid + '</div>' +
                '</div>' +

                '<div class="mucadmin-forms">' +
                    '<div class="mucadmin-aut">' +
                        '<fieldset>' +
                            '<legend>' + Common._e("Authorizations") + '</legend>' +

                            '<label>' + Common._e("Member list") + '</label>' +
                            '<div class="aut-member aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'member\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +

                            '<label>' + Common._e("Outcast list") + '</label>' +
                            '<div class="aut-outcast aut-group">' +
                                '<a href="#" class="aut-add" onclick="return MUCAdmin.addInput(\'\', \'outcast\');">' + Common._e("Add an input") + '</a>' +
                            '</div>' +
                        '</fieldset>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish save">' + Common._e("Save") + '</a>' +
                '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>' +
            '</div>';

            // Create the popup
            if(aff == 'owner')
                Popup.create('mucadmin', html_full);
            if(aff == 'admin')
                Popup.create('mucadmin', html_partial);

            // Associate the events
            self.instance();

            // We get the affiliated user's privileges
            if(aff == 'owner') {
                self.query(xid, 'member');
                self.query(xid, 'owner');
                self.query(xid, 'admin');
                self.query(xid, 'outcast');

                // We query the room to edit
                DataForm.go(xid, 'muc', '', '', 'mucadmin');
            } else if(aff == 'admin') {
                self.query(xid, 'member');
                self.query(xid, 'outcast');
            }
        } catch(e) {
            Console.error('MUCAdmin.open', e);
        }

    };


    /**
     * Closes the MUC admin popup
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('mucadmin');
        } catch(e) {
            Console.error('MUCAdmin.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Removes a MUC admin input
     * @public
     * @param {string} element
     * @return {boolean}
     */
    self.removeInput = function(element) {

        try {
            var path = $(element).parent();

            // We first hide the container of the input
            path.hide();

            // Then, we add a special class to the input
            path.find('input').addClass('aut-dustbin');
        } catch(e) {
            Console.error('MUCAdmin.removeInput', e);
        } finally {
            return false;
        }

    };


    /**
     * Adds a MUC admin input
     * @public
     * @param {type} xid
     * @param {type} affiliation
     * @return {boolean}
     */
    self.addInput = function(xid, affiliation) {

        try {
            var hash = hex_md5(xid + affiliation);

            // Add the HTML code
            $('#mucadmin .aut-' + affiliation + ' .aut-add').after(
                '<div class="one-aut ' + hash + '">' +
                    '<input id="aut-' + affiliation + '" name="' + affiliation + '" type="text" class="mucadmin-i" value="' + xid + '" />' +
                    '<a href="#" class="aut-remove">[-]</a>' +
                '</div>'
            );

            // Click event
            $('#mucadmin .' + hash + ' .aut-remove').click(function() {
                return self.removeInput(this);
            });

            // Focus on the input we added
            if(!xid) {
                $(document).oneTime(10, function() {
                    $('#mucadmin .' + hash + ' input').focus();
                });
            }
        } catch(e) {
            Console.error('MUCAdmin.addInput', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the MUC admin form
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleAuth = function(iq) {

        try {
            // We got the authorizations results
            $(iq.getQuery()).find('item').each(function() {
                // We parse the received xml
                var xid = $(this).attr('jid');
                var affiliation = $(this).attr('affiliation');

                // We create one input for one XID
                self.addInput(xid, affiliation);
            });

            // Hide the wait icon
            $('#mucadmin .wait').hide();

            Console.log('MUC admin items received: ' + Common.fullXID(Common.getStanzaFrom(iq)));
        } catch(e) {
            Console.error('MUCAdmin.handleAuth', e);
        }

    };


    /**
     * Queries the MUC admin form
     * @public
     * @param {string} xid
     * @param {string} type
     * @return {undefined}
     */
    self.query = function(xid, type) {

        try {
            // Show the wait icon
            $('#mucadmin .wait').show();

            // New IQ
            var iq = new JSJaCIQ();

            iq.setTo(xid);
            iq.setType('get');

            var iqQuery = iq.setQuery(NS_MUC_ADMIN);
            iqQuery.appendChild(iq.buildNode('item', {'affiliation': type, 'xmlns': NS_MUC_ADMIN}));

            con.send(iq, self.handleAuth);
        } catch(e) {
            Console.error('MUCAdmin.query', e);
        }

    };


    /**
     * Sends the new chat-room topic
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.sendTopic = function(xid) {

        try {
            // We get the new topic
            var topic = $('.mucadmin-topic textarea').val();

            // We send the new topic if not blank
            if(topic) {
                var m = new JSJaCMessage();
                m.setTo(xid);
                m.setType('groupchat');
                m.setSubject(topic);
                con.send(m);

                Console.info('MUC admin topic sent: ' + topic);
            }
        } catch(e) {
            Console.error('MUCAdmin.sendTopic', e);
        }

    };


    /**
     * Sends the MUC admin auth form
     * @public
     * @param {string} xid
     * @return {undefined}
     */
    self.sendAuth = function(xid) {

        try {
            // We define the values array
            var types = new Array('member', 'owner', 'admin', 'outcast');

            $.each(types, function(i) {
                // We get the current type
                var tType = types[i];

                // We loop for all the elements
                $('.mucadmin-aut .aut-' + tType + ' input').each(function() {
                    // We get the needed values
                    var value = $(this).val();
                    var affiliation = ($(this).hasClass('aut-dustbin') && value) ? 'none' : tType;

                    // Submit affiliation
                    if(value && affiliation) {
                        self.setAffiliation(xid, value, affiliation);
                    }
                });
            });

            Console.info('MUC admin authorizations form sent: ' + xid);
        } catch(e) {
            Console.error('MUCAdmin.sendAuth', e);
        }

    };


    /**
     * Sets the affiliation for a given user
     * @public
     * @param {string} muc_xid
     * @param {string} user_xid
     * @param {string} affiliation
     * @return {undefined}
     */
    self.setAffiliation = function(muc_xid, user_xid, affiliation) {

        try {
            // If no affiliation set, assume it's 'none'
            affiliation = affiliation || 'none';

            // Go Go Go!!
            var iq = new JSJaCIQ();
            iq.setTo(muc_xid);
            iq.setType('set');

            var iqQuery = iq.setQuery(NS_MUC_ADMIN);

            var item = iqQuery.appendChild(iq.buildNode('item', {
                'jid': user_xid,
                'affiliation': affiliation,
                'xmlns': NS_MUC_ADMIN
            }));

            con.send(iq, Errors.handleReply);
        } catch(e) {
            Console.error('MUCAdmin.setAffiliation', e);
        }

    };


    /**
     * Checks if the MUC room was destroyed
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleDestroyIQ = function(iq) {

        try {
            if(!Errors.handleReply(iq)) {
                // We close the groupchat
                var room = Common.fullXID(Common.getStanzaFrom(iq));
                var hash = hex_md5(room);
                Interface.quitThisChat(room, hash, 'groupchat');

                // We close the muc admin popup
                self.close();

                // We tell the user that all is okay
                Board.openThisInfo(5);

                // We remove the user's favorite
                if(DataStore.existDB(Connection.desktop_hash, 'favorites', room)) {
                    Favorites.removeThis(room, Common.explodeThis('@', room, 0));
                }

                Console.info('MUC admin destroyed: ' + room);
            }

            // We hide the wait icon
            $('#mucadmin .wait').hide();
        } catch(e) {
            Console.error('MUCAdmin.handleDestroyIQ', e);
        }

    };


    /**
     * Destroys a MUC room
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.destroyIQ = function(xid) {

        try {
            // We ask the server to delete the room
            var iq = new JSJaCIQ();

            iq.setTo(xid);
            iq.setType('set');
            var iqQuery = iq.setQuery(NS_MUC_OWNER);
            iqQuery.appendChild(iq.buildNode('destroy', {'xmlns': NS_MUC_OWNER}));

            con.send(iq, self.handleDestroyIQ);

            Console.info('MUC admin destroy sent: ' + xid);
        } catch(e) {
            Console.error('MUCAdmin.destroyIQ', e);
        } finally {
            return false;
        }

    };


    /**
     * Performs the MUC room destroy functions
     * @public
     * @return {undefined}
     */
    self.destroy = function() {

        try {
            // We get the XID of the current room
            var xid = $('#mucadmin .mucadmin-head-jid').text();

            // We show the wait icon
            $('#mucadmin .wait').show();

            // We send the iq
            self.destroyIQ(xid);
        } catch(e) {
            Console.error('MUCAdmin.destroy', e);
        }

    };


    /**
     * Sends all the MUC admin stuffs
     * @public
     * @return {undefined}
     */
    self.send = function() {

        try {
            // We get the XID of the current room
            var xid = $('#mucadmin .mucadmin-head-jid').text();

            // We change the room topic
            self.sendTopic(xid);

            // We send the needed queries
            DataForm.send('x', 'submit', 'submit', $('#mucadmin .mucadmin-results').attr('data-session'), xid, '', '', 'mucadmin');
            self.sendAuth(xid);
        } catch(e) {
            Console.error('MUCAdmin.send', e);
        }

    };


    /**
     * Saves the MUC admin elements
     * @public
     * @return {boolean}
     */
    self.save = function() {

        try {
            // We send the new options
            self.send();

            // And we quit the popup
            return self.close();
        } catch(e) {
            Console.error('MUCAdmin.save', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Click events
            $('#mucadmin .bottom .finish').click(function() {
                if($(this).is('.cancel')) {
                    return self.close();
                }

                if($(this).is('.save')) {
                    return self.save();
                }
            });
        } catch(e) {
            Console.error('MUCAdmin.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();