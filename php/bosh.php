<?

/*

Jappix - An open social platform
This is a BOSH proxy for cross-domain

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: MIT
Authors: Jonathan Gueron, Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 29/01/11

*/

// PHP base
define('JAPPIX_BASE', '..');

// Get the configuration
require_once('./functions.php');
require_once('./read-main.php');
require_once('./read-hosts.php');

// Optimize the page rendering
hideErrors();
compressThis();

// CURL not detected?
if(!function_exists('curl_init')) {
	header('HTTP/1.0 501 Not Implemented');
	exit('HTTP/1.0 501 Not Implemented');
}

// Not allowed?
if(!BOSHProxy()) {
	header('HTTP/1.0 403 Forbidden');
	exit('HTTP/1.0 403 Forbidden');
}

// No data?
if(!isset($_GET['data']) || $_GET['data'] == '' || !isset($_GET['callback'])) {
	header('HTTP/1.0 400 Bad Request');
	exit('HTTP/1.0 400 Bad Request');
}

$body = stripslashes($_GET['data']);

$ch = curl_init(HOST_BOSH);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$header = array('Accept-Encoding: gzip, deflate','Content-Type: text/xml; charset=utf-8');
curl_setopt($ch, CURLOPT_HTTPHEADER, $header );
curl_setopt($ch, CURLOPT_VERBOSE, 0);
curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 60 );
curl_setopt( $ch, CURLOPT_TIMEOUT, 60 );

$output = '';
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);

if($output == '')
	print $_GET['callback'] . '({"reply":"<body type=\'terminate\' xmlns=\'http:\/\/jabber.org\/protocol\/httpbind\'\/>"});';
else if($output == false)
	print $_GET['callback'] . '({"reply":' . json_encode('<parsererror/>') . '});';
else
	print $_GET['callback'] . '({"reply":' . json_encode($output) . '});';

curl_close($ch);

?>
