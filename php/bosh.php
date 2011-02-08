<?

/*

Jappix - An open social platform
This is a PHP BOSH proxy

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: MIT
Authors: Jonathan Gueron, Valérian Saliou
Contact: http://project.jappix.com/contact
Last revision: 08/02/11

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

// Not allowed?
if(!BOSHProxy()) {
	header('HTTP/1.0 403 Forbidden');
	exit('HTTP/1.0 403 Forbidden');
}

// POST method?
if(isset($HTTP_RAW_POST_DATA) && $HTTP_RAW_POST_DATA) {
	$method = 'POST';
	$data = $HTTP_RAW_POST_DATA;
}

// GET method?
else if(isset($_GET['data']) && $_GET['data'] && isset($_GET['callback']) && $_GET['callback']) {
	$method = 'GET';
	$data = $_GET['data'];
	$callback = $_GET['callback'];
}

// Invalid method?
else {
	header('HTTP/1.0 400 Bad Request');
	exit('HTTP/1.0 400 Bad Request');
}

// HTTP parameters
$parameters = array('http' => array(
				'method' => 'POST',
				'content' => $data
				   )
		   );

// HTTP headers
$headers = array('Accept-Encoding: gzip, deflate','Content-Type: text/xml; charset=utf-8');
$parameters['http']['header'] = $headers;

// Change default timeout
ini_set('default_socket_timeout', 60);

// Create the connection
$stream = stream_context_create($parameters);
$connection = @fopen(HOST_BOSH, 'rb', false, $stream);

// Failed to connect!
if(!$connection) {
	header('HTTP/1.0 502 Proxy Error');
	exit('HTTP/1.0 502 Proxy Error');
}

// Allow stream blocking to handle incoming BOSH data
@stream_set_blocking($connection, TRUE);

// Get the output content
$output = @stream_get_contents($connection);

// POST output
if($method == 'POST') {
	// XML header
	header('content-type: text/xml; charset=utf-8');
	
	if(!$output)
		print '<body xmlns=\'http://jabber.org/protocol/httpbind\' type=\'terminate\'/>';
	else
		print $output;
}

// GET output
if($method == 'GET') {
	$json_output = json_encode($output);
	
	if(($output == false) || ($output == '') || ($json_output == 'null'))
		print $_GET['callback'].'({"reply":"<body xmlns=\'http:\/\/jabber.org\/protocol\/httpbind\' type=\'terminate\'\/>"});';
	else
		print $_GET['callback'].'({"reply":'.$json_output.'});';
}

// Close the connection
@fclose($connection);

?>
