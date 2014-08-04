<?php

/*

Jappix - An open social platform
This is the Jappix Jingle services API script

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// PHP base
define('JAPPIX_BASE', '..');

// Get the needed files
require_once('./functions.php');
require_once('./read-main.php');
require_once('./read-hosts.php');

// Prepare application
enableErrorSink();
hideErrors();
compressThis();

// Not allowed for a special node
if(isStatic() || isUpload()) {
    exit;
}

// Set a JSON header
header('Content-Type: application/json');

// If valid data was sent
if(isset($_GET['username']) && !empty($_GET['username'])) {
    // Read remote IP (secures passwords that are passed there)
    $remote_ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;

    // Generate cache values
    $cache_hash = md5($_GET['username'].'@'.$remote_ip);
    $cache_path = JAPPIX_BASE.'/tmp/jingle/'.$cache_hash.'.cache';
    $cache_life = $remote_ip ? 3600 : 0;

    // Cache missing or obsolete?
    $filemtime = @filemtime($cache_path);

    if(!$filemtime or (time() - $filemtime >= $cache_life)) {
        // Note: we use a Google API there, so fallback TURNs will be using Google's TURN server through an encrypted channel
        //       we know this won't satisfy everyone, but this is the best compromise we could find for the end-user
        //       if you are concerned about privacy, rather setup your TURN and add it to Jappix hosts configuration

        // Get the JSON content
        $json = readUrl('https://computeengineondemand.appspot.com/turn?username='.urlencode($_GET['username']));

        if($json && strpos($json, 'uris') !== false) {
            file_put_contents($cache_path, $json);
        }
    } else {
        $json = file_get_contents($cache_path);
    }

    exit($json);
}

?>
