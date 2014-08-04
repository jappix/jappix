/*

Jappix - An open social platform
These are the vCard JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var vCard = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the vCard popup
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Your profile") + '</div>' +

            '<div class="tab">' +
                '<a href="#" class="tab-active" data-key="1">' + Common._e("Identity") + '</a>' +
                '<a href="#" data-key="2">' + Common._e("Profile image") + '</a>' +
                '<a href="#" data-key="3">' + Common._e("Others") + '</a>' +
            '</div>' +

            '<div class="content">' +
                '<div id="lap1" class="lap-active one-lap forms">' +
                    '<fieldset>' +
                        '<legend>' + Common._e("Personal") + '</legend>' +

                        '<label for="USER-FN">' + Common._e("Complete name") + '</label>' +
                        '<input type="text" id="USER-FN" data-vcard4="fn-text" class="vcard-item" placeholder="John Locke" />' +

                        '<label for="USER-NICKNAME">' + Common._e("Nickname") + '</label>' +
                        '<input type="text" id="USER-NICKNAME" data-vcard4="nickname-text" class="vcard-item" placeholder="Jo" />' +

                        '<label for="USER-N-GIVEN">' + Common._e("First name") + '</label>' +
                        '<input type="text" id="USER-N-GIVEN" data-vcard4="n-given" class="vcard-item" placeholder="John" />' +

                        '<label for="USER-N-FAMILY">' + Common._e("Last name") + '</label>' +
                        '<input type="text" id="USER-N-FAMILY" data-vcard4="n-surname" class="vcard-item" placeholder="Locke" />' +

                        '<label for="USER-BDAY">' + Common._e("Date of birth") + '</label>' +
                        '<input type="text" id="USER-BDAY" data-vcard4="bday-date" class="vcard-item" pattern="^[0-9]{2}-[0-9]{2}-[0-9]{4}$" placeholder="16-02-1974" />' +
                    '</fieldset>' +

                    '<fieldset>' +
                        '<legend>' + Common._e("Contact") + '</legend>' +

                        '<label for="USER-EMAIL-USERID">' + Common._e("E-mail") + '</label>' +
                        '<input type="text" id="USER-EMAIL-USERID" data-vcard4="email-text" class="vcard-item" placeholder="john@locke.fam" />' +

                        '<label for="USER-TEL-NUMBER">' + Common._e("Phone") + '</label>' +
                        '<input type="text" id="USER-TEL-NUMBER" data-vcard4="tel-uri" class="vcard-item" placeholder="John" placeholder="+1-292-321-0812" />' +

                        '<label for="USER-URL">' + Common._e("Website") + '</label>' +
                        '<input type="text" id="USER-URL" data-vcard4="url-uri" class="vcard-item" placeholder="john.locke.fam" />' +
                    '</fieldset>' +
                '</div>' +

                '<div id="lap2" class="one-lap forms">' +
                    '<fieldset>' +
                        '<legend>' + Common._e("New") + '</legend>' +

                        '<input type="hidden" id="USER-PHOTO-TYPE" class="vcard-item" />' +
                        '<input type="hidden" id="USER-PHOTO-BINVAL" class="vcard-item" />' +

                        '<form id="vcard-avatar" action="./server/avatar-upload.php" method="post" enctype="multipart/form-data">' +
                            Interface.generateFileShare() +
                        '</form>' +
                    '</fieldset>' +

                    '<fieldset>' +
                        '<legend>' + Common._e("Current") + '</legend>' +

                        '<div class="avatar-container"></div>' +

                        '<a href="#" class="one-button avatar-delete talk-images">' + Common._e("Delete") + '</a>' +
                        '<div class="no-avatar">' + Common._e("What a pity! You have no profile image defined in your identity card!") + '</div>' +
                    '</fieldset>' +

                    '<div class="avatar-wait avatar-info">' + Common._e("Please wait while your avatar is uploaded...") + '</div>' +
                    '<div class="avatar-ok avatar-info">' + Common._e("Here it is! A new beautiful profile image!") + '</div>' +
                    '<div class="avatar-error avatar-info">' + Common._e("The image file is not supported or has a bad size.") + '</div>' +
                '</div>' +

                '<div id="lap3" class="one-lap forms">' +
                    '<fieldset>' +
                        '<legend>' + Common._e("Address") + '</legend>' +

                        '<label for="USER-ADR-STREET">' + Common._e("Street") + '</label>' +
                        '<input type="text" id="USER-ADR-STREET" data-vcard4="adr-street" class="vcard-item" placeholder="Manhattan" />' +

                        '<label for="USER-ADR-LOCALITY">' + Common._e("City") + '</label>' +
                        '<input type="text" id="USER-ADR-LOCALITY" data-vcard4="adr-locality" class="vcard-item" placeholder="New-York" />' +

                        '<label for="USER-ADR-PCODE">' + Common._e("Postal code") + '</label>' +
                        '<input type="text" id="USER-ADR-PCODE" data-vcard4="adr-code" class="vcard-item" placeholder="10002" />' +

                        '<label for="USER-ADR-CTRY">' + Common._e("Country") + '</label>' +
                        '<input type="text" id="USER-ADR-CTRY" data-vcard4="adr-country" class="vcard-item" placeholder="USA" />' +
                    '</fieldset>' +

                    '<fieldset>' +
                        '<legend>' + Common._e("Biography") + '</legend>' +

                        '<textarea id="USER-DESC" data-vcard4="note-text" rows="8" cols="60" class="vcard-item"></textarea>' +
                    '</fieldset>' +
                '</div>' +

                '<div class="infos">' +
                    '<p class="infos-title">' + Common._e("Important notice") + '</p>' +

                    '<p>' + Common._e("Be careful with the information you store into your profile, because it might be accessible by everyone (even someone you don't want to).") + '</p>' +
                    '<p>' + Common._e("Not everything is private on XMPP; this is one of those things, your public profile (vCard).") + '</p>' +
                    '<p>' + Common.printf(Common._e("It is strongly recommended to upload a profile image (%s maximum), like a picture of yourself, because that makes you easily recognizable by your friends."), JAPPIX_MAX_UPLOAD) + '</p>' +
                    '<p><b><a href="https://me.jappix.com/new" target="_blank">' + Common._e("Enable my public profile") + ' »</a></b></p>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish save disabled">' + Common._e("Save") + '</a>' +
                '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('vcard', html);

            // Associate the events
            self.instance();

            // We get the VCard informations
            self.get(Common.getXID(), 'user');
        } catch(e) {
            Console.error('vCard.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Closes the vCard popup
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('vcard');

            // Create the welcome end popup?
            if(Welcome.is_done) {
                // Open popup
                Me.open();

                // Unavoidable popup
                $('#me').addClass('unavoidable');
            }
        } catch(e) {
            Console.error('vCard.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Switches the vCard popup tabs
     * @public
     * @param {string} id
     * @return {boolean}
     */
    self.switchTab = function(id) {

        try {
            $('#vcard .one-lap').removeClass('lap-active');
            $('#vcard #lap' + id).addClass('lap-active');
            $('#vcard .tab a').removeClass('tab-active');
            $('#vcard .tab a[data-key="' + id + '"]').addClass('tab-active');
        } catch(e) {
            Console.error('vCard.switchTab', e);
        } finally {
            return false;
        }

    };


    /**
     * Waits for the avatar upload reply
     * @public
     * @return {undefined}
     */
    self.waitAvatarUpload = function() {

        try {
            // Reset the avatar info
            $('#vcard .avatar-info').hide().stopTime();

            // Show the wait info
            $('#vcard .avatar-wait').show();
        } catch(e) {
            Console.error('vCard.waitAvatarUpload', e);
        }

    };


    /**
     * Handles the avatar upload reply
     * @public
     * @param {object} responseXML
     * @return {undefined}
     */
    self.handleAvatarUpload = function(responseXML) {

        try {
            // Data selector
            var dData = $(responseXML).find('jappix');

            // Not current upload session?
            if(parseInt(dData.attr('id')) != parseInt($('#vcard-avatar input[name="id"]').val())) {
                return;
            }

            // Reset the avatar info
            $('#vcard .avatar-info').hide().stopTime();

            // Process the returned data
            if(!dData.find('error').size()) {
                // Read the values
                var aType = dData.find('type').text();
                var aBinval = dData.find('binval').text();

                // We remove everything that isn't useful right here
                $('#vcard .no-avatar').hide();
                $('#vcard .avatar').remove();

                // We display the delete button
                $('#vcard .avatar-delete').show();

                // We tell the user it's okay
                $('#vcard .avatar-ok').show();

                // Timer
                $('#vcard .avatar-info').oneTime('10s', function() {
                    $(this).hide();
                });

                // We put the base64 values in a hidden input to be sent
                $('#USER-PHOTO-TYPE').val(aType);
                $('#USER-PHOTO-BINVAL').val(aBinval);

                // We display the avatar!
                $('#vcard .avatar-container').replaceWith('<div class="avatar-container"><img class="avatar" src="data:' + aType + ';base64,' + aBinval + '" alt="" /></div>');
            }

            // Any error?
            else {
                $('#vcard .avatar-error').show();

                // Timer
                $('#vcard .avatar-info').oneTime('10s', function() {
                    $(this).hide();
                });

                Console.error('Error while uploading the avatar', dData.find('error').text());
            }
        } catch(e) {
            Console.error('vCard.handleAvatarUpload', e);
        }

    };


    /**
     * Deletes the encoded avatar of an user
     * @public
     * @return {boolean}
     */
    self.deleteAvatar = function() {

        try {
            // We remove the avatar displayed elements
            $('#vcard .avatar-info').stopTime();
            $('#vcard .avatar-info, #vcard .avatar-wait, #vcard .avatar-error, #vcard .avatar-ok, #vcard .avatar-delete').hide();
            $('#vcard .avatar').remove();

            // We reset the input value
            $('#USER-PHOTO-TYPE, #USER-PHOTO-BINVAL').val('');

            // We show the avatar-uploading request
            $('#vcard .no-avatar').show();
        } catch(e) {
            Console.error('vCard.deleteAvatar', e);
        } finally {
            return false;
        }

    };


    /**
     * Creates a special vCard input
     * @public
     * @param {string} id
     * @param {string} type
     * @return {undefined}
     */
    self.createInput = function(id, type) {

        try {
            // Generate the new ID
            id = 'USER-' + id;

            // Can append the content
            if((type == 'user') && !Common.exists('#vcard #' + id)) {
                $('#vcard .content').append('<input id="' + id + '" class="vcard-item" type="hidden" />');
            }
        } catch(e) {
            Console.error('vCard.createInput', e);
        }

    };


    /**
     * Gets the vCard of a XID
     * @public
     * @param {string} to
     * @param {string} type
     * @return {undefined}
     */
    self.get = function(to, type) {

        try {
            // Generate a special ID
            var id = genID();

            // New IQ
            var iq = new JSJaCIQ();
            iq.setID(id);
            iq.setType('get');
            iq.appendNode('vCard', {'xmlns': NS_VCARD});

            // Send the IQ to the good user
            if(type == 'user') {
                // Show the wait icon
                $('#vcard .wait').show();

                // Apply the session ID
                $('#vcard').attr('data-vcard', id);

                // Send the IQ
                con.send(iq, self.handleUser);
            } else {
                // Show the wait icon
                $('#userinfos .wait').show();

                // Apply the session ID
                $('#userinfos').attr('data-vcard', id);

                // Send the IQ
                iq.setTo(to);
                con.send(iq, self.handleBuddy);
            }
        } catch(e) {
            Console.error('vCard.get', e);
        }

    };


    /**
     * Handles the current connected user's vCard
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleUser = function(iq) {

        try {
            self.handle(iq, 'user');
        } catch(e) {
            Console.error('vCard.handleUser', e);
        }

    };


    /**
     * Handles an external buddy vCard
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleBuddy = function(iq) {

        try {
            self.handle(iq, 'buddy');
        } catch(e) {
            Console.error('vCard.handleBuddy', e);
        }

    };


    /**
     * Handles a vCard stanza
     * @public
     * @param {object} iq
     * @param {string} type
     * @return {undefined}
     */
    self.handle = function(iq, type) {

        try {
            // Extract the data
            var iqID = iq.getID();
            var iqFrom = Common.fullXID(Common.getStanzaFrom(iq));
            var iqNode = iq.getNode();

            // Define some paths
            var path_vcard = '#vcard[data-vcard="' + iqID + '"]';
            var path_userInfos = '#userinfos[data-vcard="' + iqID + '"]';

            // End if the session does not exist
            if(((type == 'user') && !Common.exists(path_vcard)) || ((type == 'buddy') && !Common.exists(path_userInfos))) {
                return;
            }

            // We retrieve main values
            var values_yet = [];

            $(iqNode).find('vCard').children().each(function() {
                var this_sel = $(this);

                // Read the current parent node name
                var tokenname = (this).nodeName.toUpperCase();

                // Node with a parent
                if(this_sel.children().size()) {
                    this_sel.children().each(function() {
                        // Get the node values
                        var currentID = tokenname + '-' + (this).nodeName.toUpperCase();
                        var currentText = $(this).text();

                        // Not yet added?
                        if(!Utils.existArrayValue(values_yet, currentID)) {
                            // Create an input if it does not exist
                            self.createInput(values_yet, type);

                            // Userinfos viewer popup
                            if((type == 'buddy') && currentText) {
                                if(currentID == 'EMAIL-USERID') {
                                    $(path_userInfos + ' #BUDDY-' + currentID).html('<a href="mailto:' + currentText.htmlEnc() + '" target="_blank">' + currentText.htmlEnc() + '</a>');
                                } else {
                                    $(path_userInfos + ' #BUDDY-' + currentID).text(currentText.htmlEnc());
                                }
                            }

                            // Profile editor popup
                            else if(type == 'user') {
                                $(path_vcard + ' #USER-' + currentID).val(currentText);
                            }

                            // Avoid duplicating the value
                            values_yet.push(currentID);
                        }
                    });
                }

                // Node without any parent
                else {
                    // Get the node values
                    var currentText = $(this).text();

                    // Not yet added?
                    if(!Utils.existArrayValue(values_yet, tokenname)) {
                        // Create an input if it does not exist
                        self.createInput(tokenname, type);

                        // Userinfos viewer popup
                        if((type == 'buddy') && currentText) {
                            // URL modification
                            if(tokenname == 'URL') {
                                // No http:// or https:// prefix, we should add it
                                if(!currentText.match(/^https?:\/\/(.+)/)) {
                                    currentText = 'http://' + currentText;
                                }

                                currentText = '<a href="' + currentText + '" target="_blank">' + currentText.htmlEnc() + '</a>';
                            }

                            // Description modification
                            else if(tokenname == 'DESC') {
                                currentText = Filter.message(currentText, Name.getBuddy(iqFrom).htmlEnc(), true);
                            }

                            // Other stuffs
                            else {
                                currentText = currentText.htmlEnc();
                            }

                            $(path_userInfos + ' #BUDDY-' + tokenname).html(currentText);
                        }

                        // Profile editor popup
                        else if(type == 'user') {
                            $(path_vcard + ' #USER-' + tokenname).val(currentText);
                        }

                        // Avoid duplicating the value
                        values_yet.push(tokenname);
                    }
                }
            });

            // Update the stored avatar
            if(type == 'buddy') {
                // Get the avatar XML
                var xml = DataStore.getPersistent('global', 'avatar', iqFrom);

                // If there were no stored avatar previously
                if($(Common.XMLFromString(xml)).find('type').text() == 'none') {
                    xml = xml.replace(/<forced>false<\/forced>/gi, '<forced>true</forced>');
                    DataStore.setPersistent(Common.getXID(), 'avatar', iqFrom, xml);
                }

                // Handle the user avatar
                Avatar.handle(iq);
            }

            // The avatar values targets
            var aBinval, aType, aContainer;

            if(type == 'user') {
                aBinval = $('#USER-PHOTO-BINVAL').val();
                aType = $('#USER-PHOTO-TYPE').val();
                aContainer = path_vcard + ' .avatar-container';
            } else {
                aBinval = $(iqNode).find('BINVAL:first').text();
                aType = $(iqNode).find('TYPE:first').text();
                aContainer = path_userInfos + ' .avatar-container';
            }

            // We display the avatar if retrieved
            if(aBinval) {
                // No type?
                if(!aType) {
                    aType = 'image/png';
                }

                if(type == 'user') {
                    // We move all the things that we don't need in that case
                    $(path_vcard + ' .no-avatar').hide();
                    $(path_vcard + ' .avatar-delete').show();
                    $(path_vcard + ' .avatar').remove();
                }

                var avatar_src = ('data:' + aType + ';base64,' + aBinval);

                // We display the avatar we have just received
                $(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="' + avatar_src + '" alt="" /></div>');
            }

            else if(type == 'buddy') {
                $(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" /></div>');
            }

            // Do someting depending of the type
            if(type == 'user') {
                $(path_vcard + ' .wait').hide();
                $(path_vcard + ' .finish:first').removeClass('disabled');
            } else {
                UserInfos.vCard();
            }

            Console.log('vCard received: ' + iqFrom);
        } catch(e) {
            Console.error('vCard.handle', e);
        }

    };


    /**
     * Sends the vCard of the user
     * @public
     * @return {boolean}
     */
    self.send = function() {

        try {
            // Send both vcard-temp + vCard4
            self._sendLegacy();
            self._sendForward();

            // Send the user nickname & avatar over PEP
            if(Features.enabledPEP()) {
                self._sendPubsub();
            }

            // Close the vCard stuffs
            self.close();

            // Get our new avatar
            Avatar.get(Common.getXID(), 'force', 'true', 'forget');

            Console.log('vCard sent.');
        } catch(e) {
            Console.error('vCard.send', e);
        } finally {
            return false;
        }

    };


    /**
     * Generate XML tree
     * @private
     * @return {boolean}
     */
    self._generateTree = function(namespace, stanza, node) {

        try {
            var selector = $('#vcard .vcard-item');
            var get_id_fn = function(this_sel) {
                var id = this_sel.attr('id');
                return id ? id.replace(/^USER-(.+)/, '$1') : null;
            };

            if(namespace === NS_IETF_VCARD4) {
                selector = selector.filter('[data-vcard4]');
                get_id_fn = function(this_sel) {
                    return this_sel.attr('data-vcard4') || null;
                };
            }

            // We send the identity part of the form
            selector.each(function() {
                var this_sel = $(this);

                var item_id = get_id_fn(this_sel);
                var item_value = this_sel.val();

                if(item_value && item_id) {
                    if(item_id.indexOf('-') !== -1) {
                        var tagname = Common.explodeThis('-', item_id, 0);
                        var cur_node;

                        if(node.getElementsByTagName(tagname).length > 0) {
                            cur_node = node.getElementsByTagName(tagname).item(0);
                        } else {
                            cur_node = node.appendChild(stanza.buildNode(tagname, {'xmlns': namespace}));
                        }

                        cur_node.appendChild(
                            stanza.buildNode(
                                Common.explodeThis('-', item_id, 1),
                                {'xmlns': namespace},
                                item_value
                            )
                        );
                    } else {
                        node.appendChild(stanza.buildNode(item_id, {'xmlns': namespace}, item_value));
                    }
                }
            });

            return true;
        } catch(e) {
            Console.error('vCard._generateTree', e);

            return false;
        }

    };


    /**
     * Configure given Pubsub node
     * @private
     * @param {string} namespace
     * @return {undefined}
     */
    self._configureNode = function(namespace) {

        try {
            Pubsub.setup(null, namespace, '1', '1', 'open', 'whitelist');
        } catch(e) {
            Console.error('vCard._configureNode', e);
        }

    };


    /**
     * Send legacy vCard
     * @private
     * @return {undefined}
     */
    self._sendLegacy = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            var vCard = iq.appendNode('vCard', {
                'xmlns': NS_VCARD
            });

            self._generateTree(NS_VCARD, iq, vCard);

            con.send(iq);
        } catch(e) {
            Console.error('vCard._sendLegacy', e);
        }

    };


    /**
     * Send forward version vCard (vCard 4)
     * @private
     * @return {undefined}
     */
    self._sendForward = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            // Build Pubsub headers
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});

            var publish = pubsub.appendChild(iq.buildNode('publish', {
                'node': NS_XMPP_VCARD4,
                'xmlns': NS_PUBSUB
            }));

            var item = publish.appendChild(iq.buildNode('item', {
                'xmlns': NS_PUBSUB,
                'id': 'current'
            }));

            // Generate vCard4 tree
            var vcard = item.appendChild(iq.buildNode('vcard', {
                'xmlns': NS_IETF_VCARD4
            }));

            self._generateTree(NS_IETF_VCARD4, iq, vcard);

            con.send(iq);

            // Make it publicly-viewable
            self._configureNode(NS_XMPP_VCARD4);
        } catch(e) {
            Console.error('vCard._sendForward', e);
        }

    };


    /**
     * Send other Pubsub items
     * @private
     * @return {undefined}
     */
    self._sendPubsub = function() {

        try {
            // Generate some values
            var photo_bin = $('#USER-PHOTO-BINVAL').val();
            var photo_data = Base64.decode(photo_bin) || '';

            // Data to be sent
            var send_data = {};
            send_data[NS_NICK] = $('#USER-NICKNAME').val();
            send_data[NS_URN_ADATA] = photo_bin;
            send_data[NS_URN_AMETA] = {
                'type': $('#USER-PHOTO-TYPE').val(),
                'id': (hex_sha1(photo_data) || ''),
                'bytes': (photo_data.length || '')
            };

            // Generate the XML
            $.each(send_data, function(namespace, data) {
                var iq = new JSJaCIQ();
                iq.setType('set');

                var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
                var publish = pubsub.appendChild(iq.buildNode('publish', {'node': namespace, 'xmlns': NS_PUBSUB}));

                if(data) {
                    var item;

                    if(namespace === NS_NICK) {
                        item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));

                        // Nickname element
                        item.appendChild(iq.buildNode('nick', {'xmlns': NS_NICK}, data));
                    } else if(namespace === NS_URN_ADATA || namespace === NS_URN_AMETA) {
                        item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));

                        // Apply the SHA-1 hash
                        if(send_data[NS_URN_AMETA].id) {
                            item.setAttribute('id', send_data[NS_URN_AMETA].id);
                        }

                        // Append XML nodes depending on namespace
                        if(namespace === NS_URN_ADATA) {
                            item.appendChild(iq.buildNode('data', {'xmlns': NS_URN_ADATA}, data));
                        } else if(namespace === NS_URN_AMETA) {
                            var metadata = item.appendChild(iq.buildNode('metadata', {'xmlns': NS_URN_AMETA}));

                            if(data) {
                                var meta_info = metadata.appendChild(iq.buildNode('info', {'xmlns': NS_URN_AMETA}));

                                if(data.type)
                                    meta_info.setAttribute('type', data.type);
                                if(data.id)
                                    meta_info.setAttribute('id', data.id);
                                if(data.bytes)
                                    meta_info.setAttribute('bytes', data.bytes);
                            }
                        }
                    }
                }

                con.send(iq);

                // Make node publicly-viewable
                self._configureNode(namespace);
            });
        } catch(e) {
            Console.error('vCard._sendPubsub', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Focus on the first input
            $(document).oneTime(10, function() {
                $('#vcard input:first').focus();
            });

            // Keyboard events
            $('#vcard input[type="text"]').keyup(function(e) {
                // Enter pressed: send the vCard
                if((e.keyCode == 13) && !$('#vcard .finish.save').hasClass('disabled')) {
                    return self.send();
                }
            });

            // Click events
            $('#vcard .tab a').click(function() {
                var this_sel = $(this);

                // Yet active?
                if(this_sel.hasClass('tab-active')) {
                    return false;
                }

                // Switch to the good tab
                var key = parseInt(this_sel.attr('data-key'));

                return self.switchTab(key);
            });

            $('#vcard .avatar-delete').click(function() {
                return self.deleteAvatar();
            });

            $('#vcard .bottom .finish').click(function() {
                var this_sel = $(this);

                if(this_sel.is('.cancel')) {
                    return self.close();
                }

                if(this_sel.is('.save') && !this_sel.hasClass('disabled')) {
                    return self.send();
                }

                return false;
            });

            // Avatar upload vars
            var avatar_options = {
                dataType:       'xml',
                beforeSubmit:   self.waitAvatarUpload,
                success:        self.handleAvatarUpload
            };

            // Avatar upload form submit event
            $('#vcard-avatar').submit(function() {
                if($('#vcard .wait').is(':hidden') &&
                    $('#vcard .avatar-info.avatar-wait').is(':hidden') &&
                    $('#vcard-avatar input[type="file"]').val()) {
                    $(this).ajaxSubmit(avatar_options);
                }

                return false;
            });

            // Avatar upload input change event
            $('#vcard-avatar input[type="file"]').change(function() {
                if($('#vcard .wait').is(':hidden') &&
                    $('#vcard .avatar-info.avatar-wait').is(':hidden') &&
                    $(this).val()) {
                    $('#vcard-avatar').ajaxSubmit(avatar_options);
                }

                return false;
            });

            // Placeholders
            $('#vcard-avatar input[type="text"]').placeholder();
        } catch(e) {
            Console.error('vCard.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();