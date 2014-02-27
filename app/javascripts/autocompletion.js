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
     * Sort an autocompletion result array with insensitivity to the case,
     * using the 1st elements (a[0] and b[0]) to process comparison
     * @public
     * @param {array} a
     * @param {array} b
     * @return {undefined}
     */
    self.caseInsensitiveSort = function(a, b) {

        try {
            // Put the two strings into lower case
            var sA = a[0].toLowerCase();
            var sB = b[0].toLowerCase();
            
            // Process the sort
            if(sA > sB)
                return 1;
            if(sA < sB)
                return -1;
        } catch(e) {
            Console.error('Autocompletion.caseInsensitiveSort', e);
        }

    };


    /**
     * Split a query into its subqueries ready to be used in autocompletion
     * The function return an array containing two others : the first with subqueries
     * and the second with remaining parts
     * For example, if query is "A B C", the subqueries are ["C", "B C", "A B C"] and
     * the remaining parts are ["A B ", "A ", ""]
     * @param {string} query
     * @return {Array}
     */
    self.getSubQueries = function(query) {

        var subqueries = [];
        var remnants = [];

        var queryLastCharPos = query.length - 1;
        var spaceCounter = 0;
        for (var i=queryLastCharPos; i>=0; i--) {
            // Search from the end of the query
            var iChar = query.charAt(i);
            if (spaceCounter === 0 && iChar.search(/\s/) === 0) {
                // the first "local" space was found
                // add the subquery and its remnant to results
                subqueries.push(query.slice(i+1));
                remnants.push(query.slice(0, i+1));
                spaceCounter++;
            } else {
                spaceCounter = 0;
            }
        }
        if (spaceCounter === 0) {
            // If the first char of the query is not a space, add the full query to results
            subqueries.push(query);
            remnants.push("");
        }

        return [subqueries, remnants];
    };


    /**
     * Creates an array with the autocompletion results. An autocompletion result
     * is an array containing the result himself and the rank of the query which
     * matched this answer
     * @public
     * @param {Array} query
     * @param {string} id
     * @return {Array}
     */
    self.process = function(query, id) {

        var results = [];

        try {
            // Replace forbidden characters in regex
            query = Common.escapeRegex(query);
            // Build an array of regex to use
            var queryRegExp = [];
            for (i = 0; i<query.length; i++) {
                if (query[i] !== null) {
                    queryRegExp.push(new RegExp('(^)' + query[i], 'gi'));
                }
            }
            // Search in the roster
            $('#' + id + ' .user').each(function() {
                var nick = $(this).find('.name').text();
                for (i = 0; i<queryRegExp.length; i++) {
                    var regex = queryRegExp[i];
                    if(nick.match(regex)) {
                        results.push([nick, i]);
                    }
                }
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
            
            if(query === undefined) {
                // The autocompletion has not been yet launched
                query = self.getSubQueries(value);
                vSelector.attr('data-autocompletion-query', JSON.stringify(query));
            } else {
                // The autocompletion has already stored a query
                query = JSON.parse(query);
            }
            
            // Get the pointer
            var pointer = vSelector.attr('data-autocompletion-pointer');
            var i = 0;
            
            if(pointer)
                i = parseInt(pointer);
            
            // We get the nickname
            var nickResult = self.process(query[0], hash)[i];
            var nick;
            if (nickResult !== undefined) {
                nick = nickResult[0];
            }
            
            // Shit, this is my nick!
            if((nick !== undefined) && (nick.toLowerCase() == Name.getMUCNick(hash).toLowerCase())) {
                // Increment
                i++;
                
                // Get the next nick
                nickResult = self.process(query[0], hash)[i];
                if (nickResult !== undefined) {
                    nick = nickResult[0];
                }
            }
            
            // We quote the nick
            if((nickResult !== undefined) && (nick !== undefined)) {
                // Increment
                i++;
                var message = query[1][nickResult[1]];
                Utils.quoteMyNick(hash, nick, message);
                
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
