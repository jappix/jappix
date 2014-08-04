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


    /* Constants */
    self.disco_infos = {
        'identity': {
            'category': 'client',
            'type': 'web',
            'name': 'Jappix'
        },

        'items': [
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
            NS_URN_CARBONS,
            NS_URN_CORRECT,
            NS_URN_MARKERS,
            NS_URN_IDLE,
            NS_URN_ATTENTION,
            NS_URN_REACH,
            NS_URN_HINTS
        ]
    };


    /**
     * Parse identities from disco infos query response
     * @private
     * @param {object} query
     * @return {object}
     */
    self._parseDiscoIdentities = function(query) {

        var identities = [];

        try {
            var cur_category, cur_type, cur_lang, cur_name;

            $(query).find('identity').each(function() {
                cur_category = $(this).attr('category') || '';
                cur_type = $(this).attr('type') || '';
                cur_lang = $(this).attr('xml:lang') || '';
                cur_name = $(this).attr('name') || '';

                identities.push(cur_category + '/' + cur_type + '/' + cur_lang + '/' + cur_name);
            });
        } catch(e) {
            Console.error('Caps._parseDiscoIdentities', e);
        } finally {
            return identities;
        }

    };


    /**
     * Parse features from disco infos query response
     * @private
     * @param {object} query
     * @return {object}
     */
    self._parseDiscoFeatures = function(query) {

        var features = [];

        try {
            var cur_var;

            $(query).find('feature').each(function() {
                cur_var = $(this).attr('var');

                // Add the current value to the array
                if(cur_var) {
                    features.push(cur_var);
                }
            });
        } catch(e) {
            Console.error('Caps._parseDiscoFatures', e);
        } finally {
            return features;
        }

    };


    /**
     * Parse data form from disco infos query response
     * @private
     * @param {object} query
     * @return {object}
     */
    self._parseDiscoDataForms = function(query) {

        var data_forms = [];

        try {
            var cur_string, cur_sort_var,
                cur_text, cur_var, cur_sort_val;

            $(query).find('x[xmlns="' + NS_XDATA + '"]').each(function() {
                // Initialize some stuffs
                cur_string = '';
                cur_sort_var = [];

                // Add the form type field
                $(this).find('field[var="FORM_TYPE"] value').each(function() {
                    cur_text = $(this).text();

                    if(cur_text) {
                        cur_string += cur_text + '<';
                    }
                });

                // Add the var attributes into an array
                $(this).find('field:not([var="FORM_TYPE"])').each(function() {
                    cur_var = $(this).attr('var');

                    if(cur_var) {
                        cur_sort_var.push(cur_var);
                    }
                });

                // Sort the var attributes
                cur_sort_var = cur_sort_var.sort();

                // Loop this sorted var attributes
                $.each(cur_sort_var, function(i) {
                    // Initialize the value sorting
                    cur_sort_val = [];

                    // Append it to the string
                    cur_string += cur_sort_var[i] + '<';

                    // Add each value to the array
                    $(this).find('field[var=' + cur_sort_var[i] + '] value').each(function() {
                        cur_sort_val.push($(this).text());
                    });

                    // Sort the values
                    cur_sort_val = cur_sort_val.sort();

                    // Append the values to the string
                    for(var j in cur_sort_val) {
                        cur_string += cur_sort_val[j] + '<';
                    }
                });

                // Any string?
                if(cur_string) {
                    // Remove the undesired double '<' from the string
                    if(cur_string.match(/(.+)(<)+$/)) {
                        cur_string = cur_string.substring(0, cur_string.length - 1);
                    }

                    // Add the current string to the array
                    data_forms.push(cur_string);
                }
            });
        } catch(e) {
            Console.error('Caps._parseDiscoDataForms', e);
        } finally {
            return data_forms;
        }

    };


    /**
     * Apply XHTML-IM features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} style_sel
     * @param {object} message_area_sel
     * @return {undefined}
     */
    self._applyDiscoXHTMLIM = function(xid, features, style_sel, message_area_sel) {

        try {
            // Apply
            if(NS_XHTML_IM in features) {
                style_sel.show();
            } else {
                // Remove the tooltip elements
                style_sel.hide();
                style_sel.find('.bubble-style').remove();

                // Reset the markers
                message_area_sel.removeAttr('style')
                                .removeAttr('data-font')
                                .removeAttr('data-fontsize')
                                .removeAttr('data-color')
                                .removeAttr('data-bold')
                                .removeAttr('data-italic')
                                .removeAttr('data-underline');
            }

        } catch(e) {
            Console.error('Caps._applyDiscoXHTMLIM', e);
        }

    };


    /**
     * Apply Jingle features from disco infos
     * @private
     * @param {string} xid
     * @param {object} path_sel
     * @param {object} roster_sel
     * @return {undefined}
     */
    self._applyDiscoJingle = function(xid, path_sel, roster_sel) {

        try {
            // Selectors
            var roster_jingle_sel = roster_sel.find('.buddy-infos .call-jingle');
            var jingle_audio = path_sel.find('.tools-jingle-audio');
            var roster_jingle_audio = roster_jingle_sel.find('a.audio');
            var jingle_video = path_sel.find('.tools-jingle-video');
            var roster_jingle_video = roster_jingle_sel.find('a.video');
            var roster_jingle_separator = roster_jingle_sel.find('span.separator');

            // Apply
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
                roster_jingle_sel.show();
            } else {
                roster_jingle_sel.hide();
            }
        } catch(e) {
            Console.error('Caps._applyDiscoJingle', e);
        }

    };


    /**
     * Apply Out of Band Data features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} file_sel
     * @return {undefined}
     */
    self._applyDiscoOOB = function(xid, features, file_sel) {

        try {
            // Apply
            var iq_oob_xid = self.getFeatureResource(xid, NS_IQOOB);

            if(iq_oob_xid || NS_XOOB in features) {
                file_sel.show();

                // Set a marker
                file_sel.attr(
                    'data-oob',
                    iq_oob_xid ? 'iq' : 'x'
                );
            } else {
                // Remove the tooltip elements
                file_sel.hide();
                file_sel.find('.bubble-style').remove();

                // Reset the marker
                file_sel.removeAttr('data-oob');
            }
        } catch(e) {
            Console.error('Caps._applyDiscoOOB', e);
        }

    };


    /**
     * Apply Receipts features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} message_area_sel
     * @return {undefined}
     */
    self._applyDiscoReceipts = function(xid, features, message_area_sel) {

        try {
            // Apply
            if(NS_URN_RECEIPTS in features) {
                message_area_sel.attr('data-receipts', 'true');
            } else {
                message_area_sel.removeAttr('data-receipts');
            }
        } catch(e) {
            Console.error('Caps._applyDiscoReceipts', e);
        }

    };


    /**
     * Apply Last Message Correction features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} path_sel
     * @return {undefined}
     */
    self._applyDiscoCorrection = function(xid, features, path_sel) {

        try {
            // Apply
            if(NS_URN_CORRECT in features) {
                path_sel.attr('data-correction', 'true');
            } else {
                path_sel.removeAttr('data-correction');
            }
        } catch(e) {
            Console.error('Caps._applyDiscoCorrection', e);
        }

    };


    /**
     * Apply Chat Markers features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} path_sel
     * @return {undefined}
     */
    self._applyDiscoMarkers = function(xid, features, path_sel) {

        try {
            // Apply
            if(NS_URN_MARKERS in features) {
                path_sel.attr('data-markers', 'true');
            } else {
                path_sel.removeAttr('data-markers');
            }
        } catch(e) {
            Console.error('Caps._applyDiscoMarkers', e);
        }

    };


    /**
     * Apply Attention features from disco infos
     * @private
     * @param {string} xid
     * @param {object} features
     * @param {object} path_sel
     * @return {undefined}
     */
    self._applyDiscoAttention = function(xid, features, path_sel) {

        try {
            // Apply
            if(NS_URN_ATTENTION in features) {
                path_sel.attr('data-attention', 'true');
            } else {
                path_sel.removeAttr('data-attention');
            }
        } catch(e) {
            Console.error('Caps._applyDiscoAttention', e);
        }

    };


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
            var disco_base = self.disco_infos.items;

            var disco_jingle = JSJaCJingle.disco();
            var disco_all = disco_base.concat(disco_jingle);

            return Utils.uniqueArrayValues(disco_all);
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
            if(!iq || (iq.getType() == 'error')) {
                return;
            }

            var from = Common.fullXID(Common.getStanzaFrom(iq));
            var query = iq.getQuery();

            // Parse values
            var identities = self._parseDiscoIdentities(query);
            var features = self._parseDiscoFeatures(query);
            var data_forms = self._parseDiscoDataForms(query);

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
            if(Utils.isPrivate(xid)) {
                xid = from;
            }

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
            var path_sel = $('#' + hash);
            var roster_sel = $('#roster .buddy.' + hash);
            var message_area_sel = path_sel.find('.message-area');
            var style_sel = path_sel.find('.chat-tools-style');
            var file_sel = path_sel.find('.chat-tools-file');

            // Apply Features
            self._applyDiscoXHTMLIM(xid, features, style_sel, message_area_sel);
            self._applyDiscoJingle(xid, path_sel, roster_sel);
            self._applyDiscoOOB(xid, features, file_sel);
            self._applyDiscoReceipts(xid, features, message_area_sel);
            self._applyDiscoCorrection(xid, features, path_sel);
            self._applyDiscoMarkers(xid, features, path_sel);
            self._applyDiscoAttention(xid, features, path_sel);
        } catch(e) {
            Console.error('Caps.displayDiscoInfos', e);
        }

    };


    /**
     * Generates the CAPS hash
     * @public
     * @param {object} identities
     * @param {object} features
     * @param {object} dataforms
     * @return {string}
     */
    self.process = function(identities, features, dataforms) {

        try {
            // Initialize
            var caps_str = '';

            // Sort the arrays
            identities = identities.sort();
            features = features.sort();
            dataforms = dataforms.sort();

            // Process the sorted identity string
            for(var a in identities) {
                caps_str += identities[a] + '<';
            }

            // Process the sorted feature string
            for(var b in features) {
                caps_str += features[b] + '<';
            }

            // Process the sorted data-form string
            for(var c in dataforms) {
                caps_str += dataforms[c] + '<';
            }

            // Process the SHA-1 hash
            var cHash = b64_sha1(caps_str);

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
                [
                    self.disco_infos.identity.category + '/' +
                    self.disco_infos.identity.type     + '//' +
                    self.disco_infos.identity.name
                ],

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

            var resources_obj = Presence.resources(xid);
            var fn_parse_resource = function(cur_resource) {
                cur_xid_full = xid;

                if(cur_resource) {
                    cur_xid_full += '/' + cur_resource;
                }

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
            };

            if(resources_obj.bare === 1) {
                fn_parse_resource(null);
            }

            for(var cur_resource in resources_obj.list) {
                fn_parse_resource(cur_resource);
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
