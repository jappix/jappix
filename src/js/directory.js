/*

Jappix - An open social platform
These are the directory JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Directory = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


	/**
     * Opens the directory popup
     * @public
     * @return {boolean}
     */
    self.openDirectory = function() {

        try {
            // Popup HTML content
            var html = 
            '<div class="top">' + _e("User directory") + '</div>' + 
            
            '<div class="content">' + 
                '<div class="directory-head">' + 
                    '<div class="directory-server-text">' + _e("Server to query") + '</div>' + 
                    
                    '<input name="directory-server-input" class="directory-server-input" value="' + encodeQuotes(HOST_VJUD) + '" />' + 
                '</div>' + 
                
                '<div class="results directory-results"></div>' + 
            '</div>' + 
            
            '<div class="bottom">' + 
                '<div class="wait wait-medium"></div>' + 
                
                '<a href="#" class="finish">' + _e("Close") + '</a>' + 
            '</div>';
            
            // Create the popup
            createPopup('directory', html);
            
            // Associate the events
            launchDirectory();
            
            // Start a search!
            startDirectory();
        } catch(e) {
            Console.error('Directory.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Quits the directory popup
     * @public
     * @return {boolean}
     */
    self.closeDirectory = function() {

        try {
            // Destroy the popup
            destroyPopup('directory');
        } catch(e) {
            Console.error('Directory.close', e);
        } finally {
            return false;
        }

    };


    /**
     * Launches a directory search
     * @public
     * @return {boolean}
     */
    self.startDirectory = function() {

        try {
            // Get the server to query
            var server = $('#directory .directory-server-input').val();
            
            // Launch the search!
            dataForm($('#directory .directory-server-input').val(), 'search', '', '', 'directory');
            
            Console.log('Directory search launched: ' + server);
        } catch(e) {
            Console.error('Directory.start', e);
        } finally {
            return false;
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.launchDirectory = function() {

        try {
            // Click event
            $('#directory .bottom .finish').click(closeDirectory);
            
            // Keyboard event
            $('#directory .directory-server-input').keyup(function(e) {
                if(e.keyCode == 13) {
                    // No value?
                    if(!$(this).val())
                        $(this).val(HOST_VJUD);
                    
                    // Start the directory search
                    startDirectory();
                    
                    return false;
                }
            });
        } catch(e) {
            Console.error('Directory.launch', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();