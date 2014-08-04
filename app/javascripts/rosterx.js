/*

Jappix - An open social platform
These are the Roster Item Exchange JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var RosterX = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the rosterx tools
     * @public
     * @param {string} data
     * @return {undefined}
     */
    self.open = function(data) {

        try {
            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Suggested friends") + '</div>' +

            '<div class="content">' +
                '<div class="rosterx-head">' +
                    '<a href="#" class="uncheck">' + Common._e("Uncheck all") + '</a>' +
                    '<a href="#" class="check">' + Common._e("Check all") + '</a>' +
                '</div>' +

                '<div class="results"></div>' +
            '</div>' +

            '<div class="bottom">' +
                '<a href="#" class="finish save">' + Common._e("Save") + '</a>' +
                '<a href="#" class="finish cancel">' + Common._e("Cancel") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('rosterx', html);

            // Associate the events
            self.instance();

            // Parse the data
            self.parse(data);

            Console.log('Roster Item Exchange popup opened.');
        } catch(e) {
            Console.error('RosterX.open', e);
        }

    };


    /**
     * Closes the rosterx tools
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('rosterx');
        } catch(e) {
            Console.error('RosterX.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Parses a rosterx query
     * @public
     * @param {string} data
     * @return {undefined}
     */
    self.parse = function(data) {

        try {
            // Main selector
            var x = $(data).find('x[xmlns="' + NS_ROSTERX + '"]:first');

            // Parse data
            x.find('item').each(function() {
                var this_sel = $(this);

                // Generate group XML
                var group = '';

                this_sel.find('group').each(function() {
                    group += '<group>' + this_sel.text().htmlEnc() + '</group>';
                });

                if(group) {
                    group = '<groups>' + group + '</groups>';
                }

                // Display it!
                self.display(
                    this_sel.attr('jid'),
                    this_sel.attr('name'),
                    group,
                    this_sel.attr('action')
                );
            });

            // Click to check/uncheck
            $('#rosterx .oneresult').click(function(evt) {
                // No need to apply when click on input
                if($(evt.target).is('input[type="checkbox"]')) {
                    return;
                }

                // Input selector
                var checkbox = $(this).find('input[type="checkbox"]');

                // Check or uncheck?
                if(checkbox.filter(':checked').size()) {
                    checkbox.removeAttr('checked');
                } else {
                    checkbox.attr('checked', true);
                }
            });
        } catch(e) {
            Console.error('RosterX.parse', e);
        }

    };


    /**
     * Displays a rosterx item
     * @public
     * @param {string} xid
     * @param {string} nick
     * @param {string} group
     * @param {string} action
     * @return {boolean}
     */
    self.display = function(xid, nick, group, action) {

        try {
            // End if no XID
            if(!xid) {
                return false;
            }

            // Set up a default action if no one
            if(!action || (action != 'modify') || (action != 'delete')) {
                action = 'add';
            }

            // Override "undefined" for nickname
            if(!nick) {
                nick = '';
            }

            // Display it
            $('#rosterx .results').append(
                '<div class="oneresult">' +
                    '<input type="checkbox" checked="" data-name="' + Common.encodeQuotes(nick) + '" data-xid="' + Common.encodeQuotes(xid) + '" data-action="' + Common.encodeQuotes(action) + '" data-group="' + Common.encodeQuotes(group) + '" />' +
                    '<span class="name">' + nick.htmlEnc() + '</span>' +
                    '<span class="xid">' + xid.htmlEnc() + '</span>' +
                    '<span class="action ' + action + ' talk-images"></span>' +
                '</div>'
            );

            return true;
        } catch(e) {
            Console.error('RosterX.display', e);
        }

    };


    /**
     * Saves the rosterx settings
     * @public
     * @return {boolean}
     */
    self.save = function() {

        try {
            // Send the requests
            $('#rosterx .results input[type="checkbox"]').filter(':checked').each(function() {
                var this_sel = $(this);

                // Read the attributes
                var nick = this_sel.attr('data-name');
                var xid = this_sel.attr('data-xid');
                var action = this_sel.attr('data-action');
                var group = this_sel.attr('data-group');

                // Parse groups XML
                var group_arr = [];

                if(group) {
                    $(group).find('group').each(function() {
                        group_arr.push(this_sel.text().revertHtmlEnc());
                    });
                }

                // Process the asked action
                var roster_item = $('#roster .' + hex_md5(xid));

                switch(action) {
                    // Buddy add
                    case 'add':
                        if(!Common.exists(roster_item)) {
                            Presence.sendSubscribe(xid, 'subscribe');
                            Roster.send(xid, '', nick, group_arr);
                        }

                        break;

                    // Buddy edit
                    case 'modify':
                        if(Common.exists(roster_item))
                            Roster.send(xid, '', nick, group_arr);

                        break;

                    // Buddy delete
                    case 'delete':
                        if(Common.exists(roster_item))
                            Roster.send(xid, 'remove');

                        break;
                }
            });

            // Close the popup
            self.close();
        } catch(e) {
            Console.error('RosterX.save', e);
        } finally {
            return false;
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
            $('#rosterx .bottom .finish').click(function() {
                var this_sel = $(this);

                if(this_sel.is('.save')) {
                    return self.save();
                }

                if(this_sel.is('.cancel')) {
                    return self.close();
                }
            });

            $('#rosterx .rosterx-head a').click(function() {
                var this_sel = $(this);

                if(this_sel.is('.check')) {
                    $('#rosterx .results input[type="checkbox"]').attr('checked', true);
                } else if(this_sel.is('.uncheck')) {
                    $('#rosterx .results input[type="checkbox"]').removeAttr('checked');
                }

                return false;
            });
        } catch(e) {
            Console.error('RosterX.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();