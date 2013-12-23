/*

Jappix - An open social platform
These are the seach tools JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Search = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    var SEARCH_FILTERED = false;


	/**
     * Searches in the user's buddy list
     * @public
     * @param {string} query
     * @return {object}
     */
    self.processBuddySearch = function(query) {

        try {
            // No query submitted?
            if(!query)
                return;
            
            // Wildcard (*) submitted
            if(query == '*')
                query = '';
            
            // Replace forbidden characters in regex
            query = escapeRegex(query);
            
            // Create an empty array
            var results = new Array();
            
            // Search regex
            var regex = new RegExp('((^)|( ))' + query, 'gi');
            
            // Search in the roster
            var buddies = getAllBuddies();
            
            for(i in buddies) {
                var xid = buddies[i];
                var nick = getBuddyName(xid);
                
                // Buddy match our search, and not yet in the array
                if(nick.match(regex) && !existArrayValue(results, xid))
                    results.push(xid);
            }
            
            // Return the results array
            return results;
        } catch(e) {
            Console.error('Search.processBuddy', e);
        }

    };


    /**
     * Resets the buddy search tool
     * @public
     * @param {string} destination
     * @return {undefined}
     */
    self.resetBuddySearch = function(destination) {

        try {
            $(destination + ' ul').remove();
            $(destination + ' input').removeClass('suggested');
        } catch(e) {
            Console.error('Search.resetBuddy', e);
        }

    };


    /**
     * Add the clicked XID to the input
     * @public
     * @param {string} destination
     * @param {string} xid
     * @return {boolean}
     */
    self.addBuddySearch = function(destination, xid) {

        try {
            // Remove the search tool
            resetBuddySearch(destination);
            
            // Define a selector
            var input = $(destination + ' input');
            var value = input.val();
            
            // Get the old value (if there's another value)
            var old = '';
            
            if(value.match(/(^(.+)(,)(\s)?)(\w+)$/))
                old = RegExp.$1;
            
            // Add the XID to the "to" input and focus on it
            $(document).oneTime(10, function() {
                input.val(old + xid).focus();
            });
        } catch(e) {
            Console.error('Search.addBuddy', e);
        } finally {
            return false;
        }

    };


    /**
     * Creates the appropriate markup for the search results
     * @public
     * @param {string} destination
     * @return {undefined}
     */
    self.createBuddySearch = function(destination) {

        try {
            // Reset the search engine
            resetBuddySearch(destination);
            
            // Get the entered value
            var value = $(destination + ' input').val();
            
            // Separation with a comma?
            if(value.match(/^(.+)((,)(\s)?)(\w+)$/))
                value = RegExp.$5;
            
            // Get the result array
            var entered = processBuddySearch(value);
            
            // Display each result (if any)
            if(entered && entered.length) {
                // Set a special class to the search input
                $(destination + ' input').addClass('suggested');
                
                // Append each found buddy in the container 
                var regex = new RegExp('((^)|( ))' + value, 'gi');
                
                // Initialize the code generation
                var code = '<ul>';
                
                for(b in entered) {
                    // Get some values from the XID
                    var current = getBuddyName(entered[b]).htmlEnc();
                    current = current.replace(regex, '<b>$&</b>');
                    
                    // Add the current element to the global code
                    code += '<li onclick="return addBuddySearch(\'' + encodeOnclick(destination) + '\', \'' + encodeOnclick(entered[b]) + '\');" data-xid="' + encodeQuotes(entered[b]) + '">' + current + '</li>';
                }
                
                // Finish the code generation
                code += '</ul>';
                
                // Creates the code in the DOM
                $(destination).append(code);
                
                // Put the hover on the first element
                $(destination + ' ul li:first').addClass('hovered');
                
                // Hover event, to not to remove this onblur and loose the click event
                $(destination + ' ul li').hover(function() {
                    $(destination + ' ul li').removeClass('hovered');
                    $(this).addClass('hovered');
                    
                    // Add a marker for the blur event
                    $(destination + ' ul').attr('mouse-hover', 'true');
                }, function() {
                    $(this).removeClass('hovered');
                    
                    // Remove the mouse over marker
                    $(destination + ' ul').removeAttr('mouse-hover');
                });
            }
        } catch(e) {
            Console.error('Search.createBuddy', e);
        }

    };


    /**
     * Handles the keyboard arrows press when searching
     * @public
     * @param {object} e
     * @param {string} destination
     * @return {boolean}
     */
    self.arrowsBuddySearch = function(e, destination) {

        try {
            // Down arrow: 40
            // Up arrown: 38
            
            // Initialize
            var code = e.keyCode;
            
            // Not the key we want here
            if((code != 40) && (code != 38))
                return;
            
            // Remove the eventual mouse hover marker
            $(destination + ' ul').removeAttr('mouse-hover');
            
            // Create the path & get its size
            var path = destination + ' ul li';
            var pSize = $(path).size();
            
            // Define the i value
            var i = 0;
            
            // Switching yet launched
            if(exists(path + '.hovered')) {
                var index = $(path).attr('data-hovered');
                
                if(index)
                    i = parseInt(index);
                
                if(code == 40)
                    i++;
                else
                    i--;
            }
            
            else if(code == 38)
                i = pSize - 1;
            
            // We must not override the maximum i limit
            if(i >= pSize)
                i = 0;
            
            // We must not have negative i
            else if(i < 0)
                i = pSize - 1;
            
            // Modify the list
            $(path + '.hovered').removeClass('hovered');
            $(path).eq(i).addClass('hovered');
            
            // Store the i index
            $(path).attr('data-hovered', i);
        } catch(e) {
            Console.error('Search.arrowsBuddy', e);
        } finally {
            return false;
        }

    };


    /**
     * Filters the buddies in the roster
     * @public
     * @param {object} vFilter
     * @return {undefined}
     */
    self.goFilterBuddySearch = function(vFilter) {

        try {
            // Put a marker
            SEARCH_FILTERED = true;
            
            // Show the buddies that match the search string
            var rFilter = processBuddySearch(vFilter);
            
            // Hide all the buddies
            $('#buddy-list .buddy').hide();
            
            // Only show the buddies which match the search
            if(!BLIST_ALL) {
                for(i in rFilter)
                    $('#buddy-list .buddy[data-xid="' + escape(rFilter[i]) + '"]:not(.hidden-buddy)').show();
            } else {
                for(i in rFilter)
                    $('#buddy-list .buddy[data-xid="' + escape(rFilter[i]) + '"]').show();
            }
        } catch(e) {
            Console.error('Search.goFilterBuddy', e);
        }

    };


    /**
     * Resets the buddy filtering in the roster
     * @public
     * @return {undefined}
     */
    self.resetFilterBuddySearch = function() {

        try {
            // Remove the marker
            SEARCH_FILTERED = false;
            
            // Show all the buddies
            $('#buddy-list .buddy').show();
            
            // Only show available buddies
            if(!BLIST_ALL)
                $('#buddy-list .buddy.hidden-buddy').hide();
            
            // Update the groups
            updateGroups();
        } catch(e) {
            Console.error('Search.resetFilterBuddy', e);
        }

    };


    /**
     * Funnels the buddy filtering
     * @public
     * @param {number} keycode
     * @return {undefined}
     */
    self.funnelFilterBuddySearch = function(keycode) {

        try {
            // Get the input value
            var input = $('#buddy-list .filter input');
            var cancel = $('#buddy-list .filter a');
            var value = input.val();
            
            // Security: reset all the groups, empty or not, deployed or not
            $('#buddy-list .one-group, #buddy-list .group-buddies').show();
            $('#buddy-list .group span').text('-');
            
            // Nothing is entered, or escape pressed
            if(!value || (keycode == 27)) {
                if(keycode == 27)
                    input.val('');
                
                resetFilterBuddySearch();
                cancel.hide();
            }
            
            // Process the filtering
            else {
                cancel.show();
                goFilterBuddySearch(value);
            }
            
            // Update the groups
            updateGroups();
        } catch(e) {
            Console.error('Search.funnelFilterBuddy', e);
        }

    };


    /**
     * Searches for the nearest element (with a lower stamp than the current one)
     * @public
     * @param {number} stamp
     * @param {string} element
     * @return {number}
     */
    self.sortElementByStamp = function(stamp, element) {

        try {
            var array = new Array();
            var i = 0;
            var nearest = 0;
            
            // Add the stamp values to the array
            $(element).each(function() {
                var current_stamp = parseInt($(this).attr('data-stamp'));
                
                // Push it!
                array.push(current_stamp);
            });
            
            // Sort the array
            array.sort();
            
            // Get the nearest stamp value
            while(stamp > array[i]) {
                nearest = array[i];
                
                i++;
            }
            
            return nearest;
        } catch(e) {
            Console.error('Search.sortElementByStamp', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();