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
    self.openRosterX = function(data) {

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
            createPopup('rosterx', html);
            
            // Associate the events
            launchRosterX();
            
            // Parse the data
            parseRosterX(data);
            
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
    self.closeRosterX = function() {

        try {
            // Destroy the popup
            destroyPopup('rosterx');
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
    self.parseRosterX = function(data) {

        try {
            // Main selector
            var x = $(data).find('x[xmlns="' + NS_ROSTERX + '"]:first');
            
            // Parse data
            x.find('item').each(function() {
                // Generate group XML
                var group = '';
                
                $(this).find('group').each(function() {
                    group += '<group>' + $(this).text().htmlEnc() + '</group>';
                });
                
                if(group)
                    group = '<groups>' + group + '</groups>';
                
                // Display it!
                displayRosterX($(this).attr('jid'), $(this).attr('name'), group, $(this).attr('action'));
            });
            
            // Click to check/uncheck
            $('#rosterx .oneresult').click(function(evt) {
                // No need to apply when click on input
                if($(evt.target).is('input[type="checkbox"]'))
                    return;
                
                // Input selector
                var checkbox = $(this).find('input[type="checkbox"]');
                
                // Check or uncheck?
                if(checkbox.filter(':checked').size())
                    checkbox.removeAttr('checked');
                else
                    checkbox.attr('checked', true);
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
    self.displayRosterX = function(xid, nick, group, action) {

        try {
            // End if no XID
            if(!xid)
                return false;
            
            // Set up a default action if no one
            if(!action || (action != 'modify') || (action != 'delete'))
                action = 'add';
            
            // Override "undefined" for nickname
            if(!nick)
                nick = '';
            
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
     * @return {undefined}
     */
    self.saveRosterX = function() {

        try {
            // Send the requests
            $('#rosterx .results input[type="checkbox"]').filter(':checked').each(function() {
                // Read the attributes
                var nick = $(this).attr('data-name');
                var xid = $(this).attr('data-xid');
                var action = $(this).attr('data-action');
                var group = $(this).attr('data-group');
                
                // Parse groups XML
                if(group) {
                    var group_arr = []
                    
                    $(group).find('group').each(function() {
                        group_arr.push($(this).text().revertHtmlEnc());
                    });
                }
                
                // Process the asked action
                var roster_item = $('#buddy-list .' + hex_md5(xid));
                
                switch(action) {
                    // Buddy add
                    case 'add':
                        if(!Common.exists(roster_item)) {
                            sendSubscribe(xid, 'subscribe');
                            sendRoster(xid, '', nick, group_arr);
                        }
                        
                        break;
                    
                    // Buddy edit
                    case 'modify':
                        if(Common.exists(roster_item))
                            sendRoster(xid, '', nick, group_arr);
                        
                        break;
                    
                    // Buddy delete
                    case 'delete':
                        if(Common.exists(roster_item))
                            sendRoster(xid, 'remove');
                        
                        break;
                }
            });
            
            // Close the popup
            closeRosterX();
        } catch(e) {
            Console.error('RosterX.save', e);
        }

    };


	/**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launchRosterX = function() {

        try {
            // Click events
            $('#rosterx .bottom .finish').click(function() {
                if($(this).is('.save'))
                    return saveRosterX();
                if($(this).is('.cancel'))
                    return closeRosterX();
            });
            
            $('#rosterx .rosterx-head a').click(function() {
                if($(this).is('.check'))
                    $('#rosterx .results input[type="checkbox"]').attr('checked', true);
                else if($(this).is('.uncheck'))
                    $('#rosterx .results input[type="checkbox"]').removeAttr('checked');
                
                return false;
            });
        } catch(e) {
            Console.error('RosterX.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();