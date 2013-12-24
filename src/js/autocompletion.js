/*

Jappix - An open social platform
These are the autocompletion tools JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Autocompletion = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Sort an array with insensitivity to the case
     * @public
     * @param {string} a
     * @param {string} b
     * @return {undefined}
     */
    self.caseInsensitiveSort = function(a, b) {

        try {
            // Put the two strings into lower case
            a = a.toLowerCase();
            b = b.toLowerCase();
            
            // Process the sort
            if(a > b)
                return 1;
            if(a < b)
                return -1;
        } catch(e) {
            Console.error('Autocompletion.caseInsensitiveSort', e);
        }

    };


    /**
     * Creates an array with the autocompletion results
     * @public
     * @param {string} query
     * @param {string} id
     * @return {object}
     */
    self.process = function(query, id) {

        var results = new Array();

        try {
            // Replace forbidden characters in regex
            query = Common.escapeRegex(query);
            
            // Search in the roster
            $('#' + id + ' .user').each(function() {
                var nick = $(this).find('.name').text();
                var regex = new RegExp('(^)' + query, 'gi');
                
                if(nick.match(regex))
                    results.push(nick);
            });
            
            // Sort the array
            results = results.sort(self.caseInsensitiveSort);
        } catch(e) {
            Console.error('Autocompletion.process', e);
        } finally {
            return results;
        }

    };


    /**
     * Resets the autocompletion tools
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.reset = function(hash) {

        try {
            $('#' + hash + ' .message-area').removeAttr('data-autocompletion-pointer').removeAttr('data-autocompletion-query');
        } catch(e) {
            Console.error('Autocompletion.reset', e);
        }

    };


    /**
     * Autocompletes the chat input nick
     * @public
     * @param {string} hash
     * @return {undefined}
     */
    self.create = function(hash) {

        try {
            // Initialize
            var vSelector = $('#' + hash + ' .message-area');
            var value = vSelector.val();

            if(!value) {
                self.reset(hash);
            }

            var query = vSelector.attr('data-autocompletion-query');
            
            // The autocompletion has not been yet launched
            if(query == undefined) {
                query = value;
                vSelector.attr('data-autocompletion-query', query);
            }
            
            // Get the pointer
            var pointer = vSelector.attr('data-autocompletion-pointer');
            var i = 0;
            
            if(pointer)
                i = parseInt(pointer);
            
            // We get the nickname
            var nick = self.process(query, hash)[i];
            
            // Shit, this is my nick!
            if((nick != undefined) && (nick.toLowerCase() == getMUCNick(hash).toLowerCase())) {
                // Increment
                i++;
                
                // Get the next nick
                nick = self.process(query, hash)[i];
            }
            
            // We quote the nick
            if(nick != undefined) {
                // Increment
                i++;
                quoteMyNick(hash, nick);
                
                // Put a pointer
                vSelector.attr('data-autocompletion-pointer', i);
            }
        } catch(e) {
            Console.error('Autocompletion.create', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();
