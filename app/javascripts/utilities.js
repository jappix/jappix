/*

Jappix - An open social platform
These are the utilities JS script for Jappix

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, olivierm

*/

// Bundle
var Utils = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Returns whether using HTTPS or not
     * @public
     * @return {boolean}
     */
    self.isHTTPS = function() {

        is_https = false;

        try {
            if(window.location.href && (window.location.href).match(/^https/i)) {
                is_https = true;
            }
        } catch(e) {
            Console.error('Utils.isHTTPS', e);
        } finally {
            return is_https;
        }

    };


    /**
     * Generates the good storage URL
     * @public
     * @param {string} url
     * @return {string}
     */
    self.generateURL = function(url) {

        try {
            // HTTPS not allowed
            if((HTTPS_STORAGE != 'on') && url.match(/^https(.+)/)) {
                url = 'http' + RegExp.$1;
            }

            return url;
        } catch(e) {
            Console.error('Utils.generateURL', e);
        }

    };


    /**
     * Disables an input if needed
     * @public
     * @param {string} value
     * @param {string} condition
     * @return {string}
     */
    self.disableInput = function(value, condition) {

        try {
            if(value == condition) {
                return ' disabled=""';
            }

            return '';
        } catch(e) {
            Console.error('Utils.disableInput', e);
        }

    };


    /**
     * Truncates a string
     * @public
     * @param {string} string
     * @param {number} limit
     * @return {string}
     */
    self.truncate = function(string, limit) {

        try {
            // Must truncate the string
            if(string.length > limit) {
                string = string.substr(0, limit) + '...';
            }

            return string;
        } catch(e) {
            Console.error('Utils.truncate', e);
        }

    };


    /**
     * Removes the new lines
     * @public
     * @param {string} string
     * @return {string}
     */
    self.noLines = function(string) {

        try {
            return string.replace(/\n/g, ' ');
        } catch(e) {
            Console.error('Utils.noLines', e);
        }

    };


    /**
     * Encodes a string for onclick attribute
     * @public
     * @param {string} str
     * @return {undefined}
     */
    self.encodeOnclick = function(str) {

        try {
            return (Common.encodeQuotes(str)).replace(/'/g, '\\$&');
        } catch(e) {
            Console.error('Utils.encodeOnclick', e);
        }

    };


    /**
     * Checks whether the passed parameter is a number or not
     * @public
     * @param {number} n
     * @return {boolean}
     */
    self.isNumber = function(n) {

        try {
            return !isNaN(parseFloat(n)) && isFinite(n);
        } catch(e) {
            Console.error('Utils.isNumber', e);
        }

    };


    /**
     * Checks if we are in the anonymous mode
     * @public
     * @return {boolean}
     */
    self.isAnonymous = function() {

        var is_anonymous = false;

        try {
            if(Common.allowedAnonymous() && XMPPLinks.links_var.r) {
                is_anonymous = true;
            }
        } catch(e) {
            Console.error('Utils.isAnonymous', e);
        } finally {
            return is_anonymous;
        }

    };


    /**
     * Checks if this is a private chat user
     * @public
     * @param {string} xid
     * @return {boolean}
     */
    self.isPrivate = function(xid) {

        var is_private = false;

        try {
            if(Common.exists('[data-xid="' + escape(xid) + '"][data-type="groupchat"]')) {
                is_private = true;
            }
        } catch(e) {
            Console.error('Utils.isPrivate', e);
        } finally {
            return is_private;
        }

    };


    /**
     * Checks if the user browser is obsolete
     * @public
     * @return {boolean}
     */
    self.isObsolete = function() {

        try {
            // Get browser name & version
            var browser_name = BrowserDetect.browser;
            var browser_version = BrowserDetect.version;

            // No DOM storage
            if(!DataStore.hasDB() || !DataStore.hasPersistent()) {
                return true;
            }

            // Obsolete IE
            if((browser_name == 'Explorer') && (browser_version < 8)) {
                return true;
            }

            // Obsolete Chrome
            if((browser_name == 'Chrome') && (browser_version < 7)) {
                return true;
            }

            // Obsolete Safari
            if((browser_name == 'Safari') && (browser_version < 4)) {
                return true;
            }

            // Obsolete Firefox
            if((browser_name == 'Firefox') && (browser_version < 3.5)) {
                return true;
            }

            // Obsolete Opera
            if((browser_name == 'Opera') && (browser_version < 9)) {
                return true;
            }

            return false;
        } catch(e) {
            Console.error('Utils.isObsolete', e);

            return false;
        }

    };


    /**
     * Gets a MUC user XID
     * @public
     * @param {string} room
     * @param {string} nick
     * @return {string}
     */
    self.getMUCUserXID = function(room, nick) {

        try {
            return $('div.chat[data-xid="' + escape(room) + '"] div[data-nick="' + escape(nick) + '"]').attr('data-xid');
        } catch(e) {
            Console.error('Utils.getMUCUserXID', e);
        }

    };


    /**
     * Gets a MUC user read XID
     * @public
     * @param {string} room
     * @param {string} nick
     * @return {string}
     */
    self.getMUCUserRealXID = function(room, nick) {

        try {
            return $('div.chat[data-xid="' + escape(room) + '"] div[data-nick="' + escape(nick) + '"]').attr('data-realxid');
        } catch(e) {
            Console.error('Utils.getMUCUserRealXID', e);
        }

    };


    /**
     * Gets the server of the user
     * @public
     * @return {string}
     */
    self.getServer = function() {

        try {
            // Return the domain of the user
            return con.domain;
        } catch(e) {
            Console.error('Utils.getServer', e);
        }

    };


    /**
     * Gets the password of the user
     * @public
     * @return {string}
     */
    self.getPassword = function() {

        try {
            // Return the password of the user
            return con.pass;
        } catch(e) {
            Console.error('Utils.getPassword', e);
        }

    };


    /**
     * Quotes the nick of an user. If a message is given, the nick is inserted at its end.
     * @public
     * @param {string} hash
     * @param {string} nick
     * @param {string} message
     * @return {undefined}
     */
    self.quoteMyNick = function(hash, nick, message) {

        try {
            $(document).oneTime(10, function() {
                if (message === undefined || message.length === 0) {
                    $('#page-engine #' + hash + ' .message-area').val(nick + ', ').focus();
                } else {
                    $('#page-engine #' + hash + ' .message-area').val(message + nick).focus();
                }
            });
        } catch(e) {
            Console.error('Utils.quoteMyNick', e);
        }

    };


    /**
     * Return the file category
     * @public
     * @param {string} ext
     * @return {string}
     */
    self.fileCategory = function(ext) {

        try {
            var cat;

            switch(ext) {
                // Images
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'bmp':
                case 'gif':
                case 'tif':
                case 'svg':
                case 'ico':
                case 'psp':
                case 'psd':
                case 'psb':
                case 'xcf':
                    cat = 'image';

                    break;

                // Videos
                case 'ogv':
                case 'ogg':
                case 'mkv':
                case 'avi':
                case 'mov':
                case 'mp4':
                case 'm4v':
                case 'wmv':
                case 'asf':
                case 'mpg':
                case 'mpeg':
                case 'ogm':
                case 'rmvb':
                case 'rmv':
                case 'qt':
                case 'flv':
                case 'ram':
                case '3gp':
                case 'avc':
                    cat = 'video';

                    break;

                // Sounds
                case 'oga':
                case 'mka':
                case 'flac':
                case 'mp3':
                case 'wav':
                case 'm4a':
                case 'wma':
                case 'rmab':
                case 'rma':
                case 'bwf':
                case 'aiff':
                case 'caf':
                case 'cda':
                case 'atrac':
                case 'vqf':
                case 'au':
                case 'aac':
                case 'm3u':
                case 'mid':
                case 'mp2':
                case 'snd':
                case 'voc':
                    cat = 'audio';

                    break;

                // Documents
                case 'pdf':
                case 'odt':
                case 'ott':
                case 'sxw':
                case 'stw':
                case 'ots':
                case 'sxc':
                case 'stc':
                case 'sxi':
                case 'sti':
                case 'pot':
                case 'odp':
                case 'ods':
                case 'doc':
                case 'docx':
                case 'docm':
                case 'xls':
                case 'xlsx':
                case 'xlsm':
                case 'xlt':
                case 'ppt':
                case 'pptx':
                case 'pptm':
                case 'pps':
                case 'odg':
                case 'otp':
                case 'sxd':
                case 'std':
                case 'std':
                case 'rtf':
                case 'txt':
                case 'htm':
                case 'html':
                case 'shtml':
                case 'dhtml':
                case 'mshtml':
                    cat = 'document';

                    break;

                // Packages
                case 'tgz':
                case 'gz':
                case 'tar':
                case 'ar':
                case 'cbz':
                case 'jar':
                case 'tar.7z':
                case 'tar.bz2':
                case 'tar.gz':
                case 'tar.lzma':
                case 'tar.xz':
                case 'zip':
                case 'xz':
                case 'rar':
                case 'bz':
                case 'deb':
                case 'rpm':
                case '7z':
                case 'ace':
                case 'cab':
                case 'arj':
                case 'msi':
                    cat = 'package';

                    break;

                // Others
                default:
                    cat = 'other';

                    break;
            }

            return cat;
        } catch(e) {
            Console.error('Utils.fileCategory', e);
        }

    };


    /**
     * Registers Jappix as the default XMPP links handler
     * @public
     * @return {boolean}
     */
    self.xmppLinksHandler = function() {

        try {
            navigator.registerProtocolHandler('xmpp', JAPPIX_LOCATION + '?x=%s', SERVICE_NAME);

            return true;
        } catch(e) {
            Console.error('Utils.xmppLinksHandler', e);

            return false;
        }

    };


    /**
     * Checks if a value exists in array
     * @public
     * @param {object} array
     * @param {string} value
     * @return {boolean}
     */
    self.existArrayValue = function(array, value) {

        val_exists = false;

        try {
            // Loop in the array
            for(var i in array) {
                if(array[i] == value) {
                    val_exists = true;
                    break;
                }
            }
        } catch(e) {
            Console.error('Utils.existArrayValue', e);
        } finally {
            return val_exists;
        }

    };


    /**
     * Removes a value from an array
     * @public
     * @param {object} array
     * @param {string} value
     * @return {boolean}
     */
    self.removeArrayValue = function(array, value) {

        was_removed = false;

        try {
            for(var i in array) {
                // It matches, remove it!
                if(array[i] == value) {
                    array.splice(i, 1);

                    was_removed = true;
                }
            }
        } catch(e) {
            Console.error('Utils.removeArrayValue', e);
        } finally {
            return was_removed;
        }

    };


    /**
     * Removes duplicate values from array
     * @public
     * @param {object} arr
     * @return {object}
     */
    self.uniqueArrayValues = function(arr) {

        try {
            var a = arr.concat();

            for(var i = 0; i < a.length; ++i) {
                for(var j = i + 1; j < a.length; ++j) {
                    if(a[i] === a[j]) {
                        a.splice(j--, 1);
                    }
                }
            }

            return a;
        } catch(e) {
            Console.error('Utils.uniqueArrayValues', e);
        }

    };


    /**
     * Converts a string to an array
     * @public
     * @param {string} string
     * @return {object}
     */
    self.stringToArray = function(string) {

        try {
            var array = [];

            // Any string to convert?
            if(string) {
                // More than one item
                if(string.match(/,/gi)) {
                    var string_split = string.split(',');

                    for(var i in string_split) {
                        if(string_split[i]) {
                            array.push(string_split[i]);
                        } else {
                            array.push('');
                        }
                    }
                }

                // Only one item
                else
                    array.push(string);
            }

            return array;
        } catch(e) {
            Console.error('Utils.stringToArray', e);
        }

    };


    /**
     * Get the index of an array value
     * @public
     * @param {object} array
     * @param {string} value
     * @return {number}
     */
    self.indexArrayValue = function(array, value) {

        try {
            // Nothing?
            if(!array || !array.length) {
                return 0;
            }

            // Read the index of the value
            var index = 0;

            for(var i = 0; i < array.length; i++) {
                if(array[i] == value) {
                    index = i;

                    break;
                }
            }

            return index;
        } catch(e) {
            Console.error('Utils.indexArrayValue', e);
        }

    };


    /**
     * Capitalizes the first letter of a string
     * @public
     * @param {string} string
     * @return {string}
     */
    self.capitaliseFirstLetter = function(string) {

        try {
            return string.charAt(0).toUpperCase() + string.slice(1);
        } catch(e) {
            Console.error('Utils.capitaliseFirstLetter', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

var JappixUtils = Utils;