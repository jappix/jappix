<?php

/*

Jappix - An open social platform
These are the Jappix advertising functions

NOTICE: THIS SCRIPT USES THE THIRD-PARTY SERVICE BACKLINKS.COM

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Get the adverts
function getAdverts() {
    // Available pages
    $script = 'engine.php';
    $key = ADS_STANDARD;

    // Not available?
    if(!$key) {
        return '';
    }

    $cache_file = JAPPIX_BASE.'/tmp/cache/ads_'.md5($key).'.cache';

    // Must get from server?
    if(!file_exists($cache_file) || (isset($_SERVER['HTTP_USER_AGENT']) && ($_SERVER['HTTP_USER_AGENT'] == 'BackLinks.com'))) {
        // Get the cache data
        if(strlen($_SERVER['SCRIPT_URI']))
            $_SERVER['REQUEST_URI'] = $_SERVER['SCRIPT_URI'].((strlen($_SERVER['QUERY_STRING'])) ? '?'.$_SERVER['QUERY_STRING'] : '');
        if(!strlen($_SERVER['REQUEST_URI']))
            $_SERVER['REQUEST_URI'] = $_SERVER['SCRIPT_NAME'].((strlen($_SERVER['QUERY_STRING'])) ? '?'.$_SERVER['QUERY_STRING'] : '');

        $query = 'LinkUrl='.urlencode((($_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://').$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
        $query .= '&Key='.urlencode($key);
        $query .= '&OpenInNewWindow=1';
        $code = @file_get_contents('http://www.backlinks.com/'.$script.'?'.$query);

        // Write code to cache
        @file_put_contents($cache_file, $code);
    } else {
        $code = @file_get_contents($cache_file);
    }

    if(!$code) {
        $code = '';
    }

    return $code;
}

// Display the adverts
function displayAdverts($refer) {
        // Get content ads
        $ads_content = getAdverts();

        if(strpos(strtolower($ads_content), '</a>')) {
            echo($ads_content);
        } else {
            echo $ads_content;

            echo '<a class="available_space" href="'.$refer.'" target="_blank">';
                echo '<span class="home-images icon"></span>';
                echo '<span class="label">'.T_("Advertising space available!").'</span>';
            echo '</a>';
        }
}

?>
