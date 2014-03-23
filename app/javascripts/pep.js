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
            // Handle the correct values
            if(!value1)
                value1 = '';
            if(!value2)
                value2 = '';
            if(!value3)
                value3 = '';
            if(!value4)
                value4 = '';
            
            // If one value
            if(value1 || value2 || value3 || value4) {
                // Define the XML variable
                var xml = '<pep type="' + type + '">';
                
                // Generate the correct XML
                if(type == 'tune')
                    xml += '<artist>' + value1.htmlEnc() + '</artist><title>' + value2.htmlEnc() + '</title><album>' + value3.htmlEnc() + '</album><uri>' + value4.htmlEnc() + '</uri>';
                else if(type == 'geoloc')
                    xml += '<lat>' + value1.htmlEnc() + '</lat><lon>' + value2.htmlEnc() + '</lon><human>' + value3.htmlEnc() + '</human>';
                else
                    xml += '<value>' + value1.htmlEnc() + '</value><text>' + value2.htmlEnc() + '</text>';
                
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
            var value = $(Common.XMLFromString(DataStore.getDB(Connection.desktop_hash, 'pep-' + type, xid)));
            var aLink = '';
            
            // If the PEP element exists
            if(type) {
                // Get the user hash
                var hash = hex_md5(xid);
                
                // Initialize
                var fText, fValue;
                var dText = '';

                // Initialize typed valyes
                var tLat, tLon, tHuman, tReal;
                var fArtist, fTitle, fAlbum, fURI;
                var pepValue, pepText;
                
                // Parse the XML for mood and activity
                if((type == 'mood') || (type == 'activity')) {
                    if(value) {
                        pepValue = value.find('value').text();
                        pepText = value.find('text').text();
                        
                        // No value?
                        if(!pepValue)
                            pepValue = 'none';
                        
                        // Apply the good values
                        if(type == 'mood')
                            fValue = self.moodIcon(pepValue);
                        else if(type == 'activity')
                            fValue = self.activityIcon(pepValue);
                        if(!pepText)
                            fText = Common._e("unknown");
                        else
                            fText = pepText;
                    }
                    
                    else {
                        if(type == 'mood')
                            fValue = self.moodIcon('undefined');
                        else if(type == 'activity')
                            fValue = self.activityIcon('exercising');
                        
                        fText = Common._e("unknown");
                    }
                    
                    dText = fText;
                    fText = fText.htmlEnc();
                }
                
                else if(type == 'tune') {
                    fValue = 'tune-note';
                    
                    if(value) {
                        // Parse the tune XML
                        var tArtist = value.find('artist').text();
                        var tTitle = value.find('title').text();
                        var tAlbum = value.find('album').text();
                        var tURI = value.find('uri').text();
                        
                        // Apply the good values
                        if(!tArtist && !tAlbum && !tTitle) {
                            fText = Common._e("unknown");
                            dText = fText;
                        }
                        
                        else {
                            // URI element
                            if(!tURI)
                                fURI = 'http://grooveshark.com/search?q=' + encodeURIComponent(tArtist + ' ' + tTitle + ' ' + tAlbum);
                            else
                                fURI = tURI;
                            
                            // Artist element
                            if(!tArtist)
                                fArtist = Common._e("unknown");
                            else
                                fArtist = tArtist;
                            
                            // Title element
                            if(!tTitle)
                                fTitle = Common._e("unknown");
                            else
                                fTitle = tTitle;
                            
                            // Album element
                            if(!tAlbum)
                                fAlbum = Common._e("unknown");
                            else
                                fAlbum = tAlbum;
                            
                            // Generate the link to the title
                            aLink = ' href="' + fURI + '" target="_blank"';
                            
                            // Generate the text to be displayed
                            dText = fArtist + ' - ' + fTitle + ' (' + fAlbum + ')';
                            fText =  '<a' + aLink + '>' + dText + '</a>';
                        }
                    }
                    
                    else {
                        fText = Common._e("unknown");
                        dText = fText;
                    }
                }
                
                else if(type == 'geoloc') {
                    fValue = 'location-world';
                    
                    if(value) {
                        // Parse the geoloc XML
                        tLat = value.find('lat').text();
                        tLon = value.find('lon').text();
                        tHuman = value.find('human').text();
                        tReal = tHuman;
                        
                        // No human location?
                        if(!tHuman)
                            tHuman = Common._e("See his/her position on the globe");
                        
                        // Generate the text to be displayed
                        if(tLat && tLon) {
                            aLink = ' href="http://maps.google.com/?q=' + Common.encodeQuotes(tLat) + ',' + Common.encodeQuotes(tLon) + '" target="_blank"';
                            fText = '<a' + aLink + '>' + tHuman.htmlEnc() + '</a>';
                            
                            if(tReal)
                                dText = tReal;
                            else
                                dText = tLat + '; ' + tLon;
                        }
                        
                        else {
                            fText = Common._e("unknown");
                            dText = fText;
                        }
                    }
                    
                    else {
                        fText = Common._e("unknown");
                        dText = fText;
                    }
                }
                
                // Apply the text to the buddy infos
                var this_buddy = '#roster .buddy[data-xid="' + escape(xid) + '"]';
                
                if(Common.exists(this_buddy))
                    $(this_buddy + ' .bi-' + type).replaceWith('<p class="bi-' + type + ' talk-images ' + fValue + '" title="' + Common.encodeQuotes(dText) + '">' + fText + '</p>');
                
                // Apply the text to the buddy chat
                if(Common.exists('#' + hash)) {
                    // Selector
                    var bc_pep = $('#' + hash + ' .bc-pep');
                    
                    // We remove the old PEP item
                    bc_pep.find('a.bi-' + type).remove();
                    
                    // If the new PEP item is not null, create a new one
                    if(fText != Common._e("unknown"))
                        bc_pep.prepend(
                            '<a' + aLink + ' class="bi-' + type + ' talk-images ' + fValue + '" title="' + Common.encodeQuotes(dText) + '"></a>'
                        );
                    
                    // Process the new status position
                    Presence.adaptChat(hash);
                }
                
                // If this is the PEP values of the logged in user
                if(xid == Common.getXID()) {
                    // Change the icon/value of the target element
                    if((type == 'mood') || (type == 'activity')) {
                        // Change the input value
                        var dVal = '';
                        var dAttr = pepValue;
                        
                        // Must apply default values?
                        if(pepValue == 'none') {
                            if(type == 'mood')
                                dAttr = 'happy';
                            else
                                dAttr = 'exercising';
                        }
                        
                        // No text?
                        if(dText != Common._e("unknown"))
                            dVal = dText;
                        
                        // Store this user event in our database
                        DataStore.setDB(Connection.desktop_hash, type + '-value', 1, dAttr);
                        DataStore.setDB(Connection.desktop_hash, type + '-text', 1, dVal);
                        
                        // Apply this PEP event
                        $('#my-infos .f-' + type + ' a.picker').attr('data-value', dAttr);
                        $('#my-infos .f-' + type + ' input').val(dVal);
                        $('#my-infos .f-' + type + ' input').placeholder();
                    }
                    
                    else if((type == 'tune') || (type == 'geoloc')) {
                        // Reset the values
                        $('#my-infos .f-others a.' + type).remove();
                        
                        // Not empty?
                        if(dText != Common._e("unknown")) {
                            // Specific stuffs
                            var href, title, icon_class;
                            
                            if(type == 'tune') {
                                href = fURI;
                                title = dText;
                                icon_class = 'tune-note';
                            }
                            
                            else {
                                href = 'http://maps.google.com/?q=' + Common.encodeQuotes(tLat) + ',' + Common.encodeQuotes(tLon);
                                title = Common._e("Where are you?") + ' (' + dText + ')';
                                icon_class = 'location-world';
                            }
                            
                            // Must create the container?
                            if(!Common.exists('#my-infos .f-others'))
                                $('#my-infos .content').append('<div class="element f-others"></div>');
                            
                            // Create the element
                            $('#my-infos .f-others').prepend(
                                '<a class="icon ' + type + '" href="' + Common.encodeQuotes(href) + '" target="_blank" title="' + Common.encodeQuotes(title) +  '">' + 
                                    '<span class="talk-images ' + icon_class + '"></span>' + 
                                '</a>'
                            );
                        }
                        
                        // Empty?
                        else if(!Common.exists('#my-infos .f-others a.icon'))
                            $('#my-infos .f-others').remove();
                        
                        // Process the roster height again
                        Roster.adapt();
                    }
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
    self.sendMood = function(value, text) {

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
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_ACTIVITY, 'xmlns': NS_PUBSUB}));
            var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
            var activity = item.appendChild(iq.buildNode('activity', {'xmlns': NS_ACTIVITY}));
            
            if(main != 'none') {
                var mainType = activity.appendChild(iq.buildNode(main, {'xmlns': NS_ACTIVITY}));
                
                // Child nodes
                if(sub)
                    mainType.appendChild(iq.buildNode(sub, {'xmlns': NS_ACTIVITY}));
                if(text)
                    activity.appendChild(iq.buildNode('text', {'xmlns': NS_ACTIVITY}, text));
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
     * @param {string} vLat
     * @param {string} vLon
     * @param {string} vAlt
     * @param {string} vCountry
     * @param {string} vCountrycode
     * @param {string} vRegion
     * @param {string} vPostalcode
     * @param {string} vLocality
     * @param {string} vStreet
     * @param {string} vBuilding
     * @param {string} vText
     * @param {string} vURI
     * @return {undefined}
     */
    self.sendPosition = function(vLat, vLon, vAlt, vCountry, vCountrycode, vRegion, vPostalcode, vLocality, vStreet, vBuilding, vText, vURI) {

        /* REF: http://xmpp.org/extensions/xep-0080.html */

        try {
            // We propagate the position on pubsub
            var iq = new JSJaCIQ();
            iq.setType('set');
            
            // We create the XML document
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var publish = pubsub.appendChild(iq.buildNode('publish', {'node': NS_GEOLOC, 'xmlns': NS_PUBSUB}));
            var item = publish.appendChild(iq.buildNode('item', {'xmlns': NS_PUBSUB}));
            var geoloc = item.appendChild(iq.buildNode('geoloc', {'xmlns': NS_GEOLOC}));
            
            // Create two position arrays
            var pos_names  = ['lat', 'lon', 'alt', 'country', 'countrycode', 'region', 'postalcode', 'locality', 'street', 'building', 'text', 'uri', 'timestamp'];
            var pos_values = [ vLat,  vLon,  vAlt,  vCountry,  vCountrycode,  vRegion,  vPostalcode,  vLocality,  vStreet,  vBuilding,  vText,  vURI,  DateUtils.getXMPPTime('utc')];
            
            for(var i = 0; i < pos_names.length; i++) {
                if(pos_names[i] && pos_values[i])
                    geoloc.appendChild(iq.buildNode(pos_names[i], {'xmlns': NS_GEOLOC}, pos_values[i]));
            }
            
            // And finally we send the XML
            con.send(iq);
            
            // For logger
            if(vLat && vLon) {
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
            var lat = result.find('geometry:first location:first lat').text();
            var lng = result.find('geometry:first location:first lng').text();
            
            var array = [
                         lat,
                         lng,
                         result.find('address_component:has(type:contains("country")):first long_name').text(),
                         result.find('address_component:has(type:contains("country")):first short_name').text(),
                         result.find('address_component:has(type:contains("administrative_area_level_1")):first long_name').text(),
                         result.find('address_component:has(type:contains("postal_code")):first long_name').text(),
                         result.find('address_component:has(type:contains("locality")):first long_name').text(),
                         result.find('address_component:has(type:contains("route")):first long_name').text(),
                         result.find('address_component:has(type:contains("street_number")):first long_name').text(),
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
     * @param {string} tLocality
     * @param {string} tRegion
     * @param {string} tCountry
     * @return {string}
     */
    self.humanPosition = function(tLocality, tRegion, tCountry) {

        try {
            var tHuman = '';
            
            // Any locality?
            if(tLocality) {
                tHuman += tLocality;
                
                if(tRegion)
                    tHuman += ', ' + tRegion;
                if(tCountry)
                    tHuman += ', ' + tCountry;
            }
            
            // Any region?
            else if(tRegion) {
                tHuman += tRegion;
                
                if(tCountry)
                    tHuman += ', ' + tCountry;
            }
            
            // Any country?
            else if(tCountry)
                tHuman += tCountry;
            
            return tHuman;
        } catch(e) {
            Console.error('PEP.humanPosition', e);
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
            var vLat = '' + position.coords.latitude;
            var vLon = '' + position.coords.longitude;
            var vAlt = '' + position.coords.altitude;
            
            // Get full position (from Google Maps API)
            $.get('./server/geolocation.php', {latitude: vLat, longitude: vLon, language: XML_LANG}, function(data) {
                // Parse data!
                var results = self.parsePosition(data);
                
                // Handled!
                self.sendPosition(
                             Utils.isNumber(vLat) ? vLat : null,
                             Utils.isNumber(vLon) ? vLon : null,
                             Utils.isNumber(vAlt) ? vAlt : null,
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
            });
            
            Console.log('Position got: latitude > ' + vLat + ' / longitude > ' + vLon + ' / altitude > ' + vAlt);
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
            if(!DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation') || (DataStore.getDB(Connection.desktop_hash, 'options', 'geolocation') == '0') || !Features.enabledPEP()) {
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
            
            var pubsub = iq.appendNode('pubsub', {'xmlns': NS_PUBSUB});
            var ps_items = pubsub.appendChild(iq.buildNode('items', {'node': NS_GEOLOC, 'xmlns': NS_PUBSUB}));
            
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
                // Initialize some vars
                var path = '#my-infos .f-mood div.bubble';
                var mood_id = ['crazy', 'excited', 'playful', 'happy', 'shocked', 'hot', 'sad', 'amorous', 'confident'];
                var mood_lang = [Common._e("Crazy"), Common._e("Excited"), Common._e("Playful"), Common._e("Happy"), Common._e("Shocked"), Common._e("Hot"), Common._e("Sad"), Common._e("Amorous"), Common._e("Confident")];
                var mood_val = $('#my-infos .f-mood a.picker').attr('data-value');
                
                // Yet displayed?
                var can_append = true;
                
                if(Common.exists(path))
                    can_append = false;
                
                // Add this bubble!
                Bubble.show(path);
                
                if(!can_append)
                    return false;
                
                // Generate the HTML code
                var html = '<div class="bubble removable">';
                
                for(var i in mood_id) {
                    // Yet in use: no need to display it!
                    if(mood_id[i] == mood_val)
                        continue;
                    
                    html += '<a href="#" class="talk-images" data-value="' + mood_id[i] + '" title="' + mood_lang[i] + '"></a>';
                }
                
                html += '</div>';
                
                // Append the HTML code
                $('#my-infos .f-mood').append(html);
                
                // Click event
                $(path + ' a').click(function() {
                    // Update the mood marker
                    $('#my-infos .f-mood a.picker').attr('data-value', $(this).attr('data-value'));
                    
                    // Close the bubble
                    Bubble.close();
                    
                    // Focus on the status input
                    $(document).oneTime(10, function() {
                        $('#mood-text').focus();
                    });
                    
                    return false;
                });
                
                return false;
            });
            
            // Click event for user activity
            $('#my-infos .f-activity a.picker').click(function() {
                // Initialize some vars
                var path = '#my-infos .f-activity div.bubble';
                var activity_id = ['doing_chores', 'drinking', 'eating', 'exercising', 'grooming', 'having_appointment', 'inactive', 'relaxing', 'talking', 'traveling', 'working'];
                var activity_lang = [Common._e("Chores"), Common._e("Drinking"), Common._e("Eating"), Common._e("Exercising"), Common._e("Grooming"), Common._e("Appointment"), Common._e("Inactive"), Common._e("Relaxing"), Common._e("Talking"), Common._e("Traveling"), Common._e("Working")];
                var activity_val = $('#my-infos .f-activity a.picker').attr('data-value');
                
                // Yet displayed?
                var can_append = true;
                
                if(Common.exists(path))
                    can_append = false;
                
                // Add this bubble!
                Bubble.show(path);
                
                if(!can_append)
                    return false;
                
                // Generate the HTML code
                var html = '<div class="bubble removable">';
                
                for(var i in activity_id) {
                    // Yet in use: no need to display it!
                    if(activity_id[i] == activity_val)
                        continue;
                    
                    html += '<a href="#" class="talk-images" data-value="' + activity_id[i] + '" title="' + activity_lang[i] + '"></a>';
                }
                
                html += '</div>';
                
                // Append the HTML code
                $('#my-infos .f-activity').append(html);
                
                // Click event
                $(path + ' a').click(function() {
                    // Update the activity marker
                    $('#my-infos .f-activity a.picker').attr('data-value', $(this).attr('data-value'));
                    
                    // Close the bubble
                    Bubble.close();
                    
                    // Focus on the status input
                    $(document).oneTime(10, function() {
                        $('#activity-text').focus();
                    });
                    
                    return false;
                });
                
                return false;
            });
            
            // Submit events for PEP inputs
            $('#mood-text, #activity-text').placeholder()
            
            .keyup(function(e) {
                if(e.keyCode == 13) {
                    $(this).blur();
                    
                    return false;
                }
            });
            
            // Input blur handler
            $('#mood-text').blur(function() {
                // Read the parameters
                var value = $('#my-infos .f-mood a.picker').attr('data-value');
                var text = $(this).val();
                
                // Must send the mood?
                if((value != DataStore.getDB(Connection.desktop_hash, 'mood-value', 1)) || (text != DataStore.getDB(Connection.desktop_hash, 'mood-text', 1))) {
                    // Update the local stored values
                    DataStore.setDB(Connection.desktop_hash, 'mood-value', 1, value);
                    DataStore.setDB(Connection.desktop_hash, 'mood-text', 1, text);
                    
                    // Send it!
                    self.sendMood(value, text);
                }
            })
            
            // Input focus handler
            .focus(function() {
                Bubble.close();
            });
            
            // Input blur handler
            $('#activity-text').blur(function() {
                // Read the parameters
                var value = $('#my-infos .f-activity a.picker').attr('data-value');
                var text = $(this).val();
                
                // Must send the activity?
                if((value != DataStore.getDB(Connection.desktop_hash, 'activity-value', 1)) || (text != DataStore.getDB(Connection.desktop_hash, 'activity-text', 1))) {
                    // Update the local stored values
                    DataStore.setDB(Connection.desktop_hash, 'activity-value', 1, value);
                    DataStore.setDB(Connection.desktop_hash, 'activity-text', 1, text);
                    
                    // Send it!
                    self.sendActivity(value, '', text);
                }
            })
            
            // Input focus handler
            .focus(function() {
                Bubble.close();
            });
        } catch(e) {
            Console.error('PEP.instance', e);
        }

    };


    /**
     * Return class scope
     */
    return self;

})();