/*

Jappix - An open social platform
These are the music JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var Music = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Opens the music bubble
     * @public
     * @return {boolean}
     */
    self.open = function() {

        try {
            var path = '.music-content';

            // Show the music bubble
            Bubble.show(path);

            $(document).oneTime(10, function() {
                $(path + ' input').focus();
            });
        } catch(e) {
            Console.error('Music.open', e);
        } finally {
            return false;
        }

    };


    /**
     * Parses the music search XML
     * @public
     * @param {string} xml
     * @param {string} type
     * @return {undefined}
     */
    self.parse = function(xml, type) {

        try {
            var path = '.music-content ';
            var content = path + '.list';
            var path_type = content + ' .' + type;

            // Create the result container
            if(!Common.exists(path_type)) {
                var code = '<div class="' + type + '"></div>';

                if(type == 'local') {
                    $(content).prepend(code);
                } else {
                    $(content).append(code);
                }
            }

            // Fill the results
            $(xml).find('track').each(function() {
                // Parse the XML
                var this_sel = $(this);

                var id = this_sel.find('id').text() || hex_md5(uri);
                var title = this_sel.find('name').text();
                var artist = this_sel.find('artist').text();
                var source = this_sel.find('source').text();
                var duration = this_sel.find('duration').text();
                var uri = this_sel.find('url').text();
                var mime = this_sel.find('type').text() || 'audio/ogg';

                // Local URL?
                if(type == 'local') {
                    uri = Utils.generateURL(uri);
                }

                // Append the HTML code
                $(path_type).append('<a href="#" class="song" data-id="' + id + '">' + title + '</a>');

                // Current playing song?
                var current_song = $(path_type + ' a[data-id="' + id + '"]');

                if(Common.exists('.music-audio[data-id="' + id + '"]')) {
                    current_song.addClass('playing');
                }

                // Click event
                current_song.click(function() {
                    return self.add(id,  title, artist, source, duration, uri, mime, type);
                });
            });

            // The search is finished
            if(Common.exists(content + ' .jamendo') && Common.exists(content + ' .local')) {
                // Get the result values
                var jamendo = $(content + ' .jamendo').text();
                var local = $(content + ' .local').text();

                // Enable the input
                $(path + 'input').val('').removeAttr('disabled');

                // No result
                if(!jamendo && !local) {
                    $(path + '.no-results').show();
                }

                // We must put a separator between the categories
                if(jamendo && local) {
                    $(content + ' .local').addClass('special');
                }
            }
        } catch(e) {
            Console.error('Music.parse', e);
        }

    };


    /**
     * Sends the music search requests
     * @public
     * @return {undefined}
     */
    self.search = function() {

        try {
            var path = '.music-content ';

            // We get the input string
            var string = $(path + 'input').val();

            // We lock the search input
            $(path + 'input').attr('disabled', true);

            // We reset the results
            $(path + '.list div').remove();
            $(path + '.no-results').hide();

            // Get the Jamendo results
            $.get('./server/music-search.php', {searchquery: string, location: 'jamendo'}, function(data) {
                self.parse(data, 'jamendo');
            });

            // Get the local results
            $.get('./server/music-search.php', {
                searchquery: string,
                location: JAPPIX_LOCATION
            }, function(data) {
                self.parse(data, 'local');
            });
        } catch(e) {
            Console.error('Music.search', e);
        }

    };


    /**
     * Performs an action on the music player
     * @public
     * @param {string} action
     * @return {boolean}
     */
    self.action = function(action) {

        try {
            // Initialize
            var audio_sel = document.getElementById('top-content').getElementsByTagName('audio')[0];

            // Nothing to play, exit
            if(!audio_sel) {
                return false;
            }

            var stopButton = $('#top-content a.stop');

            // User play a song
            if(action == 'play') {
                stopButton.show();
                audio_sel.load();
                audio_sel.play();

                audio_sel.addEventListener('ended', function() {
                    self.action('stop');
                }, true);

                Console.log('Music is now playing.');
            } else if(action == 'stop') {
                // User stop the song / end of song
                stopButton.hide();
                audio_sel.pause();

                $('#top-content .music').removeClass('actived');
                $('.music-content .list a').removeClass('playing');
                $('.music-audio').remove();

                self.publish();

                Console.log('Music is now stopped.');
            }
        } catch(e) {
            Console.error('Music.action', e);
        } finally {
            return false;
        }

    };


    /**
     * Publishes the current title over PEP
     * @public
     * @param {string} title
     * @param {string} artist
     * @param {string} source
     * @param {string} duration
     * @param {string} uri
     * @return {undefined}
     */
    self.publish = function(title, artist, source, duration, uri) {

        /* REF: http://xmpp.org/extensions/xep-0118.html */

        try {
            // We share the tune on PEP if enabled
            if(Features.enabledPEP()) {
                var iq = new JSJaCIQ();
                iq.setType('set');

                // Create the main PubSub nodes
                var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
                var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_TUNE, 'xmlns': NS_PUBSUB}));
                var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
                var tune = item.appendChild(iq.buildNode('tune', {'xmlns': NS_TUNE}));

                // Enough data?
                if(title || artist || source || uri) {
                    var music_data = {
                        'title': title,
                        'artist': artist,
                        'source': source,
                        'length': length,
                        'uri': uri
                    };

                    // Create the children nodes
                    var cur_value;

                    for(var cur_name in music_data) {
                        cur_value = music_data[cur_name];

                        if(cur_value) {
                            tune.appendChild(iq.buildNode(cur_name, {
                                'xmlns': NS_TUNE
                            }, cur_value));
                        }
                    }
                }

                con.send(iq);

                Console.info('New tune sent: ' + title);
            }
        } catch(e) {
            Console.error('Music.publish', e);
        }

    };


    /**
     * Adds a music title to the results
     * @public
     * @param {string} id
     * @param {string} title
     * @param {string} artist
     * @param {string} source
     * @param {string} duration
     * @param {string} uri
     * @param {string} mime
     * @param {string} type
     * @return {boolean}
     */
    self.add = function(id, title, artist, source, duration, uri, mime, type) {

        try {
            var path = '.music-content ';
            var music_audio_sel = $('.music-audio');

            // We remove & create a new audio tag
            music_audio_sel.remove();
            $(path + '.player').prepend('<audio class="music-audio" type="' + mime + '" data-id="' + id + '" />');

            // We apply the new source to the player
            if(type == 'jamendo') {
                music_audio_sel.attr('src', 'http://api.jamendo.com/get2/stream/track/redirect/?id=' + id + '&streamencoding=ogg2');
            } else {
                music_audio_sel.attr('src', uri);
            }

            // We play the target sound
            self.action('play');

            // We set the actived class
            $('#top-content .music').addClass('actived');

            // We set a current played track indicator
            $(path + '.list a').removeClass('playing');
            $(path + 'a[data-id="' + id + '"]').addClass('playing');

            // We publish what we listen
            self.publish(title, artist, source, duration, uri);
        } catch(e) {
            Console.error('Music.add', e);
        } finally {
            return false;
        }

    };


    /**
     * Plugin launcher
     * @public
     * @param {type} name
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // When music search string submitted
            $('.music-content input').keyup(function(e) {
                // Enter : send
                if(e.keyCode == 13 && $(this).val()) {
                    self.search();
                }

                // Escape : quit
                if(e.keyCode == 27) {
                    Bubble.close();
                }
            });
        } catch(e) {
            Console.error('Music.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();