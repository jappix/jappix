/*

Jappix - An open social platform
These are the dataform JS scripts for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Maranda

*/

// Bundle
var DataForm = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Gets the defined dataform elements
     * @public
     * @param {string} host
     * @param {string} type
     * @param {string} node
     * @param {string} action
     * @param {string} target
     * @return {boolean}
     */
    self.go = function(host, type, node, action, target) {

        try {
            // Clean the current session
            self.clean(target);

            // We tell the user that a search has been launched
            $('#' + target + ' .wait').show();

            // If we have enough data
            if(host && type) {
                // Generate a session ID
                var sessionID = Math.round(100000.5 + (((900000.49999) - (100000.5)) * Math.random()));
                var id = target + '-' + sessionID + '-' + genID();
                $('.' + target + '-results').attr('data-session', target + '-' + sessionID);

                // We request the service item
                var iq = new JSJaCIQ();
                iq.setID(id);
                iq.setTo(host);
                iq.setType('get');

                // MUC admin query
                if(type == 'muc') {
                    iq.setQuery(NS_MUC_OWNER);
                    con.send(iq, self.handleMUC);
                }

                // Browse query
                else if(type == 'browse') {
                    var iqQuery = iq.setQuery(NS_DISCO_ITEMS);

                    if(node) {
                        iqQuery.setAttribute('node', node);
                    }

                    con.send(iq, self.handleBrowse);
                }

                // Command
                else if(type == 'command') {
                    var items;

                    if(node) {
                        items = iq.appendNode('command', {'node': node, 'xmlns': NS_COMMANDS});
                    }

                    else {
                        items = iq.setQuery(NS_DISCO_ITEMS);
                        items.setAttribute('node', NS_COMMANDS);
                    }

                    if(action && node) {
                        iq.setType('set');
                        items.setAttribute('action', action);
                    }

                    con.send(iq, self.handleCommand);
                }

                // Search query
                else if(type == 'search') {
                    iq.setQuery(NS_SEARCH);
                    con.send(iq, self.handleSearch);
                }

                // Subscribe query
                else if(type == 'subscribe') {
                    iq.setQuery(NS_REGISTER);
                    con.send(iq, self.handleSubscribe);
                }

                // Join
                else if(type == 'join') {
                    if(target == 'discovery') {
                        Discovery.close();
                    }

                    Chat.checkCreate(host, 'groupchat');
                }
            }
        } catch(e) {
            Console.error('DataForm.go', e);
        } finally {
            return false;
        }

    };


    /**
     * Sends a given dataform
     * @public
     * @param {string} type
     * @param {string} action
     * @param {string} x_type
     * @param {string} id
     * @param {string} xid
     * @param {string} node
     * @param {string} sessionid
     * @param {string} target
     * @return {boolean}
     */
    self.send = function(type, action, x_type, id, xid, node, sessionid, target) {

        try {
            // Path
            var pathID = '#' + target + ' .results[data-session="' + id + '"]';

            // New IQ
            var iq = new JSJaCIQ();
            iq.setTo(xid);
            iq.setType('set');

            // Set the correct query
            var query;

            if(type == 'subscribe') {
                iqQuery = iq.setQuery(NS_REGISTER);
            } else if(type == 'search') {
                iqQuery = iq.setQuery(NS_SEARCH);
            } else if(type == 'command') {
                iqQuery = iq.appendNode('command', {'xmlns': NS_COMMANDS, 'node': node, 'sessionid': sessionid, 'action': action});
            } else if(type == 'x') {
                iqQuery = iq.setQuery(NS_MUC_OWNER);
            }

            // Build the XML document
            if(action != 'cancel') {
                // No X node
                if(Common.exists('input.register-special') && (type == 'subscribe')) {
                    $('input.register-special').each(function() {
                        var iName = $(this).attr('name');
                        var iValue = $(this).val();

                        iqQuery.appendChild(iq.buildNode(iName, {'xmlns': NS_REGISTER}, iValue));
                    });
                }

                // Can create the X node
                else {
                    var iqX = iqQuery.appendChild(iq.buildNode('x', {'xmlns': NS_XDATA, 'type': x_type}));

                    // Each input
                    $(pathID + ' .oneresult input, ' + pathID + ' .oneresult textarea, ' + pathID + ' .oneresult select').each(function() {
                        // Get the current input value
                        var iVar = $(this).attr('name');
                        var iType = $(this).attr('data-type');
                        var iValue = $(this).val();

                        // Build a new field node
                        var field = iqX.appendChild(iq.buildNode('field', {'var': iVar, 'type': iType, 'xmlns': NS_XDATA}));

                        // Boolean input?
                        if(iType == 'boolean') {
                            if($(this).filter(':checked').size()) {
                                iValue = '1';
                            } else {
                                iValue = '0';
                            }
                        }

                        // JID-multi input?
                        if(iType == 'jid-multi') {
                            // Values array
                            var xid_arr = [iValue];
                            var xid_check = [];

                            // Try to split it
                            if(iValue.indexOf(',') != -1) {
                                xid_arr = iValue.split(',');
                            }

                            // Append each value to the XML document
                            for(var i in xid_arr) {
                                // Get the current value
                                xid_current = $.trim(xid_arr[i]);

                                // No current value?
                                if(!xid_current) {
                                    continue;
                                }

                                // Add the current value
                                if(!Utils.existArrayValue(xid_check, xid_current)) {
                                    xid_check.push(xid_current);
                                    field.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, xid_current));
                                }
                            }
                        }

                        // List-multi selector?
                        else if(iType == 'list-multi') {
                            // Any value?
                            if(iValue && iValue.length) {
                                for(var j in iValue) {
                                    field.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, iValue[j]));
                                }
                            }
                        }

                        // Other inputs?
                        else {
                            field.appendChild(iq.buildNode('value', {'xmlns': NS_XDATA}, iValue));
                        }
                    });
                }
            }

            // Clean the current session
            self.clean(target);

            // Show the waiting item
            $('#' + target + ' .wait').show();

            // Change the ID of the current discovered item
            var iqID = target + '-' + genID();
            $('#' + target + ' .' + target + '-results').attr('data-session', iqID);
            iq.setID(iqID);

            // Send the IQ
            if(type == 'subscribe') {
                con.send(iq, self.handleSubscribe);
            } else if(type == 'search') {
                con.send(iq, self.handleSearch);
            } else if(type == 'command') {
                con.send(iq, self.handleCommand);
            } else {
                con.send(iq);
            }
        } catch(e) {
            Console.error('DataForm.send', e);
        } finally {
            return false;
        }

    };


    /**
     * Displays the good dataform buttons
     * @public
     * @param {string} type
     * @param {string} action
     * @param {string} id
     * @param {string} xid
     * @param {string} node
     * @param {string} sessionid
     * @param {string} target
     * @param {string} pathID
     * @return {undefined}
     */
    self.buttons = function(type, action, id, xid, node, sessionid, target, pathID) {

        try {
            // No need to use buttons?
            if(type == 'muc') {
                return;
            }

            // Override the "undefined" output
            if(!id)
                id = '';
            if(!xid)
                xid = '';
            if(!node)
                node = '';
            if(!sessionid)
                sessionid = '';

            // We generate the buttons code
            var buttonsCode = '<div class="oneresult ' + target + '-oneresult ' + target + '-formtools">';

            if(action == 'submit') {
                if((target == 'adhoc') && (type == 'command')) {
                    buttonsCode += '<a href="#" class="submit" onclick="return DataForm.send(\'' + Utils.encodeOnclick(type) + '\', \'execute\', \'submit\', \'' + Utils.encodeOnclick(id) + '\', \'' + Utils.encodeOnclick(xid) + '\', \'' + Utils.encodeOnclick(node) + '\', \'' + Utils.encodeOnclick(sessionid) + '\', \'' + Utils.encodeOnclick(target) + '\');">' + Common._e("Submit") + '</a>';

                    // When keyup on one text input
                    $(pathID + ' input').keyup(function(e) {
                        if(e.keyCode == 13) {
                            self.send(type, 'execute', 'submit', id, xid, node, sessionid, target);

                            return false;
                        }
                    });
                } else {
                    buttonsCode += '<a href="#" class="submit" onclick="return DataForm.send(\'' + Utils.encodeOnclick(type) + '\', \'submit\', \'submit\', \'' + Utils.encodeOnclick(id) + '\', \'' + Utils.encodeOnclick(xid) + '\', \'' + Utils.encodeOnclick(node) + '\', \'' + Utils.encodeOnclick(sessionid) + '\', \'' + Utils.encodeOnclick(target) + '\');">' + Common._e("Submit") + '</a>';

                    // When keyup on one text input
                    $(pathID + ' input').keyup(function(e) {
                        if(e.keyCode == 13) {
                            self.send(type, 'submit', 'submit', id, xid, node, sessionid, target);

                            return false;
                        }
                    });
                }
            }

            if((action == 'submit') && (type != 'subscribe') && (type != 'search')) {
                buttonsCode += '<a href="#" class="submit" onclick="return DataForm.send(\'' + Utils.encodeOnclick(type) + '\', \'cancel\', \'cancel\', \'' + Utils.encodeOnclick(id) + '\', \'' + Utils.encodeOnclick(xid) + '\', \'' + Utils.encodeOnclick(node) + '\', \'' + Utils.encodeOnclick(sessionid) + '\', \'' + Utils.encodeOnclick(target) + '\');">' + Common._e("Cancel") + '</a>';
            }

            if(((action == 'back') || (type == 'subscribe') || (type == 'search')) && (target == 'discovery')) {
                buttonsCode += '<a href="#" class="back" onclick="return Discovery.start();">' + Common._e("Close") + '</a>';
            }

            if((action == 'back') && ((target == 'welcome') || (target == 'directory'))) {
                buttonsCode += '<a href="#" class="back" onclick="return DataForm.go(HOST_VJUD, \'search\', \'\', \'\', \'' + target + '\');">' + Common._e("Previous") + '</a>';
            }

            if((action == 'back') && (target == 'adhoc')) {
                buttonsCode += '<a href="#" class="back" onclick="return DataForm.go(\'' + Utils.encodeOnclick(xid) + '\', \'command\', \'\', \'\', \'adhoc\');">' + Common._e("Previous") + '</a>';
            }

            buttonsCode += '</div>';

            // We display the buttons code
            $(pathID).append(buttonsCode);

            // If no submit link, lock the form
            if(!Common.exists(pathID + ' a.submit')) {
                $(pathID + ' input, ' + pathID + ' textarea').attr('readonly', true);
            }
        } catch(e) {
            Console.error('DataForm.buttons', e);
        }

    };


    /**
     * Handles the MUC dataform
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleMUC = function(iq) {

        try {
            Errors.handleReply(iq);
            self.handleContent(iq, 'muc');
        } catch(e) {
            Console.error('DataForm.handleMUC', e);
        }

    };


    /**
     * Handles the browse dataform
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleBrowse = function(iq) {

        try {
            Errors.handleReply(iq);
            self.handleContent(iq, 'browse');
        } catch(e) {
            Console.error('DataForm.handleBrowse', e);
        }

    };


    /**
     * Handles the command dataform
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleCommand = function(iq) {

        try {
            Errors.handleReply(iq);
            self.handleContent(iq, 'command');
        } catch(e) {
            Console.error('DataForm.handleCommand', e);
        }

    };


    /**
     * Handles the subscribe dataform
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleSubscribe = function(iq) {

        try {
            Errors.handleReply(iq);
            self.handleContent(iq, 'subscribe');
        } catch(e) {
            Console.error('DataForm.handleSubscribe', e);
        }

    };


    /**
     * Handles the search dataform
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleSearch = function(iq) {

        try {
            Errors.handleReply(iq);
            self.handleContent(iq, 'search');
        } catch(e) {
            Console.error('DataForm.handleSearch', e);
        }

    };


    /**
     * Handles the dataform content
     * @public
     * @param {object} iq
     * @param {string} type
     * @return {undefined}
     */
    self.handleContent = function(iq, type) {

        try {
            // Get the ID
            var sID = iq.getID();

            // Get the target
            var splitted = sID.split('-');
            var target = splitted[0];
            var sessionID = target + '-' + splitted[1];
            var from = Common.fullXID(Common.getStanzaFrom(iq));
            var pathID = '#' + target + ' .results[data-session="' + sessionID + '"]';

            // If an error occured
            if(!iq || (iq.getType() != 'result')) {
                self.noResult(pathID);
            }

            // If we got something okay
            else {
                var handleXML = iq.getNode();

                if(type == 'browse') {
                    if($(handleXML).find('item').attr('jid')) {
                        // Get the query node
                        var queryNode = $(handleXML).find('query').attr('node');

                        $(handleXML).find('item').each(function() {
                            // We parse the received xml
                            var itemHost = $(this).attr('jid');
                            var itemNode = $(this).attr('node');
                            var itemName = $(this).attr('name');
                            var itemHash = hex_md5(itemHost);

                            // Node
                            if(itemNode) {
                                $(pathID).append(
                                    '<div class="oneresult ' + target + '-oneresult" onclick="return DataForm.go(\'' + Utils.encodeOnclick(itemHost) + '\', \'browse\', \'' + Utils.encodeOnclick(itemNode) + '\', \'\', \'' + Utils.encodeOnclick(target) + '\');">' +
                                        '<div class="one-name">' + itemNode.htmlEnc() + '</div>' +
                                    '</div>'
                                );
                            }

                            // Item
                            else if(queryNode && itemName) {
                                $(pathID).append(
                                    '<div class="oneresult ' + target + '-oneresult">' +
                                        '<div class="one-name">' + itemName.htmlEnc() + '</div>' +
                                    '</div>'
                                );
                            }

                            // Item with children
                            else {
                                // We display the waiting element
                                $(pathID + ' .disco-wait .disco-category-title').after(
                                    '<div class="oneresult ' + target + '-oneresult ' + itemHash + '">' +
                                        '<div class="one-icon loading talk-images"></div>' +
                                        '<div class="one-host">' + itemHost + '</div>' +
                                        '<div class="one-type">' + Common._e("Requesting this service...") + '</div>' +
                                    '</div>'
                                );

                                // We display the category
                                $('#' + target + ' .disco-wait').show();

                                // We ask the server what's the service type
                                self.getType(itemHost, itemNode, sessionID);
                            }
                        });
                    }

                    // Else, there are no items for this query
                    else
                        self.noResult(pathID);
                }

                else if((type == 'muc') || (type == 'search') || (type == 'subscribe') || ((type == 'command') && $(handleXML).find('command').attr('xmlns'))) {
                    // Get some values
                    var xCommand = $(handleXML).find('command');
                    var bNode = xCommand.attr('node');
                    var bSession = xCommand.attr('sessionid');
                    var bStatus = xCommand.attr('status');
                    var xRegister = $(handleXML).find('query[xmlns="' + NS_REGISTER + '"]').text();
                    var xElement = $(handleXML).find('x');

                    // Search done
                    if((xElement.attr('type') == 'result') && (type == 'search')) {
                        var bPath = pathID;

                        // Display the result
                        $(handleXML).find('item').each(function() {
                            // Have some "flexibility" for what regards field names, it would be better to return the whole original DF
                            // layout, but on a large amount of result which have many fields, there's a very high chance the browser can
                            // choke on old systems or new ones even.

                            // Search for useful fields, return first result. This is rather hacky, but jQuery is horrible when it comes to
                            // matching st. using patterns. (TODO: Improve and return the full DF layout without choking the browser)
                            var bName;
                            var bCountry;
                            var doneName, doneCountry;

                            $.each($(this).find('field'), function(i, item) {
                                var $item = $(item);

                                if($(item).attr('var').match(/^(fn|name|[^n][^i][^c][^k]name)$/gi) && doneName !== true) {
                                    bName = $item.children('value:first').text();
                                    doneName = true;
                                } else if($(item).attr('var').match(/^(ctry|country.*)$/gi) && doneCountry !== true) {
                                    bCountry = $item.children('value:first').text();
                                    doneCountry = true;
                                }
                            });

                            var bXID = $(this).find('field[var="jid"] value:first').text();
                            var dName = bName;

                            // Override "undefined" value
                            if(!bXID)
                                bXID = '';
                            if(!bName)
                                bName = Common._e("Unknown name");
                            if(!bCountry)
                                bCountry = Common._e("Unknown country");

                            // User hash
                            var bHash = hex_md5(bXID);

                            // HTML code
                            var bHTML = '<div class="oneresult ' + target + '-oneresult ' + bHash + '">' +
                                    '<div class="avatar-container">' +
                                        '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                                    '</div>' +
                                    '<div class="one-fn">' + Common.htmlentities(bName) + '</div>' +
                                    '<div class="one-ctry">' + Common.htmlentities(bCountry) + '</div>' +
                                    '<div class="one-jid">' + bXID + '</div>' +
                                    '<div class="buttons-container">';

                            // The buddy is not in our buddy list?
                            if(!Common.exists('#roster .buddy[data-xid="' + escape(bXID) + '"]')) {
                                bHTML += '<a href="#" class="one-add one-vjud one-button talk-images">' + Common._e("Add") + '</a>';
                            }

                            // Chat button, if not in welcome/directory mode
                            if(target == 'discovery') {
                                bHTML += '<a href="#" class="one-chat one-vjud one-button talk-images">' + Common._e("Chat") + '</a>';
                            }

                            // Profile button, if not in discovery mode
                            else {
                                bHTML += '<a href="#" class="one-profile one-vjud one-button talk-images">' + Common._e("Profile") + '</a>';
                            }

                            // Close the HTML element
                            bHTML += '</div></div>';

                            $(bPath).append(bHTML);

                            // Click events
                            $(bPath + ' .' + bHash + ' a').click(function() {
                                // Buddy add
                                if($(this).is('.one-add')) {
                                    $(this).hide();

                                    Roster.addThisContact(bXID, dName);
                                }

                                // Buddy chat
                                if($(this).is('.one-chat')) {
                                    if(target == 'discovery')
                                        Discovery.close();

                                    Chat.checkCreate(bXID, 'chat', '', '', dName);
                                }

                                // Buddy profile
                                if($(this).is('.one-profile')) {
                                    UserInfos.open(bXID);
                                }

                                return false;
                            });

                            // Get the user's avatar
                            if(bXID) {
                                Avatar.get(bXID, 'cache', 'true', 'forget');
                            }
                        });

                        // No result?
                        if(!$(handleXML).find('item').size())
                            self.noResult(pathID);

                        // Previous button
                        self.buttons(type, 'back', sessionID, from, bNode, bSession, target, pathID);
                    }

                    // Command to complete
                    else if(xElement.attr('xmlns') || ((type == 'subscribe') && xRegister)) {
                        // We display the elements
                        self.fill(handleXML, sessionID);

                        // We display the buttons
                        if(bStatus != 'completed') {
                            self.buttons(type, 'submit', sessionID, from, bNode, bSession, target, pathID);
                        } else {
                            self.buttons(type, 'back', sessionID, from, bNode, bSession, target, pathID);
                        }
                    }

                    // Command completed or subscription done
                    else if(((bStatus == 'completed') && (type == 'command')) || (!xRegister && (type == 'subscribe'))) {
                        // Display the good text
                        var cNote = $(xCommand).find('note');

                        // Any note?
                        if(cNote.size()) {
                            cNote.each(function() {
                                $(pathID).append(
                                    '<div class="onetitle ' + target + '-oneresult">' + $(this).text().htmlEnc() + '</div>'
                                );
                            });
                        }

                        // Default text
                        else {
                            $(pathID).append('<div class="oneinstructions ' + target + '-oneresult">' + Common._e("Your form has been sent.") + '</div>');
                        }

                        // Display the back button
                        self.buttons(type, 'back', sessionID, from, '', '', target, pathID);

                        // Add the gateway to our roster if subscribed
                        if(type == 'subscribe') {
                            Roster.addThisContact(from);
                        }
                    }

                    // Command canceled
                    else if((bStatus == 'canceled') && (type == 'command')) {
                        if(target == 'discovery') {
                            Discovery.start();
                        } else if(target == 'adhoc') {
                            dataForm(from, 'command', '', '', 'adhoc');
                        }
                    }

                    // No items for this query
                    else
                        self.noResult(pathID);
                }

                else if(type == 'command') {
                    if($(handleXML).find('item').attr('jid')) {
                        // We display the elements
                        $(handleXML).find('item').each(function() {
                            // We parse the received xml
                            var itemHost = $(this).attr('jid');
                            var itemNode = $(this).attr('node');
                            var itemName = $(this).attr('name');
                            var itemHash = hex_md5(itemHost);

                            // We display the waiting element
                            $(pathID).prepend(
                                '<div class="oneresult ' + target + '-oneresult ' + itemHash + '" onclick="return DataForm.go(\'' + Utils.encodeOnclick(itemHost) + '\', \'command\', \'' + Utils.encodeOnclick(itemNode) + '\', \'execute\', \'' + Utils.encodeOnclick(target) + '\');">' +
                                    '<div class="one-name">' + itemName + '</div>' +
                                    '<div class="one-next">»</div>' +
                                '</div>'
                            );
                        });
                    }

                    // Else, there are no items for this query
                    else {
                        self.noResult(pathID);
                    }
                }
            }

            // Focus on the first input
            $(document).oneTime(10, function() {
                $(pathID + ' input:visible:first').focus();
            });

            // Hide the wait icon
            $('#' + target + ' .wait').hide();
        } catch(e) {
            Console.error('DataForm.handleContent', e);
        }

    };


    /**
     * Fills the dataform elements
     * @public
     * @param {type} xml
     * @param {type} id
     * @return {boolean}
     */
    self.fill = function(xml, id) {

        /* REF: http://xmpp.org/extensions/xep-0004.html */

        try {
            // Initialize new vars
            var target = id.split('-')[0];
            var pathID = '#' + target + ' .results[data-session="' + id + '"]';
            var selector, is_dataform;

            // Is it a dataform?
            if($(xml).find('x[xmlns="' + NS_XDATA + '"]').size()) {
                is_dataform = true;
            } else {
                is_dataform = false;
            }

            // Determines the good selector to use
            if(is_dataform) {
                selector = $(xml).find('x[xmlns="' + NS_XDATA + '"]');
            } else {
                selector = $(xml);
            }

            // Form title
            selector.find('title').each(function() {
                $(pathID).append(
                    '<div class="onetitle ' + target + '-oneresult">' + $(this).text().htmlEnc() + '</div>'
                );
            });

            // Form instructions
            selector.find('instructions').each(function() {
                $(pathID).append(
                    '<div class="oneinstructions ' + target + '-oneresult">' + $(this).text().htmlEnc() + '</div>'
                );
            });

            // Register?
            if(!is_dataform) {
                // Items to detect
                var reg_names = [Common._e("Nickname"), Common._e("Name"), Common._e("Password"), Common._e("E-mail")];
                var reg_ids = ['username', 'name', 'password', 'email'];

                // Append these inputs
                $.each(reg_names, function(a) {
                    selector.find(reg_ids[a]).each(function() {
                        $(pathID).append(
                            '<div class="oneresult ' + target + '-oneresult">' +
                                '<label>' + reg_names[a] + '</label>' +
                                '<input name="' + reg_ids[a] + '" type="text" class="register-special dataform-i" />' +
                            '</div>'
                        );
                    });
                });

                return false;
            }

            // Dataform?
            selector.find('field').each(function() {
                // We parse the received xml
                var type = $(this).attr('type');
                var label = $(this).attr('label');
                var field = $(this).attr('var');
                var value = $(this).find('value:first').text();
                var required = '';

                // No value?
                if(!field) {
                    return;
                }

                // Required input?
                if($(this).find('required').size()) {
                    required = ' required=""';
                }

                // Compatibility fix
                if(!label) {
                    label = field;
                }

                if(!type) {
                    type = '';
                }

                // Generate some values
                var input;
                var hideThis = '';

                // Fixed field
                if(type == 'fixed') {
                    $(pathID).append('<div class="oneinstructions">' + value.htmlEnc() + '</div>');
                } else {
                    // Hidden field
                    if(type == 'hidden') {
                        hideThis = ' style="display: none;"';
                        input = '<input name="' + Common.encodeQuotes(field) + '" data-type="' + Common.encodeQuotes(type) + '" type="hidden" class="dataform-i" value="' + Common.encodeQuotes(value) + '" ' + required + ' />';
                    }

                    // Boolean field
                    else if(type == 'boolean') {
                        var checked;

                        if(value == '1')
                            checked = 'checked';
                        else
                            checked = '';

                        input = '<input name="' + Common.encodeQuotes(field) + '" type="checkbox" data-type="' + Common.encodeQuotes(type) + '" class="dataform-i df-checkbox" ' + checked + required + ' />';
                    }

                    // List-single/list-multi field
                    else if((type == 'list-single') || (type == 'list-multi')) {
                        var multiple = '';

                        // Multiple options?
                        if(type == 'list-multi') {
                            multiple = ' multiple=""';
                        }

                        // Append the select field
                        input = '<select name="' + Common.encodeQuotes(field) + '" data-type="' + Common.encodeQuotes(type) + '" class="dataform-i"' + required + multiple + '>';
                        var selected;

                        // Append the available options
                        $(this).find('option').each(function() {
                            var nLabel = $(this).attr('label');
                            var nValue = $(this).find('value').text();

                            // No label?
                            if(!nLabel) {
                                nLabel = nValue;
                            }

                            // If this is the selected value
                            if(nValue == value) {
                                selected = 'selected';
                            } else {
                                selected = '';
                            }

                            input += '<option ' + selected + ' value="' + Common.encodeQuotes(nValue) + '">' + nLabel.htmlEnc() + '</option>';
                        });

                        input += '</select>';
                    }

                    // Text-multi field
                    else if(type == 'text-multi') {
                        input = '<textarea rows="8" cols="60" data-type="' + Common.encodeQuotes(type) + '" name="' + Common.encodeQuotes(field) + '" class="dataform-i"' + required + '>' + value.htmlEnc() + '</textarea>';
                    }

                    // JID-multi field
                    else if(type == 'jid-multi') {
                        // Put the XID into an array
                        var xid_arr = [];

                        $(this).find('value').each(function() {
                            var cValue = $(this).text();

                            if(!Utils.existArrayValue(xid_arr, cValue)) {
                                xid_arr.push(cValue);
                            }
                        });

                        // Sort the array
                        xid_arr.sort();

                        // Create the input
                        var xid_value = '';

                        if(xid_arr.length) {
                            for(var i in xid_arr) {
                                // Any pre-value
                                if(xid_value) {
                                    xid_value += ', ';
                                }

                                // Add the current XID
                                xid_value += xid_arr[i];
                            }
                        }

                        input = '<input name="' + Common.encodeQuotes(field) + '" data-type="' + Common.encodeQuotes(type) + '" type="text" class="dataform-i" value="' + Common.encodeQuotes(xid_value) + '" placeholder="jack@jappix.com, jones@jappix.com"' + required + ' />';
                    }

                    // Other stuffs that are similar
                    else {
                        // Text-single field
                        var iType = 'text';

                        // Text-private field
                        if(type == 'text-private') {
                            iType = 'password';
                        }

                        // JID-single field
                        else if(type == 'jid-single') {
                            iType = 'email';
                        }

                        input = '<input name="' + Common.encodeQuotes(field) + '" data-type="' + Common.encodeQuotes(type) + '" type="' + iType + '" class="dataform-i" value="' + Common.encodeQuotes(value) + '"' + required + ' />';
                    }

                    // Append the HTML markup for this field
                    $(pathID).append(
                        '<div class="oneresult ' + target + '-oneresult"' + hideThis + '>' +
                            '<label>' + label.htmlEnc() + '</label>' +
                            input +
                        '</div>'
                    );
                }
            });
        } catch(e) {
            Console.error('DataForm.fill', e);
        } finally {
            return false;
        }

    };


    /**
     * Gets the dataform type
     * @public
     * @param {string} host
     * @param {string} node
     * @param {string} id
     * @return {undefined}
     */
    self.getType = function(host, node, id) {

        try {
            var iq = new JSJaCIQ();
            iq.setID(id + '-' + genID());
            iq.setTo(host);
            iq.setType('get');

            var iqQuery = iq.setQuery(NS_DISCO_INFO);

            if(node) {
                iqQuery.setAttribute('node', node);
            }

            con.send(iq, self.handleThisBrowse);
        } catch(e) {
            Console.error('DataForm.getType', e);
        }

    };


    /**
     * Handles the browse stanza
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleThisBrowse = function(iq) {

        /* REF: http://xmpp.org/registrar/disco-categories.html */

        try {
            var id = iq.getID();
            var splitted = id.split('-');
            var target = splitted[0];
            var sessionID = target + '-' + splitted[1];
            var from = Common.fullXID(Common.getStanzaFrom(iq));
            var hash = hex_md5(from);
            var handleXML = iq.getQuery();
            var pathID = '#' + target + ' .results[data-session="' + sessionID + '"]';

            // We first remove the waiting element
            $(pathID + ' .disco-wait .' + hash).remove();

            if($(handleXML).find('identity').attr('type')) {
                var category = $(handleXML).find('identity').attr('category');
                var type = $(handleXML).find('identity').attr('type');
                var named = $(handleXML).find('identity').attr('name');

                if(named) {
                    gName = named;
                } else {
                    gName = '';
                }

                var one, two, three, four, five;

                // Get the features that this entity supports
                var findFeature = $(handleXML).find('feature');

                for(var i in findFeature) {
                    var current = findFeature.eq(i).attr('var');

                    switch(current) {
                        case NS_SEARCH:
                            one = 1;
                            break;

                        case NS_MUC:
                            two = 1;
                            break;

                        case NS_REGISTER:
                            three = 1;
                            break;

                        case NS_COMMANDS:
                            four = 1;
                            break;

                        case NS_DISCO_ITEMS:
                            five = 1;
                            break;

                        default:
                            break;
                    }
                }

                var buttons = Array(one, two, three, four, five);

                // We define the toolbox links depending on the supported features
                var tools = '';
                var aTools = Array('search', 'join', 'subscribe', 'command', 'browse');
                var bTools = Array(Common._e("Search"), Common._e("Join"), Common._e("Subscribe"), Common._e("Command"), Common._e("Browse"));

                for(var b in buttons) {
                    if(buttons[b]) {
                        tools += '<a href="#" class="one-button ' + aTools[b] + ' talk-images" onclick="return DataForm.go(\'' + Utils.encodeOnclick(from) + '\', \'' + Utils.encodeOnclick(aTools[b]) + '\', \'\', \'\', \'' + Utils.encodeOnclick(target) + '\');" title="' + Utils.encodeOnclick(bTools[b]) + '"></a>';
                    }
                }

                // As defined in the ref, we detect the type of each category to put an icon
                switch(category) {
                    case 'account':
                    case 'auth':
                    case 'automation':
                    case 'client':
                    case 'collaboration':
                    case 'component':
                    case 'conference':
                    case 'directory':
                    case 'gateway':
                    case 'headline':
                    case 'hierarchy':
                    case 'proxy':
                    case 'pubsub':
                    case 'server':
                    case 'store':
                        break;

                    default:
                        category = 'others';
                }

                // We display the item we found
                $(pathID + ' .disco-' + category + ' .disco-category-title').after(
                    '<div class="oneresult ' + target + '-oneresult ' + hash + '">' +
                        '<div class="one-icon ' + category + ' talk-images"></div>' +
                        '<div class="one-host">' + from + '</div>' +
                        '<div class="one-type">' + gName + '</div>' +
                        '<div class="one-actions">' + tools + '</div>' +
                    '</div>'
                );

                // We display the category
                $(pathID + ' .disco-' + category).show();
            }

            else {
                $(pathID + ' .disco-others .disco-category-title').after(
                    '<div class="oneresult ' + target + '-oneresult">' +
                        '<div class="one-icon down talk-images"></div>' +
                        '<div class="one-host">' + from + '</div>' +
                        '<div class="one-type">' + Common._e("Service offline or broken") + '</div>' +
                    '</div>'
                );

                // We display the category
                $(pathID + ' .disco-others').show();
            }

            // We hide the waiting stuffs if there's no remaining loading items
            if(!$(pathID + ' .disco-wait .' + target + '-oneresult').size()) {
                $(pathID + ' .disco-wait, #' + target + ' .wait').hide();
            }
        } catch(e) {
            Console.error('DataForm.handleThisBrowse', e);
        }

    };


    /**
     * Cleans the current data-form popup
     * @public
     * @param {string} target
     * @return {undefined}
     */
    self.clean = function(target) {

        try {
            if(target == 'discovery') {
                Discovery.clean();
            } else {
                $('#' + target + ' div.results').empty();
            }
        } catch(e) {
            Console.error('DataForm.clean', e);
        }

    };


    /**
     * Displays the no result indicator
     * @public
     * @param {string} path
     * @return {undefined}
     */
    self.noResult = function(path) {

        try {
            $(path).prepend('<p class="no-results">' + Common._e("Sorry, but the entity didn't return any result!") + '</p>');
        } catch(e) {
            Console.error('DataForm.noResult', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
