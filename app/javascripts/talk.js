/*

Jappix - An open social platform
These are the talkpage JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Talk = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Creates the talkpage events
     * @public
     * @return {undefined}
     */
    self.events = function() {

        try {
            // Launch all associated bundles
            Microblog.instance();
            Roster.instance();
            Presence.instance();
            PEP.instance();
            Notification.instance();
            Music.instance();
        } catch(e) {
            Console.error('Talk.events', e);
        }

    };


    /**
     * Creates the talkpage code
     * @public
     * @return {boolean}
     */
    self.create = function() {

        try {
            // Talkpage exists?
            if(Common.exists('#talk')) {
                return false;
            }

            // Anonymous detector
            var anonymous = Utils.isAnonymous();

            // Generate the HTML code
            var html =
            '<div id="talk" class="removable">' +
                '<div id="top-content">' +
                    '<div class="tools tools-logo talk-images"></div>' +

                    '<div class="tools tools-all">';

                        if(!anonymous) html +=
                        '<a href="#" onclick="return Inbox.open();" class="inbox-hidable">' + Common._e("Messages") +  '</a>' +
                        '<a href="#" onclick="return vCard.open();" class="vcard">' + Common._e("Profile") +  '</a>' +
                        '<a href="#" onclick="return Options.open();" class="options-hidable">' + Common._e("Options") +  '</a>' +
                        '<a href="#" onclick="return Connection.normalQuit();" class="quit">' + Common._e("Disconnect") +  '</a>';

                        else html +=
                        '<a href="./">' + Common._e("Disconnect") +  '</a>';

                    html +=
                    '</div>';

                    if(!anonymous && document.createElement('audio').canPlayType) html +=
                    '<div class="tools-all ibubble">' +
                        '<div class="tools music talk-images" onclick="return Music.open();"></div>' +

                        '<div class="music-content tools-content bubble hidable">' +
                            '<div class="tools-content-subarrow talk-images"></div>' +

                            '<div class="tools-content-subitem">' +
                                '<div class="player">' +
                                    '<a href="#" class="stop talk-images" onclick="return Music.action(\'stop\');"></a>' +
                                '</div>' +

                                '<div class="list">' +
                                    '<p class="no-results">' + Common._e("No result!") +  '</p>' +
                                '</div>' +

                                '<div class="search">' +
                                    '<input type="text" />' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                    if(!anonymous) html +=
                    '<div class="tools-all ibubble">' +
                        '<div class="tools notifications talk-images" onclick="return Bubble.show(\'.notifications-content\');"></div>' +

                        '<div class="notifications-content tools-content bubble hidable">' +
                            '<div class="tools-content-subarrow talk-images"></div>' +

                            '<div class="tools-content-subitem">' +
                                '<a class="empty" href="#" onclick="return Notification.clear();">' + Common._e("Empty") +  '</a>' +
                                '<p class="nothing">' + Common._e("No notifications.") +  '</p>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                    if(!anonymous) html +=
                    '<div class="tools-all">' +
                        '<div class="tools call talk-images" onclick="return Call.open();">' +
                            '<span class="streaming-items">' +
                                '<span class="counter" data-default="00:00:00">00:00:00</span>' +
                                '<a class="stop" href="#" onclick="return Call.stop();">' + Common._e("Stop") + '</a>' +
                            '</span>' +
                        '</div>' +

                        '<div class="call-content tools-content">' +
                            '<div class="tools-content-subarrow talk-images"></div>' +

                            '<div class="tools-content-subitem"></div>' +
                        '</div>' +
                    '</div>';

                html +=
                '</div>' +

                '<div id="main-content">' +
                    '<div id="left-content">';
                        if(!anonymous) html +=
                        '<div id="roster">' +
                            '<div class="content"></div>' +

                            '<div class="filter">' +
                                '<input type="text" placeholder="' + Common._e("Filter") +  '" />' +
                                '<a href="#">x</a>' +
                            '</div>' +

                            '<div class="foot ibubble">' +
                                '<div class="roster-add roster-icon">' +
                                    '<a href="#" class="add talk-images" title="' + Common._e("Add a friend") +  '"></a>' +
                                '</div>' +

                                '<div class="roster-join roster-icon">' +
                                    '<a href="#" class="join talk-images" title="' + Common._e("Join a chat") +  '"></a>' +
                                '</div>' +

                                '<div class="roster-groupchat roster-icon">' +
                                    '<a href="#" class="groupchat talk-images" title="' + Common._e("Your groupchats") +  '"></a>' +
                                '</div>' +

                                '<div class="roster-muji roster-icon muji-hidable">' +
                                    '<a href="#" class="muji talk-images" title="' + Common._e("Audio/video conference") +  '"></a>' +
                                '</div>' +

                                '<div class="roster-more roster-icon">' +
                                    '<a href="#" class="more talk-images" title="' + Common._e("More stuff") +  '"></a>' +
                                '</div>' +

                                '<div style="clear: both;"></div>' +
                            '</div>' +
                        '</div>';

                        html +=
                        '<div id="my-infos">' +
                            '<div class="content">' +
                                '<div class="element f-presence ibubble">' +
                                    '<a href="#" class="icon picker disabled" data-value="available">' +
                                        '<span class="talk-images"></span>' +
                                    '</a>' +

                                    '<input id="presence-status" type="text" placeholder="' + Common._e("Status") + '" disabled="" />' +
                                '</div>';

                                if(!anonymous) html +=
                                '<div class="element f-mood pep-hidable ibubble">' +
                                    '<a href="#" class="icon picker" data-value="happy">' +
                                        '<span class="talk-images"></span>' +
                                    '</a>' +

                                    '<input id="mood-text" type="text" placeholder="' + Common._e("Mood") + '" />' +
                                '</div>' +

                                '<div class="element f-activity pep-hidable ibubble">' +
                                    '<a href="#" class="icon picker" data-value="exercising">' +
                                        '<span class="talk-images activity-exercising"></span>' +
                                    '</a>' +

                                    '<input id="activity-text" type="text" placeholder="' + Common._e("Activity") + '" />' +
                                '</div>';

                            html +=
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div id="right-content">' +
                        '<div id="page-switch">' +
                            '<div class="chans">';
                                if(!anonymous) html +=
                                '<div class="channel switcher activechan" onclick="return Interface.switchChan(\'channel\');">' +
                                    '<div class="icon talk-images"></div>' +

                                    '<div class="name">' + Common._e("Channel") +  '</div>' +
                                '</div>';

                            html +=
                            '</div>';

                            if(anonymous) html +=
                                '<div class="join ibubble">' +
                                    '<div class="join-button talk-images" onclick="return Interface.loadJoinGroupchat();" title="' + Common._e("Join groupchat") +  '"></div>' +
                                '</div>';

                            html +=
                            '<div class="more ibubble">' +
                                '<div class="more-button talk-images" onclick="return Interface.loadChatSwitch();" title="' + Common._e("All tabs") +  '"></div>' +
                            '</div>' +
                        '</div>' +

                        '<div id="page-engine">';
                            if(!anonymous) html +=
                            '<div id="channel" class="page-engine-chan" style="display: block;">' +
                                '<div class="top mixed ' + hex_md5(Common.getXID()) + '">' +
                                    '<div class="avatar-container">' +
                                        '<img class="avatar" src="' + './images/others/default-avatar.png' + '" alt="" />' +
                                    '</div>' +

                                    '<div class="update">' +
                                        '<p>' + Common._e("What\'s up with you?") +  '</p>' +

                                        '<div class="microblog-body">' +
                                            '<input class="focusable" type="text" name="microblog_body" placeholder="' + Common._e("Type something you want to share with your friends...") + '" disabled="" />' +
                                        '</div>' +

                                        '<div class="one-microblog-icon ibubble">' +
                                            '<a href="#" onclick="return Bubble.show(\'#attach\');" title="' + Common._e("Attach a file") +  '" class="postit attach talk-images"></a>' +

                                            '<form id="attach" class="bubble hidable" action="./server/file-share.php" method="post" enctype="multipart/form-data">' +
                                                '<div class="attach-subarrow talk-images"></div>' +

                                                '<div class="attach-subitem">' +
                                                    '<p class="attach-p">' + Common._e("Attach a file") +  '</p>' +
                                                    Interface.generateFileShare() +
                                                '</div>' +
                                            '</form>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="content mixed"></div>' +

                                '<div class="footer">' +
                                    '<div class="sync talk-images">' + Common._e("You are synchronized with your network.") +  '</div>' +

                                    '<div class="unsync talk-images">' + Common._e("Cannot send anything: you can only receive notices!") +  '</div>' +

                                    '<div class="fetch wait-small">' + Common._e("Fetching the social channel...") +  '</div>' +
                                '</div>' +
                            '</div>';

                        html +=
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

            // Create the HTML code
            $('body').prepend(html);

            // Adapt the roster size
            Roster.adapt();

            // Create JS events
            self.events();

            // Start the auto idle functions
            Presence.liveIdle();

            return true;
        } catch(e) {
            Console.error('Talk.create', e);
        }

    };


    /**
     * Destroys the talkpage code
     * @public
     * @return {undefined}
     */
    self.destroy = function() {

        try {
            // Reset our database
            DataStore.resetDB();

            // Reset some vars
            STANZA_ID = 1;
            Roster.blist_all = false;
            Presence.first_sent = false;
            Search.search_filtered = false;
            Avatar.pending = [];
            Groupchat.join_suggest = [];

            // Kill all timers, exept the board ones
            $('*:not(#board .one-board)').stopTime();

            // Kill the auto idle functions
            Presence.dieIdle();

            // We renitalise the html markup as its initiale look
            $('.removable').remove();
            Interface.title('home');

            // Finally we show the homepage
            $('#home').show();
        } catch(e) {
            Console.error('Talk.destroy', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();