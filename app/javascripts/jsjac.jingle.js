/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * Written originally for Uno.im service requirements
 *
 * @version v0.7 (dev)
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou http://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Implements:
 *
 * See the PROTOCOL.md file for a list of supported protocol extensions
 *
 *
 * Workflow:
 *
 * This negotiation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */


/**
 * JINGLE WEBRTC
 */

var WEBRTC_GET_MEDIA           = ( navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         ||
                                   navigator.getUserMedia           );

var WEBRTC_PEER_CONNECTION     = ( window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      ||
                                   window.RTCPeerConnection         );

var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        url: 'stun:stun.jappix.com'
      }]
    },

    constraints   : {
      optional : [{
        'DtlsSrtpKeyAgreement': true
      }]
    }
  },

  create_offer    : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  },

  create_answer   : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  }
};

var WEBRTC_SDP_LINE_BREAK      = '\r\n';
var WEBRTC_SDP_TYPE_OFFER      = 'offer';
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

var R_WEBRTC_SDP_ICE_CANDIDATE = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap          : /^a=rtpmap:(\d+) (([^\s\/]+)\/(\d+)(\/([^\s\/]+))?)?/i,
  fmtp            : /^a=fmtp:(\d+) (.+)/i,
  group           : /^a=group:(\S+) (.+)/,
  rtcp_fb         : /^a=rtcp-fb:(\S+) (\S+)( (\S+))?/i,
  rtcp_fb_trr_int : /^a=rtcp-fb:(\d+) trr-int (\d+)/i,
  pwd             : /^a=ice-pwd:(\S+)/i,
  ufrag           : /^a=ice-ufrag:(\S+)/i,
  ptime           : /^a=ptime:(\d+)/i,
  maxptime        : /^a=maxptime:(\d+)/i,
  ssrc            : /^a=ssrc:(\d+) (\w+)(:(\S+))?( (\S+))?/i,
  rtcp_mux        : /^a=rtcp-mux/i,
  crypto          : /^a=crypto:(\d{1,9}) (\S+) (\S+)( (\S+))?/i,
  zrtp_hash       : /^a=zrtp-hash:(\S+) (\S+)/i,
  fingerprint     : /^a=fingerprint:(\S+) (\S+)/i,
  setup           : /^a=setup:(\S+)/i,
  extmap          : /^a=extmap:([^\s\/]+)(\/([^\s\/]+))? (\S+)/i,
  bandwidth       : /^b=(\w+):(\d+)/i,
  media           : /^m=(audio|video|application|data) /i
};



/**
 * JINGLE NAMESPACES
 */

var NS_JINGLE                                       = 'urn:xmpp:jingle:1';
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

var MAP_DISCO_JINGLE                                = [
  /* http://xmpp.org/extensions/xep-0166.html#support */
  /* http://xmpp.org/extensions/xep-0167.html#support */
  NS_JINGLE,
  NS_JINGLE_APPS_RTP,
  NS_JINGLE_APPS_RTP_AUDIO,
  NS_JINGLE_APPS_RTP_VIDEO,

  /* http://xmpp.org/extensions/xep-0176.html#support */
  NS_JINGLE_TRANSPORTS_ICEUDP,
  NS_IETF_RFC_3264,

  /* http://xmpp.org/extensions/xep-0339.html#disco */
  NS_IETF_RFC_5576,

  /* http://xmpp.org/extensions/xep-0338.html#disco */
  NS_IETF_RFC_5888,

  /* http://xmpp.org/extensions/xep-0293.html#determining-support */
  NS_JINGLE_APPS_RTP_RTCP_FB,

  /* http://xmpp.org/extensions/xep-0294.html#determining-support */
  NS_JINGLE_APPS_RTP_RTP_HDREXT,

  /* http://xmpp.org/extensions/xep-0320.html#disco */
  NS_JINGLE_APPS_DTLS,

  /* http://xmpp.org/extensions/xep-0262.html */
  NS_JINGLE_APPS_RTP_ZRTP,

  /* http://xmpp.org/extensions/xep-0215.html */
  NS_EXTDISCO
];



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

var JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT                = 15;
var JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT             = 5;
var JSJAC_JINGLE_STANZA_TIMEOUT                      = 10;
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj';

var JSJAC_JINGLE_NETWORK                             = '0';
var JSJAC_JINGLE_GENERATION                          = '0';

var JSJAC_JINGLE_BROWSER_FIREFOX                     = 'Firefox';
var JSJAC_JINGLE_BROWSER_CHROME                      = 'Chrome';
var JSJAC_JINGLE_BROWSER_SAFARI                      = 'Safari';
var JSJAC_JINGLE_BROWSER_OPERA                       = 'Opera';
var JSJAC_JINGLE_BROWSER_IE                          = 'IE';

var JSJAC_JINGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };
var JSJAC_JINGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };
var JSJAC_JINGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };
var JSJAC_JINGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

var JSJAC_JINGLE_CREATOR_INITIATOR                   = 'initiator';
var JSJAC_JINGLE_CREATOR_RESPONDER                   = 'responder';

var JSJAC_JINGLE_STATUS_INACTIVE                     = 'inactive';
var JSJAC_JINGLE_STATUS_INITIATING                   = 'initiating';
var JSJAC_JINGLE_STATUS_INITIATED                    = 'initiated';
var JSJAC_JINGLE_STATUS_ACCEPTING                    = 'accepting';
var JSJAC_JINGLE_STATUS_ACCEPTED                     = 'accepted';
var JSJAC_JINGLE_STATUS_TERMINATING                  = 'terminating';
var JSJAC_JINGLE_STATUS_TERMINATED                   = 'terminated';

var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';
var JSJAC_JINGLE_ACTION_CONTENT_ADD                  = 'content-add';
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY               = 'content-modify';
var JSJAC_JINGLE_ACTION_CONTENT_REJECT               = 'content-reject';
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE               = 'content-remove';
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO             = 'description-info';
var JSJAC_JINGLE_ACTION_SECURITY_INFO                = 'security-info';
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT               = 'session-accept';
var JSJAC_JINGLE_ACTION_SESSION_INFO                 = 'session-info';
var JSJAC_JINGLE_ACTION_SESSION_INITIATE             = 'session-initiate';
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO               = 'transport-info';
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

var JSJAC_JINGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };
var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };

var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';
var JSJAC_JINGLE_REASON_BUSY                         = 'busy';
var JSJAC_JINGLE_REASON_CANCEL                       = 'cancel';
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';
var JSJAC_JINGLE_REASON_DECLINE                      = 'decline';
var JSJAC_JINGLE_REASON_EXPIRED                      = 'expired';
var JSJAC_JINGLE_REASON_FAILED_APPLICATION           = 'failed-application';
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';
var JSJAC_JINGLE_REASON_GENERAL_ERROR                = 'general-error';
var JSJAC_JINGLE_REASON_GONE                         = 'gone';
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';
var JSJAC_JINGLE_REASON_MEDIA_ERROR                  = 'media-error';
var JSJAC_JINGLE_REASON_SECURITY_ERROR               = 'security-error';
var JSJAC_JINGLE_REASON_SUCCESS                      = 'success';
var JSJAC_JINGLE_REASON_TIMEOUT                      = 'timeout';
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

var JSJAC_JINGLE_SESSION_INFO_ACTIVE                 = 'active';
var JSJAC_JINGLE_SESSION_INFO_HOLD                   = 'hold';
var JSJAC_JINGLE_SESSION_INFO_MUTE                   = 'mute';
var JSJAC_JINGLE_SESSION_INFO_RINGING                = 'ringing';
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                 = 'unhold';
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                 = 'unmute';

var JSJAC_JINGLE_MEDIA_AUDIO                         = 'audio';
var JSJAC_JINGLE_MEDIA_VIDEO                         = 'video';

var JSJAC_JINGLE_VIDEO_SOURCE_CAMERA                 = 'camera';
var JSJAC_JINGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

var JSJAC_JINGLE_STANZA_TYPE_ALL                     = 'all';
var JSJAC_JINGLE_STANZA_TYPE_RESULT                  = 'result';
var JSJAC_JINGLE_STANZA_TYPE_SET                     = 'set';
var JSJAC_JINGLE_STANZA_TYPE_GET                     = 'get';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_BROWSERS                           = {};
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_FIREFOX] = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_CHROME]  = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_SAFARI]  = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_OPERA]   = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_IE]      = 1;

var JSJAC_JINGLE_SENDERS            = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]           = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]           = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

var JSJAC_JINGLE_CREATORS           = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                 = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                 = 1;

var JSJAC_JINGLE_STATUSES           = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                 = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                  = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                  = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                 = 1;

var JSJAC_JINGLE_ACTIONS            = {};
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ACCEPT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ADD]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_MODIFY]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REJECT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REMOVE]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_DESCRIPTION_INFO]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SECURITY_INFO]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_ACCEPT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INFO]                = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INITIATE]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_TERMINATE]           = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_INFO]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REJECT]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE]           = 1;

var JSJAC_JINGLE_ERRORS             = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_ORDER.jingle]           = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]              = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]        = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]       = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]      = 1;

var XMPP_ERRORS                     = {};
XMPP_ERRORS[XMPP_ERROR_UNEXPECTED_REQUEST.xmpp]                       = 1;
XMPP_ERRORS[XMPP_ERROR_CONFLICT.xmpp]                                 = 1;
XMPP_ERRORS[XMPP_ERROR_ITEM_NOT_FOUND.xmpp]                           = 1;
XMPP_ERRORS[XMPP_ERROR_NOT_ACCEPTABLE.xmpp]                           = 1;
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                  = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                      = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                 = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                      = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                              = 1;

var JSJAC_JINGLE_REASONS            = {};
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION]         = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_BUSY]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CANCEL]                      = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR]          = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_DECLINE]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_EXPIRED]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_APPLICATION]          = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_TRANSPORT]            = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GENERAL_ERROR]               = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GONE]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS]     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_MEDIA_ERROR]                 = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SECURITY_ERROR]              = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SUCCESS]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_TIMEOUT]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS]    = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS]      = 1;

var JSJAC_JINGLE_SESSION_INFOS      = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]         = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]          = 1;

var JSJAC_JINGLE_MEDIAS             = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                         = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                         = { label: '1' };

var JSJAC_JINGLE_VIDEO_SOURCES      = {};
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_CAMERA]          = 1;
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_SCREEN]          = 1;

var JSJAC_JINGLE_STANZAS            = {};
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_ALL]                    = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_RESULT]                 = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_SET]                    = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_GET]                    = 1;



/**
 * JSJAC JINGLE STORAGE
 */

var JSJAC_JINGLE_STORE_CONNECTION = null;
var JSJAC_JINGLE_STORE_SESSIONS   = {};
var JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {};

var JSJAC_JINGLE_STORE_DEBUG      = {
  log : function() {}
};

var JSJAC_JINGLE_STORE_EXTDISCO   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_FALLBACK   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_DEFER      = {
  deferred : false,
  count    : 0,
  fn       : []
};

var R_JSJAC_JINGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;



/**
 * JSJSAC JINGLE METHODS
 */

/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {function} args.session_initiate_pending The initiate pending custom handler.
 * @param {function} args.session_initiate_success The initiate success custom handler.
 * @param {function} args.session_initiate_error The initiate error custom handler.
 * @param {function} args.session_initiate_request The initiate request custom handler.
 * @param {function} args.session_accept_pending The accept pending custom handler.
 * @param {function} args.session_accept_success The accept success custom handler.
 * @param {function} args.session_accept_error The accept error custom handler.
 * @param {function} args.session_accept_request The accept request custom handler.
 * @param {function} args.session_info_success The info success custom handler.
 * @param {function} args.session_info_error The info error custom handler.
 * @param {function} args.session_info_request The info request custom handler.
 * @param {function} args.session_terminate_pending The terminate pending custom handler.
 * @param {function} args.session_terminate_success The terminate success custom handler.
 * @param {function} args.session_terminate_error The terminate error custom handler.
 * @param {function} args.session_terminate_request The terminate request custom handler.
 * @param {DOM} args.local_view The path to the local stream view element.
 * @param {DOM} args.remote_view The path to the remote stream view element.
 * @param {string} args.to The full JID to start the Jingle session with.
 * @param {string} args.media The media type to be used in the Jingle session.
 * @param {string} args.resolution The resolution to be used for video in the Jingle session.
 * @param {string} args.bandwidth The bandwidth to be limited for video in the Jingle session.
 * @param {string} args.fps The framerate to be used for video in the Jingle session.
 * @param {object} args.stun A list of STUN servers to use (override the default one)
 * @param {object} args.turn A list of TURN servers to use
 * @param {object} args.sdp_trace Log SDP trace in console (requires a debug interface)
 * @param {JSJaCDebugger} args.debug A reference to a debugger implementing the JSJaCDebugger interface.
 */
function JSJaCJingle(args) {
  var self = this;

  if(args && args.session_initiate_pending)
    /**
     * @private
     */
    self._session_initiate_pending = args.session_initiate_pending;

  if(args && args.session_initiate_success)
    /**
     * @private
     */
    self._session_initiate_success = args.session_initiate_success;

  if(args && args.session_initiate_error)
    /**
     * @private
     */
    self._session_initiate_error = args.session_initiate_error;

  if(args && args.session_initiate_request)
    /**
     * @private
     */
    self._session_initiate_request = args.session_initiate_request;

  if(args && args.session_accept_pending)
    /**
     * @private
     */
    self._session_accept_pending = args.session_accept_pending;

  if(args && args.session_accept_success)
    /**
     * @private
     */
    self._session_accept_success = args.session_accept_success;

  if(args && args.session_accept_error)
    /**
     * @private
     */
    self._session_accept_error = args.session_accept_error;

  if(args && args.session_accept_request)
    /**
     * @private
     */
    self._session_accept_request = args.session_accept_request;

  if(args && args.session_info_success)
    /**
     * @private
     */
    self._session_info_success = args.session_info_success;

  if(args && args.session_info_error)
    /**
     * @private
     */
    self._session_info_error = args.session_info_error;

  if(args && args.session_info_request)
    /**
     * @private
     */
    self._session_info_request = args.session_info_request;

  if(args && args.session_terminate_pending)
    /**
     * @private
     */
    self._session_terminate_pending = args.session_terminate_pending;

  if(args && args.session_terminate_success)
    /**
     * @private
     */
    self._session_terminate_success = args.session_terminate_success;

  if(args && args.session_terminate_error)
    /**
     * @private
     */
    self._session_terminate_error = args.session_terminate_error;

  if(args && args.session_terminate_request)
    /**
     * @private
     */
    self._session_terminate_request = args.session_terminate_request;

  if(args && args.to)
    /**
     * @private
     */
    self._to = args.to;

  if(args && args.media)
    /**
     * @private
     */
    self._media = args.media;

  if(args && args.video_source)
    /**
     * @private
     */
    self._video_source = args.video_source;

  if(args && args.resolution)
    /**
     * @private
     */
    self._resolution = args.resolution;

  if(args && args.bandwidth)
    /**
     * @private
     */
    self._bandwidth = args.bandwidth;

  if(args && args.fps)
    /**
     * @private
     */
    self._fps = args.fps;

  if(args && args.local_view)
    /**
     * @private
     */
    self._local_view = [args.local_view];

  if(args && args.remote_view)
    /**
     * @private
     */
    self._remote_view = [args.remote_view];

  if(args && args.stun) {
    /**
     * @private
     */
    self._stun = args.stun;
  } else {
    self._stun = {};
  }

  if(args && args.turn) {
    /**
     * @private
     */
    self._turn = args.turn;
  } else {
    self._turn = {};
  }

  if(args && args.sdp_trace)
    /**
     * @private
     */
    self._sdp_trace = args.sdp_trace;

  if(args && args.debug && args.debug.log) {
      /**
       * Reference to debugger interface
       * (needs to implement method <code>log</code>)
       * @type JSJaCDebugger
       */
    self._debug = args.debug;
  } else {
    self._debug = JSJAC_JINGLE_STORE_DEBUG;
  }

  /**
   * @private
   */
  self._local_stream = null;

  /**
   * @private
   */
  self._remote_stream = null;

  /**
   * @private
   */
  self._content_local = {};

  /**
   * @private
   */
  self._content_remote = {};

  /**
   * @private
   */
  self._payloads_local = [];

  /**
   * @private
   */
  self._group_local = {};

  /**
   * @private
   */
  self._candidates_local = {};

  /**
   * @private
   */
  self._candidates_queue_local = {};

  /**
   * @private
   */
  self._payloads_remote = {};

  /**
   * @private
   */
  self._group_remote = {};

  /**
   * @private
   */
  self._candidates_remote = {};

  /**
   * @private
   */
  self._candidates_queue_remote = {};

  /**
   * @private
   */
  self._initiator = '';

  /**
   * @private
   */
  self._responder = '';

  /**
   * @private
   */
  self._mute = {};

  /**
   * @private
   */
  self._lock = false;

  /**
   * @private
   */
  self._media_busy = false;

  /**
   * @private
   */
  self._sid = '';

  /**
   * @private
   */
  self._name = {};

  /**
   * @private
   */
  self._senders = {};

  /**
   * @private
   */
  self._creator = {};

  /**
   * @private
   */
  self._status = JSJAC_JINGLE_STATUS_INACTIVE;

  /**
   * @private
   */
  self._reason = JSJAC_JINGLE_REASON_CANCEL;

  /**
   * @private
   */
  self._handlers = {};

  /**
   * @private
   */
  self._peer_connection = null;

  /**
   * @private
   */
  self._id = 0;

  /**
   * @private
   */
  self._sent_id = {};

  /**
   * @private
   */
  self._received_id = {};



  /**
   * Initiates a new Jingle session.
   */
  self.initiate = function() {
    self.get_debug().log('[JSJaCJingle] initiate', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] initiate > Cannot initiate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.initiate(); })) {
        self.get_debug().log('[JSJaCJingle] initiate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        self.get_debug().log('[JSJaCJingle] initiate > Cannot initiate, resource not inactive (status: ' + self.get_status() + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] initiate > New Jingle session with media: ' + self.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      (self._get_session_initiate_pending())(self);

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Set session values
      self._set_sid(self.util_generate_sid());
      self._set_initiator(self.util_connection_jid());
      self._set_responder(self.get_to());

      for(i in self.get_media_all()) {
        cur_name = self._util_name_generate(
          self.get_media_all()[i]
        );

        self._set_name(cur_name);

        self._set_senders(
          cur_name,
          JSJAC_JINGLE_SENDERS_BOTH.jingle
        );

        self._set_creator(
          cur_name,
          JSJAC_JINGLE_CREATOR_INITIATOR
        );
      }

      // Register session to common router
      JSJaCJingle_add(self.get_sid(), self);

      // Initialize WebRTC
      self._peer_get_user_media(function() {
        self._peer_connection_create(function() {
          self.get_debug().log('[JSJaCJingle] initiate > Ready to begin Jingle negotiation.', 2);

          self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
        });
      });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] initiate > ' + e, 1);
    }
  };

  /**
   * Accepts the Jingle session.
   */
  self.accept = function() {
    self.get_debug().log('[JSJaCJingle] accept', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] accept > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.accept(); })) {
        self.get_debug().log('[JSJaCJingle] accept > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        self.get_debug().log('[JSJaCJingle] accept > Cannot accept, resource not initiated (status: ' + self.get_status() + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] accept > New Jingle session with media: ' + self.get_media(), 2);

      // Trigger accept pending custom callback
      (self._get_session_accept_pending())(self);

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Initialize WebRTC
      self._peer_get_user_media(function() {
        self._peer_connection_create(function() {
          self.get_debug().log('[JSJaCJingle] accept > Ready to complete Jingle negotiation.', 2);

          // Process accept actions
          self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
        });
      });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] accept > ' + e, 1);
    }
  };

  /**
   * Sends a Jingle session info.
   */
  self.info = function(name, args) {
    self.get_debug().log('[JSJaCJingle] info', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] info > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.info(name, args); })) {
        self.get_debug().log('[JSJaCJingle] info > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING || self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTED)) {
        self.get_debug().log('[JSJaCJingle] info > Cannot send info, resource not active (status: ' + self.get_status() + ').', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build final args parameter
      args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
      if(name) args.info = name;

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, args);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] info > ' + e, 1);
    }
  };

  /**
   * Terminates the Jingle session.
   */
  self.terminate = function(reason) {
    self.get_debug().log('[JSJaCJingle] terminate', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.terminate(reason); })) {
        self.get_debug().log('[JSJaCJingle] terminate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource already terminated (status: ' + self.get_status() + ').', 0);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Trigger terminate pending custom callback
      (self._get_session_terminate_pending())(self);

      // Process terminate actions
      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] terminate > ' + e, 1);
    }
  };

  /**
   * Sends a given Jingle stanza packet
   */
  self.send = function(type, args) {
    self.get_debug().log('[JSJaCJingle] send', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.send(type, args); })) {
        self.get_debug().log('[JSJaCJingle] send > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCIQ();
      stanza.setTo(self.get_to());

      if(type) stanza.setType(type);

      if(!args.id) args.id = self._get_id_new();
      stanza.setID(args.id);

      if(type == JSJAC_JINGLE_STANZA_TYPE_SET) {
        if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
          self.get_debug().log('[JSJaCJingle] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
          return;
        }

        self._set_sent_id(args.id);

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            self.send_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            self.send_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            self.send_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            self.send_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            self.send_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            self.send_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            self.send_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            self.send_session_accept(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            self.send_session_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            self.send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            self.send_session_terminate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            self.send_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            self.send_transport_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            self.send_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            self.send_transport_replace(stanza); break;

          default:
            self.get_debug().log('[JSJaCJingle] send > Unexpected error.', 1);

            return false;
        }
      } else if(type != JSJAC_JINGLE_STANZA_TYPE_RESULT) {
        self.get_debug().log('[JSJaCJingle] send > Stanza type must either be set or result.', 1);

        return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      return true;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send > ' + e, 1);
    }

    return false;
  };

  /**
   * Handles a given Jingle stanza response
   */
  self.handle = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.handle(stanza); })) {
        self.get_debug().log('[JSJaCJingle] handle > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      var id   = stanza.getID();
      var type = stanza.getType();

      if(id && type == JSJAC_JINGLE_STANZA_TYPE_RESULT)  self._set_received_id(id);

      // Submit to custom handler
      if(typeof self._get_handlers(type, id) == 'function') {
        self.get_debug().log('[JSJaCJingle] handle > Submitted to custom handler.', 2);

        (self._get_handlers(type, id))(stanza);
        self.unregister_handler(type, id);

        return;
      }

      var jingle = self.util_stanza_jingle(stanza);

      // Don't handle non-Jingle stanzas there...
      if(!jingle) return;

      var action = self.util_stanza_get_attribute(jingle, 'action');

      // Don't handle action-less Jingle stanzas there...
      if(!action) return;

      // Submit to registered handler
      switch(action) {
        case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
          self.handle_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          self.handle_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          self.handle_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          self.handle_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          self.handle_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          self.handle_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          self.handle_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          self.handle_session_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          self.handle_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          self.handle_session_initiate(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          self.handle_session_terminate(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          self.handle_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          self.handle_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          self.handle_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          self.handle_transport_replace(stanza); break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle > ' + e, 1);
    }
  };

  /**
   * Mutes a Jingle session (local)
   */
  self.mute = function(name) {
    self.get_debug().log('[JSJaCJingle] mute', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.mute(name); })) {
        self.get_debug().log('[JSJaCJingle] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(self.get_mute(name)) {
        self.get_debug().log('[JSJaCJingle] mute > Resource already muted.', 0);
        return;
      }

      self._peer_sound(false);
      self._set_mute(name, true);

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] mute > ' + e, 1);
    }
  };

  /**
   * Unmutes a Jingle session (local)
   */
  self.unmute = function(name) {
    self.get_debug().log('[JSJaCJingle] unmute', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.unmute(name); })) {
        self.get_debug().log('[JSJaCJingle] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!self.get_mute(name)) {
        self.get_debug().log('[JSJaCJingle] unmute > Resource already unmuted.', 0);
        return;
      }

      self._peer_sound(true);
      self._set_mute(name, false);

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unmute > ' + e, 1);
    }
  };

  /**
   * Toggles media type in a Jingle session
   */
  self.media = function(media) {
    /* DEV: don't expect this to work as of now! */

    self.get_debug().log('[JSJaCJingle] media', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.media(media); })) {
        self.get_debug().log('[JSJaCJingle] media > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Toggle media?
      if(!media)
        media = (self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

      // Media unknown?
      if(!(media in JSJAC_JINGLE_MEDIAS)) {
        self.get_debug().log('[JSJaCJingle] media > No media provided or media unsupported (media: ' + media + ').', 0);
        return;
      }

      // Already using provided media?
      if(self.get_media() == media) {
        self.get_debug().log('[JSJaCJingle] media > Resource already using this media (media: ' + media + ').', 0);
        return;
      }

      // Switch locked for now? (another one is being processed)
      if(self.get_media_busy()) {
        self.get_debug().log('[JSJaCJingle] media > Resource already busy switching media (busy: ' + self.get_media() + ', media: ' + media + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] media > Changing media to: ' + media + '...', 2);

      // Store new media
      self._set_media(media);
      self._set_media_busy(true);

      // Toggle video mode (add/remove)
      if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
        // TODO: the flow is something like that...
        /*self._peer_get_user_media(function() {
          self._peer_connection_create(function() {
            self.get_debug().log('[JSJaCJingle] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-add' >> video
            // TODO: restart video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

            self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      } else {
        // TODO: the flow is something like that...
        /*self._peer_get_user_media(function() {
          self._peer_connection_create(function() {
            self.get_debug().log('[JSJaCJingle] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-remove' >> video
            // TODO: remove video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
            //          here, only stop the video stream, do not touch the audio stream

            self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] media > ' + e, 1);
    }
  };

  /**
   * Registers a given handler on a given Jingle stanza
   */
  self.register_handler = function(type, id, fn) {
    self.get_debug().log('[JSJaCJingle] register_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(typeof fn !== 'function') {
        self.get_debug().log('[JSJaCJingle] register_handler > fn parameter not passed or not a function!', 1);
        return false;
      }

      if(id) {
        self._set_handlers(type, id, fn);

        self.get_debug().log('[JSJaCJingle] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] register_handler > Could not register handler (no ID).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] register_handler > ' + e, 1);
    }

    return false;
  };

  /**
   * Unregisters the given handler on a given Jingle stanza
   */
  self.unregister_handler = function(type, id) {
    self.get_debug().log('[JSJaCJingle] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(type in self._handlers && id in self._handlers[type]) {
        delete self._handlers[type][id];

        self.get_debug().log('[JSJaCJingle] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unregister_handler > ' + e, 1);
    }

    return false;
  };

  /**
   * Registers a view element
   */
  self.register_view = function(type, view) {
    self.get_debug().log('[JSJaCJingle] register_view', 4);

    try {
      // Get view functions
      var fn = self._util_map_register_view(type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            self.get_debug().log('[JSJaCJingle] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(view);

        self._util_peer_stream_attach(
          [view],
          (fn.stream.get)(),
          fn.mute
        );

        self.get_debug().log('[JSJaCJingle] register_view > Registered view of type: ' + type, 3);

        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] register_view > ' + e, 1);
    }

    return false;
  };

  /**
   * Unregisters a view element
   */
  self.unregister_view = function(type, view) {
    self.get_debug().log('[JSJaCJingle] unregister_view', 4);

    try {
      // Get view functions
      var fn = self._util_map_unregister_view(type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            // Proceeds un-registration
            self._util_peer_stream_detach(
              [view]
            );

            self.util_array_remove_value(
              (fn.view.get)(),
              view
            );

            self.get_debug().log('[JSJaCJingle] unregister_view > Unregistered view of type: ' + type, 3);
            return true;
          }
        }

        self.get_debug().log('[JSJaCJingle] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unregister_view > ' + e, 1);
    }

    return false;
  };



  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   */
  self.send_content_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_accept', 4);

    try {
      // TODO: remove from remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_accept > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content add
   */
  self.send_content_add = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_add', 4);

    try {
      // TODO: push to local 'content-add' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_add > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_add > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content modify
   */
  self.send_content_modify = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_modify', 4);

    try {
      // TODO: push to local 'content-modify' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_modify > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_modify > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content reject
   */
  self.send_content_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_reject', 4);

    try {
      // TODO: remove from remote 'content-add' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_reject > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_reject > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content remove
   */
  self.send_content_remove = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_remove', 4);

    try {
      // TODO: add to local 'content-remove' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_remove > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_remove > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle description info
   */
  self.send_description_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_description_info', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_description_info > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_description_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle security info
   */
  self.send_security_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_security_info', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_security_info > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_security_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session accept
   */
  self.send_session_accept = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_accept', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING) {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      if(!args) {
          self.get_debug().log('[JSJaCJingle] send_session_accept > Argument not provided.', 1);
          return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
        'responder' : self.get_responder()
      });

      self._util_stanza_generate_content_local(stanza, jingle);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_accept_success())(self, stanza);
        self.handle_session_accept_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_accept_error(),
        internal:   self.handle_session_accept_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_accept > Sent.', 4);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session info
   */
  self.send_session_info = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_info', 4);

    try {
      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_info > Argument not provided.', 1);
        return;
      }

      // Filter info
      args.info = args.info || JSJAC_JINGLE_SESSION_INFO_ACTIVE;

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INFO,
        'initiator' : self.get_initiator()
      });

      self._util_stanza_generate_session_info(stanza, jingle, args);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_info_success())(self, stanza);
        self.handle_session_info_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_info_error(),
        internal:   self.handle_session_info_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_info > Sent (name: ' + args.info + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session initiate
   */
  self.send_session_initiate = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_initiate', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATING) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Argument not provided.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INITIATE,
        'initiator' : self.get_initiator()
      });

      self._util_stanza_generate_content_local(stanza, jingle);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_initiate_success())(self, stanza);
        self.handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_initiate_error(),
        internal:   self.handle_session_initiate_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_initiate > Sent.', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_initiate > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session terminate
   */
  self.send_session_terminate = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_terminate', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_TERMINATING) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Argument not provided.', 1);
        return;
      }

      // Filter reason
      args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

      // Store terminate reason
      self._set_reason(args.reason);

      // Build terminate stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
      });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': NS_JINGLE}));

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_terminate_success())(self, stanza);
        self.handle_session_terminate_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_terminate_error(),
        internal:   self.handle_session_terminate_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_terminate > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport accept
   */
  self.send_transport_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_accept', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_accept > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport info
   */
  self.send_transport_info = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_transport_info', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > Argument not provided.', 1);
        return;
      }

      if(self.util_object_length(self._get_candidates_queue_local()) === 0) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > No local candidate in queue.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
        'initiator' : self.get_initiator()
      });

      // Build queue content
      var cur_name;
      var content_queue_local = {};

      for(cur_name in self.get_name()) {
        content_queue_local[cur_name] = self._util_generate_content(
            self.get_creator(cur_name),
            cur_name,
            self.get_senders(cur_name),
            self._get_payloads_local(cur_name),
            self._get_candidates_queue_local(cur_name)
        );
      }

      self._util_stanza_generate_content_local(stanza, jingle, content_queue_local);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        self.handle_transport_info_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        internal: self.handle_transport_info_error
      });

      self.get_debug().log('[JSJaCJingle] send_transport_info > Sent.', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport reject
   */
  self.send_transport_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_reject', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_reject > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_reject > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_transport_replace = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_replace', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_replace > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_replace > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_error = function(stanza, error) {
    self.get_debug().log('[JSJaCJingle] send_error', 4);

    try {
      // Assert
      if(!('type' in error)) {
        self.get_debug().log('[JSJaCJingle] send_error > Type unknown.', 1);
        return;
      }

      if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
        self.get_debug().log('[JSJaCJingle] send_error > Jingle condition unknown (' + error.jingle + ').', 1);
        return;
      }

      if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
        self.get_debug().log('[JSJaCJingle] send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
        return;
      }

      var stanza_error = new JSJaCIQ();

      stanza_error.setType('error');
      stanza_error.setID(stanza.getID());
      stanza_error.setTo(self.get_to());

      var error_node = stanza_error.getNode().appendChild(stanza_error.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

      if('xmpp'   in error) error_node.appendChild(stanza_error.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
      if('jingle' in error) error_node.appendChild(stanza_error.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza_error);

      self.get_debug().log('[JSJaCJingle] send_error > Sent: ' + (error.jingle || error.xmpp), 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_error > ' + e, 1);
    }
  };



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_accept', 4);

    try {
      // TODO: start to flow accepted stream
      // TODO: remove accepted content from local 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_add = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_add', 4);

    try {
      // TODO: request the user to start this content (need a custom handler)
      //       on accept: send content-accept
      // TODO: push to remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_add > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_modify = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_modify', 4);

    try {
      // TODO: change 'senders' value (direction of the stream)
      //       if(send:from_me): notify the user that media is requested
      //       if(unacceptable): terminate the session
      //       if(accepted):     change local/remote SDP
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_modify > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_reject', 4);

    try {
      // TODO: remove rejected content from local 'content-add' queue

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_reject > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_remove = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_remove', 4);

    try {
      // TODO: stop flowing removed stream
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_remove > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_description_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_description_info', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_description_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_security_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_security_info', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_security_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept', 4);

    try {
      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_accept > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_accept_success())(self, stanza);
          self.handle_session_accept_success(stanza);

          break;

        case 'error':
          (self._get_session_accept_error())(self, stanza);
          self.handle_session_accept_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          // External handler must be set before internal one here...
          (self._get_session_accept_request())(self, stanza);
          self.handle_session_accept_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_error', 4);

    try {
      // Terminate the session (timeout)
      self.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Cannot handle, resource already accepted (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      var rd_sid = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self.is_initiator() && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        self._util_stanza_parse_group(stanza);

        // Generate and store content data
        self._util_build_content_remote();

        // Trigger accept success callback
        (self._get_session_accept_success())(self, stanza);
        self.handle_session_accept_success(stanza);

        var sdp_remote = self._util_sdp_generate(
          WEBRTC_SDP_TYPE_ANSWER,
          self._get_group_remote(),
          self._get_payloads_remote(),
          self._get_candidates_queue_remote()
        );

        if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        self._get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            self.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // ICE candidates
        for(i in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[i];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);

        // Success reply
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Trigger accept error callback
        (self._get_session_accept_error())(self, stanza);
        self.handle_session_accept_error(stanza);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Error.', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info', 4);

    try {
      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_info > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_info_success())(self, stanza);
          self.handle_session_info_success(stanza);

          break;

        case 'error':
          (self._get_session_info_error())(self, stanza);
          self.handle_session_info_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_info_request())(self, stanza);
          self.handle_session_info_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_success', 4);
  };

  /**
   * Handles the Jingle session info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_error', 4);
  };

  /**
   * Handles the Jingle session info request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_request', 4);

    try {
      // Parse stanza
      var info_name = self.util_stanza_session_info(stanza);
      var info_result = false;

      switch(info_name) {
        case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
        case JSJAC_JINGLE_SESSION_INFO_RINGING:
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          info_result = true; break;
      }

      if(info_result) {
        self.get_debug().log('[JSJaCJingle] handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

        // Process info actions
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

        // Trigger info success custom callback
        (self._get_session_info_success())(self, stanza);
        self.handle_session_info_success(stanza);
      } else {
        self.get_debug().log('[JSJaCJingle] handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

        // Trigger info error custom callback
        (self._get_session_info_error())(self, stanza);
        self.handle_session_info_error(stanza);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_info_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate', 4);

    try {
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_initiate_success())(self, stanza);
          self.handle_session_initiate_success(stanza);

          break;

        case 'error':
          (self._get_session_initiate_error())(self, stanza);
          self.handle_session_initiate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_initiate_request())(self, stanza);
          self.handle_session_initiate_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_error', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Stop WebRTC
      self._peer_stop();

      // Lock session (cannot be used later)
      self._set_lock(true);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Common vars
      var rd_from = self.util_stanza_from(stanza);
      var rd_sid  = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        self._util_stanza_parse_group(stanza);

        // Set session values
        self._set_sid(rd_sid);
        self._set_to(rd_from);
        self._set_initiator(rd_from);
        self._set_responder(self.util_connection_jid());

        // Register session to common router
        JSJaCJingle_add(rd_sid, self);

        // Generate and store content data
        self._util_build_content_remote();

        // Video or audio-only session?
        if(JSJAC_JINGLE_MEDIA_VIDEO in self._get_content_remote()) {
          self._set_media(JSJAC_JINGLE_MEDIA_VIDEO);
        } else if(JSJAC_JINGLE_MEDIA_AUDIO in self._get_content_remote()) {
          self._set_media(JSJAC_JINGLE_MEDIA_AUDIO);
        } else {
          // Session initiation not done
          (self._get_session_initiate_error())(self, stanza);
          self.handle_session_initiate_error(stanza);

          // Error (no media is supported)
          self.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

          self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
        (self._get_session_initiate_success())(self, stanza);
        self.handle_session_initiate_success(stanza);

        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Session initiation not done
        (self._get_session_initiate_error())(self, stanza);
        self.handle_session_initiate_error(stanza);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Error (bad request).', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate', 4);

    try {
      var type = stanza.getType();

      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_terminate > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_terminate_success())(self, stanza);
          self.handle_session_terminate_success(stanza);

          break;

        case 'error':
          (self._get_session_terminate_error())(self, stanza);
          self.handle_session_terminate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_terminate_request())(self, stanza);
          self.handle_session_terminate_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      self._peer_stop();
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_error', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      self._peer_stop();

      // Lock session (cannot be used later)
      self._set_lock(true);

      self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > Forced session termination locally.', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() == JSJAC_JINGLE_STATUS_INACTIVE || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > Cannot handle, resource not active (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Store termination reason
      self._set_reason(self.util_stanza_terminate_reason(stanza));

      // Trigger terminate success callbacks
      (self._get_session_terminate_success())(self, stanza);
      self.handle_session_terminate_success(stanza);

      // Process terminate actions
      self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

      self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > (reason: ' + self.get_reason() + ').', 3);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_accept', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        self.get_debug().log('[JSJaCJingle] handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Parse the incoming transport
      var rd_sid = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
        //self._util_stanza_parse_group(stanza);

        // Re-generate and store new content data
        self._util_build_content_remote();

        var sdp_candidates_remote = self._util_sdp_generate_candidates(
          self._get_candidates_queue_remote()
        );

        // ICE candidates
        for(i in sdp_candidates_remote) {
          cur_candidate_obj = sdp_candidates_remote[i];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);

        // Success reply
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_transport_info > Error.', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info_success', 4);
  };

  /**
   * Handles the Jingle transport info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info_error', 4);
  };

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_reject', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_reject > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_replace = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_replace', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_replace > ' + e, 1);
    }
  };



  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * @private
   */
  self._get_session_initiate_pending = function() {
    if(typeof self._session_initiate_pending == 'function')
      return self._session_initiate_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_initiate_success = function() {
    if(typeof self._session_initiate_success == 'function')
      return self._session_initiate_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_initiate_error = function() {
    if(typeof self._session_initiate_error == 'function')
      return self._session_initiate_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_initiate_request = function() {
    if(typeof self._session_initiate_request == 'function')
      return self._session_initiate_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_pending = function() {
    if(typeof self._session_accept_pending == 'function')
      return self._session_accept_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_accept_success = function() {
    if(typeof self._session_accept_success == 'function')
      return self._session_accept_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_error = function() {
    if(typeof self._session_accept_error == 'function')
      return self._session_accept_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_request = function() {
    if(typeof self._session_accept_request == 'function')
      return self._session_accept_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_success = function() {
    if(typeof self._session_info_success == 'function')
      return self._session_info_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_error = function() {
    if(typeof self._session_info_error == 'function')
      return self._session_info_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_request = function() {
    if(typeof self._session_info_request == 'function')
      return self._session_info_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_pending = function() {
    if(typeof self._session_terminate_pending == 'function')
      return self._session_terminate_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_terminate_success = function() {
    if(typeof self._session_terminate_success == 'function')
      return self._session_terminate_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_error = function() {
    if(typeof self._session_terminate_error == 'function')
      return self._session_terminate_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_request = function() {
    if(typeof self._session_terminate_request == 'function')
      return self._session_terminate_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_local_stream = function() {
    return self._local_stream;
  };

  /**
   * @private
   */
  self._get_remote_stream = function() {
    return self._remote_stream;
  };

  /**
   * @private
   */
  self._get_payloads_local = function(name) {
    if(name)
      return (name in self._payloads_local) ? self._payloads_local[name] : {};

    return self._payloads_local;
  };

  /**
   * @private
   */
  self._get_group_local = function(semantics) {
    if(semantics)
      return (semantics in self._group_local) ? self._group_local[semantics] : {};

    return self._group_local;
  };

  /**
   * @private
   */
  self._get_candidates_local = function(name) {
    if(name)
      return (name in self._candidates_local) ? self._candidates_local[name] : {};

    return self._candidates_local;
  };

  /**
   * @private
   */
  self._get_candidates_queue_local = function(name) {
    if(name)
      return (name in self._candidates_queue_local) ? self._candidates_queue_local[name] : {};

    return self._candidates_queue_local;
  };

  /**
   * @private
   */
  self._get_payloads_remote = function(name) {
    if(name)
      return (name in self._payloads_remote) ? self._payloads_remote[name] : {};

    return self._payloads_remote;
  };

  /**
   * @private
   */
  self._get_group_remote = function(semantics) {
    if(semantics)
      return (semantics in self._group_remote) ? self._group_remote[semantics] : {};

    return self._group_remote;
  };

  /**
   * @private
   */
  self._get_candidates_remote = function(name) {
    if(name)
      return (name in self._candidates_remote) ? self._candidates_remote[name] : [];

    return self._candidates_remote;
  };

  /**
   * @private
   */
  self._get_candidates_queue_remote = function(name) {
    if(name)
      return (name in self._candidates_queue_remote) ? self._candidates_queue_remote[name] : {};

    return self._candidates_queue_remote;
  };

  /**
   * @private
   */
  self._get_content_local = function(name) {
    if(name)
      return (name in self._content_local) ? self._content_local[name] : {};

    return self._content_local;
  };

  /**
   * @private
   */
  self._get_content_remote = function(name) {
    if(name)
      return (name in self._content_remote) ? self._content_remote[name] : {};

    return self._content_remote;
  };

  /**
   * @private
   */
  self._get_handlers = function(type, id) {
    type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

    if(id) {
      if(type != JSJAC_JINGLE_STANZA_TYPE_ALL && type in self._handlers && typeof self._handlers[type][id] == 'function')
        return self._handlers[type][id];

      if(JSJAC_JINGLE_STANZA_TYPE_ALL in self._handlers && typeof self._handlers[JSJAC_JINGLE_STANZA_TYPE_ALL][id] == 'function')
        return self._handlers[type][id];
    }

    return null;
  };

  /**
   * @private
   */
  self._get_peer_connection = function() {
    return self._peer_connection;
  };

  /**
   * @private
   */
  self._get_id = function() {
    return self._id;
  };

  /**
   * @private
   */
  self._get_id_pre = function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (self.get_sid() || '0') + '_';
  };

  /**
   * @private
   */
  self._get_id_new = function() {
    var trans_id = self._get_id() + 1;
    self._set_id(trans_id);

    return self._get_id_pre() + trans_id;
  };

  /**
   * @private
   */
  self._get_sent_id = function() {
    return self._sent_id;
  };

  /**
   * @private
   */
  self._get_received_id = function() {
    return self._received_id;
  };

  /**
   * Gets the mute state
   * @return mute value
   * @type boolean
   */
  self.get_mute = function(name) {
    if(!name) name = '*';

    return (name in self._mute) ? self._mute[name] : false;
  };

  /**
   * Gets the lock value
   * @return lock value
   * @type boolean
   */
  self.get_lock = function() {
    return self._lock || !JSJAC_JINGLE_AVAILABLE;
  };

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  self.get_media_busy = function() {
    return self._media_busy;
  };

  /**
   * Gets the sid value
   * @return sid value
   * @type string
   */
  self.get_sid = function() {
    return self._sid;
  };

  /**
   * Gets the status value
   * @return status value
   * @type string
   */
  self.get_status = function() {
    return self._status;
  };

  /**
   * Gets the reason value
   * @return reason value
   * @type string
   */
  self.get_reason = function() {
    return self._reason;
  };

  /**
   * Gets the to value
   * @return to value
   * @type string
   */
  self.get_to = function() {
    return self._to;
  };

  /**
   * Gets the media value
   * @return media value
   * @type string
   */
  self.get_media = function() {
    return (self._media && self._media in JSJAC_JINGLE_MEDIAS) ? self._media : JSJAC_JINGLE_MEDIA_VIDEO;
  };

  /**
   * Gets a list of medias in use
   * @return media list
   * @type object
   */
  self.get_media_all = function() {
    if(self.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
      return [JSJAC_JINGLE_MEDIA_AUDIO];

    return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
  };

  /**
   * Gets the video source value
   * @return video source value
   * @type string
   */
  self.get_video_source = function() {
    return (self._video_source && self._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? self._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
  };

  /**
   * Gets the resolution value
   * @return resolution value
   * @type string
   */
  self.get_resolution = function() {
    return self._resolution ? (self._resolution).toString() : null;
  };

  /**
   * Gets the bandwidth value
   * @return bandwidth value
   * @type string
   */
  self.get_bandwidth = function() {
    return self._bandwidth ? (self._bandwidth).toString() : null;
  };

  /**
   * Gets the fps value
   * @return fps value
   * @type string
   */
  self.get_fps = function() {
    return self._fps ? (self._fps).toString() : null;
  };

  /**
   * Gets the name value
   * @return name value
   * @type string
   */
  self.get_name = function(name) {
    if(name)
      return name in self._name;

    return self._name;
  };

  /**
   * Gets the senders value
   * @return senders value
   * @type string
   */
  self.get_senders = function(name) {
    if(name)
      return (name in self._senders) ? self._senders[name] : null;

    return self._senders;
  };

  /**
   * Gets the creator value
   * @return creator value
   * @type string
   */
  self.get_creator = function(name) {
    if(name)
      return (name in self._creator) ? self._creator[name] : null;

    return self._creator;
  };

  /**
   * Gets the creator value (for this)
   * @return creator value
   * @type string
   */
  self.get_creator_this = function(name) {
    return self.get_responder() == self.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
  };

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  self.get_initiator = function() {
    return self._initiator;
  };

  /**
   * Gets the response value
   * @return response value
   * @type string
   */
  self.get_responder = function() {
    return self._responder;
  };

  /**
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  self.get_local_view = function() {
    return (typeof self._local_view == 'object') ? self._local_view : [];
  };

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  self.get_remote_view = function() {
    return (typeof self._remote_view == 'object') ? self._remote_view : [];
  };

  /**
   * Gets the STUN servers
   * @return STUN servers
   * @type object
   */
  self.get_stun = function() {
    return (typeof self._stun == 'object') ? self._stun : {};
  };

  /**
   * Gets the TURN servers
   * @return TURN servers
   * @type object
   */
  self.get_turn = function() {
    return (typeof self._turn == 'object') ? self._turn : {};
  };

  /**
   * Gets the SDP trace value
   * @return SDP trace value
   * @type JSJaCsdp_traceger
   */
  self.get_sdp_trace = function() {
    return (self._sdp_trace === true);
  };

  /**
   * Gets the debug value
   * @return debug value
   * @type JSJaCDebugger
   */
  self.get_debug = function() {
    return self._debug;
  };



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * @private
   */
  self._set_session_initiate_pending = function(session_initiate_pending) {
    self._session_initiate_pending = session_initiate_pending;
  };

  /**
   * @private
   */
  self._set_initiate_success = function(initiate_success) {
    self._session_initiate_success = initiate_success;
  };

  /**
   * @private
   */
  self._set_initiate_error = function(initiate_error) {
    self._session_initiate_error = initiate_error;
  };

  /**
   * @private
   */
  self._set_initiate_request = function(initiate_request) {
    self._session_initiate_request = initiate_request;
  };

  /**
   * @private
   */
  self._set_accept_pending = function(accept_pending) {
    self._session_accept_pending = accept_pending;
  };

  /**
   * @private
   */
  self._set_accept_success = function(accept_success) {
    self._session_accept_success = accept_success;
  };

  /**
   * @private
   */
  self._set_accept_error = function(accept_error) {
    self._session_accept_error = accept_error;
  };

  /**
   * @private
   */
  self._set_accept_request = function(accept_request) {
    self._session_accept_request = accept_request;
  };

  /**
   * @private
   */
  self._set_info_success = function(info_success) {
    self._session_info_success = info_success;
  };

  /**
   * @private
   */
  self._set_info_error = function(info_error) {
    self._session_info_error = info_error;
  };

  /**
   * @private
   */
  self._set_info_request = function(info_request) {
    self._session_info_request = info_request;
  };

  /**
   * @private
   */
  self._set_terminate_pending = function(terminate_pending) {
    self._session_terminate_pending = terminate_pending;
  };

  /**
   * @private
   */
  self._set_terminate_success = function(terminate_success) {
    self._session_terminate_success = terminate_success;
  };

  /**
   * @private
   */
  self._set_terminate_error = function(terminate_error) {
    self._session_terminate_error = terminate_error;
  };

  /**
   * @private
   */
  self._set_terminate_request = function(terminate_request) {
    self._session_terminate_request = terminate_request;
  };

  /**
   * @private
   */
  self._set_local_stream = function(local_stream) {
    try {
      if(!local_stream && self._local_stream) {
        (self._local_stream).stop();

        self._util_peer_stream_detach(
          self.get_local_view()
        );
      }

      self._local_stream = local_stream;

      if(local_stream) {
        self._util_peer_stream_attach(
          self.get_local_view(),
          self._get_local_stream(),
          true
        );
      } else {
        self._util_peer_stream_detach(
          self.get_local_view()
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_local_stream > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_remote_stream = function(remote_stream) {
    try {
      if(!remote_stream && self._remote_stream) {
        self._util_peer_stream_detach(
          self.get_remote_view()
        );
      }

      self._remote_stream = remote_stream;

      if(remote_stream) {
        self._util_peer_stream_attach(
          self.get_remote_view(),
          self._get_remote_stream(),
          false
        );
      } else {
        self._util_peer_stream_detach(
          self.get_remote_view()
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_remote_stream > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_local_view = function(local_view) {
    if(typeof self._local_view !== 'object')
      self._local_view = [];

    self._local_view.push(local_view);
  };

  /**
   * @private
   */
  self._set_remote_view = function(remote_view) {
    if(typeof self._remote_view !== 'object')
      self._remote_view = [];

    self._remote_view.push(remote_view);
  };

  /**
   * @private
   */
  self._set_payloads_local = function(name, payload_data) {
    self._payloads_local[name] = payload_data;
  };

  /**
   * @private
   */
  self._set_group_local = function(semantics, group_data) {
    self._group_local[semantics] = group_data;
  };

  /**
   * @private
   */
  self._set_candidates_local = function(name, candidate_data) {
    if(!(name in self._candidates_local))  self._candidates_local[name] = [];

    (self._candidates_local[name]).push(candidate_data);
  };

  /**
   * @private
   */
  self._set_candidates_queue_local = function(name, candidate_data) {
    try {
      if(name === null) {
        self._candidates_queue_local = {};
      } else {
        if(!(name in self._candidates_queue_local))  self._candidates_queue_local[name] = [];

        (self._candidates_queue_local[name]).push(candidate_data);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_candidates_queue_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_payloads_remote = function(name, payload_data) {
    self._payloads_remote[name] = payload_data;
  };

  /**
   * @private
   */
  self._set_payloads_remote_add = function(name, payload_data) {
    try {
      if(!(name in self._payloads_remote)) {
        self._set_payloads_remote(name, payload_data);
      } else {
        var key;
        var payloads_store = self._payloads_remote[name].descriptions.payload;
        var payloads_add   = payload_data.descriptions.payload;

        for(key in payloads_add) {
          if(!(key in payloads_store))
            payloads_store[key] = payloads_add[key];
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_payloads_remote_add > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_group_remote = function(semantics, group_data) {
    self._group_remote[semantics] = group_data;
  };

  /**
   * @private
   */
  self._set_candidates_remote = function(name, candidate_data) {
    self._candidates_remote[name] = candidate_data;
  };

  /**
   * @private
   */
  self._set_candidates_queue_remote = function(name, candidate_data) {
    if(name === null)
      self._candidates_queue_remote = {};
    else
      self._candidates_queue_remote[name] = (candidate_data);
  };

  /**
   * @private
   */
  self._set_candidates_remote_add = function(name, candidate_data) {
    try {
      if(!name) return;

      if(!(name in self._candidates_remote))
        self._set_candidates_remote(name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in self._get_candidates_remote(name))
        candidate_ids.push(self._get_candidates_remote(name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          self._get_candidates_remote(name).push(candidate_data[i]);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_candidates_remote_add > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_content_local = function(name, content_local) {
    self._content_local[name] = content_local;
  };

  /**
   * @private
   */
  self._set_content_remote = function(name, content_remote) {
    self._content_remote[name] = content_remote;
  };

  /**
   * @private
   */
  self._set_handlers = function(type, id, handler) {
    if(!(type in self._handlers))  self._handlers[type] = {};

    self._handlers[type][id] = handler;
  };

  /**
   * @private
   */
  self._set_peer_connection = function(peer_connection) {
    self._peer_connection = peer_connection;
  };

  /**
   * @private
   */
  self._set_id = function(id) {
    self._id = id;
  };

  /**
   * @private
   */
  self._set_sent_id = function(sent_id) {
    self._sent_id[sent_id] = 1;
  };

  /**
   * @private
   */
  self._set_received_id = function(received_id) {
    self._received_id[received_id] = 1;
  };

  /**
   * @private
   */
  self._set_mute = function(name, mute) {
    if(!name || name == '*') {
      self._mute = {};
      name = '*';
    }

    self._mute[name] = mute;
  };

  /**
   * @private
   */
  self._set_lock = function(lock) {
    self._lock = lock;
  };

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  self._set_media_busy = function(busy) {
    self._media_busy = busy;
  };

  /**
   * @private
   */
  self._set_sid = function(sid) {
    self._sid = sid;
  };

  /**
   * @private
   */
  self._set_status = function(status) {
    self._status = status;
  };

  /**
   * @private
   */
  self._set_reason = function(reason) {
    self._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
  };

  /**
   * @private
   */
  self._set_to = function(to) {
    self._to = to;
  };

  /**
   * @private
   */
  self._set_media = function(media) {
    self._media = media;
  };

  /**
   * @private
   */
  self._set_video_source = function() {
    self._video_source = video_source;
  };

  /**
   * @private
   */
  self._set_resolution = function(resolution) {
    self._resolution = resolution;
  };

  /**
   * @private
   */
  self._set_bandwidth = function(bandwidth) {
    self._bandwidth = bandwidth;
  };

  /**
   * @private
   */
  self._set_fps = function(fps) {
    self._fps = fps;
  };

  /**
   * @private
   */
  self._set_name = function(name) {
    self._name[name] = 1;
  };

  /**
   * @private
   */
  self._set_senders = function(name, senders) {
    if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

    self._senders[name] = senders;
  };

  /**
   * @private
   */
  self._set_creator = function(name, creator) {
    if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

    self._creator[name] = creator;
  };

  /**
   * @private
   */
  self._set_initiator = function(initiator) {
    self._initiator = initiator;
  };

  /**
   * @private
   */
  self._set_responder = function(responder) {
    self._responder = responder;
  };

  /**
   * @private
   */
  self._set_stun = function(stun_host, stun_data) {
    self._stun[stun_server] = stun_data;
  };

  /**
   * @private
   */
  self._set_turn = function(turn_host, turn_data) {
    self._turn[turn_server] = turn_data;
  };

  /**
   * @private
   */
  self._set_sdp_trace = function(sdp_trace) {
    self._sdp_trace = sdp_trace;
  };

  /**
   * @private
   */
  self._set_debug = function(debug) {
    self._debug = debug;
  };



  /**
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Am I responder?
   * @return Receiver state
   * @type boolean
   */
  self.is_responder = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  };

  /**
   * Am I initiator?
   * @return Initiator state
   * @type boolean
   */
  self.is_initiator = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  };



  /**
   * JSJSAC JINGLE UTILITIES
   */

  /**
   * Removes a given array value
   * @return new array
   * @type object
   */
  self.util_array_remove_value = function(array, value) {
    try {
      var i;

      for(i = 0; i < array.length; i++) {
        if(array[i] === value) {
          array.splice(i, 1); i--;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_array_remove_value > ' + e, 1);
    }

    return array;
  };

  /**
   * Returns whether an object is empty or not
   * @return Empty value
   * @type boolean
   */
  self.util_object_length = function(object) {
    var key;
    var l = 0;

    try {
      for(key in object) {
        if(object.hasOwnProperty(key))  l++;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_object_length > ' + e, 1);
    }

    return l;
  };

  /**
   * Collects given objects
   * @return Empty value
   * @type object
   */
  self.util_object_collect = function() {
    var i, p;

    var collect_obj = {};
    var len = arguments.length;

    for(i = 0; i < len; i++) {
      for(p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p))
          collect_obj[p] = arguments[i][p];
      }
    }

    return collect_obj;
  };

  /**
   * Clones a given object
   * @return Cloned object
   * @type object
   */
  self.util_object_clone = function(object) {
    try {
      var copy, i, attr;

      // Assert
      if(object === null || typeof object !== 'object') return object;

      // Handle Date
      if(object instanceof Date) {
          copy = new Date();
          copy.setTime(object.getTime());

          return copy;
      }

      // Handle Array
      if(object instanceof Array) {
          copy = [];

          for(i = 0, len = object.length; i < len; i++)
            copy[i] = self.util_object_clone(object[i]);

          return copy;
      }

      // Handle Object
      if(object instanceof Object) {
          copy = {};

          for(attr in object) {
              if(object.hasOwnProperty(attr))
                copy[attr] = self.util_object_clone(object[attr]);
          }

          return copy;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_object_clone > ' + e, 1);
    }

    self.get_debug().log('[JSJaCJingle] util_object_clone > Cannot clone this object.', 1);
  };

  /**
   * Gets the browser info
   * @return browser info
   * @type object
   */
  self._util_browser = function() {
    var browser_info = {
      name    : 'Generic'
    };

    try {
      var user_agent, detect_arr, cur_browser;

      detect_arr = {
        'firefox' : JSJAC_JINGLE_BROWSER_FIREFOX,
        'chrome'  : JSJAC_JINGLE_BROWSER_CHROME,
        'safari'  : JSJAC_JINGLE_BROWSER_SAFARI,
        'opera'   : JSJAC_JINGLE_BROWSER_OPERA,
        'msie'    : JSJAC_JINGLE_BROWSER_IE
      };

      user_agent = navigator.userAgent.toLowerCase();

      for(cur_browser in detect_arr) {
        if(user_agent.indexOf(cur_browser) > -1) {
          browser_info.name = detect_arr[cur_browser];
          break;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_browser > ' + e, 1);
    }

    return browser_info;
  };

  /**
   * Gets the ICE config
   * @return ICE config
   * @type object
   */
  self._util_config_ice = function() {
    try {
      // Collect data (user + server)
      var stun_config = self.util_object_collect(
        self.get_stun(),
        JSJAC_JINGLE_STORE_EXTDISCO.stun,
        JSJAC_JINGLE_STORE_FALLBACK.stun
      );

      var turn_config = self.util_object_collect(
        self.get_turn(),
        JSJAC_JINGLE_STORE_EXTDISCO.turn,
        JSJAC_JINGLE_STORE_FALLBACK.turn
      );

      // Can proceed?
      if(stun_config && self.util_object_length(stun_config)  || 
         turn_config && self.util_object_length(turn_config)  ) {
        var config = {
          iceServers : []
        };

        // STUN servers
        var cur_stun_host, cur_stun_obj, cur_stun_config;

        for(cur_stun_host in stun_config) {
          if(cur_stun_host) {
            cur_stun_obj = stun_config[cur_stun_host];

            cur_stun_config = {};
            cur_stun_config.url = 'stun:' + cur_stun_host;

            if(cur_stun_obj.port)
              cur_stun_config.url += ':' + cur_stun_obj.port;

            if(cur_stun_obj.transport && self._util_browser().name != JSJAC_JINGLE_BROWSER_FIREFOX)
              cur_stun_config.url += '?transport=' + cur_stun_obj.transport;

            (config.iceServers).push(cur_stun_config);
          }
        }

        // TURN servers
        var cur_turn_host, cur_turn_obj, cur_turn_config;

        for(cur_turn_host in turn_config) {
          if(cur_turn_host) {
            cur_turn_obj = turn_config[cur_turn_host];

            cur_turn_config = {};
            cur_turn_config.url = 'turn:' + cur_turn_host;

            if(cur_turn_obj.port)
              cur_turn_config.url += ':' + cur_turn_obj.port;

            if(cur_turn_obj.transport)
              cur_turn_config.url += '?transport=' + cur_turn_obj.transport;

            if(cur_turn_obj.username)
              cur_turn_config.username = cur_turn_obj.username;

            if(cur_turn_obj.password)
              cur_turn_config.password = cur_turn_obj.password;

            (config.iceServers).push(cur_turn_config);
          }
        }

        // Check we have at least a STUN server (if user can traverse NAT)
        var i;
        var has_stun = false;

        for(i in config.iceServers) {
          if((config.iceServers[i].url).match(/^stun:/i)) {
            has_stun = true; break;
          }
        }

        if(!has_stun) {
          (config.iceServers).push({
            url: (WEBRTC_CONFIGURATION.peer_connection.config.iceServers)[0].url
          });
        }

        return config;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_config_ice > ' + e, 1);
    }

    return WEBRTC_CONFIGURATION.peer_connection.config;
  };

  /**
   * Gets the node value from a stanza element
   * @return Node value
   * @type string
   */
  self.util_stanza_get_value = function(stanza) {
    try {
      return stanza.firstChild.nodeValue || null;
    } catch(e) {
      try {
        return (stanza[0]).firstChild.nodeValue || null;
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_get_value > ' + _e, 1);
      }
    }

    return null;
  };

  /**
   * Gets the attribute value from a stanza element
   * @return Attribute value
   * @type string
   */
  self.util_stanza_get_attribute = function(stanza, name) {
    if(!name) return null;

    try {
      return stanza.getAttribute(name) || null;
    } catch(e) {
      try {
        return (stanza[0]).getAttribute(name) || null;
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_get_attribute > ' + _e, 1);
      }
    }

    return null;
  };

  /**
   * Sets the attribute value to a stanza element
   */
  self.util_stanza_set_attribute = function(stanza, name, value) {
    if(!(name && value && stanza)) return;

    try {
      stanza.setAttribute(name, value);
    } catch(e) {
      try {
        (stanza[0]).setAttribute(name, value);
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_set_attribute > ' + _e, 1);
      }
    }
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_get_element = function(stanza, name, ns) {
    // Assert
    if(!stanza)        return [];
    if(stanza.length)  stanza = stanza[0];

    try {
      // Get only in lower level (not all sub-levels)
      var matches = stanza.getElementsByTagNameNS(ns, name);

      if(matches[0] && matches[0].parentNode == stanza)  return matches;

      return [];
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_get_element > ' + e, 1);
    }

    return [];
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_jingle = function(stanza) {
    try {
      return stanza.getChild('jingle', NS_JINGLE);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_jingle > ' + e, 1);
    }

    return null;
  };

  /**
   * Gets the from value from a stanza
   * @return from value
   * @type string
   */
  self.util_stanza_from = function(stanza) {
    try {
      return stanza.getFrom() || null;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_from > ' + e, 1);
    }

    return null;
  };

  /**
   * Gets the SID value from a stanza
   * @return SID value
   * @type string
   */
  self.util_stanza_sid = function(stanza) {
    try {
      return self.util_stanza_get_attribute(
        self.util_stanza_jingle(stanza),
        'sid'
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_sid > ' + e, 1);
    }
  };

  /**
   * Checks if a stanza is safe (known SID + sender)
   * @return safety state
   * @type boolean
   */
  self.util_stanza_safe = function(stanza) {
    try {
      return !((stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && self.util_stanza_sid(stanza) != self.get_sid()) || self.util_stanza_from(stanza) != self.get_to());
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_safe > ' + e, 1);
    }

    return false;
  };

  /**
   * Gets a stanza terminate reason
   * @return reason code
   * @type string
   */
  self.util_stanza_terminate_reason = function(stanza) {
    try {
      var jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        var reason = self.util_stanza_get_element(jingle, 'reason', NS_JINGLE);

        if(reason.length) {
          var cur_reason;

          for(cur_reason in JSJAC_JINGLE_REASONS) {
            if(self.util_stanza_get_element(reason[0], cur_reason, NS_JINGLE).length)
              return cur_reason;
          }
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_terminate_reason > ' + e, 1);
    }

    return null;
  };

  /**
   * Gets a stanza session info
   * @return info code
   * @type string
   */
  self.util_stanza_session_info = function(stanza) {
    try {
      var jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        var cur_info;

        for(cur_info in JSJAC_JINGLE_SESSION_INFOS) {
          if(self.util_stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length)
            return cur_info;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_session_info > ' + e, 1);
    }

    return null;
  };

  /**
   * Set a timeout limit to a stanza
   */
  self.util_stanza_timeout = function(t_type, t_id, handlers) {
    try {
      t_type = t_type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      var t_sid = self.get_sid();
      var t_status = self.get_status();

      self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Registered (id: ' + t_id + ', status: ' + t_status + ').', 4);

      setTimeout(function() {
        self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Cheking (id: ' + t_id + ', status: ' + t_status + '-' + self.get_status() + ').', 4);

        // State did not change?
        if(self.get_sid() == t_sid && self.get_status() == t_status && !(t_id in self._get_received_id())) {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Stanza timeout.', 2);

          self.unregister_handler(t_type, t_id);

          if(handlers.external)  (handlers.external)(self);
          if(handlers.internal)  (handlers.internal)();
        } else {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Stanza successful.', 4);
        }
      }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_timeout > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_parse_node = function(parent, name, ns, obj, attrs, value) {
    try {
      var i, j,
          error, child, child_arr;
      var children = self.util_stanza_get_element(parent, name, ns);

      if(children.length) {
        for(i = 0; i < children.length; i++) {
          // Initialize
          error = 0;
          child = children[i];
          child_arr = {};

          // Parse attributes
          for(j in attrs) {
            child_arr[attrs[j].n] = self.util_stanza_get_attribute(child, attrs[j].n);

            if(attrs[j].r && !child_arr[attrs[j].n]) {
              error++; break;
            }
          }

          // Parse value
          if(value) {
            child_arr[value.n] = self.util_stanza_get_value(child);
            if(value.r && !child_arr[value.n])  error++;
          }

          if(error !== 0) continue;

          // Push current children
          obj.push(child_arr);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_node > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_parse_content = function(stanza) {
    try {
      var i,
          jingle, content, cur_content,
          content_creator, content_name, content_senders,
          cur_candidates;

      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);

        if(content && content.length) {
          for(i = 0; i < content.length; i++) {
            cur_content = content[i];

            // Attrs (avoids senders & creators to be changed later in the flow)
            content_name    = self.util_stanza_get_attribute(cur_content, 'name');
            content_senders = self.get_senders(content_name) || self.util_stanza_get_attribute(cur_content, 'senders');
            content_creator = self.get_creator(content_name) || self.util_stanza_get_attribute(cur_content, 'creator');

            self._set_name(content_name);
            self._set_senders(content_name, content_senders);
            self._set_creator(content_name, content_creator);

            // Payloads (non-destructive setters / cumulative)
            self._set_payloads_remote_add(
              content_name,
              self._util_stanza_parse_payload(cur_content)
            );

            // Candidates (enqueue them for ICE processing, too)
            cur_candidate = self._util_stanza_parse_candidate(cur_content);

            self._set_candidates_remote_add(
              content_name,
              cur_candidate
            );

            self._set_candidates_queue_remote(
              content_name,
              cur_candidate
            );
          }

          return true;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_content > ' + e, 1);
    }

    return false;
  };

  /**
   * @private
   */
  self._util_stanza_parse_group = function(stanza) {
    try {
      var i, j,
          jingle,
          group, cur_group,
          content, cur_content, group_content_names;

      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        group = self.util_stanza_get_element(jingle, 'group', NS_JINGLE_APPS_GROUPING);

        if(group && group.length) {
          for(i = 0; i < group.length; i++) {
            cur_group = group[i];
            group_content_names = [];

            // Attrs
            group_semantics = self.util_stanza_get_attribute(cur_group, 'semantics');

            // Contents
            content = self.util_stanza_get_element(cur_group, 'content', NS_JINGLE_APPS_GROUPING);

            for(j = 0; j < content.length; j++) {
              cur_content = content[j];

              // Content attrs
              group_content_names.push(
                self.util_stanza_get_attribute(cur_content, 'name')
              );
            }

            // Payloads (non-destructive setters / cumulative)
            self._set_group_remote(
              group_semantics,
              group_content_names
            );
          }
        }
      }

      return true;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_group > ' + e, 1);
    }

    return false;
  };

  /**
   * @private
   */
  self._util_stanza_parse_payload = function(stanza_content) {
    var payload_obj = {
      descriptions : {},
      transports   : {}
    };

    try {
      // Common vars
      var j, error,
          cur_payload, cur_payload_arr, cur_payload_id;

      // Common functions
      var init_content = function() {
        var ic_key;
        var ic_arr = {
          'attrs'      : {},
          'rtcp-fb'    : [],
          'bandwidth'  : [],
          'payload'    : {},
          'rtp-hdrext' : [],
          'rtcp-mux'   : 0,

          'encryption' : {
            'attrs'     : {},
            'crypto'    : [],
            'zrtp-hash' : []
          }
        };

        for(ic_key in ic_arr)
          if(!(ic_key in payload_obj.descriptions))  payload_obj.descriptions[ic_key] = ic_arr[ic_key];
      };

      var init_payload = function(id) {
        var ip_key;
        var ip_arr = {
          'attrs'           : {},
          'parameter'       : [],
          'rtcp-fb'         : [],
          'rtcp-fb-trr-int' : []
        };

        if(!(id in payload_obj.descriptions.payload))  payload_obj.descriptions.payload[id] = {};

        for(ip_key in ip_arr)
          if(!(ip_key in payload_obj.descriptions.payload[id]))  payload_obj.descriptions.payload[id][ip_key] = ip_arr[ip_key];
      };

      // Parse session description
      var description = self.util_stanza_get_element(stanza_content, 'description', NS_JINGLE_APPS_RTP);

      if(description.length) {
        description = description[0];

        var cd_media = self.util_stanza_get_attribute(description, 'media');
        var cd_ssrc  = self.util_stanza_get_attribute(description, 'ssrc');

        if(!cd_media)
          self.get_debug().log('[JSJaCJingle] util_stanza_parse_payload > No media attribute to ' + cc_name + ' stanza.', 1);

        // Initialize current description
        init_content();

        payload_obj.descriptions.attrs.media = cd_media;
        payload_obj.descriptions.attrs.ssrc  = cd_ssrc;

        // Loop on multiple payloads
        var payload = self.util_stanza_get_element(description, 'payload-type', NS_JINGLE_APPS_RTP);

        if(payload.length) {
          for(j = 0; j < payload.length; j++) {
            error           = 0;
            cur_payload     = payload[j];
            cur_payload_arr = {};

            cur_payload_arr.channels  = self.util_stanza_get_attribute(cur_payload, 'channels');
            cur_payload_arr.clockrate = self.util_stanza_get_attribute(cur_payload, 'clockrate');
            cur_payload_arr.id        = self.util_stanza_get_attribute(cur_payload, 'id') || error++;
            cur_payload_arr.name      = self.util_stanza_get_attribute(cur_payload, 'name');

            payload_obj.descriptions.attrs.ptime     = self.util_stanza_get_attribute(cur_payload, 'ptime');
            payload_obj.descriptions.attrs.maxptime  = self.util_stanza_get_attribute(cur_payload, 'maxptime');

            if(error !== 0) continue;

            // Initialize current payload
            cur_payload_id = cur_payload_arr.id;
            init_payload(cur_payload_id);

            // Push current payload
            payload_obj.descriptions.payload[cur_payload_id].attrs = cur_payload_arr;

            // Loop on multiple parameters
            self._util_stanza_parse_node(
              cur_payload,
              'parameter',
              NS_JINGLE_APPS_RTP,
              payload_obj.descriptions.payload[cur_payload_id].parameter,
              [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
            );

            // Loop on multiple RTCP-FB
            self._util_stanza_parse_node(
              cur_payload,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb'],
              [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
            );

            // Loop on multiple RTCP-FB-TRR-INT
            self._util_stanza_parse_node(
              cur_payload,
              'rtcp-fb-trr-int',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb-trr-int'],
              [ { n: 'value', r: 1 } ]
            );
          }
        }

        // Parse the encryption element
        var encryption = self.util_stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

        if(encryption.length) {
          encryption = encryption[0];

          payload_obj.descriptions.encryption.attrs.required = self.util_stanza_get_attribute(encryption, 'required') || '0';

          // Loop on multiple cryptos
          self._util_stanza_parse_node(
            encryption,
            'crypto',
            NS_JINGLE_APPS_RTP,
            payload_obj.descriptions.encryption.crypto,
            [ { n: 'crypto-suite', r: 1 }, { n: 'key-params', r: 1 }, { n: 'session-params', r: 0 }, { n: 'tag', r: 1 } ]
          );

          // Loop on multiple zrtp-hash
          self._util_stanza_parse_node(
            encryption,
            'zrtp-hash',
            NS_JINGLE_APPS_RTP_ZRTP,
            payload_obj.descriptions.encryption['zrtp-hash'],
            [ { n: 'version', r: 1 } ],
            { n: 'value', r: 1 }
          );
        }

        // Loop on common RTCP-FB
        self._util_stanza_parse_node(
          description,
          'rtcp-fb',
          NS_JINGLE_APPS_RTP_RTCP_FB,
          payload_obj.descriptions['rtcp-fb'],
          [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
        );

        // Loop on bandwidth
        self._util_stanza_parse_node(
          description,
          'bandwidth',
          NS_JINGLE_APPS_RTP,
          payload_obj.descriptions.bandwidth,
          [ { n: 'type', r: 1 } ],
          { n: 'value', r: 1 }
        );

        // Parse the RTP-HDREXT element
        self._util_stanza_parse_node(
          description,
          'rtp-hdrext',
          NS_JINGLE_APPS_RTP_RTP_HDREXT,
          payload_obj.descriptions['rtp-hdrext'],
          [ { n: 'id', r: 1 }, { n: 'uri', r: 1 }, { n: 'senders', r: 0 } ]
        );

        // Parse the RTCP-MUX element
        var rtcp_mux = self.util_stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

        if(rtcp_mux.length) {
          payload_obj.descriptions['rtcp-mux'] = 1;
        }
      }

      // Parse transport (need to get 'ufrag' and 'pwd' there)
      var transport = self.util_stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(transport.length) {
        payload_obj.transports.pwd          = self.util_stanza_get_attribute(transport, 'pwd');
        payload_obj.transports.ufrag        = self.util_stanza_get_attribute(transport, 'ufrag');

        var fingerprint = self.util_stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

        if(fingerprint.length) {
          payload_obj.transports.fingerprint          = {};
          payload_obj.transports.fingerprint.setup = self.util_stanza_get_attribute(fingerprint, 'setup');
          payload_obj.transports.fingerprint.hash  = self.util_stanza_get_attribute(fingerprint, 'hash');
          payload_obj.transports.fingerprint.value = self.util_stanza_get_value(fingerprint);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_payload > ' + e, 1);
    }

    return payload_obj;
  };

  /**
   * @private
   */
  self._util_stanza_parse_candidate = function(stanza_content) {
    var candidate_arr = [];

    try {
      // Common vars
      var i,
          transport, candidate,
          cur_candidate, cur_candidate_obj;

      // Parse transport candidates
      transport = self.util_stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);
      
      if(transport.length) {
        self._util_stanza_parse_node(
          transport,
          'candidate',
          NS_JINGLE_TRANSPORTS_ICEUDP,
          candidate_arr,

          [
            { n: 'component',  r: 1 },
            { n: 'foundation', r: 1 },
            { n: 'generation', r: 1 },
            { n: 'id',         r: 1 },
            { n: 'ip',         r: 1 },
            { n: 'network',    r: 1 },
            { n: 'port',       r: 1 },
            { n: 'priority',   r: 1 },
            { n: 'protocol',   r: 1 },
            { n: 'rel-addr',   r: 0 },
            { n: 'rel-port',   r: 0 },
            { n: 'type',       r: 1 }
          ]
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_candidate > ' + e, 1);
    }

    return candidate_arr;
  };

  /*
   * @private
   */
  self._util_stanza_build_node = function(doc, parent, children, name, ns, value) {
    var node = null;

    try {
      var i, child, attr;

      if(children && children.length) {
        for(i in children) {
          child = children[i];

          if(!child) continue;

          node = parent.appendChild(doc.buildNode(
            name,
            { 'xmlns': ns },
            (value && child[value]) ? child[value] : null
          ));

          for(attr in child)
            if(attr != value)  self.util_stanza_set_attribute(node, attr, child[attr]);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_build_node > name: ' + name + ' > ' + e, 1);
    }

    return node;
  };

  /**
   * @private
   */
  self._util_stanza_generate_jingle = function(stanza, attrs) {
    var jingle = null;

    try {
      var cur_attr;

      jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', { 'xmlns': NS_JINGLE }));

      if(!attrs.sid) attrs.sid = self.get_sid();

      for(cur_attr in attrs) self.util_stanza_set_attribute(jingle, cur_attr, attrs[cur_attr]);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_jingle > ' + e, 1);
    }

    return jingle;
  };

  /**
   * @private
   */
  self._util_stanza_generate_session_info = function(stanza, jingle, args) {
    try {
      var info = jingle.appendChild(stanza.buildNode(args.info, { 'xmlns': NS_JINGLE_APPS_RTP_INFO }));

      // Info attributes
      switch(args.info) {
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          self.util_stanza_set_attribute(info, 'creator', self.get_creator_this());
          self.util_stanza_set_attribute(info, 'name',    args.name);

          break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_session_info > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_generate_content_local = function(stanza, jingle, override_content) {
    try {
      var cur_media;
      var content_local = override_content ? override_content : self._get_content_local();

      for(cur_media in content_local) {
        var cur_content = content_local[cur_media];

        var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': NS_JINGLE }));

        self.util_stanza_set_attribute(content, 'creator', cur_content.creator);
        self.util_stanza_set_attribute(content, 'name',    cur_content.name);
        self.util_stanza_set_attribute(content, 'senders', cur_content.senders);

        // Build description (if action type allows that element)
        if(self.util_stanza_get_attribute(jingle, 'action') != JSJAC_JINGLE_ACTION_TRANSPORT_INFO) {
          var cs_description  = cur_content.description;
          var cs_d_attrs      = cs_description.attrs;
          var cs_d_rtcp_fb    = cs_description['rtcp-fb'];
          var cs_d_bandwidth  = cs_description.bandwidth;
          var cs_d_payload    = cs_description.payload;
          var cs_d_encryption = cs_description.encryption;
          var cs_d_rtp_hdrext = cs_description['rtp-hdrext'];
          var cs_d_rtcp_mux   = cs_description['rtcp-mux'];

          var description = self._util_stanza_build_node(
                              stanza, content,
                              [cs_d_attrs],
                              'description',
                              NS_JINGLE_APPS_RTP
                            );

          // Payload-type
          if(cs_d_payload) {
            var i, cs_d_p, payload_type;

            for(i in cs_d_payload) {
              cs_d_p = cs_d_payload[i];

              payload_type = self._util_stanza_build_node(
                               stanza,
                               description,
                               [cs_d_p.attrs],
                               'payload-type',
                               NS_JINGLE_APPS_RTP
                             );

              // Parameter
              self._util_stanza_build_node(
                stanza,
                payload_type,
                cs_d_p.parameter,
                'parameter',
                NS_JINGLE_APPS_RTP
              );

              // RTCP-FB (sub)
              self._util_stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb'],
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );

              // RTCP-FB-TRR-INT
              self._util_stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb-trr-int'],
                'rtcp-fb-trr-int',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );
            }

            // Encryption
            if(cs_d_encryption && 
               (cs_d_encryption.crypto && cs_d_encryption.crypto.length || 
                cs_d_encryption['zrtp-hash'] && cs_d_encryption['zrtp-hash'].length)) {
              var encryption = description.appendChild(stanza.buildNode('encryption', { 'xmlns': NS_JINGLE_APPS_RTP }));

              self.util_stanza_set_attribute(encryption, 'required', (cs_d_encryption.attrs.required || '0'));

              // Crypto
              self._util_stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption.crypto,
                'crypto',
                NS_JINGLE_APPS_RTP
              );

              // ZRTP-HASH
              self._util_stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption['zrtp-hash'],
                'zrtp-hash',
                NS_JINGLE_APPS_RTP_ZRTP,
                'value'
              );
            }

            // RTCP-FB (common)
            self._util_stanza_build_node(
              stanza,
              description,
              cs_d_rtcp_fb,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB
            );

            // Bandwidth
            self._util_stanza_build_node(
              stanza,
              description,
              cs_d_bandwidth,
              'bandwidth',
              NS_JINGLE_APPS_RTP,
              'value'
            );

            // RTP-HDREXT
            self._util_stanza_build_node(
              stanza,
              description,
              cs_d_rtp_hdrext,
              'rtp-hdrext',
              NS_JINGLE_APPS_RTP_RTP_HDREXT
            );

            // RTCP-MUX
            if(cs_d_rtcp_mux)
              description.appendChild(stanza.buildNode('rtcp-mux', { 'xmlns': NS_JINGLE_APPS_RTP }));
          }
        }

        // Build transport
        var cs_transport = cur_content.transport;

        var transport = self._util_stanza_build_node(
                          stanza,
                          content,
                          [cs_transport.attrs],
                          'transport',
                          NS_JINGLE_TRANSPORTS_ICEUDP
                        );

        // Fingerprint
        self._util_stanza_build_node(
          stanza,
          transport,
          [cs_transport.fingerprint],
          'fingerprint',
          NS_JINGLE_APPS_DTLS,
          'value'
        );

        // Candidates
        self._util_stanza_build_node(
          stanza,
          transport,
          cs_transport.candidate,
          'candidate',
          NS_JINGLE_TRANSPORTS_ICEUDP
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_content_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_generate_group_local = function(stanza, jingle) {
    try {
      var i,
          cur_semantics, cur_group, cur_group_name,
          group;

      var group_local = self._get_group_local();

      for(cur_semantics in group_local) {
        cur_group = group_local[cur_semantics];

        group = jingle.appendChild(stanza.buildNode('group', {
          'xmlns': NS_JINGLE_APPS_GROUPING,
          'semantics': cur_semantics
        }));

        for(i in cur_group) {
          cur_group_name = cur_group[i];

          group.appendChild(stanza.buildNode('content', {
            'xmlns': NS_JINGLE_APPS_GROUPING,
            'name': cur_group_name
          }));
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_group_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_generate_content = function(creator, name, senders, payloads, transports) {
    var content_obj = {};

    try {
      // Generation process
      content_obj.creator     = creator;
      content_obj.name        = name;
      content_obj.senders     = senders;
      content_obj.description = {};
      content_obj.transport   = {};

      // Generate description
      var i;
      var description_cpy      = self.util_object_clone(payloads.descriptions);
      var description_ptime    = description_cpy.attrs.ptime;
      var description_maxptime = description_cpy.attrs.maxptime;

      if(description_ptime)     delete description_cpy.attrs.ptime;
      if(description_maxptime)  delete description_cpy.attrs.maxptime;

      for(i in description_cpy.payload) {
        if(!('attrs' in description_cpy.payload[i]))
          description_cpy.payload[i].attrs           = {};

        description_cpy.payload[i].attrs.ptime    = description_ptime;
        description_cpy.payload[i].attrs.maxptime = description_maxptime;
      }

      content_obj.description = description_cpy;

      // Generate transport
      content_obj.transport.candidate      = transports;
      content_obj.transport.attrs          = {};
      content_obj.transport.attrs.pwd   = payloads.transports ? payloads.transports.pwd   : null;
      content_obj.transport.attrs.ufrag = payloads.transports ? payloads.transports.ufrag : null;

      if(payloads.transports && payloads.transports.fingerprint)
        content_obj.transport.fingerprint  = payloads.transports.fingerprint;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_generate_content > ' + e, 1);
    }

    return content_obj;
  };

  /**
   * @private
   */
  self._util_build_content_local = function() {
    try {
      var cur_name;

      for(cur_name in self.get_name()) {
        self._set_content_local(
          cur_name,

          self._util_generate_content(
            JSJAC_JINGLE_SENDERS_INITIATOR.jingle,
            cur_name,
            self.get_senders(cur_name),
            self._get_payloads_local(cur_name),
            self._get_candidates_local(cur_name)
          )
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_build_content_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_build_content_remote = function() {
    try {
      var cur_name;

      for(cur_name in self.get_name()) {
        self._set_content_remote(
          cur_name,

          self._util_generate_content(
            self.get_creator(cur_name),
            cur_name,
            self.get_senders(cur_name),
            self._get_payloads_remote(cur_name),
            self._get_candidates_remote(cur_name)
          )
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_build_content_remote > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_name_generate = function(media) {
    var name = null;

    try {
      var i, cur_name;

      var content_all = [
        self._get_content_remote(),
        self._get_content_local()
      ];

      for(i in content_all) {
        for(cur_name in content_all[i]) {
          try {
            if(content_all[i][cur_name].description.attrs.media == media) {
              name = cur_name; break;
            }
          } catch(e) {}
        }

        if(name) break;
      }

      if(!name) name = media;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_name_generate > ' + e, 1);
    }

    return name;
  };

  /**
   * @private
   */
  self._util_media_generate = function(name) {
    var cur_media;
    var media = null;

    try {
      if(typeof name == 'number') {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == parseInt(JSJAC_JINGLE_MEDIAS[cur_media].label, 10)) {
            media = cur_media; break;
          }
        }
      } else {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == self._util_name_generate(cur_media)) {
            media = cur_media; break;
          }
        }
      }

      if(!media)  media = name;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_media_generate > ' + e, 1);
    }

    return media;
  };

  /**
   * @private
   */
  self._util_sdp_generate = function(type, group, payloads, candidates) {
    try {
      var sdp_obj = {};

      sdp_obj.candidates  = self._util_sdp_generate_candidates(candidates);
      sdp_obj.description = self._util_sdp_generate_description(type, group, payloads, sdp_obj.candidates);

      return sdp_obj;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate > ' + e, 1);
    }

    return {};
  };

  /**
   * @private
   */
  self._util_sdp_generate_candidates = function(candidates) {
    var candidates_arr = [];

    try {
      // Parse candidates
      var i,
          cur_media, cur_name, cur_c_name, cur_candidate, cur_label, cur_id, cur_candidate_str;

      for(cur_name in candidates) {
        cur_c_name = candidates[cur_name];
        cur_media   = self._util_media_generate(cur_name);

        for(i in cur_c_name) {
          cur_candidate = cur_c_name[i];

          cur_label         = JSJAC_JINGLE_MEDIAS[cur_media].label;
          cur_id            = cur_label;
          cur_candidate_str = '';

          cur_candidate_str += 'a=candidate:';
          cur_candidate_str += cur_candidate.foundation;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.component;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.protocol;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.priority;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.ip;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.port;
          cur_candidate_str += ' ';
          cur_candidate_str += 'typ';
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.type;

          if(cur_candidate['rel-addr'] && cur_candidate['rel-port']) {
            cur_candidate_str += ' ';
            cur_candidate_str += 'raddr';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate['rel-addr'];
            cur_candidate_str += ' ';
            cur_candidate_str += 'rport';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate['rel-port'];
          }

          if(cur_candidate.generation) {
            cur_candidate_str += ' ';
            cur_candidate_str += 'generation';
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.generation;
          }

          cur_candidate_str   += WEBRTC_SDP_LINE_BREAK;

          candidates_arr.push({
            label     : cur_label,
            id        : cur_id,
            candidate : cur_candidate_str
          });
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_candidates > ' + e, 1);
    }

    return candidates_arr;
  };

  /**
   * @private
   */
  self._util_sdp_generate_description = function(type, group, payloads, sdp_candidates) {
    var payloads_obj = {};

    try {
      var payloads_str = '';

      // Common vars
      var i, c, j, k, l, m, n, o, p, q, r, s, t,
          cur_name, cur_name_obj,
          cur_media, cur_senders,
          cur_group_semantics, cur_group_names, cur_group_name,
          cur_transports_obj, cur_description_obj,
          cur_d_pwd, cur_d_ufrag, cur_d_fingerprint,
          cur_d_attrs, cur_d_rtcp_fb, cur_d_bandwidth, cur_d_encryption, cur_d_ssrc,
          cur_d_ssrc_obj, cur_d_rtcp_fb_obj,
          cur_d_payload, cur_d_payload_obj, cur_d_payload_obj_attrs, cur_d_payload_obj_id,
          cur_d_payload_obj_parameter, cur_d_payload_obj_parameter_obj, cur_d_payload_obj_parameter_str,
          cur_d_payload_obj_rtcp_fb, cur_d_payload_obj_rtcp_fb_obj,
          cur_d_payload_obj_rtcp_fb_ttr_int, cur_d_payload_obj_rtcp_fb_ttr_int_obj,
          cur_d_crypto_obj, cur_d_zrtp_hash_obj,
          cur_d_rtp_hdrext, cur_d_rtp_hdrext_obj,
          cur_d_rtcp_mux;

      // Payloads headers
      payloads_str += self._util_sdp_generate_protocol_version();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_origin();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_session_name();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_timing();
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      // Add groups
      for(cur_group_semantics in group) {
        cur_group_names = group[cur_group_semantics];

        payloads_str += 'a=group:' + cur_group_semantics;

        for(t in cur_group_names) {
          cur_group_name = cur_group_names[t];
          payloads_str += ' ' + cur_group_name;
        }

        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // Add media groups
      for(cur_name in payloads) {
        cur_name_obj          = payloads[cur_name];
        cur_senders           = self.get_senders(cur_name);
        cur_media             = self.get_name(cur_name) ? self._util_media_generate(cur_name) : null;

        // No media?
        if(!cur_media) continue;

        // Transports
        cur_transports_obj    = cur_name_obj.transports || {};
        cur_d_pwd             = cur_transports_obj.pwd;
        cur_d_ufrag           = cur_transports_obj.ufrag;
        cur_d_fingerprint     = cur_transports_obj.fingerprint;

        // Descriptions
        cur_description_obj   = cur_name_obj.descriptions;
        cur_d_attrs           = cur_description_obj.attrs;
        cur_d_rtcp_fb         = cur_description_obj['rtcp-fb'];
        cur_d_bandwidth       = cur_description_obj.bandwidth;
        cur_d_payload         = cur_description_obj.payload;
        cur_d_encryption      = cur_description_obj.encryption;
        cur_d_ssrc            = cur_description_obj.ssrc;
        cur_d_rtp_hdrext      = cur_description_obj['rtp-hdrext'];
        cur_d_rtcp_mux        = cur_description_obj['rtcp-mux'];

        // Current media
        payloads_str += self._util_sdp_generate_description_media(cur_media, cur_d_encryption, cur_d_fingerprint, cur_d_payload);
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        payloads_str += 'c=IN IP4 0.0.0.0';
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += 'a=rtcp:1 IN IP4 0.0.0.0';
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        if(cur_d_ufrag)  payloads_str += 'a=ice-ufrag:' + cur_d_ufrag + WEBRTC_SDP_LINE_BREAK;
        if(cur_d_pwd)    payloads_str += 'a=ice-pwd:' + cur_d_pwd + WEBRTC_SDP_LINE_BREAK;

        // Fingerprint
        if(cur_d_fingerprint) {
          if(cur_d_fingerprint.hash && cur_d_fingerprint.value) {
            payloads_str += 'a=fingerprint:' + cur_d_fingerprint.hash + ' ' + cur_d_fingerprint.value;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          if(cur_d_fingerprint.setup) {
            payloads_str += 'a=setup:' + cur_d_fingerprint.setup;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // RTP-HDREXT
        if(cur_d_rtp_hdrext && cur_d_rtp_hdrext.length) {
          for(i in cur_d_rtp_hdrext) {
            cur_d_rtp_hdrext_obj = cur_d_rtp_hdrext[i];

            payloads_str += 'a=extmap:' + cur_d_rtp_hdrext_obj.id;

            if(cur_d_rtp_hdrext_obj.senders)
              payloads_str += '/' + cur_d_rtp_hdrext_obj.senders;

            payloads_str += ' ' + cur_d_rtp_hdrext_obj.uri;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Senders
        if(cur_senders) {
          payloads_str += 'a=' + JSJAC_JINGLE_SENDERS[cur_senders];
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // Name
        if(cur_media && JSJAC_JINGLE_MEDIAS[cur_media]) {
          payloads_str += 'a=mid:' + (JSJAC_JINGLE_MEDIAS[cur_media]).label;
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // RTCP-MUX
        // WARNING: no spec!
        // See: http://code.google.com/p/libjingle/issues/detail?id=309
        //      http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
        if(cur_d_rtcp_mux) {
          payloads_str += 'a=rtcp-mux';
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'encryption'
        if(cur_d_encryption) {
          // 'crypto'
          for(j in cur_d_encryption.crypto) {
            cur_d_crypto_obj = cur_d_encryption.crypto[j];

            payloads_str += 'a=crypto:'                       + 
                            cur_d_crypto_obj.tag           + ' ' + 
                            cur_d_crypto_obj['crypto-suite']  + ' ' + 
                            cur_d_crypto_obj['key-params']    + 
                            (cur_d_crypto_obj['session-params'] ? (' ' + cur_d_crypto_obj['session-params']) : '');

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'zrtp-hash'
          for(p in cur_d_encryption['zrtp-hash']) {
            cur_d_zrtp_hash_obj = cur_d_encryption['zrtp-hash'][p];

            payloads_str += 'a=zrtp-hash:'                  + 
                            cur_d_zrtp_hash_obj.version  + ' ' + 
                            cur_d_zrtp_hash_obj.value;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // 'rtcp-fb' (common)
        for(n in cur_d_rtcp_fb) {
          cur_d_rtcp_fb_obj = cur_d_rtcp_fb[n];

          payloads_str += 'a=rtcp-fb:*';
          payloads_str += ' ' + cur_d_rtcp_fb_obj.type;

          if(cur_d_rtcp_fb_obj.subtype)
            payloads_str += ' ' + cur_d_rtcp_fb_obj.subtype;

          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'bandwidth' (common)
        for(q in cur_d_bandwidth) {
          cur_d_bandwidth_obj = cur_d_bandwidth[q];

          payloads_str += 'b=' + cur_d_bandwidth_obj.type;
          payloads_str += ':'  + cur_d_bandwidth_obj.value;
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'payload-type'
        for(k in cur_d_payload) {
          cur_d_payload_obj                 = cur_d_payload[k];
          cur_d_payload_obj_attrs           = cur_d_payload_obj.attrs;
          cur_d_payload_obj_parameter       = cur_d_payload_obj.parameter;
          cur_d_payload_obj_rtcp_fb         = cur_d_payload_obj['rtcp-fb'];
          cur_d_payload_obj_rtcp_fb_ttr_int = cur_d_payload_obj['rtcp-fb-trr-int'];

          cur_d_payload_obj_id              = cur_d_payload_obj_attrs.id;

          payloads_str += 'a=rtpmap:' + cur_d_payload_obj_id;

          // 'rtpmap'
          if(cur_d_payload_obj_attrs.name) {
            payloads_str += ' ' + cur_d_payload_obj_attrs.name;

            if(cur_d_payload_obj_attrs.clockrate) {
              payloads_str += '/' + cur_d_payload_obj_attrs.clockrate;

              if(cur_d_payload_obj_attrs.channels)
                payloads_str += '/' + cur_d_payload_obj_attrs.channels;
            }
          }

          payloads_str += WEBRTC_SDP_LINE_BREAK;

          // 'parameter'
          if(cur_d_payload_obj_parameter.length) {
            payloads_str += 'a=fmtp:' + cur_d_payload_obj_id + ' ';
            cur_d_payload_obj_parameter_str = '';

            for(o in cur_d_payload_obj_parameter) {
              cur_d_payload_obj_parameter_obj = cur_d_payload_obj_parameter[o];

              if(cur_d_payload_obj_parameter_str)  cur_d_payload_obj_parameter_str += ';';

              cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.name;

              if(cur_d_payload_obj_parameter_obj.value !== null) {
                cur_d_payload_obj_parameter_str += '=';
                cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.value;
              }
            }

            payloads_str += cur_d_payload_obj_parameter_str;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'rtcp-fb' (sub)
          for(l in cur_d_payload_obj_rtcp_fb) {
            cur_d_payload_obj_rtcp_fb_obj = cur_d_payload_obj_rtcp_fb[l];

            payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
            payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.type;

            if(cur_d_payload_obj_rtcp_fb_obj.subtype)
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.subtype;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'rtcp-fb-ttr-int'
          for(m in cur_d_payload_obj_rtcp_fb_ttr_int) {
            cur_d_payload_obj_rtcp_fb_ttr_int_obj = cur_d_payload_obj_rtcp_fb_ttr_int[m];

            payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
            payloads_str += ' ' + 'trr-int';
            payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_ttr_int_obj.value;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        if(cur_d_attrs.ptime)     payloads_str += 'a=ptime:'    + cur_d_attrs.ptime + WEBRTC_SDP_LINE_BREAK;
        if(cur_d_attrs.maxptime)  payloads_str += 'a=maxptime:' + cur_d_attrs.maxptime + WEBRTC_SDP_LINE_BREAK;

        // 'ssrc' (not used in Jingle ATM)
        for(r in cur_d_ssrc) {
          for(s in cur_d_ssrc[r]) {
            cur_d_ssrc_obj = cur_d_ssrc[r][s];

            payloads_str += 'a=ssrc';
            payloads_str += ':' + cur_d_ssrc_obj.id;
            payloads_str += ' ' + cur_d_ssrc_obj.attribute;

            if(cur_d_ssrc_obj.value)
              payloads_str += ':' + cur_d_ssrc_obj.value;

            if(cur_d_ssrc_obj.data)
              payloads_str += ' ' + cur_d_ssrc_obj.data;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Candidates (some browsers require them there, too)
        if(typeof sdp_candidates == 'object') {
          for(c in sdp_candidates) {
            if((sdp_candidates[c]).label == JSJAC_JINGLE_MEDIAS[cur_media].label)
              payloads_str += (sdp_candidates[c]).candidate;
          }
        }
      }

      // Push to object
      payloads_obj.type = type;
      payloads_obj.sdp  = payloads_str;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_description > ' + e, 1);
    }

    return payloads_obj;
  };

  /**
   * @private
   */
  self._util_sdp_generate_protocol_version = function() {
    return 'v=0';
  };

  /**
   * @private
   */
  self._util_sdp_generate_origin = function() {
    var sdp_origin = '';

    try {
      // Values
      var jid = new JSJaCJID(self.get_initiator());

      var username        = jid.getNode()   ? jid.getNode()   : '-';
      var session_id      = '1';
      var session_version = '1';
      var nettype         = 'IN';
      var addrtype        = 'IP4';
      var unicast_address = jid.getDomain() ? jid.getDomain() : '127.0.0.1';

      // Line content
      sdp_origin += 'o=';
      sdp_origin += username + ' ';
      sdp_origin += session_id + ' ';
      sdp_origin += session_version + ' ';
      sdp_origin += nettype + ' ';
      sdp_origin += addrtype + ' ';
      sdp_origin += unicast_address;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_origin > ' + e, 1);
    }

    return sdp_origin;
  };

  /**
   * @private
   */
  self._util_sdp_generate_session_name = function() {
    return 's=' + (self.get_sid() || '-');
  };

  /**
   * @private
   */
  self._util_sdp_generate_timing = function() {
    return 't=0 0';
  };

  /**
   * @private
   */
  self._util_sdp_generate_description_media = function(media, crypto, fingerprint, payload) {
    var sdp_media = '';

    try {
      var i;
      var type_ids = [];

      sdp_media += 'm=' + media + ' 1 ';

      // Protocol
      if((crypto && crypto.length) || (fingerprint && fingerprint.hash && fingerprint.value))
        sdp_media += 'RTP/SAVPF';
      else
        sdp_media += 'RTP/AVPF';

      // Payload type IDs
      for(i in payload)  type_ids.push(payload[i].attrs.id);

      sdp_media += ' ' + type_ids.join(' ');
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_description_media > ' + e, 1);
    }

    return sdp_media;
  };

  /**
   * Generates a random SID value
   * @return SID value
   * @type string
   */
  self.util_generate_sid = function() {
    return cnonce(16);
  };

  /**
   * Generates a random ID value
   * @return ID value
   * @type string
   */
  self.util_generate_id = function() {
    return cnonce(10);
  };

  /**
   * Generates the constraints object
   * @return constraints object
   * @type object
   */
  self.util_generate_constraints = function() {
    var constraints = {
      audio : false,
      video : false
    };

    try {
      // Medias?
      constraints.audio = true;
      constraints.video = (self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO);

      // Video configuration
      if(constraints.video === true) {
        // Resolution?
        switch(self.get_resolution()) {
          // 16:9
          case '720':
          case 'hd':
            constraints.video = {
              mandatory : {
                minWidth       : 1280,
                minHeight      : 720,
                minAspectRatio : 1.77
              }
            };
            break;

          case '360':
          case 'md':
            constraints.video = {
              mandatory : {
                minWidth       : 640,
                minHeight      : 360,
                minAspectRatio : 1.77
              }
            };
            break;

          case '180':
          case 'sd':
            constraints.video = {
              mandatory : {
                minWidth       : 320,
                minHeight      : 180,
                minAspectRatio : 1.77
              }
            };
            break;

          // 4:3
          case '960':
            constraints.video = {
              mandatory : {
                minWidth  : 960,
                minHeight : 720
              }
            };
            break;

          case '640':
          case 'vga':
            constraints.video = {
              mandatory : {
                maxWidth  : 640,
                maxHeight : 480
              }
            };
            break;

          case '320':
            constraints.video = {
              mandatory : {
                maxWidth  : 320,
                maxHeight : 240
              }
            };
            break;
        }

        // Bandwidth?
        if(self.get_bandwidth())
          constraints.video.optional = [{ bandwidth: self.get_bandwidth() }];

        // FPS?
        if(self.get_fps())
          constraints.video.mandatory.minFrameRate = self.get_fps();

        // Custom video source? (screenshare)
        if(self.get_media()        == JSJAC_JINGLE_MEDIA_VIDEO         && 
           self.get_video_source() != JSJAC_JINGLE_VIDEO_SOURCE_CAMERA ) {
          if(document.location.protocol !== 'https:')
            self.get_debug().log('[JSJaCJingle] util_generate_constraints > HTTPS might be required to share screen, otherwise you may get a permission denied error.', 0);

          // Unsupported browser? (for that feature)
          if(self._util_browser().name != JSJAC_JINGLE_BROWSER_CHROME) {
            self.get_debug().log('[JSJaCJingle] util_generate_constraints > Video source not supported by ' + self._util_browser().name + ' (source: ' + self.get_video_source() + ').', 1);
            
            self.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);
            return;
          }

          constraints.audio           = false;
          constraints.video.mandatory = {
            'chromeMediaSource': self.get_video_source()
          };
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_generate_constraints > ' + e, 1);
    }

    return constraints;
  };

  /**
   * Returns our negotiation status
   * @return Negotiation status
   * @type string
   */
  self.util_negotiation_status = function() {
    return (self.get_initiator() == self.util_connection_jid()) ? JSJAC_JINGLE_SENDERS_INITIATOR.jingle : JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  };

  /**
   * Get my connection JID
   * @return JID value
   * @type string
   */
  self.util_connection_jid = function() {
    return JSJAC_JINGLE_STORE_CONNECTION.username + '@' + 
           JSJAC_JINGLE_STORE_CONNECTION.domain   + '/' + 
           JSJAC_JINGLE_STORE_CONNECTION.resource;
  };

  /**
   * @private
   */
  self._util_map_register_view = function(type) {
    var fn = {
      type   : null,
      mute   : false,

      view   : {
        get : null,
        set : null
      },

      stream : {
        get : null,
        set : null
      }
    };

    try {
      switch(type) {
        case 'local':
          fn.type       = type;
          fn.mute       = true;
          fn.view.get   = self.get_local_view;
          fn.view.set   = self._set_local_view;
          fn.stream.get = self._get_local_stream;
          fn.stream.set = self._set_local_stream;
          break;

        case 'remote':
          fn.type       = type;
          fn.view.get   = self.get_remote_view;
          fn.view.set   = self._set_remote_view;
          fn.stream.get = self._get_remote_stream;
          fn.stream.set = self._set_remote_stream;
          break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_map_register_view > ' + e, 1);
    }

    return fn;
  };

  /**
   * @private
   */
  self._util_map_unregister_view = function(type) {
    return self._util_map_register_view(type);
  };

  /**
   * @private
   */
  self._util_peer_stream_attach = function(element, stream, mute) {
    try {
      var i;
      var stream_src = stream ? URL.createObjectURL(stream) : '';

      for(i in element) {
        element[i].src = stream_src;

        if(navigator.mozGetUserMedia)
          element[i].play();
        else
          element[i].autoplay = true;

        if(typeof mute == 'boolean') element[i].muted = mute;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_peer_stream_attach > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_peer_stream_detach = function(element) {
    try {
      var i;

      for(i in element) {
        element[i].pause();
        element[i].src = '';
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_peer_stream_detach > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_sdp_parse_payload = function(sdp_payload) {
    var payload = {};

    try {
      if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return payload;

      // Common vars
      var lines     = sdp_payload.split('\n');
      var cur_name  = null;
      var cur_media = null;

      var common_transports = {
        'fingerprint' : {},
        'pwd'         : null,
        'ufrag'       : null
      };

      var error, i, j,
          cur_line,
          cur_fmtp, cur_fmtp_id, cur_fmtp_values, cur_fmtp_attrs, cur_fmtp_key, cur_fmtp_value,
          cur_rtpmap, cur_rtcp_fb, cur_rtcp_fb_trr_int,
          cur_crypto, cur_zrtp_hash, cur_fingerprint, cur_ssrc, cur_extmap,
          cur_rtpmap_id, cur_rtcp_fb_id, cur_bandwidth,
          m_rtpmap, m_fmtp, m_rtcp_fb, m_rtcp_fb_trr_int, m_crypto, m_zrtp_hash,
          m_fingerprint, m_pwd, m_ufrag, m_ptime, m_maxptime, m_bandwidth, m_media, m_candidate,
          cur_check_name, cur_transport_sub;

      // Common functions
      var init_content = function(name) {
        if(!(name in payload))  payload[name] = {};
      };

      var init_descriptions = function(name, sub, sub_default) {
        init_content(name);

        if(!('descriptions' in payload[name]))        payload[name].descriptions      = {};
        if(!(sub  in payload[name].descriptions))  payload[name].descriptions[sub] = sub_default;
      };

      var init_transports = function(name, sub, sub_default) {
        init_content(name);

        if(!('transports' in payload[name]))        payload[name].transports      = {};
        if(!(sub  in payload[name].transports))  payload[name].transports[sub] = sub_default;
      };

      var init_ssrc = function(name, id) {
        init_descriptions(name, 'ssrc', {});

        if(!(id in payload[name].descriptions.ssrc))
          payload[name].descriptions.ssrc[id] = [];
      };

      var init_payload = function(name, id) {
        init_descriptions(name, 'payload', {});

        if(!(id in payload[name].descriptions.payload)) {
          payload[name].descriptions.payload[id] = {
            'attrs'           : {},
            'parameter'       : [],
            'rtcp-fb'         : [],
            'rtcp-fb-trr-int' : []
          };
        }
      };

      var init_encryption = function(name) {
        init_descriptions(name, 'encryption', {
          'attrs'     : {
            'required' : '1'
          },

          'crypto'    : [],
          'zrtp-hash' : []
        });
      };

      for(i in lines) {
        cur_line = lines[i];

        m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

        // 'audio/video' line?
        if(m_media) {
          cur_media = m_media[1];
          cur_name  = self._util_name_generate(cur_media);

          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.media = cur_media;

          continue;
        }

        m_bandwidth = (R_WEBRTC_SDP_ICE_PAYLOAD.bandwidth).exec(cur_line);

        // 'bandwidth' line?
        if(m_bandwidth) {
          // Populate current object
          error = 0;
          cur_bandwidth = {};

          cur_bandwidth.type  = m_bandwidth[1]  || error++;
          cur_bandwidth.value = m_bandwidth[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_descriptions(cur_name, 'bandwidth', []);
          payload[cur_name].descriptions.bandwidth.push(cur_bandwidth);

          continue;
        }

        m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

        // 'rtpmap' line?
        if(m_rtpmap) {
          // Populate current object
          error = 0;
          cur_rtpmap = {};

          cur_rtpmap.channels  = m_rtpmap[6];
          cur_rtpmap.clockrate = m_rtpmap[4];
          cur_rtpmap.id        = m_rtpmap[1] || error++;
          cur_rtpmap.name      = m_rtpmap[3];

          // Incomplete?
          if(error !== 0) continue;

          cur_rtpmap_id = cur_rtpmap.id;

          // Push it to parent array
          init_payload(cur_name, cur_rtpmap_id);
          payload[cur_name].descriptions.payload[cur_rtpmap_id].attrs = cur_rtpmap;

          continue;
        }

        m_fmtp = (R_WEBRTC_SDP_ICE_PAYLOAD.fmtp).exec(cur_line);

        // 'fmtp' line?
        if(m_fmtp) {
          cur_fmtp_id = m_fmtp[1];

          if(cur_fmtp_id) {
            cur_fmtp_values = m_fmtp[2] ? (m_fmtp[2]).split(';') : [];

            for(j in cur_fmtp_values) {
              // Parse current attribute
              if(cur_fmtp_values[j].indexOf('=') !== -1) {
                cur_fmtp_attrs = cur_fmtp_values[j].split('=');
                cur_fmtp_key   = cur_fmtp_attrs[0];
                cur_fmtp_value = cur_fmtp_attrs[1];

                while(cur_fmtp_key.length && !cur_fmtp_key[0])
                  cur_fmtp_key = cur_fmtp_key.substring(1);
              } else {
                cur_fmtp_key = cur_fmtp_values[j];
                cur_fmtp_value = null;
              }

              // Populate current object
              error = 0;
              cur_fmtp = {};

              cur_fmtp.name  = cur_fmtp_key    || error++;
              cur_fmtp.value = cur_fmtp_value;

              // Incomplete?
              if(error !== 0) continue;

              // Push it to parent array
              init_payload(cur_name, cur_fmtp_id);
              payload[cur_name].descriptions.payload[cur_fmtp_id].parameter.push(cur_fmtp);
            }
          }

          continue;
        }

        m_rtcp_fb = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb).exec(cur_line);

        // 'rtcp-fb' line?
        if(m_rtcp_fb) {
          // Populate current object
          error = 0;
          cur_rtcp_fb = {};

          cur_rtcp_fb.id      = m_rtcp_fb[1] || error++;
          cur_rtcp_fb.type    = m_rtcp_fb[2];
          cur_rtcp_fb.subtype = m_rtcp_fb[4];

          // Incomplete?
          if(error !== 0) continue;

          cur_rtcp_fb_id = cur_rtcp_fb.id;

          // Push it to parent array
          if(cur_rtcp_fb_id == '*') {
            init_descriptions(cur_name, 'rtcp-fb', []);
            (payload[cur_name].descriptions['rtcp-fb']).push(cur_rtcp_fb);
          } else {
            init_payload(cur_name, cur_rtcp_fb_id);
            (payload[cur_name].descriptions.payload[cur_rtcp_fb_id]['rtcp-fb']).push(cur_rtcp_fb);
          }

          continue;
        }

        m_rtcp_fb_trr_int = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb_trr_int).exec(cur_line);

        // 'rtcp-fb-trr-int' line?
        if(m_rtcp_fb_trr_int) {
          // Populate current object
          error = 0;
          cur_rtcp_fb_trr_int = {};

          cur_rtcp_fb_trr_int.id      = m_rtcp_fb_trr_int[1] || error++;
          cur_rtcp_fb_trr_int.value   = m_rtcp_fb_trr_int[2] || error++;

          // Incomplete?
          if(error !== 0) continue;

          cur_rtcp_fb_trr_int_id = cur_rtcp_fb_trr_int.id;

          // Push it to parent array
          init_payload(cur_name, cur_rtcp_fb_trr_int_id);
          (payload[cur_name].descriptions.payload[cur_rtcp_fb_trr_int_id]['rtcp-fb-trr-int']).push(cur_rtcp_fb_trr_int);

          continue;
        }

        m_crypto = (R_WEBRTC_SDP_ICE_PAYLOAD.crypto).exec(cur_line);

        // 'crypto' line?
        if(m_crypto) {
          // Populate current object
          error = 0;
          cur_crypto = {};

          cur_crypto['crypto-suite']   = m_crypto[2]  || error++;
          cur_crypto['key-params']     = m_crypto[3]  || error++;
          cur_crypto['session-params'] = m_crypto[5];
          cur_crypto.tag            = m_crypto[1]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_encryption(cur_name);
          (payload[cur_name].descriptions.encryption.crypto).push(cur_crypto);

          continue;
        }

        m_zrtp_hash = (R_WEBRTC_SDP_ICE_PAYLOAD.zrtp_hash).exec(cur_line);

        // 'zrtp-hash' line?
        if(m_zrtp_hash) {
          // Populate current object
          error = 0;
          cur_zrtp_hash = {};

          cur_zrtp_hash.version = m_zrtp_hash[1]  || error++;
          cur_zrtp_hash.value   = m_zrtp_hash[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_encryption(cur_name);
          (payload[cur_name].descriptions.encryption['zrtp-hash']).push(cur_zrtp_hash);

          continue;
        }

        m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

        // 'ptime' line?
        if(m_ptime) {
          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.ptime = m_ptime[1];

          continue;
        }

        m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

        // 'maxptime' line?
        if(m_maxptime) {
          // Push it to parent array
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.maxptime = m_maxptime[1];

          continue;
        }

        m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

        // 'ssrc' line?
        if(m_ssrc) {
          // Populate current object
          error = 0;
          cur_ssrc = {};

          cur_ssrc.id        = m_ssrc[1]  || error++;
          cur_ssrc.attribute = m_ssrc[2]  || error++;
          cur_ssrc.value     = m_ssrc[4];
          cur_ssrc.data      = m_ssrc[6];

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array (not used in Jingle ATM)
          init_ssrc(cur_name, cur_ssrc.id);
          (payload[cur_name].descriptions.ssrc[cur_ssrc.id]).push(cur_ssrc);

          // Push it to parent array (common attr required for Jingle)
          init_descriptions(cur_name, 'attrs', {});
          payload[cur_name].descriptions.attrs.ssrc = m_ssrc[1];

          continue;
        }

        m_rtcp_mux = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_mux).exec(cur_line);

        // 'rtcp-mux' line?
        if(m_rtcp_mux) {
          // Push it to parent array
          init_descriptions(cur_name, 'rtcp-mux', 1);

          continue;
        }

        m_extmap = (R_WEBRTC_SDP_ICE_PAYLOAD.extmap).exec(cur_line);

        // 'extmap' line?
        if(m_extmap) {
          // Populate current object
          error = 0;
          cur_extmap = {};

          cur_extmap.id      = m_extmap[1]  || error++;
          cur_extmap.uri     = m_extmap[4]  || error++;
          cur_extmap.senders = m_extmap[3];

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_descriptions(cur_name, 'rtp-hdrext', []);
          (payload[cur_name].descriptions['rtp-hdrext']).push(cur_extmap);

          continue;
        }

        m_fingerprint = (R_WEBRTC_SDP_ICE_PAYLOAD.fingerprint).exec(cur_line);

        // 'fingerprint' line?
        if(m_fingerprint) {
          // Populate current object
          error = 0;
          cur_fingerprint = common_transports.fingerprint || {};

          cur_fingerprint.hash  = m_fingerprint[1]  || error++;
          cur_fingerprint.value = m_fingerprint[2]  || error++;

          // Incomplete?
          if(error !== 0) continue;

          // Push it to parent array
          init_transports(cur_name, 'fingerprint', cur_fingerprint);
          common_transports.fingerprint = cur_fingerprint;

          continue;
        }

        m_setup = (R_WEBRTC_SDP_ICE_PAYLOAD.setup).exec(cur_line);

        // 'setup' line?
        if(m_setup) {
          // Populate current object
          cur_fingerprint = common_transports.fingerprint || {};
          cur_fingerprint.setup = m_setup[1];

          // Push it to parent array
          if(cur_fingerprint.setup) {
            // Map it to fingerprint as XML-wise it is related
            init_transports(cur_name, 'fingerprint', cur_fingerprint);
            common_transports.fingerprint = cur_fingerprint;
          }

          continue;
        }

        m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

        // 'pwd' line?
        if(m_pwd) {
          init_transports(cur_name, 'pwd', m_pwd[1]);

          if(!common_transports.pwd)
            common_transports.pwd = m_pwd[1];

          continue;
        }

        m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

        // 'ufrag' line?
        if(m_ufrag) {
          init_transports(cur_name, 'ufrag', m_ufrag[1]);

          if(!common_transports.ufrag)
            common_transports.ufrag = m_ufrag[1];

          continue;
        }

        // 'candidate' line? (shouldn't be there)
        m_candidate = R_WEBRTC_SDP_ICE_CANDIDATE.exec(cur_line);

        if(m_candidate) {
          self._util_sdp_parse_candidate_store({
            media     : cur_media,
            candidate : cur_line
          });

          continue;
        }
      }

      // Filter medias
      for(cur_check_name in payload) {
        // Undesired media?
        if(!self.get_name()[cur_check_name]) {
          delete payload[cur_check_name]; continue;
        }

        // Validate transports
        if(typeof payload[cur_check_name].transports !== 'object')
          payload[cur_check_name].transports = {};

        for(cur_transport_sub in common_transports) {
          if(!payload[cur_check_name].transports[cur_transport_sub])
            payload[cur_check_name].transports[cur_transport_sub] = common_transports[cur_transport_sub];
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_payload > ' + e, 1);
    }

    return payload;
  };

  /**
   * @private
   */
  self._util_sdp_parse_group = function(sdp_payload) {
    var group = {};

    try {
      if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return group;

      // Common vars
      var lines = sdp_payload.split('\n');
      var i, cur_line,
          m_group;

      var init_group = function(semantics) {
        if(!(semantics in group))  group[semantics] = [];
      };

      for(i in lines) {
        cur_line = lines[i];

        // 'group' line?
        m_group = (R_WEBRTC_SDP_ICE_PAYLOAD.group).exec(cur_line);

        if(m_group) {
          if(m_group[1] && m_group[2]) {
            init_group(m_group[1]);

            group[m_group[1]] = (m_group[2].indexOf(' ') === -1 ? [m_group[2]] : m_group[2].split(' '));
          }

          continue;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_group > ' + e, 1);
    }

    return group;
  };

  /**
   * @private
   */
  self._util_sdp_resolution_payload = function(payload) {
    try {
      if(!payload || typeof payload !== 'object') return {};

      // No video?
      if(self.get_media_all().indexOf(JSJAC_JINGLE_MEDIA_VIDEO) === -1) return payload;

      var i, j, k, cur_media;
      var cur_payload, res_arr, constraints;
      var res_height = null;
      var res_width  = null;

      // Try local view? (more reliable)
      for(i in self.get_local_view()) {
        if(typeof self.get_local_view()[i].videoWidth  == 'number'  &&
           typeof self.get_local_view()[i].videoHeight == 'number'  ) {
          res_height = self.get_local_view()[i].videoHeight;
          res_width  = self.get_local_view()[i].videoWidth;

          if(res_height && res_width)  break;
        }
      }

      // Try media constraints? (less reliable)
      if(!res_height || !res_width) {
        self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Could not get local video resolution, falling back on constraints (local video may not be ready).', 0);

        constraints = self.util_generate_constraints();

        // Still nothing?!
        if(typeof constraints.video                     !== 'object'  || 
           typeof constraints.video.mandatory           !== 'object'  || 
           typeof constraints.video.mandatory.minWidth  !== 'number'  || 
           typeof constraints.video.mandatory.minHeight !== 'number'  ) {
          self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Could not get local video resolution (not sending it).', 1);
          return payload;
        }

        res_height = constraints.video.mandatory.minHeight;
        res_width  = constraints.video.mandatory.minWidth;
      }

      // Constraints to be used
      res_arr = [
        {
          name  : 'height',
          value : res_height
        },

        {
          name  : 'width',
          value : res_width
        }
      ];

      for(cur_media in payload) {
        if(cur_media != JSJAC_JINGLE_MEDIA_VIDEO) continue;

        cur_payload = payload[cur_media].descriptions.payload;

        for(j in cur_payload) {
          if(typeof cur_payload[j].parameter !== 'object')  cur_payload[j].parameter = [];

          for(k in res_arr)
            (cur_payload[j].parameter).push(res_arr[k]);
        }
      }

      self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Got local video resolution (' + res_width + 'x' + res_height + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > ' + e, 1);
    }

    return payload;
  };

  /**
   * @private
   */
  self._util_sdp_parse_candidate = function(sdp_candidate) {
    var candidate = {};

    try {
      if(!sdp_candidate)  return candidate;

      var error     = 0;
      var matches   = R_WEBRTC_SDP_ICE_CANDIDATE.exec(sdp_candidate);

      // Matches!
      if(matches) {
        candidate.component  = matches[2]  || error++;
        candidate.foundation = matches[1]  || error++;
        candidate.generation = matches[16] || JSJAC_JINGLE_GENERATION;
        candidate.id         = self.util_generate_id();
        candidate.ip         = matches[5]  || error++;
        candidate.network    = JSJAC_JINGLE_NETWORK;
        candidate.port       = matches[6]  || error++;
        candidate.priority   = matches[4]  || error++;
        candidate.protocol   = matches[3]  || error++;
        candidate['rel-addr']   = matches[11];
        candidate['rel-port']   = matches[13];
        candidate.type       = matches[8]  || error++;
      }

      // Incomplete?
      if(error !== 0) return {};
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_candidate > ' + e, 1);
    }

    return candidate;
  };

  /**
   * @private
   */
  self._util_sdp_parse_candidate_store = function(sdp_candidate) {
    // Store received candidate
    var candidate_media = sdp_candidate.media;
    var candidate_data  = sdp_candidate.candidate;

    // Convert SDP raw data to an object
    var candidate_obj   = self._util_sdp_parse_candidate(candidate_data);

    self._set_candidates_local(
      self._util_name_generate(
        candidate_media
      ),

      candidate_obj
    );

    // Enqueue candidate
    self._set_candidates_queue_local(
      self._util_name_generate(
        candidate_media
      ),

      candidate_obj
    );
  };



  /**
   * JSJSAC JINGLE PEER API
   */

  /**
   * @private
   */
  self._peer_connection_create = function(sdp_message_callback) {
    self.get_debug().log('[JSJaCJingle] _peer_connection_create', 4);

    try {
      // Log STUN servers in use
      var i;
      var ice_config = self._util_config_ice();

      if(typeof ice_config.iceServers == 'object') {
        for(i = 0; i < (ice_config.iceServers).length; i++)
          self.get_debug().log('[JSJaCJingle] _peer_connection_create > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
      } else {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > No ICE server configured. Network may not work properly.', 0);
      }

      // Create the RTCPeerConnection object
      self._set_peer_connection(
        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Event: onicecandidate
      self._get_peer_connection().onicecandidate = function(e) {
        if(e.candidate) {
          self._util_sdp_parse_candidate_store({
            media     : (isNaN(e.candidate.sdpMid) ? e.candidate.sdpMid : self._util_media_generate(parseInt(e.candidate.sdpMid, 10))),
            candidate : e.candidate.candidate
          });
        } else {
          // Build or re-build content (local)
          self._util_build_content_local();

          // In which action stanza should candidates be sent?
          if((self.is_initiator() && self.get_status() == JSJAC_JINGLE_STATUS_INITIATING)  ||
             (self.is_responder() && self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING)) {
            self.get_debug().log('[JSJaCJingle] _peer_connection_create > onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          } else {
            self.get_debug().log('[JSJaCJingle] _peer_connection_create > onicecandidate > Got more candidates (on the go).', 2);

            // Send unsent candidates
            var candidates_queue_local = self._get_candidates_queue_local();

            if(self.util_object_length(candidates_queue_local) > 0)
              self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          self._set_candidates_queue_local(null);
        }
      };

      // Event: oniceconnectionstatechange
      self._get_peer_connection().oniceconnectionstatechange = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > oniceconnectionstatechange', 2);

        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            self._peer_timeout(this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            self._peer_timeout(this.iceConnectionState); break;
        }

        self.get_debug().log('[JSJaCJingle] _peer_connection_create > oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      };

      // Event: onaddstream
      self._get_peer_connection().onaddstream = function(e) {
        if (!e) return;

        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        self._set_remote_stream(e.stream);
      };

      // Event: onremovestream
      self._get_peer_connection().onremovestream = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        self._set_remote_stream(null);
      };

      // Add local stream
      self._get_peer_connection().addStream(self._get_local_stream()); 

      // Create offer
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > Getting local description...', 2);

      if(self.is_initiator()) {
        // Local description
        self._get_peer_connection().createOffer(self._peer_got_description, self._peer_fail_description, WEBRTC_CONFIGURATION.create_offer);

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = self._util_sdp_generate(
          WEBRTC_SDP_TYPE_OFFER,
          self._get_group_remote(),
          self._get_payloads_remote(),
          self._get_candidates_queue_remote()
        );

        if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        self._get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            self.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        self._get_peer_connection().createAnswer(self._peer_got_description, self._peer_fail_description, WEBRTC_CONFIGURATION.create_answer);

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_get_user_media = function(callback) {
    self.get_debug().log('[JSJaCJingle] _peer_get_user_media', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > Getting user media...', 2);

      (WEBRTC_GET_MEDIA.bind(navigator))(
        self.util_generate_constraints(),
        self._peer_got_user_media_success.bind(this, callback),
        self._peer_got_user_media_error.bind(this)
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_success = function(callback, stream) {
    self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Got user media.', 2);

      self._set_local_stream(stream);

      if(callback && typeof callback == 'function') {
        if((self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && self.get_local_view().length) {
          self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Waiting for local video to be loaded...', 2);

          var fn_loaded = function() {
            self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Local video loaded.', 2);

            this.removeEventListener('loadeddata', fn_loaded, false);
            callback();
          };

          self.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
        } else {
          callback();
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_error = function(error) {
    self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error', 4);

    try {
      (self._get_session_initiate_error())(self);

      // Not needed in case we are the responder (breaks termination)
      if(self.is_initiator()) self.handle_session_initiate_error();

      // Not needed in case we are the initiator (no packet sent, ever)
      if(self.is_responder()) self.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_description = function(sdp_local) {
    self.get_debug().log('[JSJaCJingle] _peer_got_description', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > Got local description.', 2);

      if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

      // Convert SDP raw data to an object
      var cur_name;
      var payload_parsed = self._util_sdp_parse_payload(sdp_local.sdp);
      self._util_sdp_resolution_payload(payload_parsed);

      for(cur_name in payload_parsed) {
        self._set_payloads_local(
          cur_name,
          payload_parsed[cur_name]
        );
      }

      var cur_semantics;
      var group_parsed = self._util_sdp_parse_group(sdp_local.sdp);

      for(cur_semantics in group_parsed) {
        self._set_group_local(
          cur_semantics,
          group_parsed[cur_semantics]
        );
      }

      // Filter our local description (remove unused medias)
      var sdp_local_desc = self._util_sdp_generate_description(
        sdp_local.type,
        self._get_group_local(),
        self._get_payloads_local(),

        self._util_sdp_generate_candidates(
          self._get_candidates_local()
        )
      );

      if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

      self._get_peer_connection().setLocalDescription(
        (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

        function() {
          // Success (descriptions are compatible)
        },

        function(e) {
          if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

          // Error (descriptions are incompatible)
        }
      );

      self.get_debug().log('[JSJaCJingle] _peer_got_description > Waiting for local candidates...', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_fail_description = function() {
    self.get_debug().log('[JSJaCJingle] _peer_fail_description', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_fail_description > Could not get local description!', 1);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_fail_description > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_sound = function(enable) {
    self.get_debug().log('[JSJaCJingle] _peer_sound', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_sound > Enable: ' + enable + ' (current: ' + self.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) + ').', 2);

      var i;
      var audio_tracks = self._get_local_stream().getAudioTracks();

      for(i = 0; i < audio_tracks.length; i++)
        audio_tracks[i].enabled = enable;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_sound > ' + e, 1);
    }
  };

  /**
   * Set a timeout limit to peer connection
   */
  self._peer_timeout = function(state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = self.get_sid();
   
      setTimeout(function() {
        // State did not change?
        if(self.get_sid() == t_sid && self._get_peer_connection().iceConnectionState == state) {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Peer timeout.', 2);

          // Error (transports are incompatible)
          self.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
        }
      }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_timeout > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_stop = function() {
    self.get_debug().log('[JSJaCJingle] _peer_stop', 4);

    // Detach media streams from DOM view
    self._set_local_stream(null);
    self._set_remote_stream(null);

    // Close the media stream
    if(self._get_peer_connection())
      self._get_peer_connection().close();

    // Remove this session from router
    JSJaCJingle_remove(self.get_sid());
  };
}



/**
 * Listens for Jingle events
 */
function JSJaCJingle_listen(args) {
  try {
    if(args && args.connection)
      JSJAC_JINGLE_STORE_CONNECTION = args.connection;

    if(args && args.initiate)
      JSJAC_JINGLE_STORE_INITIATE = args.initiate;

    if(args && args.debug)
      JSJAC_JINGLE_STORE_DEBUG = args.debug;

    // Incoming IQs handler
    JSJAC_JINGLE_STORE_CONNECTION.registerHandler('iq', JSJaCJingle_route);

    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:listen > Listening.', 2);

    // Discover available network services
    if(!args || args.extdisco !== false)
      JSJaCJingle_extdisco();
    if(args.fallback && typeof args.fallback === 'string')
      JSJaCJingle_fallback(args.fallback);
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:listen > ' + e, 1);
  }
}

/**
 * Routes Jingle stanzas
 */
function JSJaCJingle_route(stanza) {
  try {
    var action = null;
    var sid    = null;

    // Route the incoming stanza
    var jingle = stanza.getChild('jingle', NS_JINGLE);

    if(jingle) {
      sid = jingle.getAttribute('sid');
      action = jingle.getAttribute('action');
    } else {
      var stanza_id = stanza.getID();

      if(stanza_id) {
        var is_jingle = stanza_id.indexOf(JSJAC_JINGLE_STANZA_ID_PRE + '_') !== -1;

        if(is_jingle) {
          var stanza_id_split = stanza_id.split('_');
          sid = stanza_id_split[1];
        }
      }
    }

    // WebRTC not available ATM?
    if(jingle && !JSJAC_JINGLE_AVAILABLE) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:route > Dropped Jingle packet (WebRTC not available).', 0);

      (new JSJaCJingle({ to: stanza.getFrom() })).send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
    } else {
      // New session? Or registered one?
      var session_route = JSJaCJingle_read(sid);

      if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:route > New Jingle session (sid: ' + sid + ').', 2);

        JSJAC_JINGLE_STORE_INITIATE(stanza);
      } else if(sid) {
        if(session_route !== null) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:route > Routed to Jingle session (sid: ' + sid + ').', 2);

          session_route.handle(stanza);
        } else if(stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && stanza.getFrom()) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:route > Unknown Jingle session (sid: ' + sid + ').', 0);

          (new JSJaCJingle({ to: stanza.getFrom() })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        }
      }
    }
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:route > ' + e, 1);
  }
}

/**
 * Adds a new Jingle session
 */
function JSJaCJingle_add(sid, obj) {
  JSJAC_JINGLE_STORE_SESSIONS[sid] = obj;
}

/**
 * Reads a new Jingle session
 * @return Session
 * @type object
 */
function JSJaCJingle_read(sid) {
  return (sid in JSJAC_JINGLE_STORE_SESSIONS) ? JSJAC_JINGLE_STORE_SESSIONS[sid] : null;
}

/**
 * Removes a new Jingle session
 */
function JSJaCJingle_remove(sid) {
  delete JSJAC_JINGLE_STORE_SESSIONS[sid];
}

/**
 * Defer given task/execute deferred tasks
 */
function JSJaCJingle_defer(arg) {
  try {
    if(typeof arg == 'function') {
      // Deferring?
      if(JSJAC_JINGLE_STORE_DEFER.deferred) {
        (JSJAC_JINGLE_STORE_DEFER.fn).push(arg);

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:defer > Registered a function to be executed once ready.', 2);
      }

      return JSJAC_JINGLE_STORE_DEFER.deferred;
    } else if(!arg || typeof arg == 'boolean') {
      JSJAC_JINGLE_STORE_DEFER.deferred = (arg === true);

      if(JSJAC_JINGLE_STORE_DEFER.deferred === false) {
        // Execute deferred tasks?
        if((--JSJAC_JINGLE_STORE_DEFER.count) <= 0) {
          JSJAC_JINGLE_STORE_DEFER.count = 0;

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:defer > Executing ' + JSJAC_JINGLE_STORE_DEFER.fn.length + ' deferred functions...', 2);

          while(JSJAC_JINGLE_STORE_DEFER.fn.length)
            ((JSJAC_JINGLE_STORE_DEFER.fn).shift())();

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:defer > Done executing deferred functions.', 2);
        }
      } else {
        ++JSJAC_JINGLE_STORE_DEFER.count;
      }
    }
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:defer > ' + e, 1);
  }
}

/**
 * Maps the Jingle disco features
 * @return Feature namespaces
 * @type array
 */
function JSJaCJingle_disco() {
  return JSJAC_JINGLE_AVAILABLE ? MAP_DISCO_JINGLE : [];
}

/**
 * Query the server for external services
 */
function JSJaCJingle_extdisco() {
  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > Discovering available services...', 2);

  try {
    // Pending state (defer other requests)
    JSJaCJingle_defer(true);

    // Build request
    var request = new JSJaCIQ();

    request.setTo(JSJAC_JINGLE_STORE_CONNECTION.domain);
    request.setType(JSJAC_JINGLE_STANZA_TYPE_GET);

    request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_EXTDISCO }));

    JSJAC_JINGLE_STORE_CONNECTION.send(request, function(response) {
      try {
        // Parse response
        if(response.getType() == JSJAC_JINGLE_STANZA_TYPE_RESULT) {
          var i,
              service_arr, cur_service,
              cur_host, cur_password, cur_port, cur_transport, cur_type, cur_username;

          var services = response.getChild('services', NS_EXTDISCO);

          if(services) {
            service_arr = services.getElementsByTagNameNS(NS_EXTDISCO, 'service');

            for(i = 0; i < service_arr.length; i++) {
              cur_service = service_arr[i];

              cur_host      = cur_service.getAttribute('host')       || null;
              cur_port      = cur_service.getAttribute('port')       || null;
              cur_transport = cur_service.getAttribute('transport')  || null;
              cur_type      = cur_service.getAttribute('type')       || null;

              cur_username  = cur_service.getAttribute('username')   || null;
              cur_password  = cur_service.getAttribute('password')   || null;

              if(!cur_host || !cur_type)  continue;

              if(!(cur_type in JSJAC_JINGLE_STORE_EXTDISCO)) {
                JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                continue;
              }

              JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host] = {
                'port'      : cur_port,
                'transport' : cur_transport,
                'type'      : cur_type
              };

              if(cur_type == 'turn') {
                JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].username = cur_username;
                JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].password = cur_password;
              }

              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > handle > Service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
            }
          }

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > handle > Discovered available services.', 2);
        } else {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > handle > Could not discover services (server might not support XEP-0215).', 0);
        }
      } catch(e) {
        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > handle > ' + e, 1);
      }

      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > Ready.', 2);

      // Execute deferred requests
      JSJaCJingle_defer(false);
    });
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:extdisco > ' + e, 1);
    
    // Execute deferred requests
    JSJaCJingle_defer(false);
  }
}

/**
 * Query some external APIs for fallback STUN/TURN (must be configured)
 */
function JSJaCJingle_fallback(fallback_url) {
  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > Discovering fallback services...', 2);

  try {
    // Pending state (defer other requests)
    JSJaCJingle_defer(true);

    // Generate fallback API URL
    fallback_url += '?username=' + 
                    encodeURIComponent(JSJAC_JINGLE_STORE_CONNECTION.username + '@' + JSJAC_JINGLE_STORE_CONNECTION.domain);

    // Proceed request
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fallback_url, true);

    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4) {
        // Success?
        if(xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);

          var cur_parse,
              i, cur_url,
              cur_type, cur_host, cur_port, cur_transport,
              cur_username, cur_password;

          if(data.uris && data.uris.length) {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Parsing ' + data.uris.length + ' URIs...', 2);

            for(i in data.uris) {
              cur_url = data.uris[i];

              if(cur_url) {
                // Parse current URL
                cur_parse = R_JSJAC_JINGLE_SERVICE_URI.exec(cur_url);

                if(cur_parse) {
                  cur_type = cur_parse[1]        || null;
                  cur_host = cur_parse[2]        || null;
                  cur_port = cur_parse[3]        || null;
                  cur_transport = cur_parse[4]   || null;

                  cur_username  = data.username  || null;
                  cur_password  = data.password  || null;

                  if(!cur_host || !cur_type)  continue;

                  if(!(cur_type in JSJAC_JINGLE_STORE_FALLBACK)) {
                    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                    continue;
                  }

                  JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host] = {
                    'port'      : cur_port,
                    'transport' : cur_transport,
                    'type'      : cur_type
                  };

                  if(cur_type == 'turn') {
                    JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].username = cur_username;
                    JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].password = cur_password;
                  }

                  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Fallback service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                } else {
                  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Fallback service not stored, weird URI (' + cur_url + ').', 0);
                }
              }
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Finished parsing URIs.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > No URI to parse.', 2);
          }

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Discovered fallback services.', 2);
        } else {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > handle > Could not discover fallback services (API malfunction).', 0);
        }

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > Ready.', 2);

        // Execute deferred requests
        JSJaCJingle_defer(false);
      }
    };

    xhr.send();
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle] lib:fallback > ' + e, 1);
  }
}
