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
    self.openVCard = function() {

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
                        '<input type="text" id="USER-FN" class="vcard-item" placeholder="John Locke" />' + 
                        
                        '<label for="USER-NICKNAME">' + Common._e("Nickname") + '</label>' + 
                        '<input type="text" id="USER-NICKNAME" class="vcard-item" placeholder="Jo" />' + 
                        
                        '<label for="USER-N-GIVEN">' + Common._e("First name") + '</label>' + 
                        '<input type="text" id="USER-N-GIVEN" class="vcard-item" placeholder="John" />' + 
                        
                        '<label for="USER-N-FAMILY">' + Common._e("Last name") + '</label>' + 
                        '<input type="text" id="USER-N-FAMILY" class="vcard-item" placeholder="Locke" />' + 
                        
                        '<label for="USER-BDAY">' + Common._e("Date of birth") + '</label>' + 
                        '<input type="text" id="USER-BDAY" class="vcard-item" pattern="^[0-9]{2}-[0-9]{2}-[0-9]{4}$" placeholder="16-02-1974" />' + 
                    '</fieldset>' + 
                    
                    '<fieldset>' + 
                        '<legend>' + Common._e("Contact") + '</legend>' + 
                        
                        '<label for="USER-EMAIL-USERID">' + Common._e("E-mail") + '</label>' + 
                        '<input type="text" id="USER-EMAIL-USERID" class="vcard-item" placeholder="john@locke.fam" />' + 
                        
                        '<label for="USER-TEL-NUMBER">' + Common._e("Phone") + '</label>' + 
                        '<input type="text" id="USER-TEL-NUMBER" class="vcard-item" placeholder="John" placeholder="+1-292-321-0812" />' + 
                        
                        '<label for="USER-URL">' + Common._e("Website") + '</label>' + 
                        '<input type="text" id="USER-URL" class="vcard-item" placeholder="john.locke.fam" />' + 
                    '</fieldset>' + 
                '</div>' + 
                
                '<div id="lap2" class="one-lap forms">' + 
                    '<fieldset>' + 
                        '<legend>' + Common._e("New") + '</legend>' + 
                        
                        '<input type="hidden" id="USER-PHOTO-TYPE" class="vcard-item" />' + 
                        '<input type="hidden" id="USER-PHOTO-BINVAL" class="vcard-item" />' + 
                        
                        '<form id="vcard-avatar" action="./php/avatar-upload.php" method="post" enctype="multipart/form-data">' + 
                            generateFileShare() + 
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
                        '<input type="text" id="USER-ADR-STREET" class="vcard-item" placeholder="Manhattan" />' + 
                        
                        '<label for="USER-ADR-LOCALITY">' + Common._e("City") + '</label>' + 
                        '<input type="text" id="USER-ADR-LOCALITY" class="vcard-item" placeholder="New-York" />' + 
                        
                        '<label for="USER-ADR-PCODE">' + Common._e("Postal code") + '</label>' + 
                        '<input type="text" id="USER-ADR-PCODE" class="vcard-item" placeholder="10002" />' + 
                        
                        '<label for="USER-ADR-CTRY">' + Common._e("Country") + '</label>' + 
                        '<input type="text" id="USER-ADR-CTRY" class="vcard-item" placeholder="USA" />' + 
                    '</fieldset>' + 
                    
                    '<fieldset>' + 
                        '<legend>' + Common._e("Biography") + '</legend>' + 
                        
                        '<textarea id="USER-DESC" rows="8" cols="60" class="vcard-item"></textarea>' + 
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
            createPopup('vcard', html);
            
            // Associate the events
            launchVCard();
            
            // We get the VCard informations
            getVCard(Common.getXID(), 'user');
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
    self.closeVCard = function() {

        try {
            // Destroy the popup
            destroyPopup('vcard');
            
            // Create the welcome end popup?
            if(END_WELCOME) {
                // Open popup
                openMe();
                
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
    self.switchVCard = function(id) {

        try {
            $('#vcard .one-lap').removeClass('lap-active');
            $('#vcard #lap' + id).addClass('lap-active');
            $('#vcard .tab a').removeClass('tab-active');
            $('#vcard .tab a[data-key="' + id + '"]').addClass('tab-active');
        } catch(e) {
            Console.error('vCard.switch', e);
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
            if(parseInt(dData.attr('id')) != parseInt($('#vcard-avatar input[name="id"]').val()))
                return;
            
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
                
                // We display the avatar !
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
    self.createInputVCard = function(id, type) {

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
    self.getVCard = function(to, type) {

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
                con.send(iq, handeUVCard);
            }
            
            else {
                // Show the wait icon
                $('#userinfos .wait').show();
                
                // Apply the session ID
                $('#userinfos').attr('data-vcard', id);
                
                // Send the IQ
                iq.setTo(to);
                con.send(iq, handeBVCard);
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
    self.handeUVCard = function(iq) {

        try {
            handleVCard(iq, 'user');
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
    self.handeBVCard = function(iq) {

        try {
            handleVCard(iq, 'buddy');
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
    self.handleVCard = function(iq, type) {

        try {
            // Extract the data
            var iqID = iq.getID();
            var iqFrom = Common.fullXID(Common.getStanzaFrom(iq));
            var iqNode = iq.getNode();
            
            // Define some paths
            var path_vCard = '#vcard[data-vcard="' + iqID + '"]';
            var path_userInfos = '#userinfos[data-vcard="' + iqID + '"]';
            
            // End if the session does not exist
            if(((type == 'user') && !Common.exists(path_vCard)) || ((type == 'buddy') && !Common.exists(path_userInfos)))
                return;
            
            // We retrieve main values
            var values_yet = [];
            
            $(iqNode).find('vCard').children().each(function() {
                // Read the current parent node name
                var tokenname = (this).nodeName.toUpperCase();
                
                // Node with a parent
                if($(this).children().size()) {
                    $(this).children().each(function() {
                        // Get the node values
                        var currentID = tokenname + '-' + (this).nodeName.toUpperCase();
                        var currentText = $(this).text();
                        
                        // Not yet added?
                        if(!existArrayValue(values_yet, currentID)) {
                            // Create an input if it does not exist
                            createInputVCard(values_yet, type);
                            
                            // Userinfos viewer popup
                            if((type == 'buddy') && currentText) {
                                if(currentID == 'EMAIL-USERID')
                                    $(path_userInfos + ' #BUDDY-' + currentID).html('<a href="mailto:' + currentText.htmlEnc() + '" target="_blank">' + currentText.htmlEnc() + '</a>');
                                else
                                    $(path_userInfos + ' #BUDDY-' + currentID).text(currentText.htmlEnc());
                            }
                            
                            // Profile editor popup
                            else if(type == 'user')
                                $(path_vCard + ' #USER-' + currentID).val(currentText);
                            
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
                    if(!existArrayValue(values_yet, tokenname)) {
                        // Create an input if it does not exist
                        createInputVCard(tokenname, type);
                        
                        // Userinfos viewer popup
                        if((type == 'buddy') && currentText) {
                            // URL modification
                            if(tokenname == 'URL') {
                                // No http:// or https:// prefix, we should add it
                                if(!currentText.match(/^https?:\/\/(.+)/))
                                    currentText = 'http://' + currentText;
                                
                                currentText = '<a href="' + currentText + '" target="_blank">' + currentText.htmlEnc() + '</a>';
                            }
                            
                            // Description modification
                            else if(tokenname == 'DESC')
                                currentText = filterThisMessage(currentText, getBuddyName(iqFrom).htmlEnc(), true);
                            
                            // Other stuffs
                            else
                                currentText = currentText.htmlEnc();
                            
                            $(path_userInfos + ' #BUDDY-' + tokenname).html(currentText);
                        }
                        
                        // Profile editor popup
                        else if(type == 'user')
                            $(path_vCard + ' #USER-' + tokenname).val(currentText);
                        
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
                aContainer = path_vCard + ' .avatar-container';
            }
            
            else {
                aBinval = $(iqNode).find('BINVAL:first').text();
                aType = $(iqNode).find('TYPE:first').text();
                aContainer = path_userInfos + ' .avatar-container';
            }
            
            // We display the avatar if retrieved
            if(aBinval) {
                // No type?
                if(!aType)
                    aType = 'image/png';
                
                if(type == 'user') {
                    // We move all the things that we don't need in that case
                    $(path_vCard + ' .no-avatar').hide();
                    $(path_vCard + ' .avatar-delete').show();
                    $(path_vCard + ' .avatar').remove();
                }
                
                // We display the avatar we have just received
                $(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="data:' + aType + ';base64,' + aBinval + '" alt="" /></div>');
            }
            
            else if(type == 'buddy')
                $(aContainer).replaceWith('<div class="avatar-container"><img class="avatar" src="' + './img/others/default-avatar.png' + '" alt="" /></div>');
            
            // Do someting depending of the type
            if(type == 'user') {
                $(path_vCard + ' .wait').hide();
                $(path_vCard + ' .finish:first').removeClass('disabled');
            }
            
            else
                vCardBuddyInfos();
            
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
    self.sendVCard = function() {

        try {
            // Initialize the IQ
            var iq = new JSJaCIQ();
            iq.setType('set');
            
            var vCard = iq.appendNode('vCard', {'xmlns': NS_VCARD});
            
            // We send the identity part of the form
            $('#vcard .vcard-item').each(function() {
                var itemID = $(this).attr('id').replace(/^USER-(.+)/, '$1');
                var itemVal = $(this).val();
                
                if(itemVal && itemID) {
                    if(itemID.indexOf('-') != -1) {
                        var tagname = Common.explodeThis('-', itemID, 0);
                        var aNode;
                        
                        if(vCard.getElementsByTagName(tagname).length > 0)
                            aNode = vCard.getElementsByTagName(tagname).item(0);
                        else
                            aNode = vCard.appendChild(iq.buildNode(tagname, {'xmlns': NS_VCARD}));
                        
                        aNode.appendChild(iq.buildNode(Common.explodeThis('-', itemID, 1), {'xmlns': NS_VCARD}, itemVal));
                    }
                    
                    else
                        vCard.appendChild(iq.buildNode(itemID, {'xmlns': NS_VCARD}, itemVal));
                }
            });
            
            // Send the IQ
            con.send(iq);
            
            // Send the user nickname & avatar over PEP
            if(enabledPEP()) {
                // Read values
                var user_nick = $('#USER-NICKNAME').val();
                var photo_bin = $('#USER-PHOTO-BINVAL').val();
                var photo_type = $('#USER-PHOTO-TYPE').val();
                var photo_data = Base64.decode(photo_bin) || '';
                var photo_bytes = photo_data.length || '';
                var photo_id = hex_sha1(photo_data) || '';
                
                // Values array
                var read = [
                    user_nick,
                    photo_bin,
                    [photo_type, photo_id, photo_bytes]
                ];
                
                // Nodes array
                var node = [
                    NS_NICK,
                    NS_URN_ADATA,
                    NS_URN_AMETA
                ];
                
                // Generate the XML
                for(i in read) {
                    var iq = new JSJaCIQ();
                    iq.setType('set');
                    
                    var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
                    var publish = pubsub.appendChild(iq.buildNode('publish', {'node': node[i], 'xmlns': NS_PUBSUB}));
                    
                    if((i == 0) && read[0]) {
                        var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
                        
                        // Nickname element
                        item.appendChild(iq.buildNode('nick', {'xmlns': NS_NICK}, read[i]));
                    }
                    
                    else if(((i == 1) || (i == 2)) && read[1]) {
                        var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
                        
                        // Apply the SHA-1 hash
                        if(photo_id)
                            item.setAttribute('id', photo_id);
                        
                        // Avatar data node
                        if(i == 1)
                            item.appendChild(iq.buildNode('data', {'xmlns': NS_URN_ADATA}, read[i]));
                        
                        // Avatar metadata node
                        else {
                            var metadata = item.appendChild(iq.buildNode('metadata', {'xmlns': NS_URN_AMETA}));
                            
                            if(read[i]) {
                                var meta_info = metadata.appendChild(iq.buildNode('info', {'xmlns': NS_URN_AMETA}));
                                
                                if(read[i][0])
                                    meta_info.setAttribute('type', read[i][0]);
                                if(read[i][1])
                                    meta_info.setAttribute('id', read[i][1]);
                                if(read[i][2])
                                    meta_info.setAttribute('bytes', read[i][2]);
                            }
                        }
                    }
                    
                    con.send(iq);
                }
            }
            
            // Close the vCard stuffs
            closeVCard();
            
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
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launchVCard = function() {

        try {
            // Focus on the first input
            $(document).oneTime(10, function() {
                $('#vcard input:first').focus();
            });
            
            // Keyboard events
            $('#vcard input[type="text"]').keyup(function(e) {
                // Enter pressed: send the vCard
                if((e.keyCode == 13) && !$('#vcard .finish.save').hasClass('disabled'))
                    return sendVCard();
            });
            
            // Click events
            $('#vcard .tab a').click(function() {
                // Yet active?
                if($(this).hasClass('tab-active'))
                    return false;
                
                // Switch to the good tab
                var key = parseInt($(this).attr('data-key'));
                
                return switchVCard(key);
            });
            
            $('#vcard .avatar-delete').click(function() {
                return deleteAvatar();
            });
            
            $('#vcard .bottom .finish').click(function() {
                if($(this).is('.cancel'))
                    return closeVCard();
                if($(this).is('.save') && !$(this).hasClass('disabled'))
                    return sendVCard();
                
                return false;
            });
            
            // Avatar upload vars
            var avatar_options = {
                dataType:   'xml',
                beforeSubmit:   waitAvatarUpload,
                success:    handleAvatarUpload
            };
            
            // Avatar upload form submit event
            $('#vcard-avatar').submit(function() {
                if($('#vcard .wait').is(':hidden') && $('#vcard .avatar-info.avatar-wait').is(':hidden') && $('#vcard-avatar input[type="file"]').val())
                    $(this).ajaxSubmit(avatar_options);
                
                return false;
            });
            
            // Avatar upload input change event
            $('#vcard-avatar input[type="file"]').change(function() {
                if($('#vcard .wait').is(':hidden') && $('#vcard .avatar-info.avatar-wait').is(':hidden') && $(this).val())
                    $('#vcard-avatar').ajaxSubmit(avatar_options);
                
                return false;
            });
            
            // Placeholders
            $('#vcard-avatar input[type="text"]').placeholder();
        } catch(e) {
            Console.error('vCard.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();