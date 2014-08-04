<?php

/*

Jappix - An open social platform
Simple CAPTCHA generator

-------------------------------------------------

License: AGPL
Author: Valérian Saliou
Note: Thanks to Daniel Correa for his great help on security concerns

*/

// Process a totally random security code
function security_code() {
    // Import secure random bytes function
    require_once('./srand.php');

    // Let's generate a totally random string using SHA-1
    $sha1_hash = sha1(secure_random_bytes(100));

    // Start the session so we can store what the security code actually is
    session_start();

    // We don't need a 32 character long string so we trim it down to 6
    $security_code = substr($sha1_hash, 15, 6);

    // Set the session to store the security code
    $_SESSION['captcha'] = $security_code;

    // Close the session
    session_write_close();

    return $security_code;
}

// Creates the CAPTCHA image
function captcha($security_code) {
    // CAPTCHA configuration
    $circles  = 10;
    $h_lines  = 1;
    $v_lines  = 2;
    $width    = 64;
    $height   = 22;
    $font     = 4;
    $offset_x = 8;
    $offset_y = 3;

    // Create image
    $im = @imagecreate($width, $height);
    $background_color = imagecolorallocate($im, 10, 102, 174);
    $text_color = imagecolorallocate($im, rand(150, 255), rand(150, 255), rand(150, 255));

    // Create the circles
    $r = 0.01; $g = 0.51; $b = 0.87;

    for($i = 1; $i <= $circles; $i++) {
        $value = rand(200, 255);
        $randomcolor = imagecolorallocate($im, $value * $r, $value * $g, $value * $b);
        imagefilledellipse($im, rand(0, $width - 10), rand(0, $height - 3), rand(20, 70), rand(20, 70), $randomcolor);
    }

    // Create the text
    imagerectangle($im, 0, 0, $width - 1, $height - 1, $text_color);
    imagestring($im, $font, $offset_x, $offset_y, $security_code, $text_color);

    // Create the lines (horizontal)
    for($i = 0; $i < $h_lines; $i++) {
        $y = rand($offset_x, $height);
        $randomcolor = imagecolorallocate($im, 0, 0, rand(100, 255));
        imageline($im, 0, $y, $width, $y, $randomcolor);
    }

    // Create the lines (vertical)
    for($i = 0; $i < $v_lines; $i++) {
        $x = rand($offset_y, $width);
        $randomcolor = imagecolorallocate($im, 0, 0, rand(100, 255));
        imageline($im, $x, 0, $x, $height, $randomcolor);
    }

    // Tell the browser what kind of file is come in
    header('Content-Type: image/png');

    // Output the newly created image in jpeg format
    imagepng($im);

    // Free up resources
    imagedestroy($im);
}

// Create CAPTCHA image
captcha(security_code());

?>
