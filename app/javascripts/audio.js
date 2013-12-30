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
    self._is_supported = function() {

        is_supported = true;

        try {
            if((BrowserDetect.browser == 'Explorer') && (BrowserDetect.version < 9)) {
                is_supported = false;
            }
        } catch(e) {
            Console.error('Audio._is_supported', e);
        } finally {
            return is_supported;
        }

    };


	/**
     * Plays the given sound ID
     * @public
     * @param {number} num
     * @return {boolean}
     */
    self.play = function(num, repeat) {

        try {
            repeat = (typeof repeat === 'boolean') ? repeat : false;

            // Not supported?
            if(!self._is_supported()) {
                return false;
            }
            
            // If the sounds are enabled
            if(DataStore.getDB(Connection.desktop_hash, 'options', 'sounds') === '1') {
                // If the audio elements aren't yet in the DOM
                if(!Common.exists('#audio')) {
                    $('body').append(
                        '<div id="audio">' + 
                            '<audio id="new-chat" preload="auto">' + 
                                '<source src="' + './sounds/new-chat.mp3' + '" />' + 
                                '<source src="' + './sounds/new-chat.oga' + '" />' + 
                            '</audio>' + 
                            
                            '<audio id="receive-message" preload="auto">' + 
                                '<source src="' + './sounds/receive-message.mp3' + '" />' + 
                                '<source src="' + './sounds/receive-message.oga' + '" />' + 
                            '</audio>' + 
                            
                            '<audio id="notification" preload="auto">' + 
                                '<source src="' + './sounds/notification.mp3' + '" />' + 
                                '<source src="' + './sounds/notification.oga' + '" />' + 
                            '</audio>' + 
                            
                            '<audio id="incoming-call" preload="auto">' + 
                                '<source src="' + './sounds/incoming-call.mp3' + '" />' + 
                                '<source src="' + './sounds/incoming-call.oga' + '" />' + 
                            '</audio>' + 
                        '</div>'
                    );
                }
                
                // We play the target sound
                var playThis = document.getElementById('audio').getElementsByTagName('audio')[num];

                // Fixes Chrome audio bug when Get API serves expired files (for development work purposes)
                if(window.chrome && System.isDeveloper()) {
                    playThis.load();
                }

                // Must repeat sound?
                if(repeat === true) {
                    self._timeout_stop = false;
                    
                    window.setTimeout(function() {
                        if(!self._timeout_stop) {
                            self.play(num, repeat);
                        }
                    }, 10 * 1000);
                }

                playThis.play();
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
     * @param {number} num
     * @return {boolean}
     */
    self.stop = function(num) {

        try {
            // Not supported?
            if(!self._is_supported()) {
                return false;
            }
            
            self._timeout_stop = true;

            var stop_audio_sel = document.getElementById('audio').getElementsByTagName('audio')[num];

            if(stop_audio_sel) {
                stop_audio_sel.pause();
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