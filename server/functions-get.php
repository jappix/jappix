<?php

/*

Jappix - An open social platform
These are the PHP functions for Jappix Get API

-------------------------------------------------

License: AGPL
Authors: Valérian Saliou, Mathieui, olivierm, regilero, Maranda

*/

// The function to get the cache path
function pathCache($hash) {
    return JAPPIX_BASE.'/tmp/cache/'.$hash.'.cache';
}

// The function to get the cached content
function readCache($hash) {
    return file_get_contents(pathCache($hash));
}

// The function to generate a cached file
function genCache($string, $mode, $cache) {
    if(!$mode) {
        $cache_dir = JAPPIX_BASE.'/tmp/cache';
        $file_put = $cache_dir.'/'.$cache.'.cache';

        // Cache not yet wrote
        if(is_dir($cache_dir) && !file_exists($file_put)) {
            file_put_contents($file_put, $string, LOCK_EX);
        }
    }
}

// The function to remove the BOM from a string
function rmBOM($string) {
    if(substr($string, 0, 3) == pack('CCC', 0xef, 0xbb, 0xbf)) {
        $string = substr($string, 3);
    }

    return $string;
}

// The function to compress the CSS
function compressCSS($buffer) {
    // We remove the comments
    $buffer = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $buffer);

    // We remove the useless spaces
    $buffer = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $buffer);

    // We remove the last useless spaces
    $buffer = str_replace(array(' { ',' {','{ '), '{', $buffer);
    $buffer = str_replace(array(' } ',' }','} '), '}', $buffer);
    $buffer = str_replace(array(' : ',' :',': '), ':', $buffer);

    return $buffer;
}

// The function to replace classical path to get.php paths
function setPath($string, $hash, $host, $type, $locale) {
    // Initialize the static server path
    $static = '.';

    // Replace the JS strings
    if($type == 'javascripts') {
        // Static host defined
        if($host && ($host != '.')) {
            $static = $host;
        }

        // Links to JS (must have a lang parameter)
        $string = preg_replace('/((\")|(\'))(\.\/)(js)(\/)(\S+)(js)((\")|(\'))/', '$1'.$static.'/server/get.php?h='.$hash.'&amp;l='.$locale.'&amp;t=$5&amp;f=$7$8$9', $string);

        // Other "normal" links (no lang parameter)
        $string = preg_replace('/((\")|(\'))(\.\/)(stylesheets|images|store|sounds|fonts)(\/)(\S+)(css|png|jpg|jpeg|gif|bmp|ogg|oga|mp3|svg|ttf|woff|eot)((\")|(\'))/', '$1'.$static.'/server/get.php?h='.$hash.'&amp;t=$5&amp;f=$7$8$9', $string);

        // Links to JS that are prefixed with JAPPIX_STATIC (must have a lang parameter)
        $string = preg_replace('/(\WJAPPIX_STATIC\s*\+\s*)((\")|(\'))(js)(\/)(\S+)(js)((\")|(\'))/', '$1$2'.'server/get.php?h='.$hash.'&amp;l='.$locale.'&amp;t=$5&amp;f=$7$8$9', $string);

        // Other "normal" links prefixed with JAPPIX_STATIC (no lang parameter) (used by mini)
        $string = preg_replace('/(\WJAPPIX_STATIC\s*\+\s*)((\")|(\'))(stylesheets|images|store|sounds|fonts)(\/)(\S+)(css|png|jpg|jpeg|gif|bmp|ogg|oga|mp3|svg|ttf|woff|eot)((\")|(\'))/', '$1$2'.'server/get.php?h='.$hash.'&amp;t=$5&amp;f=$7$8$9', $string);
    }

    // Replace the CSS strings
    else if($type == 'stylesheets') {
        // Static host defined
        if($host && ($host != '.')) {
            $static = $host.'/server';
        }

        $string = preg_replace('/(\(((\")|(\'))?\.\.\/)(images|store|sounds|fonts)(\/)(\S+)(png|jpg|jpeg|gif|bmp|ogg|oga|mp3|svg|ttf|woff|eot)(\?)?(#\w+)?((\")|(\'))?(\))/', '('.$static.'/get.php?h='.$hash.'&t=$5&f=$7$8$10)', $string);
    }

    return $string;
}

// The function to set the good translation to a JS file
function setTranslation($string) {
    return preg_replace_callback(
        '/_e\("([^\"\"]+)"\)/',

        function($m) {
            return '_e("'.addslashes(removeNewLines(T_gettext(stripslashes($m[1])))).'")';
        },

        $string
    );
}

// The function to set the good locales
function setLocales($string, $locale) {
    // Generate the two JS array list
    $available_list = availableLocales($locale);
    $available_id = '';
    $available_names = '';

    // Add the values to the arrays
    foreach($available_list as $current_id => $current_name) {
        $available_id .= '\''.$current_id.'\', ';
        $available_names .= '\''.addslashes($current_name).'\', ';
    }

    // Remove the last comma
    $regex = '/(.+), $/';
    $available_id = preg_replace($regex, '$1', $available_id);
    $available_names = preg_replace($regex, '$1', $available_names);

    // Locales array
    $array = array(
        'LOCALES_AVAILABLE_ID' => $available_id,
        'LOCALES_AVAILABLE_NAMES' => $available_names
    );

    // Apply it!
    foreach($array as $array_key => $array_value) {
        $string = preg_replace('/(var '.$array_key.'(( )?=( )?)\[)(\];)/', '$1'.$array_value.'$5', $string);
    }

    return $string;
}

// The function to set the good configuration to a JS file
function setConfiguration($string, $hash, $locale, $version, $max_upload) {
    // Special BOSH URL if BOSH proxy enabled
    if(BOSHProxy()) {
        $bosh_special = staticLocation().'server/bosh.php';
    } else {
        $bosh_special = HOST_BOSH;
    }

    // Configuration array
    $array = array(
                // xml:lang
                'XML_LANG'      => $locale,

                // Jappix parameters
                'JAPPIX_STATIC'         => staticLocation(),
                'JAPPIX_VERSION'        => $version,
                'JAPPIX_MAX_FILE_SIZE'  => $max_upload,
                'JAPPIX_MAX_UPLOAD'     => formatBytes($max_upload),
                'JAPPIX_MINI_CSS'       => getFiles($hash, '', 'css', 'mini.xml', ''),

                // Main configuration
                'SERVICE_NAME'          => SERVICE_NAME,
                'SERVICE_DESC'          => SERVICE_DESC,
                'OWNER_NAME'            => OWNER_NAME,
                'OWNER_WEBSITE'         => OWNER_WEBSITE,
                'LEGAL'                 => LEGAL,
                'JAPPIX_RESOURCE'       => JAPPIX_RESOURCE,
                'LOCK_HOST'             => LOCK_HOST,
                'ANONYMOUS'             => ANONYMOUS,
                'REGISTRATION'          => REGISTRATION,
                'MANAGER_LINK'          => MANAGER_LINK,
                'GROUPCHATS_JOIN'       => GROUPCHATS_JOIN,
                'GROUPCHATS_SUGGEST'    => GROUPCHATS_SUGGEST,
                'ENCRYPTION'            => ENCRYPTION,
                'HTTPS_STORAGE'         => HTTPS_STORAGE,
                'HTTPS_FORCE'           => HTTPS_FORCE,
                'COMPRESSION'           => COMPRESSION,
                'ADS_ENABLE'            => ADS_ENABLE,
                'GADS_CLIENT'           => GADS_CLIENT,
                'GADS_SLOT'             => GADS_SLOT,
                'MULTI_FILES'           => MULTI_FILES,
                'DEVELOPER'             => DEVELOPER,
                'REGISTER_API'          => REGISTER_API,

                // Hosts configuration
                'HOST_MAIN'             => HOST_MAIN,
                'HOST_MUC'              => HOST_MUC,
                'HOST_PUBSUB'           => HOST_PUBSUB,
                'HOST_VJUD'             => HOST_VJUD,
                'HOST_ANONYMOUS'        => HOST_ANONYMOUS,
                'HOST_STUN'             => HOST_STUN,
                'HOST_TURN'             => HOST_TURN,
                'HOST_TURN_USERNAME'    => HOST_TURN_USERNAME,
                'HOST_TURN_PASSWORD'    => HOST_TURN_PASSWORD,
                'HOST_BOSH'             => $bosh_special,
                'HOST_BOSH_MAIN'        => HOST_BOSH_MAIN,
                'HOST_BOSH_MINI'        => HOST_BOSH_MINI,
                'HOST_WEBSOCKET'        => HOST_WEBSOCKET,
                'HOST_STATIC'           => HOST_STATIC,
                'HOST_UPLOAD'           => HOST_UPLOAD
              );

    // Apply it!
    foreach($array as $array_key => $array_value) {
        $string = preg_replace('/var '.$array_key.'(( )?=( )?)null;/', 'var '.$array_key.'$1\''.addslashes($array_value).'\';', $string);
    }

    return $string;
}

// The function to set the logos
function setLogos($string, $files) {
    // Jappix Desktop home logo?
    if(in_array('home.css', $files) && file_exists(JAPPIX_BASE.'/store/logos/desktop_home.png')) {
        $string .=
'#home .left .logo {
    background-image: url(../store/logos/desktop_home.png) !important;
    background-position: center center !important;
}';
    }

    // Jappix Desktop app logo?
    if(in_array('tools.css', $files) && file_exists(JAPPIX_BASE.'/store/logos/desktop_app.png')) {
        $string .=
'#top-content .tools-logo {
    background-image: url(../store/logos/desktop_app.png) !important;
    background-position: center center !important;
}';
    }

    // Jappix Mobile logo?
    if(in_array('mobile.css', $files) && file_exists(JAPPIX_BASE.'/store/logos/mobile.png')) {
        $string .=
'.header div {
    background-image: url(../store/logos/mobile.png) !important;
    background-position: center center !important;
}';
    }

    // Jappix Mini logo?
    if(in_array('mini.css', $files) && file_exists(JAPPIX_BASE.'/store/logos/mini.png')) {
        $string .=
'#jappix_mini div.jm_actions a.jm_logo {
    background-image: url(../store/logos/mini.png) !important;
    background-position: center center !important;
}';
    }

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
            $current_child = (string)$child;

            // Any value?
            if($current_child)
                $array[$child->getName()] = $current_child;
        }
    }

    $css = '';

    // Generate the CSS code
    switch($array['type']) {
        // Image
        case 'image':
            $css .=
    "\n".'  background-image: url(../store/backgrounds/'.urlencode($array['image_file']).');
    background-repeat: '.$array['image_repeat'].';
    background-position: '.$array['image_horizontal'].' '.$array['image_vertical'].';
    background-color: '.$array['image_color'].';'
            ;

            // Add CSS code to adapt the image?
            if($array['image_adapt'] == 'on')
                $css .=
    '   background-attachment: fixed;
    background-size: cover;
    -moz-background-size: cover;
    -webkit-background-size: cover;';

            $css .= "\n";

            break;

        // Color
        case 'color':
            $css .= "\n".'  background-color: '.$array['color_color'].';'."\n";

            break;

        // Default: use the filtering regex
        default:
            $css .= '$3';

            break;
    }

    // Apply the replacement!
    return preg_replace('/(\.body-images( )?\{)([^\{\}]+)(\})/i', '$1'.$css.'$4', $string);
}

?>
