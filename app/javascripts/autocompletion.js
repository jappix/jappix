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
            var sort_a = a[0].toLowerCase();
            var sort_b = b[0].toLowerCase();

            // Process the sort
            if(sort_a > sort_b) {
                return 1;
            }

            if(sort_a < sort_b) {
                return -1;
            }
        } catch(e) {
            Console.error('Autocompletion.caseInsensitiveSort', e);
        }

    };


    /**
     * Split a query into its subqueries ready to be used in autocompletion
     * @public
     * @param {string} query
     * @return {object}
     */
    self.getSubQueries = function(query) {

        var result = [];

        try {
            var subqueries = [];
            var remnants = [];

            var query_last_char_pos = query.length - 1;
            var space_counter = 0;
            var cur_char;

            for(var i = query_last_char_pos; i >= 0; i--) {
                // Search from the end of the query
                cur_char = query.charAt(i);

                if(space_counter === 0 && cur_char.search(/\s/) === 0) {
                    // The first "local" space was found
                    // Add the subquery and its remnant to results
                    subqueries.push(query.slice(i+1));
                    remnants.push(query.slice(0, i+1));

                    space_counter++;
                } else {
                    space_counter = 0;
                }
            }

            if(space_counter === 0) {
                // If the first char of the query is not a space, add the full query to results
                subqueries.push(query);
                remnants.push('');
            }

            result = [subqueries, remnants];
        } catch(e) {
            Console.error('Autocompletion.getSubQueries', e);
        } finally {
            return result;
        }

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
            var query_reg_exp = [];

            for(i = 0; i < query.length; i++) {
                if(query[i] !== null) {
                    query_reg_exp.push(
                        new RegExp('(^)' + query[i], 'gi')
                    );
                }
            }

            // Search in the roster
            var nick, regex;

            $('#' + id + ' .user').each(function() {
                nick = $(this).find('.name').text();

                for(i = 0; i < query_reg_exp.length; i++) {
                    regex = query_reg_exp[i];

                    if(nick.match(regex)) {
                        results.push([nick, i]);
                    }
                }
            });

            // Sort the array
            results = results.sort(
                self.caseInsensitiveSort
            );
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
            $('#' + hash + ' .message-area').removeAttr('data-autocompletion-pointer')
                                            .removeAttr('data-autocompletion-query');
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
            var message_area_sel = $('#' + hash + ' .message-area');
            var value = message_area_sel.val();

            if(!value) {
                self.reset(hash);
            }

            var query = message_area_sel.attr('data-autocompletion-query');

            if(query === undefined) {
                // The autocompletion has not been yet launched
                query = self.getSubQueries(value);
                message_area_sel.attr('data-autocompletion-query', JSON.stringify(query));
            } else {
                // The autocompletion has already stored a query
                query = JSON.parse(query);
            }

            // Get the pointer
            var pointer = message_area_sel.attr('data-autocompletion-pointer');
            var i = pointer ? parseInt(pointer, 10) : 0;

            // We get the nickname
            var nick_result = self.process(query[0], hash)[i];
            var nick;

            if(nick_result !== undefined) {
                nick = nick_result[0];
            }

            // Shit, this is my nick!
            if((nick !== undefined) && (nick.toLowerCase() == Name.getMUCNick(hash).toLowerCase())) {
                // Increment
                i++;

                // Get the next nick
                nick_result = self.process(query[0], hash)[i];

                if (nick_result !== undefined) {
                    nick = nick_result[0];
                }
            }

            // We quote the nick
            if((nick_result !== undefined) && (nick !== undefined)) {
                // Increment
                i++;

                Utils.quoteMyNick(
                    hash,
                    nick,
                    query[1][nick_result[1]]
                );

                // Put a pointer
                message_area_sel.attr('data-autocompletion-pointer', i);
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
