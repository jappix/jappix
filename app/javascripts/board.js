/*

Jappix - An open social platform
These are the notification board JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Board = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Contants */
    self.NOTIFICATION = (window.Notification || window.mozNotification || window.webkitNotification);


    /**
     * Generate board info message
     * @private
     * @param {string} id
     * @return {string}
     */
    self._generateBoardInfo = function(id) {

        var text = null;

        try {
            switch(id) {
                // Password change
                case 1:
                    text = Common._e("Your password has been changed, now you can connect to your account with your new login data.");

                    break;

                // Account deletion
                case 2:
                    text = Common._e("Your XMPP account has been removed, bye!");

                    break;

                // Account logout
                case 3:
                    text = Common._e("You have been logged out of your XMPP account, have a nice day!");

                    break;

                // Groupchat join
                case 4:
                    text = Common._e("The room you tried to join doesn't seem to exist.");

                    break;

                // Groupchat removal
                case 5:
                    text = Common._e("The groupchat has been removed.");

                    break;

                // Non-existant groupchat user
                case 6:
                    text = Common._e("The user that you want to reach is not present in the room.");

                    break;
            }
        } catch(e) {
            Console.error('Board._generateBoardInfo', e);
        } finally {
            return text;
        }

    };


    /**
     * Generate board error message
     * @private
     * @param {string} id
     * @return {string}
     */
    self._generateBoardError = function(id) {

        var text = null;

        try {
            switch(id) {
                // Custom error
                case 1:
                    text = '<b>' + Common._e("Error") + '</b> &raquo; <span></span>';

                    break;

                // Network error
                case 2:
                    text = Common._e("Jappix has been interrupted by a network issue, a bug or bad login (check that you entered the right credentials), sorry for the inconvenience.");

                    break;

                // List retrieving error
                case 3:
                    text = Common._e("The element list on this server could not be obtained!");

                    break;

                // Attaching error
                case 4:
                    text = Common.printf(Common._e("An error occured while uploading your file: maybe it is too big (%s maximum) or forbidden!"), JAPPIX_MAX_UPLOAD);

                    break;
            }
        } catch(e) {
            Console.error('Board._generateBoardError', e);
        } finally {
            return text;
        }

    };


    /**
     * Attaches board events
     * @private
     * @param {object} board_sel
     * @return {undefined}
     */
    self._attachEvents = function(board_sel) {

        try {
            board_sel.click(function() {
                self.closeThis(this);
            });

            board_sel.oneTime('5s', function() {
                self.closeThis(this);
            });

            board_sel.slideDown();
        } catch(e) {
            Console.error('Board._attachEvents', e);
        }

    };


    /**
     * Creates a board panel
     * @public
     * @param {string} type
     * @param {string} id
     * @return {boolean}
     */
    self.create = function(type, id) {

        try {
            // Text var
            var text = '';

            // Info
            if(type == 'info') {
                text = self._generateBoardInfo(id);
            } else {
                text = self._generateBoardError(id);
            }

            // No text?
            if(!text) {
                return false;
            }

            // Append the content
            $('#board').append(
                '<div class="one-board ' + type + '" data-id="' + id + '">' + text + '</div>'
            );

            // Events (click and auto-hide)
            self._attachEvents(
                $('#board .one-board.' + type + '[data-id="' + id + '"]')
            );

            return true;
        } catch(e) {
            Console.error('Board.create', e);
        }

    };


    /**
     * Destroys the existing board notifications
     * @public
     * @return {undefined}
     */
    self.destroy = function() {

        try {
            $('#board').empty();
        } catch(e) {
            Console.error('Board.destroy', e);
        }

    };


    /**
     * Executes a given action on the notification board
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.action = function(id, type) {

        try {
            // In a first, we destroy other boards
            self.destroy();

            // Then we display the board
            self.create(type, id);
        } catch(e) {
            Console.error('Board.action', e);
        }

    };


    /**
     * Opens a given error ID
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.openThisError = function(id) {

        try {
            self.action(id, 'error');
        } catch(e) {
            Console.error('Board.openThisError', e);
        }

    };


    /**
     * Opens a given info ID
     * @public
     * @param {string} id
     * @return {undefined}
     */
    self.openThisInfo = function(id) {

        try {
            self.action(id, 'info');
        } catch(e) {
            Console.error('Board.openThisInfo', e);
        }

    };


    /**
     * Closes a given board
     * @public
     * @param {string} board
     * @return {undefined}
     */
    self.closeThis = function(board) {

        try {
            $(board).slideUp('normal', function() {
                $(this).remove();
            });
        } catch(e) {
            Console.error('Board.closeThis', e);
        }

    };


    /**
     * Creates a quick board (HTML5 notification)
     * @public
     * @param {string} xid
     * @param {string} type
     * @param {string} content
     * @param {string} title
     * @param {string} icon
     * @return {object}
     */
    self.quick = function(xid, type, content, title, icon) {

        try {
            // Cannot process?
            if(Common.isFocused() || !content || !self.NOTIFICATION) {
                return;
            }

            // Default icon?
            if(!icon) {
                icon = './images/others/default-avatar.png';

                // Avatar icon?
                if(xid) {
                    var avatar_xml = Common.XMLFromString(
                        DataStore.getPersistent('global', 'avatar', xid)
                    );

                    var avatar_type = $(avatar_xml).find('type').text() || 'image/png';
                    var avatar_binval = $(avatar_xml).find('binval').text();

                    if(avatar_binval && avatar_type) {
                        icon = 'data:' + avatar_type + ';base64,' + avatar_binval;
                    }
                }
            }

            // Default title?
            if(!title) {
                title = Common._e("New event!");
            }

            // Create notification
            var notification = new self.NOTIFICATION(title, {
                dir: 'auto',
                lang: '',
                body: content,
                tag: type,
                icon: icon
            });

            // Click event
            notification.onclick = function() {
                // Click action?
                switch(type) {
                    case 'chat':
                        Interface.switchChan(hex_md5(xid));
                        break;

                    case 'groupchat':
                        Interface.switchChan(hex_md5(Common.bareXID(xid)));
                        break;

                    default:
                        break;
                }

                // Focus on msg-me
                window.focus();

                // Remove notification
                this.close();
            };

            // Show event
            notification.onshow = function() {
                setTimeout(function() {
                    notification.close();
                }, 10000);
            };

            return notification;
        } catch(e) {
            Console.error('Board.quick', e);
        }

    };


    /**
     * Asks for permission to show quick boards (HTML5 notification)
     * @public
     * @return {undefined}
     */
    self.quickPermission = function() {

        try {
            self.NOTIFICATION.requestPermission();
        } catch(e) {
            Console.error('Board.quickPermission', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launch = function() {

        try {
            // Fires quickPermission() on document click
            $(document).click(function() {
                // Ask for permission to use quick boards
                if((typeof con != 'undefined') && con.connected()) {
                    self.quickPermission();
                }
            });
        } catch(e) {
            Console.error('Board.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();

Board.launch();