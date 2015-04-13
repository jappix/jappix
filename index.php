<?php

/*

Jappix - An open social platform
This is the Jappix PHP application launcher

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// PHP base
define('JAPPIX_BASE', '.');

// Get the function files
require_once('./server/functions.php');

// Get the configuration
require_once('./server/read-main.php');
require_once('./server/read-hosts.php');

// Get some extra-libs
require_once('./server/gettext.php');

// Prepare application
enableErrorSink();
hideErrors();
compressThis();

// Include the good language file
$locale = checkLanguage();
includeTranslation($locale, 'main');

// Get the Jappix version & its hash
$version = getVersion();
$hash = genHash($version);

// Include the good application file
$include_app = 'desktop';

// App to include?
if(!isInstalled()) {
    // Not yet installed
    $include_app = 'install';
} else if(anonymousMode()) {
    // Anonymous
    $include_app = 'desktop';
} else if(isset($_GET['m']) && !empty($_GET['m'])) {
    // Not anonymous, any forced mode?
    $force_mode = $_GET['m'];

    // Switch between two Jappix apps
    if(($force_mode == 'desktop') || ($force_mode == 'mobile')) {
        // Write the cookie
        setcookie('jappix_mode', $force_mode, (time() + 31536000));

        // Define the app to include
        $include_app = $force_mode;
    } else if(($force_mode == 'manager') || ($force_mode == 'download')) {
        $include_app = $force_mode;
    }
} else if(isset($_COOKIE['jappix_mode'])) {
    // Not forced, any cookie stored?
    if($_COOKIE['jappix_mode'] == 'mobile') {
        $include_app = 'mobile';
    }
}

// Special stuffs for Jappix apps?
if(($include_app == 'desktop') || ($include_app == 'mobile')) {
    // Redirects the user to HTTPS if forced
    if(!useHttps() && httpsForce()) {
        // Apply some special headers
        header('Status: 301 Moved Permanently', true, 301);
        header('Location: https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);

        // Kill the script!
        exit('HTTP/1.1 301 Moved Permanently');
    }

    // Is it a static node?
    if(isStatic()) {
        $include_app = 'static';
    }

    // Is it an upload node?
    if(isUpload()) {
        $include_app = 'upload';
    }

    // Save this visit (for the stats)
    if(hasStatistics()) {
        writeVisit();
    }
}

// Include it!
include('./server/'.$include_app.'.php');

?>
