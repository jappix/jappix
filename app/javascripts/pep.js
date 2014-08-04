/*

Jappix - An open social platform
These are the PEP JS scripts for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Bundle
var PEP = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Generates display object
     * @private
     * @return {object}
     */
    self._generateDisplayObject = function() {

        var display_object = {
            'pep_value': '',
            'pep_text': '',
            'style_value': '',
            'style_text': '',
            'display_text': '',
            'final_link': '',
            'final_uri': ''
        };

        try {
            // Nothing to do there
        } catch(e) {
            Console.error('PEP._generateDisplayObject', e);
        } finally {
            return display_object;
        }

    };


    /**
     * Abstracts mood and activity display helpers
     * @private
     * @param {object} node_sel
     * @param {function} icon_fn
     * @return {object}
     */
    self._abstractDisplayMoodActivity = function(node_sel, icon_fn) {

        var display_args = self._generateDisplayObject();

        try {
            if(node_sel) {
                display_args.pep_value = node_sel.find('value').text() || 'none';
                display_args.pep_text = node_sel.find('text').text();

                display_args.style_value = icon_fn(display_args.pep_value);
                display_args.style_text = display_args.pep_text ? display_args.pep_text : Common._e("unknown");
            } else {
                display_args.style_value = icon_fn('undefined');
                display_args.style_text = Common._e("unknown");
            }

            display_args.display_text = display_args.style_text;
            display_args.style_text = display_args.style_text.htmlEnc();
        } catch(e) {
            Console.error('PEP._abstractDisplayMoodActivity', e);
        } finally {
            return display_args;
        }

    };


    /**
     * Displays PEP mood
     * @private
     * @param {object} node_sel
     * @return {object}
     */
    self._displayMood = function(node_sel) {

        var mood_args = self._abstractDisplayMoodActivity(
            node_sel,
            self.moodIcon
        );

        try {
            // Nothing to do there
        } catch(e) {
            Console.error('PEP._displayMood', e);
        } finally {
            return mood_args;
        }

    };


    /**
     * Displays PEP activity
     * @private
     * @param {object} node_sel
     * @return {object}
     */
    self._displayActivity = function(node_sel) {

        var activity_args = self._abstractDisplayMoodActivity(
            node_sel,
            self.activityIcon
        );

        try {
            // Nothing to do there
        } catch(e) {
            Console.error('PEP._displayActivity', e);
        } finally {
            return activity_args;
        }

    };


    /**
     * Displays PEP tune
     * @private
     * @param {object} node_sel
     * @return {object}
     */
    self._displayTune = function(node_sel) {

        var tune_args = self._generateDisplayObject();

        try {
            tune_args.style_value = 'tune-note';

            if(node_sel) {
                // Parse the tune XML
                var tune_artist = node_sel.find('artist').text();
                var tune_title = node_sel.find('title').text();
                var tune_album = node_sel.find('album').text();
                var tune_uri = node_sel.find('uri').text();

                // Apply the good values
                if(!tune_artist && !tune_album && !tune_title) {
                    tune_args.style_text = Common._e("unknown");
                    tune_args.display_text = tune_args.style_text;
                } else {
                    tune_args.final_uri = tune_uri ||
                                          'http://grooveshark.com/search?q=' + encodeURIComponent(tune_artist + ' ' + tune_title + ' ' + tune_album);

                    var final_artist = tune_artist || Common._e("unknown");
                    var final_title = tune_title || Common._e("unknown");
                    var final_album = tune_album || Common._e("unknown");

                    tune_args.final_link = ' href="' + tune_args.final_uri + '" target="_blank"';

                    // Generate the text to be displayed
                    tune_args.display_text = final_artist + ' - ' + final_title + ' (' + final_album + ')';
                    tune_args.style_text =  '<a' + tune_args.final_link + '>' + tune_args.display_text + '</a>';
                }
            } else {
                tune_args.style_text = Common._e("unknown");
                tune_args.display_text = tune_args.style_text;
            }
        } catch(e) {
            Console.error('PEP._displayTune', e);
        } finally {
            return tune_args;
        }

    };


    /**
     * Displays PEP geolocation
     * @private
     * @param {object} node_sel
     * @return {object}
     */
    self._displayGeolocation = function(node_sel) {

        var geolocation_args = self._generateDisplayObject();

        try {
            geolocation_args.style_value = 'location-world';

            if(node_sel) {
                geolocation_args.geoloc_lat = node_sel.find('lat').text();
                geolocation_args.geoloc_lon = node_sel.find('lon').text();
                geolocation_args.geoloc_human = node_sel.find('human').text() ||
                                   Common._e("See his/her position on the globe");
                geolocation_args.geoloc_real = geolocation_args.geoloc_human;

                // Text to be displayed
                if(geolocation_args.geoloc_lat && geolocation_args.geoloc_lon) {
                    geolocation_args.final_uri = 'http://maps.google.com/?q=' + Common.encodeQuotes(geolocation_args.geoloc_lat) + ',' + Common.encodeQuotes(geolocation_args.geoloc_lon);
                    geolocation_args.final_link = ' href="' + geolocation_args.final_uri + '" target="_blank"';

                    geolocation_args.style_text = '<a' + geolocation_args.final_link + '>' +
                                                      geolocation_args.geoloc_human.htmlEnc() +
                                                  '</a>';
                    geolocation_args.display_text = geolocation_args.geoloc_real ||
                                                     (geolocation_args.geoloc_lat + '; ' + geolocation_args.geoloc_lon);
                } else {
                    geolocation_args.style_text = Common._e("unknown");
                    geolocation_args.display_text = geolocation_args.style_text;
                }
            } else {
                geolocation_args.style_text = Common._e("unknown");
                geolocation_args.display_text = geolocation_args.style_text;
            }
        } catch(e) {
            Console.error('PEP._displayGeolocation', e);
        } finally {
            return geolocation_args;
        }

    };


    /**
     * Add foreign display object to DOM
     * @private
     * @param {string} xid
     * @param {string} hash
     * @param {string} type
     * @param {object} display_args
     * @return {undefined}
     */
    self._appendForeignDisplayObject = function(xid, hash, type, display_args) {

        try {
            var this_buddy = '#roster .buddy[data-xid="' + escape(xid) + '"]';

            if(Common.exists(this_buddy)) {
                $(this_buddy + ' .bi-' + type).replaceWith(
                    '<p class="bi-' + type + ' talk-images ' + display_args.style_value + '" title="' + Common.encodeQuotes(display_args.display_text) + '">' + display_args.style_text + '</p>'
                );
            }

            // Apply the text to the buddy chat
            if(Common.exists('#' + hash)) {
                // Selector
                var bc_pep = $('#' + hash + ' .bc-pep');

                // We remove the old PEP item
                bc_pep.find('a.bi-' + type).remove();

                // If the new PEP item is not null, create a new one
                if(display_args.style_text != Common._e("unknown")) {
                    bc_pep.prepend(
                        '<a' + display_args.final_link + ' class="bi-' + type + ' talk-images ' + display_args.style_value + '" title="' + Common.encodeQuotes(display_args.display_text) + '"></a>'
                    );
                }

                // Process the new status position
                Presence.adaptChat(hash);
            }
        } catch(e) {
            Console.error('PEP._appendOwnDisplayObject', e);
        }

    };


    /**
     * Add own display object to DOM
     * @private
     * @param {string} type
     * @param {object} display_args
     * @return {undefined}
     */
    self._appendOwnDisplayObject = function(type, display_args) {

        try {
            // Change the icon/value of the target element
            if((type == 'mood') || (type == 'activity')) {
                // Change the input value
                var display_value = '';
                var display_attribute = display_args.pep_value;

                // Must apply default values?
                if(display_args.pep_value == 'none') {
                    if(type == 'mood') {
                        display_attribute = 'happy';
                    } else {
                        display_attribute = 'exercising';
                    }
                }

                // No text?
                if(display_args.display_text != Common._e("unknown")) {
                    display_value = display_args.display_text;
                }

                // Store this user event in our database
                DataStore.setDB(Connection.desktop_hash, type + '-value', 1, display_attribute);
                DataStore.setDB(Connection.desktop_hash, type + '-text', 1, display_value);

                // Apply this PEP event
                $('#my-infos .f-' + type + ' a.picker').attr('data-value', display_attribute);
                $('#my-infos .f-' + type + ' input').val(display_value);
                $('#my-infos .f-' + type + ' input').placeholder();
            } else if((type == 'tune') || (type == 'geoloc')) {
                // Reset the values
                $('#my-infos .f-others a.' + type).remove();

                // Not empty?
                if(display_args.display_text != Common._e("unknown")) {
                    // Specific stuffs
                    var href, title, icon_class;

                    if(type == 'tune') {
                        href = display_args.final_uri;
                        title = display_args.display_text;
                        icon_class = 'tune-note';
                    } else {
                        href = 'http://maps.google.com/?q=' + Common.encodeQuotes(display_args.geoloc_lat) + ',' + Common.encodeQuotes(display_args.geoloc_lon);
                        title = Common._e("Where are you?") + ' (' + display_args.display_text + ')';
                        icon_class = 'location-world';
                    }

                    // Must create the container?
                    if(!Common.exists('#my-infos .f-others')) {
                        $('#my-infos .content').append('<div class="element f-others"></div>');
                    }

                    // Create the element
                    $('#my-infos .f-others').prepend(
                        '<a class="icon ' + type + '" href="' + Common.encodeQuotes(href) + '" target="_blank" title="' + Common.encodeQuotes(title) +  '">' +
                            '<span class="talk-images ' + icon_class + '"></span>' +
                        '</a>'
                    );
                }

                // Empty?
                else if(!Common.exists('#my-infos .f-others a.icon')) {
                    $('#my-infos .f-others').remove();
                }

                // Process the roster height again
                Roster.adapt();
            }
        } catch(e) {
            Console.error('PEP._appendOwnDisplayObject', e);
        }

    };


    /**
     * Generates storage data
     * @private
     * @param {object} args
     * @return {string}
     */
    self._generateStore = function(args) {

        var storage_data = '';

        try {
            var cur_value;

            for(var cur_arg in args) {
                storage_data += '<' + cur_arg + '>' +
                                    (args[cur_arg] || '').htmlEnc() +
                                '</' + cur_arg + '>';
            }
        } catch(e) {
            Console.error('PEP._generateStore', e);
        } finally {
            return storage_data;
        }

    };


    /**
     * Proceeds mood picker event callback
     * @private
     * @param {object} picker_sel
     * @return {boolean}
     */
    self._callbackMoodPicker = function(picker_sel) {

        try {
            // Initialize some vars
            var path = '#my-infos .f-mood div.bubble';
            var mood_val = picker_sel.attr('data-value');

            var moods_obj = {
                'crazy': Common._e("Crazy"),
                'excited': Common._e("Excited"),
                'playful': Common._e("Playful"),
                'happy': Common._e("Happy"),
                'shocked': Common._e("Shocked"),
                'hot': Common._e("Hot"),
                'sad': Common._e("Sad"),
                'amorous': Common._e("Amorous"),
                'confident': Common._e("Confident")
            };

            // Yet displayed?
            var can_append = !Common.exists(path);

            // Add this bubble!
            Bubble.show(path);

            if(!can_append) {
                return false;
            }

            // Generate the HTML code
            var html = '<div class="bubble removable">';

            for(var cur_mood_name in moods_obj) {
                // Yet in use: no need to display it!
                if(cur_mood_name == mood_val) {
                    continue;
                }

                html += '<a href="#" class="talk-images" data-value="' + cur_mood_name + '" title="' + moods_obj[cur_mood_name] + '"></a>';
            }

            html += '</div>';

            // Append the HTML code
            $('#my-infos .f-mood').append(html);

            // Click event
            $(path + ' a').click(function() {
                // Update the mood marker
                picker_sel.attr(
                    'data-value',
                    $(this).attr('data-value')
                );

                // Close the bubble
                Bubble.close();

                // Focus on the status input
                $(document).oneTime(10, function() {
                    $('#mood-text').focus();
                });

                return;
            });
        } catch(e) {
            Console.error('PEP._callbackMoodPicker', e);
        } finally {
            return false;
        }

    };


    /**
     * Proceeds activity picker event callback
     * @private
     * @param {object} picker_sel
     * @return {boolean}
     */
    self._callbackActivityPicker = function(picker_sel) {

        try {
            // Initialize some vars
            var path = '#my-infos .f-activity div.bubble';
            var activity_val = picker_sel.attr('data-value');

            var activities_obj = {
                'doing_chores': Common._e("Chores"),
                'drinking': Common._e("Drinking"),
                'eating': Common._e("Eating"),
                'exercising': Common._e("Exercising"),
                'grooming': Common._e("Grooming"),
                'having_appointment': Common._e("Appointment"),
                'inactive': Common._e("Inactive"),
                'relaxing': Common._e("Relaxing"),
                'talking': Common._e("Talking"),
                'traveling': Common._e("Traveling"),
                'working': Common._e("Working")
            };

            var can_append = !Common.exists(path);

            // Add this bubble!
            Bubble.show(path);

            if(!can_append) {
                return false;
            }

            // Generate the HTML code
            var html = '<div class="bubble removable">';

            for(var cur_activity_name in activities_obj) {
                // Yet in use: no need to display it!
                if(cur_activity_name == activity_val) {
                    continue;
                }

                html += '<a href="#" class="talk-images" data-value="' + cur_activity_name + '" title="' + activities_obj[cur_activity_name] + '"></a>';
            }

            html += '</div>';

            // Append the HTML code
            $('#my-infos .f-activity').append(html);

            // Click event
            $(path + ' a').click(function() {
                // Update the activity marker
                picker_sel.attr('data-value', $(this).attr('data-value'));

                // Close the bubble
                Bubble.close();

                // Focus on the status input
                $(document).oneTime(10, function() {
                    $('#activity-text').focus();
                });

                return false;
            });
        } catch(e) {
            Console.error('PEP._callbackActivityPicker', e);
        } finally {
            return false;
        }

    };


    /**
     * Attaches common text events
     * @private
     * @param {string} name
     * @param {object} element_text_sel
     * @param {function} send_fn
     * @return {undefined}
     */
    self._eventsCommonText = function(name, element_text_sel, send_fn) {

        try {
            // Submit events
            element_text_sel.placeholder();
            element_text_sel.keyup(function(e) {
                if(e.keyCode == 13) {
                    $(this).blur();

                    return false;
                }
            });

            // Input blur handler
            element_text_sel.blur(function() {
                // Read the parameters
                var value = $('#my-infos .f-' + name + ' a.picker').attr('data-value');
                var text = $(this).val();

                // Must send?
                if((value != DataStore.getDB(Connection.desktop_hash, name + '-value', 1)) || (text != DataStore.getDB(Connection.desktop_hash, name + '-text', 1))) {
                    // Update the local stored values
                    DataStore.setDB(Connection.desktop_hash, name + '-value', 1, value);
                    DataStore.setDB(Connection.desktop_hash, name + '-text', 1, text);

                    // Send it!
                    send_fn(value, undefined, text);
                }
            });

            // Input focus handler
            element_text_sel.focus(function() {
                Bubble.close();
            });
        } catch(e) {
            Console.error('PEP._eventsCommonText', e);
        }

    };


    /**
     * Attaches mood text events
     * @private
     * @param {object} mood_text_sel
     * @return {undefined}
     */
    self._eventsMoodText = function(mood_text_sel) {

        try {
            self._eventsCommonText(
                'mood',
                mood_text_sel,
                self.sendMood
            );
        } catch(e) {
            Console.error('PEP._eventsMoodText', e);
        }

    };


    /**
     * Attaches activity text events
     * @private
     * @param {object} activity_text_sel
     * @return {undefined}
     */
    self._eventsActivityText = function(activity_text_sel) {

        try {
            self._eventsCommonText(
                'activity',
                activity_text_sel,
                self.sendActivity
            );
        } catch(e) {
            Console.error('PEP._eventsActivityText', e);
        }

    };


    /**
     * Stores the PEP items
     * @public
     * @param {string} xid
     * @param {string} type
     * @param {string} value1
     * @param {string} value2
     * @param {string} value3
     * @param {string} value4
     * @return {undefined}
     */
    self.store = function(xid, type, value1, value2, value3, value4) {

        try {
            if(value1 || value2 || value3 || value4) {
                var xml = '<pep type="' + type + '">';

                // Generate the subnodes
                switch(type) {
                    case 'tune':
                        xml += self._generateStore({
                            'artist': value1,
                            'title': value2,
                            'album': value3,
                            'uri': value4
                        });
                        break;

                    case 'geoloc':
                        xml += self._generateStore({
                            'lat': value1,
                            'lon': value2,
                            'human': value3
                        });
                        break;

                    default:
                        xml += self._generateStore({
                            'value': value1,
                            'text': value2
                        });
                }

                // End the XML node
                xml += '</pep>';

                // Update the input with the new value
                DataStore.setDB(Connection.desktop_hash, 'pep-' + type, xid, xml);
            } else {
                DataStore.removeDB(Connection.desktop_hash, 'pep-' + type, xid);
            }

            // Display the PEP event
            self.display(xid, type);
        } catch(e) {
            Console.error('PEP.store', e);
        }

    };


    /**
     * Displays a PEP item
     * @public
     * @param {string} xid
     * @param {string} type
     * @return {undefined}
     */
    self.display = function(xid, type) {

        try {
            // Read the target input for values
            var value = $(Common.XMLFromString(
                DataStore.getDB(Connection.desktop_hash, 'pep-' + type, xid))
            );

            // If the PEP element exists
            if(type) {
                // Get the user hash
                var hash = hex_md5(xid);
                var display_args = {};

                // Parse the XML for mood and activity
                switch(type) {
                    case 'mood':
                        display_args = self._displayMood(value);
                        break;

                    case 'activity':
                        display_args = self._displayActivity(value);
                        break;

                    case 'tune':
                        display_args = self._displayTune(value);
                        break;

                    case 'geoloc':
                        display_args = self._displayGeolocation(value);
                        break;
                }

                // Append foreign PEP user values
                self._appendForeignDisplayObject(xid, hash, type, display_args);

                // PEP values of the logged in user?
                if(xid == Common.getXID()) {
                    self._appendOwnDisplayObject(type, display_args);
                }
            }
        } catch(e) {
            Console.error('PEP.display', e);
        }

    };


    /**
     * Changes the mood icon
     * @public
     * @param {string} value
     * @return {string}
     */
    self.moodIcon = function(value) {

        try {
            // The main var
            var icon;

            // Switch the values
            switch(value) {
                case 'angry':
                case 'cranky':
                case 'hot':
                case 'invincible':
                case 'mean':
                case 'restless':
                case 'serious':
                case 'strong':
                    icon = 'mood-one';
                    break;

                case 'contemplative':
                case 'happy':
                case 'playful':
                    icon = 'mood-two';
                    break;

                case 'aroused':
                case 'envious':
                case 'excited':
                case 'interested':
                case 'lucky':
                case 'proud':
                case 'relieved':
                case 'satisfied':
                case 'shy':
                    icon = 'mood-three';
                    break;

                case 'calm':
                case 'cautious':
                case 'contented':
                case 'creative':
                case 'humbled':
                case 'lonely':
                case 'undefined':
                case 'none':
                    icon = 'mood-four';
                    break;

                case 'afraid':
                case 'amazed':
                case 'confused':
                case 'dismayed':
                case 'hungry':
                case 'in_awe':
                case 'indignant':
                case 'jealous':
                case 'lost':
                case 'offended':
                case 'outraged':
                case 'shocked':
                case 'surprised':
                case 'embarrassed':
                case 'impressed':
                    icon = 'mood-five';
                    break;

                case 'crazy':
                case 'distracted':
                case 'neutral':
                case 'relaxed':
                case 'thirsty':
                    icon = 'mood-six';
                    break;

                case 'amorous':
                case 'curious':
                case 'in_love':
                case 'nervous':
                case 'sarcastic':
                    icon = 'mood-eight';
                    break;

                case 'brave':
                case 'confident':
                case 'hopeful':
                case 'grateful':
                case 'spontaneous':
                case 'thankful':
                    icon = 'mood-nine';
                    break;

                default:
                    icon = 'mood-seven';
                    break;
            }

            // Return the good icon name
            return icon;
        } catch(e) {
            Console.error('PEP.moodIcon', e);
        }

    };


    /**
     * Changes the activity icon
     * @public
     * @param {string} value
     * @return {string}
     */
    self.activityIcon = function(value) {

        try {
            // The main var
            var icon;

            // Switch the values
            switch(value) {
                case 'doing_chores':
                    icon = 'activity-doing_chores';
                    break;

                case 'drinking':
                    icon = 'activity-drinking';
                    break;

                case 'eating':
                    icon = 'activity-eating';
                    break;

                case 'grooming':
                    icon = 'activity-grooming';
                    break;

                case 'having_appointment':
                    icon = 'activity-having_appointment';
                    break;

                case 'inactive':
                    icon = 'activity-inactive';
                    break;

                case 'relaxing':
                    icon = 'activity-relaxing';
                    break;

                case 'talking':
                    icon = 'activity-talking';
                    break;

                case 'traveling':
                    icon = 'activity-traveling';
                    break;

                case 'working':
                    icon = 'activity-working';
                    break;
                default:
                    icon = 'activity-exercising';
                    break;
            }

            // Return the good icon name
            return icon;
        } catch(e) {
            Console.error('PEP.activityIcon', e);
        }

    };


    /**
     * Sends the user's mood
     * @public
     * @param {string} value
     * @param {string} text
     * @return {undefined}
     */
    self.sendMood = function(value, _, text) {

        /* REF: http://xmpp.org/extensions/xep-0107.html */

        try {
            // We propagate the mood on the xmpp network
            var iq = new JSJaCIQ();
            iq.setType('set');

            // We create the XML document
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_MOOD, 'xmlns': NS_PUBSUB}));
            var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
            var mood = item.appendChild(iq.buildNode('mood', {'xmlns': NS_MOOD}));

            if(value != 'none') {
                mood.appendChild(iq.buildNode(value, {'xmlns': NS_MOOD}));
                mood.appendChild(iq.buildNode('text', {'xmlns': NS_MOOD}, text));
            }

            // And finally we send the mood that is set
            con.send(iq);

            Console.info('New mood sent: ' + value + ' (' + text + ')');
        } catch(e) {
            Console.error('PEP.sendMood', e);
        }

    };


    /**
     * Sends the user's activity
     * @public
     * @param {string} main
     * @param {string} sub
     * @param {string} text
     * @return {undefined}
     */
    self.sendActivity = function(main, sub, text) {

        try {
            // We propagate the mood on the xmpp network
            var iq = new JSJaCIQ();
            iq.setType('set');

            // We create the XML document
            var pubsub = iq.appendNode('pubsub', {
                'xmlns': NS_PUBSUB
            });

            var publish = pubsub.appendChild(iq.buildNode('publish', {
                'node': NS_ACTIVITY,
                'xmlns': NS_PUBSUB
            }));

            var item = publish.appendChild(iq.buildNode('item', {
                'xmlns': NS_PUBSUB
            }));

            var activity = item.appendChild(iq.buildNode('activity', {
                'xmlns': NS_ACTIVITY
            }));

            if(main != 'none') {
                var mainType = activity.appendChild(iq.buildNode(main, {
                    'xmlns': NS_ACTIVITY
                }));

                // Child nodes
                if(sub) {
                    mainType.appendChild(iq.buildNode(sub, {
                        'xmlns': NS_ACTIVITY
                    }));
                }

                if(text) {
                    activity.appendChild(iq.buildNode('text', {
                        'xmlns': NS_ACTIVITY
                    }, text));
                }
            }

            // And finally we send the mood that is set
            con.send(iq);

            Console.info('New activity sent: ' + main + ' (' + text + ')');
        } catch(e) {
            Console.error('PEP.sendActivity', e);
        }

    };


    /**
     * Sends the user's geographic position
     * @public
     * @param {string} lat
     * @param {string} lon
     * @param {string} vAlt
     * @param {string} country
     * @param {string} countrycode
     * @param {string} region
     * @param {string} postalcode
     * @param {string} locality
     * @param {string} street
     * @param {string} building
     * @param {string} text
     * @param {string} uri
     * @return {undefined}
     */
    self.sendPosition = function(lat, lon, alt, country, countrycode, region, postalcode, locality, street, building, text, uri) {

        /* REF: http://xmpp.org/extensions/xep-0080.html */

        try {
            var iq = new JSJaCIQ();
            iq.setType('set');

            // Create XML nodes
            var pubsub = iq.appendNode('pubsub', {
                'xmlns': NS_PUBSUB
            });

            var publish = pubsub.appendChild(iq.buildNode('publish', {
                'node': NS_GEOLOC,
                'xmlns': NS_PUBSUB
            }));

            var item = publish.appendChild(iq.buildNode('item', {
                'xmlns': NS_PUBSUB
            }));

            var geoloc = item.appendChild(iq.buildNode('geoloc', {
                'xmlns': NS_GEOLOC
            }));

            // Position object
            var position_obj = {
                'lat': lat,
                'lon': lon,
                'alt': alt,
                'country': country,
                'countrycode': countrycode,
                'region': region,
                'postalcode': postalcode,
                'locality': locality,
                'street': street,
                'building': building,
                'text': text,
                'uri': uri,
                'timestamp': DateUtils.getXMPPTime('utc'),
                'tzo': DateUtils.getTZO()
            };

            var cur_position_val;

            for(var cur_position_type in position_obj) {
                cur_position_val = position_obj[cur_position_type];

                if(cur_position_val) {
                    geoloc.appendChild(
                        iq.buildNode(cur_position_type, {
                            'xmlns': NS_GEOLOC
                        }, cur_position_val)
                    );
                }
            }

            // And finally we send the XML
            con.send(iq);

            // For logger
            if(lat && lon) {
                Console.info('Geolocated.');
            } else {
                Console.warn('Not geolocated.');
            }
        } catch(e) {
            Console.error('PEP.sendPosition', e);
        }

    };


    /**
     * Parses the user's geographic position
     * @public
     * @param {string} data
     * @return {object}
     */
    self.parsePosition = function(data) {

        try {
            var result = $(data).find('result:first');

            // Get latitude and longitude
            var geometry_sel = result.find('geometry:first location:first');

            var lat = geometry_sel.find('lat').text();
            var lng = geometry_sel.find('lng').text();

            var addr_comp_sel = result.find('address_component');

            var array = [
                lat,
                lng,
                addr_comp_sel.filter(':has(type:contains("country")):first').find('long_name').text(),
                addr_comp_sel.filter(':has(type:contains("country")):first').find('short_name').text(),
                addr_comp_sel.filter(':has(type:contains("administrative_area_level_1")):first').find('long_name').text(),
                addr_comp_sel.filter(':has(type:contains("postal_code")):first').find('long_name').text(),
                addr_comp_sel.filter(':has(type:contains("locality")):first').find('long_name').text(),
                addr_comp_sel.filter(':has(type:contains("route")):first').find('long_name').text(),
                addr_comp_sel.filter(':has(type:contains("street_number")):first').find('long_name').text(),
                result.find('formatted_address:first').text(),
                'http://maps.google.com/?q=' + Common.encodeQuotes(lat) + ',' + Common.encodeQuotes(lng)
            ];

            return array;
        } catch(e) {
            Console.error('PEP.parsePosition', e);
        }

    };


    /**
     * Converts a position into an human-readable one
     * @public
     * @param {string} locality
     * @param {string} region
     * @param {string} country
     * @return {string}
     */
    self.humanPosition = function(locality, region, country) {

        var human_value = '';

        try {
            if(locality) {
                // Any locality
                human_value += locality;

                if(region) {
                    human_value += ', ' + region;
                }

                if(country) {
                    human_value += ', ' + country;
                }
            } else if(region) {
                // Any region
                human_value += region;

                if(country) {
                    human_value += ', ' + country;
                }
            } else if(country) {
                // Any country
                human_value += country;
            }
        } catch(e) {
            Console.error('PEP.humanPosition', e);
        } finally {
            return human_value;
        }

    };


    /**
     * Gets the user's geographic position
     * @public
     * @param {object} position
     * @return {undefined}
     */
    self.getPosition = function(position) {

        try {
            // Convert integers to strings
            var lat = '' + position.coords.latitude;
            var lon = '' + position.coords.longitude;
            var alt = '' + position.coords.altitude;

            // Get full position (from Google Maps API)
            $.get('./server/geolocation.php', {
                latitude: lat,
                longitude: lon,
                language: XML_LANG
            }, function(data) {
                // Still connected?
                if(Common.isConnected()) {
                    var results = self.parsePosition(data);

                    self.sendPosition(
                        (Utils.isNumber(lat) ? lat : null),
                        (Utils.isNumber(lon) ? lon : null),
                        (Utils.isNumber(alt) ? alt : null),
                        results[2],
                        results[3],
                        results[4],
                        results[5],
                        results[6],
                        results[7],
                        results[8],
                        results[9],
                        results[10]
                    );

                    // Store data
                    DataStore.setDB(Connection.desktop_hash, 'geolocation', 'now', Common.xmlToString(data));

                    Console.log('Position details got from Google Maps API.');
                }
            });

            Console.log('Position got: latitude > ' + lat + ' / longitude > ' + lon + ' / altitude > ' + alt);
        } catch(e) {
            Console.error('PEP.getPosition', e);
        }

    };


    /**
     * Geolocates the user
     * @public
     * @return {undefined}
     */
    self.geolocate = function() {

        try {
            // Don't fire it until options & features are not retrieved!
            if(!DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation') ||
                (DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation') == '0') ||
                !Features.enabledPEP()) {
                return;
            }

            // We publish the user location if allowed
            if(navigator.geolocation) {
                // Wait a bit... (to fix a bug)
                $('#my-infos').stopTime().oneTime('1s', function() {
                    navigator.geolocation.getCurrentPosition(self.getPosition);
                });

                Console.info('Geolocating...');
            } else {
                Console.error('Not geolocated: browser does not support it.');
            }
        } catch(e) {
            Console.error('PEP.geolocate', e);
        }

    };


    /**
     * Gets the user's geolocation to check it exists
     * @public
     * @return {undefined}
     */
    self.getInitGeoloc = function() {

        try {
            var iq = new JSJaCIQ();
            iq.setType('get');

            var pubsub = iq.appendNode('pubsub', {
                'xmlns': NS_PUBSUB
            });

            var ps_items = pubsub.appendChild(iq.buildNode('items', {
                'node': NS_GEOLOC,
                'xmlns': NS_PUBSUB
            }));

            ps_items.setAttribute('max_items', '0');

            con.send(iq, self.handleInitGeoloc);
        } catch(e) {
            Console.error('PEP.getInitGeoloc', e);
        }

    };


    /**
     * Handles the user's geolocation to create note in case of error
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleInitGeoloc = function(iq) {

        try {
            // Any error?
            if((iq.getType() == 'error') && $(iq.getNode()).find('item-not-found').size()) {
                // The node may not exist, create it!
                Pubsub.setup('', NS_GEOLOC, '1', '1', '', '', true);

                Console.warn('Error while getting geoloc, trying to reconfigure the PubSub node!');
            }
        } catch(e) {
            Console.error('PEP.handleInitGeoloc', e);
        }

    };


    /**
     * Displays all the supported PEP events for a given XID
     * @public
     * @return {undefined}
     */
    self.displayAll = function() {

        try {
            self.display(xid, 'mood');
            self.display(xid, 'activity');
            self.display(xid, 'tune');
            self.display(xid, 'geoloc');
        } catch(e) {
            Console.error('PEP.displayAll', e);
        }

    };


    /**
     * Plugin launcher
     * @public
     * @return {undefined}
     */
    self.instance = function() {

        try {
            // Apply empty values to the PEP database
            DataStore.setDB(Connection.desktop_hash, 'mood-value', 1, '');
            DataStore.setDB(Connection.desktop_hash, 'mood-text', 1, '');
            DataStore.setDB(Connection.desktop_hash, 'activity-value', 1, '');
            DataStore.setDB(Connection.desktop_hash, 'activity-text', 1, '');

            // Click event for user mood
            $('#my-infos .f-mood a.picker').click(function() {
                return PEP._callbackMoodPicker(
                    $(this)
                );
            });

            // Click event for user activity
            $('#my-infos .f-activity a.picker').click(function() {
                return PEP._callbackActivityPicker(
                    $(this)
                );
            });

            // Attach events
            self._eventsMoodText(
                $('#mood-text')
            );

            self._eventsActivityText(
                $('#activity-text')
            );
        } catch(e) {
            Console.error('PEP.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();