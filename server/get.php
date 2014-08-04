<?php

/*

Jappix - An open social platform
This is the file get script

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// PHP base
define('JAPPIX_BASE', '..');

// We get the needed files
require_once('./functions.php');
require_once('./functions-get.php');
require_once('./read-main.php');
require_once('./read-hosts.php');

// Prepare application
enableErrorSink();
hideErrors();

// Get some parameters
$is_developer = isDeveloper();
$has_compression = hasCompression();

// Cache control (for development & production)
if($is_developer) {
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
} else if(hasCaching()) {
    $expires = 31536000;

    header('Cache-Control: maxage='.$expires);
    header('Expires: '.gmdate('D, d M Y H:i:s', (time() + $expires)).' GMT');
}

// Initialize the vars
$type = '';
$file = '';

// Read the type var
if(isset($_GET['t']) && !empty($_GET['t']) && preg_match('/^(css|stylesheets|js|javascripts|img|images|snd|sounds|fonts|store)$/', $_GET['t'])) {
    $type = $_GET['t'];
}

// Read the files var
if(isset($_GET['f']) && !empty($_GET['f']) && isSafe($_GET['f'])) {
    $file = $_GET['f'];
}

// Read the group var (only for text files)
if(isset($_GET['g']) && !empty($_GET['g']) && preg_match('/^(\S+)\.xml$/', $_GET['g']) && preg_match('/^(css|stylesheets|js|javascripts)$/', $type) && isSafe($_GET['g']) && file_exists(JAPPIX_BASE.'/app/bundles/'.$_GET['g'])) {
    $xml_data = file_get_contents(JAPPIX_BASE.'/app/bundles/'.$_GET['g']);

    // Any data?
    if($xml_data) {
        $xml_read = new SimpleXMLElement($xml_data);
        $xml_parse = $xml_read->$type;

        // Files were added to the list before (with file var)?
        if($file) {
            $file .= '~'.$xml_parse;
        } else {
            $file = $xml_parse;
        }
    }
}

// We check if the data was submitted
if($file && $type) {
    // We define some stuffs
    $type = normalizeFileType($type);
    $dir = JAPPIX_BASE.'/app/'.$type.'/';
    $path = $dir.$file;

    // Read request headers
    $if_modified_since = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? trim($_SERVER['HTTP_IF_MODIFIED_SINCE']) : null;
    $if_modified_since = $if_modified_since ? strtotime($if_modified_since) : null;

    // Define the real type if this is a "store" file
    if($type == 'store') {
        // Rewrite path
        $dir = JAPPIX_BASE.'/store/';
        $path = $dir.$file;

        // Extract the file extension
        switch(getFileExt($file)) {
            // CSS file
            case 'css':
                $type = 'stylesheets'; break;

            // JS file
            case 'js':
                $type = 'javascripts';  break;

            // Audio file
            case 'ogg':
            case 'oga':
            case 'mp3':
                $type = 'sounds'; break;

            // Image file
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'bmp':
                $type = 'images'; break;

            // Image file
            case 'woff':
            case 'ttf':
            case 'eot':
            case 'svg':
                $type = 'fonts'; break;
        }
    }

    // JS and CSS special stuffs
    if(($type == 'stylesheets') || ($type == 'javascripts')) {
        // Compression var
        if($has_compression) {
            $cache_encoding = 'deflate';
        } else {
            $cache_encoding = 'plain';
        }

        // Get the vars
        $version = getVersion();
        $hash = genHash($version);
        $cache_hash = md5($path.$hash.staticLocation()).'_'.$cache_encoding;

        // Check if the browser supports DEFLATE
        $deflate_support = false;

        if(isset($_SERVER['HTTP_ACCEPT_ENCODING']) && substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'deflate') && hasCompression() && !$is_developer) {
            $deflate_support = true;
        }

        // Internationalization
        if($type == 'javascripts') {
            if(isset($_GET['l']) && !empty($_GET['l']) && !preg_match('/\.\.\//', $_GET['l']) && is_dir(JAPPIX_BASE.'/i18n/'.$_GET['l'])) {
                $locale = $_GET['l'];
            } else {
                $locale = 'en';
            }
        } else {
            $locale = '';
        }

        // Define the cache lang name
        if($locale) {
            $cache_lang = $cache_hash.'_'.$locale;
        } else {
            $cache_lang = $cache_hash;
        }
    }

    // Explode the file string
    if(strpos($file, '~') !== false) {
        $array = explode('~', $file);
    } else {
        $array = array($file);
    }

    // Define the reading vars
    $continue = true;
    $loop_files = true;

    // Check the cache exists for text files (avoid the heavy file_exists loop!)
    if(!$is_developer && (($type == 'stylesheets') || ($type == 'javascripts')) && hasCache($cache_lang)) {
        $loop_files = false;
    }

    // Check if the all the file(s) exist(s)
    if($loop_files) {
        foreach($array as $current) {
            // Stop the loop if a file is missing
            if(!file_exists($dir.$current)) {
                $continue = false;
                break;
            }
        }
    }

    // We can read the file(s)
    if($continue) {
        // We get the file MIME type
        $mime = strtolower(preg_replace('/(^)(.+)(\.)(.+)($)/i', '$4', $file));

        // We set up a known MIME type (and some other headers)
        if(($type == 'stylesheets') || ($type == 'javascripts')) {
            // DEFLATE header
            if($deflate_support) {
                header('Content-Encoding: deflate');
            }

            // MIME header
            if($type == 'stylesheets') {
                header('Content-Type: text/css; charset=utf-8');
            } else if($type == 'javascripts') {
                header('Content-Type: application/javascript; charset=utf-8');
            }
        } else {
            switch($mime) {
                case 'png':
                    header('Content-Type: image/png'); break;
                case 'gif':
                    header('Content-Type: image/gif'); break;
                case 'jpg':
                    header('Content-Type: image/jpeg'); break;
                case 'bmp':
                    header('Content-Type: image/bmp'); break;
                case 'oga':
                case 'ogg':
                    header('Content-Type: audio/ogg'); break;
                case 'mp3':
                    header('Content-Type: audio/mpeg'); break;
                case 'woff':
                    header('Content-Type: application/font-woff'); break;
                case 'ttf':
                    header('Content-Type: application/x-font-ttf'); break;
                case 'eot':
                    header('Content-Type: application/vnd.ms-fontobject'); break;
                case 'svg':
                    header('Content-Type: image/svg+xml'); break;
                default:
                    header('Content-Type: '.getFileMIME($path));
            }
        }

        // Read the text file(s) (CSS & JS)
        if(($type == 'stylesheets') || ($type == 'javascripts')) {
            // Storage vars
            $last_modified = $output_data = null;

            // If there's a cache file, read it
            if(hasCache($cache_lang) && !$is_developer) {
                $last_modified = filemtime(pathCache($cache_lang));
                $cache_read = readCache($cache_lang);

                if($deflate_support || !$has_compression) {
                    $output_data = $cache_read;
                } else {
                    $output_data = gzinflate($cache_read);
                }
            }

            // Else, we generate the cache
            else {
                // First try to read the cache reference
                if(hasCache($cache_hash) && !$is_developer) {
                    // Read the reference
                    $last_modified = filemtime(pathCache($cache_hash));
                    $cache_reference = readCache($cache_hash);

                    // Filter the cache reference
                    if($has_compression) {
                        $output = gzinflate($cache_reference);
                    } else {
                        $output = $cache_reference;
                    }
                }

                // No cache reference, we should generate it
                else {
                    // Last modified date is now
                    $last_modified = time();

                    // Initialize the loop
                    $looped = '';

                    // Add the content of the current file
                    foreach($array as $current) {
                        $looped .= rmBOM(file_get_contents($dir.$current))."\n";
                    }

                    // Filter the CSS
                    if($type == 'stylesheets') {
                        // Apply the CSS logos
                        $looped = setLogos($looped, $array);

                        // Apply the CSS background
                        $looped = setBackground($looped);

                        // Set the Get API paths
                        $looped = setPath($looped, $hash, HOST_STATIC, $type, '');
                    }

                    // Optimize the code rendering
                    if($type == 'stylesheets') {
                        // Can minify the CSS
                        if($has_compression && !$is_developer) {
                            $output = compressCSS($looped);
                        } else {
                            $output = $looped;
                        }
                    } else {
                        // Can minify the JS (sloooooow!)
                        if($has_compression && !$is_developer) {
                            require_once('./jsmin.php');
                            $output = JSMin::minify($looped);
                        } else {
                            $output = $looped;
                        }
                    }

                    // Generate the reference cache
                    if($has_compression) {
                        $final = gzdeflate($output, 9);
                    } else {
                        $final = $output;
                    }

                    // Write it!
                    genCache($final, $is_developer, $cache_hash);
                }

                // Filter the JS
                if($type == 'javascripts') {
                    // Set the JS locales
                    $output = setLocales($output, $locale);

                    // Set the JS configuration
                    $output = setConfiguration($output, $hash, $locale, $version, uploadMaxSize());

                    // Set the Get API paths
                    $output = setPath($output, $hash, HOST_STATIC, $type, $locale);

                    // Translate the JS script
                    require_once('./gettext.php');
                    includeTranslation($locale, 'main');
                    $output = setTranslation($output);

                    // Generate the cache
                    if($has_compression) {
                        $final = gzdeflate($output, 9);
                    } else {
                        $final = $output;
                    }

                    // Write it!
                    genCache($final, $is_developer, $cache_lang);
                }

                // Output a well-encoded string
                if($deflate_support || !$has_compression) {
                    $output_data = $final;
                } else {
                    $output_data = gzinflate($final);
                }
            }

            // Any data to output?
            if($output_data) {
                // Last-Modified HTTP header
                if(!$is_developer && hasCaching()) {
                    header('Last-Modified: '.gmdate('D, d M Y H:i:s', $last_modified).' GMT');
                }

                // Check browser cache
                if(!$is_developer && hasCaching() &&
                    ($if_modified_since && ($last_modified <= $if_modified_since))) {
                    // Use browser cache
                    header('Status: 304 Not Modified', true, 304);
                    exit;
                } else {
                    // More file HTTP headers
                    header('Content-Length: '.strlen($output_data));

                    // Output data
                    echo($output_data);
                }
            }

            // Free up memory (prevents leaks)
            unset($output_data);
        }

        // Read the binary file (PNG, OGA and others)
        else {
            // Process re-usable HTTP headers values
            $last_modified = filemtime($path);

            // Last-Modified HTTP header
            if(!$is_developer && hasCaching()) {
                header('Last-Modified: '.gmdate('D, d M Y H:i:s', $last_modified).' GMT');
            }

            // Check browser cache
            if(!$is_developer && hasCaching() &&
                ($if_modified_since && ($last_modified <= $if_modified_since))) {
                // Use browser cache
                header('Status: 304 Not Modified', true, 304);
                exit;
            } else {
                // More file HTTP headers
                header('Content-Length: '.filesize($path));

                // Simple binary read (no packing needed)
                readfile($path);
            }
        }

        exit;
    }

    // The file was not found
    header('Status: 404 Not Found', true, 404);
    exit('HTTP/1.1 404 Not Found');
}

// The request is not correct
header('Status: 400 Bad Request', true, 400);
exit('HTTP/1.1 400 Bad Request');

?>
