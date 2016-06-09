<?php

/*

Jappix - An open social platform
This is the Jappix Desktop PHP/HTML code

-------------------------------------------------

License: AGPL
Author: Valérian Saliou, Maranda

*/

// Someone is trying to hack us?
if(!defined('JAPPIX_BASE')) {
    exit;
}

?>
<!DOCTYPE html>
<?php htmlTag($locale); ?>

<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />

    <?php
        // Enable compatibility mode for IE 10
        if (isset($_SERVER['HTTP_USER_AGENT']) && preg_match("/MSIE 10\.0/", $_SERVER['HTTP_USER_AGENT'])) {
            echo '<meta http-equiv="X-UA-Compatible" content="IE=9" />';
            echo "\n\t";
        }
    ?>

    <title><?php echo htmlspecialchars(SERVICE_NAME); ?> &bull; <?php echo htmlspecialchars(SERVICE_DESC); ?></title>
    <link rel="shortcut icon" href="./favicon.ico" />

    <?php echoGetFiles($hash, '', 'css', 'desktop.xml', ''); echo "\n"; ?>
    <!--[if lt IE 9]><?php echoGetFiles($hash, '', 'css', '', 'ie.css'); ?><![endif]-->

    <?php echoGetFiles($hash, $locale, 'js', 'desktop.xml', ''); echo "\n";

    if(anonymousMode()) {
        echo "\n\t";
        echoGetFiles($hash, '', 'css', 'anonymous.xml', '');
        echo "\n\t";
        echoGetFiles($hash, $locale, 'js', 'anonymous.xml', '');
        echo "\n";
    }

    if(httpAuthEnabled()) {
        echo "\n\t";
        echoGetFiles($hash, '', 'js', 'httpauth.xml', '');
        echo "\n\t";
        httpAuthentication();
        echo "\n";
    } ?>
</head>

<body class="body-images">

<?php

// Homepage?
if(!anonymousMode() && !httpAuthEnabled()) { ?>
    <!-- BEGIN HOMEPAGE -->
    <div id="home">
        <div class="home-images plane"></div>

        <div class="main">
            <div class="mainview">
                <div class="left">
                    <div class="home-images logo"></div>
                    <p class="upper"><?php _e("Communicate with the entire world!"); ?></p>
                    <p class="secondary"><?php _e("Jappix is an open social platform, that let's you easily get or keep in touch with everyone."); ?></p>
                    <p class="secondary"><?php _e("Join the millions of users who are currently using the XMPP Network (Google Talk, etc), don't stay out!"); ?></p>
                </div>

                <div class="right">
                    <h1 class="top default"><?php _e("Hi there!"); ?></h1>

                    <div class="default homediv">
                        <p><?php printf(T_("Welcome to %1s, “%2s”."), htmlspecialchars(SERVICE_NAME), htmlspecialchars(SERVICE_DESC)); ?></p>

                        <p><?php _e("Login to your existing XMPP account or create a new one for free!"); ?></p>

                        <button class="login buttons-images">
                            <span class="home-images"></span>
                            <span class="text"><?php _e("Login"); ?></span>
                        </button>

                        <button class="register buttons-images">
                            <span class="home-images"></span>
                            <span class="text"><?php _e("Register"); ?></span>
                        </button>

                        <p class="notice"><?php _e("For your account safety, when you login or register, make sure your password remains secret."); ?></p>
                    </div>

                    <div class="navigation">
                        <?php

                            // Keep get var
                            $keep_get = keepGet('m', false);

                        ?>
                        <a class="home-images mobile" href="./?m=mobile<?php echo $keep_get; ?>"><span class="vert_center"><?php _e("Mobile"); ?></span></a>
                        <?php if(showManagerLink()) { ?>
                        <a class="home-images manager" href="./?m=manager<?php echo $keep_get; ?>"><span class="vert_center"><?php _e("Manager"); ?></span></a>
                        <?php } if(sslCheck() && !httpsForce()) echo sslLink(); ?>
                    </div>
                </div>
            </div>

            <?php if((ADS_ENABLE == 'on') && ADS_STANDARD) { ?>
                <?php require_once('./server/functions-advertising.php'); ?>
                <?php $advertise_link = 'http://www.backlinks.com/?aff=58769'; ?>

                <div class="friendsview">
                    <div class="friends">
                        <div class="group content">
                            <a href="https://www.digitalocean.com/?refcode=b1009ddd4c62" target="_blank">
                                <img src="<?php echo getFiles($hash, '', 'images', '', 'banners/digitalocean.png'); ?>" alt="" />
                            </a>
                        </div>

                        <div class="group standard">
                            <div class="separator">
                                <span class="sep_top"></span>
                                <span class="sep_bottom"></span>
                            </div>

                            <?php displayAdverts($advertise_link); ?>
                        </div>

                        <a class="group refer" href="<?php echo $advertise_link; ?>" target="_blank">
                            <div class="separator">
                                <span class="sep_top"></span>
                                <span class="sep_bottom"></span>
                            </div>

                            <span class="home-images icon"></span>
                            <span class="label"><?php _e("Advertise here"); ?></span>
                        </a>
                    </div>
                </div>
            <?php } ?>
        </div>

        <div class="home-images corporation">
            <div class="corp_network">
                <h2 class="nomargin">Jappix.com</h2>
                <div class="tabulate">
                    <a href="https://jappix.com/">
                        <span class="name">Jappix</span>
                        <span class="desc"><?php _e("Social channel, chat and more."); ?></span>
                    </a>
                    <a href="https://me.jappix.com/">
                        <span class="name">Jappix Me</span>
                        <span class="desc"><?php _e("Create your public profile."); ?></span>
                    </a>
                    <a href="https://mini.jappix.com/">
                        <span class="name">Jappix Mini</span>
                        <span class="desc"><?php _e("A mini-chat for your website."); ?></span>
                    </a>
                    <a href="https://project.jappix.com/">
                        <span class="name">Jappix Project</span>
                        <span class="desc"><?php _e("Get Jappix, get support."); ?></span>
                    </a>
                    <a href="https://stats.jappix.com/">
                        <span class="name">Jappix Stats</span>
                        <span class="desc"><?php _e("Statistics around Jappix."); ?></span>
                    </a>
                    <a href="https://legal.jappix.com/">
                        <span class="name">Jappix Legal</span>
                        <span class="desc"><?php _e("Legal disclaimer for Jappix."); ?></span>
                    </a>
                </div>

                <h2>Jappix.com</h2>
                <div class="tabulate">
                    <a href="https://jappix.com/">
                        <span class="name">Jappix Download</span>
                        <span class="desc"><?php _e("Get Jappix, get support."); ?></span>
                    </a>
                    <a href="https://github.com/jappix/jappix">
                        <span class="name">Jappix (GitHub)</span>
                        <span class="desc"><?php _e("Contribute to the Jappix code."); ?></span>
                    </a>
                </div>
            </div>
        </div>

        <div class="home-images aboutus">
            <div class="aboutus_org">
                <span class="version"><b>Jappix</b> <?php echo htmlspecialchars($version); ?></span>

                <h2><?php _e("Credits"); ?></h2>
                <span class="one">
                    <a class="name" href="https://jappix.com/">Jappix</a>
                    <a class="desc" href="https://jappix.com/"><?php _e("Company"); ?></a>
                </span>

                <?php if(hasLegal()) { ?>
                    <h2><?php _e("Legal"); ?></h2>
                    <span class="one">
                        <a class="name" href="<?php echo htmlspecialchars(LEGAL); ?>"><?php _e("Legal disclaimer"); ?></a>
                        <a class="desc" href="<?php echo htmlspecialchars(LEGAL); ?>"><?php _e("Terms of use and legal"); ?></a>
                    </span>
                <?php } ?>

                <?php if(hasOwner()) { ?>
                    <h2><?php _e("Owner"); ?></h2>
                    <span class="one">
                        <a class="name" href="<?php echo htmlspecialchars(OWNER_WEBSITE); ?>"><?php echo htmlspecialchars(OWNER_NAME); ?></a>
                        <a class="desc" href="<?php echo htmlspecialchars(OWNER_WEBSITE); ?>"><?php _e("Node owner"); ?></a>
                    </span>
                <?php } ?>
            </div>
        </div>

        <?php if(!LANGUAGE || LANGUAGE == 'all') { ?>
            <div class="locale" data-keepget="<?php echo(keepGet('l', false)); ?>">
                <div class="current">
                    <div class="current_align"><?php echo(getLanguageName($locale)); ?></div>
                </div>
            </div>
        <?php } ?>

        <?php

            // Add the notice
            $conf_notice = readNotice();
            $type_notice = $conf_notice['type'];
            $text_notice = $conf_notice['notice'];

            // Simple notice
            if(($type_notice == 'simple') || ($type_notice == 'advanced')) {
                // We must encode special HTML characters
                if($type_notice == 'simple')
                    $text_notice = '<span class="title home-images">'.T_("Notice").'</span><span class="text">'.htmlentities($text_notice).'</span>';

                // Echo the notice
                echo('<div class="notice '.$type_notice.'">'.$text_notice.'</div>');
            }

        ?>
    </div>
    <!-- END HOMEPAGE -->
<?php } ?>

<!-- BEGIN BOARD -->
<div id="board">
    <noscript class="one-board info visible"><?php _e("JavaScript is missing in your web browser, so that you will not be able to launch Jappix! Please fix this."); ?></noscript>
</div>
<!-- END BOARD -->

<?php include(JAPPIX_BASE.'/server/analytics.php'); ?>

</body>

</html>

<!-- Jappix <?php echo $version; ?> - An open social platform -->
