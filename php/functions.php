<?php

/*

Jappix - An open social platform
These are the functions to checks things for Jappix

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Authors: Valérian Saliou, Mathieui, Olivier M.
Contact: http://project.jappix.com/contact
Last revision: 30/10/10

*/

// The function to check if Jappix is already installed
function isInstalled() {
	if(!file_exists(PHP_BASE.'/store/conf/installed.xml'))
		return false;
	
	return true;
}

// The function to get the admin users
function getUsers() {
	// Try to read the XML file
	$data = readXML('conf', 'users');
	$array = array();
	
	// Any data?
	if($data) {
		$read = new SimpleXMLElement($data);
		
		// Check the submitted user exists
		foreach($read->children() as $child) {
			// Get the node attributes
			$attributes = $child->attributes();
			
			// Push the attributes to the global array (converted into strings)
			$array[$attributes['name'].''] = $attributes['password'].'';
		}
	}
	
	return $array;
}

// The function to check an user is admin
function isAdmin($user, $password) {
	// Read the users.xml file
	$array = getUsers();
	
	// No data?
	if(empty($array))
		return false;
	
	// Our user is set and valid?
	if(isset($array[$user]) && ($array[$user] == $password))
		return true;
	
	// Not authorized
	return false;
}

// The function to get the users.xml file hashed name
function usersConfName() {
	$conf_dir = PHP_BASE.'/store/conf';
	
	// No conf folder?
	if(!is_dir($conf_dir))
		return '';
	
	// Read the conf folder
	$conf_open = opendir($conf_dir.'/');
	$conf_name = '';
	
	// Loop the XML files
	while($current = readdir($conf_open)) {
		if(preg_match('/(.+)(\.users\.xml)($)/', $current)) {
			$conf_name = $current;
			break;
		}
   	}
   	
   	// Close the opened dir
   	closedir($conf_open);
   	
   	// Return the users file name
   	return $conf_name;
}

// The function to write a XML file
function writeXML($type, $xmlns, $xml) {
	// Generate the file path
	$conf_path = PHP_BASE.'/store/'.$type.'/';
	$conf_name = $xmlns.'.xml';
	
	// Secured stored file?
	if(($type == 'conf') && ($xmlns == 'users')) {
		// Get the secured file name
		$conf_secured = usersConfName();
		
		// Does this file exist?
		if($conf_secured)
			$conf_name = $conf_secured;
		else
			$conf_name = hash('sha256', rand(1, 99999999).time()).'.users.xml';
	}
	
	// Generate the file complete path
	$conf_file = $conf_path.$conf_name;
	
	// Write the installed marker
	$gen_xml = '<?xml version="1.0" encoding="utf-8" ?>
<jappix xmlns="jappix:'.$type.':'.$xmlns.'">
	'.$xml.'
</jappix>';
	
	file_put_contents($conf_file, $gen_xml);
	
	return true;
}

// The function to read a XML file
function readXML($type, $xmlns) {
	// Generate the file path
	$conf_path = PHP_BASE.'/store/'.$type.'/';
	$conf_name = $xmlns.'.xml';
	
	// Secured stored file?
	if(($type == 'conf') && ($xmlns == 'users')) {
		// Get the secured file name
		$conf_secured = usersConfName();
		
		// Does this file exist?
		if($conf_secured)
			$conf_name = $conf_secured;
	}
	
	// Generate the file complete path
	$conf_file = $conf_path.$conf_name;
	
	if(file_exists($conf_file))
		return file_get_contents($conf_file);
	
	return false;
}

// The function to get the Jappix app. current version
function getVersion() {
	$file = file_get_contents(PHP_BASE.'/VERSION');
	$version = trim($file);
	
	return $version;
}

// The function to detect the user's language
function checkLanguage() {
	// If the user defined a language
	if(isset($_GET['l']) && !empty($_GET['l'])) {
		// We define some stuffs
		$defined_lang = strtolower($_GET['l']);
		$lang_file = PHP_BASE.'/lang/'.$defined_lang.'/LC_MESSAGES/main.mo';
		$lang_found = file_exists($lang_file);
		
		// We check if the asked translation exists
		if($lang_found)
			$lang = $defined_lang;
		else
			$lang = 'en';
		
		// Write a cookie
		setcookie('jappix_locale', $lang, (time() + 31536000));
	}
	
	// No language has been defined
	else {
		// A cookie is stored, read it!
		if(isset($_COOKIE['jappix_locale'])) {
			$check_cookie = $_COOKIE['jappix_locale'];
			
			// The cookie has a value, check this value
			if($check_cookie && file_exists(PHP_BASE.'/lang/'.$check_cookie.'/LC_MESSAGES/main.mo'))
				$lang = $check_cookie;
			else
				$lang = 'en';
		}
		
		// No cookie defined, naturally, we check the browser language
		else {
			// We get the language of the browser
			$nav_langs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
			$check_en = strtolower($nav_langs[0]);
			
			// We check if this is not english
			if($check_en == 'en')
				$lang = 'en';
			
			else {
				$order = array();
				
				foreach($nav_langs as $entry) {
					$indice = explode('=', $entry);
					$lang = strtolower(substr(trim($indice[0]), 0, 2));
					
					if(!$indice[1])
						$indice = 1;
					else
						$indice = $indice[1];
						$order[$lang] = $indice;
				}
				
				arsort($order);
				$lang_found = false;
				
				foreach($order as $nav_lang => $val) {
					$lang_file = PHP_BASE.'/lang/'.$nav_lang.'/LC_MESSAGES/main.mo';
					
					if(!$lang_found) {
						$lang_found = file_exists($lang_file);
						if ($lang_found)
							$lang = $nav_lang;
					}
				}
				
				// If Jappix doen't know that language, we include the english translation
				if(!$lang_found)
					$lang = 'en';
			}
		}
	}
	
	return $lang;
}

// The function to convert a ISO language code to its full name
function getLanguageName($code) {
	$known = array(
		'aa' => 'Afaraf',
		'ab' => 'Аҧсуа',
		'ae' => 'Avesta',
		'af' => 'Afrikaans',
		'ak' => 'Akan',
		'am' => 'አማርኛ',
		'an' => 'Aragonés',
		'ar' => 'العربية',
		'as' => 'অসমীয়া',
		'av' => 'авар мацӀ',
		'ay' => 'Aymar aru',
		'az' => 'Azərbaycan dili',
		'ba' => 'башҡорт теле',
		'be' => 'Беларуская',
		'bg' => 'български език',
		'bh' => 'भोजपुरी',
		'bi' => 'Bislama',
		'bm' => 'Bamanankan',
		'bn' => 'বাংলা',
		'bo' => 'བོད་ཡིག',
		'br' => 'Brezhoneg',
		'bs' => 'Bosanski jezik',
		'ca' => 'Català',
		'ce' => 'нохчийн мотт',
		'ch' => 'Chamoru',
		'co' => 'Corsu',
		'cr' => 'ᓀᐦᐃᔭᐍᐏᐣ',
		'cs' => 'Česky',
		'cu' => 'Словѣньскъ',
		'cv' => 'чӑваш чӗлхи',
		'cy' => 'Cymraeg',
		'da' => 'Dansk',
		'de' => 'Deutsch',
		'dv' => 'ދިވެހި',
		'dz' => 'རྫོང་ཁ',
		'ee' => 'Ɛʋɛgbɛ',
		'el' => 'Ελληνικά',
		'en' => 'English',
		'eo' => 'Esperanto',
		'es' => 'Español',
		'et' => 'Eesti keel',
		'eu' => 'Euskara',
		'fa' => 'فارسی',
		'ff' => 'Fulfulde',
		'fi' => 'Suomen kieli',
		'fj' => 'Vosa Vakaviti',
		'fo' => 'Føroyskt',
		'fr' => 'Français',
		'fy' => 'Frysk',
		'ga' => 'Gaeilge',
		'gd' => 'Gàidhlig',
		'gl' => 'Galego',
		'gn' => 'Avañe\'ẽ',
		'gu' => 'ગુજરાતી',
		'gv' => 'Ghaelg',
		'ha' => 'هَوُسَ',
		'he' => 'עברית',
		'hi' => 'हिन्दी',
		'ho' => 'Hiri Motu',
		'hr' => 'Hrvatski',
		'ht' => 'Kreyòl ayisyen',
		'hu' => 'Magyar',
		'hy' => 'Հայերեն',
		'hz' => 'Otjiherero',
		'ia' => 'Interlingua',
		'id' => 'Bahasa',
		'ie' => 'Interlingue',
		'ig' => 'Igbo',
		'ii' => 'ꆇꉙ',
		'ik' => 'Iñupiaq',
		'io' => 'Ido',
		'is' => 'Íslenska',
		'it' => 'Italiano',
		'iu' => 'ᐃᓄᒃᑎᑐᑦ',
		'ja' => '日本語',
		'jv' => 'Basa Jawa',
		'ka' => 'ქართული',
		'kg' => 'KiKongo',
		'ki' => 'Gĩkũyũ',
		'kj' => 'Kuanyama',
		'kk' => 'Қазақ тілі',
		'kl' => 'Kalaallisut',
		'km' => 'ភាសាខ្មែរ',
		'kn' => 'ಕನ್ನಡ',
		'ko' => '한 국어',
		'kr' => 'Kanuri',
		'ks' => 'कश्मीरी',
		'ku' => 'Kurdî',
		'kv' => 'коми кыв',
		'kw' => 'Kernewek',
		'ky' => 'кыргыз тили',
		'la' => 'Latine',
		'lb' => 'Lëtzebuergesch',
		'lg' => 'Luganda',
		'li' => 'Limburgs',
		'ln' => 'Lingála',
		'lo' => 'ພາສາລາວ',
		'lt' => 'Lietuvių kalba',
		'lu' => 'cilubà',
		'lv' => 'Latviešu valoda',
		'mg' => 'Fiteny malagasy',
		'mh' => 'Kajin M̧ajeļ',
		'mi' => 'Te reo Māori',
		'mk' => 'македонски јазик',
		'ml' => 'മലയാളം',
		'mn' => 'Монгол',
		'mo' => 'лимба молдовеняскэ',
		'mr' => 'मराठी',
		'ms' => 'Bahasa Melayu',
		'mt' => 'Malti',
		'my' => 'ဗမာစာ',
		'na' => 'Ekakairũ Naoero',
		'nb' => 'Norsk bokmål',
		'nd' => 'isiNdebele',
		'ne' => 'नेपाली',
		'ng' => 'Owambo',
		'nl' => 'Nederlands',
		'nn' => 'Norsk nynorsk',
		'no' => 'Norsk',
		'nr' => 'Ndébélé',
		'nv' => 'Diné bizaad',
		'ny' => 'ChiCheŵa',
		'oc' => 'Occitan',
		'oj' => 'ᐊᓂᔑᓈᐯᒧᐎᓐ',
		'om' => 'Afaan Oromoo',
		'or' => 'ଓଡ଼ିଆ',
		'os' => 'Ирон æвзаг',
		'pa' => 'ਪੰਜਾਬੀ',
		'pi' => 'पािऴ',
		'pl' => 'Polski',
		'ps' => 'پښتو',
		'pt' => 'Português',
		'qu' => 'Runa Simi',
		'rm' => 'Rumantsch grischun',
		'rn' => 'kiRundi',
		'ro' => 'Română',
		'ru' => 'Русский',
		'rw' => 'Kinyarwanda',
		'sa' => 'संस्कृतम्',
		'sc' => 'sardu',
		'sd' => 'सिन्धी',
		'se' => 'Davvisámegiella',
		'sg' => 'Yângâ tî sängö',
		'sh' => 'Српскохрватски',
		'si' => 'සිංහල',
		'sk' => 'Slovenčina',
		'sl' => 'Slovenščina',
		'sm' => 'Gagana fa\'a Samoa',
		'sn' => 'chiShona',
		'so' => 'Soomaaliga',
		'sq' => 'Shqip',
		'sr' => 'српски језик',
		'ss' => 'SiSwati',
		'st' => 'seSotho',
		'su' => 'Basa Sunda',
		'sv' => 'Svenska',
		'sw' => 'Kiswahili',
		'ta' => 'தமிழ்',
		'te' => 'తెలుగు',
		'tg' => 'тоҷикӣ',
		'th' => 'ไทย',
		'ti' => 'ትግርኛ',
		'tk' => 'Türkmen',
		'tl' => 'Tagalog',
		'tn' => 'seTswana',
		'to' => 'faka Tonga',
		'tr' => 'Türkçe',
		'ts' => 'xiTsonga',
		'tt' => 'татарча',
		'tw' => 'Twi',
		'ty' => 'Reo Mā`ohi',
		'ug' => 'Uyƣurqə',
		'uk' => 'українська',
		'ur' => 'اردو',
		'uz' => 'O\'zbek',
		've' => 'tshiVenḓa',
		'vi' => 'Tiếng Việt',
		'vo' => 'Volapük',
		'wa' => 'Walon',
		'wo' => 'Wollof',
		'xh' => 'isiXhosa',
		'yi' => 'ייִדיש',
		'yo' => 'Yorùbá',
		'za' => 'Saɯ cueŋƅ',
		'zh' => '中文',
		'zu' => 'isiZulu'
	);
	
	return $known[$code];
}

// The function which generates the language switcher hidden part
function languageSwitcher($active_locale, $separate) {
	// Initialize
	$repertory = './lang/';
	$open_rep = opendir($repertory);
	$html = '';
	
	// Loop the available languages
	while($current = readdir($open_rep)) {
		if($current && is_dir($repertory.$current) && ($current != $active_locale) && !preg_match('/^(\.(.+)?)$/i', $current)) {
			$html .= '<a href="./?l='.$current.keepGet('l', false).'">'.getLanguageName($current).'</a>';
			
			// Add a separator if asked
			if($separate)
				$html .= ', ';
		}
   	}
   	
   	// Close the opened dir
   	closedir($open_rep);
   	
   	// Output the HTML code
   	return $html;
}

// The function to disable an input
function disableInput($value) {
	if($value == 'off')
		echo ' disabled="disabled"';
}

// The function to generate a strong hash
function genStrongHash($string) {
	// Initialize
	$i = 0;
	
	// Loop to generate a incredibly strong hash (can be a bit slow)
	while($i < 10) {
		$string = hash('sha256', $string);
		
		$i++;
	}
	
	return $string;
}

// The function to generate the version hash
function genHash($version) {
	// Get the configuration files path
	$conf_path = PHP_BASE.'/store/conf/';
	$conf_main = $conf_path.'main.xml';
	$conf_hosts = $conf_path.'hosts.xml';
	$conf_background = $conf_path.'background.xml';
	
	// Get the hash of the main configuration file
	if(file_exists($conf_main))
		$hash_main = md5_file($conf_main);
	else
		$hash_main = '0';
	
	// Get the hash of the main configuration file
	if(file_exists($conf_hosts))
		$hash_hosts = md5_file($conf_hosts);
	else
		$hash_hosts = '0';
	
	// Get the hash of the background configuration file
	if(file_exists($conf_background))
		$hash_background = md5_file($conf_background);
	else
		$hash_background = '0';
	
	return md5($version.$hash_main.$hash_hosts.$hash_background);
}

// The function to hide the error messages
function hideErrors() {
	if(!isDeveloper())
		ini_set('display_errors','off');
}

function hasGZip() {
	if(COMPRESSION == 'on')
		return true;
	
	return false;
}

function httpsStorage() {
	if(HTTPS_STORAGE == 'on')
		return true;
	
	return false;
}

// The function to compress the output pages
function gzipThis() {
	if(hasGZip() && !isDeveloper())
		ob_start('ob_gzhandler');
}

// The function to add the input locker
function lockHost() {
	if(LOCK_HOST == 'on')
		echo 'disabled="disabled" ';
}

// The function to check if anonymous mode is authorized
function anonymousMode() {
	if(isset($_GET['r']) && !empty($_GET['r']) && HOST_ANONYMOUS && (ANONYMOUS == 'on'))
		return true;
	else
		return false;
}

// The function to quickly translate a string
function _e($string) {
	echo T_gettext($string);
}

// The function to check the encrypted mode
function sslCheck() {
	if(ENCRYPTION == 'on')
		return true;
	else
		return false;
}

// The function to return the encrypted link
function sslLink() {
	if(!$_SERVER['HTTPS'])
		$link = '<a class="home-images crypted" href="https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'].'">'.T_('Encrypted').'</a>';
	else
		$link = '<a class="home-images uncrypted" href="http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'].'">'.T_('Uncrypted').'</a>';
	
	return $link;
}

// The function to get the Jappix full URL
function jappixURL() {
	// Check for HTTPS
	$protocol = $_SERVER['HTTPS'] == 'on' ? 'https' : 'http';
	
	// Full URL
	$url = $protocol.'://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
	
	return $url;
}

// The function to get the Jappix location (only from Get API!)
function jappixLocation() {
	// Filter the URL
	return preg_replace('/((.+)\/)php\/get\.php(\S)+$/', '$1', jappixURL());
}

// The function to replace classical path to get.php paths
function setPath($string, $host, $type, $locale) {
	// We generate the hash
	$hash = genHash(getVersion());
	
	// Initialize the static server path
	$static = '.';
	
	// Replace the JS strings
	if($type == 'js') {
		// Static host defined
		if($host != '.')
			$static = $host;
		
		// Links to JS (must have a lang parameter)
		$new = preg_replace('/((\")|(\'))(\.\/)(js)(\/)(.+)(js)((\")|(\'))/', '$1'.$static.'/php/get.php?h='.$hash.'&l='.$locale.'&t=$5&f=$7$8$9', $string);
		
		// Other "normal" links (no lang parameter)
		$new = preg_replace('/((\")|(\'))(\.\/)(css|img|store|snd)(\/)(.+)(css|png|jpg|jpeg|gif|bmp|ogg|oga)((\")|(\'))/', '$1'.$static.'/php/get.php?h='.$hash.'&t=$5&f=$7$8$9', $new);
	}
	
	// Replace the CSS strings
	else if($type == 'css') {
		// Static host defined
		if($host != '.')
			$static = $host.'/php';
		
		$new = preg_replace('/(\(\.\.\/)(css|js|img|store|snd)[\/](.+)(css|js|png|jpg|jpeg|gif|bmp|ogg|oga)(\))/', '('.$static.'/get.php?h='.$hash.'&t=$2&f=$3$4)', $string);
	}
	
	return $new;
}

// The function to set the good translation to a JS file
function setTranslation($string) {
	return preg_replace('/_e\("([^\"\"]+)"\)/e', "'_e(\"'.T_gettext('$1').'\")'", $string);
}

// The function to set the good configuration to a JS file
function setConfiguration($string, $locale, $version) {
	// Configuration array
	$array = array();
	
	// xml:lang
	$array['XML_LANG'] = $locale;
	
	// Jappix parameters
	$array['JAPPIX_LOCATION'] = jappixLocation();
	$array['JAPPIX_VERSION'] = $version;
	
	// Main configuration
	$array['SERVICE_NAME'] = SERVICE_NAME;
	$array['SERVICE_DESC'] = SERVICE_DESC;
	$array['JAPPIX_RESOURCE'] = JAPPIX_RESOURCE;
	$array['LOCK_HOST'] = LOCK_HOST;
	$array['ANONYMOUS'] = ANONYMOUS;
	$array['HTTPS_STORAGE'] = HTTPS_STORAGE;
	$array['ENCRYPTION'] = ENCRYPTION;
	$array['COMPRESSION'] = COMPRESSION;
	$array['DEVELOPER'] = DEVELOPER;
	
	// Hosts configuration
	$array['HOST_MAIN'] = HOST_MAIN;
	$array['HOST_MUC'] = HOST_MUC;
	$array['HOST_VJUD'] = HOST_VJUD;
	$array['HOST_ANONYMOUS'] = HOST_ANONYMOUS;
	$array['HOST_BOSH'] = HOST_BOSH;
	$array['HOST_STATIC'] = HOST_STATIC;
	
	// Apply it!
	foreach($array as $array_key => $array_value)
		$string = preg_replace('/var '.$array_key.'(( )?=( )?)null;/', 'var '.$array_key.'$1\''.addslashes($array_value).'\';', $string);
	
	return $string;
}

// The function to set the background
function setBackground($string) {
	// Get the default values
	$array = defaultBackground();
	
	// Read the background configuration
	$xml = readXML('conf', 'background');
	
	if($xml) {
		$read = new SimpleXMLElement($xml);
		
		foreach($read->children() as $child) {
			// Any value?
			if($child)
				$array[$child->getName()] = $child;
		}
	}
	
	$css = '';
	
	// Generate the CSS code
	switch($array['type']) {
		// Image
		case 'image':
			$css .= 
	"\n".'	background-image: url(../store/backgrounds/'.urlencode($array['image_file']).');
	background-repeat: '.$array['image_repeat'].';
	background-position: '.$array['image_horizontal'].' '.$array['image_vertical'].';
	background-color: '.$array['image_color'].';'
			;
			
			// Add CSS code to adapt the image?
			if($array['image_adapt'] == 'on')
				$css .= 
	'	background-attachment: fixed;
	background-size: cover;
	background-size: cover;
	-moz-background-size: cover;
	-webkit-background-size: cover;';
			
			$css .= "\n";
			
			break;
		
		// Color
		case 'color':
			$css .= "\n".'	background-color: '.$array['color_color'].';'."\n";
			
			break;
		
		// Default: use the filtering regex
		default:
			$css .= '$3';
			
			break;
	}
	
	// Apply the replacement!
	return preg_replace('/(\.body-images( )?\{)([^\{\}]+)(\})/i', '$1'.$css.'$4', $string);
}

// The function to include a translation file
function includeTranslation($locale, $domain) {
	T_setlocale(LC_MESSAGES, $locale);
	T_bindtextdomain($domain, PHP_BASE.'/lang');
	T_bind_textdomain_codeset($domain, 'UTF-8');
	T_textdomain($domain);
}

// The function to check the cache presence
function hasCache($hash) {
	if(file_exists('../store/cache/'.$hash.'.cache'))
		return true;
	else
		return false;
}

// The function to check if developer mode is enabled
function isDeveloper() {
	if(DEVELOPER == 'on')
		return true;
	else
		return false;
}

// The function to get a file extension
function getFileExt($name) {
	return strtolower(preg_replace('/^(.+)(\.)(.+)$/i', '$3', $name));
}

// The function to get a file type
function getFileType($ext) {
	switch($ext) {
		// Images
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'bmp':
		case 'gif':
		case 'tif':
		case 'svg':
		case 'psp':
		case 'xcf':
			$file_type = 'image';
			break;
		
		// Videos
		case 'ogv':
		case 'mkv':
		case 'avi':
		case 'mov':
		case 'mp4':
		case 'm4v':
		case 'wmv':
		case 'asf':
		case 'mpg':
		case 'mpeg':
		case 'ogm':
		case 'rmvb':
		case 'rmv':
		case 'qt':
		case 'flv':
		case 'ram':
		case '3gp':
		case 'avc':
			$file_type = 'video';
			break;
		
		// Sounds
		case 'oga':
		case 'ogg':
		case 'mka':
		case 'flac':
		case 'mp3':
		case 'wav':
		case 'm4a':
		case 'wma':
		case 'rmab':
		case 'rma':
		case 'bwf':
		case 'aiff':
		case 'caf':
		case 'cda':
		case 'atrac':
		case 'vqf':
		case 'au':
		case 'aac':
		case 'm3u':
		case 'mid':
		case 'mp2':
		case 'snd':
		case 'voc':
			$file_type = 'audio';
			break;
		
		// Documents
		case 'pdf':
		case 'odt':
		case 'ott':
		case 'sxw':
		case 'stw':
		case 'ots':
		case 'sxc':
		case 'stc':
		case 'sxi':
		case 'sti':
		case 'pot':
		case 'odp':
		case 'ods':
		case 'doc':
		case 'docx':
		case 'docm':
		case 'xls':
		case 'xlsx':
		case 'xlsm':
		case 'xlt':
		case 'ppt':
		case 'pptx':
		case 'pptm':
		case 'pps':
		case 'odg':
		case 'otp':
		case 'sxd':
		case 'std':
		case 'std':
		case 'rtf':
		case 'txt':
		case 'htm':
		case 'html':
		case 'shtml':
		case 'dhtml':
		case 'mshtml':
			$file_type = 'document';
			break;
		
		// Packages
		case 'tgz':
		case 'gz':
		case 'tar':
		case 'ar':
		case 'cbz':
		case 'jar':
		case 'tar.7z':
		case 'tar.bz2':
		case 'tar.gz':
		case 'tar.lzma':
		case 'tar.xz':
		case 'zip':
		case 'xz':
		case 'rar':
		case 'bz':
		case 'deb':
		case 'rpm':
		case '7z':
		case 'ace':
		case 'cab':
		case 'arj':
		case 'msi':
			$file_type = 'package';
			break;
		
		// Others
		default:
			$file_type = 'other';
			break;
	}
	
	return $file_type;
}

// The function to get the cached content
function readCache($hash) {
	return file_get_contents('../store/cache/'.$hash.'.cache');
}

// The function to generate a cached file
function genCache($string, $mode, $cache) {
	if(!$mode) {
		$cache_dir = '../store/cache';
		$file_put = $cache_dir.'/'.$cache.'.cache';
		
		// Cache not yet wrote
		if(is_dir($cache_dir) && !file_exists($file_put))
			file_put_contents($file_put, $string);
	}
}

// The function to compress the CSS
function compressCSS($buffer) {
	// We remove the comments
	$buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);
	
	// We remove the useless spaces
	$buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '	 ', '	 '), '', $buffer);
	
	// We remove the last useless spaces
	$buffer = str_replace(array(' { ',' {','{ '), '{', $buffer);
	$buffer = str_replace(array(' } ',' }','} '), '}', $buffer);
	$buffer = str_replace(array(' : ',' :',': '), ':', $buffer);
 	
	return $buffer;
}

// The function to keep the current GET vars
function keepGet($current, $no_get) {
	// Get the HTTP GET vars
	$request = $_SERVER['REQUEST_URI'];
	
	if(strrpos($request, '?') === false)
		$get = '';
	
	else {
		$uri = explode('?', $request);
		$get = $uri[1];
	}
	
	// Remove the items we don't want here
	$proper = str_replace('&', '&amp;', $get);
	$proper = preg_replace('/((^)|(&amp;))(('.$current.'=)([^&]+))/i', '', $proper);
	
	// Nothing at the end?
	if(!$proper)
		return '';
	
	// We have no defined GET var
	if($no_get) {
		// Remove the first "&" if it appears
		if(preg_match('/^(&(amp;)?)/i', $proper))
			$proper = preg_replace('/^(&(amp;)?)/i', '', $proper);
		
		// Add the first "?"
		$proper = '?'.$proper;
	}
	
	// Add a first "&" if there is no one and no defined GET var
	else if(!$no_get && (substr($proper, 0, 1) != '&') && (substr($proper, 0, 5) != '&amp;'))
		$proper = '&amp;'.$proper;
	
	return $proper;
}

// Escapes regex special characters for in-regex usage
function escapeRegex($string) {
	return preg_replace('/[-[\]{}()*+?.,\\^$|#\s]/', '\\$&', $string);
}

// Generates the security HTML code
function securityHTML() {
	return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Jappix - Forbidden</title>
</head>

<body>
	<h1>Forbidden</h1>
	<h4>This is a private folder</h4>
</body>

</html>';
}

// Checks if a relative server path is safe
function isSafe($path) {
	// Mhh, someone is about to nasty stuffs (previous folder, or executable scripts)
	if(preg_match('/\.\.\//', $path) || preg_match('/index\.html?$/', $path) || preg_match('/(\.)((php([0-9]+)?)|(aspx?)|(cgi)|(rb)|(py)|(pl)|(jsp)|(ssjs)|(lasso)|(dna)|(tpl)|(smx)|(cfm))$/i', $path))
		return false;
	
	return true;
}

// Checks if a file is a valid image
function isImage($file) {
	// This is an image
	if(preg_match('/^(.+)(\.)(png|jpg|jpeg|gif|bmp)$/i', $file))
		return true;
	
	return false;
}

// Puts a marker on the current opened manager tab
function currentTab($current, $page) {
	if($current == $page)
		echo ' class="tab-active"';
}

function removeDir($dir) {
	// Can't open the dir
	if(!$dh = @opendir($dir))
		return;
	
	// Loop the current dir to remove its content
	while(false !== ($obj = readdir($dh))) {
		// Not a "real" directory
		if(($obj == '.') || ($obj == '..'))
			continue;
		
		// Not a file, remove this dir
		if(!@unlink($dir.'/'.$obj))
			removeDir($dir.'/'.$obj);
	}
	
	// Close the dir and remove it!
	closedir($dh);
	@rmdir($dir);
}

function copyDir($source, $destination) {
	// This is a directory
	if(is_dir($source)) {
		// Create the target directory
		@mkdir($destination);
		$directory = dir($source);
		
		// Append the source directory content into the target one
		while(FALSE !== ($readdirectory = $directory->read())) {
			if(($readdirectory == '.') || ($readdirectory == '..'))
				continue;
			
			$PathDir = $source.'/'.$readdirectory;
			
			// Recursive copy
			if(is_dir($PathDir)) {
				copyDir($PathDir, $destination.'/'.$readdirectory);
				
				continue;
			}
			
			copy($PathDir, $destination.'/'.$readdirectory);
		}
	 	
	 	// Close the source directory
		$directory->close();
	}
	
	// This is a file
	else
		copy($source, $destination);
}

// Gets the total size of a directory
function sizeDir($dir) {
	$size = 0;
	
	foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $file)
        	$size += $file->getSize();
	
	return $size;
}

// Set the good unity for a size in bytes
function formatBytes($bytes, $precision = 2) {
	$units = array('B', 'KB', 'MB', 'GB', 'TB');
	
	$bytes = max($bytes, 0);
	$pow = floor(($bytes ? log($bytes) : 0) / log(1024));
	$pow = min($pow, count($units) - 1);
	
	$bytes /= pow(1024, $pow);
	
	return round($bytes, $precision) . ' ' . $units[$pow];
}

// Converts a human-readable bytes value to a computer one
function humanToBytes($string) {
	// Values array
	$values = array();
	$values['K'] = '000';
	$values['M'] = '000000';
	$values['G'] = '000000000';
	$values['T'] = '000000000000';
	$values['P'] = '000000000000000';
	$values['E'] = '000000000000000000';
	$values['Z'] = '000000000000000000000';
	$values['Y'] = '000000000000000000000000';
	
	// Filter the string
	foreach($values as $key => $zero)
		$string = str_replace($key, $zero, $string);
	
	// Converts the string into an integer
	$string = intval($string);
	
	return $string;
}

// Set the good unity for a size in bytes
function numericToMonth($id) {
	$array = array();
	$array[1] = T_("January");
	$array[2] = T_("February");
	$array[3] = T_("March");
	$array[4] = T_("April");
	$array[5] = T_("May");
	$array[6] = T_("June");
	$array[7] = T_("July");
	$array[8] = T_("August");
	$array[9] = T_("September");
	$array[10] = T_("October");
	$array[11] = T_("November");
	$array[12] = T_("December");
	
	return $array[$id];
}

// Get the maximum file upload size
function uploadMaxSize() {
	// Not allowed to upload files?
	if(ini_get('file_uploads') != 1)
		return 0;
	
	// Upload maximum file size
	$upload = humanToBytes(ini_get('upload_max_filesize'));
	
	// POST maximum size
	$post = humanToBytes(ini_get('post_max_size'));
	
	// Return the lowest value
	if($upload <= $post)
		return $upload;
	
	return $post;
}

// Extracts the version number with a version ID
function versionNumber($id) {
	// First, extract the number string from the [X]
	$first_extract = preg_replace('/^(.+)\[(\S+)\]$/', '$2', $id);
	
	// Second extract: ~ (when this is a special version, like ~dev)
	$second_extract = preg_replace('/^(.+)~(.+)$/', '$1', $first_extract);
	
	// Convert this to an integer
	$extract = floatval($second_extract);
	
	return $extract;
}

// Checks for new Jappix updates
function newUpdates($force) {
	$cache_path = PHP_BASE.'/store/updates/version.xml';
	
	// No cache, obsolete one or refresh forced
	if(!file_exists($cache_path) || (file_exists($cache_path) && (time() - (filemtime($cache_path)) >= 86400)) || $force) {
		// Get the content
		$last_version = file_get_contents('http://project.jappix.com/xml/version.xml');
		
		// Write the content
		file_put_contents($cache_path, $last_version);
	}
	
	// Read from the cache
	else
		$last_version = file_get_contents($cache_path);
	
	// No data?
	if(!$last_version)
		return false;
	
	// Parse the XML
	$xml = new SimpleXMLElement($last_version);
	
	// Get the version numbers
	$current_version = getVersion();
	$last_version = $xml->id;
	
	// Check if we have the latest version
	$current_version = versionNumber($current_version);
	$last_version = versionNumber($last_version);
	
	if($current_version < $last_version)
		return true;
	
	return false;
}

// Gets the Jappix update informations
function updateInformations() {
	// Get the XML file content
	$data = file_get_contents(PHP_BASE.'/store/updates/version.xml');
	
	// Transform the XML content into an array
	$array = array();
	
	// No XML?
	if(!$data)
		return $array;
	
	$xml = new SimpleXMLElement($data);
	
	// Parse the XML to add it to the array
	foreach($xml->children() as $this_child) {
		// Get the node name
		$current_name = $this_child->getName();
		
		// Push it to the array, with a basic HTML encoding
		$array[$current_name] = str_replace('\n', '<br />', $this_child);
	}
	
	// Return this array
	return $array;
}

// Processes the Jappix update from an external package
function processUpdate($url) {
	// Archive path
	$name = md5($url).'.zip';
	$update_dir = $dir_base.'store/updates/';
	$path = PHP_BASE.'/store/updates/'.$name;
	$extract_to = $update_dir.'jappix/';
	$store_tree = PHP_BASE.'/php/store-tree.php';
	
	// We must get the archive from the server
	if(!file_exists($path)) {
		echo('<p>» '.T_("Downloading the package...").'</p>');
		
		// Open the packages
		$local = fopen($path, 'w');
		$remote = fopen($url, 'r');
		
		// Could not open a socket?!
		if(!$remote) {
			echo('<p>» '.T_("Aborted: socket error!").'</p>');
			
			// Remove the broken local archive
			unlink($path);
			
			return false;
		}
		
		// Read the file
		while(!feof($remote)) {
			// Get the buffer
			$buffer = fread($remote, 1024);
			
			// Any error?
			if($buffer == 'Error.') {
				echo('<p>» '.T_("Aborted: buffer error!").'</p>');
				
				// Remove the broken local archive
				unlink($path);
				
				return false;
			}
			
			// Write the buffer to the file
			fwrite($local, $buffer);
			
			// Flush the current buffer
			ob_flush();
			flush();
   		}
   		
   		// Close the files
   		fclose($local);
   		fclose($remote);
	}
	
	// Then, we extract the archive
	echo('<p>» '.T_("Extracting the package...").'</p>');
	
	$zip = new ZipArchive;
	$zip_open = $zip->open($path);
	
	if($zip_open === TRUE) {
		// $zip->extractTo($dir_base);
		$zip->extractTo($update_dir);
		$zip->close();
	}
	
	else {
		echo('<p>» '.T_("Aborted: could not extract the package!").'</p>');
		
		// Remove the broken source folder
		removeDir($to_remove);
		
		return false;
	}
	
	// Remove the ./store dir from the source directory
	removeDir($extract_to.'store/');
	
	// Then, we remove the Jappix system files
	echo('<p>» '.T_("Removing current Jappix system files...").'</p>');
	
	// Open the general directory
	$dir_base = PHP_BASE.'/';
	$scan = scandir($dir_base);
	
	// Filter the scan array
	$scan = array_diff($scan, array('.', '..', '.svn', 'store'));
	
	// Check all the files are writable
	foreach($scan as $scanned) {
		if(!is_writable($dir_base.$scanned)) {
			echo('<p>» '.T_("Aborted: everything is not writable!").'</p>');
			
			return false;
		}
	}
	
   	// Process the files deletion
   	foreach($scan as $current) {
   		$to_remove = $dir_base.$current;
   		
   		// Remove folders
		if(is_dir($to_remove))
			removeDir($to_remove);
		
		// Remove files
		else
			unlink($to_remove);
   	}
	
	// Move the extracted files to the base
	copyDir($extract_to, $dir_base);
	
	// Remove the source directory
	removeDir($extract_to);
	
	// Regenerates the store tree
	if(file_exists($store_tree)) {
		echo('<p>» '.T_("Regenerating the storage folder tree...").'</p>');
		
		// Call the special regeneration script
		include($store_tree);
	}
	
	// Remove the version package
	unlink($path);
	
	// The new version is now installed!
	echo('<p>» '.T_("Jappix is now up to date!").'</p>');
	
	return true;
}

// Returns an array with the biggest share folders
function shareStats() {
	// Define some stuffs
	$path = PHP_BASE.'/store/share/';
	$array = array();
	
	// Open the directory
	$open = opendir($path);
	
	// Loop the share files
	while($current = readdir($open)) {
		if(is_dir($path.$current) && !preg_match('/^(\.(.+)?)$/i', $current))
			array_push($array, $current);
   	}
   	
   	// Close the opened dir
   	closedir($open);
	
	return $array;
}

// Returns the largest share folders
function largestShare($array, $number) {
	// Define some stuffs
	$path = PHP_BASE.'/store/share/';
	$size_array = array();
	
	// Push the results in an array
	foreach($array as $current)
		$size_array[$current] = sizeDir($path.$current);
	
	// Sort this array
	arsort($size_array);
	
	// Select the first biggest values
	$size_array = array_slice($size_array, 0, $number);
	
	return $size_array;
}

// Returns the others statistics array
function otherStats() {
	// New array
	$others_stats = array();
	
	// Fill it with the values
	$others_stats[T_("Backgrounds")] = sizeDir(PHP_BASE.'/store/backgrounds/');
	$others_stats[T_("Cache")] = sizeDir(PHP_BASE.'/store/cache/');
	$others_stats[T_("Configuration")] = sizeDir(PHP_BASE.'/store/conf/');
	$others_stats[T_("Logs")] = sizeDir(PHP_BASE.'/store/logs/');
	$others_stats[T_("Music")] = sizeDir(PHP_BASE.'/store/music/');
	$others_stats[T_("Share")] = sizeDir(PHP_BASE.'/store/share/');
	$others_stats[T_("Updates")] = sizeDir(PHP_BASE.'/store/updates/');
	
	// Sort this array
	arsort($others_stats);
	
	return $others_stats;
}

// Normalizes special chars
function normalizeChars($string) {
	$table = array(
		'Š'=>'S', 'š'=>'s', 'Đ'=>'Dj', 'đ'=>'dj', 'Ž'=>'Z', 'ž'=>'z', 'Č'=>'C', 'č'=>'c', 'Ć'=>'C', 'ć'=>'c',
		'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E',
		'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O',
		'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U', 'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss',
		'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a', 'ç'=>'c', 'è'=>'e', 'é'=>'e',
		'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o',
		'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'ý'=>'y', 'þ'=>'b',
		'ÿ'=>'y', 'Ŕ'=>'R', 'ŕ'=>'r'
	);
	
	return strtr($string, $table);
}

// Filters the XML special chars for the SVG drawer
function filterSpecialXML($string) {
	// Strange thing: when $string = 'Mises à jour' -> bug! but 'Mise à jour' -> ok!
	$string = normalizeChars($string);
	
	// Encodes with HTML special chars
	$string = htmlspecialchars($string);
	
	return $string;
}

// Writes the current visit in the total file
function writeTotalVisit() {
	// Get the current time stamp
	$stamp = time();
	
	// Initialize the defaults
	$array = array();
	$array['total'] = 0;
	$array['stamp'] = $stamp;
	
	// Try to read the saved data
	$total_data = readXML('access', 'total');
	
	// Get the XML file values
	if($total_data) {
		// Initialize the visits reading
		$read_xml = new SimpleXMLElement($total_data);
		
		// Loop the visit elements
		foreach($read_xml->children() as $current_child)
			$array[$current_child->getName()] = intval($current_child);
	}
	
	// Increment the total number of visits
	$array['total']++;
	
	// Generate the new XML data
	$total_xml = 
	'<total>'.$array['total'].'</total>
	<stamp>'.$array['stamp'].'</stamp>'
	;
	
	// Re-write the new values
	writeXML('access', 'total', $total_xml);
}

// Writes the current visit in the months file
function writeMonthsVisit() {
	// Get the current month
	$month = intval(date('m'));
	
	// Define the stats array
	$array = array();
	
	// January to August period
	if($month <= 8) {
		for($i = 1; $i <= 8; $i++)
			$array['month_'.$i] = 0;
	}
	
	// August to September period
	else {
		$i = 8;
		$j = 1;
		
		while($j <= 3) {
			// Last year months
			if(($i >= 8) && ($i <= 12))
				$array['month_'.$i++] = 0;
			
			// First year months
			else
				$array['month_'.$j++] = 0;
		}
	}
	
	// Try to read the saved data
	$months_data = readXML('access', 'months');
	
	// Get the XML file values
	if($months_data) {
		// Initialize the visits reading
		$read_xml = new SimpleXMLElement($months_data);
		
		// Loop the visit elements
		foreach($read_xml->children() as $current_child) {
			$current_month = $current_child->getName();
			
			// Parse the current month id
			$current_id = intval(preg_replace('/month_([0-9]+)/i', '$1', $current_month));
			
			// Is this month still valid?
			if((($month <= 8) && ($current_id <= $month)) || (($month >= 8) && ($current_id >= 8) && ($current_id <= $month)))
				$array[$current_month] = intval($current_child);
		}
	}
	
	// Increment the current month value
	$array['month_'.$month]++;
	
	// Generate the new XML data
	$months_xml = '';
	
	foreach($array as $array_key => $array_value)
		$months_xml .= "\n".'	<'.$array_key.'>'.$array_value.'</'.$array_key.'>';
	
	// Re-write the new values
	writeXML('access', 'months', $months_xml);
}

// Writes the current visit to the storage file
function writeVisit() {
	// Write total visits
	writeTotalVisit();
	
	// Write months visits
	writeMonthsVisit();
}

// Gets the array of the visits stats
function getVisits() {
	// New array
	$array = array();
	$array['total'] = 0;
	$array['daily'] = 0;
	$array['weekly'] = 0;
	$array['monthly'] = 0;
	$array['yearly'] = 0;
	
	// Read the data
	$data = readXML('access', 'total');
	
	// Any data?
	if($data) {
		// Initialize the visits reading
		$xml = new SimpleXMLElement($data);
		
		// Get the XML values
		$array['total'] = intval($xml->total);
		$array['stamp'] = intval($xml->stamp);
		
		// Get the age of the stats
		$age = time() - $array['stamp'];
		
		// Generate the time-dependant values
		$timed = array();
		$timed['daily'] = 86400;
		$timed['weekly'] = 604800;
		$timed['monthly'] = 2678400;
		$timed['yearly'] = 31536000;
		
		foreach($timed as $timed_key => $timed_value) {
			if($age >= $timed_value)
				$array[$timed_key] = intval($array['total'] / ($age / $timed[$timed_key])).'';
			else
				$array[$timed_key] = $array['total'].'';
		}
	}
	
	return $array;
}

// Gets the array of the monthly visits
function getMonthlyVisits() {
	// New array
	$array = array();
	
	// Read the data
	$data = readXML('access', 'months');
	
	// Get the XML file values
	if($data) {
		// Initialize the visits reading
		$xml = new SimpleXMLElement($data);
		
		// Loop the visit elements
		foreach($xml->children() as $child) {
			// Get the current month ID
			$current_id = intval(preg_replace('/month_([0-9]+)/i', '$1', $child->getName()));
			
			// Get the current month name
			$current_name = numericToMonth($current_id);
			
			// Push it!
			$array[$current_name] = intval($child);
		}
	}
	
	return $array;
}

// Purges the target folder content
function purgeFolder($folder) {
	// Array of the folders to purge
	$array = array();
	
	// We must purge all the folders?
	if($folder == 'everything')
		array_push($array, 'cache', 'logs', 'updates');
	else
		array_push($array, $folder);
	
	// All right, now we can empty it!
	foreach($array as $current_folder) {
		// Scan the current directory
		$directory = PHP_BASE.'/store/'.$current_folder.'/';
		$scan = scandir($directory);
	   	$scan = array_diff($scan, array('.', '..', '.svn', 'index.html'));
	   	
	   	// Process the files deletion
	   	foreach($scan as $current) {
	   		$remove_this = $directory.$current;
	   		
	   		// Remove folders
			if(is_dir($remove_this))
				removeDir($remove_this);
			
			// Remove files
			else
				unlink($remove_this);
	   	}
	}
}

// Returns folder browsing informations
function browseFolder($folder, $mode) {
	// Scan the target directory
	$directory = PHP_BASE.'/store/'.$folder;
	$scan = scandir($directory);
	$scan = array_diff($scan, array('.', '..', '.svn', 'index.html'));
	
	// Odd/even marker
	$marker = 'odd';
	
	// Not in the root folder: show previous link
	if(strpos($folder, '/') !== false) {
		// Filter the folder name
		$previous_folder = substr($folder, 0, strrpos($folder, '/'));
		
		echo('<div class="one-browse previous manager-images"><a href="./?b='.$mode.'&s='.urlencode($previous_folder).keepGet('(s|b)', false).'">'.T_("Previous").'</a></div>');
	}
	
	// Empty or non-existing directory?
	if(!count($scan) || !is_dir($directory)) {
		echo('<div class="one-browse '.$marker.' alert manager-images">'.T_("The folder is empty.").'</div>');
		
		return false;
	}
	
	// Echo the browsing HTML code
	foreach($scan as $current) {
		// Generate the item path$directory
		$path = $directory.'/'.$current;
		$file = $folder.'/'.$current;
		
		// Directory?
		if(is_dir($path)) {
			$type = 'folder';
			$href = './?b='.$mode.'&s='.urlencode($file).keepGet('(s|b)', false);
			$target = '';
		}
		
		// File?
		else {
			$type = getFileType(getFileExt($path));
			$href = $path;
			$target = ' target="_blank"';
		}
		
		echo('<div class="one-browse '.$marker.' '.$type.' manager-images"><a href="'.$href.'"'.$target.'>'.htmlspecialchars($current).'</a><input type="checkbox" name="element_'.md5($file).'" value="'.htmlspecialchars($file).'" /></div>');
		
		// Change the marker
		if($marker == 'odd')
			$marker = 'even';
		else
			$marker = 'odd';
	}
	
	return true;
}

// Removes selected elements (files/folders)
function removeElements() {
	// Initialize the match
	$elements_removed = false;
	$elements_remove = array();
	
	// Try to get the elements to remove
	foreach($_POST as $post_key => $post_value) {
		// Is a safe file?
		if(preg_match('/^element_(.+)$/i', $post_key) && isSafe($post_value)) {
			// Update the marker
			$elements_removed = true;
			
			// Get the real path
			$post_element = PHP_BASE.'/store/'.$post_value;
			
			// Remove the current element
			if(is_dir($post_element))
				removeDir($post_element);
			else if(file_exists($post_element))
				unlink($post_element);
		}
	}
	
	// Show a notification message
	if($elements_removed)
		echo('<p class="info smallspace success">'.T_("The selected elements have been successfully removed.").'</p>');
	else
		echo('<p class="info smallspace fail">'.T_("You must select elements to remove!").'</p>');
}

// Manages users
function manageUsers($action, $array) {
	// Try to read the old XML file
	$users_array = getUsers();
	
	// What must we do?
	switch($action) {
		// Add some users
		case 'add':
			foreach($array as $array_user => $array_password)
				$users_array[$array_user] = genStrongHash($array_password);
			
			break;
		
		// Remove some users
		case 'remove':
			foreach($array as $array_user) {
				// Not the last user?
				if(count($users_array) > 1)
					unset($users_array[$array_user]);
			}
			
			break;
	}
	
	// Regenerate the XML
	$users_xml = '';
	
	foreach($users_array as $users_name => $users_password)
		$users_xml .= "\n".'	<user name="'.htmlspecialchars($users_name).'" password="'.$users_password.'" />';
	
	// Write the main configuration
	writeXML('conf', 'users', $users_xml);
}

// Returns users browsing informations
function browseUsers() {
	// Get the users
	$array = getUsers();
	
	// Odd/even marker
	$marker = 'odd';
	
	// Echo the browsing HTML code
	foreach($array as $user => $password) {
		// Filter the username
		$user = htmlspecialchars($user);
		
		// Output the code
		echo('<div class="one-browse '.$marker.' user manager-images"><span>'.$user.'</span><input type="checkbox" name="admin_'.md5($user).'" value="'.$user.'" /><div class="clear"></div></div>');
		
		// Change the marker
		if($marker == 'odd')
			$marker = 'even';
		else
			$marker = 'odd';
	}
}

// Returns the default background array
function defaultBackground() {
	// New array
	$background_default = array();
	
	// Define the default values
	$background_default['type'] = 'default';
	$background_default['image_file'] = '';
	$background_default['image_repeat'] = 'repeat-x';
	$background_default['image_horizontal'] = 'center';
	$background_default['image_vertical'] = 'top';
	$background_default['image_adapt'] = 'off';
	$background_default['image_color'] = '#cae1e9';
	$background_default['color_color'] = '#cae1e9';
	
	return $background_default;
}

// Reads the background configuration
function readBackground() {
	// Read the background configuration XML
	$background_data = readXML('conf', 'background');
	
	// Get the default values
	$background_default = defaultBackground();
	
	// Stored data array
	$background_conf = array();
	
	// Read the stored values
	if($background_data) {
		// Initialize the background configuration XML data
		$background_xml = new SimpleXMLElement($background_data);
		
		// Loop the notice configuration elements
		foreach($background_xml->children() as $background_child)
			$background_conf[$background_child->getName()] = $background_child;
	}
	
	// Checks no value is missing in the stored configuration
	foreach($background_default as $background_name => $background_value) {
		if(!isset($background_conf[$background_name]) || empty($background_conf[$background_name]))
			$background_conf[$background_name] = $background_default[$background_name];
	}
	
	return $background_conf;
}

// Writes the background configuration
function writeBackground($array) {
	// Generate the XML data
	$xml = '';
	
	foreach($array as $key => $value)
		$xml .= "\n".'	<'.$key.'>'.htmlspecialchars($value).'</'.$key.'>';
	
	// Write this data
	writeXML('conf', 'background', $xml);
}

// Generates a list of the available background images
function getBackgrounds() {
	// Initialize the result array
	$array = array();
	
	// Scan the background directory
	$scan = scandir(PHP_BASE.'/store/backgrounds/');
	
	foreach($scan as $current) {
		if(isImage($current))
			array_push($array, $current);
	}
	
	return $array;
}

// Reads the notice configuration
function readNotice() {
	// Read the notice configuration XML
	$notice_data = readXML('conf', 'notice');
	
	// Define the default values
	$notice_default = array();
	$notice_default['type'] = 'none';
	$notice_default['notice'] = '';
	
	// Stored data array
	$notice_conf = array();
	
	// Read the stored values
	if($notice_data) {
		// Initialize the notice configuration XML data
		$notice_xml = new SimpleXMLElement($notice_data);
		
		// Loop the notice configuration elements
		foreach($notice_xml->children() as $notice_child)
			$notice_conf[$notice_child->getName()] = $notice_child;
	}
	
	// Checks no value is missing in the stored configuration
	foreach($notice_default as $notice_name => $notice_value) {
		if(!isset($notice_conf[$notice_name]) || empty($notice_conf[$notice_name]))
			$notice_conf[$notice_name] = $notice_default[$notice_name];
	}
	
	return $notice_conf;
}

// Writes the notice configuration
function writeNotice($type, $simple) {
	// Generate the XML data
	$xml = 
	'<type>'.$type.'</type>
	<notice>'.htmlspecialchars($simple).'</notice>'
	;
	
	// Write this data
	writeXML('conf', 'notice', $xml);
}

?>
