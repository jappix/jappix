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
  var _paq = _paq || [];
  // tracker methods like "setCustomDimension" should be called before "trackPageView"
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="<?php echo ANALYTICS_URL; ?>";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', '<?php echo ANALYTICS_ID; ?>']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
    <!-- END ANALYTICS -->
<?php } ?>
