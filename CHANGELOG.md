Jappix Changelog
================

Here's the log of what has changed over the Jappix releases.


One, v1.0.0 (January 2014)
--------------------------

 * XEP-0166: Jingle
 * XEP-0292: vCard4 Over XMPP
 * XEP-0280: Message Carbons
 * IE9, IE10, IE11 support
 * Libs update
 * Client code rewrite
 * Directory tree re-organization
 * Tested code (pass CSSLint, JSHint and PHPLint)


Nemesis Alpha 9, v0.9.9 (August 2013)
-------------------------------------

 * XEP-0313: Message Archive Management
 * Drop support for Message Archiving (XEP-0136), outpaced by MAM (XEP-0313)
 * Jappix Desktop performances improved (noticeable with big rosters)
 * Fix Jappix Desktop avatar system, unable to cache avatars (thus increasing network load and delays)
 * New translations added (Mongolian), and a few ones updated


Nemesis Alpha 8, v0.9.8 (May 2013)
----------------------------------

 * RTL (Right-To-Left Languages) support
 * Various bufixes


Nemesis Alpha 7, v0.9.7 (April 2013)
------------------------------------

 * Fix overflow events in Mini
 * Fix user info display bug with formatted text
 * Jappix Me notification system
 * Update JSJaC
 * Update jQuery (v1.10.1)


Nemesis Alpha 6, v0.9.6 (April 2013)
------------------------------------

 * Fix login with accented usernames
 * WOFF Get API headers fixed
 * Better Get API URL generator
 * Fix broken Jappix Mini extraction script
 * Show when user joins/exits MUC in Jappix Mini


Nemesis Alpha 5, v0.9.5 (March 2013)
------------------------------------

 * Jappix Mini enhancements
 * Fix Jappix over non-standard ports
 * Locale detector improved
 * Load more items on social channel scroll
 * Fix a lot of English base language typos
 * Support for XHTML microblog entries (Movim compatibility)
 * Show Jappix Desktop on tablets (not mobile anymore)
 * Option to disable Jappix Mini on mobile phones
 * Fix broken MUC bookmarks retrieval


Nemesis Alpha 4, v0.9.4 (March 2013)
------------------------------------

 * [SECURITY] Fix insafe HTML escaping
 * PHP 5.4 compatibility
 * Auto-populate microblog on connect
 * Register API support for Metronome XMPPd
 * Non-blocking PHP sessions
 * Permissive geoloc selector in microblog
 * Select priority more easily
 * Compliancy with Atom specification (social inbox)
 * Added project mirrors


Nemesis Alpha 3, v0.9.3 (February 2013)
---------------------------------------

 * [SECURITY] More randomness in CAPTCHA
 * Fix buggy roster filter with groups
 * Add Piwik tracking feature (configurable in manager)
 * Easy popup close by clicking away
 * Fix cropped uploaded pictures
 * Revert to old File Share API (which is far better)
 * Fixes broken translations (strange UTF-8 chars due to bugged Gettext compiler)


Nemesis Alpha 2, v0.9.2 (January 2013)
--------------------------------------

 * [SECURITY] Introduced the Register API (prevents register flood by spam bots)
 * Reworked Storage API
 * Jappix Mini code beautify
 * Lighter and Web-safe font files
 * Better error logging
 * Fix Openfire ping request
 * Typing notification in Jappix Mini
 * Support for WebKit notifications
 * Jappix Mini groupchat suggest
 * Enhanced Download API
 * Mini animated chat icon, much sexier
 * IE custom font compatibility
 * Legal changes
 * Update licensing with real names


Nemesis Alpha 1, v0.9.1 (2012)
------------------------------

 * Show an 'add to home' button on iOS devices
 * Ability to suspend statistics
 * Fix IE9 issue with clustering
 * Show profile button in user search results
 * Ability to change message font, font size and color
 * Fix choppy Jappix Mini status picker
 * Sounds for Safari & IE9
 * Enhance new file storage functions
 * No resize for textareas
 * Add a configurable legal disclaimer
 * Fix a loop bug on presence if no support for sessionStorage
 * Universal fonts
 * Add ability to configure the node owner name & website
 * HTTP authentication for LDAP
 * Better notification + comments management


Spaco, v0.9 (2011)
------------------

 * [SECURITY] Fix when sending files to a contact
 * Better Jappix Mini performances
 * Fix Jappix Mini display issues
 * Connection issue fixed with BOSH API
 * Open XMPP links when Jappix is ready


Suno, v0.8 (2011)
---------------------

 * XEP-0066: Out of Band Data
 * Switch from OpenStreetMap to Google Maps for geolocation


Stelo, v0.7 (2011)
------------------

 * Lighter Jappix Mini
 * Welcome popup
 * Support for /me command in Jappix Mini
 * Fixes in social channel
 * Bigger BOSH poll interval (avoids some overactivity errors)
 * Compression disabled by default in Get API
 * Send chatstates in MUC
 * Social notification inbox


Lumo, v0.6 (2011)
-----------------

 * Smoother Mini animation
 * Show avatars in social channel comments
 * Legacy mode for microblog comments
 * Microblog updated to comply with a new version of XEP-0277
 * Fix DNS SRV issue because of a 'route' attribute on BOSH initiation


Ribelo, v0.5 (2011)
-------------------

 * Add support for comments in microblog
 * Jappix Mini fixes and improvements


Lupo, v0.4 (2011)
-----------------

 * Full IE5.5 compatibility for Jappix Mini
 * BOSH without cURL (if cURL unavailable)
 * Handle multiple microblog attached files
 * Microblog attached files thumbnails
 * BOM (Byte Order Mark) filtering for Get API
 * Autoplay for new YouTube HTML5 player
 * Support for privacy lists pushs
 * Roster-side privacy lists (make contact blocking/unblocking easy)
 * Better update checker
 * XEP-0144: Roster Item Exchange
 * Cross domain support for Internet Explorer and legacy browsers
 * Update jQuery (v1.4.4)
 * TZO fix (for negative timezones, e.g.: UTC-5)
 * Better language detection
 * Use HTML5 or Flash for YouTube embedded videos


Prism, v0.3 (2011)
------------------

 * [SECURITY] Fix JS escape bug for quotes
 * [SECURITY] HTML-encode notification username
 * Introduction of Jappix Mini
 * Introduction of Jappix Manager
 * Introduction of Jappix Install
 * XEP-0050: Ad-Hoc Commands
 * XEP-0136: Message Archiving
 * Update Jappix logo
 * Declare application language to XMPP server
 * Add a buddy search tool
 * Support for old/legacy vCard server implementations
 * Inbox messages sorted by date
 * Better music search
 * Human-readable geolocation
 * Gateway show/hide
 * HTML5 forms
 * Better notification management
 * Unified chat design
 * Dynamic DOM load (better performances)
 * Jappix logo shown when connected (improves branding)


Lidar, v0.2 (2010)
------------------

 * Introduction of Jappix Mobile
 * UI redesign (from grey to black and blue)
 * Social channel introduced (microblog)


Genesis, v0.1 (2010)
--------------------

 * Initial version, released after private beta
 * Introduction of Jappix Desktop
 * Basic chat, groupchat, roster and profile features
 * Basic UI


**For more information about what changed through time, check the changes made to our source code on GitHub: https://github.com/jappix/jappix/commits/master**
