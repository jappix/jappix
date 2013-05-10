<?php

/*

Jappix - An open social platform
Simple CAPTCHA generator

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Last revision: 10/05/13

*/

// Let's generate a totally random string using MD5
$md5_hash = md5(rand(0, 9999999));

// Start the session so we can store what the security code actually is
session_start();

// We don't need a 32 character long string so we trim it down to 6
$security_code = substr($md5_hash, 15, 6);

// Set the session to store the security code
$_SESSION['captcha'] = $security_code;

// Close the session
session_write_close();

// Set the image width and height
$im = imagecreate(64, 22);

// White background and black text
$bg = imagecolorallocate($im, 229, 106, 93);
$textcolor = imagecolorallocate($im, 255, 255, 255);

// Add randomly generated string in white to the image
imagestring($im, 5, 5, 3, $security_code, $textcolor);

// Tell the browser what kind of file is come in 
header('Content-Type: image/png');

// Output the newly created image in jpeg format 
imagepng($im);

// Free up resources
imagedestroy($im);

?>