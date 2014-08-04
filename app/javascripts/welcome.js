/*

Jappix - An open social platform
These are the welcome tool functions for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Welcome = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self.is_done = false;


    /**
     * Opens the welcome tools
     * @public
     * @return {undefined}
     */
    self.open = function() {

        try {
            // Share message
            var share_msg = Common.printf(Common._e("Using Jappix, an open social platform. I am %s!"), Common.getXID());

            // Popup HTML content
            var html =
            '<div class="top">' + Common._e("Welcome!") + '</div>' +

            '<div class="tab">' +
                '<a href="#" class="tab-active" data-step="1">' + Common._e("Options") + '</a>' +
                '<a href="#" class="tab-missing" data-step="2">' + Common._e("Friends") + '</a>' +
                '<a href="#" class="tab-missing" data-step="3">' + Common._e("Share") + '</a>' +
            '</div>' +

            '<div class="content">' +
                '<div class="lap-active one-lap welcome1">' +
                    '<div class="infos">' +
                        '<p class="infos-title">' + Common._e("Welcome on Jappix, your own social cloud!") + '</p>' +
                        '<p>' + Common._e("Before you start using it, you will have to change some settings, search for friends and complete your profile.") + '</p>' +
                    '</div>' +

                    '<a href="#" class="box enabled" title="' + Common._e("Click to disable") + '">' +
                        '<span class="option">' + Common._e("Sounds") + '</span>' +
                        '<span class="description">' + Common._e("Enable notification sounds") + '</span>' +
                        '<span class="image sound talk-images"></span>' +
                        '<span class="tick talk-images"></span>' +
                    '</a>' +

                    '<a href="#" class="box enabled pep-hidable" title="' + Common._e("Click to disable") + '">' +
                        '<span class="option">' + Common._e("Geolocation") + '</span>' +
                        '<span class="description">' + Common._e("Share your position on the globe") + '</span>' +
                        '<span class="image geolocation talk-images"></span>' +
                        '<span class="tick talk-images"></span>' +
                    '</a>' +

                    '<a href="#" class="box xmpplinks-hidable" title="' + Common._e("Click to enable") + '">' +
                        '<span class="option">' + Common._e("XMPP links") + '</span>' +
                        '<span class="description">' + Common._e("Open XMPP links with Jappix") + '</span>' +
                        '<span class="image xmpp talk-images"></span>' +
                        '<span class="tick talk-images"></span>' +
                    '</a>' +

                    '<a href="#" class="box mam-hidable pref" title="' + Common._e("Click to enable") + '">' +
                        '<span class="option">' + Common._e("Message archiving") + '</span>' +
                        '<span class="description">' + Common._e("Store a history of your chats") + '</span>' +
                        '<span class="image mam talk-images"></span>' +
                        '<span class="tick talk-images"></span>' +
                    '</a>' +

                    '<a href="#" class="box" title="' + Common._e("Click to enable") + '">' +
                        '<span class="option">' + Common._e("Offline friends") + '</span>' +
                        '<span class="description">' + Common._e("Don\'t hide offline friends") + '</span>' +
                        '<span class="image offline talk-images"></span>' +
                        '<span class="tick talk-images"></span>' +
                    '</a>' +
                '</div>' +

                '<div class="one-lap welcome2">' +
                    '<div class="infos">' +
                        '<p class="infos-title">' + Common._e("Friends") + '</p>' +
                        '<p>' + Common._e("Use this tool to find your friends on the server you are using right now, or add them later.") + '</p>' +
                    '</div>' +

                    '<div class="results welcome-results"></div>' +
                '</div>' +

                '<div class="one-lap welcome3">' +
                    '<div class="infos">' +
                        '<p class="infos-title">' + Common._e("Share") + '</p>' +
                        '<p>' + Common._e("Good job! Now, you can share Jappix with your friends!") + '</p>' +
                        '<p>' + Common._e("When you will press the save button, the profile editor will be opened. Happy socializing!") + '</p>' +
                    '</div>' +

                    '<a class="box share first" href="http://www.facebook.com/sharer/sharer.php?u=' + Common.encodeQuotes(Utils.generateURL(JAPPIX_LOCATION)) + '" target="_blank">' +
                        '<span class="logo facebook welcome-images"></span>' +
                        '<span class="name">Facebook</span>' +
                        '<span class="description">' + Common.printf(Common._e("Share Jappix on %s"), 'Facebook') + '</span>' +
                        '<span class="go talk-images"></span>' +
                    '</a>' +

                    '<a class="box share" href="http://twitter.com/intent/tweet?text=' + Common.encodeQuotes(share_msg) + '&amp;url=' + Common.encodeQuotes(Utils.generateURL(JAPPIX_LOCATION)) + '" target="_blank">' +
                        '<span class="logo twitter welcome-images"></span>' +
                        '<span class="name">Twitter</span>' +
                        '<span class="description">' + Common.printf(Common._e("Share Jappix on %s"), 'Twitter') + '</span>' +
                        '<span class="go talk-images"></span>' +
                    '</a>' +

                    '<a class="box share" href="https://plus.google.com/share?url=' + Common.encodeQuotes(Utils.generateURL(JAPPIX_LOCATION)) + '" target="_blank">' +
                        '<span class="logo plus welcome-images"></span>' +
                        '<span class="name">Google+</span>' +
                        '<span class="description">' + Common.printf(Common._e("Share Jappix on %s"), 'Google+') + '</span>' +
                        '<span class="go talk-images"></span>' +
                    '</a>' +

                    '<a class="box share" href="https://waaave.com/spot/jappix/" target="_blank">' +
                        '<span class="logo waaave welcome-images"></span>' +
                        '<span class="name">Waaave</span>' +
                        '<span class="description">' + Common.printf(Common._e("Follow Jappix topic on %s"), 'Waaave') + '</span>' +
                        '<span class="go talk-images"></span>' +
                    '</a>' +
                '</div>' +
            '</div>' +

            '<div class="bottom">' +
                '<div class="wait wait-medium"></div>' +

                '<a href="#" class="finish next">' + Common._e("Next") + ' »</a>' +
                '<a href="#" class="finish save">' + Common._e("Save") + '</a>' +
            '</div>';

            // Create the popup
            Popup.create('welcome', html);

            // Unavoidable popup
            $('#welcome').addClass('unavoidable');

            // Apply the features
            Features.apply('welcome');

            // Associate the events
            self.instance();

            Console.log('Welcome assistant opened.');
        } catch(e) {
            Console.error('Welcome.open', e);
        }

    };


    /**
     * Closes the welcome tools
     * @public
     * @return {boolean}
     */
    self.close = function() {

        try {
            // Destroy the popup
            Popup.destroy('welcome');
        } catch(e) {
            Console.error('Welcome.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Switches the welcome tabs
     * @public
     * @param {string} id
     * @return {boolean}
     */
    self.switchTab = function(id) {

        try {
            // Path to
            var welcome = '#welcome ';
            var content = welcome + '.content .';
            var tab = welcome + '.tab ';
            var wait = $(welcome + '.wait');

            $(content + 'one-lap').hide();
            $(content + 'welcome' + id).show();
            $(tab + 'a').removeClass('tab-active');
            $(tab + 'a[data-step="' + id + '"]').addClass('tab-active').removeClass('tab-missing');

            // Update the "save" button if all is okay
            if(!Common.exists(tab + '.tab-missing')) {
                var finish = welcome + '.finish.';

                $(finish + 'save').show();
                $(finish + 'next').hide();
            }

            // If this is ID 2: vJUD search
            if(id == 2) {
                wait.show();
                DataForm.go(HOST_VJUD, 'search', '', '', 'welcome');
            } else {
                wait.hide();
            }
        } catch(e) {
            Console.error('Welcome.switchTab', e);
        } finally {
            return false;
        }

    };


    /**
     * Sends the welcome options
     * @public
     * @param {object} array
     * @return {undefined}
     */
    self.send = function(array) {

        try {
            // Sends the options
            var iq = new JSJaCIQ();
            iq.setType('set');

            var query = iq.setQuery(NS_PRIVATE);
            var storage = query.appendChild(iq.buildNode('storage', {'xmlns': NS_OPTIONS}));

            // Value array
            var tags = ['sounds', 'geolocation', '', '', 'roster-showall'];

            // Build the XML with the array
            for(var i in array) {
                var value = array[i];
                var tag = tags[i];

                if((i != 2) && (i != 3) && tag && value) {
                    storage.appendChild(iq.buildNode('option', {'type': tag, 'xmlns': NS_OPTIONS}, value));
                    DataStore.setDB(Connection.desktop_hash, 'options', tag, value);
                }
            }

            con.send(iq);

            // If geolocation is enabled
            if(array[1] == '1') {
                PEP.geolocate();
            }
        } catch(e) {
            Console.error('Welcome.send', e);
        }

    };


    /**
     * Saves the welcome options
     * @public
     * @return {boolean}
     */
    self.save = function() {

        try {
            // Get the new options
            var array = [];

            $('#welcome a.box').each(function() {
                var current = '0';

                if($(this).hasClass('enabled')) {
                    current = '1';
                }

                array.push(current);
            });

            // If XMPP links is enabled
            if(array[2] == '1') {
                Utils.xmppLinksHandler();
            }

            // If offline buddies showing is enabled
            if(array[4] == '1') {
                Interface.showAllBuddies('welcome');
            }

            // If archiving is supported by the server
            if(Features.enabledMAM()) {
                // If archiving is enabled
                if(array[3] == '1') {
                    MAM.setConfig('roster');
                }
            }

            // Send the new options
            self.send(array);

            // Close the welcome tool
            self.close();

            // Open the profile editor
            vCard.open();

            // Unavoidable popup
            $('#vcard').addClass('unavoidable');

            self.is_done = true;
        } catch(e) {
            Console.error('Welcome.save', e);
        } finally {
            return false;
        }

    };


    /**
     * Goes to the next welcome step
     * @public
     * @return {boolean}
     */
    self.next = function() {

        try {
            // Check the next step to go to
            var next = 1;
            var missing = '#welcome .tab a.tab-missing';

            if(Common.exists(missing)) {
                next = parseInt($(missing + ':first').attr('data-step'));
            }

            // Switch to the next step
            self.switchTab(next);
        } catch(e) {
            Console.error('Welcome.next', e);
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
            $('#welcome .tab a').click(function() {
                var this_sel = $(this);

                // Switch to the good tab
                var key = parseInt(this_sel.attr('data-step'));

                return self.switchTab(key);
            });

            $('#welcome a.box:not(.share)').click(function() {
                var this_sel = $(this);

                if(this_sel.hasClass('enabled')) {
                    this_sel.removeClass('enabled').attr('title', Common._e("Click to enable"));
                } else {
                    this_sel.addClass('enabled').attr('title', Common._e("Click to disable"));
                }

                return false;
            });

            $('#welcome .bottom .finish').click(function() {
                var this_sel = $(this);

                if(this_sel.is('.next')) {
                    return self.next();
                }

                if(this_sel.is('.save')) {
                    return self.save();
                }

                return false;
            });
        } catch(e) {
            Console.error('Welcome.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();