/*

Jappix - An open social platform
These are the date related JS scripts for Jappix

-------------------------------------------------

License: dual-licensed under AGPL and MPLv2
Author: Valérian Saliou

*/

// Bundle
var DateUtils = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.last_activity = 0;
    self.presence_last_activity = 0;


    /**
     * Gets a stamp from a date
     * @public
     * @param {Date} date
     * @return {number}
     */
    self.extractStamp = function(date) {

        try {
            return Math.round(date.getTime() / 1000);
        } catch(e) {
            Console.error('DateUtils.extractStamp', e);
        }

    };


    /**
     * Gets the time from a date
     * @public
     * @param {Date} date
     * @return {string}
     */
    self.extractTime = function(date) {

        try {
            return date.toLocaleTimeString();
        } catch(e) {
            Console.error('DateUtils.extractTime', e);
        }

    };


    /**
     * Gets the actual date stamp
     * @public
     * @return {number}
     */
    self.getTimeStamp = function() {

        try {
            return self.extractStamp(new Date());
        } catch(e) {
            Console.error('DateUtils.getTimeStamp', e);
        }

    };


    /**
     * Gets the last user activity in seconds
     * @public
     * @return {number}
     */
    self.getLastActivity = function() {

        try {
            // Last activity not yet initialized?
            if(self.last_activity === 0) {
                return 0;
            }

            return self.getTimeStamp() - self.last_activity;
        } catch(e) {
            Console.error('DateUtils.getLastActivity', e);
        }

    };


    /**
     * Gets the last user activity as a date
     * @public
     * @return {string}
     */
    self.getLastActivityDate = function() {

        try {
            var last_activity = self.last_activity || self.getTimeStamp();

            var last_date = new Date();
            last_date.setTime(last_activity * 1000);

            return self.getDatetime(last_date, 'utc');
        } catch(e) {
            Console.error('DateUtils.getLastActivityDate', e);
        }

    };


    /**
     * Gets the last user available presence in seconds
     * @public
     * @return {number}
     */
    self.getPresenceLast = function() {

        try {
            // Last presence stamp not yet initialized?
            if(self.presence_last_activity === 0) {
                return 0;
            }

            return self.getTimeStamp() - self.presence_last_activity;
        } catch(e) {
            Console.error('DateUtils.getPresenceLast', e);
        }

    };


    /**
     * Generates a normalized datetime
     * @public
     * @param {Date} date
     * @param {string} location
     * @return {string}
     */
    self.getDatetime = function(date, location) {

        /* FROM : http://trac.jwchat.org/jsjac/browser/branches/jsjac_1.0/jsextras.js?rev=221 */

        var year, month, day, hours, minutes, seconds;
        var date_string = null;

        try {
            if(location == 'utc') {
                // UTC date
                year = date.getUTCFullYear();
                month = date.getUTCMonth();
                day = date.getUTCDate();
                hours = date.getUTCHours();
                minutes = date.getUTCMinutes();
                seconds = date.getUTCSeconds();
            } else {
                // Local date
                year = date.getFullYear();
                month = date.getMonth();
                day = date.getDate();
                hours = date.getHours();
                minutes = date.getMinutes();
                seconds = date.getSeconds();
            }

            // Generates the date string
            date_string = year + '-';
            date_string += Common.padZero(month + 1) + '-';
            date_string += Common.padZero(day) + 'T';
            date_string += Common.padZero(hours) + ':';
            date_string += Common.padZero(minutes) + ':';
            date_string += Common.padZero(seconds) + 'Z';

            // Returns the date string
            return date_string;
        } catch(e) {
            Console.error('DateUtils.getDatetime', e);
        }

    };


    /**
     * Generates the time for XMPP
     * @public
     * @param {string} location
     * @return {string}
     */
    self.getXMPPTime = function(location) {

        try {
            return self.getDatetime(
                (new Date()),
                location
            );
        } catch(e) {
            Console.error('DateUtils.getXMPPTime', e);
        }

    };


    /**
     * Generates then human time
     * @public
     * @return {string}
     */
    self.getCompleteTime = function() {

        try {
            var init = new Date();

            var time = Common.padZero(init.getHours()) + ':';
            time += Common.padZero(init.getMinutes()) + ':';
            time += Common.padZero(init.getSeconds());

            return time;
        } catch(e) {
            Console.error('DateUtils.getCompleteTime', e);
        }

    };


    /**
     * Gets the TZO of a date
     * @public
     * @return {string}
     */
    self.getTZO = function() {

        try {
            // Get the date
            var date = new Date();
            var offset = date.getTimezoneOffset();

            // Default vars
            var sign = '';
            var hours = 0;
            var minutes = 0;

            // Process a neutral offset
            if(offset < 0) {
                offset = offset * -1;
                sign = '+';
            }

            // Get the values
            var n_date = new Date(offset * 60 * 1000);
            hours = n_date.getHours() - 1;
            minutes = n_date.getMinutes();

            // Process the TZO
            tzo = sign + Common.padZero(hours) + ':' + Common.padZero(minutes);

            // Return the processed value
            return tzo;
        } catch(e) {
            Console.error('DateUtils.getTZO', e);
        }

    };


    /**
     * Returns a date representing the difference of time between 2 timestamps
     * @public
     * @param {string} now_stamp
     * @param {string} past_stamp
     * @return {Date}
     */
    self.difference = function(now_stamp, past_stamp) {

        try {
            return (new Date()).clearTime().addSeconds(
                past_stamp > 0 ? now_stamp - past_stamp : 0
            );
        } catch(e) {
            Console.error('DateUtils.difference', e);
        }

    };


    /**
     * Parses a XMPP date (yyyy-mm-dd, hh-mm-ss) into an human-readable one
     * @public
     * @param {string} to_parse
     * @return {string}
     */
    self.parse = function(to_parse) {

        try {
            var date = Date.jab2date(to_parse);
            var parsed = date.toLocaleDateString() + ' (' + date.toLocaleTimeString() + ')';

            return parsed;
        } catch(e) {
            Console.error('DateUtils.parse', e);
        }

    };


    /**
     * Parses a XMPP date (yyyy-mm-dd) into an human-readable one
     * @public
     * @param {string} to_parse
     * @return {string}
     */
    self.parseDay = function(to_parse) {

        try {
            var date = Date.jab2date(to_parse);
            var parsed = date.toLocaleDateString();

            return parsed;
        } catch(e) {
            Console.error('DateUtils.parseDay', e);
        }

    };


    /**
     * Parses a XMPP date (hh-mm-ss) into an human-readable one
     * @public
     * @param {string} to_parse
     * @return {string}
     */
    self.parseTime = function(to_parse) {

        try {
            var date = Date.jab2date(to_parse);
            var parsed = date.toLocaleTimeString();

            return parsed;
        } catch(e) {
            Console.error('DateUtils.parseTime', e);
        }

    };


    /**
     * Parses a XMPP date stamp into a relative one
     * @public
     * @param {string} to_parse
     * @return {string}
     */
    self.relative = function(to_parse) {

        try {
            // Get the current date
            var current_date = Date.jab2date(self.getXMPPTime('utc'));
            var current_day = current_date.getDate();
            var current_stamp = current_date.getTime();

            // Parse the given date
            var old_date = Date.jab2date(to_parse);
            var old_day = old_date.getDate();
            var old_stamp = old_date.getTime();
            var old_time = old_date.toLocaleTimeString();

            // Get the day number between the two dates
            var days = Math.round((current_stamp - old_stamp) / 86400000);

            // Invalid date?
            if(isNaN(old_stamp) || isNaN(days)) {
                return self.getCompleteTime();
            }

            // Is it today?
            if(current_day == old_day) {
                return old_time;
            }

            // It is yesterday?
            if(days <= 1) {
                return Common._e("Yesterday") + ' - ' + old_time;
            }

            // Is it less than a week ago?
            if(days <= 7) {
                return Common.printf(Common._e("%s days ago"), days) + ' - ' + old_time;
            }

            // Another longer period
            return old_date.toLocaleDateString() + ' - ' + old_time;
        } catch(e) {
            Console.error('DateUtils.relative', e);
        }

    };


    /**
     * Reads a message delay
     * @public
     * @param {string} node
     * @param {boolean} return_date
     * @return {string|Date}
     */
    self.readMessageDelay = function(node, return_date) {

        try {
            // Initialize
            var delay, d_delay;

            // Read the delay
            d_delay = jQuery(node).find('delay[xmlns="' + NS_URN_DELAY + '"]:first').attr('stamp');

            // Get delay
            if(d_delay) {
                // New delay (valid XEP)
                delay = d_delay;
            } else {
                // Old delay (obsolete XEP!)
                var x_delay = jQuery(node).find('x[xmlns="' + NS_DELAY + '"]:first').attr('stamp');

                if(x_delay) {
                    delay = x_delay.replace(/^(\w{4})(\w{2})(\w{2})T(\w{2}):(\w{2}):(\w{2})Z?(\S+)?/, '$1-$2-$3T$4:$5:$6Z$7');
                }
            }

            // Return a date object?
            if(return_date === true && delay) {
                return Date.jab2date(delay);
            }

            return delay;
        } catch(e) {
            Console.error('DateUtils.readMessageDelay', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

var JappixDateUtils = DateUtils;