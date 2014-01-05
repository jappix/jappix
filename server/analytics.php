<?php

/*

Jappix - An open social platform
This is the Jappix analytics tracking code

-------------------------------------------------

License: AGPL
Author: Valérian Saliou

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

if((ANALYTICS_TRACK == 'on') && ANALYTICS_URL && ANALYTICS_ID && is_numeric(ANALYTICS_ID)) { ?>
    <!-- BEGIN ANALYTICS -->
    <script type="text/javascript">
        document.write(unescape("%3Cscript src='<?php echo ANALYTICS_URL; ?>piwik.js' type='text/javascript'%3E%3C/script%3E"));
    </script>

    <script type="text/javascript">
        try {
            Piwik.getTracker("<?php echo ANALYTICS_URL; ?>piwik.php", <?php echo ANALYTICS_ID; ?>).trackPageView();
        } catch(err) {}
    </script>
    <!-- END ANALYTICS -->
<?php } ?>
