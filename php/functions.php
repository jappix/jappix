<?php

/*

Jappix - An Open μSocial Platform
These are the functions to checks things for Jappix

~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

License: AGPL
Authors: Valérian Saliou, Mathieui
Contact: http://project.jappix.com/contact
Last revision: 09/07/10

*/

// The function to get the Jappix app current version
function getVersion($open) {
	$file = file_get_contents($open);
	$file = explode('\n',$file,2);
	$version = trim($file[0]);
	
	return $version;
}

// The function to detect the user's language
function checkLanguage() {
	// If the user defined a language
	if(isset($_GET['l'])) {
		// We define some stuffs
		$defined_lang = strtolower($_GET['l']);
		$lang_file = './lang/'.$defined_lang.'/LC_MESSAGES/main.mo';
		$lang_found = file_exists($lang_file);
		
		// We check if the asked translation exists
		if ($lang_found)
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
			
			// The cookie has a value
			if($check_cookie)
				$lang = $check_cookie;
			else
				$lang = 'en';
		}
		
		// No cookie defined, naturally, we check the browser language
		else {
			// We get the language of the browser
			$nav_langs = explode(',',$_SERVER['HTTP_ACCEPT_LANGUAGE']);
			$check_en = strtolower($nav_langs[0]);
		
			// We check if this is not english
			if($check_en == 'en')
				$lang = 'en';
		
			else {
				$order = array();
			
				foreach ($nav_langs as $entry) {
					$indice = explode('=', $entry);
					$lang = strtolower(substr(trim($indice[0]), 0, 2));
					if (!$indice[1])
						$indice = 1;
					else
						$indice = $indice[1];
						$order[$lang] = $indice;
				}
			
				arsort($order);
				$lang_found = false;
			
				foreach($order as $nav_lang => $val) {
					$lang_file = './lang/'.$nav_lang.'/LC_MESSAGES/main.mo';
					if (!$lang_found) {
						$lang_found = file_exists($lang_file);
						if ($lang_found)
							$lang = $nav_lang;
					}
				}
			
				// If Jappix doen't know that language, we include the english translation
				if (!$lang_found)
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
		'uk' => 'українська мова',
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
function languageSwitcher($active_locale) {
	$repertory = './lang/';
	$directory = opendir($repertory);
	
	while ($current = readdir($directory)) {
		if(is_dir($repertory.$current) && $current && $current != $active_locale && !preg_match('/((.+)|(^))(\.)((.+)|($))/', $current))
			echo '<li><a href="./?l='.$current.keepGet('l').'">'.getLanguageName($current).'</a></li>';
   	}
	
	closedir($directory);
}

// The function to generate the version hash
function genHash($version) {
	$hash = md5($version);
	return $hash;
}

// The function to hide the error messages
function hideErrors() {
	if(DEVELOPER_MODE == 'off')
		ini_set('display_errors','off');
}

// The function to compress the output pages
function gzipThis() {
	if(GZIP == 'on')
		ob_start('ob_gzhandler');
}

// The function to add the input locker
function lockHost() {
	if(LOCK_HOST == 'on')
		echo 'disabled="disabled" ';
}

// The function to check if anonymous mode is authorized
function anonymousMode() {
	if(isset($_GET['r']) && ANONYMOUS_ENABLED == 'on' && HOST_ANONYMOUS)
		return true;
	else
		return false;
}

// The function to translate a string quickly
function _e($string) {
	echo T_gettext($string);
}

// The function to check the SSL mode
function sslCheck() {
	if(SSL == 'on')
		return true;
	else
		return false;
}

// The function to return the SSL link
function sslLink() {
	if(!$_SERVER['HTTPS'])
		$link = '<a class="home-images crypted" href="https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'].'">'.T_('Encrypted').'</a>';
	else
		$link = '<a class="home-images uncrypted" href="http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'].'">'.T_('Uncrypted').'</a>';
	
	return $link;
}

// The function to put the good theme CSS
function putTheme() {
	$theme = $_GET['t'];
	
	if(!isset($theme))
		return 'images.css';
	
	$imagecss = 'images-'.preg_replace('/[^a-z0-9]+/', '', $theme).'.css';
	
	if(!file_exists('css/'.$imagecss))
		return 'images.css';
	
	return $imagecss;
}

// The function to check the rights on the storage folder
function storeWritable() {
	$check = true;
	$repertory = './store/';
	$directory = opendir($repertory);
	
	while ($current = readdir($directory)) {
		if(is_dir($repertory.$current) && !preg_match('/((.+)|(^))(\.)((.+)|($))/', $current))
			if(!is_writable($repertory.$current))
				$check = false;
   	}
	
	closedir($directory);
	
	return $check;
}

// The function to replace classical path to get.php paths
function setPath($string, $host, $type) {
	// We generate the hash
	$hash = genHash(getVersion('../VERSION'));
	
	// If a special static host is defined
	if($host == '.')
		$static = '.';
	else
		$static = $host.'/php';
	
	// Replace the JS strings
	if($type == 'js')
		$new = preg_replace('/(\"\.\/)(css|js|img|snd)[\/](.+)(css|js|png|jpg|gif|oga)(\")/', '"'.$static.'/php/get.php?h='.$hash.'&t=$2&f=$3$4"',$string);
	
	// Replace the CSS strings
	else if($type == 'css')
		$new = preg_replace('/(\(\.\.\/)(css|js|img|snd)[\/](.+)(css|js|png|jpg|gif|oga)(\))/', '('.$static.'/get.php?h='.$hash.'&t=$2&f=$3$4)',$string);
	
	return $new;
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
	if(DEVELOPER_MODE == 'on')
		return true;
	else
		return false;
}

// The function to get the cached content
function readCache($hash) {
	return file_get_contents('../store/cache/'.$hash.'.cache');
}

// The function to generate a cached file
function genCache($string, $mode, $cache) {
	if(!$mode) {
		$file_put = '../store/cache/'.$cache.'.cache';
		if(!file_exists($file_put))
			file_put_contents('../store/cache/'.$cache.'.cache', $string);
	}
}

// The function to generate a group file
function groupFile($file, $dir, $type, $host, $cache, $mode) {
	// Explode the file string
	$array = explode('~', $file);
	$count = count($array);
	
	// File exist check loop
	$continue = true;
	$c = 0;
	
	while($c < $count) {
		// Stop the loop if a file is missing
		if(!file_exists($dir.$array[$c]))
			$continue = false;
		
		$c++;
	}
	
	// All the given files are okay
	if($continue) {
		$i = 0;
		
		while($i < $count) {
			$current = file_get_contents($dir.$array[$i])."\n";
			$pathered = setPath($current, $host, $type);
			
			if($type == 'css' && !$mode)
				$output .= compressCSS($pathered);
			else if($type == 'css' && $mode)
				$output .= $pathered;
			else if($type == 'js' && !$mode)
				$output .= JSMin::minify($pathered);
			else if($type == 'js' && $mode)
				$output .= $pathered;
			
			$i++;
		}
		
		// Display the output content
		echo $output;
		
		// Generate the cache
		genCache($output, $mode, $cache);
	}
	
	else {
		header("HTTP/1.0 404 Not Found");
		echo 'HTTP/1.0 404 Not Found';
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
function keepGet($current) {
	// Get the HTTP GET vars
	$uri = explode('?', $_SERVER['REQUEST_URI']);
	$get = $uri[1];
	
	// Remove the item we don't want here
	$proper = str_replace('&', '&amp;', $get);
	$proper = preg_replace('/((^)|(&amp;))(('.$current.'=)(\w+))/i', '', $proper);
	
	// Nothing at the end?
	if(!$proper)
		return '';
	
	// Remove the first & if exists (to avoid bugs)
	if(substr($proper, 0, 1) != '&' && substr($proper, 0, 5) != '&amp;')
		$proper = '&amp;'.$proper;
	
	return $proper;
}

?>
