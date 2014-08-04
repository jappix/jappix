/*

Jappix - An open social platform
These are the options JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Options = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the options popup
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Edit options") + '</div>' +

            '<div class="tab">' +
                '<a href="#" class="tab-general tab-active" data-key="1">' + Common._e("General") + '</a>' +
                '<a href="#" class="tab-channel pubsub-hidable pubsub-hidable-cn" data-key="2">' + Common._e("Channel") + '</a>' +
                '<a href="#" class="tab-account" data-key="3">' + Common._e("Account") + '</a>' +
            '</div>' +

            '<div class="content">' +
                '<div id="conf1" class="lap-active one-lap forms">' +
                    '<fieldset class="privacy">' +
                        '<legend>' + Common._e("Privacy") + '</legend>' +

                        '<div class="geolocation">' +
                            '<label for="geolocation" class="pep-hidable">' + Common._e("Geolocation") + '</label>' +
                            '<input id="geolocation" type="checkbox" class="pep-hidable" />' +
                        '</div>' +

                        '<div class="archiving">' +
                            '<label for="archiving" class="mam-hidable">' + Common._e("Message archiving") + '</label>' +
                            '<select id="archiving" class="mam-hidable">' +
                                '<option value="never">' + Common._e("Disabled") + '</option>' +
                                '<option value="roster">' + Common._e("Store friend chats") + '</option>' +
                                '<option value="always">' + Common._e("Store all chats") + '</option>' +
                            '</select>' +
                            '<a href="#" class="linked empty-archives mam-purge-hidable">' + Common._e("Remove all archives") + '</a>' +
                        '</div>' +
                    '</fieldset>' +

                    '<fieldset class="application">' +
                        '<legend>' + Common._e("Application") + '</legend>' +

                        '<div class="sounds">' +
                            '<label for="sounds">' + Common._e("Sounds") + '</label>' +
                            '<input id="sounds" type="checkbox" />' +
                        '</div>' +

                        '<div class="showall">' +
                            '<label for="showall">' + Common._e("Show all friends") + '</label>' +
                            '<input id="showall" type="checkbox" />' +
                        '</div>' +

                        '<div class="groupchatpresence">' +
                            '<label for="groupchatpresence">' + Common._e("Groupchat presence messages") + '</label>' +
                            '<input id="groupchatpresence" type="checkbox" />' +
                        '</div>' +

                        '<div class="noxhtmlimg">' +
                            '<label for="noxhtmlimg">' + Common._e("No chat images auto-load") + '</label>' +
                            '<input id="noxhtmlimg" type="checkbox" />' +
                        '</div>' +

                        '<div class="integratemedias">' +
                            '<label for="integratemedias">' + Common._e("Media integration") + '</label>' +
                            '<input id="integratemedias" type="checkbox" />' +
                        '</div>' +

                        '<div class="localarchives mam-showable">' +
                            '<label for="localarchives">' + Common._e("Keep local chat archives") + '</label>' +
                            '<input id="localarchives" type="checkbox" />' +
                        '</div>' +

                        '<div class="xmpplinks">' +
                            '<label class="xmpplinks-hidable">' + Common._e("XMPP links") + '</label>' +
                            '<a href="#" class="linked xmpp-links xmpplinks-hidable">' + Common._e("Open XMPP links with Jappix") + '</a>' +
                        '</div>' +
                    '</fieldset>' +

                    '<div class="sub-ask sub-ask-mam sub-ask-element">' +
                        '<div class="sub-ask-top">' +
                            '<div class="sub-ask-title">' + Common._e("Remove all archives") + '</div>' +
                            '<a href="#" class="sub-ask-close">X</a>' +
                        '</div>' +

                        '<div class="sub-ask-content">' +
                            '<label>' + Common._e("Password") + '</label>' +
                            '<input type="password" class="purge-archives check-mam" required="" />' +
                        '</div>' +

                        '<a href="#" class="sub-ask-bottom">' + Common._e("Remove") + ' &raquo;</a>' +
                    '</div>' +
                '</div>' +

                '<div id="conf2" class="one-lap forms">' +
                    '<fieldset class="channel">' +
                        '<legend>' + Common._e("Channel") + '</legend>' +

                        '<div class="empty-channel">' +
                            '<label>' + Common._e("Empty") + '</label>' +
                            '<a href="#" class="linked empty-channel">' + Common._e("Empty channel") + '</a>' +
                        '</div>' +

                        '<div class="persistent">' +
                            '<label>' + Common._e("Persistent") + '</label>' +
                            '<input id="persistent" type="checkbox" />' +
                        '</div>' +

                        '<div class="maxnotices">' +
                            '<label>' + Common._e("Maximum notices") + '</label>' +
                            '<select id="maxnotices">' +
                                '<option value="1">1</option>' +
                                '<option value="100">100</option>' +
                                '<option value="1000">1000</option>' +
                                '<option value="10000">10000</option>' +
                                '<option value="100000">100000</option>' +
                                '<option value="1000000">1000000</option>' +
                            '</select>' +
                        '</div>' +

                    '</fieldset>' +

                    '<div class="sub-ask sub-ask-empty sub-ask-element">' +
                        '<div class="sub-ask-top">' +
                            '<div class="sub-ask-title">' + Common._e("Empty channel") + '</div>' +
                            '<a href="#" class="sub-ask-close">X</a>' +
                        '</div>' +

                        '<div class="sub-ask-content">' +
                            '<label>' + Common._e("Password") + '</label>' +
                            '<input type="password" class="purge-microblog check-empty" required="" />' +
                        '</div>' +

                        '<a href="#" class="sub-ask-bottom">' + Common._e("Empty") + ' &raquo;</a>' +
                    '</div>' +
                '</div>' +

                '<div id="conf3" class="one-lap forms">' +
                    '<fieldset>' +
                        '<legend>' + Common._e("Account") + '</legend>' +

                        '<label>' + Common._e("Password") + '</label>' +
                        '<a href="#" class="linked change-password">' + Common._e("Change password") + '</a>' +

                        '<label>' + Common._e("Delete") + '</label>' +
                        '<a href="#" class="linked delete-account">' + Common._e("Delete account") + '</a>' +
                    '</fieldset>' +

                    '<div class="sub-ask sub-ask-pass sub-ask-element">' +
                        '<div class="sub-ask-top">' +
                            '<div class="sub-ask-title">' + Common._e("Change password") + '</div>' +
                            '<a href="#" class="sub-ask-close">X</a>' +
                        '</div>' +

                        '<div class="sub-ask-content">' +
                            '<label>' + Common._e("Old") + '</label>' +
                            '<input type="password" class="password-change old" required="" />' +

                            '<label>' + Common._e("New (2 times)") + '</label>' +
                            '<input type="password" class="password-change new1" required="" />' +
                            '<input type="password" class="password-change new2" required="" />' +
                        '</div>' +

                        '<a href="#" class="sub-ask-bottom">' + Common._e("Continue") + ' &raquo;</a>' +
                    '</div>' +

                    '<div class="sub-ask sub-ask-delete sub-ask-element">' +
                        '<div class="sub-ask-top">' +
                            '<div class="sub-ask-title">' + Common._e("Delete account") + '</div>' +
                            '<a href="#" class="sub-ask-close">X</a>' +
                        '</div>' +

                        '<div class="sub-ask-content">' +
                            '<label>' + Common._e("Password") + '</label>' +
                            '<input type="password" class="delete-account check-password" required="" />' +
                        '</div>' +

                        '<a href="#" class="sub-ask-bottom">' + Common._e("Delete") + ' &raquo;</a>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish save">' + Common._e("Save") + '</a>' +
                '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('options', html);

            // Apply the features
            Features.apply('options');

            // Associate the events
            self.instance();
        } catch(e) {
            Console.error('Options.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Closes the options popup
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('options');
        } catch(e) {
            Console.error('Options.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Checks whether the options are loaded or not
     * @public
     * @return {boolean}
     */
    self.loaded = function() {

        is_loaded = false;

        try {
            if($('.options-hidable').is(':visible')) {
                is_loaded = true;
            }
        } catch(e) {
            Console.error('Options.loaded', e);
        } finally {
            return is_loaded;
        }

    };


    /**
     * Switches between the options tabs
     * @public
     * @param {string} id
     * @return {boolean}
     */
    self.switchTab = function(id) {

        try {
            var options_sel = $('#options');

            options_sel.find('.one-lap').hide();
            options_sel.find('#conf' + id).show();
            options_sel.find('.tab a').removeClass('tab-active');
            options_sel.find('.tab a[data-key="' + id + '"]').addClass('tab-active');
            options_sel.find('.sub-ask .sub-ask-close').click();
        } catch(e) {
            Console.error('Options.switchTab', e);
        } finally {
            return false;
        }

    };


    /**
     * Manages the options wait item
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.wait = function(id) {

        try {
            var options_sel = $('#options');
            var content_sel = options_sel.find('.content');

            // Remove the current item class
            content_sel.removeClass(id);

            // Hide the waiting items if all was received
            if(!content_sel.hasClass('microblog') && !content_sel.hasClass('mam')) {
                options_sel.find('.wait').hide();
                options_sel.find('.finish:first').removeClass('disabled');
            }
        } catch(e) {
            Console.error('Options.wait', e);
        }

    };


    /**
     * Sends the options to the XMPP server
     * @public
     * @return {undefined}
     */
    self.store = function() {

        try {
            // Get the values
            var sounds = DataStore.getDB(Connection.desktop_hash, 'options', 'sounds');
            var geolocation = DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation');
            var showall = DataStore.getDB(Connection.desktop_hash, 'options', 'roster-showall');
            var noxhtmlimg = DataStore.getDB(Connection.desktop_hash, 'options', 'no-xhtml-images');
            var groupchatpresence = DataStore.getDB(Connection.desktop_hash, 'options', 'groupchatpresence');
            var integratemedias = DataStore.getDB(Connection.desktop_hash, 'options', 'integratemedias');
            var localarchives = DataStore.getDB(Connection.desktop_hash, 'options', 'localarchives');
            var status = DataStore.getDB(Connection.desktop_hash, 'options', 'presence-status');

            // Create an array to be looped
            var oType = ['sounds', 'geolocation', 'roster-showall', 'no-xhtml-images', 'groupchatpresence', 'integratemedias', 'localarchives', 'presence-status'];
            var oContent = [sounds, geolocation, showall, noxhtmlimg, groupchatpresence, integratemedias, localarchives, status];

            // New IQ
            var iq = new JSJaCIQ();
            iq.setType('set');

            var query = iq.setQuery(NS_PRIVATE);
            var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_OPTIONS}));

            // Loop the array
            for(var i in oType) {
                storage.appendChild(iq.buildNode('option', {'type': oType[i], 'xmlns': NS_OPTIONS}, oContent[i]));
            }

            con.send(iq, self.handleStore);

            Console.info('Storing options...');
        } catch(e) {
            Console.error('Options.store', e);
        }

    };


    /**
     * Handles the option storing
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleStore = function(iq) {

        try {
            if(!iq || (iq.getType() != 'result')) {
                Console.warn('Options not stored.');
            } else {
                Console.info('Options stored.');
            }
        } catch(e) {
            Console.error('Options.handleStore', e);
        }

    };


    /**
     * Saves the user options
     * @public
     * @return {boolean}
     */
    self.save = function() {

        try {
            // We apply the sounds
            var sounds = '0';

            if($('#sounds').filter(':checked').size()) {
                sounds = '1';
            }

            DataStore.setDB(Connection.desktop_hash, 'options', 'sounds', sounds);

            // We apply the geolocation
            if($('#geolocation').filter(':checked').size()) {
                DataStore.setDB(Connection.desktop_hash, 'options', 'geolocation', '1');

                // We geolocate the user on the go
                PEP.geolocate();
            } else {
                DataStore.setDB(Connection.desktop_hash, 'options', 'geolocation', '0');

                // We delete the geolocation informations
                PEP.sendPosition();
                DataStore.removeDB(Connection.desktop_hash, 'geolocation', 'now');
            }

            // We apply the roster show all
            if($('#showall').filter(':checked').size()) {
                DataStore.setDB(Connection.desktop_hash, 'options', 'roster-showall', '1');
                Interface.showAllBuddies('options');
            } else {
                DataStore.setDB(Connection.desktop_hash, 'options', 'roster-showall', '0');
                Interface.showOnlineBuddies('options');
            }

            // We apply the XHTML-IM images filter
            var noxhtmlimg = '1' ? $('#noxhtmlimg').filter(':checked').size() : '0';
            DataStore.setDB(Connection.desktop_hash, 'options', 'no-xhtml-images', noxhtmlimg);

            // We apply the groupchat presence messages configuration
            var groupchatpresence = '1' ? $('#groupchatpresence').filter(':checked').size() : '0';
            DataStore.setDB(Connection.desktop_hash, 'options', 'groupchatpresence', groupchatpresence);

            // We apply the media integration
            var integratemedias = '1' ? $('#integratemedias').filter(':checked').size() : '0';
            DataStore.setDB(Connection.desktop_hash, 'options', 'integratemedias', integratemedias);

            // We apply the local archiving
            var localarchives = '1' ? $('#localarchives').filter(':checked').size() : '0';
            DataStore.setDB(Connection.desktop_hash, 'options', 'localarchives', localarchives);

            // Flush local archives?
            if(localarchives === '0') {
                Message.flushLocalArchive();
            }

            // We apply the message archiving
            if(Features.enabledMAM()) {
                MAM.setConfig($('#archiving').val() || 'never');
            }

            // We apply the microblog configuration
            var persist = '1' ? $('#persist').filter(':checked').size() : '0';
            var maximum = $('#maxnotices').val();

            if(Features.enabledPEP() && (Features.enabledPubSub() || Features.enabledPubSubCN())) {
                Pubsub.setup('', NS_URN_MBLOG, persist, maximum, '', '', false);
            }

            // We send the options to the database
            self.store();

            // Close the options
            self.close();
        } catch(e) {
            Console.error('Options.save', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the password changing
     * @public
     * @param {string} iq
     * @return {undefined}
     */
    self.handlePwdChange = function(iq) {

        try {
            // Remove the general wait item
            Interface.removeGeneralWait();

            // If no errors
            if(!Errors.handleReply(iq)) {
                Connection.clearLastSession();
                Connection.quit();
                Board.openThisInfo(1);

                Console.info('Password changed.');
            } else {
                Console.warn('Password not changed.');
            }
        } catch(e) {
            Console.error('Options.handlePwdChange', e);
        }

    };


    /**
     * Sends the new account password
     * @public
     * @return {boolean}
     */
    self.sendNewPassword = function() {

        /* REF: http://xmpp.org/extensions/xep-0077.html#usecases-changepw */

        try {
            var password0 = $('#options .old').val();
            var password1 = $('#options .new1').val();
            var password2 = $('#options .new2').val();

            if ((password1 == password2) && (password0 == Utils.getPassword())) {
                // We show the waiting image
                Interface.showGeneralWait();

                // We send the IQ
                var iq = new JSJaCIQ();

                iq.setTo(Utils.getServer());
                iq.setType('set');

                var iqQuery = iq.setQuery(NS_REGISTER);

                iqQuery.appendChild(iq.buildNode('username', {'xmlns': NS_REGISTER}, con.username));
                iqQuery.appendChild(iq.buildNode('password', {'xmlns': NS_REGISTER}, password1));

                con.send(iq, self.handlePwdChange);

                Console.info('Password change sent.');
            } else {
                $('.sub-ask-pass input').each(function() {
                    var select = $(this);

                    if(!select.val()) {
                        $(document).oneTime(10, function() {
                            select.addClass('please-complete').focus();
                        });
                    } else {
                        select.removeClass('please-complete');
                    }
                });

                if(password0 != Utils.getPassword()) {
                    $(document).oneTime(10, function() {
                        $('#options .old').addClass('please-complete').focus();
                    });
                }

                if(password1 != password2) {
                    $(document).oneTime(10, function() {
                        $('#options .new1, #options .new2').addClass('please-complete').focus();
                    });
                }
            }
        } catch(e) {
            Console.error('Options.sendNewPassword', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the account deletion request
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleAccDeletion = function(iq) {

        try {
            // Remove the general wait item
            Interface.removeGeneralWait();

            // If no errors
            if(!Errors.handleReply(iq)) {
                Connection.clearLastSession();
                Talk.destroy();
                Board.openThisInfo(2);
                Connection.logout();

                Console.info('Account deleted.');
            } else {
                Console.warn('Account not deleted.');
            }
        } catch(e) {
            Console.error('Options.handleAccDeletion', e);
        }

    };


    /**
     * Purge the user's archives (MAM)
     * @public
     * @return {boolean}
     */
    self.purgeMyArchives = function() {

        try {
            var pwd_input_sel = $('#options .check-mam');
            var password = pwd_input_sel.val();

            if(password == Utils.getPassword()) {
                MAM.purgeArchives();

                // Clear archives in UI
                $('.page-engine-chan[data-type="chat"] .tools-clear').click();

                // Hide the tool
                pwd_input_sel.val('');
                $('#options .sub-ask-mam .sub-ask-close').click();
            } else {
                var selector = $('#options .check-mam');

                if(password != Utils.getPassword()) {
                    $(document).oneTime(10, function() {
                        selector.addClass('please-complete').focus();
                    });
                } else {
                    selector.removeClass('please-complete');
                }
            }
        } catch(e) {
            Console.error('Options.purgeMyArchives', e);
        } finally {
            return false;
        }

    };


    /**
     * Purge the user's microblog items
     * @public
     * @return {boolean}
     */
    self.purgeMyMicroblog = function() {

        /* REF: http://xmpp.org/extensions/xep-0060.html#owner-purge */

        try {
            var pwd_input_sel = $('#options .check-empty');
            var password = pwd_input_sel.val();

            if(password == Utils.getPassword()) {
                // Send the IQ to remove the item (and get eventual error callback)
                var iq = new JSJaCIQ();
                iq.setType('set');

                var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB_OWNER});
                pubsub.appendChild(iq.buildNode('purge', {'node': NS_URN_MBLOG, 'xmlns': NS_PUBSUB_OWNER}));

                con.send(iq, self.handleMicroblogPurge);

                // Hide the tool
                pwd_input_sel.val('');
                $('#options .sub-ask-empty .sub-ask-close').click();

                Console.info('Microblog purge sent.');
            } else {
                var selector = $('#options .check-empty');

                if(password != Utils.getPassword()) {
                    $(document).oneTime(10, function() {
                        selector.addClass('please-complete').focus();
                    });
                } else {
                    selector.removeClass('please-complete');
                }
            }
        } catch(e) {
            Console.error('Options.purgeMyMicroblog', e);
        } finally {
            return false;
        }

    };


    /**
     * Handles the microblog purge
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleMicroblogPurge = function(iq) {

        try {
            // If no errors
            if(!Errors.handleReply(iq)) {
                // Remove the microblog items
                $('.one-update.update_' + hex_md5(Common.getXID())).remove();

                Console.info('Microblog purged.');
            } else {
                Console.warn('Microblog not purged.');
            }
        } catch(e) {
            Console.error('Options.handleMicroblogPurge', e);
        }

    };


    /**
     * Deletes the user's account
     * @public
     * @return {boolean}
     */
    self.deleteMyAccount = function() {

        /* REF: http://xmpp.org/extensions/xep-0077.html#usecases-cancel */

        try {
            var password = $('#options .check-password').val();

            if(password == Utils.getPassword()) {
                // We show the waiting image
                Interface.showGeneralWait();

                // We send the IQ
                var iq = new JSJaCIQ();
                iq.setType('set');

                var iqQuery = iq.setQuery(NS_REGISTER);
                iqQuery.appendChild(iq.buildNode('remove', {'xmlns': NS_REGISTER}));

                con.send(iq, self.handleAccDeletion);

                Console.info('Delete account sent.');
            } else {
                var selector = $('#options .check-password');

                if(password != Utils.getPassword()) {
                    $(document).oneTime(10, function() {
                        selector.addClass('please-complete').focus();
                    });
                } else {
                    selector.removeClass('please-complete');
                }
            }
        } catch(e) {
            Console.error('Options.deleteMyAccount', e);
        } finally {
            return false;
        }

    };


    /**
     * Loads the user options
     * @public
     * @return {undefined}
     */
    self.load = function() {

        try {
            // Process the good stuffs, depending of the server features
            var enabled_mam = Features.enabledMAM();
            var enabled_pubsub = Features.enabledPubSub();
            var enabled_pubsub_cn = Features.enabledPubSubCN();
            var enabled_pep = Features.enabledPEP();
            var sWait = $('#options .content');

            // Show the waiting items if necessary
            if(enabled_mam || (enabled_pep && (enabled_pubsub || enabled_pubsub_cn))) {
                $('#options .wait').show();
                $('#options .finish:first').addClass('disabled');
            }

            // We get the archiving configuration
            if(enabled_mam) {
                sWait.addClass('mam');
                MAM.getConfig();
            }

            // We get the microblog configuration
            if((enabled_pubsub || enabled_pubsub_cn) && enabled_pep) {
                sWait.addClass('microblog');
                Microblog.getConfig();
            }

            // We show the "privacy" form if something is visible into it
            if(enabled_mam || enabled_pep) {
                $('#options fieldset.privacy').show();
            }

            // We get the values of the forms for the sounds
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'sounds') == '0') {
                $('#sounds').attr('checked', false);
            } else {
                $('#sounds').attr('checked', true);
            }

            // We get the values of the forms for the geolocation
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation') == '1') {
                $('#geolocation').attr('checked', true);
            } else {
                $('#geolocation').attr('checked', false);
            }

            // We get the values of the forms for the roster show all
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'roster-showall') == '1') {
                $('#showall').attr('checked', true);
            } else {
                $('#showall').attr('checked', false);
            }

            // We get the values of the forms for the XHTML-IM images filter
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'no-xhtml-images') == '1') {
                $('#noxhtmlimg').attr('checked', true);
            } else {
                $('#noxhtmlimg').attr('checked', false);
            }

            // We get the values of the forms for the integratemedias
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'integratemedias') == '0') {
                $('#integratemedias').attr('checked', false);
            } else {
                $('#integratemedias').attr('checked', true);
            }

            // We get the values of the forms for the groupchatpresence
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'groupchatpresence') == '0') {
                $('#groupchatpresence').attr('checked', false);
            } else {
                $('#groupchatpresence').attr('checked', true);
            }

            // We get the values of the forms for the localarchives
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'localarchives') == '0') {
                $('#localarchives').attr('checked', false);
            } else {
                $('#localarchives').attr('checked', true);
            }
        } catch(e) {
            Console.error('Options.load', e);
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
            $('#options .tab a').click(function() {
                // Yet active?
                if($(this).hasClass('tab-active'))
                    return false;

                // Switch to the good tab
                var key = parseInt($(this).attr('data-key'));

                return self.switchTab(key);
            });

            $('#options .linked').click(function() {
                $('#options .sub-ask').hide();
                $('#options .forms').removeClass('in_background');
            });

            $('#options .xmpp-links').click(function() {
                Utils.xmppLinksHandler();

                return false;
            });

            $('#options .empty-archives').click(function() {
                var selector = '#options .sub-ask-mam';

                $(selector).show();
                $('#options .forms').addClass('in_background');

                $(document).oneTime(10, function() {
                    $(selector + ' input').focus();
                });

                return false;
            });

            $('#options .empty-channel').click(function() {
                var selector = '#options .sub-ask-empty';

                $(selector).show();
                $('#options .forms').addClass('in_background');

                $(document).oneTime(10, function() {
                    $(selector + ' input').focus();
                });

                return false;
            });

            $('#options .change-password').click(function() {
                var selector = '#options .sub-ask-pass';

                $(selector).show();
                $('#options .forms').addClass('in_background');

                $(document).oneTime(10, function() {
                    $(selector + ' input:first').focus();
                });

                return false;
            });

            $('#options .delete-account').click(function() {
                var selector = '#options .sub-ask-delete';

                $(selector).show();
                $('#options .forms').addClass('in_background');

                $(document).oneTime(10, function() {
                    $(selector + ' input').focus();
                });

                return false;
            });

            $('#options .sub-ask-pass .sub-ask-bottom').click(function() {
                return self.sendNewPassword();
            });

            $('#options .sub-ask-mam .sub-ask-bottom').click(function() {
                return self.purgeMyArchives();
            });

            $('#options .sub-ask-empty .sub-ask-bottom').click(function() {
                return self.purgeMyMicroblog();
            });

            $('#options .sub-ask-delete .sub-ask-bottom').click(function() {
                return self.deleteMyAccount();
            });

            $('#options .sub-ask-close').click(function() {
                $('#options .sub-ask').hide();
                $('#options .forms').removeClass('in_background');

                return false;
            });

            $('#options .bottom .finish').click(function() {
                if($(this).is('.save') && !$(this).hasClass('disabled')) {
                    return self.save();
                }

                if($(this).is('.cancel')) {
                    return self.close();
                }

                return false;
            });

            // The keyup events
            $('#options .sub-ask input').keyup(function(e) {
                if(e.keyCode == 13) {
                    // Archives purge
                    if($(this).is('.purge-archives')) {
                        return self.purgeMyArchives();
                    }

                    // Microblog purge
                    else if($(this).is('.purge-microblog')) {
                        return self.purgeMyMicroblog();
                    }

                    // Password change
                    else if($(this).is('.password-change')) {
                        return self.sendNewPassword();
                    }

                    // Account deletion
                    else if($(this).is('.delete-account')) {
                        return self.deleteMyAccount();
                    }
                }
            });

            // Load the options
            self.load();
        } catch(e) {
            Console.error('Options.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();