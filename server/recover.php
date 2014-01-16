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
if(RECOVER_API == 'on') {
    // Get POST data
    $email = isset($_POST['email']) ? trim($_POST['email']) : null;
    $captcha = isset($_POST['captcha']) ? trim($_POST['captcha']) : null;
    
    // Enough data?
    if(!$email || !$captcha) {
        $error = true;
        
        if(!$email) {
            $error_reason = 'E-Mail POST Field Missing';
        } else if(!$captcha) {
            $error_reason = 'CAPTCHA POST Field Missing';
        } else {
            $error_reason = 'POST Field Missing';
        }
    } else if($session_captcha == null) {
        $error = true;
        $error_reason = 'CAPTCHA Session Missing';
    } else if(strtolower(trim($captcha)) != strtolower(trim($session_captcha))) {
        $error = true;
        $error_reason = 'CAPTCHA Not Matching';
    } else {
        // TODO
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

$api_response = '<jappix xmlns="jappix:account:recover">';
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