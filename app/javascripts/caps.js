/*

Jappix - An open social platform
These are the CAPS JS script for Jappix

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Bundle
var Caps = (function () {

    /**
     * Alias of this
     * @private
     */
    var self = {};


    /**
     * Reads a stored Caps
     * @public
     * @param {string} caps
     * @return {object}
     */
    self.read = function(caps) {

        try {
            return Common.XMLFromString(
                DataStore.getPersistent('global', 'caps', caps)
            );
        } catch(e) {
            Console.error('Caps.read', e);
        }

    };


    /**
     * Returns an array of the Jappix disco#infos
     * @public
     * @return {object}
     */
    self.myDiscoInfos = function() {

        try {
            var disco_base = [
                NS_MUC,
                NS_MUC_USER,
                NS_MUC_ADMIN,
                NS_MUC_OWNER,
                NS_MUC_CONFIG,
                NS_DISCO_INFO,
                NS_DISCO_ITEMS,
                NS_PUBSUB_RI,
                NS_BOSH,
                NS_CAPS,
                NS_MOOD,
                NS_ACTIVITY,
                NS_TUNE,
                NS_GEOLOC,
                NS_NICK,
                NS_URN_MBLOG,
                NS_URN_INBOX,
                NS_MOOD + NS_NOTIFY,
                NS_ACTIVITY + NS_NOTIFY,
                NS_TUNE + NS_NOTIFY,
                NS_GEOLOC + NS_NOTIFY,
                NS_URN_MBLOG + NS_NOTIFY,
                NS_URN_INBOX + NS_NOTIFY,
                NS_URN_DELAY,
                NS_ROSTER,
                NS_ROSTERX,
                NS_HTTP_AUTH,
                NS_CHATSTATES,
                NS_XHTML_IM,
                NS_URN_MAM,
                NS_IPV6,
                NS_LAST,
                NS_PRIVATE,
                NS_REGISTER,
                NS_SEARCH,
                NS_COMMANDS,
                NS_VERSION,
                NS_XDATA,
                NS_VCARD,
                NS_IETF_VCARD4,
                NS_URN_ADATA,
                NS_URN_AMETA,
                NS_URN_TIME,
                NS_URN_PING,
                NS_URN_RECEIPTS,
                NS_PRIVACY,
                NS_IQOOB,
                NS_XOOB,
                NS_URN_CARBONS
            ];

            var disco_jingle = JSJaCJingle_disco();
            var disco_all = disco_base.concat(disco_jingle);
            
            return disco_all;
        } catch(e) {
            Console.error('Caps.myDiscoInfos', e);
        }

    };


    /**
     * Gets the disco#infos of an entity
     * @public
     * @param {string} to
     * @param {string} caps
     * @return {boolean}
     */
    self.getDiscoInfos = function(to, caps) {

        try {
            // No CAPS
            if(!caps) {
                Console.warn('No CAPS: ' + to);
                
                self.displayDiscoInfos(to, '');
                
                return false;
            }
            
            // Get the stored disco infos
            var xml = self.read(caps);
            
            // Yet stored
            if(xml) {
                Console.info('CAPS from cache: ' + to);
                
                self.displayDiscoInfos(to, xml);
                
                return true;
            }
            
            Console.info('CAPS from the network: ' + to);
            
            // Not stored: get the disco#infos
            var iq = new JSJaCIQ();
            
            iq.setTo(to);
            iq.setType('get');
            iq.setQuery(NS_DISCO_INFO);
            
            con.send(iq, self.handleDiscoInfos);
            
            return true;
        } catch(e) {
            Console.error('Caps.getDiscoInfos', e);
        }

    };


    /**
     * Handles the disco#infos of an entity
     * @public
     * @param {object} iq
     * @return {undefined}
     */
    self.handleDiscoInfos = function(iq) {

        try {
            if(!iq || (iq.getType() == 'error'))
                return;
            
            // IQ received, get some values
            var from = Common.fullXID(Common.getStanzaFrom(iq));
            var query = iq.getQuery();
            
            // Generate the CAPS-processing values
            var identities = [];
            var features = [];
            var data_forms = [];
            
            // Identity values
            $(query).find('identity').each(function() {
                var pCategory = $(this).attr('category');
                var pType = $(this).attr('type');
                var pLang = $(this).attr('xml:lang');
                var pName = $(this).attr('name');
                
                if(!pCategory)
                    pCategory = '';
                if(!pType)
                    pType = '';
                if(!pLang)
                    pLang = '';
                if(!pName)
                    pName = '';
                
                identities.push(pCategory + '/' + pType + '/' + pLang + '/' + pName);
            });
            
            // Feature values
            $(query).find('feature').each(function() {
                var pVar = $(this).attr('var');
                
                // Add the current value to the array
                if(pVar)
                    features.push(pVar);
            });
            
            // Data-form values
            $(query).find('x[xmlns="' + NS_XDATA + '"]').each(function() {
                // Initialize some stuffs
                var pString = '';
                var sortVar = [];
                
                // Add the form type field
                $(this).find('field[var="FORM_TYPE"] value').each(function() {
                    var cText = $(this).text();
                    
                    if(cText)
                        pString += cText + '<';
                });
                
                // Add the var attributes into an array
                $(this).find('field:not([var="FORM_TYPE"])').each(function() {
                    var cVar = $(this).attr('var');
                    
                    if(cVar)
                        sortVar.push(cVar);
                });
                
                // Sort the var attributes
                sortVar = sortVar.sort();
                
                // Loop this sorted var attributes
                $.each(sortVar, function(i) {
                    // Initialize the value sorting
                    var sortVal = [];
                    
                    // Append it to the string
                    pString += sortVar[i] + '<';
                    
                    // Add each value to the array
                    $(this).find('field[var=' + sortVar[i] + '] value').each(function() {
                        sortVal.push($(this).text());
                    });
                    
                    // Sort the values
                    sortVal = sortVal.sort();
                    
                    // Append the values to the string
                    for(var j in sortVal) {
                        pString += sortVal[j] + '<';
                    }
                });
                
                // Any string?
                if(pString) {
                    // Remove the undesired double '<' from the string
                    if(pString.match(/(.+)(<)+$/))
                        pString = pString.substring(0, pString.length - 1);
                    
                    // Add the current string to the array
                    data_forms.push(pString);
                }
            });
            
            // Process the CAPS
            var caps = self.process(identities, features, data_forms);
            
            // Get the XML string
            var xml = Common.xmlToString(query);
            
            // Store the disco infos
            DataStore.setPersistent('global', 'caps', caps, xml);
            
            // This is our server
            if(from == Utils.getServer()) {
                // Handle the features
                Features.handle(xml);
                
                Console.info('Got our server CAPS');
            } else {
                // Display the disco infos
                self.displayDiscoInfos(from, xml);
                
                Console.info('Got CAPS: ' + from);
            }
        } catch(e) {
            Console.error('Caps.handleDiscoInfos', e);
        }

    };


    /**
     * Displays the disco#infos everywhere needed for an entity
     * @public
     * @param {string} from
     * @param {string} xml
     * @return {undefined}
     */
    self.displayDiscoInfos = function(from, xml) {

        try {
            // Generate the chat path
            var xid = Common.bareXID(from);
            
            // This comes from a private groupchat chat?
            if(Utils.isPrivate(xid))
                xid = from;
            
            hash = hex_md5(xid);

            // Display the supported features
            var features = {};

            $(xml).find('feature').each(function() {
                var current = $(this).attr('var');

                if(current) {
                    features[current] = 1;
                }
            });
            
            // Paths
            var path = $('#' + hash);
            var roster_path = $('#roster .buddy.' + hash);
            var roster_jingle_path = roster_path.find('.buddy-infos .call-jingle');

            var message_area = path.find('.message-area');
            var style = path.find('.chat-tools-style');
            var jingle_audio = path.find('.tools-jingle-audio');
            var roster_jingle_audio = roster_jingle_path.find('a.audio');
            var jingle_video = path.find('.tools-jingle-video');
            var roster_jingle_video = roster_jingle_path.find('a.video');
            var roster_jingle_separator = roster_jingle_path.find('span.separator');
            var file = path.find('.chat-tools-file');
            
            // Apply xHTML-IM
            if(NS_XHTML_IM in features) {
                style.show();
            } else {
                // Remove the tooltip elements
                style.hide();
                style.find('.bubble-style').remove();
                
                // Reset the markers
                message_area.removeAttr('style')
                        .removeAttr('data-font')
                        .removeAttr('data-fontsize')
                        .removeAttr('data-color')
                        .removeAttr('data-bold')
                        .removeAttr('data-italic')
                        .removeAttr('data-underline');
            }

            // Apply Jingle
            var jingle_local_supported = JSJAC_JINGLE_AVAILABLE;
            var jingle_audio_xid = self.getFeatureResource(xid, NS_JINGLE_APPS_RTP_AUDIO);
            var jingle_video_xid = self.getFeatureResource(xid, NS_JINGLE_APPS_RTP_VIDEO);

            if(jingle_audio_xid && jingle_local_supported) {
                jingle_audio.show();
                roster_jingle_audio.show();
            } else {
                jingle_audio.hide();
                roster_jingle_audio.hide();
            }

            if(jingle_video_xid && jingle_local_supported) {
                jingle_video.show();
                roster_jingle_video.show();
            } else {
                jingle_video.hide();
                roster_jingle_video.hide();
            }

            if(jingle_audio_xid && jingle_video_xid && jingle_local_supported) {
                roster_jingle_separator.show();
            } else {
                roster_jingle_separator.hide();
            }

            if((jingle_audio_xid || jingle_video_xid) && jingle_local_supported) {
                roster_jingle_path.show();
            } else {
                roster_jingle_path.hide();
            }
            
            // Apply Out of Band Data
            var iq_oob_xid = self.getFeatureResource(xid, NS_IQOOB);

            if(iq_oob_xid || NS_XOOB in features) {
                file.show();
                
                // Set a marker
                file.attr(
                    'data-oob',
                    iq_oob_xid ? 'iq' : 'x'
                );
            } else {
                // Remove the tooltip elements
                file.hide();
                file.find('.bubble-style').remove();
                
                // Reset the marker
                file.removeAttr('data-oob');
            }
            
            // Apply receipts
            if(NS_URN_RECEIPTS in features) {
                message_area.attr('data-receipts', 'true');
            } else {
                message_area.removeAttr('data-receipts');
            }
        } catch(e) {
            Console.error('Caps.displayDiscoInfos', e);
        }

    };


    /**
     * Generates the CAPS hash
     * @public
     * @param {object} cIdentities
     * @param {object} cFeatures
     * @param {object} cDataForms
     * @return {string}
     */
    self.process = function(cIdentities, cFeatures, cDataForms) {

        try {
            // Initialize
            var cString = '';
            
            // Sort the arrays
            cIdentities = cIdentities.sort();
            cFeatures = cFeatures.sort();
            cDataForms = cDataForms.sort();
            
            // Process the sorted identity string
            for(var a in cIdentities) {
                cString += cIdentities[a] + '<';
            }
            
            // Process the sorted feature string
            for(var b in cFeatures) {
                cString += cFeatures[b] + '<';
            }
            
            // Process the sorted data-form string
            for(var c in cDataForms) {
                cString += cDataForms[c] + '<';
            }
            
            // Process the SHA-1 hash
            var cHash = b64_sha1(cString);
            
            return cHash;
        } catch(e) {
            Console.error('Caps.process', e);
        }

    };


    /**
     * Generates the Jappix CAPS hash
     * @public
     * @return {string}
     */
    self.mine = function() {

        try {
            return self.process(
                ['client/web//Jappix'],
                self.myDiscoInfos(),
                []
            );
        } catch(e) {
            Console.error('Caps.mine', e);
        }

    };


    /**
     * Returns the user resource supporting given feature w/ highest priority
     * @public
     * @param {string} xid
     * @param {string} feature_ns
     * @return {string}
     */
    self.getFeatureResource = function(xid, feature_ns) {

        var selected_xid = null;

        try {
            if(!feature_ns) {
                throw 'No feature namespace given!';
            }

            var max_priority = null;
            var cur_xid_full, cur_presence_sel, cur_caps, cur_features, cur_priority;

            for(var cur_resource in Presence.resources(xid)) {
                cur_xid_full = xid + '/' + cur_resource;
                cur_presence_sel = $(Presence.readStanza(cur_xid_full));

                cur_priority = parseInt((cur_presence_sel.find('priority').text() || 0), 10);
                cur_caps = cur_presence_sel.find('caps').text();

                if(cur_caps) {
                    cur_features = self.read(cur_caps);

                    if(cur_features && $(cur_features).find('feature[var="' + feature_ns + '"]').size()  &&
                       (cur_priority >= max_priority || max_priority === null)) {
                        max_priority = cur_priority;
                        selected_xid = cur_xid_full;
                    }
                }
            }
        } catch(e) {
            Console.error('Caps.getFeatureResource', e);
        } finally {
            return selected_xid;
        }

    };


    /**
     * Return class scope
     */
    return self;

})();