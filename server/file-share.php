<?php

/*

Jappix - An open social platform
This is the Jappix file share script

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, regilero

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

// Set a special XML header
header('Content-Type: text/xml; charset=utf-8');

// Everything is okay
if((isset($_FILES['file']) && !empty($_FILES['file'])) && (isset($_POST['user']) && !empty($_POST['user'])) && (isset($_POST['location']) && !empty($_POST['location']))) {
    // Get the user name
    $user = $_POST['user'];

    // Get the file name
    $tmp_filename = $_FILES['file']['tmp_name'];
    $filename = $_FILES['file']['name'];

    // Get the location
    if(HOST_UPLOAD) {
        $location = HOST_UPLOAD.'/';
    } else {
        $location = $_POST['location'];
    }

    // Get the file new name
    $ext = getFileExt($filename);
    $new_name = preg_replace('/(^)(.+)(\.)(.+)($)/i', '$2', $filename);

    // Define some vars
    $content_dir = JAPPIX_BASE.'/store/share/'.$user;
    $security_file = $content_dir.'/index.html';
    $name = sha1_file($tmp_filename);
    $path = $content_dir.'/'.$name.'.'.$ext;
    $thumb_xml = '';

    // Forbidden file?
    if(!isSafe($user) || !isSafeAllowed($filename) || !isSafeAllowed($name.'.'.$ext)) {
        exit(
'<jappix xmlns=\'jappix:file:post\'>
    <error>forbidden-type</error>
</jappix>'
        );
    }

    // Create the user directory
    if(!is_dir($content_dir)) {
        mkdir($content_dir, 0777, true);
        chmod($content_dir, 0777);
    }

    // Create (or re-create) the security file
    if(!file_exists($security_file)) {
        file_put_contents($security_file, securityHTML(), LOCK_EX);
    }

    // Not already there? (sometimes users upload same file twice, no need to compute it 2 times)
    $file_first_upload = !file_exists($path);

    if($file_first_upload) {
        // File upload error?
        if(!is_uploaded_file($tmp_filename) || !move_uploaded_file($tmp_filename, $path)) {
            exit(
    '<jappix xmlns=\'jappix:file:post\'>
        <error>move-error</error>
    </jappix>'
            );
        }
    }

    // Resize and compress if this is a JPEG file
    if(preg_match('/^(jpg|jpeg|png|gif)$/i', $ext)) {
        // Image thumbnail path
        $thumb = $content_dir.'/'.$name.'_thumb.'.$ext;
        $thumb_first_upload = !file_exists($thumb);

        // Resize only if first time file is uploaded
        if($file_first_upload) {
            // Resize the image
            resizeImage($path, $ext, 1024, 1024);

            // Copy the image
            copy($path, $thumb);
        }

        // Create the thumbnail (only once)
        if(!$thumb_first_upload || resizeImage($thumb, $ext, 140, 105, 'square')) {
            $thumb_xml = '<thumb>'.htmlspecialchars($location.'store/share/'.$user.'/'.$name.'_thumb.'.$ext).'</thumb>';
        }
    }

    // Return the path to the file
    exit(
'<jappix xmlns=\'jappix:file:post\'>
    <href>'.htmlspecialchars($location.'store/share/'.$user.'/'.$name.'.'.$ext).'</href>
    <title>'.htmlspecialchars($new_name).'</title>
    <type>'.htmlspecialchars(getFileMIME($path)).'</type>
    <length>'.htmlspecialchars(filesize($path)).'</length>
    '.$thumb_xml.'
</jappix>'
    );
}

// Bad request error!
exit(
'<jappix xmlns=\'jappix:file:post\'>
    <error>bad-request</error>
</jappix>'
);

?>
