/*

Jappix - An open social platform
These are the audio JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Audio = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /* Variables */
    self._timeout_stop = false;


    /**
     * Returns whether browser supports audio or not
     * @private
     * @return {boolean}
     */
    self._isSupported = function() {

        is_supported = true;

        try {
            if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                is_supported = false;
            }
        } catch(e) {
            Console.error('Audio._isSupported', e);
        } finally {
            return is_supported;
        }

    };


    /**
     * Append audio DOM code
     * @private
     * @return {undefined}
     */
    self._appendDOM = function() {

        try {
            // If the audio elements aren't yet in the DOM
            if(!Common.exists('#audio')) {
                $('body').append(
                    '<div id="audio">' +
                        '<audio id="new-chat" preload="auto" data-duration="2">' +
                            '<source src="' + './sounds/new-chat.mp3' + '" />' +
                            '<source src="' + './sounds/new-chat.oga' + '" />' +
                        '</audio>' +

                        '<audio id="receive-message" preload="auto" data-duration="2">' +
                            '<source src="' + './sounds/receive-message.mp3' + '" />' +
                            '<source src="' + './sounds/receive-message.oga' + '" />' +
                        '</audio>' +

                        '<audio id="notification" preload="auto" data-duration="2">' +
                            '<source src="' + './sounds/notification.mp3' + '" />' +
                            '<source src="' + './sounds/notification.oga' + '" />' +
                        '</audio>' +

                        '<audio id="catch-attention" preload="auto" data-duration="3">' +
                            '<source src="' + './sounds/catch-attention.mp3' + '" />' +
                            '<source src="' + './sounds/catch-attention.oga' + '" />' +
                        '</audio>' +

                        '<audio id="incoming-call" preload="auto" data-duration="7">' +
                            '<source src="' + './sounds/incoming-call.mp3' + '" />' +
                            '<source src="' + './sounds/incoming-call.oga' + '" />' +
                        '</audio>' +

                        '<audio id="outgoing-call" preload="auto" data-duration="30">' +
                            '<source src="' + './sounds/outgoing-call.mp3' + '" />' +
                            '<source src="' + './sounds/outgoing-call.oga' + '" />' +
                        '</audio>' +
                    '</div>'
                );
            }
        } catch(e) {
            Console.error('Audio._appendDOM', e);
        }

    };


    /**
     * Plays the given sound ID
     * @public
     * @param {string} name
     * @return {boolean}
     */
    self.play = function(name, repeat) {

        try {
            repeat = (typeof repeat === 'boolean') ? repeat : false;

            // Not supported?
            if(!self._isSupported()) {
                return false;
            }

            // If the sounds are enabled
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'sounds') === '1') {
                self._appendDOM();

                // We play the target sound
                var audio_raw_sel = $('#audio audio').filter('#' + name);
                var audio_sel = audio_raw_sel[0];

                if(audio_sel) {
                    // Fixes Chrome audio bug when Get API serves expired files (for development work purposes)
                    if(window.chrome && System.isDeveloper()) {
                        audio_sel.load();
                    }

                    // Must repeat sound?
                    if(repeat === true) {
                        // We hardcoded sound duration as it's a mess to add load event handlers to determine duration via Audio API...
                        var duration = parseInt((audio_raw_sel.attr('data-duration') || 0), 10);

                        self._timeout_stop = false;

                        audio_raw_sel.oneTime((duration + 's'), function() {
                            if(!self._timeout_stop) {
                                self.play(name, repeat);
                            }
                        });
                    }

                    audio_sel.play();

                    Console.info('Played sound with name: ' + name + ' (' + (repeat ? 'repeatedly' : 'one time') + ')');
                } else {
                    throw 'Sound does not exist: ' + name;
                }
            }
        } catch(e) {
            Console.error('Audio.play', e);
        } finally {
            return false;
        }

    };


    /**
     * Stops the given sound ID
     * @public
     * @param {string} name
     * @return {boolean}
     */
    self.stop = function(name) {

        try {
            // Not supported?
            if(!self._isSupported()) {
                return false;
            }

            self._timeout_stop = true;

            // Check the audio container exists before doing anything...
            var audio_parent_sel = $('#audio');
            var audio_raw_sel = audio_parent_sel.find('audio').filter('#' + name);
            var audio_sel = audio_raw_sel[0];

            if(audio_parent_sel.size()) {
                audio_raw_sel.stopTime();

                if(audio_sel) {
                    if(!audio_sel.paused) {
                        audio_sel.pause();

                        Console.info('Stopped sound with name: ' + name);
                    } else {
                        Console.info('Sound with name: ' + name + ' already stopped');
                    }
                } else {
                    throw 'Sound does not exist: ' + name;
                }
            } else {
                Console.warn('Audio container does not exist, aborting as nothing likely to be playing! (already stopped)');
            }
        } catch(e) {
            Console.error('Audio.stop', e);
        } finally {
            return false;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();