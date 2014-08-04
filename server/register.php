<?php

/*

Jappix - An open social platform
This is the Register API

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// PHP base
define('JAPPIX_BASE', '..');

// Start PHP session (for CAPTCHA check)
session_start();

// Get captcha
$session_captcha = isset($_SESSION['captcha']) ? $_SESSION['captcha'] : null;

// Remove CAPTCHA
if(isset($_SESSION['captcha'])) {
    unset($_SESSION['captcha']);
}

// Close the session
session_write_close();

// Get the configuration
require_once('./functions.php');
require_once('./read-main.php');
require_once('./read-hosts.php');

// Prepare application
enableErrorSink();
hideErrors();
compressThis();

// Headers
header('Content-Type: text/xml');

// API vars
$xml_output = null;
$error = false;
$error_reason = '';

// Get POST data
$query_id = isset($_POST['id']) ? trim($_POST['id']) : 'none';

// Not enabled?
if(REGISTER_API == 'on') {
    // Get POST data
    $username = isset($_POST['username']) ? trim($_POST['username']) : null;
    $password = isset($_POST['password']) ? trim($_POST['password']) : null;
    $domain = isset($_POST['domain']) ? trim($_POST['domain']) : null;
    $captcha = isset($_POST['captcha']) ? trim($_POST['captcha']) : null;

    // Enough data?
    if(!$username || !$password || !$domain || !$captcha) {
        $error = true;

        if(!$username) {
            $error_reason = 'Username POST Field Missing';
        } else if(!$password) {
            $error_reason = 'Password POST Field Missing';
        } else if(!$domain) {
            $error_reason = 'Domain POST Field Missing';
        } else if(!$captcha) {
            $error_reason = 'CAPTCHA POST Field Missing';
        } else {
            $error_reason = 'POST Field Missing';
        }
    } else if($domain != HOST_MAIN) {
        $error = true;
        $error_reason = 'Domain Not Allowed';
    } else if($session_captcha == null) {
        $error = true;
        $error_reason = 'CAPTCHA Session Missing';
    } else if(strtolower(trim($captcha)) != strtolower(trim($session_captcha))) {
        $error = true;
        $error_reason = 'CAPTCHA Not Matching';
    } else {
        // Fixes escapeshellarg() with UTF-8 chars
        setlocale(LC_CTYPE, 'en_US.UTF-8');

        // Which command to execute?
        $command_str = null;

        if(XMPPD == 'metronome') {
            $xmppd_ctl = XMPPD_CTL ? XMPPD_CTL : 'metronomectl';

            // Command string
            $command_str = 'sudo '.$xmppd_ctl.' adduser '.escapeshellarg($username.'@'.$domain).' '.escapeshellarg($password);
        } else if(XMPPD == 'ejabberd') {
            $xmppd_ctl = XMPPD_CTL ? XMPPD_CTL : 'ejabberdctl';

            // Command string
            $command_str = 'sudo '.$xmppd_ctl.' register '.escapeshellarg($username).' '.escapeshellarg($domain).' '.escapeshellarg($password);
        } else {
            $error = true;
            $error_reason = 'Unsupported XMPP Daemon';
        }

        // Execute command
        if($command_str) {
            // Here we go!
            $command_output = array();

            exec($command_str, $command_output);

            // Check if user could be registered
            $command_return = 0;

            foreach($command_output as $command_line) {
                if(((XMPPD == 'metronome') && preg_match('/User successfully added/i', $command_line)) || ((XMPPD == 'ejabberd') && preg_match('/User (.+) successfully registered/i', $command_line))) {
                    $command_return = 1;

                    break;
                }

                if(((XMPPD == 'metronome') && preg_match('/User already exists/i', $command_line)) || ((XMPPD == 'ejabberd') && preg_match('/User (.+) already registered/i', $command_line))) {
                    $command_return = 2;

                    break;
                }
            }

            // Check for errors
            if($command_return != 1) {
                $error = true;

                if($command_return == 2) {
                    $error_reason = 'Username Unavailable';
                } else {
                    $error_reason = 'Server Error';
                }
            }
        } else {
            $error = true;
            $error_reason = 'No Command To Execute';
        }
    }
} else {
    $error = true;
    $error_reason = 'API Disabled';
}

// Generate the response
$status_code = '1';
$status_message = 'Success';

if($error) {
    $status_code = '0';
    $status_message = 'Server error';

    if($error_reason) {
        $status_message = $error_reason;
    }
}

$api_response = '<jappix xmlns="jappix:account:register">';
    $api_response .= '<query id="'.htmlEntities($query_id, ENT_QUOTES).'">';
        $api_response .= '<status>'.htmlspecialchars($status_code).'</status>';
        $api_response .= '<message>'.htmlspecialchars($status_message).'</message>';
    $api_response .= '</query>';

    if($xml_output) {
        $api_response .= '<data>';
            $api_response .= $xml_output;
        $api_response .= '</data>';
    }
$api_response .= '</jappix>';

exit($api_response);

?>