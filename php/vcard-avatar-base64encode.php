<?php

/*

Jappix - The instant messaging. Reinvented.
This is the PHP script used to convert binary avatars into base64 avatars

-------------------------------------------------

Licence : GNU/GPL
Author : Vanaryon
Contact : mailing-list[at]jappix[dot]com
Last revision : 12/24/09

*/

// WE CHANGE THE CONTENT TYPE TO XML
	// header('Content-type: text/xml;charset=utf-8');
	// TODO !

// WE UPLOAD THE FILE
	// WE DEFINE THE VARIABLES FOR THE UPLOAD
		$content_dir = './temp/';
		$tmp_file = $_FILES['vCard-avatar']['tmp_name'];
		$name_file = $_FILES['vCard-avatar']['name'];
		
	// WE SEND THE FILE AND CHECK EVERYTHING IS OKAY
		// If the user sent an empty form
		if (!is_uploaded_file($tmp_file)) {
			exit('1'); // First error code
		}
		
		// If a problem during the moving of the file on the server happens
		if (!move_uploaded_file($tmp_file, $content_dir . $name_file)) {
			exit('2'); // Second error code
		}
		
		// We get the location of the uploaded file
		$file_location = $content_dir.$name_file;
		
// WE CHECK EVERYTHING IS OKAY
	function check_img($img) {
		// We define the variables
		$mime = mime_content_type($img);
		$size = filesize($img);
		
		// If the uploaded file is not an image, stop the script to avoid injuries ;)
		if(($mime != 'image/jpg') && ($mime != 'image/jpeg') && ($mime != 'image/png') && ($mime != 'image/gif')) {
			unlink($img);
			exit('3'); // Third error code
		}
		
		// We calculate the total height and width of the image
		list($largeur, $hauteur) = getimagesize($img);
		
		// If the height or width are fewer than the minimum of 32x32px, stop the script
		if(($largeur < '32') || ($hauteur < '32')) {
			unlink($img);
			exit('4'); // Fourth error code
		}
		
		// If the height or width are higher than the maximum of 96x96px, stop the script
		if(($largeur > '96') || ($hauteur > '96')) {
			unlink($img);
			exit('5'); // Fifth error code
		}
		
		// If the image size is more than 25Kio
		if($size > 25000) {
			unlink($img);
			exit('6'); // Sixth error code
		}
		
		return $checkimg;
	}
	
// WE ENCODE THE IMAGE IN BASE64
	// FUNCTION TO OPEN AND ENCODE THE TARGET IMAGE
	function encode_img($img) {
		// We open the image
		$fd = fopen ($img, 'rb');
		$size = filesize ($img);
		$cont = fread ($fd, $size);
		fclose ($fd);
		
		// We encode the image in abase64 string
		$encimg = base64_encode($cont);
		
		return $encimg;
	}
	
	// WE CALL THE IMAGE ENCODER FUNCTION AND THEN DELETE IT
		check_img($file_location);
		$mime_image = mime_content_type($file_location);
		$encoded_image = encode_img($file_location);
		unlink($file_location);

// WE RETURN THE VALUES TO THE USER
	// WE RETURN THIS ENCODED IMAGE TO THE USER
		echo('<PHOTO><TYPE>'.$mime_image.'</TYPE><BINVAL>'.$encoded_image.'</BINVAL></PHOTO>');

?>
