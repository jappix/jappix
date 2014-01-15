<?php

/*

Jappix - An open social platform
This is the avatar upload PHP script for Jappix

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

// Initialize response vars
$response_type = null;
$response_binval = null;
$response_error = null;
$response_id = '0';

// Set a special XML header
header('Content-Type: text/xml; charset=utf-8');

// No file uploaded?
if((!isset($_FILES['file']) || empty($_FILES['file'])) || (!isset($_POST['id']) || empty($_POST['id']))) {
    $response_error = 'bad-request';
    $response_id = '0';
} else {
    // Get the POST vars
    $response_id = $_POST['id'];
    $tmp_filename = $_FILES['file']['tmp_name'];
    $old_filename = $_FILES['file']['name'];

    // Security sanitization
    if(isAllowedExt($old_filename)) {
        // Get the file extension
        $ext = getFileExt($old_filename);

        // Hash it!
        $filename = md5($old_filename.time()).'.'.$ext;

        // Define some vars
        $path = JAPPIX_BASE.'/tmp/avatar/'.$filename;

        // Define MIME type
        if($ext == 'jpg') {
            $ext = 'jpeg';
        }

        $response_type = 'image/'.$ext;

        if(!preg_match('/^(jpeg|png|gif)$/i', $ext)) {
            // Unsupported file extension
            $response_error = 'forbidden-type';
        } else if(!is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $path)) {
            // File upload error
            $response_error = 'move-error';
        } else if(!function_exists('gd_info') || resizeImage($path, $ext, 96, 96, 'square')) {
            // Resize the image
            try {
                // Encode the file
                $response_binval = base64_encode(file_get_contents($path));
            } catch(Exception $e) {
                $response_error = 'server-error';
            }
        }

        // Remove the file
        unlink($path);
    }
}

// Exit with response
if($response_type && $response_binval && !$response_error) {
    exit(
        '<jappix xmlns=\'jappix:file:post\' id=\''.$response_id.'\'>'.
        '   <type>'.$response_type.'</type>'.
        '   <binval>'.$response_binval.'</binval>'.
        '</jappix>'
    );
} else {
    exit(
        '<jappix xmlns=\'jappix:file:post\' id=\''.$response_id.'\'>'.
        '   <error>'.($response_error || 'unexpected-error').'</error>'.
        '</jappix>'
    );
}

?>
